import { describe, expect, it } from "vitest";
import { code } from "./code";
import { meta } from "./meta";
import { parseInput } from "./parseInput";
import { trace } from "./trace";
import type { IslandsInput } from "./types";

/** mulberry32: a tiny seeded PRNG (no dependency) for the property tests. */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Independent brute force: recursive DFS flood fill counting components. */
function bruteForce(grid: boolean[][]): number {
  const seen = grid.map((row) => row.map(() => false));
  const flood = (r: number, c: number): void => {
    if (r < 0 || r >= grid.length || c < 0 || c >= grid[0].length) return;
    if (!grid[r][c] || seen[r][c]) return;
    seen[r][c] = true;
    flood(r + 1, c);
    flood(r - 1, c);
    flood(r, c + 1);
    flood(r, c - 1);
  };
  let count = 0;
  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[0].length; c++) {
      if (grid[r][c] && !seen[r][c]) {
        count++;
        flood(r, c);
      }
    }
  }
  return count;
}

function mustParse(raw: string): IslandsInput {
  const parsed = parseInput(raw);
  if ("error" in parsed) throw new Error(`preset should parse: "${raw}"`);
  return parsed;
}

describe("number-of-islands presets", () => {
  it.each([
    ["11000 11000 00100 00011", 3, 12],
    ["11110 11010 11000 00000", 1, 12],
    ["101 010 101", 5, 12],
  ])("%s -> %i islands over %i steps", (preset, expected, expectedStepCount) => {
    expect(meta.presets).toContain(preset);
    const steps = trace(mustParse(preset));
    expect(steps).toHaveLength(expectedStepCount);
    expect(steps.length).toBeLessThanOrEqual(60);
    expect(steps[steps.length - 1].state.islands).toBe(expected);
  });
});

describe("number-of-islands trace shape", () => {
  const inputs = [...meta.presets, "1", "000 000"];

  it("is deterministic", () => {
    for (const preset of inputs) {
      expect(trace(mustParse(preset))).toEqual(trace(mustParse(preset)));
    }
  });

  it("every step's lines are valid indices into code", () => {
    for (const preset of inputs) {
      for (const step of trace(mustParse(preset))) {
        expect(step.lines.length).toBeGreaterThan(0);
        for (const line of step.lines) {
          expect(line, `line ${line} for "${preset}"`).toBeGreaterThanOrEqual(0);
          expect(line, `line ${line} for "${preset}"`).toBeLessThan(code.length);
        }
      }
    }
  });

  it("every note is non-empty and at most 110 chars, every sr is non-empty", () => {
    for (const preset of inputs) {
      for (const step of trace(mustParse(preset))) {
        expect(step.note.length, `note for "${preset}"`).toBeGreaterThan(0);
        expect(step.note.length, `note "${step.note}"`).toBeLessThanOrEqual(110);
        expect(step.sr.length, `sr for "${preset}"`).toBeGreaterThan(0);
      }
    }
  });

  it("first step is setup, last step starts with Done.", () => {
    for (const preset of inputs) {
      const steps = trace(mustParse(preset));
      expect(steps[0].state.phase).toBe("setup");
      expect(steps[0].state.islands).toBe(0);
      expect(steps[0].state.queue).toEqual([]);
      expect(steps[steps.length - 1].state.phase).toBe("done");
      expect(steps[steps.length - 1].note.startsWith("Done.")).toBe(true);
    }
  });

  it("admits when the scan skipped cells to reach new land", () => {
    const notes = trace(mustParse("11000 11000 00100 00011")).map((step) => step.note);
    expect(notes[1]).toBe("New land at row 0, col 0 that nobody has claimed. That’s island 1.");
    expect(notes).toContain(
      "Scanning… New land at row 2, col 2 that nobody has claimed. That’s island 2.",
    );
  });

  it("claims every land cell exactly once", () => {
    for (const preset of inputs) {
      const input = mustParse(preset);
      const last = trace(input)[trace(input).length - 1].state;
      for (let r = 0; r < input.length; r++) {
        for (let c = 0; c < input[0].length; c++) {
          if (input[r][c]) {
            expect(last.owner[r][c]).not.toBeNull();
          } else {
            expect(last.owner[r][c]).toBeNull();
          }
        }
      }
      expect(last.queue).toEqual([]);
      expect(last.current).toBeNull();
    }
  });
});

describe("number-of-islands property test", () => {
  it("matches brute force and stays within the step budget on 300 inputs", () => {
    const rand = mulberry32(20261111);
    const int = (min: number, max: number): number =>
      min + Math.floor(rand() * (max - min + 1));
    for (let k = 0; k < 300; k++) {
      const rows = int(1, 5);
      const cols = int(1, 6);
      // Sparse grids make many small islands; dense ones make few big ones.
      const density = [0.2, 0.4, 0.6, 0.8][int(0, 3)];
      const grid = Array.from({ length: rows }, () =>
        Array.from({ length: cols }, () => rand() < density),
      );
      const steps = trace(grid);
      expect(steps.length, `steps for ${JSON.stringify(grid)}`).toBeLessThanOrEqual(150);
      for (const step of steps) {
        expect(step.note.length).toBeLessThanOrEqual(110);
        expect(step.sr.length).toBeGreaterThan(0);
      }
      expect(steps[steps.length - 1].state.islands, `islands for ${JSON.stringify(grid)}`).toBe(
        bruteForce(grid),
      );
    }
  });
});

describe("number-of-islands parseInput", () => {
  it("parses the presets", () => {
    expect(parseInput("10,01")).toEqual([
      [true, false],
      [false, true],
    ]);
    expect(parseInput(",,,")).toHaveProperty("error");
    expect(parseInput("11000 11000 00100 00011")).toEqual([
      [true, true, false, false, false],
      [true, true, false, false, false],
      [false, false, true, false, false],
      [false, false, false, true, true],
    ]);
    expect(parseInput("101 010 101")).toEqual([
      [true, false, true],
      [false, true, false],
      [true, false, true],
    ]);
  });

  it("accepts extra spacing", () => {
    expect(parseInput("  101   010  ")).toEqual([
      [true, false, true],
      [false, true, false],
    ]);
  });

  it.each([
    ["", "1–5 rows of 1s and 0s"],
    ["1 1 1 1 1 1", "1–5 rows"],
    ["102", "1s and 0s"],
    ["1a0", "1s and 0s"],
    ["1111111", "up to 6 wide"],
    ["111 11", "same length"],
    ["1 01", "same length"],
  ])("%s is rejected with copy saying what is allowed", (raw, hint) => {
    const result = parseInput(raw);
    expect("error" in result).toBe(true);
    if ("error" in result) expect(result.error).toContain(hint);
  });
});
