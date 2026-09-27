import type { Step } from "../types";
import type { CombinationInput, CombinationNode, CombinationState } from "./types";

/**
 * Traced Combination Sum (docs/patterns/10-backtracking.md): try a number,
 * recurse on what's left, undo. Because the candidates are sorted, one
 * number that's too big cuts the whole branch. Pops aren't their own steps —
 * the next try/prune note says where the path is back to. Pure and
 * deterministic.
 */
export function trace(input: CombinationInput): Step<CombinationState>[] {
  const candidates = [...input.candidates].sort((a, b) => a - b);
  const target = input.target;
  const out: Step<CombinationState>[] = [];
  const path: number[] = [];
  const results: number[][] = [];
  const tree: CombinationNode[] = [
    { id: 0, parent: null, pick: null, remaining: target, status: "path" },
  ];
  // Path length shown by the last pushed step; a shorter path now means pops
  // happened since, so the note says where the search is back to.
  let lastPathLength = 0;

  const fmt = (xs: number[]): string => `[${xs.join(", ")}]`;
  const push = (
    current: number,
    phase: CombinationState["phase"],
    remaining: number,
    lines: number[],
    note: string,
    sr: string,
  ) => {
    out.push({
      state: {
        candidates: [...candidates],
        target,
        path: [...path],
        remaining,
        tree: tree.map((node) => ({ ...node })),
        current,
        phase,
        results: results.map((combo) => [...combo]),
      },
      lines,
      note,
      sr,
    });
    lastPathLength = path.length;
  };

  const backPrefix = (): string => {
    if (path.length >= lastPathLength) return "";
    return path.length === 0 ? "Back to the start. " : `Back to ${fmt(path)}. `;
  };
  const foundSr = (): string =>
    `Found ${results.length} ${results.length === 1 ? "combination" : "combinations"} so far.`;
  const treeSr = (): string => {
    const cut = tree.filter((node) => node.status === "cut").length;
    const tried = tree.length - 1 - cut;
    return `Tree has ${tried} tried ${tried === 1 ? "branch" : "branches"}, ${cut} cut.`;
  };
  const pathSr = (): string => (path.length === 0 ? "Path empty." : `Path ${path.join(", ")}.`);

  push(
    0,
    "setup",
    target,
    [1, 2, 3, 16],
    `Sort the candidates. Start with an empty path. You need ${target}.`,
    `Sorted candidates ${candidates.join(", ")}. Path empty. Need ${target}. Nothing found yet.`,
  );

  const dfs = (start: number, remaining: number, id: number): void => {
    if (remaining === 0) {
      tree[id].status = "found";
      results.push([...path]);
      push(
        id,
        "found",
        0,
        [5, 6],
        `Need 0. ${fmt(path)} works, so save it.`,
        `${pathSr()} Remaining 0. ${foundSr()} ${treeSr()}`,
      );
      return;
    }
    for (let i = start; i < candidates.length; i++) {
      if (candidates[i] > remaining) {
        const cut: CombinationNode = {
          id: tree.length,
          parent: id,
          pick: candidates[i],
          remaining: remaining - candidates[i],
          status: "cut",
        };
        tree.push(cut);
        const prefix = backPrefix();
        push(
          cut.id,
          "prune",
          remaining,
          [10],
          `${prefix}${candidates[i]} is more than the ${remaining} left. Everything after it is bigger too, so cut here.`,
          `${pathSr()} ${candidates[i]} is more than the ${remaining} left. ${foundSr()} ${treeSr()}`,
        );
        break;
      }
      const child: CombinationNode = {
        id: tree.length,
        parent: id,
        pick: candidates[i],
        remaining: remaining - candidates[i],
        status: "path",
      };
      tree.push(child);
      const prefix = backPrefix();
      path.push(candidates[i]);
      push(
        child.id,
        "try",
        child.remaining,
        [9, 11, 12],
        `${prefix}Try ${candidates[i]}. Path ${fmt(path)}, still need ${child.remaining}.`,
        `${pathSr()} Remaining ${child.remaining}. ${foundSr()} ${treeSr()}`,
      );
      dfs(i, child.remaining, child.id);
      path.pop();
      if (tree[child.id].status === "path") tree[child.id].status = "done";
    }
  };
  dfs(0, target, 0);

  const listed = results.map(fmt);
  const all =
    listed.length <= 1 ? listed.join("") : `${listed.slice(0, -1).join(", ")} and ${listed[listed.length - 1]}`;
  // Many combinations won't fit in one note; fall back to the count then.
  const doneNote =
    results.length === 0
      ? `Done. Nothing adds to ${target}.`
      : `Done. ${results.length} ${results.length === 1 ? "combination" : "combinations"}: ${all}.`;
  push(
    0,
    "done",
    0,
    [17],
    doneNote.length <= 110 ? doneNote : `Done. ${results.length} combinations add to ${target}.`,
    results.length === 0
      ? `Done. Nothing adds to ${target}. ${treeSr()}`
      : `Done. ${results.length} ${results.length === 1 ? "combination" : "combinations"} add to ${target}: ${all}. ${treeSr()}`,
  );
  return out;
}
