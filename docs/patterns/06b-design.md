# 06b · Design — LRU Cache

- **Visualizer id:** `lru-cache` · **Folder:** `visualizers/lru-cache/`
- **Title:** "LRU Cache"
- **Story:** two structures, one job each. The map answers "where is key k?" and the doubly linked list answers "which key was used longest ago?". Together every call is O(1).

## Input
- `inputLabel`: `capacity | calls =` · `inputMaxLength`: 120
- Format: `capacity | put k v, get k, ...`. Capacity 1–4, up to 10 calls, keys 0–9, values 0–99.
- Presets and expected `get` results:
  - `2 | put 1 1, put 2 2, get 1, put 3 3, get 2, put 4 4, get 1, get 3, get 4` → `1, -1, -1, 3, 4` (LeetCode example)
  - `2 | put 1 10, put 2 20, put 1 15, put 3 30, get 2, get 1` → `-1, 15` (an update counts as a use)
  - `1 | put 5 50, get 5, put 6 60, get 5` → `50, -1`

## Reference solution
`visualizers/lru-cache/code.ts`: a `Node` class plus `LRUCache` with a `Map<number, Node>`, `head`/`tail` sentinels,
`get`, `put`, and the two helpers `remove(node)` and `append(node)`. Oldest sits next to `head`, newest next to `tail`.

## Steps (one per call)
| Phase | When | note (example) |
|---|---|---|
| setup | start | Capacity 2. An empty map, and a list that runs from oldest to newest. |
| hit | get finds the key | get(1): the map points at its node. Move it to the newest end and return 1. |
| miss | get misses | get(2): the map has no 2, so return -1. |
| update | put on a key that exists | put(1, 15): 1 is already here. Unlink it and add the new value at the newest end. |
| insert | put on a new key, room left | put(3, 3): a new node goes on the newest end, and into the map. |
| evict | insert went over capacity | That's 3 keys, over capacity. Drop the oldest, 1, from the list and the map. |
| done | end | Done. The gets returned 1, -1, -1, 3, 4. |

State: `{ capacity, calls, call, list: {key, value}[] (oldest first), key, evicted, results, phase }`.
The list can hold capacity + 1 nodes only during an `insert` step, the moment before the eviction, which matches the code.

## Tests: brute force
`trace.test.ts` replays every preset and random call lists against a plain array kept in use order and checks each `get`
result, the list order after every step, and that the list never exceeds capacity outside the insert phase.

## Explainer video
`design` in `components/Lesson/LessonWatch/animation/PatternVideo.tsx`, stage in `stages-design.tsx`. Beat 1 shows the
brute force (scan a plain list on every call: 12 keys scanned for preset 0), beats 2–4 play the traced steps.

## Problems
min-stack (155), lru-cache (146, visualized), time-based-key-value-store (981), insert-delete-getrandom-o1 (380).
