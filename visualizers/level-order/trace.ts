import { list } from "../kit/format";
import type { Step } from "../types";
import type { LevelOrderInput, LevelOrderState } from "./types";

/** Breadth-first: finish everything on one level, gathering the next level as you go. */
export function trace({ nodes, root }: LevelOrderInput): Step<LevelOrderState>[] {
  const byId = new Map(nodes.map((node) => [node.id, node]));
  const steps: Step<LevelOrderState>[] = [];
  const out: number[][] = [];
  let queue = [root];
  let next: number[] = [];
  let level: number[] = [];
  const push = (
    current: number | null,
    added: number | null,
    phase: LevelOrderState["phase"],
    lines: number[],
    note: string,
    sr: string,
  ) => {
    steps.push({
      state: { nodes, queue: [...queue], next: [...next], level: [...level], out: out.map((row) => [...row]), current, added, phase },
      lines,
      note,
      sr,
    });
  };

  push(null, null, "setup", [2, 3], "The queue starts with just the root.", `The queue holds the root, ${byId.get(root)?.value}.`);

  while (queue.length > 0) {
    level = [];
    next = [];
    const size = queue.length;
    push(null, null, "level", [4, 5, 6], `New level: ${size} ${size === 1 ? "node" : "nodes"} in the queue.`, `Level ${out.length + 1} has ${size} nodes.`);
    const current = [...queue];
    for (const id of current) {
      const node = byId.get(id)!;
      queue = queue.slice(1);
      level.push(node.value);
      push(id, null, "visit", [7, 8], `Take ${node.value} from the queue and add it to this level.`, `Visited ${node.value}. Level so far ${list(level)}.`);
      for (const side of ["left", "right"] as const) {
        const child = node[side];
        if (child === null) continue;
        next.push(child);
        push(id, child, "child", [side === "left" ? 9 : 10], `${byId.get(child)?.value} waits for the next level.`, `Queued ${side} child ${byId.get(child)?.value}.`);
      }
    }
    out.push([...level]);
    queue = next;
    next = [];
    push(null, null, "close", [12, 13], queue.length > 0 ? `Level done: ${list(level)}. Move down one.` : `Level done: ${list(level)}. Nothing is waiting.`, `Finished level ${out.length}: ${list(level)}.`);
  }

  push(null, null, "done", [15], `Done. ${out.length} ${out.length === 1 ? "level" : "levels"}, top to bottom.`, `Done. Levels: ${out.map((row) => list(row)).join("; ")}.`);
  return steps;
}
