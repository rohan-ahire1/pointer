export const code: string[] = [
  "class Node {", // 0
  "  prev: Node | null = null;", // 1
  "  next: Node | null = null;", // 2
  "  constructor(public key: number, public value: number) {}", // 3
  "}", // 4
  "", // 5
  "class LRUCache {", // 6
  "  private map = new Map<number, Node>();", // 7
  "  private head = new Node(0, 0); // oldest end", // 8
  "  private tail = new Node(0, 0); // newest end", // 9
  "  constructor(private capacity: number) {", // 10
  "    this.head.next = this.tail;", // 11
  "    this.tail.prev = this.head;", // 12
  "  }", // 13
  "  get(key: number): number {", // 14
  "    const node = this.map.get(key);", // 15
  "    if (!node) return -1;", // 16
  "    this.remove(node);", // 17
  "    this.append(node); // now the newest", // 18
  "    return node.value;", // 19
  "  }", // 20
  "  put(key: number, value: number): void {", // 21
  "    const old = this.map.get(key);", // 22
  "    if (old) this.remove(old);", // 23
  "    const node = new Node(key, value);", // 24
  "    this.map.set(key, node);", // 25
  "    this.append(node);", // 26
  "    if (this.map.size > this.capacity) {", // 27
  "      const oldest = this.head.next!;", // 28
  "      this.remove(oldest);", // 29
  "      this.map.delete(oldest.key);", // 30
  "    }", // 31
  "  }", // 32
  "  private remove(node: Node): void {", // 33
  "    node.prev!.next = node.next;", // 34
  "    node.next!.prev = node.prev;", // 35
  "  }", // 36
  "  private append(node: Node): void {", // 37
  "    node.prev = this.tail.prev;", // 38
  "    node.next = this.tail;", // 39
  "    this.tail.prev!.next = node;", // 40
  "    this.tail.prev = node;", // 41
  "  }", // 42
  "}", // 43
];
