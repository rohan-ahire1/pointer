import { describe, expect, it } from "vitest";
import { code } from "./code";
import { meta } from "./meta";
import { parseInput } from "./parseInput";
import { trace } from "./trace";
import type { JumpInput } from "./types";

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

/** Independent brute force: BFS over reachable indices from stone 0. */
function bruteForce(nums: number[]): boolean {
  const seen = new Set<number>([0]);
  const queue = [0];
  while (queue.length > 0) {
    const i = queue.pop() as number;
    if (i === nums.length - 1) return true;
    for (let j = i + 1; j <= Math.min(i + (nums[i] as number), nums.length - 1); j++) {
      if (!seen.has(j)) {
        seen.add(j);
        queue.push(j);
      }
    }
  }
  return seen.has(nums.length - 1);
}

function mustParse(raw: string): JumpInput {
  const parsed = parseInput(raw);
  if ("error" in parsed) throw new Error(`preset should parse: "${raw}"`);
  return parsed;
}

describe("jump-game presets", () => {
  it.each([
    ["2 3 1 1 4", true, 7],
    ["3 2 1 0 4", false, 7],
    ["0", true, 3],
  ])("%s -> %s over %i steps", (preset, expected, expectedStepCount) => {
    expect(meta.presets).toContain(preset);
    const steps = trace(mustParse(preset));
    expect(steps).toHaveLength(expectedStepCount);
    expect(steps.length).toBeLessThanOrEqual(60);
    const last = steps[steps.length - 1].state;
    expect(last.phase).toBe("done");
    expect(last.verdict).toBe(expected);
  });
});

describe("jump-game trace shape", () => {
  const inputs = [...meta.presets, "1 0", "0 1"];

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
      expect(steps[0].state.reach).toBe(0);
      expect(steps[0].state.verdict).toBeNull();
      expect(steps[steps.length - 1].state.phase).toBe("done");
      expect(steps[steps.length - 1].note.startsWith("Done.")).toBe(true);
    }
  });

  it("extends the reach stone by stone on the happy path", () => {
    const steps = trace(mustParse("2 3 1 1 4"));
    expect(steps[0].note).toBe("You stand on stone 0. So far you can reach stone 0.");
    expect(steps[2].note).toBe("Stone 1 lets you jump 3, as far as stone 4. New farthest: 4.");
    expect(steps[steps.length - 1].note).toBe(
      "Done. Every stone was within reach, so you can get to the end.",
    );
  });

  it("marks the stuck stone and keeps the reach on the sad path", () => {
    const steps = trace(mustParse("3 2 1 0 4"));
    const stuck = steps.find((step) => step.state.phase === "stuck");
    expect(stuck?.note).toBe("Stone 4 is past your farthest reach, 3. You’re stuck.");
    expect(stuck?.state.stuckAt).toBe(4);
    expect(stuck?.state.reach).toBe(3);
    expect(steps[steps.length - 1].note).toBe("Done. You can’t get past stone 3.");
    expect(steps[steps.length - 1].state.verdict).toBe(false);
  });
});

describe("jump-game property test", () => {
  it("matches brute force and stays within the step budget on 300 inputs", () => {
    const rand = mulberry32(20261414);
    const int = (min: number, max: number): number =>
      min + Math.floor(rand() * (max - min + 1));
    // Small jumps dominate so stuck runs appear; the odd longer run with
    // bigger jumps keeps successes in the mix too.
    const nums = (): number[] => {
      const hi = rand() < 0.7 ? 2 : 5;
      return Array.from({ length: int(1, 10) }, () => int(0, hi));
    };
    let sawTrue = false;
    let sawFalse = false;
    for (let k = 0; k < 300; k++) {
      const input = nums();
      const steps = trace(input);
      expect(steps.length, `steps for ${JSON.stringify(input)}`).toBeLessThanOrEqual(150);
      for (const step of steps) {
        expect(step.note.length).toBeLessThanOrEqual(110);
        expect(step.sr.length).toBeGreaterThan(0);
      }
      const last = steps[steps.length - 1].state;
      const expected = bruteForce(input);
      sawTrue = sawTrue || expected;
      sawFalse = sawFalse || !expected;
      expect(last.verdict, `verdict for ${JSON.stringify(input)}`).toBe(expected);
      if (expected) {
        expect(last.reach).toBeGreaterThanOrEqual(input.length - 1);
      } else {
        expect(last.stuckAt).not.toBeNull();
      }
    }
    expect(sawTrue).toBe(true);
    expect(sawFalse).toBe(true);
  });
});

describe("jump-game parseInput", () => {
  it("parses the presets", () => {
    expect(parseInput("2 3 1 1 4")).toEqual([2, 3, 1, 1, 4]);
    expect(parseInput("3 2 1 0 4")).toEqual([3, 2, 1, 0, 4]);
    expect(parseInput("0")).toEqual([0]);
  });

  it("accepts commas and extra spacing", () => {
    expect(parseInput("  2, 3, 1  ")).toEqual([2, 3, 1]);
  });

  it.each([
    ["", "1–10 jump lengths"],
    ["2 three 1", "whole number"],
    ["2 6 1", "0 to 5"],
    ["-1 2", "0 to 5"],
    ["1 1 1 1 1 1 1 1 1 1 1", "You entered 11"],
  ])("%s is rejected with copy saying what is allowed", (raw, hint) => {
    const result = parseInput(raw);
    expect("error" in result).toBe(true);
    if ("error" in result) expect(result.error).toContain(hint);
  });
});
