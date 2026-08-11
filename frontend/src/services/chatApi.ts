import apiClient from './apiClient';
import { getAccessToken, refreshAccessToken } from './tokenRefresh';

export interface PageContext {
  route?: string;
  label?: string;
  project_id?: string;
  document_id?: string;
  review_id?: string;
}

export interface ConversationSummary {
  id: string;
  title: string | null;
  project_id: string | null;
  created_at: string;
  updated_at: string;
}

export const chatApi = {
  health: () => apiClient.get('/chat/health'),
  createConversation: (projectId?: string) =>
    apiClient.post('/chat/conversations', projectId ? { project_id: projectId } : {}),
  listConversations: () => apiClient.get('/chat/conversations'),
  getMessages: (id: string) => apiClient.get(`/chat/conversations/${id}`),
  deleteConversation: (id: string) => apiClient.delete(`/chat/conversations/${id}`),
};

export type ChatSseEvent =
  | { type: 'start'; conversation_id: string; user_message_id: string }
  | { type: 'status'; label: string }
  | { type: 'tool_call'; id: string; name: string }
  | { type: 'tool_result'; id: string; name: string; ok: boolean; summary: string; duration_ms: number }
  | { type: 'token'; text: string }
  | { type: 'done'; model: string; usage: { prompt_tokens: number; completion_tokens: number } }
  | { type: 'error'; code: string; message: string };

/**
 * Streams one assistant turn.
 *
 * Uses `fetch` rather than axios because axios buffers the whole body, and
 * rather than EventSource because EventSource cannot set an Authorization
 * header. That means the axios 401 interceptor does not apply here, so the
 * refresh-and-retry is handled explicitly — via the shared single-flight
 * helper, so it cannot race the interceptor.
 */
export async function streamChatMessage(
  conversationId: string,
  body: { content: string; page_context?: PageContext },
  onEvent: (event: ChatSseEvent) => void,
  signal: AbortSignal,
): Promise<void> {
  const url = `/api/chat/conversations/${conversationId}/messages`;

  const doFetch = (token: string | null) =>
    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'text/event-stream',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(body),
      credentials: 'include',
      signal,
    });

  let res = await doFetch(getAccessToken());
  if (res.status === 401) {
    res = await doFetch(await refreshAccessToken());
  }

  if (!res.ok || !res.body) {
    let message = 'The assistant is unavailable right now.';
    let code = `HTTP_${res.status}`;
    try {
      const payload = await res.json();
      if (typeof payload?.message === 'string') {
        message = payload.message;
        if (payload.message === 'SCOPE_CHANGED' || payload.message === 'CONVERSATION_FULL') {
          code = payload.message;
        }
      }
    } catch {
      /* non-JSON error body */
    }
    onEvent({ type: 'error', code, message });
    return;
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;

      // `stream: true` keeps multi-byte characters intact across chunks.
      buffer += decoder.decode(value, { stream: true });

      // Frames are separated by a blank line and routinely straddle chunk
      // boundaries, so only complete frames are consumed.
      let split = buffer.indexOf('\n\n');
      while (split !== -1) {
        const frame = buffer.slice(0, split);
        buffer = buffer.slice(split + 2);
        const parsed = parseFrame(frame);
        if (parsed) onEvent(parsed);
        split = buffer.indexOf('\n\n');
      }
    }
  } catch (err) {
    if (signal.aborted) return; // user pressed Stop; not an error
    throw err;
  }
}

/** Exported for tests. */
export function parseFrame(frame: string): ChatSseEvent | null {
  const dataLines: string[] = [];
  for (const line of frame.split('\n')) {
    if (line.startsWith(':')) continue; // heartbeat
    if (line.startsWith('data:')) dataLines.push(line.slice(5).trimStart());
  }
  if (dataLines.length === 0) return null;

  try {
    return JSON.parse(dataLines.join('\n')) as ChatSseEvent;
  } catch {
    return null;
  }
}
