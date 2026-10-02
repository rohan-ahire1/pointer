import {AbsoluteFill, interpolate, interpolateColors, useCurrentFrame} from 'remotion';
// Same trace the site's visualizer plays, so video and lesson never disagree.
import {trace} from '@/visualizers/sliding-window/trace';
// Same tokens as the site (source of truth for colour, type, radius).
import {Backdrop, BeatBar, Card, Confetti, FPS, Headline, clamp, inkOn, lerp, tok, useSpr} from './motion';

export {FPS};
export const DURATION_SEC = 60;

const display = 'var(--font-display)';
const body = 'var(--font-body)';
const mono = 'var(--font-mono)';

const S = 'abcabcbb';
const STEPS = trace(S);
const N = S.length;
const LAST = STEPS.length - 1;
const NOTE_HOLD = 1.5;

// Layout (1080p space; rendered 4/3x for QHD).
const CW = 112;
const CH = 128;
const GAP = 16;
const PITCH = CW + GAP;
const STRIP_W = N * PITCH - GAP;
const STRIP_X = (1920 - STRIP_W) / 2;
const STRIP_Y = 380;

// Stat tiles
const TILE_W = 360;
const TILE_GAP = 32;
const TILES_X = (1920 - (3 * TILE_W + 2 * TILE_GAP)) / 2;
const TILES_Y = 700;
const tileX = (i: number) => TILES_X + i * (TILE_W + TILE_GAP);

// Beats match the transcript timestamps in content/patterns.json.
const BEAT = [0, 15, 32, 48, 60];
const HEADLINES = [
  'Longest stretch with *no repeats*',
  'Keep a window. Move the *right edge*.',
  'A repeat? Slide the *left edge*.',
  'One pass. *O(n)*.',
];

// Step timeline (seconds). Steps 0-7 fill beat 2, 8-24 fill beat 3.
const stepTime = (i: number) => (i <= 7 ? 16 + i * 1.75 : 32.5 + (i - 8) * 0.85);

type CS = 'waiting' | 'window' | 'incoming' | 'past' | 'best';
const cellState = (si: number, idx: number): CS => {
  const st = STEPS[si].state;
  if (st.r < 0) return 'waiting';
  if (idx === st.r && !st.incl) return 'incoming';
  if (idx < st.l) return 'past';
  if (idx <= st.r) return 'window';
  return 'waiting';
};
const dupOf = (si: number) => {
  const st = STEPS[si].state;
  if (st.r < 0 || st.incl) return -1;
  for (let i = st.l; i < st.r; i++) if (S[i] === S[st.r]) return i;
  return -1;
};
const poseOf = (si: number) => {
  const st = STEPS[si].state;
  return {l: st.l, end: st.r < 0 ? 0 : st.incl ? st.r + 1 : st.r, r: Math.max(st.r, 0)};
};
const liftOf = (si: number, idx: number) => {
  const st = STEPS[si].state;
  return st.r === idx && !st.incl && st.r >= 0 ? 1 : 0;
};

// Seen-set chips: each lives from the step it's added until the step it's removed.
type Chip = {ch: string; add: number; del: number | null; slot: number};
const CHIPS: Chip[] = (() => {
  const chips: Chip[] = [];
  let prev: string[] = [];
  STEPS.forEach((s, i) => {
    const cur = s.state.seen;
    prev.filter((c) => !cur.includes(c)).forEach((c) => {
      const chip = chips.find((x) => x.ch === c && x.del === null);
      if (chip) chip.del = i;
    });
    cur.filter((c) => !prev.includes(c)).forEach((c) => chips.push({ch: c, add: i, del: null, slot: 0}));
    prev = cur;
  });
  return chips;
})();

// Brute force (beat 1)
const PAIRS: [number, number][] = [];
for (let i = 0; i < N; i++) for (let j = i; j < N; j++) PAIRS.push([i, j]);
const SWEEP_A = 4.2;
const SWEEP_B = 13.6;
const pairTime = (q: number) => SWEEP_A + (SWEEP_B - SWEEP_A) * Math.pow(q / PAIRS.length, 1 / 1.7);
const pairOk = ([i, j]: [number, number]) => new Set(S.slice(i, j + 1)).size === j - i + 1;

const Tag = ({x, label, kind, bump}: {x: number; label: string; kind: 'L' | 'R'; bump: number}) => (
  <div
    style={{
      position: 'absolute', left: x + CW / 2 - 25, top: CH + 28, width: 50, height: 42, borderRadius: 11,
      border: '3px solid var(--line)', background: kind === 'R' ? 'var(--orange)' : 'var(--inverse-bg)',
      color: kind === 'R' ? 'var(--on-accent)' : 'var(--inverse-fg)', fontFamily: mono, fontWeight: 500, fontSize: 25,
      display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${1 + bump * 0.22})`,
      boxShadow: 'var(--shadow-sm)',
    }}
  >
    {label}
  </div>
);

const Tile = ({i, label, children, tint, pop = 0, w = TILE_W}: {i: number; label: string; children: React.ReactNode; tint: string; pop?: number; w?: number}) => (
  <div
    style={{
      position: 'absolute', left: tileX(i), top: TILES_Y, width: w, height: 132, boxSizing: 'border-box',
      padding: '16px 28px', borderRadius: 24, border: '3px solid var(--line)', background: tint, color: inkOn(tint),
      boxShadow: 'var(--shadow-md)', transform: `scale(${1 + pop * 0.06})`,
    }}
  >
    <div style={{fontFamily: body, fontWeight: 700, fontSize: 20, color: inkOn(tint) === 'var(--on-accent)' ? 'var(--on-accent)' : 'var(--muted)', opacity: 0.85}}>{label}</div>
    {children}
  </div>
);

export const SlidingWindow = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const spr = useSpr();

  const inIntro = t < BEAT[1];
  const inOutro = t >= BEAT[3];

  // ---- which step are we on ----
  let k = 0;
  for (let i = 0; i < STEPS.length; i++) if (t >= stepTime(i)) k = i;
  const prev = Math.max(0, k - 1);
  const sMove = spr(stepTime(k), 'bouncy'); // overshoots: edges glide and settle
  const sFade = spr(stepTime(k), 'snappy');
  const stepAge = t - stepTime(k);

  // ---- window pose ----
  const a = poseOf(prev);
  const b = poseOf(k);
  const pose = {l: lerp(a.l, b.l, sMove), end: lerp(a.end, b.end, sMove), r: lerp(a.r, b.r, sMove)};
  const windowLive = !inIntro && !inOutro;

  // ---- brute force sweep ----
  const sweepProgress = interpolate(t, [SWEEP_A, SWEEP_B], [0, 1], clamp);
  const pairIdx = Math.min(PAIRS.length - 1, Math.floor(Math.pow(sweepProgress, 1.7) * PAIRS.length));
  const [bi, bj] = PAIRS[pairIdx];
  const bruteVisible = interpolate(t, [SWEEP_A - 0.5, SWEEP_A, 14.2, 14.9], [0, 1, 1, 0], clamp);
  const verdictPop = spr(pairTime(pairIdx), 'bouncy');

  // ---- final (beat 4) ----
  const FINAL_T = 48.5;
  const finalGlide = spr(FINAL_T, 'bouncy');

  // ---- capsule ----
  let capL = pose.l;
  let capEnd = pose.end;
  let capAlpha = windowLive ? interpolate(capEnd - capL, [0, 0.4], [0, 1], clamp) : 0;
  let capFill = tok('--tint-yellow');
  if (inIntro) {
    capL = bi;
    capEnd = bj + 1;
    capAlpha = bruteVisible;
    capFill = tok('--tint-lilac');
  }
  if (inOutro) {
    const from = poseOf(LAST);
    capL = lerp(from.l, 0, finalGlide);
    capEnd = lerp(from.end, 3, finalGlide);
    capAlpha = 1;
    capFill = interpolateColors(spr(FINAL_T + 0.4, 'soft'), [0, 1], [tok('--tint-yellow'), tok('--tint-mint')]);
  }

  // ---- cell look ----
  const cellLook = (idx: number) => {
    let from: CS;
    let to: CS;
    let s: number;
    if (inIntro) {
      from = to = 'waiting';
      s = 1;
    } else if (inOutro) {
      from = cellState(LAST, idx);
      to = idx < 3 ? 'best' : 'past';
      s = spr(FINAL_T + 0.15 * idx, 'snappy');
    } else {
      from = cellState(prev, idx);
      to = cellState(k, idx);
      s = sFade;
    }
    const col = (cs: CS) =>
      ({
        waiting: {bg: '--card', fg: '--ink', bd: '--line'},
        window: {bg: '--card', fg: '--ink', bd: '--line'},
        incoming: {bg: '--orange', fg: '--on-accent', bd: '--line'},
        past: {bg: '--past-bg', fg: '--faint', bd: '--past-line'},
        best: {bg: '--mint', fg: '--on-accent', bd: '--line'},
      })[cs];
    const f = col(from);
    const g = col(to);
    const mix = (x: string, y: string) => interpolateColors(Math.min(1, Math.max(0, s)), [0, 1], [tok(x), tok(y)]);
    const dashed = (s > 0.5 ? to : from) === 'past';
    return {bg: mix(f.bg, g.bg), fg: mix(f.fg, g.fg), bd: mix(f.bd, g.bd), dashed, from, to, s};
  };

  // ---- cell motion ----
  const cellMotion = (idx: number) => {
    let y = 0;
    let sx = 1;
    let sy = 1;
    let x = 0;
    if (inIntro) {
      const pop = spr(0.5 + idx * 0.12, 'bouncy');
      y = (1 - pop) * 120;
      sy = 0.6 + 0.4 * Math.min(1, pop);
      sx = 1.15 - 0.15 * Math.min(1, pop);
      // brute force: the cells under the bracket breathe
      if (t > SWEEP_A && idx >= bi && idx <= bj) y -= 6 * bruteVisible;
      return {y, sx, sy, x, alpha: Math.min(1, pop * 1.6)};
    }
    if (inOutro) {
      const hop = spr(FINAL_T + 0.15 * idx, 'bouncy');
      if (idx < 3) {
        const tau = t - (FINAL_T + 0.9 + idx * 0.16);
        y = tau > 0 && tau < 0.7 ? -Math.abs(Math.sin(tau * Math.PI / 0.7)) * 36 : 0;
      } else {
        y = Math.min(1, hop) * 8;
      }
      return {y, sx, sy, x, alpha: 1};
    }
    const lift = lerp(liftOf(prev, idx), liftOf(k, idx), sMove);
    y = -lift * 22;
    // squash when the letter lands in the window
    if (liftOf(prev, idx) === 1 && liftOf(k, idx) === 0) {
      const sq = Math.sin(Math.min(1, stepAge / 0.45) * Math.PI);
      sy = 1 - 0.1 * sq;
      sx = 1 + 0.07 * sq;
    }
    // left cells settle downward as they fall behind
    if (cellState(k, idx) === 'past') y += 8 * sFade;
    // shake the incoming letter when it repeats
    if (idx === b.r && dupOf(k) >= 0 && dupOf(prev) < 0) {
      x = Math.sin(stepAge * 38) * 11 * Math.exp(-stepAge * 5.5);
    }
    return {y, sx, sy, x, alpha: 1};
  };

  // ---- repeat arc ----
  const dupK = dupOf(k);
  const dupP = dupOf(prev);
  const arcDup = dupK >= 0 ? dupK : dupP;
  const arcAlpha = windowLive && arcDup >= 0 ? (dupK >= 0 ? Math.min(1, sFade * 1.5) : 1 - sFade) : 0;
  const arcDraw = dupK >= 0 ? spr(stepTime(k) + 0.08, 'soft') : 1;
  const arcR = dupK >= 0 ? b.r : a.r;
  const arcX1 = arcR * PITCH + CW / 2;
  const arcX2 = (arcDup < 0 ? 0 : arcDup) * PITCH + CW / 2;
  const arcMid = (arcX1 + arcX2) / 2;
  const arcH = 70 + Math.abs(arcX1 - arcX2) * 0.18;
  const arcLen = Math.abs(arcX1 - arcX2) * 1.25 + arcH * 2;
  const badge = windowLive && dupK >= 0 ? spr(stepTime(k) + 0.1, 'bouncy') : 0;

  // ---- seen chips ----
  const chipState = CHIPS.map((c) => {
    const addT = stepTime(c.add);
    const live = c.add === 0 ? 0 : spr(addT + 0.55, 'bouncy');
    const dead = c.del === null ? 0 : spr(stepTime(c.del), 'snappy');
    return {c, presence: Math.max(0, live) * (1 - Math.min(1, dead)), dead, addT};
  });
  // smooth slot ordering: a chip's slot = sum of presence of live chips added before it
  const visibleChips = chipState.filter((x) => t >= x.addT - 0.05 && (x.c.del === null || t < stepTime(x.c.del) + 0.8));
  const seenChips = visibleChips.map((x, i) => ({
    ...x,
    slot: visibleChips.slice(0, i).reduce((sum, y) => sum + y.presence, 0),
  }));

  const seenX0 = tileX(1) + 28;
  const seenY0 = TILES_Y + 58;

  // ---- window tile ----
  const winText = STEPS[k].state.r < 0 ? '' : S.slice(STEPS[k].state.l, STEPS[k].state.incl ? STEPS[k].state.r + 1 : STEPS[k].state.r);
  const prevWin = STEPS[prev].state.r < 0 ? '' : S.slice(STEPS[prev].state.l, STEPS[prev].state.incl ? STEPS[prev].state.r + 1 : STEPS[prev].state.r);
  const winBump = winText.length !== prevWin.length ? Math.sin(Math.min(1, stepAge / 0.5) * Math.PI) : 0;

  // ---- best tile ----
  const best = STEPS[k].state.best;
  const bestUp = best > STEPS[prev].state.best;
  const bestBump = bestUp ? Math.sin(Math.min(1, stepAge / 0.6) * Math.PI) : 0;
  const ring = bestUp ? Math.min(1, stepAge / 0.8) : 1;

  // ---- tiles visibility ----
  const tilesOn = interpolate(t, [15.4, 16.2, 47.4, 48.2], [0, 1, 1, 0], clamp);
  const tilesY = (1 - tilesOn) * 40;

  // ---- beat 4 ----
  const barsIn = spr(50.6, 'soft');
  const barsGrow = spr(51.2, 'soft');
  const stamp = spr(52.4, 'bouncy');

  // ---- note: each stays up at least NOTE_HOLD s, so the fast run in beat 3 skips the ones that would flash by ----
  const noteOn = interpolate(t, [15.6, 16.4, 48, 48.8], [0, 1, 1, 0], clamp);
  let noteI = 0;
  let noteSince = stepTime(0);
  for (let i = 1; i <= k; i++) {
    const at = Math.max(stepTime(i), noteSince + NOTE_HOLD);
    const next = i < STEPS.length - 1 ? stepTime(i + 1) : Infinity;
    if (at <= t && (i === k || at < next)) {
      noteI = i;
      noteSince = at;
    }
  }
  const noteIn = spr(noteSince, 'snappy');

  const tagBumpL = b.l !== a.l ? Math.sin(Math.min(1, stepAge / 0.5) * Math.PI) : 0;
  const tagBumpR = b.r !== a.r ? Math.sin(Math.min(1, stepAge / 0.5) * Math.PI) : 0;
  const tagsOn = windowLive ? 1 : 0;

  return (
    <AbsoluteFill style={{background: 'var(--paper)', fontFamily: body, color: 'var(--ink)', overflow: 'hidden'}}>
      <Backdrop t={t} />
      {HEADLINES.map((h, i) => (
        <Headline key={i} text={h} a={BEAT[i] + (i === 0 ? 0.3 : 0.05)} b={i === 3 ? 61 : BEAT[i + 1]} />
      ))}

      {/* strip */}
      <div style={{position: 'absolute', left: STRIP_X, top: STRIP_Y, width: STRIP_W, height: CH + 130}}>
        <div
          style={{
            position: 'absolute', left: capL * PITCH - 14, top: -14, width: Math.max(0, (capEnd - capL) * PITCH - GAP + 28),
            height: CH + 28, borderRadius: 30, border: '3.5px solid var(--line)', background: capFill, opacity: capAlpha,
          }}
        />

        {/* repeat arc */}
        <svg width={STRIP_W} height={200} style={{position: 'absolute', left: 0, top: -190, overflow: 'visible', opacity: arcAlpha}}>
          <path
            d={`M ${arcX1} 186 Q ${arcMid} ${186 - arcH * 2} ${arcX2} 186`}
            fill="none" stroke={tok('--pen')} strokeWidth={5} strokeLinecap="round" strokeDasharray={`${arcLen}`}
            strokeDashoffset={arcLen * (1 - Math.min(1, arcDraw))}
          />
          <path
            d={`M ${arcX2 - 10} 170 L ${arcX2} 186 L ${arcX2 + 10} 170`}
            fill="none" stroke={tok('--pen')} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round"
            opacity={Math.min(1, arcDraw * 1.4 - 0.4)}
          />
        </svg>
        {windowLive && dupK >= 0 && (
          <div
            style={{
              position: 'absolute', left: arcX1 + CW / 2 + 6, top: -78, width: 160, textAlign: 'left',
              padding: '2px 0', borderRadius: 12, background: 'var(--paper)',
              fontFamily: display, fontWeight: 800, fontSize: 24, color: 'var(--pen)', opacity: Math.min(1, badge),
              transform: `scale(${0.4 + 0.6 * Math.min(1.2, badge)}) rotate(${(1 - Math.min(1, badge)) * -8}deg)`, transformOrigin: 'left center',
            }}
          >
            ✕ repeat!
          </div>
        )}

        {S.split('').map((ch, idx) => {
          const look = cellLook(idx);
          const m = cellMotion(idx);
          const isDupCell = windowLive && idx === arcDup && arcAlpha > 0.05;
          return (
            <div
              key={idx}
              style={{
                position: 'absolute', left: idx * PITCH, top: 0, width: CW, height: CH, boxSizing: 'border-box',
                borderRadius: 25, background: look.bg, color: look.fg,
                border: `3px ${look.dashed ? 'dashed' : 'solid'} ${look.bd}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: mono, fontWeight: 500, fontSize: 64,
                opacity: m.alpha,
                transform: `translate(${m.x}px, ${m.y}px) scale(${m.sx}, ${m.sy})`, transformOrigin: 'center bottom',
                boxShadow: look.to === 'incoming' ? 'var(--shadow-md)' : isDupCell ? `0 0 0 ${6 * arcAlpha}px ${tok('--pen')}55` : 'none',
              }}
            >
              {ch}
              {inOutro && idx < 3 && (
                <span
                  style={{
                    position: 'absolute', top: 6, right: 12, fontSize: 26, fontFamily: body, fontWeight: 700,
                    transform: `scale(${spr(FINAL_T + 0.9 + idx * 0.16, 'bouncy')})`,
                  }}
                >
                  ✓
                </span>
              )}
            </div>
          );
        })}

        {/* verdict chip riding the brute-force bracket */}
        {inIntro && t > SWEEP_A && (
          <div
            style={{
              position: 'absolute', left: ((bi + bj + 1) / 2) * PITCH - GAP / 2 - 32, top: -78, width: 64, height: 50,
              borderRadius: 14, border: '3px solid var(--line)', fontFamily: body, fontWeight: 700, fontSize: 30,
              display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: bruteVisible,
              background: pairOk(PAIRS[pairIdx]) ? 'var(--mint)' : 'var(--peach)',
              transform: `scale(${0.6 + 0.4 * Math.min(1.25, verdictPop)})`, boxShadow: 'var(--shadow-sm)',
            }}
          >
            {pairOk(PAIRS[pairIdx]) ? '✓' : '✕'}
          </div>
        )}

        <div style={{opacity: tagsOn}}>
          <div style={{position: 'absolute', left: 0, top: 0}}>
            <Tag x={pose.l * PITCH} label="L" kind="L" bump={tagBumpL} />
            <Tag x={pose.r * PITCH} label="R" kind="R" bump={tagBumpR} />
          </div>
        </div>
      </div>

      {/* beat 1: counter + n² triangle */}
      <div style={{opacity: bruteVisible}}>
        <div style={{position: 'absolute', left: 410, top: TILES_Y, width: 460, height: 132, boxSizing: 'border-box', padding: '16px 28px', borderRadius: 24, border: '3px solid var(--line)', background: 'var(--tint-lilac)', boxShadow: 'var(--shadow-md)'}}>
          <div style={{fontFamily: body, fontWeight: 700, fontSize: 20, color: 'var(--muted)'}}>windows checked</div>
          <div style={{fontFamily: mono, fontWeight: 500, fontSize: 44, marginTop: 6}}>
            {pairIdx + 1}
            <span style={{color: 'var(--muted)', fontSize: 30}}> of {PAIRS.length}</span>
          </div>
        </div>
        <div style={{position: 'absolute', left: 1040, top: TILES_Y - 14}}>
          {PAIRS.slice(0, pairIdx + 1).map(([i, j], q) => {
            const pop = spr(pairTime(q), 'bouncy');
            const ok = pairOk([i, j]);
            return (
              <div
                key={q}
                style={{
                  position: 'absolute', left: j * 30, top: i * 30, width: 24, height: 24, borderRadius: 8,
                  border: `2.5px ${ok ? 'solid' : 'dashed'} ${ok ? tok('--line') : tok('--past-line')}`, background: ok ? 'var(--mint)' : 'var(--past-bg)',
                  transform: `scale(${Math.min(1.3, pop)})`, fontFamily: body, fontWeight: 700, fontSize: 14, color: ok ? 'var(--on-accent)' : 'var(--faint)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                {ok ? '✓' : '✕'}
              </div>
            );
          })}
        </div>
      </div>

      {/* beats 2-3: stat tiles */}
      <div style={{opacity: tilesOn, transform: `translateY(${tilesY}px)`}}>
        <Tile i={0} label="window" tint="var(--tint-lilac)" pop={winBump}>
          <div style={{fontFamily: mono, fontWeight: 500, fontSize: 44, marginTop: 8}}>{`"${winText}"`}</div>
        </Tile>
        <Tile i={1} label="seen" tint="var(--tint-mint)">
          <div style={{height: 56}} />
        </Tile>
        <Tile i={2} label="best so far" tint="var(--yellow)" pop={bestBump}>
          <div style={{fontFamily: display, fontWeight: 800, fontSize: 48, marginTop: 2, transform: `scale(${1 + bestBump * 0.25})`, transformOrigin: 'left center'}}>{best}</div>
        </Tile>
        {bestUp && ring < 1 && (
          <div style={{position: 'absolute', left: tileX(2) - 10, top: TILES_Y - 10, width: TILE_W + 20, height: 152, borderRadius: 32, border: '4px solid var(--orange)', opacity: 1 - ring, transform: `scale(${1 + ring * 0.25})`}} />
        )}
      </div>

      {/* seen chips (live above their tile so they can fly in) */}
      <div style={{opacity: tilesOn, transform: `translateY(${tilesY}px)`}}>
        {seenChips.map(({c, presence, dead, addT}) => {
          const fly = Math.min(1, Math.max(0, (t - addT) / 0.5));
          const flying = c.add !== 0 && fly < 1;
          const slotX = seenX0 + 0 + (flying ? slotOf(seenChips, c) : 0) * 58;
          const tx = seenX0 + slotOf(seenChips, c) * 58;
          const cellX = STRIP_X + STEPS[c.add].state.r * PITCH + CW / 2 - 25;
          const cellY = STRIP_Y - 10;
          const e = fly * fly * (3 - 2 * fly);
          const x = flying ? lerp(cellX, tx, e) : tx;
          const y = flying ? lerp(cellY, seenY0, e) - Math.sin(e * Math.PI) * 90 : seenY0;
          const sc = flying ? lerp(1.5, 1, e) : Math.min(1.25, presence);
          const out = Math.min(1, dead);
          void slotX;
          return (
            <div
              key={c.ch + c.add}
              style={{
                position: 'absolute', left: x, top: y + out * 30, width: 50, height: 50, borderRadius: 13,
                border: '3px solid var(--line)', background: 'var(--mint)', color: 'var(--on-accent)', fontFamily: mono, fontWeight: 500,
                fontSize: 28, display: 'flex', alignItems: 'center', justifyContent: 'center',
                opacity: flying ? 1 : presence, transform: `scale(${sc}) rotate(${out * 25}deg)`, boxShadow: 'var(--shadow-sm)',
              }}
            >
              {c.ch}
            </div>
          );
        })}
      </div>

      {/* step note */}
      <div style={{position: 'absolute', left: 0, right: 0, top: 900, display: 'flex', justifyContent: 'center', opacity: noteOn}}>
        <div style={{opacity: Math.min(1, noteIn * 1.4), transform: `translateY(${(1 - Math.min(1, noteIn)) * 14}px)`}}>
          <Card style={{whiteSpace: 'nowrap'}}>{STEPS[noteI].note}</Card>
        </div>
      </div>

      {/* beat 4: every window vs one sliding window */}
      <div style={{position: 'absolute', top: 690, left: 360, right: 360, opacity: barsIn}}>
        {[
          {label: 'check every window', value: `${PAIRS.length} windows`, w: 1, fill: 'var(--peach)'},
          {label: 'slide one window', value: `${N} windows`, w: N / PAIRS.length, fill: 'var(--mint)'},
        ].map((row, i) => (
          <div key={row.label} style={{display: 'flex', alignItems: 'center', gap: 24, marginBottom: 24}}>
            <div style={{width: 290, fontFamily: body, fontWeight: 700, fontSize: 28, textAlign: 'right'}}>{row.label}</div>
            <div style={{flex: 1}}>
              <div
                style={{
                  height: 54, width: `${row.w * 100 * Math.min(1, barsGrow)}%`, minWidth: barsGrow > 0.05 ? 20 : 0, background: row.fill,
                  border: '3px solid var(--line)', borderRadius: 16, boxShadow: 'var(--shadow-sm)',
                  transform: `scaleY(${i === 1 ? 1 + 0.08 * Math.sin(Math.min(1, barsGrow) * Math.PI) : 1})`,
                }}
              />
            </div>
            <div style={{width: 260, whiteSpace: 'nowrap', fontFamily: display, fontWeight: 800, fontSize: 32}}>{row.value}</div>
          </div>
        ))}
      </div>
      {inOutro && (
        <div style={{position: 'absolute', left: 0, right: 0, top: 900, display: 'flex', justifyContent: 'center', opacity: spr(52.4, 'soft')}}>
          <div
            style={{
              padding: '14px 44px', borderRadius: 26, border: '3px solid var(--line)', background: 'var(--yellow)', boxShadow: 'var(--shadow-md)',
              fontFamily: display, fontWeight: 800, fontSize: 50, letterSpacing: '-0.03em', color: 'var(--on-accent)',
              transform: `scale(${0.5 + 0.5 * Math.min(1.2, stamp)}) rotate(${(1 - Math.min(1, stamp)) * -7}deg)`,
            }}
          >
            O(n)
          </div>
        </div>
      )}
      <Confetti t={t} start={FINAL_T + 1.2} x={STRIP_X + 1.5 * PITCH} y={STRIP_Y + 60} />

      <BeatBar t={t} />
    </AbsoluteFill>
  );
};

function slotOf(list: {c: {ch: string; add: number}; slot: number}[], c: {ch: string; add: number}) {
  return list.find((x) => x.c === c)?.slot ?? 0;
}
