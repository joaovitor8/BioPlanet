// Busca fotos (com autor e licença) e nomes populares no iNaturalist para todas as espécies do banco.
// Uso: npm run import:inaturalist
// A primeira execução demora (1 chamada por segundo, ~40 min para 2 mil espécies).
// As respostas ficam em .cache/inaturalist: rodar de novo é rápido e não duplica nada.

import dataSource from '../../data-source.js';
import { Fonte } from '../../entities/index.js';
import { EscopoFonte, Reino } from '../../enums.js';
import { buscarTaxon, contagem, detalharTaxons } from './cliente.js';
import { escolherFotos, escolherTaxon, nomeEmPortugues } from './fotos.js';
import { gravar, type ItemImportado, type Resumo } from './gravar.js';

const LOTE = 30;

await dataSource.initialize();
try {
  const fonte =
    (await dataSource.manager.findOneBy(Fonte, { slug: 'inaturalist' })) ??
    dataSource.manager.create(Fonte, {
      slug: 'inaturalist',
      nome: 'iNaturalist',
      descricao:
        'Fotos com licença Creative Commons e nomes populares em vários idiomas.',
      url: 'https://www.inaturalist.org',
      escopo: EscopoFonte.Global,
    });
  Object.assign(fonte, {
    citacao:
      'Fotos e nomes populares: iNaturalist (https://www.inaturalist.org). Cada foto tem autor e licença próprios.',
    licenca: 'Licença de cada foto: CC0, CC BY, CC BY-SA ou CC BY-NC',
    versao: new Date().toISOString().slice(0, 10),
    importadoEm: new Date(),
  });
  await dataSource.manager.save(fonte);

  const especies: {
    id: number;
    nome_cientifico: string;
    nome_popular: string;
    reino: Reino;
  }[] = await dataSource.query(
    'SELECT id, nome_cientifico, nome_popular, reino FROM especie ORDER BY id',
  );
  console.log(
    `${especies.length} espécies no banco. Buscando no iNaturalist...`,
  );

  const total: Resumo = {
    fotosNovas: 0,
    fotosAtualizadas: 0,
    nomesPopulares: 0,
    nomesAlternativos: 0,
  };
  let semTaxon = 0;
  let comFoto = 0;
  const falhas: string[] = [];

  for (let i = 0; i < especies.length; i += LOTE) {
    const lote = especies.slice(i, i + LOTE);

    const taxonDe = new Map<number, number>();
    for (const e of lote) {
      try {
        const taxon = escolherTaxon(
          await buscarTaxon(e.nome_cientifico),
          e.nome_cientifico,
          e.reino,
        );
        if (taxon) taxonDe.set(e.id, taxon.id);
        else semTaxon++;
      } catch (erro) {
        falhas.push(`${e.nome_cientifico}: ${(erro as Error).message}`);
      }
    }

    let detalhes: Awaited<ReturnType<typeof detalharTaxons>>;
    try {
      detalhes = await detalharTaxons([...taxonDe.values()]);
    } catch (erro) {
      falhas.push(`lote ${i / LOTE + 1}: ${(erro as Error).message}`);
      continue;
    }

    const itens: ItemImportado[] = [];
    for (const e of lote) {
      const taxon = detalhes.get(taxonDe.get(e.id) ?? -1);
      if (!taxon) continue;
      const fotos = escolherFotos(taxon);
      if (fotos.length > 0) comFoto++;
      itens.push({
        especieId: e.id,
        nomeCientifico: e.nome_cientifico,
        nomePopular: e.nome_popular,
        fotos,
        nomeEmPortugues: nomeEmPortugues(taxon),
      });
    }

    const r = await dataSource.transaction((db) => gravar(db, itens, fonte.id));
    for (const k of Object.keys(total) as (keyof Resumo)[]) total[k] += r[k];

    const feitas = Math.min(i + LOTE, especies.length);
    if (feitas % 150 === 0 || feitas === especies.length) {
      console.log(
        `  ${feitas}/${especies.length} espécies · com foto: ${comFoto} · chamadas à API: ${contagem.rede} (cache: ${contagem.cache})`,
      );
    }
  }

  console.log('\nResumo:');
  console.log(`  espécies com foto: ${comFoto} de ${especies.length}`);
  console.log(`  sem táxon com o mesmo nome no iNaturalist: ${semTaxon}`);
  console.log(
    `  fotos novas: ${total.fotosNovas} | já existiam (atualizadas): ${total.fotosAtualizadas}`,
  );
  console.log(
    `  nomes populares preenchidos: ${total.nomesPopulares} | nomes alternativos novos: ${total.nomesAlternativos}`,
  );
  console.log(
    `  chamadas à API: ${contagem.rede} | respostas do cache: ${contagem.cache}`,
  );
  for (const f of falhas) console.log(`  falha: ${f}`);
  if (falhas.length > 0)
    console.log(
      '  Rode de novo para tentar só o que falhou (o resto vem do cache).',
    );
} finally {
  await dataSource.destroy();
}
