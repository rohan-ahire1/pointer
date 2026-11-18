import type { Step } from "../types";
import type { Layer, RainInput, RainState } from "./types";

const units = (n: number) => `${n} ${n === 1 ? "unit" : "units"}`;

/**
 * A falling stack of bars. A taller bar pops the dip on top, and the bar under
 * that is the left wall, so each pop pours one flat layer of water between the
 * two walls. Each bar goes on and off once, so it's O(n) overall.
 */
export function trace(height: RainInput): Step<RainState>[] {
  const stack: number[] = [];
  const layers: Layer[] = [];
  let water = 0;
  let fresh: number | null = null;
  const steps: Step<RainState>[] = [];
  const push = (
    i: number,
    floor: number | null,
    left: number | null,
    phase: RainState["phase"],
    lines: number[],
    note: string,
    sr: string,
  ) => {
    steps.push({
      state: { height: [...height], stack: [...stack], i, floor, left, layers: layers.map((l) => ({ ...l })), fresh, water, phase },
      lines,
      note,
      sr,
    });
  };

  push(-1, null, null, "setup", [1, 2], "The stack holds bars that could still be the left wall of a pool.", `${height.length} bars. The stack is empty.`);
  for (let i = 0; i < height.length; i++) {
    const h = height[i];
    push(i, null, null, "read", [3, 4], `Bar ${i} is ${h} tall. Is it taller than the bar on top of the stack?`, `Bar ${i}, height ${h}. Stack holds ${stack.length} bars.`);
    while (stack.length > 0 && h > height[stack[stack.length - 1]]) {
      const floor = stack.pop() as number;
      if (stack.length === 0) {
        push(i, floor, null, "runoff", [5, 6], `Pop bar ${floor}. Nothing on its left can hold water, so it runs off.`, `Bar ${floor} popped. No left wall.`);
        break;
      }
      const left = stack[stack.length - 1];
      const top = Math.min(height[left], h);
      const depth = top - height[floor];
      const width = i - left - 1;
      water += depth * width;
      if (depth > 0) layers.push({ from: left + 1, to: i - 1, base: height[floor], top });
      fresh = depth > 0 ? layers.length - 1 : null;
      push(
        i,
        floor,
        left,
        "fill",
        [5, 7, 8, 9],
        depth > 0
          ? `Pop bar ${floor}. Walls ${left} and ${i} hold ${depth} deep × ${width} wide = ${units(depth * width)}.`
          : `Pop bar ${floor}. Wall ${left} is the same height, so no water sits on bar ${floor}.`,
        `Bar ${floor} popped, walls ${left} and ${i}. Added ${depth * width}. Water is ${water}.`,
      );
      fresh = null;
    }
    stack.push(i);
    push(i, null, null, "push", [11], `Bar ${i} goes on the stack. It could be the left wall of a later pool.`, `Bar ${i} pushed. Stack holds ${stack.length} bars.`);
  }
  push(-1, null, null, "done", [13], `Done. ${water === 1 ? "1 unit of water is" : `${water} units of water are`} trapped.`, `Done. The answer is ${water}.`);
  return steps;
}
