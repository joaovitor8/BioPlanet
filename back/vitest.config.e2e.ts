import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

// Os testes e2e usam um banco só deles, para nunca mexer nos dados de desenvolvimento
// (inclusive os importados). Padrão: o banco do DATABASE_URL com "_test" no fim do nome.
// Para usar outro, defina DATABASE_URL_TEST.
try {
  process.loadEnvFile();
} catch {
  // Sem .env: usa as variáveis do sistema.
}

function urlDoBancoDeTeste() {
  if (process.env.DATABASE_URL_TEST) return process.env.DATABASE_URL_TEST;
  if (!process.env.DATABASE_URL) {
    throw new Error('Defina DATABASE_URL no arquivo .env (veja .env.example).');
  }
  const url = new URL(process.env.DATABASE_URL);
  url.pathname = `${url.pathname}_test`;
  return url.toString();
}

const DATABASE_URL = urlDoBancoDeTeste();
// O globalSetup roda neste processo; os testes rodam em outros, que recebem test.env.
process.env.DATABASE_URL = DATABASE_URL;

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    globals: true,
    root: './',
    include: ['**/*.e2e-spec.ts'],
    globalSetup: ['./test/preparar-banco.ts'],
    env: { DATABASE_URL },
  },
});
