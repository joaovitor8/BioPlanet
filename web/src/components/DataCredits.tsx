// Crédito das fontes de dados (citação, licença e versão), exigido por licenças como a CC-BY.
// SourceCredit mostra o crédito de uma fonte; DataCredits é o bloco "Créditos dos dados" no fim da página.

import type { Source } from "@/data/types";

export function SourceCredit({ credit }: { credit: NonNullable<Source["credit"]> }) {
  return (
    <span className="flex flex-col gap-1 text-[13px] leading-relaxed text-muted">
      <span>Como citar: {credit.citation}</span>
      <span>
        Licença:{" "}
        {credit.licenseUrl ? (
          <a href={credit.licenseUrl} target="_blank" rel="noreferrer license" className="text-leaf hover:underline">
            {credit.license}
          </a>
        ) : (
          credit.license
        )}
        {credit.version && ` · versão ${credit.version}`}
      </span>
    </span>
  );
}

/** Lista só as fontes que têm crédito; sem nenhuma, não mostra nada. */
export function DataCredits({ sources }: { sources: Source[] }) {
  const comCredito = sources.filter((s) => s.credit);
  if (comCredito.length === 0) return null;

  return (
    <section className="mx-auto max-w-300 px-4 pb-14 sm:px-6">
      <div className="flex flex-col gap-3 rounded-[14px] border border-line bg-white p-5">
        <h2 className="font-display text-lg font-bold">Créditos dos dados</h2>
        <ul className="flex flex-col gap-4">
          {comCredito.map((s) => (
            <li key={s.id} className="flex flex-col gap-1">
              <a href={s.url} target="_blank" rel="noreferrer" className="font-semibold text-ink hover:text-leaf hover:underline">
                {s.name}
              </a>
              <SourceCredit credit={s.credit!} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
