"use client";

import {
  Area,
  Bar,
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts";
import { ReactNode } from "react";
import { C } from "../lib/theme";
import { compact } from "../lib/format";

interface TipItem {
  name: string;
  value: number;
  color: string;
  fmt?: (v: number) => string;
}

function TooltipBox({
  label,
  items,
}: {
  label?: string;
  items: TipItem[];
}) {
  return (
    <div className="rounded-2xl border border-line bg-paper/95 px-3.5 py-2.5 shadow-xl backdrop-blur">
      {label && (
        <div className="mb-1.5 text-[11px] font-bold uppercase tracking-wide text-ink-soft">
          {label}
        </div>
      )}
      <div className="flex flex-col gap-1">
        {items.map((it, i) => (
          <div key={i} className="flex items-center gap-2 text-xs">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ background: it.color }}
            />
            <span className="text-ink-soft">{it.name}</span>
            <span className="ml-auto font-mono font-semibold text-ink">
              {it.fmt ? it.fmt(it.value) : compact(it.value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export type SeriesDef = {
  key: string;
  name: string;
  color: string;
  type: "bar" | "line" | "area";
  axis?: "left" | "right";
  fmt?: (v: number) => string;
  dashed?: boolean;
};

export function TrendChart({
  data,
  series,
  xKey,
  height = 300,
  rightLabel,
}: {
  data: Record<string, number | string>[];
  series: SeriesDef[];
  xKey: string;
  height?: number;
  rightLabel?: string;
}) {
  const hasRight = series.some((s) => s.axis === "right");
  return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart data={data} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
        <defs>
          {series
            .filter((s) => s.type === "area")
            .map((s) => (
              <linearGradient
                key={s.key}
                id={`grad-${s.key}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="0%" stopColor={s.color} stopOpacity={0.35} />
                <stop offset="100%" stopColor={s.color} stopOpacity={0.02} />
              </linearGradient>
            ))}
        </defs>
        <CartesianGrid stroke={C.line} strokeDasharray="3 5" vertical={false} />
        <XAxis
          dataKey={xKey}
          tickLine={false}
          axisLine={false}
          dy={6}
          tick={{ fontSize: 11, fill: C.inkSoft }}
        />
        <YAxis
          yAxisId="left"
          tickLine={false}
          axisLine={false}
          width={48}
          tick={{ fontSize: 11, fill: C.inkSoft }}
          tickFormatter={(v) => compact(Number(v))}
        />
        {hasRight && (
          <YAxis
            yAxisId="right"
            orientation="right"
            tickLine={false}
            axisLine={false}
            width={48}
            tick={{ fontSize: 11, fill: C.inkSoft }}
            tickFormatter={(v) => compact(Number(v))}
            label={
              rightLabel
                ? {
                    value: rightLabel,
                    angle: 90,
                    position: "insideRight",
                    fontSize: 10,
                    fill: C.inkSoft,
                  }
                : undefined
            }
          />
        )}
        <Tooltip
          cursor={{ fill: "rgba(42,32,23,0.04)" }}
          content={({ active, payload, label }) =>
            active && payload?.length ? (
              <TooltipBox
                label={String(label)}
                items={payload.map((p) => {
                  const def = series.find((s) => s.key === p.dataKey);
                  return {
                    name: def?.name ?? String(p.name),
                    value: Number(p.value),
                    color: def?.color ?? C.terracotta,
                    fmt: def?.fmt,
                  };
                })}
              />
            ) : null
          }
        />
        {series.map((s) => {
          const axisId = s.axis ?? "left";
          if (s.type === "bar")
            return (
              <Bar
                key={s.key}
                yAxisId={axisId}
                dataKey={s.key}
                fill={s.color}
                radius={[6, 6, 0, 0]}
                maxBarSize={46}
              />
            );
          if (s.type === "area")
            return (
              <Area
                key={s.key}
                yAxisId={axisId}
                type="monotone"
                dataKey={s.key}
                stroke={s.color}
                strokeWidth={2.5}
                fill={`url(#grad-${s.key})`}
                dot={false}
              />
            );
          return (
            <Line
              key={s.key}
              yAxisId={axisId}
              type="monotone"
              dataKey={s.key}
              stroke={s.color}
              strokeWidth={2.5}
              strokeDasharray={s.dashed ? "6 5" : undefined}
              dot={{ r: 3, fill: s.color, strokeWidth: 0 }}
              activeDot={{ r: 5 }}
            />
          );
        })}
      </ComposedChart>
    </ResponsiveContainer>
  );
}

export function ChartLegend({ series }: { series: { name: string; color: string }[] }) {
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1.5">
      {series.map((s) => (
        <span key={s.name} className="flex items-center gap-1.5 text-xs text-ink-soft">
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: s.color }} />
          {s.name}
        </span>
      ))}
    </div>
  );
}

export function DonutChart({
  data,
  height = 240,
  centerLabel,
  centerValue,
  fmt,
}: {
  data: { name: string; value: number; color: string }[];
  height?: number;
  centerLabel?: string;
  centerValue?: string;
  fmt?: (v: number) => string;
}) {
  const total = data.reduce((s, d) => s + d.value, 0);
  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius="62%"
            outerRadius="92%"
            paddingAngle={2}
            stroke="none"
          >
            {data.map((d, i) => (
              <Cell key={i} fill={d.color} />
            ))}
          </Pie>
          <Tooltip
            content={({ active, payload }) =>
              active && payload?.length ? (
                <TooltipBox
                  items={payload.map((p) => ({
                    name: String(p.name),
                    value: Number(p.value),
                    color: (p.payload as { color: string }).color,
                    fmt: (v) =>
                      `${fmt ? fmt(v) : compact(v)} · ${total ? Math.round((v / total) * 100) : 0}%`,
                  }))}
                />
              ) : null
            }
          />
        </PieChart>
      </ResponsiveContainer>
      {(centerValue || centerLabel) && (
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          {centerValue && (
            <div className="text-xl font-black font-mono text-ink">{centerValue}</div>
          )}
          {centerLabel && (
            <div className="text-[10px] uppercase tracking-wide text-ink-soft mt-0.5">
              {centerLabel}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function HBars({
  data,
  height = 240,
  fmt = compact,
}: {
  data: { name: string; value: number; color: string }[];
  height?: number;
  fmt?: (v: number) => string;
}) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="flex flex-col gap-3" style={{ minHeight: height ? undefined : 0 }}>
      {data.map((d) => (
        <div key={d.name}>
          <div className="mb-1 flex items-center justify-between text-xs">
            <span className="font-medium text-ink">{d.name}</span>
            <span className="font-mono font-semibold text-ink-soft">{fmt(d.value)}</span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-cream-deep">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${(d.value / max) * 100}%`, background: d.color }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ChartFrame({ children }: { children: ReactNode }) {
  return <div className="w-full">{children}</div>;
}

export interface BubblePoint {
  name: string;
  x: number;
  y: number;
  z: number;
  color: string;
}

export function BubbleChart({
  points,
  xLabel,
  yLabel,
  height = 320,
  xFmt = compact,
  yFmt = (v: number) => `${v.toFixed(2)}%`,
  zFmt = compact,
}: {
  points: BubblePoint[];
  xLabel: string;
  yLabel: string;
  height?: number;
  xFmt?: (v: number) => string;
  yFmt?: (v: number) => string;
  zFmt?: (v: number) => string;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <ScatterChart margin={{ top: 12, right: 18, left: 0, bottom: 18 }}>
        <CartesianGrid stroke={C.line} strokeDasharray="3 5" />
        <XAxis
          type="number"
          dataKey="x"
          name={xLabel}
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 11, fill: C.inkSoft }}
          tickFormatter={(v) => xFmt(Number(v))}
          label={{ value: xLabel, position: "insideBottom", offset: -8, fontSize: 11, fill: C.inkSoft }}
        />
        <YAxis
          type="number"
          dataKey="y"
          name={yLabel}
          tickLine={false}
          axisLine={false}
          width={52}
          tick={{ fontSize: 11, fill: C.inkSoft }}
          tickFormatter={(v) => yFmt(Number(v))}
          label={{ value: yLabel, angle: -90, position: "insideLeft", fontSize: 11, fill: C.inkSoft }}
        />
        <ZAxis type="number" dataKey="z" range={[120, 1400]} />
        <Tooltip
          cursor={{ strokeDasharray: "3 3" }}
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null;
            const p = payload[0].payload as BubblePoint;
            return (
              <div className="rounded-2xl border border-line bg-paper/95 px-3.5 py-2.5 shadow-xl backdrop-blur">
                <div className="mb-1 text-xs font-bold text-ink">{p.name}</div>
                <div className="flex flex-col gap-0.5 text-[11px] text-ink-soft">
                  <span>{xLabel}: <b className="font-mono text-ink">{xFmt(p.x)}</b></span>
                  <span>{yLabel}: <b className="font-mono text-ink">{yFmt(p.y)}</b></span>
                  <span>Investimento: <b className="font-mono text-ink">{zFmt(p.z)}</b></span>
                </div>
              </div>
            );
          }}
        />
        <Scatter data={points} fillOpacity={0.78}>
          {points.map((p, i) => (
            <Cell key={i} fill={p.color} />
          ))}
        </Scatter>
      </ScatterChart>
    </ResponsiveContainer>
  );
}
