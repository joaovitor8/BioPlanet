"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export type ChaveFiltro = "grupo" | "bioma" | "status";

export type Opcao = {
  valor: string;
  nome: string;
  total: number;
  /** Cor de índice do grupo, ou cor oficial do status. Traço fino, nunca fundo. */
  cor?: string;
  /** Subtítulo que abre um bloco dentro da seção (classificação de bioma). */
  subgrupo?: string;
};

export type Secao = {
  chave: ChaveFiltro;
  titulo: string;
  opcoes: Opcao[];
};

export type EstadoFiltros = {
  q: string;
  grupo: string[];
  bioma: string[];
  status: string[];
};

type Props = {
  filtros: EstadoFiltros;
  secoes: Secao[];
  destino: string;
  /** Quantos filtros estão ativos — some no rótulo do botão no mobile. */
  ativos: number;
};

function montarQuery(f: EstadoFiltros): string {
  const p = new URLSearchParams();
  if (f.q) p.set("q", f.q);
  for (const chave of ["grupo", "bioma", "status"] as const) {
    if (f[chave].length) p.set(chave, f[chave].join(","));
  }
  return p.toString();
}

function href(destino: string, f: EstadoFiltros): string {
  const q = montarQuery(f);
  return q ? `${destino}?${q}` : destino;
}

function alternar(f: EstadoFiltros, chave: ChaveFiltro, valor: string): EstadoFiltros {
  const atual = f[chave];
  return {
    ...f,
    [chave]: atual.includes(valor) ? atual.filter((v) => v !== valor) : [...atual, valor],
  };
}

/**
 * Painel de filtros (guia.md §8): grupo, bioma e status, com o estado na URL
 * — `?grupo=aves&bioma=savana&status=CR` — para que seja compartilhável e,
 * mais tarde, vire query direta para o Nest (§5).
 *
 * Em desktop fica à esquerda; abaixo de 1024px vira gaveta.
 */
export function PainelFiltros({ filtros, secoes, destino, ativos }: Props) {
  const router = useRouter();
  const [aberta, setAberta] = useState(false);

  // Gaveta aberta trava o scroll do corpo e fecha no Esc.
  useEffect(() => {
    if (!aberta) return;
    const aoTeclar = (e: KeyboardEvent) => e.key === "Escape" && setAberta(false);
    document.addEventListener("keydown", aoTeclar);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", aoTeclar);
      document.body.style.overflow = "";
    };
  }, [aberta]);

  const aoAlternar = (chave: ChaveFiltro, valor: string) => {
    router.replace(href(destino, alternar(filtros, chave, valor)), { scroll: false });
  };

  const conteudo = (
    <div className="flex flex-col gap-7">
      {secoes.map((secao) => {
        let ultimoSubgrupo: string | undefined;
        return (
          <fieldset key={secao.chave} className="min-w-0 border-0 p-0">
            <legend className="mb-2.5 w-full border-b border-linha-sutil pb-1.5 font-interface text-apoio font-bold text-tinta">{secao.titulo}</legend>
            <ul className="flex flex-col">
              {secao.opcoes.map((o) => {
                const marcado = filtros[secao.chave].includes(o.valor);
                const abreSubgrupo = o.subgrupo && o.subgrupo !== ultimoSubgrupo;
                ultimoSubgrupo = o.subgrupo;

                return (
                  <li key={o.valor}>
                    {abreSubgrupo && (
                      <p className="mt-3.5 mb-1 rubrica first:mt-0">
                        {o.subgrupo}
                      </p>
                    )}
                    <label
                      className={`flex cursor-pointer items-center gap-2 py-1 font-interface text-apoio ${
                        o.total === 0 ? "text-tinta-suave" : "text-tinta"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={marcado}
                        disabled={o.total === 0 && !marcado}
                        onChange={() => aoAlternar(secao.chave, o.valor)}
                        className="size-4 shrink-0 accent-foco disabled:opacity-40"
                      />
                      {o.cor && (
                        <span
                          aria-hidden="true"
                          className="h-3.5 w-0.75 shrink-0"
                          style={{ backgroundColor: o.cor }}
                        />
                      )}
                      <span className="min-w-0 flex-1 truncate">{o.nome}</span>
                      <span className="shrink-0 font-interface text-dado tabular-nums text-tinta-suave">
                        {o.total}
                      </span>
                    </label>
                  </li>
                );
              })}
            </ul>
          </fieldset>
        );
      })}
    </div>
  );

  return (
    <>
      {/* Mobile: botão que abre a gaveta */}
      <div className="lg:hidden">
        <button
          type="button"
          onClick={() => setAberta(true)}
          aria-expanded={aberta}
          className="w-full rounded-controle border border-tinta bg-papel px-4 py-2 font-interface text-apoio font-bold text-tinta"
        >
          Filtros{ativos > 0 && <span className="font-normal"> ({ativos})</span>}
        </button>
      </div>

      {aberta && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Fechar filtros"
            onClick={() => setAberta(false)}
            className="absolute inset-0 bg-tinta/35"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Filtros"
            className="sombra-gaveta absolute inset-y-0 left-0 flex w-[min(20rem,85vw)] flex-col bg-papel"
          >
            <div className="flex items-center justify-between border-b border-linha px-4 py-3">
              <h2 className="font-interface text-apoio font-bold text-tinta">Filtros</h2>
              <button
                type="button"
                onClick={() => setAberta(false)}
                className="font-interface text-apoio text-tinta-suave hover:text-tinta"
              >
                fechar
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-4">{conteudo}</div>
            <div className="border-t border-linha px-4 py-3">
              <button
                type="button"
                onClick={() => setAberta(false)}
                className="w-full rounded-controle border border-tinta bg-tinta px-4 py-2 font-interface text-apoio font-bold text-papel"
              >
                Ver resultados
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop: painel fixo à esquerda */}
      <div className="hidden lg:block">{conteudo}</div>
    </>
  );
}

type ChipsProps = {
  filtros: EstadoFiltros;
  destino: string;
  /** Rótulo legível de cada valor ativo, montado no servidor. */
  rotulos: { chave: ChaveFiltro | "q"; valor: string; nome: string }[];
};

/** Chips removíveis dos filtros ativos (guia.md §8). */
export function ChipsFiltros({ filtros, destino, rotulos }: ChipsProps) {
  if (!rotulos.length) return null;

  const remover = (chave: ChaveFiltro | "q", valor: string): EstadoFiltros =>
    chave === "q" ? { ...filtros, q: "" } : alternar(filtros, chave, valor);

  return (
    <ul className="flex flex-wrap items-center gap-2">
      {rotulos.map(({ chave, valor, nome }) => (
        <li key={`${chave}:${valor}`}>
          <Link
            href={href(destino, remover(chave, valor))}
            scroll={false}
            className="inline-flex items-center gap-1.5 rounded-controle border border-linha bg-papel-fundo py-1 pl-2.5 pr-2 font-interface text-dado text-tinta transition-colors duration-120 hover:border-tinta"
          >
            {nome}
            <span aria-hidden="true" className="text-tinta-suave">
              ×
            </span>
            <span className="sr-only">— remover filtro</span>
          </Link>
        </li>
      ))}
      <li>
        <Link href={destino} scroll={false} className="link-texto font-interface text-dado">
          limpar tudo
        </Link>
      </li>
    </ul>
  );
}
