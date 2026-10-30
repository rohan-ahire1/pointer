/**
 * Static facts about this visualizer, copied exactly from
 * docs/patterns/05-binary-search.md. (The UI builder's index.ts wires these
 * into the registry; this file only holds the data.)
 */
export const meta = {
  id: "find-min-rotated",
  title: "Find Minimum in Rotated Sorted Array",
  shortTitle: "Find Minimum",
  presets: ["4 5 6 7 0 1 2", "3 4 5 1 2", "11 13 15 17"],
  inputLabel: "nums =",
  inputHint: "1–10 different numbers from -99 to 99, sorted then rotated, like 4 5 6 1 2 3.",
  inputMaxLength: 50,
} as const;
