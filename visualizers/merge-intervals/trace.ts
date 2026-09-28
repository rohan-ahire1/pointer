import type { Step } from "../types";
import type { IntervalItem, MergeInput, MergeState } from "./types";

/**
 * Traced Merge Intervals (docs/patterns/15-intervals.md): sort the bars by
 * start, seed the merged list with the first, then walk once — each bar
 * either overlaps the last merged one and stretches it, or starts a new
 * one. Pure and deterministic.
 */
export function trace(input: MergeInput): Step<MergeState>[] {
  const out: Step<MergeState>[] = [];
  // items is re-sorted once; merged grows and stretches in place.
  const items: IntervalItem[] = input.map((item) => ({ ...item }));
  const merged: MergeState["merged"] = [];
  const outcomes: MergeState["outcomes"] = {};
  const push = (
    i: number | null,
    phase: MergeState["phase"],
    lines: number[],
    note: string,
    sr: string,
  ) => {
    out.push({
      state: {
        items: items.map((item) => ({ ...item })),
        i,
        merged: merged.map((entry) => ({ ...entry, from: [...entry.from] })),
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

  // Array.prototype.sort is stable, so equal starts keep their input order.
  const before = items.map((item) => item.id).join(",");
  items.sort((a, b) => a.start - b.start);
  const moved = items.map((item) => item.id).join(",") !== before;
  push(
    null,
    "sort",
    [1],
    moved ? "Sort them by where they start." : "Already sorted by start.",
    moved ? `Sorted by start: ${orderSr()}.` : `Already in start order: ${orderSr()}.`,
  );

  const first = items[0];
  merged.push({ start: first.start, end: first.end, from: [first.id] });
  outcomes[first.id] = "seed";
  push(
    0,
    "seed",
    [2],
    `The first one starts the merged list: ${show(first.start, first.end)}.`,
    `First interval ${say(first.start, first.end)} starts the merged list. Merged count 1.`,
  );

  for (let k = 1; k < items.length; k++) {
    const { id, start, end } = items[k];
    const last = merged[merged.length - 1];
    if (start <= last.end) {
      // Read the old end before stretching: the note names both.
      const grewFrom = show(last.start, last.end);
      const grewSay = say(last.start, last.end);
      const contained = end <= last.end;
      const touches = start === last.end;
      last.end = Math.max(last.end, end);
      last.from.push(id);
      outcomes[id] = "merged";
      const note = contained
        ? `[${start}, ${end}] sits inside ${grewFrom}, so nothing changes.`
        : touches
          ? `[${start}, ${end}] starts at ${start}, touching ${grewFrom}. Stretch it to ${show(last.start, last.end)}.`
          : `[${start}, ${end}] starts at ${start}, inside ${grewFrom}. Stretch it to ${show(last.start, last.end)}.`;
      const sr = contained
        ? `Looking at ${say(start, end)}, inside ${grewSay}. Nothing changes. Merged count ${merged.length}.`
        : `Looking at ${say(start, end)}, inside ${grewSay}. Stretched to ${say(last.start, last.end)}. Merged count ${merged.length}.`;
      push(k, "stretch", [3, 4, 5, 6, 7], note, sr);
    } else {
      merged.push({ start, end, from: [id] });
      outcomes[id] = "new";
      push(
        k,
        "new",
        [3, 4, 5, 6, 9],
        `[${start}, ${end}] starts after ${last.end}. Start a new merged interval.`,
        `Looking at ${say(start, end)}, which starts after ${last.end}. New merged interval. Merged count ${merged.length}.`,
      );
    }
  }

  const listed =
    merged.length <= 1
      ? merged.map((entry) => show(entry.start, entry.end)).join("")
      : `${merged
          .slice(0, -1)
          .map((entry) => show(entry.start, entry.end))
          .join(", ")} and ${show(merged[merged.length - 1].start, merged[merged.length - 1].end)}`;
  const doneNote =
    merged.length === 1
      ? `Done. 1 merged interval: ${listed}.`
      : `Done. ${merged.length} merged intervals: ${listed}.`;
  push(null, "done", [12], doneNote, doneNote);
  return out;
}
