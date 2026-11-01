// Roda antes das páginas de espécie, país e bioma.
// Pergunta à API se o endereço existe e, se não existir, responde 404.
import { NextResponse, type NextRequest } from "next/server";
import { API_URL } from "@/lib/api-url";

export const config = {
  matcher: ["/especie/:slug", "/pais/:pais", "/pais/:pais/:bioma"],
};

export async function proxy(request: NextRequest) {
  try {
    if (await exists(request.nextUrl.pathname)) return;
  } catch (error) {
    console.error(`proxy: não deu para checar ${request.nextUrl.pathname}`, error);
    return;
  }
  return NextResponse.rewrite(new URL("/_nao-encontrado", request.url));
}

async function exists(pathname: string) {
  const parts = pathname.split("/").filter(Boolean).map(decode);
  if (parts.includes(null)) return false;
  const [section, first, second] = (parts as string[]).map(encodeURIComponent);

  if (section === "especie") return found(await call("HEAD", `/species/${first}`));

  const res = await call("GET", `/countries/${first}`);
  if (!found(res)) return false;
  const country: { status: string } = await res.json();
  if (country.status !== "disponivel") return false;
  return second === undefined || found(await call("HEAD", `/countries/${first}/biomes/${second}`));
}

function call(method: "GET" | "HEAD", path: string) {
  return fetch(API_URL + path, { method });
}

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
