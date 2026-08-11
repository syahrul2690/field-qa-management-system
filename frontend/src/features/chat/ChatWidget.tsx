import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { chatApi } from '../../services/chatApi';
import { useChatStore, ChatUiMessage } from '../../store/chatStore';
import { usePageContext } from './usePageContext';
import { Markdown } from './Markdown';

const SUGGESTIONS = [
  'Which of my documents are overdue?',
  'Status proyek saya apa saja?',
  'Show documents still waiting for approval',
];

export function ChatWidget() {
  const page = usePageContext();
  const { isOpen, messages, streaming, status, error, toggle, close, reset, send, stop } =
    useChatStore();

  // Hides the widget entirely when the server has no AI configured, rather
  // than letting the user discover it by getting an error.
  const { data } = useQuery({
    queryKey: ['chat-health'],
    queryFn: () => chatApi.health(),
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
  const enabled: boolean = data?.data?.data?.enabled ?? false;

  // Escape closes the assistant, matching dialog conventions. Registered only
  // while the panel is open so it never swallows keys from the app behind it.
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, close]);

  if (!enabled) return null;

  return (
    <>
      {!isOpen && (
        <button
          onClick={toggle}
          aria-label="Open assistant"
          className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full text-white shadow-lg transition-transform hover:scale-105"
          style={{ backgroundColor: '#44B8DE' }}
        >
          <SparkleIcon className="h-6 w-6" />
        </button>
      )}

      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="AI assistant"
          className="fixed inset-0 z-40 sm:inset-auto sm:bottom-6 sm:right-6 sm:h-[620px] sm:w-[420px]"
        >
          <div className="flex h-full flex-col overflow-hidden bg-white shadow-2xl sm:rounded-xl border border-gray-200">
            <Header onClose={close} onReset={reset} busy={streaming} />
            <MessageList messages={messages} status={status} />
            {error && (
              <p className="border-t border-red-100 bg-red-50 px-4 py-2 text-xs text-red-700">{error}</p>
            )}
            <Composer
              busy={streaming}
              onSend={(text) => send(text, page)}
              onStop={stop}
              showSuggestions={messages.length === 0}
            />
          </div>
        </div>
      )}
    </>
  );
}

function Header({ onClose, onReset, busy }: { onClose: () => void; onReset: () => void; busy: boolean }) {
  return (
    <div
      className="flex items-center gap-2 px-4 py-3 text-white"
      style={{ background: 'linear-gradient(180deg, #0e4f65 0%, #0a3d50 100%)' }}
    >
      <SparkleIcon className="h-5 w-5 flex-shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold leading-tight">Assistant</p>
        <p className="text-[11px] leading-tight" style={{ color: '#A1DBEE' }}>
          Project data, document status, workflow
        </p>
      </div>
      <button
        onClick={onReset}
        disabled={busy}
        title="New chat"
        className="rounded p-1.5 hover:bg-white/10 disabled:opacity-40"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
      </button>
      <button onClick={onClose} title="Close" className="rounded p-1.5 hover:bg-white/10">
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

function MessageList({ messages, status }: { messages: ChatUiMessage[]; status: string | null }) {
  const endRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const pinned = useRef(true);

  // Follow the stream, but stop fighting the user if they scroll up to reread.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => {
      pinned.current = el.scrollHeight - el.scrollTop - el.clientHeight < 60;
    };
    el.addEventListener('scroll', onScroll);
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (pinned.current) endRef.current?.scrollIntoView({ block: 'end' });
  }, [messages, status]);

  return (
    <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto bg-gray-50 px-4 py-4">
      {messages.length === 0 && (
        <div className="pt-6 text-center">
          <SparkleIcon className="mx-auto h-8 w-8 text-primary-300" />
          <p className="mt-2 text-sm font-medium text-gray-700">Ask about your projects</p>
          <p className="mt-1 text-xs text-gray-500">
            Document status, review progress, what is overdue — grounded in the data you have access to.
          </p>
        </div>
      )}

      {messages.map((m) => (
        <MessageBubble key={m.id} message={m} />
      ))}

      {status && (
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary-400" />
          {status}
        </div>
      )}

      <div ref={endRef} />
    </div>
  );
}

function MessageBubble({ message }: { message: ChatUiMessage }) {
  if (message.role === 'user') {
    return (
      <div className="flex justify-end">
        <div
          className="max-w-[85%] whitespace-pre-wrap rounded-lg rounded-br-sm px-3 py-2 text-sm text-white"
          style={{ backgroundColor: '#44B8DE' }}
        >
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      {message.tools.length > 0 && <ToolTrace tools={message.tools} />}

      {message.content && (
        <div className="max-w-[95%] rounded-lg rounded-bl-sm border border-gray-200 bg-white px-3 py-2">
          {/* Re-parsing markdown on every token janks on long answers, so the
              raw text is shown until the turn completes. */}
          {message.streaming ? (
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-800">
              {message.content}
            </p>
          ) : (
            <Markdown>{message.content}</Markdown>
          )}
        </div>
      )}

      {message.streaming && !message.content && (
        <div className="flex gap-1 px-1 py-2">
          {[0, 150, 300].map((d) => (
            <span
              key={d}
              className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-300"
              style={{ animationDelay: `${d}ms` }}
            />
          ))}
        </div>
      )}

      {message.error && (
        <p className="rounded border border-amber-200 bg-amber-50 px-2.5 py-1.5 text-xs text-amber-700">
          {message.error}
        </p>
      )}
    </div>
  );
}

function ToolTrace({ tools }: { tools: ChatUiMessage['tools'] }) {
  const [open, setOpen] = useState(false);
  const done = tools.filter((t) => t.ok !== undefined).length;

  return (
    <div className="text-[11px]">
      <button
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-1 rounded bg-gray-100 px-2 py-0.5 text-gray-500 hover:bg-gray-200"
      >
        <svg
          className={`h-3 w-3 transition-transform ${open ? 'rotate-90' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
        Looked up {done}/{tools.length} source{tools.length === 1 ? '' : 's'}
      </button>

      {open && (
        <ul className="mt-1 space-y-0.5 pl-4 text-gray-500">
          {tools.map((t) => (
            <li key={t.id} className="flex items-baseline gap-1.5">
              <span className={t.ok === false ? 'text-red-500' : 'text-green-600'}>
                {t.ok === undefined ? '…' : t.ok ? '✓' : '✕'}
              </span>
              <code className="font-mono">{t.name}</code>
              {t.summary && <span className="text-gray-400">— {t.summary}</span>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Composer({
  busy,
  onSend,
  onStop,
  showSuggestions,
}: {
  busy: boolean;
  onSend: (text: string) => void;
  onStop: () => void;
  showSuggestions: boolean;
}) {
  const [value, setValue] = useState('');
  const ref = useRef<HTMLTextAreaElement>(null);

  const submit = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || busy) return;
    onSend(trimmed);
    setValue('');
    if (ref.current) ref.current.style.height = 'auto';
  };

  return (
    <div className="border-t border-gray-200 bg-white px-3 py-2.5">
      {showSuggestions && !busy && (
        <div className="mb-2 flex flex-wrap gap-1.5">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => submit(s)}
              className="rounded-full border border-gray-200 px-2.5 py-1 text-[11px] text-gray-600 hover:border-primary-300 hover:text-primary-700"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <div className="flex items-end gap-2">
        <textarea
          ref={ref}
          autoFocus
          rows={1}
          value={value}
          placeholder="Ask about a project or document…"
          onChange={(e) => {
            setValue(e.target.value);
            e.target.style.height = 'auto';
            e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              submit(value);
            }
          }}
          className="input max-h-[120px] flex-1 resize-none py-2 text-sm"
        />

        {busy ? (
          <button onClick={onStop} className="btn-secondary px-3 py-2 text-xs" title="Stop">
            Stop
          </button>
        ) : (
          <button
            onClick={() => submit(value)}
            disabled={!value.trim()}
            className="btn-primary px-3 py-2 disabled:opacity-40"
            title="Send"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 19V5m0 0l-7 7m7-7l7 7" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

function SparkleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"
      />
    </svg>
  );
}
