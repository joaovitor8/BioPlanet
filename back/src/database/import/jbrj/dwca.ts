// Leitura dos arquivos de um Darwin Core Archive (DwC-A) já extraído.
// Os arquivos do IPT do JBRJ são texto separado por tabulação, com cabeçalho na primeira linha.

import { createReadStream } from 'node:fs';
import { createInterface } from 'node:readline';

/** Lê um arquivo .txt linha a linha, sem carregar tudo na memória (o taxon.txt tem ~100 MB). */
export async function* lerTabela(
  caminho: string,
): AsyncGenerator<Record<string, string>> {
  const linhas = createInterface({
    input: createReadStream(caminho, 'utf8'),
    crlfDelay: Infinity,
  });
  let cabecalho: string[] | undefined;
  for await (const linha of linhas) {
    const colunas = linha.split('\t');
    if (!cabecalho) {
      cabecalho = colunas;
      continue;
    }
    yield Object.fromEntries(cabecalho.map((c, i) => [c, colunas[i] ?? '']));
  }
}

/** Algumas colunas da Flora guardam JSON. Texto que não é JSON vira null. */
export function lerJson<T>(texto: string): T | null {
  if (!texto) return null;
  try {
    return JSON.parse(texto) as T;
  } catch {
    return null;
  }
}
