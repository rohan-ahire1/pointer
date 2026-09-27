import type { ParensInput } from "./types";

/**
 * Input rules (docs/patterns/04-stack.md): up to 12 brackets, anything else
 * is stripped — like Sliding Window, extra brackets past the limit are
 * dropped too. Nothing left after stripping is an error, not an empty
 * trace.
 */
export function parseInput(raw: string): ParensInput | { error: string } {
  const cleaned = raw.replace(/[^()[\]{}]/g, "").slice(0, 12);
  if (cleaned.length === 0) {
    return { error: "Enter 1–12 brackets: ( ) [ ] { }. Anything else is ignored." };
  }
  return cleaned;
}
