import Image from "next/image";
import Link from "next/link";

import { TarjaStatus } from "@/components/TarjaStatus";
import { buscarGrupo } from "@/lib/data/grupos";
import { altComNome } from "@/lib/texto";
import type { Especie } from "@/lib/types";

type Props = {
  especie: Especie;
  /** A primeira da grade é a candidata a LCP e carrega sem espera. */
  prioritaria?: boolean;
};

/**
 * Card da listagem (guia.md §8): foto, nome científico em itálico, nome
 * popular, tarja do grupo e sigla de status — e nada além disso. A régua fica
 * para a ficha: um elemento ousado, o resto quieto (§2).
 *
 * Proporção fixa 4:3 e raio 0 na imagem — a foto é espécime, não card de
 * SaaS (§6, §9). A foto também não sofre efeito nenhum no hover: quem muda é
 * a moldura, não o espécime.
 */
export function CardEspecie({ especie, prioritaria = false }: Props) {
  const grupo = buscarGrupo(especie.grupo);
  const popular = especie.nomesPopulares[0];

  return (
    <article className="group relative flex w-full border border-linha bg-papel transition-colors duration-120 hover:border-tinta-suave focus-within:border-tinta-suave">
      {/* Tarja do grupo: cor de índice, como a margem colorida de um guia impresso. */}
      <span
        aria-hidden="true"
        className="w-0.75 shrink-0"
        style={{ backgroundColor: grupo?.cor ?? "var(--color-linha)" }}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="aspect-4/3 overflow-hidden border-b border-linha-sutil bg-papel-fundo">
          <Image
            src={especie.imagem.url}
            alt={altComNome(especie)}
            width={especie.imagem.largura}
            height={especie.imagem.altura}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 320px"
            loading={prioritaria ? "eager" : "lazy"}
            fetchPriority={prioritaria ? "high" : "auto"}
            className="h-full w-full object-cover"
          />
        </div>

        <div className="flex flex-1 flex-col p-4">
          <div className="mb-4">
            <h3 className="cientifico text-subtitulo text-tinta">
              {/* Link esticado: o card inteiro é a área de clique. */}
              <Link
                href={`/especies/${especie.slug}`}
                className="after:absolute after:inset-0 after:content-[''] group-hover:underline group-hover:decoration-1 group-hover:underline-offset-[0.18em]"
              >
                {especie.nomeCientifico}
              </Link>
            </h3>

            <p className="mt-1 font-interface text-apoio text-tinta-suave">
              {popular ?? <span className="italic">sem nome popular registrado</span>}
            </p>
          </div>

          {/*
            `mt-auto` cola a régua de metadados na base do card. Sem isso, um
            nome que quebra em duas linhas desalinha a tarja de status em
            relação aos cards vizinhos da mesma fileira.
          */}
          <div className="mt-auto flex flex-wrap items-center gap-x-2.5 gap-y-1.5 border-t border-linha-sutil pt-3">
            <TarjaStatus status={especie.status} />
            <span className="rubrica">{grupo?.nome}</span>
          </div>
        </div>
      </div>
    </article>
  );
}
