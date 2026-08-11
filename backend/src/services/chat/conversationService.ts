import OpenAI from 'openai';
import { ChatRole, Prisma } from '@prisma/client';
import { prisma } from '../../config/database';
import { AppError } from '../../utils/AppError';
import { ScopeUser, scopeFingerprint } from '../accessScopeService';
import type { ToolTraceEntry } from './agentLoop';

/** Beyond this a conversation is closed and the user starts a fresh one. */
export const MAX_MESSAGES_PER_CONVERSATION = 200;
/** Oldest conversations are pruned once a user exceeds this. */
export const MAX_CONVERSATIONS_PER_USER = 50;
/** Turns replayed into the model. Older turns stay in the DB for the user. */
export const HISTORY_TURNS = 12;

const RETENTION_DAYS = 90;

export async function createConversation(user: ScopeUser, projectId?: string) {
  const conversation = await prisma.chatConversation.create({
    data: {
      user_id: user.id,
      project_id: projectId ?? null,
      scope_fingerprint: scopeFingerprint(user),
    },
    select: { id: true, title: true, created_at: true, updated_at: true },
  });

  const stale = await prisma.chatConversation.findMany({
    where: { user_id: user.id },
    orderBy: { updated_at: 'desc' },
    skip: MAX_CONVERSATIONS_PER_USER,
    select: { id: true },
  });
  if (stale.length > 0) {
    // user_id is redundant given how `stale` was selected, but stating it here
    // keeps the delete self-evidently scoped rather than scoped by inference.
    await prisma.chatConversation.deleteMany({
      where: { user_id: user.id, id: { in: stale.map((c) => c.id) } },
    });
  }

  return conversation;
}

export async function listConversations(user: ScopeUser) {
  return prisma.chatConversation.findMany({
    where: { user_id: user.id },
    orderBy: { updated_at: 'desc' },
    take: MAX_CONVERSATIONS_PER_USER,
    select: { id: true, title: true, project_id: true, created_at: true, updated_at: true },
  });
}

export async function deleteConversation(user: ScopeUser, id: string) {
  const { count } = await prisma.chatConversation.deleteMany({
    where: { id, user_id: user.id },
  });
  if (count === 0) throw new AppError('Conversation not found', 404);
}

/**
 * Loads a conversation the user owns. Scoped by user_id in the same query as
 * the id, so one user can never address another's conversation.
 *
 * A scope_fingerprint mismatch means the user's role or institution changed
 * since the conversation started; its stored tool results may describe data
 * they can no longer see, so the conversation is retired rather than resumed.
 */
export async function loadOwnedConversation(user: ScopeUser, id: string) {
  const conversation = await prisma.chatConversation.findFirst({
    where: { id, user_id: user.id },
    select: { id: true, title: true, scope_fingerprint: true, _count: { select: { messages: true } } },
  });
  if (!conversation) throw new AppError('Conversation not found', 404);

  if (conversation.scope_fingerprint !== scopeFingerprint(user)) {
    throw new AppError('SCOPE_CHANGED', 409);
  }
  if (conversation._count.messages >= MAX_MESSAGES_PER_CONVERSATION) {
    throw new AppError('CONVERSATION_FULL', 409);
  }
  return conversation;
}

export async function getMessages(user: ScopeUser, id: string, includeTools = false) {
  await prisma.chatConversation
    .findFirstOrThrow({ where: { id, user_id: user.id }, select: { id: true } })
    .catch(() => {
      throw new AppError('Conversation not found', 404);
    });

  return prisma.chatMessage.findMany({
    where: {
      conversation_id: id,
      ...(includeTools ? {} : { role: { in: [ChatRole.USER, ChatRole.ASSISTANT] } }),
    },
    orderBy: { seq_no: 'asc' },
    select: {
      id: true,
      seq_no: true,
      role: true,
      content: true,
      tool_name: true,
      model_used: true,
      error: true,
      created_at: true,
    },
  });
}

/**
 * Rebuilds provider-shaped history from stored rows.
 *
 * Assistant rows that carry tool_calls must be followed by their tool replies,
 * so the window is trimmed to a turn boundary — a dangling tool_calls message
 * without its results is rejected outright by most providers.
 */
export async function buildHistory(
  conversationId: string,
): Promise<OpenAI.Chat.ChatCompletionMessageParam[]> {
  const rows = await prisma.chatMessage.findMany({
    where: { conversation_id: conversationId },
    orderBy: { seq_no: 'asc' },
    select: { role: true, content: true, tool_calls: true, tool_call_id: true },
  });

  const userTurnIndexes = rows
    .map((r, i) => (r.role === ChatRole.USER ? i : -1))
    .filter((i) => i >= 0);
  const start =
    userTurnIndexes.length > HISTORY_TURNS
      ? userTurnIndexes[userTurnIndexes.length - HISTORY_TURNS]
      : 0;

  const out: OpenAI.Chat.ChatCompletionMessageParam[] = [];
  for (const row of rows.slice(start)) {
    if (row.role === ChatRole.USER) {
      out.push({ role: 'user', content: row.content ?? '' });
    } else if (row.role === ChatRole.ASSISTANT) {
      if (row.tool_calls) {
        out.push({
          role: 'assistant',
          content: row.content,
          tool_calls: row.tool_calls as never,
        } as OpenAI.Chat.ChatCompletionMessageParam);
      } else if (row.content) {
        out.push({ role: 'assistant', content: row.content });
      }
    } else if (row.tool_call_id) {
      out.push({ role: 'tool', tool_call_id: row.tool_call_id, content: row.content ?? '{}' });
    }
  }
  return out;
}

async function nextSeq(conversationId: string): Promise<number> {
  const last = await prisma.chatMessage.findFirst({
    where: { conversation_id: conversationId },
    orderBy: { seq_no: 'desc' },
    select: { seq_no: true },
  });
  return (last?.seq_no ?? 0) + 1;
}

/**
 * seq_no is assigned by read-then-insert, so two concurrent streams into the
 * same conversation (two browser tabs) can collide on the
 * @@unique([conversation_id, seq_no]) constraint. P2002 is that collision;
 * re-reading the sequence and retrying once resolves it without serializing
 * every append.
 */
function isSeqCollision(err: unknown): boolean {
  return typeof err === 'object' && err !== null && (err as { code?: string }).code === 'P2002';
}

export async function appendUserMessage(conversationId: string, content: string) {
  let lastErr: unknown;
  for (let attempt = 0; attempt < 2; attempt++) {
    const seq = await nextSeq(conversationId);
    try {
      const message = await prisma.chatMessage.create({
        data: { conversation_id: conversationId, seq_no: seq, role: ChatRole.USER, content },
        select: { id: true, seq_no: true },
      });

      // First user message names the conversation.
      await prisma.chatConversation.updateMany({
        where: { id: conversationId, title: null },
        data: { title: content.slice(0, 80) },
      });

      return message;
    } catch (err) {
      if (attempt === 0 && isSeqCollision(err)) {
        lastErr = err;
        continue;
      }
      throw err;
    }
  }
  // Both attempts collided; the constraint is genuinely contended.
  throw lastErr;
}

/**
 * Persists the assistant turn and its tool trace in one transaction, called
 * from the stream's finally block so an aborted request still records what
 * happened.
 */
export async function appendAssistantTurn(args: {
  conversationId: string;
  text: string;
  toolTrace: ToolTraceEntry[];
  model: string;
  usage: { prompt_tokens: number; completion_tokens: number };
  latencyMs: number;
  error?: string;
}) {
  for (let attempt = 0; attempt < 2; attempt++) {
    let seq = await nextSeq(args.conversationId);

    const rows: Prisma.ChatMessageCreateManyInput[] = args.toolTrace.map((t) => ({
      conversation_id: args.conversationId,
      seq_no: seq++,
      role: ChatRole.TOOL,
      content: JSON.stringify({ ok: t.ok, args: t.args }),
      tool_call_id: t.id,
      tool_name: t.name,
      latency_ms: t.duration_ms,
    }));

    rows.push({
      conversation_id: args.conversationId,
      seq_no: seq,
      role: ChatRole.ASSISTANT,
      content: args.text || null,
      model_used: args.model,
      prompt_tokens: args.usage.prompt_tokens,
      completion_tokens: args.usage.completion_tokens,
      latency_ms: args.latencyMs,
      error: args.error ?? null,
    });

    try {
      await prisma.$transaction([
        prisma.chatMessage.createMany({ data: rows }),
        prisma.chatConversation.update({
          where: { id: args.conversationId },
          data: { updated_at: new Date() },
        }),
      ]);
      return;
    } catch (err) {
      if (attempt === 0 && isSeqCollision(err)) continue;
      throw err;
    }
  }
}

/** Drops conversations untouched for RETENTION_DAYS. Messages cascade. */
export async function pruneOldConversations(): Promise<number> {
  const cutoff = new Date(Date.now() - RETENTION_DAYS * 86_400_000);
  const { count } = await prisma.chatConversation.deleteMany({
    where: { updated_at: { lt: cutoff } },
  });
  return count;
}
