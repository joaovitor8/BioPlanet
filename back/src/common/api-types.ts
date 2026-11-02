// Formato das respostas JSON da API.
// Espelha web/src/data/types.ts: assim, no front, basta trocar as funções de
// src/lib/data.ts por fetch, sem mexer nas páginas. Mudou lá? Mude aqui também.
//
// Diferenças em relação ao front, porque o banco permite valores que os dados de exemplo não têm:
// - Kingdom aceita "funga" (o banco já está pronto para os fungos).
// - NationalBiome.areaPct pode ser null (o banco aceita bioma sem área).
// - Textos obrigatórios no front que são opcionais no banco viram "" quando vazios.

export type Continent =
  | 'america-do-sul'
  | 'america-do-norte'
  | 'europa'
  | 'africa'
  | 'asia'
  | 'oceania';

export type CountryStatus = 'disponivel' | 'em-preparacao' | 'global';

export interface Country {
  code: string;
  slug: string;
  name: string;
  continent: Continent;
  status: CountryStatus;
  /** Fontes nacionais já integradas (ids de Source). */
  sourceIds: string[];
  biomeAuthority?: string;
  intro?: string;
}

export interface GlobalBiome {
  /** Número do bioma na classificação (1 a 14), como texto. */
  id: string;
  name: string;
  examples: string;
}

export interface NationalBiome {
  slug: string;
  countryCode: string;
  name: string;
  areaPct: number | null;
  description: string;
  globalBiomeId: string;
}

export type Kingdom = 'fauna' | 'flora' | 'funga';

export type StatusCode = 'EX' | 'EW' | 'CR' | 'EN' | 'VU' | 'NT' | 'LC' | 'DD';

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
  occurrences: {
    countryCode: string;
    biomeSlugs: string[];
    /** Só na API: de onde veio o status nacional deste país (id de Source). */
    statusSourceId?: string;
    /** Só na API: registros de ocorrência neste país, segundo o GBIF. */
    gbifRecords?: number;
  }[];
  /** Só na API: ligação com o GBIF, quando o nome bateu exatamente (npm run import:gbif). */
  gbif?: {
    /** Chave da espécie no GBIF; serve para o mapa de densidade. */
    taxonKey: number;
    /** Registros de ocorrência no mundo todo. */
    records: number;
    /** Quando os números foram buscados (ISO 8601). */
    updatedAt: string;
  };
  conservation: {
    global?: StatusCode;
    national: Partial<Record<string, StatusCode>>;
  };
  summary?: string;
  /**
   * Só na API. Na ficha (GET /species/:slug) vêm todas, na ordem certa;
   * nas listas vem só a primeira. Lista vazia = espécie sem foto.
   */
  photos: Photo[];
}

/** Foto com o crédito que a licença exige. */
export interface Photo {
  /** Foto grande, para a ficha. */
  url: string;
  /** Versão menor, para cartões e miniaturas. */
  thumbnailUrl: string;
  author: string;
  /** Ex.: "CC BY-NC". */
  license: string;
  licenseUrl?: string;
  /** Página da foto na fonte. */
  sourceUrl: string;
  /** Ex.: "iNaturalist". */
  source: string;
}

export interface Source {
  id: string;
  name: string;
  what: string;
  url: string;
  scope: 'global' | 'nacional';
  /** Crédito exigido pela licença. Só aparece nas fontes que já foram importadas. */
  credit?: {
    /** Como citar, como o publicador pede. */
    citation: string;
    /** Ex.: "CC-BY 4.0". */
    license: string;
    licenseUrl?: string;
    /** Versão do conjunto de dados importada, ex.: "393.433". */
    version?: string;
  };
}

// Respostas que juntam mais de um tipo.

export interface NationalBiomeDetail extends NationalBiome {
  globalBiome: GlobalBiome;
}

export interface CountryDetail extends Country {
  biomes: NationalBiomeDetail[];
  sources: Source[];
  stats: SpeciesStats;
}

/** Só na API: contagens do nosso banco, para os números das páginas de país e bioma. */
export interface SpeciesStats {
  /** Plantas e fungos (reinos flora e funga). */
  plants: number;
  animals: number;
  /** Na lista vermelha nacional como CR, EN ou VU. */
  threatened: number;
}

/** GET /countries/:slug/biomes/:biome */
export interface NationalBiomePage extends NationalBiomeDetail {
  stats: SpeciesStats;
}

export interface RelatedSpecies {
  species: Species;
  reason: string;
}

export interface SearchResult {
  species: Species[];
  countries: Country[];
}
