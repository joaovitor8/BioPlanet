// Dados de EXEMPLO, os mesmos do front (web/src/data).
// Servem só para testar a API enquanto a importação das fontes reais não existe.
// Status de conservação só foram preenchidos onde havia segurança; o resto fica vazio.

import {
  EscopoFonte,
  Reino,
  StatusConservacao as S,
  StatusPais,
} from '../enums.js';

export const fontes = [
  {
    slug: 'gbif',
    nome: 'GBIF',
    descricao: 'Registros de ocorrência com coordenadas, no mundo todo.',
    url: 'https://www.gbif.org',
    escopo: EscopoFonte.Global,
  },
  {
    slug: 'inaturalist',
    nome: 'iNaturalist',
    descricao:
      'Fotos com licença Creative Commons e nomes populares em vários idiomas.',
    url: 'https://www.inaturalist.org',
    escopo: EscopoFonte.Global,
  },
  {
    slug: 'iucn',
    nome: 'IUCN Red List',
    descricao: 'Status de conservação global de cada espécie.',
    url: 'https://www.iucnredlist.org',
    escopo: EscopoFonte.Global,
  },
  {
    slug: 'col',
    nome: 'Catalogue of Life',
    descricao: 'Taxonomia de referência para nomes científicos.',
    url: 'https://www.catalogueoflife.org',
    escopo: EscopoFonte.Global,
  },
  {
    slug: 'resolve',
    nome: 'RESOLVE Ecoregions',
    descricao: 'Mapa global de biomas e ecorregiões.',
    url: 'https://ecoregions.appspot.com',
    escopo: EscopoFonte.Global,
  },
  {
    slug: 'flora-brasil',
    nome: 'Flora e Funga do Brasil',
    descricao:
      'Plantas, algas e fungos: nomes aceitos, forma de vida e distribuição.',
    url: 'https://floradobrasil.jbrj.gov.br',
    escopo: EscopoFonte.Nacional,
  },
  {
    slug: 'fauna-brasil',
    nome: 'Fauna do Brasil',
    descricao: 'Catálogo taxonômico dos animais e sua distribuição.',
    url: 'https://fauna.jbrj.gov.br',
    escopo: EscopoFonte.Nacional,
  },
  {
    slug: 'salve',
    nome: 'SALVE / ICMBio',
    descricao: 'Risco de extinção da fauna brasileira.',
    url: 'https://salve.icmbio.gov.br',
    escopo: EscopoFonte.Nacional,
  },
];

export const paises = [
  {
    codigo: 'BR',
    slug: 'br',
    nome: 'Brasil',
    continente: 'america-do-sul',
    status: StatusPais.Disponivel,
    autoridadeBioma: 'IBGE',
    intro:
      'Seis biomas, da maior floresta tropical do mundo aos campos do Pampa. Explore as espécies de cada um.',
    fontes: ['flora-brasil', 'fauna-brasil', 'salve'],
  },
  {
    codigo: 'AR',
    slug: 'ar',
    nome: 'Argentina',
    continente: 'america-do-sul',
    status: StatusPais.EmPreparacao,
  },
  {
    codigo: 'CO',
    slug: 'co',
    nome: 'Colômbia',
    continente: 'america-do-sul',
    status: StatusPais.Global,
  },
  {
    codigo: 'PE',
    slug: 'pe',
    nome: 'Peru',
    continente: 'america-do-sul',
    status: StatusPais.Global,
  },
  {
    codigo: 'MX',
    slug: 'mx',
    nome: 'México',
    continente: 'america-do-norte',
    status: StatusPais.Global,
  },
  {
    codigo: 'US',
    slug: 'us',
    nome: 'Estados Unidos',
    continente: 'america-do-norte',
    status: StatusPais.Global,
  },
  {
    codigo: 'PT',
    slug: 'pt',
    nome: 'Portugal',
    continente: 'europa',
    status: StatusPais.EmPreparacao,
  },
  {
    codigo: 'ES',
    slug: 'es',
    nome: 'Espanha',
    continente: 'europa',
    status: StatusPais.Global,
  },
  {
    codigo: 'ZA',
    slug: 'za',
    nome: 'África do Sul',
    continente: 'africa',
    status: StatusPais.Global,
  },
  {
    codigo: 'KE',
    slug: 'ke',
    nome: 'Quênia',
    continente: 'africa',
    status: StatusPais.Global,
  },
  {
    codigo: 'IN',
    slug: 'in',
    nome: 'Índia',
    continente: 'asia',
    status: StatusPais.Global,
  },
  {
    codigo: 'ID',
    slug: 'id',
    nome: 'Indonésia',
    continente: 'asia',
    status: StatusPais.Global,
  },
  {
    codigo: 'AU',
    slug: 'au',
    nome: 'Austrália',
    continente: 'oceania',
    status: StatusPais.Global,
  },
  {
    codigo: 'NZ',
    slug: 'nz',
    nome: 'Nova Zelândia',
    continente: 'oceania',
    status: StatusPais.Global,
  },
];

export const biomasGlobais = [
  {
    numero: 1,
    nome: 'Florestas tropicais úmidas',
    exemplos: 'Amazônia, bacia do Congo, Bornéu',
  },
  {
    numero: 2,
    nome: 'Florestas tropicais secas',
    exemplos: 'Florestas secas do México e da Índia',
  },
  {
    numero: 3,
    nome: 'Florestas tropicais de coníferas',
    exemplos: 'Pinhais do México e da América Central',
  },
  {
    numero: 4,
    nome: 'Florestas temperadas mistas',
    exemplos: 'Europa central, leste da América do Norte',
  },
  {
    numero: 5,
    nome: 'Florestas temperadas de coníferas',
    exemplos: 'Costa do Pacífico da América do Norte',
  },
  {
    numero: 6,
    nome: 'Florestas boreais (taiga)',
    exemplos: 'Sibéria, Canadá, Escandinávia',
  },
  {
    numero: 7,
    nome: 'Savanas e campos tropicais',
    exemplos: 'Cerrado, Serengeti',
  },
  {
    numero: 8,
    nome: 'Campos temperados',
    exemplos: 'Pampa, pradarias norte-americanas, estepes',
  },
  {
    numero: 9,
    nome: 'Campos alagáveis',
    exemplos: 'Pantanal, delta do Okavango',
  },
  {
    numero: 10,
    nome: 'Campos de altitude',
    exemplos: 'Páramos andinos, planalto tibetano',
  },
  { numero: 11, nome: 'Tundra', exemplos: 'Ártico, norte do Alasca' },
  {
    numero: 12,
    nome: 'Vegetação mediterrânea',
    exemplos: 'Mediterrâneo, Califórnia, Cabo',
  },
  {
    numero: 13,
    nome: 'Desertos e matagais secos',
    exemplos: 'Caatinga, Saara, Atacama',
  },
  { numero: 14, nome: 'Manguezais', exemplos: 'Costa brasileira, Sundarbans' },
];

// Biomas do Brasil (IBGE, 2019). biomaGlobal = número do bioma global.
export const biomasNacionais = [
  {
    pais: 'BR',
    slug: 'amazonia',
    nome: 'Amazônia',
    areaPct: 49.5,
    biomaGlobal: 1,
    descricao: 'A maior floresta tropical do mundo, cortada por rios gigantes.',
  },
  {
    pais: 'BR',
    slug: 'cerrado',
    nome: 'Cerrado',
    areaPct: 23.3,
    biomaGlobal: 7,
    descricao:
      'Savana tropical do Planalto Central, com campos, veredas e matas de galeria. Abriga nascentes de grandes bacias hidrográficas do país.',
  },
  {
    pais: 'BR',
    slug: 'mata-atlantica',
    nome: 'Mata Atlântica',
    areaPct: 13.0,
    biomaGlobal: 1,
    descricao:
      'Floresta da costa, hoje muito fragmentada e cheia de espécies que só existem nela.',
  },
  {
    pais: 'BR',
    slug: 'caatinga',
    nome: 'Caatinga',
    areaPct: 10.1,
    biomaGlobal: 13,
    descricao:
      'Floresta seca do semiárido, o único bioma exclusivamente brasileiro.',
  },
  {
    pais: 'BR',
    slug: 'pampa',
    nome: 'Pampa',
    areaPct: 2.3,
    biomaGlobal: 8,
    descricao: 'Campos do extremo sul, com gramíneas e banhados.',
  },
  {
    pais: 'BR',
    slug: 'pantanal',
    nome: 'Pantanal',
    areaPct: 1.8,
    biomaGlobal: 9,
    descricao: 'Planície que alaga todo ano e concentra fauna fácil de ver.',
  },
];

const animal = (
  classe: string,
  ordem: string,
  familia: string,
  genero: string,
) => ({
  taxReino: 'Animalia',
  taxFilo: 'Chordata',
  taxClasse: classe,
  taxOrdem: ordem,
  taxFamilia: familia,
  taxGenero: genero,
});
const planta = (
  classe: string,
  ordem: string,
  familia: string,
  genero: string,
) => ({
  taxReino: 'Plantae',
  taxFilo: 'Tracheophyta',
  taxClasse: classe,
  taxOrdem: ordem,
  taxFamilia: familia,
  taxGenero: genero,
});

interface EspecieExemplo {
  slug: string;
  nomeCientifico: string;
  autoria?: string;
  nomePopular: string;
  outrosNomes?: string[];
  reino: Reino;
  grupo: string;
  taxonomia: ReturnType<typeof animal>;
  statusGlobal?: S;
  resumo?: string;
  /** país → status nacional (ou null) */
  paises: Record<string, S | null>;
  /** biomas do Brasil */
  biomasBR: string[];
}

export const especies: EspecieExemplo[] = [
  {
    slug: 'panthera-onca',
    nomeCientifico: 'Panthera onca',
    autoria: '(Linnaeus, 1758)',
    nomePopular: 'Onça-pintada',
    outrosNomes: ['jaguar', 'jaguaretê'],
    reino: Reino.Fauna,
    grupo: 'Mamífero',
    taxonomia: animal('Mammalia', 'Carnivora', 'Felidae', 'Panthera'),
    statusGlobal: S.NT,
    resumo:
      'O maior felino das Américas. Predador de topo, depende de áreas grandes e conectadas de vegetação nativa.',
    paises: { BR: S.VU, MX: null, CO: null, PE: null, AR: null },
    biomasBR: ['amazonia', 'cerrado', 'pantanal', 'mata-atlantica', 'caatinga'],
  },
  {
    slug: 'victoria-amazonica',
    nomeCientifico: 'Victoria amazonica',
    nomePopular: 'Vitória-régia',
    reino: Reino.Flora,
    grupo: 'Planta aquática',
    taxonomia: planta(
      'Magnoliopsida',
      'Nymphaeales',
      'Nymphaeaceae',
      'Victoria',
    ),
    paises: { BR: null, PE: null },
    biomasBR: ['amazonia'],
  },
  {
    slug: 'chrysocyon-brachyurus',
    nomeCientifico: 'Chrysocyon brachyurus',
    autoria: '(Illiger, 1815)',
    nomePopular: 'Lobo-guará',
    reino: Reino.Fauna,
    grupo: 'Mamífero',
    taxonomia: animal('Mammalia', 'Carnivora', 'Canidae', 'Chrysocyon'),
    statusGlobal: S.NT,
    paises: { BR: S.VU, AR: null, PE: null },
    biomasBR: ['cerrado', 'pantanal', 'pampa'],
  },
  {
    slug: 'araucaria-angustifolia',
    nomeCientifico: 'Araucaria angustifolia',
    nomePopular: 'Araucária',
    outrosNomes: ['pinheiro-do-paraná'],
    reino: Reino.Flora,
    grupo: 'Árvore',
    taxonomia: planta('Pinopsida', 'Pinales', 'Araucariaceae', 'Araucaria'),
    statusGlobal: S.CR,
    paises: { BR: S.EN, AR: null },
    biomasBR: ['mata-atlantica'],
  },
  {
    slug: 'myrmecophaga-tridactyla',
    nomeCientifico: 'Myrmecophaga tridactyla',
    autoria: 'Linnaeus, 1758',
    nomePopular: 'Tamanduá-bandeira',
    reino: Reino.Fauna,
    grupo: 'Mamífero',
    taxonomia: animal('Mammalia', 'Pilosa', 'Myrmecophagidae', 'Myrmecophaga'),
    statusGlobal: S.VU,
    paises: { BR: S.VU, CO: null, PE: null, AR: null },
    biomasBR: ['cerrado', 'pantanal', 'amazonia'],
  },
  {
    slug: 'cereus-jamacaru',
    nomeCientifico: 'Cereus jamacaru',
    nomePopular: 'Mandacaru',
    reino: Reino.Flora,
    grupo: 'Cacto',
    taxonomia: planta('Magnoliopsida', 'Caryophyllales', 'Cactaceae', 'Cereus'),
    paises: { BR: null },
    biomasBR: ['caatinga'],
  },
  {
    slug: 'anodorhynchus-hyacinthinus',
    nomeCientifico: 'Anodorhynchus hyacinthinus',
    autoria: '(Latham, 1790)',
    nomePopular: 'Arara-azul-grande',
    reino: Reino.Fauna,
    grupo: 'Ave',
    taxonomia: animal('Aves', 'Psittaciformes', 'Psittacidae', 'Anodorhynchus'),
    statusGlobal: S.VU,
    paises: { BR: null },
    biomasBR: ['pantanal', 'cerrado', 'amazonia'],
  },
  {
    slug: 'rhea-americana',
    nomeCientifico: 'Rhea americana',
    autoria: '(Linnaeus, 1758)',
    nomePopular: 'Ema',
    reino: Reino.Fauna,
    grupo: 'Ave',
    taxonomia: animal('Aves', 'Rheiformes', 'Rheidae', 'Rhea'),
    paises: { BR: null, AR: null },
    biomasBR: ['cerrado', 'pampa', 'pantanal'],
  },
  {
    slug: 'caryocar-brasiliense',
    nomeCientifico: 'Caryocar brasiliense',
    nomePopular: 'Pequizeiro',
    outrosNomes: ['pequi'],
    reino: Reino.Flora,
    grupo: 'Árvore',
    taxonomia: planta(
      'Magnoliopsida',
      'Malpighiales',
      'Caryocaraceae',
      'Caryocar',
    ),
    paises: { BR: null },
    biomasBR: ['cerrado'],
  },
  {
    slug: 'mauritia-flexuosa',
    nomeCientifico: 'Mauritia flexuosa',
    nomePopular: 'Buriti',
    reino: Reino.Flora,
    grupo: 'Palmeira',
    taxonomia: planta('Liliopsida', 'Arecales', 'Arecaceae', 'Mauritia'),
    paises: { BR: null, CO: null, PE: null },
    biomasBR: ['cerrado', 'amazonia'],
  },
  {
    slug: 'cariama-cristata',
    nomeCientifico: 'Cariama cristata',
    nomePopular: 'Seriema',
    reino: Reino.Fauna,
    grupo: 'Ave',
    taxonomia: animal('Aves', 'Cariamiformes', 'Cariamidae', 'Cariama'),
    paises: { BR: null, AR: null },
    biomasBR: ['cerrado', 'caatinga', 'pantanal'],
  },
  {
    slug: 'handroanthus-ochraceus',
    nomeCientifico: 'Handroanthus ochraceus',
    nomePopular: 'Ipê-amarelo-do-cerrado',
    reino: Reino.Flora,
    grupo: 'Árvore',
    taxonomia: planta(
      'Magnoliopsida',
      'Lamiales',
      'Bignoniaceae',
      'Handroanthus',
    ),
    paises: { BR: null },
    biomasBR: ['cerrado'],
  },
  {
    slug: 'stryphnodendron-adstringens',
    nomeCientifico: 'Stryphnodendron adstringens',
    nomePopular: 'Barbatimão',
    reino: Reino.Flora,
    grupo: 'Árvore',
    taxonomia: planta(
      'Magnoliopsida',
      'Fabales',
      'Fabaceae',
      'Stryphnodendron',
    ),
    paises: { BR: null },
    biomasBR: ['cerrado'],
  },
];
