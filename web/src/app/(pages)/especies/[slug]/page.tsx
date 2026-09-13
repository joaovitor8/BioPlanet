import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Container } from "@/components/Container";
import { CreditoImagem } from "@/components/CreditoImagem";
import { FichaTaxonomica } from "@/components/FichaTaxonomica";
import { ReguaConservacao } from "@/components/ReguaConservacao";
import { TarjaStatus } from "@/components/TarjaStatus";
import { biomasDaEspecie, buscarEspecie, buscarGrupo, listarSlugs, slugTaxon } from "@/lib/data";
import { altComNome, nomesPopulares, tituloFicha } from "@/lib/texto";
import type { Especie } from "@/lib/types";

export function generateStaticParams() {
  return listarSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/especies/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const e = buscarEspecie(slug);
  if (!e) return {};

  const titulo = tituloFicha(e);

  // Em um site público, a ficha é a unidade que as pessoas compartilham (§10).
  return {
    title: titulo,
    description: e.resumo,
    openGraph: {
      type: "article",
      title: `${titulo} · BioPlanet`,
      description: e.resumo,
      images: [{ url: e.imagem.url, width: e.imagem.largura, height: e.imagem.altura, alt: altComNome(e) }],
    },
    twitter: { card: "summary_large_image", title: titulo, description: e.resumo },
  };
}

/** Blocos de leitura corrida da coluna direita, na ordem do guia (§5). */
const SECOES: { chave: keyof Especie; titulo: string }[] = [
  { chave: "descricao", titulo: "Descrição" },
  { chave: "habitat", titulo: "Habitat" },
  { chave: "distribuicao", titulo: "Distribuição" },
  { chave: "alimentacao", titulo: "Alimentação" },
  { chave: "reproducao", titulo: "Reprodução" },
  { chave: "ameacas", titulo: "Ameaças" },
];

export default async function FichaEspecie({ params }: PageProps<"/especies/[slug]">) {
  const { slug } = await params;
  const especie = buscarEspecie(slug);
  if (!especie) notFound();

  const grupo = buscarGrupo(especie.grupo);
  const biomas = biomasDaEspecie(especie);
  const populares = nomesPopulares(especie);
  const corGrupo = grupo?.cor ?? "var(--color-linha)";

  return (
    <article>
      <Container className="pb-4 pt-10 ficha:pt-14">
        {/* Cabeçalho: tarja do grupo, nome científico em display, nome popular */}
        <header className="medida-leitura">
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1 font-interface text-apoio text-tinta-suave">
            <span
              aria-hidden="true"
              className="inline-block h-4 w-0.75 shrink-0"
              style={{ backgroundColor: corGrupo }}
            />
            <Link href={`/grupos/${especie.grupo}`} className="link-texto">
              {grupo?.nome}
            </Link>
            <span aria-hidden="true" className="text-linha">
              ·
            </span>
            <Link href={`/taxonomia/familia/${slugTaxon(especie.taxonomia.familia)}`} className="link-texto">
              {especie.taxonomia.familia}
            </Link>
          </p>

          <h1 className="cientifico mt-4 text-display text-tinta">{especie.nomeCientifico}</h1>

          <p className="mt-2.5 rubrica">{especie.autoria}</p>

          {populares ? (
            <p className="mt-3 font-leitura text-subtitulo text-tinta">{populares}</p>
          ) : (
            <p className="mt-3 font-interface text-apoio italic text-tinta-suave">
              Sem nome popular registrado em português.
            </p>
          )}

          <p className="mt-6 font-leitura text-destaque text-tinta">{especie.resumo}</p>
        </header>
      </Container>

      {/* A régua: o único componente onde vale investir tempo de sobra (§7) */}
      <section aria-labelledby="conservacao" className="mt-8 border-y border-linha bg-papel-fundo">
        <Container className="py-7">
          <h2 id="conservacao" className="sr-only">
            Status de conservação
          </h2>
          <div className="max-w-2xl">
            <ReguaConservacao status={especie.status} />
          </div>
        </Container>
      </section>

      <Container className="pt-10 ficha:pt-14">
        <div className="grid grid-cols-1 gap-10 ficha:grid-cols-[minmax(0,19rem)_minmax(0,1fr)] ficha:gap-14">
          {/* Coluna esquerda: prancha de identificação e ficha de espécime */}
          <div className="flex flex-col gap-8 ficha:sticky ficha:top-24 ficha:self-start">
            <figure className="m-0">
              <Image
                src={especie.imagem.url}
                alt={altComNome(especie)}
                width={especie.imagem.largura}
                height={especie.imagem.altura}
                sizes="(max-width: 900px) 100vw, 304px"
                loading="eager"
                fetchPriority="high"
                className="h-auto w-full border border-linha bg-papel-fundo"
              />
              <figcaption className="mt-2.5">
                <CreditoImagem imagem={especie.imagem} />
              </figcaption>
            </figure>

            <div>
              <h2 className="rubrica mb-2.5">Classificação</h2>
              <FichaTaxonomica taxonomia={especie.taxonomia} />
            </div>

            <div>
              <h2 className="rubrica mb-2.5">Biomas</h2>
              <ul className="flex flex-wrap gap-2">
                {biomas.map((b) => (
                  <li key={b.slug}>
                    <Link
                      href={`/biomas/${b.slug}`}
                      className="inline-block rounded-controle border border-linha bg-papel px-2.5 py-1 font-interface text-dado text-tinta transition-colors duration-120 hover:border-tinta"
                    >
                      {b.nome}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="rubrica mb-2.5">Status</h2>
              <TarjaStatus status={especie.status} formato="completa" />
            </div>
          </div>

          {/* Coluna direita: leitura corrida */}
          <div className="min-w-0">
            {SECOES.map(({ chave, titulo }) => (
              <section key={titulo} className="border-t border-linha-sutil py-7 first:border-t-0 first:pt-0">
                <h2 className="font-leitura text-subtitulo text-tinta">{titulo}</h2>
                <p className="medida-leitura mt-2.5 font-leitura text-corpo text-tinta">
                  {especie[chave] as string}
                </p>
              </section>
            ))}

            <section className="border-t border-linha pt-7">
              <h2 className="font-leitura text-subtitulo text-tinta">Fontes</h2>
              <ul className="medida-leitura mt-3 flex flex-col gap-2 font-interface text-apoio">
                {especie.fontes.map((f) => (
                  <li key={f.url}>
                    <a href={f.url} className="link-texto" rel="noopener noreferrer" target="_blank">
                      {f.titulo}
                    </a>
                  </li>
                ))}
                <li className="text-tinta-suave">
                  Foto: {especie.imagem.autor} — {especie.imagem.licenca}, via{" "}
                  <a href={especie.imagem.fonteUrl} className="link-texto" rel="noopener noreferrer" target="_blank">
                    Wikimedia Commons
                  </a>
                </li>
              </ul>
            </section>
          </div>
        </div>
      </Container>
    </article>
  );
}
