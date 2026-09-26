import type { Metadata } from "next";
import type { ReactNode } from "react";
import { DM_Mono, DM_Sans, Unbounded } from "next/font/google";
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
            flash of the wrong theme. See lib/theme-script.ts. */}
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
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
