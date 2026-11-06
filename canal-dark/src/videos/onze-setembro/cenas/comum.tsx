import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  random,
  useCurrentFrame,
} from "remotion";
import { Linha } from "../../../components/Rough";
import { na, type Bloco } from "../../../lib/tempo";
import { COR, H, W } from "../../../theme";
import { ROTEIRO } from "../roteiro";

export type PropsCena = { bloco: Bloco };

// Tela inteira em SVG (todas as cenas desenham em 1080x1920).
export const Palco: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <AbsoluteFill style={{ background: COR.fundo }}>
    <svg
      width={W}
      height={H}
      viewBox={`0 0 ${W} ${H}`}
      style={{ position: "absolute", overflow: "visible" }}
    >
      {children}
    </svg>
  </AbsoluteFill>
);

export const Chao: React.FC<{ y: number; id?: string; opacidade?: number }> = ({
  y,
  id = "chao",
  opacidade = 0.7,
}) => (
  <Linha
    id={id}
    de={[-60, y]}
    ate={[W + 60, y]}
    espessura={4}
    opacidade={opacidade}
  />
);

export const Estrelas: React.FC<{
  quantidade?: number;
  ateY?: number;
  seed?: string;
}> = ({ quantidade = 45, ateY = 1100, seed = "est" }) => {
  const f = useCurrentFrame();
  return (
    <g>
      {Array.from({ length: quantidade }, (_, i) => (
        <circle
          key={i}
          cx={random(`${seed}-x${i}`) * W}
          cy={random(`${seed}-y${i}`) * ateY}
          r={1 + random(`${seed}-r${i}`) * 2}
          fill={COR.traco}
          opacity={0.15 + 0.35 * (0.5 + 0.5 * Math.sin(f * 0.07 + i * 2.3))}
        />
      ))}
    </g>
  );
};

// 0..1 entre dois quadros, com easing suave.
export const rampa = (f: number, a: number, b: number) =>
  interpolate(f, [a, b], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.quad),
  });

// Quadros (relativos ao bloco) dos zoom-punches definidos no roteiro.
export const punchesDoBloco = (b: Bloco) =>
  (ROTEIRO.find((r) => r.bloco === b.id)?.punch ?? []).map((p) => na(b, p));
