import { trace } from "@/visualizers/sliding-window/trace";
import { SlidingWindowView } from "@/visualizers/sliding-window/View";
import styles from "./HomeVisualizerCard.module.css";

const DEMO_INPUT = "abcabcbb";
const steps = trace(DEMO_INPUT);
// A step partway through, right when the window has to shrink because it
// hit a repeat — a more interesting still frame than step 1.
const demoIndex = Math.max(
  0,
  steps.findIndex((step) => step.note.startsWith("Yes, it repeats")),
);
const demoStep = steps[demoIndex] ?? steps[0];

/**
 * Home's hero visual (design/mocks/C2-Home.dc.html): rather than
 * hand-drawing a fake screenshot of the visualizer, this renders the real
 * <SlidingWindowView> against a real traced step — same component the live
 * lesson page's visualizer uses, just held on one frame instead of driven
 * by the player. Pure presentation, no client JS needed (SlidingWindowView
 * has no "use client" of its own, and `trace` is a pure function), so this
 * whole card is server-rendered.
 */
export function HomeVisualizerCard() {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <span>sliding window</span>
        <span>
          step {demoIndex + 1} / {steps.length}
        </span>
      </div>
      <SlidingWindowView step={demoStep} input={DEMO_INPUT} />
      <p className={styles.note}>{demoStep.note}</p>
    </div>
  );
}
