// Preenche o banco com os dados de exemplo.
// Uso: npm run seed   (apaga o conteúdo das tabelas antes de inserir, inclusive o que foi importado!)

import dataSource from '../data-source.js';
import { semear } from './semear.js';

if (process.env.NODE_ENV === 'production') {
  throw new Error('O seed apaga dados. Não rode em produção.');
}

await dataSource.initialize();
await dataSource.transaction(semear);

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
