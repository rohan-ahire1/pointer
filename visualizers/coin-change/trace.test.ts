import { describe, expect, it } from "vitest";
import { expectWellFormed, mustParse, seeded } from "../kit/test-helpers";
import { code } from "./code";
import { meta } from "./meta";
import { parseInput } from "./parseInput";
import { trace } from "./trace";

/** Tries every combination, smallest number of coins first. */
function bruteForce(coins: number[], amount: number): number | null {
  let reachable = new Set([0]);
  for (let used = 0; used <= amount; used++) {
    if (reachable.has(amount)) return used;
    const next = new Set<number>();
    for (const total of reachable) for (const coin of coins) if (total + coin <= amount) next.add(total + coin);
    reachable = next;
  }
  return null;
}

describe("coin-change", () => {
  it("matches the worked examples", () => {
    const answer = (raw: string) => {
      const steps = trace(mustParse(parseInput, raw));
      const { dp, amount } = steps[steps.length - 1].state;
      return dp[amount];
    };
    expect(answer("1 2 5 | 11")).toBe(3);
    expect(answer("2 | 3")).toBeNull();
    expect(answer("1 3 4 | 6")).toBe(2);
  });

  it("every preset is well formed", () => {
    for (const preset of meta.presets) expectWellFormed(trace(mustParse(parseInput, preset)), code);
  });

  it("matches brute force on 300 random inputs", () => {
    const int = seeded(20261040);
    for (let k = 0; k < 300; k++) {
      const coins = [...new Set(Array.from({ length: int(1, 4) }, () => int(1, 20)))];
      const amount = int(1, 12);
      const steps = trace({ coins, amount });
      expectWellFormed(steps, code);
      expect(steps[steps.length - 1].state.dp[amount]).toBe(bruteForce(coins, amount));
    }
  });

  it("rejects bad input", () => {
    expect(parseInput("1 2")).toHaveProperty("error");
    expect(parseInput("1 1 | 2")).toHaveProperty("error");
    expect(parseInput("0 | 2")).toHaveProperty("error");
    expect(parseInput("1 | 20")).toHaveProperty("error");
  });
});
