/**
 * Input rules (design/visualizer-spec.md): lowercase a–z only, max 10
 * characters, anything else is stripped. An empty result (nothing left
 * after stripping, or nothing typed) is an error rather than a valid
 * zero-length trace.
 */
export function parseInput(raw: string): string | { error: string } {
  const cleaned = raw.toLowerCase().replace(/[^a-z]/g, "").slice(0, 10);
  if (cleaned.length === 0) {
    return { error: "Enter at least one lowercase letter (a–z)." };
  }
  return cleaned;
}
