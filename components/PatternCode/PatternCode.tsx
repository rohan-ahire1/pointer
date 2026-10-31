"use client";

import { useState } from "react";
import { CODE_LANG_LABELS, useCodeLang } from "@/lib/code-lang";
import { tokenize } from "@/lib/highlight";
import type { PatternGuide } from "@/content/guides";
import styles from "./PatternCode.module.css";

type PatternCodeProps = {
  template: PatternGuide["template"];
  patternName: string;
  /** Puts this h4 and the copy button in a row above the code. */
  heading?: string;
};

/** A pattern's code skeleton in the reader's language, with a copy button. */
export function PatternCode({ template, patternName, heading }: PatternCodeProps) {
  const lang = useCodeLang();
  const [copyStatus, setCopyStatus] = useState("");
  const code = template[lang];

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopyStatus("Copied");
    } catch {
      setCopyStatus("Copy blocked. Select the code instead.");
    }
  }

  const controls = (
    <div className={styles.footer} data-no-print>
      <button
        type="button"
        onClick={copy}
        aria-label={`Copy the ${patternName} template`}
        className={styles.copy}
      >
        Copy
      </button>
      <span role="status" className={styles.status}>
        {copyStatus}
      </span>
    </div>
  );

  return (
    <div className={styles.root}>
      {heading && (
        <div className={styles.header}>
          <h4 className={styles.heading}>{heading}</h4>
          {controls}
        </div>
      )}
      {/* Long lines scroll, so the block has to be reachable by keyboard. */}
      <pre tabIndex={0} aria-label={`${patternName} template in ${CODE_LANG_LABELS[lang]}`} className={styles.code}>
        <code>
          {tokenize(code, lang).map((token, index) =>
            token.kind ? (
              <span key={index} className={styles[token.kind]}>
                {token.text}
              </span>
            ) : (
              token.text
            ),
          )}
        </code>
      </pre>
      {!heading && controls}
    </div>
  );
}
