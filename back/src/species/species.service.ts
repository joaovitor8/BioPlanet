import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import type { Photo, RelatedSpecies, Species } from '../common/api-types.js';
import {
  BiomaNacional,
  Especie,
  Foto,
  Pais,
} from '../database/entities/index.js';
import { Reino, StatusPais } from '../database/enums.js';
import { toPhoto, type LinhaDeFoto } from './photos.js';

/** Relações que a ficha completa precisa. O TypeORM busca tudo com JOINs. */
const FULL_RELATIONS = {
  nomesAlternativos: true,
  ocorrencias: { pais: true, fonteStatus: true },
  biomas: { pais: true },
} as const;

const byId = (a: { id: number }, b: { id: number }) => a.id - b.id;

/**
 * Ordem dos países de uma espécie: primeiro os integrados, depois os em preparação,
 * depois os só com dados globais; o nome desempata. O front abre o seletor de status
 * nacional no primeiro país, então ele precisa ser um país com lista integrada.
 */
const ordemStatus: Record<StatusPais, number> = {
  [StatusPais.Disponivel]: 0,
  [StatusPais.EmPreparacao]: 1,
  [StatusPais.Global]: 2,
};
const porStatusENome = (a: Pais, b: Pais) =>
  ordemStatus[a.status] - ordemStatus[b.status] ||
  a.nome.localeCompare(b.nome, 'pt-BR');

@Injectable()
export class SpeciesService {
  constructor(
    @InjectRepository(Especie) private readonly especies: Repository<Especie>,
    @InjectRepository(Pais) private readonly paises: Repository<Pais>,
    @InjectRepository(BiomaNacional)
    private readonly biomasNacionais: Repository<BiomaNacional>,
    @InjectRepository(Foto) private readonly fotos: Repository<Foto>,
  ) {}

  /**
   * Espécies filtradas por país, bioma nacional e/ou destaque (todos opcionais).
   * Filtro com país ou bioma que não existe responde 404, para um erro de digitação
   * não parecer "nenhuma espécie".
   */
  async list(filters: {
    country?: string;
    biome?: string;
    featured?: boolean;
  }): Promise<Species[]> {
    const qb = this.especies
      .createQueryBuilder('e')
      .select('e.id', 'id')
      .distinct(true)
      .orderBy('e.id', 'ASC');

    let pais: Pais | null = null;
    if (filters.country) {
      pais = await this.paises.findOneBy({ slug: filters.country });
      if (!pais) {
        throw new NotFoundException(
          `País "${filters.country}" não encontrado.`,
        );
      }
    }

    // Ocorre no país = tem uma linha em ocorrencia com esse pais_id.
    // Em destaque = essa linha tem destaque = true (sem país: destaque em qualquer país).
    if (pais || filters.featured) {
      const condicoes = [
        ...(pais ? ['o.paisId = :paisId'] : []),
        ...(filters.featured ? ['o.destaque = true'] : []),
      ];
      qb.innerJoin('e.ocorrencias', 'o', condicoes.join(' AND '), {
        paisId: pais?.id,
      });
    }

    if (filters.biome) {
      const where = {
        slug: filters.biome,
        ...(pais ? { pais: { id: pais.id } } : {}),
      };
      if (!(await this.biomasNacionais.exists({ where }))) {
        throw new NotFoundException(
          `Bioma "${filters.biome}" não encontrado${pais ? ` em ${pais.nome}` : ''}.`,
        );
      }
      // Ocorre no bioma = tem uma linha em ocorrencia_bioma ligando a esse bioma.
      qb.innerJoin('e.biomas', 'b', 'b.slug = :biome', {
        biome: filters.biome,
      });
      if (pais) qb.innerJoin('b.pais', 'bp', 'bp.id = :paisId');
    }

    const ids = (await qb.getRawMany<{ id: number }>()).map((r) => r.id);
    return this.findByIds(ids);
  }

  /** Ficha completa de uma espécie. */
  async detail(slug: string): Promise<Species> {
    const especie = await this.especies.findOne({
      where: { slug },
      relations: FULL_RELATIONS,
    });
    if (!especie) {
      throw new NotFoundException(`Espécie "${slug}" não encontrada.`);
    }
    const fotos = await this.photosOf([especie.id], 'todas');
    return this.toSpecies(especie, fotos.get(especie.id) ?? []);
  }

  /**
   * Espécies parecidas: mesmo gênero, depois mesma família, depois mesma ordem,
   * depois mesmo reino. Mesma regra de getRelatedSpecies no front.
   */
  async related(slug: string, limit = 4): Promise<RelatedSpecies[]> {
    const alvo = await this.especies.findOneBy({ slug });
    if (!alvo) throw new NotFoundException(`Espécie "${slug}" não encontrada.`);

    // A pontuação é calculada no banco, para não carregar todas as espécies.
    const score = `CASE
      WHEN e.tax_genero = :genero THEN 3
      WHEN e.tax_familia = :familia THEN 2
      WHEN e.tax_ordem = :ordem THEN 1
      WHEN e.reino = :reino THEN 0.5
      ELSE 0 END`;
    const rows = await this.especies
      .createQueryBuilder('e')
      .select('e.id', 'id')
      .where('e.id <> :id')
      .andWhere(`(${score}) > 0`)
      .setParameters({
        id: alvo.id,
        genero: alvo.taxGenero,
        familia: alvo.taxFamilia,
        ordem: alvo.taxOrdem,
        reino: alvo.reino,
      })
      .orderBy(score, 'DESC')
      .addOrderBy('e.id', 'ASC')
      .limit(limit)
      .getRawMany<{ id: number }>();

    const parecidas = await this.findByIds(rows.map((r) => r.id));
    return parecidas.map((species) => ({
      species,
      reason: this.relatedReason(alvo, species),
    }));
  }

  /** Busca as espécies com todas as relações, na mesma ordem dos ids. Para listas: só a primeira foto. */
  async findByIds(ids: number[]): Promise<Species[]> {
    if (ids.length === 0) return [];
    const [rows, fotos] = await Promise.all([
      this.especies.find({ where: { id: In(ids) }, relations: FULL_RELATIONS }),
      this.photosOf(ids, 'primeira'),
    ]);
    const porId = new Map(rows.map((e) => [e.id, e]));
    return ids.map((id) => this.toSpecies(porId.get(id)!, fotos.get(id) ?? []));
  }

  /**
   * Fotos numa consulta separada: juntar com nomes, países e biomas no mesmo JOIN
   * multiplicaria as linhas (5 nomes × 5 países × 5 biomas × 4 fotos = 500 linhas por espécie).
   */
  private async photosOf(ids: number[], quais: 'todas' | 'primeira') {
    const linhas = await this.fotos
      .createQueryBuilder('f')
      .innerJoin('f.fonte', 'fonte')
      .select([
        'f.especie_id AS "especieId"',
        'f.url AS url',
        'f.url_miniatura AS "urlMiniatura"',
        'f.autor AS autor',
        'f.licenca AS licenca',
        'f.link_original AS "linkOriginal"',
        'fonte.nome AS fonte',
      ])
      .where('f.especie_id IN (:...ids)', { ids })
      .orderBy('f.especie_id')
      .addOrderBy('f.ordem')
      .getRawMany<LinhaDeFoto>();

    const porEspecie = new Map<number, Photo[]>();
    for (const linha of linhas) {
      const lista = porEspecie.get(linha.especieId) ?? [];
      if (quais === 'primeira' && lista.length > 0) continue;
      lista.push(toPhoto(linha));
      porEspecie.set(linha.especieId, lista);
    }
    return porEspecie;
  }

  /** Monta o JSON da espécie. Precisa das relações de FULL_RELATIONS carregadas. */
  toSpecies(e: Especie, photos: Photo[]): Species {
    const ocorrencias = [...e.ocorrencias].sort((a, b) =>
      porStatusENome(a.pais, b.pais),
    );
    const biomas = [...e.biomas].sort(byId);
    const outrosNomes = [...e.nomesAlternativos].sort(byId).map((n) => n.nome);

    const national: Species['conservation']['national'] = {};
    for (const o of ocorrencias) {
      if (o.statusNacional) national[o.pais.codigo] = o.statusNacional;
    }

    return {
      slug: e.slug,
      scientificName: e.nomeCientifico,
      ...(e.autoria ? { authorship: e.autoria } : {}),
      commonName: e.nomePopular,
      ...(outrosNomes.length > 0 ? { otherNames: outrosNomes } : {}),
      kingdom: e.reino,
      group: e.grupo,
      taxonomy: {
        reino: e.taxReino ?? '',
        filo: e.taxFilo ?? '',
        classe: e.taxClasse ?? '',
        ordem: e.taxOrdem ?? '',
        familia: e.taxFamilia ?? '',
        genero: e.taxGenero ?? '',
      },
      occurrences: ocorrencias.map((o) => ({
        countryCode: o.pais.codigo,
        // ocorrencia_bioma liga a espécie a biomas de todos os países; aqui ficam só os deste.
        biomeSlugs: biomas
          .filter((b) => b.pais.id === o.pais.id)
          .map((b) => b.slug),
        ...(o.fonteStatus ? { statusSourceId: o.fonteStatus.slug } : {}),
      })),
      conservation: {
        ...(e.statusGlobal ? { global: e.statusGlobal } : {}),
        national,
      },
      ...(e.resumo ? { summary: e.resumo } : {}),
      photos,
    };
  }

  private relatedReason(alvo: Especie, s: Species): string {
    const t = s.taxonomy;
    if (t.genero === alvo.taxGenero) return `Mesmo gênero (${t.genero})`;
    if (t.familia === alvo.taxFamilia) return `Mesma família (${t.familia})`;
    if (t.ordem === alvo.taxOrdem) return `Mesma ordem (${t.ordem})`;
    return s.kingdom === Reino.Fauna ? 'Também da fauna' : 'Também da flora';
  }
}
