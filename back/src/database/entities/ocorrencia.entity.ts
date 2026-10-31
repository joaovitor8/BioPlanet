import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  type Relation,
} from 'typeorm';
import { StatusConservacao } from '../enums.js';
import { Especie } from './especie.entity.js';
import { Fonte } from './fonte.entity.js';
import { Pais } from './pais.entity.js';

/**
 * Ligação espécie ↔ país.
 * A chave é o par (especie_id, pais_id): cada espécie aparece uma vez por país.
 * O status nacional mora aqui porque pertence ao par, não à espécie nem ao país sozinhos.
 */
@Entity('ocorrencia')
export class Ocorrencia {
  @PrimaryColumn({ name: 'especie_id', type: 'int' })
  especieId: number;

  @Index() // a chave já começa por especie_id; este índice acelera "espécies de um país"
  @PrimaryColumn({ name: 'pais_id', type: 'int' })
  paisId: number;

  @ManyToOne(() => Especie, (especie) => especie.ocorrencias, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'especie_id' })
  especie: Relation<Especie>;

  @ManyToOne(() => Pais, (pais) => pais.ocorrencias, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'pais_id' })
  pais: Relation<Pais>;

  /** Status na lista vermelha do país, ex.: VU no Brasil (SALVE). */
  @Column({
    name: 'status_nacional',
    type: 'enum',
    enum: StatusConservacao,
    enumName: 'status_conservacao',
    nullable: true,
  })
  statusNacional: StatusConservacao | null;

  @Index()
  @ManyToOne(() => Fonte, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'fonte_status_id' })
  fonteStatus: Relation<Fonte> | null;
}
