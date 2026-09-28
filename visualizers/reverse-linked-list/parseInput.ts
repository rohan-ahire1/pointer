import type { ReverseInput } from "./types";
import { stripPasteSyntax } from "../kit/paste";

/**
 * Input rules (docs/patterns/06-linked-list.md): 1–7 node values from -99
 * to 99, head first, separated by spaces. Every error says what *is*
 * allowed.
 */
export function parseInput(input: string): ReverseInput | { error: string } {
  const raw = stripPasteSyntax(input);
  if (raw.trim() === "") {
    return { error: "Enter 1–7 numbers from -99 to 99, separated by spaces." };
  }
  const tokens = raw.trim().split(/[\s,]+/).filter((token) => token !== "");
  if (tokens.length < 1 || tokens.length > 7) {
    return { error: `Enter 1–7 numbers, separated by spaces. You entered ${tokens.length}.` };
  }
  const values: number[] = [];
  for (const token of tokens) {
    if (!/^-?\d+$/.test(token)) {
      return { error: `“${token}” isn’t a number. Use whole numbers from -99 to 99.` };
    }
    const v = Number(token);
    if (v < -99 || v > 99) {
      return { error: `${v} is out of range. Use whole numbers from -99 to 99.` };
    }
    values.push(v);
  }
  return values;
}
