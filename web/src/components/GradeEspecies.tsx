import { CardEspecie } from "@/components/CardEspecie";
import type { Especie } from "@/lib/types";

type Props = {
  especies: Especie[];
  /**
   * Título da região. Os cards usam `<h3>`, então precisa existir um `<h2>`
   * entre eles e o `<h1>` da página — hierarquia sem pulos (guia.md §10).
   */
  titulo?: string;
  /** Por padrão o título é só para leitor de tela; a grade já se explica sozinha. */
  tituloVisivel?: boolean;
};

export function GradeEspecies({ especies, titulo = "Espécies", tituloVisivel = false }: Props) {
  return (
    <section aria-label={tituloVisivel ? undefined : titulo}>
      <h2 className={tituloVisivel ? "font-leitura text-subtitulo text-tinta" : "sr-only"}>
        {titulo}
      </h2>
      <ul className={`grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 ${tituloVisivel ? "mt-3" : ""}`}>
        {especies.map((e, i) => (
          <li key={e.slug} className="flex">
            <CardEspecie especie={e} prioritaria={i < 3} />
          </li>
        ))}
      </ul>
    </section>
  );
}
