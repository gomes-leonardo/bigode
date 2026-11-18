import React from "react";
import { Easing, interpolate, useCurrentFrame } from "remotion";
import { COR } from "../theme";

export type ArcMood = "neutral" | "curious" | "worried" | "calm" | "none";

// Cada arco = [x0, y0, cx, cy, x1, y1] (início, controle da curva, fim), relativo ao centro do arco.
// Arco esquerdo e direito; o direito é o espelho do esquerdo, salvo onde o preset diz o contrário.
type Arco = [number, number, number, number, number, number];
type Preset = { esq: Arco; dir: Arco; opacidade: number };

const PRESETS: Record<ArcMood, Preset> = {
  // arcos retos, levemente inclinados para fora
  neutral: { esq: [-18, 2, 0, -4, 18, -2], dir: [-18, -2, 0, -4, 18, 2], opacidade: 1 },
  // arco esquerdo sobe 8px, direito fica
  curious: { esq: [-18, -6, 0, -14, 18, -10], dir: [-18, -2, 0, -4, 18, 2], opacidade: 1 },
  // as duas pontas internas sobem, curvatura invertida
  worried: { esq: [-18, 4, 0, 8, 18, -8], dir: [-18, -8, 0, 8, 18, 4], opacidade: 1 },
  // arcos mais baixos e mais curtos
  calm: { esq: [-13, 6, 0, 0, 13, 6], dir: [-13, 6, 0, 0, 13, 6], opacidade: 1 },
  // de perfil e figurantes
  none: { esq: [-18, 2, 0, -4, 18, -2], dir: [-18, -2, 0, -4, 18, 2], opacidade: 0 },
};

const lerpArco = (a: Arco, b: Arco, t: number) => a.map((v, i) => v + (b[i] - v) * t) as Arco;
const caminho = ([x0, y0, cx, cy, x1, y1]: Arco, ox: number) => `M ${x0 + ox} ${y0} Q ${cx + ox} ${cy} ${x1 + ox} ${y1}`;

type Props = {
  mood: ArcMood;
  espessura?: number;
  de?: ArcMood; // mood anterior: a transição interpola os pontos de controle, nunca troca o path de uma vez
  trocaEm?: number; // quadro (relativo ao componente) em que a transição começa
  afastamento?: number; // distância entre os arcos
};

export const TRANSICAO = 10; // quadros

// Transição entre moods em 10 quadros.
export const Arcs: React.FC<Props> = ({ mood, de, trocaEm = 0, afastamento = 34, espessura = 7 }) => {
  const f = useCurrentFrame();
  const origem = PRESETS[de ?? mood];
  const alvo = PRESETS[mood];
  // interpolate sobre os pontos de controle em 10 quadros, com ease in/out (nunca troca o path de uma vez)
  const t = de ? interpolate(f, [trocaEm, trocaEm + TRANSICAO], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.cubic) }) : 1;
  const esq = lerpArco(origem.esq, alvo.esq, t);
  const dir = lerpArco(origem.dir, alvo.dir, t);
  const opacidade = interpolate(t, [0, 1], [origem.opacidade, alvo.opacidade]);
  return (
    <g opacity={opacidade} style={{ filter: `drop-shadow(0 0 6px ${COR.menta})` }}>
      <path d={caminho(esq, -afastamento)} stroke={COR.menta} strokeWidth={espessura} strokeLinecap="round" fill="none" />
      <path d={caminho(dir, afastamento)} stroke={COR.menta} strokeWidth={espessura} strokeLinecap="round" fill="none" />
    </g>
  );
};
