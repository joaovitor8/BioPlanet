import { Reino } from '../../enums.js';
import {
  capitalizar,
  montarFauna,
  montarFlora,
  slugDe,
  type LinhasDoTaxon,
} from './especies.js';

const linhas = (
  taxon: Record<string, string>,
  extra: Partial<Omit<LinhasDoTaxon, 'taxon'>> = {},
): LinhasDoTaxon => ({
  taxon,
  formasDeVida: new Set(),
  dominios: new Set(),
  paisesNativos: new Set(),
  ufs: new Set(),
  nomesEmPortugues: [],
  ...extra,
});

const pequi = {
  taxonRank: 'ESPECIE',
  taxonomicStatus: 'NOME_ACEITO',
  kingdom: 'Plantae',
  phylum: 'Tracheophyta',
  class: 'Magnoliopsida',
  order: 'Malpighiales',
  family: 'Caryocaraceae',
  genus: 'Caryocar',
  specificEpithet: 'brasiliense',
  scientificNameAuthorship: 'Cambess.',
};

const loboGuara = {
  taxonRank: 'species',
  taxonomicStatus: 'accepted',
  kingdom: 'Animalia',
  phylum: 'Chordata',
  class: 'Mammalia',
  order: 'Carnivora',
  family: 'Canidae',
  genus: 'Chrysocyon',
  specificEpithet: 'brachyurus',
  scientificNameAuthorship: '(Illiger, 1815)',
};

describe('slugDe e capitalizar', () => {
  it('monta o endereço a partir do nome científico', () => {
    expect(slugDe('Caryocar brasiliense')).toBe('caryocar-brasiliense');
    expect(slugDe('Citrus ×aurantium')).toBe('citrus-xaurantium');
  });

  it('põe só a primeira letra em maiúscula', () => {
    expect(capitalizar('lobo-guará')).toBe('Lobo-guará');
    expect(capitalizar('ipê-amarelo')).toBe('Ipê-amarelo');
  });
});

describe('montarFlora', () => {
  const doCerrado = {
    formasDeVida: new Set(['Arbusto', 'Árvore']),
    dominios: new Set(['Cerrado', 'Pantanal']),
    paisesNativos: new Set(['BR']),
    nomesEmPortugues: ['pequi', 'piqui'],
  };

  it('monta a árvore nativa do Cerrado com todos os biomas dela', () => {
    expect(montarFlora(linhas(pequi, doCerrado))).toEqual({
      nomeCientifico: 'Caryocar brasiliense',
      slug: 'caryocar-brasiliense',
      autoria: 'Cambess.',
      nomePopular: 'Pequi',
      outrosNomes: ['piqui'],
      reino: Reino.Flora,
      grupo: 'Árvore',
      taxonomia: {
        taxReino: 'Plantae',
        taxFilo: 'Tracheophyta',
        taxClasse: 'Magnoliopsida',
        taxOrdem: 'Malpighiales',
        taxFamilia: 'Caryocaraceae',
        taxGenero: 'Caryocar',
      },
      paises: ['BR'],
      biomas: ['Cerrado', 'Pantanal'],
    });
  });

  it('sem nome popular, usa o nome científico', () => {
    const e = montarFlora(
      linhas(pequi, { ...doCerrado, nomesEmPortugues: [] }),
    );
    expect(e?.nomePopular).toBe('Caryocar brasiliense');
    expect(e?.outrosNomes).toEqual([]);
  });

  it('deixa de fora o que não está no recorte', () => {
    const fora = [
      linhas({ ...pequi, taxonomicStatus: 'SINONIMO' }, doCerrado),
      linhas({ ...pequi, taxonRank: 'VARIEDADE' }, doCerrado),
      linhas(pequi, { ...doCerrado, dominios: new Set(['Amazônia']) }),
      linhas(pequi, { ...doCerrado, formasDeVida: new Set(['Erva']) }),
      linhas(pequi, { ...doCerrado, paisesNativos: new Set() }), // exótica
    ];
    for (const l of fora) expect(montarFlora(l)).toBeNull();
  });
});

describe('montarFauna', () => {
  const noDF = {
    paisesNativos: new Set(['BR', 'AR']),
    ufs: new Set(['DF', 'GO']),
    nomesEmPortugues: ['lobo-guará'],
  };

  it('monta o mamífero nativo registrado no DF, ligado só ao Cerrado', () => {
    const e = montarFauna(linhas(loboGuara, noDF));
    expect(e).toMatchObject({
      nomeCientifico: 'Chrysocyon brachyurus',
      autoria: '(Illiger, 1815)',
      nomePopular: 'Lobo-guará',
      reino: Reino.Fauna,
      grupo: 'Mamífero',
      paises: ['BR', 'AR'],
      biomas: ['Cerrado'],
    });
  });

  it('aves viram o grupo "Ave"', () => {
    expect(
      montarFauna(linhas({ ...loboGuara, class: 'Aves' }, noDF))?.grupo,
    ).toBe('Ave');
  });

  it('deixa de fora o que não está no recorte', () => {
    const fora = [
      linhas({ ...loboGuara, class: 'Reptilia' }, noDF),
      linhas({ ...loboGuara, taxonomicStatus: 'synonym' }, noDF),
      linhas(loboGuara, { ...noDF, ufs: new Set(['GO']) }), // sem registro no DF
      linhas(loboGuara, { ...noDF, paisesNativos: new Set() }), // introduzida (ex.: Felis catus)
    ];
    for (const l of fora) expect(montarFauna(l)).toBeNull();
  });
});
