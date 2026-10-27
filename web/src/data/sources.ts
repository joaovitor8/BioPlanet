import type { Source } from "./types";

export const sources: Source[] = [
  { id: "gbif", name: "GBIF", what: "Registros de ocorrência com coordenadas, no mundo todo.", url: "https://www.gbif.org", scope: "global" },
  { id: "inaturalist", name: "iNaturalist", what: "Fotos com licença Creative Commons e nomes populares em vários idiomas.", url: "https://www.inaturalist.org", scope: "global" },
  { id: "iucn", name: "IUCN Red List", what: "Status de conservação global de cada espécie.", url: "https://www.iucnredlist.org", scope: "global" },
  { id: "col", name: "Catalogue of Life", what: "Taxonomia de referência para nomes científicos.", url: "https://www.catalogueoflife.org", scope: "global" },
  { id: "resolve", name: "RESOLVE Ecoregions", what: "Mapa global de biomas e ecorregiões.", url: "https://ecoregions.appspot.com", scope: "global" },
  { id: "flora-brasil", name: "Flora e Funga do Brasil", what: "Plantas, algas e fungos: nomes aceitos, forma de vida e distribuição.", url: "https://floradobrasil.jbrj.gov.br", scope: "nacional" },
  { id: "fauna-brasil", name: "Fauna do Brasil", what: "Catálogo taxonômico dos animais e sua distribuição.", url: "https://fauna.jbrj.gov.br", scope: "nacional" },
  { id: "salve", name: "SALVE / ICMBio", what: "Risco de extinção da fauna brasileira.", url: "https://salve.icmbio.gov.br", scope: "nacional" },
];
