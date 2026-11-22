// Mais objetos de mão (cartão infinito, capítulos 2 em diante). Origem = apoio; ponto de pega onde o punho fecha.
import "react";
import { LINHA, escura } from "../estilo";
import { Circle, Ellipse, Line, Papel, Path, Rect } from "../components/prim";
import { FONTE } from "../fontes";
import type { ObjetoDef } from "./objetos";

const W = 6;

/** pão francês grande (de segurar) */
export const PAO: ObjetoDef = {
  nome: "pão", pega: () => [-30, -18], peso: 0.05,
  Desenho: () => (
    <Papel>
      <Ellipse cx={0} cy={-18} rx={44} ry={20} fill="#D99A4E" stroke={LINHA} strokeWidth={W} />
      <Path d="M -26 -24 q 10 -10 20 0 M -2 -26 q 10 -10 20 0 M 20 -24 q 8 -8 14 0" stroke="#F2D9A6" strokeWidth={5} fill="none" strokeLinecap="round" />
    </Papel>
  ),
};

/** etiqueta de preço pendurada (texto = preço) */
export const ETIQUETA: ObjetoDef = {
  nome: "etiqueta", pega: () => [-46, -30], peso: 0.01,
  Desenho: ({ texto = "R$ 1", cor = "#FFFFFF" }) => (
    <g>
      <Papel>
        <Path d="M -46 -30 L -28 -52 L 50 -52 L 50 -8 L -28 -8 Z" fill={cor} stroke={LINHA} strokeWidth={W - 1} strokeLinejoin="round" />
        <Circle cx={-30} cy={-30} r={5} fill="#F4F1EA" stroke={LINHA} strokeWidth={3} />
      </Papel>
      <text x={12} y={-21} textAnchor="middle" fontFamily={FONTE} fontWeight={900} fontSize={texto.length > 6 ? 19 : 24} fill={LINHA}>{texto}</text>
    </g>
  ),
};

/** chave de casa */
export const CHAVE: ObjetoDef = {
  nome: "chave", pega: () => [-22, -10], peso: 0.01,
  Desenho: ({ cor = "#E3B95B" }) => (
    <Papel>
      <Circle cx={-22} cy={-10} r={12} fill={cor} stroke={LINHA} strokeWidth={4} />
      <Circle cx={-22} cy={-10} r={4} fill="#F4F1EA" />
      <Path d="M -10 -10 L 30 -10 L 30 -2 M 20 -10 L 20 -3" stroke={LINHA} strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <Path d="M -10 -10 L 30 -10 L 30 -2 M 20 -10 L 20 -3" stroke={cor} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </Papel>
  ),
};

/** caixa de pizza (fechada); quente = vapor saindo */
export const PIZZA: ObjetoDef = {
  nome: "caixa de pizza", pega: () => [-48, -10], peso: 0.15,
  Desenho: () => (
    <g>
      <Papel>
        <Rect x={-56} y={-20} width={112} height={20} rx={3} fill="#E9DFCB" stroke={LINHA} strokeWidth={W - 1} />
        <Line x1={-56} y1={-12} x2={56} y2={-12} stroke={escura("#E9DFCB")} strokeWidth={3} />
      </Papel>
      <text x={0} y={-4} textAnchor="middle" fontFamily={FONTE} fontWeight={900} fontSize={10} fill="#C0504D">PIZZA</text>
    </g>
  ),
};

/** tesoura (pega no cabo) */
export const TESOURA: ObjetoDef = {
  nome: "tesoura", pega: () => [-30, -14], peso: 0.05,
  Desenho: ({ comprimento = 0 }) => {
    const ab = 6 + 14 * comprimento; // abertura das lâminas
    return (
      <Papel>
        <Path d={`M -8 -14 L 44 ${-14 - ab}`} stroke={LINHA} strokeWidth={10} strokeLinecap="round" />
        <Path d={`M -8 -14 L 44 ${-14 + ab}`} stroke={LINHA} strokeWidth={10} strokeLinecap="round" />
        <Path d={`M -8 -14 L 44 ${-14 - ab}`} stroke="#B9BEC6" strokeWidth={5} strokeLinecap="round" />
        <Path d={`M -8 -14 L 44 ${-14 + ab}`} stroke="#B9BEC6" strokeWidth={5} strokeLinecap="round" />
        <Ellipse cx={-24} cy={-22} rx={12} ry={8} fill="none" stroke={LINHA} strokeWidth={8} />
        <Ellipse cx={-24} cy={-22} rx={12} ry={8} fill="none" stroke="#C0504D" strokeWidth={4} />
        <Ellipse cx={-24} cy={-6} rx={12} ry={8} fill="none" stroke={LINHA} strokeWidth={8} />
        <Ellipse cx={-24} cy={-6} rx={12} ry={8} fill="none" stroke="#C0504D" strokeWidth={4} />
        <Circle cx={-8} cy={-14} r={4} fill={LINHA} />
      </Papel>
    );
  },
};

/** envelope pequeno */
export const ENVELOPE: ObjetoDef = {
  nome: "envelope", pega: () => [-26, -16], peso: 0.01,
  Desenho: ({ cor = "#FFFFFF" }) => (
    <Papel>
      <Rect x={-34} y={-44} width={68} height={44} rx={4} fill={cor} stroke={LINHA} strokeWidth={W - 1} />
      <Path d="M -32 -42 L 0 -18 L 32 -42" stroke={LINHA} strokeWidth={4} fill="none" strokeLinejoin="round" />
    </Papel>
  ),
};

/** cartão branco com relógio no lugar do cifrão */
export const CARTAO_BRANCO: ObjetoDef = {
  nome: "cartão branco", pega: () => [-14, -12], peso: 0.02,
  Desenho: ({ brilho = 0 }) => (
    <Papel>
      <Rect x={-26} y={-34} width={52} height={34} rx={5} fill="#FAF9F4" stroke={LINHA} strokeWidth={W - 1} />
      <Circle cx={12} cy={-18} r={9} fill="#FFFFFF" stroke={LINHA} strokeWidth={3} />
      <Path d="M 12 -18 L 12 -24 M 12 -18 L 16 -15" stroke={LINHA} strokeWidth={2.5} strokeLinecap="round" />
      <Rect x={-18} y={-26} width={12} height={9} rx={2} fill="#D6D2CA" stroke={LINHA} strokeWidth={2} />
      {brilho > 0 && <Path d={`M ${-30 + brilho * 60} -36 l 10 0 l -18 38 l -10 0 Z`} fill="#FFFFFF" opacity={0.8} />}
    </Papel>
  ),
};

/** metade de cartão preto (caída) */
export const MEIO_CARTAO: ObjetoDef = {
  nome: "metade de cartão", pega: () => [0, -10], peso: 0.01,
  Desenho: ({ cor = "#1A1A1F" }) => (
    <Papel>
      <Path d="M -26 -34 L 2 -34 L -4 -18 L 4 -8 L -2 0 L -26 0 Q -26 0 -26 -4 Z" fill={cor} stroke={LINHA} strokeWidth={W - 1} strokeLinejoin="round" />
    </Papel>
  ),
};

/** biscoito redondo */
export const BISCOITO: ObjetoDef = {
  nome: "biscoito", pega: () => [-10, -10], peso: 0.01,
  Desenho: () => (
    <Papel>
      <Circle cx={0} cy={-12} r={13} fill="#D9A45E" stroke={LINHA} strokeWidth={4} />
      {[[-5, -16], [4, -9], [3, -18], [-4, -7]].map(([x, y], i) => <Circle key={i} cx={x} cy={y} r={2} fill="#6B4226" />)}
    </Papel>
  ),
};

/** colar de diamantes (pendurado na mão) */
export const COLAR: ObjetoDef = {
  nome: "colar", pega: () => [0, -60], peso: 0.02,
  Desenho: () => (
    <Papel>
      <Path d="M -26 -60 Q -30 -10 0 -6 Q 30 -10 26 -60" stroke={LINHA} strokeWidth={7} fill="none" />
      <Path d="M -26 -60 Q -30 -10 0 -6 Q 30 -10 26 -60" stroke="#E4EAF2" strokeWidth={3} fill="none" />
      <Path d="M -10 -8 L 0 -22 L 10 -8 L 0 6 Z" fill="#BFE6F5" stroke={LINHA} strokeWidth={3} strokeLinejoin="round" />
    </Papel>
  ),
};

/** cartão de macarrão feito por criança */
export const CARTAO_MACARRAO: ObjetoDef = {
  nome: "cartão de macarrão", pega: () => [-32, -22], peso: 0.02,
  Desenho: () => (
    <Papel>
      <Rect x={-36} y={-50} width={72} height={50} rx={3} fill="#E37BA1" stroke={LINHA} strokeWidth={W - 1} transform="rotate(-3 0 -25)" />
      <Path d="M -20 -38 q 6 -6 10 0 q 4 6 10 0 M -16 -24 q 14 10 30 -2" stroke="#F2D16B" strokeWidth={6} fill="none" strokeLinecap="round" />
      <Path d="M 14 -40 c 4 -8 14 -2 6 6 l -6 6 l -6 -6 c -8 -8 2 -14 6 -6" fill="#C0504D" stroke={LINHA} strokeWidth={2.5} />
    </Papel>
  ),
};

/** barra de ouro */
export const BARRA_OURO: ObjetoDef = {
  nome: "barra de ouro", pega: () => [-30, -14], peso: 0.5,
  Desenho: () => (
    <Papel>
      <Path d="M -38 0 L -28 -26 L 28 -26 L 38 0 Z" fill="#E3B95B" stroke={LINHA} strokeWidth={W - 1} strokeLinejoin="round" />
      <Path d="M -22 -20 L 6 -20" stroke="#FFF0B8" strokeWidth={4} strokeLinecap="round" />
    </Papel>
  ),
};

/** balão de festa com cordão (pega no fim do cordão) */
export const BALAO: ObjetoDef = {
  nome: "balão", pega: () => [0, 0], peso: 0.01,
  Desenho: ({ cor = "#C0504D", t }) => (
    <g transform={`rotate(${Math.sin(t * 2) * 4})`}>
      <Path d="M 0 0 Q 8 -40 0 -80" stroke={LINHA} strokeWidth={3} fill="none" />
      <Papel>
        <Ellipse cx={0} cy={-118} rx={30} ry={38} fill={cor} stroke={LINHA} strokeWidth={W - 1} />
        <Path d="M -4 -80 L 4 -80 L 0 -86 Z" fill={cor} stroke={LINHA} strokeWidth={3} />
        <Path d="M -14 -132 q 4 -12 14 -14" stroke="#FFFFFF" strokeWidth={5} fill="none" strokeLinecap="round" opacity={0.7} />
      </Papel>
    </g>
  ),
};

/** taça (troféu genérico) */
export const TACA: ObjetoDef = {
  nome: "taça", pega: () => [0, -60], peso: 0.4,
  Desenho: () => (
    <Papel>
      <Path d="M -34 -120 L 34 -120 Q 34 -70 0 -62 Q -34 -70 -34 -120 Z" fill="#E3B95B" stroke={LINHA} strokeWidth={W} strokeLinejoin="round" />
      <Path d="M -34 -110 q -22 4 -14 26 q 6 10 18 8 M 34 -110 q 22 4 14 26 q -6 10 -18 8" stroke={LINHA} strokeWidth={6} fill="none" />
      <Rect x={-6} y={-64} width={12} height={34} fill="#E3B95B" stroke={LINHA} strokeWidth={4} />
      <Rect x={-26} y={-30} width={52} height={30} rx={4} fill="#6E4B35" stroke={LINHA} strokeWidth={W - 1} />
    </Papel>
  ),
};

/** microfone de imprensa */
export const MICROFONE: ObjetoDef = {
  nome: "microfone", pega: () => [0, -20], peso: 0.05,
  Desenho: ({ cor = "#C0504D" }) => (
    <Papel>
      <Rect x={-6} y={-40} width={12} height={40} rx={5} fill="#3A3F4B" stroke={LINHA} strokeWidth={4} />
      <Rect x={-14} y={-50} width={28} height={16} rx={3} fill={cor} stroke={LINHA} strokeWidth={3} />
      <Circle cx={0} cy={-62} r={12} fill="#7C838C" stroke={LINHA} strokeWidth={4} />
    </Papel>
  ),
};

