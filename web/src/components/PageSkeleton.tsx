// Esqueleto mostrado enquanto o conteúdo de uma página carrega.
// Tem o mesmo formato da página real, para nada "pular" quando o conteúdo chega.

function Bar({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-current opacity-15 ${className}`} />;
}

export function PageSkeleton({ variant }: { variant: "pais" | "bioma" | "especie" }) {
  return (
    <div role="status" aria-label="Carregando">
      <span className="sr-only">Carregando…</span>

      {variant === "especie" ? (
        <div className="mx-auto flex max-w-[1200px] flex-wrap gap-10 px-4 pt-12 pb-12 text-ink sm:px-6">
          <Bar className="h-[440px] min-w-0 flex-[1_1_520px] rounded-[18px]" />
          <div className="flex min-w-0 flex-[1_1_400px] flex-col gap-4">
            <Bar className="h-6 w-32" />
            <Bar className="h-12 w-3/4" />
            <Bar className="h-6 w-1/2" />
            <Bar className="mt-4 h-24 w-full rounded-[14px]" />
            <Bar className="h-24 w-full rounded-[14px]" />
          </div>
        </div>
      ) : (
        <>
          <div className="bg-forest text-[#f2f4ee]">
            <div className="mx-auto flex max-w-[1200px] flex-col gap-5 px-4 pt-8 pb-16 sm:px-6">
              <Bar className="h-4 w-56" />
              <Bar className="mt-4 h-4 w-40" />
              <Bar className="h-14 w-72" />
              <Bar className="h-5 w-full max-w-[560px]" />
            </div>
          </div>
          <div className="mx-auto grid max-w-[1200px] grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-5 px-4 pt-16 pb-16 text-ink sm:px-6">
            {Array.from({ length: 6 }, (_, i) => (
              <Bar key={i} className="h-64 rounded-2xl" />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
