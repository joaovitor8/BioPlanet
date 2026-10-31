// Responde 404 para endereços de espécie, país ou bioma que não existem.
// Sem isso, a primeira visita a um endereço desses recebe a casca genérica da
// página com status 200 (o Next só descobre que não existe depois de começar a
// enviar a resposta). Aqui a checagem acontece antes de a página renderizar.

import { NextResponse, type NextRequest } from "next/server";
import { getCountry, getNationalBiome, getSpecies } from "@/lib/data";

export const config = {
  matcher: ["/especie/:slug", "/pais/:pais", "/pais/:pais/:bioma"],
};

export async function proxy(request: NextRequest) {
  if (await exists(request.nextUrl.pathname)) return;
  // Nenhuma rota atende este endereço, então o Next mostra o not-found.tsx com 404.
  return NextResponse.rewrite(new URL("/_nao-encontrado", request.url));
}

async function exists(pathname: string) {
  const parts = pathname.split("/").filter(Boolean).map(decode);
  if (parts.includes(null)) return false;
  const [section, first, second] = parts as string[];

  if (section === "especie") return !!(await getSpecies(first));

  const country = await getCountry(first);
  if (!country || country.status !== "disponivel") return false;
  return second === undefined || !!(await getNationalBiome(country.code, second));
}

function decode(part: string) {
  try {
    return decodeURIComponent(part);
  } catch {
    return null;
  }
}
