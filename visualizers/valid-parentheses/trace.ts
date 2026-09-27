import type { Step } from "../types";
import type { ParensInput, ParensState } from "./types";

const PAIRS: Record<string, string> = { ")": "(", "]": "[", "}": "{" };

/**
 * Traced Valid Parentheses (docs/patterns/04-stack.md): every opener waits
 * on the stack; every closer must match the plate on top. Pure and
 * deterministic — the same string always yields the same steps.
 *
 * On a mismatch the code's `stack.pop()` has already removed the top plate
 * (line 6 runs before the comparison fails), but the trace keeps the stack
 * intact for that step: the function returns immediately, so the pop is
 * unobservable — and the learner needs to see the plate that failed.
 */
export function trace(input: ParensInput): Step<ParensState>[] {
  const s = input;
  const out: Step<ParensState>[] = [];
  const stack: { ch: string; from: number }[] = [];
  const matched: number[] = [];
  const q = (ch: string): string => `‘${ch}’`;
  const stackSummary = (): string =>
    stack.length === 0
      ? "The stack is empty"
      : `Stack from bottom: ${stack.map((plate) => plate.ch).join(", ")}`;
  const push = (
    i: number,
    phase: ParensState["phase"],
    failedAt: number | null,
    verdict: boolean | null,
    lines: number[],
    note: string,
    sr: string,
  ) => {
    out.push({
      state: {
        s,
        i,
        stack: stack.map((plate) => ({ ...plate })),
        matched: [...matched],
        phase,
        failedAt,
        verdict,
      },
      lines,
      note,
      sr,
    });
  };

  push(
    -1,
    "setup",
    null,
    null,
    [1, 2],
    "Start with an empty stack.",
    `Starting out. ${s.length} ${s.length === 1 ? "bracket" : "brackets"} to read. The stack is empty.`,
  );
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (!(ch in PAIRS)) {
      stack.push({ ch, from: i });
      push(
        i,
        "push",
        null,
        null,
        [3, 4, 5],
        `${q(ch)} opens. Put it on top of the stack.`,
        `Reading position ${i}, ${q(ch)}. Opens, so push it. ${stackSummary()}.`,
      );
      continue;
    }
    const top = stack[stack.length - 1];
    if (top === undefined) {
      push(
        i,
        "empty",
        i,
        null,
        [6, 7],
        `${q(ch)} closes, but the stack is empty. Nothing to match.`,
        `Reading position ${i}, ${q(ch)}. The stack is empty. Nothing to match.`,
      );
      push(
        i,
        "done",
        i,
        false,
        [7],
        `Done. ${q(ch)} found an empty stack, so the string is invalid.`,
        `Done. Invalid: ${q(ch)} at position ${i} found an empty stack.`,
      );
      return out;
    }
    if (top.ch !== PAIRS[ch]) {
      push(
        i,
        "mismatch",
        i,
        null,
        [6, 7],
        `${q(ch)} closes, but the top is ${q(top.ch)}. Mismatch, so the string is invalid.`,
        `Reading position ${i}, ${q(ch)}. Top is ${q(top.ch)}. Mismatch.`,
      );
      push(
        i,
        "done",
        i,
        false,
        [7],
        `Done. ${q(ch)} met ${q(top.ch)}, so the string is invalid.`,
        `Done. Invalid: ${q(ch)} at position ${i} met ${q(top.ch)}.`,
      );
      return out;
    }
    stack.pop();
    matched.push(top.from, i);
    push(
      i,
      "match",
      null,
      null,
      [3, 6],
      `${q(ch)} closes, and the top is ${q(top.ch)}. They match, so take it off.`,
      `Reading position ${i}, ${q(ch)}. Top matches. ${stackSummary()}.`,
    );
  }
  const leftover = stack[stack.length - 1];
  if (leftover === undefined) {
    push(
      s.length - 1,
      "done",
      null,
      true,
      [10],
      "Done. The stack is empty, so every bracket found its partner.",
      "Done. Valid: the stack is empty, so every bracket found its partner.",
    );
  } else {
    push(
      s.length - 1,
      "done",
      null,
      false,
      [10],
      `Done. ${q(leftover.ch)} is still waiting, so it’s invalid.`,
      `Done. Invalid: ${q(leftover.ch)} never found its partner.`,
    );
  }
  return out;
}
