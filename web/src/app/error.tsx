"use client"; // Telas de erro precisam ser Client Components.

// Aparece quando uma página quebra, por exemplo com a API fora do ar.
// O cabeçalho e o rodapé continuam, porque vêm do layout acima deste arquivo.

import Link from "next/link";
import { useEffect } from "react";

export default function Error({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  // Em produção o Next esconde a mensagem do erro, mas manda um código que aparece também no log do servidor.
  const digest = error instanceof Error && "digest" in error ? String(error.digest) : undefined;

  return (
    <section className="mx-auto flex max-w-[1200px] flex-col items-start gap-4 px-4 py-24 sm:px-6">
      <p className="font-display text-sm font-bold tracking-[0.08em] text-leaf uppercase">Erro</p>
      <h1 className="font-display text-4xl font-bold">Não deu para carregar esta página</h1>
      <p className="max-w-[560px] text-lg leading-relaxed text-muted">
        Os dados do BioPlanet não responderam agora. Tente de novo em instantes.
      </p>
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => retry()}
          className="cursor-pointer rounded-[10px] bg-forest px-5 py-3 font-semibold text-[#f2f4ee] hover:bg-leaf"
        >
          Tentar de novo
        </button>
        <Link
          href="/"
          className="rounded-[10px] border border-line-strong bg-white px-5 py-3 font-semibold text-ink hover:border-leaf"
        >
          Voltar ao início
        </Link>
      </div>
      {digest && <p className="text-[13px] text-muted">Código do erro: {digest}</p>}
    </section>
  );
}
