import { describe, expect, it } from "vitest";
import { expectWellFormed, mustParse, seeded } from "../kit/test-helpers";
import { code } from "./code";
import { meta } from "./meta";
import { parseInput } from "./parseInput";
import { trace } from "./trace";

function bruteForce(temps: number[]): number[] {
  return temps.map((t, i) => {
    const next = temps.findIndex((other, j) => j > i && other > t);
    return next === -1 ? 0 : next - i;
  });
}

describe("daily-temperatures", () => {
  it("matches the worked example", () => {
    const steps = trace(mustParse(parseInput, "73 74 75 71 69 72 76 73"));
    expect(steps[steps.length - 1].state.out).toEqual([1, 1, 4, 2, 1, 1, 0, 0]);
  });

  it("every preset is well formed", () => {
    for (const preset of meta.presets) expectWellFormed(trace(mustParse(parseInput, preset)), code);
  });

  it("matches brute force on 300 random inputs", () => {
    const int = seeded(20261033);
    for (let k = 0; k < 300; k++) {
      const temps = Array.from({ length: int(2, 8) }, () => int(30, 45));
      const steps = trace(temps);
      expectWellFormed(steps, code);
      expect(steps[steps.length - 1].state.out).toEqual(bruteForce(temps));
    }
  });

  it("rejects bad input", () => {
    expect(parseInput("70")).toHaveProperty("error");
    expect(parseInput("70 20")).toHaveProperty("error");
  });
});
