/**
 * Static facts about this visualizer, copied exactly from
 * docs/patterns/04-stack.md. (The UI builder's index.ts wires these into
 * the registry; this file only holds the data.)
 */
export const meta = {
  id: "valid-parentheses",
  title: "Valid Parentheses",
  presets: ["()[]{}", "{[()]}", "([)]"],
  inputLabel: "s =",
  inputHint: "Up to 12 brackets: ( ) [ ] { }. Anything else is ignored.",
  inputMaxLength: 12,
} as const;
