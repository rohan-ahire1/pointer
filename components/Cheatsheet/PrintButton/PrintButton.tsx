"use client";

import styles from "./PrintButton.module.css";

export function PrintButton() {
  return (
    <button type="button" onClick={() => window.print()} className={styles.button}>
      Print or save as PDF
    </button>
  );
}
