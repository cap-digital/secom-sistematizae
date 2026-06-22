"use client";

import { usePathname } from "next/navigation";
import { useData } from "../lib/DataContext";
import { DateRangePicker } from "./DateRangePicker";
import { IconRefresh } from "./icons";

const TITLES: Record<string, { title: string; sub: string }> = {
  "/": {
    title: "Visão Geral",
    sub: "Performance consolidada das 3 plataformas de mídia",
  },
  "/meta": {
    title: "Meta Ads",
    sub: "Alcance Estático e Vídeo · Facebook & Instagram",
  },
  "/ctv": { title: "CTV · Smart TV", sub: "FastChannels · vídeo em telas conectadas" },
  "/programatica": {
    title: "Programática",
    sub: "Google DV360 · display de alcance",
  },
  "/criativos": {
    title: "Criativos",
    sub: "Desempenho por peça em todas as plataformas",
  },
};

export function Topbar() {
  const path = usePathname();
  const { loading, error, reload, data } = useData();
  const meta = TITLES[path] ?? TITLES["/"];

  const updated = data?.timestamp
    ? new Date(data.timestamp).toLocaleString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  return (
    <header className="sticky top-0 z-20 px-4 md:px-8 pt-4 pb-3 bg-cream/80 backdrop-blur-md">
      <div className="max-w-[1500px] mx-auto flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="pl-14 md:pl-0">
          <h1 className="text-2xl md:text-[28px] font-black tracking-tight text-ink leading-none">
            {meta.title}
          </h1>
          <p className="text-[13px] text-ink-soft mt-1.5">{meta.sub}</p>
        </div>
        <div className="flex items-center gap-2.5">
          {updated && (
            <span className="hidden lg:inline text-[11px] text-ink-soft">
              Atualizado {updated}
            </span>
          )}
          <DateRangePicker />
          <button
            onClick={reload}
            className="grid h-[42px] w-[42px] place-items-center rounded-2xl border border-line bg-paper text-terracotta shadow-sm hover:border-terracotta/40 transition"
            aria-label="Recarregar dados"
          >
            <IconRefresh className={`h-[18px] w-[18px] ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>
      {error && (
        <div className="max-w-[1500px] mx-auto mt-2 rounded-xl bg-terracotta/10 px-3 py-2 text-xs text-terracotta-deep">
          Falha ao carregar dados: {error}
        </div>
      )}
    </header>
  );
}
