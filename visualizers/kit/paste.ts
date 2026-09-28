/**
 * Lets people paste LeetCode-style input such as [2,7,11,15] or
 * ["apple","app"]. Brackets and quotes become spaces, and every parser
 * already splits on spaces and commas. Not for Valid Parentheses, where
 * brackets are the input.
 */
export function stripPasteSyntax(raw: string): string {
  return raw.replace(/[[\]"']/g, " ");
}
