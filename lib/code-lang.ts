"use client";

import { useSyncExternalStore } from "react";

/**
 * Which language code panels show, shared by every panel on the site so
 * flipping one flips them all. Same shape as the progress store: a module
 * value, a storage listener for other tabs, a server snapshot that matches
 * the first client render, and try/catch around storage.
 */
export type CodeLang = "ts" | "py";

export const CODE_LANG_STORAGE_KEY = "pointer:code-lang";

export const CODE_LANG_LABELS: Record<CodeLang, string> = { ts: "TypeScript", py: "Python" };

const listeners = new Set<() => void>();
let current: CodeLang = "ts";
let initialized = false;

function isCodeLang(value: unknown): value is CodeLang {
  return value === "ts" || value === "py";
}

function ensureInitialized() {
  if (initialized || typeof window === "undefined") return;
  initialized = true;
  try {
    const stored = window.localStorage.getItem(CODE_LANG_STORAGE_KEY);
    if (isCodeLang(stored)) current = stored;
  } catch {
    // Storage blocked: stay on the default for this visit.
  }
  window.addEventListener("storage", (event) => {
    if (event.key !== CODE_LANG_STORAGE_KEY || !isCodeLang(event.newValue)) return;
    current = event.newValue;
    for (const listener of listeners) listener();
  });
}

function subscribe(listener: () => void) {
  ensureInitialized();
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): CodeLang {
  ensureInitialized();
  return current;
}

export function setCodeLang(lang: CodeLang): void {
  ensureInitialized();
  current = lang;
  try {
    window.localStorage.setItem(CODE_LANG_STORAGE_KEY, lang);
  } catch {
    // Storage blocked: the choice still lasts until the page is closed.
  }
  for (const listener of listeners) listener();
}

export function useCodeLang(): CodeLang {
  return useSyncExternalStore(subscribe, getSnapshot, () => "ts");
}
