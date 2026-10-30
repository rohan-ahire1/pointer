import type { Metadata } from "next";
import Link from "next/link";
import { getPatternGroups, getProblems, EXTRAS_KEY } from "@/content";
import { PatternsBrowser } from "@/components/Patterns/PatternsBrowser/PatternsBrowser";
import { YourProgressCard } from "@/components/Patterns/YourProgressCard/YourProgressCard";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "All 15 patterns",
  description: "Most interview problems are one of these in disguise. Learn them in order, or jump to the one you need.",
  alternates: { canonical: "/patterns" },
};

export default function PatternsPage() {
  const groups = getPatternGroups();
  const extrasCount = getProblems().filter((problem) => problem.pattern === EXTRAS_KEY).length;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerCopy}>
          <nav aria-label="Breadcrumb" className={styles.breadcrumb}>
            <Link href="/">Home</Link> <span aria-hidden="true">›</span>{" "}
            <span aria-current="page">Patterns</span>
          </nav>
          <h1 className={`soft ${styles.title}`}>All 15 patterns</h1>
          <p className={styles.lead}>
            Most interview problems are one of these in disguise. Learn them in order, or jump to the one
            you need.
          </p>
          <Link href="/cheatsheet" className={styles.sheetLink}>
            See them all on one page →
          </Link>
        </div>
        <div className={styles.progressCardSlot}>
          <YourProgressCard />
        </div>
      </header>

      <PatternsBrowser groups={groups} extrasCount={extrasCount} />
    </div>
  );
}
