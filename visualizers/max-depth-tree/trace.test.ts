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
  const inputs = [...meta.presets, "7", "1 2", "1 2 null 3", "1 null 2 3", "5 4 8 11 null 13 4"];

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
    const randomValue = (): number => -99 + Math.floor(rand() * 199);
    const randomNull = (): string =>
      nullSpellings[Math.floor(rand() * nullSpellings.length)] as string;
    type GenNode = { value: number; left: number | null; right: number | null; pos: number; depth: number };
    for (let k = 0; k < 300; k++) {
      // A random connected tree, depth ≤ 4 and ≤ 15 nodes: BFS growth,
      // each child added with p = 0.6.
      const gen: GenNode[] = [{ value: randomValue(), left: null, right: null, pos: 1, depth: 1 }];
      const grow: number[] = [0];
      let growHead = 0;
      while (growHead < grow.length && gen.length < 15) {
        const idx = grow[growHead] as number;
        growHead++;
        const node = gen[idx] as GenNode;
        if (node.depth >= 4) continue;
        for (const side of ["left", "right"] as const) {
          if (gen.length >= 15) break;
          if (rand() < 0.6) {
            const childPos = side === "left" ? node.pos * 2 : node.pos * 2 + 1;
            const childIdx = gen.length;
            gen.push({
              value: randomValue(),
              left: null,
              right: null,
              pos: childPos,
              depth: node.depth + 1,
            });
            node[side] = childIdx;
            grow.push(childIdx);
          }
        }
      }
      // Serialize LeetCode-style: BFS, one pair per live node, trailing
      // nulls trimmed.
      const tokens: string[] = [String((gen[0] as GenNode).value)];
      const queue: number[] = [0];
      let head = 0;
      while (head < queue.length) {
        const idx = queue[head] as number;
        head++;
        const node = gen[idx] as GenNode;
        for (const side of ["left", "right"] as const) {
          const childIdx = node[side];
          if (childIdx === null) {
            tokens.push(randomNull());
          } else {
            tokens.push(String((gen[childIdx] as GenNode).value));
            queue.push(childIdx);
          }
        }
      }
      while (tokens.length > 1) {
        const last = tokens[tokens.length - 1] as string;
        if (last.toLowerCase() === "null" || last === "_" || last === "#") tokens.pop();
        else break;
      }
      // Round-trip through parseInput: same structure, same depth answer.
      const raw = tokens.join(" ");
      const input = mustParse(raw);
      expect(input.nodes, `nodes for "${raw}"`).toHaveLength(gen.length);
      const origByPos = new Map(gen.map((n) => [n.pos, n.value] as const));
      const parsedByPos = new Map(input.nodes.map((n) => [n.pos, n.value] as const));
      expect(parsedByPos, `structure for "${raw}"`).toEqual(origByPos);
      const origDepthByPos = new Map(gen.map((n) => [n.pos, n.depth] as const));
      const parsedDepthByPos = new Map(input.nodes.map((n) => [n.pos, n.depth] as const));
      expect(parsedDepthByPos, `depths for "${raw}"`).toEqual(origDepthByPos);
      const origInput: MaxDepthInput = {
        nodes: gen.map((n, id) => ({ id, value: n.value, left: n.left, right: n.right, pos: n.pos, depth: n.depth })),
        root: 0,
      };
      const steps = trace(input);
      expect(steps.length, `steps for "${raw}"`).toBeLessThanOrEqual(150);
      for (const step of steps) {
        expect(step.note.length).toBeLessThanOrEqual(110);
        expect(step.sr.length).toBeGreaterThan(0);
      }
      expect(steps[steps.length - 1].state.answer).toBe(bruteForce(input));
      expect(bruteForce(input), `depth for "${raw}"`).toBe(bruteForce(origInput));
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

  it("parses queue-style: 1 null 2 3 gives 2 a left child 3", () => {
    const input = mustParse("1 null 2 3");
    expect(input.nodes).toHaveLength(3);
    const byPos = new Map(input.nodes.map((node) => [node.pos, node] as const));
    expect(byPos.get(1)?.value).toBe(1);
    expect(byPos.get(3)?.value).toBe(2);
    expect(byPos.get(6)?.value).toBe(3);
    expect(byPos.get(6)?.depth).toBe(3);
    const steps = trace(input);
    expect(steps[steps.length - 1].state.answer).toBe(3);
  });

  it("parses 5 4 8 11 null 13 4 to depth 3", () => {
    const input = mustParse("5 4 8 11 null 13 4");
    expect(input.nodes).toHaveLength(6);
    const steps = trace(input);
    expect(steps[steps.length - 1].state.answer).toBe(3);
  });

  it("rejects leftover tokens that have no parent to attach to", () => {
    const result = parseInput("1 null null 2");
    expect("error" in result).toBe(true);
    if ("error" in result) {
      expect(result.error).toContain("2");
      expect(result.error).toContain("no parent");
    }
  });

  it.each([
    ["", "Up to 4 levels"],
    ["null", "can’t be null"],
    ["1 x 3", "isn’t a value"],
    ["100 1", "-99 to 99"],
    ["1 2 null 3 null 4 null 5 null", "levels deep"],
  ])("%s is rejected with copy saying what is allowed", (raw, hint) => {
    const result = parseInput(raw);
    expect("error" in result).toBe(true);
    if ("error" in result) expect(result.error).toContain(hint);
  });
});
