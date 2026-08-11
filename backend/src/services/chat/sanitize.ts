/**
 * Neutralizes free text authored by third parties before it reaches the model.
 *
 * Document titles, BOQ titles, ITP activities and review comments are written
 * by vendors and PLN staff. Once they land in a tool result they sit in the
 * model's context alongside genuine instructions, so text that looks like a
 * system directive has to be defanged first.
 *
 * This is defence in depth, not the primary control. The load-bearing
 * mitigation is that the whole toolset is read-only with no network egress and
 * no SQL escape hatch, so a successful injection has nothing to escalate to and
 * nowhere to send data. Keep it that way.
 */

/** Per-field output caps, in characters. */
export const LIMITS = {
  title: 300,
  description: 1000,
  activity: 500,
  criteria: 1000,
  comment: 1000,
} as const;

// Chat-template delimiters that some models still honour mid-prompt.
const CONTROL_SEQUENCES =
  /<\|[a-z_]+\|>|<\/?(?:think|thinking|system|assistant|user)>|\[\/?INST\]|<\/s>|<s>/gi;

// A line that opens with "system:" reads as a role switch to most models.
const PSEUDO_ROLE_LINE = /^[ \t]*(system|assistant|user|tool|developer)[ \t]*:/gim;

export function sanitizeUntrusted(value: string | null | undefined, maxLen: number): string | null {
  if (value == null) return null;

  let out = value
    .replace(CONTROL_SEQUENCES, ' ')
    // Guillemets keep the text readable to a human while removing the
    // role-switch reading.
    .replace(PSEUDO_ROLE_LINE, (_m, role: string) => `‹${role}›:`)
    // Long newline runs are used to fake an "end of data" boundary.
    .replace(/\n{4,}/g, '\n\n\n')
    // Control characters (except tab/newline) can be used to hide payloads
    // from a human reviewer while the model still reads them.
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .trim();

  if (out.length > maxLen) out = `${out.slice(0, maxLen)}…`;
  return out;
}

/**
 * Strips <think>…</think> from a streaming token feed.
 *
 * Reasoning models emit these inline in `content`. The configured chat model
 * does not, but the model is an env var, so swapping in a reasoning model must
 * degrade to "no visible reasoning" rather than leaking chain-of-thought into
 * the chat bubble.
 *
 * Stateful because a tag can straddle a chunk boundary: a chunk may end with
 * "<thi" and the tag only becomes recognisable once the next chunk arrives.
 */
export function createThinkFilter() {
  const OPEN = '<think>';
  const CLOSE = '</think>';
  let inside = false;
  let pending = '';

  /** Longest suffix of `s` that could still grow into `tag`. */
  function partialTagSuffix(s: string, tag: string): number {
    const max = Math.min(s.length, tag.length - 1);
    for (let n = max; n > 0; n--) {
      if (tag.startsWith(s.slice(s.length - n))) return n;
    }
    return 0;
  }

  return {
    push(chunk: string): string {
      pending += chunk;
      let emitted = '';

      for (;;) {
        if (inside) {
          const close = pending.indexOf(CLOSE);
          if (close === -1) {
            pending = pending.slice(Math.max(0, pending.length - (CLOSE.length - 1)));
            return emitted;
          }
          pending = pending.slice(close + CLOSE.length);
          inside = false;
          continue;
        }

        const open = pending.indexOf(OPEN);
        if (open === -1) {
          const hold = partialTagSuffix(pending, OPEN);
          emitted += pending.slice(0, pending.length - hold);
          pending = pending.slice(pending.length - hold);
          return emitted;
        }

        emitted += pending.slice(0, open);
        pending = pending.slice(open + OPEN.length);
        inside = true;
      }
    },

    /** Flush whatever is left once the stream ends. */
    flush(): string {
      const rest = inside ? '' : pending;
      pending = '';
      return rest;
    },
  };
}
