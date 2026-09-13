"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Container } from "@/components/Container";

const LINKS = [
  { href: "/especies", rotulo: "Espécies" },
  { href: "/biomas", rotulo: "Biomas" },
  { href: "/grupos", rotulo: "Grupos" },
  { href: "/sobre", rotulo: "Sobre" },
];

export function Header() {
  const caminho = usePathname();

  // Fixo só no desktop: no mobile o cabeçalho quebra em duas linhas e comeria
  // tela demais grudado no topo.
  return (
    <header className="z-40 border-b border-linha bg-papel ficha:sticky ficha:top-0">
      <Container className="flex flex-wrap items-center justify-between gap-x-8 gap-y-2 py-3.5">
        <Link
          href="/"
          className="group flex items-baseline gap-2.5 font-leitura text-destaque font-semibold tracking-tight text-tinta"
        >
          {/* Marca d'água do índice: três traços, como a margem de um guia impresso. */}
          <span aria-hidden="true" className="flex items-end gap-[3px] pb-0.5">
            <span className="block h-2.5 w-0.75 bg-tinta/25 transition-colors duration-120 group-hover:bg-tinta/60" />
            <span className="block h-4 w-0.75 bg-tinta/45 transition-colors duration-120 group-hover:bg-tinta/80" />
            <span className="block h-3 w-0.75 bg-tinta/25 transition-colors duration-120 group-hover:bg-tinta/60" />
          </span>
          BioPlanet
        </Link>

        <nav aria-label="Principal">
          <ul className="flex flex-wrap items-center gap-x-6 gap-y-1 font-interface text-apoio">
            {LINKS.map(({ href, rotulo }) => {
              const ativo = caminho === href || caminho.startsWith(`${href}/`);
              return (
                <li key={href}>
                  <Link
                    href={href}
                    aria-current={ativo ? "page" : undefined}
                    className="relative block py-1 text-tinta transition-colors duration-120 hover:text-tinta"
                  >
                    <span className={ativo ? "font-bold" : "text-tinta-suave hover:text-tinta"}>
                      {rotulo}
                    </span>
                    {/* Rule curta em vez de sublinhado inteiro: marca sem gritar. */}
                    <span
                      aria-hidden="true"
                      className={`absolute -bottom-0.5 left-0 h-px w-full origin-left bg-tinta transition-transform duration-120 ${
                        ativo ? "scale-x-100" : "scale-x-0"
                      }`}
                    />
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </Container>
    </header>
  );
}
