// Tipos dos dados de exemplo.
// Hoje os dados vêm de arquivos .ts em src/data; depois virão do banco.
// As páginas só conversam com src/lib/data.ts, então a troca fica num lugar só.

export type Continent =
  | "america-do-sul"
  | "america-do-norte"
  | "europa"
  | "africa"
  | "asia"
  | "oceania";

/** Quanto do país já está integrado no BioPlanet. */
export type CountryStatus = "disponivel" | "em-preparacao" | "global";

export interface Country {
  /** Código ISO 3166-1 alfa-2 (ex.: "BR"). */
  code: string;
  /** Usado na URL: /pais/br */
  slug: string;
  name: string;
  continent: Continent;
  status: CountryStatus;
  /** Fontes nacionais já integradas (ids de src/data/sources.ts). */
  sourceIds: string[];
  /** Quem define a classificação nacional de biomas (ex.: "IBGE"). */
  biomeAuthority?: string;
  intro?: string;
}

/** Bioma da classificação global (WWF / RESOLVE Ecoregions, 14 biomas terrestres). */
export interface GlobalBiome {
  id: string;
  name: string;
  examples: string;
}

/** Bioma da classificação de um país (ex.: os 6 biomas do IBGE no Brasil). */
export interface NationalBiome {
  slug: string;
  countryCode: string;
  name: string;
  /** Parte do território do país, em %. */
  areaPct: number;
  description: string;
  globalBiomeId: string;
}

export type Kingdom = "fauna" | "flora";

/** Categorias de risco da IUCN, usadas também pelas listas nacionais. */
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
  /** Nome científico em minúsculas com hífen: /especie/panthera-onca */
  slug: string;
  scientificName: string;
  authorship?: string;
  commonName: string;
  otherNames?: string[];
  kingdom: Kingdom;
  /** Grupo popular (Mamífero, Ave, Árvore...) */
  group: string;
  taxonomy: Taxonomy;
  /** Países onde ocorre e, quando o país está integrado, em quais biomas nacionais. */
  occurrences: { countryCode: string; biomeSlugs: string[] }[];
  conservation: {
    global?: StatusCode;
    /** Status nas listas nacionais, por código de país. */
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
}
