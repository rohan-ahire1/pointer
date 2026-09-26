import { Logo } from "@/components/Logo/Logo";
import styles from "./SiteFooter.module.css";

/**
 * GitHub / Instagram / LinkedIn / Email are all [PLACEHOLDER] until Rohan
 * supplies the real links (see START_HERE.md / CLAUDE.md "Still needed").
 */
const EXTERNAL_LINKS = [
  { label: "[GITHUB]", href: "#" },
  { label: "[INSTAGRAM]", href: "#" },
  { label: "[LINKEDIN]", href: "#" },
];

export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <Logo />
      <span className={styles.made}>made by Rohan</span>
      <nav aria-label="Social" className={styles.social}>
        {EXTERNAL_LINKS.map((link) => (
          <a key={link.label} href={link.href} target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
            {link.label}
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        ))}
        <a href="mailto:#" className={styles.socialLink}>
          [EMAIL]
        </a>
      </nav>
    </footer>
  );
}
