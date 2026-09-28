/**
 * Static facts about this visualizer, copied exactly from
 * docs/patterns/07-trees.md. (The UI builder's index.ts wires these into
 * the registry; this file only holds the data.)
 */
export const meta = {
  id: "max-depth-binary-tree",
  title: "Maximum Depth of Binary Tree",
  presets: ["3 9 20 null null 15 7", "1 null 2", "1 2 3 4 5 6 7"],
  inputLabel: "root =",
  inputHint: "Level order, like LeetCode: 3 9 20 null null 15 7. Up to 4 levels.",
  inputMaxLength: 70,
} as const;
