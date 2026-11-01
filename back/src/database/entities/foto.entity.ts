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
import { Especie } from './especie.entity.js';
import { Fonte } from './fonte.entity.js';

/**
 * Foto de uma espécie, com o crédito que a licença exige (autor e licença).
 * Uma espécie pode ter várias; "ordem" diz qual aparece primeiro (0 = principal).
 */
@Entity('foto')
@Unique(['especie', 'url']) // a mesma foto não entra duas vezes na mesma espécie
export class Foto {
  @PrimaryGeneratedColumn('identity', { generatedIdentity: 'ALWAYS' })
  id: number;

  @ManyToOne(() => Especie, (especie) => especie.fotos, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'especie_id' })
  especie: Relation<Especie>;

  /** Foto grande, para a ficha da espécie. */
  @Column({ type: 'text' })
  url: string;

  /** Versão menor, para cartões e miniaturas. */
  @Column({ name: 'url_miniatura', type: 'text' })
  urlMiniatura: string;

  @Column({ type: 'text' })
  autor: string;

  /** Código da licença, ex.: "cc-by-nc". Foto sem licença aberta não entra. */
  @Column({ type: 'text' })
  licenca: string;

  /** Página da foto na fonte, para quem quiser ver o original. */
  @Column({ name: 'link_original', type: 'text' })
  linkOriginal: string;

  @Index()
  @ManyToOne(() => Fonte, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'fonte_id' })
  fonte: Relation<Fonte>;

  @Column({ type: 'smallint' })
  ordem: number;
}
