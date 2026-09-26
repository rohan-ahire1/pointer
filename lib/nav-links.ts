export type NavLink = {
  href: string;
  label: string;
};

/** Shared between the desktop nav and the phone menu. */
export const NAV_LINKS: readonly NavLink[] = [
  { href: "/patterns", label: "Patterns" },
  { href: "/problems", label: "Problems" },
  { href: "/progress", label: "Progress" },
  { href: "/about", label: "About" },
];
