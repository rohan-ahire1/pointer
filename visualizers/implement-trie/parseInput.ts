import type { TrieInput } from "./types";
import { stripPasteSyntax } from "../kit/paste";

/**
 * Input rules (docs/patterns/08-tries.md): up to 4 words of 1–6 letters
 * (a–z) separated by spaces or commas, a `|`, then one word to look up.
 * Uppercase is lowercased; every error says what *is* allowed.
 */
export function parseInput(input: string): TrieInput | { error: string } {
  const raw = stripPasteSyntax(input);
  if (raw.trim() === "") {
    return { error: "Enter up to 4 words of 1–6 letters (a–z), then | and a word to look up." };
  }
  const parts = raw.split("|");
  if (parts.length !== 2) {
    return { error: "Add one | between the words and the lookup, like apple app | app." };
  }
  const splitTokens = (side: string): string[] =>
    side
      .split(/[\s,]+/)
      .filter((token) => token !== "")
      .map((token) => token.toLowerCase());

  const words = splitTokens(parts[0]);
  if (words.length === 0) {
    return { error: "Enter 1–4 words of 1–6 letters (a–z) before the |." };
  }
  if (words.length > 4) {
    return { error: `Enter up to 4 words before the |. You entered ${words.length}.` };
  }
  for (const word of words) {
    if (!/^[a-z]+$/.test(word)) {
      return { error: `“${word}” has a character outside a–z. Use letters only, 1–6 per word.` };
    }
    if (word.length > 6) {
      return { error: `“${word}” is too long. Use 1–6 letters per word, up to 4 words.` };
    }
  }

  const queries = splitTokens(parts[1]);
  if (queries.length === 0) {
    return { error: "Enter one word of 1–6 letters (a–z) after the | to look up." };
  }
  if (queries.length > 1) {
    return { error: "The lookup after the | must be a single word of 1–6 letters (a–z)." };
  }
  const query = queries[0];
  if (!/^[a-z]+$/.test(query)) {
    return { error: `“${query}” has a character outside a–z. Look up 1–6 letters.` };
  }
  if (query.length > 6) {
    return { error: `“${query}” is too long. Look up a single word of 1–6 letters.` };
  }
  return { words, query };
}
