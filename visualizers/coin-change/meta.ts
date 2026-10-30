export const meta = {
  id: "coin-change",
  title: "Coin Change",
  presets: ["1 2 5 | 11", "1 3 4 | 6", "2 | 3"],
  inputLabel: "coins | amount =",
  inputHint: "1–4 different coins from 1 to 20, then | and an amount from 1 to 12.",
  inputMaxLength: 24,
} as const;
