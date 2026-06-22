import { Platform } from "./types";

/**
 * Plano de mídia — metas contratadas do programa SISTEMATIZAÊ.
 * Fonte: plano de mídia oficial fornecido pela SECOM.
 */
export interface GoalLine {
  id: string;
  platform: Platform;
  platformLabel: string;
  estrategia: string;
  /** métrica de volume contratada */
  goalMetric: "impressions" | "completes";
  goalMetricLabel: string;
  investimento: number;
  volume: number;
}

export const MEDIA_PLAN: GoalLine[] = [
  {
    id: "meta-estatico",
    platform: "meta",
    platformLabel: "Meta Ads",
    estrategia: "Alcance Estático",
    goalMetric: "impressions",
    goalMetricLabel: "Impressões",
    investimento: 28000,
    volume: 2434783,
  },
  {
    id: "meta-video",
    platform: "meta",
    platformLabel: "Meta Ads",
    estrategia: "Alcance Vídeo",
    goalMetric: "impressions",
    goalMetricLabel: "Impressões",
    investimento: 30000,
    volume: 2608696,
  },
  {
    id: "ctv-fast",
    platform: "ctv",
    platformLabel: "CTV - Smart TV",
    estrategia: "CTV - FastChannels",
    goalMetric: "completes",
    goalMetricLabel: "Visualizações",
    investimento: 38000,
    volume: 126667,
  },
  {
    id: "prog-alcance",
    platform: "programatica",
    platformLabel: "Programática",
    estrategia: "Alcance",
    goalMetric: "impressions",
    goalMetricLabel: "Impressões",
    investimento: 24000,
    volume: 2181818,
  },
];

export const TOTAL_CONTRACTED_INVEST = MEDIA_PLAN.reduce(
  (s, g) => s + g.investimento,
  0,
);

/** Período (flight) contratado da campanha de mídia: 18/06 a 03/07. */
export const CAMPAIGN_START = "2026-06-18";
export const CAMPAIGN_END = "2026-07-03";

const dayMs = 86_400_000;
const toDate = (iso: string) => new Date(iso + "T00:00:00");

/** Total de dias do flight (inclusivo). */
export function campaignTotalDays(): number {
  return Math.round((toDate(CAMPAIGN_END).getTime() - toDate(CAMPAIGN_START).getTime()) / dayMs) + 1;
}

/** Dias decorridos do flight até a data de referência (limitado ao flight). */
export function campaignElapsedDays(today: string): number {
  const t = today < CAMPAIGN_START ? CAMPAIGN_START : today > CAMPAIGN_END ? CAMPAIGN_END : today;
  return Math.round((toDate(t).getTime() - toDate(CAMPAIGN_START).getTime()) / dayMs) + 1;
}

/** Fração esperada de entrega (linear) considerando o tempo decorrido. */
export function expectedPace(today: string): number {
  return campaignElapsedDays(today) / campaignTotalDays();
}
