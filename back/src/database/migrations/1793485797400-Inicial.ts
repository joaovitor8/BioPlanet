import { MigrationInterface, QueryRunner } from 'typeorm';

// Gerada pelo TypeORM (npm run migration:generate) e ajustada à mão:
// o tipo status_conservacao é usado por duas tabelas e o gerador o criava duas vezes.

export class Inicial1793485797400 implements MigrationInterface {
  name = 'Inicial1793485797400';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "bioma_global" ("id" integer GENERATED ALWAYS AS IDENTITY NOT NULL, "numero" smallint NOT NULL, "nome" text NOT NULL, "exemplos" text, CONSTRAINT "UQ_4446545ebd896e9b07732ad861d" UNIQUE ("numero"), CONSTRAINT "PK_c27104cc2cf4fa5aff2f2a3eff5" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."escopo_fonte" AS ENUM('global', 'nacional')`,
    );
    await queryRunner.query(
      `CREATE TABLE "fonte" ("id" integer GENERATED ALWAYS AS IDENTITY NOT NULL, "slug" text NOT NULL, "nome" text NOT NULL, "descricao" text, "url" text, "escopo" "public"."escopo_fonte" NOT NULL, CONSTRAINT "UQ_42e37047b0eb9da9194e1a22a4a" UNIQUE ("slug"), CONSTRAINT "PK_4c3b9c572532f43652dc3a8d791" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "nome_alternativo" ("id" integer GENERATED ALWAYS AS IDENTITY NOT NULL, "nome" text NOT NULL, "idioma" text NOT NULL DEFAULT 'pt', "especie_id" integer NOT NULL, CONSTRAINT "PK_6449e1beaa45f3226dc502a75d1" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_4069990be8f9acc8290b269e38" ON "nome_alternativo"  ("especie_id") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."reino" AS ENUM('fauna', 'flora', 'funga')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."status_conservacao" AS ENUM('EX', 'EW', 'CR', 'EN', 'VU', 'NT', 'LC', 'DD')`,
    );
    await queryRunner.query(
      `CREATE TABLE "especie" ("id" integer GENERATED ALWAYS AS IDENTITY NOT NULL, "slug" text NOT NULL, "nome_cientifico" text NOT NULL, "autoria" text, "nome_popular" text NOT NULL, "reino" "public"."reino" NOT NULL, "grupo" text NOT NULL, "tax_reino" text, "tax_filo" text, "tax_classe" text, "tax_ordem" text, "tax_familia" text, "tax_genero" text, "status_global" "public"."status_conservacao", "resumo" text, "criado_em" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "atualizado_em" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_d16d326d648b4e7ff2d5d57a2cc" UNIQUE ("slug"), CONSTRAINT "UQ_67c17fc5a8c1278cd5318490d2c" UNIQUE ("nome_cientifico"), CONSTRAINT "PK_07fb45be286aefa181943248b21" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "ocorrencia" ("especie_id" integer NOT NULL, "pais_id" integer NOT NULL, "status_nacional" "public"."status_conservacao", "fonte_status_id" integer, CONSTRAINT "PK_1ef2f70a7213a41f51d131d432e" PRIMARY KEY ("especie_id", "pais_id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_319d332b322fc26b8cbe50b074" ON "ocorrencia"  ("pais_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_c3628a537715bc85480ed6f3aa" ON "ocorrencia"  ("fonte_status_id") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."status_pais" AS ENUM('disponivel', 'em-preparacao', 'global')`,
    );
    await queryRunner.query(
      `CREATE TABLE "pais" ("id" integer GENERATED ALWAYS AS IDENTITY NOT NULL, "codigo" character(2) NOT NULL, "slug" text NOT NULL, "nome" text NOT NULL, "continente" text NOT NULL, "status" "public"."status_pais" NOT NULL DEFAULT 'global', "autoridade_bioma" text, "intro" text, CONSTRAINT "UQ_f120b3403d233fc300eb54c8acf" UNIQUE ("codigo"), CONSTRAINT "UQ_8543ae809598ca0bd01f2c97123" UNIQUE ("slug"), CONSTRAINT "PK_a362c5bbbefe39c9187406b1917" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "bioma_nacional" ("id" integer GENERATED ALWAYS AS IDENTITY NOT NULL, "slug" text NOT NULL, "nome" text NOT NULL, "area_pct" numeric(5,2), "descricao" text, "pais_id" integer NOT NULL, "bioma_global_id" integer NOT NULL, CONSTRAINT "UQ_a2b893586cc4ff873fce046a921" UNIQUE ("pais_id", "slug"), CONSTRAINT "PK_4fc4e90f2b79c9f024a0e3f358f" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_04359f751b74fb491dba2883df" ON "bioma_nacional"  ("bioma_global_id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "ocorrencia_bioma" ("especie_id" integer NOT NULL, "bioma_nacional_id" integer NOT NULL, CONSTRAINT "PK_1ba2467dd0c627e9df04c4429b9" PRIMARY KEY ("especie_id", "bioma_nacional_id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_b54f8ff3351a1f2ee2be9ffdd0" ON "ocorrencia_bioma"  ("especie_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_136b13387352884af832503c0e" ON "ocorrencia_bioma"  ("bioma_nacional_id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "pais_fonte" ("pais_id" integer NOT NULL, "fonte_id" integer NOT NULL, CONSTRAINT "PK_6967cec60032401ebca8d9d5e3f" PRIMARY KEY ("pais_id", "fonte_id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_a895bb90c08e77d77b4a2d64ed" ON "pais_fonte"  ("pais_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ee1eca81b426a594c6bfb53ba1" ON "pais_fonte"  ("fonte_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "nome_alternativo" ADD CONSTRAINT "FK_4069990be8f9acc8290b269e387" FOREIGN KEY ("especie_id") REFERENCES "especie"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "ocorrencia" ADD CONSTRAINT "FK_9adf326141f3f20fe2f78a83fe0" FOREIGN KEY ("especie_id") REFERENCES "especie"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "ocorrencia" ADD CONSTRAINT "FK_319d332b322fc26b8cbe50b0742" FOREIGN KEY ("pais_id") REFERENCES "pais"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "ocorrencia" ADD CONSTRAINT "FK_c3628a537715bc85480ed6f3aa0" FOREIGN KEY ("fonte_status_id") REFERENCES "fonte"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "bioma_nacional" ADD CONSTRAINT "FK_f83030a4f07b46d42ada3fab877" FOREIGN KEY ("pais_id") REFERENCES "pais"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "bioma_nacional" ADD CONSTRAINT "FK_04359f751b74fb491dba2883df3" FOREIGN KEY ("bioma_global_id") REFERENCES "bioma_global"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "ocorrencia_bioma" ADD CONSTRAINT "FK_b54f8ff3351a1f2ee2be9ffdd07" FOREIGN KEY ("especie_id") REFERENCES "especie"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "ocorrencia_bioma" ADD CONSTRAINT "FK_136b13387352884af832503c0ea" FOREIGN KEY ("bioma_nacional_id") REFERENCES "bioma_nacional"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "pais_fonte" ADD CONSTRAINT "FK_a895bb90c08e77d77b4a2d64ed6" FOREIGN KEY ("pais_id") REFERENCES "pais"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "pais_fonte" ADD CONSTRAINT "FK_ee1eca81b426a594c6bfb53ba10" FOREIGN KEY ("fonte_id") REFERENCES "fonte"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "pais_fonte" DROP CONSTRAINT "FK_ee1eca81b426a594c6bfb53ba10"`,
    );
    await queryRunner.query(
      `ALTER TABLE "pais_fonte" DROP CONSTRAINT "FK_a895bb90c08e77d77b4a2d64ed6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "ocorrencia_bioma" DROP CONSTRAINT "FK_136b13387352884af832503c0ea"`,
    );
    await queryRunner.query(
      `ALTER TABLE "ocorrencia_bioma" DROP CONSTRAINT "FK_b54f8ff3351a1f2ee2be9ffdd07"`,
    );
    await queryRunner.query(
      `ALTER TABLE "bioma_nacional" DROP CONSTRAINT "FK_04359f751b74fb491dba2883df3"`,
    );
    await queryRunner.query(
      `ALTER TABLE "bioma_nacional" DROP CONSTRAINT "FK_f83030a4f07b46d42ada3fab877"`,
    );
    await queryRunner.query(
      `ALTER TABLE "ocorrencia" DROP CONSTRAINT "FK_c3628a537715bc85480ed6f3aa0"`,
    );
    await queryRunner.query(
      `ALTER TABLE "ocorrencia" DROP CONSTRAINT "FK_319d332b322fc26b8cbe50b0742"`,
    );
    await queryRunner.query(
      `ALTER TABLE "ocorrencia" DROP CONSTRAINT "FK_9adf326141f3f20fe2f78a83fe0"`,
    );
    await queryRunner.query(
      `ALTER TABLE "nome_alternativo" DROP CONSTRAINT "FK_4069990be8f9acc8290b269e387"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_ee1eca81b426a594c6bfb53ba1"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_a895bb90c08e77d77b4a2d64ed"`,
    );
    await queryRunner.query(`DROP TABLE "pais_fonte"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_136b13387352884af832503c0e"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_b54f8ff3351a1f2ee2be9ffdd0"`,
    );
    await queryRunner.query(`DROP TABLE "ocorrencia_bioma"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_04359f751b74fb491dba2883df"`,
    );
    await queryRunner.query(`DROP TABLE "bioma_nacional"`);
    await queryRunner.query(`DROP TABLE "pais"`);
    await queryRunner.query(`DROP TYPE "public"."status_pais"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_c3628a537715bc85480ed6f3aa"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_319d332b322fc26b8cbe50b074"`,
    );
    await queryRunner.query(`DROP TABLE "ocorrencia"`);
    await queryRunner.query(`DROP TABLE "especie"`);
    await queryRunner.query(`DROP TYPE "public"."status_conservacao"`);
    await queryRunner.query(`DROP TYPE "public"."reino"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_4069990be8f9acc8290b269e38"`,
    );
    await queryRunner.query(`DROP TABLE "nome_alternativo"`);
    await queryRunner.query(`DROP TABLE "fonte"`);
    await queryRunner.query(`DROP TYPE "public"."escopo_fonte"`);
    await queryRunner.query(`DROP TABLE "bioma_global"`);
  }
}
