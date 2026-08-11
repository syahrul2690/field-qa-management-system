import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useChatStore } from '../chatStore';
import { ChatSseEvent } from '../../services/chatApi';

const { createConversation, streamChatMessage } = vi.hoisted(() => ({
  createConversation: vi.fn(async () => ({ data: { data: { id: 'conv-1' } } })),
  streamChatMessage: vi.fn(),
}));

vi.mock('../../services/chatApi', () => ({
  chatApi: { createConversation },
  streamChatMessage,
}));

function eventsFor(...events: ChatSseEvent[]) {
  return (async (
    _id: string,
    _body: unknown,
    onEvent: (e: ChatSseEvent) => void,
    _signal: AbortSignal,
  ) => {
    for (const e of events) onEvent(e);
  }) as never;
}

beforeEach(() => {
  vi.clearAllMocks();
  useChatStore.setState({
    isOpen: false,
    conversationId: null,
    messages: [],
    streaming: false,
    status: null,
    error: null,
    abort: null,
  });
});

describe('chatStore.send', () => {
  it('starts a conversation and streams tokens into the assistant bubble', async () => {
    streamChatMessage.mockImplementation(
      eventsFor(
        { type: 'status', label: 'Searching documents' },
        { type: 'tool_call', id: 't1', name: 'search_documents' },
        { type: 'tool_result', id: 't1', name: 'search_documents', ok: true, summary: '2 document(s)', duration_ms: 12 },
        { type: 'token', text: 'Two ' },
        { type: 'token', text: 'documents.' },
        { type: 'done', model: 'm', usage: { prompt_tokens: 1, completion_tokens: 1 } },
      ),
    );

    await useChatStore.getState().send('how many documents?', { project_id: 'p1' });

    expect(createConversation).toHaveBeenCalledWith('p1');
    expect(useChatStore.getState().conversationId).toBe('conv-1');
    expect(useChatStore.getState().streaming).toBe(false);

    const { messages } = useChatStore.getState();
    expect(messages).toHaveLength(2);
    expect(messages[0]).toMatchObject({ role: 'user', content: 'how many documents?' });
    expect(messages[1]).toMatchObject({
      role: 'assistant',
      content: 'Two documents.',
      streaming: false,
      tools: [{ id: 't1', name: 'search_documents', ok: true, summary: '2 document(s)' }],
    });
  });

  it('reuses an existing conversation instead of creating a second one', async () => {
    streamChatMessage.mockImplementation(eventsFor({ type: 'done', model: 'm', usage: { prompt_tokens: 0, completion_tokens: 0 } }));
    useChatStore.setState({ conversationId: 'conv-existing' });

    await useChatStore.getState().send('hello');

    expect(createConversation).not.toHaveBeenCalled();
    expect(useChatStore.getState().conversationId).toBe('conv-existing');
  });

  it('patches the assistant message with an error event', async () => {
    streamChatMessage.mockImplementation(
      eventsFor({ type: 'error', code: 'UPSTREAM', message: 'The assistant could not be reached.' }),
    );

    await useChatStore.getState().send('hello');

    const assistant = useChatStore.getState().messages[1];
    expect(assistant.error).toBe('The assistant could not be reached.');
    expect(useChatStore.getState().streaming).toBe(false);
  });

  it('drops the conversation id when the server retires it', async () => {
    streamChatMessage.mockImplementation(eventsFor({ type: 'error', code: 'SCOPE_CHANGED', message: 'SCOPE_CHANGED' }));
    useChatStore.setState({ conversationId: 'conv-stale' });

    await useChatStore.getState().send('hello');

    expect(useChatStore.getState().conversationId).toBeNull();
  });
});

describe('chatStore.stop / reset', () => {
  it('does not show a connection error when the user stops a stream', async () => {
    streamChatMessage.mockImplementation(
      (async (
        _id: string,
        _body: unknown,
        _onEvent: (e: ChatSseEvent) => void,
        signal: AbortSignal,
      ) => {
        await new Promise((_resolve, reject) => {
          signal.addEventListener('abort', () => reject(new DOMException('aborted', 'AbortError')));
        });
      }) as never,
    );

    const pending = useChatStore.getState().send('hello');
    // send() yields while creating the conversation, so abort is not wired up
    // until the stream actually starts. Wait for it before stopping.
    await vi.waitFor(() => expect(useChatStore.getState().abort).not.toBeNull());
    useChatStore.getState().stop();
    await pending;

    const assistant = useChatStore.getState().messages[1];
    expect(assistant.error).toBeUndefined();
    expect(useChatStore.getState().streaming).toBe(false);
  });

  it('reset clears the thread and aborts the in-flight stream', async () => {
    streamChatMessage.mockImplementation(
      (async (
        _id: string,
        _body: unknown,
        _onEvent: (e: ChatSseEvent) => void,
        signal: AbortSignal,
      ) => {
        await new Promise((_resolve, reject) => {
          signal.addEventListener('abort', () => reject(new DOMException('aborted', 'AbortError')));
        });
      }) as never,
    );

    const pending = useChatStore.getState().send('hello');
    await vi.waitFor(() => expect(useChatStore.getState().abort).not.toBeNull());
    useChatStore.getState().reset();
    await pending;

    expect(useChatStore.getState().messages).toEqual([]);
    expect(useChatStore.getState().conversationId).toBeNull();
    expect(useChatStore.getState().streaming).toBe(false);
  });
});
