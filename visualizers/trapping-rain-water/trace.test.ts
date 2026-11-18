import { describe, expect, it } from "vitest";
import { expectWellFormed, mustParse, seeded } from "../kit/test-helpers";
import { code } from "./code";
import { meta } from "./meta";
import { parseInput } from "./parseInput";
import { trace } from "./trace";

/** For each bar, water reaches the lower of the tallest bar on each side. */
function bruteForce(height: number[]): number {
  return height.reduce(
    (sum, h, i) => sum + Math.min(Math.max(...height.slice(0, i + 1)), Math.max(...height.slice(i))) - h,
    0,
  );
}

/** Water above each bar, added up from the layers the trace poured. */
function fromLayers(height: number[], layers: { from: number; to: number; base: number; top: number }[]): number[] {
  const above = height.map(() => 0);
  for (const { from, to, base, top } of layers) for (let k = from; k <= to; k++) above[k] += top - base;
  return above;
}

describe("trapping-rain-water", () => {
  it("matches the worked example", () => {
    const steps = trace(mustParse(parseInput, "0 1 0 2 1 0 1 3 2 1 2 1"));
    expect(steps[steps.length - 1].state.water).toBe(6);
  });

  it("every preset is well formed and fits the step budget", () => {
    for (const preset of meta.presets) expectWellFormed(trace(mustParse(parseInput, preset)), code, 60);
  });

  it("matches brute force on 300 random inputs, layer by layer", () => {
    const int = seeded(20261142);
    for (let k = 0; k < 300; k++) {
      const height = Array.from({ length: int(2, 12) }, () => int(0, 9));
      const steps = trace(height);
      expectWellFormed(steps, code, 60);
      const last = steps[steps.length - 1].state;
      expect(last.water).toBe(bruteForce(height));
      // The layers stack into exactly the water each bar holds, and never overlap a bar.
      const above = fromLayers(height, last.layers);
      height.forEach((h, i) => {
        const level = Math.min(Math.max(...height.slice(0, i + 1)), Math.max(...height.slice(i)));
        expect(above[i]).toBe(level - h);
      });
      for (const layer of last.layers) {
        for (let b = layer.from; b <= layer.to; b++) expect(height[b]).toBeLessThanOrEqual(layer.base);
      }
    }
  });

  it("rejects bad input", () => {
    expect(parseInput("4")).toHaveProperty("error");
    expect(parseInput("4 10")).toHaveProperty("error");
    expect(parseInput("4 x 2")).toHaveProperty("error");
  });
});
