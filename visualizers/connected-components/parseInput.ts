import { splitOnBar } from "../kit/parseNumbers";
import type { ComponentsInput } from "./types";

export function parseInput(input: string): ComponentsInput | { error: string } {
  const parts = splitOnBar(input, "4 | 0-1 2-3");
  if ("error" in parts) return parts;
  const n = Number(parts[0].trim());
  if (!/^\d+$/.test(parts[0].trim()) || n < 2 || n > 7) return { error: "Before the |, enter how many nodes: 2 to 7." };
  const tokens = parts[1].trim().split(/[\s,]+/).filter((token) => token !== "");
  if (tokens.length > 8) return { error: `Enter up to 8 links. You entered ${tokens.length}.` };
  const links: [number, number][] = [];
  for (const token of tokens) {
    const match = /^(\d+)-(\d+)$/.exec(token);
    if (!match) return { error: `“${token}” isn’t a link. Write links like 0-1.` };
    const a = Number(match[1]);
    const b = Number(match[2]);
    if (a >= n || b >= n) return { error: `“${token}” uses a node that doesn’t exist. Use 0 to ${n - 1}.` };
    if (a === b) return { error: `“${token}” links a node to itself. Use two different nodes.` };
    links.push([a, b]);
  }
  return { n, links };
}
