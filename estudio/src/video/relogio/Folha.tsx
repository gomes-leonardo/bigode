// Folha de conferência: os doze estilos de relógio e o digital, todos em 10h10.
import React from "react";
import { AbsoluteFill, continueRender, delayRender } from "remotion";
import { fontes } from "../../fontes";
import { Digital, ESTILOS, Relogio } from "./Relogio";

export const FolhaRelogios: React.FC = () => {
  const [h] = React.useState(() => delayRender("fontes"));
  React.useEffect(() => { fontes.then(() => continueRender(h)); }, [h]);
  const nomes = Object.keys(ESTILOS);
  return (
    <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 40%, #2A3346, #0B0E15)" }}>
      <svg width={1080} height={1920}>
        {nomes.map((n, i) => (
          <g key={n} transform={`translate(${180 + (i % 3) * 360} ${200 + Math.floor(i / 3) * 400}) scale(0.42)`}>
            <Relogio estilo={ESTILOS[n]} r={300} />
          </g>
        ))}
        <g transform="translate(540 1820) scale(0.3)"><Digital /></g>
      </svg>
    </AbsoluteFill>
  );
};
