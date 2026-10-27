# BioPlanet — web

Site de fauna e flora do planeta, país por país. Começa pelo Brasil.

Feito com Next.js 16 (App Router), React 19, TypeScript e Tailwind CSS 4.

## Rodar

```bash
npm install
npm run dev
```

Abra http://localhost:3000.

## Páginas

| URL | Arquivo | O que é |
| --- | --- | --- |
| `/` | `src/app/page.tsx` | Início: mapa-múndi, países, biomas globais, fontes |
| `/pais/br` | `src/app/pais/[pais]/page.tsx` | País: biomas nacionais e espécies em destaque |
| `/pais/br/cerrado` | `src/app/pais/[pais]/[bioma]/page.tsx` | Bioma: espécies com filtros |
| `/especie/panthera-onca` | `src/app/especie/[slug]/page.tsx` | Ficha da espécie |
| `/busca?q=onca` | `src/app/busca/page.tsx` | Busca por nome popular, científico ou país |

## Organização

- `src/data/` — dados de **exemplo** e seus tipos. Serão substituídos pelo banco.
- `src/lib/data.ts` — única porta de entrada dos dados. As páginas só usam estas funções; quando o banco existir, muda só este arquivo.
- `src/components/` — peças de interface. Os arquivos com `"use client"` são os interativos (filtros, seletor de país).

Fotos, mapas e números marcados com `[ ]` são espaços reservados até os dados reais serem importados.
