# Visualizer spec

The visualizer is the heart of Pointer. It runs the real algorithm once, records every meaningful moment as a **step**, then plays those steps back. The same steps can later drive the explainer videos, so the site and the videos always agree.

## Shape

```ts
export type Step<S> = {
  state: S;            // everything the view needs to draw this moment
  lines: number[];     // 0-based lines of the solution to highlight
  note: string;        // plain-English narration shown in the bubble
  sr: string;          // extra screen-reader summary, e.g. "Step 9 of 22. Window is "bca". Best so far 3."
};

export type Visualizer<I, S> = {
  id: string;                          // matches pattern.visualizer in patterns.json
  title: string;                       // e.g. "Longest Substring Without Repeating Characters"
  code: string[];                      // TypeScript solution, one entry per line
  parseInput(raw: string): I | { error: string };
  presets: string[];                   // example inputs shown as chips
  trace(input: I): Step<S>[];          // pure and deterministic — unit test this
  View: React.ComponentType<{ step: Step<S>; input: I }>;
};
```

The shared `<VisualizerPlayer>` owns everything else: input field (with label, hint and validation), presets, Back / Step / Play-Pause / Reset, speed (0.5×, 1×, 2× → 1800 / 900 / 450 ms per step), keyboard (← → Space R on the focused region; ignore keys while typing in the input or when Space/Enter lands on a button), the step counter, the narration bubble (`aria-live="polite"`, turned off while autoplaying), and the code panel with a ▶ marker plus highlight on `lines`.

## Reference: Sliding Window (longest substring without repeating characters)

```ts
type SWState = { s: string; l: number; r: number; incl: boolean; seen: string[]; best: number };

export function trace(s: string): Step<SWState>[] {
  const out: Step<SWState>[] = [];
  const seen: string[] = [];
  let l = 0, best = 0;
  const q = (c: string) => `‘${c}’`;
  const push = (r: number, incl: boolean, lines: number[], note: string) => {
    const win = r < 0 ? '' : s.slice(l, incl ? r + 1 : r);
    out.push({ state: { s, l, r, incl, seen: [...seen], best }, lines, note,
      sr: r < 0 ? '' : `Left edge at ${l}, right edge at ${r}. Window is "${win}". Best so far ${best}.` });
  };
  push(-1, false, [1, 2], 'Start with an empty window and an empty set.');
  for (let r = 0; r < s.length; r++) {
    push(r, false, [4, 5], `The right edge reaches ${q(s[r])}. Is it already in the window?`);
    while (seen.includes(s[r])) {
      const ch = s[l];
      seen.splice(seen.indexOf(ch), 1);
      l++;
      push(r, false, [6, 7], `Yes, it repeats. Move the left edge past ${q(ch)}.`);
    }
    seen.push(s[r]);
    best = Math.max(best, r - l + 1);
    push(r, true, [9, 10], `Add ${q(s[r])}. The window “${s.slice(l, r + 1)}” is ${r - l + 1} long.`);
  }
  push(s.length - 1, true, [12], `Done. The longest window without a repeat is ${best} long.`);
  return out;
}
```

Solution shown in the code panel (line numbers are what `lines` refers to):
```ts
function longest(s: string): number {        // 0
  const seen = new Set<string>();            // 1
  let left = 0, best = 0;                    // 2
                                             // 3
  for (let r = 0; r < s.length; r++) {       // 4
    while (seen.has(s[r])) {                 // 5
      seen.delete(s[left]);                  // 6
      left++;                                // 7
    }                                        // 8
    seen.add(s[r]);                          // 9
    best = Math.max(best, r - left + 1);     // 10
  }                                          // 11
  return best;                               // 12
}                                            // 13
```

Input rules: lowercase a–z only, max 10 characters (anything else is stripped); presets `abcabcbb`, `bbbbb`, `pwwkew`. Expected results: 3, 1, 3 — put these in the unit tests along with the step counts: 25 for `abcabcbb`, 16 for `bbbbb`, 17 for `pwwkew`.

## View (cell states)
- **Waiting** — card background, solid border.
- **In window** — sits inside the yellow window capsule (`--tint-yellow`, 2.5px border, radius 18) that spans `l..r` (or `l..r-1` when `incl` is false).
- **Incoming** (`r` when not yet included) — `--orange` fill, text `--on-accent`, lifted 8px.
- **Left behind** (index < `l`) — `--past-bg` fill, **dashed** `--past-line` border, `--faint` text.
- Pointer tags under the cells: `L` (inverse chip) and `R` (orange chip).
- Stats row: window, seen, best so far.

## Motion
Capsule slides between positions over `--dur-slow` with ease-in-out; the incoming cell lifts over `--dur-base`; the narration crossfades. With reduced motion, everything switches instantly.
