// Nomes em português das categorias de risco (ex.: VU = Vulnerável)
// e quais delas contam como ameaçadas.
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

export const threatenedCodes: StatusCode[] = ["CR", "EN", "VU"];
