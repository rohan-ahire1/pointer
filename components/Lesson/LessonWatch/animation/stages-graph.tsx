import type {ReactNode} from 'react';
import {inkOn, lerp, tok} from './motion';
import {Run, Tag, Tile, body, bruteK, bruteSpr, clamp01, colorMix, display, mono, popStyle} from './scene';

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
      color: inkOn(fill), transform: `scale(${scale})`, opacity, ...style,
    }}
  >
    {children}
  </div>
);
const ring = (x: number, y: number, d: number, color: string, opacity = 1) => (
  <div style={{position: 'absolute', left: x - d / 2, top: y - d / 2, width: d, height: d, borderRadius: '50%', border: `6px solid ${color}`, opacity, boxShadow: `0 0 0 6px ${color}33`}} />
);
const Verdict = ({y = 640, x = 960, children, ok = null, w = 560}: {y?: number; x?: number; children: ReactNode; ok?: boolean | null; w?: number}) => (
  <Tile x={x - w / 2} y={y} w={w} h={100} fill={ok ? 'var(--mint)' : 'var(--card)'} style={{fontSize: 40, gap: 18}}>
    {children}
    {ok != null && <span style={{color: ok ? undefined : 'var(--pen)'}}>{ok ? '✓' : '✕'}</span>}
  </Tile>
);

// ───────────────────────── linked list ─────────────────────────
const LL = {PITCH: 250, Y: 400, D: 124};
const llX = (n: number, i: number) => (1920 - (n - 1) * LL.PITCH) / 2 + i * LL.PITCH;

/** Brute force: copy every value into a brand-new list, back to front. */
export const ListBrute = ({r}: {r: Run}) => {
  const values: number[] = r.steps[0].state.values;
  const N = values.length;
  const q = bruteK(r.t, N);
  if (q < 0) return null;
  const NY = 690, ND = 104;
  const nx = (pos: number) => llX(N, pos);
  return (
    <>
      <Label x={nx(0) - 90} y={NY - 18} align="right" size={26}>new list</Label>
      <Svg>
        {Array.from({length: q}).map((_, k) => {
          // copies sit right to left: copy k at slot N-1-k, pointing at the copy made before it
          const a = nx(N - 1 - (k + 1)), b = nx(N - 1 - k);
          return <line key={k} x1={a + ND / 2 + 4} y1={NY} x2={b - ND / 2 - 12} y2={NY} stroke={tok('--ink')} strokeWidth={6} strokeLinecap="round" markerEnd="url(#ah-ink)" />;
        })}
      </Svg>
      {Array.from({length: q + 1}).map((_, k) => {
        const b = bruteSpr(r.t, k, N, 'bouncy');
        return (
          <Dot key={k} x={lerp(llX(N, k), nx(N - 1 - k), Math.min(1, b))} y={lerp(LL.Y, NY, Math.min(1, b))} d={ND} fill="var(--peach)" size={40} scale={0.6 + 0.4 * Math.min(1.2, b)}>
            {values[k]}
          </Dot>
        );
      })}
      {ring(llX(N, q), LL.Y, LL.D + 26, tok('--orange'))}
    </>
  );
};

export const ListStage = ({r}: {r: Run}) => {
  const {s, o, p} = r;
  const N = (r.steps[0].state.next as (number | null)[]).length;
  const {Y, D} = LL;
  const nx = (i: number) => llX(N, i);
  const values = r.steps[0].state.values ?? Array.from({length: N}, (_, i) => i + 1);
  const geom = (st: any, i: number) => { // eslint-disable-line @typescript-eslint/no-explicit-any
    const t = st.next[i];
    if (t == null) return {xe: i === 0 ? nx(0) - 150 : nx(i) + 150, back: 0, nul: 1};
    return {xe: nx(t), back: t < i ? 1 : 0, nul: 0};
  };
  const nodeFill = (i: number) => (r.live < 0.5 ? 'var(--card)' : i === s.curr ? 'var(--yellow)' : i === s.prev ? 'var(--peach)' : i === s.nxt ? 'var(--sky)' : 'var(--card)');
  const tagPos = (v: number | null, nullX: number) => (v == null ? nullX : nx(v));
  const prevX = r.mix(tagPos(o.prev, nx(0) - 170), tagPos(s.prev, nx(0) - 170));
  const currX = r.mix(tagPos(o.curr, nx(N - 1) + 170), tagPos(s.curr, nx(N - 1) + 170));
  const nextX = r.mix(tagPos(o.nxt, nx(N - 1) + 170), tagPos(s.nxt, nx(N - 1) + 170));
  const done = s.phase === 'done';
  // next only matters while it's ahead of curr; after a step forward it sits on curr itself
  const nextOn = (s.nxt != null || s.phase === 'save') && s.nxt !== s.curr ? 1 : 0;
  const tagsOn = r.live;
  return (
    <>
      <Svg>
        <defs>
          {[['ink', tok('--ink')], ['or', tok('--orange')], ['sky', tok('--sky')]].map(([k, c]) => (
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
          // the arrow about to be redirected: we've saved next, so it's safe to cut
          const doomed = s.phase === 'save' && s.curr === i;
          const col = flipped ? tok('--orange') : doomed ? tok('--sky') : tok('--ink');
          const sx = nx(i) + (xe >= nx(i) ? D / 2 + 2 : -D / 2 - 2) * (1 - back);
          const sy = Y + (D / 2) * back * 0.9;
          const ex = nul > 0.5 ? xe + (xe >= nx(i) ? -8 : 8) : xe - (D / 2 + 14) * (1 - back) * (xe >= nx(i) ? 1 : -1);
          const ey = Y + (D / 2 + 14) * back * 0.9;
          const cxm = (sx + ex) / 2;
          const cym = Y + 130 * back;
          const sw = 7 + (flipping ? 8 * Math.sin(Math.PI * p) : 0);
          return (
            <g key={i}>
              <path d={`M ${sx} ${sy} Q ${cxm} ${cym} ${ex} ${ey}`} fill="none" stroke={col} strokeWidth={sw} strokeLinecap="round" strokeDasharray={doomed ? '14 10' : undefined} markerEnd={`url(#ah-${flipped ? 'or' : doomed ? 'sky' : 'ink'})`} opacity={clamp01(r.pop(i, N) * 2)} />
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
            <Dot x={nx(i)} y={Y + (done && i === s.prev ? -Math.sin(Math.PI * r.pb) * 16 : 0)} d={D} fill={done && i === s.prev ? 'var(--mint)' : nodeFill(i)} scale={0.5 + 0.5 * pp} size={48}>
              {values[i]}
            </Dot>
          </div>
        );
      })}
      <Tag x={prevX} y={Y - 150} label={done ? 'new head' : s.prev == null ? 'prev ∅' : 'prev'} fill={done ? 'var(--mint)' : 'var(--peach)'} opacity={tagsOn} />
      <Tag x={currX} y={Y - 150} label={s.curr == null ? 'curr ∅' : 'curr'} fill="var(--yellow)" opacity={tagsOn * (done ? 0 : 1)} />
      <Tag x={nextX} y={Y + 130} label={s.nxt == null ? 'next ∅' : 'next'} fill="var(--sky)" dir="up" opacity={tagsOn * nextOn * (done ? 0 : 1)} />
    </>
  );
};
export const listConfetti = {x: 460, y: 400};

// ───────────────────────── tree (max depth) ─────────────────────────
type TNode = {id: number; value: number; left: number | null; right: number | null; pos: number; depth: number};
const treeNodes = (r: Run): TNode[] => r.steps[0].state.nodes as TNode[];
const treeGeo = (nodes: TNode[]) => {
  const maxD = Math.max(...nodes.map((n) => n.depth));
  const SP = Math.min(150, 420 / Math.max(1, maxD - 1));
  const posOf = (pos: number) => {
    const d = Math.floor(Math.log2(pos));
    const idx = pos - 2 ** d;
    return {x: 720 + ((idx + 0.5) / 2 ** d - 0.5) * 960, y: 290 + d * SP};
  };
  return {SP, posOf, P: (id: number) => posOf((nodes.find((n) => n.id === id) as TNode).pos)};
};
/** every root-to-leaf path, as lists of node ids */
const treePaths = (nodes: TNode[]): number[][] => {
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const out: number[][] = [];
  const walk = (id: number, path: number[]) => {
    const n = byId.get(id) as TNode;
    const next = [...path, id];
    if (n.left == null && n.right == null) out.push(next);
    if (n.left != null) walk(n.left, next);
    if (n.right != null) walk(n.right, next);
  };
  walk(0, []);
  return out;
};
export const treeVisits = (nodes: TNode[]) => treePaths(nodes).flatMap((path, pi) => path.map((id, k) => ({id, path: pi, k})));

/** Brute force: walk every root-to-leaf path and count its length; shared nodes get visited again and again. */
export const TreeBrute = ({r}: {r: Run}) => {
  const nodes = treeNodes(r);
  const {P} = treeGeo(nodes);
  const paths = treePaths(nodes);
  const visits = treeVisits(nodes);
  const q = bruteK(r.t, visits.length);
  if (q < 0) return null;
  const cur = visits[q];
  const path = paths[cur.path].slice(0, cur.k + 1);
  const counts = new Map<number, number>();
  visits.slice(0, q + 1).forEach((v) => counts.set(v.id, (counts.get(v.id) ?? 0) + 1));
  const leafDone = cur.k === paths[cur.path].length - 1;
  return (
    <>
      <Svg>
        {path.slice(1).map((id, k) => {
          const a = P(path[k]), b = P(id);
          return <line key={id} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={tok('--orange')} strokeWidth={10} strokeLinecap="round" />;
        })}
      </Svg>
      {ring(P(cur.id).x, P(cur.id).y, 104 + 26, tok('--orange'))}
      {[...counts.entries()].map(([id, c]) => (
        <div key={id} style={{position: 'absolute', left: P(id).x - 92, top: P(id).y - 62, padding: '2px 10px', borderRadius: 12, border: '3px solid var(--line)', background: c > 1 ? 'var(--peach)' : 'var(--card)', color: c > 1 ? 'var(--on-accent)' : 'var(--ink)', fontFamily: mono, fontWeight: 500, fontSize: 24}}>
          ×{c}
        </div>
      ))}
      <Verdict x={1580} y={330} w={420} ok={null}>
        <span style={{fontFamily: body, fontWeight: 700, fontSize: 30}}>{leafDone ? `path ${cur.path + 1}: ${path.length} deep` : `path ${cur.path + 1}…`}</span>
      </Verdict>
    </>
  );
};

export const TreeStage = ({r}: {r: Run}) => {
  const {s, o} = r;
  const nodes = treeNodes(r);
  const {SP, P} = treeGeo(nodes);
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const D = 104;
  const ringX = r.mix(P(o.current ?? 0).x, P(s.current ?? 0).x), ringY = r.mix(P(o.current ?? 0).y, P(s.current ?? 0).y);
  const ringOn = (s.current == null ? 1 - r.p : 1) * r.live;
  const stack: number[] = s.stack, ostack: number[] = o.stack;
  const SBOT = 700, SH = 56, SG = 8;
  const items: {id: number; ro: number; rn: number}[] = [];
  ostack.forEach((id, rk) => items.push({id, ro: rk, rn: -1}));
  stack.forEach((id, rk) => {
    const f = items.find((x) => x.id === id);
    if (f) f.rn = rk;
    else items.push({id, ro: -1, rn: rk});
  });
  const sy = (rk: number) => SBOT - (rk + 1) * (SH + SG);
  // empty children: little stubs that answer 0
  const stubs: {parent: number; x: number; y: number}[] = [];
  nodes.forEach((n) => {
    const q = P(n.id);
    const spread = 200 / 2 ** byId.get(n.id)!.depth;
    if (n.left == null) stubs.push({parent: n.id, x: q.x - Math.max(46, spread * 0.6), y: q.y + Math.min(110, SP * 0.75)});
    if (n.right == null) stubs.push({parent: n.id, x: q.x + Math.max(46, spread * 0.6), y: q.y + Math.min(110, SP * 0.75)});
  });
  return (
    <>
      <Svg>
        {nodes.map((n) => {
          if (n.id === 0) return null;
          const parent = nodes.find((q) => q.left === n.id || q.right === n.id) as TNode;
          const a = P(parent.id), b = P(n.id);
          const g = Math.min(1, r.pop(n.id, nodes.length) * 1.2);
          const onPath = stack.includes(n.id) && r.live > 0.5;
          return <line key={n.id} x1={a.x} y1={a.y} x2={lerp(a.x, b.x, g)} y2={lerp(a.y, b.y, g)} stroke={onPath ? tok('--orange') : tok('--ink')} strokeWidth={onPath ? 8 : 5} strokeLinecap="round" />;
        })}
        {stubs.map((st, i) => {
          const a = P(st.parent);
          return <line key={i} x1={a.x} y1={a.y + D / 2 - 6} x2={st.x} y2={st.y - 20} stroke={tok('--past-line')} strokeWidth={4} strokeDasharray="8 8" opacity={r.live} />;
        })}
      </Svg>
      {stubs.map((st, i) => {
        const answered = s.answers[st.parent] != null;
        const isLeafNow = s.current === st.parent && (s.phase === 'leaf' || s.phase === 'missing');
        return (
          <div key={i} style={{position: 'absolute', left: st.x - 22, top: st.y - 22, width: 44, height: 44, borderRadius: '50%', border: '3px dashed var(--past-line)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: mono, fontSize: 22, color: answered || isLeafNow ? 'var(--ink)' : 'var(--faint)', background: isLeafNow ? 'var(--tint-yellow)' : 'transparent', opacity: r.live}}>
            {answered || isLeafNow ? '0' : '∅'}
          </div>
        );
      })}
      {ring(ringX, ringY, D + 26, tok('--orange'), ringOn)}
      {nodes.map((n) => {
        const q = P(n.id);
        const ans = s.answers[n.id];
        const born = r.first((st) => st.answers[n.id] != null);
        const b = ans != null ? r.born(born, 'bouncy') : 0;
        const onPath = stack.includes(n.id) && r.live > 0.5;
        const pp = r.pop(n.id, nodes.length);
        const fill = ans != null ? 'var(--tint-mint)' : n.id === s.current && r.live > 0.5 ? 'var(--yellow)' : onPath ? 'var(--peach)' : 'var(--card)';
        return (
          <div key={n.id}>
            <Dot x={q.x} y={q.y} d={D} fill={fill} scale={0.5 + 0.5 * pp} opacity={Math.min(1, pp * 1.5)} size={40}>
              {n.value}
            </Dot>
            {ans != null && (
              <Dot x={q.x + 74} y={q.y - 52 - Math.sin(Math.PI * Math.min(1, b)) * 14} d={58} fill="var(--mint)" scale={b} opacity={clamp01(b * 2)} size={28}>
                {ans}
              </Dot>
            )}
          </div>
        );
      })}
      {/* call stack */}
      <div style={{opacity: r.live}}>
        <Label x={1480} y={SBOT - 4 * (SH + SG) - 46} size={26}>call stack</Label>
        <div style={{position: 'absolute', left: 1450, top: SBOT - 4 * (SH + SG) - 4, width: 250, height: 4 * (SH + SG) + 4, border: '4px solid var(--line)', borderTop: 'none', borderRadius: '0 0 20px 20px', background: 'var(--tint-lilac)'}} />
      </div>
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
          <Tile key={it.id} x={1470} y={y} w={210} h={SH} fill="var(--peach)" radius={14} style={{opacity: op * r.live, fontSize: 30}}>
            {byId.get(it.id)?.value}
          </Tile>
        );
      })}
      {s.answer != null && (
        <Tile x={120} y={255} w={300} h={110} fill="var(--mint)" style={{fontSize: 40, transform: `scale(${0.6 + 0.4 * r.pb})`, opacity: clamp01(r.pb * 2)}}>
          depth {s.answer}
        </Tile>
      )}
    </>
  );
};
export const treeConfetti = {x: 720, y: 400};

// ───────────────────────── trie ─────────────────────────
const TRIE_WORDS_X = 150;
const TRIE_QUERY_X = 1420;
const trieLetters = (w: string, fillOf: (i: number) => string, lift: (i: number) => number, size = 64) =>
  w.split('').map((ch, i) => (
    <Tile key={i} x={0} y={0} w={size} h={size + 12} radius={14} fill={fillOf(i)} style={{position: 'relative', fontFamily: mono, fontWeight: 500, fontSize: 40, transform: `translateY(${-lift(i)}px)`}}>
      {ch}
    </Tile>
  ));

/** Brute force: compare the query with every stored word, letter by letter. */
export const trieCompares = (words: string[], query: string) =>
  words.flatMap((w, wi) => query.split('').map((_, c) => ({wi, c, match: w[c] === query[c]})));

export const TrieBrute = ({r}: {r: Run}) => {
  const {words, query} = r.steps[0].state as {words: string[]; query: string};
  const cmps = trieCompares(words, query);
  const q = bruteK(r.t, cmps.length);
  if (q < 0) return null;
  const cur = cmps[q];
  const wordDone = (wi: number) => cmps.reduce((last, c, k) => (c.wi === wi ? k : last), -1) <= q;
  return (
    <>
      {/* query slides next to the word being checked */}
      <div style={{position: 'absolute', left: TRIE_WORDS_X + 520, top: 345 + cur.wi * 110, display: 'flex', gap: 8}}>
        {trieLetters(query, (i) => (i === cur.c ? (cur.match ? 'var(--mint)' : 'var(--peach)') : i < cur.c ? 'var(--tint-mint)' : 'var(--card)'), (i) => (i === cur.c ? 8 : 0))}
      </div>
      <Label x={TRIE_WORDS_X + 520} y={300 + cur.wi * 110} size={22}>is it “{query}”?</Label>
      {words.map((w, wi) => (
        <div key={w} style={{position: 'absolute', left: TRIE_WORDS_X, top: 345 + wi * 110, display: 'flex', gap: 8}}>
          {trieLetters(w, (i) => (wi === cur.wi && i === cur.c ? (cur.match ? 'var(--mint)' : 'var(--peach)') : wi === cur.wi && i < cur.c ? 'var(--tint-mint)' : 'var(--card)'), (i) => (wi === cur.wi && i === cur.c ? 8 : 0))}
          {wordDone(wi) && wi !== cur.wi && <span style={{alignSelf: 'center', marginLeft: 12, fontFamily: body, fontWeight: 700, fontSize: 28, color: 'var(--pen)'}}>✕ not “{query}”</span>}
          {wi === cur.wi && cur.c === query.length - 1 && w.length !== query.length && <span style={{alignSelf: 'center', marginLeft: 12, fontFamily: body, fontWeight: 700, fontSize: 28, color: 'var(--pen)'}}>✕ longer</span>}
        </div>
      ))}
    </>
  );
};

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
  const SP = Math.min(118, 470 / maxD);
  const CXM = 960, WID = 230;
  const P = (id: number) => ({x: CXM + ((xs.get(id) as number) - (leaf - 1) / 2) * WID, y: 280 + (depth.get(id) as number) * SP});
  const has = (st: any, id: number) => st.nodes.some((n: any) => n.id === id); // eslint-disable-line @typescript-eslint/no-explicit-any
  const wordBorn = (id: number) => r.first((st) => has(st, id));
  const starBorn = (id: number) => r.first((st) => st.nodes.find((n: any) => n.id === id)?.isWord); // eslint-disable-line @typescript-eslint/no-explicit-any
  const cur = (st: any) => st.cursor ?? 0; // eslint-disable-line @typescript-eslint/no-explicit-any
  const rx = r.mix(P(cur(o)).x, P(cur(s)).x), ry = r.mix(P(cur(o)).y, P(cur(s)).y);
  const D = 84;
  const insertPhase = ['new', 'mark', 'reuse'].includes(s.phase);
  const queryPhase = ['walk', 'verdict', 'done'].includes(s.phase);
  const words: string[] = r.steps[0].state.words ?? [];
  // a word is inserted once a later word (or the search) has started, or its end is marked
  const inserted = (wi: number) => queryPhase || (s.wordIndex != null && (s.wordIndex > wi || (s.wordIndex === wi && s.phase === 'mark')));
  const wordFill = (wi: number) => (i: number) => {
    if (inserted(wi)) return 'var(--mint)';
    if (insertPhase && s.wordIndex === wi) return i < s.charIndex ? 'var(--tint-mint)' : i === s.charIndex ? 'var(--yellow)' : 'var(--card)';
    return 'var(--card)';
  };
  const queryFill = (i: number) => {
    if (s.phase === 'verdict' || s.phase === 'done') return s.result?.search ? 'var(--mint)' : 'var(--tint-mint)';
    if (s.phase === 'walk') return i < s.charIndex ? 'var(--tint-mint)' : i === s.charIndex ? 'var(--yellow)' : 'var(--card)';
    return 'var(--card)';
  };
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
      {ring(rx, ry, D + 22, tok('--orange'), (s.cursor == null && s.phase === 'setup' ? 0 : 1) * r.live)}
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
            <Dot x={q.x} y={q.y} d={D} fill={colorMix(tok(n.id === 0 ? '--lilac' : '--card'), tok('--yellow'), flash)} scale={(0.4 + 0.6 * Math.min(1.15, b)) * (1 + 0.12 * reuse)} opacity={clamp01(b * 2)} size={40}>
              {n.id === 0 ? '∅' : n.ch}
            </Dot>
            {isWordNow && (
              <div style={{position: 'absolute', left: q.x + 40, top: q.y - 58, fontSize: 50, color: tok('--orange'), transform: `scale(${star}) rotate(${(1 - clamp01(star)) * 90}deg)`, opacity: clamp01(star * 2), WebkitTextStroke: '2px var(--line)'}}>
                ★
              </div>
            )}
          </div>
        );
      })}
      {/* words being inserted */}
      <Label x={TRIE_WORDS_X} y={300} size={26}>words</Label>
      {words.map((w, wi) => (
        <div key={w} style={{position: 'absolute', left: TRIE_WORDS_X, top: 345 + wi * 110, display: 'flex', gap: 8, opacity: r.live, ...popStyle(r.pop(wi, 4))}}>
          {trieLetters(w, wordFill(wi), (i) => (insertPhase && s.wordIndex === wi && i === s.charIndex ? 10 : 0))}
        </div>
      ))}
      {/* query */}
      <Label x={TRIE_QUERY_X} y={300} size={26}>look up “{s.query}”</Label>
      <div style={{position: 'absolute', left: TRIE_QUERY_X, top: 345, display: 'flex', gap: 8, ...popStyle(r.pop(2, 4))}}>
        {trieLetters(s.query, queryFill, (i) => (s.phase === 'walk' && i === s.charIndex ? 10 : 0))}
      </div>
      {s.result && (
        <div style={{position: 'absolute', left: TRIE_QUERY_X, top: 470, display: 'flex', flexDirection: 'column', gap: 14, opacity: clamp01(r.pb * 2), transform: `scale(${0.7 + 0.3 * r.pb})`, transformOrigin: 'left top'}}>
          <Tile x={0} y={0} w={380} h={80} fill={s.result.search ? 'var(--mint)' : 'var(--peach)'} style={{position: 'relative', fontSize: 28}}>search {s.result.search ? '✓' : '✕'}</Tile>
          <Tile x={0} y={0} w={380} h={80} fill={s.result.startsWith ? 'var(--mint)' : 'var(--peach)'} style={{position: 'relative', fontSize: 28}}>startsWith {s.result.startsWith ? '✓' : '✕'}</Tile>
        </div>
      )}
    </>
  );
};
export const trieConfetti = {x: 1610, y: 520};

// ───────────────────────── median of a stream (two heaps) ─────────────────────────
const HP = {SX: 180, SPT: 120, SY: 280, PW: 520, PY: 470, PH: 330};
const hpPanelX = (side: 'low' | 'high') => (side === 'low' ? 230 : 1170);
/** where heap slot k sits inside its panel: a little binary tree, top at the top */
const heapSlot = (side: 'low' | 'high', k: number) => {
  const d = Math.floor(Math.log2(k + 1));
  const idx = k - (2 ** d - 1);
  const span = HP.PW - 80;
  return {x: hpPanelX(side) + 40 + ((idx + 0.5) / 2 ** d) * span, y: HP.PY + 70 + d * 100};
};
/** Brute force: after every arrival, sort everything seen so far from scratch. */
export const heapSorts = (stream: number[]) => stream.flatMap((_, a) => [...stream.slice(0, a + 1)].sort((x, y) => x - y).map((v, k) => ({a, k, v, n: a + 1})));

export const HeapBrute = ({r}: {r: Run}) => {
  const stream: number[] = r.steps[0].state.stream;
  const sorts = heapSorts(stream);
  const q = bruteK(r.t, sorts.length);
  if (q < 0) return null;
  const cur = sorts[q];
  const row = sorts.filter((x, i) => x.a === cur.a && i <= q);
  const complete = cur.k === cur.n - 1;
  const sorted = [...stream.slice(0, cur.n)].sort((x, y) => x - y);
  const med = cur.n % 2 ? sorted[(cur.n - 1) / 2] : (sorted[cur.n / 2 - 1] + sorted[cur.n / 2]) / 2;
  const RX = 960 - (cur.n * 120 - 20) / 2;
  return (
    <>
      <Tile x={HP.SX + cur.a * HP.SPT - 8} y={HP.SY - 8} w={106} h={106} fill="transparent" shadow={false} style={{border: `6px solid ${tok('--orange')}`}} />
      <Label x={960} y={500} align="center" size={26}>re-sort all {cur.n} so far</Label>
      {row.map((x, i) => {
        const b = bruteSpr(r.t, sorts.indexOf(x), sorts.length, 'bouncy');
        return (
          <Tile key={i} x={RX + x.k * 120} y={550 - (1 - Math.min(1, b)) * 60} w={100} h={100} fill={complete && (sorted.length % 2 ? x.k === (cur.n - 1) / 2 : x.k === cur.n / 2 - 1 || x.k === cur.n / 2) ? 'var(--mint)' : 'var(--card)'} radius={24} style={{fontSize: 40, opacity: Math.min(1, b * 2)}}>
            {x.v}
          </Tile>
        );
      })}
      {complete && <Label x={960} y={680} align="center" size={30}>median {med}</Label>}
    </>
  );
};

export const HeapStage = ({r}: {r: Run}) => {
  const {s, o, p} = r;
  const stream: number[] = r.steps[0].state.stream ?? (r.steps[1].state.stream as number[]);
  const {SX, SPT, SY, PW, PY, PH} = HP;
  const sx = (i: number) => SX + i * SPT + 45;
  const where = (st: any, id: number) => { // eslint-disable-line @typescript-eslint/no-explicit-any
    const lo = (st.low as any[]).findIndex((x) => x.id === id); // eslint-disable-line @typescript-eslint/no-explicit-any
    if (lo >= 0) return {side: 'low' as const, k: lo};
    const hi = (st.high as any[]).findIndex((x) => x.id === id); // eslint-disable-line @typescript-eslint/no-explicit-any
    return hi >= 0 ? {side: 'high' as const, k: hi} : null;
  };
  const ids = new Map<number, number>();
  [...o.low, ...o.high, ...s.low, ...s.high].forEach((x: any) => ids.set(x.id, x.value)); // eslint-disable-line @typescript-eslint/no-explicit-any
  const medians: number[] = s.medians;
  return (
    <>
      {/* stream */}
      <Label x={SX} y={SY - 44} size={26}>stream</Label>
      {stream.map((v, i) => {
        const done = r.live > 0.5 && (i < s.index || (i === s.index && s.phase === 'median'));
        const cur = r.live > 0.5 && i === s.index;
        return (
          <Tile key={i} x={SX + i * SPT} y={SY} w={90} h={90} fill={cur ? 'var(--yellow)' : done ? 'var(--past-bg)' : 'var(--card)'} radius={24} style={{...popStyle(r.pop(i, stream.length)), fontSize: 38, borderColor: done && !cur ? 'var(--past-line)' : 'var(--line)'}}>
            {v}
          </Tile>
        );
      })}
      {/* medians */}
      <Label x={1060} y={SY - 44} size={26}>median after each</Label>
      {medians.map((m, i) => {
        const b = r.born(r.first((st) => st.medians.length > i), 'bouncy');
        return (
          <Tile key={i} x={1060 + i * 130} y={SY} w={110} h={90} fill="var(--mint)" radius={24} style={{fontSize: 38, transform: `scale(${b})`, opacity: clamp01(b * 2)}}>
            {m}
          </Tile>
        );
      })}
      {/* halves, each a heap: only the top is guaranteed */}
      {(['low', 'high'] as const).map((side) => {
        const heap = s[side] as {id: number; value: number}[];
        return (
          <div key={side} style={{opacity: r.live}}>
            <Tile x={hpPanelX(side)} y={PY} w={PW} h={PH} fill={side === 'low' ? 'var(--tint-lilac)' : 'var(--tint-cream)'} radius={30} shadow={false} style={{borderStyle: 'dashed'}} />
            <Label x={hpPanelX(side) + PW / 2} y={PY - 40} align="center" size={26}>{side === 'low' ? 'lower half · max-heap' : 'upper half · min-heap'}</Label>
            <Svg>
              {heap.map((_, k) => {
                if (k === 0) return null;
                const a = heapSlot(side, (k - 1) >> 1), b = heapSlot(side, k);
                return <line key={k} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={tok('--ink')} strokeWidth={4} opacity={0.6} />;
              })}
            </Svg>
            {heap.length > 0 && <Label x={heapSlot(side, 0).x + 56} y={heapSlot(side, 0).y - 16} size={22}>← top</Label>}
          </div>
        );
      })}
      {[...ids.entries()].map(([id, value]) => {
        const a = where(o, id), b = where(s, id);
        if (!b) return null;
        const to = heapSlot(b.side, b.k);
        let x: number, y: number;
        if (!a) {
          const sxp = sx(s.index);
          x = lerp(sxp, to.x, r.p);
          y = lerp(SY + 45, to.y, r.p) - Math.sin(Math.PI * r.p) * 60;
        } else {
          const from = heapSlot(a.side, a.k);
          x = lerp(from.x, to.x, r.p);
          y = lerp(from.y, to.y, r.p) - (a.side !== b.side ? Math.sin(Math.PI * r.p) * 90 : 0);
        }
        const moving = s.moving === id;
        return (
          <Dot key={id} x={x} y={y} d={84} fill={moving ? 'var(--orange)' : b.k === 0 ? 'var(--yellow)' : 'var(--card)'} size={34} scale={1 + (moving ? 0.1 * Math.sin(Math.PI * p) : 0)} opacity={r.live}>
            {value}
          </Dot>
        );
      })}
    </>
  );
};
export const heapConfetti = {x: 960, y: 560};

// ───────────────────────── backtracking tree ─────────────────────────
type BNode = {key: string; parent: string | null; pick: number | null; remaining: number; status: 'open' | 'found' | 'dead'};
/** Every branch, with no early cut: try each candidate at every node (in order, never going back to smaller ones). */
export const fullTree = (candidates: number[], target: number): BNode[] => {
  const out: BNode[] = [{key: '', parent: null, pick: null, remaining: target, status: 'open'}];
  const walk = (key: string, remaining: number, from: number) => {
    for (let c = from; c < candidates.length; c++) {
      const k = key ? `${key},${candidates[c]}` : `${candidates[c]}`;
      const left = remaining - candidates[c];
      out.push({key: k, parent: key, pick: candidates[c], remaining: left, status: left === 0 ? 'found' : left < 0 ? 'dead' : 'open'});
      if (left > 0) walk(k, left, c);
    }
  };
  walk('', target, 0);
  return out;
};
const comboGeo = (full: BNode[]) => {
  const kids = new Map<string, string[]>();
  full.forEach((n) => n.parent != null && kids.set(n.parent, [...(kids.get(n.parent) ?? []), n.key]));
  let leaf = 0;
  const xs = new Map<string, number>();
  const dep = new Map<string, number>();
  const place = (key: string, d: number) => {
    dep.set(key, d);
    const ch = kids.get(key) ?? [];
    if (!ch.length) xs.set(key, leaf++);
    else {
      ch.forEach((c) => place(c, d + 1));
      // centre a parent over its outermost children, so wide subtrees don't drag the root sideways
      xs.set(key, ((xs.get(ch[0]) as number) + (xs.get(ch[ch.length - 1]) as number)) / 2);
    }
  };
  place('', 0);
  const maxD = Math.max(...dep.values());
  const SP = Math.min(120, 470 / maxD);
  return (key: string) => ({x: 130 + ((xs.get(key) as number) / Math.max(1, leaf - 1)) * 1290, y: 280 + (dep.get(key) as number) * SP});
};
/** the trace's node ids, keyed by their path of picks */
const comboKeys = (tree: {id: number; parent: number | null; pick: number | null}[]) => {
  const byId = new Map(tree.map((n) => [n.id, n]));
  const keyOf = (id: number): string => {
    const n = byId.get(id);
    if (!n || n.parent == null) return '';
    const pk = keyOf(n.parent);
    return pk ? `${pk},${n.pick}` : `${n.pick}`;
  };
  return keyOf;
};

export const ComboBrute = ({r}: {r: Run}) => {
  const {candidates, target} = r.steps[0].state as {candidates: number[]; target: number};
  const full = fullTree(candidates, target);
  const P = comboGeo(full);
  const q = bruteK(r.t, full.length);
  if (q < 0) return null;
  const D = 56;
  return (
    <>
      <Svg>
        {full.slice(1, q + 1).map((n) => {
          const a = P(n.parent as string), b = P(n.key);
          return <line key={n.key} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={tok(n.status === 'dead' ? '--past-line' : '--ink')} strokeWidth={4} strokeLinecap="round" />;
        })}
      </Svg>
      {full.slice(0, q + 1).map((n, i) => {
        const b = bruteSpr(r.t, i, full.length, 'bouncy');
        return (
          <Dot key={n.key} x={P(n.key).x} y={P(n.key).y} d={D} fill={n.status === 'dead' ? 'var(--peach)' : n.status === 'found' ? 'var(--mint)' : 'var(--card)'} size={24} scale={0.5 + 0.5 * Math.min(1.15, b)}>
            {n.status === 'dead' ? '✕' : n.status === 'found' ? '✓' : n.remaining}
          </Dot>
        );
      })}
      {ring(P(full[q].key).x, P(full[q].key).y, D + 22, tok('--orange'))}
    </>
  );
};

export const ComboStage = ({r}: {r: Run}) => {
  const {s} = r;
  const {candidates, target} = r.steps[0].state as {candidates: number[]; target: number};
  const full = fullTree(candidates, target);
  const P = comboGeo(full);
  const keyOf = comboKeys(r.steps[r.steps.length - 1].state.tree);
  const nodeIn = (st: any, id: number) => st.tree.find((n: any) => n.id === id); // eslint-disable-line @typescript-eslint/no-explicit-any
  const bornOf = (id: number) => r.first((st) => !!nodeIn(st, id));
  const finalTree: any[] = r.steps[r.steps.length - 1].state.tree; // eslint-disable-line @typescript-eslint/no-explicit-any
  const realKeys = new Set(finalTree.map((n) => keyOf(n.id)));
  const cur = (st: any) => keyOf(st.current ?? 0); // eslint-disable-line @typescript-eslint/no-explicit-any
  const rx = r.mix(P(cur(r.o)).x, P(cur(s)).x), ry = r.mix(P(cur(r.o)).y, P(cur(s)).y);
  const D = 60;
  const results: number[][] = s.results;
  // the branches a cut skipped, drawn as ghosts so "every cut prunes a subtree" is visible
  const ghostOn = r.live * (s.phase === 'done' ? 1 : 0.55);
  return (
    <>
      <Svg>
        {full.slice(1).filter((n) => !realKeys.has(n.key)).map((n) => {
          const a = P(n.parent as string), b = P(n.key);
          return <line key={n.key} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={tok('--past-line')} strokeWidth={3} strokeDasharray="6 8" opacity={ghostOn * 0.8} />;
        })}
        {finalTree.map((n) => {
          const live = nodeIn(s, n.id);
          if (n.parent == null || !live) return null;
          const b = Math.min(1, r.born(bornOf(n.id), 'soft'));
          const a = P(keyOf(n.parent)), c = P(keyOf(n.id));
          const ex = lerp(a.x, c.x, b), ey = lerp(a.y, c.y, b);
          const col = live.status === 'cut' ? tok('--past-line') : live.status === 'found' ? tok('--mint') : tok('--ink');
          return <line key={n.id} x1={a.x} y1={a.y} x2={ex} y2={ey} stroke={col} strokeWidth={live.status === 'found' ? 9 : 5} strokeLinecap="round" opacity={live.status === 'cut' ? 0.7 : 1} />;
        })}
      </Svg>
      {full.filter((n) => !realKeys.has(n.key)).map((n) => (
        <div key={n.key} style={{position: 'absolute', left: P(n.key).x - 14, top: P(n.key).y - 14, width: 28, height: 28, borderRadius: '50%', border: '3px dashed var(--past-line)', opacity: ghostOn}} />
      ))}
      {ring(rx, ry, D + 24, tok('--orange'), s.phase === 'done' ? 0 : r.live)}
      {finalTree.map((n) => {
        const live = nodeIn(s, n.id);
        if (!live) return null;
        const q = P(keyOf(n.id));
        const b = r.born(bornOf(n.id), 'bouncy');
        const prevLive = nodeIn(r.o, n.id);
        const changed = prevLive && prevLive.status !== live.status ? 1 - r.p : 0;
        const st = live.status;
        const fill = st === 'cut' ? 'var(--peach)' : st === 'found' ? 'var(--mint)' : n.id === s.current ? 'var(--yellow)' : st === 'path' ? 'var(--card)' : 'var(--past-bg)';
        const sc = (0.4 + 0.6 * Math.min(1.15, b)) * (1 + 0.15 * changed);
        return (
          <div key={n.id} style={{opacity: r.live || n.id === 0 ? 1 : 0}}>
            <Dot x={q.x} y={q.y} d={D} fill={fill} size={26} scale={sc} opacity={clamp01(b * 2)} style={{transform: `scale(${sc}) rotate(${st === 'cut' ? Math.sin(r.p * 30) * 6 * (1 - r.p) : 0}deg)`}}>
              {st === 'cut' ? '✕' : st === 'found' ? '✓' : live.remaining}
            </Dot>
            {n.pick != null && (
              <div style={{position: 'absolute', left: q.x - 44, top: q.y - 54, fontFamily: mono, fontWeight: 500, fontSize: 22, color: 'var(--muted)', opacity: clamp01(b * 2)}}>+{n.pick}</div>
            )}
          </div>
        );
      })}
      {/* results */}
      <div style={{opacity: r.live}}>
        <Label x={1530} y={250} size={26}>found</Label>
        {results.map((res, i) => {
          const b = r.born(r.first((st) => st.results.length > i), 'bouncy');
          return (
            <Tile key={i} x={1530} y={300 + i * 96} w={300} h={78} fill="var(--mint)" radius={20} style={{fontSize: 30, fontFamily: mono, transform: `scale(${b})`, opacity: clamp01(b * 2), transformOrigin: 'left center'}}>
              [{res.join(', ')}]
            </Tile>
          );
        })}
        <div style={{position: 'absolute', left: 1530, top: 520, fontFamily: mono, fontSize: 26, color: 'var(--muted)', opacity: s.phase === 'setup' ? 0 : 1}}>path [{s.path.join(', ')}]</div>
        <div style={{position: 'absolute', left: 1530, top: 558, fontFamily: mono, fontSize: 26, color: 'var(--muted)', opacity: s.phase === 'setup' ? 0 : 1}}>need {s.remaining}</div>
      </div>
    </>
  );
};
export const comboConfetti = {x: 1680, y: 360};
