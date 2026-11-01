// Rodapé que aparece em todas as páginas.

export function Footer() {
  return (
    <footer className="bg-forest text-mist">
      <div className="mx-auto flex max-w-300 flex-wrap justify-between gap-4 px-4 py-10 text-sm leading-relaxed sm:px-6">
        <p className="font-display text-lg font-bold text-[#f2f4ee]">BioPlanet</p>
        <p className="max-w-155">
          Projeto de estudo. Fotos e dados pertencem aos autores e instituições citados em cada página.
        </p>
      </div>
    </footer>
  );
}
