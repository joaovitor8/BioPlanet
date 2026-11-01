import { MigrationInterface, QueryRunner } from 'typeorm';

// Gerada pelo TypeORM (npm run migration:generate), sem ajustes.
// Guarda na fonte o crédito exigido pela licença: citação, licença e versão importada.

export class CreditoDaFonte1793565594002 implements MigrationInterface {
  name = 'CreditoDaFonte1793565594002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "fonte" ADD "citacao" text`);
    await queryRunner.query(`ALTER TABLE "fonte" ADD "licenca" text`);
    await queryRunner.query(`ALTER TABLE "fonte" ADD "versao" text`);
    await queryRunner.query(
      `ALTER TABLE "fonte" ADD "importado_em" TIMESTAMP WITH TIME ZONE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "fonte" DROP COLUMN "importado_em"`);
    await queryRunner.query(`ALTER TABLE "fonte" DROP COLUMN "versao"`);
    await queryRunner.query(`ALTER TABLE "fonte" DROP COLUMN "licenca"`);
    await queryRunner.query(`ALTER TABLE "fonte" DROP COLUMN "citacao"`);
  }
}
