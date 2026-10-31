/**
 * The intro as a pure function of time: `introFrame(t, geometry)` says where
 * everything is at `t` seconds, and Intro.tsx paints it. Two pointers reverse
 * "retniop" into "pointer", merge, and land as the header logo.
 */

export const INTRO_DURATION = 3.8;
export const START_WORD = "retniop";
export const SPARK_COUNT = 10;

/** Swap windows, in seconds, for the pairs (0, 6), (1, 5) and (2, 4). */
const SWAPS = [
  { start: 0.55, length: 0.4, active: 0.5 },
  { start: 1.02, length: 0.3, active: 0.98 },
  { start: 1.38, length: 0.24, active: 1.33 },
];
/** Each pointer's hop to the next index: [start, length]. */
const HOPS = [
  [0.95, 0.12],
  [1.3, 0.11],
  [1.6, 0.12],
];
const POINTERS_MEET = 1.72;
const FLY_START = 1.92;
const FLY_LENGTH = 0.4;
const COLLAPSE_START = 2.02;
const COLLAPSE_LENGTH = 0.36;
const EXIT_START = 3.05;
const EXIT_LENGTH = 0.5;
const BACKDROP_FADE_START = 3.2;
const BACKDROP_FADE_LENGTH = 0.4;

const TILE_TILT = [-6, 4, -3, 5, -4, 6, -5];
const TILE_DRIFT = [0.09, -0.07, 0.05, -0.1, 0.07, -0.05, 0.1];

/** The real header logo, measured in the page. Sizes in em of its font. */
export type LogoMetrics = {
  markLeft: number;
  centerY: number;
  fontSize: number;
  markEm: number;
  gapEm: number;
  widthEm: number;
  letterCentersEm: number[];
};

export type IntroGeometry = ReturnType<typeof introGeometry>;

export function introGeometry(viewport: { width: number; height: number }, logo: LogoMetrics) {
  const tile = Math.min(112, (viewport.width - 32) / 7.75);
  const gap = tile / 8;
  const logoEm = logo.markEm + logo.gapEm + logo.widthEm;
  const font = Math.min(112, (viewport.width - 48) / logoEm);
  const mark = font * logo.markEm;
  const centerY = viewport.height * 0.42;
  const chip = Math.max(30, tile * 0.5);
  const chipY = centerY + tile / 2 + chip / 2 + tile * 0.2;
  const logoLeft = (viewport.width - font * logoEm) / 2;
  return {
    tile,
    gap,
    font,
    mark,
    chip,
    centerY,
    chipY,
    logoLeft,
    textLeft: logoLeft + mark + font * logo.gapEm,
    rowLeft: (viewport.width - (7 * tile + 6 * gap)) / 2,
    codeY: chipY + chip / 2 + Math.max(34, tile * 0.45),
    logo,
  };
}

const clamp = (value: number) => Math.min(1, Math.max(0, value));
const lerp = (from: number, to: number, progress: number) => from + (to - from) * progress;
const easeInOut = (p: number) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);
const easeOut = (p: number) => 1 - Math.pow(1 - p, 3);
/** Overshoots slightly before settling on 1. */
const easeBack = (p: number) => 1 + 2.7 * Math.pow(p - 1, 3) + 1.7 * Math.pow(p - 1, 2);
const blend = (to: string, from: string, progress: number) =>
  `color-mix(in srgb, ${to} ${Math.round(progress * 100)}%, ${from})`;
const place = (x: number, y: number, size: number) => `translate(${x - size / 2}px, ${y - size / 2}px)`;

function tileFrame(index: number, t: number, g: IntroGeometry) {
  const slotX = (slot: number) => g.rowLeft + g.tile / 2 + slot * (g.tile + g.gap);
  const finalSlot = 6 - index;
  const swap = SWAPS[Math.min(index, finalSlot)];
  const settledAt = swap ? swap.start + swap.length - 0.06 : POINTERS_MEET - 0.02;
  const activeAt = swap ? swap.active : POINTERS_MEET - 0.06;

  const swapped = swap ? easeInOut(clamp((t - swap.start) / swap.length)) : 0;
  const arc = Math.sin(Math.PI * swapped);
  const goesOver = index < 3;
  const swapY = goesOver ? -arc * g.tile * 0.95 : arc * g.tile * 0.7;
  const drop = (1 - easeBack(clamp((t - 0.04 * index) / 0.34))) * -(g.centerY + g.tile);
  const mess = 1 - easeOut(clamp((t - settledAt) / 0.18));

  const collapse = clamp((t - (COLLAPSE_START + 0.045 * finalSlot)) / COLLAPSE_LENGTH);
  const collapsed = easeBack(collapse);
  const x = lerp(lerp(slotX(index), slotX(finalSlot), swapped), g.textLeft + g.logo.letterCentersEm[finalSlot] * g.font, collapsed);
  const y = lerp(g.centerY + drop + swapY + TILE_DRIFT[index] * g.tile * mess, g.centerY, collapsed);

  const yellow = clamp((t - activeAt) / 0.08);
  const mint = clamp((t - settledAt) / 0.1);
  return {
    x,
    y,
    transform: `${place(x, y, g.tile)} rotate(${TILE_TILT[index] * mess}deg) scale(${1 + 0.08 * arc})`,
    z: arc > 0 ? (goesOver ? 12 : 8) : 5,
    fill: mint > 0 ? blend("var(--mint)", "var(--yellow)", mint) : blend("var(--yellow)", "var(--card)", yellow),
    ink:
      collapse > 0
        ? blend("var(--ink)", "var(--on-accent)", clamp(collapse / 0.5))
        : blend("var(--on-accent)", "var(--ink)", yellow),
    boxOpacity: 1 - clamp(collapse / 0.55),
    boxScale: lerp(1, 0.4, easeInOut(collapse)),
    letterScale: lerp((g.tile * 0.58) / g.font, 1, collapsed),
  };
}

function codeLine(t: number) {
  if (t >= POINTERS_MEET - 0.06) return "l == r, done";
  if (t >= SWAPS[2].start) return "swap(s[2], s[4])";
  if (t >= SWAPS[1].start) return "swap(s[1], s[5])";
  if (t >= SWAPS[0].start) return "swap(s[0], s[6])";
  return "l = 0, r = 6";
}

export function introFrame(t: number, g: IntroGeometry) {
  const slotX = (slot: number) => g.rowLeft + g.tile / 2 + slot * (g.tile + g.gap);

  let step = 0;
  let hop = 0;
  for (const [start, length] of HOPS) {
    const progress = clamp((t - start) / length);
    step += easeInOut(progress);
    hop = Math.max(hop, Math.sin(Math.PI * progress));
  }
  const leftX = slotX(step);
  const rightX = slotX(6 - step);
  const chipY = g.chipY - hop * g.chip * 0.6;
  const pop = t < 0.38 ? 0 : easeBack(clamp((t - 0.38) / 0.16));

  // The left pointer survives the merge and flies up to become the logo mark.
  const merge = Math.sin(Math.PI * clamp((t - POINTERS_MEET) / 0.22));
  const fly = clamp((t - FLY_START) / FLY_LENGTH);
  const flown = easeInOut(fly);
  const land = Math.sin(Math.PI * clamp((t - (FLY_START + FLY_LENGTH)) / 0.2));
  const markX = lerp(leftX, g.logoLeft + g.mark / 2, flown);
  const markY = lerp(chipY, g.centerY, fly * fly * fly);
  const markSize = lerp(g.chip, g.mark, flown);
  const markScale = (markSize / g.mark) * pop * (1 + 0.45 * merge) * (1 + 0.1 * land);
  const rightScale = (g.chip / g.mark) * pop * (1 - clamp((t - (POINTERS_MEET - 0.02)) / 0.06));

  const sparkProgress = clamp((t - POINTERS_MEET) / 0.42);
  const sparks = Array.from({ length: SPARK_COUNT }, (_, index) => {
    const angle = ((index * 36 + 18) * Math.PI) / 180;
    const reach = g.tile * (index % 2 ? 1.1 : 1.6) * easeOut(sparkProgress);
    const x = slotX(3) + Math.cos(angle) * reach;
    const y = g.chipY + Math.sin(angle) * reach;
    return {
      transform: `translate(${x}px, ${y}px) rotate(${240 * sparkProgress}deg)`,
      opacity: sparkProgress > 0 && sparkProgress < 1 ? 1 - sparkProgress * sparkProgress : 0,
    };
  });

  const exit = easeInOut(clamp((t - EXIT_START) / EXIT_LENGTH));
  const headerScale = g.logo.fontSize / g.font;
  const world = {
    scale: lerp(1, headerScale, exit),
    x: lerp(0, g.logo.markLeft - headerScale * g.logoLeft, exit),
    y: lerp(0, g.logo.centerY - headerScale * g.centerY, exit),
  };

  return {
    tiles: Array.from(START_WORD, (_, index) => tileFrame(index, t, g)),
    mark: { x: markX, y: markY, size: markScale * g.mark },
    leftChipTransform: `${place(markX, markY, g.mark)} rotate(${-360 * flown}deg) scale(${markScale})`,
    rightChipTransform: `${place(rightX, chipY, g.mark)} scale(${rightScale})`,
    leftLabelTransform: `translate(${leftX}px, ${chipY + g.chip / 2 + 4}px) translateX(-50%)`,
    rightLabelTransform: `translate(${rightX}px, ${chipY + g.chip / 2 + 4}px) translateX(-50%)`,
    labelOpacity: clamp((t - 0.42) / 0.1) * (1 - clamp((t - (POINTERS_MEET - 0.06)) / 0.08)),
    sparks,
    code: codeLine(t),
    codeOpacity: clamp((t - 0.45) / 0.12) * (1 - clamp((t - 1.9) / 0.14)),
    world,
    worldTransform: `translate(${world.x}px, ${world.y}px) scale(${world.scale})`,
    backdropOpacity: 1 - clamp((t - BACKDROP_FADE_START) / BACKDROP_FADE_LENGTH),
  };
}
