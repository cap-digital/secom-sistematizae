"use client";

import { useMemo, useState } from "react";
import { useData } from "./lib/DataContext";
import { useFiltered } from "./lib/useFiltered";
import { sumMeta, sumProg, sumCtv, cpm, ctr, cpc, cpv, frequency } from "./lib/metrics";
import {
  MEDIA_PLAN,
  TOTAL_CONTRACTED_INVEST,
  expectedPace,
  campaignElapsedDays,
  campaignTotalDays,
} from "./lib/mediaPlan";
import { brl, compact, dec, int, pct, shortDate } from "./lib/format";
import { C, PLATFORM_COLOR } from "./lib/theme";
import { Card, Kpi, Loading, LoadError, SectionTitle, Select } from "./components/ui";
import { StrategyFilter } from "./components/StrategyFilter";
import { DonutChart, TrendChart, ChartLegend, HBars } from "./components/charts";
import { GoalBar, Gauge } from "./components/customViz";
import { IconTarget, IconTrendUp, IconArrow } from "./components/icons";

const STRAT_OPTS = [
  { value: "Alcance Estático", label: "Meta · Estático", color: C.terracotta },
  { value: "Alcance Vídeo", label: "Meta · Vídeo", color: C.forestMid },
  { value: "CTV - FastChannels", label: "CTV", color: C.teal },
  { value: "Alcance", label: "Programática", color: C.ochre },
];

const CONS_METRICS: {
  value: string;
  label: string;
  color: string;
  fmt: (v: number) => string;
}[] = [
  { value: "investimento", label: "Investimento", color: C.terracotta, fmt: (x) => brl(x) },
  { value: "impressions", label: "Impressões", color: C.forestMid, fmt: compact },
  { value: "clicks", label: "Cliques", color: C.teal, fmt: int },
];

export default function Overview() {
  const { data, loading, error, reload } = useData();
  const f = useFiltered();
  const [consMetric, setConsMetric] = useState("investimento");

  const agg = useMemo(() => {
    const m = sumMeta(f.meta);
    const p = sumProg(f.programatica);
    const c = sumCtv(f.ctv);

    const investimento = m.investimento + p.investimento;
    const impressions = m.impressions + p.impressions + c.impressions;
    const clicks = m.clicks + p.clicks + c.clicks;
    const reach = m.reach; // alcance único disponível apenas no Meta

    // CPV — custo por visualização de vídeo (Meta Vídeo é a verba com views mensuradas)
    const metaVideo = f.meta.filter((r) => r.estrategia === "Alcance Vídeo");
    const videoInvest = metaVideo.reduce((s, r) => s + r.investimento, 0);
    const videoViews = metaVideo.reduce((s, r) => s + r.video_thruplay, 0);

    const byDate = new Map<
      string,
      { date: string; investimento: number; impressions: number; clicks: number }
    >();
    const bump = (date: string, inv: number, imp: number, clk: number) => {
      const e =
        byDate.get(date) ?? { date, investimento: 0, impressions: 0, clicks: 0 };
      e.investimento += inv;
      e.impressions += imp;
      e.clicks += clk;
      byDate.set(date, e);
    };
    f.meta.forEach((r) => bump(r.date, r.investimento, r.impressions, r.clicks));
    f.programatica.forEach((r) =>
      bump(r.date, r.investimento, r.impressions, r.clicks),
    );
    f.ctv.forEach((r) => bump(r.date, 0, r.impressions, r.clicks));
    const daily = [...byDate.values()]
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((d) => ({ ...d, label: shortDate(d.date) }));

    const split = [
      { name: "Meta Ads", value: m.investimento, color: PLATFORM_COLOR.meta },
      {
        name: "Programática",
        value: p.investimento,
        color: PLATFORM_COLOR.programatica,
      },
    ].filter((d) => d.value > 0);

    const impr = [
      { name: "Meta Ads", value: m.impressions, color: PLATFORM_COLOR.meta },
      { name: "CTV", value: c.impressions, color: PLATFORM_COLOR.ctv },
      {
        name: "Programática",
        value: p.impressions,
        color: PLATFORM_COLOR.programatica,
      },
    ].filter((d) => d.value > 0);

    return {
      investimento,
      impressions,
      clicks,
      reach,
      cpm: cpm(investimento, m.impressions + p.impressions),
      ctr: ctr(clicks, impressions),
      cpc: cpc(investimento, clicks),
      cpv: cpv(videoInvest, videoViews),
      freq: frequency(m.impressions, reach),
      daily,
      split,
      impr,
    };
  }, [f]);

  // Evolução das metas — sobre o total entregue (independe do filtro de período)
  const goals = useMemo(() => {
    if (!data) return [];
    return MEDIA_PLAN.map((g) => {
      let investDone = 0;
      let volumeDone = 0;
      if (g.platform === "meta") {
        const rows = data.meta.filter((r) => r.estrategia === g.estrategia);
        investDone = rows.reduce((s, r) => s + r.investimento, 0);
        volumeDone = rows.reduce((s, r) => s + r.impressions, 0);
      } else if (g.platform === "programatica") {
        const rows = data.programatica.filter((r) => r.estrategia === g.estrategia);
        investDone = rows.reduce((s, r) => s + r.investimento, 0);
        volumeDone = rows.reduce((s, r) => s + r.impressions, 0);
      } else {
        volumeDone = data.ctv.reduce((s, r) => s + r.completes, 0);
        investDone = NaN; // CTV sem dado de spend na base
      }
      return {
        ...g,
        investDone,
        volumeDone,
        volumeTarget: g.volume,
        investTarget: g.investimento,
      };
    });
  }, [data]);

  const deliveredInvest = goals.reduce(
    (s, g) => s + (Number.isFinite(g.investDone) ? g.investDone : 0),
    0,
  );
  const contractedKnown = goals
    .filter((g) => Number.isFinite(g.investDone))
    .reduce((s, g) => s + g.investTarget, 0);
  const pacing = contractedKnown ? deliveredInvest / contractedKnown : 0;

  const today = new Date().toISOString().slice(0, 10);
  const expected = expectedPace(today);
  const elapsed = campaignElapsedDays(today);
  const totalDays = campaignTotalDays();

  if (loading && !data) return <Loading />;
  if (error && !data) return <LoadError msg={error} onRetry={reload} />;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <StrategyFilter options={STRAT_OPTS} />
        <span className="text-xs text-ink-soft">
          Investimento contratado total:{" "}
          <strong className="text-ink">{brl(TOTAL_CONTRACTED_INVEST)}</strong>
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Kpi
          label="Investimento"
          value={brl(agg.investimento)}
          sub="Meta Ads + Programática"
          accent={C.terracotta}
          icon={<IconTrendUp className="h-5 w-5" />}
        />
        <Kpi
          label="Impressões"
          value={compact(agg.impressions)}
          sub="Somatório das 3 plataformas"
          accent={C.forest}
        />
        <Kpi
          label="Alcance (Meta)"
          value={compact(agg.reach)}
          sub={`Frequência média ${dec(agg.freq, 1)}x`}
          accent={C.ochre}
        />
        <Kpi
          label="Cliques"
          value={int(agg.clicks)}
          sub={`CTR ${pct(agg.ctr)}`}
          accent={C.teal}
        />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <RateChip label="CPM médio" value={brl(agg.cpm, 2)} hint="custo / mil impressões" />
        <RateChip label="CPC médio" value={brl(agg.cpc, 2)} hint="custo / clique" />
        <RateChip
          label="CPV vídeo"
          value={agg.cpv > 0 ? brl(agg.cpv, 2) : "—"}
          hint="custo / visualização (Meta)"
        />
        <RateChip
          label="Ritmo de entrega"
          value={pct(pacing, 0)}
          hint={`esperado ${pct(expected, 0)} · dia ${elapsed}/${totalDays}`}
        />
      </div>

      <Card>
        <SectionTitle
          title="Evolução das metas contratadas"
          hint="Entrega acumulada vs. plano de mídia oficial do programa"
          right={
            <span className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-terracotta">
              <IconTarget className="h-4 w-4" /> Plano de mídia
            </span>
          }
        />
        <div className="grid gap-6 lg:grid-cols-[1fr_248px]">
          <div className="space-y-5">
            {goals.map((g) => (
              <div
                key={g.id}
                className="grid gap-x-8 gap-y-3 sm:grid-cols-2 border-b border-line/70 pb-5 last:border-0 last:pb-0"
              >
                <GoalBar
                  label={`${g.platformLabel} · ${g.estrategia}`}
                  sublabel={g.goalMetricLabel}
                  current={g.volumeDone}
                  target={g.volumeTarget}
                  color={PLATFORM_COLOR[g.platform]}
                  fmt={compact}
                />
                {Number.isFinite(g.investDone) ? (
                  <GoalBar
                    label="Investimento"
                    sublabel="realizado / contratado"
                    current={g.investDone}
                    target={g.investTarget}
                    color={C.terracotta}
                    fmt={(v) => brl(v)}
                    cap
                  />
                ) : (
                  <div className="flex items-end">
                    <p className="text-xs text-ink-soft">
                      Investimento de CTV não disponível na base — meta de{" "}
                      {brl(g.investTarget)} contratada.
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="flex flex-col items-center justify-center gap-3 rounded-3xl bg-paper-soft p-5">
            <Gauge value={pacing} label="" sub="entregue" color={C.terracotta} />
            <div className="text-center">
              <div className="font-mono text-base font-bold text-ink">
                {brl(deliveredInvest)}
              </div>
              <div className="text-[11px] text-ink-soft">investimento entregue</div>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <Card>
          <SectionTitle
            title="Entrega diária consolidada"
            hint="Evolução da métrica selecionada por dia (3 plataformas)"
            right={
              <Select
                value={consMetric}
                onChange={setConsMetric}
                options={CONS_METRICS.map((m) => ({ value: m.value, label: m.label }))}
              />
            }
          />
          {(() => {
            const m = CONS_METRICS.find((x) => x.value === consMetric)!;
            return (
              <TrendChart
                data={agg.daily}
                xKey="label"
                series={[
                  {
                    key: m.value,
                    name: m.label,
                    color: m.color,
                    type: "area",
                    fmt: m.fmt,
                  },
                ]}
              />
            );
          })()}
        </Card>

        <Card>
          <SectionTitle
            title="Investimento por plataforma"
            hint="Distribuição da verba aplicada"
          />
          <DonutChart
            data={agg.split}
            centerValue={brl(agg.investimento)}
            centerLabel="total"
            fmt={(v) => brl(v)}
          />
          <div className="mt-4">
            <ChartLegend series={agg.split} />
          </div>
        </Card>
      </div>

      <Card>
        <SectionTitle
          title="Impressões por plataforma"
          hint="Volume de exibições entregue em cada canal"
        />
        <HBars data={agg.impr} />
      </Card>

      <p className="flex items-center gap-1.5 text-xs text-ink-soft">
        <IconArrow className="h-3.5 w-3.5" />
        Explore cada plataforma e os criativos no menu lateral para análises
        detalhadas.
      </p>
    </div>
  );
}

function RateChip({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="rounded-2xl border border-line bg-paper-soft px-4 py-3">
      <div className="text-[11px] font-semibold uppercase tracking-wide text-ink-soft">
        {label}
      </div>
      <div className="mt-1 text-lg font-black font-mono text-ink">{value}</div>
      <div className="text-[10px] text-ink-soft">{hint}</div>
    </div>
  );
}
