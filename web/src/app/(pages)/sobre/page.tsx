import type { Metadata } from "next";
import Link from "next/link";

import { Container } from "@/components/Container";
import { ReguaConservacao } from "@/components/ReguaConservacao";
import { contarEspecies, listarStatusComContagem } from "@/lib/data";

export const metadata: Metadata = {
  title: "Sobre",
  description:
    "Como o catálogo é feito: origem dos dados, licenciamento das fotos e o que as cores significam.",
};

export default function Sobre() {
  const total = contarEspecies();
  const status = listarStatusComContagem();

  return (
    <Container className="py-10 ficha:py-14">
      <h1 className="font-leitura text-titulo text-tinta">Sobre o catálogo</h1>

      <div className="medida-leitura mt-6 flex flex-col gap-7">
        <section>
          <h2 className="font-leitura text-subtitulo text-tinta">O que é</h2>
          <p className="mt-2 font-leitura text-corpo text-tinta">
            Um catálogo público de fauna e flora do mundo inteiro. São {total} fichas escritas à mão,
            cada uma com taxonomia completa, habitat, distribuição, alimentação, reprodução, ameaças
            e fontes. A ficha é o produto: listagem, filtros e navegação existem para entregá-la.
          </p>
        </section>

        <section>
          <h2 className="font-leitura text-subtitulo text-tinta">De onde vêm os dados</h2>
          <p className="mt-2 font-leitura text-corpo text-tinta">
            O texto de cada ficha é escrito a partir da literatura e conferido contra a avaliação da
            espécie na Lista Vermelha da IUCN, linkada no rodapé de cada ficha. As categorias de
            conservação seguem essa avaliação — inclusive quando o resultado é incômodo, como em{" "}
            <Link href="/especies/arapaima-gigas" className="link-texto cientifico">
              Arapaima gigas
            </Link>
            , classificada como Dados insuficientes.
          </p>
          <p className="mt-3 font-leitura text-corpo text-tinta">
            Espécie sem avaliação global aparece como Não avaliada, e não como segura. Seis fichas
            deste catálogo estão nessa situação, a maioria delas de invertebrados e fungos — o que
            diz mais sobre onde o esforço de avaliação se concentrou do que sobre o risco real.
          </p>
        </section>

        <section>
          <h2 className="font-leitura text-subtitulo text-tinta">As fotos</h2>
          <p className="mt-2 font-leitura text-corpo text-tinta">
            Todas as imagens vêm do Wikimedia Commons, sob licença rastreável: CC BY, CC BY-SA ou
            domínio público. Autor, licença e link da fonte são obrigatórios — o componente de
            crédito simplesmente não renderiza sem eles, e uma ficha sem esses campos não entra no
            catálogo.
          </p>
        </section>

        <section>
          <h2 className="font-leitura text-subtitulo text-tinta">O que as cores significam</h2>
          <p className="mt-2 font-leitura text-corpo text-tinta">
            Nenhuma cor entra na interface por gosto. Elas codificam duas coisas e só duas: o grupo
            taxonômico, na tarja lateral do card e no cabeçalho da ficha, e o status de conservação.
            Links e botões não têm cor de marca — se distinguem por peso e sublinhado.
          </p>
          <p className="mt-3 font-leitura text-corpo text-tinta">
            As cores de status são as oficiais da Lista Vermelha e não são escolha nossa: trocá-las
            quebraria o reconhecimento de quem já conhece a escala. Cor nunca é o único portador da
            informação — a sigla e o nome por extenso andam sempre junto com a tarja.
          </p>
        </section>
      </div>

      <section className="mt-10">
        <h2 className="font-leitura text-subtitulo text-tinta">A escala de conservação</h2>
        <div className="mt-4 max-w-2xl">
          <ReguaConservacao status="NT" />
        </div>

        <table className="mt-6 w-full max-w-2xl border-collapse font-interface text-apoio">
          <caption className="sr-only">Categorias da Lista Vermelha e fichas em cada uma</caption>
          <thead>
            <tr className="border-b border-linha">
              <th scope="col" className="py-2 pr-3 text-left font-normal text-tinta-suave">
                Categoria
              </th>
              <th scope="col" className="py-2 pr-3 text-left font-normal text-tinta-suave">
                O que significa
              </th>
              <th scope="col" className="py-2 text-right font-normal text-tinta-suave">
                Fichas
              </th>
            </tr>
          </thead>
          <tbody>
            {status.map((s, i) => (
              <tr key={s.id} className={i % 2 === 1 ? "bg-papel-fundo" : undefined}>
                <th scope="row" className="py-2 pl-2 pr-3 text-left align-baseline font-normal">
                  <span className="inline-flex items-center gap-2">
                    <span
                      aria-hidden="true"
                      className="inline-block h-3 w-3 shrink-0 border border-linha"
                      style={{ backgroundColor: s.cor }}
                    />
                    <span className="font-bold text-tinta">{s.sigla}</span>
                    <span className="text-tinta">{s.nome}</span>
                  </span>
                </th>
                <td className="py-2 pr-3 align-baseline text-tinta-suave">{s.descricao}</td>
                <td className="py-2 pr-2 text-right align-baseline numero text-tinta-suave">
                  {s.total > 0 ? (
                    <Link href={`/especies?status=${s.id}`} className="link-texto">
                      {s.total}
                    </Link>
                  ) : (
                    s.total
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </Container>
  );
}
