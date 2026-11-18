import React from "react";
import { AbsoluteFill, spring as springFn, useCurrentFrame, useVideoConfig } from "remotion";
import { COR, FONTE, enter, spring } from "../theme";

// Cartela de título: entra com overshoot (escala 0.9 -> 1.0 com mola).
const useEntrada = (atraso = 0) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = springFn({ frame: f - atraso, fps, config: spring, durationInFrames: enter.frames });
  return { escala: enter.from + (enter.to - enter.from) * s, opacidade: Math.min(1, Math.max(0, (f - atraso) / 3)) };
};

export const TitleCard: React.FC<{ text: string; cor: string }> = ({ text, cor }) => {
  const { escala, opacidade } = useEntrada(4);
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", paddingBottom: 120 }}>
      <div
        style={{
          fontFamily: FONTE,
          fontWeight: 900,
          fontSize: 112,
          lineHeight: 1.05,
          color: COR.texto,
          textAlign: "center",
          textTransform: "uppercase",
          maxWidth: 1500,
          transform: `scale(${escala})`,
          opacity: opacidade,
          textShadow: `0 6px 0 ${cor}, 0 0 40px ${cor}88`,
        }}
      >
        {text}
      </div>
    </AbsoluteFill>
  );
};

