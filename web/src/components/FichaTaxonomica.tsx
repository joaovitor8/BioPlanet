import Link from "next/link";

import { NIVEIS, ROTULO_NIVEL, slugTaxon } from "@/lib/data";
import type { Taxonomia } from "@/lib/types";

type Props = {
  taxonomia: Taxonomia;
  className?: string;
};

/**
 * Ficha taxonômica (guia.md §8): reino → gênero, cada nível linkando para
 * `/taxonomia/...`. Coluna esquerda da ficha, tabular e sempre visível —
 * dado escondido em acordeão é dado que ninguém lê (§5).
 */
export function FichaTaxonomica({ taxonomia, className = "" }: Props) {
  return (
    <table className={`w-full border-collapse font-interface text-apoio ${className}`}>
      <caption className="sr-only">Classificação taxonômica</caption>
      <tbody>
        {NIVEIS.map((nivel) => {
          const valor = taxonomia[nivel];
          return (
            <tr key={nivel} className="border-b border-linha-sutil last:border-b-0">
              <th
                scope="row"
                className="w-24 py-2 pr-4 text-left align-baseline font-normal text-tinta-suave"
              >
                {ROTULO_NIVEL[nivel]}
              </th>
              <td className="py-2 align-baseline">
                <Link
                  href={`/taxonomia/${nivel}/${slugTaxon(valor)}`}
                  className={`link-texto ${nivel === "genero" ? "cientifico" : ""}`}
                >
                  {valor}
                </Link>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
