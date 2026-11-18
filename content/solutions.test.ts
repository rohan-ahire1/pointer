import ts from "typescript";
import { describe, expect, it } from "vitest";
import { seeded } from "../visualizers/kit/test-helpers";
import { getProblems } from "./index";
import { SOLUTIONS } from "./solutions";

type Rand = (min: number, max: number) => number;

/** Compile a solution's TypeScript and hand back the function or class it declares. */
function load(code: string, export_?: string): (...args: never[]) => unknown {
  const name = export_ ?? /^(?:function|class) (\w+)/m.exec(code)?.[1];
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

type Check =
  | { cases: (int: Rand) => { args: unknown[]; want: unknown } }
  /** More than one answer is right: check the one returned. */
  | { judge: (int: Rand) => { args: unknown[]; ok: (got: unknown) => boolean } }
  /** A design problem: drive the class with random calls and compare with a plain model. */
  | { name?: string; calls: (Class: new (...args: never[]) => Record<string, (...a: never[]) => unknown>, int: Rand) => void };

/** Calls a method on an instance from a design problem. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const call = (obj: any, method: string, ...args: unknown[]): unknown => obj[method](...args);

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
  "min-stack": {
    calls: (MinStack, int) => {
      const stack = new MinStack();
      const model: number[] = [];
      for (let k = int(1, 20); k > 0; k--) {
        if (model.length && int(0, 2) === 0) {
          call(stack, "pop");
          model.pop();
        } else {
          const val = int(-9, 9);
          call(stack, "push", val);
          model.push(val);
        }
        if (model.length) {
          expect(call(stack, "top")).toBe(model.at(-1));
          expect(call(stack, "getMin")).toBe(Math.min(...model));
        }
      }
    },
  },
  "lru-cache": {
    name: "LRUCache",
    calls: (LRUCache, int) => {
      const capacity = int(1, 4);
      const cache = new (LRUCache as unknown as new (capacity: number) => object)(capacity);
      let order: [number, number][] = [];
      for (let k = int(1, 25); k > 0; k--) {
        const key = int(0, 6);
        const found = order.find(([k2]) => k2 === key);
        if (int(0, 1)) {
          expect(call(cache, "get", key)).toBe(found ? found[1] : -1);
          if (found) order = [...order.filter((e) => e !== found), found];
        } else {
          const value = int(0, 99);
          call(cache, "put", key, value);
          order = [...order.filter(([k2]) => k2 !== key), [key, value]];
          if (order.length > capacity) order = order.slice(1);
        }
      }
    },
  },
  "time-based-key-value-store": {
    calls: (TimeMap, int) => {
      const map = new TimeMap();
      const model: [string, string, number][] = [];
      let time = 0;
      for (let k = int(1, 25); k > 0; k--) {
        const key = "ab"[int(0, 1)];
        if (int(0, 1)) {
          time += int(1, 3);
          const value = `v${k}`;
          call(map, "set", key, value, time);
          model.push([key, value, time]);
        } else {
          const at = int(0, time + 2);
          const hits = model.filter(([k2, , t]) => k2 === key && t <= at);
          expect(call(map, "get", key, at)).toBe(hits.length ? hits.at(-1)![1] : "");
        }
      }
    },
  },
  "insert-delete-getrandom-o1": {
    calls: (RandomizedSet, int) => {
      const set = new RandomizedSet();
      const model = new Set<number>();
      for (let k = int(1, 25); k > 0; k--) {
        const val = int(0, 6);
        const pick = int(0, 2);
        if (pick === 0) {
          expect(call(set, "insert", val)).toBe(!model.has(val));
          model.add(val);
        } else if (pick === 1) {
          expect(call(set, "remove", val)).toBe(model.has(val));
          model.delete(val);
        } else if (model.size) {
          for (let draw = 0; draw < 5; draw++) expect(model.has(call(set, "getRandom") as number)).toBe(true);
        }
      }
    },
  },
  "binary-search": {
    cases: (int) => {
      const nums = [...new Set(ints(int, 1, 20, -50, 50))].sort((a, b) => a - b);
      const target = int(-55, 55);
      return { args: [nums, target], want: nums.indexOf(target) };
    },
  },
  "search-a-2d-matrix": {
    cases: (int) => {
      const rows = int(1, 5);
      const cols = int(1, 5);
      const flat = [...new Set(ints(int, 40, 40, -60, 60))].slice(0, rows * cols).sort((a, b) => a - b);
      const width = Math.min(cols, flat.length);
      const matrix = Array.from({ length: Math.ceil(flat.length / width) }, (_, r) => flat.slice(r * width, (r + 1) * width)).filter((row) => row.length === width);
      const target = int(-62, 62);
      return { args: [matrix, target], want: matrix.flat().includes(target) };
    },
  },
  "find-first-and-last-position-of-element-in-sorted-array": {
    cases: (int) => {
      const nums = ints(int, 0, 15, -5, 5).sort((a, b) => a - b);
      const target = int(-6, 6);
      return { args: [nums, target], want: [nums.indexOf(target), nums.lastIndexOf(target)] };
    },
  },
  "find-peak-element": {
    judge: (int) => {
      const nums = [int(-9, 9)];
      for (let n = int(0, 15); n > 0; n--) {
        let v = int(-9, 9);
        while (v === nums.at(-1)) v = int(-9, 9);
        nums.push(v);
      }
      const at = (i: number) => (i < 0 || i >= nums.length ? -Infinity : nums[i]);
      return { args: [nums], ok: (got) => typeof got === "number" && at(got) > at(got - 1) && at(got) > at(got + 1) };
    },
  },
  "koko-eating-bananas": {
    cases: (int) => {
      const piles = ints(int, 1, 10, 1, 60);
      const h = int(piles.length, 80);
      let k = 1;
      while (piles.reduce((sum, p) => sum + Math.ceil(p / k), 0) > h) k++;
      return { args: [piles, h], want: k };
    },
  },
  "split-array-largest-sum": {
    cases: (int) => {
      const nums = ints(int, 1, 9, 0, 30);
      const k = int(1, nums.length);
      // Brute force: try every place to end the first piece.
      const best = (i: number, parts: number): number => {
        const rest = nums.slice(i).reduce((a, b) => a + b, 0);
        if (parts === 1) return rest;
        let out = Infinity;
        let first = 0;
        for (let j = i + 1; j <= nums.length - parts + 1; j++) {
          first += nums[j - 1];
          out = Math.min(out, Math.max(first, best(j, parts - 1)));
        }
        return out;
      };
      return { args: [nums, k], want: best(0, k) };
    },
  },
  "median-of-two-sorted-arrays": {
    cases: (int) => {
      const a = ints(int, 0, 8, -20, 20).sort((x, y) => x - y);
      const b = ints(int, a.length ? 0 : 1, 8, -20, 20).sort((x, y) => x - y);
      const all = [...a, ...b].sort((x, y) => x - y);
      const mid = all.length >> 1;
      const want = all.length % 2 ? all[mid] : (all[mid - 1] + all[mid]) / 2;
      return { args: [a, b], want };
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
      const check = CHECKS[slug];
      const int = seeded(slug.length * 7919);
      if ("calls" in check) {
        const Class = load(solution.ts, check.name) as unknown as Parameters<typeof check.calls>[0];
        for (let k = 0; k < 300; k++) check.calls(Class, int);
        return;
      }
      const run = load(solution.ts) as (...a: unknown[]) => unknown;
      if ("judge" in check) {
        for (let k = 0; k < 300; k++) {
          const { args, ok } = check.judge(int);
          const got = run(...structuredClone(args));
          expect(ok(got), `${JSON.stringify(args)} gave ${JSON.stringify(got)}`).toBe(true);
        }
        return;
      }
      for (let k = 0; k < 300; k++) {
        const { args, want } = check.cases(int);
        const copy = structuredClone(args);
        expect(run(...copy), JSON.stringify(args)).toEqual(want);
      }
    });
  }
});
