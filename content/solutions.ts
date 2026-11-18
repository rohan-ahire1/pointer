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
};
