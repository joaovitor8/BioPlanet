// Mapa-múndi clicável da página inicial. O Leaflet só funciona no navegador, então ele é
// carregado à parte (ssr: false); no servidor e enquanto carrega, aparece o fundo listrado.

"use client";

import dynamic from "next/dynamic";
import type { Country } from "@/data/types";

const WorldMapLeaflet = dynamic(() => import("./WorldMapLeaflet"), {
  ssr: false,
  loading: () => <div className="placeholder-dark h-full w-full" />,
});

export function WorldMap({ countries }: { countries: Country[] }) {
  return (
    <div
      role="region"
      aria-label="Mapa-múndi com os países do BioPlanet. Os mesmos países estão na lista Explore por país, mais abaixo."
      className="relative z-0 h-90 overflow-hidden rounded-[20px] border border-[#2b4d3c] bg-forest"
    >
      <WorldMapLeaflet countries={countries} />
    </div>
  );
}
