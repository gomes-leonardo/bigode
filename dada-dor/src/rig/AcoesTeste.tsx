import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { Puppet } from "../components/Puppet";
import { COR, FONTE } from "../theme";
import { ACOES } from "./actions";
import parts from "./parts.json";
import type { Partes } from "./types";

// Fase 3: as 10 ações lado a lado (5 x 2), cada uma a partir do quadro 0. walk/run andam no lugar.
const NOMES = Object.keys(ACOES) as (keyof typeof ACOES)[];

export const AcoesTeste: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill style={{ background: `linear-gradient(160deg, ${COR.fundo}, ${COR.fundo2})` }}>
      {NOMES.map((nome, i) => {
        const x = 200 + (i % 5) * 380;
        const y = i < 5 ? 250 : 760;
        const pose = ACOES[nome](f, fps, { x, y, velocidade: 0 });
        return (
          <React.Fragment key={nome}>
            <Puppet parts={parts as unknown as Partes} pose={pose} escala={0.55} />
            <div style={{ position: "absolute", left: x - 150, width: 300, top: y + 200, textAlign: "center", color: COR.texto, fontFamily: FONTE, fontWeight: 800, fontSize: 30 }}>{nome}</div>
          </React.Fragment>
        );
      })}
    </AbsoluteFill>
  );
};
