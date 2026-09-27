/**
 * Static facts about this visualizer, copied exactly from
 * docs/patterns/10-backtracking.md. (The UI builder's index.ts wires
 * these into the registry; this file only holds the data.)
 */
export const meta = {
  id: "combination-sum",
  title: "Combination Sum",
  presets: ["2 3 6 7 | 7", "2 3 5 | 8", "3 5 | 4"],
  inputLabel: "candidates | target =",
  inputHint: "2–4 different numbers from 2 to 9, then | and a target from 1 to 10.",
  inputMaxLength: 30,
} as const;
