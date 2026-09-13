import { BIOMAS } from "./biomas";
import { GRUPOS } from "./grupos";
import { STATUS } from "./status";
import type { Especie, NivelTaxonomico } from "@/lib/types";

const GRUPO_IDS = new Set(GRUPOS.map((g) => g.id as string));
const STATUS_IDS = new Set(STATUS.map((s) => s.id as string));
const BIOMA_SLUGS = new Set(BIOMAS.map((b) => b.slug));

const NIVEIS: NivelTaxonomico[] = ["reino", "filo", "classe", "ordem", "familia", "genero"];

const TEXTOS = [
  "autoria",
  "resumo",
  "descricao",
  "habitat",
  "distribuicao",
  "alimentacao",
  "reproducao",
  "ameacas",
] as const;

/**
 * Recusa qualquer ficha incompleta (guia.md §9).
 *
 * O crédito de imagem é o caso que mais importa: autor, licença e URL da fonte
 * são obrigatórios, e `CreditoImagem` já não renderiza sem eles. Travar isso
 * agora, com 35 fichas, é barato. Travar na fase 3, com 3 mil fichas
 * importadas, seria um mutirão.
 *
 * Devolve a lista de problemas; vazia quer dizer catálogo íntegro.
 */
export function validarEspecies(especies: Especie[]): string[] {
  const erros: string[] = [];
  const slugs = new Set<string>();

  for (const e of especies) {
    const onde = e.nomeCientifico || e.slug || "(ficha sem nome)";

    if (e.slug !== e.nomeCientifico?.toLowerCase().replace(/\s+/g, "-")) {
      erros.push(`${onde}: o slug tem de derivar do nome científico`);
    }
    if (slugs.has(e.slug)) erros.push(`${onde}: slug duplicado (${e.slug})`);
    slugs.add(e.slug);

    if (!GRUPO_IDS.has(e.grupo)) erros.push(`${onde}: grupo inválido "${e.grupo}"`);
    if (!STATUS_IDS.has(e.status)) erros.push(`${onde}: status inválido "${e.status}"`);

    if (!e.biomas?.length) erros.push(`${onde}: sem bioma`);
    for (const b of e.biomas ?? []) {
      if (!BIOMA_SLUGS.has(b)) erros.push(`${onde}: bioma inválido "${b}"`);
    }

    for (const n of NIVEIS) {
      if (!e.taxonomia?.[n]?.trim()) erros.push(`${onde}: taxonomia sem ${n}`);
    }
    if (e.taxonomia?.genero && !e.nomeCientifico.startsWith(e.taxonomia.genero)) {
      erros.push(`${onde}: gênero "${e.taxonomia.genero}" não bate com o nome científico`);
    }

    for (const campo of TEXTOS) {
      if (!e[campo]?.trim()) erros.push(`${onde}: campo "${campo}" vazio`);
    }

    if (!Array.isArray(e.nomesPopulares)) {
      erros.push(`${onde}: nomesPopulares tem de ser lista (vazia é válido)`);
    }
    if (!e.fontes?.length) erros.push(`${onde}: sem fontes`);

    // Crédito de imagem: obrigatório, nunca opcional.
    const img = e.imagem;
    if (!img) {
      erros.push(`${onde}: sem imagem`);
    } else {
      for (const campo of ["url", "alt", "autor", "licenca", "fonteUrl"] as const) {
        if (!img[campo]) erros.push(`${onde}: imagem sem ${campo} — crédito obrigatório (§9)`);
      }
      if (!img.largura || !img.altura) {
        erros.push(`${onde}: imagem sem largura/altura declaradas — next/image exige (§9)`);
      }
    }
  }

  return erros;
}
