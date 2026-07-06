# Agent rules duplicated across .claude/ and .codex/

> Found by /tech-debt audit on 2026-07-06. Severity: low · Effort: S

**Why this is debt:** `.claude/rules/swiss-design.md` and `.codex/rules/swiss-design.md` are identical manual copies (in sync as of this audit, verified by diff), and `.codex/AGENTS.md` mirrors `.claude/CLAUDE.md`. Nothing keeps them synced — the next edit to one will silently strand the other, and agents will follow stale rules.

## Checklist

- [ ] Pick a single source of truth (suggest `.claude/rules/swiss-design.md`) and make the `.codex` copy derived: a symlink, or a small sync script (`scripts/sync-agent-rules.mjs`) run via a package script
- [ ] Do the same for `.claude/CLAUDE.md` → `.codex/AGENTS.md` if the only intended difference is the title line
- [ ] Optionally add a CI step that diffs the pairs and fails on drift
- [ ] Verify: `diff .claude/rules/swiss-design.md .codex/rules/swiss-design.md` exits 0, and editing the source propagates (or CI catches it)

## Evidence

- `diff .claude/rules/swiss-design.md .codex/rules/swiss-design.md` — identical (2026-07-06)
- `diff .claude/CLAUDE.md .codex/AGENTS.md` — differs only in the heading line
