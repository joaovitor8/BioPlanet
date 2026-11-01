import { Reino } from '../../enums.js';
import type { FotoINat, TaxonINat } from './cliente.js';
import { escolherFotos, escolherTaxon, nomeEmPortugues } from './fotos.js';

const taxon = (extra: Partial<TaxonINat> = {}): TaxonINat => ({
  id: 41970,
  name: 'Panthera onca',
  rank: 'species',
  is_active: true,
  iconic_taxon_name: 'Mammalia',
  ...extra,
});

const foto = (
  id: number,
  licenca: string | null,
  autor = 'Fulana',
): FotoINat => ({
  id,
  license_code: licenca,
  attribution: `(c) ${autor}`,
  attribution_name: autor,
  url: `https://exemplo.org/photos/${id}/square.jpg`,
  medium_url: `https://exemplo.org/photos/${id}/medium.jpg`,
  large_url: `https://exemplo.org/photos/${id}/large.jpg`,
});

describe('escolherTaxon', () => {
  it('fica com o nome exatamente igual, mesmo vindo depois na busca aproximada', () => {
    const resultados = [taxon({ id: 1, name: 'Panthera atrox' }), taxon()];
    expect(escolherTaxon(resultados, 'Panthera onca', Reino.Fauna)?.id).toBe(
      41970,
    );
  });

  it('não aceita táxon de outro reino, inativo ou que não seja espécie', () => {
    expect(escolherTaxon([taxon()], 'Panthera onca', Reino.Flora)).toBeNull();
    expect(
      escolherTaxon(
        [taxon({ is_active: false })],
        'Panthera onca',
        Reino.Fauna,
      ),
    ).toBeNull();
    expect(
      escolherTaxon([taxon({ rank: 'genus' })], 'Panthera onca', Reino.Fauna),
    ).toBeNull();
  });
});

describe('escolherFotos', () => {
  it('só licenças abertas, com autor, sem repetir, no máximo 4', () => {
    const t = taxon({
      taxon_photos: [
        foto(1, null), // todos os direitos reservados
        foto(2, 'cc-by-nc'),
        foto(2, 'cc-by-nc'), // repetida
        foto(3, 'cc-by-nc-nd'), // proíbe modificar
        foto(4, 'cc-by-nc-sa'), // fora da lista combinada
        foto(5, 'cc0'),
        foto(6, 'cc-by', '  '), // sem autor
        foto(7, 'cc-by-sa'),
        foto(8, 'cc-by'),
        foto(9, 'cc-by'), // passaria do limite
      ].map((photo) => ({ photo })),
    });
    const escolhidas = escolherFotos(t);
    expect(escolhidas.map((f) => f.linkOriginal)).toEqual([
      'https://www.inaturalist.org/photos/2',
      'https://www.inaturalist.org/photos/5',
      'https://www.inaturalist.org/photos/7',
      'https://www.inaturalist.org/photos/8',
    ]);
    expect(escolhidas[0]).toEqual({
      url: 'https://exemplo.org/photos/2/large.jpg',
      urlMiniatura: 'https://exemplo.org/photos/2/medium.jpg',
      autor: 'Fulana',
      licenca: 'cc-by-nc',
      linkOriginal: 'https://www.inaturalist.org/photos/2',
    });
  });

  it('sem os tamanhos prontos, monta a URL a partir da miniatura quadrada', () => {
    const f = {
      ...foto(1, 'cc-by'),
      medium_url: undefined,
      large_url: undefined,
    };
    const [escolhida] = escolherFotos(taxon({ taxon_photos: [{ photo: f }] }));
    expect(escolhida.url).toBe('https://exemplo.org/photos/1/large.jpg');
    expect(escolhida.urlMiniatura).toBe(
      'https://exemplo.org/photos/1/medium.jpg',
    );
  });
});

describe('nomeEmPortugues', () => {
  it('aceita o nome quando ele está na lista de nomes em português', () => {
    const t = taxon({
      preferred_common_name: 'Jaguar',
      names: [
        { name: 'Jaguar', locale: 'en' },
        { name: 'Jaguar', locale: 'pt' },
      ],
    });
    expect(nomeEmPortugues(t)).toBe('Jaguar');
  });

  it('recusa o nome em inglês que o iNaturalist usa quando não há português', () => {
    const t = taxon({
      preferred_common_name: 'Maned Wolf',
      names: [{ name: 'Maned Wolf', locale: 'en' }],
    });
    expect(nomeEmPortugues(t)).toBeNull();
  });
});
