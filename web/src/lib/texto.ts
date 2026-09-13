import type { Especie } from "@/lib/types";

/**
 * O nome científico acompanha a espécie em toda parte — `<h1>`, card, `<title>`
 * e alt (guia.md §4). Onde não dá para aplicar itálico, ele ao menos aparece.
 */
export function altComNome(especie: Especie): string {
  return `${especie.nomeCientifico}: ${especie.imagem.alt}`;
}

/** "Onça-pintada, Jaguar" — e string vazia quando a espécie não tem nome popular. */
export function nomesPopulares(especie: Especie): string {
  return especie.nomesPopulares.join(", ");
}

/** Título de aba e de compartilhamento: nome científico primeiro, popular entre parênteses. */
export function tituloFicha(especie: Especie): string {
  const popular = especie.nomesPopulares[0];
  return popular ? `${especie.nomeCientifico} (${popular})` : especie.nomeCientifico;
}
