/** Shared narration formatting, matching Sliding Window's ‘a’ / “abc” style. */

/** A character in curly single quotes: ‘a’. */
export const q = (c: string | number): string => `‘${c}’`;

/** A string in curly double quotes: “abc”. */
export const qq = (s: string): string => `“${s}”`;

/** A list the way the narration writes it: [1, 2, 3]. */
export const list = (xs: readonly (number | string)[]): string => `[${xs.join(", ")}]`;
