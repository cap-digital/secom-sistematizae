"use client";

import { useMemo } from "react";
import { useData } from "../lib/DataContext";
import { useFiltered } from "../lib/useFiltered";
import { sumProg, cpm, cpc, ctr } from "../lib/metrics";
import { ProgRow } from "../lib/types";
import { brl, compact, int, pct, shortDate } from "../lib/format";
import { C } from "../lib/theme";
import { Card, Kpi, Loading, LoadError, SectionTitle, EmptyState, SafeImg } from "../components/ui";
import { TrendChart, DonutChart, ChartLegend, HBars } from "../components/charts";

const GROUP_COLOR: Record<string, string> = {
  "[BA] [SEGMENTADO]": C.terracotta,
  "[BA] [OPEN]": C.forestMid,
};
const groupLabel = (g: string) =>
  g.replace("[BA] [", "").replace("]", "").replace("SEGMENTADO", "Segmentado").replace("OPEN", "Open");

function agg(rows: ProgRow[]) {
  return sumProg(rows);
}

export default function ProgramaticaPage() {
  const { loading, data, error, reload } = useData();
  const f = useFiltered();

  const v = useMemo(() => {
    const t = sumProg(f.programatica);

    const daily = (() => {
      const m = new Map<string, { label: string; investimento: number; impressions: number; clicks: number; ctrPct: number }>();
      for (const r of f.programatica) {
        const k = r.date;
        const e = m.get(k) ?? { label: shortDate(k), investimento: 0, impressions: 0, clicks: 0, ctrPct: 0 };
        e.investimento += r.investimento;
        e.impressions += r.impressions;
        e.clicks += r.clicks;
        m.set(k, e);
      }
      return [...m.entries()]
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([, e]) => ({ ...e, ctrPct: ctr(e.clicks, e.impressions) * 100 }));
    })();

    // por grupo
    const groups = [...new Set(f.programatica.map((r) => r.ad_group_name))];
    const byGroup = groups.map((g) => {
      const rows = f.programatica.filter((r) => r.ad_group_name === g);
      const s = agg(rows);
      return {
        group: g,
        label: groupLabel(g),
        color: GROUP_COLOR[g] ?? C.clay,
        investimento: s.investimento,
        impressions: s.impressions,
        clicks: s.clicks,
        ctr: ctr(s.clicks, s.impressions),
        cpm: cpm(s.investimento, s.impressions),
        cpc: cpc(s.investimento, s.clicks),
      };
    });

    // por criativo
    const creatives = [...new Set(f.programatica.map((r) => r.ad_name))];
    const byCreative = creatives
      .map((name) => {
        const rows = f.programatica.filter((r) => r.ad_name === name);
        const s = agg(rows);
        return {
          name: name.replace(/SISTEMATIZAE[- ]?/i, "").replace(/SECULT[- ]?/i, "").trim(),
          fullName: name,
          image: rows[0]?.ad_image_url ?? "",
          impressions: s.impressions,
          clicks: s.clicks,
          investimento: s.investimento,
          ctr: ctr(s.clicks, s.impressions),
        };
      })
      .sort((a, b) => b.impressions - a.impressions);

    return { t, daily, byGroup, byCreative };
  }, [f]);

  if (loading && !data) return <Loading />;
  if (error && !data) return <LoadError msg={error} onRetry={reload} />;
  if (f.programatica.length === 0)
    return <EmptyState msg="Sem dados de Programática para o período selecionado." />;

  const { t } = v;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Kpi label="Investimento" value={brl(t.investimento)} accent={C.ochre} sub={`CPM ${brl(cpm(t.investimento, t.impressions), 2)}`} />
        <Kpi label="Impressões" value={compact(t.impressions)} accent={C.forest} sub="display de alcance" />
        <Kpi label="Cliques" value={int(t.clicks)} accent={C.terracotta} sub={`CTR ${pct(ctr(t.clicks, t.impressions))}`} />
        <Kpi label="CPC" value={brl(cpc(t.investimento, t.clicks), 2)} accent={C.teal} sub="custo por clique" />
      </div>

      {/* Daily */}
      <Card>
        <SectionTitle
          title="Entrega diária"
          hint="Impressões (barras) e cliques (linha) por dia"
          right={
            <ChartLegend
              series={[
                { name: "Impressões", color: C.ochre },
                { name: "Cliques", color: C.terracotta },
              ]}
            />
          }
        />
        <TrendChart
          data={v.daily}
          xKey="label"
          height={300}
          rightLabel="cliques"
          series={[
            { key: "impressions", name: "Impressões", color: C.ochre, type: "bar", axis: "left", fmt: compact },
            { key: "clicks", name: "Cliques", color: C.terracotta, type: "line", axis: "right", fmt: int },
          ]}
        />
      </Card>

      {/* Ad group comparison */}
      <div className="grid gap-6 xl:grid-cols-[1fr_1.3fr]">
        <Card>
          <SectionTitle title="Investimento por grupo" hint="Segmentado vs. Open" />
          <DonutChart
            data={v.byGroup.map((g) => ({ name: g.label, value: g.investimento, color: g.color }))}
            centerValue={brl(t.investimento)}
            centerLabel="total"
            fmt={(x) => brl(x)}
          />
          <div className="mt-4">
            <ChartLegend series={v.byGroup.map((g) => ({ name: g.label, color: g.color }))} />
          </div>
        </Card>

        <Card>
          <SectionTitle title="Eficiência por grupo de anúncio" hint="Comparativo de entrega e custo" />
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wide text-ink-soft">
                  <th className="pb-2 font-semibold">Grupo</th>
                  <th className="pb-2 text-right font-semibold">Impressões</th>
                  <th className="pb-2 text-right font-semibold">Cliques</th>
                  <th className="pb-2 text-right font-semibold">CTR</th>
                  <th className="pb-2 text-right font-semibold">CPM</th>
                  <th className="pb-2 text-right font-semibold">CPC</th>
                </tr>
              </thead>
              <tbody>
                {v.byGroup.map((g) => (
                  <tr key={g.group} className="border-t border-line/70">
                    <td className="py-2.5">
                      <span className="flex items-center gap-2 font-medium text-ink">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ background: g.color }} />
                        {g.label}
                      </span>
                    </td>
                    <td className="py-2.5 text-right font-mono">{compact(g.impressions)}</td>
                    <td className="py-2.5 text-right font-mono">{int(g.clicks)}</td>
                    <td className="py-2.5 text-right font-mono">{pct(g.ctr)}</td>
                    <td className="py-2.5 text-right font-mono">{brl(g.cpm, 2)}</td>
                    <td className="py-2.5 text-right font-mono">{brl(g.cpc, 2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-5">
            <p className="mb-2 text-xs font-semibold text-ink-soft">CTR por grupo</p>
            <HBars
              data={v.byGroup.map((g) => ({ name: g.label, value: g.ctr * 100, color: g.color }))}
              fmt={(x) => `${x.toFixed(3)}%`}
            />
          </div>
        </Card>
      </div>

      {/* Creatives */}
      <Card>
        <SectionTitle
          title="Desempenho por formato de banner"
          hint="Peças veiculadas no Google DV360, ordenadas por impressões"
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {v.byCreative.map((c) => (
            <div key={c.fullName} className="rounded-2xl border border-line bg-paper-soft p-3">
              <div className="grid h-28 place-items-center overflow-hidden rounded-xl bg-cream-deep">
                <SafeImg src={c.image} alt={c.name} className="max-h-full max-w-full object-contain" />
              </div>
              <div className="mt-2.5 truncate text-xs font-semibold text-ink" title={c.fullName}>
                {c.name || c.fullName}
              </div>
              <div className="mt-2 grid grid-cols-2 gap-1.5 text-[11px]">
                <Mini label="Impr." value={compact(c.impressions)} />
                <Mini label="CTR" value={pct(c.ctr)} />
                <Mini label="Cliques" value={int(c.clicks)} />
                <Mini label="Invest." value={brl(c.investimento)} />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-paper px-2 py-1.5">
      <div className="text-[9px] uppercase tracking-wide text-ink-soft">{label}</div>
      <div className="font-mono font-bold text-ink">{value}</div>
    </div>
  );
}
