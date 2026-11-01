import type { Repository } from 'typeorm';
import type { Fonte } from '../database/entities/index.js';
import { EscopoFonte } from '../database/enums.js';
import { SourcesService } from './sources.service.js';

const service = new SourcesService(null as unknown as Repository<Fonte>);

const fonte = (extra: Partial<Fonte> = {}): Fonte => ({
  id: 1,
  slug: 'flora-brasil',
  nome: 'Flora e Funga do Brasil',
  descricao: 'Plantas, algas e fungos.',
  url: 'https://floradobrasil.jbrj.gov.br',
  escopo: EscopoFonte.Nacional,
  citacao: null,
  licenca: null,
  versao: null,
  importadoEm: null,
  ...extra,
});

describe('SourcesService.toSource', () => {
  it('fonte ainda não importada não traz crédito', () => {
    expect(service.toSource(fonte())).not.toHaveProperty('credit');
  });

  it('fonte importada traz citação, licença com link e versão', () => {
    const source = service.toSource(
      fonte({
        citacao:
          'Flora e Funga do Brasil (Constantly updated). doi:10.15468/1mtkaw',
        licenca: 'CC-BY 4.0 (https://creativecommons.org/licenses/by/4.0/)',
        versao: '393.433',
      }),
    );
    expect(source.credit).toEqual({
      citation:
        'Flora e Funga do Brasil (Constantly updated). doi:10.15468/1mtkaw',
      license: 'CC-BY 4.0',
      licenseUrl: 'https://creativecommons.org/licenses/by/4.0/',
      version: '393.433',
    });
  });

  it('licença sem link fica só com o nome', () => {
    const source = service.toSource(
      fonte({ citacao: 'Citação', licenca: 'Domínio público' }),
    );
    expect(source.credit).toEqual({
      citation: 'Citação',
      license: 'Domínio público',
    });
  });
});
