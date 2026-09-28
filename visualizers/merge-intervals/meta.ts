/**
 * Static facts about this visualizer, copied exactly from
 * docs/patterns/15-intervals.md. (The UI builder's index.ts wires
 * these into the registry; this file only holds the data.)
 */
export const meta = {
  id: "merge-intervals",
  title: "Merge Intervals",
  presets: ["1-3 2-6 8-10 15-18", "1-4 4-5", "1-4 0-4"],
  inputLabel: "intervals =",
  inputHint: "1–6 intervals like 1-3, with 0 ≤ start ≤ end ≤ 20, separated by spaces.",
  inputMaxLength: 60,
} as const;
