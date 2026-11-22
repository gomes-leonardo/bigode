// Roupas por cima do corpo (saia, avental com bolso, jaleco branco longo com lapela), no espaço do personagem.
// `W` = largura do corpo (1.0 a 1.25). Cores chapadas; dobras e barras na versão 25% mais escura.
import React from "react";
import { CONTORNO, INTERNA, LINHA, escura } from "../estilo";
import { Line, Path, Rect } from "./prim";

const f1 = (n: number) => n.toFixed(1);

/** saia (godê curta): da cintura até acima do joelho; as pernas aparecem por baixo. Coordenadas do quadril. */
export const Saia: React.FC<{ cor: string; W: number }> = ({ cor, W }) => (
  <g>
    <Path
      d={`M ${f1(-55 * W)} -146 Q 0 -152 ${f1(55 * W)} -146 L ${f1(68 * W)} -78 Q ${f1(34 * W)} -70 0 -72 Q ${f1(-34 * W)} -70 ${f1(-68 * W)} -78 Z`}
      fill={cor} stroke={LINHA} strokeWidth={CONTORNO} strokeLinejoin="round"
    />
    <Path d={`M ${f1(-63 * W)} -88 Q 0 -78 ${f1(63 * W)} -88`} stroke={escura(cor)} strokeWidth={INTERNA} fill="none" strokeLinecap="round" />
    <Path d={`M ${f1(-20 * W)} -132 L ${f1(-26 * W)} -92 M ${f1(22 * W)} -130 L ${f1(30 * W)} -92`} stroke={escura(cor)} strokeWidth={INTERNA} fill="none" strokeLinecap="round" />
  </g>
);

/** avental de peito com bolso: do peito até o meio da coxa, alças no pescoço. Coordenadas do tronco. */
export const Avental: React.FC<{ cor: string; W: number }> = ({ cor, W }) => {
  const e = escura(cor);
  return (
    <g>
      <Path d={`M -20 -213 L -15 -246 M 20 -213 L 15 -246`} stroke={LINHA} strokeWidth={9 + 7} strokeLinecap="round" />
      <Path d={`M -20 -213 L -15 -246 M 20 -213 L 15 -246`} stroke={cor} strokeWidth={9} strokeLinecap="round" />
      <Path
        d={`M -30 -216 L 30 -216 L ${f1(36 * W)} -152 Q ${f1(50 * W)} -148 ${f1(54 * W)} -140 L ${f1(58 * W)} -92 Q ${f1(58 * W)} -80 ${f1(46 * W)} -80 L ${f1(-46 * W)} -80 Q ${f1(-58 * W)} -80 ${f1(-58 * W)} -92 L ${f1(-54 * W)} -140 Q ${f1(-50 * W)} -148 ${f1(-36 * W)} -152 Z`}
        fill={cor} stroke={LINHA} strokeWidth={CONTORNO} strokeLinejoin="round"
      />
      <Rect x={-21} y={-136} width={42} height={28} rx={7} fill="none" stroke={LINHA} strokeWidth={INTERNA} />
      <Line x1={f1(-36 * W)} y1={-150} x2={f1(36 * W)} y2={-150} stroke={e} strokeWidth={INTERNA} strokeLinecap="round" />
      <Path d={`M ${f1(-40 * W)} -100 q 6 10 2 18`} stroke={e} strokeWidth={INTERNA} fill="none" strokeLinecap="round" />
    </g>
  );
};

/** jaleco branco longo com lapela, aberto no peito (aparece a blusa). Vai até o joelho. Coordenadas do tronco. */
export const Jaleco: React.FC<{ blusa: string; W: number; ombros: number }> = ({ blusa, W, ombros }) => {
  const cor = "#FAF9F4";
  const e = escura(cor, 0.82);
  const o = ombros;
  return (
    <g>
      <Path
        d={`M -24 ${-247 - o} C ${f1(-54 * W)} ${-245 - o} ${f1(-70 * W)} -232 ${f1(-68 * W)} -206 L ${f1(-72 * W)} -62 Q 0 -54 ${f1(72 * W)} -62 L ${f1(68 * W)} -206 C ${f1(70 * W)} -232 ${f1(54 * W)} ${-245 - o} 24 ${-247 - o} Z`}
        fill={cor} stroke={LINHA} strokeWidth={CONTORNO} strokeLinejoin="round"
      />
      {/* blusa aparecendo no decote */}
      <Path d={`M -21 ${-246 - o} L 0 -184 L 21 ${-246 - o} Z`} fill={blusa} stroke={LINHA} strokeWidth={INTERNA} strokeLinejoin="round" />
      {/* lapelas */}
      <Path d={`M -21 ${-246 - o} L -36 -214 L -12 -200 L 0 -184 M 21 ${-246 - o} L 36 -214 L 12 -200 L 0 -184`} stroke={LINHA} strokeWidth={INTERNA} fill="none" strokeLinejoin="round" strokeLinecap="round" />
      {/* abertura da frente + bolsos */}
      <Line x1={0} y1={-184} x2={1} y2={-58} stroke={LINHA} strokeWidth={INTERNA} strokeLinecap="round" />
      <Line x1={f1(-48 * W)} y1={-196} x2={f1(-26 * W)} y2={-196} stroke={e} strokeWidth={INTERNA} strokeLinecap="round" />
      <Path d={`M ${f1(-56 * W)} -112 L ${f1(-28 * W)} -112 M ${f1(28 * W)} -112 L ${f1(56 * W)} -112`} stroke={e} strokeWidth={INTERNA} strokeLinecap="round" />
      <Path d={`M ${f1(40 * W)} -170 q 8 6 6 16`} stroke={e} strokeWidth={INTERNA} fill="none" strokeLinecap="round" />
    </g>
  );
};
