// Objetos extras (vídeo do cartão infinito e próximos): mesmo padrão dos objetos da Fase 2 (origem = apoio, ponto de pega).
import "react";
import { CONTORNO, INTERNA, LINHA, escura } from "../estilo";
import { Circle, Ellipse, Line, Papel, Path, Rect } from "../components/prim";
import { FONTE } from "../fontes";
import type { ObjetoDef } from "./objetos";

const W = 6;

/** cartão preto: sem nome, sem limite; brilho = reflexo passando */
export const CARTAO: ObjetoDef = {
  nome: "cartão", pega: () => [-14, -12], peso: 0.02,
  Desenho: ({ brilho = 0, cor = "#1A1A1F" }) => (
    <Papel>
      <Rect x={-26} y={-34} width={52} height={34} rx={5} fill={cor} stroke={LINHA} strokeWidth={W - 1} />
      <Rect x={-18} y={-26} width={12} height={9} rx={2} fill="#E3B95B" stroke={LINHA} strokeWidth={2} />
      <Line x1={-18} y1={-9} x2={16} y2={-9} stroke="#4A4A55" strokeWidth={3} strokeLinecap="round" />
      {brilho > 0 && <Path d={`M ${-30 + brilho * 60} -36 l 10 0 l -18 38 l -10 0 Z`} fill="#FFFFFF" opacity={0.5} />}
    </Papel>
  ),
};

/** maquininha de cartão (em pé no balcão ou na mão); tela: nada, bip (pisca) ou aprovado */
export const MAQUININHA: ObjetoDef = {
  nome: "maquininha", pega: () => [0, -14], peso: 0.15,
  Desenho: ({ tela = "nada" }) => (
    <g>
      <Papel>
        <Path d="M -26 -96 L 26 -96 Q 32 -96 32 -88 L 30 -6 Q 30 0 22 0 L -22 0 Q -30 0 -30 -6 L -32 -88 Q -32 -96 -26 -96 Z" fill="#3A3F4B" stroke={LINHA} strokeWidth={W} strokeLinejoin="round" />
        <Rect x={-20} y={-86} width={40} height={30} rx={3} fill={tela === "aprovado" ? "#7FD18C" : tela === "bip" ? "#F4F1EA" : "#9ED8F5"} stroke={LINHA} strokeWidth={3} />
        {[0, 1, 2].map((r) => [0, 1, 2].map((c) => <Rect key={`${r}${c}`} x={-17 + c * 12} y={-46 + r * 11} width={9} height={7} rx={2} fill="#B9BEC6" />))}
      </Papel>
      {tela === "aprovado" && <Path d="M -9 -72 l 6 6 l 12 -13" stroke={LINHA} strokeWidth={4} fill="none" strokeLinecap="round" strokeLinejoin="round" />}
    </g>
  ),
};

/** recibo comprido (desenrola para baixo a partir de onde é segurado) */
export const RECIBO: ObjetoDef = {
  nome: "recibo", pega: () => [0, -4], peso: 0.02,
  Desenho: ({ comprimento = 80 }) => {
    const n = Math.max(2, Math.floor(comprimento / 14));
    return (
      <Papel>
        <Path d={`M -20 -10 L 20 -10 L 20 ${comprimento} ${Array.from({ length: 6 }, (_, i) => `L ${20 - (i + 0.5) * (40 / 6)} ${comprimento + 5} L ${20 - (i + 1) * (40 / 6)} ${comprimento}`).join(" ")} Z`} fill="#FFFFFF" stroke={LINHA} strokeWidth={4} strokeLinejoin="round" />
        {Array.from({ length: n }, (_, i) => <Line key={i} x1={-12} y1={4 + i * 14} x2={i % 3 === 2 ? 4 : 12} y2={4 + i * 14} stroke="#B9B4AA" strokeWidth={3} strokeLinecap="round" />)}
      </Papel>
    );
  },
};

/** caixa de tênis (com tampa) */
export const CAIXA_TENIS: ObjetoDef = {
  nome: "caixa de tênis", pega: () => [-40, -20], peso: 0.2,
  Desenho: ({ cor = "#E0822E" }) => (
    <Papel>
      <Rect x={-40} y={-34} width={80} height={34} rx={3} fill={cor} stroke={LINHA} strokeWidth={W - 1} />
      <Rect x={-44} y={-42} width={88} height={12} rx={3} fill={escura(cor, 0.85)} stroke={LINHA} strokeWidth={W - 1} />
      <Path d="M -12 -20 l 24 0" stroke="#FFFFFF" strokeWidth={4} strokeLinecap="round" />
    </Papel>
  ),
};

/** tênis de lado (vitrine) */
export const TENIS: ObjetoDef = {
  nome: "tênis", pega: () => [10, -20], peso: 0.05,
  Desenho: ({ cor = "#C0504D" }) => (
    <Papel>
      <Path d="M -24 -5 C -27 -24 -8 -33 9 -30 C 26 -28 41 -18 41 -7 L 41 0 L -24 0 Z" fill={cor} stroke={LINHA} strokeWidth={W} strokeLinejoin="round" />
      <Path d="M -25 -7 L 42 -7 L 42 1 Q 10 4 -25 1 Z" fill="#FFFFFF" stroke={LINHA} strokeWidth={4} strokeLinejoin="round" />
      <Path d="M 2 -25 l 9 4 M 10 -28 l 9 4" stroke="#FFFFFF" strokeWidth={4} strokeLinecap="round" />
    </Papel>
  ),
};

/** cofrinho de porquinho */
export const COFRINHO: ObjetoDef = {
  nome: "cofrinho", pega: () => [0, -30], peso: 0.3,
  Desenho: () => (
    <Papel>
      <Ellipse cx={0} cy={-30} rx={42} ry={30} fill="#F2A7B5" stroke={LINHA} strokeWidth={W} />
      <Ellipse cx={40} cy={-34} rx={10} ry={12} fill="#F2A7B5" stroke={LINHA} strokeWidth={4} />
      <Circle cx={42} cy={-36} r={2.5} fill={LINHA} />
      <Path d="M -10 -60 l 18 0" stroke={LINHA} strokeWidth={5} strokeLinecap="round" />
      <Circle cx={22} cy={-42} r={3.5} fill={LINHA} />
      <Path d="M -26 -6 l 0 8 M 22 -6 l 0 8" stroke={LINHA} strokeWidth={8} strokeLinecap="round" />
      <Path d="M -26 -6 l 0 8 M 22 -6 l 0 8" stroke="#F2A7B5" strokeWidth={3} strokeLinecap="round" />
    </Papel>
  ),
};

export const MOEDA: ObjetoDef = {
  nome: "moeda", pega: () => [0, -12], peso: 0.01,
  Desenho: () => (
    <Papel>
      <Circle cx={0} cy={-12} r={12} fill="#E3B95B" stroke={LINHA} strokeWidth={4} />
      <Circle cx={0} cy={-12} r={6} fill="none" stroke={escura("#E3B95B")} strokeWidth={2.5} />
    </Papel>
  ),
};

/** cédula de real (genérica) */
export const CEDULA: ObjetoDef = {
  nome: "cédula", pega: () => [-30, -14], peso: 0.01,
  Desenho: ({ cor = "#7AA35B" }) => (
    <g>
      <Papel>
        <Rect x={-36} y={-28} width={72} height={28} rx={4} fill={cor} stroke={LINHA} strokeWidth={4} />
        <Circle cx={14} cy={-14} r={8} fill={escura(cor, 0.85)} stroke={LINHA} strokeWidth={2.5} />
      </Papel>
      <text x={-18} y={-7} textAnchor="middle" fontFamily={FONTE} fontWeight={900} fontSize={16} fill="#F4F1EA">R$</text>
    </g>
  ),
};

/** bilhete de loteria genérico (grade de números) */
export const BILHETE: ObjetoDef = {
  nome: "bilhete", pega: () => [-30, -40], peso: 0.01,
  Desenho: () => (
    <Papel>
      <Rect x={-38} y={-80} width={76} height={80} rx={4} fill="#FFFFFF" stroke={LINHA} strokeWidth={4} />
      <Rect x={-38} y={-80} width={76} height={16} rx={4} fill="#4F8A6B" stroke={LINHA} strokeWidth={3} />
      {Array.from({ length: 25 }, (_, i) => <Rect key={i} x={-30 + (i % 5) * 12.5} y={-58 + Math.floor(i / 5) * 11} width={8} height={7} rx={1.5} fill={[3, 9, 12, 17, 21, 24].includes(i) ? LINHA : "#E4DED2"} />)}
    </Papel>
  ),
};

/** saco de dinheiro (murcha com `comprimento` de 0 a 1: 1 = cheio) */
export const SACO: ObjetoDef = {
  nome: "saco de dinheiro", pega: () => [0, -70], peso: 0.4,
  Desenho: ({ comprimento = 1 }) => {
    const k = Math.max(0.05, comprimento);
    return (
      <g transform={`scale(${0.4 + 0.6 * k} ${0.3 + 0.7 * k})`}>
        <Papel>
          <Path d="M -14 -78 Q 0 -86 14 -78 L 8 -64 Q 46 -50 46 -20 Q 46 0 0 0 Q -46 0 -46 -20 Q -46 -50 -8 -64 Z" fill="#C9A26E" stroke={LINHA} strokeWidth={W} strokeLinejoin="round" />
          <Path d="M -12 -66 Q 0 -60 12 -66" stroke={LINHA} strokeWidth={5} fill="none" strokeLinecap="round" />
        </Papel>
        <text x={0} y={-16} textAnchor="middle" fontFamily={FONTE} fontWeight={900} fontSize={26} fill="#5A4636">R$</text>
      </g>
    );
  },
};

/** carro esportivo de lado (genérico, sem marca); origem = chão no meio do carro */
export const CARRO_ESPORTIVO: ObjetoDef = {
  nome: "carro esportivo", pega: () => [0, -60], peso: 1,
  Desenho: ({ cor = "#F2C230" }) => (
    <g>
      <Papel>
        <Path d="M -250 -30 Q -254 -64 -214 -70 L -130 -78 Q -90 -118 -10 -124 Q 70 -126 120 -84 L 214 -70 Q 252 -64 250 -34 L 246 -18 Q 240 -10 226 -10 L -232 -10 Q -248 -12 -250 -30 Z" fill={cor} stroke={LINHA} strokeWidth={CONTORNO} strokeLinejoin="round" />
        <Path d="M -100 -80 Q -62 -112 -8 -114 Q 56 -114 96 -84 Z" fill="#2E3440" stroke={LINHA} strokeWidth={INTERNA} strokeLinejoin="round" />
        <Line x1={-6} y1={-114} x2={-2} y2={-80} stroke={cor} strokeWidth={6} />
        <Path d="M -190 -40 L 190 -44" stroke={escura(cor)} strokeWidth={INTERNA} strokeLinecap="round" />
        <Rect x={222} y={-62} width={26} height={12} rx={4} fill="#F4F1EA" stroke={LINHA} strokeWidth={3} />
        <Rect x={-252} y={-60} width={18} height={12} rx={4} fill="#C0504D" stroke={LINHA} strokeWidth={3} />
        {[-150, 150].map((x) => (
          <g key={x}>
            <Circle cx={x} cy={-16} r={40} fill="#2A2A35" stroke={LINHA} strokeWidth={CONTORNO} />
            <Circle cx={x} cy={-16} r={20} fill="#B9BEC6" stroke={LINHA} strokeWidth={INTERNA} />
            {[0, 72, 144, 216, 288].map((a) => <Line key={a} x1={x} y1={-16} x2={x + Math.cos((a * Math.PI) / 180) * 18} y2={-16 + Math.sin((a * Math.PI) / 180) * 18} stroke="#8A9099" strokeWidth={3} />)}
          </g>
        ))}
      </Papel>
    </g>
  ),
};

/** cortador de grama empurrado (o cabo vai para a esquerda e para cima; pega na ponta do cabo) */
export const CORTADOR: ObjetoDef = {
  nome: "cortador de grama", pega: () => [-120, -116], peso: 0.5,
  Desenho: () => (
    <Papel>
      <Path d="M -20 -40 L -120 -116" stroke={LINHA} strokeWidth={14} strokeLinecap="round" />
      <Path d="M -20 -40 L -120 -116" stroke="#B9BEC6" strokeWidth={6} strokeLinecap="round" />
      <Path d="M -30 -10 Q -34 -52 10 -54 L 60 -54 Q 80 -52 78 -24 L 74 -10 Z" fill="#C0504D" stroke={LINHA} strokeWidth={W} strokeLinejoin="round" />
      <Rect x={0} y={-66} width={36} height={14} rx={4} fill="#3A3F4B" stroke={LINHA} strokeWidth={4} />
      {[-14, 62].map((x) => <Circle key={x} cx={x} cy={-8} r={12} fill="#2A2A35" stroke={LINHA} strokeWidth={4} />)}
    </Papel>
  ),
};

/** caixa de papelão (mercadinho) */
export const CAIXA: ObjetoDef = {
  nome: "caixa", pega: () => [-36, -24], peso: 0.4,
  Desenho: () => (
    <Papel>
      <Rect x={-36} y={-56} width={72} height={56} rx={3} fill="#C9955E" stroke={LINHA} strokeWidth={W} />
      <Path d="M -36 -42 L 36 -42 M -6 -56 L -6 -42 M 6 -56 L 6 -42" stroke={escura("#C9955E")} strokeWidth={4} />
    </Papel>
  ),
};

