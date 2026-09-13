import { buscarStatus } from "@/lib/data/status";
import type { StatusId } from "@/lib/types";

type Props = {
  status: StatusId;
  /** `sigla` é o suficiente onde a régua já explica; `completa` leva o nome. */
  formato?: "sigla" | "completa";
};

/**
 * Tarja de status. Cor **e** texto, sempre — cor nunca é o único portador da
 * informação (guia.md §3, §10). Cada par cor/corTexto da tabela foi verificado
 * em AA; o mínimo é 4.73:1, em EN.
 *
 * A borda é a própria cor da categoria escurecida um tanto. Serve às tarjas
 * claras — DD e NE somem contra o papel sem ela — e não altera o preenchimento,
 * que é o que carrega o reconhecimento da escala.
 */
export function TarjaStatus({ status, formato = "sigla" }: Props) {
  const s = buscarStatus(status);
  if (!s) return null;

  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-controle border px-2 py-[3px] font-interface text-dado font-bold"
      style={{
        backgroundColor: s.cor,
        color: s.corTexto,
        borderColor: `color-mix(in srgb, ${s.cor} 78%, var(--color-tinta))`,
      }}
      title={`${s.sigla} — ${s.nome}`}
    >
      <span>{s.sigla}</span>
      {formato === "completa" && <span className="font-normal">{s.nome}</span>}
      {formato === "sigla" && <span className="sr-only">— {s.nome}</span>}
    </span>
  );
}
