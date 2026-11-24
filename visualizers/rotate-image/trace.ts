import { list } from "../kit/format";
import type { Step } from "../types";
import type { RotateInput, RotateState } from "./types";

/** Rotate clockwise in place: flip across the diagonal, then reverse every row. */
export function trace(input: RotateInput): Step<RotateState>[] {
  const matrix = input.map((row) => [...row]);
  const n = matrix.length;
  let swaps = 0;
  const steps: Step<RotateState>[] = [];
  const push = (
    phase: RotateState["phase"],
    pair: RotateState["pair"],
    row: number | null,
    lines: number[],
    note: string,
    sr: string,
  ) => {
    steps.push({ state: { matrix: matrix.map((r) => [...r]), pair, row, swaps, phase }, lines, note, sr });
  };
  const swap = (a: [number, number], b: [number, number]) => {
    [matrix[a[0]][a[1]], matrix[b[0]][b[1]]] = [matrix[b[0]][b[1]], matrix[a[0]][a[1]]];
    swaps++;
  };

  push("setup", null, null, [1], `A ${n} by ${n} grid. First flip it across the diagonal, then reverse each row.`, `${n} rows and ${n} columns.`);

  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const [x, y] = [matrix[i][j], matrix[j][i]];
      swap([i, j], [j, i]);
      push(
        "transpose",
        [[i, j], [j, i]],
        null,
        [4],
        `Swap ${x} and ${y} across the diagonal.`,
        `Swapped row ${i + 1}, column ${j + 1} (${x}) with row ${j + 1}, column ${i + 1} (${y}).`,
      );
    }
  }
  push("transpose", null, null, [7], "Diagonal flip done. Rows are now columns. Reverse each row.", "Transpose done.");

  for (let i = 0; i < n; i++) {
    let left = 0;
    let right = n - 1;
    while (left < right) {
      const [x, y] = [matrix[i][left], matrix[i][right]];
      swap([i, left], [i, right]);
      push(
        "flip",
        [[i, left], [i, right]],
        i,
        [10, 11, 12],
        `Row ${i + 1}: swap ${x} and ${y} from the two ends.`,
        `Row ${i + 1}: swapped column ${left + 1} (${x}) with column ${right + 1} (${y}).`,
      );
      left++;
      right--;
    }
  }

  push(
    "done",
    null,
    null,
    [12],
    "Done. The grid is turned 90° clockwise, using no second grid.",
    `Done. Rows: ${matrix.map((row) => list(row)).join(" ")}.`,
  );
  return steps;
}
