# BioPlanet — back

API do BioPlanet. NestJS 12 + TypeORM + PostgreSQL.

## Primeira vez

1. **Suba um Postgres.** O jeito mais simples é o Docker (já vem com PostGIS, para os mapas no futuro):

   ```bash
   docker compose up -d
   ```

   Também dá para usar Supabase ou Neon: pegue a connection string deles e use no passo 2, com `DATABASE_SSL=true`. No Supabase, baixe também o certificado SSL (Project Settings → Database) e aponte `DATABASE_SSL_CA` para o arquivo. Sem ele a conexão é recusada, porque a API confere o certificado do banco.

2. **Crie o `.env`** copiando o exemplo:

   ```bash
   cp .env.example .env
   ```

3. **Instale, crie as tabelas e coloque os dados de exemplo:**

   ```bash
   npm install
   npm run migration:run
   npm run seed
   ```

4. **Rode a API:**

   ```bash
   npm run start:dev
   ```

   Abra http://localhost:3001/health. Deve aparecer `{"status":"ok","banco":"conectado"}`.

## Comandos do banco

| Comando | O que faz |
| --- | --- |
| `npm run migration:run` | Aplica as migrations que ainda não rodaram |
| `npm run migration:revert` | Desfaz a última migration |
| `npm run migration:generate -- src/database/migrations/NomeDaMudanca` | Compara as entidades com o banco e gera uma migration com a diferença |
| `npm run seed` | **Apaga** o conteúdo das tabelas e insere os dados de exemplo |

Fluxo para mudar uma tabela: edite a entidade → `migration:generate` → **leia o SQL gerado** → `migration:run`.

## Organização

```
src/
  config/env.ts              carrega o .env
  database/
    data-source.ts           conexão (usada pelo Nest e pelo CLI do TypeORM)
    enums.ts                 valores fixos (status, reino...)
    entities/                uma classe por tabela
    migrations/              histórico de mudanças no banco
    seed/                    dados de exemplo
  health/                    GET /health
```

## Tabelas

`pais`, `bioma_global`, `bioma_nacional`, `especie`, `nome_alternativo`, `fonte` e as tabelas de ligação:

- `ocorrencia`: espécie ↔ país, com o status nacional (ex.: onça = VU no Brasil)
- `ocorrencia_bioma`: espécie ↔ bioma nacional
- `pais_fonte`: país ↔ fontes nacionais integradas

## Observação sobre o Supabase

Se usar o Supabase, as tabelas do schema `public` ficam visíveis na API automática dele. Ative o RLS em cada tabela (sem criar políticas) para bloquear esse acesso. A conexão do Nest continua funcionando, porque o dono das tabelas ignora o RLS.
