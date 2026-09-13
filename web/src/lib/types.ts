/** Modelo de dados do catálogo — fase 1, dados locais (guia.md §1). */

export type GrupoId =
  | "mamiferos"
  | "aves"
  | "repteis"
  | "anfibios"
  | "peixes"
  | "artropodes"
  | "plantas"
  | "fungos";

/** Categorias da IUCN Red List, da mais grave para a menos grave. */
export type StatusId = "EX" | "EW" | "CR" | "EN" | "VU" | "NT" | "LC" | "DD" | "NE";

export type ClassificacaoBioma = "terrestre" | "marinho" | "aguas-continentais";

export type Grupo = {
  id: GrupoId;
  nome: string;
  /** Cor de índice — usada em tarja e traço fino, nunca como fundo de área grande. */
  cor: string;
  descricao: string;
};

export type Status = {
  id: StatusId;
  sigla: StatusId;
  nome: string;
  cor: string;
  /** Cor do texto que vai *sobre* `cor`. Ambas validadas em AA. */
  corTexto: string;
  descricao: string;
  /** Categorias fora da escala EX→LC: a régua aparece inteira em cinza (§7). */
  avaliada: boolean;
};

export type Bioma = {
  slug: string;
  nome: string;
  classificacao: ClassificacaoBioma;
  descricao: string;
};

export type NivelTaxonomico = "reino" | "filo" | "classe" | "ordem" | "familia" | "genero";

export type Taxonomia = Record<NivelTaxonomico, string>;

/**
 * Crédito de imagem. Todos os campos são obrigatórios: `CreditoImagem` não
 * renderiza sem eles, e `validarEspecies()` recusa a ficha (§9).
 */
export type Imagem = {
  url: string;
  largura: number;
  altura: number;
  alt: string;
  autor: string;
  licenca: string;
  licencaUrl: string | null;
  /** Página da fonte — Wikimedia Commons ou iNaturalist. */
  fonteUrl: string;
};

export type Fonte = {
  titulo: string;
  url: string;
};

export type Especie = {
  /** Nome científico em kebab-case: `panthera-onca`. Decisão travada (§11). */
  slug: string;
  nomeCientifico: string;
  /** Autoria e ano do táxon, sem itálico: "Linnaeus, 1758". */
  autoria: string;
  /** Pode ser vazio — há espécie sem nome popular, e há espécie com três. */
  nomesPopulares: string[];
  grupo: GrupoId;
  status: StatusId;
  biomas: string[];
  taxonomia: Taxonomia;
  imagem: Imagem;
  /** Olho da ficha, uma frase. */
  resumo: string;
  descricao: string;
  habitat: string;
  distribuicao: string;
  alimentacao: string;
  reproducao: string;
  ameacas: string;
  fontes: Fonte[];
};

export type Filtros = {
  q: string;
  grupo: GrupoId[];
  bioma: string[];
  status: StatusId[];
};
