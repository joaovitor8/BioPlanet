import Link from "next/link";

import { Container } from "@/components/Container";

export default function NaoEncontrado() {
  return (
    <Container className="py-16">
      <h1 className="font-leitura text-titulo text-tinta">Página não encontrada</h1>
      <p className="medida-leitura mt-3 font-leitura text-corpo text-tinta">
        O endereço não corresponde a nenhuma ficha, bioma, grupo ou táxon do catálogo. Os endereços
        de ficha usam o nome científico, como{" "}
        <span className="font-interface text-apoio">/especies/panthera-onca</span>.
      </p>
      <p className="mt-5 font-interface text-apoio">
        <Link href="/especies" className="link-texto">
          Ver todas as espécies
        </Link>
      </p>
    </Container>
  );
}
