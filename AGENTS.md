# Pointer: agent guide

Pointer (pointer.rohanahire.com) teaches the 15 coding-interview patterns with lessons, animated explainers, step-through visualizers and the Blind 75 problems. Next.js (App Router) + React 19 + TypeScript, CSS Modules. The full brief is in `CLAUDE.md`.

## Map

- `app/`: routes (`/`, `/patterns`, `/patterns/[slug]`, `/problems`, `/progress`, `/about`). `app/sitemap.ts` lists every page.
- `components/`: UI, one folder per component with a co-located `.module.css`. Lesson sections live in `components/Lesson/`.
- `content/`: typed data (`patterns.json`, `problems.json`, `types.ts`).
- `visualizers/`: one folder per visualizer (pure `trace(input) => Step[]` plus a render component); `player/` and `kit/` are shared.
- `lib/`: progress store (localStorage `pointer:v1`), theme, search, nav helpers.
- `design/`: approved mocks (`design/mocks/*.dc.html`) and `tokens.css`, the source of truth for colours and type.
- `scripts/deploy-vps.sh`: production deploy. Don't touch.

Dev server: `npm run dev` (http://localhost:3000).

## Rules

1. Use `var(--token)` from `design/tokens.css`, never raw hex.
2. WCAG 2.2 AA: keyboard reachable, visible focus, 44px touch targets, never colour alone, respect `prefers-reduced-motion`.
3. The site must work with localStorage blocked. Wrap every storage access in try/catch.
4. Plain words in UI copy and PR text.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

<!-- factory:start -->
<!-- Managed by the factory kit from factory.json. Edit factory.json, then run `factory update`. -->

## Factory rules

### Commands

| What | Command |
|---|---|
| Install | `npm ci --no-audit --no-fund` |
| Typecheck | `npm run typecheck` |
| Lint | `npm run lint` |
| Tests | `npm test` |
| Build | `npm run build` |
| Prove it in a browser | `node .factory/verify.mjs --start --shots <routes>` (after the build) |
| **All gates** | `node .factory/gates.mjs` (add `--shots <routes>` for UI changes) |

### Hard rules

1. **Never push to `master`, merge PRs, or run a deploy.** Work on a branch, open a PR, and stop. A human merges.
2. Don't edit `.github/workflows/` unless the issue asks for it explicitly.
3. No secrets in code, logs, PRs or screenshots.

### Definition of done

A change is done only when all of these hold. Show the evidence, don't just say it:

- `node .factory/gates.mjs` passes.
- For UI changes: you ran it with `--shots <changed routes>` and looked at the mobile and desktop screenshots.
- The diff is the smallest one that solves the problem. No drive-by refactors, no new dependencies without a stated reason.
- One concern per PR. If the work is bigger, split it and list the follow-ups.
- The PR body follows `.github/pull_request_template.md`.
- See `docs/factory/README.md` for how the factory works.
<!-- factory:end -->
