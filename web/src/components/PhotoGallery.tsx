// Galeria da ficha da espécie: foto grande, miniaturas que trocam a foto grande e o crédito embaixo.
// Sem fotos, mostra os espaços reservados listrados.

"use client";

import Image from "next/image";
import { useState } from "react";
import type { Photo } from "@/data/types";
import { PhotoCredit } from "./PhotoCredit";
import { Placeholder } from "./ui";

export function PhotoGallery({ photos, name }: { photos: Photo[]; name: string }) {
  const [atual, setAtual] = useState(0);

  if (photos.length === 0) {
    return (
      <div className="flex min-w-0 flex-[1_1_520px] flex-col gap-3">
        <Placeholder className="h-110 rounded-[18px]" label="Ainda sem foto com licença aberta" />
      </div>
    );
  }

  const foto = photos[atual];
  return (
    <div className="flex min-w-0 flex-[1_1_520px] flex-col gap-3">
      <div className="relative h-110 overflow-hidden rounded-[18px] bg-sage">
        <Image
          key={foto.url}
          src={foto.url}
          alt={`Foto ${atual + 1} de ${photos.length}: ${name}`}
          fill
          sizes="(max-width: 1100px) 100vw, 640px"
          className="object-cover"
          loading="eager"
        />
      </div>
      <PhotoCredit photo={foto} links />
      {photos.length > 1 && (
        <div className="grid grid-cols-4 gap-3">
          {photos.map((p, i) => (
            <button
              key={p.url}
              type="button"
              aria-label={`Mostrar foto ${i + 1} de ${photos.length}`}
              aria-pressed={i === atual}
              onClick={() => setAtual(i)}
              className={`relative h-21 cursor-pointer overflow-hidden rounded-[10px] bg-sage ${i === atual ? "border-[3px] border-forest" : "border border-line-strong"}`}
            >
              <Image src={p.thumbnailUrl} alt="" fill sizes="160px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
