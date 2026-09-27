import type { Pattern } from "@/content";
import { padPatternNumber } from "./pattern-nav";

/** The 5-colour chip rotation used for pattern number badges across the mocks (Home, Patterns, Search). */
const CHIP_COLORS: readonly string[] = [
  "var(--yellow)",
  "var(--mint)",
  "var(--lilac)",
  "var(--peach)",
  "var(--sky)",
];

/** Cycles through CHIP_COLORS by lesson number (1-indexed), matching design/mocks' `CHIPS[i % 5]`. */
export function chipColorForNumber(number: number): string {
  return CHIP_COLORS[(number - 1) % CHIP_COLORS.length];
}

/** "01–05" for a group's patterns, sorted by `number` — the range label on Home's group headers. */
export function groupNumberRange(patterns: Pattern[]): string {
  if (patterns.length === 0) return "";
  const numbers = patterns.map((p) => p.number);
  const min = Math.min(...numbers);
  const max = Math.max(...numbers);
  return min === max ? padPatternNumber(min) : `${padPatternNumber(min)}–${padPatternNumber(max)}`;
}
