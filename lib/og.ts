/**
 * Brand colours, hard-coded (design/mocks/C2-OG.dc.html + the light theme
 * in styles/tokens.css). `next/og`'s ImageResponse renders through Satori,
 * which doesn't see the page's stylesheets or CSS custom properties, so
 * `var(--token)` isn't available here — this is the one place in the
 * codebase (per CLAUDE.md's "only var(--token) colours" rule) allowed to
 * use raw hex, and only because of that constraint. Keep these in sync
 * with styles/tokens.css's `:root` (light theme) block by hand.
 */
export const COLOR = {
  paper: "#FFF6EA",
  ink: "#231F3A",
  line: "#231F3A",
  shadow: "#231F3A",
  card: "#FFFFFF",
  muted: "#5A5570",
  faint: "#6E6983",
  onAccent: "#231F3A",
  yellow: "#FFD45C",
  orange: "#FF8B42",
  tintYellow: "#FFF1C7",
  pastLine: "#B3ADC2",
  blob1: "#B7A4F4",
  blob2: "#6FD3AE",
} as const;

const FONT_SOURCES = [
  {
    name: "Unbounded",
    weight: 800 as const,
    url: "https://fonts.gstatic.com/s/unbounded/v12/Yq6F-LOTXCb04q32xlpat-6uR42XTqtG65j2040.ttf",
  },
  {
    name: "DM Sans",
    weight: 500 as const,
    url: "https://fonts.gstatic.com/s/dmsans/v17/rP2tp2ywxg089UriI5-g4vlH9VoD8CmcqZG40F9JadbnoEwAopxhTg.ttf",
  },
  {
    name: "DM Mono",
    weight: 500 as const,
    url: "https://fonts.gstatic.com/s/dmmono/v16/aFTR7PB1QTsUX8KYvumzIYQ.ttf",
  },
];

/**
 * Fetches the three brand font files from Google Fonts' static CDN at
 * build/request time. `next/font/google` (used by the rest of the app)
 * can't be used inside an ImageResponse — Satori needs the raw font
 * bytes up front — so this fetches the same families directly instead.
 *
 * Offline requirement (CLAUDE.md step 7): `npm run build` calls this once
 * per static OG image. If there's no network at build time (e.g. a fully
 * offline CI cache-restore build), each fetch below rejects and is caught
 * here — the image still renders, just with Satori's default sans-serif
 * instead of the brand fonts, rather than failing the build. On a normal
 * build (network available, as in this environment) the real fonts load.
 */
async function fetchFonts() {
  const results = await Promise.allSettled(
    FONT_SOURCES.map(async (font) => {
      const response = await fetch(font.url);
      if (!response.ok) throw new Error(`Font fetch failed: ${font.name} (${response.status})`);
      return {
        name: font.name,
        weight: font.weight,
        style: "normal" as const,
        data: await response.arrayBuffer(),
      };
    }),
  );

  return results.flatMap((result) => (result.status === "fulfilled" ? [result.value] : []));
}

let fonts: ReturnType<typeof fetchFonts> | undefined;

/** Fetched once however many images a build renders: there's one per lesson. */
export function loadFonts() {
  fonts ??= fetchFonts();
  return fonts;
}
