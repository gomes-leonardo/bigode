import React from "react";
import { random } from "remotion";
import { tremor, useBoilTick } from "../../lib/boil";
import { COR, FONTE } from "../../theme";
import { P, Poligono, Trilha } from "../Rough";
import { NuvemPoeira } from "./Poeira";

type Props = {
  id: string;
  x: number; // esquerda da base
  base: number; // y do chão
  w: number;
  h: number;
  andares?: number; // linhas de andar desenhadas
  racha?: number; // 0..1 rachaduras crescendo
  desaba?: number; // 0..1 desce reto para dentro do chão
  afinamento?: number; // 0..1: topo mais estreito (contra-plongée)
  janelasAcesas?: number; // quantas janelas acesas piscando
  cor?: string;
  rotulo?: string; // ex.: "PRÉDIO 7" acima do topo, para o espectador saber qual é
};

// Rachaduras: caminhos determinísticos que nascem no meio da fachada.
const rachaduras = (
  id: string,
  x: number,
  topo: number,
  w: number,
  h: number,
): P[][] =>
  [0, 1, 2].map((k) => {
    let px = x + w * (0.3 + 0.2 * k + (random(`${id}-r${k}`) - 0.5) * 0.1);
    let py = topo + h * (0.25 + 0.18 * k);
    const pts: P[] = [[px, py]];
    for (let i = 0; i < 7; i++) {
      px += (random(`${id}-r${k}-x${i}`) - 0.5) * w * 0.22;
      py += h * 0.06 + random(`${id}-r${k}-y${i}`) * h * 0.04;
      pts.push([px, py]);
    }
    return pts;
  });

const fatia = (pts: P[], t: number): P[] => {
  const n = Math.max(2, Math.ceil(pts.length * t));
  return pts.slice(0, n);
};

export const Predio: React.FC<Props> = ({
  id,
  x,
  base,
  w,
  h,
  andares = 12,
  racha = 0,
  desaba = 0,
  afinamento = 0,
  janelasAcesas = 0,
  cor = COR.traco,
  rotulo,
}) => {
  const tick = useBoilTick();
  const queda = desaba * h * 1.02;
  const recuo = (w * afinamento) / 2;
  const corte = `corte-${id}`;
  return (
    <g>
      <defs>
        <clipPath id={corte}>
          <rect x={x - 400} y={-4000} width={w + 800} height={base + 4000} />
        </clipPath>
      </defs>
      {/* o recorte fica fora do translate: o chão parado "engole" o prédio que desce */}
      <g clipPath={`url(#${corte})`}>
        <g transform={`translate(0 ${queda})`}>
          <Poligono
            id={`${id}-casca`}
            pontos={[
              [x, base],
              [x + recuo, base - h],
              [x + w - recuo, base - h],
              [x + w, base],
            ]}
            cor={cor}
            preenchimento={COR.fundo}
          />
          {Array.from({ length: andares }, (_, i) => {
            const y = base - (h * (i + 1)) / (andares + 1);
            const r = recuo * ((base - y) / h);
            const [dx, dy] = tremor(tick, `${id}-and${i}`, 1.2);
            return (
              <line
                key={i}
                x1={x + r + 6}
                x2={x + w - r - 6}
                y1={y + dy}
                y2={y + dy + dx * 0.3}
                stroke={cor}
                strokeWidth={2}
                opacity={0.35}
              />
            );
          })}
          {Array.from({ length: janelasAcesas }, (_, i) => {
            const fy = Math.floor(random(`${id}-jy${i}`) * andares);
            const y = base - (h * (fy + 1)) / (andares + 1) - 14;
            const r = recuo * ((base - y) / h);
            const jx = x + r + 12 + random(`${id}-jx${i}`) * (w - 2 * r - 40);
            const acesa =
              random(`${id}-pisca-${i}-${Math.floor(tick / 4)}`) > 0.25;
            return (
              <rect
                key={i}
                x={jx}
                y={y}
                width={16}
                height={11}
                fill={cor}
                opacity={acesa ? 0.55 : 0.08}
              />
            );
          })}
          {rotulo && (
            <text
              x={x + w / 2}
              y={base - h - 34}
              fill={cor}
              fontFamily={FONTE}
              fontWeight={900}
              fontSize={46}
              letterSpacing={4}
              textAnchor="middle"
            >
              {rotulo}
            </text>
          )}
          {racha > 0 &&
            rachaduras(id, x, base - h, w, h).map((pts, k) => (
              <Trilha
                key={k}
                id={`${id}-racha${k}`}
                pontos={fatia(pts, Math.min(1, racha * 1.4 - k * 0.2))}
                cor={cor}
                espessura={3.5}
                tracoUnico
              />
            ))}
        </g>
      </g>
      {desaba > 0.02 && (
        <NuvemPoeira
          id={`${id}-nuvem`}
          cx={x + w / 2}
          base={base}
          largura={w * (1.2 + desaba * 1.6)}
          progresso={desaba}
        />
      )}
    </g>
  );
};
