// Fase 2: só o mínimo de cenário para o teste de manuseio (parede, bancada e fogão).
// Os cenários de verdade (3 camadas, âncoras, luz, vinheta) são a Fase 4.
import React from "react";
import { CONTORNO, INTERNA, LINHA, escura } from "../estilo";
import { Circle, Line, Papel, Path, Rect } from "../components/prim";

const ARMARIO = "#7FA39A";
const TAMPO = "#E9DFCB";
const FOGAO = "#F3F1EA";
const AZULEJO = "#DDE3DC";

/** chão e rodapé: a base dos móveis fica em `base`; o personagem pisa um pouco à frente (mais baixo na tela) */
export const Chao: React.FC<{ base: number }> = ({ base }) => (
  <g>
    <Rect x={0} y={base} width={1920} height={1080 - base} fill="#DCD5C7" semSombra />
    <Line x1={0} y1={base} x2={1920} y2={base} stroke={LINHA} strokeWidth={INTERNA} semSombra />
  </g>
);

/** azulejos atrás da bancada e do fogão */
export const Azulejos: React.FC<{ x0: number; x1: number; y0: number; y1: number }> = ({ x0, x1, y0, y1 }) => {
  const lado = 46;
  const linhas: React.ReactNode[] = [];
  for (let y = y0 + lado; y < y1; y += lado) linhas.push(<Line key={`h${y}`} x1={x0} y1={y} x2={x1} y2={y} stroke={escura(AZULEJO, 0.9)} strokeWidth={3} semSombra />);
  for (let x = x0 + lado; x < x1; x += lado) linhas.push(<Line key={`v${x}`} x1={x} y1={y0} x2={x} y2={y1} stroke={escura(AZULEJO, 0.9)} strokeWidth={3} semSombra />);
  return (
    <g>
      <Rect x={x0} y={y0} width={x1 - x0} height={y1 - y0} fill={AZULEJO} semSombra />
      {linhas}
      <Rect x={x0} y={y0} width={x1 - x0} height={y1 - y0} fill="none" stroke={LINHA} strokeWidth={INTERNA} semSombra />
    </g>
  );
};

/** bancada: os objetos ficam apoiados em y = topo (no meio da faixa de cima do tampo) */
export const Bancada: React.FC<{ x0: number; x1: number; topo: number; base: number }> = ({ x0, x1, topo, base }) => {
  const n = Math.max(1, Math.round((x1 - x0) / 230));
  const w = (x1 - x0 - 24) / n;
  return (
    <Papel>
      <Rect x={x0 + 12} y={topo + 10} width={x1 - x0 - 24} height={base - topo - 10} fill={ARMARIO} stroke={LINHA} strokeWidth={CONTORNO} strokeLinejoin="round" />
      {Array.from({ length: n }, (_, i) => {
        const px = x0 + 12 + i * w;
        return (
          <g key={i}>
            <Rect x={px + 16} y={topo + 48} width={w - 32} height={base - topo - 92} rx={8} fill="none" stroke={escura(ARMARIO)} strokeWidth={INTERNA} />
            <Rect x={px + w / 2 - 20} y={topo + 64} width={40} height={10} rx={5} fill={LINHA} />
            {i > 0 && <Line x1={px} y1={topo + 24} x2={px} y2={base - 22} stroke={LINHA} strokeWidth={INTERNA} />}
          </g>
        );
      })}
      <Rect x={x0 + 12} y={base - 22} width={x1 - x0 - 24} height={22} fill={escura(ARMARIO, 0.62)} stroke={LINHA} strokeWidth={CONTORNO} />
      {/* tampo: faixa de cima (vista um pouco de cima) + borda da frente */}
      <Path d={`M ${x0 + 8} ${topo - 12} L ${x1 - 8} ${topo - 12} L ${x1} ${topo + 6} L ${x0} ${topo + 6} Z`} fill={TAMPO} stroke={LINHA} strokeWidth={CONTORNO} strokeLinejoin="round" />
      <Rect x={x0} y={topo + 6} width={x1 - x0} height={20} rx={3} fill={escura(TAMPO, 0.82)} stroke={LINHA} strokeWidth={CONTORNO} />
    </Papel>
  );
};

/** fogão de piso: bocas (grelhas) em `bocas`; a panela apoia em topo - 8 */
export const Fogao: React.FC<{ x0: number; x1: number; topo: number; base: number; bocas: number[] }> = ({ x0, x1, topo, base, bocas }) => (
  <Papel>
    {/* espelho de trás com os botões */}
    <Rect x={x0 + 6} y={topo - 92} width={x1 - x0 - 12} height={84} rx={8} fill={FOGAO} stroke={LINHA} strokeWidth={CONTORNO} />
    {[0.18, 0.36, 0.64, 0.82].map((k, i) => (
      <g key={i}>
        <Circle cx={x0 + (x1 - x0) * k} cy={topo - 50} r={13} fill={escura(FOGAO, 0.85)} stroke={LINHA} strokeWidth={INTERNA} />
        <Line x1={x0 + (x1 - x0) * k} y1={topo - 60} x2={x0 + (x1 - x0) * k} y2={topo - 52} stroke={LINHA} strokeWidth={4} strokeLinecap="round" />
      </g>
    ))}
    {/* corpo + forno */}
    <Rect x={x0} y={topo + 6} width={x1 - x0} height={base - topo - 6} rx={6} fill={FOGAO} stroke={LINHA} strokeWidth={CONTORNO} />
    {(() => {
      // porta do forno proporcional à altura do fogão (serve para fogão alto ou baixo)
      const H = base - topo;
      const p0 = topo + 0.3 * H, p1 = base - 0.08 * H, ph = p1 - p0;
      return (
        <>
          <Rect x={x0 + 34} y={p0} width={x1 - x0 - 68} height={ph} rx={10} fill={escura(FOGAO, 0.9)} stroke={LINHA} strokeWidth={INTERNA} />
          <Rect x={x0 + 58} y={p0 + 0.18 * ph} width={x1 - x0 - 116} height={Math.max(8, 0.62 * ph)} rx={8} fill="#3A3A44" stroke={LINHA} strokeWidth={INTERNA} />
          <Path d={`M ${x0 + 70} ${p0 + 0.18 * ph + 14} l 30 0`} stroke="#6A6A78" strokeWidth={4} strokeLinecap="round" />
          <Rect x={x0 + 60} y={topo + 0.16 * H} width={x1 - x0 - 120} height={12} rx={6} fill="#B9BEC6" stroke={LINHA} strokeWidth={INTERNA} />
        </>
      );
    })()}
    {/* tampo do fogão */}
    <Path d={`M ${x0 + 8} ${topo - 12} L ${x1 - 8} ${topo - 12} L ${x1} ${topo + 8} L ${x0} ${topo + 8} Z`} fill={escura(FOGAO, 0.92)} stroke={LINHA} strokeWidth={CONTORNO} strokeLinejoin="round" />
    {bocas.map((bx, i) => (
      <g key={i}>
        <Path d={`M ${bx - 58} ${topo - 2} L ${bx - 52} ${topo - 8} L ${bx + 52} ${topo - 8} L ${bx + 58} ${topo - 2}`} stroke={LINHA} strokeWidth={9} fill="none" strokeLinejoin="round" strokeLinecap="round" />
        <Path d={`M ${bx - 30} ${topo - 8} l 0 6 M ${bx + 30} ${topo - 8} l 0 6`} stroke={LINHA} strokeWidth={6} strokeLinecap="round" />
      </g>
    ))}
  </Papel>
);
