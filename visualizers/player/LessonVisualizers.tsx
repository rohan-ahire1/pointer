"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { flushSync } from "react-dom";
import { SHOW_VISUALIZER_EVENT } from "@/lib/visualizer-events";
import { getVisualizer } from "../index";
import { VisualizerPlayer } from "./VisualizerPlayer";
import styles from "./LessonVisualizers.module.css";

const subscribeNever = () => () => {};

/**
 * The visualizers for one lesson, with a picker when there's more than one.
 * This is the bridge Server Components should use: a `Visualizer` carries
 * functions that can't cross into a Client Component as props, so lesson pages
 * pass ids and this resolves them from the registry. `?v=<id>` opens a specific
 * one, which is what share links and problem-page links rely on.
 */
export function LessonVisualizers({ ids }: { ids: string[] }) {
  const search = useSyncExternalStore(
    subscribeNever,
    () => window.location.search,
    () => "",
  );
  const [chosen, setChosen] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  const fromUrl = new URLSearchParams(search).get("v");
  const activeId = chosen ?? (fromUrl && ids.includes(fromUrl) ? fromUrl : ids[0]);
  const visualizer = getVisualizer(activeId);

  useEffect(() => {
    function show(event: Event) {
      const id = (event as CustomEvent<string>).detail;
      if (!ids.includes(id)) return;
      flushSync(() => setChosen(id));
      rootRef.current?.closest("section")?.scrollIntoView();
      rootRef.current?.querySelector<HTMLElement>("[data-player]")?.focus({ preventScroll: true });
    }
    window.addEventListener(SHOW_VISUALIZER_EVENT, show);
    return () => window.removeEventListener(SHOW_VISUALIZER_EVENT, show);
  }, [ids]);

  if (!visualizer) return null;

  return (
    <div ref={rootRef} className={styles.root}>
      {ids.length > 1 && (
        <div role="group" aria-label="Choose an algorithm to run" className={styles.picker}>
          {ids.map((id) => {
            const option = getVisualizer(id);
            if (!option) return null;
            const on = id === activeId;
            return (
              <button
                key={id}
                type="button"
                aria-pressed={on}
                onClick={() => setChosen(id)}
                className={on ? styles.optionActive : styles.option}
              >
                {option.shortTitle ?? option.title}
              </button>
            );
          })}
        </div>
      )}
      <VisualizerPlayer key={activeId} visualizer={visualizer} />
    </div>
  );
}
