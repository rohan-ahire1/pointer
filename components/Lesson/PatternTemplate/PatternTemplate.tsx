import type { PatternGuide } from "@/content/guides";
import { CodeLangToggle } from "@/components/CodeLangToggle/CodeLangToggle";
import { PatternCode } from "@/components/PatternCode/PatternCode";
import styles from "./PatternTemplate.module.css";

type PatternTemplateProps = {
  guide: PatternGuide;
  patternName: string;
};

/** The reusable half of a lesson: a skeleton to start from and the usual mistakes. */
export function PatternTemplate({ guide, patternName }: PatternTemplateProps) {
  return (
    <div className={styles.card}>
      <div className={styles.codeColumn}>
        <div className={styles.head}>
          <h3 className={`soft ${styles.heading}`}>Start from this</h3>
          <CodeLangToggle />
        </div>
        <PatternCode template={guide.template} patternName={patternName} />
      </div>
      <div className={styles.pitfallsColumn}>
        <h3 className={`soft ${styles.heading}`}>Easy ways to go wrong</h3>
        <ul className={styles.pitfalls}>
          {guide.pitfalls.map((pitfall) => (
            <li key={pitfall} className={styles.pitfall}>
              <span aria-hidden="true" className={styles.mark}>
                ✕
              </span>
              {pitfall}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
