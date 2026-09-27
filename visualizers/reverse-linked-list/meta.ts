/**
 * Static facts about this visualizer, copied exactly from
 * docs/patterns/06-linked-list.md. (The UI builder's index.ts wires these
 * into the registry; this file only holds the data.)
 */
export const meta = {
  id: "reverse-linked-list",
  title: "Reverse Linked List",
  presets: ["1 2 3 4 5", "1 2", "7"],
  inputLabel: "head =",
  inputHint: "1–7 numbers from -99 to 99, separated by spaces.",
  inputMaxLength: 30,
} as const;
