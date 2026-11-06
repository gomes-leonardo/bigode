import React from "react";
import { COR, FONTE } from "../../theme";
import { Linha, P, Trilha } from "../Rough";

// Gráfico de ações despencando. progresso 0..1 desenha a linha; a queda forte fica no último terço.
const SERIE = [
  0.62, 0.66, 0.6, 0.68, 0.64, 0.7, 0.66, 0.69, 0.63, 0.55, 0.38, 0.22, 0.12,
  0.06,
];

export const GraficoQueda: React.FC<{
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  progresso: number;
  rotulo?: string;
}> = ({ id, x, y, w, h, progresso, rotulo }) => {
  const pts: P[] = SERIE.map((v, i) => [
    x + (w * i) / (SERIE.length - 1),
    y + h - v * h,
  ]);
  const n = Math.max(
    2,
    Math.ceil(pts.length * Math.max(0, Math.min(1, progresso))),
  );
  const vis = pts.slice(0, n);
  const ponta = vis[vis.length - 1];
  return (
    <g>
      <Linha
        id={`${id}-eixoY`}
        de={[x, y - 20]}
        ate={[x, y + h]}
        espessura={5}
      />
      <Linha
        id={`${id}-eixoX`}
        de={[x, y + h]}
        ate={[x + w + 20, y + h]}
        espessura={5}
      />
      {[0.25, 0.5, 0.75].map((g, i) => (
        <line
          key={i}
          x1={x + 8}
          x2={x + w}
          y1={y + h * g}
          y2={y + h * g}
          stroke={COR.traco}
          strokeWidth={2}
          strokeDasharray="10 14"
          opacity={0.25}
        />
      ))}
      <Trilha
        id={`${id}-serie`}
        pontos={vis}
        cor={COR.vermelho}
        espessura={9}
      />
      {progresso > 0.8 && (
        <g opacity={Math.min(1, (progresso - 0.8) * 5)}>
          <Linha
            id={`${id}-seta1`}
            de={[ponta[0] - 34, ponta[1] - 30]}
            ate={ponta}
            cor={COR.vermelho}
            espessura={9}
            tracoUnico
          />
          <Linha
            id={`${id}-seta2`}
            de={[ponta[0] + 10, ponta[1] - 42]}
            ate={ponta}
            cor={COR.vermelho}
            espessura={9}
            tracoUnico
          />
        </g>
      )}
      {rotulo && (
        <text
          x={x + 16}
          y={y - 34}
          fill={COR.traco}
          fontFamily={FONTE}
          fontWeight={800}
          fontSize={40}
          letterSpacing={3}
          opacity={1}
        >
          {rotulo}
        </text>
      )}
    </g>
  );
};
