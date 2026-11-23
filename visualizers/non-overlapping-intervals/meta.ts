/** Static facts about this visualizer. index.ts wires them into the registry. */
export const meta = {
  id: "non-overlapping-intervals",
  title: "Non-overlapping Intervals",
  shortTitle: "Non-overlapping",
  presets: ["1-2 2-3 3-4 1-3", "1-2 1-2 1-2", "1-2 2-3", "1-10 2-3 4-5 6-7"],
  inputLabel: "intervals =",
  inputHint: "1–6 intervals like 1-3, with 0 ≤ start < end ≤ 20, separated by spaces.",
  inputMaxLength: 60,
} as const;
