import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Container } from "@/components/Container";
import { GradeEspecies } from "@/components/GradeEspecies";
import { GRUPOS, buscarGrupo, especiesDoGrupo } from "@/lib/data";
import { ehGrupoId } from "@/lib/data/grupos";

export function generateStaticParams() {
  return GRUPOS.map((g) => ({ slug: g.id }));
}

export async function generateMetadata({ params }: PageProps<"/grupos/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const g = buscarGrupo(slug);
  if (!g) return {};
  return {
    title: g.nome,
    description: g.descricao,
    openGraph: { title: `${g.nome} · BioPlanet`, description: g.descricao },
  };
}

export default async function PaginaGrupo({ params }: PageProps<"/grupos/[slug]">) {
  const { slug } = await params;
  if (!ehGrupoId(slug)) notFound();

  const grupo = buscarGrupo(slug);
  if (!grupo) notFound();

  const especies = especiesDoGrupo(slug);

  return (
    <Container className="py-10 ficha:py-14">
      <p className="font-interface text-apoio text-tinta-suave">
        <Link href="/grupos" className="link-texto">
          Grupos
        </Link>
      </p>

      <div className="mt-2 flex items-stretch gap-3">
        <span aria-hidden="true" className="w-1.5 shrink-0" style={{ backgroundColor: grupo.cor }} />
        <div>
          <h1 className="font-leitura text-titulo text-tinta">{grupo.nome}</h1>
          <p className="medida-leitura mt-1 font-leitura text-destaque text-tinta">{grupo.descricao}</p>
        </div>
      </div>

      <p className="mt-6 font-interface text-apoio text-tinta-suave">
        {especies.length} {especies.length === 1 ? "espécie" : "espécies"} no catálogo, da mais
        ameaçada para a menos ameaçada.
      </p>

      <div className="mt-4">
        <GradeEspecies especies={especies} />
      </div>

      <p className="mt-8 font-interface text-apoio">
        <Link href={`/especies?grupo=${grupo.id}`} className="link-texto">
          Combinar este grupo com outros filtros
        </Link>
      </p>
    </Container>
  );
}
