export type SearchItemKind = "pattern" | "problem" | "page";

export type SearchItem = {
  /** Stable key, e.g. "pattern:sliding-window". */
  id: string;
  kind: SearchItemKind;
  title: string;
  /** Secondary line shown under the title, and also searched against. */
  sub: string;
  href: string;
  /** Short badge text, e.g. a lesson number, a difficulty letter, or an arrow. */
  badge: string;
  /** A `var(--token)` background for the badge chip. */
  badgeBg: string;
};

export type SearchSection = {
  title: string;
  items: SearchItem[];
};
