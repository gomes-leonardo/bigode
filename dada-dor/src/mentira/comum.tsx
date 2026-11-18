// Utilidades dos planos do vídeo da mentira.
import React from "react";
import { AbsoluteFill } from "remotion";
import type { BalaoT } from "../teo/kit";
import { E, pts } from "../teo/kit";
import type { NomeElenco } from "../teo/elenco";
import { LINHA, type PoseTeo } from "../teo/tira";
import { repouso, type Caido, type Emissor, type Emissores } from "./balao";
import timeline from "./timeline.json";

export const TL = timeline as unknown as { duracao: number; planos: { id: string; inicio: number; duracao: number; baloes: BalaoT[]; falas: { inicio: number; duracao: number }[] }[] };
export const planoDe = (id: string) => TL.planos.find((p) => p.id === id)!;

/** emissor a partir de um personagem: a boca da pose naquele instante */
export const daBoca = (quem: NomeElenco, pose: (t: number) => PoseTeo, lado: 1 | -1, chao: number, extra: Partial<Emissor> = {}) => (t: number): Emissor => ({
  boca: pts(quem, pose(t)).boca,
  lado,
  chao,
  esc: Math.max(0.85, Math.min(1.15, E(quem))),
  ...extra,
});
/** monta um Emissores a partir de um mapa rótulo -> emissor */
export const porRotulo = (mapa: Record<string, (t: number) => Emissor | null>): Emissores => (b, t) => (mapa[b.rotulo ?? ""] ? mapa[b.rotulo ?? ""](t) : null);
/** balões de mentira que ficaram no chão num plano anterior da mesma cena */
export const caidosDe = (id: string, emissor: Emissores): Caido[] => repouso(planoDe(id).baloes, emissor);

/** gotas de suor em volta de uma cabeça */
export const Suor: React.FC<{ x: number; y: number; t: number; r?: number; lado?: number }> = ({ x, y, t, r = 80, lado = 1 }) => (
  <g>
    {[0, 1].map((i) => {
      const f = (t * 0.9 + i * 0.5) % 1;
      const gx = x + lado * (r * 0.9 + i * 14), gy = y - r * 0.4 + f * 60;
      return <path key={i} d={`M ${gx} ${gy} q -9 14 0 20 q 9 -6 0 -20 Z`} fill="#7FC8F8" stroke={LINHA} strokeWidth={3} opacity={1 - f * 0.6} />;
    })}
  </g>
);
/** flash branco curto num corte (flash-forward) */
export const Flash: React.FC<{ t: number; em: number[] }> = ({ t, em }) => {
  const d = Math.min(...em.map((e) => (t >= e ? t - e : 99)));
  if (d > 0.18) return null;
  return <rect x={-2000} y={-2000} width={6000} height={6000} fill="#FBFBF7" opacity={1 - d / 0.18} />;
};
/** filtro de lembrança/futuro: cena dessaturada com vinheta */
export const Tinta: React.FC<{ cor?: string; forca?: number }> = ({ cor = "#C9B48A", forca = 0.35 }) => (
  <rect x={-2000} y={-2000} width={6000} height={6000} fill={cor} opacity={forca} style={{ mixBlendMode: "color" }} />
);

/** camada fixa na tela (fora da câmera): contagem, contadores */
export const Tela: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill style={{ pointerEvents: "none" }}>
    <svg width={1920} height={1080} viewBox="0 0 1920 1080">{children}</svg>
  </AbsoluteFill>
);
