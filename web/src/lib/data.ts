// Porta de entrada dos dados: as páginas buscam tudo por estas funções.
// Elas chamam a API e guardam o resultado em cache por 1 hora.

import { cacheLife, cacheTag } from "next/cache";
import { continents } from "@/data/countries";
import type { Country, GlobalBiome, NationalBiome, Source, Species } from "@/data/types";
import { API_URL } from "./api-url";

async function api<T>(path: string): Promise<T | undefined> {
  "use cache";
  cacheLife("hours");
  cacheTag("api");

  const res = await fetch(API_URL + path, { cache: "no-store" });
  if (res.status === 404) return undefined;
  if (!res.ok) throw new Error(`A API respondeu ${res.status} em GET ${path}`);
  return (await res.json()) as T;
}

async function apiList<T>(path: string): Promise<T[]> {
  const list = await api<T[]>(path);
  if (!list) throw new Error(`A API respondeu 404 em GET ${path}`);
  return list;
}

const seg = encodeURIComponent;

async function countrySlug(code: string) {
  return (await getCountries()).find((c) => c.code === code)?.slug;
}

export async function getCountries() {
  return apiList<Country>("/countries");
}

export async function getContinents() {
  return continents;
}

export async function getCountry(slug: string) {
  return api<Country>(`/countries/${seg(slug)}`);
}

export async function getCountryByCode(code: string) {
  return (await getCountries()).find((c) => c.code === code);
}

export async function getGlobalBiomes() {
  return apiList<GlobalBiome>("/biomes");
}

export async function getGlobalBiome(id: string) {
  return (await getGlobalBiomes()).find((b) => b.id === id);
}

export async function getNationalBiomes(countryCode: string) {
  const slug = await countrySlug(countryCode);
  if (!slug) return [];
  const country = await api<{ biomes: NationalBiome[] }>(`/countries/${seg(slug)}`);
  return country?.biomes ?? [];
}

export async function getNationalBiome(countryCode: string, slug: string) {
  const country = await countrySlug(countryCode);
  if (!country) return undefined;
  return api<NationalBiome>(`/countries/${seg(country)}/biomes/${seg(slug)}`);
}

export async function getGlobalBiomeIdsInCountry(countryCode: string) {
  return new Set((await getNationalBiomes(countryCode)).map((b) => b.globalBiomeId));
}

export async function getSources(ids?: string[]) {
  const sources = await apiList<Source>("/sources");
  return ids ? sources.filter((s) => ids.includes(s.id)) : sources;
}

export async function getAllSpecies() {
  return apiList<Species>("/species");
}

export async function getSpecies(slug: string) {
  return api<Species>(`/species/${seg(slug)}`);
}

export async function getFeaturedSpecies(countryCode: string) {
  const slug = await countrySlug(countryCode);
  if (!slug) return [];
  return apiList<Species>(`/species?country=${seg(slug)}&featured=true`);
}

export async function getSpeciesInBiome(countryCode: string, biomeSlug: string) {
  const slug = await countrySlug(countryCode);
  if (!slug) return [];
  return (await api<Species[]>(`/species?country=${seg(slug)}&biome=${seg(biomeSlug)}`)) ?? [];
}

export async function getRelatedSpecies(target: Species, limit = 4) {
  const related = await apiList<{ species: Species; reason: string }>(`/species/${seg(target.slug)}/related`);
  return related.slice(0, limit);
}

export async function searchAll(query: string) {
  const q = query.trim();
  if (!q) return { species: [], countries: [] };
  const result = await api<{ species: Species[]; countries: Country[] }>(`/search?q=${seg(q)}`);
  return result ?? { species: [], countries: [] };
}

export { statusLabels } from "@/data/status";
