import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { FPS } from "../theme";
import { PlanoCtx, type PlanoT } from "../teo/kit";
import { CAPS } from "./planos";
import timeline from "./timeline.json";

// "Já imaginou se você pudesse ver quem está mentindo pra você?" (Téo): planos na ordem do roteiro, cortes secos.
const T = timeline as unknown as { duracao: number; planos: PlanoT[] };
export const DURACAO_MENTIRA = Math.ceil(T.duracao * FPS);

export const VideoMentira: React.FC = () => (
  <AbsoluteFill style={{ background: "#F6ECDA" }}>
    {T.planos.map((p, i) => {
      const de = Math.round(p.inicio * FPS);
      const proximo = T.planos[i + 1];
      const ate = proximo ? Math.round(proximo.inicio * FPS) : DURACAO_MENTIRA;
      const Comp = CAPS[p.id];
      return (
        <Sequence key={p.id} name={p.id} from={de} durationInFrames={Math.max(1, ate - de)}>
          <PlanoCtx.Provider value={p}>
            <AbsoluteFill>{Comp ? <Comp /> : null}</AbsoluteFill>
          </PlanoCtx.Provider>
        </Sequence>
      );
    })}
    <Audio src={staticFile("mentira/audio.mp3")} />
  </AbsoluteFill>
);
