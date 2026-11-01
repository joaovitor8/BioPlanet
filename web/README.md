# BioPlanet — web

Site de fauna e flora do planeta, país por país. Começa pelo Brasil.

Feito com Next.js 16 (App Router), React 19, TypeScript e Tailwind CSS 4.

## Rodar

Os dados vêm da API em `../back`. Suba ela antes (veja o README de lá); o `npm run build` também precisa dela no ar, porque é no build que as páginas são geradas.

```bash
npm install
npm run dev
```

Abra http://localhost:3000.

A API é procurada em `http://localhost:3333`. Para outro endereço, defina `API_URL` (ex.: num `.env.local`).

Depois de mudar dados no banco, o site mostra a versão nova em até 1 hora, ou na hora com um novo build.

## Páginas

| URL | Arquivo | O que é |
| --- | --- | --- |
| `/` | `src/app/page.tsx` | Início: mapa-múndi, países, biomas globais, fontes |
| `/pais/br` | `src/app/pais/[pais]/page.tsx` | País: biomas nacionais e espécies em destaque |
| `/pais/br/cerrado` | `src/app/pais/[pais]/[bioma]/page.tsx` | Bioma: espécies com filtros |
| `/especie/panthera-onca` | `src/app/especie/[slug]/page.tsx` | Ficha da espécie |
| `/busca?q=onca` | `src/app/busca/page.tsx` | Busca por nome popular, científico ou país |

## Organização

- `src/lib/data.ts` — única porta de entrada dos dados. As páginas só usam estas funções, que buscam na API com cache (`"use cache"`, renovado a cada hora).
- `src/data/types.ts` — formato dos dados (o mesmo das respostas da API). Os outros arquivos de `src/data/` são os dados de exemplo antigos; o site não lê mais as espécies, países, biomas e fontes de lá.
- `src/proxy.ts` — responde 404 para espécie, país ou bioma que não existe, perguntando à API antes de a página renderizar.
- `src/components/` — peças de interface. Os arquivos com `"use client"` são os interativos (filtros, seletor de país).

Fotos, mapas e números marcados com `[ ]` são espaços reservados até os dados reais serem importados.
