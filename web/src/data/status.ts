import type { StatusCode } from "./types";

export const statusLabels: Record<StatusCode, string> = {
  EX: "Extinta",
  EW: "Extinta na natureza",
  CR: "Criticamente em perigo",
  EN: "Em perigo",
  VU: "Vulnerável",
  NT: "Quase ameaçada",
  LC: "Menos preocupante",
  DD: "Dados insuficientes",
};

/** Categorias consideradas "ameaçadas" nas listas oficiais. */
export const threatenedCodes: StatusCode[] = ["CR", "EN", "VU"];
