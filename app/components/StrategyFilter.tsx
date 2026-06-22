"use client";

import { useData } from "../lib/DataContext";
import { IconFilter } from "./icons";

export function StrategyFilter({
  options,
}: {
  options: { value: string; label: string; color: string }[];
}) {
  const { strategies, toggleStrategy, clearStrategies } = useData();
  if (options.length <= 1) return null;

  const allActive = strategies.size === 0;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="flex items-center gap-1.5 text-xs font-semibold text-ink-soft">
        <IconFilter className="h-4 w-4 text-terracotta" />
        Estratégia
      </span>
      <button
        onClick={clearStrategies}
        className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
          allActive
            ? "bg-forest text-cream"
            : "border border-line bg-paper text-ink-soft hover:bg-cream-deep"
        }`}
      >
        Todas
      </button>
      {options.map((o) => {
        const active = strategies.has(o.value);
        return (
          <button
            key={o.value}
            onClick={() => toggleStrategy(o.value)}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
              active
                ? "text-cream"
                : "border border-line bg-paper text-ink-soft hover:bg-cream-deep"
            }`}
            style={active ? { background: o.color } : undefined}
          >
            <span
              className="h-2 w-2 rounded-full"
              style={{ background: active ? "rgba(255,255,255,0.9)" : o.color }}
            />
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
