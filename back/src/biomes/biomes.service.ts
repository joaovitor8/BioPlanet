import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type {
  GlobalBiome,
  NationalBiome,
  NationalBiomeDetail,
} from '../common/api-types.js';
import { BiomaGlobal, BiomaNacional } from '../database/entities/index.js';

@Injectable()
export class BiomesService {
  constructor(
    @InjectRepository(BiomaGlobal)
    private readonly globais: Repository<BiomaGlobal>,
  ) {}

  /** Os 14 biomas globais, na ordem da classificação. */
  async listGlobal(): Promise<GlobalBiome[]> {
    const rows = await this.globais.find({ order: { numero: 'ASC' } });
    return rows.map((b) => this.toGlobalBiome(b));
  }

  toGlobalBiome(b: BiomaGlobal): GlobalBiome {
    return { id: String(b.numero), name: b.nome, examples: b.exemplos ?? '' };
  }

  /** Precisa da relação biomaGlobal carregada. */
  toNationalBiome(b: BiomaNacional, countryCode: string): NationalBiome {
    return {
      slug: b.slug,
      countryCode,
      name: b.nome,
      areaPct: b.areaPct,
      description: b.descricao ?? '',
      globalBiomeId: String(b.biomaGlobal.numero),
    };
  }

  toNationalBiomeDetail(
    b: BiomaNacional,
    countryCode: string,
  ): NationalBiomeDetail {
    return {
      ...this.toNationalBiome(b, countryCode),
      globalBiome: this.toGlobalBiome(b.biomaGlobal),
    };
  }
}
