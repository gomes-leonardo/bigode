// Shorts "quase nenhum som que você ouve é real" (vertical 1080x1920, 30 fps). Em SVG; a narração (Thalita) e a
// trilha de efeitos sintetizada (scripts/sfx_som.py), que começa junto com o vídeo, tocam por baixo.
import React from "react";
import { AbsoluteFill, Audio, Sequence, continueRender, delayRender, staticFile, useCurrentFrame } from "remotion";
import { fontes } from "../../fontes";
import { Legendas } from "./legendas";
import { PLANOS } from "./planos";
import { COM_AUDIO, DURACAO, ENTRADA, FPS } from "./tempo";

export const FIM = DURACAO;

export const VideoSom: React.FC = () => {
  const [h] = React.useState(() => delayRender("fontes"));
  React.useEffect(() => { fontes.then(() => continueRender(h)); }, [h]);
  const f = useCurrentFrame();
  const p = PLANOS.find((x) => f >= x.de && f < x.ate) ?? PLANOS[PLANOS.length - 1];
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {COM_AUDIO && <Sequence from={Math.round(ENTRADA * FPS)} layout="none"><Audio src={staticFile("audio/som-narracao.mp3")} /></Sequence>}
      <Audio src={staticFile("sfx/som/efeitos.mp3")} />
      <AbsoluteFill>
        <svg width={1080} height={1920}>
          <p.Cena f={f} />
          <Legendas />
        </svg>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
