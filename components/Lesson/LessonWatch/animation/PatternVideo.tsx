import {useMemo, type ComponentType} from 'react';
import {Run, Scene, Step, Timing, bruteK, timeline, useRun, type Hook, type Outro} from './scene';
import {CONFIG, PATTERNS} from './patterns';
import {ContainerBrute, ContainerStage, FindMinBrute, FindMinStage, JumpBrute, JumpStage, ParenBrute, ParenStage, RobberBrute, RobberStage, TwoSumBrute, TwoSumStage, containerConfetti, findMinConfetti, jumpConfetti, jumpRoutes, parenConfetti, robberConfetti, stripReads, twoSumConfetti, twoSumPairs} from './stages-rows';
import {ComboBrute, ComboStage, HeapBrute, HeapStage, ListBrute, ListStage, TreeBrute, TreeStage, TrieBrute, TrieStage, comboConfetti, fullTree, heapConfetti, heapSorts, listConfetti, treeConfetti, treeVisits, trieCompares, trieConfetti} from './stages-graph';
import {IntervalsBrute, IntervalsStage, IslandsBrute, IslandsStage, LcsBrute, LcsStage, floodVisits, intervalPairs, intervalsConfetti, islandsConfetti, lcsConfetti} from './stages-grid';
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
  Brute: ComponentType<{r: Run}>;
  confetti: {x: number; y: number};
  /** label and unit shared by the beat-1 counter and the beat-4 bars */
  label: string;
  unit: string;
  /** how many checks brute force makes, and how many this pattern makes */
  naive: number;
  fast: number;
  naiveLabel: string;
  fastLabel: string;
  timing?: Timing;
  stamp?: string;
};

// Preset 0 of each visualizer is the example the transcript narrates, so "Try it" starts where the video ends.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const run = (m: any, parse: any, trace: any, input?: string): Step[] => {
  const parsed = parse(input ?? m.presets[0]);
  if (parsed && typeof parsed === 'object' && 'error' in parsed) throw new Error(`Bad video input for ${m.id}: ${parsed.error}`);
  return trace(parsed);
};

const isMeasure = (st: Step) => st.state.phase === 'measure';

/** The heap trace drops a number into the lower half and may bounce it straight back; in the
 * video that reads as a glitch, so skip a move-up that is undone by the very next step. */
const dropBounces = (steps: Step[]) =>
  steps.filter((st, i) => {
    const next = steps[i + 1];
    const prev = steps[i - 1];
    if (st.state.phase === 'moveUp' && next?.state.phase === 'rebalance' && next.state.moving === st.state.moving) return false;
    if (st.state.phase === 'rebalance' && prev?.state.phase === 'moveUp' && prev.state.moving === st.state.moving) return false;
    return true;
  });

const DEFS: Record<string, () => Def> = {
  'arrays-and-hashing': () => {
    const steps = run(twoSumMeta, twoSumParse, twoSumTrace);
    return {
      steps, Stage: TwoSumStage, Brute: TwoSumBrute, confetti: twoSumConfetti,
      label: 'Check every pair', unit: 'checks', naive: twoSumPairs(steps[0].state.nums).length, fast: steps[0].state.nums.length,
      naiveLabel: 'check every pair', fastLabel: 'one pass + map',
      timing: {anchors: {[steps.length - 3]: 34, [steps.length - 2]: 38.5}},
    };
  },
  'two-pointers': () => {
    const steps = run(containerMeta, containerParse, containerTrace);
    return {
      steps, Stage: ContainerStage, Brute: ContainerBrute, confetti: containerConfetti,
      label: 'Try every pair', unit: 'containers', naive: twoSumPairs(steps[0].state.height).length, fast: steps.filter(isMeasure).length,
      naiveLabel: 'try every pair', fastLabel: 'two pointers',
      timing: {weight: (st, i) => (i === 0 ? 0.7 : st.best >= 49 && st.phase !== 'done' && !st.newBest ? 0.8 : 1)},
    };
  },
  stack: () => {
    const steps = run(parenMeta, parenParse, parenTrace);
    const firstMatch = steps.findIndex((st) => st.state.phase === 'match');
    return {
      steps, Stage: ParenStage, Brute: ParenBrute, confetti: parenConfetti,
      label: 'Strip pairs, rescan, repeat', unit: 'reads', naive: stripReads(steps[0].state.s).length, fast: steps[0].state.s.length,
      naiveLabel: 'strip and rescan', fastLabel: 'one stack',
      timing: {anchors: {[firstMatch]: 32.5}, end: 45.5},
    };
  },
  'binary-search': () => {
    const steps = run(findMinMeta, findMinParse, findMinTrace);
    return {
      steps, Stage: FindMinStage, Brute: FindMinBrute, confetti: findMinConfetti,
      label: 'Read every number', unit: 'reads', naive: steps[0].state.nums.length, fast: steps.filter((st) => st.state.phase === 'probe').length,
      naiveLabel: 'read every number', fastLabel: 'halve each time',
      timing: {anchors: {1: 22, 2: 31.5}},
    };
  },
  'linked-list': () => {
    const steps = run(listMeta, listParse, listTrace);
    return {
      steps, Stage: ListStage, Brute: ListBrute, confetti: listConfetti,
      label: 'Copy into a new list', unit: 'new nodes', naive: steps[0].state.values.length, fast: 0,
      naiveLabel: 'copy into a new list', fastLabel: 'flip the arrows in place',
      stamp: 'O(n) time · O(1) space',
    };
  },
  trees: () => {
    const steps = run(treeMeta, treeParse, treeTrace);
    const nodes = steps[0].state.nodes;
    const ret = steps.findIndex((st) => st.state.phase === 'return');
    return {
      steps, Stage: TreeStage, Brute: TreeBrute, confetti: treeConfetti,
      label: 'Walk every root-to-leaf path', unit: 'visits', naive: treeVisits(nodes).length, fast: nodes.length,
      naiveLabel: 'walk every path', fastLabel: 'ask each node once',
      timing: {anchors: {[ret]: 33.5, [ret + 1]: 39}},
    };
  },
  tries: () => {
    const steps = run(trieMeta, trieParse, trieTrace);
    const {words, query} = steps[0].state;
    const second = steps.findIndex((st) => st.state.wordIndex === 1);
    const branch = steps.findIndex((st, i) => i > second && st.state.phase === 'new');
    const third = steps.findIndex((st) => st.state.wordIndex === 2);
    const walk = steps.findIndex((st) => st.state.phase === 'walk');
    return {
      steps, Stage: TrieStage, Brute: TrieBrute, confetti: trieConfetti,
      label: 'Compare with every stored word', unit: 'letters read', naive: trieCompares(words, query).length, fast: query.length,
      naiveLabel: 'scan every word', fastLabel: 'walk the trie',
      timing: {anchors: {[second]: 25, [branch]: 28, ...(third > 0 ? {[third]: 32.2} : {}), [walk]: 39.5}},
    };
  },
  heaps: () => {
    const steps = dropBounces(run(heapMeta, heapParse, heapTrace));
    const secondMedian = steps.findIndex((st) => st.state.phase === 'median' && st.state.medians.length === 2);
    return {
      steps, Stage: HeapStage, Brute: HeapBrute, confetti: heapConfetti,
      label: 'Re-sort after every number', unit: 'moves', naive: heapSorts(steps[0].state.stream).length,
      fast: steps.filter((st) => ['push', 'moveUp', 'rebalance'].includes(st.state.phase)).length,
      naiveLabel: 're-sort every time', fastLabel: 'two heaps',
      timing: {anchors: {[secondMedian]: 32.5}},
    };
  },
  backtracking: () => {
    const steps = run(comboMeta, comboParse, comboTrace);
    const {candidates, target} = steps[0].state;
    const firstCut = steps.findIndex((st) => st.state.phase === 'prune');
    const firstFound = steps.findIndex((st) => st.state.phase === 'found');
    return {
      steps, Stage: ComboStage, Brute: ComboBrute, confetti: comboConfetti,
      label: 'Try every branch', unit: 'nodes', naive: fullTree(candidates, target).length, fast: steps[steps.length - 1].state.tree.length,
      naiveLabel: 'try every branch', fastLabel: 'cut dead branches',
      timing: {anchors: {[firstCut - 1]: 29.5, [firstCut]: 32.4, [firstFound]: 36.8}, end: 47},
    };
  },
  graphs: () => {
    const steps = run(islandsMeta, islandsParse, islandsTrace);
    const land = steps[0].state.land as boolean[][];
    return {
      steps, Stage: IslandsStage, Brute: IslandsBrute, confetti: islandsConfetti,
      label: 'Flood from every land cell', unit: 'cell visits', naive: floodVisits(land).length, fast: land.flat().filter(Boolean).length,
      naiveLabel: 'flood from every land cell', fastLabel: 'claim each cell once',
    };
  },
  '1-d-dp': () => {
    const steps = run(robberMeta, robberParse, robberTrace);
    const n = steps[0].state.nums.length;
    return {
      steps, Stage: RobberStage, Brute: RobberBrute, confetti: robberConfetti,
      label: 'Try every set of houses', unit: 'checks', naive: 2 ** n, fast: n,
      naiveLabel: 'try every set', fastLabel: 'build the row once',
    };
  },
  '2-d-dp': () => {
    const steps = run(lcsMeta, lcsParse, lcsTrace);
    const {a, b} = steps[0].state;
    const secondMatch = steps.findIndex((st, i) => st.state.kind === 'match' && steps.slice(0, i).some((x) => x.state.kind === 'match'));
    return {
      steps, Stage: LcsStage, Brute: LcsBrute, confetti: lcsConfetti,
      label: 'Try every subsequence', unit: 'checks', naive: 2 ** a.length, fast: a.length * b.length,
      naiveLabel: 'try every subsequence', fastLabel: 'fill the table',
      timing: {
        anchors: {[secondMatch]: 31.6},
        weight: (st, i) => (i === 0 ? 0.8 : st.phase === 'traceback' ? 3.2 : st.kind === 'match' ? 1.5 : 0.75),
      },
    };
  },
  greedy: () => {
    const main = run(jumpMeta, jumpParse, jumpTrace);
    const fail = run(jumpMeta, jumpParse, jumpTrace, '3 2 1 0 4').map((st, i) => (i === 0 ? {...st, note: 'Now try 3, 2, 1, 0, 4. Stand on stone 0.'} : st));
    const steps = [...main, ...fail];
    const M = main.length;
    const big = main.findIndex((st) => st.state.phase === 'extend' && st.state.reach >= 4 && st.state.i === 1);
    return {
      steps, Stage: ({r}) => <JumpStage r={r} split={M} />, Brute: JumpBrute, confetti: jumpConfetti,
      label: 'Try every route', unit: 'steps', naive: jumpRoutes(main[0].state.nums).length, fast: main[0].state.nums.length,
      naiveLabel: 'try every route', fastLabel: 'track the reach',
      timing: {anchors: {...(big > 0 ? {[big]: 31.5} : {}), [M - 1]: 37, [M]: 38.4}},
    };
  },
  intervals: () => {
    const steps = run(intervalsMeta, intervalsParse, intervalsTrace);
    const n = steps[0].state.items.length;
    const stretch = steps.findIndex((st) => st.state.phase === 'stretch');
    return {
      steps, Stage: IntervalsStage, Brute: IntervalsBrute, confetti: intervalsConfetti,
      label: 'Compare every pair', unit: 'checks', naive: intervalPairs(steps[0].state.items).length, fast: n - 1,
      naiveLabel: 'compare every pair', fastLabel: 'sort, then walk',
      timing: {anchors: {1: 21, ...(stretch > 0 ? {[stretch]: 32.4} : {})}},
    };
  },
};

export type PatternVideoProps = {slug: string};

export const PatternVideo = ({slug}: PatternVideoProps) => {
  const def = useMemo(() => DEFS[slug](), [slug]);
  const times = useMemo(() => timeline(def.steps, def.timing), [def]);
  const r = useRun(def.steps, times);
  const pat = PATTERNS.find((p) => p.slug === slug)!;
  const total = def.naive;
  const hook: Hook = {label: def.label, unit: def.unit, total, count: (t) => bruteK(t, total) + 1};
  const outro: Outro = {naiveLabel: def.naiveLabel, naiveVal: def.naive, fastLabel: def.fastLabel, fastVal: def.fast, unit: def.unit};
  return (
    <Scene run={r} headlines={CONFIG[slug].headlines} hook={hook} outro={outro} stamp={def.stamp ?? pat.complexity} confetti={def.confetti} brute={<def.Brute r={r} />}>
      <def.Stage r={r} />
    </Scene>
  );
};
export const SLUGS = Object.keys(DEFS);
