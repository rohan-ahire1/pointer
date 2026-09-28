/**
 * Static facts about this visualizer, copied exactly from
 * docs/patterns/08-tries.md. (The UI builder's index.ts wires
 * these into the registry; this file only holds the data.)
 */
export const meta = {
  id: "implement-trie",
  title: "Implement Trie (Prefix Tree)",
  presets: ["apple app | app", "car cat cart | ca", "tea ten to | tex"],
  inputLabel: "words | query =",
  inputHint: "Up to 4 words of 1–6 letters (a–z), then | and a word to look up.",
  inputMaxLength: 60,
} as const;
