import type { Step } from "../types";
import type { ReverseInput, ReverseState } from "./types";

/**
 * Traced Reverse Linked List (docs/patterns/06-linked-list.md): the nodes
 * never move — only the arrows flip, one at a time, and the rest of the
 * list is held in `next` before each cut. Pure and deterministic — the
 * same values always yield the same steps.
 */
export function trace(input: ReverseInput): Step<ReverseState>[] {
  const values = [...input];
  const out: Step<ReverseState>[] = [];
  const next: (number | null)[] = values.map((_, k) => (k + 1 < values.length ? k + 1 : null));
  let prev: number | null = null;
  let curr: number | null = 0;
  let nxt: number | null = null;
  const reversed: number[] = [];
  /** A pointer shown by the value it points at, or "nothing" for null. */
  const shown = (at: number | null): string => (at === null ? "nothing" : `${values[at]}`);
  const push = (
    phase: ReverseState["phase"],
    flipping: number | null,
    lines: number[],
    note: string,
    sr: string,
  ) => {
    out.push({
      state: {
        values: [...values],
        next: [...next],
        prev,
        curr,
        nxt,
        phase,
        flipping,
        reversed: [...reversed],
      },
      lines,
      note,
      sr,
    });
  };

  push(
    "setup",
    null,
    [1, 2],
    `prev starts at nothing, curr at the head, ${values[0]}.`,
    `Starting out. List: ${values.join(", ")}. prev at nothing, curr at ${values[0]}.`,
  );
  while (curr !== null) {
    nxt = next[curr];
    push(
      "save",
      null,
      [3, 4],
      nxt === null
        ? `Hold on to the rest of the list first: nothing comes after ${values[curr]}.`
        : `Hold on to the rest of the list first: next is ${values[nxt]}.`,
      `Saving next before the cut. prev at ${shown(prev)}, curr at ${shown(curr)}, next at ${shown(nxt)}.`,
    );
    next[curr] = prev;
    const flipping = curr;
    reversed.push(curr);
    push(
      "flip",
      flipping,
      [5],
      prev === null
        ? `Point ${values[flipping]} at nothing. That arrow now runs the other way.`
        : `Point ${values[flipping]} back at ${values[prev]}. That arrow now runs the other way.`,
      `Flipping ${values[flipping]}’s arrow. Reversed so far: ${reversed.map((k) => values[k]).join(", ")}.`,
    );
    prev = curr;
    curr = nxt;
    push(
      "advance",
      null,
      [6, 7],
      curr === null
        ? `Step forward: prev is ${values[prev]}, and curr falls off the end.`
        : `Step forward: prev is ${values[prev]}, curr is ${values[curr]}.`,
      `Stepping forward. prev at ${shown(prev)}, curr at ${shown(curr)}.`,
    );
  }
  const chain: number[] = [];
  for (let at = prev; at !== null; at = next[at]) {
    chain.push(values[at]);
  }
  push(
    "done",
    null,
    [9],
    `Done. prev is the new head: ${chain.join(" → ")}.`,
    `Done. New head is ${chain[0]}. Reversed list: ${chain.join(", ")}.`,
  );
  return out;
}
