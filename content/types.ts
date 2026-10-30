/**
 * Content model for patterns.json and problems.json (see design/data/*.json
 * for the hand-authored source; these types model the copies in this
 * folder field-for-field — nothing here is speculative).
 */

/** The three super-groups patterns are bucketed into on /patterns. */
export type PatternGroup = "foundations" | "structures" | "advanced";

export type Difficulty = "easy" | "medium" | "hard";

/** One entry in a lesson's 60-second explainer video transcript. */
export type VideoTranscriptEntry = {
  /** Seconds from the start of the video. */
  t: number;
  text: string;
};

export type PatternVideo = {
  /** Still frame shown before playback, e.g. "/video/two-sum.jpg". */
  poster?: string;
  durationSec: number;
  /** Path to the WebVTT captions, e.g. "/video/two-sum.vtt", or a `[BRACKETED]` placeholder. */
  captions: string;
  transcript: VideoTranscriptEntry[];
};

type PatternBase = {
  /** 1-indexed position, 1..15, also shown as the lesson number. */
  number: number;
  slug: string;
  name: string;
  group: PatternGroup;
  /** One-line summary shown on the patterns grid. */
  idea: string;
  /** Problem slugs (see Problem["slug"]) taught by this pattern. */
  problems: string[];
  /**
   * Short "reach for it when" teaser. Present on the live pattern and on a
   * few "soon" patterns that already have copy drafted; optional here
   * because most "soon" patterns don't have it yet.
   */
  analogy?: string;
};

export type SoonPattern = PatternBase & {
  status: "soon";
};

export type LivePattern = PatternBase & {
  status: "live";
  /** Required (not just teased) once a pattern is live. */
  analogy: string;
  minutes: number;
  /** Prerequisite concepts, e.g. ["arrays", "sets"]. */
  needs: string[];
  /** Big-O time complexity of the reference solution, e.g. "O(n)". */
  complexity: string;
  /** Big-O extra space of the reference solution, e.g. "O(1)". */
  space: string;
  /** Bullet list for the "Reach for it when…" callout. */
  whenToUse: string[];
  video: PatternVideo;
  /** Matches a key in the visualizers registry (visualizers/index.ts). */
  visualizer: string;
  /** Further visualizers offered beside the main one, in the order shown. */
  moreVisualizers?: string[];
};

/** A discriminated union on `status`: `"soon"` patterns show the coming-soon state. */
export type Pattern = SoonPattern | LivePattern;

export type Problem = {
  slug: string;
  title: string;
  difficulty: Difficulty;
  /** A Pattern["slug"], or the special "extras" bucket (see EXTRAS_KEY in content/index.ts). */
  pattern: string;
  leetcodeUrl: string;
  premium: boolean;
  /**
   * Pattern-page card copy ("Warm-up: …"), only written for the live
   * pattern's problems so far.
   */
  twist?: string;
  /** The problem in our own plain words, with no clue to the pattern. Used by the drill and review queue. */
  prompt: string;
  /** What gives the pattern away: the hint shown after you've had a go. */
  signal: string;
  /** Big-O of the best known approach. */
  time: string;
  space: string;
  /** Other patterns that fairly solve it, so the drill never offers them as wrong answers. */
  alsoFits?: string[];
  /** Id of a visualizer that runs this exact problem (visualizers/index.ts). */
  visualizer?: string;
};
