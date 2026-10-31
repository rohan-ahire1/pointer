/**
 * The reusable half of each pattern: a code skeleton to start from and the
 * mistakes people make with it. Shown on the lesson page and the cheat sheet.
 * Kept in TypeScript rather than JSON so the multi-line snippets stay readable.
 */
export type PatternGuide = {
  /** Skeleton in each language; names like `valid()` stand in for your problem's logic. */
  template: { ts: string; py: string };
  pitfalls: string[];
};

export const PATTERN_GUIDES: Record<string, PatternGuide> = {
  "arrays-and-hashing": {
    template: {
      ts: `// Remember each number and where you saw it.
const seen = new Map<number, number>();
for (let i = 0; i < nums.length; i++) {
  // What would pair with this number?
  const key = wanted(nums[i]);
  if (seen.has(key)) return [seen.get(key)!, i];
  // Store after the check so it can't match itself.
  seen.set(nums[i], i);
}`,
      py: `# Remember each number and where you saw it.
seen = {}
for i, x in enumerate(nums):
    # What would pair with this number?
    key = wanted(x)
    if key in seen:
        return [seen[key], i]
    # Store after the check so it can't match itself.
    seen[x] = i`,
    },
    pitfalls: [
      "Writing a nested loop before asking what you could store instead.",
      "Looking things up in a list, which costs O(n) every time.",
      "Using an array as a map key. Turn it into a string or tuple first.",
    ],
  },
  "two-pointers": {
    template: {
      ts: `// Start at both ends of the sorted array.
let l = 0, r = nums.length - 1;
while (l < r) {
  if (isAnswer(l, r)) return [l, r];
  // Each step rules out one end for good.
  if (needBigger(l, r)) l++;
  else r--;
}`,
      py: `# Start at both ends of the sorted array.
l, r = 0, len(nums) - 1
while l < r:
    if is_answer(l, r):
        return [l, r]
    # Each step rules out one end for good.
    if need_bigger(l, r):
        l += 1
    else:
        r -= 1`,
    },
    pitfalls: [
      "Forgetting to sort first when the logic depends on order.",
      "Using l <= r when a pair needs two different elements.",
      "Not skipping duplicates in problems that ask for unique answers.",
    ],
  },
  "sliding-window": {
    template: {
      ts: `let left = 0, best = 0;
for (let right = 0; right < s.length; right++) {
  // Grow: take in the next item.
  add(s[right]);
  // Shrink from the left until the window is valid.
  while (!valid()) remove(s[left++]);
  // Only count the window once it's valid.
  best = Math.max(best, right - left + 1);
}`,
      py: `left = best = 0
for right, ch in enumerate(s):
    # Grow: take in the next item.
    add(ch)
    # Shrink from the left until the window is valid.
    while not valid():
        remove(s[left])
        left += 1
    # Only count the window once it's valid.
    best = max(best, right - left + 1)`,
    },
    pitfalls: [
      "Updating the answer before the window is valid again.",
      "Forgetting to remove the left item when you shrink.",
      "Using it on a problem with negative numbers, where growing can lower the sum.",
    ],
  },
  stack: {
    template: {
      ts: `// Items still waiting for their answer.
const stack: number[] = [];
for (const x of items) {
  // Pop every item that x settles.
  while (stack.length && shouldPop(stack.at(-1)!, x)) {
    resolve(stack.pop()!, x);
  }
  // x now waits for its own answer.
  stack.push(x);
}`,
      py: `# Items still waiting for their answer.
stack = []
for x in items:
    # Pop every item that x settles.
    while stack and should_pop(stack[-1], x):
        resolve(stack.pop(), x)
    # x now waits for its own answer.
    stack.append(x)`,
    },
    pitfalls: [
      "Popping from an empty stack. Check it first.",
      "Forgetting what’s still on the stack when the loop ends.",
      "Storing values when you’ll need indices later.",
    ],
  },
  "binary-search": {
    template: {
      ts: `let lo = 0, hi = nums.length - 1;
// Stop when lo and hi meet on the answer.
while (lo < hi) {
  // Rounds down, so mid is never hi.
  const mid = Math.floor((lo + hi) / 2);
  // mid is ruled out, so skip past it.
  if (answerIsRightOf(mid)) lo = mid + 1;
  // mid could be the answer, so keep it.
  else hi = mid;
}
return lo;`,
      py: `lo, hi = 0, len(nums) - 1
# Stop when lo and hi meet on the answer.
while lo < hi:
    # Rounds down, so mid is never hi.
    mid = (lo + hi) // 2
    if answer_is_right_of(mid):
        # mid is ruled out, so skip past it.
        lo = mid + 1
    else:
        # mid could be the answer, so keep it.
        hi = mid
return lo`,
    },
    pitfalls: [
      "Setting lo = mid, which loops forever when lo and hi are neighbours.",
      "Mixing lo < hi with hi = mid - 1 without checking the last element.",
      "Assuming it needs a sorted array. It needs a yes/no that flips once.",
    ],
  },
  "linked-list": {
    template: {
      ts: `// Fake node in front, so the head isn't special.
const dummy = new ListNode(0, head);
let prev = dummy, curr = head;
while (curr) {
  // Save this before rewiring cuts the link.
  const next = curr.next;
  rewire(prev, curr);
  prev = curr;
  curr = next;
}
// The real head, even if the old one moved.
return dummy.next;`,
      py: `# Fake node in front, so the head isn't special.
dummy = ListNode(0, head)
prev, curr = dummy, head
while curr:
    # Save this before rewiring cuts the link.
    nxt = curr.next
    rewire(prev, curr)
    prev, curr = curr, nxt
# The real head, even if the old one moved.
return dummy.next`,
    },
    pitfalls: [
      "Cutting a link before saving the node after it.",
      "Skipping the dummy node, then special-casing the head.",
      "Reading .next on a node that might be null.",
    ],
  },
  trees: {
    template: {
      ts: `function dfs(node: TreeNode | null): number {
  // Empty node: the smallest case, answer it directly.
  if (!node) return 0;
  // Trust each call to solve its own subtree.
  const left = dfs(node.left);
  const right = dfs(node.right);
  // Build this node's answer from its children's.
  return combine(node, left, right);
}`,
      py: `def dfs(node):
    # Empty node: the smallest case, answer it directly.
    if not node:
        return 0
    # Trust each call to solve its own subtree.
    left = dfs(node.left)
    right = dfs(node.right)
    # Build this node's answer from its children's.
    return combine(node, left, right)`,
    },
    pitfalls: [
      "Leaving out the empty-node base case.",
      "Checking a node against its parent only. BST rules cover the whole subtree.",
      "Mixing up what a call returns with the answer you’re tracking.",
    ],
  },
  tries: {
    template: {
      ts: `let node = root;
for (const ch of word) {
  // Make the path if this letter isn't there yet.
  if (!node.children.has(ch)) {
    node.children.set(ch, new TrieNode());
  }
  node = node.children.get(ch)!;
}
// Without this, "app" matches because of "apple".
node.isWord = true;`,
      py: `node = root
for ch in word:
    # Make the path if this letter isn't there yet.
    if ch not in node.children:
        node.children[ch] = TrieNode()
    node = node.children[ch]
# Without this, "app" matches because of "apple".
node.is_word = True`,
    },
    pitfalls: [
      "Forgetting the end-of-word flag, so “app” matches because “apple” exists.",
      "Reaching for a trie when a plain set of words is enough.",
      "Not pruning used words in board searches, which repeats the work.",
    ],
  },
  heaps: {
    template: {
      ts: `// Min-heap: the smallest kept item is on top.
const heap = new MinHeap<number>();
for (const x of nums) {
  heap.push(x);
  // Too many: drop the smallest, keep the k largest.
  if (heap.size() > k) heap.pop();
}
// The top is now the kth largest.
return heap.peek();`,
      py: `# heapq is a min-heap: the smallest item is on top.
heap = []
for x in nums:
    heapq.heappush(heap, x)
    # Too many: drop the smallest, keep the k largest.
    if len(heap) > k:
        heapq.heappop(heap)
# The top is now the kth largest.
return heap[0]`,
    },
    pitfalls: [
      "Using a max-heap for “k largest”. A min-heap of size k is cheaper.",
      "Forgetting that Python’s heapq is a min-heap. Negate values for a max-heap.",
      "Sorting everything when you only need the top k.",
    ],
  },
  backtracking: {
    template: {
      ts: `function dfs(path: number[], start: number) {
  if (isDone(path)) {
    // Save a copy: path keeps changing after this.
    results.push([...path]);
    return;
  }
  for (let i = start; i < choices.length; i++) {
    // Choose.
    path.push(choices[i]);
    // Explore everything from here.
    dfs(path, i + 1);
    // Undo, so the next choice starts clean.
    path.pop();
  }
}`,
      py: `def dfs(path, start):
    if is_done(path):
        # Save a copy: path keeps changing after this.
        results.append(path[:])
        return
    for i in range(start, len(choices)):
        # Choose.
        path.append(choices[i])
        # Explore everything from here.
        dfs(path, i + 1)
        # Undo, so the next choice starts clean.
        path.pop()`,
    },
    pitfalls: [
      "Saving path itself instead of a copy.",
      "Forgetting the undo step after the recursive call.",
      "Not pruning, so dead branches run all the way down.",
    ],
  },
  graphs: {
    template: {
      ts: `// Mark on push, so no node is queued twice.
const seen = new Set([start]);
const queue = [start];
while (queue.length) {
  // Oldest first: the closest nodes go first.
  const node = queue.shift()!;
  for (const next of neighbours(node)) {
    if (seen.has(next)) continue;
    seen.add(next);
    queue.push(next);
  }
}`,
      py: `# Mark on push, so no node is queued twice.
seen = {start}
queue = deque([start])
while queue:
    # Oldest first: the closest nodes go first.
    node = queue.popleft()
    for nxt in neighbours(node):
        if nxt in seen:
            continue
        seen.add(nxt)
        queue.append(nxt)`,
    },
    pitfalls: [
      "Marking a node when you pop it instead of when you push it, so it’s queued twice.",
      "Forgetting the graph may have more than one connected piece.",
      "Using BFS or DFS on weighted edges when you need the shortest path.",
    ],
  },
  "1-d-dp": {
    template: {
      ts: `// dp[i] is the answer for the first i items.
const dp = new Array(n + 1).fill(0);
// The smallest case, known without any work.
dp[0] = base;
for (let i = 1; i <= n; i++) {
  // Build from answers you already have.
  dp[i] = best(dp[i - 1], fromEarlier(dp, i));
}
return dp[n];`,
      py: `# dp[i] is the answer for the first i items.
dp = [0] * (n + 1)
# The smallest case, known without any work.
dp[0] = base
for i in range(1, n + 1):
    # Build from answers you already have.
    dp[i] = best(dp[i - 1], from_earlier(dp, i))
return dp[n]`,
    },
    pitfalls: [
      "Not saying out loud what dp[i] means before coding.",
      "Getting the base case wrong, which poisons every later cell.",
      "Filling the table in an order where a cell’s inputs aren’t ready yet.",
    ],
  },
  "2-d-dp": {
    template: {
      ts: `// dp[i][j]: answer for first i and first j items.
const dp = Array.from({ length: m + 1 }, () =>
  new Array(n + 1).fill(0));
// Row 0 and column 0 stay as the empty cases.
for (let i = 1; i <= m; i++) {
  for (let j = 1; j <= n; j++) {
    // Each cell reads above, left and diagonal.
    dp[i][j] = combine(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
  }
}
return dp[m][n];`,
      py: `# dp[i][j]: answer for first i and first j items.
dp = [[0] * (n + 1) for _ in range(m + 1)]
# Row 0 and column 0 stay as the empty cases.
for i in range(1, m + 1):
    for j in range(1, n + 1):
        # Each cell reads above, left and diagonal.
        dp[i][j] = combine(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1])
return dp[m][n]`,
    },
    pitfalls: [
      "Off-by-one errors between string indices and table indices.",
      "Sharing one row across the table with [[0] * n] * m in Python.",
      "Keeping the whole table when two rows would do.",
    ],
  },
  greedy: {
    template: {
      ts: `// One running value sums up every choice so far.
let state = start;
for (const x of items) {
  // Check you can still go on before choosing.
  if (isStuck(state, x)) return fail;
  // Take the best move now and never look back.
  state = bestChoice(state, x);
}
return state;`,
      py: `# One running value sums up every choice so far.
state = start
for x in items:
    # Check you can still go on before choosing.
    if is_stuck(state, x):
        return fail
    # Take the best move now and never look back.
    state = best_choice(state, x)
return state`,
    },
    pitfalls: [
      "Trusting a greedy idea without a reason it can’t be beaten.",
      "Skipping the sort that makes the local choice safe.",
      "Tracking the whole route when one running number would do.",
    ],
  },
  intervals: {
    template: {
      ts: `// Sort by start, so overlaps end up side by side.
intervals.sort((a, b) => a[0] - b[0]);
const out = [intervals[0]];
for (const [start, end] of intervals.slice(1)) {
  const last = out[out.length - 1];
  // Overlap: extend the last one to the later end.
  if (start <= last[1]) last[1] = Math.max(last[1], end);
  // No overlap: this one starts a new interval.
  else out.push([start, end]);
}`,
      py: `# Sort by start, so overlaps end up side by side.
intervals.sort(key=lambda x: x[0])
out = [intervals[0]]
for start, end in intervals[1:]:
    # Overlap: extend the last one to the later end.
    if start <= out[-1][1]:
        out[-1][1] = max(out[-1][1], end)
    else:
        # No overlap: this one starts a new interval.
        out.append([start, end])`,
    },
    pitfalls: [
      "Forgetting to sort first.",
      "Replacing the end with the new end. Take the max, since one may contain the other.",
      "Deciding whether touching ends count as overlap. Read the problem.",
    ],
  },
  "advanced-graphs": {
    template: {
      ts: `// Dijkstra: the heap hands back the closest node first.
const best = new Array(n).fill(Infinity);
best[start] = 0;
const heap = new MinHeap([[0, start]]);
while (heap.size > 0) {
  const [time, node] = heap.pop();
  // Old entry: a faster way here was already found.
  if (time > best[node]) continue;
  for (const [next, cost] of roads[node]) {
    // A cheaper way to next? Save it and queue it.
    if (time + cost < best[next]) {
      best[next] = time + cost;
      heap.push([best[next], next]);
    }
  }
}

// Union-Find: each node points toward its group's leader.
const parent = Array.from({ length: n }, (_, i) => i);
const find = (x: number): number => {
  // Point straight at the leader, so the next find is quick.
  if (parent[x] !== x) parent[x] = find(parent[x]);
  return parent[x];
};
// Join two groups by linking one leader to the other.
const union = (a: number, b: number) => {
  parent[find(b)] = find(a);
};`,
      py: `# Dijkstra: the heap hands back the closest node first.
best = [inf] * n
best[start] = 0
heap = [(0, start)]
while heap:
    time, node = heappop(heap)
    # Old entry: a faster way here was already found.
    if time > best[node]:
        continue
    for nxt, cost in roads[node]:
        # A cheaper way to nxt? Save it and queue it.
        if time + cost < best[nxt]:
            best[nxt] = time + cost
            heappush(heap, (best[nxt], nxt))

# Union-Find: each node points toward its group's leader.
parent = list(range(n))
def find(x: int) -> int:
    # Point straight at the leader, so the next find is quick.
    if parent[x] != x:
        parent[x] = find(parent[x])
    return parent[x]
# Join two groups by linking one leader to the other.
def union(a: int, b: int) -> None:
    parent[find(b)] = find(a)`,
    },
    pitfalls: [
      "Using Dijkstra with negative costs. It assumes a finished node can't get cheaper.",
      "Skipping the old-entry check, which redoes work on finished nodes.",
      "Reading parent[x] directly. That may not be the leader, so call find(x).",
      "Dropping the shortcut in find, which lets long chains slow every lookup.",
    ],
  },
  "math-and-geometry": {
    template: {
      ts: `// Four walls mark what's left to read.
let top = 0, bottom = grid.length - 1;
let left = 0, right = grid[0].length - 1;
while (top <= bottom && left <= right) {
  // Walk one side, then pull that wall in.
  for (let c = left; c <= right; c++) out.push(grid[top][c]);
  top++;
  for (let r = top; r <= bottom; r++) out.push(grid[r][right]);
  right--;
  // Recheck: a single row or column has no way back.
  if (top <= bottom) {
    for (let c = right; c >= left; c--) out.push(grid[bottom][c]);
    bottom--;
  }
  if (left <= right) {
    for (let r = bottom; r >= top; r--) out.push(grid[r][left]);
    left++;
  }
}

// Rotate 90° clockwise: flip across the diagonal, then mirror each row.
for (let r = 0; r < n; r++) {
  for (let c = r + 1; c < n; c++) {
    [grid[r][c], grid[c][r]] = [grid[c][r], grid[r][c]];
  }
}
for (const row of grid) row.reverse();`,
      py: `# Four walls mark what's left to read.
top, bottom = 0, len(grid) - 1
left, right = 0, len(grid[0]) - 1
while top <= bottom and left <= right:
    # Walk one side, then pull that wall in.
    for c in range(left, right + 1):
        out.append(grid[top][c])
    top += 1
    for r in range(top, bottom + 1):
        out.append(grid[r][right])
    right -= 1
    # Recheck: a single row or column has no way back.
    if top <= bottom:
        for c in range(right, left - 1, -1):
            out.append(grid[bottom][c])
        bottom -= 1
    if left <= right:
        for r in range(bottom, top - 1, -1):
            out.append(grid[r][left])
        left += 1

# Rotate 90° clockwise: flip across the diagonal, then mirror each row.
for r in range(n):
    for c in range(r + 1, n):
        grid[r][c], grid[c][r] = grid[c][r], grid[r][c]
for row in grid:
    row.reverse()`,
    },
    pitfalls: [
      "Dropping the recheck, so a single row or column gets read twice.",
      "Mixing up rows and columns on a grid that isn't square.",
      "Overwriting a cell you still need. Change the order, or save it first.",
    ],
  },
  "bit-manipulation": {
    template: {
      ts: `// n & (n - 1) clears the lowest 1 bit.
let count = 0;
while (n !== 0) {
  n &= n - 1;
  count++;
}

// x ^ x is 0, so every pair cancels and the lone value stays.
let lone = 0;
for (const num of nums) lone ^= num;

// Read bit i, set it, or clear it.
const bit = (n >> i) & 1;
n |= 1 << i;
n &= ~(1 << i);`,
      py: `# n & (n - 1) clears the lowest 1 bit.
count = 0
while n != 0:
    n &= n - 1
    count += 1

# x ^ x is 0, so every pair cancels and the lone value stays.
lone = 0
for num in nums:
    lone ^= num

# Read bit i, set it, or clear it.
bit = (n >> i) & 1
n |= 1 << i
n &= ~(1 << i)`,
    },
    pitfalls: [
      "Using >> on a negative number in JavaScript. Use >>> to shift in zeros.",
      "Forgetting Python ints never overflow. Mask with 0xFFFFFFFF to act like 32 bits.",
      "Leaving out brackets. === runs before & in JavaScript, so write (n & 1) === 1.",
    ],
  },
};
