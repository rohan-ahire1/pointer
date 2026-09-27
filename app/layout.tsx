import type { Metadata } from "next";
import type { ReactNode } from "react";
import { DM_Mono, DM_Sans, Unbounded } from "next/font/google";
import Script from "next/script";
import "@/styles/tokens.css";
import "@/styles/globals.css";
import { THEME_INIT_SCRIPT } from "@/lib/theme-script";
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

export const metadata: Metadata = {
  title: "Pointer — algorithms you can watch move",
  description:
    "Every interview pattern, explained with a one-minute animation and a visualizer you can poke, pause and step through.",
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
            next/script with strategy="beforeInteractive" is Next's
            supported way to inject a blocking script that runs before
            hydration — the right tool for this, and it's what's used here.

            Known remaining dev-only warning: visiting a route that calls
            notFound() (e.g. /patterns/nope) still logs "Encountered a
            script tag while rendering React component" in the console.
            This was confirmed NOT to be about raw <script> vs next/script,
            nor about <head> vs <body> placement — every combination of
            those was tried and each still warns; removing the script
            entirely is the only thing that silences it. Next's App Router
            re-renders the whole root layout (this component) as part of
            swapping in the root app/not-found.tsx boundary, and that
            re-render is what trips React's "don't client-render a script
            tag" check on this element, no matter where it lives, in
            Next.js 16.3.6 (the latest stable release — there is no newer
            patch to try). The two real fixes both cost more than this
            warning is worth: reading the theme from a cookie server-side
            (removes the need for any script, but calling cookies() in this
            root layout would make the whole static site dynamic-render on
            every request) or the experimental app/global-not-found.tsx
            convention (sidesteps the shared-boundary re-render, but
            replaces this entire layout with a separate, hand-duplicated
            <html>/<body> shell just for the 404 case, behind an unstable
            experimental flag). Given it's dev-only console noise — no
            visible flash, no effect on the production build, nothing else
            broken — this is left as a known issue rather than trading away
            static rendering or adopting an experimental API for it. See
            the CLAUDE.md instruction to ask before large structural
            decisions, and the step 6 report's "open questions". */}
        <Script id="theme-init" strategy="beforeInteractive" dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body>
        <SkipLink />
        <SiteHeader />
        <main id="main">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
