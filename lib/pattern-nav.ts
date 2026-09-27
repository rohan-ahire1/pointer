import { getPatterns, type Pattern } from "@/content";

export type AdjacentPattern = {
  slug: string;
  name: string;
  number: number;
};

function toAdjacent(pattern: Pattern | undefined): AdjacentPattern | undefined {
  if (!pattern) return undefined;
  return { slug: pattern.slug, name: pattern.name, number: pattern.number };
}

/** The pattern immediately before/after `slug` in lesson order (by `number`), for lesson-bar prev/next. */
export function getAdjacentPatterns(slug: string): { prev?: AdjacentPattern; next?: AdjacentPattern } {
  const patterns = getPatterns();
  const index = patterns.findIndex((pattern) => pattern.slug === slug);
  if (index === -1) return {};
  return {
    prev: toAdjacent(patterns[index - 1]),
    next: toAdjacent(patterns[index + 1]),
  };
}

/** "03" for 3, "12" for 12 — matches the mocks' 2-digit lesson numbers. */
export function padPatternNumber(number: number): string {
  return number < 10 ? `0${number}` : String(number);
}
