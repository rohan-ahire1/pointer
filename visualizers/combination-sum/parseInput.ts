import type { CombinationInput } from "./types";

/**
 * Input rules (docs/patterns/10-backtracking.md): 2–4 different numbers from
 * 2 to 9 separated by spaces or commas, a `|`, then one target from 1 to 10.
 * Every error says what *is* allowed.
 */
export function parseInput(raw: string): CombinationInput | { error: string } {
  if (raw.trim() === "") {
    return { error: "Enter 2–4 different numbers from 2 to 9, then | and a target from 1 to 10." };
  }
  const parts = raw.split("|");
  if (parts.length !== 2) {
    return { error: "Add one | between the candidates and the target, like 2 3 6 7 | 7." };
  }
  const splitTokens = (side: string): string[] =>
    side.split(/[\s,]+/).filter((token) => token !== "");

  const candidateTokens = splitTokens(parts[0]);
  if (candidateTokens.length === 0) {
    return { error: "Enter 2–4 different numbers from 2 to 9 before the |." };
  }
  if (candidateTokens.length < 2 || candidateTokens.length > 4) {
    return { error: `Enter 2–4 candidates before the |. You entered ${candidateTokens.length}.` };
  }
  const candidates: number[] = [];
  for (const token of candidateTokens) {
    if (!/^-?\d+$/.test(token)) {
      return { error: `“${token}” isn’t a whole number. Use numbers from 2 to 9.` };
    }
    const n = Number(token);
    if (n < 2 || n > 9) {
      return { error: `${n} is out of range. Use numbers from 2 to 9.` };
    }
    if (candidates.includes(n)) {
      return { error: `You repeated ${n}. Use 2–4 different numbers from 2 to 9.` };
    }
    candidates.push(n);
  }

  const targetTokens = splitTokens(parts[1]);
  if (targetTokens.length !== 1 || !/^-?\d+$/.test(targetTokens[0])) {
    return { error: "The target after the | must be one whole number from 1 to 10." };
  }
  const target = Number(targetTokens[0]);
  if (target < 1 || target > 10) {
    return { error: `${target} is out of range. The target must be from 1 to 10.` };
  }
  return { candidates, target };
}
