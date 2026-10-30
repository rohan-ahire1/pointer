/**
 * "Guess the next line": instead of watching the highlight move, you click
 * where you think it goes. Trying to recall the answer before seeing it sticks
 * far better than rereading it (Roediger & Karpicke, 2006). Pure so the rules
 * can be tested away from the player.
 */
export type Guessing = {
  /** Guesses settled so far. */
  asked: number;
  /** Of those, how many were right the first time. */
  firstTry: number;
  /** Wrong tries on the current guess. */
  misses: number;
  last: "right" | "wrong" | "revealed" | null;
  /** The line last picked wrongly, marked with a cross. */
  wrongLine: number | null;
};

export const START_GUESSING: Guessing = { asked: 0, firstTry: 0, misses: 0, last: null, wrongLine: null };

/** Two wrong tries, then the player shows the answer and moves on. */
const MAX_MISSES = 2;

/**
 * The next step worth guessing: the first one whose highlighted lines differ
 * from this one. Steps that stay on the same line would only ask you to click
 * what's already lit. Returns -1 at the end of the run.
 */
export function nextGuessStep(stepLines: readonly (readonly number[])[], index: number): number {
  const here = stepLines[index];
  if (!here) return -1;
  const same = (a: readonly number[], b: readonly number[]) => a.length === b.length && a.every((n, i) => n === b[i]);
  for (let k = index + 1; k < stepLines.length; k++) {
    if (stepLines[k].length > 0 && !same(stepLines[k], here)) return k;
  }
  return -1;
}

/** Applies one click. `advance` means the player should move on to the target step. */
export function applyGuess(state: Guessing, line: number, target: readonly number[]): { state: Guessing; advance: boolean } {
  if (target.includes(line)) {
    return {
      state: {
        asked: state.asked + 1,
        firstTry: state.firstTry + (state.misses === 0 ? 1 : 0),
        misses: 0,
        last: "right",
        wrongLine: null,
      },
      advance: true,
    };
  }
  const misses = state.misses + 1;
  if (misses >= MAX_MISSES) {
    return {
      state: { ...state, asked: state.asked + 1, misses: 0, last: "revealed", wrongLine: null },
      advance: true,
    };
  }
  return { state: { ...state, misses, last: "wrong", wrongLine: line }, advance: false };
}
