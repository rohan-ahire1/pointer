import { describe, expect, it } from "vitest";
import { expectWellFormed, mustParse, seeded } from "../kit/test-helpers";
import { code } from "./code";
import { meta } from "./meta";
import { parseInput } from "./parseInput";
import { trace } from "./trace";
import type { NetworkInput, Road } from "./types";

/** Bellman-Ford needs no heap, so it's an independent check on every node's time. */
function bellmanFord({ n, roads }: NetworkInput): (number | null)[] {
  const best: (number | null)[] = Array.from({ length: n }, () => null);
  best[0] = 0;
  for (let round = 0; round < n; round++) {
    for (const [from, to, cost] of roads) {
      const known = best[from];
      if (known === null) continue;
      const seen = best[to];
      if (seen === null || known + cost < seen) best[to] = known + cost;
    }
  }
  return best;
}

describe("network-delay-time", () => {
  const last = (raw: string) => {
    const steps = trace(mustParse(parseInput, raw));
    return steps[steps.length - 1].state;
  };

  it("matches the worked examples", () => {
    expect(last("5 | 0>1:1 1>2:2 0>2:4 2>3:1 3>4:3 2>4:7").delay).toBe(7);
    expect(last("4 | 0>1:5 0>2:1 2>1:1 1>3:1").delay).toBe(3);
    expect(last("4 | 0>1:2 1>0:2 2>3:1").delay).toBe(-1);
  });

  it("every preset is well formed", () => {
    for (const preset of meta.presets) expectWellFormed(trace(mustParse(parseInput, preset)), code);
  });

  it("skips the old heap entry when a cheaper way turns up", () => {
    const phases = trace(mustParse(parseInput, meta.presets[0])).map((step) => step.state.phase);
    expect(phases.filter((phase) => phase === "skip")).toHaveLength(2);
  });

  it("matches Bellman-Ford on 300 random graphs, settling nodes in time order", () => {
    const int = seeded(20261031);
    for (let k = 0; k < 300; k++) {
      const n = int(2, 6);
      const roads: Road[] = [];
      for (let road = int(0, 10); road > 0; road--) {
        const from = int(0, n - 1);
        const to = int(0, n - 1);
        if (from !== to && !roads.some(([a, b]) => a === from && b === to)) roads.push([from, to, int(1, 9)]);
      }
      const steps = trace({ n, roads });
      const final = steps[steps.length - 1].state;
      const expected = bellmanFord({ n, roads });
      expect(final.best).toEqual(expected);
      expect(final.delay).toBe(expected.includes(null) ? -1 : Math.max(...(expected as number[])));
      const times = final.settled.map((node) => final.best[node] as number);
      expect(times).toEqual([...times].sort((a, b) => a - b));
      expectWellFormed(steps, code);
    }
  });

  it("explains what's wrong with bad input", () => {
    expect(parseInput("3")).toHaveProperty("error");
    expect(parseInput("9 | 0>1:2")).toHaveProperty("error");
    expect(parseInput("3 | 0-1")).toHaveProperty("error");
    expect(parseInput("3 | 0>5:2")).toHaveProperty("error");
    expect(parseInput("3 | 1>1:2")).toHaveProperty("error");
    expect(parseInput("3 | 0>1:0")).toHaveProperty("error");
    expect(parseInput("3 | 0>1:2 0>1:3")).toHaveProperty("error");
  });
});
