export const C = {
  cream: "#f3ead7",
  paper: "#fbf6ec",
  ink: "#2a2017",
  inkSoft: "#6b5d4b",
  line: "#e4d8bf",
  terracotta: "#c8472a",
  terracottaDeep: "#a5371e",
  terracottaSoft: "#e98b6a",
  forest: "#1e4636",
  forestMid: "#2f6b4e",
  forestSoft: "#6fa787",
  ochre: "#dda02e",
  ochreSoft: "#ecc879",
  clay: "#d98e55",
  teal: "#2b7a78",
};

/** Cores por estratégia/plataforma, consistentes em todo o painel. */
export const STRAT_COLOR: Record<string, string> = {
  "Alcance Estático": C.terracotta,
  "Alcance Vídeo": C.forestMid,
  "CTV - FastChannels": C.teal,
  Alcance: C.ochre,
};

export const PLATFORM_COLOR: Record<string, string> = {
  meta: C.terracotta,
  ctv: C.teal,
  programatica: C.ochre,
};

export const colorFor = (strat: string) => STRAT_COLOR[strat] ?? C.clay;
