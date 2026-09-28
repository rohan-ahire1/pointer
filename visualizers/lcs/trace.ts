import type { Step } from "../types";
import type { LcsInput, LcsState } from "./types";

/**
 * Traced Longest Common Subsequence (docs/patterns/13-2-d-dp.md): fill a
 * table one cell at a time — a match takes the diagonal plus one, anything
 * else carries the bigger of up and left — then walk back from the corner
 * through the matches to read the subsequence. Pure and deterministic.
 */
export function trace(input: LcsInput): Step<LcsState>[] {
  const { a, b } = input;
  const out: Step<LcsState>[] = [];
  // Zero row and column are filled from setup; the rest fill cell by cell.
  const dp: (number | null)[][] = Array.from({ length: a.length + 1 }, (_, r) =>
    Array.from({ length: b.length + 1 }, (_, c) => (r === 0 || c === 0 ? 0 : null)),
  );
  const push = (
    i: number | null,
    j: number | null,
    kind: LcsState["kind"],
    from: LcsState["from"],
    path: [number, number][] | null,
    subsequence: string | null,
    phase: LcsState["phase"],
    lines: number[],
    note: string,
    sr: string,
  ) => {
    out.push({
      state: {
        a,
        b,
        dp: dp.map((row) => [...row]),
        i,
        j,
        kind,
        from,
        path: path === null ? null : path.map(([r, c]) => [r, c] as [number, number]),
        subsequence,
        phase,
      },
      lines,
      note,
      sr,
    });
  };

  const q = (c: string) => `‘${c}’`;
  const qq = (s: string) => `“${s}”`;
  const rowSr = (i: number, j: number): string =>
    `Row so far: ${dp[i].slice(0, j + 1).join(", ")}.`;

  push(
    null,
    null,
    null,
    null,
    null,
    null,
    "setup",
    [1, 2],
    "Make a table with a row of zeros on top and a column of zeros down the left.",
    `${qq(a)} down the side, ${qq(b)} across the top. Zero row and column ready. Nothing filled yet.`,
  );

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const x = a[i - 1];
      const y = b[j - 1];
      if (x === y) {
        dp[i][j] = (dp[i - 1][j - 1] as number) + 1;
        push(
          i,
          j,
          "match",
          "diag",
          null,
          null,
          "fill",
          [3, 4, 5, 6],
          `${q(x)} = ${q(y)}. Take the diagonal and add one: ${dp[i][j]}.`,
          `Row ${q(x)}, column ${q(y)}: match. Diagonal ${dp[i - 1][j - 1]}, so this cell is ${dp[i][j]}. ${rowSr(i, j)}`,
        );
      } else {
        const up = dp[i - 1][j] as number;
        const left = dp[i][j - 1] as number;
        dp[i][j] = Math.max(up, left);
        // Ties follow Math.max's first argument: up.
        const from = up >= left ? "up" : "left";
        push(
          i,
          j,
          "carry",
          from,
          null,
          null,
          "fill",
          [3, 4, 5, 8],
          `${q(x)} ≠ ${q(y)}. Carry the bigger of up (${up}) and left (${left}): ${dp[i][j]}.`,
          `Row ${q(x)}, column ${q(y)}: no match. Up ${up}, left ${left}, so this cell is ${dp[i][j]}. ${rowSr(i, j)}`,
        );
      }
    }
  }

  // Walk back from the corner, collecting matches into the subsequence.
  const path: [number, number][] = [];
  const letters: string[] = [];
  let i = a.length;
  let j = b.length;
  while (i > 0 && j > 0) {
    path.push([i, j]);
    if (a[i - 1] === b[j - 1]) {
      letters.unshift(a[i - 1]);
      i--;
      j--;
    } else if ((dp[i - 1][j] as number) >= (dp[i][j - 1] as number)) {
      i--;
    } else {
      j--;
    }
  }
  path.push([i, j]);
  const subsequence = letters.join("");
  const length = dp[a.length][b.length] as number;

  push(
    null,
    null,
    null,
    null,
    path,
    subsequence,
    "traceback",
    [12],
    subsequence === ""
      ? "Walk back from the corner. Nothing matches, so the subsequence is empty."
      : `Walk back from the corner through the matches to read the subsequence: ${qq(subsequence)}.`,
    subsequence === ""
      ? "Walking back from the corner. Nothing matches."
      : `Walking back from the corner through the matches. Subsequence ${qq(subsequence)}, length ${length}.`,
  );

  const doneNote =
    subsequence === ""
      ? "Done. The two words have nothing in common. The length is 0."
      : `Done. The longest common subsequence has length ${length}: ${qq(subsequence)}.`;
  push(null, null, null, null, path, subsequence, "done", [12], doneNote, doneNote);
  return out;
}
