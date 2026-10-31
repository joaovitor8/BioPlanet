import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  type Relation,
} from 'typeorm';
import { Reino, StatusConservacao } from '../enums.js';
import { BiomaNacional } from './bioma-nacional.entity.js';
import { NomeAlternativo } from './nome-alternativo.entity.js';
import { Ocorrencia } from './ocorrencia.entity.js';

@Entity('especie')
export class Especie {
  @PrimaryGeneratedColumn('identity', { generatedIdentity: 'ALWAYS' })
  id: number;

  /** Nome científico em minúsculas com hífen: /especie/panthera-onca */
  @Column({ type: 'text', unique: true })
  slug: string;

  @Column({ name: 'nome_cientifico', type: 'text', unique: true })
  nomeCientifico: string;

  /** Autor e ano da descrição, ex.: "(Linnaeus, 1758)". */
  @Column({ type: 'text', nullable: true })
  autoria: string | null;

  @Column({ name: 'nome_popular', type: 'text' })
  nomePopular: string;

  @Column({ type: 'enum', enum: Reino, enumName: 'reino' })
  reino: Reino;

  /** Grupo popular: Mamífero, Ave, Árvore... */
  @Column({ type: 'text' })
  grupo: string;

  // Taxonomia em colunas. Simples e suficiente por enquanto.
  @Column({ name: 'tax_reino', type: 'text', nullable: true })
  taxReino: string | null;

  @Column({ name: 'tax_filo', type: 'text', nullable: true })
  taxFilo: string | null;

  @Column({ name: 'tax_classe', type: 'text', nullable: true })
  taxClasse: string | null;

  @Column({ name: 'tax_ordem', type: 'text', nullable: true })
  taxOrdem: string | null;

  @Column({ name: 'tax_familia', type: 'text', nullable: true })
  taxFamilia: string | null;

  @Column({ name: 'tax_genero', type: 'text', nullable: true })
  taxGenero: string | null;

  /** Status global (IUCN). Um só por espécie, por isso fica aqui. */
  @Column({
    name: 'status_global',
    type: 'enum',
    enum: StatusConservacao,
    enumName: 'status_conservacao',
    nullable: true,
  })
  statusGlobal: StatusConservacao | null;

  @Column({ type: 'text', nullable: true })
  resumo: string | null;

  @CreateDateColumn({ name: 'criado_em', type: 'timestamptz' })
  criadoEm: Date;

  @UpdateDateColumn({ name: 'atualizado_em', type: 'timestamptz' })
  atualizadoEm: Date;

  @OneToMany(() => NomeAlternativo, (nome) => nome.especie)
  nomesAlternativos: Relation<NomeAlternativo[]>;

  /** Países onde ocorre, com o status nacional de cada um. */
  @OneToMany(() => Ocorrencia, (ocorrencia) => ocorrencia.especie)
  ocorrencias: Relation<Ocorrencia[]>;

  /** Biomas nacionais onde ocorre. Cria a tabela de ligação ocorrencia_bioma. */
  @ManyToMany(() => BiomaNacional)
  @JoinTable({
    name: 'ocorrencia_bioma',
    joinColumn: { name: 'especie_id', referencedColumnName: 'id' },
    inverseJoinColumn: {
      name: 'bioma_nacional_id',
      referencedColumnName: 'id',
    },
  })
  biomas: Relation<BiomaNacional[]>;
}
