import type {ComponentType} from 'react';
import content from '@/content/patterns.json';

export type Pattern = (typeof content)[number];

/** `*word*` is highlighted. Four lines, one per transcript beat (0s, 15s, 32s, 48s). */
type Config = {
  headlines: [string, string, string, string];
};

export const CONFIG: Record<string, Config> = {
  'arrays-and-hashing': {
    headlines: ['Which two numbers make *9*?', 'Keep a *map* of what you’ve seen.', 'Ask the map for the *partner*.', 'One pass. *O(n)*.'],
  },
  'two-pointers': {
    headlines: ['Which pair holds the *most water*?', 'Start with the *widest* pair.', 'Move the *shorter* wall inward.', 'One pass. *O(n)*.'],
  },
  stack: {
    headlines: ['Does every closer meet its *opener*?', '*Stack* each opener.', 'A closer checks the *top* only.', 'Empty stack. *Valid*.'],
  },
  'binary-search': {
    headlines: ['Find the *smallest* number.', 'Compare *mid* with the right end.', 'Throw away *half*.', 'Halve again. *O(log n)*.'],
  },
  'linked-list': {
    headlines: ['Reverse it. *Keep the nodes*.', 'Two pointers: *prev* and *curr*.', 'Save *next*, then flip the arrow.', 'One pass. *No new nodes*.'],
  },
  trees: {
    headlines: ['How *deep* is the tree?', 'Ask each child *how deep*.', 'Take the *deeper* side, add one.', 'Each node once. *O(n)*.'],
  },
  tries: {
    headlines: ['Words share *beginnings*.', 'Store each prefix *once*.', 'Walk *letter by letter*.', 'One hop per letter. *O(L)*.'],
  },
  heaps: {
    headlines: ['The *median*, after every number.', 'Split into *two halves*.', 'Rebalance with one *move*.', 'Push and pop. *O(log n)*.'],
  },
  backtracking: {
    headlines: ['Which sets add up to *7*?', 'Try one, carry what’s *left*.', 'Too big? *Cut the branch*.', 'Every cut prunes a *subtree*.'],
  },
  graphs: {
    headlines: ['Count the *islands*.', 'Scan for *unclaimed* land.', '*Flood* the whole island.', 'Each cell once. *O(m·n)*.'],
  },
  '1-d-dp': {
    headlines: ['The best haul, no *neighbours*.', 'Build *up* from the first houses.', '*Skip* or *take*?', 'One pass. *O(n)*.'],
  },
  '2-d-dp': {
    headlines: ['The longest *common subsequence*.', 'Fill a *table* of prefixes.', 'A match? Diagonal *plus one*.', 'The corner holds the *answer*.'],
  },
  greedy: {
    headlines: ['Can you reach the *end*?', 'Track the *farthest* reach.', 'Inside the reach is *free*.', 'One scan. *O(n)*.'],
  },
  intervals: {
    headlines: ['Which *busy blocks* do they form?', '*Sort* by start.', 'Overlap? *Stretch*. Gap? *New block*.', 'Sort and walk. *O(n log n)*.'],
  },
  'advanced-graphs': {
    headlines: ['How long until *everyone* hears?', 'Always take the *closest* node.', 'A cheaper road? *Update* the time.', 'Each road once. *O(E log V)*.'],
  },
};

export const PATTERNS: Pattern[] = content as Pattern[];
export type { ComponentType };
