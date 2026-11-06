import React from "react";
import { random, useCurrentFrame } from "remotion";
import { COR, H, W } from "../../theme";
import { Circulo } from "../Rough";

// Partículas de poeira flutuando: garante movimento em qualquer cena.
export const PoeiraAmbiente: React.FC<{
  quantidade?: number;
  opacidade?: number;
  seed?: string;
  area?: [number, number, number, number];
}> = ({
  quantidade = 40,
  opacidade = 0.35,
  seed = "amb",
  area = [0, 0, W, H],
}) => {
  const f = useCurrentFrame();
  const [ax, ay, aw, ah] = area;
  return (
    <g>
      {Array.from({ length: quantidade }, (_, i) => {
        const vel = 0.25 + random(`${seed}-v${i}`) * 0.6;
        const x =
          ax +
          ((random(`${seed}-x${i}`) * aw +
            Math.sin(f * 0.02 + i) * 30 +
            f * vel * 0.4) %
            aw);
        const y =
          ay + ((random(`${seed}-y${i}`) * ah - f * vel + ah * 10) % ah);
        const r = 1.2 + random(`${seed}-r${i}`) * 2.4;
        const pisca = 0.5 + 0.5 * Math.sin(f * 0.1 + i * 1.7);
        return (
          <circle
            key={i}
            cx={x}
            cy={y}
            r={r}
            fill={COR.traco}
            opacity={opacidade * pisca}
          />
        );
      })}
    </g>
  );
};

// Nuvem de poeira na base de um prédio que desaba (círculos rough crescendo e subindo).
export const NuvemPoeira: React.FC<{
  id: string;
  cx: number;
  base: number;
  largura: number;
  progresso: number;
}> = ({ id, cx, base, largura, progresso }) => (
  <g>
    {Array.from({ length: 11 }, (_, i) => {
      const lado = (i / 10 - 0.5) * largura;
      const sobe = progresso * (60 + random(`${id}-s${i}`) * 220);
      const d = (50 + random(`${id}-d${i}`) * 90) * (0.4 + progresso);
      return (
        <Circulo
          key={i}
          id={`${id}-${i}`}
          cx={cx + lado}
          cy={base - 20 - sobe}
          d={d}
          cor={COR.traco}
          espessura={3}
          preenchimento={COR.fundo}
          opacidade={Math.min(1, progresso * 3) * 0.9}
        />
      );
    })}
  </g>
);

// Jato de poeira lateral saindo de um andar (puffs que se afastam e somem).
export const JatoPoeira: React.FC<{
  id: string;
  x: number;
  y: number;
  lado: 1 | -1;
  idade: number;
}> = ({ id, x, y, lado, idade }) => {
  if (idade < 0) return null;
  const t = Math.min(1, idade / 26);
  return (
    <g opacity={1 - Math.max(0, (idade - 30) / 30)}>
      {[0, 1, 2, 3].map((k) => {
        const dist = t * (40 + k * 34) * lado;
        const d = (16 + k * 12) * (0.4 + t);
        return (
          <Circulo
            key={k}
            id={`${id}-p${k}`}
            cx={x + dist}
            cy={y - k * 6 * t}
            d={d}
            cor={COR.traco}
            espessura={3}
            preenchimento={COR.fundo}
            tracoUnico
          />
        );
      })}
    </g>
  );
};
