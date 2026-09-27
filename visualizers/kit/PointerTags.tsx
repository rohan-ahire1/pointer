import type { CSSProperties } from "react";
import styles from "./PointerTags.module.css";

/**
 * Pointer chips under an element. Tones (README section 1): orange = the main
 * reading pointer, inverse = the anchor/slow pointer, lilac = a third one.
 */
export type PointerTag = { label: string; tone: "orange" | "inverse" | "lilac" };

type PointerTagsProps = {
  tags: readonly PointerTag[];
  /** Rows of height to reserve so the layout doesn't jump when tags come and go. */
  rows?: number;
};

export function PointerTags({ tags, rows = 1 }: PointerTagsProps) {
  return (
    <div className={styles.tags} style={{ "--tag-rows": rows } as CSSProperties}>
      {tags.map((tag) => (
        <span key={tag.label} className={styles.tag} data-tone={tag.tone}>
          {tag.label}
        </span>
      ))}
    </div>
  );
}
