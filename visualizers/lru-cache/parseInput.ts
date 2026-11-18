import { splitOnBar } from "../kit/parseNumbers";
import { stripPasteSyntax } from "../kit/paste";
import type { LruCall, LruInput } from "./types";

const RULE = "calls like put 1 10 or get 1, split by commas";

/** `2 | put 1 1, get 1`: a capacity of 1–4, then up to 10 calls with keys 0–9 and values 0–99. */
export function parseInput(input: string): LruInput | { error: string } {
  const parts = splitOnBar(input, "2 | put 1 10, get 1");
  if ("error" in parts) return parts;
  const capText = stripPasteSyntax(parts[0]).trim();
  if (!/^\d+$/.test(capText) || Number(capText) < 1 || Number(capText) > 4) {
    return { error: "Start with a capacity from 1 to 4, then |." };
  }
  const chunks = parts[1]
    .split(",")
    .map((chunk) => chunk.trim().toLowerCase())
    .filter((chunk) => chunk !== "");
  if (chunks.length === 0) return { error: `Add 1–10 ${RULE}.` };
  if (chunks.length > 10) return { error: `Use up to 10 calls. You entered ${chunks.length}.` };
  const calls: LruCall[] = [];
  for (const chunk of chunks) {
    const get = /^get\s+(\d+)$/.exec(chunk);
    const put = /^put\s+(\d+)\s+(\d+)$/.exec(chunk);
    const key = Number((get ?? put)?.[1]);
    if (!get && !put) return { error: `“${chunk}” isn’t a call. Use ${RULE}.` };
    if (key > 9) return { error: `Key ${key} is out of range. Keys run from 0 to 9.` };
    if (put) {
      const value = Number(put[2]);
      if (value > 99) return { error: `Value ${value} is out of range. Values run from 0 to 99.` };
      calls.push({ op: "put", key, value });
    } else {
      calls.push({ op: "get", key });
    }
  }
  return { capacity: Number(capText), calls };
}
