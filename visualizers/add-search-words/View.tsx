import type { Step } from "../types";
import { Edge, Node, Stats, Svg, tidyLayout, ViewRoot } from "../kit";
import type { CellState } from "../kit";
import type { AddSearchInput, AddSearchState } from "./types";
import styles from "./View.module.css";

type ViewProps = { step: Step<AddSearchState>; input: AddSearchInput };

const SLOT = 46;
const NODE = 36;
const LEVEL = 58;
const TOP = NODE / 2 + 6;

/**
 * The finished trie's size, from the input alone, so the picture keeps one
 * size for the whole run: its leaves are the distinct words that aren't a
 * prefix of another word, and its depth is the longest word or pattern
 * (a missing letter hangs a ghost node one level below its parent).
 */
function finalSize(input: AddSearchInput) {
  const words = [...new Set(input.words)];
  const leaves = words.filter((word) => !words.some((other) => other !== word && other.startsWith(word))).length;
  const levels = 1 + Math.max(input.pattern.length, ...words.map((word) => word.length));
  return { width: Math.max(4, leaves) * SLOT, height: TOP + (levels - 1) * LEVEL + NODE / 2 + 8 };
}

/**
 * The words and the pattern on top with the current letter lit, and the trie
 * underneath. Word ends carry a double ring and a ★; the path from the root to
 * the cursor is orange; nodes the search has given up on are dashed with a ✕.
 */
export function AddSearchWordsView({ step, input }: ViewProps) {
  const { words, pattern, nodes, cursor, phase, wordIndex, charIndex, created, missing, dead, result } = step.state;
  const searching = wordIndex === null && phase !== "setup";

  const { positions, slots } = tidyLayout(nodes, SLOT, TOP, LEVEL);
  const cursorAt = cursor !== null ? positions.get(cursor) : undefined;
  const ghostAt = missing !== null && cursorAt ? { x: cursorAt.x, y: cursorAt.y + LEVEL } : null;
  const size = finalSize(input);
  const width = Math.max(size.width, slots * SLOT);
  const height = size.height;

  const deadSet = new Set(dead);
  const onPath = new Set<number>();
  const parentOf = new Map(nodes.map((node) => [node.id, node.parent]));
  for (let at = cursor; at !== null && at !== undefined; at = parentOf.get(at) ?? null) onPath.add(at);

  const stateOf = (id: number): CellState => {
    if (id === cursor && phase === "found") return "found";
    if (id === cursor && phase !== "done" && phase !== "setup") return "current";
    if (deadSet.has(id)) return "past";
    if (onPath.has(id) && phase !== "done") return "range";
    return "waiting";
  };

  const chip = (word: string, key: string, active: boolean, done: boolean, isPattern = false) => (
    <span key={key} className={styles.word} data-active={active} data-done={done} data-query={isPattern}>
      {word.split("").map((ch, idx) => (
        <span key={idx} className={styles.letter} data-current={active && idx === charIndex}>
          {ch}
        </span>
      ))}
      {done && <span className={styles.tick}>✓</span>}
    </span>
  );

  return (
    <ViewRoot>
      <div className={styles.words}>
        {words.map((word, idx) =>
          chip(word, `w${idx}`, wordIndex === idx, searching || (wordIndex !== null && idx < wordIndex)),
        )}
        <span className={styles.bar}>|</span>
        {chip(pattern, "pattern", searching && phase !== "done" && phase !== "start", false, true)}
      </div>
      <div className={styles.treeWrap}>
        <Svg width={width} height={height}>
          {nodes
            .filter((node) => node.parent !== null)
            .map((node) => (
              <Edge
                key={`e${node.id}`}
                from={positions.get(node.parent!)!}
                to={positions.get(node.id)!}
                tone={deadSet.has(node.id) ? "past" : onPath.has(node.id) && phase !== "done" ? "path" : "plain"}
                inset={NODE / 2}
              />
            ))}
          {ghostAt && cursorAt && <Edge key="ghost-edge" from={cursorAt} to={ghostAt} tone="past" inset={NODE / 2} />}
          {nodes.map((node) => (
            <Node
              key={node.id}
              at={positions.get(node.id)!}
              label={node.parent === null ? "·" : node.ch}
              state={node.id === created ? "current" : stateOf(node.id)}
              size={node.parent === null ? 26 : NODE}
              ring={node.isWord}
              badge={deadSet.has(node.id) ? "✕" : node.isWord ? "★" : undefined}
            />
          ))}
          {ghostAt && (
            <Node key={`ghost-${missing}`} at={ghostAt} label={missing ?? "?"} state="past" size={NODE} badge="✕" />
          )}
        </Svg>
      </div>
      <Stats
        items={[
          {
            label: searching ? "searching" : "adding",
            value: searching ? pattern : wordIndex !== null ? words[wordIndex] : "—",
          },
          { label: "nodes", value: nodes.length - 1 },
          { label: "dead ends", value: dead.length },
          { label: "found", value: result === null ? "…" : String(result), answer: true },
        ]}
      />
    </ViewRoot>
  );
}
