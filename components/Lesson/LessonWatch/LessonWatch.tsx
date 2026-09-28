"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { PatternVideo } from "@/content";
import styles from "./LessonWatch.module.css";

type LessonWatchProps = {
  video: PatternVideo;
  title: string;
};

/** A `[BRACKETED]` placeholder value Rohan hasn't supplied yet (see CLAUDE.md). */
function isPlaceholder(value: string): boolean {
  return value.startsWith("[") && value.endsWith("]");
}

function formatTimestamp(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

/**
 * The Watch section (design/mocks/C2-Pattern.dc.html #watch): the 60-second
 * explainer, captions-on-by-default, and a transcript toggle. `video.src`
 * and `video.captions` are still `[EXPLAINER VIDEO URL]` / `[VTT URL]`
 * placeholders (CLAUDE.md's placeholder list) until Rohan supplies the real
 * assets, so this renders a clearly-marked placeholder poster instead of a
 * <video> pointed at a URL that isn't real — that would either throw or
 * silently fail to load.
 */
export function LessonWatch({ video, title }: LessonWatchProps) {
  const [captions, setCaptions] = useState(true);
  const [transcriptOpen, setTranscriptOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const transcriptId = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);

  // Native <dialog>: showModal gives the focus trap, Esc-to-close and inert
  // background for free; focus returns to the Expand button on close.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (expanded && !dialog.open) dialog.showModal();
    if (!expanded && dialog.open) dialog.close();
  }, [expanded]);

  const placeholderVideo = isPlaceholder(video.src);
  const placeholderCaptions = isPlaceholder(video.captions);

  const duration = formatTimestamp(video.durationSec);
  const teaser = video.transcript[0]?.text;

  const placeholderPoster = (large: boolean) => (
    <span className={styles.poster}>
      <span className={large ? styles.playDiscLarge : styles.playDisc}>
        <PlayIcon size={large ? 40 : 28} />
      </span>
      <span className={styles.posterFooter}>
        {large && <span className={`soft ${styles.posterTitle}`}>{title}</span>}
        <span className={styles.posterBadge}>[EXPLAINER VIDEO] · {duration}</span>
      </span>
    </span>
  );

  const realVideo = (
    <video controls className={styles.video}>
      <source src={video.src} />
      {!placeholderCaptions && (
        <track kind="captions" src={video.captions} srcLang="en" label="English" default={captions} />
      )}
    </video>
  );

  return (
    <section id="watch" aria-labelledby="watch-h" className={styles.section}>
      <div className={styles.head}>
        <h2 id="watch-h" className={`soft ${styles.heading}`}>
          <span className={styles.headingIndex}>2 · </span>Watch
        </h2>
        <span aria-hidden="true" className={styles.note}>
          one minute. worth it.
        </span>
      </div>

      <div className={styles.card}>
        {placeholderVideo ? (
          <button
            type="button"
            onClick={() => setExpanded(true)}
            aria-label={`${title} — explainer video not yet available. Open larger`}
            className={styles.thumbButton}
          >
            {placeholderPoster(false)}
          </button>
        ) : (
          <div className={styles.thumb}>{realVideo}</div>
        )}

        <div className={styles.info}>
          <h3 className={`soft ${styles.title}`}>{title}</h3>
          {teaser && <p className={styles.teaser}>{teaser}</p>}

          <div className={styles.controlsRow}>
            <button type="button" onClick={() => setExpanded(true)} className={styles.expandButton}>
              <ExpandIcon />
              Expand video
            </button>
            <button
              type="button"
              onClick={() => setCaptions((c) => !c)}
              aria-pressed={captions}
              className={styles.ghostButton}
            >
              <span className={captions ? styles.ccBadgeOn : styles.ccBadge}>CC</span>
              {captions ? "Captions on" : "Captions off"}
            </button>
            <button
              type="button"
              onClick={() => setTranscriptOpen((t) => !t)}
              aria-expanded={transcriptOpen}
              aria-controls={transcriptId}
              className={styles.ghostButton}
            >
              {transcriptOpen ? "Hide transcript" : "Transcript"}
            </button>
          </div>
        </div>
      </div>

      {transcriptOpen && (
        <div id={transcriptId} className={styles.transcript}>
          {video.transcript.map((entry) => (
            <p key={entry.t} className={styles.transcriptLine}>
              <b>{formatTimestamp(entry.t)}</b> — {entry.text}
            </p>
          ))}
        </div>
      )}

      <dialog
        ref={dialogRef}
        className={styles.dialog}
        aria-label={`${title} — expanded video`}
        onClose={() => setExpanded(false)}
        onClick={(e) => {
          if (e.target === e.currentTarget) setExpanded(false);
        }}
      >
        <div className={styles.dialogInner}>
          <button type="button" onClick={() => setExpanded(false)} className={styles.closeButton}>
            Close
          </button>
          {expanded && (placeholderVideo ? placeholderPoster(true) : realVideo)}
        </div>
      </dialog>
    </section>
  );
}

function PlayIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <polygon points="7 4 20 12 7 20 7 4" />
    </svg>
  );
}

function ExpandIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="15 3 21 3 21 9" />
      <polyline points="9 21 3 21 3 15" />
      <line x1="21" y1="3" x2="14" y2="10" />
      <line x1="3" y1="21" x2="10" y2="14" />
    </svg>
  );
}
