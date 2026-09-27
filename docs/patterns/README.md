# Pattern visualizers — design spec (patterns 1–15, minus Sliding Window)

This folder is the design for the 14 lessons that are still "coming soon". Sliding Window
(`visualizers/sliding-window`, `design/visualizer-spec.md`) is the reference: every new
visualizer should feel like a sibling of it. One file per pattern (`NN-slug.md`) says what
to build; this README says how every one of them must look, move, read and be tested.

Read first: `CLAUDE.md`, `design/visualizer-spec.md`, `visualizers/types.ts`,
`visualizers/sliding-window/*`, `visualizers/player/VisualizerPlayer.tsx`,
`content/types.ts`, `content/patterns.json` (the sliding-window entry is the content model).

---

## 0. Who builds what

Two builders, no shared files, so both can work at once:

| File (per visualizer folder) | Owner | What |
|---|---|---|
| `types.ts` | **UI** (already written) | The state contract. **Authoritative** over the "State:" line in each spec. |
| `meta.ts` | **Content** | `export const meta = { id, title, presets, inputLabel, inputHint, inputMaxLength }` straight from the spec |
| `code.ts` | **Content** | The reference solution, verbatim from the spec, one string per line |
| `parseInput.ts` | **Content** | Input parsing, limits and error copy |
| `trace.ts` | **Content** | The traced run, returning `Step<State>[]` with `lines`, `note` and `sr` per the spec's step table |
| `trace.test.ts`, `parseInput` tests | **Content** | Everything in section 7 |
| `View.tsx`, `View.module.css`, `index.ts` | **UI** | The animated picture, and wiring the visualizer into the registry |
| `visualizers/kit/`, `visualizers/index.ts`, `visualizers/player/` | **UI** | |
| `content/patterns.json`, `content/problems.json` | **Content** | Section 8 |
| `lib/continue-lesson.test.ts` | **Content** | Section 9 |

The content builder never edits UI files and the UI builder never edits content files. If the contract in `types.ts` can't
express something the trace needs, write it in `docs/patterns/QUESTIONS.md` instead of changing `types.ts`.

## 1. Visual language (shared by every view)

Everything is built from the Sliding Window vocabulary. Same tokens, same shapes, same motion.

| Thing | Look | Used for |
|---|---|---|
| **Cell** | 56×64, radius 13, `--card` bg, 2px `--line` border, DM Mono 700 26px | an array slot, a character, a grid square, a dp cell |
| **Incoming / current** | `--orange` fill, `--on-accent` text, lifted 8px (`translateY(-8px)`) | the one element the code is looking at *right now* |
| **In range** | sits inside a **capsule** (`--tint-yellow`, 2.5px `--line` border, radius 18) | the live search space / window / reach |
| **Done / kept** | `--tint-mint` fill, solid border, plus a **✓** or the result value as text | finished, matched, part of the answer |
| **Left behind / ruled out** | `--past-bg` fill, **dashed** `--past-line` border, `--faint` text | discarded half, pruned branch, popped item |
| **Pointer tag** | small chip under the element, DM Mono 700 12px, radius 8 | `L` `R` `i` `lo` `mid` `hi` `prev` `curr` … |
| **Stats row** | 2–4 bordered tiles, label 12px/700 + value 19px mono; the **answer** tile is `--yellow` with the display font | the few numbers that matter |
| **Node (trees, graphs, tries, heaps)** | 44px circle, `--card`, 2px `--line`, value in DM Mono 700 | same state colours as cells |
| **Edge / arrow** | 2px `--line` stroke; ruled-out edges dashed `--past-line` | links, tree branches, list `next` pointers |

Pointer tag colours: the main "reading" pointer is **orange** (`--orange` bg, 2px border, `--on-accent` text, like `R`);
the anchor/slow pointer is **inverse** (`--inverse-bg`/`--inverse-fg`, like `L`); a third pointer (e.g. `mid`, `next`)
is **lilac** (`--lilac` bg, `--on-accent` text, 2px border).

Stat tile tints, in order of use: `--tint-lilac`, `--tint-mint`, `--tint-cream`, answer = `--yellow`.

**Never colour alone.** Every state that has a colour also has a non-colour signal: lift, dashed border,
a glyph (✓ ✕ ✂ ★ ≈), a text label, or a pointer tag. This is non-negotiable (CLAUDE.md accessibility).

**Only tokens.** No raw hex anywhere in views. SVG uses `var(--token)` via `className` or `style`
(`fill="var(--card)"` is fine). Text on `--orange`, `--yellow`, `--mint`, `--lilac` fills uses `--on-accent`.

**Views are `aria-hidden` pictures.** Screen readers get the state from `step.sr` (the player already
renders it). Each `sr` is a full sentence summary of what the picture shows, like Sliding Window's.

## 2. Motion

- Things **move**, they don't blink: keep elements keyed by identity (React `key` = stable id, not
  array index, whenever an element can change position) and animate `transform`/`left`/`width`.
- Durations: position/size changes `--dur-slow` ease-in-out; lifts and state changes `--dur-base`;
  colour `--dur-fast`. Nothing longer than 400ms (autoplay at 2× is 450ms per step).
- Newly created things (a pushed plate, a new trie node, a new map entry) fade + scale in from 0.8 over `--dur-base`.
  Removed things either fade out or become "left behind" — pick whichever keeps the story readable and say so in a comment.
- Reduced motion is global (`styles/tokens.css` zeroes durations). Don't add JS motion; CSS transitions only.
  No `tilt` rotations.

## 3. Layout and responsiveness

- The view lives in the player's left column (≈ 560px wide on desktop, down to ≈ 270px inside the panel at 320px).
- **No horizontal page scroll at 320px** with the largest allowed input. Preferred: size cells with a CSS
  custom property that shrinks under narrow widths (e.g. `--cell: 56px`, 40px under 480px, 32px under 360px),
  and SVG views use a `viewBox` with `width: 100%`.
- If a strip genuinely has to scroll, the scroll container gets `tabIndex={0}`, `role="region"` and an `aria-label`
  (axe rule `scrollable-region-focusable`), exactly like the fixed code panel.
- Stats row: `repeat(auto-fit, minmax(110px, 1fr))` so it wraps on phones.
- Heights must not jump between steps (reserve space for tags, badges and the tallest state) so the
  controls under the view don't bounce while stepping.

## 4. Steps and narration

- `trace(input)` is **pure and deterministic**. Never mutate the parsed input; copy arrays into state.
- First step: the setup ("Start with an empty map."). Last step: `Done. …` with the answer in words.
- One step = one idea the learner can see change. If two things always happen together, they're one step.
- `note`: plain English, second person / present tense, ≤ 110 characters, same voice as Sliding Window.
  Quote characters as `‘a’` (curly single quotes) and strings as `“abc”` (curly doubles). Numbers plain.
- `sr`: a full sentence, e.g. `i at 2, value 11. Need -2. Map has 2 entries. No pair yet.`
- `lines`: the 0-based lines of `code` that are executing for this step. The first step highlights the
  setup lines; the last step highlights the `return`.
- **Step budget:** every preset ≤ 60 steps; the largest valid input ≤ 150 steps. Choose input limits so this holds.

## 5. The shared kit (UI builder)

Create `visualizers/kit/` so the 14 views stay consistent and small. Sliding Window keeps its own view (don't refactor it).

- `Cell.tsx` + css: props `{ value: ReactNode; state: "waiting" | "current" | "range" | "done" | "past" | "found"; badge?: ReactNode; size?: "md" | "sm" }`.
  `range` = inside a capsule (no own fill), `found` = mint with ✓ badge. Uses `--cell` custom property for size.
- `PointerTags.tsx`: renders a row of `{ label, tone: "orange" | "inverse" | "lilac" }` chips; fixed height so layout doesn't jump.
- `Capsule.tsx`: absolutely positioned range highlight for a cell strip, given `start`, `end` (inclusive) and the strip's
  cell size + gap from CSS vars (compute with `calc()` in `style`, not measured pixels).
- `Stats.tsx`: `{ items: { label: string; value: ReactNode; answer?: boolean }[] }`.
- `Strip.tsx`: a horizontal row of cells with tags under each + optional capsule. Most array views are just this.
- `svg/Node.tsx`, `svg/Edge.tsx`, `svg/treeLayout.ts` (x/y for a node given level-order index and depth; used by trees, heaps, backtracking, tries).
- `format.ts`: `q(c)` → `‘c’`, `qq(s)` → `“s”`, `list(xs)` → `[1, 2, 3]`.

Unit test the pure helpers (`treeLayout`, `format`).

## 6. Engine touch points

- `Visualizer` has `inputLabel`, `inputHint` and `inputMaxLength` (default 10). Set all three.
- Register every visualizer in `visualizers/index.ts` under its id.
- Each visualizer folder mirrors Sliding Window, plus `types.ts` (contract) and `meta.ts` (see section 0).

## 7. Tests (definition of done for a visualizer)

In `trace.test.ts`:
1. Every preset → the expected answer from the pattern spec, and a locked step count.
2. Determinism: `trace(x)` deep-equals `trace(x)`.
3. Every step's `lines` are valid indices into `code`; every `note` ≤ 110 chars and non-empty; every `sr` non-empty.
4. First step is setup, last step note starts with `Done.`.
5. **Property test against brute force:** a tiny seeded PRNG (mulberry32, no dependency) generates 300 random
   valid inputs inside the input limits; the trace's final answer equals an obviously-correct brute-force
   implementation written in the test. Also assert the step budget (≤ 150) for every generated input.
6. `parseInput`: valid preset strings parse; junk is stripped or rejected with a friendly `{ error }`;
   limits are enforced; the error copy says what *is* allowed.

## 8. Content (content/patterns.json and content/problems.json)

For each pattern, turn the entry into a `LivePattern` (see `content/types.ts`):

- `status: "live"`. Keep `number`, `slug`, `name`, `group`, `idea`, `problems` exactly as they are (approved copy).
- `analogy`: 2–3 short sentences, one concrete everyday image, ends on what it buys you. Match Sliding Window's
  "train window" in tone. Stack already has an approved analogy — keep it verbatim.
- `minutes`: 10–25, honest for reading + watching + stepping through.
- `needs`: 1–3 lowercase prerequisite concepts (e.g. `["arrays", "hash maps"]`).
- `complexity`: time complexity of the *visualized* reference solution, in the style `"O(n)"`, `"O(log n)"`, `"O(m·n)"`.
- `whenToUse`: exactly 3 bullets, ≤ 60 chars, sentence case, no trailing full stop — concrete signals in the
  problem statement (like "The answer is a contiguous run (subarray or substring)").
- `video`: `{ "src": "[EXPLAINER VIDEO URL]", "durationSec": 60, "captions": "[VTT URL]", "transcript": [...] }`
  with exactly 4 beats at `t` = 0, 15, 32, 48: (0) the problem + why brute force hurts, (15) the core idea,
  (32) the key move, (48) the payoff with the complexity, ending "That's the <pattern name>." or similar.
  Each beat ≤ 190 characters. The script must describe what the visualizer shows (same example input as the first preset).
- `visualizer`: the id from the pattern spec.
- In `problems.json`, give **every problem of the pattern** a `twist` (≤ 80 chars) like Sliding Window's:
  the visualized problem gets `"The one you just watched. Write it from memory."`; an easy warm-up starts `"Warm-up: "`;
  the others name the one change from the base pattern. Don't change titles, slugs, URLs or premium flags.
- Voice: short sentences, concrete, calm, no hype, no exclamation marks, no "simply"/"just"/"easy". British spelling
  (matches existing copy: "neighbours").

## 9. Other code to keep working

- `lib/continue-lesson.test.ts` uses `stack` as an example of a non-live pattern. Once everything is live, rewrite
  that case with a fixture pattern (don't depend on real data being "soon").
- Anything that says or counts "live now" is data-driven already; check the home, patterns, problems, progress
  and search pages still read well with 15 live lessons (e.g. no "1 of 15 live" style copy that now looks odd).
- `SoonLesson` stays in the codebase (future patterns), even if no pattern uses it now.

## 10. Process

- The content builder works on its own branch in its own worktree and commits per pattern, each message ending with the trailer
  `Generated-by: Muse Code 1.3 (muse-spark-1.3-contributor)`. Don't push. Don't touch `design/` or `CLAUDE.md`.
- Until the UI side lands, a pattern can't be registered (no View yet). The content builder's tests import `trace`/`parseInput`
  directly, so they don't need the registry.
- After each pattern: `npm run lint`, `npm run typecheck`, `npm test` must pass. After each batch also `npm run build`.
- If the spec is ambiguous or wrong (e.g. an expected answer looks off), don't silently change it: implement the
  closest faithful version and list the question in `docs/patterns/QUESTIONS.md`.
