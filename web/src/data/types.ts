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
  /** Só no detalhe de um país (getCountry). */
  stats?: SpeciesStats;
}

/** Contagens do banco do BioPlanet para os números das páginas de país e bioma. */
export interface SpeciesStats {
  /** Plantas e fungos. */
  plants: number;
  animals: number;
  /** Na lista vermelha nacional como CR, EN ou VU. */
  threatened: number;
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
  /** Só no detalhe de um bioma (getNationalBiome). */
  stats?: SpeciesStats;
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
  /** gbifRecords: registros de ocorrência no país, segundo o GBIF (quando a espécie está ligada). */
  occurrences: { countryCode: string; biomeSlugs: string[]; gbifRecords?: number }[];
  /** Ligação com o GBIF, quando o nome bateu exatamente. taxonKey serve para o mapa de densidade. */
  gbif?: { taxonKey: number; records: number; updatedAt: string };
  conservation: {
    global?: StatusCode;
    national: Partial<Record<string, StatusCode>>;
  };
  summary?: string;
  /** Na ficha vêm todas as fotos; nas listas, só a primeira. Vazio = sem foto. */
  photos?: Photo[];
}

/** Foto com o crédito que a licença exige. */
export interface Photo {
  url: string;
  thumbnailUrl: string;
  author: string;
  license: string;
  licenseUrl?: string;
  sourceUrl: string;
  source: string;
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
