import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

/** Bioma da classificação global (WWF / RESOLVE Ecoregions, 14 biomas terrestres). */
@Entity('bioma_global')
export class BiomaGlobal {
  @PrimaryGeneratedColumn('identity', { generatedIdentity: 'ALWAYS' })
  id: number;

  /** Número oficial do bioma na classificação (1 a 14). */
  @Column({ type: 'smallint', unique: true })
  numero: number;

  @Column({ type: 'text' })
  nome: string;

  @Column({ type: 'text', nullable: true })
  exemplos: string | null;
}
