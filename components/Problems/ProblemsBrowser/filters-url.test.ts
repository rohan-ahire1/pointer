import { describe, expect, it } from "vitest";
import { DEFAULT_FILTERS, filtersToSearch, readFilters } from "./filters-url";

describe("filters-url", () => {
  it("reads all three filters", () => {
    expect(readFilters("?q=window&difficulty=hard&status=todo")).toEqual({
      query: "window",
      difficulty: "hard",
      status: "todo",
    });
  });

  it("falls back to the defaults for an empty or missing query string", () => {
    expect(readFilters("")).toEqual(DEFAULT_FILTERS);
    expect(readFilters("?other=1")).toEqual(DEFAULT_FILTERS);
  });

  it("ignores invalid values", () => {
    expect(readFilters("?difficulty=extreme&status=maybe")).toEqual(DEFAULT_FILTERS);
    expect(readFilters("?difficulty=extreme&status=done")).toEqual({
      ...DEFAULT_FILTERS,
      status: "done",
    });
  });

  it("leaves default values out of the URL", () => {
    expect(filtersToSearch(DEFAULT_FILTERS)).toBe("");
    expect(filtersToSearch({ ...DEFAULT_FILTERS, difficulty: "hard" })).toBe("?difficulty=hard");
  });

  it("round-trips", () => {
    const filters = {
      query: "two sum & more",
      difficulty: "medium",
      status: "done",
    } as const;
    expect(readFilters(filtersToSearch(filters))).toEqual(filters);
    expect(readFilters(filtersToSearch(DEFAULT_FILTERS))).toEqual(DEFAULT_FILTERS);
  });

  it("keeps unrelated params and replaces old filter params", () => {
    expect(filtersToSearch({ ...DEFAULT_FILTERS, status: "todo" }, "?utm=x&difficulty=hard")).toBe(
      "?utm=x&status=todo",
    );
  });
});
