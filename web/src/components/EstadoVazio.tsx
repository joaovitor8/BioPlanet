import Link from "next/link";

type Props = {
  /** Rótulo do filtro mais restritivo, já formatado: `grupo Aves`. */
  culpado?: { rotulo: string; href: string; liberaria: number };
  hrefLimparTudo: string;
};

/**
 * Estado vazio da listagem (guia.md §8). O botão não limpa tudo: limpa o
 * filtro **mais restritivo** — aquele cuja remoção devolve mais fichas —,
 * porque quem chegou aqui quase sempre errou um filtro só.
 */
export function EstadoVazio({ culpado, hrefLimparTudo }: Props) {
  return (
    <div className="border border-linha bg-papel-fundo p-8">
      <p className="font-leitura text-subtitulo text-tinta">Nenhuma espécie com esses filtros.</p>

      <div className="mt-5 flex flex-wrap items-center gap-4 font-interface text-apoio">
        {culpado && (
          <Link
            href={culpado.href}
            className="rounded-controle border border-tinta bg-papel px-3 py-1.5 font-bold text-tinta transition-colors duration-120 hover:bg-tinta hover:text-papel"
          >
            Remover {culpado.rotulo}
            <span className="font-normal"> ({culpado.liberaria})</span>
          </Link>
        )}
        <Link href={hrefLimparTudo} className="link-texto">
          limpar todos os filtros
        </Link>
      </div>
    </div>
  );
}
