import { splitOnBar } from "../kit/parseNumbers";
import type { CourseInput } from "./types";

export function parseInput(input: string): CourseInput | { error: string } {
  const parts = splitOnBar(input, "4 | 0>1 0>2");
  if ("error" in parts) return parts;
  const n = Number(parts[0].trim());
  if (!/^\d+$/.test(parts[0].trim()) || n < 2 || n > 6) return { error: "Before the |, enter how many courses: 2 to 6." };
  const tokens = parts[1].trim().split(/[\s,]+/).filter((token) => token !== "");
  if (tokens.length > 9) return { error: `Enter up to 9 links. You entered ${tokens.length}.` };
  const edges: [number, number][] = [];
  for (const token of tokens) {
    const match = /^(\d+)>(\d+)$/.exec(token);
    if (!match) return { error: `“${token}” isn’t a link. Write links like 0>1, meaning take 0 before 1.` };
    const before = Number(match[1]);
    const after = Number(match[2]);
    if (before >= n || after >= n) return { error: `“${token}” uses a course that doesn’t exist. Use 0 to ${n - 1}.` };
    if (before === after) return { error: `“${token}” links a course to itself. Use two different courses.` };
    if (edges.some(([a, b]) => a === before && b === after)) return { error: `“${token}” appears twice. Each link only needs one mention.` };
    edges.push([before, after]);
  }
  return { n, edges };
}
