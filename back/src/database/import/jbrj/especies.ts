// Transforma as linhas do DwC-A em espécies no formato do nosso banco, aplicando o recorte:
// - Flora: espécie aceita, nativa, forma de vida inclui "Árvore" e ocorre no Cerrado.
// - Fauna: espécie aceita de mamífero ou ave, nativa do Brasil e registrada no DF.
//   O DwC-A da Fauna não traz bioma; o DF fica 100% no Cerrado, então quem ocorre
//   no DF ocorre no Cerrado. A regra é segura, mas deixa de fora quem não tem registro no DF.

import { join } from 'node:path';
import { Reino } from '../../enums.js';
import { lerJson, lerTabela } from './dwca.js';

export interface EspecieImportada {
  /** Gênero + epíteto, sem o autor: "Caryocar brasiliense". É a chave do upsert. */
  nomeCientifico: string;
  slug: string;
  autoria: string | null;
  /** Primeiro nome popular em português, ou o nome científico quando não há nenhum. */
  nomePopular: string;
  outrosNomes: string[];
  reino: Reino;
  grupo: string;
  taxonomia: {
    taxReino: string | null;
    taxFilo: string | null;
    taxClasse: string | null;
    taxOrdem: string | null;
    taxFamilia: string | null;
    taxGenero: string | null;
  };
  /** Códigos ISO dos países onde é nativa. */
  paises: string[];
  /** Nomes dos biomas do Brasil, como o JBRJ escreve: "Mata Atlântica". */
  biomas: string[];
}

/** Tudo o que os arquivos dizem sobre um táxon, já juntado pelo id. */
export interface LinhasDoTaxon {
  taxon: Record<string, string>;
  formasDeVida: Set<string>;
  dominios: Set<string>;
  /** Países com registro de espécie nativa (Flora: "Nativa"; Fauna: "native"). */
  paisesNativos: Set<string>;
  ufs: Set<string>;
  nomesEmPortugues: string[];
}

const NATIVA = new Set(['Nativa', 'native']);
const GRUPO_FAUNA: Record<string, string> = {
  Mammalia: 'Mamífero',
  Aves: 'Ave',
};

export function slugDe(nomeCientifico: string) {
  return nomeCientifico
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/×/g, 'x')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function capitalizar(texto: string) {
  return texto.charAt(0).toLocaleUpperCase('pt-BR') + texto.slice(1);
}

export function montarFlora(l: LinhasDoTaxon): EspecieImportada | null {
  const t = l.taxon;
  if (t.taxonRank !== 'ESPECIE' || t.taxonomicStatus !== 'NOME_ACEITO')
    return null;
  if (!l.dominios.has('Cerrado') || !l.formasDeVida.has('Árvore')) return null;
  if (!l.paisesNativos.has('BR')) return null;
  return montar(l, Reino.Flora, 'Árvore', [...l.dominios]);
}

export function montarFauna(l: LinhasDoTaxon): EspecieImportada | null {
  const t = l.taxon;
  const grupo = GRUPO_FAUNA[t.class];
  if (t.taxonRank !== 'species' || t.taxonomicStatus !== 'accepted' || !grupo) {
    return null;
  }
  if (!l.paisesNativos.has('BR') || !l.ufs.has('DF')) return null;
  return montar(l, Reino.Fauna, grupo, ['Cerrado']);
}

function montar(
  l: LinhasDoTaxon,
  reino: Reino,
  grupo: string,
  biomas: string[],
): EspecieImportada | null {
  const t = l.taxon;
  if (!t.genus || !t.specificEpithet) return null;
  const nomeCientifico = `${t.genus} ${t.specificEpithet}`;
  const [primeiro, ...outros] = l.nomesEmPortugues;
  return {
    nomeCientifico,
    slug: slugDe(nomeCientifico),
    autoria: t.scientificNameAuthorship || null,
    nomePopular: primeiro ? capitalizar(primeiro) : nomeCientifico,
    outrosNomes: outros,
    reino,
    grupo,
    taxonomia: {
      taxReino: t.kingdom || null,
      taxFilo: t.phylum || null,
      taxClasse: t.class || null,
      taxOrdem: t.order || null,
      taxFamilia: t.family || null,
      taxGenero: t.genus || null,
    },
    paises: [...l.paisesNativos],
    biomas,
  };
}

/**
 * Lê o taxon.txt guardando só os táxons que passam em `candidato` e depois
 * percorre os outros arquivos juntando as linhas desses táxons.
 */
async function juntarLinhas(
  pasta: string,
  candidato: (taxon: Record<string, string>) => boolean,
  idiomaPortugues: string,
) {
  const porId = new Map<string, LinhasDoTaxon>();
  for await (const taxon of lerTabela(join(pasta, 'taxon.txt'))) {
    if (!candidato(taxon)) continue;
    porId.set(taxon.id, {
      taxon,
      formasDeVida: new Set(),
      dominios: new Set(),
      paisesNativos: new Set(),
      ufs: new Set(),
      nomesEmPortugues: [],
    });
  }

  for await (const r of lerTabela(join(pasta, 'speciesprofile.txt'))) {
    const l = porId.get(r.id);
    // Na Flora, lifeForm é um JSON: {"lifeForm":["Arbusto","Árvore"], ...}
    for (const f of lerJson<{ lifeForm?: string[] }>(r.lifeForm)?.lifeForm ??
      []) {
      l?.formasDeVida.add(f);
    }
  }

  for await (const r of lerTabela(join(pasta, 'distribution.txt'))) {
    const l = porId.get(r.id);
    if (!l) continue;
    if (r.locationID.startsWith('BR-')) l.ufs.add(r.locationID.slice(3));
    if (r.countryCode && NATIVA.has(r.establishmentMeans)) {
      l.paisesNativos.add(r.countryCode);
    }
    // Na Flora, o bioma vem em JSON: {"phytogeographicDomain":["Cerrado", ...]}
    const remarks = lerJson<{ phytogeographicDomain?: string[] }>(
      r.occurrenceRemarks ?? '',
    );
    for (const d of remarks?.phytogeographicDomain ?? []) l.dominios.add(d);
  }

  for await (const r of lerTabela(join(pasta, 'vernacularname.txt'))) {
    const l = porId.get(r.id);
    const nome = r.vernacularName?.trim();
    if (!l || !nome || r.language !== idiomaPortugues) continue;
    if (
      !l.nomesEmPortugues.some((n) => n.toLowerCase() === nome.toLowerCase())
    ) {
      l.nomesEmPortugues.push(nome);
    }
  }
  return [...porId.values()];
}

export async function lerFlora(pasta: string) {
  const linhas = await juntarLinhas(
    pasta,
    (t) => t.taxonRank === 'ESPECIE' && t.taxonomicStatus === 'NOME_ACEITO',
    'PORTUGUES',
  );
  return linhas.map(montarFlora).filter((e) => e !== null);
}

export async function lerFauna(pasta: string) {
  const linhas = await juntarLinhas(
    pasta,
    (t) =>
      t.taxonRank === 'species' &&
      t.taxonomicStatus === 'accepted' &&
      t.class in GRUPO_FAUNA,
    'Portuguese',
  );
  return linhas.map(montarFauna).filter((e) => e !== null);
}
