import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PageSkeleton } from "@/components/PageSkeleton";
import { NationalStatus, type NationalStatusOption } from "@/components/NationalStatus";
import { SpeciesCard } from "@/components/SpeciesCard";
import { Breadcrumbs, CountryCode, KingdomTag, Placeholder, StatusBadge } from "@/components/ui";
import { statusLabels } from "@/data/status";
import type { Species, Taxonomy } from "@/data/types";
import {
  getAllSpecies,
  getCountryByCode,
  getNationalBiomes,
  getRelatedSpecies,
  getSources,
  getSpecies,
} from "@/lib/data";

export async function generateStaticParams() {
  return (await getAllSpecies()).map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: PageProps<"/especie/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const species = await getSpecies(slug);
  return species
    ? { title: `${species.commonName} (${species.scientificName})`, description: species.summary }
    : {};
}

const taxonomyLabels: { key: keyof Taxonomy; label: string }[] = [
  { key: "reino", label: "Reino" },
  { key: "filo", label: "Filo" },
  { key: "classe", label: "Classe" },
  { key: "ordem", label: "Ordem" },
  { key: "familia", label: "Família" },
  { key: "genero", label: "Gênero" },
];

// A checagem de que a espécie existe fica fora do <Suspense>: depois que o
// esqueleto começa a ser enviado, o Next já respondeu 200 e não consegue mais
// devolver 404. O resto do conteúdo carrega dentro do <Suspense>.
export default async function SpeciesPage({ params }: PageProps<"/especie/[slug]">) {
  const { slug } = await params;
  const species = await getSpecies(slug);
  if (!species) notFound();

  return (
    <Suspense fallback={<PageSkeleton variant="especie" />}>
      <SpeciesContent species={species} />
    </Suspense>
  );
}

async function SpeciesContent({ species }: { species: Species }) {

  // Países onde a espécie ocorre, com o que já sabemos de cada um.
  const places = await Promise.all(
    species.occurrences.map(async (o) => {
      const country = await getCountryByCode(o.countryCode);
      const biomes = await getNationalBiomes(o.countryCode);
      const sources = country ? await getSources(country.sourceIds) : [];
      return {
        code: o.countryCode,
        country,
        biomeLinks: o.biomeSlugs.map((b) => ({ slug: b, name: biomes.find((x) => x.slug === b)?.name ?? b })),
        // Fauna usa o catálogo de fauna e a lista de ameaça; flora, o catálogo de flora.
        distributionSource: sources.find((s) => s.id.startsWith(species.kingdom === "fauna" ? "fauna" : "flora")),
        statusSource: sources.find((s) => s.id === "salve"),
      };
    }),
  );
  const related = await getRelatedSpecies(species);

  const statusOptions: NationalStatusOption[] = places.map((p) => ({
    code: p.code,
    name: p.country?.name ?? p.code,
    status: species.conservation.national[p.code],
    integrated: p.country?.status === "disponivel",
    sourceName: species.kingdom === "fauna" ? p.statusSource?.name : undefined,
  }));

  const home = places.find((p) => p.country?.status === "disponivel");
  const others = places.filter((p) => p !== home);

  return (
    <>
      <div className="mx-auto max-w-[1200px] px-4 pt-7 sm:px-6">
        <Breadcrumbs
          items={[
            { label: "Mundo", href: "/" },
            { label: species.kingdom === "fauna" ? "Fauna" : "Flora" },
            { label: species.commonName },
          ]}
        />
      </div>

      {/* Fotos + dados principais */}
      <section className="mx-auto flex max-w-[1200px] flex-wrap items-start gap-10 px-4 pt-6 pb-12 sm:px-6">
        <div className="flex min-w-0 flex-[1_1_520px] flex-col gap-3">
          <Placeholder className="h-[440px] rounded-[18px]" label="[Foto] © autor · CC-BY · via iNaturalist" />
          <div className="grid grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((n) => (
              <button
                key={n}
                type="button"
                aria-label={`Foto ${n}`}
                aria-pressed={n === 1}
                className={`placeholder-light h-[84px] cursor-pointer rounded-[10px] ${n === 1 ? "border-[3px] border-forest" : "border border-line-strong"}`}
              />
            ))}
          </div>
        </div>

        <div className="flex min-w-0 flex-[1_1_400px] flex-col gap-6">
          <div className="flex flex-wrap gap-2">
            <KingdomTag kingdom={species.kingdom} />
            <span className="rounded-full bg-sage px-2.5 py-1 text-xs font-semibold">{species.group}</span>
          </div>
          <div>
            <h1 className="font-display text-[40px] leading-[1.05] font-bold sm:text-[52px]">{species.commonName}</h1>
            <p className="mt-2 text-xl text-muted">
              <i>{species.scientificName}</i>
              {species.authorship && <span className="text-[15px]"> {species.authorship}</span>}
            </p>
            {species.otherNames && (
              <p className="mt-2.5 text-[15px] text-muted">Outros nomes: {species.otherNames.join(" · ")}</p>
            )}
          </div>

          <div className="flex flex-col gap-2.5">
            <h2 className="font-display text-lg font-bold">Estado de conservação</h2>
            <div className="flex items-center gap-4 rounded-[14px] border border-line bg-white p-4">
              {species.conservation.global ? (
                <>
                  <StatusBadge code={species.conservation.global} />
                  <div className="flex min-w-0 flex-col gap-0.5">
                    <span className="text-xs tracking-[0.06em] text-muted uppercase">Global</span>
                    <span className="text-[17px] font-semibold">{statusLabels[species.conservation.global]}</span>
                    <span className="text-[13px] text-muted">Fonte: IUCN Red List</span>
                  </div>
                </>
              ) : (
                <p className="text-[15px] text-muted">
                  <span className="text-xs tracking-[0.06em] uppercase">Global · </span>
                  Status da IUCN ainda não importado.
                </p>
              )}
            </div>
            <NationalStatus options={statusOptions} />
          </div>

          <div className="flex flex-col gap-3 rounded-[14px] border border-line bg-white p-[18px]">
            <h2 className="font-display text-lg font-bold">Classificação</h2>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-[15px]">
              {taxonomyLabels.map(({ key, label }) => (
                <div key={key} className="flex flex-col gap-0.5">
                  <dt className="text-xs tracking-[0.06em] text-muted uppercase">{label}</dt>
                  <dd className={`font-medium ${key === "genero" ? "italic" : ""}`}>{species.taxonomy[key]}</dd>
                </div>
              ))}
            </dl>
            <p className="text-[13px] text-muted">Fonte: Catalogue of Life</p>
          </div>
        </div>
      </section>

      {/* Onde ocorre */}
      <section className="mx-auto flex max-w-[1200px] flex-col gap-5 px-4 pb-12 sm:px-6">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-display text-[28px] font-bold">Onde ocorre</h2>
          <span className="text-sm text-muted">
            {places.length} {places.length === 1 ? "país" : "países"} nos dados de exemplo · [N] registros no GBIF
          </span>
        </div>
        <div className="flex flex-wrap items-stretch gap-6">
          <Placeholder
            className="h-[400px] min-w-0 flex-[3_1_520px] rounded-2xl"
            label="[Mapa] área de distribuição (IUCN) + pontos do GBIF"
          />
          <ul className="flex min-w-0 flex-[2_1_300px] flex-col gap-2.5">
            {home?.country && (
              <li>
                <div className="flex flex-col gap-2 rounded-xl border-2 border-leaf bg-white px-4 py-3.5">
                  <Link href={`/pais/${home.country.slug}`} className="flex items-center gap-2.5 font-semibold text-ink hover:text-leaf">
                    <CountryCode code={home.code} />
                    {home.country.name}
                  </Link>
                  {home.biomeLinks.length > 0 && (
                    <p className="flex flex-wrap gap-x-1.5 text-sm leading-relaxed text-muted">
                      {home.biomeLinks.map((b, i) => (
                        <span key={b.slug}>
                          {i > 0 && <span aria-hidden="true">· </span>}
                          <Link href={`/pais/${home.country!.slug}/${b.slug}`} className="text-leaf hover:underline">
                            {b.name}
                          </Link>
                        </span>
                      ))}
                    </p>
                  )}
                  {home.distributionSource && (
                    <span className="text-xs text-muted">Fonte: {home.distributionSource.name}</span>
                  )}
                </div>
              </li>
            )}
            {others.map((p) => (
              <li
                key={p.code}
                className="flex items-center gap-2.5 rounded-xl border border-dashed border-[#b7c2b2] bg-[#eef1ea] px-4 py-3"
              >
                <CountryCode code={p.code} active={false} />
                <span className="flex flex-col gap-0.5">
                  <span className="text-[15px] font-semibold text-[#3e4d44]">{p.country?.name ?? p.code}</span>
                  <span className="text-xs text-muted">
                    {p.country?.status === "em-preparacao" ? "País em preparação" : "Só dados globais por enquanto"}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Texto */}
      <section className="mx-auto flex max-w-[1200px] flex-col gap-3.5 px-4 pb-14 sm:px-6">
        <h2 className="font-display text-[28px] font-bold">Sobre a espécie</h2>
        {species.summary && <p className="max-w-[760px] text-[17px] leading-[1.7]">{species.summary}</p>}
        <p className="max-w-[760px] text-[17px] leading-[1.7] text-muted">
          [Resumo de história natural, habitat e ameaças. Texto global de base + complemento da fonte nacional do país
          selecionado.]
        </p>
      </section>

      {/* Relacionadas */}
      {related.length > 0 && (
        <section className="bg-sage">
          <div className="mx-auto flex max-w-[1200px] flex-col gap-6 px-4 pt-14 pb-18 sm:px-6">
            <h2 className="font-display text-[28px] font-bold">Espécies relacionadas</h2>
            <ul className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-[18px]">
              {related.map(({ species: s, reason }) => (
                <li key={s.slug} className="grid">
                  <SpeciesCard
                    species={{
                      slug: s.slug,
                      commonName: s.commonName,
                      scientificName: s.scientificName,
                      kingdom: s.kingdom,
                      group: s.group,
                      detail: reason,
                    }}
                  />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </>
  );
}
