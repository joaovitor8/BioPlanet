// Apaga o conteúdo das tabelas e insere os dados de exemplo.
// Usado pelo npm run seed e pelos testes e2e (que preparam o banco de testes com ele).

import type { EntityManager } from 'typeorm';
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
  destaques,
  especies,
  fontes,
  paises,
} from './dados-exemplo.js';

/** Rode dentro de uma transação, para não deixar o banco pela metade se algo falhar. */
export async function semear(db: EntityManager) {
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
        destaque: destaques[codigo]?.includes(e.slug) ?? false,
      })),
    );
  }
}
