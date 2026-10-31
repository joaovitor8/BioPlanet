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
}
