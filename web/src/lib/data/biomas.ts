import type { Bioma, ClassificacaoBioma } from "@/lib/types";

/**
 * Escopo geográfico: mundo (guia.md §11). Bioma não é uma lista fixa de oito
 * itens — é entidade com classificação própria, agrupada em três domínios.
 * A classificação segue de perto os major habitat types da WWF, reduzidos ao
 * que 30 fichas conseguem cobrir sem virar taxonomia paralela.
 */
export const BIOMAS: Bioma[] = [
  // --- Terrestre ---
  {
    slug: "floresta-tropical-umida",
    nome: "Floresta tropical úmida",
    classificacao: "terrestre",
    descricao:
      "Dossel fechado, chuva abundante o ano todo e a maior diversidade de espécies por hectare do planeta.",
  },
  {
    slug: "floresta-tropical-seca",
    nome: "Floresta tropical seca",
    classificacao: "terrestre",
    descricao:
      "Estação seca marcada, árvores que perdem a folha e uma flora adaptada a meses sem chuva.",
  },
  {
    slug: "savana",
    nome: "Savana e campo tropical",
    classificacao: "terrestre",
    descricao:
      "Estrato herbáceo contínuo com árvores esparsas, moldado por fogo e herbivoria.",
  },
  {
    slug: "floresta-temperada",
    nome: "Floresta temperada",
    classificacao: "terrestre",
    descricao:
      "Quatro estações definidas, folhagem decídua ou conífera e solos profundos.",
  },
  {
    slug: "floresta-boreal",
    nome: "Floresta boreal",
    classificacao: "terrestre",
    descricao:
      "Faixa de coníferas do hemisfério norte, invernos longos e solo ácido — a taiga.",
  },
  {
    slug: "campo-temperado",
    nome: "Campo temperado",
    classificacao: "terrestre",
    descricao:
      "Pradarias, estepes e pampas: gramíneas dominantes onde falta chuva para a floresta.",
  },
  {
    slug: "deserto",
    nome: "Deserto e matagal árido",
    classificacao: "terrestre",
    descricao:
      "Menos de 250 mm de chuva por ano e amplitude térmica diária extrema.",
  },
  {
    slug: "mediterraneo",
    nome: "Matagal mediterrâneo",
    classificacao: "terrestre",
    descricao:
      "Verão seco e quente, inverno ameno e chuvoso; arbustos esclerófilos e fogo recorrente.",
  },
  {
    slug: "tundra",
    nome: "Tundra",
    classificacao: "terrestre",
    descricao:
      "Permafrost, vegetação rasteira e uma estação de crescimento de poucas semanas.",
  },
  {
    slug: "montanha",
    nome: "Campo de altitude",
    classificacao: "terrestre",
    descricao:
      "Zonas acima do limite das árvores, com forte gradiente de temperatura por metro de altitude.",
  },
  {
    slug: "manguezal",
    nome: "Manguezal",
    classificacao: "terrestre",
    descricao:
      "Encontro de rio e mar: solo salino e anóxico, vegetação com raízes aéreas.",
  },

  // --- Marinho ---
  {
    slug: "recife-de-coral",
    nome: "Recife de coral",
    classificacao: "marinho",
    descricao:
      "Estrutura construída por corais em águas rasas e quentes; sustenta cerca de um quarto da vida marinha.",
  },
  {
    slug: "costa-marinha",
    nome: "Costa e plataforma continental",
    classificacao: "marinho",
    descricao:
      "Águas rasas sobre a plataforma, onde chega luz e nutriente vindo do continente.",
  },
  {
    slug: "oceano-aberto",
    nome: "Oceano aberto",
    classificacao: "marinho",
    descricao:
      "Zona pelágica longe da costa, sem fundo ao alcance — o maior habitat contínuo do planeta.",
  },
  {
    slug: "oceano-profundo",
    nome: "Oceano profundo",
    classificacao: "marinho",
    descricao: "Abaixo da zona fótica: escuridão permanente, alta pressão e frio estável.",
  },
  {
    slug: "mar-polar",
    nome: "Mar polar",
    classificacao: "marinho",
    descricao:
      "Águas geladas do Ártico e do Oceano Austral, com cobertura de gelo sazonal.",
  },

  // --- Águas continentais ---
  {
    slug: "rio-e-lago",
    nome: "Rio e lago",
    classificacao: "aguas-continentais",
    descricao:
      "Água doce corrente ou parada — menos de 1% da água do planeta e uma fração enorme de sua biodiversidade.",
  },
  {
    slug: "area-alagada",
    nome: "Área alagada",
    classificacao: "aguas-continentais",
    descricao:
      "Pântanos, brejos e planícies de inundação, onde o nível da água comanda o calendário biológico.",
  },
];

export const CLASSIFICACOES: { id: ClassificacaoBioma; nome: string }[] = [
  { id: "terrestre", nome: "Terrestre" },
  { id: "marinho", nome: "Marinho" },
  { id: "aguas-continentais", nome: "Águas continentais" },
];

const PORSLUG = new Map(BIOMAS.map((b) => [b.slug, b]));

export function buscarBioma(slug: string): Bioma | undefined {
  return PORSLUG.get(slug);
}

export function ehBiomaSlug(valor: string): boolean {
  return PORSLUG.has(valor);
}

export function biomasPorClassificacao(c: ClassificacaoBioma): Bioma[] {
  return BIOMAS.filter((b) => b.classificacao === c);
}
