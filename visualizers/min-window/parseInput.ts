import { splitOnBar } from "../kit/parseNumbers";
import type { MinWindowInput } from "./types";

export function parseInput(input: string): MinWindowInput | { error: string } {
  const parts = splitOnBar(input, "ADOBECODEBANC | ABC");
  if ("error" in parts) return parts;
  const s = parts[0].trim();
  const t = parts[1].trim();
  if (!/^[a-zA-Z]{1,13}$/.test(s)) return { error: "Before the |, enter 1–13 letters with no spaces." };
  if (!/^[a-zA-Z]{1,5}$/.test(t)) return { error: "After the |, enter 1–5 letters with no spaces." };
  return { s, t };
}
