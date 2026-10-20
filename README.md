# Pointer

**Learn the 15 coding-interview patterns by watching them run.**

Live: [pointer.rohanahire.com](https://pointer.rohanahire.com)

## What it does

Pointer teaches the patterns behind the Blind 75 problem list: Arrays & Hashing, Two Pointers, Sliding Window, Stack, Binary Search, Linked List, Trees, Tries, Heaps, Backtracking, Graphs, 1-D DP, 2-D DP, Greedy and Intervals.

Each pattern gets one lesson page with:

- **The idea in one line**, an everyday analogy, when to reach for it, and its time and space complexity.
- **An animated explainer** with captions and a transcript, built in code with Remotion rather than recorded as video.
- **A step-through visualizer** for a classic problem (for example, longest substring without repeating characters for Sliding Window). It highlights the matching line of a TypeScript solution and narrates each step. You can paste your own LeetCode-style input, such as `[2,7,11,15]`.
- **The Blind 75 problems for that pattern**, each with a one-line hint and a link to LeetCode.

Progress is saved in the browser, so there's no sign-up and no backend.

## Key features

- 15 lessons and 15 visualizers, one per pattern
- Visualizer player with play/pause, step, reset, speed control and keyboard shortcuts (arrow keys, space, `R`)
- Command-palette search across patterns and problems
- Progress page and "continue where you left off"
- Light and dark themes, a phone layout, skip links and screen-reader step summaries
- Generated Open Graph images, sitemap, robots and web manifest

## Tech stack

- Next.js 16 (App Router) with static export
- React 19, TypeScript, CSS Modules with shared design tokens
- Remotion Player for the animated explainers
- Vitest and Testing Library
- Deployed as static files behind Caddy on a VPS

## Architecture notes

- **Content is data.** `content/patterns.json` and `content/problems.json` drive every page. A test (`content/data.test.ts`) checks that the two files stay consistent.
- **One trace, many views.** Each visualizer exposes a pure, deterministic `trace(input)` function that returns a list of steps (state, highlighted code lines, narration, screen-reader text). Traces are unit tested directly. A shared `VisualizerPlayer` handles input parsing, presets, playback, speed, keyboard control and the code panel, so a new visualizer is mostly its trace and a view.
- **Shared kit.** `visualizers/kit` holds reusable pieces (cells, strips, pointer tags, panels, stats) so 15 different algorithms look like one product.
- **Local-only progress.** `lib/progress` wraps `localStorage` behind a small store with a React hook.
- **Atomic deploys.** `scripts/deploy-vps.sh` builds the static export, uploads it to a new release folder, swaps the symlink Caddy serves from, and keeps the last five releases.

## Run it locally

```bash
npm install
npm run dev          # http://localhost:3000
npm test             # vitest
npm run typecheck
npm run lint
npm run build:static # static export into out/
```

No environment variables are needed.

## Project layout

```
app/          Routes: /, /patterns, /patterns/[slug], /problems, /progress, /about
components/   UI, one folder per component with its .module.css
content/      Pattern and problem data
visualizers/  One folder per visualizer, plus the shared player and kit
lib/          Progress store, theme, search, navigation helpers
design/       Design mocks, tokens.css and the visualizer spec
public/video/ Explainer posters and caption files
```

## Credits

Problem list: the Blind 75, compiled by Yangshun Tay. Pattern grouping inspired by NeetCode.
