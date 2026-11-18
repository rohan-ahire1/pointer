import { describe, expect, it } from "vitest";
import { expectWellFormed, mustParse, seeded } from "../kit/test-helpers";
import { code } from "./code";
import { meta } from "./meta";
import { parseInput } from "./parseInput";
import { trace } from "./trace";
import type { LruCall } from "./types";

/** A plain array kept in order of use, scanned on every call. */
function bruteForce(capacity: number, calls: LruCall[]) {
  let order: { key: number; value: number }[] = [];
  const results: (number | null)[] = [];
  for (const c of calls) {
    const found = order.find((n) => n.key === c.key);
    if (c.op === "get") {
      results.push(found ? found.value : -1);
      if (found) order = [...order.filter((n) => n !== found), found];
    } else {
      results.push(null);
      order = [...order.filter((n) => n.key !== c.key), { key: c.key, value: c.value }];
      if (order.length > capacity) order = order.slice(1);
    }
  }
  return { results, order };
}

describe("lru-cache", () => {
  it("matches LeetCode's example", () => {
    const steps = trace(mustParse(parseInput, meta.presets[0]));
    const last = steps[steps.length - 1].state;
    expect(last.results.filter((r) => r !== null)).toEqual([1, -1, -1, 3, 4]);
    expect(last.list.map((n) => n.key)).toEqual([3, 4]);
  });

  it("every preset is well formed and fits the step budget", () => {
    for (const preset of meta.presets) expectWellFormed(trace(mustParse(parseInput, preset)), code, 60);
  });

  it("matches brute force on 300 random inputs", () => {
    const int = seeded(20261146);
    for (let k = 0; k < 300; k++) {
      const capacity = int(1, 4);
      const calls: LruCall[] = Array.from({ length: int(1, 10) }, () =>
        int(0, 1) ? { op: "get", key: int(0, 5) } : { op: "put", key: int(0, 5), value: int(0, 99) },
      );
      const steps = trace({ capacity, calls });
      expectWellFormed(steps, code, 60);
      const want = bruteForce(capacity, calls);
      const last = steps[steps.length - 1].state;
      expect(last.results).toEqual(want.results);
      expect(last.list).toEqual(want.order);
      // Like the code, a new node goes on before the oldest comes off, so only an insert can run one over.
      for (const step of steps) {
        const limit = step.state.phase === "insert" ? capacity + 1 : capacity;
        expect(step.state.list.length).toBeLessThanOrEqual(limit);
      }
    }
  });

  it("rejects bad input", () => {
    expect(parseInput("put 1 1")).toHaveProperty("error");
    expect(parseInput("5 | put 1 1")).toHaveProperty("error");
    expect(parseInput("2 | put 10 1")).toHaveProperty("error");
    expect(parseInput("2 | push 1")).toHaveProperty("error");
    expect(parseInput("2 | ")).toHaveProperty("error");
  });
});
