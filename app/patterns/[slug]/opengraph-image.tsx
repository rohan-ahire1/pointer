import { ImageResponse } from "next/og";
import { getPattern, getPatterns } from "@/content";
import { COLOR, loadFonts } from "@/lib/og";
import { padPatternNumber } from "@/lib/pattern-nav";

export const dynamic = "force-static";

export const runtime = "nodejs";
export const alt = "A Pointer lesson on one coding interview pattern";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return getPatterns().map((pattern) => ({ slug: pattern.slug }));
}

/** Share card for one lesson: same paper and logo as the home card, with the pattern as the headline. */
export default async function LessonOpengraphImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const pattern = getPattern(slug);
  const fonts = await loadFonts();
  const display = fonts.some((f) => f.name === "Unbounded") ? "Unbounded" : "sans-serif";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          position: "relative",
          padding: "64px 72px",
          background: COLOR.paper,
          color: COLOR.ink,
          fontFamily: fonts.some((f) => f.name === "DM Sans") ? "DM Sans" : "sans-serif",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -60,
            right: -40,
            width: 300,
            height: 300,
            borderRadius: 150,
            background: COLOR.blob1,
            opacity: 0.4,
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -70,
            right: 240,
            width: 220,
            height: 220,
            borderRadius: 48,
            background: COLOR.blob2,
            opacity: 0.35,
            transform: "rotate(18deg)",
          }}
        />

        <div style={{ display: "flex", alignItems: "center", fontFamily: display, fontWeight: 800, fontSize: 30 }}>
          <span
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 40,
              height: 40,
              marginRight: 10,
              borderRadius: 10,
              background: COLOR.orange,
              color: COLOR.onAccent,
              border: `2px solid ${COLOR.line}`,
              fontFamily: "DM Sans",
              fontSize: 20,
              fontWeight: 700,
            }}
          >
            ↑
          </span>
          pointer
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24, width: 980, position: "relative" }}>
          <div
            style={{
              display: "flex",
              alignSelf: "flex-start",
              padding: "6px 14px",
              background: COLOR.yellow,
              color: COLOR.onAccent,
              border: `2px solid ${COLOR.line}`,
              borderRadius: 12,
              fontSize: 24,
              fontWeight: 500,
            }}
          >
            Lesson {padPatternNumber(pattern?.number ?? 0)} of 15
          </div>
          <div style={{ display: "flex", fontFamily: display, fontWeight: 800, fontSize: 76, lineHeight: 1.05 }}>
            {pattern?.name ?? "Pointer"}
          </div>
          <div style={{ display: "flex", fontSize: 30, lineHeight: 1.35, color: COLOR.muted }}>{pattern?.idea}</div>
        </div>

        <div style={{ display: "flex", fontFamily: "DM Mono", fontSize: 20, fontWeight: 500 }}>
          pointer.rohanahire.com
        </div>
      </div>
    ),
    { ...size, fonts: fonts.length > 0 ? fonts : undefined },
  );
}
