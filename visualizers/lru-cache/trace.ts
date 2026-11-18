import { list as listOf } from "../kit/format";
import type { Step } from "../types";
import type { LruInput, LruState } from "./types";

/**
 * A hash map finds a key's node in O(1), and a doubly linked list keeps the
 * nodes in order of use: oldest by the head, newest by the tail. Every call
 * unlinks or links a node in O(1), so no call ever scans.
 */
export function trace({ capacity, calls }: LruInput): Step<LruState>[] {
  const list: { key: number; value: number }[] = [];
  const results: (number | null)[] = calls.map(() => null);
  const steps: Step<LruState>[] = [];
  const order = () => (list.length ? listOf(list.map((n) => n.key)) : "empty");
  const push = (
    call: number,
    key: number | null,
    evicted: number | null,
    phase: LruState["phase"],
    lines: number[],
    note: string,
    sr: string,
  ) => {
    steps.push({
      state: { capacity, calls, call, list: list.map((n) => ({ ...n })), key, evicted, results: [...results], phase },
      lines,
      note,
      sr,
    });
  };

  push(-1, null, null, "setup", [10, 11, 12], `Capacity ${capacity}. An empty map, and a list that runs from oldest to newest.`, `Capacity ${capacity}. The cache is empty.`);
  calls.forEach((c, call) => {
    const at = list.findIndex((n) => n.key === c.key);
    if (c.op === "get") {
      if (at < 0) {
        results[call] = -1;
        push(call, c.key, null, "miss", [15, 16], `get(${c.key}): the map has no ${c.key}, so return -1.`, `get ${c.key} returns -1. Oldest to newest: ${order()}.`);
        return;
      }
      const [node] = list.splice(at, 1);
      list.push(node);
      results[call] = node.value;
      push(call, c.key, null, "hit", [15, 17, 18, 19], `get(${c.key}): the map points at its node. Move it to the newest end and return ${node.value}.`, `get ${c.key} returns ${node.value}. Oldest to newest: ${order()}.`);
      return;
    }
    if (at >= 0) list.splice(at, 1);
    list.push({ key: c.key, value: c.value });
    if (at >= 0) {
      push(call, c.key, null, "update", [22, 23, 24, 25, 26], `put(${c.key}, ${c.value}): ${c.key} is already here. Unlink it and add the new value at the newest end.`, `Updated ${c.key} to ${c.value}. Oldest to newest: ${order()}.`);
    } else {
      push(call, c.key, null, "insert", [22, 24, 25, 26], `put(${c.key}, ${c.value}): a new node goes on the newest end, and into the map.`, `Added ${c.key}. Oldest to newest: ${order()}.`);
    }
    if (list.length > capacity) {
      const oldest = list.shift()!;
      push(call, c.key, oldest.key, "evict", [27, 28, 29, 30], `That's ${capacity + 1} keys, over capacity. Drop the oldest, ${oldest.key}, from the list and the map.`, `Evicted ${oldest.key}. Oldest to newest: ${order()}.`);
    }
  });
  const got = results.filter((r): r is number => r !== null);
  push(-1, null, null, "done", [19], got.length ? `Done. The gets returned ${listOf(got)}.` : "Done. No gets, so nothing was returned.", `Done. Oldest to newest: ${order()}.`);
  return steps;
}
