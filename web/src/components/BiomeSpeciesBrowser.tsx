"use client";

import { useState } from "react";
import { statusLabels } from "@/data/status";
import type { Kingdom, StatusCode } from "@/data/types";
import { SpeciesCard, type SpeciesCardData } from "./SpeciesCard";

export interface BrowserSpecies extends SpeciesCardData {
  /** Status na lista nacional do país (se houver). */
  nationalStatus?: StatusCode;
}

type Tab = "tudo" | Kingdom;
type Sort = "comum" | "cientifico" | "risco";

const tabs: { id: Tab; label: string }[] = [
  { id: "tudo", label: "Tudo" },
  { id: "fauna", label: "Fauna" },
  { id: "flora", label: "Flora" },
];

const riskFilters: StatusCode[] = ["CR", "EN", "VU", "NT", "LC"];
const riskOrder: StatusCode[] = ["EX", "EW", "CR", "EN", "VU", "NT", "LC", "DD"];

/** Lista de espécies de um bioma com abas, filtros e ordenação. */
export function BiomeSpeciesBrowser({ species }: { species: BrowserSpecies[] }) {
  const groups = [...new Set(species.map((s) => s.group))].sort((a, b) => a.localeCompare(b, "pt-BR"));

  const [tab, setTab] = useState<Tab>("tudo");
  const [hiddenGroups, setHiddenGroups] = useState<string[]>([]);
  const [risks, setRisks] = useState<StatusCode[]>([]);
  const [sort, setSort] = useState<Sort>("comum");

  const toggle = <T,>(list: T[], value: T) => (list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);

  const visible = species
    .filter((s) => tab === "tudo" || s.kingdom === tab)
    .filter((s) => !hiddenGroups.includes(s.group))
    .filter((s) => risks.length === 0 || (s.nationalStatus && risks.includes(s.nationalStatus)))
    .sort((a, b) => {
      if (sort === "cientifico") return a.scientificName.localeCompare(b.scientificName);
      if (sort === "risco") {
        const rank = (s: BrowserSpecies) => (s.nationalStatus ? riskOrder.indexOf(s.nationalStatus) : 99);
        return rank(a) - rank(b) || a.commonName.localeCompare(b.commonName, "pt-BR");
      }
      return a.commonName.localeCompare(b.commonName, "pt-BR");
    });

  return (
    <div className="flex flex-wrap items-start gap-8">
      <aside
        aria-label="Filtros"
        className="flex min-w-0 flex-[1_1_240px] flex-col gap-6 rounded-[14px] border border-line bg-white p-5"
      >
        <h2 className="font-display text-xl font-bold">Filtros</h2>
        <fieldset className="flex flex-col gap-1">
          <legend className="mb-2 text-sm font-semibold">Grupo</legend>
          {groups.map((g) => (
            <Checkbox
              key={g}
              label={g}
              checked={!hiddenGroups.includes(g)}
              onChange={() => setHiddenGroups((h) => toggle(h, g))}
            />
          ))}
        </fieldset>
        <fieldset className="flex flex-col gap-1">
          <legend className="mb-2 text-sm font-semibold">Risco na lista nacional</legend>
          {riskFilters.map((r) => (
            <Checkbox
              key={r}
              label={`${statusLabels[r]} (${r})`}
              checked={risks.includes(r)}
              onChange={() => setRisks((list) => toggle(list, r))}
            />
          ))}
        </fieldset>
      </aside>

      <div className="flex min-w-0 flex-[999_1_560px] flex-col gap-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <fieldset className="flex gap-1 rounded-full bg-sage p-1">
            <legend className="sr-only">Mostrar</legend>
            {tabs.map((t) => (
              <button
                key={t.id}
                type="button"
                aria-pressed={tab === t.id}
                onClick={() => setTab(t.id)}
                className={`min-h-10 cursor-pointer rounded-full px-[18px] text-[15px] font-medium ${tab === t.id ? "bg-forest text-[#f2f4ee]" : "text-ink hover:bg-white"}`}
              >
                {t.label}
              </button>
            ))}
          </fieldset>
          <div className="flex items-center gap-2.5">
            <label htmlFor="ordem" className="text-sm text-muted">
              Ordenar por
            </label>
            <select
              id="ordem"
              value={sort}
              onChange={(e) => setSort(e.target.value as Sort)}
              className="h-11 rounded-[10px] border border-line-strong bg-white px-3 text-[15px]"
            >
              <option value="comum">Nome popular</option>
              <option value="cientifico">Nome científico</option>
              <option value="risco">Risco de extinção</option>
            </select>
          </div>
        </div>
        <p className="text-[15px] text-muted" aria-live="polite">
          Mostrando {visible.length} de {species.length} espécies
        </p>
        {visible.length > 0 ? (
          <ul className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-[18px]">
            {visible.map((s) => (
              <li key={s.slug} className="grid">
                <SpeciesCard species={s} tag="group" />
              </li>
            ))}
          </ul>
        ) : (
          <p className="rounded-xl border border-dashed border-[#b7c2b2] p-6 text-muted">
            Nenhuma espécie com esses filtros. Muitas ainda estão sem status importado.
          </p>
        )}
      </div>
    </div>
  );
}

function Checkbox({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <label className="flex min-h-9 cursor-pointer items-center gap-2.5 text-[15px]">
      <input type="checkbox" checked={checked} onChange={onChange} className="h-[18px] w-[18px] accent-leaf" />
      {label}
    </label>
  );
}
