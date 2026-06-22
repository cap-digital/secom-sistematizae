import { CtvRow, MetaRow, ProgRow } from "./types";

/** Métricas agregadas de performance (Meta / Programática). */
export interface PerfTotals {
  investimento: number;
  spend: number;
  impressions: number;
  clicks: number;
  reach: number;
  engagement: number;
  // vídeo (Meta)
  thruplay: number;
  p25: number;
  p50: number;
  p75: number;
  p100: number;
}

export const emptyTotals = (): PerfTotals => ({
  investimento: 0,
  spend: 0,
  impressions: 0,
  clicks: 0,
  reach: 0,
  engagement: 0,
  thruplay: 0,
  p25: 0,
  p50: 0,
  p75: 0,
  p100: 0,
});

export function sumMeta(rows: MetaRow[]): PerfTotals {
  const t = emptyTotals();
  for (const r of rows) {
    t.investimento += r.investimento;
    t.spend += r.spend;
    t.impressions += r.impressions;
    t.clicks += r.clicks;
    t.reach += r.reach;
    t.engagement += r.actions_page_engagement;
    t.thruplay += r.video_thruplay;
    t.p25 += r.video_p25;
    t.p50 += r.video_p50;
    t.p75 += r.video_p75;
    t.p100 += r.video_p100;
  }
  return t;
}

export function sumProg(rows: ProgRow[]): PerfTotals {
  const t = emptyTotals();
  for (const r of rows) {
    t.investimento += r.investimento;
    t.spend += r.spend;
    t.impressions += r.impressions;
    t.clicks += r.clicks;
  }
  return t;
}

export interface CtvTotals {
  impressions: number;
  clicks: number;
  start: number;
  firstQuartile: number;
  midpoint: number;
  thirdQuartile: number;
  completes: number;
}

export function sumCtv(rows: CtvRow[]): CtvTotals {
  return rows.reduce(
    (t, r) => ({
      impressions: t.impressions + r.impressions,
      clicks: t.clicks + r.clicks,
      start: t.start + r.start,
      firstQuartile: t.firstQuartile + r.firstQuartile,
      midpoint: t.midpoint + r.midpoint,
      thirdQuartile: t.thirdQuartile + r.thirdQuartile,
      completes: t.completes + r.completes,
    }),
    {
      impressions: 0,
      clicks: 0,
      start: 0,
      firstQuartile: 0,
      midpoint: 0,
      thirdQuartile: 0,
      completes: 0,
    },
  );
}

const safe = (a: number, b: number) => (b > 0 ? a / b : 0);

/** Custo por mil impressões. */
export const cpm = (invest: number, impressions: number) =>
  safe(invest, impressions) * 1000;

/** Custo por clique. */
export const cpc = (invest: number, clicks: number) => safe(invest, clicks);

/** Click-through rate (0..1). */
export const ctr = (clicks: number, impressions: number) =>
  safe(clicks, impressions);

/** Custo por visualização de vídeo. */
export const cpv = (invest: number, views: number) => safe(invest, views);

/** View-through rate — vídeos completos / impressões (0..1). */
export const vtr = (completes: number, impressions: number) =>
  safe(completes, impressions);

/** Custo por engajamento. */
export const cpe = (invest: number, engagement: number) =>
  safe(invest, engagement);

/** Frequência média — impressões / alcance. */
export const frequency = (impressions: number, reach: number) =>
  safe(impressions, reach);
