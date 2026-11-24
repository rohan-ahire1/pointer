import { describe, expect, it } from "vitest";
import { expectWellFormed, mustParse, seeded } from "../kit/test-helpers";
import { code } from "./code";
import { meta } from "./meta";
import { parseInput } from "./parseInput";
import { trace } from "./trace";
import type { AddSearchInput } from "./types";

/** Plain reference: no trie, just compare each word with the pattern. */
function reference({ words, pattern }: AddSearchInput): boolean {
  return words.some(
    (word) => word.length === pattern.length && [...pattern].every((ch, i) => ch === "." || ch === word[i]),
  );
}

const parse = (raw: string) => mustParse(parseInput, raw);

describe("add-search-words presets", () => {
  it.each(meta.presets)("%s is well formed and matches the reference", (preset) => {
    const input = parse(preset);
    const steps = trace(input);
    expectWellFormed(steps, code);
    expect(steps[steps.length - 1].state.result).toBe(reference(input));
  });

  it("a dot tries each child and marks dead ends", () => {
    const hit = trace(parse("bad dad mad | .ad"));
    expect(hit.filter((s) => s.state.phase === "wild")).toHaveLength(1);
    expect(hit[hit.length - 1].state.result).toBe(true);
    const miss = trace(parse("bad dad mad | ..x"));
    expect(miss.filter((s) => s.state.phase === "wild").length).toBeGreaterThanOrEqual(3);
    expect(miss[miss.length - 1].state.result).toBe(false);
    expect(miss[miss.length - 1].state.dead.length).toBeGreaterThan(0);
  });

  it("a letter that isn't there shows a ghost letter", () => {
    const steps = trace(parse("cat car cow | c.w"));
    expect(steps.some((s) => s.state.phase === "dead")).toBe(true);
    const missing = trace(parse("cat | dog")).find((s) => s.state.missing !== null);
    expect(missing?.state.missing).toBe("d");
  });
});

describe("add-search-words property test", () => {
  it("matches the reference on 200 seeded inputs and keeps the trie within 26 nodes", () => {
    const rand = seeded(20261124);
    for (let k = 0; k < 200; k++) {
      const alphabet = rand(0, 4) === 0 ? "abcdefghijklmnopqrstuvwxyz" : "abc";
      const letter = () => alphabet[rand(0, alphabet.length - 1)];
      const word = () => Array.from({ length: rand(1, 5) }, letter).join("");
      const words = Array.from({ length: rand(1, 5) }, word);
      const pattern = Array.from({ length: rand(1, 5) }, () => (rand(0, 2) === 0 ? "." : letter())).join("");
      const input = { words, pattern };
      const steps = trace(input);
      expectWellFormed(steps, code);
      const last = steps[steps.length - 1].state;
      expect(last.result, JSON.stringify(input)).toBe(reference(input));
      expect(last.nodes.length).toBeLessThanOrEqual(26);
    }
  });

  it("the largest allowed input still fits in 26 nodes", () => {
    const input = { words: ["abcde", "fghij", "klmno", "pqrst", "uvwxy"], pattern: "....z" };
    const steps = trace(input);
    expectWellFormed(steps, code);
    expect(steps[steps.length - 1].state.nodes).toHaveLength(26);
  });
});

describe("add-search-words parseInput", () => {
  it("parses valid input", () => {
    expect(parseInput("bad dad mad | .ad")).toEqual({ words: ["bad", "dad", "mad"], pattern: ".ad" });
    expect(parseInput("Bad,Dad|B..")).toEqual({ words: ["bad", "dad"], pattern: "b.." });
  });

  it("accepts the LeetCode paste form", () => {
    expect(parseInput('["bad","dad"] | ".ad"')).toEqual({ words: ["bad", "dad"], pattern: ".ad" });
  });

  it.each([
    ["", "Enter 1–5 words"],
    ["bad dad", "Add one |"],
    ["bad | dad | x", "Add one |"],
    ["| .ad", "before the |"],
    ["a b c d e f | a", "up to 5 words"],
    ["ba7 | a", "outside a–z"],
    ["abcdef | a", "1–5 letters"],
    ["bad | ", "after the |"],
    ["bad | a b", "one pattern at a time"],
    ["bad | a-", "isn’t a–z or ."],
    ["bad | abcdef", "1–5 characters"],
  ])("%s is rejected with copy saying what is allowed", (raw, hint) => {
    const result = parseInput(raw);
    expect("error" in result).toBe(true);
    if ("error" in result) expect(result.error).toContain(hint);
  });
});
