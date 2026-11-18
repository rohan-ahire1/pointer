import type { Step } from "../types";
import { Stats, Strip, ViewRoot, type PointerTag, type StripItem } from "../kit";
import type { KokoInput, KokoState } from "./types";
import styles from "./View.module.css";

type KokoViewProps = { step: Step<KokoState>; input: KokoInput };

/** Top: every speed, with the ones still in play in the capsule. Bottom: the piles and the hours each takes. */
export function KokoView({ step }: KokoViewProps) {
  const { piles, h, lo, hi, k, each, hours, answer, phase } = step.state;
  const done = phase === "done";
  const max = Math.max(...piles);

  const speeds: StripItem[] = Array.from({ length: max }, (_, i) => {
    const speed = i + 1;
    const tags: PointerTag[] = [];
    if (!done && speed === lo) tags.push({ label: "lo", tone: "inverse" });
    if (!done && speed === hi) tags.push({ label: "hi", tone: "lilac" });
    if (!done && speed === k) tags.push({ label: "k", tone: "orange" });
    const state = answer === speed ? "found" : speed === k ? "current" : speed < lo || speed > hi ? "past" : "waiting";
    return { key: speed, value: speed, state, tags };
  });

  const pileItems: StripItem[] = piles.map((p, i) => ({
    key: i,
    value: p,
    above: each ? `${each[i]}h` : "",
    state: each ? (hours !== null && hours <= h ? "done" : "current") : "waiting",
  }));

  return (
    <ViewRoot>
      <p className={styles.label}>speeds (bananas an hour)</p>
      <Strip items={speeds} tagRows={2} capsule={!done && lo <= hi ? { start: lo - 1, end: hi - 1 } : null} />
      <p className={styles.label}>piles, with the hours each takes at speed {k ?? "—"}</p>
      <Strip items={pileItems} />
      <Stats
        items={[
          { label: "hours", value: hours === null ? "—" : `${hours} of ${h}` },
          { label: "verdict", value: hours === null ? "—" : hours <= h ? "fast enough" : "too slow" },
          { label: "speed", value: answer ?? "—", answer: true },
        ]}
      />
    </ViewRoot>
  );
}
