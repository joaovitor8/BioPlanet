// Responde 404 para endereços de espécie, país ou bioma que não existem.
// Sem isso, a primeira visita a um endereço desses recebe a casca genérica da
// página com status 200 (o Next só descobre que não existe depois de começar a
// enviar a resposta). Aqui a checagem acontece antes de a página renderizar.
//
// O proxy não usa src/lib/data.ts: o "use cache" de lá não funciona aqui.
// Por isso ele pergunta direto à API, a cada visita, com respostas pequenas.

import { NextResponse, type NextRequest } from "next/server";
import { API_URL } from "@/lib/api-url";

export const config = {
  matcher: ["/especie/:slug", "/pais/:pais", "/pais/:pais/:bioma"],
};

export async function proxy(request: NextRequest) {
  try {
    if (await exists(request.nextUrl.pathname)) return;
  } catch (error) {
    // API fora do ar: deixa a página seguir. Ela mesma checa e mostra 404 ou erro.
    console.error(`proxy: não deu para checar ${request.nextUrl.pathname}`, error);
    return;
  }
  // Nenhuma rota atende este endereço, então o Next mostra o not-found.tsx com 404.
  return NextResponse.rewrite(new URL("/_nao-encontrado", request.url));
}

async function exists(pathname: string) {
  const parts = pathname.split("/").filter(Boolean).map(decode);
  if (parts.includes(null)) return false;
  const [section, first, second] = (parts as string[]).map(encodeURIComponent);

  // HEAD: a API só diz se existe (200 ou 404), sem mandar o corpo.
  if (section === "especie") return found(await call("HEAD", `/species/${first}`));

  // Só países já integrados têm página própria, então aqui precisa do status.
  const res = await call("GET", `/countries/${first}`);
  if (!found(res)) return false;
  const country: { status: string } = await res.json();
  if (country.status !== "disponivel") return false;
  return second === undefined || found(await call("HEAD", `/countries/${first}/biomes/${second}`));
}

function call(method: "GET" | "HEAD", path: string) {
  return fetch(API_URL + path, { method });
}

/** 200 = existe, 404 = não existe. Outra resposta é falha da API. */
function found(res: Response) {
  if (res.status === 404) return false;
  if (!res.ok) throw new Error(`A API respondeu ${res.status} em ${res.url}`);
  return true;
}

function decode(part: string) {
  try {
    return decodeURIComponent(part);
  } catch {
    return null;
  }
}
