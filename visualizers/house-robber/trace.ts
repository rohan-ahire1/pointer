import type { Step } from "../types";
import type { RobberInput, RobberState } from "./types";

/**
 * Traced House Robber (docs/patterns/12-1-d-dp.md): dp[i] is the most you
 * can take from the first i houses, and each cell only needs the two before
 * it — skip this house and keep dp[i-1], or take it plus dp[i-2]. At the end
 * the plan is rebuilt by walking dp back from the end. Pure and deterministic.
 */
export function trace(input: RobberInput): Step<RobberState>[] {
  const nums = [...input];
  const out: Step<RobberState>[] = [];
  // dp[0] is filled from the start; the rest fill one cell per decide step.
  const dp: (number | null)[] = [0, ...new Array<number | null>(nums.length).fill(null)];
  const push = (
    i: number | null,
    skip: number | null,
    take: number | null,
    choice: RobberState["choice"],
    phase: RobberState["phase"],
    robbed: number[] | null,
    lines: number[],
    note: string,
    sr: string,
  ) => {
    out.push({
      state: {
        nums: [...nums],
        dp: [...dp],
        i,
        skip,
        take,
        choice,
        phase,
        robbed: robbed === null ? null : [...robbed],
      },
      lines,
      note,
      sr,
    });
  };

  const filledSr = (): string =>
    `dp so far: ${dp
      .filter((v): v is number => v !== null)
      .join(", ")}.`;

  push(
    null,
    null,
    null,
    null,
    "setup",
    null,
    [1],
    "dp[i] is the most you can take from the first i houses. With none, it’s 0.",
    `${nums.length} ${nums.length === 1 ? "house" : "houses"}. dp[0] = 0. The rest of the row is empty.`,
  );

  dp[1] = nums[0];
  push(
    1,
    null,
    null,
    null,
    "base",
    null,
    [2],
    `With one house, take it: dp[1] = ${nums[0]}.`,
    `House 0, amount ${nums[0]}. dp[1] = ${nums[0]}. ${filledSr()}`,
  );

  for (let i = 2; i <= nums.length; i++) {
    const skip = dp[i - 1] as number;
    const take = (dp[i - 2] as number) + nums[i - 1];
    push(
      i,
      skip,
      take,
      null,
      "compare",
      null,
      [3, 4, 5],
      `House ${i - 1} has ${nums[i - 1]}. Skip it: keep ${skip}. Take it: ${dp[i - 2]} + ${nums[i - 1]} = ${take}.`,
      `House ${i - 1}, amount ${nums[i - 1]}. Skip gives ${skip}, take gives ${take}. ${filledSr()}`,
    );
    const choice: RobberState["choice"] = take > skip ? "take" : "skip";
    dp[i] = Math.max(skip, take);
    const verdict =
      take > skip
        ? `Taking wins. dp[${i}] = ${dp[i]}.`
        : skip > take
          ? `Skipping wins. dp[${i}] = ${dp[i]}.`
          : `Both give ${dp[i]}. dp[${i}] = ${dp[i]}.`;
    push(
      i,
      skip,
      take,
      choice,
      "decide",
      null,
      [6],
      verdict,
      `House ${i - 1}. ${verdict} ${filledSr()}`,
    );
  }

  // Rebuild the plan from the end: taking won wherever dp moved up.
  const robbed: number[] = [];
  for (let i = nums.length; i >= 1; ) {
    if (dp[i] !== dp[i - 1]) {
      robbed.unshift(i - 1);
      i -= 2;
    } else {
      i -= 1;
    }
  }
  const listed =
    robbed.length <= 1
      ? robbed.join("")
      : `${robbed.slice(0, -1).join(", ")} and ${robbed[robbed.length - 1]}`;
  const doneNote =
    robbed.length === 0
      ? `Done. The best haul is ${dp[nums.length]}.`
      : `Done. The best haul is ${dp[nums.length]}, from ${robbed.length === 1 ? "house" : "houses"} ${listed}.`;
  push(
    null,
    null,
    null,
    null,
    "done",
    robbed,
    [8],
    doneNote,
    `${doneNote} dp: ${dp.join(", ")}.`,
  );
  return out;
}
