import {AbsoluteFill, interpolate, spring, useCurrentFrame} from 'remotion';
import type {CSSProperties, ReactNode} from 'react';
import {Backdrop, BeatBar, Card, Confetti, FPS, Headline, clamp, inkOn, lerp, tok} from './motion';

export const display = 'var(--font-display)';
export const body = 'var(--font-body)';
export const mono = 'var(--font-mono)';

export type Step = {note: string; state: any}; // eslint-disable-line @typescript-eslint/no-explicit-any
const SNAPPY = {damping: 16, stiffness: 170, mass: 0.7};
const BOUNCY = {damping: 9, stiffness: 150, mass: 0.7};
const SOFT = {damping: 20, stiffness: 80, mass: 1};

// ---------- timeline ----------

/** When each step starts. Steps fill 0:16 to `end`; `anchors` pin chosen steps to the
 * moment the transcript talks about them, and `weight` makes some steps linger longer. */
export type Timing = {
  anchors?: Record<number, number>;
  weight?: (state: any, i: number) => number; // eslint-disable-line @typescript-eslint/no-explicit-any
  start?: number;
  end?: number;
};

export const timeline = (steps: Step[], tm: Timing = {}): number[] => {
  const n = steps.length;
  const start = tm.start ?? 16;
  const end = tm.end ?? 46.6;
  if (n === 1) return [start];
  const pins = new Map<number, number>([[0, start], [n - 1, end]]);
  Object.entries(tm.anchors ?? {}).forEach(([k, v]) => pins.set(Number(k), v));
  const keys = [...pins.keys()].sort((a, b) => a - b);
  const w = (i: number) => (tm.weight ? tm.weight(steps[i].state, i) : i === 0 ? 0.7 : 1);
  const T: number[] = new Array(n);
  for (let a = 0; a < keys.length - 1; a++) {
    const i0 = keys[a];
    const i1 = keys[a + 1];
    const t0 = pins.get(i0) as number;
    const t1 = pins.get(i1) as number;
    let total = 0;
    for (let i = i0; i < i1; i++) total += w(i);
    let acc = 0;
    for (let i = i0; i < i1; i++) {
      T[i] = t0 + ((t1 - t0) * acc) / total;
      acc += w(i);
    }
  }
  T[n - 1] = end;
  return T;
};

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
  /** 0 during the brute-force beat, 1 once the pattern takes over (fades 14.6s → 15.6s) */
  live: number;
  /** blend a prev->cur number */
  mix: (a: number, b: number) => number;
  /** spring (bouncy|snappy|soft) since step `i` began; for entities that first show up at step i. Step 0 pops in during the intro. */
  born: (i: number, kind?: 'bouncy' | 'snappy' | 'soft') => number;
  /** staggered intro pop for item `i` of `n` (0..1), done by ~2s */
  pop: (i: number, n?: number) => number;
  /** kept for older stages; the brute-force beat now animates instead of bobbing */
  bob: (i: number) => number;
  /** first step index whose state satisfies pred (or -1) */
  first: (pred: (s: any) => boolean) => number; // eslint-disable-line @typescript-eslint/no-explicit-any
};

export const useRun = (steps: Step[], times: number[]): Run => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const n = steps.length;
  const T = (i: number) => times[Math.max(0, Math.min(n - 1, i))];
  let k = 0;
  for (let i = 0; i < n; i++) if (t >= T(i)) k = i;
  const prev = Math.max(0, k - 1);
  const f0 = (t - T(k)) * FPS;
  const sp = (cfg: typeof SNAPPY) => (t < T(0) && k === 0 ? 1 : spring({frame: Math.max(0, f0), fps: FPS, config: cfg}));
  const p = sp(SNAPPY);
  const springAt = (startSec: number, cfg: typeof SNAPPY) => (t < startSec ? 0 : spring({frame: (t - startSec) * FPS, fps: FPS, config: cfg}));
  const cfgOf = {bouncy: BOUNCY, snappy: SNAPPY, soft: SOFT};
  return {
    t, steps, k, prev, p, pb: sp(BOUNCY), ps: sp(SOFT),
    s: steps[k].state, o: steps[prev].state, T,
    live: interpolate(t, [14.6, 15.6], [0, 1], clamp),
    mix: (a, b) => lerp(a, b, p),
    born: (i, kind = 'bouncy') => (i <= 0 ? springAt(0.6, cfgOf[kind]) : springAt(T(i), cfgOf[kind])),
    pop: (i, count = 8) => springAt(0.5 + i * Math.min(0.2, 1.4 / count), BOUNCY),
    bob: () => 0,
    first: (pred) => steps.findIndex((s) => pred(s.state)),
  };
};

// ---------- brute force (beat 1) ----------

/** The brute-force beat runs its checks from BRUTE_A to BRUTE_B, slow at first so the
 * first few can be followed, then faster and faster. */
export const BRUTE_A = 2.4;
export const BRUTE_B = 13.6;
const EASE = 1.6;
/** index of the check on screen at time t (or -1 before the first) */
export const bruteK = (t: number, n: number) => (t < BRUTE_A ? -1 : Math.min(n - 1, Math.floor(Math.pow(clamp01((t - BRUTE_A) / (BRUTE_B - BRUTE_A)), EASE) * n)));
/** time check q starts */
export const bruteT = (q: number, n: number) => BRUTE_A + (BRUTE_B - BRUTE_A) * Math.pow(q / n, 1 / EASE);
/** opacity of the brute-force layer */
export const bruteOn = (t: number) => interpolate(t, [1.8, 2.4, 14.2, 14.9], [0, 1, 1, 0], clamp);
/** spring since check q started */
export const bruteSpr = (t: number, q: number, n: number, kind: 'bouncy' | 'snappy' | 'soft' = 'snappy') => {
  const s0 = bruteT(q, n);
  return t < s0 ? 0 : spring({frame: (t - s0) * FPS, fps: FPS, config: kind === 'bouncy' ? BOUNCY : kind === 'soft' ? SOFT : SNAPPY});
};

/** Popped-in style for an intro item. */
export const popStyle = (v: number): CSSProperties => ({opacity: Math.min(1, v * 1.5), transform: `translateY(${(1 - v) * 40}px)`});

/** Beat 4 bars. Both rows count the same thing (`unit`), so the brute-force number
 * matches the counter that ticked up in beat 1. */
export type Outro = {naiveLabel: string; naiveVal: number; fastLabel: string; fastVal: number; unit: string; fastUnit?: string};
/** The beat-1 counter: `count(t)` is driven by the same clock as the brute-force animation. */
export type Hook = {label: string; unit: string; total: number; count: (t: number) => number};

export type SceneProps = {
  run: Run;
  headlines: [string, string, string, string];
  hook: Hook;
  outro: Outro;
  /** the stamp in beat 4 (the pattern's complexity unless overridden) */
  stamp: string;
  /** where the confetti pops at the end */
  confetti?: {x: number; y: number};
  /** the brute-force layer drawn over the stage during beat 1 */
  brute?: ReactNode;
  children: ReactNode;
};

const BEAT = [0, 15, 32, 48];
const NOTE_HOLD = 1.5;

/** Which note is on screen, and since when. Notes stay up at least NOTE_HOLD seconds;
 * a fast run of steps skips notes that would only flash by. */
const noteAt = (run: Run): {i: number; since: number} => {
  const {t, k, T} = run;
  let shown = 0;
  let since = T(0);
  for (let i = 1; i <= k; i++) {
    const at = Math.max(T(i), since + NOTE_HOLD);
    const next = i < run.steps.length - 1 ? T(i + 1) : Infinity;
    if (at <= t && (i === k || at < next)) {
      shown = i;
      since = at;
    }
  }
  return {i: shown, since};
};

export const Scene = ({run, headlines, hook, outro, stamp: stampText, confetti, brute, children}: SceneProps) => {
  const {t, steps} = run;
  const spr = (start: number, cfg = SOFT) => (t < start ? 0 : spring({frame: (t - start) * FPS, fps: FPS, config: cfg}));
  // beat 1: brute-force counter, in step with the brute-force animation
  const hookIn = bruteOn(t);
  const count = Math.max(0, Math.min(hook.total, hook.count(t)));
  const doneBrute = t >= BRUTE_B;
  const shake = doneBrute ? Math.sin(t * 40) * 5 * interpolate(t, [BRUTE_B, BRUTE_B + 0.8], [1, 0], clamp) : 0;
  // beats 2-3: one note card at a time, fading in
  const noteOn = interpolate(t, [15.6, 16.4, 48, 48.8], [0, 1, 1, 0], clamp);
  const note = noteAt(run);
  const noteIn = t < note.since ? 0 : spring({frame: (t - note.since) * FPS, fps: FPS, config: SNAPPY});
  // beat 4
  const shrink = spr(48.5, {damping: 20, stiffness: 90, mass: 1});
  const grow = spr(49.2, {damping: 22, stiffness: 70, mass: 1});
  const stamp = spr(52.6, BOUNCY);
  const fastAccent = 1 + 0.08 * Math.sin(Math.min(1, grow) * Math.PI);
  return (
    <AbsoluteFill style={{background: 'var(--paper)', fontFamily: body, color: 'var(--ink)', overflow: 'hidden'}}>
      <Backdrop t={t} />
      {headlines.map((h, i) => (
        <Headline key={i} text={h} a={BEAT[i] + 0.4} b={(i === 3 ? 60 : BEAT[i + 1]) - 0.2} />
      ))}

      {/* the stage steps back a little in beat 4 to make room for the comparison */}
      <div style={{position: 'absolute', inset: 0, transformOrigin: '960px 240px', transform: `scale(${1 - 0.22 * Math.min(1, shrink)})`}}>
        {children}
        {brute && <div style={{position: 'absolute', inset: 0, opacity: hookIn}}>{brute}</div>}
      </div>

      {/* beat 1: brute-force counter */}
      <div style={{position: 'absolute', left: 0, right: 0, top: 900, display: 'flex', justifyContent: 'center', opacity: hookIn, transform: `translateX(${shake}px)`}}>
        <Card style={{display: 'flex', alignItems: 'center', gap: 22, whiteSpace: 'nowrap', background: 'var(--tint-cream)'}}>
          <span style={{fontWeight: 700}}>{hook.label}</span>
          <span style={{fontFamily: display, fontWeight: 800, fontSize: 44, minWidth: 90, textAlign: 'right', color: 'var(--pen)'}}>{count}</span>
          <span style={{color: 'var(--muted)'}}>
            of {hook.total} {hook.unit}
          </span>
        </Card>
      </div>

      {/* beats 2-3: step note */}
      <div style={{position: 'absolute', left: 0, right: 0, top: 900, display: 'flex', justifyContent: 'center', opacity: noteOn}}>
        <div style={{opacity: Math.min(1, noteIn * 1.4), transform: `translateY(${(1 - Math.min(1, noteIn)) * 14}px)`}}>
          <Card style={{whiteSpace: 'nowrap'}}>{steps[note.i].note}</Card>
        </div>
      </div>

      {/* beat 4: brute force vs this pattern, in the same unit */}
      {t >= 48.8 && (
        <div style={{position: 'absolute', top: 760, left: 260, right: 160, opacity: Math.min(1, grow * 2)}}>
          {[
            {label: outro.naiveLabel, value: `${outro.naiveVal} ${outro.unit}`, w: 1, fill: 'var(--peach)'},
            {label: outro.fastLabel, value: `${outro.fastVal} ${outro.fastUnit ?? outro.unit}`, w: Math.max(0.06, outro.fastVal / outro.naiveVal), fill: 'var(--mint)'},
          ].map((row, i) => (
            <div key={row.label} style={{display: 'flex', alignItems: 'center', gap: 24, marginBottom: 22}}>
              <div style={{width: 360, fontFamily: body, fontWeight: 700, fontSize: 28, textAlign: 'right'}}>{row.label}</div>
              <div style={{flex: 1}}>
                <div
                  style={{
                    height: 54, width: `${row.w * 100 * Math.min(1, grow)}%`, minWidth: grow > 0.05 ? 20 : 0, background: row.fill,
                    border: '3px solid var(--line)', borderRadius: 16, boxShadow: 'var(--shadow-sm)',
                    transform: `scaleY(${i === 1 ? fastAccent : 1})`,
                  }}
                />
              </div>
              <div style={{width: 330, whiteSpace: 'nowrap', fontFamily: display, fontWeight: 800, fontSize: 30}}>{row.value}</div>
            </div>
          ))}
        </div>
      )}
      {t >= 52.4 && (
        <div style={{position: 'absolute', left: 0, right: 0, top: 925, display: 'flex', justifyContent: 'center', opacity: spr(52.4)}}>
          <div
            style={{
              padding: '14px 44px', borderRadius: 26, border: '3px solid var(--line)', background: 'var(--yellow)', boxShadow: 'var(--shadow-md)',
              fontFamily: display, fontWeight: 800, fontSize: 50, letterSpacing: '-0.03em', color: 'var(--on-accent)',
              transform: `scale(${0.5 + 0.5 * Math.min(1.2, stamp)}) rotate(${(1 - Math.min(1, stamp)) * -7}deg)`,
            }}
          >
            {stampText}
          </div>
        </div>
      )}
      {confetti && <Confetti t={t} start={48.9} x={960 + (confetti.x - 960) * 0.78} y={240 + (confetti.y - 240) * 0.78} />}

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
      color: !style?.color || style.color === 'var(--on-accent)' ? inkOn(fill) : style.color,
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

export {inkOn, tok};
