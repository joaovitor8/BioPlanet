import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  type Relation,
} from 'typeorm';
import { BiomaGlobal } from './bioma-global.entity.js';
import { Pais } from './pais.entity.js';

/** Bioma da classificação de um país, ex.: os 6 biomas do IBGE no Brasil. */
@Entity('bioma_nacional')
@Unique(['pais', 'slug']) // o mesmo slug pode existir em países diferentes
export class BiomaNacional {
  @PrimaryGeneratedColumn('identity', { generatedIdentity: 'ALWAYS' })
  id: number;

  @ManyToOne(() => Pais, (pais) => pais.biomas, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'pais_id' })
  pais: Relation<Pais>;

  @Index()
  @ManyToOne(() => BiomaGlobal, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'bioma_global_id' })
  biomaGlobal: Relation<BiomaGlobal>;

  @Column({ type: 'text' })
  slug: string;

  @Column({ type: 'text' })
  nome: string;

  /** Parte do território do país, em %. O Postgres devolve numeric como texto; o transformer converte. */
  @Column({
    name: 'area_pct',
    type: 'numeric',
    precision: 5,
    scale: 2,
    nullable: true,
    transformer: {
      to: (v: number | null) => v,
      from: (v: string | null) => (v === null ? null : Number(v)),
    },
  })
  areaPct: number | null;

  @Column({ type: 'text', nullable: true })
  descricao: string | null;
}
