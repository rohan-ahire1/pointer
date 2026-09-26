"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/Logo/Logo";
import { ThemeToggle } from "@/components/ThemeToggle/ThemeToggle";
import { PhoneMenu } from "@/components/PhoneMenu/PhoneMenu";
import { MenuIcon, SearchIcon } from "@/components/icons/Icons";
import { NAV_LINKS } from "@/lib/nav-links";
import styles from "./SiteHeader.module.css";

const PHONE_MENU_ID = "phone-menu";

function handleSearchClick() {
  // TODO step 6: open search palette
}

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();

  function closeMenu() {
    setMenuOpen(false);
    menuButtonRef.current?.focus();
  }

  return (
    <header className={styles.wrap}>
      <nav aria-label="Main" className={styles.nav}>
        <Link href="/" aria-label="Pointer home" className={styles.logoLink}>
          <Logo />
        </Link>

        <div className={styles.desktopLinks}>
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={pathname === link.href ? "page" : undefined}
              className={styles.navLink}
            >
              {link.label}
            </Link>
          ))}
          <button type="button" className={styles.searchButton} onClick={handleSearchClick}>
            <SearchIcon />
            Search
            <span className={styles.shortcutHint} aria-hidden="true">
              /
            </span>
          </button>
          <ThemeToggle variant="icon" />
        </div>

        <div className={styles.mobileControls}>
          <button
            type="button"
            className={styles.searchButtonMobile}
            aria-label="Search"
            onClick={handleSearchClick}
          >
            <SearchIcon />
          </button>
          <button
            type="button"
            ref={menuButtonRef}
            className={styles.menuButton}
            aria-expanded={menuOpen}
            aria-controls={PHONE_MENU_ID}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <MenuIcon open={menuOpen} />
          </button>
        </div>
      </nav>

      <PhoneMenu id={PHONE_MENU_ID} open={menuOpen} onClose={closeMenu} />
    </header>
  );
}
