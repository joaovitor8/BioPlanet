import { BiomaGlobal } from './bioma-global.entity.js';
import { BiomaNacional } from './bioma-nacional.entity.js';
import { Especie } from './especie.entity.js';
import { Fonte } from './fonte.entity.js';
import { Foto } from './foto.entity.js';
import { NomeAlternativo } from './nome-alternativo.entity.js';
import { Ocorrencia } from './ocorrencia.entity.js';
import { Pais } from './pais.entity.js';

export {
  BiomaGlobal,
  BiomaNacional,
  Especie,
  Fonte,
  Foto,
  NomeAlternativo,
  Ocorrencia,
  Pais,
};

/** Todas as entidades. Ao criar uma nova, adicione aqui. */
export const entities = [
  Pais,
  BiomaGlobal,
  BiomaNacional,
  Especie,
  NomeAlternativo,
  Ocorrencia,
  Fonte,
  Foto,
];
