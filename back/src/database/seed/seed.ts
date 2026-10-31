// Preenche o banco com os dados de exemplo.
// Uso: npm run seed   (apaga o conteúdo das tabelas antes de inserir!)

import dataSource from '../data-source.js';
import { Reino } from '../enums.js';
import {
  BiomaGlobal,
  BiomaNacional,
  Especie,
  Fonte,
  NomeAlternativo,
  Ocorrencia,
  Pais,
} from '../entities/index.js';
import {
  biomasGlobais,
  biomasNacionais,
  especies,
  fontes,
  paises,
} from './dados-exemplo.js';

if (process.env.NODE_ENV === 'production') {
  throw new Error('O seed apaga dados. Não rode em produção.');
}

await dataSource.initialize();

await dataSource.transaction(async (db) => {
  // Limpa tudo. CASCADE apaga também as tabelas de ligação.
  await db.query(
    'truncate table ocorrencia_bioma, ocorrencia, nome_alternativo, especie, bioma_nacional, pais_fonte, pais, bioma_global, fonte restart identity cascade',
  );

  const fontesSalvas = await db.save(Fonte, fontes);
  const fontePorSlug = new Map(fontesSalvas.map((f) => [f.slug, f]));

  const paisesSalvos = await db.save(
    Pais,
    paises.map(({ fontes: slugs = [], ...p }) => ({
      ...p,
      fontes: slugs.map((s) => fontePorSlug.get(s)!),
    })),
  );
  const paisPorCodigo = new Map(paisesSalvos.map((p) => [p.codigo, p]));

  const globaisSalvos = await db.save(BiomaGlobal, biomasGlobais);
  const globalPorNumero = new Map(globaisSalvos.map((b) => [b.numero, b]));

  const nacionaisSalvos = await db.save(
    BiomaNacional,
    biomasNacionais.map(({ pais, biomaGlobal, ...b }) => ({
      ...b,
      pais: paisPorCodigo.get(pais)!,
      biomaGlobal: globalPorNumero.get(biomaGlobal)!,
    })),
  );
  const biomaBR = new Map(nacionaisSalvos.map((b) => [b.slug, b]));

  const salve = fontePorSlug.get('salve')!;
  for (const e of especies) {
    const especie = await db.save(Especie, {
      slug: e.slug,
      nomeCientifico: e.nomeCientifico,
      autoria: e.autoria ?? null,
      nomePopular: e.nomePopular,
      reino: e.reino,
      grupo: e.grupo,
      ...e.taxonomia,
      statusGlobal: e.statusGlobal ?? null,
      resumo: e.resumo ?? null,
      biomas: e.biomasBR.map((slug) => biomaBR.get(slug)!),
    });

    await db.save(
      NomeAlternativo,
      (e.outrosNomes ?? []).map((nome) => ({ especie, nome, idioma: 'pt' })),
    );

    await db.save(
      Ocorrencia,
      Object.entries(e.paises).map(([codigo, status]) => ({
        especieId: especie.id,
        paisId: paisPorCodigo.get(codigo)!.id,
        statusNacional: status,
        // Só o Brasil tem lista nacional integrada. O SALVE cobre a fauna; a fonte da flora entra depois.
        fonteStatus:
          status && codigo === 'BR' && e.reino === Reino.Fauna ? salve : null,
      })),
    );
  }
});

const contar = async (tabela: string) =>
  Number(
    (await dataSource.query(`select count(*)::int as n from ${tabela}`))[0].n,
  );

console.log('Seed concluído:');
for (const t of [
  'fonte',
  'pais',
  'bioma_global',
  'bioma_nacional',
  'especie',
  'nome_alternativo',
  'ocorrencia',
  'ocorrencia_bioma',
]) {
  console.log(`  ${t}: ${await contar(t)}`);
}

await dataSource.destroy();
