import {AbsoluteFill, interpolate, spring, useCurrentFrame} from 'remotion';
import type {CSSProperties, ReactNode} from 'react';
import {Backdrop, BeatBar, Card, Confetti, FPS, Headline, clamp, lerp, tok} from './motion';

export const display = 'var(--font-display)';
export const body = 'var(--font-body)';
export const mono = 'var(--font-mono)';

export type Step = {note: string; state: any}; // eslint-disable-line @typescript-eslint/no-explicit-any
const SNAPPY = {damping: 16, stiffness: 170, mass: 0.7};
const BOUNCY = {damping: 9, stiffness: 150, mass: 0.7};
const SOFT = {damping: 20, stiffness: 80, mass: 1};

/** Everything a stage needs to draw the current moment of a trace. */
export type Run = {
  t: number;
  steps: Step[];
  k: number; // current step
  prev: number; // step before it
  p: number; // 0..1 (snappy spring) since the step began: blend prev -> cur
  pb: number; // bouncy version (overshoots)
  ps: number; // soft version
  s: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  o: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  T: (i: number) => number;
  /** blend a prev->cur number */
  mix: (a: number, b: number) => number;
  /** spring (bouncy|snappy|soft) since step `i` began; for entities that first show up at step i. Step 0 pops in during the intro. */
  born: (i: number, kind?: 'bouncy' | 'snappy' | 'soft') => number;
  /** staggered intro pop for item `i` of `n` (0..1), done by ~4s */
  pop: (i: number, n?: number) => number;
  /** idle bob (px) while the problem is being posed (beat 1) */
  bob: (i: number) => number;
  /** first step index whose state satisfies pred (or -1) */
  first: (pred: (s: any) => boolean) => number; // eslint-disable-line @typescript-eslint/no-explicit-any
};

const stepTimes = (n: number) => (i: number) => (i <= n - 2 ? 16 + i * (31 / Math.max(1, n - 2)) : 48);

export const useRun = (steps: Step[]): Run => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const n = steps.length;
  const T = stepTimes(n);
  let k = 0;
  for (let i = 0; i < n; i++) if (t >= T(i)) k = i;
  const prev = Math.max(0, k - 1);
  const f0 = (t - T(k)) * FPS;
  const sp = (cfg: typeof SNAPPY) => (t < 16 && k === 0 ? 1 : spring({frame: Math.max(0, f0), fps: FPS, config: cfg}));
  const p = sp(SNAPPY);
  const springAt = (startSec: number, cfg: typeof SNAPPY) => (t < startSec ? 0 : spring({frame: (t - startSec) * FPS, fps: FPS, config: cfg}));
  const cfgOf = {bouncy: BOUNCY, snappy: SNAPPY, soft: SOFT};
  return {
    t, steps, k, prev, p, pb: sp(BOUNCY), ps: sp(SOFT),
    s: steps[k].state, o: steps[prev].state, T,
    mix: (a, b) => lerp(a, b, p),
    born: (i, kind = 'bouncy') => (i <= 0 ? springAt(0.6, cfgOf[kind]) : springAt(T(i), cfgOf[kind])),
    pop: (i, count = 8) => springAt(0.7 + i * Math.min(0.28, 2.2 / count), BOUNCY),
    bob: (i) => Math.sin(t * 2.4 + i * 0.9) * 6 * interpolate(t, [3.2, 4, 14.2, 15.2], [0, 1, 1, 0], clamp),
    first: (pred) => steps.findIndex((s) => pred(s.state)),
  };
};

/** Fade/translate style for an intro-popped item. */
export const popStyle = (v: number): CSSProperties => ({opacity: Math.min(1, v * 1.5), transform: `translateY(${(1 - v) * 40}px) scale(${0.6 + 0.4 * v})`});

export type Outro = {naive: string; naiveLabel: string; naiveVal: number; fast: string; fastLabel: string; fastVal: number};
export type Hook = {label: string; count: number; unit: string};

export type SceneProps = {
  run: Run;
  headlines: [string, string, string, string];
  hook: Hook;
  outro: Outro;
  complexity: string;
  /** where the confetti pops at the end */
  confetti?: {x: number; y: number};
  children: ReactNode;
};

const BEAT = [0, 15, 32, 48];

export const Scene = ({run, headlines, hook, outro, complexity, confetti, children}: SceneProps) => {
  const {t, k, prev, steps} = run;
  const sFade = run.p;
  const spr = (start: number, cfg = SOFT) => (t < start ? 0 : spring({frame: (t - start) * FPS, fps: FPS, config: cfg}));
  // beat 1 hook: the brute-force counter ticks up, faster and faster
  const hookIn = interpolate(t, [1.2, 2], [0, 1], clamp) * interpolate(t, [14.8, 15.6], [1, 0], clamp);
  const hp = interpolate(t, [2, 14], [0, 1], clamp);
  const count = Math.round(hook.count * Math.pow(hp, 1.8));
  const shake = hp >= 1 ? Math.sin(t * 40) * 5 * interpolate(t, [14, 15], [1, 0], clamp) : 0;
  // beat 2/3 note
  const noteOn = interpolate(t, [15.6, 16.4, 48, 48.8], [0, 1, 1, 0], clamp);
  // beat 4
  const grow = spr(49.2, {damping: 22, stiffness: 70, mass: 1});
  const stamp = spr(52.6, BOUNCY);
  const fastAccent = 1 + 0.08 * Math.sin(Math.min(1, grow) * Math.PI);
  return (
    <AbsoluteFill style={{background: 'var(--paper)', fontFamily: body, color: 'var(--ink)', overflow: 'hidden'}}>
      <Backdrop t={t} />
      {headlines.map((h, i) => (
        <Headline key={i} text={h} a={BEAT[i] + 0.4} b={(i === 3 ? 60 : BEAT[i + 1]) - 0.2} />
      ))}

      {children}

      {/* beat 1: brute-force counter */}
      <div style={{position: 'absolute', left: 0, right: 0, top: 900, display: 'flex', justifyContent: 'center', opacity: hookIn, transform: `translateX(${shake}px)`}}>
        <Card style={{display: 'flex', alignItems: 'center', gap: 22, whiteSpace: 'nowrap', background: 'var(--tint-cream)'}}>
          <span style={{fontWeight: 700}}>{hook.label}</span>
          <span style={{fontFamily: display, fontWeight: 800, fontSize: 44, minWidth: 90, textAlign: 'right', color: 'var(--pen)'}}>{count}</span>
          <span style={{color: 'var(--muted)'}}>{hook.unit}</span>
        </Card>
      </div>

      {/* beats 2-3: step note */}
      <div style={{position: 'absolute', left: 0, right: 0, top: 900, display: 'flex', justifyContent: 'center', opacity: noteOn}}>
        <div style={{position: 'relative'}}>
          {prev !== k && (
            <div style={{position: 'absolute', inset: 0, display: 'flex', justifyContent: 'center', opacity: 1 - sFade, transform: `translateY(${-sFade * 14}px)`}}>
              <Card style={{whiteSpace: 'nowrap'}}>{steps[prev].note}</Card>
            </div>
          )}
          <div style={{opacity: prev === k ? 1 : sFade, transform: `translateY(${(prev === k ? 0 : 1 - sFade) * 16}px)`}}>
            <Card style={{whiteSpace: 'nowrap'}}>{steps[k].note}</Card>
          </div>
        </div>
      </div>

      {/* beat 4: naive vs this pattern */}
      {t >= 48.8 && (
        <div style={{position: 'absolute', top: 730, left: 300, right: 200, opacity: Math.min(1, grow * 2)}}>
          {[
            {label: outro.naiveLabel, value: outro.naive, w: 1, fill: 'var(--peach)'},
            {label: outro.fastLabel, value: outro.fast, w: Math.max(0.06, outro.fastVal / outro.naiveVal), fill: 'var(--mint)'},
          ].map((row, i) => (
            <div key={row.label} style={{display: 'flex', alignItems: 'center', gap: 24, marginBottom: 22}}>
              <div style={{width: 320, fontFamily: body, fontWeight: 700, fontSize: 28, textAlign: 'right'}}>{row.label}</div>
              <div style={{flex: 1}}>
                <div
                  style={{
                    height: 54, width: `${row.w * 100 * Math.min(1, grow)}%`, minWidth: grow > 0.05 ? 20 : 0, background: row.fill,
                    border: '3px solid var(--line)', borderRadius: 16, boxShadow: 'var(--shadow-sm)',
                    transform: `scaleY(${i === 1 ? fastAccent : 1})`,
                  }}
                />
              </div>
              <div style={{width: 300, whiteSpace: 'nowrap', fontFamily: display, fontWeight: 800, fontSize: 32}}>{row.value}</div>
            </div>
          ))}
        </div>
      )}
      {t >= 52.4 && (
        <div style={{position: 'absolute', left: 0, right: 0, top: 900, display: 'flex', justifyContent: 'center', opacity: spr(52.4)}}>
          <div
            style={{
              padding: '14px 44px', borderRadius: 26, border: '3px solid var(--line)', background: 'var(--yellow)', boxShadow: 'var(--shadow-md)',
              fontFamily: display, fontWeight: 800, fontSize: 50, letterSpacing: '-0.03em', color: 'var(--on-accent)',
              transform: `scale(${0.5 + 0.5 * Math.min(1.2, stamp)}) rotate(${(1 - Math.min(1, stamp)) * -7}deg)`,
            }}
          >
            {complexity}
          </div>
        </div>
      )}
      {confetti && <Confetti t={t} start={48.9} x={confetti.x} y={confetti.y} />}

      <BeatBar t={t} />
    </AbsoluteFill>
  );
};

// ---------- small shared pieces for the stages ----------

export const colorMix = (a: string, b: string, p: number) => {
  // blend two css colours (hex tokens) in rgb
  const parse = (c: string) => {
    const h = c.replace('#', '');
    const n = h.length === 3 ? h.split('').map((x) => x + x).join('') : h;
    return [0, 2, 4].map((i) => parseInt(n.slice(i, i + 2), 16));
  };
  const A = parse(a);
  const B = parse(b);
  return `rgb(${A.map((v, i) => Math.round(lerp(v, B[i], clamp01(p)))).join(',')})`;
};
export const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

/** a bordered tile, the building block of every stage */
export const Tile = ({
  x, y, w, h, fill = 'var(--card)', children, style, radius = 22, shadow = true,
}: {x: number; y: number; w: number; h: number; fill?: string; children?: ReactNode; style?: CSSProperties; radius?: number; shadow?: boolean}) => (
  <div
    style={{
      position: 'absolute', left: x, top: y, width: w, height: h, borderRadius: radius, border: '3px solid var(--line)', background: fill,
      boxShadow: shadow ? 'var(--shadow-sm)' : undefined, display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: display, fontWeight: 800, ...style,
    }}
  >
    {children}
  </div>
);

/** a pointer label with a little arrow, centred on x */
export const Tag = ({x, y, label, fill = 'var(--yellow)', dir = 'down', opacity = 1, scale = 1}: {x: number; y: number; label: string; fill?: string; dir?: 'down' | 'up'; opacity?: number; scale?: number}) => (
  <div
    style={{
      position: 'absolute', left: x, top: y, transform: `translateX(-50%) scale(${scale})`, opacity, display: 'flex',
      flexDirection: dir === 'down' ? 'column' : 'column-reverse', alignItems: 'center', gap: 2,
    }}
  >
    <div style={{padding: '4px 18px', borderRadius: 14, border: '3px solid var(--line)', background: fill, fontFamily: mono, fontWeight: 500, fontSize: 26, color: 'var(--on-accent)', boxShadow: 'var(--shadow-sm)'}}>
      {label}
    </div>
    <div style={{width: 0, height: 0, borderLeft: '10px solid transparent', borderRight: '10px solid transparent', ...(dir === 'down' ? {borderTop: '14px solid var(--line)'} : {borderBottom: '14px solid var(--line)'})}} />
  </div>
);

export {tok};
