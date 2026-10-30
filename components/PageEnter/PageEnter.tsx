import type { ReactNode } from "react";
import styles from "./PageEnter.module.css";

/**
 * Wraps a route's content so it rises in on navigation. Used by the
 * template.tsx files, which remount on every route change. The content is
 * visible by default; the animation only runs on top of that.
 */
export function PageEnter({ children }: { children: ReactNode }) {
  return <div className={styles.enter}>{children}</div>;
}
