// Crédito de uma foto, exigido pela licença: "© autor · licença · via fonte".
// Com links, aponta para a licença e para a foto original; sem links, serve dentro de um cartão (que já é um link).

import type { Photo } from "@/data/types";

export function PhotoCredit({ photo, links = false }: { photo: Photo; links?: boolean }) {
  const link = "underline-offset-2 hover:text-leaf hover:underline";
  return (
    <p
      className={links ? "text-[13px] leading-relaxed text-muted" : "truncate text-xs text-muted"}
      title={`© ${photo.author} · ${photo.license} · via ${photo.source}`}
    >
      © {photo.author} ·{" "}
      {links && photo.licenseUrl ? (
        <a href={photo.licenseUrl} target="_blank" rel="noreferrer license" className={link}>
          {photo.license}
        </a>
      ) : (
        photo.license
      )}{" "}
      · via{" "}
      {links ? (
        <a href={photo.sourceUrl} target="_blank" rel="noreferrer" className={link}>
          {photo.source}
        </a>
      ) : (
        photo.source
      )}
    </p>
  );
}
