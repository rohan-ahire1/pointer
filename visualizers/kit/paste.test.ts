import { describe, expect, it } from "vitest";
import { visualizers } from "../index";

// LeetCode-style pastes, one per visualizer that takes them.
const cases: [id: string, raw: string, spaced: string][] = [
  ["two-sum-hash-map", "[2,7,11,15] | 9", "2 7 11 15 | 9"],
  ["container-with-most-water", "[1,8,6,2,5,4,8,3,7]", "1 8 6 2 5 4 8 3 7"],
  ["find-min-rotated", "[4,5,6,7,0,1,2]", "4 5 6 7 0 1 2"],
  ["reverse-linked-list", "[1,2,3,4,5]", "1 2 3 4 5"],
  ["max-depth-binary-tree", "[3,9,20,null,null,15,7]", "3 9 20 null null 15 7"],
  ["implement-trie", '["apple","app"] | "app"', "apple app | app"],
  ["median-two-heaps", "[5,15,1,3]", "5 15 1 3"],
  ["combination-sum", "[2,3,6,7] | 7", "2 3 6 7 | 7"],
  ["number-of-islands", '[["1","1","0"],["0","0","1"]]', "110 001"],
  ["house-robber", "[2,7,9,3,1]", "2 7 9 3 1"],
  ["longest-common-subsequence", '"abcde", "ace"', "abcde ace"],
  ["jump-game", "[2,3,1,1,4]", "2 3 1 1 4"],
  ["merge-intervals", "[[1,3],[2,6],[8,10],[15,18]]", "1-3 2-6 8-10 15-18"],
];

describe("LeetCode-style pastes", () => {
  it.each(cases)("%s accepts %s", (id, raw, spaced) => {
    const v = visualizers[id];
    expect(raw.length).toBeLessThanOrEqual(v.inputMaxLength ?? Infinity);
    expect(v.parseInput(raw)).toEqual(v.parseInput(spaced));
    expect(v.parseInput(spaced)).not.toHaveProperty("error");
  });

  it("leaves Valid Parentheses brackets alone", () => {
    expect(visualizers["valid-parentheses"].parseInput("[()]")).toBe("[()]");
  });
});
