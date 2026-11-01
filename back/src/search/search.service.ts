import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { SearchResult } from '../common/api-types.js';
import { CountriesService } from '../countries/countries.service.js';
import { Especie, Pais } from '../database/entities/index.js';
import { SpeciesService } from '../species/species.service.js';

/** Acentos soltos que sobram depois de separar a letra do acento (NFD). */
const ACENTOS = '[̀-ͯ]';

/** SQL que tira acento e maiúscula de uma coluna. Mesma regra do normalize() do front. */
const semAcento = (coluna: string) =>
  `regexp_replace(normalize(lower(${coluna}), NFD), :acentos, '', 'g')`;

/** Mesma regra no JavaScript, para o termo buscado. */
const normalizar = (texto: string) =>
  texto
    .normalize('NFD')
    .replace(new RegExp(ACENTOS, 'g'), '')
    .toLowerCase()
    .trim();

@Injectable()
export class SearchService {
  constructor(
    @InjectRepository(Especie) private readonly especies: Repository<Especie>,
    @InjectRepository(Pais) private readonly paises: Repository<Pais>,
    private readonly species: SpeciesService,
    private readonly countries: CountriesService,
  ) {}

  /** Busca por nome popular, outros nomes, nome científico e nome do país. */
  async search(query = ''): Promise<SearchResult> {
    const q = normalizar(query);
    if (!q) return { species: [], countries: [] };
    // strpos procura o texto literal: % e _ digitados não viram curinga, como no LIKE.
    const params = { q, acentos: ACENTOS };

    const especieIds = await this.especies
      .createQueryBuilder('e')
      .select('e.id', 'id')
      .where(`strpos(${semAcento('e.nome_popular')}, :q) > 0`)
      .orWhere(`strpos(${semAcento('e.nome_cientifico')}, :q) > 0`)
      .orWhere(
        `EXISTS (SELECT 1 FROM nome_alternativo n
          WHERE n.especie_id = e.id AND strpos(${semAcento('n.nome')}, :q) > 0)`,
      )
      .setParameters(params)
      .orderBy('e.id', 'ASC')
      .getRawMany<{ id: number }>();

    const paises = await this.paises
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.fontes', 'f')
      .where(`strpos(${semAcento('p.nome')}, :q) > 0`)
      .setParameters(params)
      .orderBy('p.id', 'ASC')
      .getMany();

    return {
      species: await this.species.findByIds(especieIds.map((r) => r.id)),
      countries: paises.map((p) => this.countries.toCountry(p)),
    };
  }
}
