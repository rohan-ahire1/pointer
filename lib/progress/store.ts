/**
 * Module-level progress store, mirroring lib/theme.ts + lib/use-theme.ts's
 * split (framework-agnostic read/write + validation vs. the React binding
 * in use-progress.ts): every <LessonProblemRow> "Mark solved" toggle and every
 * /problems checkbox reads from and writes to this single in-memory value,
 * so they stay in sync with each other in the same tab without prop
 * drilling or context. A `storage` event listener keeps multiple tabs in
 * sync too.
 *
 * Server snapshot is always EMPTY_PROGRESS so server-rendered markup never
 * shows a checkbox as solved when the client hasn't hydrated yet (see
 * use-theme.ts's identical rationale) — the real value loads lazily on the
 * client's first subscribe/getSnapshot call.
 */
import {
  EMPTY_PROGRESS,
  mergeProgress,
  PROGRESS_STORAGE_KEY,
  validateProgress,
  type ImportResult,
  type LessonSection,
  type Progress,
} from "./types";
import { readStoredProgress, writeStoredProgress } from "./storage";

type Listener = () => void;

const listeners = new Set<Listener>();
let current: Progress = EMPTY_PROGRESS;
let initialized = false;

function notify() {
  for (const listener of listeners) listener();
}

function ensureInitialized() {
  if (initialized || typeof window === "undefined") return;
  initialized = true;
  current = readStoredProgress() ?? EMPTY_PROGRESS;

  window.addEventListener("storage", (event) => {
    if (event.key !== PROGRESS_STORAGE_KEY) return;
    if (event.newValue === null) {
      current = EMPTY_PROGRESS;
      notify();
      return;
    }
    try {
      const parsed: unknown = JSON.parse(event.newValue);
      const result = validateProgress(parsed);
      if (result.ok) {
        current = result.value;
        notify();
      }
    } catch {
      // Another tab wrote something we can't parse — ignore, keep our value.
    }
  });
}

function set(next: Progress) {
  current = next;
  writeStoredProgress(next);
  notify();
}

export function subscribeProgress(listener: Listener): () => void {
  ensureInitialized();
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getProgressSnapshot(): Progress {
  ensureInitialized();
  return current;
}

export function getServerProgressSnapshot(): Progress {
  return EMPTY_PROGRESS;
}

/** Flips a problem between solved and not solved. */
export function toggleSolved(problemSlug: string): void {
  ensureInitialized();
  const solved = { ...current.solved };
  if (solved[problemSlug]) {
    delete solved[problemSlug];
  } else {
    solved[problemSlug] = true;
  }
  set({ ...current, solved });
}

/** Records the section a lesson page has scrolled to, for "continue where you left off". */
export function setLessonSection(patternSlug: string, section: LessonSection): void {
  ensureInitialized();
  const existing = current.lessons[patternSlug];
  if (existing?.lastSection === section) return; // no-op: avoid pointless writes/renders on every scroll tick
  set({
    ...current,
    lessons: {
      ...current.lessons,
      [patternSlug]: { lastSection: section, updatedAt: new Date().toISOString() },
    },
  });
}

/** Returns the current progress as a JSON string, ready to download. */
export function exportProgress(): string {
  ensureInitialized();
  return JSON.stringify(current, null, 2);
}

/**
 * Validates `json` strictly and, if valid, merges it into the current
 * progress (solved problems union; per-lesson section keeps whichever side
 * was updated more recently) rather than replacing it outright.
 */
export function importProgress(json: string): ImportResult {
  ensureInitialized();
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    return { ok: false, error: "That file isn't valid JSON." };
  }
  const result = validateProgress(parsed);
  if (!result.ok) {
    return { ok: false, error: result.error };
  }
  set(mergeProgress(current, result.value));
  return { ok: true };
}

/** Clears all progress (solved problems and lesson positions). */
export function resetProgress(): void {
  ensureInitialized();
  set(EMPTY_PROGRESS);
}
