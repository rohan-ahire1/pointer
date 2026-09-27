import { describe, expect, it } from "vitest";
import { code } from "./code";
import { meta } from "./meta";
import { parseInput } from "./parseInput";
import { trace } from "./trace";
import type { MaxDepthInput, TreeNodeData } from "./types";

/** mulberry32: a tiny seeded PRNG (no dependency) for the property tests. */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Independent brute force: level-order BFS counting levels. */
function bruteForce(input: MaxDepthInput): number {
  const byId: Record<number, TreeNodeData> = {};
  for (const node of input.nodes) byId[node.id] = node;
  let depth = 0;
  let level: number[] = [input.root];
  while (level.length > 0) {
    depth++;
    const next: number[] = [];
    for (const id of level) {
      const node = byId[id];
      if (node.left !== null) next.push(node.left);
      if (node.right !== null) next.push(node.right);
    }
    level = next;
  }
  return depth;
}

function mustParse(raw: string): MaxDepthInput {
  const parsed = parseInput(raw);
  if ("error" in parsed) throw new Error(`preset should parse: "${raw}"`);
  return parsed;
}

describe("max-depth-tree presets", () => {
  it.each([
    ["3 9 20 null null 15 7", 3, 11],
    ["1 null 2", 2, 6],
    ["1 2 3 4 5 6 7", 3, 15],
  ])("%s -> depth %i over %i steps", (preset, expectedDepth, expectedStepCount) => {
    expect(meta.presets).toContain(preset);
    const steps = trace(mustParse(preset));
    expect(steps).toHaveLength(expectedStepCount);
    expect(steps[steps.length - 1].state.answer).toBe(expectedDepth);
  });

  it("covers a leaf's two empty children in one step, not three", () => {
    const steps = trace(mustParse("1 null 2"));
    const phases = steps.map((step) => step.state.phase);
    expect(phases).toEqual(["setup", "missing", "enter", "leaf", "return", "done"]);
  });

  it("answers a single node in three steps", () => {
    const steps = trace(mustParse("7"));
    expect(steps).toHaveLength(3);
    expect(steps[steps.length - 1].state.answer).toBe(1);
    expect(steps[steps.length - 1].note).toBe(
      "Done. The root answers 1: the tree is 1 level deep.",
    );
  });
});

describe("max-depth-tree trace shape", () => {
  const inputs = [...meta.presets, "7", "1 2", "1 2 null 3"];

  it("is deterministic", () => {
    for (const preset of inputs) {
      expect(trace(mustParse(preset))).toEqual(trace(mustParse(preset)));
    }
  });

  it("every step's lines are valid indices into code", () => {
    for (const preset of inputs) {
      for (const step of trace(mustParse(preset))) {
        expect(step.lines.length).toBeGreaterThan(0);
        for (const line of step.lines) {
          expect(line, `line ${line} for "${preset}"`).toBeGreaterThanOrEqual(0);
          expect(line, `line ${line} for "${preset}"`).toBeLessThan(code.length);
        }
      }
    }
  });

  it("every note is non-empty and at most 110 chars, every sr is non-empty", () => {
    for (const preset of inputs) {
      for (const step of trace(mustParse(preset))) {
        expect(step.note.length, `note for "${preset}"`).toBeGreaterThan(0);
        expect(step.note.length, `note "${step.note}"`).toBeLessThanOrEqual(110);
        expect(step.sr.length, `sr for "${preset}"`).toBeGreaterThan(0);
      }
    }
  });

  it("first step is setup, last step starts with Done.", () => {
    for (const preset of inputs) {
      const steps = trace(mustParse(preset));
      expect(steps[0].state.phase).toBe("setup");
      expect(steps[steps.length - 1].state.phase).toBe("done");
      expect(steps[steps.length - 1].note.startsWith("Done.")).toBe(true);
    }
  });

  it("every node answers exactly once and the root's answer wins", () => {
    for (const preset of inputs) {
      const input = mustParse(preset);
      const last = trace(input)[trace(input).length - 1].state;
      expect(Object.keys(last.answers).map(Number).sort((a, b) => a - b)).toEqual(
        input.nodes.map((node) => node.id).sort((a, b) => a - b),
      );
      expect(last.answer).toBe(last.answers[input.root]);
    }
  });
});

describe("max-depth-tree property test", () => {
  it("matches BFS depth and stays within the step budget on 300 inputs", () => {
    const rand = mulberry32(20260707);
    const nullSpellings = ["null", "_", "#"];
    for (let k = 0; k < 300; k++) {
      // A random connected tree, depth ≤ 4: every node above the bottom
      // level grows each child with p = 0.6. Serialized LeetCode-style so
      // parseInput gets exercised too.
      const present = new Set([1]);
      for (let pos = 1; pos <= 7; pos++) {
        if (!present.has(pos)) continue;
        for (const child of [pos * 2, pos * 2 + 1]) {
          if (rand() < 0.6) present.add(child);
        }
      }
      const maxPos = Math.max(...present);
      const tokens: string[] = [];
      for (let pos = 1; pos <= maxPos; pos++) {
        if (present.has(pos)) {
          tokens.push(`${-99 + Math.floor(rand() * 199)}`);
        } else {
          tokens.push(nullSpellings[Math.floor(rand() * nullSpellings.length)] as string);
        }
      }
      const input = mustParse(tokens.join(" "));
      const steps = trace(input);
      expect(steps.length, `steps for "${tokens.join(" ")}"`).toBeLessThanOrEqual(150);
      for (const step of steps) {
        expect(step.note.length).toBeLessThanOrEqual(110);
        expect(step.sr.length).toBeGreaterThan(0);
      }
      expect(steps[steps.length - 1].state.answer).toBe(bruteForce(input));
    }
  });
});

describe("max-depth-tree parseInput", () => {
  it("parses the presets", () => {
    const first = mustParse("3 9 20 null null 15 7");
    expect(first.nodes).toHaveLength(5);
    expect(first.nodes[first.root].value).toBe(3);
    expect(mustParse("1 null 2").nodes).toHaveLength(2);
    expect(mustParse("1 2 3 4 5 6 7").nodes).toHaveLength(7);
  });

  it("accepts _ and # for missing children, and commas between tokens", () => {
    expect(mustParse("1 _ 2").nodes).toHaveLength(2);
    expect(mustParse("1 # 2").nodes).toHaveLength(2);
    expect(mustParse("3,9,20,null,null,15,7").nodes).toHaveLength(5);
  });

  it("skips children of a missing node", () => {
    // Positions 4 and 5 sit under the missing position 2, so 3 and 4 never
    // become nodes: the tree is just 1 with a right child 2.
    const input = mustParse("1 null 2 3 4");
    expect(input.nodes.map((node) => node.value).sort((a, b) => a - b)).toEqual([1, 2]);
  });

  it.each([
    ["", "Up to 4 levels"],
    ["null", "can’t be null"],
    ["1 x 3", "isn’t a value"],
    ["100 1", "-99 to 99"],
    ["1 2 null 3 null null null 4 null null null null null null null 5", "levels deep"],
  ])("%s is rejected with copy saying what is allowed", (raw, hint) => {
    const result = parseInput(raw);
    expect("error" in result).toBe(true);
    if ("error" in result) expect(result.error).toContain(hint);
  });
});
