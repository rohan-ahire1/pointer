import { list } from "../kit/format";
import type { Step } from "../types";
import type { NetworkInput, NetworkState } from "./types";

const inOrder = (a: [number, number], b: [number, number]) => a[0] - b[0] || a[1] - b[1];

/**
 * Dijkstra from node 0: the heap hands back the closest node, and with no
 * negative costs nothing found later can beat that time.
 */
export function trace({ n, roads }: NetworkInput): Step<NetworkState>[] {
  const best: (number | null)[] = Array.from({ length: n }, () => null);
  best[0] = 0;
  const heap: [number, number][] = [[0, 0]];
  const settled: number[] = [];
  const steps: Step<NetworkState>[] = [];
  const push = (
    current: number | null,
    trying: number | null,
    offer: number | null,
    delay: number | null,
    phase: NetworkState["phase"],
    lines: number[],
    note: string,
    sr: string,
  ) => {
    steps.push({
      state: { n, roads, best: [...best], settled: [...settled], heap: heap.map((entry) => [...entry]), current, trying, offer, delay, phase },
      lines,
      note,
      sr,
    });
  };

  push(null, null, null, null, "setup", [3, 4, 5], "The signal starts at node 0 at time 0. Every other node waits at ∞.", `${n} nodes and ${roads.length} roads.`);

  while (heap.length > 0) {
    const [time, node] = heap.shift() as [number, number];
    const known = best[node] as number;
    if (time > known) {
      push(node, null, null, null, "skip", [7, 8], `Old entry: node ${node} at ${time}. It already has ${known}, so skip it.`, `Skipped node ${node} at time ${time}.`);
      continue;
    }
    settled.push(node);
    push(node, null, null, null, "pop", [6, 7], `Closest in the heap: node ${node} at time ${time}. Nothing can beat that now.`, `Node ${node} is final at time ${time}.`);
    roads.forEach(([from, to, cost], index) => {
      if (from !== node) return;
      const arrive = time + cost;
      const before = best[to];
      const better = before === null || arrive < before;
      if (better) {
        best[to] = arrive;
        heap.push([arrive, to]);
        heap.sort(inOrder);
      }
      const sum = `Road to ${to}: ${time} + ${cost} = ${arrive}`;
      const note = before === null ? `${sum}. First way there, so save it.` : better ? `${sum}, which beats ${before}. Save it.` : `${sum}. It already has ${before}, so leave it.`;
      push(node, index, arrive, null, "road", better ? [9, 10, 11, 12, 13] : [9, 10, 11], note, `${sum}. Node ${to} is at ${best[to]}.`);
    });
  }

  const missed = best.flatMap((time, node) => (time === null ? [node] : []));
  const delay = missed.length > 0 ? -1 : Math.max(...(best as number[]));
  push(
    null,
    null,
    null,
    delay,
    "done",
    [17, 18],
    missed.length > 0 ? `Done. No road reaches ${list(missed)}, so the answer is -1.` : `Done. The last node hears at time ${delay}.`,
    missed.length > 0 ? `Done. Never reached: ${list(missed)}.` : `Done. Times: ${list(best as number[])}.`,
  );
  return steps;
}
