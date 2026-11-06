import React from "react";
import { random } from "remotion";
import { COR } from "../../theme";
import { Circulo, Linha } from "../Rough";
import { JatoPoeira } from "./Poeira";
import { Predio } from "./Predio";

type Jato = { torre: 0 | 1; altura: number; lado: 1 | -1; inicio: number };
type Props = {
  id: string;
  x: number; // esquerda da torre 1
  base: number;
  w?: number;
  h?: number;
  vao?: number;
  f: number; // quadro atual (para jatos e fumaça)
  jatos?: Jato[]; // altura 0..1 a partir da base
  fumacaNoTopo?: boolean;
};

export const TorresGemeas: React.FC<Props> = ({
  id,
  x,
  base,
  w = 150,
  h = 1050,
  vao = 60,
  f,
  jatos = [],
  fumacaNoTopo = true,
}) => {
  const xs = [x, x + w + vao];
  const alturas = [h, h * 0.985];
  return (
    <g>
      {xs.map((tx, i) => (
        <Predio
          key={i}
          id={`${id}-t${i}`}
          x={tx}
          base={base}
          w={w}
          h={alturas[i]}
          andares={34}
          janelasAcesas={5}
        />
      ))}
      <Linha
        id={`${id}-antena`}
        de={[xs[0] + w / 2, base - alturas[0]]}
        ate={[xs[0] + w / 2, base - alturas[0] - 120]}
        espessura={4}
      />
      {fumacaNoTopo &&
        xs.map((tx, i) =>
          Array.from({ length: 5 }, (_, k) => {
            const vida = (f * 1.2 + k * 40 + i * 17) % 200;
            return (
              <Circulo
                key={`${i}-${k}`}
                id={`${id}-fum${i}-${k}`}
                cx={
                  tx + w * 0.5 + vida * 0.9 + Math.sin((f + k * 30) * 0.05) * 14
                }
                cy={base - alturas[i] * 0.86 - vida * 1.1}
                d={40 + vida * 0.7}
                cor={COR.tracoApagado}
                espessura={3}
                opacidade={0.75 * (1 - vida / 200)}
                tracoUnico
              />
            );
          }),
        )}
      {jatos.map((j, k) => {
        const tx = xs[j.torre] + (j.lado > 0 ? w : 0);
        const y =
          base -
          alturas[j.torre] * j.altura +
          (random(`${id}-jy${k}`) - 0.5) * 6;
        return (
          <JatoPoeira
            key={k}
            id={`${id}-jato${k}`}
            x={tx}
            y={y}
            lado={j.lado}
            idade={f - j.inicio}
          />
        );
      })}
    </g>
  );
};
