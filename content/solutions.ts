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
  "binary-search": {
    ts: `function search(nums: number[], target: number): number {
  let lo = 0;
  let hi = nums.length - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (nums[mid] === target) return mid;
    // The target is bigger, so everything up to mid is out.
    if (nums[mid] < target) lo = mid + 1;
    else hi = mid - 1;
  }
  return -1;
}`,
    py: `def search(nums: list[int], target: int) -> int:
    lo, hi = 0, len(nums) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        if nums[mid] == target:
            return mid
        # The target is bigger, so everything up to mid is out.
        if nums[mid] < target:
            lo = mid + 1
        else:
            hi = mid - 1
    return -1`,
  },
  "search-a-2d-matrix": {
    ts: `function searchMatrix(matrix: number[][], target: number): boolean {
  const cols = matrix[0].length;
  // Read the grid row by row as one sorted list of rows * cols numbers.
  let lo = 0;
  let hi = matrix.length * cols - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    const value = matrix[Math.floor(mid / cols)][mid % cols];
    if (value === target) return true;
    if (value < target) lo = mid + 1;
    else hi = mid - 1;
  }
  return false;
}`,
    py: `def search_matrix(matrix: list[list[int]], target: int) -> bool:
    cols = len(matrix[0])
    # Read the grid row by row as one sorted list of rows * cols numbers.
    lo, hi = 0, len(matrix) * cols - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        value = matrix[mid // cols][mid % cols]
        if value == target:
            return True
        if value < target:
            lo = mid + 1
        else:
            hi = mid - 1
    return False`,
  },
  "find-first-and-last-position-of-element-in-sorted-array": {
    ts: `function searchRange(nums: number[], target: number): number[] {
  // The first index whose value is at least x, or nums.length if none is.
  const firstAtLeast = (x: number): number => {
    let lo = 0;
    let hi = nums.length;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (nums[mid] < x) lo = mid + 1;
      else hi = mid;
    }
    return lo;
  };
  const first = firstAtLeast(target);
  if (first === nums.length || nums[first] !== target) return [-1, -1];
  // The last copy sits just before the first value bigger than target.
  return [first, firstAtLeast(target + 1) - 1];
}`,
    py: `def search_range(nums: list[int], target: int) -> list[int]:
    # The first index whose value is at least x, or len(nums) if none is.
    def first_at_least(x: int) -> int:
        lo, hi = 0, len(nums)
        while lo < hi:
            mid = (lo + hi) // 2
            if nums[mid] < x:
                lo = mid + 1
            else:
                hi = mid
        return lo

    first = first_at_least(target)
    if first == len(nums) or nums[first] != target:
        return [-1, -1]
    # The last copy sits just before the first value bigger than target.
    return [first, first_at_least(target + 1) - 1]`,
  },
  "find-peak-element": {
    ts: `function findPeakElement(nums: number[]): number {
  let lo = 0;
  let hi = nums.length - 1;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    // Uphill to the right: the climb must top out somewhere past mid.
    if (nums[mid] < nums[mid + 1]) lo = mid + 1;
    // Downhill: mid itself, or something to its left, is a peak.
    else hi = mid;
  }
  return lo;
}`,
    py: `def find_peak_element(nums: list[int]) -> int:
    lo, hi = 0, len(nums) - 1
    while lo < hi:
        mid = (lo + hi) // 2
        if nums[mid] < nums[mid + 1]:
            # Uphill to the right: the climb must top out somewhere past mid.
            lo = mid + 1
        else:
            # Downhill: mid itself, or something to its left, is a peak.
            hi = mid
    return lo`,
  },
  "koko-eating-bananas": {
    ts: `function minEatingSpeed(piles: number[], h: number): number {
  // Every speed from 1 to the biggest pile is a possible answer.
  let lo = 1;
  let hi = Math.max(...piles);
  while (lo < hi) {
    const k = Math.floor((lo + hi) / 2);
    let hours = 0;
    for (const p of piles) hours += Math.ceil(p / k);
    if (hours <= h) hi = k; // fast enough: try slower
    else lo = k + 1; // too slow: go faster
  }
  return lo;
}`,
    py: `def min_eating_speed(piles: list[int], h: int) -> int:
    # Every speed from 1 to the biggest pile is a possible answer.
    lo, hi = 1, max(piles)
    while lo < hi:
        k = (lo + hi) // 2
        hours = 0
        for p in piles:
            hours += (p + k - 1) // k  # round up
        if hours <= h:
            hi = k  # fast enough: try slower
        else:
            lo = k + 1  # too slow: go faster
    return lo`,
  },
  "split-array-largest-sum": {
    ts: `function splitArray(nums: number[], k: number): number {
  // How many pieces do we need if no piece may add up to more than cap?
  const piecesFor = (cap: number): number => {
    let pieces = 1;
    let sum = 0;
    for (const x of nums) {
      if (sum + x > cap) {
        pieces++;
        sum = 0;
      }
      sum += x;
    }
    return pieces;
  };
  // The answer is at least the biggest number and at most the whole sum.
  let lo = Math.max(...nums);
  let hi = nums.reduce((a, b) => a + b, 0);
  while (lo < hi) {
    const cap = Math.floor((lo + hi) / 2);
    if (piecesFor(cap) <= k) hi = cap; // k pieces are enough: try a smaller cap
    else lo = cap + 1;
  }
  return lo;
}`,
    py: `def split_array(nums: list[int], k: int) -> int:
    # How many pieces do we need if no piece may add up to more than cap?
    def pieces_for(cap: int) -> int:
        pieces, total = 1, 0
        for x in nums:
            if total + x > cap:
                pieces += 1
                total = 0
            total += x
        return pieces

    # The answer is at least the biggest number and at most the whole sum.
    lo, hi = max(nums), sum(nums)
    while lo < hi:
        cap = (lo + hi) // 2
        if pieces_for(cap) <= k:
            hi = cap  # k pieces are enough: try a smaller cap
        else:
            lo = cap + 1
    return lo`,
  },
  "median-of-two-sorted-arrays": {
    ts: `function findMedianSortedArrays(nums1: number[], nums2: number[]): number {
  // Binary search the shorter array.
  const [a, b] = nums1.length <= nums2.length ? [nums1, nums2] : [nums2, nums1];
  const m = a.length;
  const n = b.length;
  const half = Math.floor((m + n + 1) / 2);
  let lo = 0;
  let hi = m;
  while (lo <= hi) {
    // The left half takes i values from a and the rest from b.
    const i = (lo + hi) >> 1;
    const j = half - i;
    const aLeft = i > 0 ? a[i - 1] : -Infinity;
    const aRight = i < m ? a[i] : Infinity;
    const bLeft = j > 0 ? b[j - 1] : -Infinity;
    const bRight = j < n ? b[j] : Infinity;
    if (aLeft <= bRight && bLeft <= aRight) {
      // A clean cut: everything on the left is at most everything on the right.
      const leftMax = Math.max(aLeft, bLeft);
      if ((m + n) % 2 === 1) return leftMax;
      return (leftMax + Math.min(aRight, bRight)) / 2;
    }
    if (aLeft > bRight) hi = i - 1; // took too many from a
    else lo = i + 1; // took too few from a
  }
  throw new Error("The arrays must be sorted.");
}`,
    py: `def find_median_sorted_arrays(nums1: list[int], nums2: list[int]) -> float:
    # Binary search the shorter array.
    a, b = (nums1, nums2) if len(nums1) <= len(nums2) else (nums2, nums1)
    m, n = len(a), len(b)
    half = (m + n + 1) // 2
    lo, hi = 0, m
    while lo <= hi:
        # The left half takes i values from a and the rest from b.
        i = (lo + hi) // 2
        j = half - i
        a_left = a[i - 1] if i > 0 else float("-inf")
        a_right = a[i] if i < m else float("inf")
        b_left = b[j - 1] if j > 0 else float("-inf")
        b_right = b[j] if j < n else float("inf")
        if a_left <= b_right and b_left <= a_right:
            # A clean cut: everything on the left is at most everything on the right.
            left_max = max(a_left, b_left)
            if (m + n) % 2 == 1:
                return float(left_max)
            return (left_max + min(a_right, b_right)) / 2
        if a_left > b_right:
            hi = i - 1  # took too many from a
        else:
            lo = i + 1  # took too few from a
    raise ValueError("The arrays must be sorted.")`,
  },
};
