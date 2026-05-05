# Knowledge Base — How to Use This Folder

Place any number of `.md` files in this folder. The AI will read **all of them** automatically before every review analysis and project summary.

## File naming convention (recommended)

Use a numbered prefix so they load in a predictable order:
```
01-standards.md        → PLN / SPLN / SNI / IEC reference standards
02-review-criteria.md  → What to check in ITP, Procedure, Work Method documents
03-common-issues.md    → Common defects and how to flag them
04-tone-and-format.md  → How the AI should write comments (tone, language, strictness)
```

## Tips
- Files are loaded fresh on every AI call — no restart needed after edits.
- Each file can be as long as needed; all files are concatenated and injected into the AI system prompt.
- The README.md file is excluded automatically (not sent to the AI).
- Keep each file focused on one topic for easier maintenance.
