/**
 * Static facts about this visualizer, copied exactly from
 * docs/patterns/01-arrays-and-hashing.md. (The UI builder's index.ts wires
 * these into the registry; this file only holds the data.)
 */
export const meta = {
  id: "two-sum-hash-map",
  title: "Two Sum",
  presets: ["2 7 11 15 | 9", "3 2 4 | 6", "3 3 | 6"],
  inputLabel: "nums | target =",
  inputHint: "2–8 whole numbers from -99 to 99, then | and the target.",
  inputMaxLength: 50,
} as const;
