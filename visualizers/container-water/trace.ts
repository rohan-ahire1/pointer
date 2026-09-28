import type { Step } from "../types";
import type { ContainerInput, ContainerState } from "./types";

/**
 * Traced Container With Most Water (docs/patterns/02-two-pointers.md):
 * start with the widest container, measure it, then move the shorter wall
 * inward. Pure and deterministic — the same heights always yield the same
 * steps. A move step shows the pair *before* the move, with `moving` naming
 * the wall that is about to step inward.
 */
export function trace(input: ContainerInput): Step<ContainerState>[] {
  const height = [...input];
  const out: Step<ContainerState>[] = [];
  let left = 0;
  let right = height.length - 1;
  let best = 0;
  let bestPair: [number, number] | null = null;
  const push = (
    phase: ContainerState["phase"],
    h: number | null,
    area: number | null,
    newBest: boolean,
    moving: ContainerState["moving"],
    lines: number[],
    note: string,
    sr: string,
  ) => {
    out.push({
      state: {
        height: [...height],
        left,
        right,
        phase,
        h,
        area,
        best,
        bestPair: bestPair === null ? null : [bestPair[0], bestPair[1]],
        newBest,
        moving,
      },
      lines,
      note,
      sr,
    });
  };

  push(
    "setup",
    null,
    null,
    false,
    null,
    [1, 2],
    "Start with the widest container: the first and last walls.",
    `Starting out. ${height.length} walls. Widest container first: wall 0 and wall ${height.length - 1}.`,
  );
  while (left < right) {
    const h = Math.min(height[left], height[right]);
    const area = h * (right - left);
    const newBest = area > best;
    if (newBest) {
      best = area;
      bestPair = [left, right];
    }
    push(
      "measure",
      h,
      area,
      newBest,
      null,
      [3, 4, 5],
      `Walls ${height[left]} and ${height[right]}, ${right - left} apart. Water fills to ${h}, so the area is ${area}. Best so far ${best}.`,
      `Left wall at ${left}, height ${height[left]}. Right wall at ${right}, height ${height[right]}. Width ${right - left}, water ${h} high, area ${area}. Best ${best}.`,
    );
    if (height[left] < height[right]) {
      push(
        "move",
        h,
        area,
        false,
        "left",
        [6],
        "The left wall is shorter, so move it in. Moving the taller one can never do better.",
        `The left wall is shorter. Moving it in from ${left}. Best so far ${best}.`,
      );
      left++;
    } else {
      const note =
        height[left] === height[right]
          ? `Both walls are ${height[left]}. Move the right one in.`
          : "The right wall is shorter, so move it in. Moving the taller one can never do better.";
      push(
        "move",
        h,
        area,
        false,
        "right",
        [7],
        note,
        `Moving the right wall in from ${right}. Best so far ${best}.`,
      );
      right--;
    }
  }
  push(
    "done",
    null,
    null,
    false,
    null,
    [9],
    `Done. The biggest container holds ${best}.`,
    bestPair === null
      ? `Done. The biggest container holds ${best}.`
      : `Done. The biggest container holds ${best}, walls ${bestPair[0]} and ${bestPair[1]}.`,
  );
  return out;
}
