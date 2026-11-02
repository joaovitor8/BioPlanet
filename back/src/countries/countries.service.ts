import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BiomesService } from '../biomes/biomes.service.js';
import type {
  Continent,
  Country,
  CountryDetail,
  CountryStatus,
  NationalBiomePage,
  SpeciesStats,
} from '../common/api-types.js';
import { BiomaNacional, Pais } from '../database/entities/index.js';
import { SourcesService } from '../sources/sources.service.js';

const byId = (a: { id: number }, b: { id: number }) => a.id - b.id;

/** As três contagens numa consulta só. O Postgres devolve count como texto (bigint). */
const CONTAGENS = `
  count(*) FILTER (WHERE e.reino IN ('flora', 'funga')) AS plants,
  count(*) FILTER (WHERE e.reino = 'fauna') AS animals,
  count(*) FILTER (WHERE o.status_nacional IN ('CR', 'EN', 'VU')) AS threatened`;

const toStats = (r: Record<keyof SpeciesStats, string>): SpeciesStats => ({
  plants: Number(r.plants),
  animals: Number(r.animals),
  threatened: Number(r.threatened),
});

@Injectable()
export class CountriesService {
  constructor(
    @InjectRepository(Pais) private readonly paises: Repository<Pais>,
    @InjectRepository(BiomaNacional)
    private readonly biomasNacionais: Repository<BiomaNacional>,
    private readonly biomes: BiomesService,
    private readonly sources: SourcesService,
  ) {}

  /** Todos os países, na ordem de cadastro. */
  async list(): Promise<Country[]> {
    const rows = await this.paises.find({
      relations: { fontes: true },
      order: { id: 'ASC' },
    });
    return rows.map((p) => this.toCountry(p));
  }

  /** País com os biomas nacionais (e o bioma global de cada um) e as fontes. */
  async detail(slug: string): Promise<CountryDetail> {
    const pais = await this.paises.findOne({
      where: { slug },
      relations: { fontes: true, biomas: { biomaGlobal: true } },
    });
    if (!pais) throw new NotFoundException(`País "${slug}" não encontrado.`);

    return {
      ...this.toCountry(pais),
      biomes: [...pais.biomas]
        .sort(byId)
        .map((b) => this.biomes.toNationalBiomeDetail(b, pais.codigo)),
      sources: [...pais.fontes].sort(byId).map((f) => this.sources.toSource(f)),
      stats: await this.countryStats(pais.id),
    };
  }

  /** Espécies que ocorrem no país (uma linha de ocorrencia por espécie). */
  private async countryStats(paisId: number) {
    const [r] = await this.paises.query(
      `SELECT ${CONTAGENS}
       FROM ocorrencia o JOIN especie e ON e.id = o.especie_id
       WHERE o.pais_id = $1`,
      [paisId],
    );
    return toStats(r);
  }

  /** Espécies ligadas ao bioma; o status é o da lista do país do bioma. */
  private async biomeStats(biomaId: number, paisId: number) {
    const [r] = await this.paises.query(
      `SELECT ${CONTAGENS}
       FROM ocorrencia_bioma ob
       JOIN especie e ON e.id = ob.especie_id
       LEFT JOIN ocorrencia o ON o.especie_id = e.id AND o.pais_id = $2
       WHERE ob.bioma_nacional_id = $1`,
      [biomaId, paisId],
    );
    return toStats(r);
  }

  /** Um bioma nacional do país, com o bioma global e as contagens. */
  async biome(slug: string, biomeSlug: string): Promise<NationalBiomePage> {
    const pais = await this.paises.findOneBy({ slug });
    if (!pais) throw new NotFoundException(`País "${slug}" não encontrado.`);

    const bioma = await this.biomasNacionais.findOne({
      where: { slug: biomeSlug, pais: { id: pais.id } },
      relations: { biomaGlobal: true },
    });
    if (!bioma) {
      throw new NotFoundException(
        `Bioma "${biomeSlug}" não encontrado em ${pais.nome}.`,
      );
    }
    return {
      ...this.biomes.toNationalBiomeDetail(bioma, pais.codigo),
      stats: await this.biomeStats(bioma.id, pais.id),
    };
  }

  /** Precisa da relação fontes carregada. */
  toCountry(p: Pais): Country {
    return {
      code: p.codigo,
      slug: p.slug,
      name: p.nome,
      continent: p.continente as Continent,
      status: p.status as CountryStatus,
      sourceIds: [...p.fontes].sort(byId).map((f) => f.slug),
      // Campos opcionais só aparecem no JSON quando têm valor, como no front.
      ...(p.autoridadeBioma ? { biomeAuthority: p.autoridadeBioma } : {}),
      ...(p.intro ? { intro: p.intro } : {}),
    };
  }
}
