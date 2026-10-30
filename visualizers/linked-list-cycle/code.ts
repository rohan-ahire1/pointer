export const code: string[] = [
  "function hasCycle(head: ListNode | null): boolean {", // 0
  "  let slow = head, fast = head;", // 1
  "  while (fast && fast.next) {", // 2
  "    slow = slow!.next;", // 3
  "    fast = fast.next.next;", // 4
  "    if (slow === fast) return true;", // 5
  "  }", // 6
  "  return false;", // 7
  "}", // 8
];
