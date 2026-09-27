/**
 * The solution shown in the code panel. One string per array entry — line
 * numbers here are exactly what Step["lines"] (from trace.ts) refers to.
 * Verbatim from docs/patterns/06-linked-list.md.
 */
export const code: string[] = [
  "function reverseList(head: ListNode | null): ListNode | null {", // 0
  "  let prev: ListNode | null = null;", // 1
  "  let curr = head;", // 2
  "  while (curr !== null) {", // 3
  "    const next = curr.next;", // 4
  "    curr.next = prev;", // 5
  "    prev = curr;", // 6
  "    curr = next;", // 7
  "  }", // 8
  "  return prev;", // 9
  "}", // 10
];
