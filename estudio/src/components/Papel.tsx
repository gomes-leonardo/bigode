// Sombra de papel (cópia #D6D2CA deslocada 5px à direita e 6px para baixo), fundo creme e granulado.
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { FUNDO } from "../estilo";

export { Papel } from "./prim";

/** granulado leve por cima de tudo: pontinhos pretos e brancos de 3 a 7% de opacidade, que mudam a cada 2 quadros */
export const Granulado: React.FC<{ largura?: number; altura?: number }> = ({ largura = 1920, altura = 1080 }) => {
  const f = useCurrentFrame();
  const semente = Math.floor(f / 2) % 997;
  return (
    <svg width={largura} height={altura} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      <filter id={`grao-${semente}`} x="0" y="0" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={semente} result="ruido" />
        <feColorMatrix in="ruido" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -2.2 1.25" result="pretos" />
        <feComponentTransfer in="pretos"><feFuncA type="linear" slope="0.07" /></feComponentTransfer>
      </filter>
      <rect width={largura} height={altura} filter={`url(#grao-${semente})`} />
      <filter id={`grao-b-${semente}`} x="0" y="0" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={1} seed={semente + 31} result="ruido" />
        <feColorMatrix in="ruido" type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 2.4 -1.3" />
        <feComponentTransfer><feFuncA type="linear" slope="0.05" /></feComponentTransfer>
      </filter>
      <rect width={largura} height={altura} filter={`url(#grao-b-${semente})`} />
    </svg>
  );
};

/** palco: fundo creme, as defs de papel e o granulado por cima */
export const Palco: React.FC<{ children: React.ReactNode; fundo?: string }> = ({ children, fundo = FUNDO }) => (
  <AbsoluteFill style={{ background: fundo }}>
    <svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{ position: "absolute", inset: 0 }}>
      {children}
    </svg>
    <Granulado />
  </AbsoluteFill>
);
