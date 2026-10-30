import type { MetadataRoute } from "next";
import { getPatterns } from "@/content";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-static";

const STATIC_ROUTES: readonly { path: string; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"]; priority: number }[] = [
  { path: "/", changeFrequency: "weekly", priority: 1 },
  { path: "/patterns", changeFrequency: "weekly", priority: 0.9 },
  { path: "/problems", changeFrequency: "weekly", priority: 0.8 },
  { path: "/drill", changeFrequency: "monthly", priority: 0.7 },
  { path: "/cheatsheet", changeFrequency: "monthly", priority: 0.7 },
  { path: "/progress", changeFrequency: "monthly", priority: 0.3 },
  { path: "/about", changeFrequency: "monthly", priority: 0.5 },
];

/** All static routes plus the 15 pattern lesson pages (live or "coming soon" — every pattern gets a static route per CLAUDE.md). */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: `${SITE_URL}${route.path}`,
    lastModified: now,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  const patternEntries: MetadataRoute.Sitemap = getPatterns().map((pattern) => ({
    url: `${SITE_URL}/patterns/${pattern.slug}`,
    lastModified: now,
    changeFrequency: pattern.status === "live" ? "monthly" : "weekly",
    priority: pattern.status === "live" ? 0.7 : 0.4,
  }));

  return [...staticEntries, ...patternEntries];
}
