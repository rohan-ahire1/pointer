"use client";

import { useEffect, useRef } from "react";
import { INTRO_ATTRIBUTE, INTRO_STORAGE_KEY } from "@/lib/intro-script";
import { INTRO_DURATION, introFrame, introGeometry, SPARK_COUNT, START_WORD, type LogoMetrics } from "./timeline";
import styles from "./Intro.module.css";

const SPARK_FILLS = ["var(--orange)", "var(--yellow)", "var(--lilac)", "var(--mint)", "var(--sky)"];
/** Past this, the page has been sitting behind a blank cover for too long. */
const LATEST_START_MS = 2500;
const FONT_WAIT_MS = 400;

/** Reads the header logo, so the intro lands exactly on top of it. */
function measureLogo(): LogoMetrics | null {
  const logo = document.querySelector("header [data-logo]");
  const mark = logo?.firstElementChild;
  const text = Array.from(logo?.childNodes ?? []).find((node) => node.nodeType === Node.TEXT_NODE);
  if (!logo || !mark || !text?.textContent) return null;

  const fontSize = parseFloat(getComputedStyle(logo).fontSize);
  const markRect = mark.getBoundingClientRect();
  const range = document.createRange();
  range.selectNodeContents(text);
  const textRect = range.getBoundingClientRect();
  const letterCentersEm = Array.from(text.textContent, (_, index) => {
    range.setStart(text, index);
    range.setEnd(text, index + 1);
    const letter = range.getBoundingClientRect();
    return (letter.left + letter.width / 2 - textRect.left) / fontSize;
  });

  return {
    markLeft: markRect.left,
    centerY: markRect.top + markRect.height / 2,
    fontSize,
    markEm: markRect.width / fontSize,
    gapEm: (textRect.left - markRect.right) / fontSize,
    widthEm: textRect.width / fontSize,
    letterCentersEm,
  };
}

/** The first-visit intro: a full-screen cover that hands off to the real header logo. */
export function Intro() {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const html = document.documentElement;
    const overlay = overlayRef.current;
    if (!overlay || !html.hasAttribute(INTRO_ATTRIBUTE)) return;

    let frameId = 0;
    let stopped = false;

    function stop() {
      stopped = true;
      cancelAnimationFrame(frameId);
      window.removeEventListener("keydown", finish);
      overlay?.removeEventListener("click", finish);
    }

    function finish() {
      stop();
      html.removeAttribute(INTRO_ATTRIBUTE);
    }

    function start(el: HTMLDivElement) {
      if (stopped) return;
      const logo = measureLogo();
      if (!logo || performance.now() > LATEST_START_MS) {
        finish();
        return;
      }

      try {
        window.localStorage.setItem(INTRO_STORAGE_KEY, "seen");
      } catch {
        // The head script only runs the intro when storage works.
      }

      const g = introGeometry({ width: html.clientWidth, height: window.innerHeight }, logo);
      el.style.setProperty("--intro-tile", `${g.tile}px`);
      el.style.setProperty("--intro-font", `${g.font}px`);
      el.style.setProperty("--intro-mark", `${g.mark}px`);

      const all = (part: string) => Array.from(el.querySelectorAll<HTMLElement>(`[data-part="${part}"]`));
      const [backdrop] = all("backdrop");
      const [world] = all("world");
      const [rightChip] = all("right-chip");
      const [leftChip] = all("left-chip");
      const [leftLabel] = all("left-label");
      const [rightLabel] = all("right-label");
      const [code] = all("code");
      const tiles = all("tile");
      const boxes = all("box");
      const letters = all("letter");
      const sparks = all("spark");

      code.style.top = `${g.codeY}px`;
      world.style.visibility = "visible";

      let startedAt: number | null = null;
      function paint(now: number) {
        startedAt ??= now;
        const t = (now - startedAt) / 1000;
        if (t >= INTRO_DURATION) {
          finish();
          return;
        }
        const frame = introFrame(t, g);
        backdrop.style.opacity = String(frame.backdropOpacity);
        world.style.transform = frame.worldTransform;
        frame.tiles.forEach((tile, index) => {
          tiles[index].style.transform = tile.transform;
          tiles[index].style.zIndex = String(tile.z);
          boxes[index].style.background = tile.fill;
          boxes[index].style.opacity = String(tile.boxOpacity);
          boxes[index].style.transform = `scale(${tile.boxScale})`;
          letters[index].style.color = tile.ink;
          letters[index].style.transform = `scale(${tile.letterScale})`;
        });
        frame.sparks.forEach((spark, index) => {
          sparks[index].style.transform = spark.transform;
          sparks[index].style.opacity = String(spark.opacity);
        });
        leftChip.style.transform = frame.leftChipTransform;
        rightChip.style.transform = frame.rightChipTransform;
        leftLabel.style.transform = frame.leftLabelTransform;
        rightLabel.style.transform = frame.rightLabelTransform;
        leftLabel.style.opacity = String(frame.labelOpacity);
        rightLabel.style.opacity = String(frame.labelOpacity);
        code.textContent = frame.code;
        code.style.opacity = String(frame.codeOpacity);
        frameId = requestAnimationFrame(paint);
      }
      frameId = requestAnimationFrame(paint);
    }

    // Any key or tap skips, which also covers the Skip button.
    window.addEventListener("keydown", finish);
    overlay.addEventListener("click", finish);

    // The landing spot depends on the real font, so give it a moment to load.
    const timeout = new Promise((resolve) => setTimeout(resolve, FONT_WAIT_MS));
    void Promise.race([document.fonts.ready, timeout]).then(() => start(overlay));

    return stop;
  }, []);

  return (
    <div ref={overlayRef} className={styles.overlay}>
      <div data-part="backdrop" className={styles.backdrop} />
      <div data-part="world" aria-hidden="true" className={styles.world}>
        {Array.from(START_WORD, (letter) => (
          <div key={letter} data-part="tile" className={styles.tile}>
            <div data-part="box" className={styles.box} />
            <div data-part="letter" className={`soft ${styles.letter}`}>
              {letter}
            </div>
          </div>
        ))}
        {Array.from({ length: SPARK_COUNT }, (_, index) => (
          <div
            key={index}
            data-part="spark"
            className={`${styles.spark} ${index % 2 ? styles.sparkRound : ""}`}
            style={{ background: SPARK_FILLS[index % SPARK_FILLS.length] }}
          />
        ))}
        <div data-part="right-chip" className={`${styles.chip} ${styles.rightChip}`}>
          ↑
        </div>
        <div data-part="left-chip" className={`${styles.chip} ${styles.leftChip}`}>
          ↑
        </div>
        <div data-part="left-label" className={styles.label}>
          l
        </div>
        <div data-part="right-label" className={styles.label}>
          r
        </div>
        <div data-part="code" className={styles.code} />
      </div>
      <button type="button" className={styles.skip}>
        Skip intro
      </button>
    </div>
  );
}
