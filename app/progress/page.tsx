import type { Metadata } from "next";
import Link from "next/link";
import { ProgressDashboard } from "@/components/Progress/ProgressDashboard/ProgressDashboard";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Your progress",
  description: "Saved in this browser only. No account, nothing sent anywhere.",
  alternates: { canonical: "/progress" },
};

export default function ProgressPage() {
  return (
    <div className={styles.page}>
      <nav aria-label="Breadcrumb" className={styles.breadcrumb}>
        <Link href="/">Home</Link> <span aria-hidden="true">›</span> <span aria-current="page">Progress</span>
      </nav>
      <h1 className={`soft ${styles.title}`}>Your progress</h1>
      <p className={styles.lead}>Saved in this browser only. No account, nothing sent anywhere.</p>
      <ProgressDashboard />
    </div>
  );
}
