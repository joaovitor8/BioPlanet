import { MigrationInterface, QueryRunner } from 'typeorm';

// Gerada pelo TypeORM (npm run migration:generate), sem ajustes.
// Espécies em destaque na página do país: a marca fica no par espécie ↔ país.

export class Destaque1793557160972 implements MigrationInterface {
  name = 'Destaque1793557160972';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "ocorrencia" ADD "destaque" boolean NOT NULL DEFAULT false`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "ocorrencia" DROP COLUMN "destaque"`);
  }
}
