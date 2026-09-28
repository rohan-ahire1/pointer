import type { LcsInput } from "./types";

/**
 * Input rules (docs/patterns/13-2-d-dp.md): two words of 1–6 lowercase
 * letters, separated by a space. Uppercase is lowercased; every error says
 * what *is* allowed.
 */
export function parseInput(raw: string): LcsInput | { error: string } {
  if (raw.trim() === "") {
    return { error: "Enter two words of 1–6 letters (a–z), separated by a space." };
  }
  const words = raw
    .split(/[\s,]+/)
    .filter((token) => token !== "")
    .map((token) => token.toLowerCase());
  if (words.length !== 2) {
    return { error: "Enter two words of 1–6 letters (a–z), separated by a space." };
  }
  for (const word of words) {
    if (!/^[a-z]+$/.test(word)) {
      return { error: `“${word}” has a character outside a–z. Use letters only, 1–6 per word.` };
    }
    if (word.length > 6) {
      return { error: `“${word}” is too long. Use 1–6 letters per word.` };
    }
  }
  return { a: words[0], b: words[1] };
}
