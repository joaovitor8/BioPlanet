// Camada de acesso aos dados. As páginas só usam estas funções.
// Hoje elas leem os arquivos de exemplo em src/data; quando o banco existir,
// basta trocar o corpo delas por consultas, sem mexer nas páginas.
// Por isso já são async, como uma consulta ao banco seria.

import { globalBiomes, nationalBiomes } from "@/data/biomes";
import { continents, countries } from "@/data/countries";
import { sources } from "@/data/sources";
import { featuredSlugs, species } from "@/data/species";
import type { Species } from "@/data/types";

export async function getCountries() {
  return countries;
}

export async function getContinents() {
  return continents;
}

export async function getCountry(slug: string) {
  return countries.find((c) => c.slug === slug);
}

export async function getCountryByCode(code: string) {
  return countries.find((c) => c.code === code);
}

export async function getGlobalBiomes() {
  return globalBiomes;
}

export async function getGlobalBiome(id: string) {
  return globalBiomes.find((b) => b.id === id);
}

export async function getNationalBiomes(countryCode: string) {
  return nationalBiomes.filter((b) => b.countryCode === countryCode);
}

export async function getNationalBiome(countryCode: string, slug: string) {
  return nationalBiomes.find((b) => b.countryCode === countryCode && b.slug === slug);
}

/** Ids dos biomas globais que aparecem em algum bioma nacional do país. */
export async function getGlobalBiomeIdsInCountry(countryCode: string) {
  return new Set(nationalBiomes.filter((b) => b.countryCode === countryCode).map((b) => b.globalBiomeId));
}

export async function getSources(ids?: string[]) {
  return ids ? sources.filter((s) => ids.includes(s.id)) : sources;
}

export async function getAllSpecies() {
  return species;
}

export async function getSpecies(slug: string) {
  return species.find((s) => s.slug === slug);
}

export async function getFeaturedSpecies(countryCode: string) {
  const slugs = featuredSlugs[countryCode] ?? [];
  return slugs.map((slug) => species.find((s) => s.slug === slug)).filter((s): s is Species => !!s);
}

export async function getSpeciesInBiome(countryCode: string, biomeSlug: string) {
  return species.filter((s) =>
    s.occurrences.some((o) => o.countryCode === countryCode && o.biomeSlugs.includes(biomeSlug)),
  );
}

/** Espécies parecidas: mesmo gênero, depois mesma família, depois mesma ordem. */
export async function getRelatedSpecies(target: Species, limit = 4) {
  const score = (s: Species) =>
    s.taxonomy.genero === target.taxonomy.genero
      ? 3
      : s.taxonomy.familia === target.taxonomy.familia
        ? 2
        : s.taxonomy.ordem === target.taxonomy.ordem
          ? 1
          : s.kingdom === target.kingdom
            ? 0.5
            : 0;
  return species
    .filter((s) => s.slug !== target.slug && score(s) > 0)
    .sort((a, b) => score(b) - score(a))
    .slice(0, limit)
    .map((s) => ({
      species: s,
      reason:
        s.taxonomy.genero === target.taxonomy.genero
          ? `Mesmo gênero (${s.taxonomy.genero})`
          : s.taxonomy.familia === target.taxonomy.familia
            ? `Mesma família (${s.taxonomy.familia})`
            : s.taxonomy.ordem === target.taxonomy.ordem
              ? `Mesma ordem (${s.taxonomy.ordem})`
              : s.kingdom === "fauna"
                ? "Também da fauna"
                : "Também da flora",
    }));
}

/** Busca simples por nome popular, outros nomes ou nome científico. */
export async function searchAll(query: string) {
  const q = normalize(query);
  if (!q) return { species: [], countries: [] };
  return {
    species: species.filter((s) =>
      [s.commonName, s.scientificName, ...(s.otherNames ?? [])].some((n) => normalize(n).includes(q)),
    ),
    countries: countries.filter((c) => normalize(c.name).includes(q)),
  };
}

function normalize(text: string) {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

export { statusLabels } from "@/data/status";
