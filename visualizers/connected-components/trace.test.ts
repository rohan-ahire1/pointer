import { describe, expect, it } from "vitest";
import { expectWellFormed, mustParse, seeded } from "../kit/test-helpers";
import { code } from "./code";
import { meta } from "./meta";
import { parseInput } from "./parseInput";
import { trace } from "./trace";
import type { ComponentsInput } from "./types";

/** Counting floods shares no code with Union-Find, so it's an independent check. */
function floods({ n, links }: ComponentsInput): number {
  const seen = new Set<number>();
  const flood = (node: number) => {
    if (seen.has(node)) return;
    seen.add(node);
    for (const [a, b] of links) {
      if (a === node) flood(b);
      if (b === node) flood(a);
    }
  };
  let count = 0;
  for (let node = 0; node < n; node++) {
    if (seen.has(node)) continue;
    count++;
    flood(node);
  }
  return count;
}

describe("connected-components", () => {
  const groups = (raw: string) => {
    const steps = trace(mustParse(parseInput, raw));
    return steps[steps.length - 1].state.groups;
  };

  it("matches the worked examples", () => {
    expect(groups("6 | 0-1 2-3 1-3 4-5 0-3")).toBe(2);
    expect(groups("5 | 0-1 1-2 3-4")).toBe(2);
    expect(groups("4 | 0-1 1-2 2-0")).toBe(2);
    expect(groups("3 |")).toBe(3);
  });

  it("every preset is well formed", () => {
    for (const preset of meta.presets) expectWellFormed(trace(mustParse(parseInput, preset)), code);
  });

  it("points the walked nodes straight at the leader", () => {
    const steps = trace(mustParse(parseInput, "6 | 0-1 2-3 1-3 4-5 0-3"));
    expect(steps[steps.length - 1].state.parent[3]).toBe(0);
  });

  it("matches a flood count on 300 random graphs", () => {
    const int = seeded(20261032);
    for (let k = 0; k < 300; k++) {
      const n = int(2, 7);
      const links: [number, number][] = [];
      for (let link = int(0, 8); link > 0; link--) {
        const a = int(0, n - 1);
        const b = int(0, n - 1);
        if (a !== b) links.push([a, b]);
      }
      const steps = trace({ n, links });
      expect(steps[steps.length - 1].state.groups).toBe(floods({ n, links }));
      expectWellFormed(steps, code);
    }
  });

  it("explains what's wrong with bad input", () => {
    expect(parseInput("3")).toHaveProperty("error");
    expect(parseInput("9 | 0-1")).toHaveProperty("error");
    expect(parseInput("3 | 0>1")).toHaveProperty("error");
    expect(parseInput("3 | 0-5")).toHaveProperty("error");
    expect(parseInput("3 | 1-1")).toHaveProperty("error");
  });
});
