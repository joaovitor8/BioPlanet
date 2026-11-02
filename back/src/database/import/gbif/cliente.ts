// Conversa com a API do GBIF:
// - no máximo 2 chamadas por segundo (o GBIF não publica limite fixo; este ritmo é conservador);
// - cada resposta fica em back/.cache/gbif, então rodar de novo não repete chamadas;
// - se a API pedir para esperar (429) ou falhar, tenta de novo algumas vezes.

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const API = 'https://api.gbif.org/v1';
const INTERVALO_MS = 550;
const TENTATIVAS = 4;
const USER_AGENT = 'BioPlanet/0.1 (projeto de estudo)';

/** Resposta de /species/match (só os campos que usamos). */
export interface MatchGbif {
  usageKey?: number;
  acceptedUsageKey?: number;
  canonicalName?: string;
  matchType: 'EXACT' | 'FUZZY' | 'HIGHERRANK' | 'NONE';
  confidence?: number;
  status?: string;
  rank?: string;
  kingdom?: string;
}

/** Resposta de /occurrence/search com limit=0 e facet=country. */
export interface ContagemGbif {
  count: number;
  facets: { field: string; counts: { name: string; count: number }[] }[];
}

const pasta = () => {
  const p = join(process.cwd(), '.cache', 'gbif');
  mkdirSync(p, { recursive: true });
  return p;
};

let ultimaChamada = 0;
const esperar = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Quantas chamadas de verdade (fora do cache) esta execução fez. */
export const contagem = { rede: 0, cache: 0 };

async function get<T>(
  caminho: string,
  arquivoDoCache: string,
  usarCache: boolean,
): Promise<T> {
  const arquivo = join(pasta(), arquivoDoCache);
  if (usarCache && existsSync(arquivo)) {
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
      writeFileSync(arquivo, corpo);
      return JSON.parse(corpo) as T;
    }
    if (res && res.status !== 429 && res.status < 500) {
      throw new Error(`O GBIF respondeu ${res.status} em ${caminho}`);
    }
    if (tentativa >= TENTATIVAS) {
      throw new Error(
        `O GBIF não respondeu em ${caminho} (status ${res?.status ?? 'sem resposta'})`,
      );
    }
    await esperar(res?.status === 429 ? 60_000 : 5_000 * tentativa);
  }
}

const seguro = (texto: string) =>
  texto.toLowerCase().replace(/[^a-z0-9]+/g, '-');

/** Procura a espécie no GBIF pelo nome científico, dentro do reino (strict: sem chutar nomes parecidos). */
export function buscarMatch(nomeCientifico: string, reinoGbif: string) {
  const nome = encodeURIComponent(nomeCientifico);
  return get<MatchGbif>(
    `/species/match?name=${nome}&kingdom=${reinoGbif}&strict=true`,
    `match-${seguro(reinoGbif)}-${seguro(nomeCientifico)}.json`,
    true,
  );
}

/**
 * Total de registros da espécie e quantos em cada país, numa chamada só (facet por país).
 * Os números mudam toda semana: com atualizar, ignora o que está no cache.
 */
export function buscarContagem(taxonKey: number, { atualizar = false } = {}) {
  return get<ContagemGbif>(
    `/occurrence/search?taxonKey=${taxonKey}&limit=0&facet=country&facetLimit=300`,
    `contagem-${taxonKey}.json`,
    !atualizar,
  );
}
