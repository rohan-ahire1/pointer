/**
 * Static facts about this visualizer, copied exactly from
 * docs/patterns/14-greedy.md. (The UI builder's index.ts wires
 * these into the registry; this file only holds the data.)
 */
export const meta = {
  id: "jump-game",
  title: "Jump Game",
  presets: ["2 3 1 1 4", "3 2 1 0 4", "0"],
  inputLabel: "nums =",
  inputHint: "1–10 jump lengths from 0 to 5, separated by spaces.",
  inputMaxLength: 30,
} as const;
