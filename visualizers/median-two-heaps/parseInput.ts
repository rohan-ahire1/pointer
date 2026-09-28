import type { MedianInput } from "./types";
import { stripPasteSyntax } from "../kit/paste";

/**
 * Input rules (docs/patterns/09-heaps.md): 1–8 whole numbers from -99 to 99
 * separated by spaces or commas, in the order they arrive. Every error says
 * what *is* allowed.
 */
export function parseInput(input: string): MedianInput | { error: string } {
  const raw = stripPasteSyntax(input);
  if (raw.trim() === "") {
    return { error: "Enter 1–8 numbers from -99 to 99, in the order they arrive." };
  }
  const tokens = raw.split(/[\s,]+/).filter((token) => token !== "");
  if (tokens.length === 0) {
    return { error: "Enter 1–8 numbers from -99 to 99, in the order they arrive." };
  }
  if (tokens.length > 8) {
    return { error: `Enter 1–8 numbers from -99 to 99. You entered ${tokens.length}.` };
  }
  const stream: number[] = [];
  for (const token of tokens) {
    if (!/^-?\d+$/.test(token)) {
      return { error: `“${token}” isn’t a whole number. Use numbers from -99 to 99.` };
    }
    const n = Number(token);
    if (n < -99 || n > 99) {
      return { error: `${n} is out of range. Use whole numbers from -99 to 99.` };
    }
    stream.push(n);
  }
  return stream;
}
