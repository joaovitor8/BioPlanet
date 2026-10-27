import Link from "next/link";
import type { Kingdom } from "@/data/types";
import { KingdomTag, cardHover } from "./ui";

/** Só o que o cartão precisa. Assim dá para mandar poucos dados para o navegador. */
export interface SpeciesCardData {
  slug: string;
  commonName: string;
  scientificName: string;
  kingdom: Kingdom;
  group: string;
  /** Linha extra embaixo do nome (ex.: biomas). */
  detail?: string;
}

export function SpeciesCard({ species, tag = "kingdom" }: { species: SpeciesCardData; tag?: "kingdom" | "group" }) {
  return (
    <Link
      href={`/especie/${species.slug}`}
      className={`flex flex-col overflow-hidden rounded-[14px] border border-line bg-white text-ink ${cardHover}`}
    >
      <div className="placeholder-light flex h-[170px] items-start p-3">
        {tag === "kingdom" ? (
          <KingdomTag kingdom={species.kingdom} />
        ) : (
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${species.kingdom === "fauna" ? "bg-forest text-[#f2f4ee]" : "border border-leaf bg-white text-leaf"}`}
          >
            {species.group}
          </span>
        )}
      </div>
      <div className="flex flex-col gap-1 p-4">
        <h3 className="font-display text-[19px] font-bold">{species.commonName}</h3>
        <p className="text-sm text-muted italic">{species.scientificName}</p>
        {species.detail && <p className="mt-2 text-[13px] leading-relaxed text-muted">{species.detail}</p>}
      </div>
    </Link>
  );
}
