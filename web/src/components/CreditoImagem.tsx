import type { Imagem } from "@/lib/types";

type Props = {
  imagem: Imagem;
  className?: string;
};

/**
 * Crédito de imagem — obrigatório, nunca opcional (guia.md §8, §9).
 *
 * Se faltar autor, licença ou URL da fonte, o componente **não renderiza**.
 * Travar isso agora, com 35 fichas, é barato; travar na fase 3, com 3 mil
 * fichas importadas, seria um mutirão.
 */
export function CreditoImagem({ imagem, className = "" }: Props) {
  if (!imagem.autor || !imagem.licenca || !imagem.fonteUrl) return null;

  return (
    <p className={`font-interface text-dado text-tinta-suave ${className}`}>
      {imagem.autor}
      {" · "}
      {imagem.licencaUrl ? (
        <a href={imagem.licencaUrl} className="link-texto" rel="license noopener noreferrer" target="_blank">
          {imagem.licenca}
        </a>
      ) : (
        imagem.licenca
      )}
      {" · "}
      <a href={imagem.fonteUrl} className="link-texto" rel="noopener noreferrer" target="_blank">
        fonte
      </a>
    </p>
  );
}
