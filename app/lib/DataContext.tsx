"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from "react";
import { Dataset } from "./types";
import { CAMPAIGN_END, CAMPAIGN_START } from "./mediaPlan";

interface DateRange {
  from: string; // YYYY-MM-DD
  to: string;
}

interface DataState {
  data: Dataset | null;
  loading: boolean;
  error: string | null;
  bounds: DateRange; // full available range
  range: DateRange; // active filter
  setRange: (r: DateRange) => void;
  strategies: Set<string>; // empty = all
  toggleStrategy: (s: string) => void;
  clearStrategies: () => void;
  setStrategies: (s: Set<string>) => void;
  inRange: (iso: string) => boolean;
  matchStrategy: (s: string) => boolean;
  reload: () => void;
}

const Ctx = createContext<DataState | null>(null);

/** Bounds selecionáveis = flight contratado da campanha (18/06–03/07). */
const BOUNDS: DateRange = { from: CAMPAIGN_START, to: CAMPAIGN_END };

async function fetchWithRetry(retries = 1): Promise<Dataset> {
  let lastErr: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 45_000);
    try {
      const r = await fetch("/api/data", { signal: ctrl.signal });
      clearTimeout(timer);
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return (await r.json()) as Dataset;
    } catch (e) {
      clearTimeout(timer);
      lastErr = e;
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error("Falha de rede");
}

export function DataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<Dataset | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [range, setRange] = useState<DateRange>(BOUNDS);
  const [strategies, setStrategiesState] = useState<Set<string>>(new Set());
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    fetchWithRetry(1)
      .then((d) => {
        if (!active) return;
        setData(d);
        setError(null);
      })
      .catch((e) => {
        if (active) setError(e.message ?? "Falha ao carregar");
      })
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [nonce]);

  const bounds = BOUNDS;

  const value: DataState = useMemo(() => {
    const inRange = (iso: string) =>
      (!range.from || iso >= range.from) && (!range.to || iso <= range.to);
    const matchStrategy = (s: string) =>
      strategies.size === 0 || strategies.has(s);
    return {
      data,
      loading,
      error,
      bounds,
      range,
      setRange,
      strategies,
      toggleStrategy: (s) =>
        setStrategiesState((prev) => {
          const next = new Set(prev);
          if (next.has(s)) next.delete(s);
          else next.add(s);
          return next;
        }),
      clearStrategies: () => setStrategiesState(new Set()),
      setStrategies: (s) => setStrategiesState(s),
      inRange,
      matchStrategy,
      reload: () => setNonce((n) => n + 1),
    };
  }, [data, loading, error, bounds, range, strategies]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useData() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useData must be used within DataProvider");
  return ctx;
}
