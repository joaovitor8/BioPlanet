import type { GlobalBiome, NationalBiome } from "./types";

// Os 14 biomas terrestres da classificação WWF / RESOLVE Ecoregions.
export const globalBiomes: GlobalBiome[] = [
  { id: "1", name: "Florestas tropicais úmidas", examples: "Amazônia, bacia do Congo, Bornéu" },
  { id: "2", name: "Florestas tropicais secas", examples: "Florestas secas do México e da Índia" },
  { id: "3", name: "Florestas tropicais de coníferas", examples: "Pinhais do México e da América Central" },
  { id: "4", name: "Florestas temperadas mistas", examples: "Europa central, leste da América do Norte" },
  { id: "5", name: "Florestas temperadas de coníferas", examples: "Costa do Pacífico da América do Norte" },
  { id: "6", name: "Florestas boreais (taiga)", examples: "Sibéria, Canadá, Escandinávia" },
  { id: "7", name: "Savanas e campos tropicais", examples: "Cerrado, Serengeti" },
  { id: "8", name: "Campos temperados", examples: "Pampa, pradarias norte-americanas, estepes" },
  { id: "9", name: "Campos alagáveis", examples: "Pantanal, delta do Okavango" },
  { id: "10", name: "Campos de altitude", examples: "Páramos andinos, planalto tibetano" },
  { id: "11", name: "Tundra", examples: "Ártico, norte do Alasca" },
  { id: "12", name: "Vegetação mediterrânea", examples: "Mediterrâneo, Califórnia, Cabo" },
  { id: "13", name: "Desertos e matagais secos", examples: "Caatinga, Saara, Atacama" },
  { id: "14", name: "Manguezais", examples: "Costa brasileira, Sundarbans" },
];

// Classificação nacional do Brasil (IBGE, 2019). Área = % do território.
export const nationalBiomes: NationalBiome[] = [
  {
    slug: "amazonia",
    countryCode: "BR",
    name: "Amazônia",
    areaPct: 49.5,
    description: "A maior floresta tropical do mundo, cortada por rios gigantes.",
    globalBiomeId: "1",
  },
  {
    slug: "cerrado",
    countryCode: "BR",
    name: "Cerrado",
    areaPct: 23.3,
    description:
      "Savana tropical do Planalto Central, com campos, veredas e matas de galeria. Abriga nascentes de grandes bacias hidrográficas do país.",
    globalBiomeId: "7",
  },
  {
    slug: "mata-atlantica",
    countryCode: "BR",
    name: "Mata Atlântica",
    areaPct: 13.0,
    description: "Floresta da costa, hoje muito fragmentada e cheia de espécies que só existem nela.",
    globalBiomeId: "1",
  },
  {
    slug: "caatinga",
    countryCode: "BR",
    name: "Caatinga",
    areaPct: 10.1,
    description: "Floresta seca do semiárido, o único bioma exclusivamente brasileiro.",
    globalBiomeId: "13",
  },
  {
    slug: "pampa",
    countryCode: "BR",
    name: "Pampa",
    areaPct: 2.3,
    description: "Campos do extremo sul, com gramíneas e banhados.",
    globalBiomeId: "8",
  },
  {
    slug: "pantanal",
    countryCode: "BR",
    name: "Pantanal",
    areaPct: 1.8,
    description: "Planície que alaga todo ano e concentra fauna fácil de ver.",
    globalBiomeId: "9",
  },
];
