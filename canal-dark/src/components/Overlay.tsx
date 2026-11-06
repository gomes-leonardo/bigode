import React from "react";
import { AbsoluteFill, interpolate, random, useCurrentFrame } from "remotion";
import { H, W } from "../theme";

// Clima por cima de tudo: grão animado + flicker de brilho + vinheta.
// intensidade 1 = normal; >1 aumenta grão e flicker (ex.: final do vídeo).
// estaticaEm: quadros de corte que recebem 3 quadros de estática visual.
type Props = { intensidade?: number; estaticaEm?: number[] };

export const Overlay: React.FC<Props> = ({
  intensidade = 1,
  estaticaEm = [],
}) => {
  const f = useCurrentFrame();
  const semente = f % 12;
  const flicker =
    (random(`flicker-${f}`) - 0.5) * 0.08 * intensidade +
    (random(`flk-${Math.floor(f / 7)}`) > 0.93 ? 0.08 : 0);
  const estatica = estaticaEm.find((c) => f >= c && f < c + 3);
  const forcaEstatica = estatica !== undefined ? 1 - (f - estatica) / 3 : 0;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <svg
        width={W}
        height={H}
        style={{
          position: "absolute",
          mixBlendMode: "screen",
          opacity: Math.min(0.5, 0.13 * intensidade + forcaEstatica * 0.5),
        }}
      >
        <filter id={`grao-${semente}`}>
          <feTurbulence
            type="fractalNoise"
            baseFrequency={0.85}
            numOctaves={2}
            seed={semente}
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width={W} height={H} filter={`url(#grao-${semente})`} />
      </svg>
      {forcaEstatica > 0 &&
        Array.from({ length: 7 }, (_, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: random(`faixa-${f}-${i}`) * H,
              height: 6 + random(`faixa-h-${f}-${i}`) * 40,
              background: "#fff",
              opacity: 0.12 * forcaEstatica,
              transform: `translateX(${(random(`faixa-x-${f}-${i}`) - 0.5) * 80}px)`,
            }}
          />
        ))}
      <AbsoluteFill
        style={{
          background: flicker > 0 ? "#fff" : "#000",
          opacity: Math.abs(flicker),
        }}
      />
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 80% 62% at 50% 46%, rgba(0,0,0,0) 45%, rgba(0,0,0,${interpolate(intensidade, [1, 3], [0.72, 0.92], { extrapolateRight: "clamp" })}) 100%)`,
        }}
      />
    </AbsoluteFill>
  );
};
