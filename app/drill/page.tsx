import type { Metadata } from "next";
import Link from "next/link";
import { PatternDrill } from "@/components/Drill/PatternDrill/PatternDrill";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Pattern drill",
  description: "Read a coding interview problem and name the pattern. Ten quick questions, no code.",
  alternates: { canonical: "/drill" },
};

export default function DrillPage() {
  return (
    <div className={styles.page}>
      <nav aria-label="Breadcrumb" className={styles.breadcrumb}>
        <Link href="/">Home</Link> <span aria-hidden="true">›</span> <span aria-current="page">Drill</span>
      </nav>
      <h1 className={`soft ${styles.title}`}>Pattern drill</h1>
      <p className={styles.lead}>
        Read the problem and name the pattern before you think about code. Ten questions, four choices each.
      </p>
      <PatternDrill />
    </div>
  );
}
