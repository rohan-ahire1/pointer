import type {ReactNode} from 'react';
import {lerp, tok} from './motion';
import {Run, Tile, clamp01, colorMix, display, mono, popStyle} from './scene';

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

// ───────────────────────── number of islands ─────────────────────────
export const IslandsStage = ({r}: {r: Run}) => {
  const {s, o} = r;
  const land: boolean[][] = r.steps[0].state.land ?? (r.steps[0].state.owner.map((row: any[]) => row.map(() => true)) as boolean[][]); // eslint-disable-line @typescript-eslint/no-explicit-any
  const R = land.length, C = land[0].length;
  const CS = 104, G = 10, GX = 250, GY = 262;
  const gx = (c: number) => GX + c * (CS + G), gy = (rr: number) => GY + rr * (CS + G);
  const palette = ['--mint', '--lilac', '--yellow', '--orange', '--sky'].map(tok);
  const pt = (st: any) => (st ? {x: gx(st[1]) + CS / 2, y: gy(st[0]) + CS / 2} : null); // eslint-disable-line @typescript-eslint/no-explicit-any
  const cA = pt(o.current) ?? pt(s.current), cB = pt(s.current) ?? pt(o.current);
  const curOn = s.current == null ? 0 : o.current == null ? r.p : 1;
  const scA = pt(o.scan) ?? pt(s.scan) ?? {x: 0, y: 0}, scB = pt(s.scan) ?? pt(o.scan) ?? {x: 0, y: 0};
  const sc = {x: lerp(scA.x, scB.x, r.p), y: lerp(scA.y, scB.y, r.p)};
  const incr = s.islands > o.islands;
  const queue: number[][] = s.queue;
  return (
    <>
      {land.map((row, rr) =>
        row.map((isLand, c) => {
          const own = s.owner[rr][c];
          const idx = rr * C + c;
          const pp = r.pop(idx, R * C);
          const bornStep = r.first((st) => st.owner[rr][c] != null);
          const b = own != null ? r.born(bornStep, 'bouncy') : 1;
          const fill = own != null ? palette[(own - 1) % palette.length] : isLand ? tok('--peach') : colorMix(tok('--sky'), tok('--paper'), 0.55);
          return (
            <div key={idx} style={{...popStyle(pp), position: 'absolute', left: 0, top: 0}}>
              <Tile
                x={gx(c)} y={gy(rr) + r.bob(idx)} w={CS} h={CS} radius={20} fill={fill} shadow={isLand}
                style={{fontSize: 40, color: 'var(--on-accent)', transform: `scale(${own != null ? 0.85 + 0.15 * Math.min(1.3, b) : 1})`, borderColor: isLand ? 'var(--line)' : 'var(--past-line)', borderWidth: isLand ? 3 : 2}}
              >
                {own != null ? own : isLand ? '' : <span style={{fontFamily: mono, fontSize: 30, color: 'var(--muted)', opacity: 0.7}}>~</span>}
              </Tile>
            </div>
          );
        }),
      )}
      {/* scanner */}
      {s.scan && s.phase !== 'done' && (
        <div style={{position: 'absolute', left: sc.x - CS / 2 - 8, top: sc.y - CS / 2 - 8, width: CS + 16, height: CS + 16, borderRadius: 26, border: '5px dashed var(--ink)', opacity: 0.8}} />
      )}
      {cA && cB && (
        <div style={{position: 'absolute', left: lerp(cA.x, cB.x, r.p) - CS / 2 - 10, top: lerp(cA.y, cB.y, r.p) - CS / 2 - 10, width: CS + 20, height: CS + 20, borderRadius: 28, border: '6px solid var(--orange)', opacity: curOn, boxShadow: `0 0 0 8px ${tok('--orange')}33`}} />
      )}
      {/* counter + queue */}
      <Label x={1130} y={262} size={26}>islands</Label>
      <Tile x={1130} y={302} w={300} h={150} fill={s.phase === 'done' ? 'var(--mint)' : 'var(--yellow)'} style={{fontSize: 90, color: 'var(--on-accent)', transform: `scale(${1 + (incr ? 0.14 * Math.sin(Math.PI * r.pb) : 0)})`}}>
        {s.islands}
      </Tile>
      <Label x={1130} y={494} size={26}>queue</Label>
      <div style={{position: 'absolute', left: 1130, top: 534, display: 'flex', flexWrap: 'wrap', gap: 12, width: 520}}>
        {queue.length === 0 && <Tile x={0} y={0} w={130} h={56} fill="var(--card-2)" radius={16} shadow={false} style={{position: 'relative', borderStyle: 'dashed', fontFamily: mono, fontWeight: 400, fontSize: 24, color: 'var(--faint)'}}>empty</Tile>}
        {queue.map((q) => (
          <Tile key={`${q[0]}-${q[1]}`} x={0} y={0} w={130} h={56} fill="var(--card)" radius={16} style={{position: 'relative', fontFamily: mono, fontWeight: 500, fontSize: 26, color: 'var(--ink)', transform: `scale(${0.7 + 0.3 * r.pb})`}}>
            ({q[0]},{q[1]})
          </Tile>
        ))}
      </div>
    </>
  );
};
export const islandsConfetti = {x: 530, y: 480};

// ───────────────────────── longest common subsequence ─────────────────────────
export const LcsStage = ({r}: {r: Run}) => {
  const {s, o, p} = r;
  const a: string = r.steps[0].state.a, b: string = r.steps[0].state.b;
  const rows = a.length + 1, cols = b.length + 1;
  const CW = 118, CH = 56, GP = 8, X0 = 250, Y0 = 250;
  const tx = (j: number) => X0 + (j + 1) * (CW + GP);
  const ty = (i: number) => Y0 + (i + 1) * (CH + GP);
  const center = (i: number, j: number) => ({x: tx(j) + CW / 2, y: ty(i) + CH / 2});
  const path: number[][] | null = s.path;
  const traceStep = r.steps.findIndex((st) => st.state.phase === 'traceback');
  const lit = path ? (s.phase === 'done' ? path.length : Math.min(path.length, Math.floor(Math.max(0, r.t - r.T(traceStep)) / 0.17) + 1)) : 0;
  const cur = s.i != null ? center(s.i, s.j) : null;
  const src = s.from === 'diag' ? [s.i - 1, s.j - 1] : s.from === 'up' ? [s.i - 1, s.j] : s.from === 'left' ? [s.i, s.j - 1] : null;
  const matches = path ? path.filter((c, idx) => idx < lit && c[0] > 0 && c[1] > 0 && a[c[0] - 1] === b[c[1] - 1]).map((c) => a[c[0] - 1]).reverse() : [];
  return (
    <>
      <Svg>
        {cur && src && (
          <line
            x1={center(src[0], src[1]).x} y1={center(src[0], src[1]).y} x2={lerp(center(src[0], src[1]).x, cur.x, r.p)} y2={lerp(center(src[0], src[1]).y, cur.y, r.p)}
            stroke={tok('--orange')} strokeWidth={8} strokeLinecap="round" strokeDasharray="12 10"
          />
        )}
        {path && lit > 1 && (
          <polyline points={path.slice(0, lit).map((c) => `${center(c[0], c[1]).x},${center(c[0], c[1]).y}`).join(' ')} fill="none" stroke={tok('--orange')} strokeWidth={10} strokeLinejoin="round" strokeLinecap="round" opacity={0.85} />
        )}
      </Svg>
      {/* headers */}
      {Array.from({length: cols}).map((_, j) => (
        <Tile key={`h${j}`} x={tx(j)} y={Y0 + r.bob(j)} w={CW} h={CH} fill={j === s.j ? 'var(--yellow)' : 'var(--tint-lilac)'} radius={14} shadow={false} style={{...popStyle(r.pop(j, 12)), fontFamily: mono, fontWeight: 500, fontSize: 32, color: 'var(--on-accent)'}}>
          {j === 0 ? '∅' : b[j - 1]}
        </Tile>
      ))}
      {Array.from({length: rows}).map((_, i) => (
        <Tile key={`r${i}`} x={X0} y={ty(i) + r.bob(i)} w={CW} h={CH} fill={i === s.i ? 'var(--yellow)' : 'var(--tint-lilac)'} radius={14} shadow={false} style={{...popStyle(r.pop(i + 2, 12)), fontFamily: mono, fontWeight: 500, fontSize: 32, color: 'var(--on-accent)'}}>
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
              key={`${i}-${j}`} x={tx(j)} y={ty(i)} w={CW} h={CH} fill={fill} radius={14} shadow={false}
              style={{fontSize: 30, color: isEdge ? 'var(--faint)' : 'var(--on-accent)', borderStyle: v == null ? 'dashed' : 'solid', borderColor: v == null ? 'var(--past-line)' : 'var(--line)', transform: `scale(${v == null ? 1 : 0.7 + 0.3 * Math.min(1.25, bb)})`, opacity: v == null ? 0.6 : Math.min(1, bb * 2)}}
            >
              {v}
            </Tile>
          );
        }),
      )}
      {/* strings */}
      <Label x={1130} y={262} size={26}>a</Label>
      <div style={{position: 'absolute', left: 1130, top: 300, display: 'flex', gap: 8}}>
        {a.split('').map((ch, i) => (
          <Tile key={i} x={0} y={0} w={64} h={74} radius={14} fill={i === (s.i ?? -9) - 1 ? 'var(--yellow)' : 'var(--card)'} style={{...popStyle(r.pop(i, 6)), position: 'relative', fontFamily: mono, fontWeight: 500, fontSize: 36, color: 'var(--on-accent)'}}>{ch}</Tile>
        ))}
      </div>
      <Label x={1130} y={410} size={26}>b</Label>
      <div style={{position: 'absolute', left: 1130, top: 448, display: 'flex', gap: 8}}>
        {b.split('').map((ch, j) => (
          <Tile key={j} x={0} y={0} w={64} h={74} radius={14} fill={j === (s.j ?? -9) - 1 ? 'var(--yellow)' : 'var(--card)'} style={{...popStyle(r.pop(j + 1, 6)), position: 'relative', fontFamily: mono, fontWeight: 500, fontSize: 36, color: 'var(--on-accent)'}}>{ch}</Tile>
        ))}
      </div>
      {path && (
        <>
          <Label x={1130} y={560} size={26}>subsequence</Label>
          <div style={{position: 'absolute', left: 1130, top: 598, display: 'flex', gap: 8}}>
            {matches.map((ch, i) => (
              <Tile key={i} x={0} y={0} w={72} h={80} radius={16} fill="var(--mint)" style={{position: 'relative', fontFamily: mono, fontWeight: 500, fontSize: 42, color: 'var(--on-accent)', transform: `scale(${0.7 + 0.3 * r.pb})`}}>{ch}</Tile>
            ))}
          </div>
        </>
      )}
      <div style={{display: 'none'}}>{display}{p}{o.i}</div>
    </>
  );
};
export const lcsConfetti = {x: 1250, y: 640};

// ───────────────────────── merge intervals ─────────────────────────
export const IntervalsStage = ({r}: {r: Run}) => {
  const {s, o, p} = r;
  const items: {id: number; start: number; end: number}[] = s.items ?? (r.steps[0].state.items as any[]); // eslint-disable-line @typescript-eslint/no-explicit-any
  const maxV = Math.max(...items.map((x) => x.end)) + 2;
  const X0 = 330, UW = 1300 / maxV;
  const ux = (v: number) => X0 + v * UW;
  const RY = 270, RH = 46, RG = 14;
  const ry = (i: number) => RY + i * (RH + RG);
  const MY = RY + items.length * (RH + RG) + 50;
  const merged: any[] = s.merged, omerged: any[] = o.merged; // eslint-disable-line @typescript-eslint/no-explicit-any
  const lastEnd = (m: any[]) => (m.length ? m[m.length - 1].end : null); // eslint-disable-line @typescript-eslint/no-explicit-any
  const le = lastEnd(merged) ?? lastEnd(omerged);
  const leX = lastEnd(merged) != null && lastEnd(omerged) != null ? r.mix(ux(lastEnd(omerged)), ux(lastEnd(merged))) : le != null ? ux(le) : null;
  const sortOn = s.phase === 'sort' ? r.p : 0;
  return (
    <>
      {/* guides */}
      {Array.from({length: Math.floor(maxV / 2) + 1}).map((_, k) => (
        <div key={k}>
          <div style={{position: 'absolute', left: ux(k * 2), top: RY - 16, height: MY + RH + 30 - RY, borderLeft: '2px dashed var(--past-line)', opacity: 0.5}} />
          <Label x={ux(k * 2)} y={MY + RH + 36} align="center" size={22}>{k * 2}</Label>
        </div>
      ))}
      {items.map((it, i) => {
        const out = s.outcomes[it.id];
        const cur = i === s.i;
        const fill = cur ? 'var(--yellow)' : out ? 'var(--tint-lilac)' : 'var(--card)';
        const pp = r.pop(i, items.length);
        return (
          <div key={it.id} style={{opacity: Math.min(1, pp * 1.5), transform: `translateX(${(1 - pp) * -80}px)`}}>
            <Tile x={ux(it.start)} y={ry(i) + r.bob(i) * 0.5 - (cur ? 6 : 0)} w={(it.end - it.start) * UW} h={RH} fill={fill} radius={14} style={{fontFamily: mono, fontWeight: 500, fontSize: 26, color: 'var(--on-accent)'}}>
              [{it.start}, {it.end}]
            </Tile>
          </div>
        );
      })}
      <Label x={X0 - 30} y={MY - 44} align="left" size={26}>merged</Label>
      {merged.map((m, i) => {
        const prevM = omerged[i];
        const born = r.first((st) => st.merged.length > i);
        const bb = r.born(born, 'bouncy');
        const st = prevM ? r.mix(prevM.start, m.start) : m.start;
        const en = prevM ? r.mix(prevM.end, m.end) : m.end;
        const stretch = prevM && prevM.end !== m.end ? Math.sin(Math.PI * p) : 0;
        return (
          <Tile key={i} x={ux(st)} y={MY} w={Math.max(0, (en - st) * UW)} h={RH + 14} fill="var(--mint)" radius={16} style={{fontFamily: mono, fontWeight: 500, fontSize: 28, color: 'var(--on-accent)', transformOrigin: 'left center', transform: `scale(${prevM ? 1 : 0.4 + 0.6 * Math.min(1.1, bb)}, ${1 + 0.12 * stretch})`, opacity: prevM ? 1 : clamp01(bb * 2), whiteSpace: 'nowrap'}}>
            [{Math.round(st)}, {Math.round(en)}]
          </Tile>
        );
      })}
      {leX != null && s.phase !== 'done' && (
        <div style={{position: 'absolute', left: leX - 2, top: RY - 20, height: MY + RH + 40 - RY, borderLeft: '5px dashed var(--orange)', opacity: 0.9}} />
      )}
      {sortOn > 0 && (
        <Tile x={110} y={300} w={190} h={80} fill="var(--lilac)" radius={20} style={{fontSize: 24, color: 'var(--on-accent)', opacity: sortOn, transform: `translateY(${(1 - sortOn) * 20}px)`}}>
          sorted ↓
        </Tile>
      )}
      <div style={{display: 'none'}}>{display}</div>
    </>
  );
};
export const intervalsConfetti = {x: 960, y: 590};
