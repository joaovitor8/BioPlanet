import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  type Relation,
} from 'typeorm';
import { Especie } from './especie.entity.js';

/** Outros nomes populares de uma espécie, em vários idiomas ("jaguar", "jaguaretê"). */
@Entity('nome_alternativo')
export class NomeAlternativo {
  @PrimaryGeneratedColumn('identity', { generatedIdentity: 'ALWAYS' })
  id: number;

  @Index()
  @ManyToOne(() => Especie, (especie) => especie.nomesAlternativos, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'especie_id' })
  especie: Relation<Especie>;

  @Column({ type: 'text' })
  nome: string;

  /** Código do idioma: "pt", "en", "es"... */
  @Column({ type: 'text', default: 'pt' })
  idioma: string;
}
