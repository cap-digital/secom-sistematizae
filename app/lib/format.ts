export const brl = (v: number, digits = 0): string =>
  v.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });

export const int = (v: number): string =>
  Math.round(v).toLocaleString("pt-BR");

export const compact = (v: number): string => {
  if (Math.abs(v) >= 1_000_000)
    return (v / 1_000_000).toLocaleString("pt-BR", {
      maximumFractionDigits: 2,
    }) + "M";
  if (Math.abs(v) >= 1_000)
    return (v / 1_000).toLocaleString("pt-BR", { maximumFractionDigits: 1 }) + "k";
  return int(v);
};

export const pct = (v: number, digits = 2): string =>
  `${(v * 100).toLocaleString("pt-BR", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })}%`;

export const dec = (v: number, digits = 2): string =>
  v.toLocaleString("pt-BR", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });

/** "2026-06-18" -> "18/06" */
export const shortDate = (iso: string): string => {
  const [, m, d] = iso.split("-");
  return `${d}/${m}`;
};

export const fullDate = (iso: string): string => {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
};
