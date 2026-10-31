// Carrega o arquivo .env da raiz do projeto (recurso nativo do Node 20.12+).
// Importe este arquivo antes de ler process.env.
try {
  process.loadEnvFile();
} catch {
  // Sem .env: segue com as variáveis do sistema (ex.: no servidor de produção).
}
