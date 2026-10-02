#!/usr/bin/env node
// Writes public/video/<slug>.vtt from the transcripts in content/patterns.json, so the
// captions always say exactly what the transcript says. Each transcript beat is split into
// sentences, timed by length, and ends just before the next beat starts.
//
//   node scripts/build-captions.mjs

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const patterns = JSON.parse(readFileSync(join(root, "content/patterns.json"), "utf8"));

const stamp = (sec) => {
  const ms = Math.round(sec * 1000);
  const m = Math.floor(ms / 60000);
  const s = ((ms % 60000) / 1000).toFixed(3).padStart(6, "0");
  return `${String(m).padStart(2, "0")}:${s}`;
};

// Split after . ? ! when the next sentence starts (a capital, a digit or an opening quote).
const sentences = (text) => text.split(/(?<=[.?!])\s+(?=[A-Z0-9“‘"'])/).filter(Boolean);

for (const p of patterns) {
  if (!p.video?.transcript || !p.video.captions) continue;
  const beats = p.video.transcript;
  const duration = p.video.durationSec ?? 60;
  const cues = [];
  beats.forEach((beat, i) => {
    const start = beat.t;
    const end = (i + 1 < beats.length ? beats[i + 1].t : duration) - 0.3;
    const parts = sentences(beat.text);
    const total = parts.reduce((n, s) => n + s.length, 0);
    let t = start;
    parts.forEach((s, k) => {
      const next = k === parts.length - 1 ? end : t + ((end - start) * s.length) / total;
      cues.push(`${stamp(t)} --> ${stamp(next)}\n${s}`);
      t = next;
    });
  });
  const file = join(root, "public", p.video.captions.replace(/^\//, ""));
  writeFileSync(file, `WEBVTT\n\n${cues.join("\n\n")}\n`);
  console.log(`${p.slug}: ${cues.length} cues`);
}
