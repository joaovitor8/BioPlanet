// Testes dos endpoints contra o banco com os dados de exemplo.
// Antes de rodar: docker compose up -d, npm run migration:run e npm run seed.
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import type { App } from 'supertest/types.js';
import { AppModule } from './../src/app.module.js';

describe('API (e2e)', () => {
  let app: INestApplication<App>;
  const get = (path: string) => request(app.getHttpServer()).get(path);

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /countries', () => {
    it('lista os 14 países com as fontes nacionais', async () => {
      const res = await get('/countries').expect(200);
      expect(res.body).toHaveLength(14);
      expect(res.body[0]).toEqual({
        code: 'BR',
        slug: 'br',
        name: 'Brasil',
        continent: 'america-do-sul',
        status: 'disponivel',
        sourceIds: ['flora-brasil', 'fauna-brasil', 'salve'],
        biomeAuthority: 'IBGE',
        intro: expect.any(String),
      });
      // País sem autoridade nem intro não traz esses campos.
      const ar = res.body.find((c: { code: string }) => c.code === 'AR');
      expect(ar).not.toHaveProperty('biomeAuthority');
      expect(ar.sourceIds).toEqual([]);
    });
  });

  describe('GET /countries/:slug', () => {
    it('traz os biomas nacionais com o bioma global e as fontes', async () => {
      const res = await get('/countries/br').expect(200);
      expect(res.body.biomes.map((b: { slug: string }) => b.slug)).toEqual([
        'amazonia',
        'cerrado',
        'mata-atlantica',
        'caatinga',
        'pampa',
        'pantanal',
      ]);
      const cerrado = res.body.biomes[1];
      expect(cerrado.globalBiomeId).toBe('7');
      expect(cerrado.globalBiome).toEqual({
        id: '7',
        name: 'Savanas e campos tropicais',
        examples: 'Cerrado, Serengeti',
      });
      expect(res.body.sources.map((s: { id: string }) => s.id)).toEqual([
        'flora-brasil',
        'fauna-brasil',
        'salve',
      ]);
    });

    it('responde 404 para país inexistente', async () => {
      const res = await get('/countries/xx').expect(404);
      expect(res.body.message).toBe('País "xx" não encontrado.');
    });
  });

  describe('GET /countries/:slug/biomes/:biome', () => {
    it('traz o bioma nacional com o bioma global', async () => {
      const res = await get('/countries/br/biomes/cerrado').expect(200);
      expect(res.body).toMatchObject({
        slug: 'cerrado',
        countryCode: 'BR',
        name: 'Cerrado',
        areaPct: 23.3,
        globalBiomeId: '7',
        globalBiome: { id: '7', name: 'Savanas e campos tropicais' },
      });
    });

    it('responde 404 para bioma inexistente no país', async () => {
      await get('/countries/br/biomes/nada').expect(404);
      await get('/countries/xx/biomes/cerrado').expect(404);
    });
  });

  describe('GET /species', () => {
    it('sem filtro, lista todas as 13 espécies', async () => {
      const res = await get('/species').expect(200);
      expect(res.body).toHaveLength(13);
    });

    it('filtra por país e bioma', async () => {
      const res = await get('/species?country=br&biome=cerrado').expect(200);
      expect(res.body.map((s: { slug: string }) => s.slug)).toEqual([
        'panthera-onca',
        'chrysocyon-brachyurus',
        'myrmecophaga-tridactyla',
        'anodorhynchus-hyacinthinus',
        'rhea-americana',
        'caryocar-brasiliense',
        'mauritia-flexuosa',
        'cariama-cristata',
        'handroanthus-ochraceus',
        'stryphnodendron-adstringens',
      ]);
    });

    it('filtra só por bioma', async () => {
      const res = await get('/species?biome=pampa').expect(200);
      expect(res.body.map((s: { slug: string }) => s.slug)).toContain(
        'chrysocyon-brachyurus',
      );
    });

    it('filtra as espécies em destaque do país', async () => {
      const res = await get('/species?country=br&featured=true').expect(200);
      expect(res.body.map((s: { slug: string }) => s.slug)).toEqual([
        'panthera-onca',
        'victoria-amazonica',
        'chrysocyon-brachyurus',
        'araucaria-angustifolia',
        'myrmecophaga-tridactyla',
        'cereus-jamacaru',
        'anodorhynchus-hyacinthinus',
        'rhea-americana',
      ]);
      // País sem destaques cadastrados: lista vazia, não 404.
      await get('/species?country=ar&featured=true').expect(200, []);
      // featured=false não filtra: são todas as 13 do Brasil.
      const todas = await get('/species?country=br&featured=false').expect(200);
      expect(todas.body).toHaveLength(13);
    });

    it('responde 404 para filtro que não existe', async () => {
      await get('/species?country=xx').expect(404);
      await get('/species?country=ar&biome=cerrado').expect(404);
    });

    it('responde 400 para filtro repetido ou inválido', async () => {
      await get('/species?country=br&country=ar').expect(400);
      await get('/species?featured=sim').expect(400);
    });
  });

  describe('GET /species/:slug', () => {
    it('monta a ficha completa', async () => {
      const res = await get('/species/panthera-onca').expect(200);
      expect(res.body).toMatchObject({
        slug: 'panthera-onca',
        scientificName: 'Panthera onca',
        authorship: '(Linnaeus, 1758)',
        commonName: 'Onça-pintada',
        otherNames: ['jaguar', 'jaguaretê'],
        kingdom: 'fauna',
        group: 'Mamífero',
        taxonomy: {
          reino: 'Animalia',
          filo: 'Chordata',
          classe: 'Mammalia',
          ordem: 'Carnivora',
          familia: 'Felidae',
          genero: 'Panthera',
        },
        conservation: { national: { BR: 'VU' } },
      });
      const brasil = res.body.occurrences.find(
        (o: { countryCode: string }) => o.countryCode === 'BR',
      );
      expect(brasil).toEqual({
        countryCode: 'BR',
        biomeSlugs: [
          'amazonia',
          'cerrado',
          'mata-atlantica',
          'caatinga',
          'pantanal',
        ],
        statusSourceId: 'salve',
      });
      // Nos outros países não há bioma nacional nem fonte de status.
      const mexico = res.body.occurrences.find(
        (o: { countryCode: string }) => o.countryCode === 'MX',
      );
      expect(mexico).toEqual({ countryCode: 'MX', biomeSlugs: [] });
    });

    it('lista primeiro o país integrado, depois em preparação, depois o resto', async () => {
      const res = await get('/species/panthera-onca').expect(200);
      expect(
        res.body.occurrences.map((o: { countryCode: string }) => o.countryCode),
      ).toEqual(['BR', 'AR', 'CO', 'MX', 'PE']);
    });

    it('responde 404 para espécie inexistente', async () => {
      const res = await get('/species/nao-existe').expect(404);
      expect(res.body.message).toBe('Espécie "nao-existe" não encontrada.');
    });
  });

  describe('GET /species/:slug/related', () => {
    it('ordena por gênero, família, ordem e reino', async () => {
      const res = await get('/species/panthera-onca/related').expect(200);
      expect(
        res.body.map((r: { species: { slug: string }; reason: string }) => [
          r.species.slug,
          r.reason,
        ]),
      ).toEqual([
        ['chrysocyon-brachyurus', 'Mesma ordem (Carnivora)'],
        ['myrmecophaga-tridactyla', 'Também da fauna'],
        ['anodorhynchus-hyacinthinus', 'Também da fauna'],
        ['rhea-americana', 'Também da fauna'],
      ]);
    });

    it('responde 404 para espécie inexistente', async () => {
      await get('/species/nao-existe/related').expect(404);
    });
  });

  describe('GET /biomes', () => {
    it('lista os 14 biomas globais em ordem', async () => {
      const res = await get('/biomes').expect(200);
      expect(res.body.map((b: { id: string }) => b.id)).toEqual(
        Array.from({ length: 14 }, (_, i) => String(i + 1)),
      );
    });
  });

  describe('GET /sources', () => {
    it('lista todas as fontes ou só as de um escopo', async () => {
      expect((await get('/sources').expect(200)).body).toHaveLength(8);
      const globais = (await get('/sources?scope=global').expect(200)).body;
      expect(globais).toHaveLength(5);
      expect(
        globais.every((s: { scope: string }) => s.scope === 'global'),
      ).toBe(true);
      expect(
        (await get('/sources?scope=nacional').expect(200)).body,
      ).toHaveLength(3);
    });

    it('responde 400 para escopo inválido', async () => {
      await get('/sources?scope=x').expect(400);
    });
  });

  describe('GET /search', () => {
    it('ignora acento e maiúscula', async () => {
      for (const q of ['onca', 'ONÇA', 'jaguarete']) {
        const res = await get(`/search?q=${encodeURIComponent(q)}`).expect(200);
        expect(res.body.species.map((s: { slug: string }) => s.slug)).toEqual([
          'panthera-onca',
        ]);
      }
    });

    it('encontra país e espécie pelo mesmo termo', async () => {
      const res = await get('/search?q=BRASIL').expect(200);
      expect(res.body.countries.map((c: { code: string }) => c.code)).toEqual([
        'BR',
      ]);
      expect(res.body.species.map((s: { slug: string }) => s.slug)).toEqual([
        'caryocar-brasiliense',
      ]);
    });

    it('termo vazio ou com curinga do SQL não traz nada', async () => {
      for (const q of ['', '%', '_']) {
        const res = await get(`/search?q=${encodeURIComponent(q)}`).expect(200);
        expect(res.body).toEqual({ species: [], countries: [] });
      }
    });
  });
});
