import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PageSkeleton } from "@/components/PageSkeleton";
import { BiomeSpeciesBrowser } from "@/components/BiomeSpeciesBrowser";
import { Breadcrumbs, Eyebrow, Placeholder, SectionTitle, StatCard } from "@/components/ui";
import { continents } from "@/data/countries";
import { threatenedCodes } from "@/data/status";
import type { Country, NationalBiome } from "@/data/types";
import { getCountries, getCountry, getGlobalBiome, getNationalBiome, getNationalBiomes, getSpeciesInBiome } from "@/lib/data";

export async function generateStaticParams() {
  const countries = (await getCountries()).filter((c) => c.status === "disponivel");
  const params = await Promise.all(
    countries.map(async (c) => (await getNationalBiomes(c.code)).map((b) => ({ pais: c.slug, bioma: b.slug }))),
  );
  return params.flat();
}

export async function generateMetadata({ params }: PageProps<"/pais/[pais]/[bioma]">): Promise<Metadata> {
  const { pais, bioma } = await params;
  const country = await getCountry(pais);
  const biome = country && (await getNationalBiome(country.code, bioma));
  return biome ? { title: `${biome.name} (${country.name})`, description: biome.description } : {};
}

// A checagem de que o país e o bioma existem fica fora do <Suspense>: depois que
// o esqueleto começa a ser enviado, o Next já respondeu 200 e não consegue mais
// devolver 404. O resto do conteúdo carrega dentro do <Suspense>.
export default async function BiomePage({ params }: PageProps<"/pais/[pais]/[bioma]">) {
  const { pais, bioma } = await params;
  const country = await getCountry(pais);
  if (!country || country.status !== "disponivel") notFound();
  const biome = await getNationalBiome(country.code, bioma);
  if (!biome) notFound();

  return (
    <Suspense fallback={<PageSkeleton variant="bioma" />}>
      <BiomeContent country={country} biome={biome} />
    </Suspense>
  );
}

async function BiomeContent({ country, biome }: { country: Country; biome: NationalBiome }) {

  const [globalBiome, speciesList] = await Promise.all([
    getGlobalBiome(biome.globalBiomeId),
    getSpeciesInBiome(country.code, biome.slug),
  ]);
  const continentName = continents.find((c) => c.id === country.continent)?.name ?? "";

  const cards = speciesList.map((s) => ({
    slug: s.slug,
    commonName: s.commonName,
    scientificName: s.scientificName,
    kingdom: s.kingdom,
    group: s.group,
    nationalStatus: s.conservation.national[country.code],
  }));
  const threatened = cards.filter((s) => s.nationalStatus && threatenedCodes.includes(s.nationalStatus)).length;

  return (
    <>
      <section className="bg-forest text-[#f2f4ee]">
        <div className="mx-auto flex max-w-[1200px] flex-col gap-7 px-4 pt-8 pb-14 sm:px-6">
          <Breadcrumbs
            dark
            items={[
              { label: "Mundo", href: "/" },
              { label: continentName, href: "/#paises" },
              { label: country.name, href: `/pais/${country.slug}` },
              { label: biome.name },
            ]}
          />
          <div className="flex flex-wrap items-end gap-10">
            <div className="flex min-w-0 flex-[1_1_480px] flex-col gap-4">
              <Eyebrow>
                {country.name} · bioma nacional ({country.biomeAuthority}) ·{" "}
                {biome.areaPct.toLocaleString("pt-BR", { minimumFractionDigits: 1 })}% do território
              </Eyebrow>
              <h1 className="font-display text-5xl leading-none font-bold sm:text-[64px]">{biome.name}</h1>
              <p className="max-w-[600px] text-lg leading-relaxed text-mist">{biome.description}</p>
              {globalBiome && (
                <p className="text-sm text-mist">
                  Na classificação global:{" "}
                  <Link href="/#biomas" className="text-[#f2f4ee] underline underline-offset-2">
                    {globalBiome.name.toLowerCase()}
                  </Link>{" "}
                  (WWF / RESOLVE), junto com ambientes parecidos de outros países.
                </p>
              )}
            </div>
            <div className="grid min-w-0 flex-[1_1_360px] grid-cols-2 gap-3">
              <StatCard label="espécies de plantas" source="Flora e Funga do Brasil" />
              <StatCard label="espécies de animais" source="Fauna do Brasil" />
              <StatCard label="ameaçadas (CR, EN, VU)" source="SALVE / ICMBio" />
              <StatCard label="registros de ocorrência" source="GBIF" />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1200px] px-4 pt-12 pb-8 sm:px-6">
        <p className="mb-5 text-sm text-muted">
          Nos dados de exemplo: {cards.length} espécies, {threatened} ameaçadas na lista nacional.
        </p>
        <BiomeSpeciesBrowser species={cards} />
      </section>

      <section className="mx-auto flex max-w-[1200px] flex-col gap-5 px-4 pt-8 pb-22 sm:px-6">
        <SectionTitle
          title="Mapa do bioma"
          subtitle="Limite do bioma com os pontos de ocorrência das espécies filtradas."
        />
        <Placeholder className="h-[440px] rounded-2xl" label="[Mapa] limite do bioma (IBGE) + pontos do GBIF" />
      </section>
    </>
  );
}
