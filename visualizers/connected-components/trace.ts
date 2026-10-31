import { list } from "../kit/format";
import type { Step } from "../types";
import type { ComponentsInput, ComponentsState } from "./types";

/** Union-Find: every group has one leader, and a link that joins two leaders removes one group. */
export function trace({ n, links }: ComponentsInput): Step<ComponentsState>[] {
  const parent = Array.from({ length: n }, (_, node) => node);
  let groups = n;
  const steps: Step<ComponentsState>[] = [];
  const push = (
    link: number | null,
    path: number[],
    leaders: [number, number] | null,
    phase: ComponentsState["phase"],
    lines: number[],
    note: string,
    sr: string,
  ) => {
    steps.push({ state: { n, links, parent: [...parent], link, path, leaders, groups, phase }, lines, note, sr });
  };
  const find = (node: number, path: number[]): number => {
    path.push(node);
    if (parent[node] !== node) parent[node] = find(parent[node], path);
    return parent[node];
  };

  push(null, [], null, "setup", [1, 6], `${n} nodes, each its own leader. That’s ${n} groups.`, `${n} nodes and ${links.length} links.`);

  links.forEach(([a, b], index) => {
    const before = [...parent];
    const path: number[] = [];
    const leaderA = find(a, path);
    const leaderB = find(b, path);
    const leaders: [number, number] = [leaderA, leaderB];
    const shortcut = parent.some((value, node) => value !== before[node]);
    push(
      index,
      path,
      leaders,
      "find",
      [7, 8, 9],
      `Link ${a}–${b}. Follow the arrows: ${a}’s leader is ${leaderA}, ${b}’s is ${leaderB}.${shortcut ? " Point straight there next time." : ""}`,
      `Link ${a} to ${b}. Leaders ${leaderA} and ${leaderB}.`,
    );
    if (leaderA === leaderB) {
      push(index, path, leaders, "same", [10], "Same leader, so they’re already in one group. This link adds nothing.", "Already in one group.");
      return;
    }
    parent[leaderB] = leaderA;
    groups--;
    push(
      index,
      path,
      leaders,
      "join",
      [11, 12],
      `Different leaders. ${leaderB} now follows ${leaderA}, so ${groups} ${groups === 1 ? "group is" : "groups are"} left.`,
      `${leaderB} follows ${leaderA}. ${groups} groups.`,
    );
  });

  const leaders = parent.flatMap((value, node) => (value === node ? [node] : []));
  push(
    null,
    [],
    null,
    "done",
    [14],
    `Done. ${groups} ${groups === 1 ? "group" : "groups"}, led by ${list(leaders)}.`,
    `Done. ${groups} groups.`,
  );
  return steps;
}
