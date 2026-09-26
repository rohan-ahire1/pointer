/**
 * Theme storage + application helpers. Kept dependency-free and framework
 * agnostic so they can run both from the blocking <head> script (as plain
 * strings, see theme-script.ts) and from React (see use-theme.ts).
 *
 * Every localStorage access is wrapped in try/catch: the site must keep
 * working when storage is blocked (private browsing, locked-down browser
 * settings, etc.) — it just won't remember the user's choice.
 */

export type Theme = "light" | "dark" | "system";

export const THEME_STORAGE_KEY = "pointer:theme";

const THEMES: readonly Theme[] = ["light", "dark", "system"];

export function isTheme(value: unknown): value is Theme {
  return typeof value === "string" && (THEMES as readonly string[]).includes(value);
}

type ReadableStorage = Pick<Storage, "getItem">;
type WritableStorage = Pick<Storage, "setItem">;

function browserLocalStorage(): Storage {
  if (typeof window === "undefined") {
    throw new Error("localStorage is not available in this environment");
  }
  return window.localStorage;
}

/**
 * Reads the persisted theme choice. Falls back to "system" (the default)
 * when storage is unavailable, empty, or holds a value we don't recognise.
 */
export function getStoredTheme(storage?: ReadableStorage): Theme {
  try {
    const target = storage ?? browserLocalStorage();
    const value = target.getItem(THEME_STORAGE_KEY);
    return isTheme(value) ? value : "system";
  } catch {
    return "system";
  }
}

/**
 * Persists a theme choice. Silently no-ops if storage throws.
 */
export function setStoredTheme(theme: Theme, storage?: WritableStorage): void {
  try {
    const target = storage ?? browserLocalStorage();
    target.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Storage blocked or unavailable — nothing to do, the site still works.
  }
}

/**
 * Applies a manual theme choice to the document by setting data-theme, or
 * clears it for "system" so tokens.css's prefers-color-scheme query takes
 * over.
 */
export function applyTheme(theme: Theme, root?: HTMLElement): void {
  const el = root ?? document.documentElement;
  if (theme === "light" || theme === "dark") {
    el.setAttribute("data-theme", theme);
  } else {
    el.removeAttribute("data-theme");
  }
}

/** Resolves whether a theme currently renders as dark. */
export function resolveIsDark(theme: Theme, matchMedia?: (query: string) => MediaQueryList): boolean {
  if (theme === "dark") return true;
  if (theme === "light") return false;
  const mm = matchMedia ?? window.matchMedia.bind(window);
  return mm("(prefers-color-scheme: dark)").matches;
}
