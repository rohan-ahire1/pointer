import { list } from "../kit/format";
import type { Step } from "../types";
import type { CourseInput, CourseState } from "./types";

/**
 * Kahn's algorithm: take any course with nothing left to wait for, cross off
 * what it unblocks, repeat. A cycle shows up as courses that never reach zero.
 */
export function trace({ n, edges }: CourseInput): Step<CourseState>[] {
  const needs = Array.from({ length: n }, () => 0);
  const ready: number[] = [];
  const taken: number[] = [];
  const crossed: number[] = [];
  const steps: Step<CourseState>[] = [];
  const push = (
    current: number | null,
    crossing: number | null,
    canFinish: boolean | null,
    phase: CourseState["phase"],
    lines: number[],
    note: string,
    sr: string,
  ) => {
    steps.push({
      state: { n, edges, needs: [...needs], ready: [...ready], taken: [...taken], current, crossing, crossed: [...crossed], canFinish, phase },
      lines,
      note,
      sr,
    });
  };

  push(null, null, null, "setup", [1, 2], `${n} courses, ${edges.length} ${edges.length === 1 ? "link" : "links"}. Can they all be taken?`, `${n} courses and ${edges.length} links.`);

  for (const [, after] of edges) needs[after]++;
  push(null, null, null, "count", [3, 4, 5], "Count what each course is waiting for. That’s the number on its badge.", `Waiting counts: ${list(needs)}.`);

  needs.forEach((count, course) => {
    if (count === 0) ready.push(course);
  });
  push(
    null,
    null,
    null,
    "ready",
    [7, 8],
    ready.length > 0 ? `Nothing blocks ${list(ready)}, so ${ready.length === 1 ? "it’s" : "they’re"} ready.` : "Every course is waiting on another. Nothing can start.",
    `Ready: ${ready.length > 0 ? list(ready) : "none"}.`,
  );

  while (ready.length > 0) {
    const course = ready.shift() as number;
    taken.push(course);
    push(course, null, null, "take", [10, 11, 12], `Take course ${course}. That’s ${taken.length} of ${n}.`, `Took course ${course}. ${taken.length} of ${n} taken.`);
    edges.forEach(([before, after], index) => {
      if (before !== course) return;
      needs[after]--;
      crossed.push(index);
      const free = needs[after] === 0;
      if (free) ready.push(after);
      push(
        course,
        index,
        null,
        "cross",
        free ? [13, 14, 15] : [13, 14],
        free ? `Course ${after} has nothing left to wait for. It’s ready.` : `Course ${after} still waits for ${needs[after]} more.`,
        `Course ${after} now waits for ${needs[after]}.`,
      );
    });
  }

  const canFinish = taken.length === n;
  const stuck = needs.flatMap((count, course) => (count > 0 ? [course] : []));
  push(
    null,
    null,
    canFinish,
    "done",
    [18],
    canFinish ? `Done. All ${n} courses can be taken: ${list(taken)}.` : `Done. Courses ${list(stuck)} wait on each other, so they never start.`,
    canFinish ? `Done. Order: ${list(taken)}.` : `Done. Stuck in a loop: ${list(stuck)}.`,
  );
  return steps;
}
