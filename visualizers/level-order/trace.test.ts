import { describe, expect, it } from "vitest";
import { expectWellFormed, mustParse, seeded } from "../kit/test-helpers";
import { code } from "./code";
import { meta } from "./meta";
import { parseInput } from "./parseInput";
import { trace } from "./trace";

const answer = (raw: string) => {
  const steps = trace(mustParse(parseInput, raw));
  return steps[steps.length - 1].state.out;
};

describe("level-order", () => {
  it("matches the worked examples", () => {
    expect(answer("3 9 20 null null 15 7")).toEqual([[3], [9, 20], [15, 7]]);
    expect(answer("1 null 2 null 3")).toEqual([[1], [2], [3]]);
    expect(answer("5")).toEqual([[5]]);
  });

  it("every preset is well formed", () => {
    for (const preset of meta.presets) expectWellFormed(trace(mustParse(parseInput, preset)), code);
  });

  it("matches grouping by depth on 200 random trees", () => {
    const int = seeded(20261036);
    for (let k = 0; k < 200; k++) {
      const tokens = Array.from({ length: int(1, 7) }, (_, i) => (i > 0 && int(0, 3) === 0 ? "null" : String(int(-9, 9))));
      const tree = parseInput(tokens.join(" "));
      if ("error" in tree) continue; // a child with no parent to hang from
      const steps = trace(tree);
      expectWellFormed(steps, code);
      const byDepth = new Map<number, typeof tree.nodes>();
      for (const node of tree.nodes) byDepth.set(node.depth, [...(byDepth.get(node.depth) ?? []), node]);
      const expected = [...byDepth.keys()]
        .sort((a, b) => a - b)
        .map((depth) => byDepth.get(depth)!.sort((a, b) => a.pos - b.pos).map((node) => node.value));
      expect(steps[steps.length - 1].state.out).toEqual(expected);
    }
  });
});
