import type { MetadataRoute } from "next";

/**
 * Colours are hard-coded brand hex, matching styles/tokens.css's light
 * theme (`--paper` / `--orange`) — a web manifest is plain JSON with no
 * access to CSS custom properties, same constraint as opengraph-image.tsx.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Pointer — algorithms you can watch move",
    short_name: "Pointer",
    description:
      "Every interview pattern, explained with a one-minute animation and a visualizer you can poke, pause and step through.",
    start_url: "/",
    display: "standalone",
    background_color: "#FFF6EA",
    theme_color: "#FF8B42",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
