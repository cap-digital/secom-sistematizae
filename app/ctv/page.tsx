"use client";

import { useMemo } from "react";
import { useData } from "../lib/DataContext";
import { useFiltered } from "../lib/useFiltered";
import { sumCtv, vtr } from "../lib/metrics";
import { MEDIA_PLAN } from "../lib/mediaPlan";
import { brl, compact, dec, int, pct, shortDate } from "../lib/format";
import { C } from "../lib/theme";
import { Card, Kpi, Loading, LoadError, SectionTitle, EmptyState, Pill } from "../components/ui";
import { TrendChart, ChartLegend } from "../components/charts";
import { Funnel, Gauge } from "../components/customViz";

const PLAN = MEDIA_PLAN.find((g) => g.platform === "ctv")!;

export default function CtvPage() {
  const { loading, data, error, reload } = useData();
  const f = useFiltered();

  const v = useMemo(() => {
    const t = sumCtv(f.ctv);
    const daily = [...f.ctv]
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((r) => ({
        label: shortDate(r.date),
        impressions: r.impressions,
        completes: r.completes,
        vtrPct: vtr(r.completes, r.impressions) * 100,
      }));

    const retention = [
      { stage: "Início", pct: t.start ? 100 : 0, abs: t.start },
      { stage: "25%", pct: t.start ? (t.firstQuartile / t.start) * 100 : 0, abs: t.firstQuartile },
      { stage: "50%", pct: t.start ? (t.midpoint / t.start) * 100 : 0, abs: t.midpoint },
      { stage: "75%", pct: t.start ? (t.thirdQuartile / t.start) * 100 : 0, abs: t.thirdQuartile },
      { stage: "100%", pct: t.start ? (t.completes / t.start) * 100 : 0, abs: t.completes },
    ];

    return { t, daily, retention };
  }, [f]);

  if (loading && !data) return <Loading />;
  if (error && !data) return <LoadError msg={error} onRetry={reload} />;
  if (f.ctv.length === 0)
    return <EmptyState msg="Sem dados de CTV para o período selecionado." />;

  const { t } = v;
  const completionRate = vtr(t.completes, t.impressions);
  const goalProgress = t.completes / PLAN.volume;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <Pill tone="neutral">CTV · FastChannels</Pill>
        <span className="text-xs text-ink-soft">
          Plano contratado: {brl(PLAN.investimento)} · meta de {compact(PLAN.volume)} visualizações.
          Sem dado de investimento diário na base — análise focada em entrega e retenção.
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Kpi label="Impressões" value={compact(t.impressions)} accent={C.teal} sub="exibições em Smart TV" />
        <Kpi label="Visualizações 100%" value={compact(t.completes)} accent={C.forest} sub="vídeos completos" />
        <Kpi label="Taxa de conclusão (VTR)" value={pct(completionRate)} accent={C.terracotta} sub="completos / impressões" />
        <Kpi label="Cliques" value={int(t.clicks)} accent={C.ochre} sub="interações na TV conectada" />
      </div>

      {/* Funnel + gauge */}
      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <Card>
          <SectionTitle
            title="Funil de conclusão do vídeo"
            hint="Quantos espectadores avançam em cada quartil da peça"
          />
          <Funnel
            stages={[
              { label: "Início (impressões de vídeo)", value: t.start, color: C.forest },
              { label: "Primeiro quartil · 25%", value: t.firstQuartile, color: C.forestMid },
              { label: "Meio · 50%", value: t.midpoint, color: C.teal },
              { label: "Terceiro quartil · 75%", value: t.thirdQuartile, color: C.ochre },
              { label: "Completo · 100%", value: t.completes, color: C.terracotta },
            ]}
          />
        </Card>

        <Card className="flex flex-col items-center justify-center">
          <SectionTitle title="Meta de visualizações" hint="Entrega vs. plano contratado" />
          <Gauge
            value={goalProgress}
            label={`${compact(t.completes)} de ${compact(PLAN.volume)} visualizações`}
            sub="da meta contratada"
            color={C.teal}
          />
        </Card>
      </div>

      {/* Daily + retention curve */}
      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <SectionTitle
            title="Entrega diária"
            hint="Impressões e visualizações completas por dia"
            right={
              <ChartLegend
                series={[
                  { name: "Impressões", color: C.teal },
                  { name: "Completos", color: C.terracotta },
                ]}
              />
            }
          />
          <TrendChart
            data={v.daily}
            xKey="label"
            height={280}
            series={[
              { key: "impressions", name: "Impressões", color: C.teal, type: "bar", fmt: compact },
              { key: "completes", name: "Completos", color: C.terracotta, type: "line", fmt: compact },
            ]}
          />
        </Card>

        <Card>
          <SectionTitle
            title="Curva de retenção"
            hint="% de espectadores que permanecem até cada quartil"
          />
          <TrendChart
            data={v.retention}
            xKey="stage"
            height={280}
            series={[
              { key: "pct", name: "Retenção", color: C.forestMid, type: "area", fmt: (x) => `${dec(x, 1)}%` },
            ]}
          />
          <p className="mt-2 text-center text-xs text-ink-soft">
            Retenção excepcional: {pct(t.start ? t.completes / t.start : 0, 1)} dos
            inícios chegam ao final do vídeo.
          </p>
        </Card>
      </div>
    </div>
  );
}
