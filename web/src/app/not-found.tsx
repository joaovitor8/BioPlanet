import Link from "next/link";

export default function NotFound() {
  return (
    <section className="mx-auto flex max-w-[1200px] flex-col items-start gap-4 px-4 py-24 sm:px-6">
      <p className="font-display text-sm font-bold tracking-[0.08em] text-leaf uppercase">Erro 404</p>
      <h1 className="font-display text-4xl font-bold">Página não encontrada</h1>
      <p className="max-w-[560px] text-lg leading-relaxed text-muted">
        Essa espécie ou país ainda não está no BioPlanet. O atlas cresce um país de cada vez.
      </p>
      <Link href="/" className="rounded-[10px] bg-forest px-5 py-3 font-semibold text-[#f2f4ee] hover:bg-leaf">
        Voltar ao início
      </Link>
    </section>
  );
}
