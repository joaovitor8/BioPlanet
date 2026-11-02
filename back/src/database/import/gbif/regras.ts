// Quando confiar no match do GBIF. Só guardamos o taxonKey se tudo bater:
// match EXATO, no nível de ESPÉCIE, ACEITO (não sinônimo), no mesmo reino e com o mesmo nome.
// Sinônimo fica de fora: ele aponta para outro conceito de espécie, e contagens e mapa
// poderiam misturar espécies diferentes.

import { Reino } from '../../enums.js';
import type { ContagemGbif, MatchGbif } from './cliente.js';

export const REINO_GBIF: Record<Reino, string> = {
  [Reino.Fauna]: 'Animalia',
  [Reino.Flora]: 'Plantae',
  [Reino.Funga]: 'Fungi',
};

export type ResultadoDoMatch =
  { aceito: true; taxonKey: number } | { aceito: false; motivo: string };

export function avaliarMatch(
  m: MatchGbif,
  nomeCientifico: string,
  reino: Reino,
): ResultadoDoMatch {
  if (m.matchType !== 'EXACT')
    return { aceito: false, motivo: `match ${m.matchType}` };
  if (m.rank !== 'SPECIES')
    return { aceito: false, motivo: `nível ${m.rank ?? '?'}` };
  if (m.status !== 'ACCEPTED')
    return { aceito: false, motivo: `status ${m.status ?? '?'}` };
  if (m.kingdom !== REINO_GBIF[reino])
    return { aceito: false, motivo: `reino ${m.kingdom ?? '?'}` };
  if (m.canonicalName !== nomeCientifico) {
    return {
      aceito: false,
      motivo: `nome diferente: ${m.canonicalName ?? '?'}`,
    };
  }
  if (!m.usageKey) return { aceito: false, motivo: 'sem usageKey' };
  return { aceito: true, taxonKey: m.usageKey };
}

/** Registros por país (código ISO de 2 letras) a partir do facet. */
export function registrosPorPais(c: ContagemGbif): Map<string, number> {
  const paises = c.facets.find((f) => f.field === 'COUNTRY')?.counts ?? [];
  return new Map(paises.map((p) => [p.name, p.count]));
}
