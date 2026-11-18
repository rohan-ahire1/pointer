export const meta = {
  id: "lru-cache",
  title: "LRU Cache",
  presets: [
    "2 | put 1 1, put 2 2, get 1, put 3 3, get 2, put 4 4, get 1, get 3, get 4",
    "2 | put 1 10, put 2 20, put 1 15, put 3 30, get 2, get 1",
    "1 | put 5 50, get 5, put 6 60, get 5",
  ],
  inputLabel: "capacity | calls =",
  inputHint: "A capacity of 1–4, then | and up to 10 calls like put 1 10 or get 1, split by commas. Keys 0–9.",
  inputMaxLength: 120,
} as const;
