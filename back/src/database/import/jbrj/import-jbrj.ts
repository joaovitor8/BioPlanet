// Importa espécies reais do JBRJ: Flora e Funga do Brasil e Catálogo Taxonômico da Fauna do Brasil.
// Uso: npm run import:jbrj                       (usa os arquivos já baixados em .cache/jbrj)
//      npm run import:jbrj -- --baixar-de-novo   (busca a versão mais nova no IPT)
// Pode rodar de novo quantas vezes quiser: não duplica nada e não apaga dados de outras fontes.

import dataSource from '../../data-source.js';
import { prepararConjunto } from './arquivos.js';
import { lerFauna, lerFlora } from './especies.js';
import { gravar } from './gravar.js';

const baixarDeNovo = process.argv.includes('--baixar-de-novo');

const importacoes = [
  {
    recurso: 'lista_especies_flora_brasil',
    ler: lerFlora,
    fonte: {
      slug: 'flora-brasil',
      nome: 'Flora e Funga do Brasil',
      descricao:
        'Plantas, algas e fungos: nomes aceitos, forma de vida e distribuição.',
      url: 'https://floradobrasil.jbrj.gov.br',
    },
  },
  {
    recurso: 'catalogo_taxonomico_da_fauna_do_brasil',
    ler: lerFauna,
    fonte: {
      slug: 'fauna-brasil',
      nome: 'Fauna do Brasil',
      descricao: 'Catálogo taxonômico dos animais e sua distribuição.',
      url: 'https://fauna.jbrj.gov.br',
    },
  },
];

await dataSource.initialize();
try {
  for (const { recurso, ler, fonte } of importacoes) {
    const conjunto = await prepararConjunto(recurso, { baixarDeNovo });
    console.log(`\n${fonte.nome} (versão ${conjunto.versao})`);
    const especies = await ler(conjunto.pasta);
    console.log(`  ${especies.length} espécies no recorte`);

    const r = await dataSource.transaction((db) =>
      gravar(db, especies, fonte, conjunto),
    );
    console.log(
      `  espécies novas: ${r.novas} | já existiam (atualizadas): ${r.atualizadas} | puladas: ${r.puladas.length}`,
    );
    console.log(
      `  acrescentados: ${r.nomes} nomes populares, ${r.ocorrencias} países, ${r.biomas} biomas`,
    );
    for (const p of r.puladas) console.log(`  pulada: ${p}`);
    for (const a of r.avisos) console.log(`  aviso: ${a}`);
  }
} finally {
  await dataSource.destroy();
}
