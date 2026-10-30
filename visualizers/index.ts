import type { Visualizer } from "./types";
import { slidingWindowVisualizer } from "./sliding-window";
import { twoSumVisualizer } from "./two-sum";
import { containerWaterVisualizer } from "./container-water";
import { validParenthesesVisualizer } from "./valid-parentheses";
import { findMinRotatedVisualizer } from "./find-min-rotated";
import { reverseLinkedListVisualizer } from "./reverse-linked-list";
import { maxDepthTreeVisualizer } from "./max-depth-tree";
import { implementTrieVisualizer } from "./implement-trie";
import { medianTwoHeapsVisualizer } from "./median-two-heaps";
import { combinationSumVisualizer } from "./combination-sum";
import { numberOfIslandsVisualizer } from "./number-of-islands";
import { houseRobberVisualizer } from "./house-robber";
import { lcsVisualizer } from "./lcs";
import { jumpGameVisualizer } from "./jump-game";
import { mergeIntervalsVisualizer } from "./merge-intervals";
import { productExceptSelfVisualizer } from "./product-except-self";
import { threeSumVisualizer } from "./three-sum";
import { minWindowVisualizer } from "./min-window";
import { dailyTemperaturesVisualizer } from "./daily-temperatures";
import { searchRotatedVisualizer } from "./search-rotated";
import { linkedListCycleVisualizer } from "./linked-list-cycle";
import { levelOrderVisualizer } from "./level-order";
import { kthLargestVisualizer } from "./kth-largest";
import { wordSearchVisualizer } from "./word-search";
import { courseScheduleVisualizer } from "./course-schedule";
import { coinChangeVisualizer } from "./coin-change";
import { uniquePathsVisualizer } from "./unique-paths";
import { maxSubarrayVisualizer } from "./max-subarray";

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
  [twoSumVisualizer.id]: twoSumVisualizer as Visualizer<unknown, unknown>,
  [containerWaterVisualizer.id]: containerWaterVisualizer as Visualizer<unknown, unknown>,
  [validParenthesesVisualizer.id]: validParenthesesVisualizer as Visualizer<unknown, unknown>,
  [findMinRotatedVisualizer.id]: findMinRotatedVisualizer as Visualizer<unknown, unknown>,
  [reverseLinkedListVisualizer.id]: reverseLinkedListVisualizer as Visualizer<unknown, unknown>,
  [maxDepthTreeVisualizer.id]: maxDepthTreeVisualizer as Visualizer<unknown, unknown>,
  [implementTrieVisualizer.id]: implementTrieVisualizer as Visualizer<unknown, unknown>,
  [medianTwoHeapsVisualizer.id]: medianTwoHeapsVisualizer as Visualizer<unknown, unknown>,
  [combinationSumVisualizer.id]: combinationSumVisualizer as Visualizer<unknown, unknown>,
  [numberOfIslandsVisualizer.id]: numberOfIslandsVisualizer as Visualizer<unknown, unknown>,
  [houseRobberVisualizer.id]: houseRobberVisualizer as Visualizer<unknown, unknown>,
  [lcsVisualizer.id]: lcsVisualizer as Visualizer<unknown, unknown>,
  [jumpGameVisualizer.id]: jumpGameVisualizer as Visualizer<unknown, unknown>,
  [mergeIntervalsVisualizer.id]: mergeIntervalsVisualizer as Visualizer<unknown, unknown>,
  [productExceptSelfVisualizer.id]: productExceptSelfVisualizer as Visualizer<unknown, unknown>,
  [threeSumVisualizer.id]: threeSumVisualizer as Visualizer<unknown, unknown>,
  [minWindowVisualizer.id]: minWindowVisualizer as Visualizer<unknown, unknown>,
  [dailyTemperaturesVisualizer.id]: dailyTemperaturesVisualizer as Visualizer<unknown, unknown>,
  [searchRotatedVisualizer.id]: searchRotatedVisualizer as Visualizer<unknown, unknown>,
  [linkedListCycleVisualizer.id]: linkedListCycleVisualizer as Visualizer<unknown, unknown>,
  [levelOrderVisualizer.id]: levelOrderVisualizer as Visualizer<unknown, unknown>,
  [kthLargestVisualizer.id]: kthLargestVisualizer as Visualizer<unknown, unknown>,
  [wordSearchVisualizer.id]: wordSearchVisualizer as Visualizer<unknown, unknown>,
  [courseScheduleVisualizer.id]: courseScheduleVisualizer as Visualizer<unknown, unknown>,
  [coinChangeVisualizer.id]: coinChangeVisualizer as Visualizer<unknown, unknown>,
  [uniquePathsVisualizer.id]: uniquePathsVisualizer as Visualizer<unknown, unknown>,
  [maxSubarrayVisualizer.id]: maxSubarrayVisualizer as Visualizer<unknown, unknown>,
};

export function getVisualizer(id: string): Visualizer<unknown, unknown> | undefined {
  return visualizers[id];
}

export type { Step, Visualizer } from "./types";
export { slidingWindowVisualizer };
