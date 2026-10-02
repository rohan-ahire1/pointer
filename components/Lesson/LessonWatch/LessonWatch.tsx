"use client";

import dynamic from "next/dynamic";
import { useEffect, useId, useRef, useState } from "react";
import type { PatternVideo } from "@/content";
import { parseVtt, type Cue } from "./animation/captions";
import styles from "./LessonWatch.module.css";

// The explainer runs live as code (Remotion's <Player>), loaded only when
// someone presses play so the lesson page stays light.
const ExplainerPlayer = dynamic(() => import("./animation/ExplainerPlayer"), {
  ssr: false,
  loading: () => <span className={styles.loading}>Loading animation…</span>,
});

type LessonWatchProps = {
  video: PatternVideo;
  title: string;
  slug: string;
};

function formatTimestamp(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

/**
 * The Watch section (design/mocks/C2-Pattern.dc.html #watch): the 60-second
 * explainer, captions-on-by-default, and a transcript toggle. The explainer is
 * not a video file: it is the lesson's animation code running in the browser
 * (animation/), drawn from the same traces as the visualizer. Captions are an
 * overlay fed by the small .vtt file in public/video/.
 */
export function LessonWatch({ video, title, slug }: LessonWatchProps) {
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

  const duration = formatTimestamp(video.durationSec);
  const teaser = video.transcript[0]?.text;

  const stage = (large: boolean) => (
    <ExplainerStage
      slug={slug}
      title={title}
      poster={video.poster}
      captionsUrl={video.captions}
      showCaptions={captions}
      duration={duration}
      large={large}
      startPlaying={large}
    />
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
        <div className={styles.thumb}>{!expanded && stage(false)}</div>

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
          {expanded && stage(true)}
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

type ExplainerStageProps = {
  slug: string;
  title: string;
  poster?: string;
  captionsUrl: string;
  showCaptions: boolean;
  duration: string;
  large: boolean;
  startPlaying: boolean;
};

/** Poster with a play button; pressing it mounts the live animation. */
function ExplainerStage({ slug, title, poster, captionsUrl, showCaptions, duration, large, startPlaying }: ExplainerStageProps) {
  const [started, setStarted] = useState(startPlaying);
  const [cues, setCues] = useState<Cue[]>([]);
  const [time, setTime] = useState(0);

  useEffect(() => {
    if (!started) return;
    let cancelled = false;
    fetch(captionsUrl)
      .then((r) => (r.ok ? r.text() : ""))
      .then((text) => {
        if (!cancelled) setCues(parseVtt(text));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [started, captionsUrl]);

  if (!started) {
    return (
      <button
        type="button"
        onClick={() => setStarted(true)}
        aria-label={`Play ${title}`}
        className={styles.thumbButton}
      >
        <span className={styles.poster}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {poster && <img src={poster} alt="" className={styles.posterImage} />}
          <span className={large ? styles.playDiscLarge : styles.playDisc}>
            <PlayIcon size={large ? 40 : 28} />
          </span>
          <span className={styles.posterFooter}>
            <span className={styles.posterBadge}>{duration}</span>
          </span>
        </span>
      </button>
    );
  }

  const cue = showCaptions ? cues.find((c) => time >= c.start && time < c.end) : undefined;
  return (
    <div className={styles.player}>
      <ExplainerPlayer slug={slug} onTime={setTime} autoPlay />
      <div aria-live="off" className={styles.captionLayer}>
        {cue && <span className={styles.caption}>{cue.text}</span>}
      </div>
    </div>
  );
}
