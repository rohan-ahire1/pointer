export type NavLink = {
  href: string;
  label: string;
};

/** Shared between the desktop nav and the phone menu. */
export const NAV_LINKS: readonly NavLink[] = [
  { href: "/patterns", label: "Patterns" },
  { href: "/problems", label: "Problems" },
  { href: "/drill", label: "Drill" },
  { href: "/progress", label: "Progress" },
  { href: "/about", label: "About" },
];

/** Pages that don't earn a place in the top bar: the phone menu and footer list them instead. */
export const MORE_LINKS: readonly NavLink[] = [{ href: "/cheatsheet", label: "Cheat sheet" }];
