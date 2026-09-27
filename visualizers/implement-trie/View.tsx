import type { Step } from "../types";
import { Edge, Node, Stats, Svg, tidyLayout, ViewRoot } from "../kit";
import type { CellState } from "../kit";
import type { TrieInput, TrieState } from "./types";
import styles from "./View.module.css";

type TrieViewProps = { step: Step<TrieState>; input: TrieInput };

const SLOT = 46;
const NODE = 36;
const LEVEL = 58;
const TOP = NODE / 2 + 6;

/**
 * docs/patterns/08-tries.md: the words on top with the current letter lit,
 * and the trie growing underneath. Word ends carry a double ring and a ★;
 * the path from the root to the cursor is drawn in orange.
 */
/**
 * The finished trie's size, from the input alone, so the picture keeps one
 * size for the whole run: its leaves are the distinct words that aren't a
 * prefix of another word, and its depth is the longest word (+1 for a
 * failed lookup's ghost node under the query's last letter).
 */
function finalSize(input: TrieInput) {
  const words = [...new Set(input.words)];
  const leaves = words.filter((word) => !words.some((other) => other !== word && other.startsWith(word))).length;
  const levels = 1 + Math.max(input.query.length, ...words.map((word) => word.length));
  return { width: Math.max(4, leaves) * SLOT, height: TOP + (levels - 1) * LEVEL + NODE / 2 + 8 };
}

export function ImplementTrieView({ step, input }: TrieViewProps) {
  const { words, query, nodes, cursor, phase, wordIndex, charIndex, created, missing, result } = step.state;
  const searching = wordIndex === null && phase !== "setup";

  const { positions, slots } = tidyLayout(nodes, SLOT, TOP, LEVEL);
  // A failed lookup hangs a ghost node under the cursor, one level down.
  const cursorAt = cursor !== null ? positions.get(cursor) : undefined;
  const ghostAt = phase === "fail" && cursorAt ? { x: cursorAt.x, y: cursorAt.y + LEVEL } : null;
  const size = finalSize(input);
  const width = Math.max(size.width, slots * SLOT);
  const height = size.height;

  const onPath = new Set<number>();
  const parentOf = new Map(nodes.map((node) => [node.id, node.parent]));
  for (let at = cursor; at !== null && at !== undefined; at = parentOf.get(at) ?? null) onPath.add(at);

  const stateOf = (id: number): CellState => {
    if (id === cursor && phase !== "done" && phase !== "setup") return "current";
    if (onPath.has(id) && phase !== "done") return "range";
    return "waiting";
  };

  const wordChip = (word: string, key: string, active: boolean, done: boolean, isQuery = false) => (
    <span key={key} className={styles.word} data-active={active} data-done={done} data-query={isQuery}>
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
          wordChip(word, `w${idx}`, wordIndex === idx, searching || (wordIndex !== null && idx < wordIndex)),
        )}
        <span className={styles.bar}>|</span>
        {wordChip(query, "query", searching && phase !== "done", false, true)}
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
                tone={onPath.has(node.id) && phase !== "done" ? "path" : "plain"}
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
              badge={node.isWord ? "★" : undefined}
            />
          ))}
          {ghostAt && <Node key={`ghost-${missing}`} at={ghostAt} label={missing ?? "?"} state="past" size={NODE} badge="✕" />}
        </Svg>
      </div>
      <Stats
        items={[
          {
            label: searching ? "looking up" : "inserting",
            value: searching ? query : wordIndex !== null ? words[wordIndex] : "—",
          },
          { label: "nodes", value: nodes.length - 1 },
          {
            label: "search · startsWith",
            value: result ? `${result.search} · ${result.startsWith}` : "…",
            answer: true,
          },
        ]}
      />
    </ViewRoot>
  );
}
