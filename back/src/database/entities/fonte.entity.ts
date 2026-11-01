import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { EscopoFonte } from '../enums.js';

/** De onde vem cada dado: GBIF, IUCN, SALVE, Flora e Funga do Brasil... */
@Entity('fonte')
export class Fonte {
  @PrimaryGeneratedColumn('identity', { generatedIdentity: 'ALWAYS' })
  id: number;

  /** Identificador curto e estável, ex.: "salve". Usado pelos scripts de importação. */
  @Column({ type: 'text', unique: true })
  slug: string;

  @Column({ type: 'text' })
  nome: string;

  @Column({ type: 'text', nullable: true })
  descricao: string | null;

  @Column({ type: 'text', nullable: true })
  url: string | null;

  @Column({ type: 'enum', enum: EscopoFonte, enumName: 'escopo_fonte' })
  escopo: EscopoFonte;

  // Crédito exigido pela licença dos dados. Preenchido pelos importadores (npm run import:*).

  /** Como citar o conjunto de dados, como o próprio publicador pede. */
  @Column({ type: 'text', nullable: true })
  citacao: string | null;

  /** Licença dos dados, ex.: "CC-BY 4.0 (https://creativecommons.org/licenses/by/4.0/)". */
  @Column({ type: 'text', nullable: true })
  licenca: string | null;

  /** Versão do conjunto de dados importada por último, ex.: "393.433". */
  @Column({ type: 'text', nullable: true })
  versao: string | null;

  @Column({ name: 'importado_em', type: 'timestamptz', nullable: true })
  importadoEm: Date | null;
}
