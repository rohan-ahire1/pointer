import { describe, expect, it } from "vitest";
import { expectWellFormed, mustParse, seeded } from "../kit/test-helpers";
import { code } from "./code";
import { meta } from "./meta";
import { parseInput } from "./parseInput";
import { trace } from "./trace";

/** Shortest length of a substring covering t, or 0 if none does. */
function bruteForce(s: string, t: string): number {
  const counts = (text: string) => {
    const map = new Map<string, number>();
    for (const ch of text) map.set(ch, (map.get(ch) ?? 0) + 1);
    return map;
  };
  const want = counts(t);
  let best = 0;
  for (let a = 0; a < s.length; a++) {
    for (let b = a + 1; b <= s.length; b++) {
      const have = counts(s.slice(a, b));
      const covers = [...want].every(([ch, n]) => (have.get(ch) ?? 0) >= n);
      if (covers && (best === 0 || b - a < best)) best = b - a;
    }
  }
  return best;
}

const answer = (s: string, t: string) => {
  const steps = trace({ s, t });
  const { best } = steps[steps.length - 1].state;
  return best ? s.slice(best.start, best.end + 1) : "";
};

describe("min-window", () => {
  it("matches the worked examples", () => {
    expect(answer("ADOBECODEBANC", "ABC")).toBe("BANC");
    expect(answer("aab", "ab")).toBe("ab");
    expect(answer("abc", "d")).toBe("");
  });

  it("needs repeats too", () => {
    expect(answer("aa", "aa")).toBe("aa");
    expect(answer("a", "aa")).toBe("");
  });

  it("every preset is well formed", () => {
    for (const preset of meta.presets) expectWellFormed(trace(mustParse(parseInput, preset)), code);
  });

  it("matches brute force on 300 random inputs", () => {
    const int = seeded(20261032);
    const letters = (length: number) => Array.from({ length }, () => "abc"[int(0, 2)]).join("");
    for (let k = 0; k < 300; k++) {
      const s = letters(int(1, 13));
      const t = letters(int(1, 5));
      expectWellFormed(trace({ s, t }), code);
      expect(answer(s, t).length).toBe(bruteForce(s, t));
    }
  });

  it("rejects bad input", () => {
    expect(parseInput("abc")).toHaveProperty("error");
    expect(parseInput("ab1 | a")).toHaveProperty("error");
    expect(parseInput("abc | abcdef")).toHaveProperty("error");
  });
});
