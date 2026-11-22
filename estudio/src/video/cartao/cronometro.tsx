// Cronômetro da reta final ("O mercado abre em 60 segundos."): mostra os segundos que o roteiro anuncia
// (60, 50, 40, 30, 10, Bip) e anda entre um anúncio e outro.
import React from "react";
import { LINHA, PAPEL } from "../../estilo";
import { FONTE } from "../../fontes";
import { escalaPop } from "../graficos";
import { fracDe } from "./comum";
import { T } from "./tempo";

export const MARCOS: [number, number][] = [
  [T(227, fracDe(227, "60 segundos")), 60],
  [T(241), 50],
  [T(244), 40],
  [T(248), 30],
  [T(254), 10],
  [T(255), 0],
];
/** segundos restantes no quadro f (null antes do anúncio dos 60 segundos) */
export const segundos = (f: number): number | null => {
  if (f < MARCOS[0][0]) return null;
  for (let i = 0; i + 1 < MARCOS.length; i++) {
    const [a, va] = MARCOS[i], [b, vb] = MARCOS[i + 1];
    if (f < b) return va + (vb - va) * ((f - a) / (b - a));
  }
  return 0;
};
export const Cronometro: React.FC<{ x: number; y: number; f: number; s?: number }> = ({ x, y, f, s = 1 }) => {
  const v = segundos(f);
  if (v === null) return null;
  const n = Math.max(0, Math.ceil(v - 0.001));
  const entra = escalaPop(f, MARCOS[0][0]);
  const pulso = n <= 10 && n > 0 ? 1 + 0.06 * Math.abs(Math.sin(f / 3)) : 1;
  const r = 92;
  const ang = (v / 60) * 360;
  const fim = [Math.sin((ang * Math.PI) / 180) * (r - 18), -Math.cos((ang * Math.PI) / 180) * (r - 18)];
  const cor = n <= 10 ? "#E0826E" : "#F2D16B";
  return (
    <g transform={`translate(${x} ${y}) scale(${(s * entra * pulso).toFixed(4)})`}>
      <circle cx={6} cy={7} r={r} fill={PAPEL} />
      <circle r={r} fill="#FFFFFF" stroke={LINHA} strokeWidth={7} />
      {v > 0.01 && (
        <path d={`M 0 0 L 0 ${-(r - 18)} A ${r - 18} ${r - 18} 0 ${ang > 180 ? 1 : 0} 1 ${fim[0].toFixed(2)} ${fim[1].toFixed(2)} Z`} fill={cor} opacity={0.85} />
      )}
      <circle r={r - 34} fill="#FFFFFF" stroke={LINHA} strokeWidth={4} />
      <text x={0} y={22} textAnchor="middle" fontFamily={FONTE} fontWeight={900} fontSize={60} fill={LINHA}>{n}</text>
      <text x={0} y={r + 44} textAnchor="middle" fontFamily={FONTE} fontWeight={900} fontSize={30} fill="#FFFFFF" stroke={LINHA} strokeWidth={8} paintOrder="stroke">SEGUNDOS</text>
    </g>
  );
};
