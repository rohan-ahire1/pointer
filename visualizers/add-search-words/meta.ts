/** Static facts about this visualizer. index.ts wires these into the registry. */
export const meta = {
  id: "add-search-words",
  title: "Design Add and Search Words",
  shortTitle: "Add & Search Words",
  presets: ["bad dad mad | .ad", "bad dad mad | b..", "cat car cow | c.w", "bad dad | .a"],
  inputLabel: "words | pattern =",
  inputHint: "1–5 words of 1–5 letters (a–z), then | and a pattern of 1–5 characters (a–z, or . for any letter).",
  inputMaxLength: 50,
} as const;
