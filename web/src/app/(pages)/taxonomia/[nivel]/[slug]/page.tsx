import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Container } from "@/components/Container";
import { GradeEspecies } from "@/components/GradeEspecies";
import { ROTULO_NIVEL, ehNivel, especiesDoTaxon, listarTaxons, nomeDoTaxon } from "@/lib/data";

export function generateStaticParams() {
  return listarTaxons().map(({ nivel, slug }) => ({ nivel, slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/taxonomia/[nivel]/[slug]">): Promise<Metadata> {
  const { nivel, slug } = await params;
  if (!ehNivel(nivel)) return {};
  const nome = nomeDoTaxon(nivel, slug);
  if (!nome) return {};

  const descricao = `Espécies do catálogo classificadas no táxon ${nome} (${ROTULO_NIVEL[nivel].toLowerCase()}).`;
  return {
    title: `${nome} — ${ROTULO_NIVEL[nivel]}`,
    description: descricao,
    openGraph: { title: `${nome} · BioPlanet`, description: descricao },
  };
}

/**
 * Página de táxon: o destino dos links da `FichaTaxonomica` (guia.md §8).
 * Reino e filo devolvem listas grandes; gênero costuma devolver uma ficha só —
 * e está certo assim, porque o que a página responde é "quem mais está aqui".
 */
export default async function PaginaTaxon({ params }: PageProps<"/taxonomia/[nivel]/[slug]">) {
  const { nivel, slug } = await params;
  if (!ehNivel(nivel)) notFound();

  const nome = nomeDoTaxon(nivel, slug);
  if (!nome) notFound();

  const especies = especiesDoTaxon(nivel, slug);
  const ehGenero = nivel === "genero";

  return (
    <Container className="py-10 ficha:py-14">
      <p className="font-interface text-apoio text-tinta-suave">
        Taxonomia · {ROTULO_NIVEL[nivel]}
      </p>

      <h1 className={`mt-2 text-titulo text-tinta ${ehGenero ? "cientifico" : "font-leitura"}`}>
        {nome}
      </h1>

      <p className="mt-4 font-interface text-apoio text-tinta-suave">
        {especies.length} {especies.length === 1 ? "espécie" : "espécies"} no catálogo dentro deste
        táxon.
      </p>

      <div className="mt-4">
        <GradeEspecies especies={especies} />
      </div>

      <p className="mt-8 font-interface text-apoio">
        <Link href="/especies" className="link-texto">
          Ver o catálogo inteiro
        </Link>
      </p>
    </Container>
  );
}
