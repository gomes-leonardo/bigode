import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { H, W } from "../theme";

// Campo de silhuetas em opacidade baixa com um único item aceso (cenas de dado).
// apagando: cada silhueta some num momento diferente (cena 19).
// Silhueta pequena de figurante (cabeça de gota + corpo).
const Silhueta: React.FC<{ x: number; y: number; s: number; cor: string; opacidade: number; brilho?: boolean }> = ({ x, y, s, cor, opacidade, brilho }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={opacidade} style={brilho ? { filter: `drop-shadow(0 0 14px ${cor})` } : undefined}>
    <path d="M 0 -100 C 14 -100 50 -50 50 -10 C 50 18 28 30 0 30 C -28 30 -50 18 -50 -10 C -50 -50 -14 -100 0 -100 Z" fill={cor} />
    <path d="M -34 34 L 34 34 L 40 110 L -40 110 Z" fill={cor} />
  </g>
);

export const IconField: React.FC<{ rows: number; cols: number; highlightIndex: number; apagando?: boolean; cor: string }> = ({ rows, cols, highlightIndex, apagando, cor }) => {
  const f = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const larguraUtil = 1500;
  const passoX = larguraUtil / cols;
  const passoY = Math.min(170, 640 / rows);
  const s = Math.min(passoX / 130, passoY / 230) * (rows === 1 ? 1.6 : 1);
  const x0 = (W - passoX * (cols - 1)) / 2;
  const y0 = (H - 160 - passoY * (rows - 1)) / 2;
  return (
    <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
      {Array.from({ length: rows * cols }, (_, i) => {
        const r = Math.floor(i / cols), c = i % cols;
        const destaque = i === highlightIndex;
        const atraso = (r + c) * 1.5;
        const entra = Math.min(1, Math.max(0, (f - atraso) / 6));
        // linha que apaga: cada silhueta some num momento diferente (a destacada resiste até o fim)
        const ordem = (i * 7) % (rows * cols);
        const some = apagando && !destaque ? interpolate(f, [durationInFrames * (0.15 + 0.6 * (ordem / (rows * cols))), durationInFrames * (0.2 + 0.6 * (ordem / (rows * cols)))], [1, 0.05], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 1;
        const pulso = destaque ? 0.85 + 0.15 * Math.sin(f * 0.15) : 1;
        return <Silhueta key={i} x={x0 + c * passoX} y={y0 + r * passoY} s={s * (destaque ? 1.08 * pulso : 1)} cor={destaque ? cor : "#8F86C8"} opacidade={(destaque ? 1 : 0.25) * entra * some} brilho={destaque} />;
      })}
    </svg>
  );
};

