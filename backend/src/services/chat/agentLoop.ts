import { createHash } from 'crypto';
import OpenAI from 'openai';
import { config } from '../../config';
import { ScopeUser } from '../accessScopeService';
import { createScopedRepo } from './scopedRepo';
import { getTool, toolNames, toOpenAiTools } from './registry';
import { createThinkFilter } from './sanitize';

export const MAX_ITERATIONS = 6;
export const MAX_TOOL_CALLS_TOTAL = 12;
export const TOOL_TIMEOUT_MS = 10_000;
export const TOOL_RESULT_MAX_CHARS = 8_000;

export type AgentEvent =
  | { type: 'status'; label: string }
  | { type: 'tool_call'; id: string; name: string }
  | { type: 'tool_result'; id: string; name: string; ok: boolean; summary: string; duration_ms: number }
  | { type: 'token'; text: string }
  | { type: 'done'; model: string; usage: { prompt_tokens: number; completion_tokens: number } }
  | { type: 'error'; code: string; message: string };

export interface ToolTraceEntry {
  id: string;
  name: string;
  args: unknown;
  ok: boolean;
  duration_ms: number;
}

export interface AgentResult {
  finalText: string;
  toolTrace: ToolTraceEntry[];
  usage: { prompt_tokens: number; completion_tokens: number };
  model: string;
}

type Msg = OpenAI.Chat.ChatCompletionMessageParam;

let client: OpenAI | null = null;

export function getChatClient(): OpenAI | null {
  if (!config.ai.enabled || !config.ai.openRouterKey) return null;
  if (!client) {
    client = new OpenAI({
      baseURL: 'https://openrouter.ai/api/v1',
      apiKey: config.ai.openRouterKey,
      defaultHeaders: {
        'HTTP-Referer': config.baseUrl,
        'X-Title': 'PLN Field QA Management System',
      },
    });
  }
  return client;
}

/** Test seam — lets the loop run against a scripted client. */
export function __setChatClientForTests(c: OpenAI | null): void {
  client = c;
}

/**
 * Providers stream a tool call's `function.arguments` as fragments spread over
 * many deltas, keyed by index rather than id. Parsing per delta yields
 * malformed JSON; accumulate and parse once the turn finishes.
 */
interface PartialCall {
  id: string;
  name: string;
  args: string;
}

function stableKey(name: string, args: unknown): string {
  const canonical = JSON.stringify(args, Object.keys((args ?? {}) as object).sort());
  return createHash('sha1').update(`${name}:${canonical}`).digest('hex');
}

function summarise(result: unknown): string {
  if (result && typeof result === 'object') {
    const r = result as Record<string, unknown>;
    if (typeof r.error === 'string') return r.error;
    if (Array.isArray(r.projects)) return `${r.projects.length} project(s)`;
    if (Array.isArray(r.documents)) return `${r.documents.length} document(s)`;
    if (typeof r.name === 'string') return r.name;
    if (typeof r.doc_number === 'string') return r.doc_number;
  }
  return 'ok';
}

function truncate(json: string): string {
  if (json.length <= TOOL_RESULT_MAX_CHARS) return json;
  return `${json.slice(0, TOOL_RESULT_MAX_CHARS)}\n…[truncated — narrow your filters or lower the limit]`;
}

async function runTool(
  name: string,
  rawArgs: string,
  ctx: { repo: ReturnType<typeof createScopedRepo>; user: ScopeUser; signal: AbortSignal },
): Promise<{ payload: unknown; ok: boolean; parsedArgs: unknown }> {
  const tool = getTool(name);
  if (!tool) {
    return {
      ok: false,
      parsedArgs: undefined,
      payload: { error: 'UNKNOWN_TOOL', available: toolNames() },
    };
  }

  let parsed: unknown;
  try {
    parsed = rawArgs.trim() ? JSON.parse(rawArgs) : {};
  } catch {
    return {
      ok: false,
      parsedArgs: undefined,
      payload: { error: 'INVALID_ARGUMENTS', message: 'Arguments were not valid JSON.' },
    };
  }

  const validated = tool.args.safeParse(parsed);
  if (!validated.success) {
    return {
      ok: false,
      parsedArgs: parsed,
      payload: {
        error: 'INVALID_ARGUMENTS',
        issues: validated.error.issues.map((i) => `${i.path.join('.') || '(root)'}: ${i.message}`),
      },
    };
  }

  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error('TOOL_TIMEOUT')), TOOL_TIMEOUT_MS).unref?.(),
  );

  try {
    const payload = await Promise.race([tool.handler(validated.data as never, ctx), timeout]);
    return { ok: true, parsedArgs: validated.data, payload };
  } catch (err) {
    const timedOut = err instanceof Error && err.message === 'TOOL_TIMEOUT';
    // Prisma and AppError messages can carry schema detail; never hand them to
    // the model.
    console.error(`[chat] tool ${name} failed:`, err);
    return {
      ok: false,
      parsedArgs: validated.data,
      payload: { error: timedOut ? 'TIMEOUT' : 'TOOL_FAILED' },
    };
  }
}

export async function* runAgent(opts: {
  systemPrompt: string;
  history: Msg[];
  user: ScopeUser;
  signal: AbortSignal;
}): AsyncGenerator<AgentEvent, AgentResult> {
  const ai = getChatClient();
  const model = config.ai.chatModel;
  const usage = { prompt_tokens: 0, completion_tokens: 0 };
  const toolTrace: ToolTraceEntry[] = [];
  let finalText = '';

  if (!ai) {
    yield { type: 'error', code: 'NOT_CONFIGURED', message: 'The assistant is not configured.' };
    return { finalText, toolTrace, usage, model };
  }

  const messages: Msg[] = [{ role: 'system', content: opts.systemPrompt }, ...opts.history];
  const seenCalls = new Map<string, string>();
  let totalToolCalls = 0;

  for (let iteration = 0; iteration < MAX_ITERATIONS; iteration++) {
    if (opts.signal.aborted) return { finalText, toolTrace, usage, model };

    const lastPass = iteration === MAX_ITERATIONS - 1;
    const think = createThinkFilter();
    const partials = new Map<number, PartialCall>();
    let finishReason: string | null = null;
    let text = '';

    let stream;
    try {
      stream = await ai.chat.completions.create(
        {
          model,
          max_tokens: config.ai.maxTokens,
          stream: true,
          stream_options: { include_usage: true },
          messages,
          // On the final pass force prose, so a model still trying to call
          // tools cannot leave the user with silence.
          ...(lastPass ? { tool_choice: 'none' as const } : { tool_choice: 'auto' as const }),
          tools: toOpenAiTools(),
        },
        { signal: opts.signal },
      );
    } catch (err) {
      console.error('[chat] completion request failed:', err);
      yield { type: 'error', code: 'UPSTREAM', message: 'The assistant could not be reached.' };
      return { finalText, toolTrace, usage, model };
    }

    try {
      for await (const chunk of stream) {
        if (chunk.usage) {
          // include_usage delivers totals once, in the final chunk. Assignment
          // rather than += so a gateway that repeats usage on several chunks
          // cannot inflate the stored token counts.
          usage.prompt_tokens = chunk.usage.prompt_tokens ?? usage.prompt_tokens;
          usage.completion_tokens = chunk.usage.completion_tokens ?? usage.completion_tokens;
        }

        const choice = chunk.choices?.[0];
        if (!choice) continue;
        if (choice.finish_reason) finishReason = choice.finish_reason;

        const delta = choice.delta as
          | (OpenAI.Chat.ChatCompletionChunk.Choice.Delta & { reasoning?: string })
          | undefined;
        if (!delta) continue;

        // OpenRouter surfaces reasoning models' scratchpad in a non-standard
        // `reasoning` field. Consume and drop it — it is not an answer.
        if (typeof delta.content === 'string' && delta.content.length > 0) {
          const visible = think.push(delta.content);
          if (visible) {
            text += visible;
            yield { type: 'token', text: visible };
          }
        }

        for (const tc of delta.tool_calls ?? []) {
          const slot = partials.get(tc.index) ?? { id: '', name: '', args: '' };
          if (tc.id) slot.id = tc.id;
          if (tc.function?.name) slot.name += tc.function.name;
          if (tc.function?.arguments) slot.args += tc.function.arguments;
          partials.set(tc.index, slot);
        }
      }
    } catch (err) {
      if (opts.signal.aborted) return { finalText, toolTrace, usage, model };
      console.error('[chat] stream failed:', err);
      yield { type: 'error', code: 'STREAM', message: 'The response was interrupted.' };
      return { finalText, toolTrace, usage, model };
    }

    const tail = think.flush();
    if (tail) {
      text += tail;
      yield { type: 'token', text: tail };
    }
    finalText += text;

    const calls = [...partials.values()].filter((c) => c.id && c.name);

    if (calls.length === 0) {
      if (finishReason === 'length') {
        yield { type: 'error', code: 'TRUNCATED', message: 'The answer was cut short.' };
      }
      yield { type: 'done', model, usage };
      return { finalText, toolTrace, usage, model };
    }

    messages.push({
      role: 'assistant',
      content: text || null,
      tool_calls: calls.map((c) => ({
        id: c.id,
        type: 'function',
        function: { name: c.name, arguments: c.args || '{}' },
      })),
    } as Msg);

    const repo = createScopedRepo(opts.user);

    // Every tool_call id must receive a matching `tool` message. Providers
    // reject the next request outright if one is missing, so failures and
    // budget refusals still emit a reply.
    for (const call of calls) {
      const started = Date.now();
      let payload: unknown;
      let ok = false;
      let parsedArgs: unknown;

      if (totalToolCalls >= MAX_TOOL_CALLS_TOTAL) {
        payload = {
          error: 'TOOL_BUDGET_EXHAUSTED',
          hint: 'No more tool calls are available this turn. Answer with what you already have.',
        };
      } else {
        totalToolCalls += 1;
        yield { type: 'tool_call', id: call.id, name: call.name };

        const tool = getTool(call.name);
        let key: string | null = null;
        try {
          key = stableKey(call.name, JSON.parse(call.args || '{}'));
        } catch {
          key = null;
        }

        if (key && seenCalls.has(key)) {
          payload = {
            error: 'DUPLICATE_CALL',
            hint: 'You already called this tool with identical arguments this turn. Use that result and answer the user.',
          };
        } else {
          if (tool) {
            const argsForLabel = (() => {
              try {
                return JSON.parse(call.args || '{}');
              } catch {
                return {};
              }
            })();
            yield { type: 'status', label: tool.label(argsForLabel as never) };
          }
          const run = await runTool(call.name, call.args, { repo, user: opts.user, signal: opts.signal });
          payload = run.payload;
          ok = run.ok;
          parsedArgs = run.parsedArgs;
          if (key) seenCalls.set(key, call.id);
        }
      }

      const duration = Date.now() - started;
      const summary = summarise(payload);
      toolTrace.push({ id: call.id, name: call.name, args: parsedArgs, ok, duration_ms: duration });
      yield { type: 'tool_result', id: call.id, name: call.name, ok, summary, duration_ms: duration };

      messages.push({
        role: 'tool',
        tool_call_id: call.id,
        content: truncate(JSON.stringify(payload)),
      } as Msg);
    }
  }

  yield { type: 'done', model, usage };
  return { finalText, toolTrace, usage, model };
}
