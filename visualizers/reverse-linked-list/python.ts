import type { PythonCode } from "../types";

/** The same solution in Python. `lines[n]` is the Python line that TypeScript line n runs as. */
export const python: PythonCode = {
  code: [
    "def reverse_list(head: ListNode | None) -> ListNode | None:",
    "    prev = None",
    "    curr = head",
    "    while curr is not None:",
    "        nxt = curr.next",
    "        curr.next = prev",
    "        prev = curr",
    "        curr = nxt",
    "    return prev",
  ],
  lines: [0, 1, 2, 3, 4, 5, 6, 7, -1, 8, -1],
};
