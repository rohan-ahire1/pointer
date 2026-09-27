"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import type { KeyboardEvent as ReactKeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { countItems, flattenSections, getSearchItems, searchItems, type SearchItem } from "@/lib/search";
import { SearchIcon, CloseIcon } from "@/components/icons/Icons";
import styles from "./SearchPalette.module.css";

type SearchPaletteProps = {
  open: boolean;
  onClose: () => void;
};

/**
 * jsdom (used by the test suite) doesn't implement the imperative <dialog>
 * methods at all — not even as no-ops — so calling them directly would
 * throw. Every real browser has supported them for years, but
 * feature-detecting and falling back to toggling the `open` attribute
 * directly keeps this component from crashing (and keeps its contents
 * queryable in tests) on anything that doesn't.
 */
function safeShowModal(dialog: HTMLDialogElement) {
  if (typeof dialog.showModal === "function") {
    dialog.showModal();
  } else {
    dialog.setAttribute("open", "");
  }
}
function safeClose(dialog: HTMLDialogElement) {
  if (typeof dialog.close === "function") {
    dialog.close();
  } else {
    dialog.removeAttribute("open");
  }
}

/**
 * The command palette (design/mocks/C2-Search.dc.html, C2-PhoneSearch.dc.html):
 * a native <dialog> (built-in focus trap, Escape-to-close and top-layer
 * stacking — "a correct modal implementation" without hand-rolling one) with
 * an accessible combobox/listbox inside it. Opened by SiteHeader (the `/`
 * and ⌘K/Ctrl+K shortcuts, the nav search button, the phone menu's search
 * row) and by app/not-found.tsx via the pointer:open-search DOM event.
 */
export function SearchPalette({ open, onClose }: SearchPaletteProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  // Whatever had focus when the palette opened (a trigger button, or the
  // page body when opened with / or ⌘K), restored on close so focus is
  // never left on the hidden input.
  const returnFocusRef = useRef<Element | null>(null);
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  const listboxId = useId();
  const inputId = useId();

  // The corpus is static content (patterns/problems/pages), so it's built
  // once rather than on every keystroke.
  const items = useMemo(() => getSearchItems(), []);
  const sections = useMemo(() => (query.trim() ? searchItems(items, query) : []), [items, query]);
  const flat = useMemo(() => flattenSections(sections), [sections]);
  const total = countItems(sections);
  const hasQuery = query.trim() !== "";

  // A new query always resets the active option to the first result.
  // Adjusted during render rather than in an effect — the same
  // "adjusting state when a prop changes" pattern VisualizerPlayer uses for
  // its own input — so there's no extra render pass and no lint warning
  // about calling setState synchronously inside an effect.
  const [prevQuery, setPrevQuery] = useState(query);
  if (prevQuery !== query) {
    setPrevQuery(query);
    if (activeIndex !== 0) setActiveIndex(0);
  }

  const clampedActive = flat.length > 0 ? Math.min(activeIndex, flat.length - 1) : 0;
  const activeItem: SearchItem | undefined = flat[clampedActive];
  const activeOptionId = activeItem ? `${listboxId}-${activeItem.id}` : undefined;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      returnFocusRef.current = document.activeElement;
      setQuery("");
      setActiveIndex(0);
      safeShowModal(dialog);
      // Wait a tick so showModal's own initial-focus handling settles first.
      requestAnimationFrame(() => inputRef.current?.focus());
    } else if (!open && dialog.open) {
      safeClose(dialog);
    }
  }, [open]);

  function go(item: SearchItem) {
    router.push(item.href);
    const dialog = dialogRef.current;
    if (dialog) safeClose(dialog);
  }

  function handleClose() {
    const previous = returnFocusRef.current;
    returnFocusRef.current = null;
    if (previous instanceof HTMLElement && previous !== document.body && previous.isConnected) {
      previous.focus();
    } else if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    onClose();
  }

  function handleKeyDown(event: ReactKeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (flat.length > 0) setActiveIndex((i) => Math.min(flat.length - 1, i + 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      if (flat.length > 0) setActiveIndex((i) => Math.max(0, i - 1));
    } else if (event.key === "Enter") {
      event.preventDefault();
      if (activeItem) go(activeItem);
    }
    // Escape is left to the native <dialog>: it fires "cancel" then "close",
    // which the onClose handler below turns back into React state.
  }

  return (
    <dialog ref={dialogRef} aria-label="Search Pointer" className={styles.dialog} onClose={handleClose}>
      <div className={styles.headerRow}>
        <SearchIcon />
        <label htmlFor={inputId} className="sr-only">
          Search patterns, problems and pages
        </label>
        <input
          id={inputId}
          ref={inputRef}
          role="combobox"
          aria-expanded={total > 0}
          aria-controls={listboxId}
          aria-activedescendant={activeOptionId}
          aria-autocomplete="list"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search patterns, problems, pages…"
          autoComplete="off"
          className={styles.input}
        />
        <button
          type="button"
          onClick={() => dialogRef.current && safeClose(dialogRef.current)}
          aria-label="Close search"
          className={styles.closeButton}
        >
          <CloseIcon />
          <span className={styles.closeButtonLabel}>esc</span>
        </button>
      </div>

      <div id={listboxId} role="listbox" aria-label="Results" className={styles.list}>
        {sections.map((section) => (
          <div key={section.title} role="group" aria-label={section.title} className={styles.group}>
            <div className={styles.groupTitle}>{section.title}</div>
            {section.items.map((item) => {
              const index = flat.findIndex((f) => f.id === item.id);
              const selected = index === clampedActive;
              return (
                <div
                  key={item.id}
                  id={`${listboxId}-${item.id}`}
                  role="option"
                  aria-selected={selected}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => go(item)}
                  className={selected ? styles.optionActive : styles.option}
                >
                  <span aria-hidden="true" className={styles.badge} style={{ background: item.badgeBg }}>
                    {item.badge}
                  </span>
                  <span className={styles.optionText}>
                    <span className={styles.optionTitle}>{item.title}</span>
                    <span className={styles.optionSub}>{item.sub}</span>
                  </span>
                  {selected && (
                    <span aria-hidden="true" className={styles.openHint}>
                      ↵ open
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        ))}
        {hasQuery && total === 0 && (
          <div className={styles.empty}>
            <p className={`soft ${styles.emptyTitle}`}>No matches for &ldquo;{query.trim()}&rdquo;</p>
            <p className={styles.emptyHint}>Try a pattern name like &ldquo;tree&rdquo; or a problem like &ldquo;two sum&rdquo;.</p>
          </div>
        )}
        {!hasQuery && (
          <p className={styles.emptyHint}>Start typing to search patterns, problems and pages.</p>
        )}
      </div>

      <div className={styles.footer}>
        <span>
          <kbd className={styles.kbd}>↑</kbd> <kbd className={styles.kbd}>↓</kbd> move
        </span>
        <span>
          <kbd className={styles.kbd}>↵</kbd> open
        </span>
        <span>
          <kbd className={styles.kbd}>esc</kbd> close
        </span>
        <span aria-live="polite" className={styles.countLabel}>
          {hasQuery ? `${total} ${total === 1 ? "result" : "results"}` : ""}
        </span>
      </div>
    </dialog>
  );
}
