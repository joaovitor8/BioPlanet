// Valores fixos usados pelas tabelas. Viram tipos ENUM no Postgres.

/** Quanto do país já está integrado no BioPlanet. */
export enum StatusPais {
  Disponivel = 'disponivel',
  EmPreparacao = 'em-preparacao',
  Global = 'global',
}

/** Reino popular usado no site. "funga" já fica pronto para os fungos da Flora e Funga do Brasil. */
export enum Reino {
  Fauna = 'fauna',
  Flora = 'flora',
  Funga = 'funga',
}

/** Categorias de risco da IUCN, usadas também pelas listas nacionais. */
export enum StatusConservacao {
  EX = 'EX', // Extinta
  EW = 'EW', // Extinta na natureza
  CR = 'CR', // Criticamente em perigo
  EN = 'EN', // Em perigo
  VU = 'VU', // Vulnerável
  NT = 'NT', // Quase ameaçada
  LC = 'LC', // Menos preocupante
  DD = 'DD', // Dados insuficientes
}

export enum EscopoFonte {
  Global = 'global',
  Nacional = 'nacional',
}
