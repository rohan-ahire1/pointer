import type { PythonCode } from "../types";

/** The same solution in Python. `lines[n]` is the Python line that TypeScript line n runs as. */
export const python: PythonCode = {
  code: [
    "def has_cycle(head: ListNode | None) -> bool:",
    "    slow = fast = head",
    "    while fast and fast.next:",
    "        slow = slow.next",
    "        fast = fast.next.next",
    "        if slow is fast:",
    "            return True",
    "    return False",
  ],
  lines: [0, 1, 2, 3, 4, 5, -1, 7, -1],
};
