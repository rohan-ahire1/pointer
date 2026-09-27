/**
 * Static facts about this visualizer, copied exactly from
 * docs/patterns/02-two-pointers.md. (The UI builder's index.ts wires these
 * into the registry; this file only holds the data.)
 */
export const meta = {
  id: "container-with-most-water",
  title: "Container With Most Water",
  presets: ["1 8 6 2 5 4 8 3 7", "4 3 2 1 4", "1 1"],
  inputLabel: "height =",
  inputHint: "2–10 wall heights from 0 to 9, separated by spaces.",
  inputMaxLength: 30,
} as const;
