import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BiomesService } from '../biomes/biomes.service.js';
import type {
  Continent,
  Country,
  CountryDetail,
  CountryStatus,
  NationalBiomeDetail,
} from '../common/api-types.js';
import { BiomaNacional, Pais } from '../database/entities/index.js';
import { SourcesService } from '../sources/sources.service.js';

const byId = (a: { id: number }, b: { id: number }) => a.id - b.id;

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
    };
  }

  /** Um bioma nacional do país, com o bioma global. */
  async biome(slug: string, biomeSlug: string): Promise<NationalBiomeDetail> {
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
    return this.biomes.toNationalBiomeDetail(bioma, pais.codigo);
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
