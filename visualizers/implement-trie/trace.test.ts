import { describe, expect, it } from "vitest";
import { code } from "./code";
import { meta } from "./meta";
import { parseInput } from "./parseInput";
import { trace } from "./trace";
import type { TrieInput } from "./types";

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

/** Independent brute force: plain string checks, no trie. */
function bruteForce(words: string[], query: string): { search: boolean; startsWith: boolean } {
  return {
    search: words.includes(query),
    startsWith: words.some((word) => word.startsWith(query)),
  };
}

/** The trie should hold exactly one node per distinct prefix of the words. */
function distinctPrefixes(words: string[]): number {
  const prefixes = new Set<string>();
  for (const word of words) {
    for (let i = 1; i <= word.length; i++) prefixes.add(word.slice(0, i));
  }
  return prefixes.size;
}

function mustParse(raw: string): TrieInput {
  const parsed = parseInput(raw);
  if ("error" in parsed) throw new Error(`preset should parse: "${raw}"`);
  return parsed;
}

describe("implement-trie presets", () => {
  it.each([
    ["apple app | app", { search: true, startsWith: true }, 16],
    ["car cat cart | ca", { search: false, startsWith: true }, 18],
    ["tea ten to | tex", { search: false, startsWith: false }, 16],
  ])("%s -> %j over %i steps", (preset, expected, expectedStepCount) => {
    expect(meta.presets).toContain(preset);
    const steps = trace(mustParse(preset));
    expect(steps).toHaveLength(expectedStepCount);
    expect(steps.length).toBeLessThanOrEqual(60);
    const last = steps[steps.length - 1].state;
    expect(last.result).toEqual(expected);
    expect(last.nodes.length - 1).toBe(distinctPrefixes(last.words));
  });
});

describe("implement-trie trace shape", () => {
  const inputs = [...meta.presets, "a | a", "aa ab | b"];

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
      expect(steps[0].state.nodes).toEqual([{ id: 0, ch: "", parent: null, isWord: false }]);
      expect(steps[0].state.cursor).toBeNull();
      expect(steps[0].state.result).toBeNull();
      expect(steps[steps.length - 1].state.phase).toBe("done");
      expect(steps[steps.length - 1].note.startsWith("Done.")).toBe(true);
    }
  });

  it("a failed lookup hangs its missing letter off the cursor", () => {
    const steps = trace(mustParse("tea ten to | tex"));
    const fail = steps.find((step) => step.state.phase === "fail");
    expect(fail?.state.missing).toBe("x");
    expect(fail?.state.charIndex).toBe(2);
    expect(fail?.state.result).toEqual({ search: false, startsWith: false });
  });

  it("a shared prefix reuses nodes instead of adding them", () => {
    const steps = trace(mustParse("apple app | app"));
    const reuse = steps.filter((step) => step.state.phase === "reuse");
    expect(reuse).toHaveLength(3);
    for (const step of reuse) {
      expect(step.state.created).toBeNull();
    }
    expect(steps[steps.length - 1].state.nodes.length - 1).toBe(5);
  });
});

describe("implement-trie property test", () => {
  it("matches brute force and stays within the step budget on 300 inputs", () => {
    const rand = mulberry32(20260808);
    const int = (min: number, max: number): number =>
      min + Math.floor(rand() * (max - min + 1));
    // A small alphabet forces prefixes to collide; the odd wider draw keeps
    // lonely branches in the mix too.
    const word = (): string => {
      const alphabet = rand() < 0.8 ? "abc" : "abcdef";
      return Array.from({ length: int(1, 6) }, () => alphabet[int(0, alphabet.length - 1)]).join(
        "",
      );
    };
    for (let k = 0; k < 300; k++) {
      const words = Array.from({ length: int(1, 4) }, word);
      const query = word();
      const steps = trace({ words, query });
      expect(steps.length, `steps for ${JSON.stringify({ words, query })}`).toBeLessThanOrEqual(
        150,
      );
      for (const step of steps) {
        expect(step.note.length).toBeLessThanOrEqual(110);
        expect(step.sr.length).toBeGreaterThan(0);
      }
      const last = steps[steps.length - 1].state;
      expect(last.result, `result for ${JSON.stringify({ words, query })}`).toEqual(
        bruteForce(words, query),
      );
      expect(last.nodes.length - 1).toBe(distinctPrefixes(words));
    }
  });
});

describe("implement-trie parseInput", () => {
  it("parses the presets", () => {
    expect(parseInput("apple app | app")).toEqual({ words: ["apple", "app"], query: "app" });
    expect(parseInput("car cat cart | ca")).toEqual({
      words: ["car", "cat", "cart"],
      query: "ca",
    });
    expect(parseInput("tea ten to | tex")).toEqual({ words: ["tea", "ten", "to"], query: "tex" });
  });

  it("accepts commas, extra spacing and uppercase", () => {
    expect(parseInput("apple,app|app")).toEqual({ words: ["apple", "app"], query: "app" });
    expect(parseInput("  Car   CAT  |  CA ")).toEqual({ words: ["car", "cat"], query: "ca" });
  });

  it.each([
    ["", "then | and a word to look up"],
    ["apple app", "one | between"],
    ["apple | app | x", "one | between"],
    ["| app", "before the |"],
    ["a b c d e | a", "up to 4 words"],
    ["app3 | app", "outside a–z"],
    ["abcdefg | a", "1–6 letters per word"],
    ["apple | ", "after the | to look up"],
    ["apple | a b", "a single word"],
    ["apple | a1", "outside a–z"],
    ["apple | abcdefg", "1–6 letters"],
  ])("%s is rejected with copy saying what is allowed", (raw, hint) => {
    const result = parseInput(raw);
    expect("error" in result).toBe(true);
    if ("error" in result) expect(result.error).toContain(hint);
  });
});
