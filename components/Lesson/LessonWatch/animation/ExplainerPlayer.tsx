"use client";

import { Player } from "@remotion/player";
import type { PlayerRef } from "@remotion/player";
import { useEffect, useRef, type ComponentType } from "react";
import { DURATION_SEC, FPS, SlidingWindow } from "./SlidingWindow";
import { PatternVideo } from "./PatternVideo";

type ExplainerPlayerProps = {
  slug: string;
  autoPlay?: boolean;
  /** Called with the current time in seconds as the animation plays. */
  onTime?: (seconds: number) => void;
};

const Sliding = SlidingWindow as ComponentType<Record<string, unknown>>;
const Generic = PatternVideo as ComponentType<Record<string, unknown>>;

/**
 * The 60-second explainer, run live in the browser by Remotion's <Player>
 * instead of played from an MP4. 1920×1080 scales to the container width.
 */
export default function ExplainerPlayer({ slug, autoPlay, onTime }: ExplainerPlayerProps) {
  const playerRef = useRef<PlayerRef>(null);
  useEffect(() => {
    const player = playerRef.current;
    if (!player || !onTime) return;
    const onFrame = (e: { detail: { frame: number } }) => onTime(e.detail.frame / FPS);
    player.addEventListener("frameupdate", onFrame);
    return () => player.removeEventListener("frameupdate", onFrame);
  }, [onTime]);
  const isSliding = slug === "sliding-window";
  return (
    <Player
      ref={playerRef}
      component={isSliding ? Sliding : Generic}
      inputProps={isSliding ? {} : { slug }}
      durationInFrames={FPS * DURATION_SEC}
      fps={FPS}
      compositionWidth={1920}
      compositionHeight={1080}
      controls
      autoPlay={autoPlay}
      clickToPlay
      acknowledgeRemotionLicense
      style={{ width: "100%", aspectRatio: "16 / 9" }}
    />
  );
}
