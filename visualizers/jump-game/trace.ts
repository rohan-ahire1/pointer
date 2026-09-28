import type { Step } from "../types";
import type { JumpInput, JumpState } from "./types";

/**
 * Traced Jump Game (docs/patterns/14-greedy.md): never plan the route, just
 * track the farthest stone you could reach. Each stone either stretches the
 * reach or leaves it alone; a stone past the reach ends the run. Pure and
 * deterministic.
 */
export function trace(input: JumpInput): Step<JumpState>[] {
  const nums = [...input];
  const last = nums.length - 1;
  const out: Step<JumpState>[] = [];
  const push = (
    i: number | null,
    reach: number,
    prevReach: number,
    phase: JumpState["phase"],
    stuckAt: number | null,
    verdict: boolean | null,
    lines: number[],
    note: string,
    sr: string,
  ) => {
    out.push({
      state: { nums: [...nums], i, reach, prevReach, phase, stuckAt, verdict },
      lines,
      note,
      sr,
    });
  };

  const reachSr = (reach: number): string =>
    reach <= last
      ? `Farthest reachable stone ${reach} of ${last}.`
      : `Farthest reach ${reach}, past the end at stone ${last}.`;

  const plural = nums.length === 1 ? "stone" : "stones";
  push(
    null,
    0,
    0,
    "setup",
    null,
    null,
    [1],
    "You stand on stone 0. So far you can reach stone 0.",
    `${nums.length} ${plural}, jumps ${nums.join(", ")}. Standing on stone 0. Farthest reachable stone 0.`,
  );

  let reach = 0;
  for (let i = 0; i < nums.length; i++) {
    if (i > reach) {
      push(
        i,
        reach,
        reach,
        "stuck",
        i,
        null,
        [2, 3],
        `Stone ${i} is past your farthest reach, ${reach}. You’re stuck.`,
        `At stone ${i}. ${reachSr(reach)} Stuck.`,
      );
      const doneNote = `Done. You can’t get past stone ${reach}.`;
      push(i, reach, reach, "done", i, false, [3], doneNote, `${doneNote} ${reachSr(reach)}`);
      return out;
    }
    const prevReach = reach;
    const landing = i + nums[i];
    reach = Math.max(reach, landing);
    const atSr = `At stone ${i}, jump ${nums[i]}. ${reachSr(reach)} ${
      reach >= last ? "Can reach the end." : "End not yet reachable."
    }`;
    if (reach > prevReach) {
      const note =
        landing > last
          ? `Stone ${i} lets you jump ${nums[i]}, past the end. New farthest: ${reach}.`
          : `Stone ${i} lets you jump ${nums[i]}, as far as stone ${landing}. New farthest: ${reach}.`;
      push(i, reach, prevReach, "extend", null, null, [2, 3, 4], note, atSr);
    } else {
      push(
        i,
        reach,
        prevReach,
        "noGain",
        null,
        null,
        [2, 3, 4],
        `Stone ${i} lets you jump ${nums[i]}. Farthest stays ${reach}.`,
        atSr,
      );
    }
  }

  const doneNote = "Done. Every stone was within reach, so you can get to the end.";
  push(null, reach, reach, "done", null, true, [6], doneNote, `${doneNote} ${reachSr(reach)}`);
  return out;
}
