export type CoinChangeInput = { coins: number[]; amount: number };

export type CoinChangeState = {
  coins: number[];
  amount: number;
  /** Fewest coins for each amount, null while unreachable. */
  dp: (number | null)[];
  a: number;
  coin: number | null;
  phase: "setup" | "amount" | "try" | "skip" | "done";
};
