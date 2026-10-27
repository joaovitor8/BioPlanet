"use client";

import Link from "next/link";
import { useState } from "react";
import type { Continent, Country } from "@/data/types";
import { FilterChip, cardHover } from "./ui";

const statusText: Record<Country["status"], string> = {
  disponivel: "Disponível",
  "em-preparacao": "Em preparação",
  global: "Só dados globais",
};

export function CountryExplorer({
  countries,
  continents,
}: {
  countries: Country[];
  continents: { id: Continent; name: string }[];
}) {
  const [continent, setContinent] = useState<Continent | "todos">("todos");

  const visible = continent === "todos" ? countries : countries.filter((c) => c.continent === continent);
  const available = visible.filter((c) => c.status === "disponivel").length;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <fieldset className="flex flex-wrap gap-2">
          <legend className="sr-only">Filtrar por continente</legend>
          <FilterChip label="Todos" pressed={continent === "todos"} onClick={() => setContinent("todos")} />
          {continents.map((c) => (
            <FilterChip key={c.id} label={c.name} pressed={continent === c.id} onClick={() => setContinent(c.id)} />
          ))}
        </fieldset>
        <p className="text-[15px] text-muted" aria-live="polite">
          {visible.length} {visible.length === 1 ? "país" : "países"} · {available}{" "}
          {available === 1 ? "disponível" : "disponíveis"}
        </p>
      </div>

      <ul className="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-4">
        {visible.map((country) => (
          <li key={country.code}>
            {country.status === "disponivel" ? (
              <Link
                href={`/pais/${country.slug}`}
                className={`flex items-center gap-3.5 rounded-[14px] border-2 border-leaf bg-white p-4 text-ink ${cardHover}`}
              >
                <CodeBox code={country.code} active />
                <span className="flex min-w-0 flex-col gap-1">
                  <span className="font-display text-lg font-bold">{country.name}</span>
                  <span className="text-[13px] font-semibold text-leaf">{statusText[country.status]}</span>
                </span>
              </Link>
            ) : (
              <div className="flex items-center gap-3.5 rounded-[14px] border border-dashed border-[#b7c2b2] bg-[#eef1ea] p-4">
                <CodeBox code={country.code} />
                <span className="flex min-w-0 flex-col gap-1">
                  <span className="font-display text-lg font-bold text-[#3e4d44]">{country.name}</span>
                  <span className="text-[13px] text-muted">{statusText[country.status]}</span>
                </span>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

function CodeBox({ code, active = false }: { code: string; active?: boolean }) {
  return (
    <span
      className={`flex h-12 w-12 flex-none items-center justify-center rounded-[10px] font-display font-bold ${active ? "bg-forest text-[#f2f4ee]" : "bg-[#dce3d7] text-[#3e4d44]"}`}
    >
      {code}
    </span>
  );
}
