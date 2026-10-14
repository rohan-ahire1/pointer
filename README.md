# Pointer

Pointer ([pointer.rohanahire.com](https://pointer.rohanahire.com)) teaches the 15 coding-interview patterns with lessons, animated explainers, step-through visualizers and the Blind 75 problems.

Next.js (App Router), React 19, TypeScript and CSS Modules. Progress is saved in the browser (localStorage), so there's no backend.

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
npm test           # vitest
npm run typecheck
npm run lint
```

## Where things are

- `app/`: routes (`/`, `/patterns`, `/patterns/[slug]`, `/problems`, `/progress`, `/about`)
- `components/`: UI, one folder per component with its `.module.css`
- `content/`: patterns and problems data
- `visualizers/`: one folder per visualizer, plus the shared player and kit
- `lib/`: progress store, theme, search, nav helpers
- `design/`: approved mocks and `tokens.css`
- `scripts/deploy-vps.sh`: production deploy

`AGENTS.md` and `CLAUDE.md` hold the full brief and house rules.
