import { ESCALA, buscarStatus } from "@/lib/data/status";
import type { StatusId } from "@/lib/types";

type Props = {
  status: StatusId;
  /** `compacta` cabe no card; `completa` é a da ficha. */
  variante?: "completa" | "compacta";
};

const PRIMEIRA = ESCALA[0];
const ULTIMA = ESCALA[ESCALA.length - 1];

/**
 * A régua de conservação (guia.md §7).
 *
 * A escala inteira, de EX a LC, sempre visível: o valor do componente não está
 * em dizer o que a espécie é, e sim em mostrar o que ela **não** é. Ver NT a
 * dois passos de CR comunica mais do que qualquer parágrafo.
 *
 * DD e NE não pertencem à escala. Nesse caso a régua não some — aparece inteira
 * em cinza, com uma linha explicando que a espécie não foi avaliada.
 */
export function ReguaConservacao({ status, variante = "completa" }: Props) {
  const atual = buscarStatus(status);
  if (!atual) return null;

  const posicao = ESCALA.findIndex((s) => s.id === status);
  const naEscala = posicao >= 0;
  const compacta = variante === "compacta";

  const descricao = naEscala
    ? `Status de conservação: ${atual.nome}, sigla ${atual.sigla}. Posição ${posicao + 1} de ${ESCALA.length} na escala da IUCN, que vai de ${PRIMEIRA.nome} (${PRIMEIRA.sigla}), a mais grave, até ${ULTIMA.nome} (${ULTIMA.sigla}), a menos grave.`
    : `Status de conservação: ${atual.nome}, sigla ${atual.sigla}. A espécie está fora da escala da IUCN, que vai de ${PRIMEIRA.nome} (${PRIMEIRA.sigla}) até ${ULTIMA.nome} (${ULTIMA.sigla}). ${atual.descricao}`;

  return (
    <figure className="m-0">
      {/* A escala é uma imagem composta: o aria-label já diz tudo em texto. */}
      <div role="img" aria-label={descricao}>
        <ol className={`grid grid-cols-7 ${compacta ? "gap-[3px]" : "gap-1"}`} aria-hidden="true">
          {ESCALA.map((s) => {
            const marcado = naEscala && s.id === status;
            return (
              <li key={s.id} className="flex min-w-0 flex-col items-center">
                <span
                  className={[
                    "font-interface numero transition-colors duration-120",
                    compacta ? "text-[11px] leading-none" : "text-dado",
                    marcado ? "font-bold text-tinta" : "text-tinta-suave",
                  ].join(" ")}
                >
                  {s.sigla}
                </span>

                <span className={`flex w-full items-end ${compacta ? "mt-1 h-3" : "mt-1.5 h-[22px]"}`}>
                  <span
                    className="block w-full rounded-[1.5px]"
                    style={{
                      // Fora da escala, a régua inteira fica cinza (§7).
                      backgroundColor: naEscala ? s.cor : "var(--color-linha)",
                      height: marcado ? "100%" : compacta ? "4px" : "6px",
                      // A marcada ganha contorno para não depender só de altura.
                      outline: marcado ? "1.5px solid var(--color-tinta)" : "none",
                      outlineOffset: "-1.5px",
                    }}
                  />
                </span>

                <span className={`flex ${compacta ? "h-1.5" : "h-2.5"} items-start`}>
                  {marcado && (
                    <svg width="9" height="6" viewBox="0 0 9 6" className="mt-[3px]" focusable="false">
                      <path d="M4.5 0 9 6H0z" fill="var(--color-tinta)" />
                    </svg>
                  )}
                </span>
              </li>
            );
          })}
        </ol>
      </div>

      {!compacta && (
        <figcaption className="medida-leitura mt-3 font-interface text-apoio">
          {naEscala ? (
            <>
              <span className="font-bold text-tinta">
                {atual.sigla} · {atual.nome}.
              </span>{" "}
              <span className="text-tinta-suave">{atual.descricao}</span>
            </>
          ) : (
            <span className="text-tinta-suave">
              <span className="font-bold text-tinta">
                {atual.sigla} · {atual.nome}.
              </span>{" "}
              {atual.descricao} A régua aparece em cinza porque a espécie não ocupa nenhuma posição
              da escala — o que não é o mesmo que estar fora de risco.
            </span>
          )}
        </figcaption>
      )}
    </figure>
  );
}
