# Guia de construção — Front-end, fase 1

Catálogo público de espécies (fauna e flora) em Next.js, com dados fixos.
Este documento define o que construir agora e com qual linguagem visual

---

## 1. Escopo da fase 1

**Entra:**

- Rotas de leitura funcionando com dados locais
- Ficha de espécie completa (é o produto; todo o resto leva até ela)
- Listagem com busca por nome e filtros combinados
- Entre 20 e 40 fichas reais, escritas à mão, com fotos licenciadas
- Design system aplicado e responsivo

**Não entra:**

- Autenticação, painel de administração, favoritos
- Mapa de distribuição (depende dos dados de ocorrência do GBIF)
- i18n
- Busca por similaridade ou qualquer coisa com índice invertido

A tentação aqui é fazer 5 fichas e partir para o back-end. Não faça: é com 30
fichas que os buracos do modelo de dados aparecem — a espécie que ocorre em
quatro biomas, a que não tem nome popular, a que tem três.

---

## 2. Conceito visual

**Guia de campo, não enciclopédia sépia.**

A referência não é o livro botânico vitoriano de fundo creme e ilustração em
bico-de-pena. É o guia de campo moderno: impresso para ser lido na luz do sol,
denso em informação, com a cor usada como código e não como enfeite. Papel claro
e frio, tipografia de referência, foto recortada e limpa.

Três princípios que decidem as dúvidas do dia a dia:

1. **Cor é dado.** Nenhuma cor entra na interface por gosto. As cores do site
   codificam duas coisas e só duas: grupo taxonômico e status de conservação.
   Links e botões não têm cor de marca — se distinguem por peso e sublinhado.
2. **A ficha manda.** Listagem, filtros e navegação existem para entregar a
   ficha. Qualquer ornamento que atrapalhe a leitura dela sai.
3. **Um elemento ousado, o resto quieto.** A ousadia do site está na régua de
   conservação (§7). Tudo ao redor é disciplinado.

---

## 3. Cor

### Base

| Token | Hex | Uso |
|---|---|---|
| `--papel` | `#FAFAF7` | fundo da página |
| `--papel-fundo` | `#F0F0EA` | superfícies recuadas, linhas zebradas, campo de busca |
| `--tinta` | `#243B31` | texto principal |
| `--tinta-suave` | `#5C6B63` | texto secundário, rótulos, metadados |
| `--linha` | `#D8D8D0` | bordas e divisores |

`--tinta` é um verde-herbário assumido, não um preto disfarçado: em blocos
grandes de texto ele aparece visivelmente esverdeado, e é isso mesmo. Contraste
sobre `--papel` fica acima de 10:1.

### Foco e ação

| Token | Hex | Uso |
|---|---|---|
| `--foco` | `#1554D1` | anel de foco do teclado, estado ativo de controle |

Essa é a única cor do sistema que nunca aparece em conteúdo. Por isso ela
significa interação sem ambiguidade. Links no corpo do texto usam `--tinta` com
sublinhado de 1px em `--linha`, que engrossa e escurece no hover.

### Grupo taxonômico

Cor de índice, como a margem colorida dos guias impressos. Aparece na tarja
lateral do card, no cabeçalho da ficha e nos chips de filtro.

| Grupo | Hex |
|---|---|
| Mamíferos | `#8C5A3B` |
| Aves | `#2F6F8F` |
| Répteis | `#6B7B2E` |
| Anfíbios | `#3E8C7A` |
| Peixes | `#3A5EA8` |
| Artrópodes | `#9A6E1F` |
| Plantas | `#2E7D4F` |
| Fungos | `#7A4B6B` |

Dessaturadas de propósito: com oito cores na mesma tela, saturação alta vira
ruído. Use-as em faixas e traços finos, nunca como fundo de área grande.

### Status de conservação

Essas **não são escolha sua** — são as cores oficiais da Red List, e trocá-las
quebra o reconhecimento de quem já conhece a escala.

| Categoria | Hex | Texto sobre |
|---|---|---|
| EX — Extinta | `#000000` | branco |
| EW — Extinta na natureza | `#542344` | branco |
| CR — Criticamente em perigo | `#D81E05` | branco |
| EN — Em perigo | `#FC7F3F` | tinta |
| VU — Vulnerável | `#F9E814` | tinta |
| NT — Quase ameaçada | `#CCE226` | tinta |
| LC — Pouco preocupante | `#60C659` | tinta |
| DD — Dados insuficientes | `#D1D1C6` | tinta |
| NE — Não avaliada | `#F0F0EA` | tinta-suave |

Nunca comunique status só por cor: a sigla e o nome por extenso andam sempre
junto com a tarja.

---

## 4. Tipografia

Duas famílias, papéis claramente separados.

**Literata** — nomes de espécie, títulos e todo texto de leitura corrida.
Serifa de leitura, itálico verdadeiro (não oblíquo). O itálico é requisito
funcional: nome científico se escreve em itálico, e uma família sem itálico
desenhado deixa *Panthera onca* feio em toda página do site.

**Atkinson Hyperlegible** — interface, rótulos, dados tabulados, números,
botões e filtros. Desenhada para máxima distinção entre caracteres, o que
importa em um site público com muito dado curto e sigla.

```ts
// app/layout.tsx
import { Literata, Atkinson_Hyperlegible } from "next/font/google";

const serif = Literata({
  subsets: ["latin"],
  variable: "--fonte-leitura",
  display: "swap",
});

const sans = Atkinson_Hyperlegible({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--fonte-interface",
  display: "swap",
});
```

### Escala

Base de 17px. Razão de 1.25, arredondada para valores inteiros confortáveis.

| Token | px | Uso |
|---|---|---|
| `--t-display` | 42 | nome da espécie na ficha |
| `--t-titulo` | 33 | título de seção de página |
| `--t-subtitulo` | 26 | nome da espécie no card |
| `--t-destaque` | 21 | olho da ficha, texto de abertura |
| `--t-corpo` | 17 | leitura |
| `--t-apoio` | 14 | metadados, legenda de foto |
| `--t-dado` | 12 | rótulo de campo, crédito de imagem |

Entrelinha: 1.6 no corpo em serifa, 1.4 na interface em sans, 1.05 no display.
Largura máxima de linha: 66 caracteres (`max-width: 66ch`).

### Regras de escrita

- Nome científico sempre em itálico, gênero em maiúscula, espécie em minúscula:
  *Panthera onca*. Vale no `<h1>`, no card, no `<title>` e no alt.
- Nome popular em caixa de sentença: "Onça-pintada", nunca "ONÇA-PINTADA".
- Nada de rótulo em caixa alta espaçada acima dos blocos. Se um bloco precisa de
  rótulo para ser entendido, o problema é a hierarquia, não a falta de rótulo.
- Autoria e ano do táxon em `--t-dado`, cor `--tinta-suave`, sem itálico:
  Linnaeus, 1758.

---

## 5. Layout

Grade de 12 colunas, medida máxima de 1160px, coluna de leitura sempre alinhada
à esquerda. Nada centralizado além do próprio contêiner — texto centralizado em
ficha de referência prejudica a varredura.

**Home**

```
┌──────────────────────────────────────────────────┐
│ marca            espécies  biomas  grupos  sobre │
├───────────────────────────┬──────────────────────┤
│ Procure entre 312         │                      │
│ espécies                  │   [ foto recortada ] │
│                           │                      │
│ [ campo de busca        ] │   Harpia harpyja     │
│                           │   Gavião-real        │
│ ou comece pelos biomas ↓  │   ▇ NT  Amazônia     │
├───────────────────────────┴──────────────────────┤
│ Amazônia │ Cerrado │ Mata Atl. │ Caatinga │ ...  │
└──────────────────────────────────────────────────┘
```

O hero é a busca ao lado de uma espécie em destaque tratada como prancha de
identificação. Não é uma foto de floresta ocupando a tela inteira: o site é um
catálogo, e a primeira coisa que ele deve mostrar é que sabe encontrar coisas.

**Ficha**

```
┌──────────────────────────────────────────────────┐
│ ▌Aves · Accipitridae                             │  ← tarja do grupo
│                                                  │
│ Harpia harpyja                                   │  display, itálico
│ Gavião-real                                      │  subtítulo
│                                                  │
│ ┌───── EX  EW  CR  EN  VU  NT  LC ─────┐         │  ← régua §7
│ │                            ▲          │         │
│ └───────────────────────────────────────┘         │
├────────────────────────┬─────────────────────────┤
│ [ foto ]               │ Descrição               │
│ crédito, licença       │ Habitat                 │
│                        │ Distribuição            │
│ Reino     Animalia     │ Alimentação             │
│ Filo      Chordata     │ Reprodução              │
│ Classe    Aves         │ Ameaças                 │
│ Ordem     Accipitri... │                         │
│ Família   Accipitridae │ Fontes                  │
│ Gênero    Harpia       │                         │
└────────────────────────┴─────────────────────────┘
```

A coluna esquerda é fixa e tabular (ficha de espécime). A direita é leitura
corrida. Em telas menores que 900px a esquerda vira um bloco acima do texto,
sem virar acordeão — dado escondido em acordeão é dado que ninguém lê.

**Listagem:** grade de cards com filtros à esquerda em desktop e em gaveta no
mobile. Filtros atualizam a URL (`?grupo=aves&bioma=cerrado&status=CR`) para que
o estado seja compartilhável e, mais tarde, vire query direta para o Nest.

---

## 6. Forma e movimento

- Raio de borda: 3px em controles e chips. **0 em imagens e pranchas** — a foto
  é espécime, não card de SaaS.
- Sem sombras. Separação por linha de 1px em `--linha` e por mudança de fundo
  para `--papel-fundo`.
- Sem gradiente em lugar nenhum.
- Movimento apenas como resposta a uma ação do usuário: gaveta de filtro
  abrindo, chip entrando na barra de filtros ativos, transição de 120ms.
  Nada de elementos surgindo ao rolar a página.
- `prefers-reduced-motion` respeitado sempre.

---

## 7. A régua de conservação

O único componente onde vale investir tempo de sobra. Uma escala horizontal de
EX a LC, com as nove cores oficiais, marcando onde a espécie está — e o mais
importante, **mostrando o que ela não é**. A onça-pintada é NT; ver o NT a dois
passos de CR comunica mais do que qualquer parágrafo.

Requisitos: legível a 320px de largura; a categoria atual recebe rótulo por
extenso, as demais só a sigla; `aria-label` descrevendo a posição em texto;
quando o status é DD ou NE, a régua aparece inteira em cinza com uma linha
explicando que a espécie não foi avaliada, em vez de sumir.

---

## 8. Componentes da fase 1

| Componente | Responsabilidade |
|---|---|
| `CardEspecie` | foto, nome científico em itálico, nome popular, tarja de grupo, sigla de status |
| `ReguaConservacao` | §7 |
| `FichaTaxonomica` | tabela reino → gênero, cada nível linkando para `/taxonomia/...` |
| `CampoBusca` | busca por nome popular e científico, sem debounce mágico — 250ms |
| `PainelFiltros` | grupo, bioma, status; estado na URL; chips removíveis |
| `CreditoImagem` | autor, licença e link da fonte — obrigatório, nunca opcional |
| `EstadoVazio` | "Nenhuma espécie com esses filtros" + botão que limpa o filtro mais restritivo |

Nenhum deles importa `species.json`. Todos recebem dados por props, vindos das
funções da camada `lib/data/`.

---

## 9. Imagem

Toda foto entra por `next/image` com `width` e `height` declarados. Proporção
padrão 4:3 na listagem, livre na ficha.

O objeto de imagem no JSON tem campos obrigatórios — autor, licença, URL da
fonte — e o componente não renderiza se algum faltar. Fazer isso travar na fase
1, com 30 fichas, é barato. Fazer na fase 3 com 3 mil fichas importadas é um
mutirão.

Fontes com licença rastreável: Wikimedia Commons e iNaturalist (filtrando por
CC-BY / CC-BY-SA / CC0).

---

## 10. Qualidade mínima

- Responsivo a partir de 320px
- Foco de teclado visível em todo controle, usando `--foco`
- Contraste AA em qualquer combinação de texto e fundo, incluindo texto sobre
  as cores de status
- Cor nunca é o único portador de informação
- `<h1>` único por página, hierarquia de heading sem pulos
- Metadados Open Graph por ficha — em um site público, a ficha é a unidade que
  as pessoas compartilham

---

## 11. Decisões ainda em aberto

- **Formato do slug** da ficha: nome popular ou nome científico. Trava redirects
  e links externos; é a única coisa aqui que dói mudar depois.
- **Escopo geográfico**: só Brasil ou mundo. Muda a lista de biomas de oito
  itens fixos para uma entidade com classificação própria.
