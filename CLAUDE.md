# Pointer — project brief for Claude Code

Pointer (pointer.rohanahire.com) teaches the 15 patterns behind most coding interviews by showing them move. Each lesson has an analogy, a 60-second animated explainer, a step-through visualizer that runs the real algorithm, and the Blind 75 problems for that pattern.

**Owner:** Rohan. Ask before large structural decisions; small ones, just make and mention.

## The one rule that matters most
Ship **one complete pattern (Sliding Window) live on the real URL** before building anything for the other 14. Every other pattern page shows the "coming soon" state until its content exists. Do not scaffold empty lesson pages for all 15.

## Where the design lives
- `design/mocks/*.dc.html` — the approved mockups (HTML prototypes from a design canvas). Read them for layout, copy, spacing, states and interactions. They use inline styles and a small templating runtime (`{{holes}}`, `<sc-for>`, `<sc-if>`, a `Component` class at the bottom); treat that as a spec, **not** code to copy. See `design/README.md` for what each file is.
- `design/tokens.css` — colour, type, radius, shadow and motion tokens. This file is the source of truth. Components use `var(--token)`, never raw hex.
- `design/data/patterns.json`, `design/data/problems.json` — the content model (15 patterns, 75 problems). Verify LeetCode URLs once; they were written by hand.
- `design/visualizer-spec.md` — how the step-through visualizer works, with the Sliding Window reference implementation.

## Stack
- Next.js (App Router) + TypeScript (strict), deployed on Vercel.
- Styling: CSS Modules or Tailwind using the CSS variables from `tokens.css` (pick one and stay consistent; if Tailwind, map theme colours to the variables).
- Fonts via `next/font/google`: Unbounded (800), DM Sans (400/500/700), DM Mono (400/500).
- Motion: Framer Motion (or CSS transitions) — respect `prefers-reduced-motion`.
- Content: typed data from `design/data/*.json`, moved into `content/` with TypeScript types. Lesson prose can be MDX later; not needed for v1.
- No backend, no login. Progress lives in `localStorage` (see below).

## Routes
| Route | Mock | Notes |
|---|---|---|
| `/` | C2-Home | "Welcome back" banner only when progress exists |
| `/patterns` | C2-Patterns | Grouped (Foundations / Structures & Recursion / Advanced), filter All · Live now · Started |
| `/patterns/[slug]` | C2-Pattern (live), C2-Soon (soon) | Status comes from data |
| `/problems` | C2-Problems | All 75 + Extras group, filters, solved checkboxes |
| `/progress` | C2-Progress | Stats, continue card, per-pattern table, export / import / reset with confirm |
| `/about` | C2-About | |
| 404 | C2-404 | `app/not-found.tsx` |
| Search | C2-Search | Command palette overlay opened with `/` or ⌘K, not a route |
| OG image | C2-OG | `app/opengraph-image.tsx`, 1200×630 |
Phone layouts: the `C2-Phone*` mocks. Breakpoint at ~768px; lesson on phone has sticky section tabs at the top and sticky Back / Play / Step controls at the bottom.

## Lesson page anatomy (live)
Main nav → lesson bar (pattern switcher, numbered sections 1 The idea · 2 Watch · 3 Try it · 4 Solve with the current one filled, "Lesson N of 15 · x of y solved", prev/next) → hero (breadcrumb, title with highlight, analogy, meta, "Reach for it when…" callout) → Watch (video, captions on by default, transcript toggle) → Try it (visualizer) → Solve (problem cards with "Mark solved" + "Open on LeetCode ↗") → Up next card.

## Progress (localStorage)
Key `pointer:v1`:
```ts
type Progress = {
  version: 1;
  solved: Record<string /* problem slug */, true>;
  lessons: Record<string /* pattern slug */, { lastSection: 'idea' | 'watch' | 'try' | 'solve'; updatedAt: string }>;
};
```
Export downloads this as JSON; import validates and merges. Theme choice is stored separately under `pointer:theme` (`'light' | 'dark' | 'system'`, default system). Wrap every storage access in try/catch — the site must work with storage blocked.

## Accessibility (non-negotiable, WCAG 2.2 AA)
- Keyboard: everything reachable; visible focus ring (`--focus`, 3px, offset 3px); skip link on every page; `/` opens search.
- Visualizer: focusable region, ← → step, Space play/pause, R reset; speed 0.5× / 1× / 2×; narration in an `aria-live="polite"` region that is switched **off while autoplaying**; a text summary of state for screen readers each step.
- Never colour alone (dashed borders for "left behind", ▶ marker for the running code line, text labels on tags).
- Touch targets ≥ 44px. Text contrast 4.5:1 in both themes. Text on accent fills always uses `--on-accent`.
- One `h1` per page, landmarks, breadcrumbs below top level, external links announce "opens in a new tab".
- Video: captions on by default, transcript available.
- Reduced motion: no tilts, no slides — states switch instantly.

## Build order (milestone 1 = live Sliding Window)
1. Project setup, tokens, fonts, theme switching (system default, manual override), layout shell (nav, footer, skip link).
2. Content types + data loading from JSON.
3. Visualizer engine + Sliding Window visualizer (see spec), with tests for the trace generator.
4. Lesson page for Sliding Window, and the "coming soon" lesson state.
5. Problems page + progress store (solved checkboxes shared across pages).
6. Home, Patterns, Progress, About, 404, search palette.
7. Phone layouts, OG image, metadata.
8. Accessibility pass (axe + keyboard + screen reader spot check), Lighthouse, deploy to Vercel, domain `pointer.rohanahire.com` (CNAME `pointer` → Vercel's target).
Placeholders to leave clearly marked until Rohan supplies them: `[EXPLAINER VIDEO URL]`, `[VTT URL]`, `[PHOTO]`, `[EMAIL]`, `[GITHUB]`, `[INSTAGRAM]`, `[LINKEDIN]`, `[EMAIL SIGNUP SERVICE]`.

## Conventions
- Small, typed components; no `any`. Co-locate component styles.
- Every pattern-specific visualizer is a pure `trace(input) => Step[]` function plus a small render component; the player UI (controls, keyboard, speed, narration) is shared.
- Commit in small steps with clear messages. Run lint, typecheck and tests before saying a step is done.

@AGENTS.md
