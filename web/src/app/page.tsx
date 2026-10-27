import { CountryExplorer } from "@/components/CountryExplorer";
import { CountryCode, Eyebrow, Placeholder, SearchForm, SectionTitle } from "@/components/ui";
import {
  getContinents,
  getCountries,
  getGlobalBiomeIdsInCountry,
  getGlobalBiomes,
  getSources,
} from "@/lib/data";

export default async function Home() {
  const [countries, continents, globalBiomes, globalSources, inBrazil] = await Promise.all([
    getCountries(),
    getContinents(),
    getGlobalBiomes(),
    getSources().then((all) => all.filter((s) => s.scope === "global")),
    getGlobalBiomeIdsInCountry("BR"),
  ]);
  const nationalSourcesByCountry = await Promise.all(
    countries
      .filter((c) => c.status === "disponivel")
      .map(async (c) => ({ country: c, sources: await getSources(c.sourceIds) })),
  );

  return (
    <>
      {/* Topo com busca e mapa-múndi */}
      <section id="mapa" className="bg-forest text-[#f2f4ee]">
        <div className="mx-auto flex max-w-[1200px] flex-wrap items-center gap-12 px-4 pt-16 pb-20 sm:px-6">
          <div className="flex min-w-0 flex-[1_1_420px] flex-col gap-6">
            <Eyebrow>Atlas da biodiversidade</Eyebrow>
            <h1 className="font-display text-4xl leading-[1.05] font-bold sm:text-[54px]">
              Fauna e flora do planeta, país por país.
            </h1>
            <p className="max-w-[540px] text-lg leading-relaxed text-mist">
              Começando pelo Brasil. Cada novo país entra com suas bases científicas nacionais, somadas a dados
              globais de ocorrência e conservação.
            </p>
            <SearchForm id="busca" label="Buscar espécie ou país" placeholder="Ex.: Panthera onca, Brasil, lobo-guará" />
          </div>
          <div className="flex min-w-0 flex-[1_1_460px] flex-col gap-3">
            <Placeholder dark className="h-[360px] rounded-[20px]" label="[Mapa-múndi] países clicáveis · GeoJSON Natural Earth" />
            <ul className="flex flex-wrap gap-5 text-sm text-mist" aria-label="Legenda do mapa">
              <li className="flex items-center gap-2">
                <span aria-hidden="true" className="h-3.5 w-3.5 rounded bg-accent" />
                Disponível
              </li>
              <li className="flex items-center gap-2">
                <span aria-hidden="true" className="h-3.5 w-3.5 rounded bg-[#5e7a6a]" />
                Em preparação
              </li>
              <li className="flex items-center gap-2">
                <span aria-hidden="true" className="h-3.5 w-3.5 rounded border border-[#5e7a6a]" />
                Só dados globais
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Países */}
      <section id="paises" className="mx-auto flex max-w-[1200px] scroll-mt-4 flex-col gap-6 px-4 pt-20 pb-10 sm:px-6">
        <SectionTitle title="Explore por país" subtitle="O atlas cresce um país de cada vez. Filtre por continente." />
        <CountryExplorer countries={countries} continents={continents} />
      </section>

      {/* Biomas globais */}
      <section id="biomas" className="mx-auto flex max-w-[1200px] scroll-mt-4 flex-col gap-6 px-4 pt-12 pb-22 sm:px-6">
        <SectionTitle
          title="Biomas do planeta"
          subtitle="Classificação global (WWF / RESOLVE, 14 biomas terrestres). Cada país também mostra sua classificação nacional, como os 6 biomas do IBGE no Brasil."
        />
        <ul className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-4">
          {globalBiomes.map((biome) => (
            <li key={biome.id} className="flex flex-col gap-2 rounded-[14px] border border-line bg-white p-[18px]">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-display text-lg font-bold">{biome.name}</h3>
                <span className="font-display text-sm font-bold text-muted">{biome.id}</span>
              </div>
              <p className="text-sm leading-relaxed text-muted">Ex.: {biome.examples}</p>
              {inBrazil.has(biome.id) && (
                <span className="self-start rounded-full bg-forest px-2.5 py-1 text-xs font-semibold text-[#f2f4ee]">
                  Presente no Brasil
                </span>
              )}
            </li>
          ))}
        </ul>
      </section>

      {/* Fontes */}
      <section id="fontes" className="scroll-mt-4 bg-sage">
        <div className="mx-auto flex max-w-[1200px] flex-col gap-7 px-4 py-18 sm:px-6">
          <SectionTitle
            title="De onde vêm os dados"
            subtitle="Duas camadas: fontes globais, que já cobrem todos os países, e fontes nacionais, que entram a cada país novo e trazem nomes locais, distribuição detalhada e listas oficiais de ameaça."
          />
          <div className="flex flex-wrap items-start gap-6">
            <div className="flex min-w-0 flex-[1_1_520px] flex-col gap-3">
              <h3 className="font-display text-xl font-bold">Globais</h3>
              <ul className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-3">
                {globalSources.map((s) => (
                  <li key={s.id} className="flex flex-col gap-1.5 rounded-xl border border-[#d3dbcd] bg-white p-4">
                    <a href={s.url} className="font-semibold text-ink hover:text-leaf hover:underline" target="_blank" rel="noreferrer">
                      {s.name}
                    </a>
                    <span className="text-sm leading-relaxed text-muted">{s.what}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex min-w-0 flex-[1_1_320px] flex-col gap-3">
              <h3 className="font-display text-xl font-bold">Nacionais</h3>
              {nationalSourcesByCountry.map(({ country, sources }) => (
                <div key={country.code} className="flex flex-col gap-2.5 rounded-xl border border-[#d3dbcd] bg-white p-[18px]">
                  <span className="flex items-center gap-2.5">
                    <CountryCode code={country.code} />
                    <span className="font-semibold">{country.name}</span>
                  </span>
                  <span className="text-sm leading-relaxed text-muted">
                    {[...sources.map((s) => s.name), country.biomeAuthority && `biomas do ${country.biomeAuthority}`]
                      .filter(Boolean)
                      .join(" · ")}
                  </span>
                </div>
              ))}
              <div className="flex flex-col gap-1.5 rounded-xl border border-dashed border-[#b7c2b2] bg-paper p-[18px]">
                <span className="font-semibold text-[#3e4d44]">Próximo país</span>
                <span className="text-sm leading-relaxed text-muted">
                  [Catálogo nacional de espécies] · [Lista vermelha nacional] · [Classificação de biomas]
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
