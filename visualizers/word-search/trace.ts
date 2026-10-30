import { q, qq } from "../kit/format";
import type { Step } from "../types";
import type { Spot, WordSearchInput, WordSearchState } from "./types";

const DIRECTIONS: readonly Spot[] = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
];

/** Every board gets through in this many steps or the parser asks for something smaller. */
export const MAX_STEPS = 160;

/**
 * Walk the board letter by letter, marking cells used, and undo the mark on the
 * way back. Calls that fail on the first check aren't steps of their own: the
 * interesting moments are a match, a dead end, and a new starting cell.
 */
export function trace({ board, word }: WordSearchInput): Step<WordSearchState>[] {
  const steps: Step<WordSearchState>[] = [];
  const path: Spot[] = [];
  const starts: Spot[] = [];
  const used = board.map((row) => row.map(() => false));
  const push = (
    dead: Spot | null,
    found: boolean | null,
    phase: WordSearchState["phase"],
    lines: number[],
    note: string,
    sr: string,
  ) => {
    steps.push({ state: { board, word, path: [...path], dead, starts: [...starts], found, phase }, lines, note, sr });
  };

  const dfs = (r: number, c: number, i: number): boolean => {
    path.push([r, c]);
    used[r][c] = true;
    const sofar = word.slice(0, i + 1);
    if (i === 0) {
      starts.push([r, c]);
      push(null, null, "start", [13, 3], `Start here: ${q(board[r][c])} is the first letter.`, `Starting at row ${r}, column ${c}.`);
    } else {
      push(null, null, "match", [4, 5, 6], `${q(board[r][c])} matches. So far: ${qq(sofar)}.`, `Row ${r}, column ${c} matches. Path spells ${sofar}.`);
    }
    if (i === word.length - 1) {
      push(null, true, "found", [2], `That’s every letter of ${qq(word)}.`, "All letters matched.");
      return true;
    }
    for (const [dr, dc] of DIRECTIONS) {
      const nr = r + dr;
      const nc = c + dc;
      if (board[nr]?.[nc] === word[i + 1] && !used[nr][nc] && dfs(nr, nc, i + 1)) return true;
    }
    path.pop();
    used[r][c] = false;
    push([r, c], null, "back", [8, 9], `No neighbor gives ${q(word[i + 1])}. Give ${q(board[r][c])} back and step back.`, `Dead end at row ${r}, column ${c}. Stepped back.`);
    return false;
  };

  push(null, null, "setup", [11, 12], `Look for ${qq(word)}, moving up, down, left or right.`, `Searching a ${board.length} by ${board[0].length} board for ${word}.`);

  for (let r = 0; r < board.length; r++) {
    for (let c = 0; c < board[0].length; c++) {
      if (board[r][c] === word[0] && dfs(r, c, 0)) {
        push(null, true, "done", [13], `Done. ${qq(word)} is on the board.`, `Done. Found ${word}.`);
        return steps;
      }
    }
  }
  push(null, false, "done", [16], `Done. No path spells ${qq(word)}.`, `Done. ${word} is not on the board.`);
  return steps;
}
