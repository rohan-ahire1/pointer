import type { Metadata } from "next";
import Link from "next/link";
import { getProblemGroups } from "@/content";
import { ProblemsBrowser } from "@/components/Problems/ProblemsBrowser/ProblemsBrowser";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "The Blind 75 — Pointer",
  description: "The classic interview problem list, grouped by pattern. Tick them off as you go.",
};

export default function ProblemsPage() {
  const groups = getProblemGroups();

  return (
    <div className={styles.page}>
      <nav aria-label="Breadcrumb" className={styles.breadcrumb}>
        <Link href="/">Home</Link> <span aria-hidden="true">›</span> <span aria-current="page">Problems</span>
      </nav>
      <h1 className={`soft ${styles.title}`}>The Blind 75</h1>
      <ProblemsBrowser groups={groups} />
    </div>
  );
}
