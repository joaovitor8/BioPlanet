// Converte uma linha da tabela foto para o JSON da API, com nome e link da licença.

import type { Photo } from '../common/api-types.js';

/**
 * Licenças aceitas pelo importador do iNaturalist. O iNaturalist não diz a versão
 * da licença de cada foto; o link aponta para a versão que o próprio site usa.
 */
const LICENCAS: Record<string, { nome: string; url: string }> = {
  cc0: {
    nome: 'CC0',
    url: 'https://creativecommons.org/publicdomain/zero/1.0/',
  },
  'cc-by': {
    nome: 'CC BY',
    url: 'https://creativecommons.org/licenses/by/4.0/',
  },
  'cc-by-sa': {
    nome: 'CC BY-SA',
    url: 'https://creativecommons.org/licenses/by-sa/4.0/',
  },
  'cc-by-nc': {
    nome: 'CC BY-NC',
    url: 'https://creativecommons.org/licenses/by-nc/4.0/',
  },
};

export interface LinhaDeFoto {
  especieId: number;
  url: string;
  urlMiniatura: string;
  autor: string;
  licenca: string;
  linkOriginal: string;
  fonte: string;
}

export function toPhoto(f: LinhaDeFoto): Photo {
  const licenca = LICENCAS[f.licenca];
  return {
    url: f.url,
    thumbnailUrl: f.urlMiniatura,
    author: f.autor,
    license: licenca?.nome ?? f.licenca.toUpperCase(),
    ...(licenca ? { licenseUrl: licenca.url } : {}),
    sourceUrl: f.linkOriginal,
    source: f.fonte,
  };
}
