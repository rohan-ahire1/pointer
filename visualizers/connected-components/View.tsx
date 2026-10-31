import type { Step } from "../types";
import { Arrow, Chip, Chips, Node, Panel, Split, Stats, Svg, ViewRoot, type CellState, type Point } from "../kit";
import type { ComponentsInput, ComponentsState } from "./types";
import styles from "./View.module.css";

type ComponentsViewProps = { step: Step<ComponentsState>; input: ComponentsInput };

const SIZE = 300;
const RADIUS = 110;

function place(index: number, n: number): Point {
  const angle = (index / n) * 2 * Math.PI - Math.PI / 2;
  const round = (value: number) => Math.round(value * 100) / 100;
  return { x: round(SIZE / 2 + RADIUS * Math.cos(angle)), y: round(SIZE / 2 + RADIUS * Math.sin(angle)) };
}

function leaderOf(node: number, parent: readonly number[]): number {
  return parent[node] === node ? node : leaderOf(parent[node], parent);
}

/** Each node with an arrow toward its leader. Leaders get a second ring, and the groups are listed in words. */
export function ConnectedComponentsView({ step }: ComponentsViewProps) {
  const { n, links, parent, link, path, leaders, groups, phase } = step.state;
  const members = Array.from({ length: n }, (_, leader) =>
    Array.from({ length: n }, (_, node) => node).filter((node) => leaderOf(node, parent) === leader),
  ).filter((group) => group.length > 0);

  const stateOf = (node: number): CellState => {
    if (leaders?.includes(node)) return "current";
    if (path.includes(node)) return "range";
    if (phase === "done") return "done";
    return "waiting";
  };
  const linkState = (index: number): CellState => {
    if (index === link) return "current";
    if (link === null ? phase === "done" : index < link) return "past";
    return "waiting";
  };

  return (
    <ViewRoot>
      <Split>
        <div className={styles.graphWrap}>
          <Svg width={SIZE} height={SIZE}>
            {parent.map((to, node) =>
              to === node ? null : <Arrow key={node} from={place(node, n)} to={place(to, n)} tone={path.includes(node) ? "path" : "plain"} />,
            )}
            {parent.map((to, node) => (
              <Node key={node} at={place(node, n)} label={node} state={stateOf(node)} ring={to === node} />
            ))}
          </Svg>
        </div>
        <div className={styles.side}>
          <Panel title="links">
            <Chips empty="none">
              {links.map(([a, b], index) => (
                <Chip key={index} state={linkState(index)}>
                  {a}–{b}
                </Chip>
              ))}
            </Chips>
          </Panel>
          <Panel title="groups">
            <Chips>
              {members.map((group) => (
                <Chip key={group[0]} state="found">
                  {group.join(" ")}
                </Chip>
              ))}
            </Chips>
          </Panel>
        </div>
      </Split>
      <Stats
        items={[
          { label: "links read", value: `${link === null ? (phase === "done" ? links.length : 0) : link + 1} of ${links.length}` },
          { label: "leaders", value: parent.filter((to, node) => to === node).length },
          { label: "groups", value: groups, answer: true },
        ]}
      />
    </ViewRoot>
  );
}
