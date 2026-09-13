import type { Metadata } from "next";
import Link from "next/link";

import { Container } from "@/components/Container";
import { CLASSIFICACOES, listarBiomasComContagem } from "@/lib/data";

export const metadata: Metadata = {
  title: "Biomas",
  description:
    "Os biomas do catálogo, agrupados em três domínios: terrestre, marinho e águas continentais.",
};

export default function ListaBiomas() {
  const biomas = listarBiomasComContagem();

  return (
    <Container className="py-10 ficha:py-14">
      <h1 className="font-leitura text-titulo text-tinta">Biomas</h1>
      <p className="medida-leitura mt-2 font-interface text-apoio text-tinta-suave">
        O escopo do catálogo é mundial, então bioma não é uma lista fixa de oito itens: é entidade
        com classificação própria, agrupada em três domínios.
      </p>

      <div className="mt-8 flex flex-col gap-10">
        {CLASSIFICACOES.map((c) => (
          <section key={c.id} aria-labelledby={`dominio-${c.id}`}>
            <h2 id={`dominio-${c.id}`} className="font-leitura text-subtitulo text-tinta">
              {c.nome}
            </h2>
            <ul className="mt-3 grid grid-cols-1 gap-px border border-linha bg-linha md:grid-cols-2">
              {biomas
                .filter((b) => b.classificacao === c.id)
                .map((b) => (
                  <li key={b.slug} className="bg-papel">
                    <Link
                      href={`/biomas/${b.slug}`}
                      className="block h-full p-4 transition-colors duration-120 hover:bg-papel-fundo"
                    >
                      <span className="flex items-baseline justify-between gap-3">
                        <span className="font-interface text-corpo font-bold text-tinta">{b.nome}</span>
                        <span className="shrink-0 font-interface text-dado numero text-tinta-suave">
                          {b.total} {b.total === 1 ? "ficha" : "fichas"}
                        </span>
                      </span>
                      <span className="mt-1 block medida-leitura font-leitura text-apoio text-tinta-suave">
                        {b.descricao}
                      </span>
                    </Link>
                  </li>
                ))}
            </ul>
          </section>
        ))}
      </div>
    </Container>
  );
}
