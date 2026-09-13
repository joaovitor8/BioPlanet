import bruto from "./especies.json";
import { BIOMAS, buscarBioma } from "./biomas";
import { GRUPOS, buscarGrupo, ehGrupoId } from "./grupos";
import { buscarStatus, ehStatusId, STATUS } from "./status";
import { validarEspecies } from "./validar";
import type {
  Bioma,
  Especie,
  Filtros,
  Grupo,
  GrupoId,
  NivelTaxonomico,
  Status,
  StatusId,
} from "@/lib/types";

/**
 * Camada de dados da fase 1. Nenhum componente importa `especies.json`:
 * tudo passa por estas funções, que são o contrato que o Nest vai cumprir
 * depois (guia.md §8).
 */

const ESPECIES = bruto as Especie[];

// Ficha incompleta falha alto, e falha cedo: em dev, na primeira carga.
if (process.env.NODE_ENV !== "production") {
  const erros = validarEspecies(ESPECIES);
  if (erros.length) {
    throw new Error(["especies.json inválido:", ...erros.map((e) => `  - ${e}`)].join("\n"));
  }
}

/** "Onça-pintada" e "onca pintada" têm de casar com a mesma ficha. */
function normalizar(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // tira acento, mantém a letra
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

const INDICE = new Map(ESPECIES.map((e) => [e.slug, e]));

const TEXTO_BUSCA = new Map(
  ESPECIES.map((e) => [
    e.slug,
    normalizar([e.nomeCientifico, ...e.nomesPopulares, e.taxonomia.familia, e.taxonomia.genero].join(" ")),
  ]),
);

export const ORDEM_STATUS: StatusId[] = STATUS.map((s) => s.id);

export function listarEspecies(): Especie[] {
  return ESPECIES;
}

export function contarEspecies(): number {
  return ESPECIES.length;
}

export function buscarEspecie(slug: string): Especie | undefined {
  return INDICE.get(slug);
}

export function listarSlugs(): string[] {
  return ESPECIES.map((e) => e.slug);
}

/** Ordena por gravidade de status e, dentro dela, por nome científico. */
function ordenar(lista: Especie[]): Especie[] {
  return [...lista].sort((a, b) => {
    const d = ORDEM_STATUS.indexOf(a.status) - ORDEM_STATUS.indexOf(b.status);
    return d !== 0 ? d : a.nomeCientifico.localeCompare(b.nomeCientifico, "pt-BR");
  });
}

export function filtrarEspecies(filtros: Filtros): Especie[] {
  const q = normalizar(filtros.q);
  const termos = q ? q.split(" ") : [];

  return ordenar(
    ESPECIES.filter((e) => {
      if (filtros.grupo.length && !filtros.grupo.includes(e.grupo)) return false;
      if (filtros.status.length && !filtros.status.includes(e.status)) return false;
      if (filtros.bioma.length && !filtros.bioma.some((b) => e.biomas.includes(b))) return false;
      if (termos.length) {
        const alvo = TEXTO_BUSCA.get(e.slug) ?? "";
        if (!termos.every((t) => alvo.includes(t))) return false;
      }
      return true;
    }),
  );
}

/** Lê e valida os filtros da URL — valor desconhecido é descartado, não quebra a página. */
export function lerFiltros(params: Record<string, string | string[] | undefined>): Filtros {
  const lista = (chave: string): string[] => {
    const v = params[chave];
    if (!v) return [];
    return (Array.isArray(v) ? v : v.split(",")).map((s) => s.trim()).filter(Boolean);
  };

  const q = params.q;
  return {
    q: (Array.isArray(q) ? q[0] : q)?.slice(0, 80) ?? "",
    grupo: lista("grupo").filter(ehGrupoId),
    bioma: lista("bioma").filter((b) => BIOMAS.some((x) => x.slug === b)),
    status: lista("status").filter(ehStatusId),
  };
}

export function filtrosVazios(f: Filtros): boolean {
  return !f.q && !f.grupo.length && !f.bioma.length && !f.status.length;
}

export function contarFiltrosAtivos(f: Filtros): number {
  return (f.q ? 1 : 0) + f.grupo.length + f.bioma.length + f.status.length;
}

/** Converte filtros de volta para query string, omitindo o que está vazio. */
export function filtrosParaQuery(f: Filtros): string {
  const p = new URLSearchParams();
  if (f.q) p.set("q", f.q);
  if (f.grupo.length) p.set("grupo", f.grupo.join(","));
  if (f.bioma.length) p.set("bioma", f.bioma.join(","));
  if (f.status.length) p.set("status", f.status.join(","));
  const s = p.toString();
  return s ? `?${s}` : "";
}

/**
 * Qual filtro está segurando o resultado. Para cada valor ativo, mede quantas
 * fichas voltariam se ele saísse; o que libera mais é o mais restritivo.
 * É o que `EstadoVazio` oferece remover (§8).
 */
export type FiltroCulpado = {
  rotulo: string;
  /** Os filtros já sem o valor culpado, prontos para virar href. */
  filtros: Filtros;
  liberaria: number;
};

export function filtroMaisRestritivo(f: Filtros): FiltroCulpado | null {
  const candidatos: FiltroCulpado[] = [];

  const avaliar = (rotulo: string, filtros: Filtros) => {
    candidatos.push({ rotulo, filtros, liberaria: filtrarEspecies(filtros).length });
  };

  if (f.q) avaliar(`busca “${f.q}”`, { ...f, q: "" });
  for (const g of f.grupo) {
    avaliar(`grupo ${buscarGrupo(g)?.nome ?? g}`, { ...f, grupo: f.grupo.filter((x) => x !== g) });
  }
  for (const b of f.bioma) {
    avaliar(`bioma ${buscarBioma(b)?.nome ?? b}`, { ...f, bioma: f.bioma.filter((x) => x !== b) });
  }
  for (const s of f.status) {
    avaliar(`status ${buscarStatus(s)?.nome ?? s}`, { ...f, status: f.status.filter((x) => x !== s) });
  }

  if (!candidatos.length) return null;

  const melhor = candidatos.reduce((a, c) => (c.liberaria > a.liberaria ? c : a));

  // Quando nem o melhor candidato devolve ficha, a combinação inteira é um beco
  // sem saída: aí não há filtro culpado, e o caminho é limpar tudo.
  return melhor.liberaria > 0 ? melhor : null;
}

/**
 * Contagem facetada: quantas fichas cada opção devolveria, já considerando os
 * outros filtros ativos. Para medir a própria dimensão, ela é zerada primeiro —
 * senão "Mamíferos 8" apareceria ao lado de "2 de 35 fichas", que é mentira.
 *
 * Opção com 0 fica desabilitada: é um caminho que não leva a lugar nenhum.
 */
export type Facetas = {
  grupo: Record<string, number>;
  bioma: Record<string, number>;
  status: Record<string, number>;
};

export function contarFacetas(f: Filtros): Facetas {
  const semGrupo = filtrarEspecies({ ...f, grupo: [] });
  const semBioma = filtrarEspecies({ ...f, bioma: [] });
  const semStatus = filtrarEspecies({ ...f, status: [] });

  return {
    grupo: Object.fromEntries(
      GRUPOS.map((g) => [g.id, semGrupo.filter((e) => e.grupo === g.id).length]),
    ),
    bioma: Object.fromEntries(
      BIOMAS.map((b) => [b.slug, semBioma.filter((e) => e.biomas.includes(b.slug)).length]),
    ),
    status: Object.fromEntries(
      STATUS.map((s) => [s.id, semStatus.filter((e) => e.status === s.id).length]),
    ),
  };
}

// --- Agregações por entidade ------------------------------------------------

export type GrupoComContagem = Grupo & { total: number };
export type BiomaComContagem = Bioma & { total: number };
export type StatusComContagem = Status & { total: number };

export function listarGruposComContagem(): GrupoComContagem[] {
  return GRUPOS.map((g) => ({ ...g, total: ESPECIES.filter((e) => e.grupo === g.id).length }));
}

export function listarBiomasComContagem(): BiomaComContagem[] {
  return BIOMAS.map((b) => ({ ...b, total: ESPECIES.filter((e) => e.biomas.includes(b.slug)).length }));
}

export function listarStatusComContagem(): StatusComContagem[] {
  return STATUS.map((s) => ({ ...s, total: ESPECIES.filter((e) => e.status === s.id).length }));
}

export function especiesDoGrupo(id: GrupoId): Especie[] {
  return ordenar(ESPECIES.filter((e) => e.grupo === id));
}

export function especiesDoBioma(slug: string): Especie[] {
  return ordenar(ESPECIES.filter((e) => e.biomas.includes(slug)));
}

export function biomasDaEspecie(e: Especie): Bioma[] {
  return e.biomas.map(buscarBioma).filter((b): b is Bioma => Boolean(b));
}

// --- Taxonomia --------------------------------------------------------------

export const NIVEIS: NivelTaxonomico[] = ["reino", "filo", "classe", "ordem", "familia", "genero"];

export const ROTULO_NIVEL: Record<NivelTaxonomico, string> = {
  reino: "Reino",
  filo: "Filo",
  classe: "Classe",
  ordem: "Ordem",
  familia: "Família",
  genero: "Gênero",
};

export function ehNivel(valor: string): valor is NivelTaxonomico {
  return (NIVEIS as string[]).includes(valor);
}

/** O táxon vira slug para poder virar URL: `Accipitridae` → `accipitridae`. */
export function slugTaxon(valor: string): string {
  return normalizar(valor).replace(/\s+/g, "-");
}

export function especiesDoTaxon(nivel: NivelTaxonomico, slug: string): Especie[] {
  return ordenar(ESPECIES.filter((e) => slugTaxon(e.taxonomia[nivel]) === slug));
}

/** Nome original do táxon a partir do slug — usado no título da página. */
export function nomeDoTaxon(nivel: NivelTaxonomico, slug: string): string | undefined {
  return ESPECIES.find((e) => slugTaxon(e.taxonomia[nivel]) === slug)?.taxonomia[nivel];
}

export function listarTaxons(): { nivel: NivelTaxonomico; slug: string }[] {
  const vistos = new Set<string>();
  const saida: { nivel: NivelTaxonomico; slug: string }[] = [];
  for (const e of ESPECIES) {
    for (const nivel of NIVEIS) {
      const slug = slugTaxon(e.taxonomia[nivel]);
      const chave = `${nivel}/${slug}`;
      if (!vistos.has(chave)) {
        vistos.add(chave);
        saida.push({ nivel, slug });
      }
    }
  }
  return saida;
}

// --- Destaque ---------------------------------------------------------------

/**
 * Espécie em destaque na home. Rotaciona por dia para que a capa mude sem
 * depender de nada dinâmico — o mesmo dia devolve sempre a mesma ficha.
 */
export function especieDestaque(data = new Date()): Especie {
  const dia = Math.floor(data.getTime() / 86_400_000);
  const candidatas = ordenar(ESPECIES.filter((e) => e.status !== "NE" && e.status !== "DD"));
  return candidatas[dia % candidatas.length];
}

export { BIOMAS, buscarBioma };
export { CLASSIFICACOES, biomasPorClassificacao } from "./biomas";
export { GRUPOS, buscarGrupo };
export { STATUS, buscarStatus };
export { ESCALA } from "./status";
export { validarEspecies } from "./validar";
