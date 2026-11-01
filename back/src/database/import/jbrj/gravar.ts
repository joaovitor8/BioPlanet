// Grava as espécies importadas sem duplicar nada e sem apagar dados de outras fontes:
// - Espécie nova: entra completa.
// - Espécie que já existe (mesmo nome científico): só autoria e taxonomia são atualizadas.
//   Nome popular, grupo, resumo e status ficam como estão.
// - Nomes populares, países e biomas só são acrescentados, nunca removidos.

import { In, type EntityManager } from 'typeorm';
import { BiomaNacional, Especie, Fonte, Pais } from '../../entities/index.js';
import { EscopoFonte } from '../../enums.js';
import type { Conjunto } from './arquivos.js';
import type { EspecieImportada } from './especies.js';

export interface DadosDaFonte {
  slug: string;
  nome: string;
  descricao: string;
  url: string;
}

export interface Resumo {
  novas: number;
  atualizadas: number;
  puladas: string[];
  nomes: number;
  ocorrencias: number;
  biomas: number;
  avisos: string[];
}

const semAcento = (texto: string) =>
  texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

function* emLotes<T>(lista: T[], tamanho: number) {
  for (let i = 0; i < lista.length; i += tamanho) {
    yield lista.slice(i, i + tamanho);
  }
}

/** Rode dentro de uma transação: se algo falhar, nada fica pela metade. */
export async function gravar(
  db: EntityManager,
  importadas: EspecieImportada[],
  dadosDaFonte: DadosDaFonte,
  conjunto: Conjunto,
): Promise<Resumo> {
  const resumo: Resumo = {
    novas: 0,
    atualizadas: 0,
    puladas: [],
    nomes: 0,
    ocorrencias: 0,
    biomas: 0,
    avisos: [],
  };

  // Países e biomas vêm do seed (ou de quem cadastrar). Sem eles não há onde ligar as espécies.
  const paises = await db.find(Pais);
  const brasil = paises.find((p) => p.codigo === 'BR');
  if (!brasil) {
    throw new Error(
      'O Brasil não está na tabela pais. Rode npm run migration:run e npm run seed antes do primeiro import.',
    );
  }
  const paisPorCodigo = new Map(paises.map((p) => [p.codigo, p.id]));
  const biomasDoBrasil = await db.find(BiomaNacional, {
    where: { pais: { id: brasil.id } },
  });
  const biomaPorNome = new Map(
    biomasDoBrasil.map((b) => [semAcento(b.nome), b.id]),
  );

  // Fonte: crédito exigido pela licença e versão importada.
  const fonte =
    (await db.findOneBy(Fonte, { slug: dadosDaFonte.slug })) ??
    db.create(Fonte, { ...dadosDaFonte, escopo: EscopoFonte.Nacional });
  Object.assign(fonte, {
    citacao: conjunto.citacao,
    licenca: conjunto.licenca,
    versao: conjunto.versao,
    importadoEm: new Date(),
  });
  await db.save(fonte);
  await db.query(
    'INSERT INTO pais_fonte (pais_id, fonte_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
    [brasil.id, fonte.id],
  );

  // Uma espécie por nome científico, mesmo que o arquivo repita.
  const especies = [
    ...new Map(importadas.map((e) => [e.nomeCientifico, e])).values(),
  ];

  const existentes = await db.find(Especie, {
    where: { nomeCientifico: In(especies.map((e) => e.nomeCientifico)) },
    select: { id: true, nomeCientifico: true, nomePopular: true, reino: true },
  });
  const existentePorNome = new Map(
    existentes.map((e) => [e.nomeCientifico, e]),
  );
  const slugsDeOutros = new Set(
    (
      await db.find(Especie, {
        where: { slug: In(especies.map((e) => e.slug)) },
        select: { slug: true, nomeCientifico: true },
      })
    )
      .filter((e) => !existentePorNome.has(e.nomeCientifico))
      .map((e) => e.slug),
  );

  const idPorNome = new Map<string, number>();
  const novas: EspecieImportada[] = [];
  for (const e of especies) {
    const atual = existentePorNome.get(e.nomeCientifico);
    if (!atual) {
      if (slugsDeOutros.has(e.slug)) {
        resumo.puladas.push(
          `${e.nomeCientifico}: o endereço /especie/${e.slug} já é de outra espécie`,
        );
      } else {
        novas.push(e);
      }
      continue;
    }
    if (atual.reino !== e.reino) {
      resumo.puladas.push(`${e.nomeCientifico}: já existe como ${atual.reino}`);
      continue;
    }
    // Troca o nome popular só se o atual for o nome científico (sem nome de verdade ainda).
    const ganhaNome =
      atual.nomePopular === atual.nomeCientifico &&
      e.nomePopular !== e.nomeCientifico;
    await db.update(Especie, atual.id, {
      autoria: e.autoria,
      ...e.taxonomia,
      ...(ganhaNome ? { nomePopular: e.nomePopular } : {}),
    });
    idPorNome.set(e.nomeCientifico, atual.id);
    resumo.atualizadas++;
  }

  for (const lote of emLotes(novas, 500)) {
    const inseridas = await db.insert(
      Especie,
      lote.map((e) => ({
        slug: e.slug,
        nomeCientifico: e.nomeCientifico,
        autoria: e.autoria,
        nomePopular: e.nomePopular,
        reino: e.reino,
        grupo: e.grupo,
        ...e.taxonomia,
      })),
    );
    lote.forEach((e, i) =>
      idPorNome.set(e.nomeCientifico, inseridas.identifiers[i].id),
    );
    resumo.novas += lote.length;
  }

  const gravadas = especies.filter((e) => idPorNome.has(e.nomeCientifico));
  const ids = gravadas.map((e) => idPorNome.get(e.nomeCientifico)!);

  // Nomes populares: só os que a espécie ainda não tem (comparando sem maiúsculas).
  const jaConhecidos = new Set(
    (
      (await db.query(
        `SELECT especie_id AS id, lower(nome) AS nome FROM nome_alternativo WHERE especie_id = ANY($1)
         UNION SELECT id, lower(nome_popular) FROM especie WHERE id = ANY($1)`,
        [ids],
      )) as { id: number; nome: string }[]
    ).map((r) => `${r.id}|${r.nome}`),
  );
  const nomesNovos: { id: number; nome: string }[] = [];
  for (const e of gravadas) {
    const id = idPorNome.get(e.nomeCientifico)!;
    for (const nome of [e.nomePopular, ...e.outrosNomes]) {
      const chave = `${id}|${nome.toLowerCase()}`;
      if (nome === e.nomeCientifico || jaConhecidos.has(chave)) continue;
      jaConhecidos.add(chave);
      nomesNovos.push({ id, nome });
    }
  }
  if (nomesNovos.length > 0) {
    await db.query(
      `INSERT INTO nome_alternativo (especie_id, nome, idioma)
       SELECT id, nome, 'pt' FROM unnest($1::int[], $2::text[]) AS t(id, nome)`,
      [nomesNovos.map((n) => n.id), nomesNovos.map((n) => n.nome)],
    );
  }
  resumo.nomes = nomesNovos.length;

  // Países: só os que já existem na tabela pais.
  const ocorrencias = gravadas.flatMap((e) =>
    e.paises
      .filter((codigo) => paisPorCodigo.has(codigo))
      .map((codigo) => [
        idPorNome.get(e.nomeCientifico)!,
        paisPorCodigo.get(codigo)!,
      ]),
  );
  resumo.ocorrencias = (
    await db.query(
      `INSERT INTO ocorrencia (especie_id, pais_id)
       SELECT * FROM unnest($1::int[], $2::int[]) ON CONFLICT DO NOTHING RETURNING especie_id`,
      [ocorrencias.map((o) => o[0]), ocorrencias.map((o) => o[1])],
    )
  ).length;

  // Biomas do Brasil, ligados pelo nome ("Mata Atlântica" → bioma mata-atlantica).
  const biomas: [number, number][] = [];
  const desconhecidos = new Set<string>();
  for (const e of gravadas) {
    for (const nome of e.biomas) {
      const biomaId = biomaPorNome.get(semAcento(nome));
      if (biomaId) biomas.push([idPorNome.get(e.nomeCientifico)!, biomaId]);
      else desconhecidos.add(nome);
    }
  }
  resumo.biomas = (
    await db.query(
      `INSERT INTO ocorrencia_bioma (especie_id, bioma_nacional_id)
       SELECT * FROM unnest($1::int[], $2::int[]) ON CONFLICT DO NOTHING RETURNING especie_id`,
      [biomas.map((b) => b[0]), biomas.map((b) => b[1])],
    )
  ).length;
  for (const nome of desconhecidos) {
    resumo.avisos.push(
      `bioma "${nome}" não existe na tabela bioma_nacional; ligação ignorada`,
    );
  }

  return resumo;
}
