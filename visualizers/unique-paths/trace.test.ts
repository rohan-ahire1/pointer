import { describe, expect, it } from "vitest";
import { expectWellFormed, mustParse } from "../kit/test-helpers";
import { code } from "./code";
import { meta } from "./meta";
import { parseInput } from "./parseInput";
import { trace } from "./trace";

const choose = (n: number, k: number): number => {
  let result = 1;
  for (let i = 1; i <= k; i++) result = (result * (n - k + i)) / i;
  return Math.round(result);
};

describe("unique-paths", () => {
  it("matches the worked examples", () => {
    const steps = trace(mustParse(parseInput, "3 7"));
    expect(steps[steps.length - 1].state.dp[2][6]).toBe(28);
  });

  it("every preset is well formed", () => {
    for (const preset of meta.presets) expectWellFormed(trace(mustParse(parseInput, preset)), code);
  });

  it("matches the counting formula on every grid", () => {
    for (let m = 1; m <= 5; m++) {
      for (let n = 1; n <= 7; n++) {
        const steps = trace({ m, n });
        expectWellFormed(steps, code);
        expect(steps[steps.length - 1].state.dp[m - 1][n - 1]).toBe(choose(m + n - 2, m - 1));
      }
    }
  });

  it("rejects bad input", () => {
    expect(parseInput("3")).toHaveProperty("error");
    expect(parseInput("6 2")).toHaveProperty("error");
    expect(parseInput("2 8")).toHaveProperty("error");
    expect(parseInput("0 2")).toHaveProperty("error");
  });
});
