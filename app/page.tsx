import styles from "./page.module.css";

/**
 * Step 1 placeholder home: just enough content to show the layout shell
 * (skip link, nav, footer) and the design tokens/fonts working together.
 * Real content (patterns grid, "Watch 60s", etc.) lands in later steps.
 */
export default function HomePage() {
  return (
    <section className={styles.hero}>
      <p className={styles.eyebrow}>15 patterns. zero memorizing.</p>
      <h1 className={`soft ${styles.title}`}>
        Algorithms you can <span className={styles.highlight}>watch move.</span>
      </h1>
      <p className={styles.lead}>
        Every interview pattern, explained with a one-minute animation and a visualizer you can poke,
        pause and step through.
      </p>
      <p className={styles.status}>
        This is the step 1 scaffold: project setup, tokens, fonts and this layout shell (nav, footer,
        skip link, theme toggle). Try resizing the window below <code>768px</code> for the phone menu,
        and the moon icon in the nav for dark mode.
      </p>
    </section>
  );
}
