import { splitOnBar } from "../kit/parseNumbers";
import type { NetworkInput, Road } from "./types";

export function parseInput(input: string): NetworkInput | { error: string } {
  const parts = splitOnBar(input, "4 | 0>1:2 1>2:3");
  if ("error" in parts) return parts;
  const n = Number(parts[0].trim());
  if (!/^\d+$/.test(parts[0].trim()) || n < 2 || n > 6) return { error: "Before the |, enter how many nodes: 2 to 6." };
  const tokens = parts[1].trim().split(/[\s,]+/).filter((token) => token !== "");
  if (tokens.length > 10) return { error: `Enter up to 10 roads. You entered ${tokens.length}.` };
  const roads: Road[] = [];
  for (const token of tokens) {
    const match = /^(\d+)>(\d+):(\d+)$/.exec(token);
    if (!match) return { error: `“${token}” isn’t a road. Write roads like 0>1:4, meaning 0 to 1 takes 4.` };
    const [from, to, cost] = [Number(match[1]), Number(match[2]), Number(match[3])];
    if (from >= n || to >= n) return { error: `“${token}” uses a node that doesn’t exist. Use 0 to ${n - 1}.` };
    if (from === to) return { error: `“${token}” goes nowhere. Use two different nodes.` };
    if (cost < 1 || cost > 9) return { error: `“${token}” costs ${cost}. Use a cost from 1 to 9.` };
    if (roads.some(([a, b]) => a === from && b === to)) return { error: `“${token}” appears twice. Each road only needs one mention.` };
    roads.push([from, to, cost]);
  }
  return { n, roads };
}
