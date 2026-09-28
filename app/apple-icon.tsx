import { ImageResponse } from "next/og";

export const dynamic = "force-static";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/**
 * Apple touch icon (iOS home-screen bookmarks want a raster PNG, not the
 * SVG used for app/icon.svg): the same orange-square mark as the Logo
 * component and favicon, rendered full-bleed since iOS applies its own
 * rounded-square mask. Colours are hard-coded brand hex (see the comment in
 * app/opengraph-image.tsx) — Satori/ImageResponse has no access to the
 * page's CSS custom properties. No custom font is loaded: there's no text,
 * just the arrow glyph drawn with SVG paths, so next/og's bundled default
 * font is never exercised.
 */
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#FF8B42",
        }}
      >
        <svg width="104" height="104" viewBox="0 0 32 32" fill="none">
          <path
            d="M16 25V9.5M16 9.5L9 16.5M16 9.5L23 16.5"
            stroke="#231F3A"
            strokeWidth="3.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    ),
    { ...size },
  );
}
