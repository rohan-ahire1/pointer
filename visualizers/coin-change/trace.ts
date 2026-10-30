import { list } from "../kit/format";
import type { Step } from "../types";
import type { CoinChangeInput, CoinChangeState } from "./types";

const show = (value: number | null) => (value === null ? "∞" : String(value));

/** Build up from 0: the best way to make `a` is one coin plus the best way to make what's left. */
export function trace({ coins, amount }: CoinChangeInput): Step<CoinChangeState>[] {
  const dp: (number | null)[] = Array.from({ length: amount + 1 }, () => null);
  const steps: Step<CoinChangeState>[] = [];
  const push = (
    a: number,
    coin: number | null,
    phase: CoinChangeState["phase"],
    lines: number[],
    note: string,
    sr: string,
  ) => {
    steps.push({ state: { coins, amount, dp: [...dp], a, coin, phase }, lines, note, sr });
  };

  dp[0] = 0;
  push(0, null, "setup", [1, 2], "Making 0 takes 0 coins. Everything else starts out as impossible.", `Coins ${list(coins)}. Amount ${amount}.`);

  for (let a = 1; a <= amount; a++) {
    push(a, null, "amount", [3], `What’s the fewest coins that make ${a}?`, `Working on amount ${a}.`);
    for (const coin of coins) {
      if (coin > a) {
        push(a, coin, "skip", [4, 5], `Coin ${coin} is bigger than ${a}. Skip it.`, `Coin ${coin} is too big for ${a}.`);
        continue;
      }
      const rest = dp[a - coin];
      const option = rest === null ? null : rest + 1;
      const before = dp[a];
      const better = option !== null && (before === null || option < before);
      if (better) dp[a] = option;
      let note: string;
      if (option === null) note = `Coin ${coin} leaves ${a - coin}, which can’t be made.`;
      else if (better) note = `Coin ${coin} leaves ${a - coin}: ${rest} + 1 = ${option} coins. Best so far.`;
      else note = `Coin ${coin} takes ${option}. ${show(before)} is already as good.`;
      push(a, coin, "try", [4, 5, 6], note, `Coin ${coin} for amount ${a}. Best is ${show(dp[a])}.`);
    }
  }

  const best = dp[amount];
  push(
    amount,
    null,
    "done",
    [10],
    best === null ? `Done. These coins can’t make ${amount}.` : `Done. ${amount} takes ${best} ${best === 1 ? "coin" : "coins"}.`,
    best === null ? "Done. The answer is -1." : `Done. The answer is ${best}.`,
  );
  return steps;
}
