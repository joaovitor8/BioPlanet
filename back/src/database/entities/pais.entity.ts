import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
  type Relation,
} from 'typeorm';
import { StatusPais } from '../enums.js';
import { BiomaNacional } from './bioma-nacional.entity.js';
import { Fonte } from './fonte.entity.js';
import { Ocorrencia } from './ocorrencia.entity.js';

@Entity('pais')
export class Pais {
  @PrimaryGeneratedColumn('identity', { generatedIdentity: 'ALWAYS' })
  id: number;

  /** Código ISO 3166-1 alfa-2, ex.: "BR". */
  @Column({ type: 'char', length: 2, unique: true })
  codigo: string;

  /** Usado na URL: /pais/br */
  @Column({ type: 'text', unique: true })
  slug: string;

  @Column({ type: 'text' })
  nome: string;

  @Column({ type: 'text' })
  continente: string;

  @Column({
    type: 'enum',
    enum: StatusPais,
    enumName: 'status_pais',
    default: StatusPais.Global,
  })
  status: StatusPais;

  /** Quem define a classificação nacional de biomas, ex.: "IBGE". */
  @Column({ name: 'autoridade_bioma', type: 'text', nullable: true })
  autoridadeBioma: string | null;

  @Column({ type: 'text', nullable: true })
  intro: string | null;

  @OneToMany(() => BiomaNacional, (bioma) => bioma.pais)
  biomas: Relation<BiomaNacional[]>;

  @OneToMany(() => Ocorrencia, (ocorrencia) => ocorrencia.pais)
  ocorrencias: Relation<Ocorrencia[]>;

  /** Fontes nacionais já integradas. Cria a tabela de ligação pais_fonte. */
  @ManyToMany(() => Fonte)
  @JoinTable({
    name: 'pais_fonte',
    joinColumn: { name: 'pais_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'fonte_id', referencedColumnName: 'id' },
  })
  fontes: Relation<Fonte[]>;
}
