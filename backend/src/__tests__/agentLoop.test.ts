import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { InstitutionType, Role } from '@prisma/client';

vi.mock('../config', () => ({
  config: {
    baseUrl: 'http://localhost:3000',
    ai: { enabled: true, openRouterKey: 'test-key', chatModel: 'test/model', maxTokens: 1024 },
  },
}));

const listProjects = vi.fn(async () => ({ total: 1, truncated: false, projects: [{ id: 'p1' }] }));

vi.mock('../services/chat/scopedRepo', () => ({
  createScopedRepo: () => ({ listProjects }),
}));

import { runAgent, __setChatClientForTests, AgentEvent } from '../services/chat/agentLoop';

type Chunk = Record<string, unknown>;

/** Builds one streamed turn from a list of deltas. */
function turn(deltas: Chunk[], finishReason: string): Chunk[] {
  return [
    ...deltas.map((d) => ({ choices: [{ delta: d, finish_reason: null }] })),
    { choices: [{ delta: {}, finish_reason: finishReason }] },
  ];
}

function scriptedClient(turns: Chunk[][]) {
  const calls: Record<string, unknown>[] = [];
  let index = 0;
  return {
    calls,
    chat: {
      completions: {
        create: async (params: Record<string, unknown>) => {
          calls.push(params);
          const chunks = turns[Math.min(index++, turns.length - 1)];
          return {
            async *[Symbol.asyncIterator]() {
              for (const c of chunks) yield c;
            },
          };
        },
      },
    },
  };
}

const user = {
  id: 'u1',
  role: Role.REVIEWER,
  institution_id: 'inst-1',
  institution_type: InstitutionType.CONSULTANT,
  unit_id: 'unit-1',
};

async function collect(client: ReturnType<typeof scriptedClient>) {
  __setChatClientForTests(client as never);
  const events: AgentEvent[] = [];
  const gen = runAgent({
    systemPrompt: 'sys',
    history: [{ role: 'user', content: 'hi' }],
    user,
    signal: new AbortController().signal,
  });
  let step = await gen.next();
  while (!step.done) {
    events.push(step.value);
    step = await gen.next();
  }
  return { events, result: step.value };
}

beforeEach(() => {
  listProjects.mockClear();
});

afterEach(() => {
  __setChatClientForTests(null);
});

describe('runAgent', () => {
  it('streams plain text when the model calls no tools', async () => {
    const client = scriptedClient([turn([{ content: 'Hello ' }, { content: 'there' }], 'stop')]);
    const { events, result } = await collect(client);

    expect(events.filter((e) => e.type === 'token').map((e) => (e as never)['text'])).toEqual([
      'Hello ',
      'there',
    ]);
    expect(result.finalText).toBe('Hello there');
    expect(events.at(-1)?.type).toBe('done');
  });

  // Providers split function.arguments across many deltas. Parsing per delta
  // yields malformed JSON, so this is the loop's most likely bug.
  it('reassembles tool arguments split across deltas', async () => {
    const client = scriptedClient([
      turn(
        [
          { tool_calls: [{ index: 0, id: 'c1', function: { name: 'list_my_projects' } }] },
          { tool_calls: [{ index: 0, function: { arguments: '{"li' } }] },
          { tool_calls: [{ index: 0, function: { arguments: 'mit":' } }] },
          { tool_calls: [{ index: 0, function: { arguments: '5}' } }] },
        ],
        'tool_calls',
      ),
      turn([{ content: 'Found one.' }], 'stop'),
    ]);

    const { result } = await collect(client);

    expect(listProjects).toHaveBeenCalledWith({ limit: 5 });
    expect(result.toolTrace[0]).toMatchObject({ name: 'list_my_projects', ok: true });
  });

  it('sends a tool reply for every tool_call id', async () => {
    const client = scriptedClient([
      turn(
        [
          {
            tool_calls: [
              { index: 0, id: 'c1', function: { name: 'list_my_projects', arguments: '{}' } },
              { index: 1, id: 'c2', function: { name: 'no_such_tool', arguments: '{}' } },
            ],
          },
        ],
        'tool_calls',
      ),
      turn([{ content: 'done' }], 'stop'),
    ]);

    await collect(client);

    // A missing tool reply is a hard 400 from the provider on the next call,
    // so the follow-up request must carry one per id — even for the unknown
    // tool.
    const followUp = client.calls[1].messages as Array<{ role: string; tool_call_id?: string }>;
    const replies = followUp.filter((m) => m.role === 'tool').map((m) => m.tool_call_id);
    expect(replies).toEqual(['c1', 'c2']);
  });

  it('reports an unknown tool without throwing', async () => {
    const client = scriptedClient([
      turn(
        [{ tool_calls: [{ index: 0, id: 'c1', function: { name: 'nope', arguments: '{}' } }] }],
        'tool_calls',
      ),
      turn([{ content: 'ok' }], 'stop'),
    ]);

    const { events } = await collect(client);
    const failed = events.find((e) => e.type === 'tool_result') as { ok: boolean; summary: string };
    expect(failed.ok).toBe(false);
    expect(failed.summary).toBe('UNKNOWN_TOOL');
  });

  it('rejects arguments that fail validation', async () => {
    const client = scriptedClient([
      turn(
        [
          {
            tool_calls: [
              { index: 0, id: 'c1', function: { name: 'list_my_projects', arguments: 'not json' } },
            ],
          },
        ],
        'tool_calls',
      ),
      turn([{ content: 'ok' }], 'stop'),
    ]);

    const { events } = await collect(client);
    const failed = events.find((e) => e.type === 'tool_result') as { ok: boolean; summary: string };
    expect(failed.summary).toBe('INVALID_ARGUMENTS');
    expect(listProjects).not.toHaveBeenCalled();
  });

  // Without this a model that keeps re-fetching the same data burns the whole
  // iteration budget and the user gets nothing.
  it('suppresses a repeated identical tool call without re-running it', async () => {
    const call = {
      tool_calls: [{ index: 0, id: 'c1', function: { name: 'list_my_projects', arguments: '{}' } }],
    };
    const client = scriptedClient([
      turn([call], 'tool_calls'),
      turn([{ ...call, tool_calls: [{ ...call.tool_calls[0], id: 'c2' }] }], 'tool_calls'),
      turn([{ content: 'answering' }], 'stop'),
    ]);

    const { events } = await collect(client);

    expect(listProjects).toHaveBeenCalledTimes(1);
    const summaries = events
      .filter((e) => e.type === 'tool_result')
      .map((e) => (e as never)['summary']);
    expect(summaries).toContain('DUPLICATE_CALL');
  });

  it('forces prose on the final iteration instead of looping forever', async () => {
    let n = 0;
    const client = scriptedClient([
      turn(
        [
          {
            tool_calls: [
              {
                index: 0,
                id: 'c',
                function: { name: 'list_my_projects', arguments: `{"limit":${++n}}` },
              },
            ],
          },
        ],
        'tool_calls',
      ),
    ]);
    // Every turn asks for another tool call; the loop must still terminate.
    const { events, result } = await collect(client);

    expect(events.at(-1)?.type).toBe('done');
    const last = client.calls.at(-1) as { tool_choice: string };
    expect(last.tool_choice).toBe('none');
    expect(result.toolTrace.length).toBeLessThanOrEqual(12);
  });

  it('strips reasoning tags that straddle chunk boundaries', async () => {
    const client = scriptedClient([
      turn(
        [{ content: 'A<thi' }, { content: 'nk>hidden' }, { content: '</thi' }, { content: 'nk>B' }],
        'stop',
      ),
    ]);

    const { result } = await collect(client);
    expect(result.finalText).toBe('AB');
  });

  it('surfaces an upstream failure as an error event', async () => {
    __setChatClientForTests({
      chat: { completions: { create: async () => { throw new Error('boom'); } } },
    } as never);

    const events: AgentEvent[] = [];
    const gen = runAgent({
      systemPrompt: 'sys',
      history: [],
      user,
      signal: new AbortController().signal,
    });
    let step = await gen.next();
    while (!step.done) {
      events.push(step.value);
      step = await gen.next();
    }

    expect(events).toEqual([
      { type: 'error', code: 'UPSTREAM', message: 'The assistant could not be reached.' },
    ]);
  });
});
