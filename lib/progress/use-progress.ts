"use client";

import { useCallback, useSyncExternalStore } from "react";
import {
  exportProgress,
  getProgressSnapshot,
  getServerProgressSnapshot,
  importProgress,
  recordDrillRound,
  resetProgress,
  reviewProblem,
  setLessonSection,
  subscribeProgress,
  toggleSolved,
} from "./store";

/**
 * Client-side progress state, shared across every component that calls
 * this hook (the lesson page's "Mark solved" buttons, /problems's
 * checkboxes, /progress's stats) via the module-level store in store.ts —
 * same `useSyncExternalStore` shape as `useTheme` in lib/use-theme.ts, and
 * for the same reason: no effect-based setState, and a server snapshot
 * (EMPTY_PROGRESS) that matches the first client render so there's no
 * hydration mismatch.
 */
export function useProgress() {
  const progress = useSyncExternalStore(subscribeProgress, getProgressSnapshot, getServerProgressSnapshot);

  const isSolved = useCallback((problemSlug: string) => progress.solved[problemSlug] === true, [progress]);

  return {
    progress,
    isSolved,
    toggleSolved,
    reviewProblem,
    recordDrillRound,
    setLessonSection,
    exportProgress,
    importProgress,
    resetProgress,
  };
}
