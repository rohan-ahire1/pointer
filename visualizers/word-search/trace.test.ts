import { describe, expect, it } from "vitest";
import { expectWellFormed, mustParse, seeded } from "../kit/test-helpers";
import { code } from "./code";
import { meta } from "./meta";
import { parseInput } from "./parseInput";
import { MAX_STEPS, trace } from "./trace";

function bruteForce(board: string[][], word: string): boolean {
  const used = board.map((row) => row.map(() => false));
  const dfs = (r: number, c: number, i: number): boolean => {
    if (i === word.length) return true;
    if (board[r]?.[c] !== word[i] || used[r][c]) return false;
    used[r][c] = true;
    const ok = dfs(r + 1, c, i + 1) || dfs(r - 1, c, i + 1) || dfs(r, c + 1, i + 1) || dfs(r, c - 1, i + 1);
    used[r][c] = false;
    return ok;
  };
  return board.some((row, r) => row.some((_, c) => dfs(r, c, 0)));
}

const answer = (raw: string) => {
  const steps = trace(mustParse(parseInput, raw));
  return steps[steps.length - 1].state.found;
};

describe("word-search", () => {
  it("matches the worked examples", () => {
    expect(answer("ABCE SFCS ADEE | ABCCED")).toBe(true);
    expect(answer("ABCE SFCS ADEE | SEE")).toBe(true);
    expect(answer("ABCE SFCS ADEE | ABCB")).toBe(false);
  });

  it("every preset is well formed", () => {
    for (const preset of meta.presets) expectWellFormed(trace(mustParse(parseInput, preset)), code);
  });

  it("matches brute force on 300 random boards", () => {
    const int = seeded(20261038);
    for (let k = 0; k < 300; k++) {
      const rows = int(1, 4);
      const cols = int(1, 5);
      const board = Array.from({ length: rows }, () => Array.from({ length: cols }, () => "ABC"[int(0, 2)]));
      const word = Array.from({ length: int(1, 6) }, () => "ABC"[int(0, 2)]).join("");
      const steps = trace({ board, word });
      expectWellFormed(steps, code, Infinity);
      expect(steps[steps.length - 1].state.found).toBe(bruteForce(board, word));
    }
  });

  it("won’t accept a board too slow to step through", () => {
    const parsed = parseInput("AAAAA AAAAA AAAAA AAAAA | AAAAAB");
    expect(parsed).toHaveProperty("error");
    expect(MAX_STEPS).toBeGreaterThan(0);
  });

  it("rejects bad input", () => {
    expect(parseInput("ABC")).toHaveProperty("error");
    expect(parseInput("AB C | A")).toHaveProperty("error");
    expect(parseInput("A1 | A")).toHaveProperty("error");
    expect(parseInput("AB CD | ABCDEFG")).toHaveProperty("error");
  });
});
