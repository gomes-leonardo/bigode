import React from "react";
import { interpolate, spring as springFn, useCurrentFrame, useVideoConfig } from "remotion";
import { H, W, spring } from "../theme";

// Mira que fecha sobre um alvo e trava piscando.
export const Reticle: React.FC<{ targetX: number; targetY: number; cor: string; inicio?: number }> = ({ targetX, targetY, cor, inicio = 20 }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const fecha = springFn({ frame: f - inicio, fps, config: spring, durationInFrames: 30 });
  const raio = interpolate(fecha, [0, 1], [520, 210]);
  const giro = interpolate(fecha, [0, 1], [45, 0]);
  const travou = f > inicio + 32;
  const pisca = travou ? 0.7 + 0.3 * Math.sin(f * 0.5) : 1;
  const canto = (ang: number) => (
    <path key={ang} transform={`rotate(${ang + giro})`} d={`M ${raio} ${raio - 70} L ${raio} ${raio} L ${raio - 70} ${raio}`} stroke={cor} strokeWidth={10} fill="none" strokeLinecap="round" />
  );
  return (
    <svg width={W} height={H} style={{ position: "absolute", inset: 0 }} opacity={Math.min(1, Math.max(0, (f - inicio + 4) / 4)) * pisca}>
      <g transform={`translate(${targetX} ${targetY})`} style={{ filter: `drop-shadow(0 0 10px ${cor})` }}>
        {[0, 90, 180, 270].map(canto)}
        <line x1={-raio - 60} y1={0} x2={-raio + 30} y2={0} stroke={cor} strokeWidth={5} />
        <line x1={raio - 30} y1={0} x2={raio + 60} y2={0} stroke={cor} strokeWidth={5} />
        <line x1={0} y1={-raio - 60} x2={0} y2={-raio + 30} stroke={cor} strokeWidth={5} />
        <line x1={0} y1={raio - 30} x2={0} y2={raio + 60} stroke={cor} strokeWidth={5} />
      </g>
    </svg>
  );
};
