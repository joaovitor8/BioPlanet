import type { Continent, Country } from "./types";

export const continents: { id: Continent; name: string }[] = [
  { id: "america-do-sul", name: "América do Sul" },
  { id: "america-do-norte", name: "América do Norte" },
  { id: "europa", name: "Europa" },
  { id: "africa", name: "África" },
  { id: "asia", name: "Ásia" },
  { id: "oceania", name: "Oceania" },
];

export const countries: Country[] = [
  {
    code: "BR",
    slug: "br",
    name: "Brasil",
    continent: "america-do-sul",
    status: "disponivel",
    sourceIds: ["flora-brasil", "fauna-brasil", "salve"],
    biomeAuthority: "IBGE",
    intro:
      "Seis biomas, da maior floresta tropical do mundo aos campos do Pampa. Explore as espécies de cada um.",
  },
  { code: "AR", slug: "ar", name: "Argentina", continent: "america-do-sul", status: "em-preparacao", sourceIds: [] },
  { code: "CO", slug: "co", name: "Colômbia", continent: "america-do-sul", status: "global", sourceIds: [] },
  { code: "PE", slug: "pe", name: "Peru", continent: "america-do-sul", status: "global", sourceIds: [] },
  { code: "MX", slug: "mx", name: "México", continent: "america-do-norte", status: "global", sourceIds: [] },
  { code: "US", slug: "us", name: "Estados Unidos", continent: "america-do-norte", status: "global", sourceIds: [] },
  { code: "PT", slug: "pt", name: "Portugal", continent: "europa", status: "em-preparacao", sourceIds: [] },
  { code: "ES", slug: "es", name: "Espanha", continent: "europa", status: "global", sourceIds: [] },
  { code: "ZA", slug: "za", name: "África do Sul", continent: "africa", status: "global", sourceIds: [] },
  { code: "KE", slug: "ke", name: "Quênia", continent: "africa", status: "global", sourceIds: [] },
  { code: "IN", slug: "in", name: "Índia", continent: "asia", status: "global", sourceIds: [] },
  { code: "ID", slug: "id", name: "Indonésia", continent: "asia", status: "global", sourceIds: [] },
  { code: "AU", slug: "au", name: "Austrália", continent: "oceania", status: "global", sourceIds: [] },
  { code: "NZ", slug: "nz", name: "Nova Zelândia", continent: "oceania", status: "global", sourceIds: [] },
];
