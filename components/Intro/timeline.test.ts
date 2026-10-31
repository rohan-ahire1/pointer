import { describe, expect, it } from "vitest";
import { INTRO_DURATION, introFrame, introGeometry, START_WORD, type LogoMetrics } from "./timeline";

const LOGO: LogoMetrics = {
  markLeft: 106,
  centerY: 62,
  fontSize: 24,
  markEm: 1.25,
  gapEm: 0.4167,
  widthEm: 3.8,
  letterCentersEm: [0.36, 1.05, 1.5, 1.95, 2.5, 3.05, 3.55],
};

const VIEWPORTS = [
  { width: 1280, height: 720 },
  { width: 390, height: 844 },
];

describe("intro timeline", () => {
  it("reverses the scrambled word into pointer", () => {
    expect([...START_WORD].reverse().join("")).toBe("pointer");
  });

  it.each(VIEWPORTS)("ends with the letters in order at $width px", (viewport) => {
    const { tiles } = introFrame(INTRO_DURATION, introGeometry(viewport, LOGO));
    const word = tiles
      .map((tile, index) => ({ x: tile.x, letter: START_WORD[index] }))
      .sort((a, b) => a.x - b.x)
      .map((tile) => tile.letter)
      .join("");
    expect(word).toBe("pointer");
  });

  it.each(VIEWPORTS)("keeps the tile row and big logo on screen at $width px", (viewport) => {
    const g = introGeometry(viewport, LOGO);
    expect(g.rowLeft).toBeGreaterThanOrEqual(16);
    expect(g.logoLeft).toBeGreaterThanOrEqual(24);
  });

  it.each(VIEWPORTS)("lands the mark exactly on the header logo at $width px", (viewport) => {
    const g = introGeometry(viewport, LOGO);
    const { mark, world } = introFrame(INTRO_DURATION, g);
    const left = world.x + world.scale * (mark.x - mark.size / 2);
    const centerY = world.y + world.scale * mark.y;
    expect(left).toBeCloseTo(LOGO.markLeft);
    expect(centerY).toBeCloseTo(LOGO.centerY);
    expect(world.scale * mark.size).toBeCloseTo(LOGO.markEm * LOGO.fontSize);
  });

  it("shows the real page once it finishes", () => {
    const g = introGeometry(VIEWPORTS[0], LOGO);
    expect(introFrame(0, g).backdropOpacity).toBe(1);
    expect(introFrame(INTRO_DURATION, g).backdropOpacity).toBe(0);
  });

  it("narrates each swap in order", () => {
    const g = introGeometry(VIEWPORTS[0], LOGO);
    expect([0.2, 0.7, 1.1, 1.5, 1.8].map((t) => introFrame(t, g).code)).toEqual([
      "l = 0, r = 6",
      "swap(s[0], s[6])",
      "swap(s[1], s[5])",
      "swap(s[2], s[4])",
      "l == r, done",
    ]);
  });
});
