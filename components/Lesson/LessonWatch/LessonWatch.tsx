"use client";

import { useId, useState } from "react";
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
  const transcriptId = useId();

  const placeholderVideo = isPlaceholder(video.src);
  const placeholderCaptions = isPlaceholder(video.captions);

  return (
    <section id="watch" aria-labelledby="watch-h" className={styles.section}>
      <div className={styles.eyebrowCol}>
        <h2 id="watch-h" className={`soft ${styles.heading}`}>
          <span className={styles.headingIndex}>2 · </span>Watch
        </h2>
        <span aria-hidden="true" className={styles.eyebrow}>
          one minute.
          <br />
          worth it.
        </span>
      </div>

      <div className={styles.videoCol}>
        <div className={styles.frame}>
          {placeholderVideo ? (
            <div className={styles.placeholder} role="img" aria-label={`${title} — explainer video not yet available`}>
              <button type="button" disabled aria-hidden="true" className={styles.playButton}>
                <PlayIcon />
              </button>
              <div className={styles.placeholderFooter}>
                <span className={`soft ${styles.videoTitle}`}>{title}</span>
                <span className={styles.placeholderBadge}>[EXPLAINER VIDEO] · {formatTimestamp(video.durationSec)}</span>
              </div>
            </div>
          ) : (
            <video controls className={styles.video}>
              <source src={video.src} />
              {!placeholderCaptions && (
                <track kind="captions" src={video.captions} srcLang="en" label="English" default={captions} />
              )}
            </video>
          )}
        </div>

        <div className={styles.controlsRow}>
          <button
            type="button"
            onClick={() => setCaptions((c) => !c)}
            aria-pressed={captions}
            className={captions ? styles.ccButtonActive : styles.ccButton}
          >
            <span className={styles.ccBadge}>CC</span>
            {captions ? "Captions on" : "Captions off"}
          </button>
          <button
            type="button"
            onClick={() => setTranscriptOpen((t) => !t)}
            aria-expanded={transcriptOpen}
            aria-controls={transcriptId}
            className={styles.transcriptButton}
          >
            {transcriptOpen ? "Hide transcript" : "Read the transcript"}
          </button>
          <span className={styles.hint}>No sound? Captions are on by default.</span>
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
      </div>
    </section>
  );
}

function PlayIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <polygon points="7 4 20 12 7 20 7 4" />
    </svg>
  );
}
