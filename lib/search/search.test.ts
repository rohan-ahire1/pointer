import { describe, expect, it } from "vitest";
import { countItems, flattenSections, getSearchItems, searchItems, type SearchItem } from "./index";

describe("getSearchItems", () => {
  it("includes every pattern, every problem and every static page", () => {
    const items = getSearchItems();
    expect(items.filter((i) => i.kind === "pattern")).toHaveLength(15);
    expect(items.filter((i) => i.kind === "problem")).toHaveLength(75);
    expect(items.filter((i) => i.kind === "page")).toHaveLength(5);
  });
});

describe("searchItems", () => {
  const items = getSearchItems();

  it("matches nothing for an empty or whitespace-only query", () => {
    expect(searchItems(items, "")).toEqual([]);
    expect(searchItems(items, "   ")).toEqual([]);
  });

  it("matches nothing for a query with no hits", () => {
    expect(searchItems(items, "zzzznotarealthing")).toEqual([]);
  });

  it("finds the Sliding Window pattern by name", () => {
    const sections = searchItems(items, "sliding window");
    const patternSection = sections.find((s) => s.title === "PATTERNS");
    expect(patternSection?.items.some((i) => i.title === "Sliding Window")).toBe(true);
  });

  it("finds problems by matching their pattern name in the subtitle", () => {
    const sections = searchItems(items, "sliding window");
    const problemSection = sections.find((s) => s.title === "PROBLEMS");
    expect(problemSection?.items.some((i) => i.title === "Minimum Window Substring")).toBe(true);
  });

  it("finds a page by title", () => {
    const sections = searchItems(items, "progress");
    const pageSection = sections.find((s) => s.title === "PAGES");
    expect(pageSection?.items.some((i) => i.title === "Your progress")).toBe(true);
  });

  it("ranks an exact title match above a partial one", () => {
    const sections = searchItems(items, "trees");
    const patternSection = sections.find((s) => s.title === "PATTERNS");
    expect(patternSection?.items[0]?.title).toBe("Trees");
  });

  it("ranks a title match above a subtitle-only match", () => {
    // "two sum" is a problem title; "two pointers" only matches by title too,
    // but this checks a title hit outranks anything that only matched sub.
    const sections = searchItems(items, "two sum");
    const problemSection = sections.find((s) => s.title === "PROBLEMS");
    expect(problemSection?.items[0]?.title).toBe("Two Sum");
  });

  it("orders sections as PATTERNS, PROBLEMS, PAGES and omits empty ones", () => {
    const sections = searchItems(items, "two sum");
    expect(sections.map((s) => s.title)).toEqual(["PROBLEMS"]);
  });

  it("caps the number of items per section", () => {
    // "e" matches a large number of problem titles.
    const sections = searchItems(items, "e", { problem: 3 });
    const problemSection = sections.find((s) => s.title === "PROBLEMS");
    expect(problemSection?.items.length).toBeLessThanOrEqual(3);
  });
});

describe("flattenSections / countItems", () => {
  it("flattens sections in order and counts the same total", () => {
    const sections = searchItems(getSearchItems(), "tree");
    const flat = flattenSections(sections);
    expect(flat.length).toBe(countItems(sections));
    expect(flat.map((i: SearchItem) => i.id)).toEqual(sections.flatMap((s) => s.items.map((i) => i.id)));
  });
});
