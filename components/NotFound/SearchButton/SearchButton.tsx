"use client";

import { dispatchOpenSearch } from "@/lib/search-palette-events";

type SearchButtonProps = {
  className?: string;
};

/**
 * The "Search" button on app/not-found.tsx. That page renders inside
 * <main>, a sibling of <SiteHeader> (which owns the palette's open state),
 * so it can't call setSearchOpen directly — it dispatches the
 * pointer:open-search DOM event instead (lib/search-palette-events.ts),
 * which SiteHeader listens for.
 */
export function SearchButton({ className }: SearchButtonProps) {
  return (
    <button type="button" onClick={dispatchOpenSearch} className={className}>
      Search
    </button>
  );
}
