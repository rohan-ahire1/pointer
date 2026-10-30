import { stripPasteSyntax } from "./paste";

type NumberRules = { min: number; max: number; minCount: number; maxCount: number };

/** Whole numbers separated by spaces or commas, with errors that say what *is* allowed. */
export function parseNumbers(input: string, rules: NumberRules): number[] | { error: string } {
  const { min, max, minCount, maxCount } = rules;
  const rule = `${minCount}–${maxCount} whole numbers from ${min} to ${max}`;
  const tokens = stripPasteSyntax(input)
    .split(/[\s,]+/)
    .filter((token) => token !== "");
  if (tokens.length === 0) return { error: `Enter ${rule}.` };
  if (tokens.length < minCount || tokens.length > maxCount) {
    return { error: `Enter ${rule}. You entered ${tokens.length}.` };
  }
  const nums: number[] = [];
  for (const token of tokens) {
    if (!/^-?\d+$/.test(token)) return { error: `“${token}” isn’t a whole number. Use ${rule}.` };
    const n = Number(token);
    if (n < min || n > max) return { error: `${n} is out of range. Use ${rule}.` };
    nums.push(n);
  }
  return nums;
}

/** Splits `left | right` input, or says how to write it. */
export function splitOnBar(input: string, example: string): [string, string] | { error: string } {
  const parts = input.split("|");
  if (parts.length !== 2) return { error: `Add one | between the two parts, like ${example}.` };
  return [parts[0], parts[1]];
}
