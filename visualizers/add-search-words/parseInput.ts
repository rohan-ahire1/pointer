import type { AddSearchInput } from "./types";
import { stripPasteSyntax } from "../kit/paste";
import { splitOnBar } from "../kit/parseNumbers";

const RULE = "1–5 words of 1–5 letters (a–z), then | and a pattern of 1–5 characters (a–z, or . for any letter)";

/**
 * Input rules: words to add, a `|`, then one search pattern, like
 * `bad dad mad | .ad`. 1–5 words of 1–5 lowercase letters and a pattern of
 * 1–5 characters from a–z or `.`. Every error says what *is* allowed.
 */
export function parseInput(input: string): AddSearchInput | { error: string } {
  const raw = stripPasteSyntax(input);
  if (raw.trim() === "") return { error: `Enter ${RULE}.` };
  const parts = splitOnBar(raw, "bad dad mad | .ad");
  if ("error" in parts) return parts;

  const tokens = (side: string): string[] =>
    side
      .split(/[\s,]+/)
      .filter((token) => token !== "")
      .map((token) => token.toLowerCase());

  const words = tokens(parts[0]);
  if (words.length === 0) return { error: "Enter 1–5 words of 1–5 letters (a–z) before the |." };
  if (words.length > 5) return { error: `Enter up to 5 words before the |. You entered ${words.length}.` };
  for (const word of words) {
    if (!/^[a-z]+$/.test(word)) {
      return { error: `“${word}” has a character outside a–z. Words use letters only, 1–5 per word.` };
    }
    if (word.length > 5) return { error: `“${word}” is too long. Use 1–5 letters per word.` };
  }

  const patterns = tokens(parts[1]);
  if (patterns.length === 0) return { error: "Enter one pattern of 1–5 characters (a–z, or .) after the |." };
  if (patterns.length > 1) return { error: "Search one pattern at a time: 1–5 characters (a–z, or .) after the |." };
  const pattern = patterns[0];
  if (!/^[a-z.]+$/.test(pattern)) {
    return { error: `“${pattern}” has a character that isn’t a–z or . — use letters, or . for any letter.` };
  }
  if (pattern.length > 5) return { error: `“${pattern}” is too long. Use 1–5 characters.` };
  return { words, pattern };
}
