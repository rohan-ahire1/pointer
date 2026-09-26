"use client";

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
          onClick={toggle}
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
      onClick={toggle}
      aria-label={label}
      aria-pressed={isDark}
      className={styles.iconButton}
    >
      {isDark ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}
