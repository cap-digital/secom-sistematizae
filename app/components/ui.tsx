"use client";

import { ReactNode, useState } from "react";
import { IconChevron } from "./icons";

/** Dropdown de seleção de métrica (select nativo estilizado). */
export function Select({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="relative inline-flex items-center">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="cursor-pointer appearance-none rounded-xl border border-line bg-paper py-1.5 pl-3 pr-8 text-xs font-semibold text-ink shadow-sm transition hover:border-terracotta/40 focus:outline-none focus:ring-2 focus:ring-terracotta/30"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <IconChevron className="pointer-events-none absolute right-2 h-4 w-4 text-ink-soft" />
    </div>
  );
}

/** Imagem externa (fbcdn / googlesyndication) com fallback caso a URL expire. */
export function SafeImg({
  src,
  alt,
  className = "",
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return (
      <div className="grid h-full w-full place-items-center text-[10px] text-ink-soft">
        sem prévia
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      loading="lazy"
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={className}
    />
  );
}

export function Card({
  children,
  className = "",
  pad = true,
}: {
  children: ReactNode;
  className?: string;
  pad?: boolean;
}) {
  return (
    <div className={`card min-w-0 ${pad ? "card-pad" : ""} ${className}`}>
      {children}
    </div>
  );
}

export function SectionTitle({
  title,
  hint,
  right,
}: {
  title: string;
  hint?: string;
  right?: ReactNode;
}) {
  return (
    <div className="mb-4 flex items-start justify-between gap-3">
      <div>
        <h3 className="text-[15px] font-bold text-ink leading-tight">{title}</h3>
        {hint && <p className="text-xs text-ink-soft mt-0.5">{hint}</p>}
      </div>
      {right}
    </div>
  );
}

export function Kpi({
  label,
  value,
  sub,
  accent = "var(--terracotta)",
  icon,
}: {
  label: string;
  value: string;
  sub?: string;
  accent?: string;
  icon?: ReactNode;
}) {
  return (
    <div className="card card-pad relative min-w-0 overflow-hidden animate-fade-up">
      <div
        className="absolute left-0 top-0 h-full w-1.5"
        style={{ background: accent }}
      />
      <div className="flex items-start justify-between gap-2">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-ink-soft">
          {label}
        </div>
        {icon && <div style={{ color: accent }}>{icon}</div>}
      </div>
      <div className="mt-2 text-[22px] sm:text-[26px] font-black leading-none text-ink font-mono truncate">
        {value}
      </div>
      {sub && <div className="mt-1.5 text-xs text-ink-soft">{sub}</div>}
    </div>
  );
}

export function Pill({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "good" | "warn" | "bad";
}) {
  const tones: Record<string, string> = {
    neutral: "bg-cream-deep text-ink-soft",
    good: "bg-forest-soft/30 text-forest",
    warn: "bg-ochre-soft/40 text-[#8a6310]",
    bad: "bg-terracotta-soft/30 text-terracotta-deep",
  };
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

export function Loading() {
  return (
    <div className="grid place-items-center py-32">
      <div className="flex flex-col items-center gap-3">
        <div className="h-10 w-10 rounded-full border-[3px] border-line border-t-terracotta animate-spin" />
        <p className="text-sm text-ink-soft">Carregando dados da campanha…</p>
      </div>
    </div>
  );
}

export function LoadError({
  msg,
  onRetry,
}: {
  msg: string;
  onRetry: () => void;
}) {
  return (
    <div className="grid place-items-center py-28 px-6">
      <div className="card card-pad max-w-md text-center">
        <div className="mx-auto mb-3 grid h-11 w-11 place-items-center rounded-2xl bg-terracotta/10 text-terracotta text-xl font-black">
          !
        </div>
        <h3 className="text-base font-bold text-ink">Não foi possível carregar os dados</h3>
        <p className="mt-1.5 text-sm text-ink-soft">{msg}</p>
        <button
          onClick={onRetry}
          className="mt-4 rounded-2xl bg-terracotta px-5 py-2.5 text-sm font-semibold text-cream transition hover:bg-terracotta-deep"
        >
          Tentar novamente
        </button>
      </div>
    </div>
  );
}

export function EmptyState({ msg }: { msg: string }) {
  return (
    <div className="grid place-items-center py-20 text-center">
      <p className="text-sm text-ink-soft max-w-sm">{msg}</p>
    </div>
  );
}
