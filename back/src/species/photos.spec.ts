import { toPhoto, type LinhaDeFoto } from './photos.js';

const linha = (licenca: string): LinhaDeFoto => ({
  especieId: 1,
  url: 'https://exemplo.org/large.jpg',
  urlMiniatura: 'https://exemplo.org/medium.jpg',
  autor: 'Fulana',
  licenca,
  linkOriginal: 'https://www.inaturalist.org/photos/1',
  fonte: 'iNaturalist',
});

describe('toPhoto', () => {
  it('traduz o código da licença para o nome e o link', () => {
    expect(toPhoto(linha('cc0'))).toMatchObject({
      license: 'CC0',
      licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/',
    });
    expect(toPhoto(linha('cc-by-sa'))).toMatchObject({
      license: 'CC BY-SA',
      licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
    });
  });

  it('licença desconhecida fica só com o nome, sem link', () => {
    const foto = toPhoto(linha('cc-by-nd'));
    expect(foto.license).toBe('CC-BY-ND');
    expect(foto).not.toHaveProperty('licenseUrl');
  });
});
