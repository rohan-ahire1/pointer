/**
 * Static facts about this visualizer, copied exactly from
 * docs/patterns/11-graphs.md. (The UI builder's index.ts wires
 * these into the registry; this file only holds the data.)
 */
export const meta = {
  id: "number-of-islands",
  title: "Number of Islands",
  presets: ["11000 11000 00100 00011", "11110 11010 11000 00000", "101 010 101"],
  inputLabel: "grid =",
  inputHint: "1–5 rows of 1s (land) and 0s (water), up to 6 wide, rows separated by spaces.",
  inputMaxLength: 140,
} as const;
