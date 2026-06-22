import { CtvRow, Dataset, MetaRow, ProgRow, RawResponse } from "./types";

const num = (v: unknown): number => {
  if (v === null || v === undefined || v === "") return 0;
  const n = typeof v === "number" ? v : parseFloat(String(v));
  return Number.isFinite(n) ? n : 0;
};

const str = (v: unknown): string => (v === null || v === undefined ? "" : String(v));

/** ISO date -> YYYY-MM-DD (data já vem em America/Bahia friendly UTC-3 marker). */
const day = (v: unknown): string => str(v).slice(0, 10);

export function normalize(raw: RawResponse): Dataset {
  const meta: MetaRow[] = (raw.metaads ?? []).map((r) => ({
    date: day(r.date),
    campaign: str(r.campaign),
    ad_name: str(r.ad_name),
    adset_name: str(r.adset_name),
    age: str(r.age),
    gender: str(r.gender),
    thumbnail_url: str(r.thumbnail_url),
    instagram_permalink_url: str(r.instagram_permalink_url),
    spend: num(r.spend),
    impressions: num(r.impressions),
    clicks: num(r.clicks),
    actions_page_engagement: num(r.actions_page_engagement),
    reach: num(r.reach),
    video_thruplay: num(r.video_thruplay_watched_actions_video_view),
    video_p25: num(r.video_p25_watched_actions_video_view),
    video_p50: num(r.video_p50_watched_actions_video_view),
    video_p75: num(r.video_p75_watched_actions_video_view),
    video_p100: num(r.video_p100_watched_actions_video_view),
    estrategia: str(r["Estratégia "]).trim(),
    investimento: num(r.Investimento),
  }));

  const ctv: CtvRow[] = (raw.cTVSmartTv ?? []).map((r) => ({
    date: day(r.DATE),
    impressions: num(r.Impressions),
    clicks: num(r.Clicks),
    start: num(r.Start),
    firstQuartile: num(r["First quartile"]),
    midpoint: num(r.Midpoint),
    thirdQuartile: num(r["Third quartile"]),
    completes: num(r.Completes),
    estrategia: str(r["Estratégia "]).trim(),
  }));

  const programatica: ProgRow[] = (raw.programatica ?? []).map((r) => ({
    date: day(r.date),
    campaign: str(r.campaign),
    ad_group_name: str(r.ad_group_name),
    ad_name: str(r.ad_name),
    ad_image_url: str(r.ad_image_ad_image_url),
    spend: num(r.spend),
    impressions: num(r.impressions),
    clicks: num(r.clicks),
    estrategia: str(r["Estratégia "]).trim(),
    investimento: num(r.Investimento),
  }));

  return { meta, ctv, programatica, timestamp: str(raw.timestamp) };
}
