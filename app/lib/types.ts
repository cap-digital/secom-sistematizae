export type Platform = "meta" | "ctv" | "programatica";

export interface MetaRow {
  date: string;
  campaign: string;
  ad_name: string;
  adset_name: string;
  age: string;
  gender: string;
  thumbnail_url: string;
  instagram_permalink_url: string;
  spend: number;
  impressions: number;
  clicks: number;
  actions_page_engagement: number;
  reach: number;
  video_thruplay: number;
  video_p25: number;
  video_p50: number;
  video_p75: number;
  video_p100: number;
  estrategia: string;
  investimento: number;
}

export interface CtvRow {
  date: string;
  impressions: number;
  clicks: number;
  start: number;
  firstQuartile: number;
  midpoint: number;
  thirdQuartile: number;
  completes: number;
  estrategia: string;
  investimento: number;
  thumbnail: string;
  adName: string;
}

export interface ProgRow {
  date: string;
  campaign: string;
  ad_group_name: string;
  ad_name: string;
  ad_image_url: string;
  spend: number;
  impressions: number;
  clicks: number;
  estrategia: string;
  investimento: number;
}

export interface Dataset {
  meta: MetaRow[];
  ctv: CtvRow[];
  programatica: ProgRow[];
  timestamp: string;
}

export interface RawResponse {
  success: boolean;
  metaads: Record<string, unknown>[];
  cTVSmartTv: Record<string, unknown>[];
  programatica: Record<string, unknown>[];
  timestamp: string;
}
