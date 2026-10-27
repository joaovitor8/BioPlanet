"use client";

import { useState } from "react";
import { statusLabels } from "@/data/status";
import type { StatusCode } from "@/data/types";
import { StatusBadge } from "./ui";

export interface NationalStatusOption {
  code: string;
  name: string;
  /** Status na lista nacional, se o país estiver integrado e a espécie avaliada. */
  status?: StatusCode;
  /** O país já tem a lista nacional integrada no BioPlanet? */
  integrated: boolean;
  sourceName?: string;
}

/** Status de conservação nacional com seletor de país (ficha da espécie). */
export function NationalStatus({ options }: { options: NationalStatusOption[] }) {
  const [code, setCode] = useState(options[0]?.code ?? "");
  const current = options.find((o) => o.code === code);

  return (
    <div className="flex flex-col gap-3.5 rounded-[14px] border border-line bg-white p-4">
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <label htmlFor="pais-status" className="text-xs tracking-[0.06em] text-muted uppercase">
          Lista nacional de
        </label>
        <select
          id="pais-status"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="h-10 rounded-lg border border-line-strong bg-white px-2.5 text-[15px]"
        >
          {options.map((o) => (
            <option key={o.code} value={o.code}>
              {o.name}
            </option>
          ))}
        </select>
      </div>
      {current?.status ? (
        <div className="flex items-center gap-4">
          <StatusBadge code={current.status} />
          <div className="flex min-w-0 flex-col gap-0.5">
            <span className="text-[17px] font-semibold">{statusLabels[current.status]}</span>
            {current.sourceName && <span className="text-[13px] text-muted">Fonte: {current.sourceName}</span>}
          </div>
        </div>
      ) : (
        <p className="rounded-[10px] border border-dashed border-[#b7c2b2] p-3 text-[15px] leading-normal text-muted">
          {current?.integrated
            ? "Status nacional ainda não importado para esta espécie."
            : "Lista nacional deste país ainda não integrada. Até lá, vale o status global."}
        </p>
      )}
    </div>
  );
}
