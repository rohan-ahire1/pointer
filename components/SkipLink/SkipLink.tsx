import styles from "./SkipLink.module.css";

/**
 * Must be the first focusable element on every page. Targets the single
 * <main id="main"> landmark rendered by the root layout.
 */
export function SkipLink() {
  return (
    <a href="#main" className={styles.skip}>
      Skip to content
    </a>
  );
}
