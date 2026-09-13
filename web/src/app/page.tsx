import Image from "next/image";
import Link from "next/link";

import { CampoBusca } from "@/components/CampoBusca";
import { Container } from "@/components/Container";
import { ContornoBotanico } from "@/components/ContornoBotanico";
import { CreditoImagem } from "@/components/CreditoImagem";
import { TarjaStatus } from "@/components/TarjaStatus";
import {
  CLASSIFICACOES,
  biomasDaEspecie,
  buscarGrupo,
  contarEspecies,
  especieDestaque,
  listarBiomasComContagem,
  listarGruposComContagem,
} from "@/lib/data";
import { altComNome, nomesPopulares } from "@/lib/texto";

export default function Home() {
  const total = contarEspecies();
  const destaque = especieDestaque();
  const grupo = buscarGrupo(destaque.grupo);
  const biomas = biomasDaEspecie(destaque);
  const grupos = listarGruposComContagem();
  const todosBiomas = listarBiomasComContagem();

  return (
    <>
      {/*
        O hero é a busca ao lado de uma espécie tratada como prancha de
        identificação. Não é foto de floresta ocupando a tela: o site é um
        catálogo, e a primeira coisa que ele deve mostrar é que sabe encontrar
        coisas (guia.md §5).
      */}
      <section className="relative isolate overflow-hidden border-b border-linha">
        <ContornoBotanico className="pointer-events-none absolute inset-0 -z-10 h-full w-full" />

        <Container className="grid grid-cols-1 items-center gap-10 py-12 ficha:grid-cols-[minmax(0,1fr)_minmax(0,23rem)] ficha:gap-16 ficha:py-20">
          <div>
            <p className="rubrica">Fauna e flora do mundo</p>

            <h1 className="mt-3 font-leitura text-titulo text-tinta">
              Procure entre {total} espécies
            </h1>

            <p className="medida-leitura mt-3 font-leitura text-destaque text-tinta-suave">
              Ficha completa de cada uma: taxonomia, habitat, distribuição, ameaças e a posição
              exata na escala de conservação da IUCN.
            </p>

            <div className="mt-7 max-w-xl">
              <CampoBusca
                valorInicial=""
                destino="/especies"
                modo="navegar"
                rotulo="Buscar por nome popular ou científico"
              />
            </div>

            <p className="mt-6 font-interface text-apoio text-tinta-suave">
              ou comece pelos{" "}
              <Link href="#biomas" className="link-texto">
                biomas
              </Link>{" "}
              e pelos{" "}
              <Link href="/grupos" className="link-texto">
                grupos
              </Link>
              .
            </p>
          </div>

          {/* Prancha de identificação */}
          <figure className="m-0">
            <p className="rubrica mb-2.5 flex items-center gap-2">
              <span
                aria-hidden="true"
                className="block h-2.5 w-0.75"
                style={{ backgroundColor: grupo?.cor ?? "var(--color-linha)" }}
              />
              Espécie do dia
            </p>

            <Link href={`/especies/${destaque.slug}`} className="group block border border-linha bg-papel transition-colors duration-120 hover:border-tinta-suave">
              <div className="aspect-4/3 overflow-hidden border-b border-linha-sutil bg-papel-fundo">
                <Image
                  src={destaque.imagem.url}
                  alt={altComNome(destaque)}
                  width={destaque.imagem.largura}
                  height={destaque.imagem.altura}
                  sizes="(max-width: 900px) 100vw, 368px"
                  loading="eager"
                  fetchPriority="high"
                  className="h-full w-full object-cover"
                />
              </div>

              <figcaption className="p-4">
                <span className="cientifico block text-subtitulo text-tinta group-hover:underline group-hover:decoration-1 group-hover:underline-offset-[0.18em]">
                  {destaque.nomeCientifico}
                </span>
                <span className="mt-1 block font-interface text-apoio text-tinta-suave">
                  {nomesPopulares(destaque) || grupo?.nome}
                </span>
                <span className="mt-4 flex flex-wrap items-center gap-x-2.5 gap-y-1.5 border-t border-linha-sutil pt-3">
                  <TarjaStatus status={destaque.status} />
                  <span className="rubrica">{biomas[0]?.nome}</span>
                </span>
              </figcaption>
            </Link>

            <CreditoImagem imagem={destaque.imagem} className="mt-2" />
          </figure>
        </Container>
      </section>

      {/* Faixa de biomas */}
      <section id="biomas" aria-labelledby="titulo-biomas" className="border-b border-linha bg-papel-fundo">
        <Container className="py-14">
          <h2 id="titulo-biomas" className="font-leitura text-titulo text-tinta">
            Biomas
          </h2>
          <p className="medida-leitura mt-2 font-interface text-apoio text-tinta-suave">
            Escopo mundial: o bioma é entidade com classificação própria, agrupada em três domínios.
          </p>

          <div className="mt-8 flex flex-col gap-7">
            {CLASSIFICACOES.map((c) => (
              <div key={c.id}>
                <h3 className="rubrica">{c.nome}</h3>
                <ul className="mt-2.5 flex flex-wrap gap-2">
                  {todosBiomas
                    .filter((b) => b.classificacao === c.id)
                    .map((b) => (
                      <li key={b.slug}>
                        <Link
                          href={`/biomas/${b.slug}`}
                          className="inline-flex items-baseline gap-2 rounded-controle border border-linha bg-papel px-3 py-1.5 font-interface text-apoio text-tinta transition-colors duration-120 hover:border-tinta"
                        >
                          {b.nome}
                          <span className="numero font-interface text-dado text-tinta-suave">
                            {b.total}
                          </span>
                        </Link>
                      </li>
                    ))}
                </ul>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Grupos taxonômicos */}
      <section aria-labelledby="titulo-grupos">
        <Container className="py-14">
          <h2 id="titulo-grupos" className="font-leitura text-titulo text-tinta">
            Grupos
          </h2>
          <p className="medida-leitura mt-2 font-interface text-apoio text-tinta-suave">
            Cada grupo tem uma cor de índice, como a margem colorida de um guia impresso.
          </p>

          <ul className="mt-8 grid grid-cols-1 gap-px border border-linha bg-linha sm:grid-cols-2 lg:grid-cols-4">
            {grupos.map((g) => (
              <li key={g.id} className="bg-papel">
                <Link
                  href={`/grupos/${g.id}`}
                  className="flex h-full items-stretch gap-3.5 transition-colors duration-120 hover:bg-papel-fundo"
                >
                  <span aria-hidden="true" className="w-0.75 shrink-0" style={{ backgroundColor: g.cor }} />
                  <span className="min-w-0 flex-1 py-4 pr-4">
                    <span className="flex items-baseline justify-between gap-2">
                      <span className="font-interface text-corpo font-bold text-tinta">{g.nome}</span>
                      <span className="numero font-interface text-dado text-tinta-suave">{g.total}</span>
                    </span>
                    <span className="mt-1.5 block font-interface text-apoio text-tinta-suave">
                      {g.descricao}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </section>
    </>
  );
}
