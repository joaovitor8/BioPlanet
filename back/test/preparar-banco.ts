/// <reference types="vite/client" />
// Roda uma vez antes dos testes e2e (globalSetup do vitest.config.e2e.ts):
// cria o banco de testes se faltar, aplica as migrations e coloca os dados de exemplo.

import { DataSource, type DataSourceOptions } from 'typeorm';
import { dataSourceOptions } from '../src/database/data-source.js';
import { semear } from '../src/database/seed/semear.js';

// As migrations são lidas do código-fonte. O data-source normal aponta para dist/,
// que pode estar desatualizado quando os testes rodam.
const migrations = Object.values(
  import.meta.glob<Record<string, unknown>>('../src/database/migrations/*.ts', {
    eager: true,
  }),
)
  .flatMap((modulo) => Object.values(modulo))
  .filter((exportado) => typeof exportado === 'function') as Function[];

export default async function prepararBancoDeTeste() {
  const url = new URL(process.env.DATABASE_URL!);
  const nome = decodeURIComponent(url.pathname.slice(1));
  if (!/^[a-z0-9_]+$/.test(nome)) {
    throw new Error(`Nome de banco de testes inesperado: "${nome}".`);
  }
  if (!nome.endsWith('_test') && !process.env.DATABASE_URL_TEST) {
    throw new Error(`O seed apaga dados: recusei rodar no banco "${nome}".`);
  }

  // Cria o banco conectando no banco de manutenção "postgres".
  const manutencao = new URL(url);
  manutencao.pathname = '/postgres';
  const admin = new DataSource({
    ...dataSourceOptions,
    url: manutencao.toString(),
    entities: [],
    migrations: [],
  } as DataSourceOptions);
  await admin.initialize();
  const existe = await admin.query(
    'select 1 from pg_database where datname = $1',
    [nome],
  );
  if (existe.length === 0) await admin.query(`create database "${nome}"`);
  await admin.destroy();

  const db = new DataSource({
    ...dataSourceOptions,
    url: url.toString(),
    migrations,
  } as DataSourceOptions);
  await db.initialize();
  await db.runMigrations();
  await db.transaction(semear);
  await db.destroy();
}
