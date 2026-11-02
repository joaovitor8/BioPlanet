import { Reino } from '../../enums.js';
import type { MatchGbif } from './cliente.js';
import { avaliarMatch, registrosPorPais } from './regras.js';

const onca: MatchGbif = {
  usageKey: 5219426,
  canonicalName: 'Panthera onca',
  matchType: 'EXACT',
  confidence: 100,
  status: 'ACCEPTED',
  rank: 'SPECIES',
  kingdom: 'Animalia',
};

describe('avaliarMatch', () => {
  it('aceita o match exato, aceito, de espécie, no mesmo reino', () => {
    expect(avaliarMatch(onca, 'Panthera onca', Reino.Fauna)).toEqual({
      aceito: true,
      taxonKey: 5219426,
    });
  });

  it('recusa o que não é exato ou não é confiável, dizendo o motivo', () => {
    const casos: [MatchGbif, string][] = [
      [{ ...onca, matchType: 'FUZZY' }, 'match FUZZY'],
      [{ ...onca, matchType: 'NONE', usageKey: undefined }, 'match NONE'],
      [{ ...onca, rank: 'GENUS' }, 'nível GENUS'],
      [{ ...onca, status: 'SYNONYM' }, 'status SYNONYM'],
      [{ ...onca, kingdom: 'Plantae' }, 'reino Plantae'],
      [
        { ...onca, canonicalName: 'Panthera leo' },
        'nome diferente: Panthera leo',
      ],
    ];
    for (const [match, motivo] of casos) {
      expect(avaliarMatch(match, 'Panthera onca', Reino.Fauna)).toEqual({
        aceito: false,
        motivo,
      });
    }
  });
});

describe('registrosPorPais', () => {
  it('lê o facet de países', () => {
    const porPais = registrosPorPais({
      count: 10,
      facets: [
        {
          field: 'COUNTRY',
          counts: [
            { name: 'BR', count: 7 },
            { name: 'AR', count: 3 },
          ],
        },
      ],
    });
    expect([...porPais]).toEqual([
      ['BR', 7],
      ['AR', 3],
    ]);
  });

  it('sem facet, nenhum país', () => {
    expect(registrosPorPais({ count: 0, facets: [] }).size).toBe(0);
  });
});
