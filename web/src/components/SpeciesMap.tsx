// Mapa de ocorrências da ficha da espécie, com o número de registros e o crédito do GBIF.
// O mapa só carrega no navegador (ssr: false); a página continua sendo gerada no servidor.

"use client";

import dynamic from "next/dynamic";
import type { Species } from "@/data/types";

const SpeciesMapLeaflet = dynamic(() => import("./SpeciesMapLeaflet"), {
  ssr: false,
  loading: () => <div className="placeholder-light h-full w-full" />,
});

export function SpeciesMap({ gbif, name }: { gbif: NonNullable<Species["gbif"]>; name: string }) {
  // Fuso fixo: o texto sai igual no servidor e no navegador, mesmo que os fusos deles sejam diferentes.
  const data = new Date(gbif.updatedAt).toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" });
  return (
    <figure className="flex min-w-0 flex-[3_1_520px] flex-col gap-2">
      <div
        role="region"
        aria-label={`Mapa com a densidade de registros de ocorrência de ${name} no GBIF`}
        className="relative z-0 h-100 overflow-hidden rounded-2xl border border-line bg-sage"
      >
        <SpeciesMapLeaflet taxonKey={gbif.taxonKey} />
      </div>
      <figcaption className="text-[13px] leading-relaxed text-muted">
        {gbif.records.toLocaleString("pt-BR")} registros de ocorrência (contagem de {data}). Dados:{" "}
        <a href="https://www.gbif.org" target="_blank" rel="noreferrer" className="text-leaf hover:underline">
          GBIF.org
        </a>{" "}
        ·{" "}
        <a
          href={`https://www.gbif.org/species/${gbif.taxonKey}`}
          target="_blank"
          rel="noreferrer"
          className="text-leaf hover:underline"
        >
          ver a espécie no GBIF
        </a>
      </figcaption>
    </figure>
  );
}
