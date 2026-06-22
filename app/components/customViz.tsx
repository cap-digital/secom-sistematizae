"use client";

import { compact, int, pct } from "../lib/format";
import { C } from "../lib/theme";

/* ----------------------------- Funnel ----------------------------- */

export interface FunnelStage {
  label: string;
  value: number;
  color: string;
}

export function Funnel({
  stages,
  unit = "",
}: {
  stages: FunnelStage[];
  unit?: string;
}) {
  const top = stages[0]?.value || 1;
  return (
    <div className="flex flex-col gap-2">
      {stages.map((s, i) => {
        const ofTop = s.value / top;
        const prev = i === 0 ? s.value : stages[i - 1].value;
        const step = prev > 0 ? s.value / prev : 0;
        const width = Math.max(ofTop * 100, 8);
        return (
          <div key={s.label} className="group">
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="font-semibold text-ink">{s.label}</span>
              <span className="flex items-center gap-2 font-mono">
                <span className="font-semibold text-ink">
                  {compact(s.value)}
                  {unit}
                </span>
                <span className="rounded-full bg-cream-deep px-1.5 py-0.5 text-[10px] text-ink-soft">
                  {pct(ofTop, 1)}
                </span>
                {i > 0 && (
                  <span className="w-[52px] text-right text-[10px] font-semibold text-terracotta-deep">
                    {step < 1 ? `▼ ${pct(1 - step, 1)}` : "—"}
                  </span>
                )}
              </span>
            </div>
            <div className="relative h-9 w-full">
              <div
                className="absolute left-1/2 h-full -translate-x-1/2 rounded-lg transition-all duration-500"
                style={{
                  width: `${width}%`,
                  background: s.color,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ----------------------------- Heatmap ----------------------------- */

export function Heatmap({
  rows,
  cols,
  matrix,
  color = C.terracotta,
  fmt = int,
}: {
  rows: string[];
  cols: { key: string; label: string }[];
  matrix: Record<string, Record<string, number>>;
  color?: string;
  fmt?: (v: number) => string;
}) {
  let max = 0;
  for (const r of rows)
    for (const c of cols) max = Math.max(max, matrix[r]?.[c.key] ?? 0);

  return (
    <div className="overflow-x-auto">
      <div
        className="grid gap-1.5 min-w-[360px]"
        style={{ gridTemplateColumns: `90px repeat(${cols.length}, 1fr)` }}
      >
        <div />
        {cols.map((c) => (
          <div
            key={c.key}
            className="pb-1 text-center text-[11px] font-semibold uppercase tracking-wide text-ink-soft"
          >
            {c.label}
          </div>
        ))}
        {rows.map((r) => (
          <Row key={r} label={r} cols={cols} matrix={matrix} max={max} color={color} fmt={fmt} />
        ))}
      </div>
    </div>
  );
}

function Row({
  label,
  cols,
  matrix,
  max,
  color,
  fmt,
}: {
  label: string;
  cols: { key: string; label: string }[];
  matrix: Record<string, Record<string, number>>;
  max: number;
  color: string;
  fmt: (v: number) => string;
}) {
  return (
    <>
      <div className="flex items-center text-xs font-medium text-ink">{label}</div>
      {cols.map((c) => {
        const v = matrix[label]?.[c.key] ?? 0;
        const t = max > 0 ? v / max : 0;
        const dark = t > 0.55;
        return (
          <div
            key={c.key}
            className="group relative grid h-12 place-items-center rounded-lg text-[11px] font-mono font-semibold transition"
            style={{
              background:
                t === 0 ? "var(--cream-deep)" : hexAlpha(color, 0.12 + t * 0.85),
              color: dark ? "#fff" : "var(--ink-soft)",
            }}
          >
            {v > 0 ? fmt(v) : "—"}
          </div>
        );
      })}
    </>
  );
}

function hexAlpha(hex: string, a: number) {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${a.toFixed(3)})`;
}

/* ----------------------------- Radial Gauge ----------------------------- */

export function Gauge({
  value,
  label,
  sub,
  color = C.terracotta,
  size = 160,
}: {
  value: number; // 0..1
  label: string;
  sub?: string;
  color?: string;
  size?: number;
}) {
  const stroke = 14;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(value, 1));
  const dash = circ * 0.75; // 270° arc, abertura embaixo
  const offset = dash * (1 - clamped);

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-[135deg]">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="var(--cream-deep)"
            strokeWidth={stroke}
            strokeDasharray={`${dash} ${circ}`}
            strokeLinecap="round"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeDasharray={`${dash} ${circ}`}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 0.8s ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-[28px] font-black font-mono text-ink leading-none">
            {pct(clamped, clamped >= 1 ? 0 : 1)}
          </div>
          {sub && <div className="mt-1.5 text-[11px] text-ink-soft">{sub}</div>}
        </div>
      </div>
      {label && (
        <div className="mt-2 max-w-[220px] text-center text-xs font-semibold text-ink-soft">
          {label}
        </div>
      )}
    </div>
  );
}

/* ----------------------------- Goal Progress ----------------------------- */

export function GoalBar({
  label,
  sublabel,
  current,
  target,
  color,
  fmt = compact,
  cap = false,
}: {
  label: string;
  sublabel?: string;
  current: number;
  target: number;
  color: string;
  fmt?: (v: number) => string;
  /** Limita barra e percentual a 100% (ex.: investimento não deve passar de 100%). */
  cap?: boolean;
}) {
  const rawRatio = target > 0 ? current / target : 0;
  const ratio = cap ? Math.min(rawRatio, 1) : rawRatio;
  const width = Math.min(ratio, 1) * 100;
  const shownCurrent = cap ? Math.min(current, target) : current;
  return (
    <div>
      <div className="mb-1.5 flex items-end justify-between gap-2">
        <div className="min-w-0">
          <div className="truncate text-[13px] font-semibold text-ink">{label}</div>
          {sublabel && <div className="text-[11px] text-ink-soft">{sublabel}</div>}
        </div>
        <div className="shrink-0 text-right">
          <div className="font-mono text-sm font-bold text-ink">{pct(ratio, 1)}</div>
          <div className="font-mono text-[11px] text-ink-soft">
            {fmt(shownCurrent)} / {fmt(target)}
          </div>
        </div>
      </div>
      <div className="relative h-3 w-full overflow-hidden rounded-full bg-cream-deep">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${width}%`, background: color }}
        />
      </div>
    </div>
  );
}
