import { stripPasteSyntax } from "../kit/paste";
import type { CountingBitsInput } from "./types";

const RULE = "one whole number n from 0 to 16, like 5";

/** One whole number from 0 to 16. LeetCode's `n = 5` works too. Every error says what *is* allowed. */
export function parseInput(input: string): CountingBitsInput | { error: string } {
  const raw = stripPasteSyntax(input).replace(/^\s*n\s*=/i, " ");
  const tokens = raw.split(/[\s,]+/).filter((token) => token !== "");
  if (tokens.length === 0) return { error: `Enter ${RULE}.` };
  if (tokens.length > 1) return { error: `Enter ${RULE}. You entered ${tokens.length} values.` };
  const token = tokens[0];
  if (!/^-?\d+$/.test(token)) return { error: `“${token}” isn’t a whole number. Use ${RULE}.` };
  const n = Number(token);
  if (n < 0 || n > 16) return { error: `${n} is out of range. Use ${RULE}.` };
  return { n };
}
