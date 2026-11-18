import type { Metadata } from "next";
import Link from "next/link";
import { getProblemGroups } from "@/content";
import { ProblemsBrowser } from "@/components/Problems/ProblemsBrowser/ProblemsBrowser";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "The Blind 75 and more",
  description:
    "The Blind 75 plus the problems companies ask most, grouped by pattern, with hints. Tick them off as you go.",
  alternates: { canonical: "/problems" },
};

export default function ProblemsPage() {
  const groups = getProblemGroups();

  return (
    <div className={styles.page}>
      <nav aria-label="Breadcrumb" className={styles.breadcrumb}>
        <Link href="/">Home</Link> <span aria-hidden="true">›</span> <span aria-current="page">Problems</span>
      </nav>
      <h1 className={`soft ${styles.title}`}>The Blind 75 and more</h1>
      <ProblemsBrowser groups={groups} />
    </div>
  );
}
