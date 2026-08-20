# Dead config and build artifacts in the repo

> Found by /tech-debt audit on 2026-07-06. Severity: low · Effort: S

**Why this is debt:** Build artifacts are tracked in git and create noise in every diff; a dead Tailwind v3 file and an ignored ESLint key mislead readers about what's actually active — notably `eslint-plugin-storybook` is installed but never runs.

## Checklist

- [ ] Add `*.tsbuildinfo` to `.gitignore` and `git rm --cached tsconfig.app.tsbuildinfo tsconfig.node.tsbuildinfo`
- [ ] Delete `src/tailwind.css` — it uses Tailwind v3 `@tailwind` directives, is never imported, and the project runs Tailwind v4 via `@tailwindcss/vite`
- [ ] Remove the legacy `eslintConfig` key from `package.json` (lines 99-103) — ESLint 9 flat config ignores it
- [ ] Decide on `eslint-plugin-storybook`: either register it in `eslint.config.js` flat config (it supports flat config ≥0.10; upgrade from ^0.8.0) or remove the dependency
- [ ] Verify: `git status` stays clean after `npm run build`; `npm run lint` passes; `grep -rn "tailwind.css" src .storybook index.html vite.config.ts` returns nothing

## Evidence

- `tsconfig.app.tsbuildinfo`, `tsconfig.node.tsbuildinfo` — tracked; `.gitignore` has no `*.tsbuildinfo` entry
- `src/tailwind.css` — `@tailwind base/components/utilities`, zero imports found
- `package.json:99-103` — `"eslintConfig": { "extends": ["plugin:storybook/recommended"] }` (inert under flat config)
