import type {ReactNode} from 'react';
import {lerp, tok} from './motion';
import {Run, Tag, Tile, body, clamp01, colorMix, display, mono, popStyle} from './scene';

const Svg = ({children}: {children: ReactNode}) => (
  <svg width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0, pointerEvents: 'none'}}>
    {children}
  </svg>
);
const Label = ({x, y, children, align = 'left', size = 26}: {x: number; y: number; children: ReactNode; align?: 'left' | 'center' | 'right'; size?: number}) => (
  <div style={{position: 'absolute', left: x, top: y, transform: `translateX(${align === 'center' ? '-50%' : align === 'right' ? '-100%' : '0'})`, fontFamily: mono, fontWeight: 500, fontSize: size, color: 'var(--muted)', whiteSpace: 'nowrap'}}>
    {children}
  </div>
);
const Dot = ({x, y, d, fill, children, scale = 1, opacity = 1, border = 'var(--line)', size = 34, style}: {x: number; y: number; d: number; fill: string; children?: ReactNode; scale?: number; opacity?: number; border?: string; size?: number; style?: React.CSSProperties}) => (
  <div
    style={{
      position: 'absolute', left: x - d / 2, top: y - d / 2, width: d, height: d, borderRadius: '50%', background: fill, border: `3px solid ${border}`,
      boxShadow: 'var(--shadow-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: display, fontWeight: 800, fontSize: size,
      color: 'var(--on-accent)', transform: `scale(${scale})`, opacity, ...style,
    }}
  >
    {children}
  </div>
);
const ring = (x: number, y: number, d: number, color: string, opacity = 1) => (
  <div style={{position: 'absolute', left: x - d / 2, top: y - d / 2, width: d, height: d, borderRadius: '50%', border: `6px solid ${color}`, opacity, boxShadow: `0 0 0 6px ${color}33`}} />
);

// ───────────────────────── linked list ─────────────────────────
export const ListStage = ({r}: {r: Run}) => {
  const {s, o, p} = r;
  const N = (r.steps[0].state.next as (number | null)[]).length;
  const PITCH = 250, X0 = (1920 - (N - 1) * PITCH) / 2, Y = 440, D = 124;
  const nx = (i: number) => X0 + i * PITCH;
  const values = r.steps[0].state.values ?? Array.from({length: N}, (_, i) => i + 1);
  const geom = (st: any, i: number) => { // eslint-disable-line @typescript-eslint/no-explicit-any
    const t = st.next[i];
    if (t == null) return {xe: i === 0 ? nx(0) - 150 : nx(i) + 150, back: 0, nul: 1};
    return {xe: nx(t), back: t < i ? 1 : 0, nul: 0};
  };
  const nodeFill = (i: number) => (i === s.curr ? 'var(--yellow)' : i === s.prev ? 'var(--peach)' : i === s.nxt ? 'var(--sky)' : 'var(--card)');
  const tagPos = (v: number | null, nullX: number) => (v == null ? nullX : nx(v));
  const prevX = r.mix(tagPos(o.prev, nx(0) - 170), tagPos(s.prev, nx(0) - 170));
  const currX = r.mix(tagPos(o.curr, nx(N - 1) + 170), tagPos(s.curr, nx(N - 1) + 170));
  const nextX = r.mix(tagPos(o.nxt, nx(N - 1) + 170), tagPos(s.nxt, nx(N - 1) + 170));
  const done = s.phase === 'done';
  const nextOn = s.nxt != null || s.phase === 'save' ? 1 : 0;
  return (
    <>
      <Svg>
        <defs>
          {[['ink', tok('--ink')], ['or', tok('--orange')]].map(([k, c]) => (
            <marker key={k} id={`ah-${k}`} viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
              <path d="M0 0 L10 5 L0 10 z" fill={c} />
            </marker>
          ))}
        </defs>
        {Array.from({length: N}).map((_, i) => {
          const a = geom(o, i), b = geom(s, i);
          const xe = lerp(a.xe, b.xe, p), back = lerp(a.back, b.back, p), nul = lerp(a.nul, b.nul, p);
          const flipped = (s.reversed as number[]).includes(i);
          const flipping = s.flipping === i;
          const col = flipped ? tok('--orange') : tok('--ink');
          const sx = nx(i) + (xe >= nx(i) ? D / 2 + 2 : -D / 2 - 2) * (1 - back) + 0 * back;
          const sy = Y + (D / 2) * back * 0.9;
          const ex = (nul > 0.5 ? xe + (xe >= nx(i) ? -8 : 8) : xe - (D / 2 + 14) * (1 - back) * (xe >= nx(i) ? 1 : -1)) + 0;
          const ey = Y + (D / 2 + 14) * back * 0.9;
          const cxm = (sx + ex) / 2;
          const cym = Y + 130 * back;
          const sw = 7 + (flipping ? 8 * Math.sin(Math.PI * p) : 0);
          return (
            <g key={i}>
              <path d={`M ${sx} ${sy} Q ${cxm} ${cym} ${ex} ${ey}`} fill="none" stroke={col} strokeWidth={sw} strokeLinecap="round" markerEnd={`url(#ah-${flipped ? 'or' : 'ink'})`} opacity={clamp01(r.pop(i, N) * 2)} />
              {nul > 0.5 && (
                <text x={ex + (xe >= nx(i) ? 30 : -30)} y={Y + 12} textAnchor="middle" fontFamily={display} fontWeight={800} fontSize={36} fill={tok('--muted')}>∅</text>
              )}
            </g>
          );
        })}
      </Svg>
      {Array.from({length: N}).map((_, i) => {
        const pp = r.pop(i, N);
        return (
          <div key={i} style={{opacity: Math.min(1, pp * 1.5)}}>
            <Dot x={nx(i)} y={Y + r.bob(i) + (done && i === s.prev ? -Math.sin(Math.PI * r.pb) * 16 : 0)} d={D} fill={done && i === s.prev ? 'var(--mint)' : nodeFill(i)} scale={0.5 + 0.5 * pp} size={48}>
              {values[i]}
            </Dot>
          </div>
        );
      })}
      <Tag x={prevX} y={290} label={done ? 'new head' : s.prev == null ? 'prev ∅' : 'prev'} fill={done ? 'var(--mint)' : 'var(--peach)'} opacity={Math.min(1, r.t / 2)} />
      <Tag x={currX} y={290} label={s.curr == null ? 'curr ∅' : 'curr'} fill="var(--yellow)" opacity={Math.min(1, r.t / 2) * (done ? 0 : 1)} />
      <Tag x={nextX} y={570} label={s.nxt == null ? 'next ∅' : 'next'} fill="var(--sky)" dir="up" opacity={Math.min(1, r.t / 2) * nextOn * (done ? 0 : 1)} />
    </>
  );
};
export const listConfetti = {x: 460, y: 440};

// ───────────────────────── tree (max depth) ─────────────────────────
export const TreeStage = ({r}: {r: Run}) => {
  const {s, o} = r;
  const nodes: any[] = (r.steps[0].state.nodes ?? (r.steps[0] as any).nodes) as any[]; // eslint-disable-line @typescript-eslint/no-explicit-any
  const maxD = Math.max(...nodes.map((n) => n.depth));
  const SP = Math.min(135, 360 / (maxD - 1 || 1));
  const pos = (n: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
    const d = Math.floor(Math.log2(n.pos));
    const idx = n.pos - 2 ** d;
    return {x: 760 + ((idx + 0.5) / 2 ** d - 0.5) * 820, y: 330 + d * SP};
  };
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const P = (id: number) => pos(byId.get(id));
  const D = 92;
  const ringX = r.mix(P(o.current ?? 0).x, P(s.current ?? 0).x), ringY = r.mix(P(o.current ?? 0).y, P(s.current ?? 0).y);
  const ringOn = s.current == null ? 1 - r.p : 1;
  const stack: number[] = s.stack, ostack: number[] = o.stack;
  const SBOT = 690, SH = 56, SG = 8;
  const items: {id: number; ro: number; rn: number}[] = [];
  ostack.forEach((id, rk) => items.push({id, ro: rk, rn: -1}));
  stack.forEach((id, rk) => {
    const f = items.find((x) => x.id === id);
    if (f) f.rn = rk;
    else items.push({id, ro: -1, rn: rk});
  });
  const sy = (rk: number) => SBOT - (rk + 1) * (SH + SG);
  return (
    <>
      <Svg>
        {nodes.map((n) => {
          if (n.id === 0) return null;
          const parent = nodes.find((q) => q.left === n.id || q.right === n.id);
          const a = P(parent.id), b = P(n.id);
          const bornStep = r.first((st) => st.stack.includes(n.id) || st.answers[n.id] != null);
          const g = Math.min(1, r.pop(n.id, nodes.length) * 1.2) * (bornStep < 0 ? 1 : 1);
          const onPath = stack.includes(n.id);
          return <line key={n.id} x1={a.x} y1={a.y} x2={lerp(a.x, b.x, g)} y2={lerp(a.y, b.y, g)} stroke={onPath ? tok('--orange') : tok('--ink')} strokeWidth={onPath ? 8 : 5} strokeLinecap="round" />;
        })}
      </Svg>
      {ring(ringX, ringY, D + 26, tok('--orange'), ringOn)}
      {nodes.map((n) => {
        const q = P(n.id);
        const ans = s.answers[n.id];
        const born = r.first((st) => st.answers[n.id] != null);
        const b = ans != null ? r.born(born, 'bouncy') : 0;
        const onPath = stack.includes(n.id);
        const pp = r.pop(n.id, nodes.length);
        const fill = ans != null ? 'var(--tint-mint)' : n.id === s.current ? 'var(--yellow)' : onPath ? 'var(--peach)' : 'var(--card)';
        return (
          <div key={n.id}>
            <Dot x={q.x} y={q.y + r.bob(n.id)} d={D} fill={fill} scale={0.5 + 0.5 * pp} opacity={Math.min(1, pp * 1.5)} size={36}>
              {n.value}
            </Dot>
            {ans != null && (
              <Dot x={q.x + 66} y={q.y - 46 - Math.sin(Math.PI * Math.min(1, b)) * 14} d={52} fill="var(--mint)" scale={b} opacity={clamp01(b * 2)} size={26}>
                {ans}
              </Dot>
            )}
          </div>
        );
      })}
      {/* call stack */}
      <Label x={1480} y={SBOT - 3 * (SH + SG) - 46} size={26}>call stack</Label>
      <div style={{position: 'absolute', left: 1450, top: SBOT - 3 * (SH + SG) - 4, width: 250, height: 3 * (SH + SG) + 4, border: '4px solid var(--line)', borderTop: 'none', borderRadius: '0 0 20px 20px', background: 'var(--tint-lilac)'}} />
      {items.map((it) => {
        const entering = it.ro < 0, leaving = it.rn < 0;
        let y: number, op = 1;
        if (entering) {
          y = lerp(sy(it.rn) - 120, sy(it.rn), r.pb);
          op = clamp01(r.p * 3);
        } else if (leaving) {
          y = lerp(sy(it.ro), sy(it.ro) - 90, r.p);
          op = 1 - r.p;
        } else y = lerp(sy(it.ro), sy(it.rn), r.p);
        return (
          <Tile key={it.id} x={1470} y={y} w={210} h={SH} fill="var(--peach)" radius={14} style={{opacity: op, fontSize: 30, color: 'var(--on-accent)'}}>
            {byId.get(it.id).value}
          </Tile>
        );
      })}
      {s.answer != null && (
        <Tile x={120} y={255} w={300} h={110} fill="var(--mint)" style={{fontSize: 40, color: 'var(--on-accent)', transform: `scale(${0.6 + 0.4 * r.pb})`, opacity: clamp01(r.pb * 2)}}>
          depth {s.answer}
        </Tile>
      )}
    </>
  );
};
export const treeConfetti = {x: 760, y: 420};

// ───────────────────────── trie ─────────────────────────
export const TrieStage = ({r}: {r: Run}) => {
  const {s, o, p} = r;
  const finalNodes: any[] = r.steps[r.steps.length - 1].state.nodes; // eslint-disable-line @typescript-eslint/no-explicit-any
  const kids = new Map<number, number[]>();
  finalNodes.forEach((n) => n.parent != null && kids.set(n.parent, [...(kids.get(n.parent) ?? []), n.id]));
  let leaf = 0;
  const xs = new Map<number, number>();
  const depth = new Map<number, number>();
  const place = (id: number, d: number) => {
    depth.set(id, d);
    const ch = kids.get(id) ?? [];
    if (!ch.length) xs.set(id, leaf++);
    else {
      ch.forEach((c) => place(c, d + 1));
      xs.set(id, ch.reduce((a, c) => a + (xs.get(c) as number), 0) / ch.length);
    }
  };
  place(0, 0);
  const maxD = Math.max(...depth.values());
  const SP = Math.min(98, 370 / maxD);
  const CXM = 960, WID = 170;
  const P = (id: number) => ({x: CXM + ((xs.get(id) as number) - (leaf - 1) / 2) * WID, y: 270 + (depth.get(id) as number) * SP});
  const has = (st: any, id: number) => st.nodes.some((n: any) => n.id === id); // eslint-disable-line @typescript-eslint/no-explicit-any
  const wordBorn = (id: number) => r.first((st) => has(st, id));
  const starBorn = (id: number) => r.first((st) => st.nodes.find((n: any) => n.id === id)?.isWord); // eslint-disable-line @typescript-eslint/no-explicit-any
  const cur = (st: any) => st.cursor ?? 0; // eslint-disable-line @typescript-eslint/no-explicit-any
  const rx = r.mix(P(cur(o)).x, P(cur(s)).x), ry = r.mix(P(cur(o)).y, P(cur(s)).y);
  const D = 74;
  const insertPhase = ['new', 'mark', 'reuse'].includes(s.phase);
  const queryPhase = ['walk', 'verdict', 'done'].includes(s.phase);
  const words: string[] = r.steps[0].state.words ?? [];
  const letters = (w: string, active: boolean, ci: number | null, finished: boolean) =>
    w.split('').map((ch, i) => {
      const doneL = finished || (active && ci != null && i < ci);
      const curL = active && ci === i;
      return (
        <Tile key={i} x={0} y={0} w={64} h={76} radius={14} fill={doneL ? 'var(--mint)' : curL ? 'var(--yellow)' : 'var(--card)'} style={{position: 'relative', fontFamily: mono, fontWeight: 500, fontSize: 40, color: 'var(--on-accent)', transform: `translateY(${curL ? -10 : 0}px)`}}>
          {ch}
        </Tile>
      );
    });
  return (
    <>
      <Svg>
        {finalNodes.map((n) => {
          if (n.parent == null || !has(s, n.id)) return null;
          const b = r.born(wordBorn(n.id), 'soft');
          const a = P(n.parent), c = P(n.id);
          return <line key={n.id} x1={a.x} y1={a.y} x2={lerp(a.x, c.x, Math.min(1, b))} y2={lerp(a.y, c.y, Math.min(1, b))} stroke={tok('--ink')} strokeWidth={6} strokeLinecap="round" />;
        })}
      </Svg>
      {ring(rx, ry, D + 22, tok('--orange'), s.cursor == null && s.phase === 'setup' ? 0 : 1)}
      {finalNodes.map((n) => {
        if (!has(s, n.id)) return null;
        const q = P(n.id);
        const bs = wordBorn(n.id);
        const b = r.born(bs, 'bouncy');
        const isWordNow = s.nodes.find((x: any) => x.id === n.id)?.isWord; // eslint-disable-line @typescript-eslint/no-explicit-any
        const star = isWordNow ? r.born(starBorn(n.id), 'bouncy') : 0;
        const flash = s.created === n.id ? 1 - r.p : 0;
        const reuse = s.phase === 'reuse' && s.cursor === n.id ? Math.sin(Math.PI * p) : 0;
        return (
          <div key={n.id}>
            <Dot x={q.x} y={q.y} d={D} fill={colorMix(tok(n.id === 0 ? '--lilac' : '--card'), tok('--yellow'), flash)} scale={(0.4 + 0.6 * Math.min(1.15, b)) * (1 + 0.12 * reuse)} opacity={clamp01(b * 2)} size={38}>
              {n.id === 0 ? '∅' : n.ch}
            </Dot>
            {isWordNow && (
              <div style={{position: 'absolute', left: q.x + 40, top: q.y - 54, fontSize: 50, color: tok('--orange'), transform: `scale(${star}) rotate(${(1 - clamp01(star)) * 90}deg)`, opacity: clamp01(star * 2), textShadow: '0 0 0 var(--line)', WebkitTextStroke: '2px var(--line)'}}>
                ★
              </div>
            )}
          </div>
        );
      })}
      {/* words being inserted */}
      <Label x={190} y={300} size={26}>words</Label>
      {words.map((w, wi) => (
        <div key={w} style={{position: 'absolute', left: 190, top: 345 + wi * 110, display: 'flex', gap: 8, ...popStyle(r.pop(wi, 4))}}>
          {letters(w, insertPhase && s.wordIndex === wi, s.charIndex, !insertPhase && (s.wordIndex == null ? true : s.wordIndex > wi)) /* inserted words turn mint */}
        </div>
      ))}
      {/* query */}
      <Label x={1380} y={300} size={26}>search “{s.query}”</Label>
      <div style={{position: 'absolute', left: 1380, top: 345, display: 'flex', gap: 8, ...popStyle(r.pop(2, 4))}}>
        {letters(s.query, queryPhase, queryPhase ? (s.phase === 'walk' ? s.charIndex + 1 : null) : null, s.phase === 'verdict' || s.phase === 'done')}
      </div>
      {s.result && (
        <div style={{position: 'absolute', left: 1380, top: 470, display: 'flex', flexDirection: 'column', gap: 14, opacity: clamp01(r.pb * 2), transform: `scale(${0.7 + 0.3 * r.pb})`, transformOrigin: 'left top'}}>
          <Tile x={0} y={0} w={330} h={80} fill={s.result.search ? 'var(--mint)' : 'var(--peach)'} style={{position: 'relative', fontSize: 28, color: 'var(--on-accent)'}}>search {s.result.search ? '✓' : '✕'}</Tile>
          <Tile x={0} y={0} w={330} h={80} fill={s.result.startsWith ? 'var(--mint)' : 'var(--peach)'} style={{position: 'relative', fontSize: 28, color: 'var(--on-accent)'}}>startsWith {s.result.startsWith ? '✓' : '✕'}</Tile>
        </div>
      )}
      <div style={{display: 'none'}}>{body}</div>
    </>
  );
};
export const trieConfetti = {x: 1545, y: 520};

// ───────────────────────── median of a stream (two heaps) ─────────────────────────
export const HeapStage = ({r}: {r: Run}) => {
  const {s, o, p} = r;
  const stream: number[] = r.steps[0].state.stream ?? (r.steps[1].state.stream as number[]);
  const SX = 180, SPT = 120;
  const sx = (i: number) => SX + i * SPT + 45;
  const SY = 250;
  const PW = 480, PY = 420, PH = 280;
  const px = (side: 'low' | 'high') => (side === 'low' ? 250 : 1190);
  const rank = (st: any, id: number) => { // eslint-disable-line @typescript-eslint/no-explicit-any
    const lo = [...st.low].sort((a: any, b: any) => b.value - a.value).findIndex((x: any) => x.id === id); // eslint-disable-line @typescript-eslint/no-explicit-any
    if (lo >= 0) return {side: 'low' as const, rk: lo};
    const hi = [...st.high].sort((a: any, b: any) => a.value - b.value).findIndex((x: any) => x.id === id); // eslint-disable-line @typescript-eslint/no-explicit-any
    return hi >= 0 ? {side: 'high' as const, rk: hi} : null;
  };
  const where = (side: 'low' | 'high', rk: number) => ({x: px(side) + PW / 2, y: PY + 70 + rk * 96});
  const ids = new Map<number, number>();
  [...o.low, ...o.high, ...s.low, ...s.high].forEach((x: any) => ids.set(x.id, x.value)); // eslint-disable-line @typescript-eslint/no-explicit-any
  const medians: number[] = s.medians;
  return (
    <>
      {/* stream */}
      <Label x={SX} y={SY - 46} size={26}>stream</Label>
      {stream.map((v, i) => {
        const done = i < s.index || (i === s.index && s.phase === 'median');
        const cur = i === s.index;
        return (
          <Tile key={i} x={SX + i * SPT} y={SY + r.bob(i)} w={90} h={90} fill={cur ? 'var(--yellow)' : done ? 'var(--past-bg)' : 'var(--card)'} radius={24} style={{...popStyle(r.pop(i, stream.length)), fontSize: 38, color: 'var(--on-accent)', borderColor: done && !cur ? 'var(--past-line)' : 'var(--line)'}}>
            {v}
          </Tile>
        );
      })}
      {/* medians */}
      <Label x={1000} y={SY - 46} size={26}>median</Label>
      {medians.map((m, i) => {
        const b = r.born(r.first((st) => st.medians.length > i), 'bouncy');
        return (
          <Tile key={i} x={1000 + i * 130} y={SY} w={110} h={90} fill="var(--mint)" radius={24} style={{fontSize: 38, color: 'var(--on-accent)', transform: `scale(${b})`, opacity: clamp01(b * 2)}}>
            {m}
          </Tile>
        );
      })}
      {/* halves */}
      {(['low', 'high'] as const).map((side) => (
        <div key={side} style={{opacity: Math.min(1, r.pop(side === 'low' ? 1 : 2, 4) * 1.4)}}>
          <Tile x={px(side)} y={PY} w={PW} h={PH} fill={side === 'low' ? 'var(--tint-lilac)' : 'var(--tint-cream)'} radius={30} shadow={false} style={{borderStyle: 'dashed'}} />
          <Label x={px(side) + PW / 2} y={PY - 40} align="center" size={26}>{side === 'low' ? 'lower half · biggest on top' : 'upper half · smallest on top'}</Label>
          <Label x={px(side) + 22} y={PY + 12} size={22}>top</Label>
        </div>
      ))}
      {[...ids.entries()].map(([id, value]) => {
        const a = rank(o, id), b = rank(s, id);
        if (!b) return null;
        const to = where(b.side, b.rk);
        let x: number, y: number;
        if (!a) {
          const sxp = sx(s.index);
          x = lerp(sxp, to.x, r.p);
          y = lerp(SY + 45, to.y, r.p) - Math.sin(Math.PI * r.p) * 60;
        } else {
          const from = where(a.side, a.rk);
          x = lerp(from.x, to.x, r.p);
          y = lerp(from.y, to.y, r.p) - (a.side !== b.side ? Math.sin(Math.PI * r.p) * 90 : 0);
        }
        const moving = s.moving === id;
        return (
          <Dot key={id} x={x} y={y} d={84} fill={moving ? 'var(--orange)' : b.rk === 0 ? 'var(--yellow)' : 'var(--card)'} size={34} scale={1 + (moving ? 0.1 * Math.sin(Math.PI * p) : 0)}>
            {value}
          </Dot>
        );
      })}
    </>
  );
};
export const heapConfetti = {x: 960, y: 560};

// ───────────────────────── backtracking tree ─────────────────────────
export const ComboStage = ({r}: {r: Run}) => {
  const {s} = r;
  const finalTree: any[] = r.steps[r.steps.length - 1].state.tree; // eslint-disable-line @typescript-eslint/no-explicit-any
  const kids = new Map<number, number[]>();
  finalTree.forEach((n) => n.parent != null && kids.set(n.parent, [...(kids.get(n.parent) ?? []), n.id]));
  let leaf = 0;
  const xs = new Map<number, number>();
  const dep = new Map<number, number>();
  const place = (id: number, d: number) => {
    dep.set(id, d);
    const ch = kids.get(id) ?? [];
    if (!ch.length) xs.set(id, leaf++);
    else {
      ch.forEach((c) => place(c, d + 1));
      xs.set(id, ch.reduce((a, c) => a + (xs.get(c) as number), 0) / ch.length);
    }
  };
  place(0, 0);
  const maxD = Math.max(...dep.values());
  const SP = Math.min(100, 360 / maxD);
  const W = 1130;
  const P = (id: number) => ({x: 120 + ((xs.get(id) as number) / Math.max(1, leaf - 1)) * W + 100, y: 270 + (dep.get(id) as number) * SP});
  const nodeIn = (st: any, id: number) => st.tree.find((n: any) => n.id === id); // eslint-disable-line @typescript-eslint/no-explicit-any
  const bornOf = (id: number) => r.first((st) => !!nodeIn(st, id));
  const cur = (st: any) => st.current ?? 0; // eslint-disable-line @typescript-eslint/no-explicit-any
  const rx = r.mix(P(cur(r.o)).x, P(cur(s)).x), ry = r.mix(P(cur(r.o)).y, P(cur(s)).y);
  const D = 70;
  const results: number[][] = s.results;
  return (
    <>
      <Svg>
        {finalTree.map((n) => {
          const live = nodeIn(s, n.id);
          if (n.parent == null || !live) return null;
          const b = Math.min(1, r.born(bornOf(n.id), 'soft'));
          const a = P(n.parent), c = P(n.id);
          const ex = lerp(a.x, c.x, b), ey = lerp(a.y, c.y, b);
          const col = live.status === 'cut' ? tok('--past-line') : live.status === 'found' ? tok('--mint') : tok('--ink');
          return (
            <g key={n.id}>
              <line x1={a.x} y1={a.y} x2={ex} y2={ey} stroke={col} strokeWidth={live.status === 'found' ? 9 : 5} strokeLinecap="round" opacity={live.status === 'cut' ? 0.7 : 1} />
              <text x={(a.x + ex) / 2 - 18} y={(a.y + ey) / 2 - 6} textAnchor="end" fontFamily={mono} fontWeight={500} fontSize={22} fill={tok('--muted')} opacity={b}>+{live.pick}</text>
            </g>
          );
        })}
      </Svg>
      {ring(rx, ry, D + 24, tok('--orange'), s.phase === 'done' ? 0 : 1)}
      {finalTree.map((n) => {
        const live = nodeIn(s, n.id);
        if (!live) return null;
        const q = P(n.id);
        const bs = bornOf(n.id);
        const b = r.born(bs, 'bouncy');
        const prevLive = nodeIn(r.o, n.id);
        const changed = prevLive && prevLive.status !== live.status ? 1 - r.p : 0;
        const st = live.status;
        const fill = st === 'cut' ? 'var(--peach)' : st === 'found' ? 'var(--mint)' : n.id === s.current ? 'var(--yellow)' : st === 'path' ? 'var(--card)' : 'var(--past-bg)';
        return (
          <Dot
            key={n.id} x={q.x} y={q.y} d={D} fill={fill} size={30} scale={(0.4 + 0.6 * Math.min(1.15, b)) * (1 + 0.15 * changed)} opacity={clamp01(b * 2)}
            border={st === 'cut' ? 'var(--line)' : 'var(--line)'} style={{transform: `scale(${(0.4 + 0.6 * Math.min(1.15, b)) * (1 + 0.15 * changed)}) rotate(${st === 'cut' ? Math.sin(r.p * 30) * 6 * (1 - r.p) : 0}deg)`}}
          >
            {st === 'cut' ? '✕' : st === 'found' ? '✓' : live.remaining}
          </Dot>
        );
      })}
      {/* results */}
      <Label x={1560} y={250} size={26}>found</Label>
      {results.map((res, i) => {
        const b = r.born(r.first((st) => st.results.length > i), 'bouncy');
        return (
          <Tile key={i} x={1560} y={300 + i * 96} w={290} h={78} fill="var(--mint)" radius={20} style={{fontSize: 30, fontFamily: mono, color: 'var(--on-accent)', transform: `scale(${b})`, opacity: clamp01(b * 2), transformOrigin: 'left center'}}>
            [{res.join(', ')}]
          </Tile>
        );
      })}
      <div style={{position: 'absolute', left: 1560, top: 520, fontFamily: mono, fontSize: 24, color: 'var(--muted)', opacity: s.phase === 'setup' ? 0 : 1}}>
        path [{s.path.join(', ')}]
      </div>
      <div style={{position: 'absolute', left: 1560, top: 556, fontFamily: mono, fontSize: 24, color: 'var(--muted)', opacity: s.phase === 'setup' ? 0 : 1}}>
        need {s.remaining}
      </div>
    </>
  );
};
export const comboConfetti = {x: 960, y: 480};
