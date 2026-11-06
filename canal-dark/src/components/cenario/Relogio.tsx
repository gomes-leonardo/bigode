import React from "react";
import { COR, FONTE } from "../../theme";
import { Circulo, Linha } from "../Rough";

// Relógio analógico. hora/minuto podem ser fracionários (animar ponteiros); segundos animam o ponteiro vermelho.
type Props = {
  id: string;
  cx: number;
  cy: number;
  d: number;
  hora: number;
  minuto: number;
  segundos: number;
};

const ponta = (
  cx: number,
  cy: number,
  ang: number,
  r: number,
): [number, number] => [
  cx + Math.sin((ang * Math.PI) / 180) * r,
  cy - Math.cos((ang * Math.PI) / 180) * r,
];

export const Relogio: React.FC<Props> = ({
  id,
  cx,
  cy,
  d,
  hora,
  minuto,
  segundos,
}) => {
  const r = d / 2;
  const angH = ((hora % 12) + minuto / 60) * 30;
  const angM = minuto * 6;
  const angS = Math.floor(segundos) * 6;
  return (
    <g>
      <Circulo
        id={`${id}-aro`}
        cx={cx}
        cy={cy}
        d={d}
        espessura={7}
        preenchimento={COR.fundo}
      />
      <Circulo
        id={`${id}-aro2`}
        cx={cx}
        cy={cy}
        d={d * 0.9}
        espessura={2.5}
        opacidade={0.5}
        tracoUnico
      />
      {Array.from({ length: 12 }, (_, i) => (
        <Linha
          key={i}
          id={`${id}-m${i}`}
          de={ponta(cx, cy, i * 30, r * 0.8)}
          ate={ponta(cx, cy, i * 30, r * (i % 3 === 0 ? 0.66 : 0.72))}
          espessura={i % 3 === 0 ? 6 : 3}
          tracoUnico
        />
      ))}
      {[12, 3, 6, 9].map((n, i) => {
        const [tx, ty] = ponta(cx, cy, i * 90, r * 0.52);
        return (
          <text
            key={n}
            x={tx}
            y={ty + d * 0.03}
            fill={COR.traco}
            fontFamily={FONTE}
            fontWeight={800}
            fontSize={d * 0.08}
            textAnchor="middle"
            opacity={0.85}
          >
            {n}
          </text>
        );
      })}
      <Linha
        id={`${id}-h`}
        de={[cx, cy]}
        ate={ponta(cx, cy, angH, r * 0.42)}
        espessura={11}
      />
      <Linha
        id={`${id}-min`}
        de={[cx, cy]}
        ate={ponta(cx, cy, angM, r * 0.66)}
        espessura={7}
      />
      <Linha
        id={`${id}-s`}
        de={ponta(cx, cy, angS + 180, r * 0.12)}
        ate={ponta(cx, cy, angS, r * 0.74)}
        espessura={3}
        cor={COR.vermelho}
        tracoUnico
      />
      <circle cx={cx} cy={cy} r={d * 0.025} fill={COR.vermelho} />
    </g>
  );
};
