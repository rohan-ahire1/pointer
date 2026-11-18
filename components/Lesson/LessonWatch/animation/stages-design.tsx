import type {ReactNode} from 'react';
import {lerp, tok} from './motion';
import {Run, Tag, Tile, body, bruteK, bruteSpr, clamp01, display, mono, popStyle} from './scene';

// ───────────────────────── LRU cache ─────────────────────────

type Call = {op: 'get'; key: number} | {op: 'put'; key: number; value: number};
type Node = {key: number; value: number};

const callText = (c: Call) => (c.op === 'get' ? `get ${c.key}` : `put ${c.key}`);

const Label = ({x, y, children, align = 'center', size = 26}: {x: number; y: number; children: ReactNode; align?: 'left' | 'center' | 'right'; size?: number}) => (
  <div style={{position: 'absolute', left: x, top: y, transform: `translateX(${align === 'center' ? '-50%' : align === 'right' ? '-100%' : '0'})`, fontFamily: mono, fontWeight: 500, fontSize: size, color: 'var(--muted)', whiteSpace: 'nowrap'}}>
    {children}
  </div>
);
const Ring = ({x, y, w, h, color}: {x: number; y: number; w: number; h: number; color: string}) => (
  <div style={{position: 'absolute', left: x - 12, top: y - 12, width: w + 24, height: h + 24, borderRadius: 30, border: `6px solid ${tok(color)}`, boxShadow: `0 0 0 6px ${tok(color)}33`}} />
);

const LR = {CW: 168, CG: 14, CY: 262, CH: 70, NW: 150, NH: 120, NY: 470, HEAD: 250, TAIL: 1670, MY: 700};
const callX = (n: number, i: number) => (1920 - (n * LR.CW + (n - 1) * LR.CG)) / 2 + i * (LR.CW + LR.CG);
/** Centre of a node at `rank` (0 = oldest) when the list holds `n` nodes, spaced between the sentinels. */
const nodeX = (n: number, rank: number) => {
  const gap = 60;
  const width = n * LR.NW + (n - 1) * gap;
  return 960 - width / 2 + rank * (LR.NW + gap) + LR.NW / 2;
};

/** The calls row along the top: done calls in mint with what a get returned. */
const Calls = ({calls, call, results, done, ring}: {calls: Call[]; call: number; results: (number | null)[]; done: boolean; ring?: number}) => (
  <>
    {calls.map((c, i) => {
      const cur = i === call;
      const past = done || (call >= 0 && i < call);
      const res = past || cur ? results[i] : null;
      return (
        <div key={i} style={popStyle(1)}>
          <Tile x={callX(calls.length, i)} y={LR.CY} w={LR.CW} h={LR.CH} radius={18} fill={cur ? 'var(--yellow)' : past ? 'var(--tint-mint)' : 'var(--card)'} style={{fontFamily: mono, fontWeight: 500, fontSize: res != null ? 24 : 28, gap: res != null ? 4 : 10}}>
            {callText(c)}
            {res != null && <span style={{color: 'var(--pen)', fontWeight: 700}}>→{res}</span>}
          </Tile>
        </div>
      );
    })}
    {ring != null && ring >= 0 && <Ring x={callX(calls.length, ring)} y={LR.CY} w={LR.CW} h={LR.CH} color="--orange" />}
  </>
);

type Read = {call: number; order: Node[]; idx: number; found: boolean};
/** Brute force: keep the keys in a plain list, oldest first, and scan it from the front on every call. */
export const lruScans = (capacity: number, calls: Call[]): Read[] => {
  const reads: Read[] = [];
  let order: Node[] = [];
  calls.forEach((c, call) => {
    const at = order.findIndex((n) => n.key === c.key);
    const upTo = at < 0 ? order.length : at + 1;
    for (let idx = 0; idx < upTo; idx++) reads.push({call, order: [...order], idx, found: idx === at});
    if (c.op === 'get') {
      if (at >= 0) order = [...order.filter((_, i) => i !== at), order[at]];
    } else {
      order = [...order.filter((n) => n.key !== c.key), {key: c.key, value: c.value}];
      if (order.length > capacity) order = order.slice(1);
    }
  });
  return reads;
};

export const LruBrute = ({r}: {r: Run}) => {
  const {capacity, calls} = r.steps[0].state as {capacity: number; calls: Call[]};
  const reads = lruScans(capacity, calls);
  const q = bruteK(r.t, reads.length);
  if (q < 0) return null;
  const cur = reads[q];
  const n = cur.order.length;
  const pop = bruteSpr(r.t, q, reads.length, 'bouncy');
  const c = calls[cur.call];
  return (
    <>
      <Ring x={callX(calls.length, cur.call)} y={LR.CY} w={LR.CW} h={LR.CH} color="--orange" />
      {cur.order.map((node, i) => {
        const scanned = i < cur.idx;
        return (
          <Tile key={node.key} x={nodeX(n, i) - LR.NW / 2} y={LR.NY} w={LR.NW} h={LR.NH} fill={i === cur.idx ? (cur.found ? 'var(--mint)' : 'var(--peach)') : scanned ? 'var(--paper)' : 'var(--card)'} style={{fontSize: 56, borderStyle: scanned ? 'dashed' : 'solid', borderColor: scanned ? 'var(--past-line)' : 'var(--line)'}}>
            {node.key}
          </Tile>
        );
      })}
      <Ring x={nodeX(n, cur.idx) - LR.NW / 2} y={LR.NY} w={LR.NW} h={LR.NH} color={cur.found ? '--mint' : '--orange'} />
      <Tag x={nodeX(n, cur.idx)} y={LR.NY - 92} label="scan" />
      <Label x={nodeX(n, 0)} y={LR.NY + LR.NH + 20}>oldest</Label>
      <div style={{position: 'absolute', left: 0, right: 0, top: LR.MY, display: 'flex', justifyContent: 'center'}}>
        <Tile x={0} y={0} w={640} h={100} fill={cur.found ? 'var(--mint)' : 'var(--card)'} style={{position: 'relative', fontFamily: body, fontWeight: 700, fontSize: 36, gap: 18, transform: `scale(${0.9 + 0.1 * Math.min(1.2, pop)})`}}>
          <span style={{fontFamily: mono, fontWeight: 500}}>{callText(c)}</span>
          {cur.found ? `found ${c.key}` : `${cur.order[cur.idx].key} ≠ ${c.key}, keep scanning`}
        </Tile>
      </div>
    </>
  );
};

export const LruStage = ({r}: {r: Run}) => {
  const {s, o, p} = r;
  const calls: Call[] = s.calls;
  const now: Node[] = s.list;
  const before: Node[] = o.list;
  const live = r.live;
  const cur = s.key as number | null;
  // every node on screen in this blend: staying, arriving or leaving
  const keys = [...new Set([...before.map((n) => n.key), ...now.map((n) => n.key)])];
  const hit = s.phase === 'hit' || s.phase === 'update' || s.phase === 'insert';
  const mapKeys = [...new Set([...now.map((n) => n.key)])].sort((a, b) => a - b);
  const mapX = (i: number) => 960 - (mapKeys.length * 150 + (mapKeys.length - 1) * 24) / 2 + i * 174;
  const curRank = now.findIndex((n) => n.key === cur);
  const linkOn = hit && curRank >= 0 ? clamp01(p * 1.5) : 0;
  return (
    <>
      <Calls calls={calls} call={s.call} results={s.results} done={s.phase === 'done'} />
      <div style={{opacity: live}}>
        {/* the rail: a doubly linked list from head to tail */}
        <div style={{position: 'absolute', left: LR.HEAD, width: LR.TAIL - LR.HEAD, top: LR.NY + LR.NH / 2 - 14, height: 28, borderTop: '4px solid var(--line)', borderBottom: '4px solid var(--line)'}} />
        <Tile x={LR.HEAD - 130} y={LR.NY + 10} w={130} h={LR.NH - 20} fill="var(--paper)" radius={18} style={{fontFamily: mono, fontWeight: 500, fontSize: 30, borderStyle: 'dashed'}}>
          head
        </Tile>
        <Tile x={LR.TAIL} y={LR.NY + 10} w={130} h={LR.NH - 20} fill="var(--paper)" radius={18} style={{fontFamily: mono, fontWeight: 500, fontSize: 30, borderStyle: 'dashed'}}>
          tail
        </Tile>
        <Label x={LR.HEAD - 65} y={LR.NY + LR.NH + 14}>oldest</Label>
        <Label x={LR.TAIL + 65} y={LR.NY + LR.NH + 14}>newest</Label>
        {keys.map((key) => {
          const ro = before.findIndex((n) => n.key === key);
          const rn = now.findIndex((n) => n.key === key);
          const node = rn >= 0 ? now[rn] : before[ro];
          let x: number, y = LR.NY, op = 1;
          if (ro < 0) {
            // arriving at the newest end
            const e = r.born(r.k, 'bouncy');
            x = nodeX(now.length, rn);
            y = lerp(LR.NY - 160, LR.NY, Math.min(1, e));
            op = clamp01(p * 2.5);
          } else if (rn < 0) {
            // evicted: drops out from the oldest end
            x = nodeX(before.length, ro);
            y = lerp(LR.NY, LR.NY + 230, p);
            op = 1 - clamp01(p * 1.2);
          } else {
            const moved = ro !== rn || before.length !== now.length;
            x = r.mix(nodeX(before.length, ro), nodeX(now.length, rn));
            y = LR.NY - (moved && key === cur ? Math.sin(Math.PI * Math.min(1, p)) * 120 : 0);
          }
          const isCur = key === cur && s.phase !== 'miss' && rn >= 0;
          const evicted = rn < 0 && key === s.evicted;
          return (
            <Tile key={key} x={x - LR.NW / 2} y={y} w={LR.NW} h={LR.NH} fill={evicted ? 'var(--peach)' : isCur ? 'var(--yellow)' : 'var(--card)'} style={{opacity: op, flexDirection: 'column', gap: 0, fontSize: 56}}>
              {key}
              <span style={{fontFamily: mono, fontWeight: 500, fontSize: 22, color: 'var(--muted)'}}>{evicted ? 'evicted' : `= ${node.value}`}</span>
            </Tile>
          );
        })}
        {/* the map: one chip per key, pointing at its node */}
        <Label x={680} y={LR.MY + 22} align="right" size={28}>map</Label>
        {mapKeys.map((key, i) => {
          const isCur = key === cur && hit;
          return (
            <Tile key={key} x={mapX(i)} y={LR.MY} w={150} h={76} radius={18} fill={isCur ? 'var(--yellow)' : 'var(--tint-lilac)'} style={{fontFamily: mono, fontWeight: 500, fontSize: 30, opacity: clamp01(key === cur && s.phase === 'insert' ? p * 2 : 1)}}>
              {key} → ●
            </Tile>
          );
        })}
        {linkOn > 0 && (
          <svg width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0, pointerEvents: 'none'}}>
            <line
              x1={mapX(mapKeys.indexOf(cur as number)) + 75} y1={LR.MY}
              x2={lerp(mapX(mapKeys.indexOf(cur as number)) + 75, nodeX(now.length, curRank), linkOn)} y2={lerp(LR.MY, LR.NY + LR.NH + 8, linkOn)}
              stroke={tok('--pen')} strokeWidth={6} strokeDasharray="14 10" strokeLinecap="round"
            />
          </svg>
        )}
        {s.phase === 'miss' && (
          <Tile x={1420} y={LR.MY} w={300} h={76} radius={18} fill="var(--peach)" style={{fontFamily: mono, fontWeight: 500, fontSize: 30, opacity: clamp01(p * 2)}}>
            no {cur} → -1
          </Tile>
        )}
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 360, textAlign: 'center', fontFamily: display, fontWeight: 800, fontSize: 30, color: 'var(--muted)', opacity: live}}>
        capacity {s.capacity}
      </div>
    </>
  );
};
export const lruConfetti = {x: 960, y: 520};
