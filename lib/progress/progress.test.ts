import { beforeEach, describe, expect, it, vi } from "vitest";
import { EMPTY_PROGRESS, mergeProgress, validateProgress, type Progress } from "./types";
import { readStoredProgress, writeStoredProgress } from "./storage";
import { addDays, bumpActivity, currentStreak, dueReviews, newCard, nextCard } from "./review";
import {
  exportProgress,
  importProgress,
  recordDrillRound,
  resetProgress,
  reviewProblem,
  setLessonSection,
  toggleSolved,
} from "./store";

function throwingStorage() {
  return {
    getItem: vi.fn(() => {
      throw new Error("storage blocked");
    }),
    setItem: vi.fn(() => {
      throw new Error("storage blocked");
    }),
  };
}

function memoryStorage() {
  const store = new Map<string, string>();
  return {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => {
      store.set(key, value);
    },
    store,
  };
}

const VALID: Progress = {
  version: 1,
  solved: { "two-sum": true },
  lessons: { "sliding-window": { lastSection: "try", updatedAt: "2026-01-01T00:00:00.000Z" } },
};

describe("validateProgress", () => {
  it("accepts a well-formed progress object", () => {
    const result = validateProgress(VALID);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value).toEqual(VALID);
  });

  it("accepts the empty progress shape", () => {
    expect(validateProgress(EMPTY_PROGRESS).ok).toBe(true);
  });

  it("rejects a non-object", () => {
    const result = validateProgress("not an object");
    expect(result.ok).toBe(false);
  });

  it("rejects null", () => {
    expect(validateProgress(null).ok).toBe(false);
  });

  it("rejects an array", () => {
    expect(validateProgress([1, 2, 3]).ok).toBe(false);
  });

  it("rejects the wrong version", () => {
    const result = validateProgress({ ...VALID, version: 2 });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toMatch(/version/i);
  });

  it("rejects solved values that aren't true", () => {
    const result = validateProgress({ ...VALID, solved: { "two-sum": "yes" } });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toMatch(/solved/);
  });

  it("rejects solved as a non-object", () => {
    expect(validateProgress({ ...VALID, solved: ["two-sum"] }).ok).toBe(false);
  });

  it("rejects an invalid lastSection", () => {
    const result = validateProgress({
      ...VALID,
      lessons: { "sliding-window": { lastSection: "nope", updatedAt: "2026-01-01T00:00:00.000Z" } },
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toMatch(/lastSection/);
  });

  it("rejects a malformed updatedAt", () => {
    const result = validateProgress({
      ...VALID,
      lessons: { "sliding-window": { lastSection: "try", updatedAt: "not-a-date" } },
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toMatch(/updatedAt/);
  });

  it("rejects lessons as a non-object", () => {
    expect(validateProgress({ ...VALID, lessons: "nope" }).ok).toBe(false);
  });
});

describe("mergeProgress", () => {
  it("unions solved problems from both sides", () => {
    const base: Progress = { version: 1, solved: { a: true }, lessons: {} };
    const incoming: Progress = { version: 1, solved: { b: true }, lessons: {} };
    expect(mergeProgress(base, incoming).solved).toEqual({ a: true, b: true });
  });

  it("never un-solves a problem the base already had solved", () => {
    const base: Progress = { version: 1, solved: { a: true }, lessons: {} };
    const incoming: Progress = { version: 1, solved: {}, lessons: {} };
    expect(mergeProgress(base, incoming).solved).toEqual({ a: true });
  });

  it("keeps the more recently updated lesson section per pattern", () => {
    const base: Progress = {
      version: 1,
      solved: {},
      lessons: { "sliding-window": { lastSection: "idea", updatedAt: "2026-01-01T00:00:00.000Z" } },
    };
    const incoming: Progress = {
      version: 1,
      solved: {},
      lessons: { "sliding-window": { lastSection: "solve", updatedAt: "2026-01-02T00:00:00.000Z" } },
    };
    expect(mergeProgress(base, incoming).lessons["sliding-window"].lastSection).toBe("solve");
  });

  it("keeps the base's lesson section when it is newer than the incoming one", () => {
    const base: Progress = {
      version: 1,
      solved: {},
      lessons: { "sliding-window": { lastSection: "solve", updatedAt: "2026-01-05T00:00:00.000Z" } },
    };
    const incoming: Progress = {
      version: 1,
      solved: {},
      lessons: { "sliding-window": { lastSection: "idea", updatedAt: "2026-01-01T00:00:00.000Z" } },
    };
    expect(mergeProgress(base, incoming).lessons["sliding-window"].lastSection).toBe("solve");
  });

  it("adds lesson entries that only exist on one side", () => {
    const base: Progress = { version: 1, solved: {}, lessons: {} };
    const incoming: Progress = {
      version: 1,
      solved: {},
      lessons: { stack: { lastSection: "watch", updatedAt: "2026-01-01T00:00:00.000Z" } },
    };
    expect(mergeProgress(base, incoming).lessons.stack).toEqual(incoming.lessons.stack);
  });
});

describe("readStoredProgress / writeStoredProgress (storage blocked)", () => {
  it("readStoredProgress returns null when getItem throws", () => {
    expect(readStoredProgress(throwingStorage())).toBeNull();
  });

  it("readStoredProgress returns null when nothing is stored", () => {
    expect(readStoredProgress(memoryStorage())).toBeNull();
  });

  it("readStoredProgress returns null for invalid JSON", () => {
    const storage = memoryStorage();
    storage.store.set("pointer:v1", "{not json");
    expect(readStoredProgress(storage)).toBeNull();
  });

  it("readStoredProgress returns null for a validly-parsed but structurally wrong value", () => {
    const storage = memoryStorage();
    storage.store.set("pointer:v1", JSON.stringify({ version: 2 }));
    expect(readStoredProgress(storage)).toBeNull();
  });

  it("readStoredProgress round-trips a value written by writeStoredProgress", () => {
    const storage = memoryStorage();
    writeStoredProgress(VALID, storage);
    expect(readStoredProgress(storage)).toEqual(VALID);
  });

  it("writeStoredProgress does not throw when setItem throws", () => {
    expect(() => writeStoredProgress(VALID, throwingStorage())).not.toThrow();
  });
});

describe("progress store (mutators)", () => {
  beforeEach(() => {
    window.localStorage.clear();
    resetProgress();
  });

  it("toggleSolved marks a problem solved, then un-solves it", () => {
    toggleSolved("two-sum");
    expect(exportProgress()).toContain('"two-sum": true');
    toggleSolved("two-sum");
    expect(JSON.parse(exportProgress()).solved).toEqual({});
  });

  it("setLessonSection records the section and an ISO timestamp", () => {
    setLessonSection("sliding-window", "watch");
    const progress = JSON.parse(exportProgress());
    expect(progress.lessons["sliding-window"].lastSection).toBe("watch");
    expect(Number.isNaN(Date.parse(progress.lessons["sliding-window"].updatedAt))).toBe(false);
  });

  it("resetProgress clears solved problems and lesson positions", () => {
    toggleSolved("two-sum");
    setLessonSection("sliding-window", "solve");
    resetProgress();
    expect(JSON.parse(exportProgress())).toEqual(EMPTY_PROGRESS);
  });

  it("importProgress rejects invalid JSON and leaves existing progress untouched", () => {
    toggleSolved("two-sum");
    const result = importProgress("{not json");
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBeTruthy();
    expect(JSON.parse(exportProgress()).solved).toEqual({ "two-sum": true });
  });

  it("importProgress rejects structurally invalid progress", () => {
    const result = importProgress(JSON.stringify({ version: 1, solved: { a: "nope" }, lessons: {} }));
    expect(result.ok).toBe(false);
  });

  it("importProgress merges into (not replaces) existing progress", () => {
    toggleSolved("two-sum");
    const incoming: Progress = { version: 1, solved: { "valid-anagram": true }, lessons: {} };
    const result = importProgress(JSON.stringify(incoming));
    expect(result.ok).toBe(true);
    const progress = JSON.parse(exportProgress());
    expect(progress.solved).toEqual({ "two-sum": true, "valid-anagram": true });
  });

  it("keeps working (in-memory) when localStorage.setItem throws", () => {
    const spy = vi.spyOn(window.localStorage.__proto__, "setItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    expect(() => toggleSolved("two-sum")).not.toThrow();
    expect(JSON.parse(exportProgress()).solved).toEqual({ "two-sum": true });
    spy.mockRestore();
  });
});

describe("spaced review", () => {
  const TODAY = "2026-10-30";

  beforeEach(() => {
    resetProgress();
  });

  it("schedules a new card for tomorrow and walks up the boxes", () => {
    expect(newCard(TODAY)).toEqual({ box: 0, due: "2026-10-31" });
    const first = nextCard({ box: 0, due: TODAY }, true, TODAY);
    expect(first).toEqual({ box: 1, due: "2026-11-02" });
    expect(nextCard({ box: 5, due: TODAY }, true, TODAY).box).toBe(5);
  });

  it("sends a forgotten problem back to tomorrow", () => {
    expect(nextCard({ box: 4, due: TODAY }, false, TODAY)).toEqual({ box: 0, due: "2026-10-31" });
  });

  it("crosses month and year ends", () => {
    expect(addDays("2026-12-31", 1)).toBe("2027-01-01");
    expect(addDays("2027-03-01", -1)).toBe("2027-02-28");
  });

  it("lists due problems, counting old solves with no card as due", () => {
    const progress: Progress = {
      ...EMPTY_PROGRESS,
      solved: { old: true, due: true, later: true },
      reviews: { due: { box: 1, due: "2026-10-29" }, later: { box: 2, due: "2026-11-05" } },
    };
    expect(dueReviews(progress, TODAY)).toEqual(["old", "due"]);
  });

  it("adds a card on solve and drops it on unsolve", () => {
    toggleSolved("two-sum");
    expect(JSON.parse(exportProgress()).reviews["two-sum"].box).toBe(0);
    toggleSolved("two-sum");
    expect(JSON.parse(exportProgress()).reviews["two-sum"]).toBeUndefined();
  });

  it("stores a review answer and counts it as practice", () => {
    toggleSolved("two-sum");
    reviewProblem("two-sum", true);
    const stored = JSON.parse(exportProgress());
    expect(stored.reviews["two-sum"].box).toBe(1);
    expect(Object.values(stored.activity)).toEqual([2]);
  });

  it("keeps the best drill score", () => {
    recordDrillRound(7);
    recordDrillRound(4);
    expect(JSON.parse(exportProgress()).drillBest).toBe(7);
  });

  it("counts a streak, and today not done yet doesn't break it", () => {
    expect(currentStreak(undefined, TODAY)).toBe(0);
    expect(currentStreak({ "2026-10-29": 1, "2026-10-28": 3 }, TODAY)).toBe(2);
    expect(currentStreak({ "2026-10-30": 1, "2026-10-29": 1 }, TODAY)).toBe(2);
    expect(currentStreak({ "2026-10-27": 1 }, TODAY)).toBe(0);
  });

  it("forgets activity too old to show", () => {
    expect(bumpActivity({ "2020-01-01": 5 }, TODAY)).toEqual({ [TODAY]: 1 });
  });

  it("merges review data from an import", () => {
    const merged = mergeProgress(
      { ...EMPTY_PROGRESS, reviews: { a: { box: 1, due: "2026-11-01" } }, activity: { [TODAY]: 1 }, drillBest: 4 },
      { ...EMPTY_PROGRESS, reviews: { a: { box: 3, due: "2026-11-09" } }, activity: { [TODAY]: 3 }, drillBest: 9 },
    );
    expect(merged.reviews?.a.box).toBe(3);
    expect(merged.activity?.[TODAY]).toBe(3);
    expect(merged.drillBest).toBe(9);
  });

  it("rejects malformed review data but accepts exports without it", () => {
    expect(validateProgress({ ...VALID, reviews: { a: { box: "1", due: "2026-11-01" } } }).ok).toBe(false);
    expect(validateProgress({ ...VALID, activity: { yesterday: 1 } }).ok).toBe(false);
    expect(validateProgress({ ...VALID, drillBest: "ten" }).ok).toBe(false);
    expect(validateProgress(VALID).ok).toBe(true);
  });
});
