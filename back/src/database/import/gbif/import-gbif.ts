// Liga cada espécie ao GBIF e guarda quantos registros de ocorrência ela tem (no total e por país).
// Uso: npm run import:gbif
//      npm run import:gbif -- --atualizar-contagens   (busca os números de novo; os matches vêm do cache)
// Rodar de novo não duplica nada: só atualiza colunas. Os pontos de ocorrência não vão para o banco.

import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import dataSource from '../../data-source.js';
import type { Reino } from '../../enums.js';
import { buscarContagem, buscarMatch, contagem } from './cliente.js';
import { REINO_GBIF, avaliarMatch, registrosPorPais } from './regras.js';

const atualizar = process.argv.includes('--atualizar-contagens');

await dataSource.initialize();
try {
  const especies: { id: number; nome_cientifico: string; reino: Reino }[] =
    await dataSource.query(
      'SELECT id, nome_cientifico, reino FROM especie ORDER BY id',
    );
  console.log(`${especies.length} espécies no banco. Buscando no GBIF...`);

  let ligadas = 0;
  const recusadas: { especie: string; motivo: string }[] = [];
  const falhas: string[] = [];

  for (const [i, e] of especies.entries()) {
    try {
      const match = await buscarMatch(e.nome_cientifico, REINO_GBIF[e.reino]);
      const r = avaliarMatch(match, e.nome_cientifico, e.reino);
      if (!r.aceito) {
        recusadas.push({ especie: e.nome_cientifico, motivo: r.motivo });
        console.log(`  não ligada: ${e.nome_cientifico} (${r.motivo})`);
        continue;
      }

      const c = await buscarContagem(r.taxonKey, { atualizar });
      const porPais = registrosPorPais(c);
      await dataSource.transaction(async (db) => {
        await db.query(
          `UPDATE especie SET gbif_taxon_key = $2, gbif_registros = $3, gbif_atualizado_em = now()
           WHERE id = $1`,
          [e.id, r.taxonKey, c.count],
        );
        // Países onde a espécie ocorre no nosso banco; sem registro no GBIF, fica 0.
        await db.query(
          `UPDATE ocorrencia o SET gbif_registros = COALESCE((
             SELECT t.n FROM unnest($2::text[], $3::int[]) AS t(codigo, n)
             JOIN pais p ON p.codigo = t.codigo WHERE p.id = o.pais_id
           ), 0)
           WHERE o.especie_id = $1`,
          [e.id, [...porPais.keys()], [...porPais.values()]],
        );
      });
      ligadas++;
    } catch (erro) {
      falhas.push(`${e.nome_cientifico}: ${(erro as Error).message}`);
    }

    const feitas = i + 1;
    if (feitas % 200 === 0 || feitas === especies.length) {
      console.log(
        `  ${feitas}/${especies.length} espécies · ligadas ao GBIF: ${ligadas} · chamadas: ${contagem.rede} (cache: ${contagem.cache})`,
      );
    }
  }

  // O relatório fica em .cache/gbif para consulta (não vai para o git).
  const relatorio = join(
    process.cwd(),
    '.cache',
    'gbif',
    'ultimo-relatorio.json',
  );
  writeFileSync(
    relatorio,
    JSON.stringify({ ligadas, recusadas, falhas }, null, 2),
  );

  console.log('\nResumo:');
  console.log(
    `  espécies ligadas ao GBIF (com taxonKey): ${ligadas} de ${especies.length}`,
  );
  console.log(
    `  não ligadas (match não exato ou não confiável): ${recusadas.length}`,
  );
  const motivos = new Map<string, number>();
  for (const r of recusadas) {
    const tipo = r.motivo.split(':')[0];
    motivos.set(tipo, (motivos.get(tipo) ?? 0) + 1);
  }
  for (const [m, n] of motivos) console.log(`    ${m}: ${n}`);
  console.log(
    `  chamadas ao GBIF: ${contagem.rede} | respostas do cache: ${contagem.cache}`,
  );
  console.log(
    `  relatório com cada espécie não ligada: .cache/gbif/ultimo-relatorio.json`,
  );
  for (const f of falhas) console.log(`  falha: ${f}`);
  if (falhas.length > 0)
    console.log(
      '  Rode de novo para tentar só o que falhou (o resto vem do cache).',
    );
} finally {
  await dataSource.destroy();
}
