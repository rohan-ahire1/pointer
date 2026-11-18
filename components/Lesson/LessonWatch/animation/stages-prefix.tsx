import type {ReactNode} from 'react';
import {lerp, tok} from './motion';
import {Run, Tag, Tile, body, bruteK, bruteSpr, clamp01, display, mono, popStyle} from './scene';

// ───────────────────────── prefix sum + hash map ─────────────────────────

const Label = ({x, y, children, align = 'right', size = 26}: {x: number; y: number; children: ReactNode; align?: 'left' | 'center' | 'right'; size?: number}) => (
  <div style={{position: 'absolute', left: x, top: y, transform: `translateX(${align === 'center' ? '-50%' : align === 'right' ? '-100%' : '0'})`, fontFamily: mono, fontWeight: 500, fontSize: size, color: 'var(--muted)', whiteSpace: 'nowrap'}}>
    {children}
  </div>
);

const PS = {W: 150, GAP: 30, Y: 310, H: 130, PY: 500, PH: 90, MY: 650, MH: 80, MW: 140, MG: 18, NY: 775};
const psX = (n: number, i: number) => (1920 - (n * PS.W + (n - 1) * PS.GAP)) / 2 + i * (PS.W + PS.GAP);
const mapX = (n: number, slot: number) => (1920 - (n * PS.MW + (n - 1) * PS.MG)) / 2 + slot * (PS.MW + PS.MG);

/** A capsule behind a run of tiles in the numbers row. */
const RunBand = ({n, a, b, color, opacity, lift = 0}: {n: number; a: number; b: number; color: string; opacity: number; lift?: number}) => (
  <div style={{position: 'absolute', left: psX(n, a) - 16, top: PS.Y - 16 - lift, width: psX(n, b) - psX(n, a) + PS.W + 32, height: PS.H + 32, borderRadius: 34, background: `${tok(color)}55`, border: `6px solid ${tok(color)}`, opacity}} />
);

/** Every subarray, shortest start first: what brute force sums. */
export const prefixSubarrays = (n: number): [number, number][] => {
  const out: [number, number][] = [];
  for (let i = 0; i < n; i++) for (let j = i; j < n; j++) out.push([i, j]);
  return out;
};

export const PrefixBrute = ({r}: {r: Run}) => {
  const {nums, k} = r.steps[0].state as {nums: number[]; k: number};
  const subs = prefixSubarrays(nums.length);
  const q = bruteK(r.t, subs.length);
  if (q < 0) return null;
  const [a, b] = subs[q];
  const part = nums.slice(a, b + 1);
  const sum = part.reduce((x, y) => x + y, 0);
  const ok = sum === k;
  const pop = bruteSpr(r.t, q, subs.length, 'bouncy');
  const shown = part.length > 4 ? `${part.slice(0, 3).join(' + ')} + …` : part.join(' + ');
  return (
    <>
      {nums.map((v, i) => (
        <Tile key={i} x={psX(nums.length, i)} y={PS.Y} w={PS.W} h={PS.H} fill={i >= a && i <= b ? (ok ? 'var(--mint)' : 'var(--tint-yellow)') : 'var(--card)'} style={{fontSize: 60}}>
          {v}
        </Tile>
      ))}
      <RunBand n={nums.length} a={a} b={b} color={ok ? '--mint' : '--orange'} opacity={1} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 600, display: 'flex', justifyContent: 'center'}}>
        <Tile x={0} y={0} w={760} h={110} fill={ok ? 'var(--mint)' : 'var(--card)'} style={{position: 'relative', fontFamily: body, fontWeight: 700, fontSize: 42, gap: 20, transform: `scale(${0.88 + 0.12 * Math.min(1.2, pop)})`}}>
          <span style={{fontFamily: mono, fontWeight: 500}}>{shown} = {sum}</span>
          <span style={{color: ok ? undefined : 'var(--pen)'}}>{ok ? `✓ ${k}` : '✕'}</span>
        </Tile>
      </div>
    </>
  );
};

type Seen = {sum: number; times: number};

export const PrefixStage = ({r}: {r: Run}) => {
  const {s, o, p} = r;
  const nums: number[] = s.nums;
  const n = nums.length;
  const k: number = s.k;
  const live = r.live;
  const look = s.phase === 'look';
  const hits: number = look ? s.hits : 0;
  const found: [number, number][] = s.found;
  const seen: Seen[] = s.seen;
  const iPos = (st: {i: number; phase: string}) => (st.i < 0 ? (st.phase === 'done' ? psX(n, n - 1) + PS.W / 2 + 180 : psX(n, 0) - 120) : psX(n, st.i) + PS.W / 2);
  const tagX = r.mix(iPos(o), iPos(s));
  const tagOn = r.mix(o.i < 0 ? 0 : 1, s.i < 0 ? 0 : 1);
  const hitSlot = hits ? seen.findIndex((e) => e.sum === s.need) : -1;
  const doneBounce = s.phase === 'done' ? Math.sin(Math.PI * r.pb) * 14 : 0;
  return (
    <>
      {/* subarrays found on this step */}
      {found.map(([a, b], f) => (
        <RunBand key={`${a}-${b}`} n={n} a={a} b={b} color="--mint" opacity={clamp01(p * 2) * live} lift={f * 10} />
      ))}
      {nums.map((v, i) => {
        const cur = i === s.i && s.phase !== 'done';
        const inRun = found.some(([a, b]) => i >= a && i <= b);
        const added = i < s.prefixes.length;
        const fill = inRun ? 'var(--mint)' : cur ? 'var(--yellow)' : added && live > 0.5 ? 'var(--tint-mint)' : 'var(--card)';
        return (
          <div key={i} style={{...popStyle(r.pop(i, n)), position: 'absolute', left: 0, top: 0}}>
            <Tile x={psX(n, i)} y={PS.Y} w={PS.W} h={PS.H} fill={fill} style={{fontSize: 60}}>
              {v}
            </Tile>
          </div>
        );
      })}
      <div style={{opacity: live}}>
        <Tag x={tagX} y={PS.Y - 92} label="x" opacity={tagOn} />
        {/* the running total under each number */}
        <Label x={psX(n, 0) - 24} y={PS.PY + 28}>prefix</Label>
        {nums.map((_, i) => {
          const born = r.first((st) => st.prefixes.length > i);
          if (born < 0 || born > r.k) return null;
          const e = r.born(born, 'bouncy');
          const cur = i === s.i && s.phase !== 'done';
          return (
            <Tile key={i} x={psX(n, i) + 10} y={lerp(PS.Y + 40, PS.PY, Math.min(1, e))} w={PS.W - 20} h={PS.PH} radius={18} fill={cur ? 'var(--yellow)' : 'var(--paper)'} style={{fontFamily: display, fontWeight: 800, fontSize: 40, opacity: clamp01(e * 2), borderStyle: cur ? 'solid' : 'dashed'}}>
              {s.prefixes[i]}
            </Tile>
          );
        })}
        {/* the map: each total seen so far, and how often */}
        <Label x={mapX(seen.length, 0) - 24} y={PS.MY + 22}>map</Label>
        {seen.map((e, slot) => {
          const born = slot === 0 ? 0 : r.first((st) => st.seen.length > slot);
          const b = r.born(born, 'snappy');
          const glow = slot === hitSlot;
          const grew = s.phase === 'store' && e.sum === s.prefix;
          return (
            <Tile
              key={e.sum} x={mapX(seen.length, slot)} y={PS.MY} w={PS.MW} h={PS.MH} radius={18}
              fill={glow ? 'var(--mint)' : grew ? 'var(--yellow)' : 'var(--tint-lilac)'}
              style={{fontFamily: mono, fontWeight: 500, fontSize: 30, gap: 8, opacity: clamp01(b * 2), transform: `scale(${glow ? 1 + 0.1 * Math.sin(Math.PI * p) : 0.7 + 0.3 * Math.min(1, b)})`}}
            >
              {e.sum}
              <span style={{fontSize: 22, color: 'var(--muted)'}}>×{e.times}</span>
            </Tile>
          );
        })}
        {hitSlot >= 0 && found.length > 0 && (
          <svg width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0, pointerEvents: 'none'}}>
            <path
              d={`M ${mapX(seen.length, hitSlot) + PS.MW / 2} ${PS.MY} Q ${mapX(seen.length, hitSlot) + PS.MW / 2} ${PS.PY + PS.PH + 40} ${psX(n, found[0][0]) + 20} ${PS.Y + PS.H + 20}`}
              fill="none" stroke={tok('--pen')} strokeWidth={6} strokeLinecap="round" strokeDasharray="14 10" strokeDashoffset={(1 - p) * 300} opacity={clamp01(p * 2)}
            />
          </svg>
        )}
        {/* what the map is asked: prefix - k */}
        {look && (
          <Tile x={530} y={PS.NY} w={700} h={86} radius={20} fill={hits ? 'var(--mint)' : 'var(--card)'} style={{fontFamily: display, fontWeight: 800, fontSize: 36, gap: 16, opacity: clamp01(p * 2.5)}}>
            {s.prefix} − {k} = <span style={{background: 'var(--hl)', padding: '0 10px', borderRadius: 10}}>{s.need}</span>
            <span style={{fontFamily: body, fontWeight: 700, fontSize: 30, color: hits ? undefined : 'var(--pen)'}}>{hits ? `✓ seen ×${hits}` : '✕ not seen'}</span>
          </Tile>
        )}
        <Tile x={300} y={PS.NY} w={200} h={86} radius={20} fill="var(--tint-yellow)" style={{fontFamily: display, fontWeight: 800, fontSize: 36, gap: 12}}>
          <span style={{fontFamily: mono, fontWeight: 500, fontSize: 26, color: 'var(--muted)'}}>k</span>
          {k}
        </Tile>
        <Tile x={1260} y={PS.NY - doneBounce} w={240} h={86} radius={20} fill={s.phase === 'done' ? 'var(--mint)' : 'var(--tint-yellow)'} style={{fontFamily: display, fontWeight: 800, fontSize: 36, gap: 12}}>
          <span style={{fontFamily: mono, fontWeight: 500, fontSize: 26, color: 'var(--muted)'}}>count</span>
          {s.count}
        </Tile>
      </div>
    </>
  );
};
export const prefixConfetti = {x: 1380, y: 800};
