/**
 * A tiny decoupling seam for opening the search palette from outside
 * <SiteHeader> — specifically app/not-found.tsx, which renders inside
 * <main> as a sibling of the header (not a child of it), so it has no
 * direct way to call SiteHeader's `setSearchOpen`. A DOM CustomEvent keeps
 * that one call site simple without reaching for React context just for
 * this.
 */
export const OPEN_SEARCH_EVENT = "pointer:open-search";

export function dispatchOpenSearch(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(OPEN_SEARCH_EVENT));
}
