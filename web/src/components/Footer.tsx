import Link from "next/link";

import { Container } from "@/components/Container";

const LINKS = [
  { href: "/especies", rotulo: "Todas as espécies" },
  { href: "/biomas", rotulo: "Biomas" },
  { href: "/grupos", rotulo: "Grupos" },
  { href: "/sobre", rotulo: "Sobre o projeto" },
];

export function Footer() {
  return (
    <footer className="mt-20 border-t border-linha bg-papel-fundo">
      <Container className="py-12">
        <div className="grid grid-cols-1 gap-8 ficha:grid-cols-[minmax(0,1fr)_auto] ficha:gap-16">
          <div>
            <p className="font-leitura text-destaque text-tinta">BioPlanet</p>
            <p className="medida-leitura mt-2 font-interface text-apoio text-tinta-suave">
              Catálogo de espécies com fichas escritas à mão e fotos de licença rastreável, do
              Wikimedia Commons. Autor, licença e link da fonte acompanham cada imagem.
            </p>
          </div>

          <nav aria-label="Rodapé">
            <ul className="flex flex-col gap-2 font-interface text-apoio ficha:text-right">
              {LINKS.map(({ href, rotulo }) => (
                <li key={href}>
                  <Link href={href} className="link-texto">
                    {rotulo}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <p className="mt-10 border-t border-linha-sutil pt-5 rubrica">
          Categorias de conservação segundo a Lista Vermelha da IUCN. Espécie não avaliada não é
          espécie fora de risco.
        </p>
      </Container>
    </footer>
  );
}
