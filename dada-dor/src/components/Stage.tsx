import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { COR, H, W } from "../theme";

// Fundo #1A1333 com gradiente leve para #241A4A, vinheta e grão sutil (overlay, opacidade baixa).
// Tudo que é cena fica dentro dele.
export const Stage: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const f = useCurrentFrame();
  const semente = f % 6;
  return (
    <AbsoluteFill style={{ background: `linear-gradient(160deg, ${COR.fundo} 0%, ${COR.fundo2} 100%)`, overflow: "hidden" }}>
      {children}
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 75% 70% at 50% 50%, rgba(0,0,0,0) 55%, rgba(8,4,20,0.65) 100%)", pointerEvents: "none" }} />
      <svg width={W} height={H} style={{ position: "absolute", inset: 0, mixBlendMode: "overlay", opacity: 0.14, pointerEvents: "none" }}>
        <filter id={`grao-${semente}`}>
          <feTurbulence type="fractalNoise" baseFrequency={0.9} numOctaves={2} seed={semente} stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width={W} height={H} filter={`url(#grao-${semente})`} />
      </svg>
    </AbsoluteFill>
  );
};
