/**
 * Static facts about this visualizer, copied exactly from
 * docs/patterns/09-heaps.md. (The UI builder's index.ts wires
 * these into the registry; this file only holds the data.)
 */
export const meta = {
  id: "median-two-heaps",
  title: "Find Median from Data Stream",
  shortTitle: "Stream Median",
  presets: ["5 15 1 3", "2 3 4", "6 10 2 6 5 0"],
  inputLabel: "stream =",
  inputHint: "1–8 numbers from -99 to 99, in the order they arrive.",
  inputMaxLength: 40,
} as const;
