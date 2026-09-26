"use client";

import { useCallback, useSyncExternalStore } from "react";
import { applyTheme, getStoredTheme, resolveIsDark, setStoredTheme, type Theme } from "./theme";

/**
 * Client-side theme state for interactive UI (the toggle's icon/label),
 * shared across every mounted <ThemeToggle> via a module-level store — this
 * is what keeps the desktop nav's toggle and the phone menu's switch in
 * sync when both are mounted. The actual no-flash application of the
 * stored choice to <html> happens in the blocking <head> script
 * (theme-script.ts) before React ever runs; this just mirrors that into
 * React (via useSyncExternalStore, so there's no effect-based setState)
 * and lets the user change it.
 *
 * Server snapshot is always "system"/false so the server-rendered markup
 * matches the first client render; the real value is read lazily on the
 * client's first subscribe/getSnapshot call. That can cause a one-frame
 * correction of the toggle's icon after hydration — not of the page
 * itself, which is already correct pre-paint via the blocking script.
 */

type Listener = () => void;

const listeners = new Set<Listener>();
let currentTheme: Theme = "system";
let currentIsDark = false;
let initialized = false;
let mediaQuery: MediaQueryList | null = null;

function notify() {
  for (const listener of listeners) listener();
}

function ensureInitialized() {
  if (initialized || typeof window === "undefined") return;
  initialized = true;
  currentTheme = getStoredTheme();
  currentIsDark = resolveIsDark(currentTheme);

  if (typeof window.matchMedia === "function") {
    mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    mediaQuery.addEventListener("change", () => {
      if (currentTheme !== "system" || !mediaQuery) return;
      currentIsDark = mediaQuery.matches;
      notify();
    });
  }
}

function subscribe(listener: Listener) {
  ensureInitialized();
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getThemeSnapshot(): Theme {
  ensureInitialized();
  return currentTheme;
}

function getIsDarkSnapshot(): boolean {
  ensureInitialized();
  return currentIsDark;
}

function getServerTheme(): Theme {
  return "system";
}

function getServerIsDark(): boolean {
  return false;
}

function setTheme(next: Theme): void {
  currentTheme = next;
  currentIsDark = resolveIsDark(next);
  setStoredTheme(next);
  applyTheme(next);
  notify();
}

export function useTheme() {
  const theme = useSyncExternalStore(subscribe, getThemeSnapshot, getServerTheme);
  const isDark = useSyncExternalStore(subscribe, getIsDarkSnapshot, getServerIsDark);

  const toggle = useCallback(() => {
    setTheme(isDark ? "light" : "dark");
  }, [isDark]);

  return { theme, isDark, setTheme, toggle };
}
