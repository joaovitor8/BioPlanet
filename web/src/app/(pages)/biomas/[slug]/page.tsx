import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Container } from "@/components/Container";
import { GradeEspecies } from "@/components/GradeEspecies";
import { BIOMAS, CLASSIFICACOES, buscarBioma, especiesDoBioma } from "@/lib/data";

export function generateStaticParams() {
  return BIOMAS.map((b) => ({ slug: b.slug }));
}

export async function generateMetadata({ params }: PageProps<"/biomas/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const b = buscarBioma(slug);
  if (!b) return {};
  return {
    title: b.nome,
    description: b.descricao,
    openGraph: { title: `${b.nome} · BioPlanet`, description: b.descricao },
  };
}

export default async function PaginaBioma({ params }: PageProps<"/biomas/[slug]">) {
  const { slug } = await params;
  const bioma = buscarBioma(slug);
  if (!bioma) notFound();

  const especies = especiesDoBioma(slug);
  const dominio = CLASSIFICACOES.find((c) => c.id === bioma.classificacao);

  return (
    <Container className="py-10 ficha:py-14">
      <p className="font-interface text-apoio text-tinta-suave">
        <Link href="/biomas" className="link-texto">
          Biomas
        </Link>
        {dominio && <> · {dominio.nome}</>}
      </p>

      <h1 className="mt-2 font-leitura text-titulo text-tinta">{bioma.nome}</h1>
      <p className="medida-leitura mt-2 font-leitura text-destaque text-tinta">{bioma.descricao}</p>

      <p className="mt-6 font-interface text-apoio text-tinta-suave">
        {especies.length} {especies.length === 1 ? "espécie" : "espécies"} no catálogo, da mais
        ameaçada para a menos ameaçada.
      </p>

      <div className="mt-4">
        <GradeEspecies especies={especies} />
      </div>

      <p className="mt-8 font-interface text-apoio">
        <Link href={`/especies?bioma=${bioma.slug}`} className="link-texto">
          Combinar este bioma com outros filtros
        </Link>
      </p>
    </Container>
  );
}
