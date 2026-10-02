import {interpolate, random, spring, useCurrentFrame} from 'remotion';
import type {ReactNode} from 'react';

export const FPS = 30;
export const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

/** Read a design token (tokens.css) at render time so JS can blend colours. */
const memo = new Map<string, string>();
export const tok = (name: string): string => {
  let v = memo.get(name);
  if (!v) {
    v = getComputedStyle(document.documentElement).getPropertyValue(name).trim() || '#000';
    memo.set(name, v);
  }
  return v;
};

export const lerp = (a: number, b: number, p: number) => a + (b - a) * p;

type SpringKind = 'snappy' | 'bouncy' | 'soft';
const CFG: Record<SpringKind, {damping: number; stiffness: number; mass: number}> = {
  snappy: {damping: 16, stiffness: 170, mass: 0.7},
  bouncy: {damping: 9, stiffness: 150, mass: 0.7},
  soft: {damping: 20, stiffness: 80, mass: 1},
};

/** Spring that starts at `startSec`; overshoots for 'bouncy'. */
export const useSpr = () => {
  const frame = useCurrentFrame();
  return (startSec: number, kind: SpringKind = 'snappy') =>
    frame < startSec * FPS ? 0 : spring({frame: frame - startSec * FPS, fps: FPS, config: CFG[kind]});
};

/** Headline: words rise in one by one; `*word*` gets a highlighter wipe. */
export const Headline = ({text, a, b, top = 130}: {text: string; a: number; b: number; top?: number}) => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const spr = useSpr();
  if (t < a - 0.05 || t > b) return null;
  const words: {w: string; hl: boolean}[] = [];
  text.split('*').forEach((part, i) =>
    part.split(' ').filter(Boolean).forEach((w, j) => {
      // trailing punctuation sticks to the word before it
      if (j === 0 && /^[.,!?]/.test(w) && words.length) words[words.length - 1].w += w;
      else words.push({w, hl: i % 2 === 1});
    }),
  );
  const chars = text.replace(/\*/g, '').length;
  const size = Math.min(68, 1700 / (chars * 0.7));
  const out = interpolate(t, [b - 0.4, b], [1, 0], clamp);
  return (
    <div
      style={{
        position: 'absolute', top, left: 0, right: 0, display: 'flex', justifyContent: 'center', flexWrap: 'wrap',
        gap: `0 ${size * 0.1}px`, fontFamily: 'var(--font-display)', fontWeight: 800, letterSpacing: '-0.03em',
        fontSize: size, color: 'var(--ink)', opacity: out, transform: `translateY(${(1 - out) * -14}px)`,
      }}
    >
      {words.map((x, i) => {
        const s = spr(a + i * 0.07, 'snappy');
        const wipe = spr(a + i * 0.07 + 0.25, 'soft');
        return (
          <span
            key={i}
            style={{
              display: 'inline-block', opacity: Math.min(1, s * 1.4), transform: `translateY(${(1 - s) * 34}px)`,
              padding: '0 14px', margin: x.hl ? '0 4px' : 0, borderRadius: 14,
              background: x.hl ? 'linear-gradient(var(--hl), var(--hl)) no-repeat left center' : undefined,
              backgroundSize: x.hl ? `${Math.max(0, wipe) * 100}% 100%` : undefined,
            }}
          >
            {x.w}
          </span>
        );
      })}
    </div>
  );
};

/** Drifting background blobs + wordmark. */
export const Backdrop = ({t, children}: {t: number; children?: ReactNode}) => (
  <>
    <div style={{position: 'absolute', width: 760, height: 760, borderRadius: '50%', background: 'var(--blob1)', opacity: 0.35, left: -240 + Math.sin(t * 0.35) * 50, top: -280 + Math.cos(t * 0.3) * 40, filter: 'blur(44px)'}} />
    <div style={{position: 'absolute', width: 680, height: 680, borderRadius: '50%', background: 'var(--blob2)', opacity: 0.3, right: -220 + Math.cos(t * 0.3) * 50, bottom: -280 + Math.sin(t * 0.4) * 40, filter: 'blur(44px)'}} />
    <div style={{position: 'absolute', width: 380, height: 380, borderRadius: '50%', background: 'var(--yellow)', opacity: 0.16, right: 260 + Math.sin(t * 0.5) * 40, top: -120 + Math.cos(t * 0.45) * 30, filter: 'blur(40px)'}} />
    <div style={{position: 'absolute', top: 48, left: 64, fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 30, letterSpacing: '-0.03em'}}>
      pointer<span style={{color: 'var(--orange)'}}>.</span>
    </div>
    {children}
  </>
);

/** Four little progress pills along the bottom, one per transcript beat. */
export const BeatBar = ({t}: {t: number}) => {
  const beats = [0, 15, 32, 48, 60];
  return (
    <div style={{position: 'absolute', bottom: 38, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 12}}>
      {[0, 1, 2, 3].map((i) => {
        const f = interpolate(t, [beats[i], beats[i + 1]], [0, 1], clamp);
        const active = t >= beats[i] && t < beats[i + 1];
        return (
          <div key={i} style={{width: 120, height: 10, borderRadius: 6, border: '2px solid var(--line)', background: 'var(--card)', overflow: 'hidden', opacity: active ? 1 : 0.55}}>
            <div style={{width: `${f * 100}%`, height: '100%', background: 'var(--orange)'}} />
          </div>
        );
      })}
    </div>
  );
};

/** Deterministic confetti burst. */
export const Confetti = ({t, start, x, y, count = 70, seed = 'c'}: {t: number; start: number; x: number; y: number; count?: number; seed?: string}) => {
  const tau = t - start;
  if (tau < 0 || tau > 2.6) return null;
  const colors = ['--yellow', '--mint', '--orange', '--lilac', '--peach', '--sky'].map(tok);
  return (
    <>
      {Array.from({length: count}).map((_, i) => {
        const ang = -Math.PI * (0.08 + 0.84 * random(`${seed}a${i}`));
        const sp = 520 + 760 * random(`${seed}s${i}`);
        const px = x + Math.cos(ang) * sp * tau;
        const py = y + Math.sin(ang) * sp * tau + 0.5 * 1900 * tau * tau;
        const size = 10 + 12 * random(`${seed}z${i}`);
        const rot = (random(`${seed}r${i}`) - 0.5) * 900 * tau;
        const round = random(`${seed}o${i}`) > 0.55;
        return (
          <div
            key={i}
            style={{
              position: 'absolute', left: px, top: py, width: size, height: round ? size : size * 0.55,
              borderRadius: round ? '50%' : 3, background: colors[i % colors.length],
              border: '2px solid var(--line)', opacity: interpolate(tau, [1.6, 2.6], [1, 0], clamp),
              transform: `rotate(${rot}deg)`,
            }}
          />
        );
      })}
    </>
  );
};

export const Card = ({children, tint = 'var(--card)', style}: {children: ReactNode; tint?: string; style?: React.CSSProperties}) => (
  <div style={{padding: '20px 34px', borderRadius: 26, border: '3px solid var(--line)', background: tint, boxShadow: 'var(--shadow-md)', fontFamily: 'var(--font-body)', fontWeight: 500, fontSize: 34, lineHeight: 1.35, ...style}}>
    {children}
  </div>
);
