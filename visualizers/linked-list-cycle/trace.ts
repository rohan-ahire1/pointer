import type { Step } from "../types";
import type { CycleInput, CycleState } from "./types";

/** Floyd's check: one pointer moves one node, the other two. In a loop the fast one laps the slow one. */
export function trace({ values, pos }: CycleInput): Step<CycleState>[] {
  const last = values.length - 1;
  const next = (node: number): number | null => (node < last ? node + 1 : pos >= 0 ? pos : null);
  const steps: Step<CycleState>[] = [];
  let slow: number | null = 0;
  let fast: number | null = 0;
  let moves = 0;
  const push = (
    hasCycle: boolean | null,
    phase: CycleState["phase"],
    lines: number[],
    note: string,
    sr: string,
  ) => {
    steps.push({ state: { values, pos, slow, fast, moves, hasCycle, phase }, lines, note, sr });
  };
  const nameOf = (node: number | null) => (node === null ? "the end" : `node ${values[node]}`);

  push(null, "setup", [1], "Two pointers start at the head. One walks, the other runs.", `Slow and fast both start at node ${values[0]}.`);

  while (fast !== null && next(fast) !== null) {
    moves++;
    slow = next(slow as number);
    push(null, "slow", [2, 3], `Slow moves one node, to ${nameOf(slow)}.`, `Move ${moves}. Slow at ${nameOf(slow)}.`);
    const nextFast: number = next(fast) as number;
    fast = next(nextFast);
    if (fast !== null && fast === slow) {
      push(null, "fast", [4, 5], `Fast moves two nodes, onto slow at ${nameOf(fast)}.`, `Move ${moves}. Fast at ${nameOf(fast)}.`);
      push(true, "meet", [5], "They’re on the same node. Only a loop lets fast catch slow.", "The pointers met.");
      push(true, "done", [5], "Done. The pointers met, so the list has a cycle.", "Done. The list has a cycle.");
      return steps;
    }
    push(null, "fast", [4, 5], `Fast moves two nodes, to ${nameOf(fast)}. They haven’t met.`, `Move ${moves}. Fast at ${nameOf(fast)}.`);
  }

  push(false, "end", [2], "Fast has nowhere left to go, so the list has an end.", "Fast reached the end.");
  push(false, "done", [7], "Done. Fast reached the end, so there’s no cycle.", "Done. The list has no cycle.");
  return steps;
}
