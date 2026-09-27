/**
 * localStorage read/write for the `pointer:v1` key. Every access is wrapped
 * in try/catch (private browsing, locked-down storage, SSR, a hand-edited
 * quota — all the same failure mode): callers get `null` back and the site
 * keeps working from the in-memory store in progress-store.ts.
 */
import { EMPTY_PROGRESS, PROGRESS_STORAGE_KEY, validateProgress, type Progress } from "./types";

type ReadableStorage = Pick<Storage, "getItem">;
type WritableStorage = Pick<Storage, "setItem">;

function browserLocalStorage(): Storage {
  if (typeof window === "undefined") {
    throw new Error("localStorage is not available in this environment");
  }
  return window.localStorage;
}

/** Reads and validates the persisted progress. `null` if missing, blocked, or invalid. */
export function readStoredProgress(storage?: ReadableStorage): Progress | null {
  try {
    const target = storage ?? browserLocalStorage();
    const raw = target.getItem(PROGRESS_STORAGE_KEY);
    if (raw === null) return null;
    const parsed: unknown = JSON.parse(raw);
    const result = validateProgress(parsed);
    return result.ok ? result.value : null;
  } catch {
    return null;
  }
}

/** Persists progress. Silently no-ops if storage throws. */
export function writeStoredProgress(progress: Progress, storage?: WritableStorage): void {
  try {
    const target = storage ?? browserLocalStorage();
    target.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // Storage blocked or unavailable — the in-memory store still works.
  }
}

export { EMPTY_PROGRESS };
