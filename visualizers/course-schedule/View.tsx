import type { Step } from "../types";
import { Arrow, Chip, Chips, Node, Panel, Split, Stats, Svg, ViewRoot, type CellState, type Point } from "../kit";
import type { CourseInput, CourseState } from "./types";
import styles from "./View.module.css";

type CourseViewProps = { step: Step<CourseState>; input: CourseInput };

const SIZE = 300;
const RADIUS = 110;

/** Courses sit on a circle, so an arrow between two of them never crosses a third. */
function place(index: number, n: number): Point {
  const angle = (index / n) * 2 * Math.PI - Math.PI / 2;
  const round = (value: number) => Math.round(value * 100) / 100;
  return { x: round(SIZE / 2 + RADIUS * Math.cos(angle)), y: round(SIZE / 2 + RADIUS * Math.sin(angle)) };
}

/** The courses and their links, with a waiting count on each and arrows crossed off as courses are taken. */
export function CourseScheduleView({ step }: CourseViewProps) {
  const { n, edges, needs, ready, taken, current, crossing, crossed, canFinish, phase } = step.state;
  const crossedSet = new Set(crossed);
  const counted = phase !== "setup";

  const stateOf = (course: number): CellState => {
    if (course === current) return "current";
    if (taken.includes(course)) return "done";
    if (ready.includes(course)) return "range";
    if (phase === "done") return "past";
    return "waiting";
  };

  return (
    <ViewRoot>
      <Split>
        <div className={styles.graphWrap}>
          <Svg width={SIZE} height={SIZE}>
            {edges.map(([before, after], index) => (
              <Arrow
                key={index}
                from={place(before, n)}
                to={place(after, n)}
                tone={index === crossing ? "path" : crossedSet.has(index) ? "past" : "plain"}
              />
            ))}
            {Array.from({ length: n }, (_, course) => (
              <Node
                key={course}
                at={place(course, n)}
                label={course}
                state={stateOf(course)}
                badge={counted ? String(needs[course]) : undefined}
              />
            ))}
          </Svg>
        </div>
        <div className={styles.side}>
          <Panel title="ready">
            <Chips empty="none">
              {ready.map((course) => (
                <Chip key={course} state="range">
                  {course}
                </Chip>
              ))}
            </Chips>
          </Panel>
          <Panel title="taken, in order">
            <Chips empty="none yet">
              {taken.map((course) => (
                <Chip key={course} state="found">
                  {course}
                </Chip>
              ))}
            </Chips>
          </Panel>
        </div>
      </Split>
      <Stats
        items={[
          { label: "taken", value: `${taken.length} of ${n}` },
          { label: "ready", value: ready.length },
          { label: "can finish?", value: canFinish === null ? "—" : canFinish ? "yes" : "no", answer: true },
        ]}
      />
    </ViewRoot>
  );
}
