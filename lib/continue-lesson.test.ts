import { describe, expect, it, vi } from "vitest";
import type { Progress } from "@/lib/progress";
import { getContinueLesson } from "./continue-lesson";

// A fixture non-live pattern served through the real content module, so the
// fallback case below never depends on real data still being "soon" (every
// pattern is live now, and may stay that way).
vi.mock("@/content", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/content")>();
  return {
    ...actual,
    getPattern: (slug: string) => {
      if (slug === "fixture-soon-pattern") {
        return {
          number: 99,
          slug: "fixture-soon-pattern",
          name: "Fixture",
          group: "foundations",
          idea: "A fixture that stays soon forever.",
          status: "soon",
          problems: [],
        } as const;
      }
      return actual.getPattern(slug);
    },
  };
});

const BASE: Progress = { version: 1, solved: {}, lessons: {} };

describe("getContinueLesson", () => {
  it("returns undefined when there is no lesson progress", () => {
    expect(getContinueLesson(BASE)).toBeUndefined();
  });

  it("picks the sliding-window lesson recorded in progress", () => {
    const progress: Progress = {
      ...BASE,
      lessons: { "sliding-window": { lastSection: "try", updatedAt: "2026-01-01T00:00:00.000Z" } },
    };
    const result = getContinueLesson(progress);
    expect(result?.pattern.slug).toBe("sliding-window");
    expect(result?.section).toBe("try");
    expect(result?.sectionIndex).toBe(3);
    expect(result?.sectionLabel).toBe("Try it");
  });

  it("counts solved problems for the pattern and finds the next unsolved one", () => {
    const progress: Progress = {
      version: 1,
      solved: { "best-time-to-buy-and-sell-stock": true },
      lessons: { "sliding-window": { lastSection: "solve", updatedAt: "2026-01-01T00:00:00.000Z" } },
    };
    const result = getContinueLesson(progress);
    expect(result?.done).toBe(1);
    expect(result?.total).toBeGreaterThan(1);
    expect(result?.nextProblem?.slug).not.toBe("best-time-to-buy-and-sell-stock");
  });

  it("has no nextProblem once every problem is solved", () => {
    const progress: Progress = {
      version: 1,
      solved: {
        "best-time-to-buy-and-sell-stock": true,
        "longest-substring-without-repeating-characters": true,
        "longest-repeating-character-replacement": true,
        "minimum-window-substring": true,
      },
      lessons: { "sliding-window": { lastSection: "solve", updatedAt: "2026-01-01T00:00:00.000Z" } },
    };
    const result = getContinueLesson(progress);
    expect(result?.nextProblem).toBeUndefined();
  });

  it("falls back to the next-most-recent entry when the newest one isn't a live pattern", () => {
    const progress: Progress = {
      ...BASE,
      lessons: {
        "sliding-window": { lastSection: "idea", updatedAt: "2026-01-01T00:00:00.000Z" },
        "fixture-soon-pattern": { lastSection: "watch", updatedAt: "2026-01-05T00:00:00.000Z" },
      },
    };
    // "fixture-soon-pattern" is more recent, but it isn't a live pattern
    // (it's "soon"), so it can't resolve to a real lesson — the older, live
    // entry still wins.
    const result = getContinueLesson(progress);
    expect(result?.pattern.slug).toBe("sliding-window");
    expect(result?.section).toBe("idea");
  });

  it("ignores an entry for a pattern slug that no longer exists", () => {
    const progress: Progress = {
      ...BASE,
      lessons: { "not-a-real-pattern": { lastSection: "idea", updatedAt: "2026-01-01T00:00:00.000Z" } },
    };
    expect(getContinueLesson(progress)).toBeUndefined();
  });
});
