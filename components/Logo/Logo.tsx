import styles from "./Logo.module.css";

/** The "pointer" wordmark used in the header and footer. */
export function Logo() {
  return (
    <span className={`soft ${styles.wordmark}`}>
      <span aria-hidden="true" className={styles.mark}>
        ↑
      </span>
      pointer
    </span>
  );
}
