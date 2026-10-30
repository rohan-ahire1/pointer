import { parseNumbers, splitOnBar } from "../kit/parseNumbers";
import type { CoinChangeInput } from "./types";

export function parseInput(input: string): CoinChangeInput | { error: string } {
  const parts = splitOnBar(input, "1 2 5 | 11");
  if ("error" in parts) return parts;
  const coins = parseNumbers(parts[0], { min: 1, max: 20, minCount: 1, maxCount: 4 });
  if ("error" in coins) return coins;
  if (new Set(coins).size !== coins.length) return { error: "Use 1–4 different coins from 1 to 20." };
  const amount = parseNumbers(parts[1], { min: 1, max: 12, minCount: 1, maxCount: 1 });
  if ("error" in amount) return { error: "After the |, enter one amount from 1 to 12." };
  return { coins, amount: amount[0] };
}
