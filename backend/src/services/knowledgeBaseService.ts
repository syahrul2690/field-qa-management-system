import fs from 'fs';
import path from 'path';

/**
 * Directory where knowledge base .md files live.
 * Resolved relative to this source file → backend/knowledge-base/
 */
const KB_DIR = path.resolve(__dirname, '../../knowledge-base');

/**
 * Read all .md files from the knowledge-base directory (excluding README.md)
 * and return their combined content as a single string.
 *
 * Files are loaded fresh on every call — no server restart needed after edits.
 * Files are sorted alphabetically so numbered prefixes (01-, 02-, ...) control order.
 *
 * Returns an empty string if the directory is missing or has no files.
 */
export function loadKnowledgeBase(): string {
  try {
    if (!fs.existsSync(KB_DIR)) return '';

    const files = fs
      .readdirSync(KB_DIR)
      .filter(
        (f) =>
          f.endsWith('.md') &&
          f.toLowerCase() !== 'readme.md',
      )
      .sort(); // alphabetical — use 01-, 02-, ... prefix to control order

    if (files.length === 0) return '';

    const parts = files.map((file) => {
      const filePath = path.join(KB_DIR, file);
      const content = fs.readFileSync(filePath, 'utf-8').trim();
      return `### Knowledge: ${file}\n\n${content}`;
    });

    return parts.join('\n\n---\n\n');
  } catch (err) {
    console.warn('[knowledgeBase] Failed to load knowledge base:', err);
    return '';
  }
}

/**
 * Wrap the knowledge base content into a prompt section.
 * Returns an empty string if there are no KB files.
 */
export function getKnowledgeBaseSection(): string {
  const kb = loadKnowledgeBase();
  if (!kb) return '';

  return `\n\n## Your Knowledge Base\n\nThe following domain knowledge has been provided to guide your analysis. Use it as the primary reference for standards, review criteria, tone, and common issues.\n\n${kb}\n\n## End of Knowledge Base\n`;
}
