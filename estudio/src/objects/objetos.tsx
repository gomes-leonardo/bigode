// Objetos de mão. Origem (0,0) = ponto de apoio (meio da base); y negativo para cima; tamanho na escala 1 do personagem.
// Cada objeto tem um PONTO DE PEGA: é ali que a mão fecha (o punho é desenhado por cima, a alça passa por baixo dos dedos).
import React from "react";
import { LINHA, PELE, escura } from "../estilo";
import { Circle, Ellipse, EscalaCtx, Line, Papel, Path, Polygon, Rect } from "../components/prim";
import type { P } from "../components/Person";

/** t = segundos (anima vapor etc.); vira = celular: 0 deitado com a tela para cima, 0.5 de lado, 1 em pé com as costas para a câmera;
 * quente = 0 a 1 (vapor da panela); vapor = 0 a 1 (some o vapor da xícara, ex.: durante o gole) */
export type EstadoObj = {
  t: number; vira?: number; quente?: number; vapor?: number;
  tela?: "nada" | "bip" | "aprovado"; // maquininha
  comprimento?: number; // recibo (px locais)
  brilho?: number; // cartão (0 a 1)
  cor?: string; // variação de cor (tênis, caixa, carro)
  texto?: string; // etiqueta de preço, placa
};
export type ObjetoDef = { nome: string; pega: (e: EstadoObj) => P; peso: number; Desenho: React.FC<EstadoObj> };
const W = 6;

const Vapor: React.FC<{ x: number; y: number; t: number; k?: number; n?: number; alt?: number; larg?: number }> = ({ x, y, t, k = 1, n = 3, alt = 40, larg = 10 }) => (
  <g>
    {Array.from({ length: n }, (_, i) => {
      const f = (t * 0.8 + i / n) % 1;
      const dx = (i - (n - 1) / 2) * larg;
      const a = 6 + 4 * k;
      return <Path key={i} d={`M ${x + dx} ${y - f * alt} q ${a} -7 0 -14 q ${-a} -7 0 -14`} stroke={LINHA} strokeWidth={3.2} fill="none" strokeLinecap="round" opacity={Math.min(1, 0.6 * k) * Math.sin(Math.PI * f)} />;
    })}
  </g>
);

export const XICARA: ObjetoDef = {
  nome: "xícara",
  pega: () => [27, -19],
  peso: 0.1,
  Desenho: ({ t, vapor = 1 }) => (
    <g>
      <Papel>
        <Path d="M 17 -27 C 34 -28 34 -9 15 -10" stroke={LINHA} strokeWidth={12} fill="none" strokeLinecap="round" />
        <Path d="M 17 -27 C 34 -28 34 -9 15 -10" stroke={PELE} strokeWidth={4} fill="none" strokeLinecap="round" />
        <Path d="M -20 -32 L 20 -32 Q 21 -6 8 0 L -8 0 Q -21 -6 -20 -32 Z" fill={PELE} stroke={LINHA} strokeWidth={W} strokeLinejoin="round" />
        <Ellipse cx={0} cy={-32} rx={18} ry={4} fill="#6B3E1F" stroke={LINHA} strokeWidth={3} />
        <Path d="M -12 -14 q 6 4 12 0" stroke="#C9C4B8" strokeWidth={3} fill="none" strokeLinecap="round" />
      </Papel>
      {vapor > 0.02 && <Vapor x={0} y={-40} t={t} k={0.8 * vapor} />}
    </g>
  ),
};
/** altura aparente do celular: deitado (perspectiva de cima) -> de lado -> em pé */
const syCel = (v: number) => (v < 0.5 ? 0.36 + (0.07 - 0.36) * (v / 0.5) : 0.07 + 0.93 * ((v - 0.5) / 0.5));
export const CELULAR: ObjetoDef = {
  nome: "celular",
  // pega na borda esquerda, no meio da altura aparente
  pega: ({ vira = 0 }) => [-15, -27 * syCel(vira)],
  peso: 0.05,
  Desenho: ({ vira = 0, t }) => {
    const sy = syCel(vira);
    const h = 54 * sy;
    const tela = vira < 0.5;
    return (
      <Papel>
        <Rect x={-15} y={-h} width={30} height={h} rx={Math.min(6, h / 2)} fill="#2A2A35" stroke={LINHA} strokeWidth={W} />
        {tela && sy > 0.2 && <Rect x={-10} y={-h + 4 * sy + 2} width={20} height={Math.max(0, h - 12 * sy - 4)} rx={2} fill="#9ED8F5" />}
        {!tela && sy > 0.5 && (
          <g>
            <Rect x={-10} y={-h + 5} width={12} height={14} rx={4} fill="#3E3E4C" stroke={LINHA} strokeWidth={2.5} />
            <Circle cx={-4} cy={-h + 9} r={2.4} fill="#141414" />
            <Circle cx={-4} cy={-h + 15} r={2.4} fill="#141414" />
            {/* reflexo da tela na borda de cima: ele está lendo */}
            <Path d={`M -9 ${-h - 1} L 9 ${-h - 1}`} stroke="#9ED8F5" strokeWidth={2} opacity={0.8 + 0.2 * Math.sin(t * 6)} />
          </g>
        )}
      </Papel>
    );
  },
};
export const PANELA: ObjetoDef = {
  nome: "panela",
  pega: () => [-104, -41],
  peso: 0.6,
  Desenho: ({ t, quente = 0 }) => (
    <g>
      <Papel>
        <Path d="M -48 -38 L -116 -43" stroke={LINHA} strokeWidth={13 + 12} strokeLinecap="round" />
        <Path d="M -48 -38 L -116 -43" stroke="#2A2A35" strokeWidth={13} strokeLinecap="round" />
        <Path d="M -50 -46 L 50 -46 L 47 -8 Q 44 0 34 0 L -34 0 Q -44 0 -47 -8 Z" fill="#B9BEC6" stroke={LINHA} strokeWidth={W + 1} strokeLinejoin="round" />
        <Rect x={-56} y={-52} width={112} height={10} rx={5} fill="#D6DAE0" stroke={LINHA} strokeWidth={W} />
        <Path d="M -30 -30 q 10 -4 18 0" stroke={escura("#B9BEC6")} strokeWidth={4.5} fill="none" strokeLinecap="round" />
      </Papel>
      {quente > 0 && <Vapor x={0} y={-58} t={t * (1 + quente)} k={quente} n={2 + Math.round(3 * quente)} alt={40 + 50 * quente} larg={12 + 6 * quente} />}
    </g>
  ),
};
export const PRATO: ObjetoDef = {
  nome: "prato",
  pega: () => [-42, -9],
  peso: 0.15,
  Desenho: () => (
    <Papel>
      <Ellipse cx={0} cy={-9} rx={46} ry={10} fill={PELE} stroke={LINHA} strokeWidth={W} />
      <Ellipse cx={0} cy={-10} rx={28} ry={5} fill="none" stroke="#C9C4B8" strokeWidth={3} />
    </Papel>
  ),
};
export const BOLA: ObjetoDef = {
  nome: "bola",
  pega: () => [-24, -24],
  peso: 0.2,
  Desenho: ({ t }) => (
    <Papel transform={`rotate(${(t * 90) % 360} 0 -24)`}>
      <Circle cx={0} cy={-24} r={24} fill={PELE} stroke={LINHA} strokeWidth={W} />
      <Polygon points="0,-33 8,-27 5,-18 -5,-18 -8,-27" fill={LINHA} />
      {[[0, -33, 0, -46], [8, -27, 20, -32], [5, -18, 12, -6], [-5, -18, -12, -6], [-8, -27, -20, -32]].map(([a, b, c, d], i) => <Line key={i} x1={a} y1={b} x2={c} y2={d} stroke={LINHA} strokeWidth={3} />)}
    </Papel>
  ),
};
export const CHINELO: ObjetoDef = {
  nome: "chinelo",
  pega: () => [-30, -9],
  peso: 0.05,
  Desenho: () => (
    <Papel>
      <Path d="M -36 -4 Q -38 -14 -24 -14 L 26 -16 Q 40 -15 38 -5 Q 36 2 20 2 L -26 2 Q -36 2 -36 -4 Z" fill="#2E6B43" stroke={LINHA} strokeWidth={W} strokeLinejoin="round" />
      <Path d="M 12 -15 L -2 -26 M 12 -15 L 24 -26" stroke={LINHA} strokeWidth={10} strokeLinecap="round" />
      <Path d="M 12 -15 L -2 -26 M 12 -15 L 24 -26" stroke="#E9707F" strokeWidth={5} strokeLinecap="round" />
    </Papel>
  ),
};
export const COPO: ObjetoDef = {
  nome: "copo",
  pega: () => [-15, -22],
  peso: 0.15,
  Desenho: () => (
    <Papel>
      <Path d="M -16 -46 L 16 -46 L 13 0 L -13 0 Z" fill="#D8EEF6" stroke={LINHA} strokeWidth={W} strokeLinejoin="round" />
      <Path d="M -15 -28 L 15 -28 L 13 -2 L -13 -2 Z" fill="#9ED8F5" />
      <Line x1={-9} y1={-40} x2={-8} y2={-10} stroke={PELE} strokeWidth={4} strokeLinecap="round" />
      <Path d="M -16 -46 L 16 -46 L 13 0 L -13 0 Z" fill="none" stroke={LINHA} strokeWidth={W} strokeLinejoin="round" />
    </Papel>
  ),
};
export const CONTROLE: ObjetoDef = {
  nome: "controle",
  pega: () => [-26, -14],
  peso: 0.1,
  Desenho: () => (
    <Papel>
      <Path d="M -32 -12 Q -36 -34 -14 -32 L 14 -32 Q 36 -34 32 -12 Q 30 2 20 0 Q 12 -2 8 -10 L -8 -10 Q -12 -2 -20 0 Q -30 2 -32 -12 Z" fill="#2E2A5C" stroke={LINHA} strokeWidth={W} strokeLinejoin="round" />
      <Circle cx={16} cy={-22} r={4} fill="#E23B2E" />
      <Circle cx={23} cy={-16} r={4} fill="#86DDBE" />
      <Path d="M -20 -26 v 10 M -25 -21 h 10" stroke="#C9C4D8" strokeWidth={4} strokeLinecap="round" />
    </Papel>
  ),
};
export const MOCHILA: ObjetoDef = {
  nome: "mochila",
  pega: () => [0, -96],
  peso: 0.35,
  Desenho: () => (
    <Papel>
      <Path d="M -12 -86 Q 0 -104 12 -86" stroke={LINHA} strokeWidth={10 + 8} fill="none" strokeLinecap="round" />
      <Path d="M -12 -86 Q 0 -104 12 -86" stroke="#B5525E" strokeWidth={10} fill="none" strokeLinecap="round" />
      <Path d="M -34 -70 Q -36 -88 0 -88 Q 36 -88 34 -70 L 36 -6 Q 36 0 28 0 L -28 0 Q -36 0 -36 -6 Z" fill="#E9707F" stroke={LINHA} strokeWidth={W} strokeLinejoin="round" />
      <Rect x={-22} y={-40} width={44} height={30} rx={8} fill={escura("#E9707F", 0.85)} stroke={LINHA} strokeWidth={4.5} />
      <Line x1={-18} y1={-34} x2={18} y2={-34} stroke={LINHA} strokeWidth={3} />
    </Papel>
  ),
};
export const OBJETOS = { xicara: XICARA, celular: CELULAR, panela: PANELA, prato: PRATO, bola: BOLA, chinelo: CHINELO, copo: COPO, controle: CONTROLE, mochila: MOCHILA };

/** objeto solto no mundo: apoio em `em`, na escala `s` */
export const ObjetoNoMundo: React.FC<{ def: ObjetoDef; em: P; s: number; rot?: number; e: EstadoObj }> = ({ def, em, s, rot = 0, e }) => (
  <EscalaCtx.Provider value={s}>
    <g transform={`translate(${em[0]} ${em[1]}) scale(${s}) rotate(${rot})`}>
      <def.Desenho {...e} />
    </g>
  </EscalaCtx.Provider>
);
/** objeto na mão (dentro do personagem, camada propsHands): o ponto de pega fica na mão; gira com a mão */
export const ObjetoNaMao: React.FC<{ def: ObjetoDef; mao: P; ang: number; e: EstadoObj }> = ({ def, mao, ang, e }) => {
  const pg = def.pega(e);
  return (
    <g transform={`translate(${mao[0]} ${mao[1]}) rotate(${ang}) translate(${-pg[0]} ${-pg[1]})`}>
      <def.Desenho {...e} />
    </g>
  );
};
/** mundo do ponto de pega de um objeto solto */
export const pegaNoMundo = (def: ObjetoDef, em: P, s: number, e: EstadoObj): P => {
  const pg = def.pega(e);
  return [em[0] + pg[0] * s, em[1] + pg[1] * s];
};

