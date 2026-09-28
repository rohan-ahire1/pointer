import { describe, expect, it } from "vitest";
import { code } from "./code";
import { meta } from "./meta";
import { parseInput } from "./parseInput";
import { trace } from "./trace";
import type { LcsInput } from "./types";

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

function isSubsequence(sub: string, word: string): boolean {
  let k = 0;
  for (const ch of word) {
    if (k < sub.length && ch === sub[k]) k++;
  }
  return k === sub.length;
}

/** Independent brute force: every subsequence of `a` (≤ 64) that also sits inside `b`. */
function bruteForce(a: string, b: string): number {
  let best = 0;
  for (let mask = 0; mask < 1 << a.length; mask++) {
    let sub = "";
    for (let i = 0; i < a.length; i++) {
      if ((mask & (1 << i)) !== 0) sub += a[i];
    }
    if (sub.length > best && isSubsequence(sub, b)) best = sub.length;
  }
  return best;
}

function mustParse(raw: string): LcsInput {
  const parsed = parseInput(raw);
  if ("error" in parsed) throw new Error(`preset should parse: "${raw}"`);
  return parsed;
}

describe("lcs presets", () => {
  it.each([
    ["abcde ace", 3, "ace", 18],
    ["abc abc", 3, "abc", 12],
    ["abc def", 0, "", 12],
  ])("%s -> %i (%j) over %i steps", (preset, expected, expectedSub, expectedStepCount) => {
    expect(meta.presets).toContain(preset);
    const steps = trace(mustParse(preset));
    expect(steps).toHaveLength(expectedStepCount);
    expect(steps.length).toBeLessThanOrEqual(60);
    const last = steps[steps.length - 1].state;
    expect(last.dp[last.dp.length - 1][last.dp[0].length - 1]).toBe(expected);
    expect(last.subsequence).toBe(expectedSub);
  });
});

describe("lcs trace shape", () => {
  const inputs = [...meta.presets, "a a", "ab ba"];

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
      expect(steps[0].state.path).toBeNull();
      expect(steps[0].state.subsequence).toBeNull();
      expect(steps[steps.length - 1].state.phase).toBe("done");
      expect(steps[steps.length - 1].note.startsWith("Done.")).toBe(true);
    }
  });

  it("fills one cell per step, row by row", () => {
    const fills = trace(mustParse("abc abc")).filter((step) => step.state.phase === "fill");
    expect(fills.map((step) => [step.state.i, step.state.j])).toEqual([
      [1, 1],
      [1, 2],
      [1, 3],
      [2, 1],
      [2, 2],
      [2, 3],
      [3, 1],
      [3, 2],
      [3, 3],
    ]);
  });

  it("walks back from the corner through the matches", () => {
    const steps = trace(mustParse("abcde ace"));
    expect(steps[steps.length - 1].note).toBe(
      "Done. The longest common subsequence has length 3: “ace”.",
    );
    const back = steps.find((step) => step.state.phase === "traceback");
    expect(back?.state.path?.[0]).toEqual([5, 3]);
    expect(back?.state.subsequence).toBe("ace");
  });
});

describe("lcs property test", () => {
  it("matches brute force and stays within the step budget on 300 inputs", () => {
    const rand = mulberry32(20261313);
    const int = (min: number, max: number): number =>
      min + Math.floor(rand() * (max - min + 1));
    // A small alphabet forces matches; the odd wider draw keeps empty
    // answers in the mix too.
    const word = (): string => {
      const alphabet = rand() < 0.8 ? "abc" : "abcdef";
      return Array.from(
        { length: int(1, 6) },
        () => alphabet[int(0, alphabet.length - 1)],
      ).join("");
    };
    for (let k = 0; k < 300; k++) {
      const a = word();
      const b = word();
      const steps = trace({ a, b });
      expect(steps.length, `steps for ${JSON.stringify({ a, b })}`).toBeLessThanOrEqual(150);
      for (const step of steps) {
        expect(step.note.length).toBeLessThanOrEqual(110);
        expect(step.sr.length).toBeGreaterThan(0);
      }
      const last = steps[steps.length - 1].state;
      const length = last.dp[a.length][b.length];
      expect(length, `length for ${JSON.stringify({ a, b })}`).toBe(bruteForce(a, b));
      const sub = last.subsequence ?? "";
      expect(sub.length).toBe(length);
      expect(isSubsequence(sub, a)).toBe(true);
      expect(isSubsequence(sub, b)).toBe(true);
    }
  });
});

describe("lcs parseInput", () => {
  it("parses the presets", () => {
    expect(parseInput("abcde ace")).toEqual({ a: "abcde", b: "ace" });
    expect(parseInput("abc abc")).toEqual({ a: "abc", b: "abc" });
    expect(parseInput("abc def")).toEqual({ a: "abc", b: "def" });
  });

  it("accepts extra spacing and uppercase", () => {
    expect(parseInput("  ABC   DEF  ")).toEqual({ a: "abc", b: "def" });
  });

  it.each([
    ["", "two words"],
    ["abc", "two words"],
    ["a b c", "two words"],
    ["ab1 cd", "outside a–z"],
    ["abcdefg cd", "1–6 letters per word"],
    ["ab cdefghi", "1–6 letters per word"],
  ])("%s is rejected with copy saying what is allowed", (raw, hint) => {
    const result = parseInput(raw);
    expect("error" in result).toBe(true);
    if ("error" in result) expect(result.error).toContain(hint);
  });
});
