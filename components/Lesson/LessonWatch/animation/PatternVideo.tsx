import type {ComponentType} from 'react';
import {Run, Scene, Step, useRun, Hook, Outro} from './scene';
import {CONFIG, PATTERNS} from './patterns';
import {ContainerStage, FindMinStage, JumpStage, ParenStage, RobberStage, TwoSumStage, containerConfetti, findMinConfetti, jumpConfetti, parenConfetti, robberConfetti, twoSumConfetti} from './stages-rows';
import {ComboStage, HeapStage, ListStage, TreeStage, TrieStage, comboConfetti, heapConfetti, listConfetti, treeConfetti, trieConfetti} from './stages-graph';
import {IntervalsStage, IslandsStage, LcsStage, intervalsConfetti, islandsConfetti, lcsConfetti} from './stages-grid';
import {meta as twoSumMeta} from '@/visualizers/two-sum/meta';
import {parseInput as twoSumParse} from '@/visualizers/two-sum/parseInput';
import {trace as twoSumTrace} from '@/visualizers/two-sum/trace';
import {meta as containerMeta} from '@/visualizers/container-water/meta';
import {parseInput as containerParse} from '@/visualizers/container-water/parseInput';
import {trace as containerTrace} from '@/visualizers/container-water/trace';
import {meta as parenMeta} from '@/visualizers/valid-parentheses/meta';
import {parseInput as parenParse} from '@/visualizers/valid-parentheses/parseInput';
import {trace as parenTrace} from '@/visualizers/valid-parentheses/trace';
import {meta as findMinMeta} from '@/visualizers/find-min-rotated/meta';
import {parseInput as findMinParse} from '@/visualizers/find-min-rotated/parseInput';
import {trace as findMinTrace} from '@/visualizers/find-min-rotated/trace';
import {meta as listMeta} from '@/visualizers/reverse-linked-list/meta';
import {parseInput as listParse} from '@/visualizers/reverse-linked-list/parseInput';
import {trace as listTrace} from '@/visualizers/reverse-linked-list/trace';
import {meta as treeMeta} from '@/visualizers/max-depth-tree/meta';
import {parseInput as treeParse} from '@/visualizers/max-depth-tree/parseInput';
import {trace as treeTrace} from '@/visualizers/max-depth-tree/trace';
import {meta as trieMeta} from '@/visualizers/implement-trie/meta';
import {parseInput as trieParse} from '@/visualizers/implement-trie/parseInput';
import {trace as trieTrace} from '@/visualizers/implement-trie/trace';
import {meta as heapMeta} from '@/visualizers/median-two-heaps/meta';
import {parseInput as heapParse} from '@/visualizers/median-two-heaps/parseInput';
import {trace as heapTrace} from '@/visualizers/median-two-heaps/trace';
import {meta as comboMeta} from '@/visualizers/combination-sum/meta';
import {parseInput as comboParse} from '@/visualizers/combination-sum/parseInput';
import {trace as comboTrace} from '@/visualizers/combination-sum/trace';
import {meta as islandsMeta} from '@/visualizers/number-of-islands/meta';
import {parseInput as islandsParse} from '@/visualizers/number-of-islands/parseInput';
import {trace as islandsTrace} from '@/visualizers/number-of-islands/trace';
import {meta as robberMeta} from '@/visualizers/house-robber/meta';
import {parseInput as robberParse} from '@/visualizers/house-robber/parseInput';
import {trace as robberTrace} from '@/visualizers/house-robber/trace';
import {meta as lcsMeta} from '@/visualizers/lcs/meta';
import {parseInput as lcsParse} from '@/visualizers/lcs/parseInput';
import {trace as lcsTrace} from '@/visualizers/lcs/trace';
import {meta as jumpMeta} from '@/visualizers/jump-game/meta';
import {parseInput as jumpParse} from '@/visualizers/jump-game/parseInput';
import {trace as jumpTrace} from '@/visualizers/jump-game/trace';
import {meta as intervalsMeta} from '@/visualizers/merge-intervals/meta';
import {parseInput as intervalsParse} from '@/visualizers/merge-intervals/parseInput';
import {trace as intervalsTrace} from '@/visualizers/merge-intervals/trace';

type Def = {
  steps: Step[];
  Stage: ComponentType<{r: Run}>;
  confetti: {x: number; y: number};
  hook: Hook;
  outro: Outro;
};

// Preset 0 of each visualizer is the example the transcript narrates.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const run0 = (m: any, parse: any, trace: any): Step[] => trace(parse(m.presets[0]));

const o = (naiveLabel: string, naive: string, naiveVal: number, fastLabel: string, fast: string, fastVal: number): Outro => ({naiveLabel, naive, naiveVal, fastLabel, fast, fastVal});

const DEFS: Record<string, () => Def> = {
  'arrays-and-hashing': () => ({
    steps: run0(twoSumMeta, twoSumParse, twoSumTrace), Stage: TwoSumStage, confetti: twoSumConfetti,
    hook: {label: 'Check every pair', count: 6, unit: 'pairs'}, outro: o('check every pair', 'n² = 16', 16, 'one pass + map', 'n = 4', 4),
  }),
  'two-pointers': () => ({
    steps: run0(containerMeta, containerParse, containerTrace), Stage: ContainerStage, confetti: containerConfetti,
    hook: {label: 'Try every pair', count: 36, unit: 'pairs'}, outro: o('try every pair', 'n² = 81', 81, 'two pointers', 'n = 9', 9),
  }),
  stack: () => ({
    steps: run0(parenMeta, parenParse, parenTrace), Stage: ParenStage, confetti: parenConfetti,
    hook: {label: 'Strip pairs, rescan, repeat', count: 18, unit: 'comparisons'}, outro: o('rescan again and again', 'n² = 36', 36, 'one stack', 'n = 6', 6),
  }),
  'binary-search': () => ({
    steps: run0(findMinMeta, findMinParse, findMinTrace), Stage: FindMinStage, confetti: findMinConfetti,
    hook: {label: 'Read every number', count: 7, unit: 'numbers'}, outro: o('read them all', 'n = 7', 7, 'halve each time', 'log n = 3', 3),
  }),
  'linked-list': () => ({
    steps: run0(listMeta, listParse, listTrace), Stage: ListStage, confetti: listConfetti,
    hook: {label: 'Copy into an array', count: 5, unit: 'nodes copied'}, outro: o('copy to an array', 'memory n = 5', 5, 'flip in place', 'memory 1', 1),
  }),
  trees: () => ({
    steps: run0(treeMeta, treeParse, treeTrace), Stage: TreeStage, confetti: treeConfetti,
    hook: {label: 'Re-measure from every node', count: 11, unit: 'visits'}, outro: o('re-measure each node', '11 visits', 11, 'each node once', '5 visits', 5),
  }),
  tries: () => ({
    steps: run0(trieMeta, trieParse, trieTrace), Stage: TrieStage, confetti: trieConfetti,
    hook: {label: 'Scan every stored word', count: 6, unit: 'letters compared'}, outro: o('scan every word', 'n·L = 6', 6, 'walk the trie', 'L = 3', 3),
  }),
  heaps: () => ({
    steps: run0(heapMeta, heapParse, heapTrace), Stage: HeapStage, confetti: heapConfetti,
    hook: {label: 'Re-sort after every number', count: 9, unit: 'comparisons'}, outro: o('re-sort each time', 'n log n = 8', 8, 'two heaps', 'log n = 2', 2),
  }),
  backtracking: () => ({
    steps: run0(comboMeta, comboParse, comboTrace), Stage: ComboStage, confetti: comboConfetti,
    hook: {label: 'Try every path', count: 85, unit: 'paths'}, outro: o('try every path', '85 paths', 85, 'cut dead branches', '17 visited', 17),
  }),
  graphs: () => ({
    steps: run0(islandsMeta, islandsParse, islandsTrace), Stage: IslandsStage, confetti: islandsConfetti,
    hook: {label: 'Rescan the grid per land cell', count: 140, unit: 'cells checked'}, outro: o('rescan per land cell', '140 checks', 140, 'flood each once', '20 checks', 20),
  }),
  '1-d-dp': () => ({
    steps: run0(robberMeta, robberParse, robberTrace), Stage: RobberStage, confetti: robberConfetti,
    hook: {label: 'Try every set of houses', count: 32, unit: 'sets'}, outro: o('try every set', '2ⁿ = 32', 32, 'build up once', 'n = 5', 5),
  }),
  '2-d-dp': () => ({
    steps: run0(lcsMeta, lcsParse, lcsTrace), Stage: LcsStage, confetti: lcsConfetti,
    hook: {label: 'Try every subsequence', count: 32, unit: 'subsequences'}, outro: o('every subsequence', '2ᵐ = 32', 32, 'fill the table', 'm·n = 15', 15),
  }),
  greedy: () => ({
    steps: run0(jumpMeta, jumpParse, jumpTrace), Stage: JumpStage, confetti: jumpConfetti,
    hook: {label: 'Try every jump path', count: 16, unit: 'paths'}, outro: o('try every path', '2ⁿ = 16', 16, 'track the reach', 'n = 5', 5),
  }),
  intervals: () => ({
    steps: run0(intervalsMeta, intervalsParse, intervalsTrace), Stage: IntervalsStage, confetti: intervalsConfetti,
    hook: {label: 'Compare every pair', count: 6, unit: 'pairs'}, outro: o('compare every pair', 'n² = 16', 16, 'sort and walk', 'n log n = 8', 8),
  }),
};

export type PatternVideoProps = {slug: string};

export const PatternVideo = ({slug}: PatternVideoProps) => {
  const def = DEFS[slug]();
  const run = useRun(def.steps);
  const pat = PATTERNS.find((p) => p.slug === slug)!;
  return (
    <Scene run={run} headlines={CONFIG[slug].headlines} hook={def.hook} outro={def.outro} complexity={pat.complexity} confetti={def.confetti}>
      <def.Stage r={run} />
    </Scene>
  );
};
export const SLUGS = Object.keys(DEFS);
