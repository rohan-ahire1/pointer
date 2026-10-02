import type {ReactNode} from 'react';
import {lerp, tok} from './motion';
import {Run, Tile, body, bruteK, clamp01, colorMix, display, mono, popStyle} from './scene';

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
const Verdict = ({x, y, w = 560, ok = null, children}: {x: number; y: number; w?: number; ok?: boolean | null; children: ReactNode}) => (
  <Tile x={x} y={y} w={w} h={100} fill={ok ? 'var(--mint)' : 'var(--card)'} style={{fontSize: 40, gap: 18}}>
    {children}
    {ok != null && <span style={{color: ok ? undefined : 'var(--pen)'}}>{ok ? '✓' : '✕'}</span>}
  </Tile>
);

// ───────────────────────── number of islands ─────────────────────────
const IS = {CS: 118, G: 12, GX: 230, GY: 262};
const isX = (c: number) => IS.GX + c * (IS.CS + IS.G);
const isY = (rr: number) => IS.GY + rr * (IS.CS + IS.G);
const ISLAND = ['--mint', '--lilac', '--sky'];
const landOf = (r: Run): boolean[][] => r.steps[0].state.land ?? (r.steps[0].state.owner as any[][]).map((row) => row.map(() => true)); // eslint-disable-line @typescript-eslint/no-explicit-any
/** Brute force: start a fresh flood from every land cell, even ones already explored. */
export const floodVisits = (land: boolean[][]) => {
  const R = land.length, C = land[0].length;
  const out: {src: [number, number]; cell: [number, number]; flood: number}[] = [];
  let flood = 0;
  for (let r0 = 0; r0 < R; r0++) for (let c0 = 0; c0 < C; c0++) {
    if (!land[r0][c0]) continue;
    const seen = new Set([`${r0},${c0}`]);
    const queue: [number, number][] = [[r0, c0]];
    while (queue.length) {
      const [r, c] = queue.shift() as [number, number];
      out.push({src: [r0, c0], cell: [r, c], flood});
      for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nr = r + dr, nc = c + dc;
        if (nr >= 0 && nr < R && nc >= 0 && nc < C && land[nr][nc] && !seen.has(`${nr},${nc}`)) {
          seen.add(`${nr},${nc}`);
          queue.push([nr, nc]);
        }
      }
    }
    flood++;
  }
  return out;
};

export const IslandsBrute = ({r}: {r: Run}) => {
  const land = landOf(r);
  const visits = floodVisits(land);
  const q = bruteK(r.t, visits.length);
  if (q < 0) return null;
  const {CS} = IS;
  const cur = visits[q];
  const counts = new Map<string, number>();
  visits.slice(0, q + 1).forEach((v) => counts.set(`${v.cell[0]},${v.cell[1]}`, (counts.get(`${v.cell[0]},${v.cell[1]}`) ?? 0) + 1));
  const thisFlood = visits.filter((v, i) => v.flood === cur.flood && i <= q);
  return (
    <>
      {thisFlood.map((v, i) => (
        <div key={i} style={{position: 'absolute', left: isX(v.cell[1]), top: isY(v.cell[0]), width: CS, height: CS, borderRadius: 20, background: tok('--orange'), opacity: 0.35}} />
      ))}
      {[...counts.entries()].map(([key, c]) => {
        const [rr, cc] = key.split(',').map(Number);
        return (
          <div key={key} style={{position: 'absolute', left: isX(cc), top: isY(rr), width: CS, height: CS, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: display, fontWeight: 800, fontSize: 40, color: c > 1 ? 'var(--pen)' : 'var(--on-accent)'}}>
            ×{c}
          </div>
        );
      })}
      <div style={{position: 'absolute', left: isX(cur.src[1]) - 10, top: isY(cur.src[0]) - 10, width: CS + 20, height: CS + 20, borderRadius: 28, border: `6px solid ${tok('--orange')}`}} />
      <Verdict x={1130} y={340} w={520}>
        <span style={{fontFamily: body, fontWeight: 700, fontSize: 30}}>flood from ({cur.src[0]}, {cur.src[1]})</span>
      </Verdict>
    </>
  );
};

export const IslandsStage = ({r}: {r: Run}) => {
  const {s, o} = r;
  const land = landOf(r);
  const R = land.length, C = land[0].length;
  const {CS} = IS;
  const pt = (st: any) => (st ? {x: isX(st[1]) + CS / 2, y: isY(st[0]) + CS / 2} : null); // eslint-disable-line @typescript-eslint/no-explicit-any
  const cA = pt(o.current) ?? pt(s.current), cB = pt(s.current) ?? pt(o.current);
  const curOn = s.current == null ? 0 : o.current == null ? r.p : 1;
  // the scanner walks every cell in reading order between the two positions, so the scan is visible
  const idx = (sc: number[] | null) => (sc ? sc[0] * C + sc[1] : 0);
  const a = idx(o.scan ?? s.scan), b = idx(s.scan ?? o.scan);
  const dur = Math.max(0.4, (r.T(r.k + 1) - r.T(r.k)) * 0.75);
  const lin = r.k === r.steps.length - 1 ? 1 : clamp01((r.t - r.T(r.k)) / dur);
  const scanIdx = Math.round(lerp(a, b, lin));
  const scanR = Math.floor(scanIdx / C), scanC = scanIdx % C;
  const incr = s.islands > o.islands;
  const queue: number[][] = s.queue;
  return (
    <>
      {land.map((row, rr) =>
        row.map((isLand, c) => {
          const own = s.owner[rr][c];
          const k = rr * C + c;
          const pp = r.pop(k, R * C);
          const bornStep = r.first((st) => st.owner[rr][c] != null);
          const bb = own != null ? r.born(bornStep, 'bouncy') : 1;
          const fill = own != null ? tok(ISLAND[(own - 1) % ISLAND.length]) : isLand ? tok('--peach') : colorMix(tok('--sky'), tok('--paper'), 0.6);
          return (
            <div key={k} style={{...popStyle(pp), position: 'absolute', left: 0, top: 0}}>
              <Tile
                x={isX(c)} y={isY(rr)} w={CS} h={CS} radius={20} fill={fill} shadow={isLand}
                style={{fontSize: 44, transform: `scale(${own != null ? 0.85 + 0.15 * Math.min(1.3, bb) : 1})`, borderColor: isLand ? 'var(--line)' : 'var(--past-line)', borderWidth: isLand ? 3 : 2}}
              >
                {own != null ? own : isLand ? '' : <span style={{fontFamily: mono, fontSize: 30, color: 'var(--muted)', opacity: 0.7}}>~</span>}
              </Tile>
            </div>
          );
        }),
      )}
      {/* scanner */}
      {s.scan && s.phase !== 'done' && r.live > 0.5 && (
        <div style={{position: 'absolute', left: isX(scanC) - 8, top: isY(scanR) - 8, width: CS + 16, height: CS + 16, borderRadius: 26, border: '5px dashed var(--ink)', opacity: 0.85}} />
      )}
      {cA && cB && (
        <div style={{position: 'absolute', left: lerp(cA.x, cB.x, r.p) - CS / 2 - 10, top: lerp(cA.y, cB.y, r.p) - CS / 2 - 10, width: CS + 20, height: CS + 20, borderRadius: 28, border: '6px solid var(--orange)', opacity: curOn, boxShadow: `0 0 0 8px ${tok('--orange')}33`}} />
      )}
      {/* counter + queue */}
      <div style={{opacity: r.live}}>
        <Label x={1130} y={262} size={26}>islands</Label>
        <Tile x={1130} y={302} w={300} h={150} fill={s.phase === 'done' ? 'var(--mint)' : 'var(--yellow)'} style={{fontSize: 90, transform: `scale(${1 + (incr ? 0.14 * Math.sin(Math.PI * r.pb) : 0)})`}}>
          {s.islands}
        </Tile>
        <Label x={1130} y={494} size={26}>queue</Label>
        <div style={{position: 'absolute', left: 1130, top: 534, display: 'flex', flexWrap: 'wrap', gap: 12, width: 560}}>
          {queue.length === 0 && <Tile x={0} y={0} w={130} h={56} fill="var(--card-2)" radius={16} shadow={false} style={{position: 'relative', borderStyle: 'dashed', fontFamily: mono, fontWeight: 400, fontSize: 24, color: 'var(--faint)'}}>empty</Tile>}
          {queue.map((qq) => (
            <Tile key={`${qq[0]}-${qq[1]}`} x={0} y={0} w={130} h={56} fill="var(--card)" radius={16} style={{position: 'relative', fontFamily: mono, fontWeight: 500, fontSize: 26, transform: `scale(${0.7 + 0.3 * r.pb})`}}>
              ({qq[0]},{qq[1]})
            </Tile>
          ))}
        </div>
      </div>
    </>
  );
};
export const islandsConfetti = {x: 1280, y: 380};

// ───────────────────────── longest common subsequence ─────────────────────────
const LC = {CW: 140, CH: 72, GP: 8, X0: 150, Y0: 236};
const lcX = (j: number) => LC.X0 + (j + 1) * (LC.CW + LC.GP);
const lcY = (i: number) => LC.Y0 + (i + 1) * (LC.CH + LC.GP);
const isSub = (sub: string, of: string) => {
  let k = 0;
  for (const ch of of) if (k < sub.length && ch === sub[k]) k++;
  return k === sub.length;
};
/** Brute force: list every subsequence of the first word, and check each against the second. */
export const lcsSubsets = (a: string, b: string) =>
  Array.from({length: 1 << a.length}, (_, m) => {
    const sub = a.split('').filter((_, i) => (m >> i) & 1).join('');
    return {m, sub, ok: isSub(sub, b)};
  });

const RP = 1080; // right panel x
export const LcsBrute = ({r}: {r: Run}) => {
  const {a, b} = r.steps[0].state as {a: string; b: string};
  const subs = lcsSubsets(a, b);
  const q = bruteK(r.t, subs.length);
  if (q < 0) return null;
  const cur = subs[q];
  const best = subs.slice(0, q + 1).filter((x) => x.ok).reduce((m, x) => (x.sub.length > m.length ? x.sub : m), '');
  return (
    <>
      <Label x={RP} y={300} size={26}>pick letters of “{a}”</Label>
      <div style={{position: 'absolute', left: RP, top: 340, display: 'flex', gap: 10}}>
        {a.split('').map((ch, i) => {
          const on = (cur.m >> i) & 1;
          return (
            <Tile key={i} x={0} y={0} w={76} h={88} radius={16} fill={on ? (cur.ok ? 'var(--mint)' : 'var(--peach)') : 'var(--card)'} style={{position: 'relative', fontFamily: mono, fontWeight: 500, fontSize: 42, opacity: on ? 1 : 0.45, transform: `translateY(${on ? -10 : 0}px)`}}>
              {ch}
            </Tile>
          );
        })}
      </div>
      <Verdict x={RP} y={470} w={620} ok={cur.sub ? cur.ok : null}>
        <span style={{fontFamily: mono, fontWeight: 500}}>“{cur.sub || '∅'}”</span>
        <span style={{fontFamily: body, fontWeight: 700, fontSize: 28}}>in “{b}”?</span>
      </Verdict>
      <Label x={RP} y={600} size={28}>longest so far: “{best}”</Label>
    </>
  );
};

export const LcsStage = ({r}: {r: Run}) => {
  const {s} = r;
  const a: string = r.steps[0].state.a, b: string = r.steps[0].state.b;
  const rows = a.length + 1, cols = b.length + 1;
  const {CW, CH, X0, Y0} = LC;
  const center = (i: number, j: number) => ({x: lcX(j) + CW / 2, y: lcY(i) + CH / 2});
  const path: number[][] | null = s.path;
  const traceStep = r.steps.findIndex((st) => st.state.phase === 'traceback');
  const lit = path ? (s.phase === 'done' ? path.length : Math.min(path.length, Math.floor(Math.max(0, r.t - r.T(traceStep)) / 0.32) + 1)) : 0;
  const cur = s.i != null ? center(s.i, s.j) : null;
  const src = s.from === 'diag' ? [s.i - 1, s.j - 1] : s.from === 'up' ? [s.i - 1, s.j] : s.from === 'left' ? [s.i, s.j - 1] : null;
  const matches = path ? path.filter((c, idx) => idx < lit && c[0] > 0 && c[1] > 0 && a[c[0] - 1] === b[c[1] - 1]).map((c) => a[c[0] - 1]).reverse() : [];
  const fillIn = s.i != null;
  const up = fillIn ? s.dp[s.i - 1][s.j] : 0, left = fillIn ? s.dp[s.i][s.j - 1] : 0, diag = fillIn ? s.dp[s.i - 1][s.j - 1] : 0;
  const isMatch = s.kind === 'match';
  return (
    <>
      <Svg>
        {cur && src && (
          <line
            x1={center(src[0], src[1]).x} y1={center(src[0], src[1]).y} x2={lerp(center(src[0], src[1]).x, cur.x, r.p)} y2={lerp(center(src[0], src[1]).y, cur.y, r.p)}
            stroke={tok('--orange')} strokeWidth={12} strokeLinecap="round" strokeDasharray="14 10"
          />
        )}
        {path && lit > 1 && (
          <polyline points={path.slice(0, lit).map((c) => `${center(c[0], c[1]).x},${center(c[0], c[1]).y}`).join(' ')} fill="none" stroke={tok('--orange')} strokeWidth={12} strokeLinejoin="round" strokeLinecap="round" opacity={0.85} />
        )}
      </Svg>
      {/* headers */}
      {Array.from({length: cols}).map((_, j) => (
        <Tile key={`h${j}`} x={lcX(j)} y={Y0} w={CW} h={CH} fill={j === s.j ? 'var(--yellow)' : 'var(--tint-lilac)'} radius={14} shadow={false} style={{...popStyle(r.pop(j, 12)), fontFamily: mono, fontWeight: 500, fontSize: 36}}>
          {j === 0 ? '∅' : b[j - 1]}
        </Tile>
      ))}
      {Array.from({length: rows}).map((_, i) => (
        <Tile key={`r${i}`} x={X0} y={lcY(i)} w={CW} h={CH} fill={i === s.i ? 'var(--yellow)' : 'var(--tint-lilac)'} radius={14} shadow={false} style={{...popStyle(r.pop(i + 2, 12)), fontFamily: mono, fontWeight: 500, fontSize: 36}}>
          {i === 0 ? '∅' : a[i - 1]}
        </Tile>
      ))}
      {s.dp.map((row: (number | null)[], i: number) =>
        row.map((v, j) => {
          const bornStep = r.first((st) => st.dp[i][j] != null);
          const isEdge = i === 0 || j === 0;
          const bb = isEdge ? r.pop(i + j, 12) : v != null ? r.born(bornStep, 'bouncy') : 0;
          const curCell = i === s.i && j === s.j;
          const match = !isEdge && v != null && a[i - 1] === b[j - 1] && s.dp[i - 1][j - 1] + 1 === v;
          const onPath = path ? path.slice(0, lit).some((c) => c[0] === i && c[1] === j) : false;
          const fill = onPath ? 'var(--orange)' : curCell ? 'var(--yellow)' : match ? 'var(--mint)' : isEdge ? 'var(--card-2)' : 'var(--card)';
          return (
            <Tile
              key={`${i}-${j}`} x={lcX(j)} y={lcY(i)} w={CW} h={CH} fill={fill} radius={14} shadow={false}
              style={{fontSize: 36, color: isEdge && !onPath ? 'var(--faint)' : undefined, borderStyle: v == null ? 'dashed' : 'solid', borderColor: v == null ? 'var(--past-line)' : 'var(--line)', transform: `scale(${v == null ? 1 : 0.7 + 0.3 * Math.min(1.25, bb)})`, opacity: v == null ? 0.6 : Math.min(1, bb * 2)}}
            >
              {v}
            </Tile>
          );
        }),
      )}
      {/* the rule for the current cell, spelled out */}
      <div style={{opacity: r.live}}>
        {fillIn && (
          <div style={{position: 'absolute', left: RP, top: 300, opacity: clamp01(r.p * 2)}}>
            <div style={{fontFamily: mono, fontWeight: 500, fontSize: 26, color: 'var(--muted)', marginBottom: 12}}>row {a[s.i - 1]}, column {b[s.j - 1]}</div>
            <div style={{fontFamily: display, fontWeight: 800, fontSize: 46, whiteSpace: 'nowrap'}}>
              {isMatch ? (
                <>‘{a[s.i - 1]}’ = ‘{b[s.j - 1]}’ <span style={{color: 'var(--pen)'}}>→</span> {diag} + 1 = <span style={{background: 'var(--mint)', color: 'var(--on-accent)', padding: '0 12px', borderRadius: 12}}>{diag + 1}</span></>
              ) : (
                <>‘{a[s.i - 1]}’ ≠ ‘{b[s.j - 1]}’ <span style={{color: 'var(--pen)'}}>→</span> max({up}, {left}) = <span style={{background: 'var(--hl)', padding: '0 12px', borderRadius: 12}}>{Math.max(up, left)}</span></>
              )}
            </div>
            <div style={{fontFamily: body, fontWeight: 700, fontSize: 28, color: 'var(--muted)', marginTop: 12}}>{isMatch ? 'match: take the diagonal, add one' : 'miss: carry the bigger of up and left'}</div>
          </div>
        )}
        {path && (
          <>
            <Label x={RP} y={300} size={28}>walk back through the matches</Label>
            <Label x={RP} y={470} size={26}>subsequence</Label>
            <div style={{position: 'absolute', left: RP, top: 510, display: 'flex', gap: 10}}>
              {matches.map((ch, i) => (
                <Tile key={i} x={0} y={0} w={84} h={92} radius={16} fill="var(--mint)" style={{position: 'relative', fontFamily: mono, fontWeight: 500, fontSize: 46, transform: `scale(${0.7 + 0.3 * r.pb})`}}>{ch}</Tile>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
};
export const lcsConfetti = {x: 1250, y: 560};

// ───────────────────────── merge intervals ─────────────────────────
type Iv = {id: number; start: number; end: number};
const IV = {X0: 250, RY: 262, RH: 60, RG: 16};
/** Brute force: compare every pair of intervals to see which overlap. */
export const intervalPairs = (items: Iv[]) => {
  const out: {a: Iv; b: Iv; overlap: boolean}[] = [];
  for (let i = 0; i < items.length; i++) for (let j = i + 1; j < items.length; j++) {
    const a = items[i], b = items[j];
    out.push({a, b, overlap: a.start <= b.end && b.start <= a.end});
  }
  return out;
};
const ivGeo = (items: Iv[]) => {
  const maxV = Math.max(20, ...items.map((x) => x.end + 2));
  const UW = 1350 / maxV;
  return {maxV, ux: (v: number) => IV.X0 + v * UW, UW, ry: (row: number) => IV.RY + row * (IV.RH + IV.RG), MY: IV.RY + items.length * (IV.RH + IV.RG) + 54};
};

export const IntervalsBrute = ({r}: {r: Run}) => {
  const items: Iv[] = r.steps[0].state.items;
  const pairs = intervalPairs(items);
  const q = bruteK(r.t, pairs.length);
  if (q < 0) return null;
  const {ux, UW, ry} = ivGeo(items);
  const cur = pairs[q];
  const rowOf = (it: Iv) => items.findIndex((x) => x.id === it.id);
  return (
    <>
      {[cur.a, cur.b].map((it) => (
        <div key={it.id} style={{position: 'absolute', left: ux(it.start) - 10, top: ry(rowOf(it)) - 10, width: (it.end - it.start) * UW + 20, height: IV.RH + 20, borderRadius: 22, border: `6px solid ${tok(cur.overlap ? '--mint' : '--orange')}`}} />
      ))}
      <Verdict x={1170} y={IV.RY + 4 * (IV.RH + IV.RG) + 40} w={520} ok={cur.overlap}>
        <span style={{fontFamily: mono, fontWeight: 500, fontSize: 32}}>[{cur.a.start},{cur.a.end}] & [{cur.b.start},{cur.b.end}]</span>
      </Verdict>
    </>
  );
};

export const IntervalsStage = ({r}: {r: Run}) => {
  const {s, o, p} = r;
  const items: Iv[] = s.items;
  const {maxV, ux, UW, ry, MY} = ivGeo(items);
  // rows follow each interval, so the sort step visibly reorders them
  const rowIn = (st: any, id: number) => (st.items as Iv[]).findIndex((x) => x.id === id); // eslint-disable-line @typescript-eslint/no-explicit-any
  const merged: any[] = s.merged, omerged: any[] = o.merged; // eslint-disable-line @typescript-eslint/no-explicit-any
  const lastEnd = (m: any[]) => (m.length ? m[m.length - 1].end : null); // eslint-disable-line @typescript-eslint/no-explicit-any
  const le = lastEnd(merged) ?? lastEnd(omerged);
  const leX = lastEnd(merged) != null && lastEnd(omerged) != null ? r.mix(ux(lastEnd(omerged)), ux(lastEnd(merged))) : le != null ? ux(le) : null;
  const sorting = s.phase === 'sort';
  const axisOn = r.t < 48.6 ? 1 : 0;
  return (
    <>
      {/* guides */}
      {Array.from({length: Math.floor(maxV / 2) + 1}).map((_, k) => (
        <div key={k} style={{opacity: axisOn}}>
          <div style={{position: 'absolute', left: ux(k * 2), top: IV.RY - 16, height: MY + IV.RH + 30 - IV.RY, borderLeft: '2px dashed var(--past-line)', opacity: 0.5}} />
          <Label x={ux(k * 2)} y={MY + IV.RH + 36} align="center" size={24}>{k * 2}</Label>
        </div>
      ))}
      {items.map((it) => {
        const out = s.outcomes[it.id];
        const rowNow = rowIn(s, it.id), rowWas = rowIn(o, it.id);
        const cur = rowNow === s.i;
        const fill = cur ? 'var(--yellow)' : out ? 'var(--tint-lilac)' : 'var(--card)';
        const pp = r.pop(rowNow, items.length);
        const y = lerp(ry(rowWas), ry(rowNow), sorting ? r.ps : 1) - (cur ? 6 : 0);
        const lift = sorting && rowWas !== rowNow ? Math.sin(Math.PI * clamp01(r.ps)) * 12 : 0;
        return (
          <div key={it.id} style={{opacity: Math.min(1, pp * 1.5), transform: `translateX(${(1 - pp) * -80}px)`}}>
            <Tile x={ux(it.start)} y={y - lift} w={(it.end - it.start) * UW} h={IV.RH} fill={fill} radius={16} style={{fontFamily: mono, fontWeight: 500, fontSize: 30, whiteSpace: 'nowrap'}}>
              [{it.start}, {it.end}]
            </Tile>
          </div>
        );
      })}
      {sorting && (
        <Tile x={60} y={IV.RY + 40} w={170} h={80} fill="var(--lilac)" radius={20} style={{fontSize: 24, opacity: clamp01(r.p * 2)}}>
          sort ↓
        </Tile>
      )}
      <div style={{opacity: r.live}}>
        <Label x={IV.X0 - 30} y={MY + 18} align="right" size={26}>merged</Label>
        {merged.map((m, i) => {
          const prevM = omerged[i];
          const born = r.first((st) => st.merged.length > i);
          const bb = r.born(born, 'bouncy');
          const st = prevM ? r.mix(prevM.start, m.start) : m.start;
          const en = prevM ? r.mix(prevM.end, m.end) : m.end;
          const stretch = prevM && prevM.end !== m.end ? Math.sin(Math.PI * p) : 0;
          return (
            <Tile key={i} x={ux(st)} y={MY} w={Math.max(0, (en - st) * UW)} h={IV.RH + 10} fill="var(--mint)" radius={18} style={{fontFamily: mono, fontWeight: 500, fontSize: 30, transformOrigin: 'left center', transform: `scale(${prevM ? 1 : 0.4 + 0.6 * Math.min(1.1, bb)}, ${1 + 0.12 * stretch})`, opacity: prevM ? 1 : clamp01(bb * 2), whiteSpace: 'nowrap'}}>
              [{Math.round(st)}, {Math.round(en)}]
            </Tile>
          );
        })}
        {leX != null && s.phase !== 'done' && (
          <>
            <div style={{position: 'absolute', left: leX - 2, top: IV.RY - 24, height: MY + IV.RH + 40 - IV.RY, borderLeft: '5px dashed var(--orange)', opacity: 0.9}} />
            <div style={{position: 'absolute', left: leX + 10, top: IV.RY - 50, fontFamily: body, fontWeight: 700, fontSize: 24, color: 'var(--pen)', whiteSpace: 'nowrap'}}>block ends at {Math.round(r.mix(lastEnd(omerged) ?? le, lastEnd(merged) ?? le))}</div>
          </>
        )}
      </div>
      <div style={{display: 'none'}}>{display}</div>
    </>
  );
};
export const intervalsConfetti = {x: 960, y: 590};
