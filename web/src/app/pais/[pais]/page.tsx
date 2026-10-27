import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SpeciesByBiome } from "@/components/SpeciesByBiome";
import { Breadcrumbs, Eyebrow, SearchForm, SectionTitle, StatCard, cardHover } from "@/components/ui";
import { continents } from "@/data/countries";
import {
  getCountries,
  getCountry,
  getFeaturedSpecies,
  getGlobalBiomes,
  getNationalBiomes,
  getSources,
} from "@/lib/data";

// Só países já integrados têm página própria.
export async function generateStaticParams() {
  const countries = await getCountries();
  return countries.filter((c) => c.status === "disponivel").map((c) => ({ pais: c.slug }));
}

export async function generateMetadata({ params }: PageProps<"/pais/[pais]">): Promise<Metadata> {
  const { pais } = await params;
  const country = await getCountry(pais);
  return country ? { title: `Fauna e flora do ${country.name}`, description: country.intro } : {};
}

export default async function CountryPage({ params }: PageProps<"/pais/[pais]">) {
  const { pais } = await params;
  const country = await getCountry(pais);
  if (!country || country.status !== "disponivel") notFound();

  const [biomes, globalBiomes, featured, sources] = await Promise.all([
    getNationalBiomes(country.code),
    getGlobalBiomes(),
    getFeaturedSpecies(country.code),
    getSources(country.sourceIds),
  ]);
  const continentName = continents.find((c) => c.id === country.continent)?.name ?? "";
  const biomeName = (slug: string) => biomes.find((b) => b.slug === slug)?.name ?? slug;

  // Só manda para o navegador os campos que o cartão usa.
  const featuredCards = featured.map((s) => {
    const biomeSlugs = s.occurrences.find((o) => o.countryCode === country.code)?.biomeSlugs ?? [];
    return {
      slug: s.slug,
      commonName: s.commonName,
      scientificName: s.scientificName,
      kingdom: s.kingdom,
      group: s.group,
      biomeSlugs,
      detail: biomeSlugs.map(biomeName).join(" · "),
    };
  });

  return (
    <>
      <section className="bg-forest text-[#f2f4ee]">
        <div className="mx-auto flex max-w-[1200px] flex-col gap-7 px-4 pt-8 pb-16 sm:px-6">
          <Breadcrumbs dark items={[{ label: "Mundo", href: "/" }, { label: continentName, href: "/#paises" }, { label: country.name }]} />
          <div className="flex flex-wrap items-center gap-12">
            <div className="flex min-w-0 flex-[1_1_440px] flex-col gap-5">
              <Eyebrow>País · {continentName}</Eyebrow>
              <h1 className="font-display text-5xl leading-none font-bold sm:text-[64px]">{country.name}</h1>
              {country.intro && <p className="max-w-[560px] text-lg leading-relaxed text-mist">{country.intro}</p>}
              <SearchForm
                id="busca-pais"
                label={`Buscar espécie no ${country.name}`}
                placeholder="Ex.: lobo-guará, Caryocar brasiliense"
              />
            </div>
            {/* Os números entram quando os dados forem importados. As fontes ainda são as do Brasil. */}
            <div className="grid min-w-0 flex-[1_1_380px] grid-cols-2 gap-3">
              <StatCard value={String(biomes.length)} label="biomas" source={country.biomeAuthority ?? ""} />
              <StatCard label="espécies de plantas e fungos" source="Flora e Funga do Brasil" />
              <StatCard label="espécies de animais" source="Fauna do Brasil" />
              <StatCard label="ameaçadas na lista nacional" source="SALVE / ICMBio" />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto flex max-w-[1200px] flex-col gap-7 px-4 pt-18 pb-10 sm:px-6">
        <SectionTitle
          title={`Biomas do ${country.name}`}
          subtitle={`Classificação nacional (${country.biomeAuthority}). Barra = parte do território de cada bioma.`}
        />
        <ul className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-5">
          {biomes.map((b) => (
            <li key={b.slug} className="grid">
              <Link
                href={`/pais/${country.slug}/${b.slug}`}
                className={`flex flex-col overflow-hidden rounded-2xl border border-line bg-white text-ink ${cardHover}`}
              >
                <div className="placeholder-light h-[120px]" />
                <div className="flex flex-1 flex-col gap-2.5 p-5">
                  <div className="flex items-baseline justify-between gap-2">
                    <h3 className="font-display text-[22px] font-bold">{b.name}</h3>
                    <span className="font-display text-lg font-bold text-leaf">
                      {b.areaPct.toLocaleString("pt-BR", { minimumFractionDigits: 1 })}%
                    </span>
                  </div>
                  <p className="text-[15px] leading-normal text-muted">{b.description}</p>
                  <div className="mt-auto h-1.5 overflow-hidden rounded-full bg-[#e6ebe2]">
                    <div className="h-1.5 bg-leaf" style={{ width: `${b.areaPct}%` }} />
                  </div>
                  <p className="text-[13px] text-muted">
                    Bioma global: {globalBiomes.find((g) => g.id === b.globalBiomeId)?.name.toLowerCase()}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="mx-auto flex max-w-[1200px] flex-col gap-6 px-4 pt-10 pb-22 sm:px-6">
        <SectionTitle title="Espécies em destaque" subtitle="Filtre por bioma. Cada cartão abre a ficha completa." />
        <SpeciesByBiome species={featuredCards} biomes={biomes.map((b) => ({ slug: b.slug, name: b.name }))} />
      </section>

      <section className="bg-sage">
        <div className="mx-auto flex max-w-[1200px] flex-wrap items-start gap-6 px-4 py-14 sm:px-6">
          <div className="flex min-w-0 flex-[1_1_360px] flex-col gap-2">
            <h2 className="font-display text-[28px] font-bold">Fontes deste país</h2>
            <p className="text-[15px] leading-relaxed text-muted">
              Somadas às fontes globais (GBIF, iNaturalist, IUCN, Catalogue of Life) usadas em todo o atlas.
            </p>
          </div>
          <ul className="grid min-w-0 flex-[2_1_560px] grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-3">
            {sources.map((s) => (
              <li key={s.id} className="flex flex-col gap-1.5 rounded-xl border border-[#d3dbcd] bg-white p-4">
                <a href={s.url} target="_blank" rel="noreferrer" className="font-semibold text-ink hover:text-leaf hover:underline">
                  {s.name}
                </a>
                <span className="text-sm leading-relaxed text-muted">{s.what}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
