// Peças pequenas usadas em várias páginas: trilha de navegação, títulos, etiquetas,
// selos de status, cartões de número, formulário de busca e botões de filtro.

import Link from "next/link";
import type { Kingdom, StatusCode } from "@/data/types";
import { statusLabels } from "@/data/status";

export function Placeholder({
  label,
  className = "",
  dark = false,
}: {
  label?: string;
  className?: string;
  dark?: boolean;
}) {
  return (
    <div
      className={`flex items-end p-4 ${dark ? "placeholder-dark border border-[#2b4d3c]" : "placeholder-light"} ${className}`}
    >
      {label && (
        <span
          className={`rounded-md px-2.5 py-1.5 text-[13px] ${dark ? "bg-paper/90 text-forest" : "bg-forest/90 text-[#f2f4ee]"}`}
        >
          {label}
        </span>
      )}
    </div>
  );
}

export function Breadcrumbs({
  items,
  dark = false,
}: {
  items: { label: string; href?: string }[];
  dark?: boolean;
}) {
  return (
    <nav aria-label="Trilha" className={`text-sm ${dark ? "text-mist" : "text-muted"}`}>
      <ol className="flex flex-wrap gap-2">
        {items.map((item, i) => (
          <li key={item.label} className="flex gap-2">
            {i > 0 && <span aria-hidden="true">/</span>}
            {item.href ? (
              <Link href={item.href} className={`underline-offset-2 hover:underline ${dark ? "text-mist" : "text-leaf"}`}>
                {item.label}
              </Link>
            ) : (
              <span
                aria-current={i === items.length - 1 ? "page" : undefined}
                className={dark ? "text-[#f2f4ee]" : "text-ink"}
              >
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="text-[13px] font-semibold tracking-[0.08em] text-accent uppercase">{children}</p>;
}

export function SectionTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div>
      <h2 className="font-display text-3xl font-bold sm:text-4xl">{title}</h2>
      {subtitle && <p className="mt-2 max-w-180 leading-relaxed text-muted">{subtitle}</p>}
    </div>
  );
}

export function StatCard({ value, label, source }: { value?: string | number; label: string; source: string }) {
  // Números saem no formato brasileiro (1.749); sem valor, o espaço reservado [N].
  const texto = typeof value === "number" ? value.toLocaleString("pt-BR") : (value ?? "[N]");
  return (
    <div className="flex flex-col gap-1 rounded-xl bg-forest-2 p-4.5">
      <span className="font-display text-3xl font-bold">{texto}</span>
      <span className="text-sm text-mist">{label}</span>
      <span className="text-xs text-[#9fb0a3]">{source}</span>
    </div>
  );
}

export function KingdomTag({ kingdom }: { kingdom: Kingdom }) {
  return kingdom === "fauna" ? (
    <span className="rounded-full bg-forest px-2.5 py-1 text-xs font-semibold text-[#f2f4ee]">Fauna</span>
  ) : (
    <span className="rounded-full border border-leaf bg-white px-2.5 py-1 text-xs font-semibold text-leaf">
      Flora
    </span>
  );
}

export function CountryCode({ code, active = true }: { code: string; active?: boolean }) {
  return (
    <span
      className={`flex h-8 w-8 flex-none items-center justify-center rounded-lg text-[13px] font-bold ${active ? "bg-forest text-[#f2f4ee]" : "bg-[#dce3d7] text-[#3e4d44]"}`}
    >
      {code}
    </span>
  );
}

const statusColors: Record<StatusCode, string> = {
  EX: "bg-black",
  EW: "bg-[#3d1f4a]",
  CR: "bg-[#b42318]",
  EN: "bg-[#c2410c]",
  VU: "bg-[#a15c07]",
  NT: "bg-[#4d6b16]",
  LC: "bg-[#2f6b3f]",
  DD: "bg-[#5f6b66]",
};

export function StatusBadge({ code }: { code: StatusCode }) {
  return (
    <span
      title={statusLabels[code]}
      className={`flex h-13 w-13 flex-none items-center justify-center rounded-xl font-display text-[19px] font-bold text-white ${statusColors[code]}`}
    >
      {code}
    </span>
  );
}

export function SearchForm({
  id,
  label,
  placeholder,
  defaultValue,
}: {
  id: string;
  label: string;
  placeholder: string;
  defaultValue?: string;
}) {
  return (
    <form action="/busca" className="flex max-w-140 flex-col gap-2">
      <label htmlFor={id} className="text-sm text-mist">
        {label}
      </label>
      <div className="flex flex-wrap gap-2">
        <input
          id={id}
          name="q"
          type="search"
          defaultValue={defaultValue}
          required
          placeholder={placeholder}
          className="h-13 min-w-0 flex-[1_1_240px] rounded-[10px] border border-forest-line bg-forest-2 px-4 text-base text-[#f2f4ee] placeholder:text-[#9fb0a3]"
        />
        <button
          type="submit"
          className="h-13 cursor-pointer rounded-[10px] bg-accent px-6 text-base font-semibold text-forest hover:brightness-95"
        >
          Buscar
        </button>
      </div>
    </form>
  );
}

export function FilterChip({
  label,
  pressed,
  onClick,
}: {
  label: string;
  pressed: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className={`min-h-11 cursor-pointer rounded-full border px-4.5 text-[15px] font-medium ${
        pressed ? "border-forest bg-forest text-[#f2f4ee]" : "border-line-strong bg-white text-ink hover:border-leaf"
      }`}
    >
      {label}
    </button>
  );
}

export const cardHover = "transition hover:-translate-y-0.5 hover:shadow-[0_8px_28px_rgba(14,42,32,0.14)]";
