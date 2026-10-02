import { Logo } from "@/components/Logo/Logo";
import { CONTACT_EMAIL, SOCIAL_LINKS } from "@/lib/site";
import styles from "./SiteFooter.module.css";

export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <Logo />
      <span className={styles.made}>made by Rohan</span>
      <nav aria-label="Social" className={styles.social}>
        {SOCIAL_LINKS.map((link) => (
          <a key={link.label} href={link.href} target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
            {link.label}
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        ))}
        <a href={`mailto:${CONTACT_EMAIL}`} className={styles.socialLink}>
          Email
        </a>
      </nav>
    </footer>
  );
}
