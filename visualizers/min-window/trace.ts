import { q, qq } from "../kit/format";
import type { Step } from "../types";
import type { MinWindowInput, MinWindowState } from "./types";

/** Grow the right edge until the window covers t, then shrink the left edge while it still does. */
export function trace({ s, t }: MinWindowInput): Step<MinWindowState>[] {
  const need = new Map<string, number>();
  for (const ch of t) need.set(ch, (need.get(ch) ?? 0) + 1);
  let missing = need.size;
  let left = 0;
  let best: MinWindowState["best"] = null;
  const steps: Step<MinWindowState>[] = [];
  const push = (right: number, phase: MinWindowState["phase"], lines: number[], note: string, sr: string) => {
    steps.push({
      state: {
        s,
        t,
        left,
        right,
        need: [...need].map(([ch, count]) => ({ ch, count })),
        missing,
        best,
        phase,
      },
      lines,
      note,
      sr,
    });
  };
  const bestText = () => (best ? s.slice(best.start, best.end + 1) : "");

  push(-1, "setup", [1, 2, 3], `Count what the window has to cover: ${qq(t)}.`, `Need to cover ${t} inside ${s}.`);

  for (let right = 0; right < s.length; right++) {
    const ch = s[right];
    if (need.has(ch)) {
      need.set(ch, need.get(ch)! - 1);
      const covered = need.get(ch) === 0;
      if (covered) missing--;
      push(
        right,
        "grow",
        covered ? [5, 7, 8] : [5, 7],
        covered ? `${q(ch)} is covered now. ${missing} ${missing === 1 ? "letter" : "letters"} still missing.` : `${q(ch)} counts toward what’s needed.`,
        `Right edge at ${right}, letter ${ch}. ${missing} still missing.`,
      );
    } else {
      push(right, "grow", [4, 5, 6], `${q(ch)} isn’t needed. Keep growing.`, `Right edge at ${right}, letter ${ch}, not needed.`);
    }
    while (missing === 0) {
      const size = right - left + 1;
      const shorter = best === null || size < best.end - best.start + 1;
      if (shorter) best = { start: left, end: right };
      push(
        right,
        "record",
        [10, 11],
        shorter ? `Everything’s covered. ${qq(s.slice(left, right + 1))} is the shortest so far.` : `Everything’s covered, but ${qq(bestText())} is still shorter.`,
        `Window ${left} to ${right} covers everything. Best is ${bestText()}.`,
      );
      const out = s[left++];
      if (need.has(out)) {
        if (need.get(out) === 0) missing++;
        need.set(out, need.get(out)! + 1);
      }
      push(
        right,
        "shrink",
        need.has(out) ? [12, 14, 15] : [12, 13],
        missing > 0 ? `Dropping ${q(out)} breaks the cover. Grow again.` : `Dropping ${q(out)} costs nothing. Keep shrinking.`,
        `Left edge moves to ${left}. ${missing} missing.`,
      );
    }
  }

  push(
    s.length - 1,
    "done",
    [19],
    best ? `Done. The shortest window is ${qq(bestText())}.` : `Done. No window covers ${qq(t)}.`,
    best ? `Done. The answer is ${bestText()}.` : "Done. No window works.",
  );
  return steps;
}
