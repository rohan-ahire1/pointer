import { ImageResponse } from "next/og";
import { COLOR, loadFonts } from "@/lib/og";

export const dynamic = "force-static";

export const runtime = "nodejs";
export const alt = "Pointer — algorithms you can watch move";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** OG image, 1200x630 (design/mocks/C2-OG.dc.html): the same "watch move" headline as the home hero, with a still frame of the Sliding Window visualizer. */
export default async function OpengraphImage() {
  const fonts = await loadFonts();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
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
            left: 460,
            width: 220,
            height: 220,
            borderRadius: 48,
            background: COLOR.blob2,
            opacity: 0.35,
            transform: "rotate(18deg)",
          }}
        />

        <div style={{ display: "flex", flexDirection: "column", gap: 26, width: 640, position: "relative" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              fontFamily: fonts.some((f) => f.name === "Unbounded") ? "Unbounded" : "sans-serif",
              fontWeight: 800,
              fontSize: 30,
              letterSpacing: -1,
            }}
          >
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

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              fontFamily: fonts.some((f) => f.name === "Unbounded") ? "Unbounded" : "sans-serif",
              fontWeight: 800,
              fontSize: 64,
              lineHeight: 1,
            }}
          >
            <span style={{ marginRight: 18 }}>Algorithms you can</span>
            <span
              style={{
                background: COLOR.yellow,
                color: COLOR.onAccent,
                padding: "0 10px",
                borderRadius: 12,
              }}
            >
              watch move.
            </span>
          </div>

          <div style={{ display: "flex", fontSize: 24, color: COLOR.muted }}>
            15 interview patterns · animated explainers · free
          </div>
          <div
            style={{
              display: "flex",
              fontFamily: fonts.some((f) => f.name === "DM Mono") ? "DM Mono" : "monospace",
              fontSize: 20,
              fontWeight: 500,
            }}
          >
            pointer.rohanahire.com
          </div>
        </div>

        <div
          style={{
            position: "absolute",
            right: 70,
            top: 170,
            display: "flex",
            padding: "26px 22px",
            background: COLOR.card,
            border: `3px solid ${COLOR.line}`,
            borderRadius: 28,
            boxShadow: `8px 8px 0 ${COLOR.shadow}`,
            transform: "rotate(3deg)",
          }}
        >
          <div style={{ display: "flex", gap: 8, position: "relative" }}>
            <div
              style={{
                position: "absolute",
                left: 54,
                top: -8,
                width: 124,
                height: 82,
                borderRadius: 18,
                border: `3px solid ${COLOR.line}`,
                background: COLOR.tintYellow,
              }}
            />
            {["a", "b", "c", "a"].map((letter, index) => {
              const active = index === 3;
              return (
                <div
                  key={index}
                  style={{
                    position: "relative",
                    width: 52,
                    height: 64,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: 14,
                    fontFamily: "DM Mono",
                    fontSize: 26,
                    background: active ? COLOR.orange : COLOR.card,
                    color: active ? COLOR.onAccent : COLOR.ink,
                    border: `2px ${index === 0 ? "dashed" : "solid"} ${index === 0 ? COLOR.pastLine : COLOR.line}`,
                    // Satori (next/og's renderer) rejects `transform: none` /
                    // `undefined` outright — the property has to be left out
                    // entirely for the non-active tiles rather than set to a
                    // no-op value.
                    ...(active ? { transform: "translateY(-10px) rotate(5deg)" } : {}),
                  }}
                >
                  {letter}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: fonts.length > 0 ? fonts : undefined,
    },
  );
}
