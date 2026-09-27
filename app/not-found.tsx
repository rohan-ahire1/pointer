import type { Metadata } from "next";
import Link from "next/link";
import { SearchButton } from "@/components/NotFound/SearchButton/SearchButton";
import styles from "./not-found.module.css";

export const metadata: Metadata = {
  title: "Page not found",
  description: "The page you wanted isn't here. It may have moved, or the link has a typo.",
};

/** 404 (design/mocks/C2-404.dc.html). */
export default function NotFound() {
  return (
    <div className={styles.wrap}>
      <div aria-hidden="true" className={styles.chips}>
        <span className={styles.chip}>4</span>
        <span className={styles.chip}>0</span>
        <span className={styles.chip}>4</span>
        <span className={styles.chipDashed}>?</span>
        <span className={styles.chipAccent}>undef</span>
      </div>
      <h1 className={`soft ${styles.title}`}>This pointer ran off the end of the array.</h1>
      <p className={styles.lead}>The page you wanted isn&rsquo;t here. It may have moved, or the link has a typo.</p>
      <div className={styles.actions}>
        <Link href="/" className={styles.primaryButton}>
          Go home
        </Link>
        <Link href="/patterns" className={styles.secondaryButton}>
          Browse patterns
        </Link>
        <SearchButton className={styles.secondaryButton} />
      </div>
    </div>
  );
}
