import type { Status, StatusId } from "@/lib/types";

/**
 * Categorias da IUCN Red List (guia.md §3). As cores **não são escolha nossa**:
 * são as oficiais da escala, e trocá-las quebra o reconhecimento de quem já a
 * conhece. Cada par cor/corTexto foi verificado em AA (mínimo 4.73:1, em EN).
 *
 * Nunca comunique status só por cor: a sigla e o nome por extenso andam sempre
 * junto com a tarja.
 */
export const STATUS: Status[] = [
  {
    id: "EX",
    sigla: "EX",
    nome: "Extinta",
    cor: "#000000",
    corTexto: "#FFFFFF",
    descricao: "Não resta dúvida razoável de que o último indivíduo morreu.",
    avaliada: true,
  },
  {
    id: "EW",
    sigla: "EW",
    nome: "Extinta na natureza",
    cor: "#542344",
    corTexto: "#FFFFFF",
    descricao: "Sobrevive apenas em cultivo, cativeiro ou população reintroduzida.",
    avaliada: true,
  },
  {
    id: "CR",
    sigla: "CR",
    nome: "Criticamente em perigo",
    cor: "#D81E05",
    corTexto: "#FFFFFF",
    descricao: "Risco extremamente alto de extinção na natureza.",
    avaliada: true,
  },
  {
    id: "EN",
    sigla: "EN",
    nome: "Em perigo",
    cor: "#FC7F3F",
    corTexto: "#243B31",
    descricao: "Risco muito alto de extinção na natureza.",
    avaliada: true,
  },
  {
    id: "VU",
    sigla: "VU",
    nome: "Vulnerável",
    cor: "#F9E814",
    corTexto: "#243B31",
    descricao: "Risco alto de extinção na natureza.",
    avaliada: true,
  },
  {
    id: "NT",
    sigla: "NT",
    nome: "Quase ameaçada",
    cor: "#CCE226",
    corTexto: "#243B31",
    descricao: "Perto de se qualificar para uma categoria de ameaça.",
    avaliada: true,
  },
  {
    id: "LC",
    sigla: "LC",
    nome: "Pouco preocupante",
    cor: "#60C659",
    corTexto: "#243B31",
    descricao: "Avaliada e não se enquadra em nenhuma categoria de ameaça.",
    avaliada: true,
  },
  {
    id: "DD",
    sigla: "DD",
    nome: "Dados insuficientes",
    cor: "#D1D1C6",
    corTexto: "#243B31",
    descricao: "Não há informação adequada para avaliar o risco de extinção.",
    avaliada: false,
  },
  {
    id: "NE",
    sigla: "NE",
    nome: "Não avaliada",
    cor: "#F0F0EA",
    corTexto: "#5C6B63",
    descricao: "Ainda não passou por avaliação contra os critérios da Red List.",
    avaliada: false,
  },
];

/** A escala da régua vai de EX a LC. DD e NE ficam fora dela por definição (§7). */
export const ESCALA: Status[] = STATUS.filter((s) => s.avaliada);

const PORID = new Map(STATUS.map((s) => [s.id, s]));

export function buscarStatus(id: StatusId | string): Status | undefined {
  return PORID.get(id as StatusId);
}

export function ehStatusId(valor: string): valor is StatusId {
  return PORID.has(valor as StatusId);
}
