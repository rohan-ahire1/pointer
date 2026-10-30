export type MinWindowInput = { s: string; t: string };

export type MinWindowState = {
  s: string;
  t: string;
  left: number;
  right: number;
  /** Each letter of t and how many more the window still needs. Zero or below means covered. */
  need: { ch: string; count: number }[];
  missing: number;
  best: { start: number; end: number } | null;
  phase: "setup" | "grow" | "record" | "shrink" | "done";
};
