// Grava fotos e nomes do iNaturalist sem duplicar nada:
// - foto: a mesma (espécie, url) não entra duas vezes; se já existe, só atualiza crédito e ordem;
// - nome popular: só substitui quando o atual é o próprio nome científico (espécie sem nome);
// - senão, o nome do iNaturalist vira nome alternativo, se a espécie ainda não o tiver.

import type { EntityManager } from 'typeorm';
import type { FotoEscolhida } from './fotos.js';

export interface ItemImportado {
  especieId: number;
  nomeCientifico: string;
  nomePopular: string;
  fotos: FotoEscolhida[];
  nomeEmPortugues: string | null;
}

export interface Resumo {
  fotosNovas: number;
  fotosAtualizadas: number;
  nomesPopulares: number;
  nomesAlternativos: number;
}

/** Rode dentro de uma transação. */
export async function gravar(
  db: EntityManager,
  itens: ItemImportado[],
  fonteId: number,
): Promise<Resumo> {
  const resumo: Resumo = {
    fotosNovas: 0,
    fotosAtualizadas: 0,
    nomesPopulares: 0,
    nomesAlternativos: 0,
  };

  const fotos = itens.flatMap((item) =>
    item.fotos.map((f, ordem) => ({ ...f, especieId: item.especieId, ordem })),
  );
  if (fotos.length > 0) {
    // xmax = 0 quer dizer que a linha acabou de ser inserida (não veio de um UPDATE).
    const linhas: { nova: boolean }[] = await db.query(
      `INSERT INTO foto (especie_id, url, url_miniatura, autor, licenca, link_original, fonte_id, ordem)
       SELECT e, u, m, a, l, o, $7, r
       FROM unnest($1::int[], $2::text[], $3::text[], $4::text[], $5::text[], $6::text[], $8::int[])
         AS t(e, u, m, a, l, o, r)
       ON CONFLICT (especie_id, url) DO UPDATE SET
         url_miniatura = EXCLUDED.url_miniatura,
         autor = EXCLUDED.autor,
         licenca = EXCLUDED.licenca,
         link_original = EXCLUDED.link_original,
         ordem = EXCLUDED.ordem
       RETURNING (xmax = 0) AS nova`,
      [
        fotos.map((f) => f.especieId),
        fotos.map((f) => f.url),
        fotos.map((f) => f.urlMiniatura),
        fotos.map((f) => f.autor),
        fotos.map((f) => f.licenca),
        fotos.map((f) => f.linkOriginal),
        fonteId,
        fotos.map((f) => f.ordem),
      ],
    );
    resumo.fotosNovas = linhas.filter((l) => l.nova).length;
    resumo.fotosAtualizadas = linhas.length - resumo.fotosNovas;
  }

  for (const item of itens) {
    const nome = item.nomeEmPortugues;
    if (!nome) continue;
    if (item.nomePopular === item.nomeCientifico) {
      // A condição repetida no SQL garante que um nome de verdade nunca é sobrescrito.
      const [, alteradas] = (await db.query(
        `UPDATE especie SET nome_popular = $2, atualizado_em = now()
         WHERE id = $1 AND nome_popular = nome_cientifico`,
        [item.especieId, nome],
      )) as [unknown, number];
      resumo.nomesPopulares += alteradas;
      continue;
    }
    if (nome.toLowerCase() === item.nomePopular.toLowerCase()) continue;
    const inseridos: unknown[] = await db.query(
      `INSERT INTO nome_alternativo (especie_id, nome, idioma)
       SELECT $1, $2, 'pt'
       WHERE NOT EXISTS (
         SELECT 1 FROM nome_alternativo WHERE especie_id = $1 AND lower(nome) = lower($2)
       )
       RETURNING id`,
      [item.especieId, nome],
    );
    resumo.nomesAlternativos += inseridos.length;
  }

  return resumo;
}
