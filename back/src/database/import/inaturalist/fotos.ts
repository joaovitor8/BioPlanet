// Regras para escolher, entre o que o iNaturalist devolve, o que entra no BioPlanet:
// - o táxon com o nome científico exatamente igual (a busca do iNaturalist é aproximada);
// - até 4 fotos com licença aberta (cc0, cc-by, cc-by-sa, cc-by-nc), com autor;
// - o nome popular, só se o iNaturalist o marcar como português.

import { Reino } from '../../enums.js';
import type { FotoINat, TaxonINat } from './cliente.js';

export const LICENCAS_ACEITAS = new Set([
  'cc0',
  'cc-by',
  'cc-by-sa',
  'cc-by-nc',
]);
export const MAXIMO_DE_FOTOS = 4;

export interface FotoEscolhida {
  url: string;
  urlMiniatura: string;
  autor: string;
  licenca: string;
  linkOriginal: string;
}

const normalizar = (nome: string) =>
  nome.trim().replace(/\s+/g, ' ').toLowerCase();

/** O mesmo nome pode existir em reinos diferentes; o grupo "icônico" do iNaturalist desempata. */
function mesmoReino(taxon: TaxonINat, reino: Reino) {
  const grupo = taxon.iconic_taxon_name;
  if (!grupo) return true;
  if (reino === Reino.Flora) return grupo === 'Plantae';
  if (reino === Reino.Funga) return grupo === 'Fungi';
  return grupo !== 'Plantae' && grupo !== 'Fungi';
}

export function escolherTaxon(
  resultados: TaxonINat[],
  nomeCientifico: string,
  reino: Reino,
): TaxonINat | null {
  const alvo = normalizar(nomeCientifico);
  return (
    resultados.find(
      (t) =>
        t.rank === 'species' &&
        t.is_active &&
        normalizar(t.name) === alvo &&
        mesmoReino(t, reino),
    ) ?? null
  );
}

/** Na API, square_url, medium_url e large_url só mudam no tamanho escrito na URL. */
const tamanho = (foto: FotoINat, nome: 'medium' | 'large') =>
  foto[`${nome}_url`] ?? foto.url.replace(/\/square\./, `/${nome}.`);

export function escolherFotos(taxon: TaxonINat): FotoEscolhida[] {
  const vistas = new Set<number>();
  const escolhidas: FotoEscolhida[] = [];
  for (const { photo } of taxon.taxon_photos ?? []) {
    if (escolhidas.length >= MAXIMO_DE_FOTOS) break;
    if (vistas.has(photo.id)) continue;
    vistas.add(photo.id);
    if (!photo.license_code || !LICENCAS_ACEITAS.has(photo.license_code))
      continue;
    const autor = photo.attribution_name?.trim();
    if (!autor) continue;
    escolhidas.push({
      url: tamanho(photo, 'large'),
      urlMiniatura: tamanho(photo, 'medium'),
      autor,
      licenca: photo.license_code,
      linkOriginal: `https://www.inaturalist.org/photos/${photo.id}`,
    });
  }
  return escolhidas;
}

/**
 * O nome popular que o iNaturalist mostra em pt-BR, desde que ele esteja na lista
 * de nomes em português. Sem nome em português, o iNaturalist devolve o inglês; esse não serve.
 */
export function nomeEmPortugues(taxon: TaxonINat): string | null {
  const nome = taxon.preferred_common_name?.trim();
  if (!nome) return null;
  const emPortugues = (taxon.names ?? []).some(
    (n) =>
      n.locale === 'pt' &&
      n.is_valid !== false &&
      normalizar(n.name) === normalizar(nome),
  );
  return emPortugues ? nome : null;
}
