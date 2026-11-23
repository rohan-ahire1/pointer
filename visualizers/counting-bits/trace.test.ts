import { describe, expect, it } from "vitest";
import { expectWellFormed, mustParse, seeded } from "../kit/test-helpers";
import { code } from "./code";
import { meta } from "./meta";
import { parseInput } from "./parseInput";
import { trace } from "./trace";

/** The plain way: count each number's 1 bits on its own. */
function reference(n: number): number[] {
  return Array.from({ length: n + 1 }, (_, value) => value.toString(2).replace(/0/g, "").length);
}

const finalAnswer = (n: number) => trace({ n })[trace({ n }).length - 1].state.ans;

describe("counting-bits", () => {
  it("matches the worked example", () => {
    expect(finalAnswer(5)).toEqual([0, 1, 1, 2, 1, 2]);
    expect(finalAnswer(0)).toEqual([0]);
  });

  it("every preset is well formed", () => {
    for (const preset of meta.presets) expectWellFormed(trace(mustParse(parseInput, preset)), code);
  });

  it("matches a plain count on ~200 seeded random inputs", () => {
    const next = seeded(338);
    for (let round = 0; round < 200; round++) {
      const n = next(0, 16);
      const steps = trace({ n });
      expectWellFormed(steps, code);
      expect(steps[steps.length - 1].state.ans).toEqual(reference(n));
    }
  });

  it("reuses ans[i >> 1] and adds i & 1 at every step", () => {
    for (const step of trace({ n: 16 })) {
      const { i, half, last, ans, phase } = step.state;
      if (i === null || half === null || last === null) continue;
      expect(half).toBe(i >> 1);
      expect(last).toBe(i & 1);
      if (phase === "fill") expect(ans[i]).toBe((ans[half] as number) + last);
    }
  });

  it("parses valid input and the LeetCode form", () => {
    expect(parseInput("5")).toEqual({ n: 5 });
    expect(parseInput("0")).toEqual({ n: 0 });
    expect(parseInput("16")).toEqual({ n: 16 });
    expect(parseInput("n = 5")).toEqual({ n: 5 });
    expect(parseInput(" n=12 ")).toEqual({ n: 12 });
  });

  it("explains what's wrong with bad input", () => {
    const messages = ["", "17", "-1", "1 2", "abc", "2.5"].map((raw) => {
      const parsed = parseInput(raw);
      expect(parsed, raw).toHaveProperty("error");
      return (parsed as { error: string }).error;
    });
    for (const message of messages) expect(message).toMatch(/0 to 16/);
  });
});
