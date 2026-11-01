// Formato dos dados do site: país, bioma, espécie, fonte e status.
// As respostas da API seguem este mesmo formato.

export type Continent =
  | "america-do-sul"
  | "america-do-norte"
  | "europa"
  | "africa"
  | "asia"
  | "oceania";

export type CountryStatus = "disponivel" | "em-preparacao" | "global";

export interface Country {
  code: string;
  slug: string;
  name: string;
  continent: Continent;
  status: CountryStatus;
  sourceIds: string[];
  biomeAuthority?: string;
  intro?: string;
}

export interface GlobalBiome {
  id: string;
  name: string;
  examples: string;
}

export interface NationalBiome {
  slug: string;
  countryCode: string;
  name: string;
  areaPct: number;
  description: string;
  globalBiomeId: string;
}

export type Kingdom = "fauna" | "flora";

export type StatusCode = "EX" | "EW" | "CR" | "EN" | "VU" | "NT" | "LC" | "DD";

export interface Taxonomy {
  reino: string;
  filo: string;
  classe: string;
  ordem: string;
  familia: string;
  genero: string;
}

export interface Species {
  slug: string;
  scientificName: string;
  authorship?: string;
  commonName: string;
  otherNames?: string[];
  kingdom: Kingdom;
  group: string;
  taxonomy: Taxonomy;
  occurrences: { countryCode: string; biomeSlugs: string[] }[];
  conservation: {
    global?: StatusCode;
    national: Partial<Record<string, StatusCode>>;
  };
  summary?: string;
}

export interface Source {
  id: string;
  name: string;
  what: string;
  url: string;
  scope: "global" | "nacional";
  /** Crédito exigido pela licença. Só vem nas fontes que já foram importadas. */
  credit?: {
    citation: string;
    license: string;
    licenseUrl?: string;
    version?: string;
  };
}
