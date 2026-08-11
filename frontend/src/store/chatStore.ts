import { create } from 'zustand';
import { chatApi, streamChatMessage, PageContext } from '../services/chatApi';

export interface ToolTraceItem {
  id: string;
  name: string;
  ok?: boolean;
  summary?: string;
  duration_ms?: number;
}

export interface ChatUiMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  tools: ToolTraceItem[];
  streaming?: boolean;
  error?: string;
}

interface ChatState {
  isOpen: boolean;
  conversationId: string | null;
  messages: ChatUiMessage[];
  streaming: boolean;
  status: string | null;
  error: string | null;
  abort: AbortController | null;

  open: () => void;
  close: () => void;
  toggle: () => void;
  reset: () => void;
  send: (content: string, page?: PageContext) => Promise<void>;
  stop: () => void;
}

let messageCounter = 0;
const nextId = () => `m${++messageCounter}`;

/**
 * Lives in a store rather than in the widget so a conversation survives route
 * changes — the user can follow a link the assistant gave them and come back
 * to the same thread.
 */
export const useChatStore = create<ChatState>((set, get) => ({
  isOpen: false,
  conversationId: null,
  messages: [],
  streaming: false,
  status: null,
  error: null,
  abort: null,

  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  toggle: () => set((s) => ({ isOpen: !s.isOpen })),

  reset: () => {
    get().abort?.abort();
    set({ conversationId: null, messages: [], streaming: false, status: null, error: null, abort: null });
  },

  stop: () => {
    get().abort?.abort();
    set((s) => ({
      streaming: false,
      status: null,
      abort: null,
      messages: s.messages.map((m) => (m.streaming ? { ...m, streaming: false } : m)),
    }));
  },

  send: async (content, page) => {
    if (get().streaming) return;

    let conversationId = get().conversationId;
    set({ error: null });

    if (!conversationId) {
      try {
        const res = await chatApi.createConversation(page?.project_id);
        conversationId = res.data.data.id as string;
        set({ conversationId });
      } catch {
        set({ error: 'Could not start a conversation.' });
        return;
      }
    }

    const assistantId = nextId();
    const controller = new AbortController();

    set((s) => ({
      streaming: true,
      status: null,
      abort: controller,
      messages: [
        ...s.messages,
        { id: nextId(), role: 'user', content, tools: [] },
        { id: assistantId, role: 'assistant', content: '', tools: [], streaming: true },
      ],
    }));

    const patch = (fn: (m: ChatUiMessage) => ChatUiMessage) =>
      set((s) => ({ messages: s.messages.map((m) => (m.id === assistantId ? fn(m) : m)) }));

    try {
      await streamChatMessage(
        conversationId,
        { content, page_context: page },
        (event) => {
          switch (event.type) {
            case 'status':
              set({ status: event.label });
              break;
            case 'tool_call':
              patch((m) => ({ ...m, tools: [...m.tools, { id: event.id, name: event.name }] }));
              break;
            case 'tool_result':
              patch((m) => ({
                ...m,
                tools: m.tools.map((t) =>
                  t.id === event.id
                    ? { ...t, ok: event.ok, summary: event.summary, duration_ms: event.duration_ms }
                    : t,
                ),
              }));
              break;
            case 'token':
              set({ status: null });
              patch((m) => ({ ...m, content: m.content + event.text }));
              break;
            case 'error':
              // A conversation that outlived the user's scope or its message
              // budget cannot be continued; drop it so the next send starts
              // a fresh one.
              if (event.code === 'SCOPE_CHANGED' || event.code === 'CONVERSATION_FULL') {
                set({ conversationId: null });
              }
              patch((m) => ({ ...m, error: event.message }));
              break;
            case 'done':
              break;
          }
        },
        controller.signal,
      );
    } catch {
      // Stopping aborts the fetch; the AbortError is not a failure the user
      // needs to see. Only surface an error for genuine disconnects.
      if (!controller.signal.aborted) {
        patch((m) => ({ ...m, error: 'The connection was interrupted.' }));
      }
    } finally {
      set((s) => ({
        streaming: false,
        status: null,
        abort: null,
        messages: s.messages.map((m) => (m.id === assistantId ? { ...m, streaming: false } : m)),
      }));
    }
  },
}));
