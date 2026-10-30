import type { Step } from "../types";
import { Chip, Chips, Panel, Stats, Strip, ViewRoot, type PointerTag, type StripItem } from "../kit";
import type { CoinChangeInput, CoinChangeState } from "./types";

type CoinChangeViewProps = { step: Step<CoinChangeState>; input: CoinChangeInput };

/** A table of amounts filling in from the left; `a` reaches back by one coin to the amount it builds on. */
export function CoinChangeView({ step }: CoinChangeViewProps) {
  const { coins, amount, dp, a, coin, phase } = step.state;
  const done = phase === "done";
  const back = phase === "try" && coin !== null ? a - coin : null;

  const items: StripItem[] = dp.map((value, idx) => {
    const tags: PointerTag[] = [];
    if (!done && phase !== "setup" && idx === a) tags.push({ label: "a", tone: "orange" });
    if (idx === back) tags.push({ label: `a−${coin}`, tone: "lilac" });
    const state =
      done && idx === amount ? (value === null ? "past" : "found") : idx === a && !done && phase !== "setup" ? "current" : idx === back ? "range" : value === null ? "waiting" : "done";
    return { key: idx, value: value === null ? "∞" : value, above: idx, state, tags };
  });

  return (
    <ViewRoot>
      <Strip items={items} />
      <Panel title="coins">
        <Chips>
          {coins.map((value) => (
            <Chip key={value} state={value === coin ? "current" : "waiting"}>
              {value}
            </Chip>
          ))}
        </Chips>
      </Panel>
      <Stats
        items={[
          { label: "amount", value: phase === "setup" ? "—" : a },
          { label: "coin", value: coin ?? "—" },
          { label: `fewest for ${amount}`, value: dp[amount] ?? "—", answer: true },
        ]}
      />
    </ViewRoot>
  );
}
