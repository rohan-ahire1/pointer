export const meta = {
  id: "rotate-image",
  title: "Rotate Image",
  shortTitle: "Rotate Image",
  presets: ["1 2 3 | 4 5 6 | 7 8 9", "1 2 | 3 4", "5 1 9 11 | 2 4 8 10 | 13 3 6 7 | 15 14 12 16"],
  inputLabel: "matrix =",
  inputHint: "A square grid, 2×2 up to 5×5, of numbers from 0 to 99. Put | between rows.",
  inputMaxLength: 90,
} as const;
