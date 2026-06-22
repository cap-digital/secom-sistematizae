"use client";

import { useMemo, useState } from "react";
import { useData } from "../lib/DataContext";
import { useFiltered } from "../lib/useFiltered";
import { MetaRow } from "../lib/types";
import {
  sumMeta,
  cpm,
  cpc,
  ctr,
  cpe,
  cpv,
  vtr,
  frequency,
} from "../lib/metrics";
import { brl, compact, dec, int, pct, shortDate } from "../lib/format";
import { C } from "../lib/theme";
import {
  Card,
  Kpi,
  Loading,
  LoadError,
  SectionTitle,
  EmptyState,
  Select,
} from "../components/ui";
import { StrategyFilter } from "../components/StrategyFilter";
import { TrendChart, DonutChart, ChartLegend } from "../components/charts";
import { Funnel, Heatmap } from "../components/customViz";

const STRAT_OPTS = [
  { value: "Alcance Estático", label: "Estático", color: C.terracotta },
  { value: "Alcance Vídeo", label: "Vídeo", color: C.forestMid },
];

const AGES = ["18-24", "25-34", "35-44", "45-54", "55-64", "65+", "Unknown"];
const GENDERS = [
  { key: "female", label: "Feminino" },
  { key: "male", label: "Masculino" },
  { key: "unknown", label: "N/D" },
];
// Donut de gênero — sem N/D
const GENDERS_DONUT = GENDERS.filter((g) => g.key !== "unknown");
const GENDER_COLORS: Record<string, string> = {
  female: C.terracotta,
  male: C.forestMid,
  unknown: C.clay,
};

type Field = "impressions" | "clicks" | "investimento" | "reach" | "engagement";

const get = (r: MetaRow, f: Field): number =>
  f === "engagement" ? r.actions_page_engagement : (r[f] as number);

// Métricas aditivas para heatmap e donut de gênero
const DIST_METRICS: { value: Field; label: string; fmt: (v: number) => string }[] = [
  { value: "impressions", label: "Impressões", fmt: compact },
  { value: "clicks", label: "Cliques", fmt: int },
  { value: "investimento", label: "Investimento", fmt: (x) => brl(x) },
  { value: "reach", label: "Alcance", fmt: compact },
  { value: "engagement", label: "Engajamento", fmt: int },
];

// Métricas para a série diária
const DAILY_METRICS: {
  value: string;
  label: string;
  color: string;
  fmt: (v: number) => string;
}[] = [
  { value: "impressions", label: "Impressões", color: C.forestMid, fmt: compact },
  { value: "investimento", label: "Investimento", color: C.terracotta, fmt: (x) => brl(x) },
  { value: "reach", label: "Alcance", color: C.ochre, fmt: compact },
  { value: "clicks", label: "Cliques", color: C.teal, fmt: int },
  { value: "engagement", label: "Engajamento", color: C.clay, fmt: int },
  { value: "ctr", label: "CTR", color: C.forest, fmt: (x) => `${dec(x)}%` },
  { value: "cpm", label: "CPM", color: C.terracottaDeep, fmt: (x) => brl(x, 2) },
];

export default function MetaPage() {
  const { loading, data, error, reload } = useData();
  const f = useFiltered();

  const [dailyMetric, setDailyMetric] = useState("impressions");
  const [heatMetric, setHeatMetric] = useState<Field>("impressions");
  const [genderMetric, setGenderMetric] = useState<Field>("impressions");

  const v = useMemo(() => {
    const t = sumMeta(f.meta);
    const videoRows = f.meta.filter((r) => r.estrategia === "Alcance Vídeo");
    const vt = sumMeta(videoRows);

    // série diária com todas as métricas
    const byDate = new Map<
      string,
      { date: string; investimento: number; impressions: number; clicks: number; reach: number; engagement: number }
    >();
    for (const r of f.meta) {
      const e =
        byDate.get(r.date) ??
        { date: r.date, investimento: 0, impressions: 0, clicks: 0, reach: 0, engagement: 0 };
      e.investimento += r.investimento;
      e.impressions += r.impressions;
      e.clicks += r.clicks;
      e.reach += r.reach;
      e.engagement += r.actions_page_engagement;
      byDate.set(r.date, e);
    }
    const daily = [...byDate.values()]
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((d) => ({
        label: shortDate(d.date),
        impressions: d.impressions,
        investimento: d.investimento,
        reach: d.reach,
        clicks: d.clicks,
        engagement: d.engagement,
        ctr: d.impressions ? (d.clicks / d.impressions) * 100 : 0,
        cpm: d.impressions ? (d.investimento / d.impressions) * 1000 : 0,
      }));

    // células por idade × gênero, com todas as métricas aditivas
    const cells: Record<string, Record<string, Record<Field, number>>> = {};
    for (const a of AGES)
      cells[a] = {
        female: empty(),
        male: empty(),
        unknown: empty(),
      };
    for (const r of f.meta) {
      const a = AGES.includes(r.age) ? r.age : "Unknown";
      const g = ["female", "male", "unknown"].includes(r.gender) ? r.gender : "unknown";
      for (const fld of DIST_METRICS) cells[a][g][fld.value] += get(r, fld.value);
    }

    return { t, vt, daily, cells, hasVideo: vt.p25 > 0 };
  }, [f]);

  if (loading && !data) return <Loading />;
  if (error && !data) return <LoadError msg={error} onRetry={reload} />;
  if (f.meta.length === 0)
    return <EmptyState msg="Sem dados de Meta Ads para o período/estratégia selecionado." />;

  const { t } = v;

  // heatmap a partir das células
  const matrix: Record<string, Record<string, number>> = {};
  for (const a of AGES) {
    matrix[a] = {};
    for (const g of GENDERS) matrix[a][g.key] = v.cells[a][g.key][heatMetric];
  }
  const heatDef = DIST_METRICS.find((m) => m.value === heatMetric)!;

  // donut de gênero (sem N/D)
  const genderDonut = GENDERS_DONUT.map((g) => ({
    name: g.label,
    value: AGES.reduce((s, a) => s + v.cells[a][g.key][genderMetric], 0),
    color: GENDER_COLORS[g.key],
  })).filter((d) => d.value > 0);
  const genderDef = DIST_METRICS.find((m) => m.value === genderMetric)!;
  const genderTotal = genderDonut.reduce((s, d) => s + d.value, 0);

  // série diária selecionada
  const dailyDef = DAILY_METRICS.find((m) => m.value === dailyMetric)!;

  const cpvVideo = v.vt.thruplay ? cpv(v.vt.investimento, v.vt.thruplay) : 0;

  return (
    <div className="space-y-6">
      <StrategyFilter options={STRAT_OPTS} />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Kpi label="Investimento" value={brl(t.investimento)} accent={C.terracotta} sub={`CPM ${brl(cpm(t.investimento, t.impressions), 2)}`} />
        <Kpi label="Impressões" value={compact(t.impressions)} accent={C.forest} sub={`Freq. ${dec(frequency(t.impressions, t.reach), 1)}x`} />
        <Kpi
          label="ThruPlays"
          value={int(t.thruplay)}
          accent={C.ochre}
          sub={cpvVideo ? `CPV ${brl(cpvVideo, 2)}` : "vídeos assistidos"}
        />
        <Kpi label="Cliques" value={int(t.clicks)} accent={C.teal} sub={`CTR ${pct(ctr(t.clicks, t.impressions))}`} />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <Stat label="CPC" value={brl(cpc(t.investimento, t.clicks), 2)} />
        <Stat label="CTR" value={pct(ctr(t.clicks, t.impressions))} />
        <Stat label="Alcance" value={compact(t.reach)} />
        <Stat label="Frequência" value={`${dec(frequency(t.impressions, t.reach), 1)}x`} />
        <Stat label="Engajamentos" value={int(t.engagement)} />
        <Stat label="CPE" value={brl(cpe(t.investimento, t.engagement), 2)} />
      </div>

      {/* Daily combo */}
      <Card>
        <SectionTitle
          title="Performance diária"
          hint="Evolução da métrica selecionada por dia"
          right={
            <Select
              value={dailyMetric}
              onChange={setDailyMetric}
              options={DAILY_METRICS.map((m) => ({ value: m.value, label: m.label }))}
            />
          }
        />
        <TrendChart
          data={v.daily}
          xKey="label"
          height={320}
          series={[
            {
              key: dailyDef.value,
              name: dailyDef.label,
              color: dailyDef.color,
              type: "area",
              fmt: dailyDef.fmt,
            },
          ]}
        />
      </Card>

      {/* Heatmap + gender */}
      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <Card>
          <SectionTitle
            title="Público por idade e gênero"
            hint={`Mapa de calor · ${heatDef.label.toLowerCase()}`}
            right={
              <Select
                value={heatMetric}
                onChange={(x) => setHeatMetric(x as Field)}
                options={DIST_METRICS.map((m) => ({ value: m.value, label: m.label }))}
              />
            }
          />
          <Heatmap rows={AGES} cols={GENDERS} matrix={matrix} color={C.terracotta} fmt={heatDef.fmt} />
        </Card>

        <Card>
          <SectionTitle
            title="Distribuição por gênero"
            hint={`Participação · ${genderDef.label.toLowerCase()}`}
            right={
              <Select
                value={genderMetric}
                onChange={(x) => setGenderMetric(x as Field)}
                options={DIST_METRICS.map((m) => ({ value: m.value, label: m.label }))}
              />
            }
          />
          <DonutChart
            data={genderDonut}
            centerValue={genderDef.fmt(genderTotal)}
            centerLabel={genderDef.label.toLowerCase()}
            fmt={genderDef.fmt}
          />
          <div className="mt-4">
            <ChartLegend series={genderDonut} />
          </div>
        </Card>
      </div>

      {/* Video funnel */}
      <Card>
        <SectionTitle
          title="Funil de visualização de vídeo"
          hint="Retenção dos anúncios em vídeo — dos 25% aos 100% assistidos"
        />
        {v.hasVideo ? (
          <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr] items-center">
            <Funnel
              stages={[
                { label: "Impressões", value: v.vt.impressions, color: C.forest },
                { label: "25% assistido", value: v.vt.p25, color: C.forestMid },
                { label: "50% assistido", value: v.vt.p50, color: C.teal },
                { label: "75% assistido", value: v.vt.p75, color: C.ochre },
                { label: "100% assistido", value: v.vt.p100, color: C.terracotta },
              ]}
            />
            <div className="grid grid-cols-2 gap-3">
              <Stat label="ThruPlays" value={int(v.vt.thruplay)} />
              <Stat label="Vídeos 100%" value={int(v.vt.p100)} />
              <Stat label="VTR (100%)" value={pct(vtr(v.vt.p100, v.vt.impressions))} />
              <Stat label="CPV (ThruPlay)" value={brl(cpv(v.vt.investimento, v.vt.thruplay), 2)} />
            </div>
          </div>
        ) : (
          <EmptyState msg="Selecione a estratégia 'Vídeo' (ou 'Todas') para visualizar o funil de retenção de vídeo." />
        )}
      </Card>
    </div>
  );
}

function empty(): Record<Field, number> {
  return { impressions: 0, clicks: 0, investimento: 0, reach: 0, engagement: 0 };
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-line bg-paper-soft px-3.5 py-3">
      <div className="text-[10px] font-semibold uppercase tracking-wide text-ink-soft">
        {label}
      </div>
      <div className="mt-1 text-base font-black font-mono text-ink">{value}</div>
    </div>
  );
}
