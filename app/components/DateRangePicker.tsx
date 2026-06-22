"use client";

import { useEffect, useRef, useState } from "react";
import { useData } from "../lib/DataContext";
import { fullDate } from "../lib/format";
import { IconCalendar, IconChevron } from "./icons";

function addDays(iso: string, days: number): string {
  const d = new Date(iso + "T00:00:00");
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export function DateRangePicker() {
  const { bounds, range, setRange } = useData();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  if (!bounds.from) return null;

  // "hoje" limitado ao flight — base das janelas relativas (mantém dados visíveis)
  const today = new Date().toISOString().slice(0, 10);
  const refDay =
    today > bounds.to ? bounds.to : today < bounds.from ? bounds.from : today;
  const clampFrom = (iso: string) => (iso < bounds.from ? bounds.from : iso);

  const presets = [
    { label: "Todo o período", from: bounds.from, to: bounds.to },
    { label: "Últimos 7 dias", from: clampFrom(addDays(refDay, -6)), to: refDay },
    { label: "Últimos 3 dias", from: clampFrom(addDays(refDay, -2)), to: refDay },
  ];

  const isFull = range.from === bounds.from && range.to === bounds.to;
  const label = isFull
    ? "Todo o período"
    : `${fullDate(range.from)} – ${fullDate(range.to)}`;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2.5 rounded-2xl border border-line bg-paper px-3.5 py-2.5 text-sm font-medium text-ink shadow-sm hover:border-terracotta/40 transition"
      >
        <IconCalendar className="h-[18px] w-[18px] text-terracotta" />
        <span className="hidden sm:inline">{label}</span>
        <span className="sm:hidden">Período</span>
        <IconChevron
          className={`h-4 w-4 text-ink-soft transition ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute right-0 z-40 mt-2 w-[300px] rounded-3xl border border-line bg-paper p-4 shadow-[0_24px_60px_-24px_rgba(42,32,23,0.5)]">
          <div className="mb-3 flex flex-wrap gap-1.5">
            {presets.map((p) => {
              const active = range.from === p.from && range.to === p.to;
              return (
                <button
                  key={p.label}
                  onClick={() => {
                    setRange({ from: p.from, to: p.to });
                    setOpen(false);
                  }}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                    active
                      ? "bg-forest text-cream"
                      : "bg-cream-deep text-ink-soft hover:bg-cream"
                  }`}
                >
                  {p.label}
                </button>
              );
            })}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <label className="text-[11px] uppercase tracking-wide text-ink-soft">
              De
              <input
                type="date"
                min={bounds.from}
                max={range.to || bounds.to}
                value={range.from}
                onChange={(e) =>
                  setRange({ ...range, from: e.target.value || bounds.from })
                }
                className="mt-1 w-full rounded-xl border border-line bg-cream px-2.5 py-2 text-sm text-ink"
              />
            </label>
            <label className="text-[11px] uppercase tracking-wide text-ink-soft">
              Até
              <input
                type="date"
                min={range.from || bounds.from}
                max={bounds.to}
                value={range.to}
                onChange={(e) =>
                  setRange({ ...range, to: e.target.value || bounds.to })
                }
                className="mt-1 w-full rounded-xl border border-line bg-cream px-2.5 py-2 text-sm text-ink"
              />
            </label>
          </div>
        </div>
      )}
    </div>
  );
}
