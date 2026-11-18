/**
 * Worked solutions for the problems added after the Blind 75, shown behind a
 * "Solution" toggle on the lesson cards. Same style as the visualizer code:
 * plain functions (or a class for design problems), no LeetCode `Solution`
 * wrapper, and Python that runs as pasted. `content/solutions.test.ts` runs
 * every TypeScript version against a brute force.
 */
export type Solution = { ts: string; py: string };

export const SOLUTIONS: Record<string, Solution> = {
  "daily-temperatures": {
    ts: `function dailyTemperatures(temps: number[]): number[] {
  const out = new Array(temps.length).fill(0);
  // Days still waiting for a warmer one, coldest on top.
  const stack: number[] = [];
  for (let i = 0; i < temps.length; i++) {
    // Today answers every colder day on top.
    while (stack.length && temps[i] > temps[stack.at(-1)!]) {
      const day = stack.pop()!;
      out[day] = i - day;
    }
    stack.push(i);
  }
  // Days left on the stack never get warmer, so they stay 0.
  return out;
}`,
    py: `def daily_temperatures(temps: list[int]) -> list[int]:
    out = [0] * len(temps)
    # Days still waiting for a warmer one, coldest on top.
    stack = []
    for i, t in enumerate(temps):
        # Today answers every colder day on top.
        while stack and t > temps[stack[-1]]:
            day = stack.pop()
            out[day] = i - day
        stack.append(i)
    # Days left on the stack never get warmer, so they stay 0.
    return out`,
  },
  "largest-rectangle-in-histogram": {
    ts: `function largestRectangleArea(heights: number[]): number {
  // Indices of bars in rising height order.
  const stack: number[] = [];
  let best = 0;
  for (let i = 0; i <= heights.length; i++) {
    // A height-0 bar past the end pops everything still waiting.
    const h = i < heights.length ? heights[i] : 0;
    while (stack.length && h < heights[stack.at(-1)!]) {
      const height = heights[stack.pop()!];
      // The popped bar stretches from just after the new top to just before i.
      const left = stack.length ? stack.at(-1)! + 1 : 0;
      best = Math.max(best, height * (i - left));
    }
    stack.push(i);
  }
  return best;
}`,
    py: `def largest_rectangle_area(heights: list[int]) -> int:
    # Indices of bars in rising height order.
    stack = []
    best = 0
    # A height-0 bar past the end pops everything still waiting.
    for i, h in enumerate(heights + [0]):
        while stack and h < heights[stack[-1]]:
            height = heights[stack.pop()]
            # The popped bar stretches from just after the new top to just before i.
            left = stack[-1] + 1 if stack else 0
            best = max(best, height * (i - left))
        stack.append(i)
    return best`,
  },
  "trapping-rain-water": {
    ts: `function trap(height: number[]): number {
  // Bars that could still be the left wall of a pool, falling to the top.
  const stack: number[] = [];
  let water = 0;
  for (let i = 0; i < height.length; i++) {
    // A taller bar closes the dip on top of the stack.
    while (stack.length && height[i] > height[stack.at(-1)!]) {
      const floor = stack.pop()!;
      // No wall on the left, so this water runs off.
      if (!stack.length) break;
      const left = stack.at(-1)!;
      // Fill one layer: from the floor up to the lower wall.
      const depth = Math.min(height[left], height[i]) - height[floor];
      water += depth * (i - left - 1);
    }
    stack.push(i);
  }
  return water;
}`,
    py: `def trap(height: list[int]) -> int:
    # Bars that could still be the left wall of a pool, falling to the top.
    stack = []
    water = 0
    for i, h in enumerate(height):
        # A taller bar closes the dip on top of the stack.
        while stack and h > height[stack[-1]]:
            floor = stack.pop()
            # No wall on the left, so this water runs off.
            if not stack:
                break
            left = stack[-1]
            # Fill one layer: from the floor up to the lower wall.
            depth = min(height[left], h) - height[floor]
            water += depth * (i - left - 1)
        stack.append(i)
    return water`,
  },
  "sliding-window-maximum": {
    ts: `function maxSlidingWindow(nums: number[], k: number): number[] {
  // Indices whose values fall from front to back, so the front is the max.
  const queue: number[] = [];
  // Where the front is. Moving it is O(1), unlike shift().
  let head = 0;
  const out: number[] = [];
  for (let i = 0; i < nums.length; i++) {
    // Smaller values before nums[i] can never be the max again.
    while (queue.length > head && nums[queue.at(-1)!] <= nums[i]) queue.pop();
    queue.push(i);
    // The front has slid out of the window.
    if (queue[head] <= i - k) head++;
    if (i >= k - 1) out.push(nums[queue[head]]);
  }
  return out;
}`,
    py: `from collections import deque

def max_sliding_window(nums: list[int], k: int) -> list[int]:
    # Indices whose values fall from front to back, so the front is the max.
    queue = deque()
    out = []
    for i, x in enumerate(nums):
        # Smaller values before x can never be the max again.
        while queue and nums[queue[-1]] <= x:
            queue.pop()
        queue.append(i)
        # The front has slid out of the window.
        if queue[0] <= i - k:
            queue.popleft()
        if i >= k - 1:
            out.append(nums[queue[0]])
    return out`,
  },
  "decode-string": {
    ts: `function decodeString(s: string): string {
  // What came before each open bracket, and how many times to repeat what's inside.
  const stack: [string, number][] = [];
  let current = "";
  let count = 0;
  for (const ch of s) {
    if (ch >= "0" && ch <= "9") {
      // Counts can have more than one digit.
      count = count * 10 + Number(ch);
    } else if (ch === "[") {
      stack.push([current, count]);
      current = "";
      count = 0;
    } else if (ch === "]") {
      // The innermost bracket closes first.
      const [before, times] = stack.pop()!;
      current = before + current.repeat(times);
    } else {
      current += ch;
    }
  }
  return current;
}`,
    py: `def decode_string(s: str) -> str:
    # What came before each open bracket, and how many times to repeat what's inside.
    stack = []
    current = ""
    count = 0
    for ch in s:
        if ch.isdigit():
            # Counts can have more than one digit.
            count = count * 10 + int(ch)
        elif ch == "[":
            stack.append((current, count))
            current = ""
            count = 0
        elif ch == "]":
            # The innermost bracket closes first.
            before, times = stack.pop()
            current = before + current * times
        else:
            current += ch
    return current`,
  },
  "basic-calculator-ii": {
    ts: `function calculate(s: string): number {
  // Terms to add up at the end. * and / fold into the last term straight away.
  const stack: number[] = [];
  let num = 0;
  let op = "+";
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    const digit = ch >= "0" && ch <= "9";
    if (digit) num = num * 10 + Number(ch);
    // An operator, or the last character, settles the number before it.
    if ((!digit && ch !== " ") || i === s.length - 1) {
      if (op === "+") stack.push(num);
      else if (op === "-") stack.push(-num);
      else if (op === "*") stack.push(stack.pop()! * num);
      // Division rounds toward zero.
      else stack.push(Math.trunc(stack.pop()! / num));
      op = ch;
      num = 0;
    }
  }
  return stack.reduce((sum, term) => sum + term, 0);
}`,
    py: `def calculate(s: str) -> int:
    # Terms to add up at the end. * and / fold into the last term straight away.
    stack = []
    num = 0
    op = "+"
    for i, ch in enumerate(s):
        if ch.isdigit():
            num = num * 10 + int(ch)
        # An operator, or the last character, settles the number before it.
        if (not ch.isdigit() and ch != " ") or i == len(s) - 1:
            if op == "+":
                stack.append(num)
            elif op == "-":
                stack.append(-num)
            elif op == "*":
                stack.append(stack.pop() * num)
            else:
                # Division rounds toward zero.
                stack.append(int(stack.pop() / num))
            op = ch
            num = 0
    return sum(stack)`,
  },
  "min-stack": {
    ts: `class MinStack {
  // Each entry keeps its value and the smallest value at or below it.
  private stack: [number, number][] = [];

  push(val: number): void {
    const min = this.stack.length ? Math.min(val, this.stack.at(-1)![1]) : val;
    this.stack.push([val, min]);
  }

  pop(): void {
    this.stack.pop();
  }

  top(): number {
    return this.stack.at(-1)![0];
  }

  getMin(): number {
    return this.stack.at(-1)![1];
  }
}`,
    py: `class MinStack:
    def __init__(self):
        # Each entry keeps its value and the smallest value at or below it.
        self.stack = []

    def push(self, val: int) -> None:
        low = min(val, self.stack[-1][1]) if self.stack else val
        self.stack.append((val, low))

    def pop(self) -> None:
        self.stack.pop()

    def top(self) -> int:
        return self.stack[-1][0]

    def getMin(self) -> int:
        return self.stack[-1][1]`,
  },
  "lru-cache": {
    ts: `class Node {
  prev: Node | null = null;
  next: Node | null = null;
  constructor(public key: number, public value: number) {}
}

class LRUCache {
  // The map finds a node at once. The list keeps nodes from oldest to newest.
  private map = new Map<number, Node>();
  private head = new Node(0, 0); // oldest end
  private tail = new Node(0, 0); // newest end

  constructor(private capacity: number) {
    this.head.next = this.tail;
    this.tail.prev = this.head;
  }

  get(key: number): number {
    const node = this.map.get(key);
    if (!node) return -1;
    // Using a key makes it the newest.
    this.remove(node);
    this.append(node);
    return node.value;
  }

  put(key: number, value: number): void {
    const old = this.map.get(key);
    if (old) this.remove(old);
    const node = new Node(key, value);
    this.map.set(key, node);
    this.append(node);
    if (this.map.size > this.capacity) {
      // The node next to the head is the one used longest ago.
      const oldest = this.head.next!;
      this.remove(oldest);
      this.map.delete(oldest.key);
    }
  }

  private remove(node: Node): void {
    node.prev!.next = node.next;
    node.next!.prev = node.prev;
  }

  private append(node: Node): void {
    node.prev = this.tail.prev;
    node.next = this.tail;
    this.tail.prev!.next = node;
    this.tail.prev = node;
  }
}`,
    py: `class Node:
    def __init__(self, key: int, value: int):
        self.key, self.value = key, value
        self.prev = self.next = None


class LRUCache:
    def __init__(self, capacity: int):
        # The map finds a node at once. The list keeps nodes from oldest to newest.
        self.capacity = capacity
        self.map = {}
        self.head = Node(0, 0)  # oldest end
        self.tail = Node(0, 0)  # newest end
        self.head.next = self.tail
        self.tail.prev = self.head

    def get(self, key: int) -> int:
        node = self.map.get(key)
        if node is None:
            return -1
        # Using a key makes it the newest.
        self.remove(node)
        self.append(node)
        return node.value

    def put(self, key: int, value: int) -> None:
        old = self.map.get(key)
        if old is not None:
            self.remove(old)
        node = Node(key, value)
        self.map[key] = node
        self.append(node)
        if len(self.map) > self.capacity:
            # The node next to the head is the one used longest ago.
            oldest = self.head.next
            self.remove(oldest)
            del self.map[oldest.key]

    def remove(self, node: Node) -> None:
        node.prev.next = node.next
        node.next.prev = node.prev

    def append(self, node: Node) -> None:
        node.prev = self.tail.prev
        node.next = self.tail
        self.tail.prev.next = node
        self.tail.prev = node`,
  },
  "time-based-key-value-store": {
    ts: `class TimeMap {
  // Each key's values in the order they were set. Timestamps only grow.
  private store = new Map<string, [number, string][]>();

  set(key: string, value: string, timestamp: number): void {
    if (!this.store.has(key)) this.store.set(key, []);
    this.store.get(key)!.push([timestamp, value]);
  }

  get(key: string, timestamp: number): string {
    const entries = this.store.get(key) ?? [];
    // Binary search for the last entry set at or before timestamp.
    let lo = 0;
    let hi = entries.length - 1;
    let answer = "";
    while (lo <= hi) {
      const mid = (lo + hi) >> 1;
      if (entries[mid][0] <= timestamp) {
        answer = entries[mid][1];
        lo = mid + 1;
      } else {
        hi = mid - 1;
      }
    }
    return answer;
  }
}`,
    py: `class TimeMap:
    def __init__(self):
        # Each key's values in the order they were set. Timestamps only grow.
        self.store = {}

    def set(self, key: str, value: str, timestamp: int) -> None:
        self.store.setdefault(key, []).append((timestamp, value))

    def get(self, key: str, timestamp: int) -> str:
        entries = self.store.get(key, [])
        # Binary search for the last entry set at or before timestamp.
        lo, hi = 0, len(entries) - 1
        answer = ""
        while lo <= hi:
            mid = (lo + hi) // 2
            if entries[mid][0] <= timestamp:
                answer = entries[mid][1]
                lo = mid + 1
            else:
                hi = mid - 1
        return answer`,
  },
  "insert-delete-getrandom-o1": {
    ts: `class RandomizedSet {
  // The values packed into an array, and where each one sits.
  private values: number[] = [];
  private index = new Map<number, number>();

  insert(val: number): boolean {
    if (this.index.has(val)) return false;
    this.index.set(val, this.values.length);
    this.values.push(val);
    return true;
  }

  remove(val: number): boolean {
    const i = this.index.get(val);
    if (i === undefined) return false;
    // Move the last value into the gap, then drop the end. No shifting.
    const last = this.values.at(-1)!;
    this.values[i] = last;
    this.index.set(last, i);
    this.values.pop();
    this.index.delete(val);
    return true;
  }

  getRandom(): number {
    return this.values[Math.floor(Math.random() * this.values.length)];
  }
}`,
    py: `import random


class RandomizedSet:
    def __init__(self):
        # The values packed into a list, and where each one sits.
        self.values = []
        self.index = {}

    def insert(self, val: int) -> bool:
        if val in self.index:
            return False
        self.index[val] = len(self.values)
        self.values.append(val)
        return True

    def remove(self, val: int) -> bool:
        if val not in self.index:
            return False
        # Move the last value into the gap, then drop the end. No shifting.
        i = self.index[val]
        last = self.values[-1]
        self.values[i] = last
        self.index[last] = i
        self.values.pop()
        del self.index[val]
        return True

    def getRandom(self) -> int:
        return random.choice(self.values)`,
  },
};
