"use client";

import { useMemo, useState } from "react";
import { useData } from "../lib/DataContext";
import { useFiltered } from "../lib/useFiltered";
import { cpm, cpc, ctr, cpv, vtr } from "../lib/metrics";
import { brl, compact, int, pct } from "../lib/format";
import { C, PLATFORM_COLOR } from "../lib/theme";
import { Card, Loading, LoadError, SectionTitle, EmptyState, Pill, SafeImg, Select } from "../components/ui";
import { StrategyFilter } from "../components/StrategyFilter";
import { BubbleChart, HBars } from "../components/charts";
import { Funnel } from "../components/customViz";
import { IconImage, IconChevron } from "../components/icons";

const STRAT_OPTS = [
  { value: "Alcance Estático", label: "Meta · Estático", color: C.terracotta },
  { value: "Alcance Vídeo", label: "Meta · Vídeo", color: C.forestMid },
  { value: "Alcance", label: "Programática", color: C.ochre },
];

interface Creative {
  id: string;
  platform: "meta" | "programatica";
  platformLabel: string;
  strategy: string;
  format: string;
  name: string;
  image: string;
  link?: string;
  impressions: number;
  clicks: number;
  investimento: number;
  reach: number;
  ctr: number;
  cpm: number;
  cpc: number;
  isVideo: boolean;
  video?: { thruplay: number; p25: number; p50: number; p75: number; p100: number; vtr: number; cpv: number };
}

export default function CriativosPage() {
  const { loading, data, error, reload } = useData();
  const f = useFiltered();
  const [rankMetric, setRankMetric] = useState<"cpm" | "cpc" | "cpv">("cpm");

  const creatives = useMemo<Creative[]>(() => {
    const list: Creative[] = [];

    // Meta — agrupa por ad_name
    const metaNames = [...new Set(f.meta.map((r) => r.ad_name))];
    for (const name of metaNames) {
      const rows = f.meta.filter((r) => r.ad_name === name);
      const s = rows.reduce(
        (a, r) => ({
          impressions: a.impressions + r.impressions,
          clicks: a.clicks + r.clicks,
          investimento: a.investimento + r.investimento,
          reach: a.reach + r.reach,
          thruplay: a.thruplay + r.video_thruplay,
          p25: a.p25 + r.video_p25,
          p50: a.p50 + r.video_p50,
          p75: a.p75 + r.video_p75,
          p100: a.p100 + r.video_p100,
        }),
        { impressions: 0, clicks: 0, investimento: 0, reach: 0, thruplay: 0, p25: 0, p50: 0, p75: 0, p100: 0 },
      );
      const strategy = rows[0]?.estrategia ?? "";
      const isVideo = strategy === "Alcance Vídeo";
      list.push({
        id: `meta-${name}`,
        platform: "meta",
        platformLabel: "Meta Ads",
        strategy,
        format: isVideo ? "Vídeo" : "Imagem estática",
        name,
        image: rows[0]?.thumbnail_url ?? "",
        link: rows[0]?.instagram_permalink_url,
        impressions: s.impressions,
        clicks: s.clicks,
        investimento: s.investimento,
        reach: s.reach,
        ctr: ctr(s.clicks, s.impressions),
        cpm: cpm(s.investimento, s.impressions),
        cpc: cpc(s.investimento, s.clicks),
        isVideo,
        video: isVideo
          ? {
              thruplay: s.thruplay,
              p25: s.p25,
              p50: s.p50,
              p75: s.p75,
              p100: s.p100,
              vtr: vtr(s.p100, s.impressions),
              cpv: cpv(s.investimento, s.thruplay),
            }
          : undefined,
      });
    }

    // Programática — agrupa por ad_name
    const progNames = [...new Set(f.programatica.map((r) => r.ad_name))];
    for (const name of progNames) {
      const rows = f.programatica.filter((r) => r.ad_name === name);
      const s = rows.reduce(
        (a, r) => ({
          impressions: a.impressions + r.impressions,
          clicks: a.clicks + r.clicks,
          investimento: a.investimento + r.investimento,
        }),
        { impressions: 0, clicks: 0, investimento: 0 },
      );
      list.push({
        id: `prog-${name}`,
        platform: "programatica",
        platformLabel: "Programática",
        strategy: "Alcance",
        format: "Banner display",
        name: name.replace(/SISTEMATIZAE[- ]?/i, "").replace(/SECULT[- ]?/i, "").trim() || name,
        image: rows[0]?.ad_image_url ?? "",
        impressions: s.impressions,
        clicks: s.clicks,
        investimento: s.investimento,
        reach: 0,
        ctr: ctr(s.clicks, s.impressions),
        cpm: cpm(s.investimento, s.impressions),
        cpc: cpc(s.investimento, s.clicks),
        isVideo: false,
      });
    }

    return list.sort((a, b) => b.impressions - a.impressions);
  }, [f]);

  if (loading && !data) return <Loading />;
  if (error && !data) return <LoadError msg={error} onRetry={reload} />;
  if (creatives.length === 0)
    return <EmptyState msg="Sem criativos para o período/estratégia selecionado." />;

  const metaCreatives = creatives.filter((c) => c.platform === "meta");
  const progCreatives = creatives.filter((c) => c.platform === "programatica");

  const bubble = creatives.map((c) => ({
    name: c.name,
    x: c.impressions,
    y: c.ctr * 100,
    z: Math.max(c.investimento, 1),
    color: PLATFORM_COLOR[c.platform],
  }));

  // Ranking por métrica de custo (menor = melhor) — sobe os mais eficientes
  const RANK_META: Record<string, { label: string; get: (c: Creative) => number }> = {
    cpm: { label: "CPM", get: (c) => c.cpm },
    cpc: { label: "CPC", get: (c) => c.cpc },
    cpv: { label: "CPV", get: (c) => c.video?.cpv ?? 0 },
  };
  const rankDef = RANK_META[rankMetric];
  const ranking = creatives
    .map((c) => ({ name: c.name, value: rankDef.get(c), color: PLATFORM_COLOR[c.platform] }))
    .filter((d) => d.value > 0) // CPV só existe p/ vídeo
    .sort((a, b) => a.value - b.value);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <StrategyFilter options={STRAT_OPTS} />
        <span className="flex items-center gap-1.5 text-xs text-ink-soft">
          <IconImage className="h-4 w-4 text-terracotta" />
          {creatives.length} criativos ativos · CTV não veicula peças individuais
        </span>
      </div>

      {/* Feature — Meta creatives */}
      {metaCreatives.length > 0 && (
        <div className="grid gap-6 lg:grid-cols-2">
          {metaCreatives.map((c) => (
            <Card key={c.id} className="flex flex-col gap-4 sm:flex-row">
              <div className="sm:w-44 shrink-0">
                <div className="grid aspect-square place-items-center overflow-hidden rounded-2xl bg-cream-deep">
                  <SafeImg src={c.image} alt={c.name} className="h-full w-full object-cover" />
                </div>
                {c.link && (
                  <a
                    href={c.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 block text-center text-[11px] font-semibold text-terracotta hover:underline"
                  >
                    Ver no Instagram ↗
                  </a>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <Pill tone="bad">{c.platformLabel}</Pill>
                  <Pill tone="neutral">{c.format}</Pill>
                </div>
                <h3 className="mt-2 truncate text-sm font-bold text-ink" title={c.name}>
                  {c.name}
                </h3>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  <Metric label="Impressões" value={compact(c.impressions)} />
                  <Metric label="Alcance" value={compact(c.reach)} />
                  <Metric label="Investimento" value={brl(c.investimento)} />
                  <Metric label="CTR" value={pct(c.ctr)} />
                  <Metric label="CPM" value={brl(c.cpm, 2)} />
                  <Metric label="CPC" value={brl(c.cpc, 2)} />
                </div>
                {c.video && <VideoRetention video={c.video} />}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Programática banners */}
      {progCreatives.length > 0 && (
        <Card>
          <SectionTitle
            title="Banners — Programática"
            hint="Formatos de display veiculados via Google DV360"
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {progCreatives.map((c) => (
              <div key={c.id} className="rounded-2xl border border-line bg-paper-soft p-3">
                <div className="grid h-32 place-items-center overflow-hidden rounded-xl bg-cream-deep">
                  <SafeImg src={c.image} alt={c.name} className="max-h-full max-w-full object-contain" />
                </div>
                <div className="mt-2.5 truncate text-xs font-semibold text-ink" title={c.name}>
                  {c.name}
                </div>
                <div className="mt-2 grid grid-cols-2 gap-1.5">
                  <Metric label="Impr." value={compact(c.impressions)} small />
                  <Metric label="CTR" value={pct(c.ctr)} small />
                  <Metric label="Cliques" value={int(c.clicks)} small />
                  <Metric label="CPC" value={brl(c.cpc, 2)} small />
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Comparison */}
      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <Card>
          <SectionTitle
            title="Mapa de eficiência dos criativos"
            hint="Impressões × CTR · tamanho da bolha = investimento"
            right={
              <div className="flex gap-3 text-[11px] text-ink-soft">
                <span className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: PLATFORM_COLOR.meta }} />
                  Meta
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: PLATFORM_COLOR.programatica }} />
                  Programática
                </span>
              </div>
            }
          />
          <BubbleChart points={bubble} xLabel="Impressões" yLabel="CTR (%)" />
        </Card>

        <Card>
          <SectionTitle
            title={`Ranking por ${rankDef.label}`}
            hint="Menor custo no topo — peças mais eficientes"
            right={
              <Select
                value={rankMetric}
                onChange={(x) => setRankMetric(x as "cpm" | "cpc" | "cpv")}
                options={[
                  { value: "cpm", label: "CPM" },
                  { value: "cpc", label: "CPC" },
                  { value: "cpv", label: "CPV" },
                ]}
              />
            }
          />
          {ranking.length > 0 ? (
            <HBars data={ranking} fmt={(x) => brl(x, 2)} />
          ) : (
            <EmptyState msg="Sem dados de CPV — selecione peças de vídeo." />
          )}
        </Card>
      </div>
    </div>
  );
}

function VideoRetention({
  video,
}: {
  video: { p25: number; p50: number; p75: number; p100: number; vtr: number };
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-4">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between rounded-2xl border border-line bg-paper-soft px-3.5 py-2.5 text-left transition hover:border-terracotta/40"
      >
        <span className="flex items-center gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-ink-soft">
            Retenção de vídeo
          </span>
          <Pill tone="good">VTR {pct(video.vtr)}</Pill>
        </span>
        <span className="flex items-center gap-1.5 text-[11px] font-semibold text-terracotta">
          {open ? "Ocultar" : "Ver funil"}
          <IconChevron className={`h-4 w-4 transition ${open ? "rotate-180" : ""}`} />
        </span>
      </button>
      {open && (
        <div className="mt-3">
          <Funnel
            stages={[
              { label: "25%", value: video.p25, color: C.forestMid },
              { label: "50%", value: video.p50, color: C.teal },
              { label: "75%", value: video.p75, color: C.ochre },
              { label: "100%", value: video.p100, color: C.terracotta },
            ]}
          />
        </div>
      )}
    </div>
  );
}

function Metric({
  label,
  value,
  small = false,
}: {
  label: string;
  value: string;
  small?: boolean;
}) {
  return (
    <div className={`rounded-xl bg-paper ${small ? "px-2 py-1.5" : "border border-line px-3 py-2"}`}>
      <div className={`uppercase tracking-wide text-ink-soft ${small ? "text-[9px]" : "text-[10px]"}`}>
        {label}
      </div>
      <div className={`font-mono font-bold text-ink ${small ? "text-xs" : "text-sm"}`}>{value}</div>
    </div>
  );
}
