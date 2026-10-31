import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { DataSource, type DataSourceOptions } from 'typeorm';
import '../config/env.js';
import { entities } from './entities/index.js';

if (!process.env.DATABASE_URL) {
  throw new Error('Defina DATABASE_URL no arquivo .env (veja .env.example).');
}

/**
 * Configuração do banco, usada em dois lugares:
 * - pelo Nest (AppModule), quando a API roda;
 * - pelo CLI do TypeORM (npm run migration:*), que lê o export default abaixo.
 */
export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities,
  // Caminho do JavaScript compilado: as migrations rodam a partir de dist/.
  migrations: [
    join(dirname(fileURLToPath(import.meta.url)), 'migrations', '*.js'),
  ],
  // Nunca deixe o TypeORM alterar as tabelas sozinho. Mudanças entram por migration.
  synchronize: false,
  ssl:
    process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false,
};

export default new DataSource(dataSourceOptions);
