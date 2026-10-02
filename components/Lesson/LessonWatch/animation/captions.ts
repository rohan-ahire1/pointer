export type Cue = { start: number; end: number; text: string };

function seconds(stamp: string): number {
  const parts = stamp.split(":").map(Number);
  return parts.reduce((total, part) => total * 60 + part, 0);
}

/** Parses the small WebVTT files in public/video (one cue per block). */
export function parseVtt(source: string): Cue[] {
  return source
    .replace(/\r/g, "")
    .split(/\n\n+/)
    .flatMap((block) => {
      const lines = block.trim().split("\n");
      const timing = lines.findIndex((line) => line.includes("-->"));
      if (timing === -1) return [];
      const [start, end] = lines[timing].split("-->").map((part) => seconds(part.trim().split(" ")[0]));
      return [{ start, end, text: lines.slice(timing + 1).join(" ") }];
    });
}
