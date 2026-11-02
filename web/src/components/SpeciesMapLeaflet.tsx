// Mapa de densidade de ocorrências do GBIF para uma espécie, com Leaflet.
// Só roda no navegador: é carregado pelo SpeciesMap.tsx com ssr: false.
// Os pontos não passam pelo BioPlanet: o navegador pede os quadros prontos à Maps API do GBIF.

"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useRef } from "react";

const RETINA = typeof window !== "undefined" && window.devicePixelRatio > 1 ? "@2x" : "@1x";

export default function SpeciesMapLeaflet({ taxonKey }: { taxonKey: number }) {
  const elemento = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!elemento.current) return;
    const mapa = L.map(elemento.current, {
      center: [-14, -52],
      zoom: 3,
      minZoom: 1,
      maxZoom: 10,
      // Rolar a página por cima do mapa não deve dar zoom sem querer.
      scrollWheelZoom: false,
      worldCopyJump: true,
    });
    mapa.attributionControl.setPrefix(false);

    // Mapa de fundo do próprio GBIF (dados OpenStreetMap / OpenMapTiles).
    L.tileLayer(`https://tile.gbif.org/3857/omt/{z}/{x}/{y}${RETINA}.png?style=gbif-light`, {
      tileSize: 512,
      zoomOffset: -1,
      attribution: '© <a href="https://openmaptiles.org/">OpenMapTiles</a> © <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(mapa);

    // Densidade de registros da espécie, em hexágonos.
    L.tileLayer(
      `https://api.gbif.org/v2/map/occurrence/density/{z}/{x}/{y}${RETINA}.png?taxonKey=${taxonKey}&style=classic.poly&bin=hex&hexPerTile=40`,
      {
        tileSize: 512,
        zoomOffset: -1,
        attribution: 'Dados: <a href="https://www.gbif.org">GBIF.org</a>',
      },
    ).addTo(mapa);

    // Enquadra a área onde a espécie tem registros (o GBIF informa os limites).
    const controle = new AbortController();
    fetch(`https://api.gbif.org/v2/map/occurrence/density/capabilities.json?taxonKey=${taxonKey}`, {
      signal: controle.signal,
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((c: { minLat: number; maxLat: number; minLng: number; maxLng: number; total: number } | null) => {
        if (c && c.total > 0) {
          mapa.fitBounds([[c.minLat, c.minLng], [c.maxLat, c.maxLng]], { padding: [16, 16], maxZoom: 6 });
        }
      })
      .catch(() => {
        // Sem os limites, fica a visão inicial (América do Sul).
      });

    return () => {
      controle.abort();
      mapa.remove();
    };
  }, [taxonKey]);

  return <div ref={elemento} className="h-full w-full" />;
}
