// Fundo liso (gráficos e explicações): parede de uma cor, chão um pouco mais escuro, luz suave, mesma vinheta e
// granulado. Âncora de chão igual aos outros cenários, para o personagem nunca flutuar.
import React from "react";
import { LINHA, escura } from "../../estilo";
import { Line, Rect } from "../../components/prim";
import type { SetJson } from "../ancoras";
import type { CenarioDef } from "../Cena";
import { MARGEM } from "../pecas";

export const lisoSet = (escala = 1.35): SetJson => ({
  id: "liso", nome: "Fundo liso", escala,
  luz: { pontos: [[-300, -300], [800, -300], [1500, 1400], [300, 1400]], cor: "#FFFFFF", opacidade: 0.08 },
  ancoras: { chao: { tipo: "chao", y: 962, yFundo: 920, x0: 60, x1: 1860 } },
});

export const liso = (cor: string, escala = 1.35): CenarioDef => {
  const Fundo: React.FC<{ t: number }> = () => (
    <g>
      <Rect x={-MARGEM} y={-MARGEM} width={1920 + 2 * MARGEM} height={900 + MARGEM} fill={cor} semSombra />
      {Array.from({ length: 14 }, (_, i) => (
        <circle key={i} cx={(i * 337) % 2100 - 90} cy={(i * 211) % 760 + 40} r={40 + ((i * 53) % 70)} fill="#FFFFFF" opacity={0.06} />
      ))}
    </g>
  );
  const Meio: React.FC<{ t: number }> = () => (
    <g>
      <Rect x={-MARGEM} y={900} width={1920 + 2 * MARGEM} height={180 + MARGEM} fill={escura(cor, 0.9)} semSombra />
      <Line x1={-MARGEM} y1={900} x2={1920 + MARGEM} y2={900} stroke={LINHA} strokeWidth={5} semSombra />
    </g>
  );
  const Frente: React.FC<{ t: number }> = () => null;
  return { set: lisoSet(escala), Fundo, Meio, Frente };
};
