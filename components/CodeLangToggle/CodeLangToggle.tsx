"use client";

import { CODE_LANG_LABELS, setCodeLang, useCodeLang, type CodeLang } from "@/lib/code-lang";
import styles from "./CodeLangToggle.module.css";

const CODE_LANGS = Object.keys(CODE_LANG_LABELS) as CodeLang[];

/** Picks TypeScript or Python for every code panel on the site at once. */
export function CodeLangToggle() {
  const lang = useCodeLang();

  return (
    <div role="group" aria-label="Code language" className={styles.group}>
      {CODE_LANGS.map((option) => (
        <button
          key={option}
          type="button"
          aria-pressed={lang === option}
          onClick={() => setCodeLang(option)}
          className={lang === option ? styles.optionActive : styles.option}
        >
          {CODE_LANG_LABELS[option]}
        </button>
      ))}
    </div>
  );
}
