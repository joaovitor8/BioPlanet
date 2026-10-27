"use client";

import { useState } from "react";
import { SpeciesCard, type SpeciesCardData } from "./SpeciesCard";
import { FilterChip } from "./ui";

export interface SpeciesWithBiomes extends SpeciesCardData {
  biomeSlugs: string[];
}

/** Grade de espécies com filtro por bioma (página do país). */
export function SpeciesByBiome({
  species,
  biomes,
}: {
  species: SpeciesWithBiomes[];
  biomes: { slug: string; name: string }[];
}) {
  const [biome, setBiome] = useState<string>("todos");
  const visible = biome === "todos" ? species : species.filter((s) => s.biomeSlugs.includes(biome));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <fieldset className="flex flex-wrap gap-2">
          <legend className="sr-only">Filtrar por bioma</legend>
          <FilterChip label="Todos" pressed={biome === "todos"} onClick={() => setBiome("todos")} />
          {biomes.map((b) => (
            <FilterChip key={b.slug} label={b.name} pressed={biome === b.slug} onClick={() => setBiome(b.slug)} />
          ))}
        </fieldset>
        <p className="text-[15px] text-muted" aria-live="polite">
          {visible.length} {visible.length === 1 ? "espécie" : "espécies"}
        </p>
      </div>
      {visible.length > 0 ? (
        <ul className="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-5">
          {visible.map((s) => (
            <li key={s.slug} className="grid">
              <SpeciesCard species={s} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-xl border border-dashed border-[#b7c2b2] p-6 text-muted">
          Nenhuma espécie em destaque neste bioma ainda.
        </p>
      )}
    </div>
  );
}
