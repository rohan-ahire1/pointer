import { describe, expect, it } from "vitest";
import { list, q, qq } from "./format";
import { heapIndexToPos, heapPosition, LEVEL_GAP, tidyLayout } from "./svg/treeLayout";

describe("format", () => {
  it("quotes characters and strings the way the narration does", () => {
    expect(q("a")).toBe("‘a’");
    expect(qq("abc")).toBe("“abc”");
    expect(list([1, 2, 3])).toBe("[1, 2, 3]");
    expect(list([])).toBe("[]");
  });
});

describe("heapPosition", () => {
  it("centres the root and spreads each level evenly", () => {
    expect(heapPosition(1, 400).x).toBe(200);
    expect(heapPosition(2, 400).x).toBe(100);
    expect(heapPosition(3, 400).x).toBe(300);
    expect(heapPosition(3, 400).y - heapPosition(1, 400).y).toBe(LEVEL_GAP);
    expect(heapPosition(4, 400).x).toBe(50);
  });

  it("maps array heap indices to heap positions", () => {
    expect(heapIndexToPos(0)).toBe(1);
    expect(heapIndexToPos(2)).toBe(3);
  });
});

describe("tidyLayout", () => {
  it("gives leaves consecutive slots and centres parents over their children", () => {
    const { positions, slots, levels } = tidyLayout(
      [
        { id: 0, parent: null },
        { id: 1, parent: 0 },
        { id: 2, parent: 0 },
        { id: 3, parent: 1 },
        { id: 4, parent: 1 },
      ],
      10,
    );
    expect(slots).toBe(3);
    expect(levels).toBe(3);
    expect(positions.get(3)!.x).toBe(5);
    expect(positions.get(4)!.x).toBe(15);
    expect(positions.get(1)!.x).toBe(10);
    expect(positions.get(2)!.x).toBe(25);
    expect(positions.get(0)!.x).toBe(17.5);
  });

  it("handles an empty tree", () => {
    expect(tidyLayout([], 10)).toEqual({ positions: new Map(), slots: 0, levels: 0 });
  });
});
