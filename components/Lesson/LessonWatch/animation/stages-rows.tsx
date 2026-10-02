import type {ReactNode} from 'react';
import {lerp, tok} from './motion';
import {Run, Tag, Tile, body, clamp01, colorMix, display, mono, popStyle} from './scene';

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
  <Tile x={x} y={y} w={w} h={h} fill={fill} radius={22} style={{opacity, transform: `scale(${scale}) rotate(${rotate}deg)`, fontFamily: display, fontSize: 34, color: 'var(--on-accent)'}}>
    {children}
  </Tile>
);

// ───────────────────────── two sum ─────────────────────────
export const TwoSumStage = ({r}: {r: Run}) => {
  const {s, o, p} = r;
  const nums: number[] = s.nums;
  const W = 150, GAP = 36, X0 = (1920 - (4 * W + 3 * GAP)) / 2, Y = 335;
  const cx = (i: number) => X0 + i * (W + GAP) + W / 2;
  const iPos = (st: any) => (st.i < 0 ? cx(0) - 150 : cx(st.i)); // eslint-disable-line @typescript-eslint/no-explicit-any
  const tagX = r.mix(iPos(o), iPos(s));
  const tagOpacity = r.mix(o.i < 0 ? 0 : 1, s.i < 0 ? 0 : 1);
  const hop = Math.sin(Math.PI * p) * (o.i === s.i ? 0 : 26);
  const PX = 520, PY = 560, SLOT = 210;
  const answer = s.answer as number[] | null;
  const hit = s.lookup === 'hit';
  const miss = s.lookup === 'miss';
  const needVis = visBlend(r, (st) => st.need != null);
  const ns = s.need != null ? s : o;
  const slotXY = (slot: number) => ({x: PX + 40 + slot * SLOT, y: PY + 52});
  const hitIdx = hit ? (s.map as any[]).find((m) => m.value === s.need)?.index : null; // eslint-disable-line @typescript-eslint/no-explicit-any
  const panelShake = miss ? Math.sin(p * 28) * 8 * (1 - p) : 0;
  const doneBounce = s.phase === 'done' ? Math.sin(Math.PI * r.pb) * 14 : 0;
  return (
    <>
      <Svg>
        {hit && hitIdx != null && (
          <path
            d={`M ${slotXY((s.map as any[]).findIndex((m) => m.value === s.need)).x + 95} ${PY + 52} Q ${cx(hitIdx)} ${PY - 40} ${cx(hitIdx)} ${Y + 160}`} // eslint-disable-line @typescript-eslint/no-explicit-any
            fill="none" stroke={tok('--mint')} strokeWidth={8} strokeLinecap="round" strokeDasharray="14 12" strokeDashoffset={(1 - p) * 300}
            opacity={clamp01(p * 2)}
          />
        )}
      </Svg>
      {nums.map((v, i) => {
        const cur = i === s.i;
        const isAns = answer?.includes(i) && s.phase !== 'setup';
        const partner = hit && i === hitIdx;
        const fill = isAns || partner ? 'var(--mint)' : cur ? 'var(--yellow)' : 'var(--card)';
        const pp = r.pop(i, 4);
        return (
          <div key={i} style={{...popStyle(pp), position: 'absolute', left: 0, top: 0}}>
            <Tile x={cx(i) - W / 2} y={Y + r.bob(i) + (isAns ? -doneBounce : 0)} w={W} h={W} fill={fill} style={{fontSize: 64, color: 'var(--on-accent)'}}>
              {v}
            </Tile>
            <Label x={cx(i)} y={Y + W + 14} align="center">idx {i}</Label>
          </div>
        );
      })}
      <Tag x={tagX} y={250 - hop} label="i" opacity={tagOpacity * Math.min(1, r.t / 2)} />

      {/* map */}
      <div style={{opacity: Math.min(1, r.pop(2, 4) * 1.4), transform: `translateX(${panelShake}px)`}}>
        <Tile x={PX} y={PY} w={880} h={150} fill="var(--tint-lilac)" radius={26} shadow={false} style={{borderStyle: 'dashed'}} />
        <Label x={PX + 20} y={PY - 36}>map  value → index</Label>
        <Tile x={150} y={PY + 35} w={300} h={80} fill="var(--tint-yellow)" style={{fontSize: 30, color: 'var(--ink)'}}>
          target {s.target}
        </Tile>
        {(s.map as any[]).map((m, slot) => { // eslint-disable-line @typescript-eslint/no-explicit-any
          const born = r.first((st) => st.map.length > slot);
          const b = r.born(born, 'snappy');
          const from = {x: cx(m.index) - 95, y: Y + 30};
          const to = slotXY(slot);
          const glow = hit && m.value === s.need;
          return (
            <Chip
              key={slot} x={lerp(from.x, to.x, b)} y={lerp(from.y, to.y, b) - Math.sin(Math.PI * Math.min(1, b)) * 90}
              w={190} h={96} fill={glow ? 'var(--mint)' : 'var(--card)'} scale={glow ? 1 + 0.12 * Math.sin(Math.PI * p) : 0.7 + 0.3 * b} opacity={Math.min(1, b * 2)}
            >
              {m.value} → {m.index}
            </Chip>
          );
        })}
        {miss && (
          <div style={{position: 'absolute', left: PX + 700, top: PY + 20, fontFamily: display, fontWeight: 800, fontSize: 64, color: 'var(--pen)', opacity: clamp01(p * 2), transform: `scale(${0.6 + 0.4 * r.pb}) rotate(${(1 - p) * -10}deg)`}}>
            ✕
          </div>
        )}
      </div>
      {/* need */}
      <div style={{position: 'absolute', left: 1450, top: PY + 20, opacity: needVis, transform: `translateY(${(1 - needVis) * 16}px)`}}>
        <div style={{fontFamily: mono, fontSize: 24, color: 'var(--muted)'}}>need</div>
        <div style={{fontFamily: display, fontWeight: 800, fontSize: 40}}>
          {s.target} − {nums[ns.i]} = <span style={{background: 'var(--hl)', padding: '0 10px', borderRadius: 10}}>{ns.need}</span>
        </div>
      </div>
    </>
  );
};
export const twoSumConfetti = {x: 960, y: 410};

// ───────────────────────── container with most water ─────────────────────────
export const ContainerStage = ({r}: {r: Run}) => {
  const {s, o} = r;
  const H: number[] = s.height;
  const W = 100, GAP = 32, X0 = (1920 - (H.length * W + (H.length - 1) * GAP)) / 2, BASE = 680, U = 44;
  const cx = (i: number) => X0 + i * (W + GAP) + W / 2;
  const pair = (st: any): [number, number] => (st.phase === 'done' ? st.bestPair : [st.left, st.right]); // eslint-disable-line @typescript-eslint/no-explicit-any
  const hOf = (st: any) => (st.phase === 'setup' ? 0 : Math.min(H[pair(st)[0]], H[pair(st)[1]])); // eslint-disable-line @typescript-eslint/no-explicit-any
  const [ol, or] = pair(o);
  const [nl, nr] = pair(s);
  const L = r.mix(ol, nl), R = r.mix(or, nr);
  const hh = r.mix(hOf(o), hOf(s));
  const intro = r.born(0, 'soft');
  const water = hh * U * Math.min(1, intro * 1.5);
  const doneBlend = r.mix(o.phase === 'done' ? 1 : 0, s.phase === 'done' ? 1 : 0);
  const area = Math.round((hh * (R - L)) * 1) ;
  const shorter = s.moving === 'left' ? s.left : s.moving === 'right' ? s.right : null;
  const pulse = s.newBest ? 1 + 0.14 * Math.sin(Math.PI * r.p) : 1;
  const xL = lerp(cx(Math.floor(L)), cx(Math.ceil(L)), L - Math.floor(L));
  const xR = lerp(cx(Math.floor(R)), cx(Math.ceil(R)), R - Math.floor(R));
  const topOf = (i: number) => BASE - H[i] * U;
  const lh = lerp(H[ol], H[nl], r.p), rh = lerp(H[or], H[nr], r.p);
  return (
    <>
      {/* water */}
      <div
        style={{
          position: 'absolute', left: xL, top: BASE - water, width: Math.max(0, xR - xL), height: water,
          background: colorMix(tok('--sky'), tok('--mint'), doneBlend), opacity: 0.85, border: '3px solid var(--line)', borderRadius: '8px 8px 0 0',
        }}
      />
      {H.map((h, i) => {
        const inside = i >= nl && i <= nr;
        const wall = i === nl || i === nr;
        const flash = shorter === i ? 0.5 + 0.5 * Math.sin(r.t * 14) : 0;
        const fill = wall ? colorMix(tok('--lilac'), tok('--orange'), flash) : inside ? tok('--card') : tok('--past-bg');
        const pp = r.pop(i, 9);
        return (
          <div key={i} style={{opacity: Math.min(1, pp * 1.5) * (inside || s.phase === 'setup' ? 1 : 0.55), transformOrigin: `${cx(i)}px ${BASE}px`, transform: `scaleY(${pp})`}}>
            <Tile x={cx(i) - W / 2} y={topOf(i)} w={W} h={h * U} fill={fill} radius={14} shadow={false} style={{alignItems: 'flex-start', paddingTop: 10, fontSize: 30, color: 'var(--on-accent)', borderBottomWidth: 0, borderBottomLeftRadius: 0, borderBottomRightRadius: 0}}>
              {h}
            </Tile>
          </div>
        );
      })}
      <div style={{position: 'absolute', left: X0 - 20, top: BASE, width: H.length * (W + GAP) - GAP + 40, height: 0, borderTop: '4px solid var(--line)'}} />
      {water > 70 && (
        <div style={{position: 'absolute', left: (xL + xR) / 2, top: BASE - water / 2 - 34, transform: 'translateX(-50%)', padding: '4px 26px', borderRadius: 20, border: '3px solid var(--line)', background: 'var(--card)', boxShadow: 'var(--shadow-sm)', fontFamily: display, fontWeight: 800, fontSize: 52, color: 'var(--on-accent)'}}>
          {area}
        </div>
      )}
      {s.phase !== 'done' && (
        <>
          <Tag x={xL} y={BASE - lh * U - 84 - (shorter === s.left && s.phase === 'move' ? 8 * Math.sin(r.t * 14) : 0)} label="L" fill="var(--yellow)" opacity={r.mix(1, 1)} />
          <Tag x={xR} y={BASE - rh * U - 84 - (shorter === s.right && s.phase === 'move' ? 8 * Math.sin(r.t * 14) : 0)} label="R" fill="var(--peach)" />
        </>
      )}
      {/* best */}
      <div style={{opacity: Math.min(1, r.born(0, 'soft')), transform: `scale(${pulse})`, transformOrigin: '280px 305px'}}>
        <Tile x={120} y={250} w={330} h={110} fill={s.newBest || s.phase === 'done' ? 'var(--yellow)' : 'var(--card)'} style={{fontSize: 40, color: 'var(--on-accent)', gap: 18}}>
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
export const ParenStage = ({r}: {r: Run}) => {
  const {s, o, p} = r;
  const str: string = s.s;
  const W = 110, GAP = 24, X0 = (1920 - (str.length * W + (str.length - 1) * GAP)) / 2, Y = 335;
  const cx = (i: number) => X0 + i * (W + GAP) + W / 2;
  const iPos = (st: any) => (st.i < 0 ? cx(0) - 150 : cx(st.i)); // eslint-disable-line @typescript-eslint/no-explicit-any
  const tagX = r.mix(iPos(o), iPos(s));
  const hop = Math.sin(Math.PI * p) * 22;
  const BX = 960, BW = 260, BOT = 690, TH = 64, TG = 8;
  const slotY = (rank: number) => BOT - (rank + 1) * (TH + TG);
  const items: {from: number; ch: string; ro: number; rn: number}[] = [];
  (o.stack as any[]).forEach((e, rk) => items.push({from: e.from, ch: e.ch, ro: rk, rn: -1})); // eslint-disable-line @typescript-eslint/no-explicit-any
  (s.stack as any[]).forEach((e, rk) => { // eslint-disable-line @typescript-eslint/no-explicit-any
    const f = items.find((x) => x.from === e.from);
    if (f) f.rn = rk;
    else items.push({from: e.from, ch: e.ch, ro: -1, rn: rk});
  });
  const verdictIn = s.verdict ? r.born(r.k, 'bouncy') : 0;
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
            <Tile x={cx(i) - W / 2} y={Y + r.bob(i) - (matched && !wasMatched ? Math.sin(Math.PI * p) * 18 : 0)} w={W} h={130} fill={fill} style={{fontSize: 64, fontFamily: mono, fontWeight: 500, color: 'var(--on-accent)'}}>
              {ch}
            </Tile>
          </div>
        );
      })}
      <Tag x={tagX} y={250 - hop} label="i" opacity={Math.min(1, r.t / 2) * (s.i < 0 ? 0 : 1) + (s.i < 0 ? 0 : 0)} />
      {/* bucket */}
      <div style={{opacity: Math.min(1, r.pop(3, 6) * 1.4)}}>
        <div style={{position: 'absolute', left: BX - BW / 2, top: BOT - 3 * (TH + TG) - 10, width: BW, height: 3 * (TH + TG) + 10, border: '4px solid var(--line)', borderTop: 'none', borderRadius: '0 0 22px 22px', background: 'var(--tint-lilac)'}} />
        <Label x={BX - BW / 2 - 40} y={BOT - 110} align="right" size={28}>stack</Label>
      </div>
      {items.map((it) => {
        const entering = it.ro < 0;
        const leaving = it.rn < 0;
        const rankY = (rk: number) => slotY(rk);
        let x = BX - 100, y: number, op = 1, sc = 1;
        if (entering) {
          const e = r.born(r.k, 'bouncy');
          x = lerp(cx(it.from) - 100, BX - 100, Math.min(1, p));
          y = lerp(Y + 60, rankY(it.rn), e) - Math.sin(Math.PI * Math.min(1, p)) * 70;
          op = Math.min(1, p * 3);
        } else if (leaving) {
          y = lerp(rankY(it.ro), Y + 70, p);
          x = lerp(BX - 100, cx(s.i) - 100, p);
          op = 1 - clamp01((p - 0.55) / 0.45);
          sc = 1 - 0.3 * p;
        } else {
          y = lerp(rankY(it.ro), rankY(it.rn), p);
        }
        return (
          <Tile key={`${it.from}-${it.ch}`} x={x} y={y} w={200} h={TH} fill="var(--peach)" radius={16} style={{opacity: op, transform: `scale(${sc})`, fontSize: 36, fontFamily: mono, fontWeight: 500, color: 'var(--on-accent)'}}>
            {it.ch}
          </Tile>
        );
      })}
      {s.verdict && (
        <Tile x={1240} y={520} w={380} h={110} fill="var(--mint)" style={{fontSize: 40, color: 'var(--on-accent)', opacity: clamp01(verdictIn * 2), transform: `scale(${0.6 + 0.4 * verdictIn}) rotate(${(1 - clamp01(verdictIn)) * 6}deg)`}}>
          valid ✓
        </Tile>
      )}
    </>
  );
};
export const parenConfetti = {x: 960, y: 560};

// ───────────────────────── find minimum in rotated array ─────────────────────────
export const FindMinStage = ({r}: {r: Run}) => {
  const {s, o} = r;
  const nums: number[] = s.nums;
  const W = 130, GAP = 24, X0 = (1920 - (nums.length * W + (nums.length - 1) * GAP)) / 2, BASE = 640;
  const hOf = (v: number) => 56 + v * 38;
  const cx = (i: number) => X0 + i * (W + GAP) + W / 2;
  const lo = r.mix(o.lo, s.lo), hi = r.mix(o.hi, s.hi);
  const xAt = (v: number) => lerp(cx(Math.floor(v)), cx(Math.min(nums.length - 1, Math.ceil(v))), v - Math.floor(v));
  const out = (st: any, i: number) => i < st.lo || i > st.hi; // eslint-disable-line @typescript-eslint/no-explicit-any
  const midOn = visBlend(r, (st) => st.mid != null);
  const mid = s.mid != null ? s.mid : o.mid;
  const midFrom = o.mid != null ? o.mid : s.mid;
  const midX = s.mid != null && o.mid != null ? r.mix(cx(midFrom), cx(s.mid)) : cx(mid ?? 0);
  const cmp = s.mid != null ? s : o;
  const same = s.lo === s.hi;
  const ans = s.answer != null;
  return (
    <>
      {/* live window */}
      <div
        style={{
          position: 'absolute', left: xAt(lo) - W / 2 - 14, top: 290, width: xAt(hi) - xAt(lo) + W + 28, height: BASE - 290 + 22,
          border: '4px dashed var(--lilac)', borderRadius: 26, background: 'var(--tint-lilac)', opacity: 0.55,
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
            <Tile x={cx(i) - W / 2} y={BASE - hOf(v)} w={W} h={hOf(v)} fill={fill} radius={16} shadow={false} style={{alignItems: 'flex-start', paddingTop: 10, fontSize: 40, color: 'var(--on-accent)', borderBottomWidth: 0, borderBottomLeftRadius: 0, borderBottomRightRadius: 0}}>
              {v}
            </Tile>
          </div>
        );
      })}
      <div style={{position: 'absolute', left: X0 - 20, top: BASE, width: nums.length * (W + GAP) - GAP + 40, borderTop: '4px solid var(--line)'}} />
      {!ans && (
        <>
          <Tag x={xAt(lo) - (same ? 46 : 0)} y={BASE - hOf(nums[Math.round(lo)]) - 86} label="lo" fill="var(--yellow)" scale={Math.min(1, r.t / 1.6)} />
          <Tag x={xAt(hi) + (same ? 46 : 0)} y={BASE - hOf(nums[Math.round(hi)]) - 86} label="hi" fill="var(--peach)" scale={Math.min(1, r.t / 1.6)} />
        </>
      )}
      {midOn > 0.01 && <Tag x={midX} y={BASE + 18} label="mid" fill="var(--sky)" dir="up" opacity={midOn} />}
      {/* compare */}
      <div style={{opacity: midOn, transform: `translateY(${(1 - midOn) * 16}px)`}}>
        <Tile x={120} y={380} w={290} h={120} fill="var(--card)" style={{fontSize: 44, color: 'var(--ink)'}}>
          {nums[cmp.mid ?? 0]} <span style={{color: 'var(--pen)', margin: '0 14px'}}>{cmp.compare}</span> {nums[cmp.hi]}
        </Tile>
        <Label x={265} y={346} align="center">mid vs right end</Label>
      </div>
      {ans && (
        <Tile x={1500} y={380} w={310} h={120} fill="var(--mint)" style={{fontSize: 40, color: 'var(--on-accent)', transform: `scale(${0.6 + 0.4 * r.pb})`, opacity: clamp01(r.pb * 2)}}>
          min = {s.answer}
        </Tile>
      )}
    </>
  );
};
export const findMinConfetti = {x: 960, y: 520};

// ───────────────────────── jump game ─────────────────────────
export const JumpStage = ({r}: {r: Run}) => {
  const {s, o} = r;
  const nums: number[] = s.nums ?? (r.steps[0].state.nums as number[]);
  const N = nums.length;
  const W = 170, GAP = 40, X0 = (1920 - (N * W + (N - 1) * GAP)) / 2, Y = 390;
  const cx = (i: number) => X0 + i * (W + GAP) + W / 2;
  const posI = (st: any) => (st.i == null ? (st.phase === 'done' ? N - 1 : 0) : st.i); // eslint-disable-line @typescript-eslint/no-explicit-any
  const frogX = r.mix(cx(posI(o)), cx(posI(s)));
  const hop = Math.sin(Math.PI * r.p) * (posI(o) === posI(s) ? 0 : 36);
  const reachC = (st: any) => Math.min(st.reach, N - 1); // eslint-disable-line @typescript-eslint/no-explicit-any
  const reach = r.mix(reachC(o), reachC(s));
  const over = r.mix(o.reach >= N - 1 ? 1 : 0, s.reach >= N - 1 ? 1 : 0);
  const endX = lerp(cx(Math.floor(reach)), cx(Math.min(N - 1, Math.ceil(reach))), reach - Math.floor(reach)) + W / 2 + over * 46;
  const arcTo = s.i != null ? Math.min(N - 1, s.i + nums[s.i]) : null;
  const showArc = s.i != null && (s.phase === 'extend' || s.phase === 'noGain');
  const verdict = s.verdict != null;
  return (
    <>
      <Svg>
        {showArc && arcTo != null && arcTo !== s.i && (
          <>
            <path
              d={`M ${cx(s.i)} ${Y - 6} Q ${(cx(s.i) + cx(arcTo)) / 2} ${Y - 40 - 110 * Math.min(1, (arcTo - s.i) / 2)} ${cx(arcTo)} ${Y - 6}`}
              fill="none" stroke={s.phase === 'extend' ? tok('--orange') : tok('--past-line')} strokeWidth={7} strokeLinecap="round"
              strokeDasharray="600" strokeDashoffset={(1 - r.p) * 600}
            />
          </>
        )}
      </Svg>
      {nums.map((v, i) => {
        const cover = clamp01(reach - i + 0.5);
        const fill = colorMix(tok('--card'), tok('--tint-mint'), cover);
        const pp = r.pop(i, N);
        const isEnd = i === N - 1;
        return (
          <div key={i} style={{...popStyle(pp), position: 'absolute', left: 0, top: 0}}>
            <Tile x={cx(i) - W / 2} y={Y + r.bob(i)} w={W} h={W} fill={fill} style={{fontSize: 70, color: 'var(--on-accent)', opacity: 0.5 + 0.5 * cover, borderColor: cover > 0.5 ? 'var(--line)' : 'var(--past-line)'}}>
              {v}
            </Tile>
            <Label x={cx(i)} y={Y + W + 12} align="center">{isEnd ? 'end ⚑' : `stone ${i}`}</Label>
          </div>
        );
      })}
      {/* reach band */}
      <div style={{opacity: Math.min(1, r.born(0, 'soft') * 1.4)}}>
        <div
          style={{
            position: 'absolute', left: cx(0) - W / 2, top: 650, height: 44, width: Math.max(0, endX - (cx(0) - W / 2)), background: 'var(--mint)',
            border: '3px solid var(--line)', borderRadius: 22, boxShadow: 'var(--shadow-sm)',
          }}
        />
        <Label x={endX + 18} y={652} size={28}>reach {s.reach}</Label>
      </div>
      <Tag x={frogX} y={600 - hop} label="you" fill="var(--yellow)" dir="up" opacity={Math.min(1, r.t / 2)} />
      {verdict && (
        <Tile x={1480} y={250} w={340} h={100} fill="var(--mint)" style={{fontSize: 34, color: 'var(--on-accent)', transform: `scale(${0.6 + 0.4 * r.pb})`, opacity: clamp01(r.pb * 2)}}>
          reachable ✓
        </Tile>
      )}
    </>
  );
};
export const jumpConfetti = {x: 1300, y: 460};

// ───────────────────────── house robber ─────────────────────────
export const RobberStage = ({r}: {r: Run}) => {
  const {s, o, p} = r;
  const nums: number[] = s.nums;
  const N = nums.length;
  const W = 150, GAP = 40, X0 = (1920 - (N * W + (N - 1) * GAP)) / 2, HY = 280;
  const hx = (i: number) => X0 + i * (W + GAP);
  const DW = 120, DG = 24, DX0 = (1920 - ((N + 1) * DW + N * DG)) / 2, DY = 580;
  const dx = (j: number) => DX0 + j * (DW + DG);
  const compare = (st: any) => st.phase === 'compare' || st.phase === 'decide'; // eslint-disable-line @typescript-eslint/no-explicit-any
  const vis = visBlend(r, compare);
  const cs = compare(s) ? s : o;
  const decide = s.phase === 'decide';
  const take = s.choice === 'take', skip = s.choice === 'skip';
  const robbed: number[] | null = s.robbed;
  const curHouse = s.i != null ? s.i - 1 : null;
  const dpPrev2 = cs.i != null ? cs.dp[cs.i - 2] ?? 0 : 0;
  const chipY = 450;
  const CW = 330;
  const chipX = (k: number) => 960 + (k === 0 ? -CW - 20 : 20);
  return (
    <>
      {nums.map((v, i) => {
        const pp = r.pop(i, N);
        const cur = i === curHouse;
        const isRob = robbed?.includes(i);
        const fill = isRob ? 'var(--mint)' : cur ? 'var(--yellow)' : 'var(--card)';
        return (
          <div key={i} style={{...popStyle(pp), position: 'absolute', left: 0, top: 0}}>
            <Tile x={hx(i)} y={HY + r.bob(i) - (cur ? 12 : 0) - (isRob ? Math.sin(Math.PI * r.pb) * 14 : 0)} w={W} h={130} fill={fill} style={{fontSize: 56, color: 'var(--on-accent)'}}>
              {v}
            </Tile>
            <Label x={hx(i) + W / 2} y={HY + 140} align="center">house {i}</Label>
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
      <Label x={dx(0) - 30} y={DY + 34} align="right" size={30}>dp</Label>
      {Array.from({length: N + 1}).map((_, j) => {
        const v = s.dp[j];
        const had = o.dp[j] != null;
        const flying = !had && v != null && j > 0;
        const cur = j === s.i;
        const fromX = chipX(take ? 1 : 0) + CW / 2 - DW / 2;
        const fill = v == null ? 'var(--card-2)' : cur && decide ? 'var(--mint)' : 'var(--card)';
        return (
          <Tile key={j} x={dx(j)} y={DY} w={DW} h={100} fill={fill} radius={20} style={{fontSize: 44, color: 'var(--on-accent)', borderColor: cur ? 'var(--orange)' : 'var(--line)', borderStyle: v == null ? 'dashed' : 'solid', transform: `scale(${flying ? 0.85 + 0.15 * r.pb : 1})`}}>
            {v != null && !flying && v}
            {flying && p > 0.7 && v}
            <span style={{position: 'absolute', bottom: -34, fontFamily: mono, fontWeight: 400, fontSize: 22, color: 'var(--faint)'}}>{j}</span>
            {flying && (
              <span style={{position: 'absolute', left: lerp(fromX - dx(j), 0, p), top: lerp(chipY - DY, 0, p), opacity: 1 - clamp01((p - 0.6) / 0.4), fontSize: 44}}>{v}</span>
            )}
          </Tile>
        );
      })}
      {robbed && (
        <div style={{position: 'absolute', left: 0, right: 0, top: 497, textAlign: 'center', fontFamily: display, fontWeight: 800, fontSize: 44, opacity: clamp01(r.pb * 2), transform: `scale(${0.7 + 0.3 * r.pb})`}}>
          haul = <span style={{background: 'var(--yellow)', padding: '0 16px', borderRadius: 14}}>{s.dp[N]}</span>
        </div>
      )}
    </>
  );
};
export const robberConfetti = {x: 960, y: 520};
