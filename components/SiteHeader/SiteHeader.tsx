"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getPatterns } from "@/content";
import { Logo } from "@/components/Logo/Logo";
import { ThemeToggle } from "@/components/ThemeToggle/ThemeToggle";
import { PhoneMenu } from "@/components/PhoneMenu/PhoneMenu";
import { SearchPalette } from "@/components/Search/SearchPalette/SearchPalette";
import { MenuIcon, SearchIcon } from "@/components/icons/Icons";
import { NAV_LINKS } from "@/lib/nav-links";
import { OPEN_SEARCH_EVENT } from "@/lib/search-palette-events";
import styles from "./SiteHeader.module.css";

const PHONE_MENU_ID = "phone-menu";

const firstLivePattern = getPatterns().find((pattern) => pattern.status === "live");

/** Elements with `offsetParent !== null` are actually laid out (visible) — used to pick a sensible focus-return target across the desktop/mobile breakpoint. */
function firstVisible(...elements: (HTMLElement | null)[]): HTMLElement | null {
  return elements.find((el) => el !== null && el.offsetParent !== null) ?? elements.find((el) => el !== null) ?? null;
}

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const desktopSearchButtonRef = useRef<HTMLButtonElement>(null);
  const mobileSearchButtonRef = useRef<HTMLButtonElement>(null);
  const searchReturnFocusRef = useRef<HTMLElement | null>(null);
  const pathname = usePathname();

  function closeMenu() {
    setMenuOpen(false);
    menuButtonRef.current?.focus();
  }

  function openSearch(trigger?: HTMLElement | null) {
    searchReturnFocusRef.current =
      trigger ?? firstVisible(desktopSearchButtonRef.current, mobileSearchButtonRef.current);
    setMenuOpen(false);
    setSearchOpen(true);
  }

  function closeSearch() {
    setSearchOpen(false);
    (searchReturnFocusRef.current ?? firstVisible(desktopSearchButtonRef.current, mobileSearchButtonRef.current))?.focus();
  }

  // Global shortcuts: "/" (unless typing somewhere) and Cmd/Ctrl+K, plus the
  // pointer:open-search escape hatch from app/not-found.tsx (which renders
  // outside this component's tree — see lib/search-palette-events.ts).
  useEffect(() => {
    function isEditableTarget(target: EventTarget | null): boolean {
      if (!(target instanceof HTMLElement)) return false;
      return target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable;
    }

    function onKeyDown(event: KeyboardEvent) {
      const metaK = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k";
      const slash = event.key === "/" && !isEditableTarget(event.target);
      if (!metaK && !slash) return;
      event.preventDefault();
      openSearch();
    }

    function onOpenSearchEvent() {
      openSearch();
    }

    document.addEventListener("keydown", onKeyDown);
    window.addEventListener(OPEN_SEARCH_EVENT, onOpenSearchEvent);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      window.removeEventListener(OPEN_SEARCH_EVENT, onOpenSearchEvent);
    };
  }, []);

  return (
    <header data-no-print className={styles.wrap}>
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
          <button
            type="button"
            ref={desktopSearchButtonRef}
            className={styles.searchButton}
            onClick={(event) => openSearch(event.currentTarget)}
          >
            <SearchIcon />
            Search
            <span className={styles.shortcutHint} aria-hidden="true">
              /
            </span>
          </button>
          <ThemeToggle variant="icon" />
          {firstLivePattern && (
            <Link href={`/patterns/${firstLivePattern.slug}`} className={styles.startLearningButton}>
              Start learning
            </Link>
          )}
        </div>

        <div className={styles.mobileControls}>
          <button
            type="button"
            ref={mobileSearchButtonRef}
            className={styles.searchButtonMobile}
            aria-label="Search"
            onClick={(event) => openSearch(event.currentTarget)}
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

      <PhoneMenu
        id={PHONE_MENU_ID}
        open={menuOpen}
        onClose={closeMenu}
        onOpenSearch={() => openSearch(mobileSearchButtonRef.current)}
      />
      <SearchPalette open={searchOpen} onClose={closeSearch} />
    </header>
  );
}
