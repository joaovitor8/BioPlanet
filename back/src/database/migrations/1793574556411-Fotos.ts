import { MigrationInterface, QueryRunner } from 'typeorm';

// Gerada pelo TypeORM (npm run migration:generate), sem ajustes.
// Fotos das espécies com o crédito exigido pela licença (autor e licença de cada foto).

export class Fotos1793574556411 implements MigrationInterface {
  name = 'Fotos1793574556411';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "foto" ("id" integer GENERATED ALWAYS AS IDENTITY NOT NULL, "url" text NOT NULL, "url_miniatura" text NOT NULL, "autor" text NOT NULL, "licenca" text NOT NULL, "link_original" text NOT NULL, "ordem" smallint NOT NULL, "especie_id" integer NOT NULL, "fonte_id" integer NOT NULL, CONSTRAINT "UQ_5247801f11eb46fa0e06d683f24" UNIQUE ("especie_id", "url"), CONSTRAINT "PK_2496ab6b734626c5adcd6c0a37f" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_941233e35e86402c99ae6c85cf" ON "foto"  ("fonte_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "foto" ADD CONSTRAINT "FK_4dedfb84ba091d7bdd1d21f693a" FOREIGN KEY ("especie_id") REFERENCES "especie"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "foto" ADD CONSTRAINT "FK_941233e35e86402c99ae6c85cf7" FOREIGN KEY ("fonte_id") REFERENCES "fonte"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "foto" DROP CONSTRAINT "FK_941233e35e86402c99ae6c85cf7"`,
    );
    await queryRunner.query(
      `ALTER TABLE "foto" DROP CONSTRAINT "FK_4dedfb84ba091d7bdd1d21f693a"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_941233e35e86402c99ae6c85cf"`,
    );
    await queryRunner.query(`DROP TABLE "foto"`);
  }
}
