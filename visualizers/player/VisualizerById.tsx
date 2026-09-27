"use client";

import { getVisualizer } from "../index";
import { VisualizerPlayer } from "./VisualizerPlayer";

/**
 * Looks a visualizer up by id (a `LivePattern["visualizer"]` value) and
 * renders it. This is the bridge Server Components should use: a
 * `Visualizer` object carries functions (`parseInput`, `trace`) that can't
 * be passed as props from a Server Component into a Client Component
 * (<VisualizerPlayer>), so lesson pages pass just the id string across that
 * boundary and let this client component resolve it from the registry.
 */
export function VisualizerById({ id }: { id: string }) {
  const visualizer = getVisualizer(id);
  if (!visualizer) {
    return null;
  }
  return <VisualizerPlayer visualizer={visualizer} />;
}
