"use client";

import type { MouseEvent } from "react";
import { useTheme } from "@/lib/use-theme";
import { MoonIcon, SunIcon } from "@/components/icons/Icons";
import styles from "./ThemeToggle.module.css";

type ThemeToggleProps = {
  /** "icon" matches the desktop nav; "switch" matches the phone menu. */
  variant?: "icon" | "switch";
};

/**
 * Toggles between an explicit light/dark choice (persisted to
 * localStorage). There's no UI affordance to go back to "system" — same as
 * the mocks, which only ever show a two-state control; "system" is just the
 * unvisited default.
 */
export function ThemeToggle({ variant = "icon" }: ThemeToggleProps) {
  const { isDark, toggle } = useTheme();

  // The new theme spreads out as a circle from the button that was pressed.
  // Browsers without view transitions, and anyone who prefers reduced
  // motion, get the plain instant switch.
  function handleClick(event: MouseEvent<HTMLButtonElement>) {
    const root = document.documentElement;
    const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (typeof document.startViewTransition !== "function" || reduceMotion) {
      toggle();
      return;
    }
    const rect = event.currentTarget.getBoundingClientRect();
    root.style.setProperty("--theme-x", `${rect.left + rect.width / 2}px`);
    root.style.setProperty("--theme-y", `${rect.top + rect.height / 2}px`);
    root.dataset.themeReveal = "";
    const transition = document.startViewTransition(toggle);
    transition.finished.finally(() => {
      delete root.dataset.themeReveal;
    });
  }

  const label = isDark ? "Switch to light theme" : "Switch to dark theme";

  if (variant === "switch") {
    return (
      <div className={styles.switchRow}>
        <span id="theme-switch-label" className={styles.switchLabel}>
          Dark mode
        </span>
        <button
          type="button"
          role="switch"
          aria-checked={isDark}
          aria-labelledby="theme-switch-label"
          onClick={handleClick}
          className={styles.switchTrack}
          data-checked={isDark}
        >
          <span className={styles.switchKnob} aria-hidden="true" />
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={label}
      aria-pressed={isDark}
      className={styles.iconButton}
    >
      <span key={isDark ? "sun" : "moon"} className={styles.icon}>
        {isDark ? <SunIcon /> : <MoonIcon />}
      </span>
    </button>
  );
}
