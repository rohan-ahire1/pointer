import type {ReactNode} from 'react';
import {lerp, tok} from './motion';
import {Run, Tag, Tile, body, bruteK, bruteSpr, clamp01, colorMix, display, mono, popStyle} from './scene';

const Svg = ({children}: {children: ReactNode}) => (
  <svg width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0, pointerEvents: 'none'}}>
    {children}
  </svg>
);
const visBlend = (r: Run, pred: (s: any) => boolean) => (pred(r.s) ? (pred(r.o) ? 1 : r.p) : pred(r.o) ? 1 - r.p : 0); // eslint-disable-line @typescript-eslint/no-explicit-any
const Label = ({x, y, children, align = 'left', size = 26}: {x: number; y: number; children: ReactNode; align?: 'left' | 'center' | 'right'; size?: number}) => (
  <div style={{position: 'absolute', left: x, top: y, transform: `translateX(${align === 'center' ? '-50%' : align === 'right' ? '-100%' : '0'})`, fontFamily: mono, fontWeight: 500, fontSize: size, color: 'var(--muted)', whiteSpace: 'nowrap'}}>
    {children}
  </div>
);
const Chip = ({x, y, w, h, fill, children, opacity = 1, scale = 1, rotate = 0}: {x: number; y: number; w: number; h: number; fill: string; children: ReactNode; opacity?: number; scale?: number; rotate?: number}) => (
  <Tile x={x} y={y} w={w} h={h} fill={fill} radius={22} style={{opacity, transform: `scale(${scale}) rotate(${rotate}deg)`, fontFamily: display, fontSize: 34}}>
    {children}
  </Tile>
);
/** a coloured ring drawn around a tile to mark it during the brute-force beat */
const Ring = ({x, y, w, h, color, radius = 28}: {x: number; y: number; w: number; h: number; color: string; radius?: number}) => (
  <div style={{position: 'absolute', left: x - 12, top: y - 12, width: w + 24, height: h + 24, borderRadius: radius, border: `6px solid ${tok(color)}`, boxShadow: `0 0 0 6px ${tok(color)}33`}} />
);
/** the big verdict card under the stage during the brute-force beat */
const Verdict = ({y = 640, ok, pop, children, w = 560}: {y?: number; ok: boolean | null; pop: number; children: ReactNode; w?: number}) => (
  <div style={{position: 'absolute', left: 0, right: 0, top: y, display: 'flex', justifyContent: 'center'}}>
    <Tile x={0} y={0} w={w} h={110} fill={ok ? 'var(--mint)' : 'var(--card)'} style={{position: 'relative', fontSize: 46, gap: 22, transform: `scale(${0.88 + 0.12 * Math.min(1.2, pop)})`}}>
      {children}
      {ok != null && <span style={{color: ok ? undefined : 'var(--pen)'}}>{ok ? '✓' : '✕'}</span>}
    </Tile>
  </div>
);

// ───────────────────────── two sum ─────────────────────────
const TS = {W: 150, GAP: 36, Y: 335, PX: 470, PY: 600, SLOT: 205};
const tsX = (n: number, i: number) => (1920 - (n * TS.W + (n - 1) * TS.GAP)) / 2 + i * (TS.W + TS.GAP) + TS.W / 2;
export const twoSumPairs = (nums: number[]) => {
  const out: [number, number][] = [];
  for (let i = 0; i < nums.length; i++) for (let j = i + 1; j < nums.length; j++) out.push([i, j]);
  return out;
};

export const TwoSumBrute = ({r}: {r: Run}) => {
  const {nums, target} = r.steps[0].state as {nums: number[]; target: number};
  const pairs = twoSumPairs(nums);
  const q = bruteK(r.t, pairs.length);
  if (q < 0) return null;
  const [i, j] = pairs[q];
  const sum = nums[i] + nums[j];
  const ok = sum === target;
  const cx = (k: number) => tsX(nums.length, k);
  return (
    <>
      <Ring x={cx(i) - TS.W / 2} y={TS.Y} w={TS.W} h={TS.W} color={ok ? '--mint' : '--yellow'} />
      <Ring x={cx(j) - TS.W / 2} y={TS.Y} w={TS.W} h={TS.W} color={ok ? '--mint' : '--peach'} />
      <Tag x={cx(i)} y={250} label="i" />
      <Tag x={cx(j)} y={250} label="j" fill="var(--peach)" />
      <Verdict ok={ok} pop={bruteSpr(r.t, q, pairs.length, 'bouncy')}>
        {nums[i]} + {nums[j]} = {sum}
      </Verdict>
    </>
  );
};

export const TwoSumStage = ({r}: {r: Run}) => {
  const {s, o, p} = r;
  const nums: number[] = s.nums;
  const N = nums.length;
  const {W, Y, PX, PY, SLOT} = TS;
  const cx = (i: number) => tsX(N, i);
  const iPos = (st: any) => (st.i < 0 ? cx(0) - 150 : cx(st.i)); // eslint-disable-line @typescript-eslint/no-explicit-any
  const tagX = r.mix(iPos(o), iPos(s));
  const tagOpacity = r.mix(o.i < 0 ? 0 : 1, s.i < 0 ? 0 : 1);
  const hop = Math.sin(Math.PI * p) * (o.i === s.i ? 0 : 26);
  const answer = s.answer as number[] | null;
  const hit = s.lookup === 'hit';
  const miss = s.lookup === 'miss';
  const needVis = visBlend(r, (st) => st.need != null);
  const ns = s.need != null ? s : o;
  const slotXY = (slot: number) => ({x: PX + 40 + slot * SLOT, y: PY + 52});
  const map = s.map as {value: number; index: number}[];
  const hitSlot = hit ? map.findIndex((m) => m.value === s.need) : -1;
  const hitIdx = hitSlot >= 0 ? map[hitSlot].index : null;
  const panelShake = miss ? Math.sin(p * 28) * 8 * (1 - p) : 0;
  const doneBounce = s.phase === 'done' ? Math.sin(Math.PI * r.pb) * 14 : 0;
  return (
    <>
      <Svg>
        {hit && hitIdx != null && (
          <path
            d={`M ${slotXY(hitSlot).x + 95} ${PY + 52} Q ${cx(hitIdx)} ${PY - 40} ${cx(hitIdx)} ${Y + W + 40}`}
            fill="none" stroke={tok('--mint')} strokeWidth={8} strokeLinecap="round" strokeDasharray="14 12" strokeDashoffset={(1 - p) * 300}
            opacity={clamp01(p * 2)}
          />
        )}
      </Svg>
      {nums.map((v, i) => {
        const cur = i === s.i && r.live > 0.5;
        const isAns = answer?.includes(i) && s.phase !== 'setup';
        const partner = hit && i === hitIdx;
        const fill = isAns || partner ? 'var(--mint)' : cur ? 'var(--yellow)' : 'var(--card)';
        const pp = r.pop(i, N);
        return (
          <div key={i} style={{...popStyle(pp), position: 'absolute', left: 0, top: 0}}>
            <Tile x={cx(i) - W / 2} y={Y + (isAns ? -doneBounce : 0)} w={W} h={W} fill={fill} style={{fontSize: 64}}>
              {v}
            </Tile>
            <Label x={cx(i)} y={Y + W + 12} align="center">idx {i}</Label>
          </div>
        );
      })}
      <Tag x={tagX} y={250 - hop} label="i" opacity={tagOpacity * r.live} />

      <Tile x={130} y={PY + 35} w={280} h={80} fill="var(--tint-yellow)" style={{fontSize: 30, color: 'var(--ink)', ...popStyle(r.pop(3, 6))}}>
        target {s.target}
      </Tile>
      {/* map (only matters once the pattern starts) */}
      <div style={{opacity: r.live, transform: `translateX(${panelShake}px)`}}>
        <Tile x={PX} y={PY} w={N * SLOT - SLOT + 270} h={150} fill="var(--tint-lilac)" radius={26} shadow={false} style={{borderStyle: 'dashed'}} />
        <Label x={PX + 20} y={PY - 38}>map  value → index</Label>
        {map.map((m, slot) => {
          const born = r.first((st) => st.map.length > slot);
          const b = r.born(born, 'snappy');
          const from = {x: cx(m.index) - 95, y: Y + 30};
          const to = slotXY(slot);
          const glow = hit && slot === hitSlot;
          return (
            <Chip
              key={slot} x={lerp(from.x, to.x, b)} y={lerp(from.y, to.y, b) - Math.sin(Math.PI * Math.min(1, b)) * 90}
              w={190} h={96} fill={glow ? 'var(--mint)' : 'var(--card)'} scale={glow ? 1 + 0.12 * Math.sin(Math.PI * p) : 0.7 + 0.3 * b} opacity={Math.min(1, b * 2)}
            >
              {m.value} → {m.index}
            </Chip>
          );
        })}
      </div>
      {/* need, and whether the map has it */}
      <div style={{position: 'absolute', left: PX + N * SLOT - SLOT + 310, top: PY + 6, opacity: needVis * r.live, transform: `translateY(${(1 - needVis) * 16}px)`}}>
        <div style={{fontFamily: mono, fontSize: 24, color: 'var(--muted)'}}>need</div>
        <div style={{fontFamily: display, fontWeight: 800, fontSize: 40, whiteSpace: 'nowrap'}}>
          {s.target} − {nums[ns.i]} = <span style={{background: 'var(--hl)', padding: '0 10px', borderRadius: 10}}>{ns.need}</span>
        </div>
        {(miss || hit) && (
          <div style={{marginTop: 8, fontFamily: body, fontWeight: 700, fontSize: 28, color: miss ? 'var(--pen)' : 'var(--ink)', opacity: clamp01(p * 2)}}>
            {miss ? '✕ not in the map' : '✓ in the map'}
          </div>
        )}
      </div>
    </>
  );
};
export const twoSumConfetti = {x: 1170, y: 410};

// ───────────────────────── container with most water ─────────────────────────
const CW_ = {W: 100, GAP: 32, BASE: 680, U: 44};
const cwX = (n: number, i: number) => (1920 - (n * CW_.W + (n - 1) * CW_.GAP)) / 2 + i * (CW_.W + CW_.GAP) + CW_.W / 2;

export const ContainerBrute = ({r}: {r: Run}) => {
  const H: number[] = r.steps[0].state.height;
  const pairs = twoSumPairs(H);
  const q = bruteK(r.t, pairs.length);
  if (q < 0) return null;
  const {W, BASE, U} = CW_;
  const cx = (i: number) => cwX(H.length, i);
  const [i, j] = pairs[q];
  const h = Math.min(H[i], H[j]);
  const area = h * (j - i);
  let best = 0;
  for (let k = 0; k <= q; k++) best = Math.max(best, Math.min(H[pairs[k][0]], H[pairs[k][1]]) * (pairs[k][1] - pairs[k][0]));
  const isBest = area === best;
  return (
    <>
      <div style={{position: 'absolute', left: cx(i), top: BASE - h * U, width: cx(j) - cx(i), height: h * U, background: tok('--sky'), opacity: 0.55, border: '3px solid var(--line)', borderRadius: '8px 8px 0 0'}} />
      {[i, j].map((k) => (
        <Ring key={k} x={cx(k) - W / 2} y={BASE - H[k] * U} w={W} h={H[k] * U} color="--orange" radius={20} />
      ))}
      <div style={{position: 'absolute', left: (cx(i) + cx(j)) / 2, top: BASE + 20, transform: 'translateX(-50%)', fontFamily: display, fontWeight: 800, fontSize: 40, whiteSpace: 'nowrap'}}>
        {h} × {j - i} = {area}
      </div>
      <Tile x={120} y={250} w={330} h={110} fill={isBest ? 'var(--yellow)' : 'var(--card)'} style={{fontSize: 40, gap: 18}}>
        <span style={{fontFamily: body, fontWeight: 700, fontSize: 28}}>best</span>
        {best}
      </Tile>
    </>
  );
};

export const ContainerStage = ({r}: {r: Run}) => {
  const {s, o} = r;
  const H: number[] = s.height;
  const {W, BASE, U} = CW_;
  const cx = (i: number) => cwX(H.length, i);
  const X0 = cx(0) - W / 2;
  const pair = (st: any): [number, number] => (st.phase === 'done' ? st.bestPair : [st.left, st.right]); // eslint-disable-line @typescript-eslint/no-explicit-any
  const hOf = (st: any) => (st.phase === 'setup' ? 0 : Math.min(H[pair(st)[0]], H[pair(st)[1]])); // eslint-disable-line @typescript-eslint/no-explicit-any
  const [ol, or] = pair(o);
  const [nl, nr] = pair(s);
  const L = r.mix(ol, nl), R = r.mix(or, nr);
  const hh = r.mix(hOf(o), hOf(s));
  const water = hh * U * r.live;
  const doneBlend = r.mix(o.phase === 'done' ? 1 : 0, s.phase === 'done' ? 1 : 0);
  // the label shows a real area, never an in-between number
  const shownSt = r.p > 0.5 ? s : o;
  const shownArea = shownSt.phase === 'setup' ? null : shownSt.phase === 'done' ? shownSt.best : shownSt.area;
  const shorter = s.moving === 'left' ? s.left : s.moving === 'right' ? s.right : null;
  const pulse = s.newBest ? 1 + 0.14 * Math.sin(Math.PI * r.p) : 1;
  const xL = lerp(cx(Math.floor(L)), cx(Math.ceil(L)), L - Math.floor(L));
  const xR = lerp(cx(Math.floor(R)), cx(Math.ceil(R)), R - Math.floor(R));
  const topOf = (i: number) => BASE - H[i] * U;
  const lh = lerp(H[ol], H[nl], r.p), rh = lerp(H[or], H[nr], r.p);
  // while moving the shorter wall: what moving the taller one instead could ever hold
  // (the shorter wall stays put, the taller one steps in: narrower, and still no taller than the short wall)
  const ghost = s.phase === 'move' && shorter != null && s.right - s.left > 1 ? (() => {
    const hS = H[shorter];
    const [a, b] = s.moving === 'left' ? [s.left, s.right - 1] : [s.left + 1, s.right];
    return {x1: cx(a), x2: cx(b), h: hS, most: hS * (b - a)};
  })() : null;
  const ghostOn = ghost ? clamp01((r.t - r.T(r.k) - 0.3) * 2) : 0;
  return (
    <>
      {/* water */}
      <div
        style={{
          position: 'absolute', left: xL, top: BASE - water, width: Math.max(0, xR - xL), height: water,
          background: colorMix(tok('--sky'), tok('--mint'), doneBlend), opacity: 0.85, border: '3px solid var(--line)', borderRadius: '8px 8px 0 0',
        }}
      />
      {ghost && (
        <div style={{position: 'absolute', left: ghost.x1, top: BASE - ghost.h * U, width: ghost.x2 - ghost.x1, height: ghost.h * U, border: `4px dashed ${tok('--pen')}`, borderRadius: '8px 8px 0 0', opacity: ghostOn}} />
      )}
      {H.map((h, i) => {
        const inside = i >= nl && i <= nr;
        const wall = i === nl || i === nr;
        const flash = shorter === i ? 0.5 + 0.5 * Math.sin(r.t * 14) : 0;
        const fill = wall && r.live > 0.5 ? colorMix(tok('--lilac'), tok('--orange'), flash) : inside || s.phase === 'setup' ? tok('--card') : tok('--past-bg');
        const pp = r.pop(i, 9);
        return (
          <div key={i} style={{opacity: Math.min(1, pp * 1.5) * (inside || s.phase === 'setup' ? 1 : 0.55), transformOrigin: `${cx(i)}px ${BASE}px`, transform: `scaleY(${pp})`}}>
            <Tile x={cx(i) - W / 2} y={topOf(i)} w={W} h={h * U} fill={fill} radius={14} shadow={false} style={{alignItems: 'flex-start', paddingTop: 10, fontSize: 30, borderBottomWidth: 0, borderBottomLeftRadius: 0, borderBottomRightRadius: 0}}>
              {h}
            </Tile>
          </div>
        );
      })}
      <div style={{position: 'absolute', left: X0 - 20, top: BASE, width: H.length * (W + CW_.GAP) - CW_.GAP + 40, height: 0, borderTop: '4px solid var(--line)'}} />
      {shownArea != null && r.t < 48.4 && (
        <div style={{position: 'absolute', left: (xL + xR) / 2, top: BASE + 18, transform: 'translateX(-50%)', padding: '2px 22px', borderRadius: 18, border: '3px solid var(--line)', background: 'var(--card)', boxShadow: 'var(--shadow-sm)', fontFamily: display, fontWeight: 800, fontSize: 40, whiteSpace: 'nowrap'}}>
          <span style={{fontFamily: body, fontWeight: 700, fontSize: 26, marginRight: 12}}>area</span>
          {shownArea}
        </div>
      )}
      {ghost && (
        <div style={{position: 'absolute', left: 960, top: BASE + 84, transform: 'translateX(-50%)', fontFamily: body, fontWeight: 700, fontSize: 28, color: 'var(--pen)', whiteSpace: 'nowrap', opacity: ghostOn}}>
          Moving the taller wall instead (dashed) could hold at most {ghost.most}.
        </div>
      )}
      {s.phase !== 'done' && (
        <>
          <Tag x={xL} y={BASE - lh * U - 84 - (shorter === s.left && s.phase === 'move' ? 8 * Math.sin(r.t * 14) : 0)} label="L" fill="var(--yellow)" opacity={r.live} />
          <Tag x={xR} y={BASE - rh * U - 84 - (shorter === s.right && s.phase === 'move' ? 8 * Math.sin(r.t * 14) : 0)} label="R" fill="var(--peach)" opacity={r.live} />
        </>
      )}
      {/* best */}
      <div style={{opacity: r.live, transform: `scale(${pulse})`, transformOrigin: '285px 305px'}}>
        <Tile x={120} y={250} w={330} h={110} fill={s.newBest || s.phase === 'done' ? 'var(--yellow)' : 'var(--card)'} style={{fontSize: 40, gap: 18}}>
          <span style={{fontFamily: body, fontWeight: 700, fontSize: 28}}>best</span>
          {s.best}
        </Tile>
      </div>
      {s.phase === 'move' && (
        <div style={{position: 'absolute', left: s.moving === 'left' ? xL + 70 : xR - 190, top: BASE - Math.min(lh, rh) * U - 130, fontFamily: display, fontSize: 60, color: 'var(--pen)', opacity: clamp01(r.p * 2)}}>
          {s.moving === 'left' ? '→' : '←'}
        </div>
      )}
    </>
  );
};
export const containerConfetti = {x: 960, y: 480};

// ───────────────────────── valid parentheses ─────────────────────────
const VP = {W: 110, GAP: 24, Y: 335};
const vpX = (n: number, i: number) => (1920 - (n * VP.W + (n - 1) * VP.GAP)) / 2 + i * (VP.W + VP.GAP) + VP.W / 2;
const PAIR: Record<string, string> = {')': '(', ']': '[', '}': '{'};
type Read = {pass: number; idx: number; removes: [number, number] | null};
/** Brute force: read the whole string, strip every adjacent matched pair, repeat. */
export const stripReads = (str: string): Read[] => {
  const reads: Read[] = [];
  let alive = str.split('').map((_, i) => i);
  let pass = 0;
  while (alive.length) {
    pass++;
    const removed = new Set<number>();
    let prevIdx = -1;
    for (const idx of alive) {
      reads.push({pass, idx, removes: null});
      if (prevIdx >= 0 && PAIR[str[idx]] === str[prevIdx]) {
        reads[reads.length - 1].removes = [prevIdx, idx];
        removed.add(prevIdx);
        removed.add(idx);
        prevIdx = -1;
      } else prevIdx = idx;
    }
    if (!removed.size) break;
    alive = alive.filter((x) => !removed.has(x));
  }
  return reads;
};

export const ParenBrute = ({r}: {r: Run}) => {
  const str: string = r.steps[0].state.s;
  const reads = stripReads(str);
  const q = bruteK(r.t, reads.length);
  if (q < 0) return null;
  const cx = (i: number) => vpX(str.length, i);
  const cur = reads[q];
  const gone = new Map<number, number>(); // index -> read that removed it
  reads.slice(0, q + 1).forEach((rd, k) => rd.removes?.forEach((x) => gone.set(x, k)));
  return (
    <>
      {str.split('').map((ch, i) => {
        const k = gone.get(i);
        if (k == null) return null;
        const fresh = reads[k].pass === cur.pass;
        return (
          <Tile key={i} x={cx(i) - VP.W / 2} y={VP.Y} w={VP.W} h={130} fill={fresh ? 'var(--mint)' : 'var(--paper)'} shadow={false} style={{fontSize: 64, fontFamily: mono, fontWeight: 500, borderStyle: fresh ? 'solid' : 'dashed', borderColor: fresh ? 'var(--line)' : 'var(--past-line)', color: fresh ? undefined : 'var(--faint)'}}>
            {ch}
          </Tile>
        );
      })}
      <Ring x={cx(cur.idx) - VP.W / 2} y={VP.Y} w={VP.W} h={130} color={cur.removes ? '--mint' : '--orange'} />
      <Tag x={cx(cur.idx)} y={250} label="read" />
      <Verdict ok={null} pop={1} w={620}>
        <span style={{fontFamily: body, fontWeight: 700, fontSize: 32}}>pass {cur.pass}</span>
        <span style={{fontFamily: mono, fontWeight: 500}}>{cur.removes ? `strip ${str[cur.removes[0]]}${str[cur.removes[1]]}` : `read ${str[cur.idx]}`}</span>
      </Verdict>
    </>
  );
};

export const ParenStage = ({r}: {r: Run}) => {
  const {s, o, p} = r;
  const str: string = s.s;
  const W = VP.W, Y = VP.Y;
  const cx = (i: number) => vpX(str.length, i);
  const iPos = (st: any) => (st.i < 0 ? cx(0) - 150 : cx(st.i)); // eslint-disable-line @typescript-eslint/no-explicit-any
  const tagX = r.mix(iPos(o), iPos(s));
  const hop = Math.sin(Math.PI * p) * 22;
  const BX = 960, BW = 260, BOT = 700, TH = 64, TG = 8;
  const DEPTH = Math.max(3, ...r.steps.map((st) => st.state.stack.length));
  const slotY = (rank: number) => BOT - (rank + 1) * (TH + TG);
  const items: {from: number; ch: string; ro: number; rn: number}[] = [];
  (o.stack as any[]).forEach((e, rk) => items.push({from: e.from, ch: e.ch, ro: rk, rn: -1})); // eslint-disable-line @typescript-eslint/no-explicit-any
  (s.stack as any[]).forEach((e, rk) => { // eslint-disable-line @typescript-eslint/no-explicit-any
    const f = items.find((x) => x.from === e.from);
    if (f) f.rn = rk;
    else items.push({from: e.from, ch: e.ch, ro: -1, rn: rk});
  });
  const verdictIn = s.verdict ? r.born(r.k, 'bouncy') : 0;
  const topItem = (s.stack as any[]).length ? (s.stack as any[])[(s.stack as any[]).length - 1] : null; // eslint-disable-line @typescript-eslint/no-explicit-any
  return (
    <>
      {str.split('').map((ch, i) => {
        const matched = (s.matched as number[]).includes(i);
        const wasMatched = (o.matched as number[]).includes(i);
        const mBlend = matched ? (wasMatched ? 1 : p) : 0;
        const cur = i === s.i;
        const fill = colorMix(cur ? tok('--yellow') : tok('--card'), tok('--mint'), mBlend);
        const pp = r.pop(i, str.length);
        return (
          <div key={i} style={{...popStyle(pp), position: 'absolute', left: 0, top: 0}}>
            <Tile x={cx(i) - W / 2} y={Y - (matched && !wasMatched ? Math.sin(Math.PI * p) * 18 : 0)} w={W} h={130} fill={fill} style={{fontSize: 64, fontFamily: mono, fontWeight: 500}}>
              {ch}
            </Tile>
          </div>
        );
      })}
      <Tag x={tagX} y={250 - hop} label="i" opacity={(s.i < 0 ? 0 : 1) * r.live} />
      {/* bucket */}
      <div style={{opacity: r.live}}>
        <div style={{position: 'absolute', left: BX - BW / 2, top: BOT - DEPTH * (TH + TG) - 10, width: BW, height: DEPTH * (TH + TG) + 10, border: '4px solid var(--line)', borderTop: 'none', borderRadius: '0 0 22px 22px', background: 'var(--tint-lilac)'}} />
        <Label x={BX - BW / 2 - 40} y={BOT - 60} align="right" size={28}>stack</Label>
        {topItem && <Label x={BX + BW / 2 + 30} y={slotY((s.stack as unknown[]).length - 1) + 14} size={28}>← top</Label>}
      </div>
      {items.map((it) => {
        const entering = it.ro < 0;
        const leaving = it.rn < 0;
        let x = BX - 100, y: number, op = 1, sc = 1;
        if (entering) {
          const e = r.born(r.k, 'bouncy');
          x = lerp(cx(it.from) - 100, BX - 100, Math.min(1, p));
          y = lerp(Y + 60, slotY(it.rn), e) - Math.sin(Math.PI * Math.min(1, p)) * 70;
          op = Math.min(1, p * 3);
        } else if (leaving) {
          y = lerp(slotY(it.ro), Y + 70, p);
          x = lerp(BX - 100, cx(s.i) - 100, p);
          op = 1 - clamp01((p - 0.55) / 0.45);
          sc = 1 - 0.3 * p;
        } else {
          y = lerp(slotY(it.ro), slotY(it.rn), p);
        }
        return (
          <Tile key={`${it.from}-${it.ch}`} x={x} y={y} w={200} h={TH} fill="var(--peach)" radius={16} style={{opacity: op * r.live, transform: `scale(${sc})`, fontSize: 36, fontFamily: mono, fontWeight: 500}}>
            {it.ch}
          </Tile>
        );
      })}
      {s.verdict && (
        <Tile x={1300} y={520} w={340} h={110} fill="var(--mint)" style={{fontSize: 40, opacity: clamp01(verdictIn * 2), transform: `scale(${0.6 + 0.4 * verdictIn}) rotate(${(1 - clamp01(verdictIn)) * 6}deg)`}}>
          valid ✓
        </Tile>
      )}
    </>
  );
};
export const parenConfetti = {x: 960, y: 560};

// ───────────────────────── find minimum in rotated array ─────────────────────────
const FM = {W: 130, GAP: 24, BASE: 640};
const fmX = (n: number, i: number) => (1920 - (n * FM.W + (n - 1) * FM.GAP)) / 2 + i * (FM.W + FM.GAP) + FM.W / 2;
const fmH = (v: number) => 56 + v * 38;

export const FindMinBrute = ({r}: {r: Run}) => {
  const nums: number[] = r.steps[0].state.nums;
  const q = bruteK(r.t, nums.length);
  if (q < 0) return null;
  const cx = (i: number) => fmX(nums.length, i);
  const min = Math.min(...nums.slice(0, q + 1));
  const at = nums.indexOf(min);
  return (
    <>
      <Ring x={cx(at) - FM.W / 2} y={FM.BASE - fmH(nums[at])} w={FM.W} h={fmH(nums[at])} color="--mint" radius={20} />
      <Tag x={cx(q)} y={FM.BASE + 18} label="read" dir="up" />
      <Tile x={120} y={380} w={300} h={120} fill="var(--card)" style={{fontSize: 44, flexDirection: 'column', gap: 0}}>
        <span style={{fontFamily: mono, fontWeight: 500, fontSize: 22, color: 'var(--muted)'}}>smallest so far</span>
        {min}
      </Tile>
    </>
  );
};

export const FindMinStage = ({r}: {r: Run}) => {
  const {s, o} = r;
  const nums: number[] = s.nums;
  const W = FM.W, BASE = FM.BASE;
  const cx = (i: number) => fmX(nums.length, i);
  const X0 = cx(0) - W / 2;
  const lo = r.mix(o.lo, s.lo), hi = r.mix(o.hi, s.hi);
  const xAt = (v: number) => lerp(cx(Math.floor(v)), cx(Math.min(nums.length - 1, Math.ceil(v))), v - Math.floor(v));
  const out = (st: any, i: number) => i < st.lo || i > st.hi; // eslint-disable-line @typescript-eslint/no-explicit-any
  const midOn = visBlend(r, (st) => st.mid != null);
  const mid = s.mid != null ? s.mid : o.mid;
  const midFrom = o.mid != null ? o.mid : s.mid;
  const midX = s.mid != null && o.mid != null ? r.mix(cx(midFrom), cx(s.mid)) : cx(mid ?? 0);
  // the comparison on show is the one the latest probe made (hi moves right after it)
  let probe = -1;
  for (let i = 0; i <= Math.max(r.k, r.prev); i++) if (r.steps[i].state.phase === 'probe') probe = i;
  const ps = probe >= 0 ? r.steps[probe].state : null;
  const same = s.lo === s.hi;
  const ans = s.answer != null;
  const drop = nums.findIndex((v, i) => i > 0 && v < nums[i - 1]);
  return (
    <>
      {/* live window */}
      <div
        style={{
          position: 'absolute', left: xAt(lo) - W / 2 - 14, top: 290, width: xAt(hi) - xAt(lo) + W + 28, height: BASE - 290 + 22,
          border: '4px dashed var(--lilac)', borderRadius: 26, background: 'var(--tint-lilac)', opacity: 0.55 * r.live,
        }}
      />
      {nums.map((v, i) => {
        const oo = out(o, i) ? 1 : 0, nn = out(s, i) ? 1 : 0;
        const dim = r.mix(oo, nn);
        const isMid = i === s.mid;
        const isAns = ans && i === s.lo;
        const fill = isAns ? 'var(--mint)' : isMid ? 'var(--yellow)' : colorMix(tok('--card'), tok('--past-bg'), dim);
        const pp = r.pop(i, nums.length);
        return (
          <div key={i} style={{opacity: Math.min(1, pp * 1.5) * (1 - 0.6 * dim), transformOrigin: `${cx(i)}px ${BASE}px`, transform: `scaleY(${pp}) ${isAns ? `scale(${1 + 0.06 * Math.sin(Math.PI * r.pb)})` : ''}`}}>
            <Tile x={cx(i) - W / 2} y={BASE - fmH(v)} w={W} h={fmH(v)} fill={fill} radius={16} shadow={false} style={{alignItems: 'flex-start', paddingTop: 10, fontSize: 40, borderBottomWidth: 0, borderBottomLeftRadius: 0, borderBottomRightRadius: 0}}>
              {v}
            </Tile>
          </div>
        );
      })}
      <div style={{position: 'absolute', left: X0 - 20, top: BASE, width: nums.length * (W + FM.GAP) - FM.GAP + 40, borderTop: '4px solid var(--line)'}} />
      {/* the drop: where the rotation wraps around */}
      {drop > 0 && (
        <div style={{opacity: r.live}}>
          <div style={{position: 'absolute', left: (cx(drop - 1) + cx(drop)) / 2 - 2, top: BASE - fmH(nums[drop - 1]) - 10, height: fmH(nums[drop - 1]) - fmH(nums[drop]) + 10, borderLeft: `5px dashed ${tok('--pen')}`}} />
          <div style={{position: 'absolute', left: (cx(drop - 1) + cx(drop)) / 2, top: BASE - fmH(nums[drop - 1]) - 50, transform: 'translateX(-50%)', fontFamily: body, fontWeight: 700, fontSize: 26, color: 'var(--pen)', whiteSpace: 'nowrap'}}>drop ↓</div>
        </div>
      )}
      {!ans && (
        <>
          <Tag x={xAt(lo) - (same ? 46 : 0)} y={BASE - fmH(nums[Math.round(lo)]) - 86} label="lo" fill="var(--yellow)" opacity={r.live} />
          <Tag x={xAt(hi) + (same ? 46 : 0)} y={BASE - fmH(nums[Math.round(hi)]) - 86} label="hi" fill="var(--peach)" opacity={r.live} />
        </>
      )}
      {midOn > 0.01 && <Tag x={midX} y={BASE + 18} label="mid" fill="var(--sky)" dir="up" opacity={midOn} />}
      {/* compare: mid against the right end, as the probe saw it */}
      {ps && (
        <div style={{opacity: midOn, transform: `translateY(${(1 - midOn) * 16}px)`}}>
          <Tile x={110} y={380} w={310} h={120} fill="var(--card)" style={{fontSize: 44}}>
            {nums[ps.mid]} <span style={{color: 'var(--pen)', margin: '0 14px'}}>{ps.compare === '>' ? '>' : '≤'}</span> {nums[ps.hi]}
          </Tile>
          <Label x={265} y={346} align="center">mid vs right end</Label>
        </div>
      )}
      {ans && (
        <Tile x={1500} y={380} w={310} h={120} fill="var(--mint)" style={{fontSize: 40, transform: `scale(${0.6 + 0.4 * r.pb})`, opacity: clamp01(r.pb * 2)}}>
          min = {s.answer}
        </Tile>
      )}
    </>
  );
};
export const findMinConfetti = {x: 960, y: 520};

// ───────────────────────── jump game ─────────────────────────
type JumpGeo = {W: number; GAP: number; Y: number};
const JM: JumpGeo = {W: 150, GAP: 40, Y: 300};
const JF: JumpGeo = {W: 104, GAP: 30, Y: 668};
const jX = (g: JumpGeo, n: number, i: number) => (1920 - (n * g.W + (n - 1) * g.GAP)) / 2 + i * (g.W + g.GAP) + g.W / 2;
/** Brute force: every route of jumps from stone 0, one jump at a time. */
export const jumpRoutes = (nums: number[]): {from: number; to: number; route: number}[] => {
  const last = nums.length - 1;
  const jumps: {from: number; to: number; route: number}[] = [];
  let route = 0;
  const walk = (i: number, path: [number, number][]) => {
    if (i >= last || nums[i] === 0) {
      path.forEach(([a, b]) => jumps.push({from: a, to: b, route}));
      route++;
      return;
    }
    for (let j = 1; j <= nums[i]; j++) walk(Math.min(last, i + j), [...path, [i, Math.min(last, i + j)]]);
  };
  walk(0, []);
  return jumps;
};

export const JumpBrute = ({r}: {r: Run}) => {
  const nums: number[] = r.steps[0].state.nums;
  const jumps = jumpRoutes(nums);
  const q = bruteK(r.t, jumps.length);
  if (q < 0) return null;
  const cx = (i: number) => jX(JM, nums.length, i);
  const route = jumps[q].route;
  const mine = jumps.map((j, k) => ({...j, k})).filter((j) => j.route === route && j.k <= q);
  const Y = JM.Y;
  return (
    <>
      <Svg>
        {mine.map((j) => {
          const d = bruteSpr(r.t, j.k, jumps.length, 'soft');
          return (
            <path key={j.k} d={`M ${cx(j.from)} ${Y - 6} Q ${(cx(j.from) + cx(j.to)) / 2} ${Y - 40 - 70 * (j.to - j.from)} ${cx(j.to)} ${Y - 6}`}
              fill="none" stroke={tok('--orange')} strokeWidth={7} strokeLinecap="round" strokeDasharray="600" strokeDashoffset={(1 - Math.min(1, d)) * 600} />
          );
        })}
      </Svg>
      <Tag x={cx(mine[mine.length - 1].to)} y={Y + JM.W + 50} label={`route ${route + 1}`} dir="up" />
    </>
  );
};

type JumpProps = {r: Run; split?: number};
const JumpRow = ({r, s, o, p, g, live, label}: {r: Run; s: any; o: any; p: number; g: JumpGeo; live: number; label: (i: number, end: boolean) => string}) => { // eslint-disable-line @typescript-eslint/no-explicit-any
  const nums: number[] = s.nums;
  const N = nums.length;
  const {W, Y} = g;
  const cx = (i: number) => jX(g, N, i);
  const posI = (st: any) => (st.i == null ? (st.phase === 'done' && st.verdict ? N - 1 : st.phase === 'done' ? st.stuckAt ?? 0 : 0) : st.i); // eslint-disable-line @typescript-eslint/no-explicit-any
  const frogX = lerp(cx(posI(o)), cx(posI(s)), p);
  const hop = Math.sin(Math.PI * p) * (posI(o) === posI(s) ? 0 : 30);
  const reachC = (st: any) => Math.min(st.reach, N - 1); // eslint-disable-line @typescript-eslint/no-explicit-any
  const reach = lerp(reachC(o), reachC(s), p);
  const over = lerp(o.reach >= N - 1 ? 1 : 0, s.reach >= N - 1 ? 1 : 0, p);
  const endX = lerp(cx(Math.floor(reach)), cx(Math.min(N - 1, Math.ceil(reach))), reach - Math.floor(reach)) + W / 2 + over * 46;
  const arcTo = s.i != null ? Math.min(N - 1, s.i + nums[s.i]) : null;
  const showArc = s.i != null && (s.phase === 'extend' || s.phase === 'noGain');
  const stuck = s.stuckAt != null ? s.stuckAt : null;
  const bandY = Y + W + 50;
  return (
    <>
      <Svg>
        {showArc && arcTo != null && arcTo !== s.i && (
          <path
            d={`M ${cx(s.i)} ${Y - 6} Q ${(cx(s.i) + cx(arcTo)) / 2} ${Y - 30 - 70 * Math.min(2, arcTo - s.i)} ${cx(arcTo)} ${Y - 6}`}
            fill="none" stroke={s.phase === 'extend' ? tok('--orange') : tok('--past-line')} strokeWidth={7} strokeLinecap="round"
            strokeDasharray="600" strokeDashoffset={(1 - p) * 600}
          />
        )}
      </Svg>
      {nums.map((v, i) => {
        const cover = live > 0.5 ? clamp01(reach - i + 0.5) : 1;
        const isStuck = stuck === i;
        const fill = isStuck ? tok('--peach') : colorMix(tok('--card'), tok('--tint-mint'), cover);
        const pp = r.pop(i, N);
        return (
          <div key={i} style={{...popStyle(pp), position: 'absolute', left: 0, top: 0}}>
            <Tile x={cx(i) - W / 2} y={Y} w={W} h={W} fill={fill} style={{fontSize: W * 0.42, opacity: 0.5 + 0.5 * Math.max(cover, isStuck ? 1 : 0), borderColor: cover > 0.5 || isStuck ? 'var(--line)' : 'var(--past-line)', borderStyle: cover > 0.5 || isStuck ? 'solid' : 'dashed'}}>
              {v}
            </Tile>
            <Label x={cx(i)} y={Y + W + 8} align="center" size={W > 120 ? 24 : 20}>{label(i, i === N - 1)}</Label>
          </div>
        );
      })}
      {/* reach band */}
      <div style={{opacity: live}}>
        <div style={{position: 'absolute', left: cx(0) - W / 2, top: bandY, height: W > 120 ? 40 : 30, width: Math.max(0, endX - (cx(0) - W / 2)), background: 'var(--mint)', border: '3px solid var(--line)', borderRadius: 22, boxShadow: 'var(--shadow-sm)'}} />
        <Label x={endX + 18} y={bandY + 2} size={W > 120 ? 28 : 22}>reach {s.reach}</Label>
      </div>
      <Tag x={frogX} y={Y - (W > 120 ? 76 : 66) - hop} label="you" fill="var(--yellow)" opacity={live} scale={W > 120 ? 1 : 0.85} />
    </>
  );
};

export const JumpStage = ({r, split}: JumpProps) => {
  const M = split ?? r.steps.length;
  const mainLast = r.steps[M - 1].state;
  const inMain = (i: number) => i < M;
  const ms = inMain(r.k) ? r.s : mainLast;
  const mo = inMain(r.prev) ? r.o : mainLast;
  const mp = inMain(r.k) || !inMain(r.prev) ? r.p : 1;
  const hasFail = M < r.steps.length;
  const failFirst = hasFail ? r.steps[M].state : null;
  const fs = hasFail ? (inMain(r.k) ? failFirst : r.s) : null;
  const fo = hasFail ? (inMain(r.prev) ? failFirst : r.o) : null;
  const failOn = hasFail ? clamp01((r.t - r.T(M) + 0.6) * 1.6) : 0;
  const mainVerdict = ms.verdict != null;
  const failVerdict = fs?.verdict === false;
  return (
    <>
      <JumpRow r={r} s={ms} o={mo} p={mp} g={JM} live={r.live} label={(i, end) => (end ? 'end ⚑' : `stone ${i}`)} />
      {mainVerdict && (
        <Tile x={1500} y={250} w={320} h={96} fill="var(--mint)" style={{fontSize: 32, transform: `scale(${0.6 + 0.4 * Math.min(1, r.born(r.first((st) => st.verdict === true), 'bouncy'))})`}}>
          reachable ✓
        </Tile>
      )}
      {hasFail && fs && fo && (
        <div style={{opacity: failOn}}>
          <JumpRow r={r} s={fs} o={fo} p={inMain(r.k) ? 1 : r.p} g={JF} live={1} label={(i, end) => (end ? 'end ⚑' : `${i}`)} />
          {failVerdict && (
            <Tile x={1500} y={640} w={320} h={90} fill="var(--peach)" style={{fontSize: 30, transform: `scale(${0.6 + 0.4 * Math.min(1, r.pb)})`}}>
              stuck ✕
            </Tile>
          )}
        </div>
      )}
    </>
  );
};
export const jumpConfetti = {x: 1640, y: 300};

// ───────────────────────── house robber ─────────────────────────
// Houses sit right above the dp cell that covers them: house i over dp[i + 1].
const HR = {P: 170, W: 140, HY: 270, DY: 600};
const hrX0 = (n: number) => (1920 - ((n + 1) * HR.P - (HR.P - HR.W))) / 2;
const dpX = (n: number, j: number) => hrX0(n) + j * HR.P;
const houseX = (n: number, i: number) => dpX(n, i + 1);

export const RobberBrute = ({r}: {r: Run}) => {
  const nums: number[] = r.steps[0].state.nums;
  const N = nums.length;
  const total = 1 << N;
  const q = bruteK(r.t, total);
  if (q < 0) return null;
  const mask = q;
  const picked = nums.map((_, i) => (mask >> i) & 1);
  const clash = picked.findIndex((v, i) => v && picked[i + 1]);
  const sum = nums.reduce((a, v, i) => a + (picked[i] ? v : 0), 0);
  let best = 0;
  for (let m = 0; m <= q; m++) {
    let ok = true, t = 0;
    for (let i = 0; i < N; i++) if ((m >> i) & 1) {
      if ((m >> (i + 1)) & 1) ok = false;
      t += nums[i];
    }
    if (ok) best = Math.max(best, t);
  }
  return (
    <>
      {picked.map((v, i) => v ? <Ring key={i} x={houseX(N, i)} y={HR.HY} w={HR.W} h={130} color={clash >= 0 && (i === clash || i === clash + 1) ? '--orange' : '--yellow'} /> : null)}
      <Verdict y={470} ok={clash < 0 ? (sum === best && sum > 0 ? true : null) : false} pop={bruteSpr(r.t, q, total, 'bouncy')} w={640}>
        {clash >= 0 ? <span style={{fontFamily: body, fontWeight: 700, fontSize: 34}}>neighbours {clash} and {clash + 1}</span> : <span>haul {sum}</span>}
      </Verdict>
      <Tile x={120} y={250} w={250} h={100} fill="var(--card)" style={{fontSize: 40, gap: 14}}>
        <span style={{fontFamily: body, fontWeight: 700, fontSize: 26}}>best</span>
        {best}
      </Tile>
    </>
  );
};

export const RobberStage = ({r}: {r: Run}) => {
  const {s, o, p} = r;
  const nums: number[] = s.nums;
  const N = nums.length;
  const {W, HY, DY} = HR;
  const DW = W;
  const compare = (st: any) => st.phase === 'compare' || st.phase === 'decide'; // eslint-disable-line @typescript-eslint/no-explicit-any
  const vis = visBlend(r, compare);
  const cs = compare(s) ? s : o;
  const decide = s.phase === 'decide';
  const take = s.choice === 'take', skip = s.choice === 'skip';
  const robbed: number[] | null = s.robbed;
  const curHouse = s.i != null ? s.i - 1 : null;
  const dpPrev2 = cs.i != null ? cs.dp[cs.i - 2] ?? 0 : 0;
  const chipY = 455;
  const CW = 330;
  const chipX = (k: number) => 960 + (k === 0 ? -CW - 20 : 20);
  const ci: number = cs.i ?? 2;
  // arrows: dp[i-1] feeds "skip", dp[i-2] feeds "take"
  const arrow = (j: number, k: number, color: string) => {
    if (j < 0) return null;
    const x1 = dpX(N, j) + DW / 2, y1 = DY - 4;
    const x2 = chipX(k) + CW / 2 + (k === 0 ? -60 : 60), y2 = chipY + 100;
    return <path key={`${j}-${k}`} d={`M ${x1} ${y1} Q ${x1} ${(y1 + y2) / 2} ${x2} ${y2}`} fill="none" stroke={tok(color)} strokeWidth={6} strokeLinecap="round" strokeDasharray="12 10" markerEnd="url(#hr-ah)" opacity={vis} />;
  };
  return (
    <>
      <Svg>
        <defs>
          <marker id="hr-ah" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
            <path d="M0 0 L10 5 L0 10 z" fill={tok('--pen')} />
          </marker>
        </defs>
        {cs.i != null && vis > 0.01 && [arrow(ci - 1, 0, '--pen'), arrow(ci - 2, 1, '--pen')]}
      </Svg>
      {nums.map((v, i) => {
        const pp = r.pop(i, N);
        const cur = i === curHouse;
        const isRob = robbed?.includes(i);
        const fill = isRob ? 'var(--mint)' : cur ? 'var(--yellow)' : 'var(--card)';
        return (
          <div key={i} style={{...popStyle(pp), position: 'absolute', left: 0, top: 0}}>
            <Tile x={houseX(N, i)} y={HY - (cur ? 12 : 0) - (isRob ? Math.sin(Math.PI * r.pb) * 14 : 0)} w={W} h={130} fill={fill} style={{fontSize: 56}}>
              {v}
            </Tile>
            <Label x={houseX(N, i) + W / 2} y={HY + 140} align="center">house {i}</Label>
          </div>
        );
      })}
      {/* skip / take */}
      <div style={{opacity: vis, transform: `translateY(${(1 - vis) * 18}px)`}}>
        {[0, 1].map((k) => {
          const win = decide && ((k === 0 && skip) || (k === 1 && take));
          const lose = decide && !win;
          return (
            <Chip
              key={k} x={chipX(k)} y={chipY} w={CW} h={96} fill={win ? 'var(--mint)' : 'var(--card)'}
              opacity={lose ? 0.45 : 1} scale={win ? 1 + 0.08 * Math.sin(Math.PI * p) : 1}
            >
              <span style={{fontFamily: body, fontWeight: 700, fontSize: 28, marginRight: 14}}>{k === 0 ? 'skip' : 'take'}</span>
              {k === 0 ? cs.skip : `${dpPrev2}+${nums[(cs.i ?? 1) - 1]} = ${cs.take}`}
            </Chip>
          );
        })}
      </div>
      {/* dp table */}
      <div style={{opacity: r.live}}>
        <Label x={dpX(N, 0) - 30} y={DY + 34} align="right" size={30}>dp</Label>
        <Label x={960} y={DY + 150} align="center" size={24}>dp[j] = best haul from the first j houses</Label>
        {Array.from({length: N + 1}).map((_, j) => {
          const v = s.dp[j];
          const had = o.dp[j] != null;
          const flying = !had && v != null && j > 0;
          const cur = j === s.i;
          const feeds = cs.i != null && vis > 0.5 && (j === ci - 1 || j === ci - 2);
          const fromX = chipX(take ? 1 : 0) + CW / 2 - DW / 2;
          const fill = v == null ? 'var(--card-2)' : cur && decide ? 'var(--mint)' : feeds ? 'var(--tint-yellow)' : 'var(--card)';
          return (
            <Tile key={j} x={dpX(N, j)} y={DY} w={DW} h={100} fill={fill} radius={20} style={{fontSize: 44, borderColor: cur ? 'var(--orange)' : 'var(--line)', borderStyle: v == null ? 'dashed' : 'solid', transform: `scale(${flying ? 0.85 + 0.15 * r.pb : 1})`}}>
              {v != null && !flying && v}
              {flying && p > 0.7 && v}
              <span style={{position: 'absolute', bottom: -34, fontFamily: mono, fontWeight: 400, fontSize: 22, color: 'var(--faint)'}}>{j}</span>
              {flying && (
                <span style={{position: 'absolute', left: lerp(fromX - dpX(N, j), 0, p), top: lerp(chipY - DY, 0, p), opacity: 1 - clamp01((p - 0.6) / 0.4), fontSize: 44}}>{v}</span>
              )}
            </Tile>
          );
        })}
      </div>
      {robbed && (
        <div style={{position: 'absolute', left: 0, right: 0, top: 480, textAlign: 'center', fontFamily: display, fontWeight: 800, fontSize: 44, opacity: clamp01(r.pb * 2), transform: `scale(${0.7 + 0.3 * r.pb})`}}>
          haul = <span style={{background: 'var(--yellow)', color: 'var(--on-accent)', padding: '0 16px', borderRadius: 14}}>{s.dp[N]}</span>
        </div>
      )}
    </>
  );
};
export const robberConfetti = {x: 960, y: 520};

// ───────────────────────── number of 1 bits ─────────────────────────
const NB = {W: 110, H: 104, GAP: 14, X0: 440, Y: [300, 440, 580], CX: 1600};
const nbX = (i: number) => NB.X0 + i * (NB.W + NB.GAP);
const nbBits = (n: number) => Array.from({length: 8}, (_, i) => (n >> (7 - i)) & 1);

const BitRow = ({y, label, value, lowest = -1, opacity = 1}: {y: number; label: string; value: number; lowest?: number; opacity?: number}) => (
  <div style={{opacity}}>
    <Label x={NB.X0 - 26} y={y + 34} align="right" size={30}>{label} = {value}</Label>
    {nbBits(value).map((bit, i) => (
      <Tile key={i} x={nbX(i)} y={y} w={NB.W} h={NB.H} radius={18} fill={7 - i === lowest ? 'var(--peach)' : bit ? 'var(--yellow)' : 'var(--card)'} shadow={bit === 1} style={{fontSize: 48}}>
        {bit}
      </Tile>
    ))}
  </div>
);

/** Brute force: check all eight bits, from the right, zeros included. */
export const BitsBrute = ({r}: {r: Run}) => {
  const bits = nbBits(r.steps[0].state.n);
  const q = bruteK(r.t, bits.length);
  if (q < 0) return null;
  const i = bits.length - 1 - q;
  return (
    <>
      <Ring x={nbX(i) - 10} y={NB.Y[0] - 10} w={NB.W + 20} h={NB.H + 20} color="--orange" radius={24} />
      <Tag x={nbX(i) + NB.W / 2} y={NB.Y[0] + NB.H + 22} label="check" dir="up" />
      <Tile x={NB.CX - 130} y={NB.Y[0]} w={260} h={150} fill="var(--card)" style={{fontSize: 64, flexDirection: 'column', gap: 0}}>
        <span style={{fontFamily: mono, fontWeight: 500, fontSize: 24, color: 'var(--muted)'}}>ones so far</span>
        {bits.slice(i).filter(Boolean).length}
      </Tile>
    </>
  );
};

export const BitsStage = ({r}: {r: Run}) => {
  const {s} = r;
  const lowest = s.lowest ?? -1;
  const belowOn = visBlend(r, (st) => st.below != null);
  const resultOn = visBlend(r, (st) => st.result != null);
  const below = s.below ?? r.o.below;
  const result = s.result ?? r.o.result;
  const bumped = s.phase === 'count';
  return (
    <>
      <div style={popStyle(r.pop(0, 3))}>
        <BitRow y={NB.Y[0]} label="n" value={s.n} lowest={lowest} />
      </div>
      {below != null && <BitRow y={NB.Y[1]} label="n − 1" value={below} lowest={lowest} opacity={belowOn} />}
      {result != null && <BitRow y={NB.Y[2]} label="AND" value={result} opacity={resultOn} />}
      {s.lowest != null && (
        <Ring x={nbX(7 - lowest) - 8} y={NB.Y[0] - 8} w={NB.W + 16} h={(s.result != null ? NB.Y[2] : NB.Y[1]) - NB.Y[0] + NB.H + 16} color="--orange" radius={24} />
      )}
      <div style={{opacity: r.live}}>
        <Tile x={NB.CX - 130} y={NB.Y[0]} w={260} h={190} fill={s.phase === 'done' ? 'var(--mint)' : 'var(--yellow)'} style={{fontSize: 84, flexDirection: 'column', gap: 0, transform: `scale(${1 + (bumped ? 0.12 * Math.sin(Math.PI * r.pb) : 0)})`}}>
          <span style={{fontFamily: mono, fontWeight: 500, fontSize: 24}}>count</span>
          {s.count}
        </Tile>
      </div>
    </>
  );
};
export const bitsConfetti = {x: NB.CX, y: 420};
