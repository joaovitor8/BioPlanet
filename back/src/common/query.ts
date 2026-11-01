import { BadRequestException } from '@nestjs/common';

/**
 * Lê um parâmetro de query string que deve aparecer no máximo uma vez.
 * "?country=br&country=ar" chega como lista; aqui isso vira erro 400.
 */
export function singleQuery(value: unknown, name: string): string | undefined {
  if (value === undefined) return undefined;
  if (typeof value !== 'string') {
    throw new BadRequestException(`Use ?${name}= uma vez só, com um valor.`);
  }
  return value.trim() || undefined;
}

/** Lê um parâmetro sim/não: só aceita "true" ou "false". */
export function booleanQuery(
  value: unknown,
  name: string,
): boolean | undefined {
  const text = singleQuery(value, name);
  if (text === undefined) return undefined;
  if (text !== 'true' && text !== 'false') {
    throw new BadRequestException(`Use ?${name}=true ou ?${name}=false.`);
  }
  return text === 'true';
}
