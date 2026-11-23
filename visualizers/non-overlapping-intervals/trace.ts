import type { Step } from "../types";
import type { IntervalItem, NonOverlappingInput, NonOverlappingState } from "./types";

/**
 * Traced Non-overlapping Intervals: sort the bars by where they end, keep
 * the first (it ends earliest, so it leaves the most room), then walk once.
 * A bar that starts at or after the last kept end is kept; any other bar
 * overlaps it and is removed. Pure and deterministic.
 */
export function trace(input: NonOverlappingInput): Step<NonOverlappingState>[] {
  const out: Step<NonOverlappingState>[] = [];
  // items is re-sorted once; the rest grows as the walk goes.
  const items: IntervalItem[] = input.map((item) => ({ ...item }));
  const kept: number[] = [];
  const outcomes: NonOverlappingState["outcomes"] = {};
  let lastEnd: number | null = null;
  let removed = 0;
  const push = (
    i: number | null,
    phase: NonOverlappingState["phase"],
    lines: number[],
    note: string,
    sr: string,
  ) => {
    out.push({
      state: {
        items: items.map((item) => ({ ...item })),
        i,
        lastEnd,
        kept: [...kept],
        removed,
        phase,
        outcomes: { ...outcomes },
      },
      lines,
      note,
      sr,
    });
  };

  const show = (start: number, end: number): string => `[${start}, ${end}]`;
  const say = (start: number, end: number): string => `${start} to ${end}`;
  const orderSr = (): string => items.map((item) => say(item.start, item.end)).join(", ");

  const plural = items.length === 1 ? "interval" : "intervals";
  push(
    null,
    "setup",
    [0],
    "Here are the intervals as bars on a number line.",
    `${items.length} ${plural} on a 0 to 20 line: ${orderSr()}. Not sorted yet.`,
  );

  // Array.prototype.sort is stable, so equal ends keep their input order.
  const before = items.map((item) => item.id).join(",");
  items.sort((a, b) => a.end - b.end);
  const moved = items.map((item) => item.id).join(",") !== before;
  push(
    null,
    "sort",
    [1],
    moved ? "Sort them by where they end." : "Already sorted by end.",
    moved ? `Sorted by end: ${orderSr()}.` : `Already in end order: ${orderSr()}.`,
  );

  const first = items[0];
  kept.push(first.id);
  outcomes[first.id] = "seed";
  lastEnd = first.end;
  push(
    0,
    "seed",
    [2, 3],
    `Keep the first one, it ends earliest. Last end is ${first.end}. Removed: 0.`,
    `Keeping ${say(first.start, first.end)}, which ends first. Last end ${first.end}. Removed 0.`,
  );

  for (let k = 1; k < items.length; k++) {
    const { id, start, end } = items[k];
    const prevEnd = lastEnd ?? 0;
    if (start >= prevEnd) {
      kept.push(id);
      outcomes[id] = "kept";
      lastEnd = end;
      const touches = start === prevEnd;
      push(
        k,
        "keep",
        [4, 5, 6, 7],
        `${show(start, end)} starts at ${start}, ${touches ? "right at" : "after"} ${prevEnd}. Keep it. Last end is now ${end}.`,
        `Looking at ${say(start, end)}, which starts ${touches ? "at" : "after"} the last end ${prevEnd}. Kept. Last end ${end}. Removed ${removed}.`,
      );
    } else {
      removed++;
      outcomes[id] = "removed";
      push(
        k,
        "remove",
        [4, 5, 6, 9],
        `${show(start, end)} starts at ${start}, before ${prevEnd}. It overlaps, so remove it. Removed: ${removed}.`,
        `Looking at ${say(start, end)}, which starts before the last end ${prevEnd}. Overlap, so removed. Removed ${removed}.`,
      );
    }
  }

  const doneNote =
    removed === 0
      ? "Done. Nothing overlaps, so remove 0 intervals."
      : `Done. Remove ${removed} ${removed === 1 ? "interval" : "intervals"} and the rest don’t overlap.`;
  push(null, "done", [12], doneNote, doneNote);
  return out;
}
