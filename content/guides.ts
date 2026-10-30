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
      ts: `const seen = new Map<number, number>();
for (let i = 0; i < nums.length; i++) {
  const key = wanted(nums[i]);
  if (seen.has(key)) return [seen.get(key)!, i];
  seen.set(nums[i], i);
}`,
      py: `seen = {}
for i, x in enumerate(nums):
    key = wanted(x)
    if key in seen:
        return [seen[key], i]
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
      ts: `let l = 0, r = nums.length - 1;
while (l < r) {
  if (isAnswer(l, r)) return [l, r];
  if (needBigger(l, r)) l++;
  else r--;
}`,
      py: `l, r = 0, len(nums) - 1
while l < r:
    if is_answer(l, r):
        return [l, r]
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
  add(s[right]);
  while (!valid()) remove(s[left++]);
  best = Math.max(best, right - left + 1);
}`,
      py: `left = best = 0
for right, ch in enumerate(s):
    add(ch)
    while not valid():
        remove(s[left])
        left += 1
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
      ts: `const stack: number[] = [];
for (const x of items) {
  while (stack.length && shouldPop(stack.at(-1)!, x)) {
    resolve(stack.pop()!, x);
  }
  stack.push(x);
}`,
      py: `stack = []
for x in items:
    while stack and should_pop(stack[-1], x):
        resolve(stack.pop(), x)
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
while (lo < hi) {
  const mid = Math.floor((lo + hi) / 2);
  if (answerIsRightOf(mid)) lo = mid + 1;
  else hi = mid;
}
return lo;`,
      py: `lo, hi = 0, len(nums) - 1
while lo < hi:
    mid = (lo + hi) // 2
    if answer_is_right_of(mid):
        lo = mid + 1
    else:
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
      ts: `const dummy = new ListNode(0, head);
let prev = dummy, curr = head;
while (curr) {
  const next = curr.next;
  rewire(prev, curr);
  prev = curr;
  curr = next;
}
return dummy.next;`,
      py: `dummy = ListNode(0, head)
prev, curr = dummy, head
while curr:
    nxt = curr.next
    rewire(prev, curr)
    prev, curr = curr, nxt
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
  if (!node) return 0;
  const left = dfs(node.left);
  const right = dfs(node.right);
  return combine(node, left, right);
}`,
      py: `def dfs(node):
    if not node:
        return 0
    left = dfs(node.left)
    right = dfs(node.right)
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
  if (!node.children.has(ch)) {
    node.children.set(ch, new TrieNode());
  }
  node = node.children.get(ch)!;
}
node.isWord = true;`,
      py: `node = root
for ch in word:
    if ch not in node.children:
        node.children[ch] = TrieNode()
    node = node.children[ch]
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
      ts: `const heap = new MinHeap<number>();
for (const x of nums) {
  heap.push(x);
  if (heap.size() > k) heap.pop();
}
return heap.peek();`,
      py: `heap = []
for x in nums:
    heapq.heappush(heap, x)
    if len(heap) > k:
        heapq.heappop(heap)
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
    results.push([...path]);
    return;
  }
  for (let i = start; i < choices.length; i++) {
    path.push(choices[i]);
    dfs(path, i + 1);
    path.pop();
  }
}`,
      py: `def dfs(path, start):
    if is_done(path):
        results.append(path[:])
        return
    for i in range(start, len(choices)):
        path.append(choices[i])
        dfs(path, i + 1)
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
      ts: `const seen = new Set([start]);
const queue = [start];
while (queue.length) {
  const node = queue.shift()!;
  for (const next of neighbours(node)) {
    if (seen.has(next)) continue;
    seen.add(next);
    queue.push(next);
  }
}`,
      py: `seen = {start}
queue = deque([start])
while queue:
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
      ts: `const dp = new Array(n + 1).fill(0);
dp[0] = base;
for (let i = 1; i <= n; i++) {
  dp[i] = best(dp[i - 1], fromEarlier(dp, i));
}
return dp[n];`,
      py: `dp = [0] * (n + 1)
dp[0] = base
for i in range(1, n + 1):
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
      ts: `const dp = Array.from({ length: m + 1 }, () =>
  new Array(n + 1).fill(0));
for (let i = 1; i <= m; i++) {
  for (let j = 1; j <= n; j++) {
    dp[i][j] = combine(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
  }
}
return dp[m][n];`,
      py: `dp = [[0] * (n + 1) for _ in range(m + 1)]
for i in range(1, m + 1):
    for j in range(1, n + 1):
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
      ts: `let state = start;
for (const x of items) {
  if (isStuck(state, x)) return fail;
  state = bestChoice(state, x);
}
return state;`,
      py: `state = start
for x in items:
    if is_stuck(state, x):
        return fail
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
      ts: `intervals.sort((a, b) => a[0] - b[0]);
const out = [intervals[0]];
for (const [start, end] of intervals.slice(1)) {
  const last = out[out.length - 1];
  if (start <= last[1]) last[1] = Math.max(last[1], end);
  else out.push([start, end]);
}`,
      py: `intervals.sort(key=lambda x: x[0])
out = [intervals[0]]
for start, end in intervals[1:]:
    if start <= out[-1][1]:
        out[-1][1] = max(out[-1][1], end)
    else:
        out.append([start, end])`,
    },
    pitfalls: [
      "Forgetting to sort first.",
      "Replacing the end with the new end. Take the max, since one may contain the other.",
      "Deciding whether touching ends count as overlap. Read the problem.",
    ],
  },
};
