"use client";

import { useMemo } from "react";
import { useData } from "./DataContext";

/**
 * Aplica os filtros globais (período + estratégia) aos três datasets.
 * CTV não possui coluna de estratégia segmentável além da própria linha,
 * então respeita apenas o filtro de período + (opcional) estratégia CTV.
 */
export function useFiltered() {
  const { data, inRange, matchStrategy, strategies } = useData();

  return useMemo(() => {
    if (!data)
      return { meta: [], ctv: [], programatica: [], empty: true };

    const meta = data.meta.filter(
      (r) => inRange(r.date) && matchStrategy(r.estrategia),
    );
    const programatica = data.programatica.filter(
      (r) => inRange(r.date) && matchStrategy(r.estrategia),
    );
    // CTV: aplica período; só zera se houver filtro de estratégia que o exclua.
    const ctvAllowed =
      strategies.size === 0 || strategies.has("CTV - FastChannels");
    const ctv = ctvAllowed
      ? data.ctv.filter((r) => inRange(r.date))
      : [];

    return {
      meta,
      ctv,
      programatica,
      empty: meta.length + ctv.length + programatica.length === 0,
    };
  }, [data, inRange, matchStrategy, strategies]);
}
