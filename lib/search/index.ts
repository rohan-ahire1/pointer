import { EXTRAS_KEY, getPattern, getPatterns, getProblems, problemHref, type Difficulty } from "@/content";
import { chipColorForNumber } from "@/lib/pattern-style";
import { padPatternNumber } from "@/lib/pattern-nav";
import type { SearchItem, SearchSection } from "./types";

export type { SearchItem, SearchItemKind, SearchSection } from "./types";

const DIFFICULTY_LABEL: Record<Difficulty, string> = { easy: "Easy", medium: "Medium", hard: "Hard" };
const DIFFICULTY_BADGE_BG: Record<Difficulty, string> = {
  easy: "var(--mint)",
  medium: "var(--yellow)",
  hard: "var(--orange)",
};

/** The site's static pages (design/mocks/C2-Search.dc.html's "PAGES" section). */
const STATIC_PAGES: readonly { title: string; href: string }[] = [
  { title: "Home", href: "/" },
  { title: "All patterns", href: "/patterns" },
  { title: "The Blind 75 problems", href: "/problems" },
  { title: "Pattern drill", href: "/drill" },
  { title: "Cheat sheet", href: "/cheatsheet" },
  { title: "Your progress", href: "/progress" },
  { title: "About Pointer", href: "/about" },
];

/**
 * The full, static search corpus: every pattern, every problem, and every
 * page. Built fresh each call (cheap — a few dozen small objects) rather
 * than cached, so it never goes stale if content changes between renders.
 */
export function getSearchItems(): SearchItem[] {
  const patterns: SearchItem[] = getPatterns().map((pattern) => ({
    id: `pattern:${pattern.slug}`,
    kind: "pattern",
    title: pattern.name,
    sub: pattern.status === "live" ? pattern.idea : "Lesson · coming soon",
    href: `/patterns/${pattern.slug}`,
    badge: padPatternNumber(pattern.number),
    badgeBg: chipColorForNumber(pattern.number),
  }));

  const problems: SearchItem[] = getProblems().map((problem) => {
    const pattern = problem.pattern === EXTRAS_KEY ? undefined : getPattern(problem.pattern);
    return {
      id: `problem:${problem.slug}`,
      kind: "problem",
      title: problem.title,
      sub: `${DIFFICULTY_LABEL[problem.difficulty]} · ${pattern ? pattern.name : "Extras"}`,
      href: problemHref(problem),
      badge: problem.difficulty[0].toUpperCase(),
      badgeBg: DIFFICULTY_BADGE_BG[problem.difficulty],
    };
  });

  const pages: SearchItem[] = STATIC_PAGES.map((page) => ({
    id: `page:${page.href}`,
    kind: "page",
    title: page.title,
    sub: "Page",
    href: page.href,
    badge: "→",
    badgeBg: "var(--card)",
  }));

  return [...patterns, ...problems, ...pages];
}

const SECTION_TITLES: Record<SearchItem["kind"], string> = {
  pattern: "PATTERNS",
  problem: "PROBLEMS",
  page: "PAGES",
};

const DEFAULT_CAPS: Record<SearchItem["kind"], number> = { pattern: 6, problem: 8, page: 7 };

function scoreOf(item: SearchItem, q: string): number {
  const title = item.title.toLowerCase();
  if (title === q) return 0;
  if (title.startsWith(q)) return 1;
  if (title.includes(q)) return 2;
  if (item.sub.toLowerCase().includes(q)) return 3;
  return -1;
}

/**
 * Filters + ranks `items` against `query`, grouped into PATTERNS / PROBLEMS
 * / PAGES sections (in that order), each capped so the palette never has to
 * scroll through all 75 problems. An empty (or all-whitespace) query
 * matches nothing — the palette shows a "start typing" hint instead of a
 * full, unfiltered list.
 *
 * Ranking: an exact title match first, then a title that starts with the
 * query, then any title match, then a match only in the subtitle (e.g. a
 * problem found by its pattern's name). Ties keep the items' original
 * (content) order.
 */
export function searchItems(
  items: SearchItem[],
  query: string,
  caps: Partial<Record<SearchItem["kind"], number>> = {},
): SearchSection[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const effectiveCaps = { ...DEFAULT_CAPS, ...caps };
  const byKind: Record<SearchItem["kind"], SearchItem[]> = { pattern: [], problem: [], page: [] };

  items
    .map((item, index) => ({ item, index, score: scoreOf(item, q) }))
    .filter((entry) => entry.score >= 0)
    .sort((a, b) => a.score - b.score || a.index - b.index)
    .forEach(({ item }) => byKind[item.kind].push(item));

  return (Object.keys(SECTION_TITLES) as SearchItem["kind"][])
    .map((kind) => ({ title: SECTION_TITLES[kind], items: byKind[kind].slice(0, effectiveCaps[kind]) }))
    .filter((section) => section.items.length > 0);
}

/** Flattens ranked sections back into one ordered list, for arrow-key navigation across section boundaries. */
export function flattenSections(sections: SearchSection[]): SearchItem[] {
  return sections.flatMap((section) => section.items);
}

/** Total number of items across all sections, for the palette's "N results" live region. */
export function countItems(sections: SearchSection[]): number {
  return sections.reduce((sum, section) => sum + section.items.length, 0);
}
