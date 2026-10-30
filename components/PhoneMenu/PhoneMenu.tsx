"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/ThemeToggle/ThemeToggle";
import { CloseIcon, SearchIcon } from "@/components/icons/Icons";
import { MORE_LINKS, NAV_LINKS } from "@/lib/nav-links";
import { useProgress } from "@/lib/progress";
import { getContinueLesson } from "@/lib/continue-lesson";
import { padPatternNumber } from "@/lib/pattern-nav";
import styles from "./PhoneMenu.module.css";

type PhoneMenuProps = {
  id: string;
  open: boolean;
  onClose: () => void;
  onOpenSearch: () => void;
};

const FOCUSABLE_SELECTOR = 'a[href], button:not([disabled])';

/**
 * Full-screen phone nav menu (below ~768px). Handles its own focus
 * management: focus moves to the close button on open, Tab is trapped
 * inside the dialog, Escape closes it, and closing returns focus to the
 * menu button that opened it (handled by the caller via onClose).
 */
export function PhoneMenu({ id, open, onClose, onOpenSearch }: PhoneMenuProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();
  const { progress } = useProgress();
  const continueLesson = getContinueLesson(progress);

  useEffect(() => {
    if (!open) return;

    closeButtonRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab") return;

      const dialog = dialogRef.current;
      if (!dialog) return;
      const focusable = Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div id={id} ref={dialogRef} role="dialog" aria-modal="true" aria-label="Menu" className={styles.dialog}>
      <div className={styles.header}>
        <span className={`soft ${styles.title}`}>Menu</span>
        <button type="button" ref={closeButtonRef} onClick={onClose} aria-label="Close menu" className={styles.closeButton}>
          <CloseIcon />
        </button>
      </div>

      <button type="button" className={styles.searchRow} onClick={onOpenSearch}>
        <SearchIcon />
        Search patterns &amp; problems
      </button>

      <nav aria-label="Main" className={styles.nav}>
        <Link
          href="/"
          onClick={onClose}
          aria-current={pathname === "/" ? "page" : undefined}
          className={`soft ${styles.navLink}`}
        >
          Home
        </Link>
        {[...NAV_LINKS, ...MORE_LINKS].map((link) => (
          <Link
            key={link.href}
            href={link.href}
            onClick={onClose}
            aria-current={pathname === link.href ? "page" : undefined}
            className={`soft ${styles.navLink}`}
          >
            {link.label}
          </Link>
        ))}
      </nav>

      {continueLesson && (
        <Link
          href={`/patterns/${continueLesson.pattern.slug}#${continueLesson.section}`}
          onClick={onClose}
          className={styles.continueCard}
        >
          <span className={styles.continueLabel}>CONTINUE</span>
          <span className={styles.continueText}>
            {padPatternNumber(continueLesson.pattern.number)} {continueLesson.pattern.name} ·{" "}
            {continueLesson.sectionLabel} →
          </span>
        </Link>
      )}

      <div className={styles.themeRow}>
        <ThemeToggle variant="switch" />
      </div>
    </div>
  );
}
