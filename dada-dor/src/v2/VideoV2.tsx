import { Audio } from "@remotion/media";
import React from "react";
import { AbsoluteFill, Sequence, staticFile } from "remotion";
import { Stage } from "../components/Stage";
import { FPS } from "../theme";
import { PlanoCtx, type Plano } from "./kit";
import { PLANOS } from "./planos";
import timeline from "./timeline.json";

// "E se você parasse de sentir dor?" v2: 44 planos na ordem do roteiro, cortes secos, sem legenda.
// O intervalo entre planos (0,45 s) fica com o plano anterior estendido: nunca há quadro vazio.
const T = timeline as { duracao: number; planos: Plano[] };
export const DURACAO_V2 = Math.ceil(T.duracao * FPS);

export const VideoV2: React.FC = () => (
  <Stage>
    {T.planos.map((p, i) => {
      const de = Math.round(p.inicio * FPS);
      const proximo = T.planos[i + 1];
      const ate = proximo ? Math.round(proximo.inicio * FPS) : DURACAO_V2;
      const Comp = PLANOS[p.id];
      return (
        <Sequence key={p.id} name={p.id} from={de} durationInFrames={Math.max(1, ate - de)}>
          <PlanoCtx.Provider value={p}>
            <AbsoluteFill>{Comp ? <Comp /> : null}</AbsoluteFill>
          </PlanoCtx.Provider>
        </Sequence>
      );
    })}
    <Audio src={staticFile("v2/audio.wav")} />
  </Stage>
);
