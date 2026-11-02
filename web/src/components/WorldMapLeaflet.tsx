// Mapa-múndi com Leaflet. Só roda no navegador: é carregado pelo WorldMap.tsx com ssr: false.
// Países do BioPlanet coloridos pelo status; os disponíveis levam para a página do país.

"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { feature } from "topojson-client";
import mundo from "world-atlas/countries-110m.json";
import type { Topology } from "topojson-specification";
import type { Country } from "@/data/types";

// O arquivo de contornos (Natural Earth, via world-atlas) usa o código numérico da ISO 3166;
// o BioPlanet usa a sigla. Ao integrar um país novo, acrescente aqui.
const NUMERICO_PARA_SIGLA: Record<string, string> = {
  "076": "BR", "032": "AR", "170": "CO", "604": "PE", "484": "MX", "840": "US", "620": "PT",
  "724": "ES", "710": "ZA", "404": "KE", "356": "IN", "360": "ID", "036": "AU", "554": "NZ",
};

// Mesmas cores da legenda da página inicial.
const ESTILO: Record<Country["status"] | "fora", L.PathOptions> = {
  disponivel: { fillColor: "#e9b23a", fillOpacity: 1, color: "#0e2a20", weight: 1 },
  "em-preparacao": { fillColor: "#5e7a6a", fillOpacity: 1, color: "#0e2a20", weight: 1 },
  global: { fillColor: "#163828", fillOpacity: 1, color: "#5e7a6a", weight: 1.5 },
  fora: { fillColor: "#163828", fillOpacity: 1, color: "#234536", weight: 0.5 },
};

const TEXTO_DO_STATUS: Record<Country["status"], string> = {
  disponivel: "Disponível · clique para abrir",
  "em-preparacao": "Em preparação",
  global: "Só dados globais",
};

export default function WorldMapLeaflet({ countries }: { countries: Country[] }) {
  const elemento = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (!elemento.current) return;
    const porSigla = new Map(countries.map((c) => [c.code, c]));

    const mapa = L.map(elemento.current, {
      center: [10, 0],
      zoom: 1,
      minZoom: 1,
      maxZoom: 5,
      zoomSnap: 0.5,
      // Rolar a página por cima do mapa não deve dar zoom sem querer.
      scrollWheelZoom: false,
      maxBounds: [[-85, -200], [85, 200]],
      attributionControl: false,
    });
    L.control.attribution({ prefix: false }).addAttribution("Contornos: Natural Earth").addTo(mapa);

    const topologia = mundo as unknown as Topology;
    const paises = feature(topologia, topologia.objects.countries);
    const camada = L.geoJSON(paises, {
      style: (f) => {
        const pais = porSigla.get(NUMERICO_PARA_SIGLA[String(f?.id)]);
        return ESTILO[pais?.status ?? "fora"];
      },
      onEachFeature: (f, layer) => {
        const pais = porSigla.get(NUMERICO_PARA_SIGLA[String(f.id)]);
        if (!pais) return;
        layer.bindTooltip(`<strong>${pais.name}</strong><br>${TEXTO_DO_STATUS[pais.status]}`, { sticky: true });
        if (pais.status === "disponivel") {
          layer.on("click", () => router.push(`/pais/${pais.slug}`));
          layer.on("mouseover", () => (layer as L.Path).setStyle({ fillColor: "#f2c75c" }));
          layer.on("mouseout", () => (layer as L.Path).setStyle(ESTILO.disponivel));
        }
      },
    }).addTo(mapa);
    mapa.fitBounds(camada.getBounds(), { padding: [4, 4] });

    return () => {
      mapa.remove();
    };
  }, [countries, router]);

  // bg-forest! vence o fundo cinza que o CSS do Leaflet põe no mapa.
  return <div ref={elemento} className="h-full w-full bg-forest!" />;
}
