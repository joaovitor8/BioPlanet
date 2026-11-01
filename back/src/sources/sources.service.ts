import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { Source } from '../common/api-types.js';
import { Fonte } from '../database/entities/index.js';
import { EscopoFonte } from '../database/enums.js';

@Injectable()
export class SourcesService {
  constructor(
    @InjectRepository(Fonte) private readonly fontes: Repository<Fonte>,
  ) {}

  /** Todas as fontes, ou só as de um escopo (global ou nacional). */
  async list(scope?: string): Promise<Source[]> {
    if (scope && !Object.values<string>(EscopoFonte).includes(scope)) {
      throw new BadRequestException('Use ?scope=global ou ?scope=nacional.');
    }
    const rows = await this.fontes.find({
      where: scope ? { escopo: scope as EscopoFonte } : {},
      order: { id: 'ASC' },
    });
    return rows.map((f) => this.toSource(f));
  }

  toSource(f: Fonte): Source {
    return {
      id: f.slug,
      name: f.nome,
      what: f.descricao ?? '',
      url: f.url ?? '',
      scope: f.escopo,
      ...(f.citacao ? { credit: this.toCredit(f, f.citacao) } : {}),
    };
  }

  /** O importador grava a licença como "CC-BY 4.0 (https://...)"; aqui o link vira campo separado. */
  private toCredit(f: Fonte, citation: string): NonNullable<Source['credit']> {
    const licenca = f.licenca ?? 'não informada';
    const partes = licenca.match(/^(.*?)\s*\((https?:\/\/[^)]+)\)$/);
    return {
      citation,
      license: partes ? partes[1] : licenca,
      ...(partes ? { licenseUrl: partes[2] } : {}),
      ...(f.versao ? { version: f.versao } : {}),
    };
  }
}
