export type KokoInput = { piles: number[]; h: number };

export type KokoState = {
  piles: number[];
  h: number;
  /** The speeds still in play run from lo to hi. */
  lo: number;
  hi: number;
  /** The speed being tried, or null before the first guess and at the end. */
  k: number | null;
  /** Hours each pile takes at speed k, once counted. */
  each: number[] | null;
  hours: number | null;
  answer: number | null;
  phase: "setup" | "guess" | "count" | "narrow" | "done";
};
