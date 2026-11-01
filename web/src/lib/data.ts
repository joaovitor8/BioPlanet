// Camada de acesso aos dados. As páginas só usam estas funções.
// Elas buscam na API do BioPlanet (pasta back/). As respostas da API têm o mesmo
// formato dos tipos em src/data/types.ts, então as páginas não sabem de onde o dado vem.

import { cacheLife, cacheTag } from "next/cache";
import { continents } from "@/data/countries";
import type { Country, GlobalBiome, NationalBiome, Source, Species } from "@/data/types";
import { API_URL } from "./api-url";

/**
 * Faz o GET na API e guarda o resultado em cache.
 * - O cache é por caminho: duas páginas que pedem /countries fazem uma chamada só.
 * - No build, o resultado entra nas páginas estáticas. Depois, o Next busca de novo
 *   em segundo plano a cada hora (cacheLife "hours").
 * - 404 vira undefined, como o find() fazia com os dados de exemplo.
 * - Qualquer outro erro (API fora do ar, 500) quebra a página, para não mostrar dado errado.
 */
async function api<T>(path: string): Promise<T | undefined> {
  "use cache";
  cacheLife("hours");
  // Para atualizar tudo na hora depois de mudar o banco: revalidateTag("api").
  cacheTag("api");

  // no-store: o fetch não grava no Data Cache do Next, que fica em disco e sobrevive
  // entre builds. Sem isso, um build feito logo depois de mudar o banco ainda
  // mostraria os dados antigos. O "use cache" acima continua guardando o resultado.
  const res = await fetch(API_URL + path, { cache: "no-store" });
  if (res.status === 404) return undefined;
  if (!res.ok) throw new Error(`A API respondeu ${res.status} em GET ${path}`);
  return (await res.json()) as T;
}

/** Para listas, que sempre existem: um 404 aqui é erro de verdade. */
async function apiList<T>(path: string): Promise<T[]> {
  const list = await api<T[]>(path);
  if (!list) throw new Error(`A API respondeu 404 em GET ${path}`);
  return list;
}

const seg = encodeURIComponent;

/** As funções recebem o código do país (BR); a API usa o slug (br). */
async function countrySlug(code: string) {
  return (await getCountries()).find((c) => c.code === code)?.slug;
}

export async function getCountries() {
  return apiList<Country>("/countries");
}

/** Os continentes são rótulos fixos do site, não vêm do banco. */
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

/** Ids dos biomas globais que aparecem em algum bioma nacional do país. */
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
  // A API responde 404 se o bioma não existe no país; aqui isso é "nenhuma espécie".
  return (await api<Species[]>(`/species?country=${seg(slug)}&biome=${seg(biomeSlug)}`)) ?? [];
}

/** Espécies parecidas: mesmo gênero, depois mesma família, depois mesma ordem. A API calcula. */
export async function getRelatedSpecies(target: Species, limit = 4) {
  const related = await apiList<{ species: Species; reason: string }>(`/species/${seg(target.slug)}/related`);
  return related.slice(0, limit);
}

/** Busca por nome popular, outros nomes, nome científico ou país. A API ignora acento e maiúscula. */
export async function searchAll(query: string) {
  const q = query.trim();
  if (!q) return { species: [], countries: [] };
  const result = await api<{ species: Species[]; countries: Country[] }>(`/search?q=${seg(q)}`);
  return result ?? { species: [], countries: [] };
}

export { statusLabels } from "@/data/status";
