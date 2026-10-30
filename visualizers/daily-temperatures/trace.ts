import { list } from "../kit/format";
import type { Step } from "../types";
import type { TemperaturesInput, TemperaturesState } from "./types";

/**
 * A monotonic stack: days wait on the stack, coldest on top, until a warmer day
 * arrives and answers them. Each day goes on and off once, so it's O(n) overall.
 */
export function trace(temps: TemperaturesInput): Step<TemperaturesState>[] {
  const out = temps.map(() => 0);
  const stack: number[] = [];
  const steps: Step<TemperaturesState>[] = [];
  const push = (
    i: number,
    popped: number | null,
    phase: TemperaturesState["phase"],
    lines: number[],
    note: string,
    sr: string,
  ) => {
    steps.push({ state: { temps: [...temps], out: [...out], stack: [...stack], i, popped, phase }, lines, note, sr });
  };

  push(-1, null, "setup", [1, 2], "The stack holds days still waiting for a warmer one.", `${temps.length} days. The stack is empty.`);
  for (let i = 0; i < temps.length; i++) {
    push(i, null, "read", [3, 4], `Day ${i} is ${temps[i]}°. Is it warmer than the day on top of the stack?`, `Day ${i}, ${temps[i]} degrees. Stack holds ${stack.length} days.`);
    while (stack.length > 0 && temps[i] > temps[stack[stack.length - 1]]) {
      const day = stack.pop() as number;
      out[day] = i - day;
      push(i, day, "pop", [4, 5, 6], `${temps[i]}° beats ${temps[day]}°. Day ${day} waited ${i - day} ${i - day === 1 ? "day" : "days"}.`, `Day ${day} answered: wait ${i - day}.`);
    }
    stack.push(i);
    push(i, null, "push", [8], `Day ${i} goes on the stack to wait for its own warmer day.`, `Day ${i} pushed. Stack holds ${stack.length} days.`);
  }
  push(-1, null, "done", [10], `Done. Anything still on the stack never gets warmer, so it stays 0.`, `Done. The answer is ${list(out)}.`);
  return steps;
}
