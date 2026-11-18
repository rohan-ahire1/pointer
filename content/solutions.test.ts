import ts from "typescript";
import { describe, expect, it } from "vitest";
import { seeded } from "../visualizers/kit/test-helpers";
import { getProblems } from "./index";
import { SOLUTIONS } from "./solutions";

type Rand = (min: number, max: number) => number;

/** Compile a solution's TypeScript and hand back the function or class it declares. */
function load(code: string): (...args: never[]) => unknown {
  const name = /^(?:function|class) (\w+)/m.exec(code)?.[1];
  if (!name) throw new Error("No function or class at the top of the solution");
  const js = ts.transpileModule(code, {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.None },
  }).outputText;
  return new Function(`${js}\nreturn ${name};`)();
}

const ints = (int: Rand, min: number, max: number, lo: number, hi: number) =>
  Array.from({ length: int(min, max) }, () => int(lo, hi));

/** Builds an encoded string and its decoding together, for Decode String. */
function encoded(int: Rand, depth: number): [string, string] {
  let enc = "";
  let dec = "";
  for (let part = int(1, 3); part > 0; part--) {
    if (depth > 0 && int(0, 1)) {
      const times = int(1, 12);
      const [e, d] = encoded(int, depth - 1);
      enc += `${times}[${e}]`;
      dec += d.repeat(times);
    } else {
      const letters = "abcxyz".slice(0, int(1, 3));
      enc += letters;
      dec += letters;
    }
  }
  return [enc, dec];
}

/** Builds an expression and its value together, for Basic Calculator II. */
function expression(int: Rand): [string, number] {
  const space = () => " ".repeat(int(0, 1) * int(0, 2));
  let text = "";
  let total = 0;
  for (let t = int(1, 4); t > 0; t--) {
    const sign = text === "" ? 1 : int(0, 1) ? 1 : -1;
    if (text !== "") text += space() + (sign > 0 ? "+" : "-") + space();
    let value = int(0, 200);
    text += value;
    for (let f = int(0, 3); f > 0; f--) {
      const times = int(0, 1) === 1;
      const n = times ? int(0, 30) : int(1, 30);
      text += space() + (times ? "*" : "/") + space() + n;
      value = times ? value * n : Math.trunc(value / n);
    }
    total += sign * value;
  }
  return [space() + text + space(), total];
}

type Check = { cases: (int: Rand) => { args: unknown[]; want: unknown } };

const CHECKS: Record<string, Check> = {
  "daily-temperatures": {
    cases: (int) => {
      const temps = ints(int, 1, 12, 30, 40);
      const want = temps.map((t, i) => {
        const j = temps.findIndex((u, k) => k > i && u > t);
        return j === -1 ? 0 : j - i;
      });
      return { args: [temps], want };
    },
  },
  "largest-rectangle-in-histogram": {
    cases: (int) => {
      const h = ints(int, 1, 12, 0, 9);
      let best = 0;
      for (let i = 0; i < h.length; i++)
        for (let j = i; j < h.length; j++) best = Math.max(best, Math.min(...h.slice(i, j + 1)) * (j - i + 1));
      return { args: [h], want: best };
    },
  },
  "trapping-rain-water": {
    cases: (int) => {
      const h = ints(int, 0, 14, 0, 6);
      let water = 0;
      h.forEach((x, i) => {
        water += Math.min(Math.max(...h.slice(0, i + 1)), Math.max(...h.slice(i))) - x;
      });
      return { args: [h], want: water };
    },
  },
  "sliding-window-maximum": {
    cases: (int) => {
      const nums = ints(int, 1, 12, -5, 5);
      const k = int(1, nums.length);
      const want = nums.slice(0, nums.length - k + 1).map((_, i) => Math.max(...nums.slice(i, i + k)));
      return { args: [nums, k], want };
    },
  },
  "decode-string": {
    cases: (int) => {
      const [enc, dec] = encoded(int, 3);
      return { args: [enc], want: dec };
    },
  },
  "basic-calculator-ii": {
    cases: (int) => {
      const [text, value] = expression(int);
      return { args: [text], want: value };
    },
  },
};

describe("worked solutions", () => {
  it("only cover real problems, and every one has a check", () => {
    const slugs = new Set(getProblems().map((p) => p.slug));
    for (const slug of Object.keys(SOLUTIONS)) {
      expect(slugs.has(slug), slug).toBe(true);
      expect(CHECKS[slug], `add a check for ${slug}`).toBeDefined();
    }
  });

  it("show Python too", () => {
    for (const [slug, { py }] of Object.entries(SOLUTIONS)) {
      expect(py, slug).toMatch(/^(def|class) \w+|^from /m);
      expect(py, slug).not.toMatch(/\t/);
    }
  });

  for (const [slug, solution] of Object.entries(SOLUTIONS)) {
    it(`${slug} matches brute force on 300 random inputs`, () => {
      const run = load(solution.ts);
      const check = CHECKS[slug];
      const int = seeded(slug.length * 7919);
      for (let k = 0; k < 300; k++) {
        const { args, want } = check.cases(int);
        const copy = structuredClone(args);
        expect((run as (...a: unknown[]) => unknown)(...copy), JSON.stringify(args)).toEqual(want);
      }
    });
  }
});
