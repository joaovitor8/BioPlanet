"use client";

import { useEffect, useId, useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  valorInicial: string;
  /** Rota de destino: `/especies`. */
  destino: string;
  /** Query com os demais filtros, para não perdê-los ao digitar. */
  queryOutros?: string;
  /**
   * `filtrar` atualiza a URL enquanto se digita (listagem);
   * `navegar` só age no submit (home).
   */
  modo?: "filtrar" | "navegar";
  rotulo?: string;
};

/** Sem debounce mágico: 250 ms (guia.md §8). */
const ESPERA = 250;

function montarHref(destino: string, queryOutros: string, q: string): string {
  const p = new URLSearchParams(queryOutros);
  const limpo = q.trim();
  if (limpo) p.set("q", limpo);
  else p.delete("q");
  const s = p.toString();
  return s ? `${destino}?${s}` : destino;
}

export function CampoBusca({
  valorInicial,
  destino,
  queryOutros = "",
  modo = "filtrar",
  rotulo = "Buscar por nome popular ou científico",
}: Props) {
  const router = useRouter();
  const id = useId();

  const [valor, setValor] = useState(valorInicial);
  const [naUrl, setNaUrl] = useState(valorInicial);

  // A URL é a fonte da verdade. Quando ela muda por fora — voltar no histórico,
  // chip removido —, o campo se reposiciona durante a renderização, sem efeito.
  if (valorInicial !== naUrl) {
    setNaUrl(valorInicial);
    setValor(valorInicial);
  }

  // O que o usuário digitou só vai para a URL depois que ele para de digitar.
  useEffect(() => {
    if (modo !== "filtrar" || valor === naUrl) return;

    const t = setTimeout(() => {
      router.replace(montarHref(destino, queryOutros, valor), { scroll: false });
    }, ESPERA);

    return () => clearTimeout(t);
  }, [valor, naUrl, modo, destino, queryOutros, router]);

  return (
    <form
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        router.push(montarHref(destino, queryOutros, valor));
      }}
    >
      <label htmlFor={id} className="block font-interface text-apoio text-tinta-suave">
        {rotulo}
      </label>

      <div className="mt-1.5 flex items-stretch border border-linha bg-papel-fundo focus-within:border-foco">
        <input
          id={id}
          type="search"
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          placeholder="onça-pintada, Harpia, Felidae…"
          autoComplete="off"
          className="min-w-0 flex-1 bg-transparent px-3 py-2.5 font-interface text-corpo text-tinta outline-none placeholder:text-tinta-suave"
        />
        {valor && (
          <button
            type="button"
            onClick={() => setValor("")}
            className="px-3 font-interface text-apoio text-tinta-suave hover:text-tinta"
          >
            limpar<span className="sr-only"> busca</span>
          </button>
        )}
        {modo === "navegar" && (
          <button
            type="submit"
            className="border-l border-linha bg-papel px-4 font-interface text-apoio font-bold text-tinta transition-colors duration-120 hover:bg-tinta hover:text-papel"
          >
            Buscar
          </button>
        )}
      </div>
    </form>
  );
}
