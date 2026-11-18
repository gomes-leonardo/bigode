import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { FPS } from "../theme";
import { CAP1 } from "./cap1";
import { CAP2 } from "./cap2";
import { CAP3 } from "./cap3";
import { CAP4 } from "./cap4";
import { CAP5 } from "./cap5";
import { CAP6 } from "./cap6";
import { CAP7 } from "./cap7";
import { PlanoCtx, type PlanoT } from "./kit";
import timeline from "./timeline.json";

// "E se você parasse de sentir dor?" (Téo): planos na ordem do roteiro, cortes secos, sem legenda.
// O intervalo entre planos fica com o plano anterior estendido: nunca há quadro vazio.
const T = timeline as { duracao: number; planos: PlanoT[] };
export const DURACAO_TEO = Math.ceil(T.duracao * FPS);
const PLANOS: Record<string, React.FC> = { ...CAP1, ...CAP2, ...CAP3, ...CAP4, ...CAP5, ...CAP6, ...CAP7 };

export const VideoTeo: React.FC = () => (
  <AbsoluteFill style={{ background: "#F6ECDA" }}>
    {T.planos.map((p, i) => {
      const de = Math.round(p.inicio * FPS);
      const proximo = T.planos[i + 1];
      const ate = proximo ? Math.round(proximo.inicio * FPS) : DURACAO_TEO;
      const Comp = PLANOS[p.id];
      return (
        <Sequence key={p.id} name={p.id} from={de} durationInFrames={Math.max(1, ate - de)}>
          <PlanoCtx.Provider value={p}>
            <AbsoluteFill>{Comp ? <Comp /> : null}</AbsoluteFill>
          </PlanoCtx.Provider>
        </Sequence>
      );
    })}
    <Audio src={staticFile("teo/audio.wav")} />
  </AbsoluteFill>
);
