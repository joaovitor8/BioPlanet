// Conversa com a API do iNaturalist respeitando as regras de uso:
// - no máximo 1 chamada por segundo (esperamos 1,1 s para ter folga);
// - cada resposta fica guardada em back/.cache/inaturalist, então rodar de novo não repete chamadas;
// - se a API pedir para esperar (429) ou falhar, tenta de novo algumas vezes.

import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const API = 'https://api.inaturalist.org/v1';
const INTERVALO_MS = 1100;
const TENTATIVAS = 4;
// O iNaturalist pede um User-Agent que identifique quem está chamando.
const USER_AGENT = 'BioPlanet/0.1 (projeto de estudo)';

export interface FotoINat {
  id: number;
  license_code: string | null;
  attribution: string;
  attribution_name?: string | null;
  url: string;
  medium_url?: string;
  large_url?: string;
}

export interface TaxonINat {
  id: number;
  name: string;
  rank: string;
  is_active: boolean;
  iconic_taxon_name?: string | null;
  preferred_common_name?: string;
  names?: { name: string; locale: string; is_valid?: boolean }[];
  taxon_photos?: { photo: FotoINat }[];
}

const pasta = () => {
  const p = join(process.cwd(), '.cache', 'inaturalist');
  mkdirSync(p, { recursive: true });
  return p;
};

let ultimaChamada = 0;
const esperar = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Quantas chamadas de verdade (fora do cache) esta execução fez. */
export const contagem = { rede: 0, cache: 0 };

/** GET com cache em disco. Sem chaveDoCache, a resposta não é guardada (quem chama guarda). */
async function get<T>(
  caminho: string,
  chaveDoCache: string | null,
): Promise<T> {
  const arquivo = chaveDoCache && join(pasta(), `${chaveDoCache}.json`);
  if (arquivo && existsSync(arquivo)) {
    contagem.cache++;
    return JSON.parse(readFileSync(arquivo, 'utf8')) as T;
  }

  for (let tentativa = 1; ; tentativa++) {
    const falta = ultimaChamada + INTERVALO_MS - Date.now();
    if (falta > 0) await esperar(falta);
    ultimaChamada = Date.now();
    contagem.rede++;

    let res: Response | undefined;
    try {
      res = await fetch(API + caminho, {
        headers: { 'User-Agent': USER_AGENT },
      });
    } catch (erro) {
      if (tentativa >= TENTATIVAS) throw erro;
    }
    if (res?.ok) {
      const corpo = await res.text();
      if (arquivo) writeFileSync(arquivo, corpo);
      return JSON.parse(corpo) as T;
    }
    if (res && res.status !== 429 && res.status < 500) {
      throw new Error(`O iNaturalist respondeu ${res.status} em ${caminho}`);
    }
    if (tentativa >= TENTATIVAS) {
      throw new Error(
        `O iNaturalist não respondeu em ${caminho} (status ${res?.status ?? 'sem resposta'})`,
      );
    }
    // 429 = "espere um pouco". Esperamos cada vez mais.
    await esperar(res?.status === 429 ? 60_000 : 5_000 * tentativa);
  }
}

const hash = (texto: string) => createHash('sha1').update(texto).digest('hex');

/** Busca táxons pelo nome. A busca do iNaturalist é aproximada: confira o nome no resultado. */
export async function buscarTaxon(nomeCientifico: string) {
  const q = encodeURIComponent(nomeCientifico);
  const caminho = `/taxa?q=${q}&rank=species&is_active=true&per_page=10&locale=pt-BR`;
  const r = await get<{ results: TaxonINat[] }>(
    caminho,
    `busca-${hash(caminho)}`,
  );
  return r.results;
}

/**
 * Detalhes (fotos e nomes em todos os idiomas) de vários táxons, até 30 por chamada.
 * O cache é por táxon: rodar de novo só pede os que ainda não foram baixados.
 */
export async function detalharTaxons(ids: number[]) {
  const porId = new Map<number, TaxonINat>();
  const faltam: number[] = [];
  for (const id of ids) {
    const arquivo = join(pasta(), `taxon-${id}.json`);
    if (existsSync(arquivo)) {
      contagem.cache++;
      porId.set(id, JSON.parse(readFileSync(arquivo, 'utf8')) as TaxonINat);
    } else {
      faltam.push(id);
    }
  }
  for (let i = 0; i < faltam.length; i += 30) {
    const lote = faltam.slice(i, i + 30);
    const caminho = `/taxa/${lote.join(',')}?all_names=true&locale=pt-BR`;
    const r = await get<{ results: TaxonINat[] }>(caminho, null);
    for (const t of r.results) {
      writeFileSync(join(pasta(), `taxon-${t.id}.json`), JSON.stringify(t));
      porId.set(t.id, t);
    }
  }
  return porId;
}
