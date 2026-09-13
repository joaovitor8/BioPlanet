import type { Metadata } from "next";

import { CampoBusca } from "@/components/CampoBusca";
import { GradeEspecies } from "@/components/GradeEspecies";
import { Container } from "@/components/Container";
import { EstadoVazio } from "@/components/EstadoVazio";
import { ChipsFiltros, PainelFiltros, type Secao } from "@/components/PainelFiltros";
import {
  CLASSIFICACOES,
  buscarBioma,
  buscarGrupo,
  buscarStatus,
  contarEspecies,
  contarFacetas,
  contarFiltrosAtivos,
  filtrarEspecies,
  filtroMaisRestritivo,
  filtrosParaQuery,
  lerFiltros,
  GRUPOS,
  BIOMAS,
  STATUS,
} from "@/lib/data";

const DESTINO = "/especies";

export const metadata: Metadata = {
  title: "Espécies",
  description:
    "Todas as espécies do catálogo, com busca por nome popular e científico e filtros combináveis de grupo, bioma e status de conservação.",
};

export default async function ListaEspecies({ searchParams }: PageProps<"/especies">) {
  const filtros = lerFiltros(await searchParams);
  const resultados = filtrarEspecies(filtros);
  const ativos = contarFiltrosAtivos(filtros);
  const total = contarEspecies();
  const facetas = contarFacetas(filtros);

  const secoes: Secao[] = [
    {
      chave: "grupo",
      titulo: "Grupo",
      opcoes: GRUPOS.map((g) => ({
        valor: g.id,
        nome: g.nome,
        total: facetas.grupo[g.id] ?? 0,
        cor: g.cor,
      })),
    },
    {
      chave: "bioma",
      titulo: "Bioma",
      opcoes: CLASSIFICACOES.flatMap((c) =>
        BIOMAS.filter((b) => b.classificacao === c.id).map((b) => ({
          valor: b.slug,
          nome: b.nome,
          total: facetas.bioma[b.slug] ?? 0,
          subgrupo: c.nome,
        })),
      ),
    },
    {
      chave: "status",
      titulo: "Status de conservação",
      opcoes: STATUS.map((s) => ({
        valor: s.id,
        nome: `${s.sigla} — ${s.nome}`,
        total: facetas.status[s.id] ?? 0,
        cor: s.cor,
      })),
    },
  ];

  const rotulos = [
    ...(filtros.q ? [{ chave: "q" as const, valor: filtros.q, nome: `“${filtros.q}”` }] : []),
    ...filtros.grupo.map((v) => ({ chave: "grupo" as const, valor: v, nome: buscarGrupo(v)?.nome ?? v })),
    ...filtros.bioma.map((v) => ({ chave: "bioma" as const, valor: v, nome: buscarBioma(v)?.nome ?? v })),
    ...filtros.status.map((v) => ({
      chave: "status" as const,
      valor: v,
      nome: `${v} — ${buscarStatus(v)?.nome ?? ""}`,
    })),
  ];

  // Query com os demais filtros, para o campo de busca não os derrubar.
  const queryOutros = filtrosParaQuery({ ...filtros, q: "" }).replace(/^\?/, "");

  const culpado = resultados.length === 0 ? filtroMaisRestritivo(filtros) : null;

  return (
    <Container className="py-10 ficha:py-14">
      <h1 className="font-leitura text-titulo text-tinta">Espécies</h1>
      <p className="mt-2 rubrica">
        {ativos > 0 ? (
          <>
            {resultados.length} de {total} fichas
          </>
        ) : (
          <>{total} fichas no catálogo</>
        )}
      </p>

      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-10">
        <aside className="lg:sticky lg:top-6 lg:self-start">
          <PainelFiltros filtros={filtros} secoes={secoes} destino={DESTINO} ativos={ativos} />
        </aside>

        <div className="min-w-0">
          <CampoBusca valorInicial={filtros.q} destino={DESTINO} queryOutros={queryOutros} modo="filtrar" />

          {rotulos.length > 0 && (
            <div className="mt-4">
              <ChipsFiltros filtros={filtros} destino={DESTINO} rotulos={rotulos} />
            </div>
          )}

          <div className="mt-6">
            {resultados.length === 0 ? (
              <EstadoVazio
                hrefLimparTudo={DESTINO}
                culpado={
                  culpado
                    ? {
                        rotulo: culpado.rotulo,
                        href: `${DESTINO}${filtrosParaQuery(culpado.filtros)}`,
                        liberaria: culpado.liberaria,
                      }
                    : undefined
                }
              />
            ) : (
              <GradeEspecies especies={resultados} titulo="Resultados" />
            )}
          </div>
        </div>
      </div>
    </Container>
  );
}
