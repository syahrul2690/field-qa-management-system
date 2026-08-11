import { describe, it, expect, vi, afterEach } from 'vitest';
import { ChatSseEvent, parseFrame, streamChatMessage } from '../chatApi';

const { getAccessToken, refreshAccessToken } = vi.hoisted(() => ({
  getAccessToken: vi.fn(() => 'tok-123'),
  refreshAccessToken: vi.fn(),
}));

vi.mock('../tokenRefresh', () => ({ getAccessToken, refreshAccessToken }));

describe('parseFrame', () => {
  it('parses a data payload into its JSON event', () => {
    const frame = 'event: token\ndata: {"type":"token","text":"Hello"}\n\n';
    expect(parseFrame(frame)).toEqual({ type: 'token', text: 'Hello' });
  });

  it('skips heartbeat-only frames', () => {
    expect(parseFrame(': ping\n\n')).toBeNull();
  });

  it('returns null when a frame has no data line', () => {
    expect(parseFrame('event: done\n\n')).toBeNull();
  });

  it('returns null for malformed JSON', () => {
    expect(parseFrame('data: {not json\n\n')).toBeNull();
  });
});

describe('streamChatMessage', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  function streamBody(frames: string[]): ReadableStream<Uint8Array> {
    return new ReadableStream({
      start(controller) {
        const encoder = new TextEncoder();
        // Split the first frame across two chunks to prove the client
        // reassembles frames that straddle network boundaries.
        const first = encoder.encode(frames[0]);
        controller.enqueue(first.slice(0, 9));
        controller.enqueue(first.slice(9));
        for (const frame of frames.slice(1)) controller.enqueue(encoder.encode(frame));
        controller.close();
      },
    });
  }

  it('sends the message as an authenticated POST and emits streamed events', async () => {
    const frames = [
      'event: start\ndata: {"type":"start","conversation_id":"c1","user_message_id":"m1"}\n\n',
      'event: token\ndata: {"type":"token","text":"Hi "}\n\n',
      'event: token\ndata: {"type":"token","text":"there"}\n\n',
      'event: done\ndata: {"type":"done","model":"m","usage":{"prompt_tokens":1,"completion_tokens":2}}\n\n',
    ];
    const fetchMock = vi.fn(async () => new Response(streamBody(frames), { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);

    const events: ChatSseEvent[] = [];
    await streamChatMessage(
      'c1',
      { content: 'hello', page_context: { project_id: 'p1' } },
      (e) => events.push(e),
      new AbortController().signal,
    );

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/chat/conversations/c1/messages',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({ Authorization: 'Bearer tok-123' }),
        body: JSON.stringify({ content: 'hello', page_context: { project_id: 'p1' } }),
      }),
    );
    expect(events.map((e) => e.type)).toEqual(['start', 'token', 'token', 'done']);
    expect(events[1]).toMatchObject({ type: 'token', text: 'Hi ' });
  });

  it('emits an error event with the server message on a non-200 response', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(JSON.stringify({ message: 'SCOPE_CHANGED' }), { status: 409 })),
    );

    const events: ChatSseEvent[] = [];
    await streamChatMessage('c1', { content: 'hello' }, (e) => events.push(e), new AbortController().signal);

    expect(events).toEqual([{ type: 'error', code: 'SCOPE_CHANGED', message: 'SCOPE_CHANGED' }]);
  });
});
