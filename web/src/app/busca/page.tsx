import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { SpeciesCard } from "@/components/SpeciesCard";
import { CountryCode, SearchForm } from "@/components/ui";
import { searchAll } from "@/lib/data";

export const metadata: Metadata = { title: "Busca" };

const searchFormProps = {
  id: "busca-pagina",
  label: "Buscar espécie ou país",
  placeholder: "Ex.: onça, Araucaria, Brasil",
};

// A parte fixa da página (topo e formulário vazio) é gerada no build.
// O que depende da URL (?q=...) fica dentro do <Suspense>: o termo no campo e os resultados.
export default function SearchPage({ searchParams }: PageProps<"/busca">) {
  return (
    <>
      <section className="bg-forest text-[#f2f4ee]">
        <div className="mx-auto flex max-w-[1200px] flex-col gap-5 px-4 pt-10 pb-12 sm:px-6">
          <h1 className="font-display text-4xl font-bold">Busca</h1>
          <Suspense fallback={<SearchForm {...searchFormProps} />}>
            <FilledSearchForm searchParams={searchParams} />
          </Suspense>
        </div>
      </section>
      <section className="mx-auto max-w-[1200px] px-4 pt-10 pb-22 sm:px-6">
        <Suspense fallback={<p className="text-muted">Buscando…</p>}>
          <Results searchParams={searchParams} />
        </Suspense>
      </section>
    </>
  );
}

async function readQuery(searchParams: PageProps<"/busca">["searchParams"]) {
  const { q } = await searchParams;
  return (Array.isArray(q) ? q[0] : q)?.trim() ?? "";
}

// O key troca o campo a cada busca nova, para ele mostrar o termo atual.
async function FilledSearchForm({ searchParams }: Pick<PageProps<"/busca">, "searchParams">) {
  const query = await readQuery(searchParams);
  return <SearchForm key={query} {...searchFormProps} defaultValue={query} />;
}

async function Results({ searchParams }: Pick<PageProps<"/busca">, "searchParams">) {
  const query = await readQuery(searchParams);
  if (!query) return <p className="text-muted">Digite um nome popular, científico ou de país.</p>;

  const { species, countries } = await searchAll(query);
  const total = species.length + countries.length;

  return (
    <div className="flex flex-col gap-8">
      <p className="text-[15px] text-muted" aria-live="polite">
        {total === 0
          ? `Nada encontrado para “${query}”.`
          : `${total} ${total === 1 ? "resultado" : "resultados"} para “${query}”`}
      </p>

      {countries.length > 0 && (
        <div className="flex flex-col gap-3">
          <h2 className="font-display text-2xl font-bold">Países</h2>
          <ul className="flex flex-wrap gap-3">
            {countries.map((c) => (
              <li key={c.code}>
                {c.status === "disponivel" ? (
                  <Link
                    href={`/pais/${c.slug}`}
                    className="flex items-center gap-2.5 rounded-xl border-2 border-leaf bg-white px-4 py-3 font-semibold text-ink hover:text-leaf"
                  >
                    <CountryCode code={c.code} />
                    {c.name}
                  </Link>
                ) : (
                  <span className="flex items-center gap-2.5 rounded-xl border border-dashed border-[#b7c2b2] bg-[#eef1ea] px-4 py-3 text-[#3e4d44]">
                    <CountryCode code={c.code} active={false} />
                    {c.name} · ainda não disponível
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {species.length > 0 && (
        <div className="flex flex-col gap-3">
          <h2 className="font-display text-2xl font-bold">Espécies</h2>
          <ul className="grid grid-cols-[repeat(auto-fill,minmax(230px,1fr))] gap-5">
            {species.map((s) => (
              <li key={s.slug} className="grid">
                <SpeciesCard
                  species={{
                    slug: s.slug,
                    commonName: s.commonName,
                    scientificName: s.scientificName,
                    kingdom: s.kingdom,
                    group: s.group,
                  }}
                />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
