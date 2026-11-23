// Cabelos e acessórios de rosto, no espaço da cabeça (centro 0,0; cabeça = elipse 84 x 82).
// `k` é a escala do grupo da cabeça (0.92 x headScale): os traços são divididos por ela para ficarem iguais ao corpo.
// Duas camadas: ATRÁS (rabo de cavalo, coque, cabelo comprido; vai atrás do tronco) e FRENTE (por cima da cabeça,
// por baixo do rosto). Ninguém tem orelha.
import React from "react";
import { CONTORNO, INTERNA, LINHA, escura } from "../estilo";
import { Circle, Line, Path } from "./prim";

export type Cabelo = "careca" | "curto" | "cacheado" | "coque" | "rabo" | "longo" | "laterais" | "bone";
export const CABELOS: Cabelo[] = ["careca", "curto", "cacheado", "coque", "rabo", "longo", "laterais", "bone"];

type Pt = [number, number];
const f1 = (n: number) => n.toFixed(1);
/** contorno ondulado: arcos entre pontos consecutivos; percorrendo no sentido horário as ondas ficam para fora */
const nuvem = (pts: Pt[], r: number) => pts.slice(1).map((p) => `A ${r} ${r} 0 0 1 ${f1(p[0])} ${f1(p[1])}`).join(" ");
const naElipse = (graus: number, rx: number, ry: number): Pt => [Math.cos((graus * Math.PI) / 180) * rx, Math.sin((graus * Math.PI) / 180) * ry];

type P = { tipo: Cabelo; cor: string; k: number };

export const CabeloAtras: React.FC<P> = ({ tipo, cor, k }) => {
  const sw = CONTORNO / k, si = INTERNA / k;
  if (tipo === "coque")
    return (
      <g>
        <Circle cx={6} cy={-102} r={27} fill={cor} stroke={LINHA} strokeWidth={sw} />
        <Path d="M -8 -108 q 12 -12 28 -3" stroke={escura(cor)} strokeWidth={si} fill="none" strokeLinecap="round" />
      </g>
    );
  if (tipo === "rabo")
    return (
      <g>
        <Path d="M 44 -76 C 96 -100 140 -52 126 6 C 120 36 98 52 84 40 C 102 14 104 -22 72 -42 Z" fill={cor} stroke={LINHA} strokeWidth={sw} strokeLinejoin="round" />
        <Path d="M 94 -60 C 112 -40 114 -8 104 20" stroke={escura(cor)} strokeWidth={si} fill="none" strokeLinecap="round" />
      </g>
    );
  if (tipo === "longo")
    return (
      <g>
        <Path d="M -92 -30 C -106 40 -106 100 -100 152 Q -50 164 0 158 Q 50 164 100 152 C 106 100 106 40 92 -30 Z" fill={cor} stroke={LINHA} strokeWidth={sw} strokeLinejoin="round" />
        <Path d="M -88 70 L -90 140 M 88 70 L 90 140" stroke={escura(cor, 0.8)} strokeWidth={si} fill="none" strokeLinecap="round" />
      </g>
    );
  return null;
};

export const CabeloFrente: React.FC<P> = ({ tipo, cor, k }) => {
  const sw = CONTORNO / k, si = INTERNA / k;
  const traco = { fill: cor, stroke: LINHA, strokeWidth: sw, strokeLinejoin: "round" as const };
  switch (tipo) {
    case "curto":
      return <Path d="M -87 -2 C -93 -54 -58 -97 0 -98 C 58 -97 93 -54 87 -2 C 81 -18 74 -34 62 -44 C 42 -60 16 -56 2 -60 C -16 -54 -46 -62 -66 -44 C -76 -34 -82 -18 -87 -2 Z" {...traco} />;
    case "coque":
      return (
        <g>
          <Path d="M -87 -4 C -95 -58 -56 -99 2 -99 C 60 -99 95 -56 87 2 C 81 -20 70 -40 50 -52 C 30 -64 8 -60 -8 -50 C -30 -40 -60 -30 -87 -4 Z" {...traco} />
          <Path d="M 40 -84 C 20 -74 6 -64 -8 -50" stroke={escura(cor)} strokeWidth={si} fill="none" strokeLinecap="round" />
        </g>
      );
    case "rabo":
      return <Path d="M -87 -4 C -93 -58 -54 -99 0 -99 C 56 -99 93 -58 87 -4 C 83 -22 72 -36 56 -44 C 36 -52 26 -42 12 -50 C -6 -58 -30 -44 -50 -48 C -68 -50 -80 -30 -87 -4 Z" {...traco} />;
    case "longo":
      return (
        <g>
          <Path d="M -89 30 C -97 -40 -64 -99 0 -99 C 64 -99 97 -40 89 30 C 86 52 80 66 74 76 L 64 72 C 66 30 64 -20 46 -44 C 30 -60 10 -62 2 -54 C -8 -62 -30 -60 -46 -44 C -64 -20 -66 30 -64 72 L -74 76 C -80 66 -86 52 -89 30 Z" {...traco} />
          <Path d="M 2 -54 C 0 -70 -4 -84 -10 -94" stroke={escura(cor, 0.8)} strokeWidth={si} fill="none" strokeLinecap="round" />
        </g>
      );
    case "cacheado": {
      const fora = [180, 200, 220, 240, 260, 280, 300, 320, 340, 360].map((a) => naElipse(a, 95, 93));
      const linha: Pt[] = [[82, -2], [70, -30], [48, -46], [24, -52], [0, -54], [-24, -52], [-48, -46], [-70, -30], [-82, -2]];
      const d = `M ${f1(fora[0][0])} ${f1(fora[0][1])} ${nuvem(fora, 19)} L ${linha[0][0]} ${linha[0][1]} ${nuvem(linha, 15)} Z`;
      return <Path d={d} {...traco} />;
    }
    case "laterais": {
      const esq = [172, 188, 204, 220].map((a) => naElipse(a, 98, 94));
      const dir = [320, 336, 352, 368].map((a) => naElipse(a, 98, 94));
      return (
        <g>
          <Path d={`M ${f1(esq[0][0])} ${f1(esq[0][1])} ${nuvem(esq, 14)} C -66 -52 -76 -20 -78 10 Z`} {...traco} />
          <Path d={`M ${f1(dir[0][0])} ${f1(dir[0][1])} ${nuvem(dir, 14)} C 80 10 80 -30 66 -50 Z`} {...traco} />
        </g>
      );
    }
    case "bone":
      return (
        <g>
          <Path d="M -89 -22 C -93 -78 -50 -106 0 -106 C 50 -106 93 -78 89 -22 Q 0 -38 -89 -22 Z" {...traco} />
          <Path d="M 0 -104 C 8 -80 10 -52 6 -32" stroke={escura(cor)} strokeWidth={si} fill="none" strokeLinecap="round" />
          <Path d="M -14 -30 C 40 -46 110 -46 152 -36 C 160 -31 157 -24 148 -22 C 100 -20 40 -20 -14 -24 Z" fill={escura(cor, 0.88)} stroke={LINHA} strokeWidth={sw} strokeLinejoin="round" />
          <Circle cx={0} cy={-106} r={7} fill={cor} stroke={LINHA} strokeWidth={si} />
        </g>
      );
    default:
      return null;
  }
};

/** óculos redondos: aro preto, lente transparente, hastes até a lateral da cabeça */
export const Oculos: React.FC<{ k: number; escuro?: boolean }> = ({ k, escuro }) => {
  const sw = 5 / k;
  const lente = escuro ? "#20232B" : "none";
  return (
    <g>
      <Line x1={-47} y1={-5} x2={-83} y2={-12} stroke={LINHA} strokeWidth={sw} strokeLinecap="round" />
      <Line x1={47} y1={-6} x2={83} y2={-12} stroke={LINHA} strokeWidth={sw} strokeLinecap="round" />
      <Circle cx={-27} cy={-1} r={20} fill={lente} stroke={LINHA} strokeWidth={sw} />
      <Circle cx={27} cy={-2} r={20} fill={lente} stroke={LINHA} strokeWidth={sw} />
      {escuro && <Path d="M -38 -10 q 6 -6 12 -6 M 16 -11 q 6 -6 12 -6" stroke="#FFFFFF" strokeWidth={3 / k} fill="none" strokeLinecap="round" opacity={0.6} />}
      <Path d="M -7 -4 Q 0 -10 7 -4" stroke={LINHA} strokeWidth={sw} fill="none" strokeLinecap="round" />
    </g>
  );
};

/** bigode com as pontas viradas para cima, por cima do lábio */
export const Bigode: React.FC<{ cor: string; k: number }> = ({ cor, k }) => (
  <Path
    d="M 0 17 C 8 10 20 10 28 16 C 34 21 41 19 43 12 C 46 23 38 33 26 31 C 16 29 8 27 0 25 C -8 27 -16 29 -26 31 C -38 33 -46 23 -43 12 C -41 19 -34 21 -28 16 C -20 10 -8 10 0 17 Z"
    fill={cor} stroke={LINHA} strokeWidth={CONTORNO / k} strokeLinejoin="round"
  />
);

/** barba: mandíbula e queixo, abaixo da boca. Começa abaixo das maçãs do rosto, então sobra pele entre o cabelo e a
 * barba dos dois lados (barba alta encostando no cabelo escuro fechava o rosto e parecia uma balaclava). */
export const Barba: React.FC<{ cor: string; k: number }> = ({ cor, k }) => (
  <g>
    <Path
      d="M -79 28 C -80 58 -54 92 0 95 C 54 92 80 58 79 28 C 68 40 56 48 42 48 C 30 48 20 42 0 44 C -20 42 -30 48 -42 48 C -56 48 -68 40 -79 28 Z"
      fill={cor} stroke={LINHA} strokeWidth={CONTORNO / k} strokeLinejoin="round"
    />
    <Path d="M -46 62 q 6 7 4 14 M 44 60 q -6 7 -4 14" stroke={escura(cor)} strokeWidth={INTERNA / k} fill="none" strokeLinecap="round" />
  </g>
);

/** capuz de moletom (atrás da cabeça, aparecendo em volta) */
export const Capuz: React.FC<{ cor: string; k: number }> = ({ cor, k }) => (
  <Path d="M -104 40 C -116 -60 -70 -118 0 -118 C 70 -118 116 -60 104 40 C 100 80 80 100 60 110 L -60 110 C -80 100 -100 80 -104 40 Z" fill={cor} stroke={LINHA} strokeWidth={CONTORNO / k} strokeLinejoin="round" />
);