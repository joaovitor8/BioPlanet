import type { Metadata } from "next";
import Link from "next/link";

import { Container } from "@/components/Container";
import { listarGruposComContagem } from "@/lib/data";

export const metadata: Metadata = {
  title: "Grupos",
  description: "Os oito grupos taxonômicos do catálogo, cada um com sua cor de índice.",
};

export default function ListaGrupos() {
  const grupos = listarGruposComContagem();

  return (
    <Container className="py-10 ficha:py-14">
      <h1 className="font-leitura text-titulo text-tinta">Grupos</h1>
      <p className="medida-leitura mt-2 font-interface text-apoio text-tinta-suave">
        Cada grupo tem uma cor de índice, como a margem colorida de um guia impresso. Ela aparece na
        tarja do card e no cabeçalho da ficha — e em nenhum outro lugar.
      </p>

      <ul className="mt-8 grid grid-cols-1 gap-px border border-linha bg-linha md:grid-cols-2">
        {grupos.map((g) => (
          <li key={g.id} className="bg-papel">
            <Link
              href={`/grupos/${g.id}`}
              className="flex h-full items-stretch gap-4 transition-colors duration-120 hover:bg-papel-fundo"
            >
              <span aria-hidden="true" className="w-1.5 shrink-0" style={{ backgroundColor: g.cor }} />
              <span className="min-w-0 flex-1 py-4 pr-4">
                <span className="flex items-baseline justify-between gap-3">
                  <span className="font-interface text-corpo font-bold text-tinta">{g.nome}</span>
                  <span className="shrink-0 font-interface text-dado numero text-tinta-suave">
                    {g.total} {g.total === 1 ? "ficha" : "fichas"}
                  </span>
                </span>
                <span className="mt-1 block medida-leitura font-leitura text-apoio text-tinta-suave">
                  {g.descricao}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </Container>
  );
}
