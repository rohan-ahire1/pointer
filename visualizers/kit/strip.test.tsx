import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { cellsPerRow, MIN_READABLE_CELL, Strip } from "./Strip";

describe("Strip rows", () => {
  it("keeps one row when every cell fits at a readable size", () => {
    expect(cellsPerRow(13, 642, 8)).toBe(13);
    expect(cellsPerRow(5, 236, 5)).toBe(5);
  });

  it("wraps long strips on phones into even rows of readable cells", () => {
    // Minimum Window's 13 letters in a 360px phone's 276px column.
    expect(cellsPerRow(13, 276, 5)).toBe(7);
    // Koko's 30 speeds in a 320px phone's 236px column.
    const perRow = cellsPerRow(30, 236, 5);
    expect(perRow * MIN_READABLE_CELL + (perRow - 1) * 5).toBeLessThanOrEqual(236);
    expect(Math.ceil(30 / perRow) * perRow - 30).toBeLessThan(Math.ceil(30 / perRow));
  });

  it("splits the capsule across the rows it covers", () => {
    const items = Array.from({ length: 10 }, (_, i) => ({ key: i, value: i }));
    const { container } = render(<Strip items={items} capsule={{ start: 2, end: 7 }} />);
    // jsdom has no layout, so it stays one row with one capsule.
    expect(container.querySelectorAll("[data-fit]")).toHaveLength(1);
    expect(container.querySelector("[style*='--span']")?.getAttribute("style")).toContain("--span: 6");
  });
});
