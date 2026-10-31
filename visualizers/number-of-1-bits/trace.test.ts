import { describe, expect, it } from "vitest";
import { expectWellFormed, mustParse } from "../kit/test-helpers";
import { code } from "./code";
import { meta } from "./meta";
import { parseInput } from "./parseInput";
import { bitsOf, trace } from "./trace";

describe("number-of-1-bits", () => {
  const count = (n: number) => {
    const steps = trace({ n });
    return steps[steps.length - 1].state.count;
  };

  it("matches the worked examples", () => {
    expect(count(172)).toBe(4);
    expect(count(255)).toBe(8);
    expect(count(64)).toBe(1);
    expect(count(0)).toBe(0);
  });

  it("every preset is well formed", () => {
    for (const preset of meta.presets) expectWellFormed(trace(mustParse(parseInput, preset)), code);
  });

  it("matches a bit-by-bit count for every number, hopping once per 1 bit", () => {
    for (let n = 0; n <= 255; n++) {
      const ones = bitsOf(n).filter((bit) => bit === 1).length;
      const steps = trace({ n });
      expect(count(n)).toBe(ones);
      expect(steps.filter((step) => step.state.phase === "and")).toHaveLength(ones);
      expectWellFormed(steps, code);
    }
  });

  it("explains what's wrong with bad input", () => {
    expect(parseInput("")).toHaveProperty("error");
    expect(parseInput("256")).toHaveProperty("error");
    expect(parseInput("1 2")).toHaveProperty("error");
    expect(parseInput("abc")).toHaveProperty("error");
  });
});
