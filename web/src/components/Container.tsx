type Props = {
  children: React.ReactNode;
  className?: string;
};

/** Medida máxima de 1160px (guia.md §5). Nada centralizado além do contêiner. */
export function Container({ children, className = "" }: Props) {
  return <div className={`mx-auto w-full max-w-medida px-4 sm:px-6 ${className}`}>{children}</div>;
}
