// Baixa o DwC-A do IPT do JBRJ para back/.cache/jbrj (pasta ignorada pelo git), extrai
// e lê do eml.xml a versão, a citação e a licença, que vão para a tabela fonte.

import AdmZip from 'adm-zip';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const IPT = 'https://ipt.jbrj.gov.br/jbrj';

export interface Conjunto {
  /** Pasta com os .txt extraídos. */
  pasta: string;
  /** Versão publicada no IPT, ex.: "393.433". */
  versao: string;
  citacao: string;
  licenca: string;
}

/**
 * Usa o arquivo que já está em .cache. Com baixarDeNovo, busca a versão mais nova no IPT.
 * O IPT da Flora atualiza toda semana; o da Fauna, todo mês.
 */
export async function prepararConjunto(
  recurso: string,
  { baixarDeNovo = false } = {},
): Promise<Conjunto> {
  const cache = join(process.cwd(), '.cache', 'jbrj');
  const zip = join(cache, `${recurso}.zip`);
  const pasta = join(cache, recurso);
  mkdirSync(cache, { recursive: true });

  if (baixarDeNovo || !existsSync(zip)) {
    console.log(`Baixando ${recurso}...`);
    const res = await fetch(`${IPT}/archive.do?r=${recurso}`);
    if (!res.ok) {
      throw new Error(`O IPT respondeu ${res.status} ao baixar ${recurso}.`);
    }
    writeFileSync(zip, Buffer.from(await res.arrayBuffer()));
  }
  if (baixarDeNovo || !existsSync(join(pasta, 'eml.xml'))) {
    new AdmZip(zip).extractAllTo(pasta, true);
  }

  const eml = readFileSync(join(pasta, 'eml.xml'), 'utf8');
  return {
    pasta,
    versao: eml.match(/packageId="[^"]*\/v([^"]+)"/)?.[1] ?? 'desconhecida',
    citacao: textoDe(eml.match(/<citation\b[^>]*>([\s\S]*?)<\/citation>/)?.[1]),
    licenca: licencaDe(eml),
  };
}

/** Tira as tags e desfaz os &amp; (o eml da Fauna vem com "&amp;amp;"). */
function textoDe(xml = '') {
  let texto = xml.replace(/<[^>]+>/g, ' ');
  for (let i = 0; i < 3; i++) {
    texto = texto
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&amp;/g, '&');
  }
  return texto.replace(/\s+/g, ' ').trim();
}

function licencaDe(eml: string) {
  const direitos = eml.match(
    /<intellectualRights>([\s\S]*?)<\/intellectualRights>/,
  )?.[1];
  if (direitos?.includes('creativecommons.org/licenses/by/4.0')) {
    return 'CC-BY 4.0 (https://creativecommons.org/licenses/by/4.0/)';
  }
  return textoDe(direitos) || 'não informada';
}
