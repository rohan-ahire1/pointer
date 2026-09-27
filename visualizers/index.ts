import type { Visualizer } from "./types";
import { slidingWindowVisualizer } from "./sliding-window";

/**
 * Registry of every visualizer, keyed by the id a live pattern's
 * `visualizer` field points at (see content/patterns.json and
 * content/types.ts — `LivePattern["visualizer"]`).
 *
 * Deliberately typed as `Visualizer<unknown, unknown>` in the map: each
 * visualizer's own module (e.g. visualizers/sliding-window) is where you
 * want its real `I`/`S` types; callers look it up by id and only render it
 * generically through `<VisualizerPlayer>`, which doesn't need to know the
 * concrete state shape.
 */
export const visualizers: Record<string, Visualizer<unknown, unknown>> = {
  [slidingWindowVisualizer.id]: slidingWindowVisualizer as Visualizer<unknown, unknown>,
};

export function getVisualizer(id: string): Visualizer<unknown, unknown> | undefined {
  return visualizers[id];
}

export type { Step, Visualizer } from "./types";
export { slidingWindowVisualizer };
