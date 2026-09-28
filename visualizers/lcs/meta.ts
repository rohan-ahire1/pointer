/**
 * Static facts about this visualizer, copied exactly from
 * docs/patterns/13-2-d-dp.md. (The UI builder's index.ts wires
 * these into the registry; this file only holds the data.)
 */
export const meta = {
  id: "longest-common-subsequence",
  title: "Longest Common Subsequence",
  presets: ["abcde ace", "abc abc", "abc def"],
  inputLabel: "text1 text2 =",
  inputHint: "Two words of 1–6 lowercase letters, separated by a space.",
  inputMaxLength: 20,
} as const;
