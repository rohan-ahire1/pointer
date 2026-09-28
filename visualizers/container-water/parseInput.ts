import type { ContainerInput } from "./types";
import { stripPasteSyntax } from "../kit/paste";

/**
 * Input rules (docs/patterns/02-two-pointers.md): 2–10 wall heights from 0
 * to 9, separated by spaces or commas. Every error says what *is* allowed.
 */
export function parseInput(input: string): ContainerInput | { error: string } {
  const raw = stripPasteSyntax(input);
  if (raw.trim() === "") {
    return { error: "Enter 2–10 wall heights from 0 to 9, separated by spaces." };
  }
  const tokens = raw.trim().split(/[\s,]+/).filter((token) => token !== "");
  if (tokens.length < 2 || tokens.length > 10) {
    return { error: `Enter 2–10 wall heights, separated by spaces. You entered ${tokens.length}.` };
  }
  const height: number[] = [];
  for (const token of tokens) {
    if (!/^-?\d+$/.test(token)) {
      return { error: `“${token}” isn’t a wall height. Use whole numbers from 0 to 9.` };
    }
    const h = Number(token);
    if (h < 0 || h > 9) {
      return { error: `${h} is out of range. Wall heights run from 0 to 9.` };
    }
    height.push(h);
  }
  return height;
}
