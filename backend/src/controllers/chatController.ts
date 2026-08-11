import { Request, Response } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/AppError';
import { config } from '../config';
import { ScopeUser } from '../services/accessScopeService';
import { runAgent, ToolTraceEntry } from '../services/chat/agentLoop';
import { buildSystemPrompt } from '../services/chat/systemPrompt';
import {
  appendAssistantTurn,
  appendUserMessage,
  buildHistory,
  createConversation,
  deleteConversation,
  getMessages,
  listConversations,
  loadOwnedConversation,
} from '../services/chat/conversationService';

function scopeUser(req: Request): ScopeUser {
  if (!req.user) throw new AppError('Unauthorized', 401);
  return {
    id: req.user.id,
    role: req.user.role,
    institution_id: req.user.institution_id,
    institution_type: req.user.institution_type,
    unit_id: req.user.unit_id,
  };
}

function requireAiEnabled(): void {
  if (!config.ai.enabled || !config.ai.openRouterKey) {
    throw new AppError('The assistant is not configured on this server.', 503);
  }
}

export const getChatHealth = asyncHandler(async (_req, res) => {
  res.json({
    success: true,
    data: {
      enabled: Boolean(config.ai.enabled && config.ai.openRouterKey),
      model: config.ai.chatModel,
    },
  });
});

export const postConversation = asyncHandler(async (req, res) => {
  const user = scopeUser(req);
  const body = z.object({ project_id: z.string().max(64).optional() }).parse(req.body ?? {});
  const conversation = await createConversation(user, body.project_id);
  res.status(201).json({ success: true, data: conversation });
});

export const getConversations = asyncHandler(async (req, res) => {
  const user = scopeUser(req);
  res.json({ success: true, data: await listConversations(user) });
});

export const getConversationMessages = asyncHandler(async (req, res) => {
  const user = scopeUser(req);
  const includeTools = req.query.include_tools === 'true';
  res.json({ success: true, data: await getMessages(user, req.params.id, includeTools) });
});

export const removeConversation = asyncHandler(async (req, res) => {
  const user = scopeUser(req);
  await deleteConversation(user, req.params.id);
  res.json({ success: true, message: 'Conversation deleted' });
});

const messageSchema = z.object({
  content: z.string().trim().min(1).max(4000),
  page_context: z
    .object({
      route: z.string().max(200).optional(),
      label: z.string().max(120).optional(),
      project_id: z.string().max(64).optional(),
      document_id: z.string().max(64).optional(),
      review_id: z.string().max(64).optional(),
    })
    .optional(),
});

/**
 * Streams one assistant turn as Server-Sent Events.
 *
 * Everything that can fail with a normal HTTP status is validated before the
 * headers go out. Past res.flushHeaders() the response is committed: the shared
 * errorHandler calls res.status().json(), which throws ERR_HTTP_HEADERS_SENT
 * once a stream is open, so failures after that point must travel as an
 * `error` event instead of being rethrown.
 */
export const streamChatMessage = asyncHandler(async (req: Request, res: Response) => {
  const user = scopeUser(req);
  requireAiEnabled();

  const body = messageSchema.parse(req.body ?? {});
  const conversation = await loadOwnedConversation(user, req.params.id);
  const userMessage = await appendUserMessage(conversation.id, body.content);
  const history = await buildHistory(conversation.id);

  res.status(200).set({
    'Content-Type': 'text/event-stream; charset=utf-8',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
    // Tells nginx not to buffer. The proxy config must also set
    // proxy_buffering off, or the whole stream arrives at once.
    'X-Accel-Buffering': 'no',
  });
  res.flushHeaders();

  const send = (event: string, data: unknown) => {
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  };

  const controller = new AbortController();
  req.on('close', () => controller.abort());
  const heartbeat = setInterval(() => res.write(': ping\n\n'), 15_000);
  const startedAt = Date.now();

  send('start', { conversation_id: conversation.id, user_message_id: userMessage.id });

  let text = '';
  let trace: ToolTraceEntry[] = [];
  let model = config.ai.chatModel;
  let usage = { prompt_tokens: 0, completion_tokens: 0 };
  let failure: string | undefined;

  try {
    const iterator = runAgent({
      systemPrompt: buildSystemPrompt(
        { ...user, name: req.user?.email },
        body.page_context,
      ),
      history,
      user,
      signal: controller.signal,
    });

    let step = await iterator.next();
    while (!step.done) {
      const event = step.value;
      if (event.type === 'token') text += event.text;
      if (event.type === 'error') failure = event.code;
      send(event.type, event);
      step = await iterator.next();
    }

    const result = step.value;
    text = result.finalText || text;
    trace = result.toolTrace as never[];
    model = result.model;
    usage = result.usage;
  } catch (err) {
    console.error('[chat] stream aborted with an unexpected error:', err);
    failure = 'INTERNAL';
    send('error', { code: 'INTERNAL', message: 'The assistant failed to respond.' });
  } finally {
    clearInterval(heartbeat);
    try {
      await appendAssistantTurn({
        conversationId: conversation.id,
        text,
        toolTrace: trace,
        model,
        usage,
        latencyMs: Date.now() - startedAt,
        error: failure,
      });
    } catch (err) {
      console.error('[chat] failed to persist assistant turn:', err);
    }
    res.end();
  }
});
