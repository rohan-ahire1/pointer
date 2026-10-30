import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { DM_Mono, DM_Sans, Unbounded } from "next/font/google";
import Script from "next/script";
import "@/styles/tokens.css";
import "@/styles/globals.css";
import { THEME_INIT_SCRIPT } from "@/lib/theme-script";
import { SITE_URL } from "@/lib/site";
import { SiteHeader } from "@/components/SiteHeader/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter/SiteFooter";
import { SkipLink } from "@/components/SkipLink/SkipLink";

const unbounded = Unbounded({
  weight: "800",
  subsets: ["latin"],
  variable: "--font-unbounded",
  display: "swap",
});

const dmSans = DM_Sans({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

const dmMono = DM_Mono({
  weight: ["400", "500"],
  subsets: ["latin"],
  variable: "--font-dm-mono",
  display: "swap",
});

const DESCRIPTION =
  "Every interview pattern, explained with a one-minute animation and a visualizer you can poke, pause and step through.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Pointer — algorithms you can watch move",
    template: "%s · Pointer",
  },
  description: DESCRIPTION,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: "/",
    siteName: "Pointer",
    title: "Pointer — algorithms you can watch move",
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: "Pointer — algorithms you can watch move",
    description: DESCRIPTION,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Light/dark values match styles/tokens.css's `--paper` in each theme.
  // `<meta name="theme-color">` is plain HTML, not CSS, so it can't read
  // the custom property directly (same constraint noted in
  // opengraph-image.tsx and manifest.ts) — kept in sync by hand.
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FFF6EA" },
    { media: "(prefers-color-scheme: dark)", color: "#1A1728" },
  ],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`${unbounded.variable} ${dmSans.variable} ${dmMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Applies a manual theme choice before first paint, so there's no
            flash of the wrong theme. See lib/theme-script.ts.
            This has to be a plain <script>. next/script's beforeInteractive
            only queues the code for Next's runtime, which loads after the
            first paint, so a reader with a dark system and a light choice
            would see dark and then every card fading to light.

            Known dev-only warning: a route that calls notFound() logs
            "Encountered a script tag while rendering React component",
            because Next re-renders this layout on the client for the 404
            boundary. The script has already run by then, so nothing breaks.
            Silencing it would mean reading the theme from a cookie (which
            makes the static site render per request) or the experimental
            app/global-not-found.tsx, and neither is worth it. */}
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body>
        <SkipLink />
        <SiteHeader />
        <main id="main">{children}</main>
        <SiteFooter />
        {/* Cloudflare Web Analytics */}
        <Script src="https://static.cloudflareinsights.com/beacon.min.js" strategy="afterInteractive" data-cf-beacon='{"token": "cc42599ca7f040a59b75be0a42cc5a02"}' />
      </body>
    </html>
  );
}
