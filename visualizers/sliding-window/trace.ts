import type { Step } from "../types";

/**
 * Everything the view needs to draw one moment of the longest-substring-
 * without-repeating-characters sliding window: the full input string plus
 * the current left/right edges, whether the right edge is included in the
 * window yet, the characters currently "seen", and the best length found
 * so far.
 */
export type SWState = {
  s: string;
  l: number;
  r: number;
  incl: boolean;
  seen: string[];
  best: number;
};

/**
 * Reference implementation, straight from design/visualizer-spec.md. Pure
 * and deterministic: the same `s` always produces the same steps, so it can
 * later also drive the explainer video without the two ever disagreeing.
 */
export function trace(s: string): Step<SWState>[] {
  const out: Step<SWState>[] = [];
  const seen: string[] = [];
  let l = 0;
  let best = 0;
  const q = (c: string) => `‘${c}’`;
  const push = (r: number, incl: boolean, lines: number[], note: string) => {
    const win = r < 0 ? "" : s.slice(l, incl ? r + 1 : r);
    out.push({
      state: { s, l, r, incl, seen: [...seen], best },
      lines,
      note,
      sr: r < 0 ? "" : `Left edge at ${l}, right edge at ${r}. Window is "${win}". Best so far ${best}.`,
    });
  };
  push(-1, false, [1, 2], "Start with an empty window and an empty set.");
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
