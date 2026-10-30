import { describe, expect, it } from "vitest";
import { applyGuess, nextGuessStep, START_GUESSING } from "./predict";

describe("nextGuessStep", () => {
  it("skips steps that stay on the same lines", () => {
    expect(nextGuessStep([[1], [1], [2]], 0)).toBe(2);
  });

  it("returns -1 when nothing new is left", () => {
    expect(nextGuessStep([[1], [1]], 0)).toBe(-1);
    expect(nextGuessStep([[1]], 0)).toBe(-1);
    expect(nextGuessStep([], 0)).toBe(-1);
  });

  it("treats a different set of lines as new", () => {
    expect(nextGuessStep([[2, 3], [3]], 0)).toBe(1);
  });

  it("skips steps with no line in this language", () => {
    expect(nextGuessStep([[1], [], [2]], 0)).toBe(2);
  });
});

describe("applyGuess", () => {
  it("counts a first-try hit", () => {
    const { state, advance } = applyGuess(START_GUESSING, 3, [3]);
    expect(advance).toBe(true);
    expect(state).toMatchObject({ asked: 1, firstTry: 1, misses: 0, last: "right" });
  });

  it("accepts any of the highlighted lines", () => {
    expect(applyGuess(START_GUESSING, 4, [3, 4]).advance).toBe(true);
  });

  it("stays on a first miss and marks the line", () => {
    const { state, advance } = applyGuess(START_GUESSING, 9, [3]);
    expect(advance).toBe(false);
    expect(state).toMatchObject({ asked: 0, misses: 1, last: "wrong", wrongLine: 9 });
  });

  it("a hit after a miss doesn't count as first try", () => {
    const missed = applyGuess(START_GUESSING, 9, [3]).state;
    const { state } = applyGuess(missed, 3, [3]);
    expect(state).toMatchObject({ asked: 1, firstTry: 0, misses: 0, wrongLine: null });
  });

  it("reveals after two misses", () => {
    const missed = applyGuess(START_GUESSING, 9, [3]).state;
    const { state, advance } = applyGuess(missed, 8, [3]);
    expect(advance).toBe(true);
    expect(state).toMatchObject({ asked: 1, firstTry: 0, misses: 0, last: "revealed" });
  });
});
