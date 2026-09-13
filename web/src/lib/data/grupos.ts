import type { Grupo, GrupoId } from "@/lib/types";

/**
 * Cor de índice, como a margem colorida dos guias impressos (guia.md §3).
 * Dessaturadas de propósito: com oito cores na mesma tela, saturação alta vira
 * ruído. Use em faixas e traços finos — nunca como cor de texto (três delas
 * não alcançam 4.5:1 sobre `--papel`) nem como fundo de área grande.
 */
export const GRUPOS: Grupo[] = [
  {
    id: "mamiferos",
    nome: "Mamíferos",
    cor: "#8C5A3B",
    descricao: "Vertebrados de sangue quente, pelos e glândulas mamárias.",
  },
  {
    id: "aves",
    nome: "Aves",
    cor: "#2F6F8F",
    descricao: "Vertebrados de penas, bico córneo e ossos pneumáticos.",
  },
  {
    id: "repteis",
    nome: "Répteis",
    cor: "#6B7B2E",
    descricao: "Vertebrados de escamas queratinizadas e ectotermia.",
  },
  {
    id: "anfibios",
    nome: "Anfíbios",
    cor: "#3E8C7A",
    descricao: "Vertebrados de pele permeável, quase sempre com fase larval aquática.",
  },
  {
    id: "peixes",
    nome: "Peixes",
    cor: "#3A5EA8",
    descricao: "Vertebrados aquáticos de respiração branquial e nadadeiras.",
  },
  {
    id: "artropodes",
    nome: "Artrópodes",
    cor: "#9A6E1F",
    descricao: "Invertebrados de exoesqueleto quitinoso e apêndices articulados.",
  },
  {
    id: "plantas",
    nome: "Plantas",
    cor: "#2E7D4F",
    descricao: "Organismos pluricelulares fotossintetizantes de parede celulósica.",
  },
  {
    id: "fungos",
    nome: "Fungos",
    cor: "#7A4B6B",
    descricao: "Organismos heterotróficos de parede quitinosa e nutrição por absorção.",
  },
];

const PORID = new Map(GRUPOS.map((g) => [g.id, g]));

export function buscarGrupo(id: GrupoId | string): Grupo | undefined {
  return PORID.get(id as GrupoId);
}

export function ehGrupoId(valor: string): valor is GrupoId {
  return PORID.has(valor as GrupoId);
}
