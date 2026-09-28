/**
 * Static facts about this visualizer, copied exactly from
 * docs/patterns/12-1-d-dp.md. (The UI builder's index.ts wires
 * these into the registry; this file only holds the data.)
 */
export const meta = {
  id: "house-robber",
  title: "House Robber",
  presets: ["2 7 9 3 1", "1 2 3 1", "2 1 1 2"],
  inputLabel: "nums =",
  inputHint: "1–8 amounts from 0 to 99, one per house, separated by spaces.",
  inputMaxLength: 30,
} as const;
