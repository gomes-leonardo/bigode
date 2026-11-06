import React from "react";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Camera } from "../../../components/Camera";
import { DocumentoAntigo } from "../../../components/cenario/Papeis";
import { PoeiraAmbiente } from "../../../components/cenario/Poeira";
import { na } from "../../../lib/tempo";
import { Palco, PropsCena, punchesDoBloco, rampa } from "./comum";

// Close: documento antigo sai da pasta; ruído e flicker crescem até o corte final (o Overlay cuida do ruído).
export const Cena09Documento: React.FC<PropsCena> = ({ bloco }) => {
  const f = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const saida = rampa(f, 8, na(bloco, "assinado"));
  const carimbo = rampa(f, na(bloco, "real"), na(bloco, "real") + 4);
  const corte = interpolate(
    f,
    [durationInFrames - 6, durationInFrames - 1],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  return (
    <AbsoluteFill style={{ opacity: corte }}>
      <Camera
        zoom={[1.0, 1.08]}
        punch={punchesDoBloco(bloco)}
        origem={[540, 760]}
        tremida={1.2 + rampa(f, 200, durationInFrames) * 5}
      >
        <Palco>
          <DocumentoAntigo
            id="c9-doc"
            x={190}
            y={330}
            w={700}
            h={900}
            saida={saida}
            carimbo={carimbo}
          />
          <PoeiraAmbiente quantidade={35} opacidade={0.35} seed="c9" />
        </Palco>
      </Camera>
    </AbsoluteFill>
  );
};
