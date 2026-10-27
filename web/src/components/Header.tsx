import Link from "next/link";
import { LeafIcon } from "./Logo";

const nav = [
  { href: "/#mapa", label: "Mapa" },
  { href: "/#paises", label: "Países" },
  { href: "/#biomas", label: "Biomas" },
  { href: "/#fontes", label: "Fontes" },
];

export function Header() {
  return (
    <header className="border-b border-[#234536] bg-forest text-[#f2f4ee]">
      <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Link
          href="/"
          className="flex min-h-11 items-center gap-2.5 font-display text-[22px] font-bold text-[#f2f4ee]"
        >
          <LeafIcon className="h-7 w-7 text-accent" />
          BioPlanet
        </Link>
        <div className="flex flex-wrap items-center gap-2">
          <nav aria-label="Principal" className="flex flex-wrap">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-md px-3 py-3 text-[15px] text-[#f2f4ee] hover:bg-forest-2"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <label htmlFor="idioma" className="sr-only">
            Idioma
          </label>
          {/* Só português por enquanto. Os outros idiomas entram quando o site tiver tradução. */}
          <select
            id="idioma"
            defaultValue="pt"
            className="h-10 rounded-lg border border-forest-line bg-forest-2 px-2.5 text-sm text-[#f2f4ee]"
          >
            <option value="pt">PT</option>
            <option value="en" disabled>
              EN (em breve)
            </option>
            <option value="es" disabled>
              ES (em breve)
            </option>
          </select>
        </div>
      </div>
    </header>
  );
}
