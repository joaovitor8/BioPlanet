import { MigrationInterface, QueryRunner } from 'typeorm';

// Escrita à mão (o SQL aprovado) e conferida depois com npm run migration:generate,
// que não encontrou diferença entre as entidades e o banco.
// Dados do GBIF: chave do táxon, total de registros e registros por país. Os pontos não ficam no banco.

export class Gbif1793576920359 implements MigrationInterface {
  name = 'Gbif1793576920359';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "especie" ADD "gbif_taxon_key" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "especie" ADD "gbif_registros" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "especie" ADD "gbif_atualizado_em" TIMESTAMP WITH TIME ZONE`,
    );
    await queryRunner.query(
      `ALTER TABLE "ocorrencia" ADD "gbif_registros" integer`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "ocorrencia" DROP COLUMN "gbif_registros"`,
    );
    await queryRunner.query(
      `ALTER TABLE "especie" DROP COLUMN "gbif_atualizado_em"`,
    );
    await queryRunner.query(
      `ALTER TABLE "especie" DROP COLUMN "gbif_registros"`,
    );
    await queryRunner.query(
      `ALTER TABLE "especie" DROP COLUMN "gbif_taxon_key"`,
    );
  }
}
