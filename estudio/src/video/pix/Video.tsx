// Shorts "o país que para sem Pix" (vertical 1080x1920, 30 fps), em motion graphics (SVG). A narração (Thalita) e a
// trilha (scripts/sfx_pix.py), que começa junto com o vídeo, tocam por baixo. O último plano repete o primeiro, com a
// barrinha de sinal em zero: o vídeo fecha em loop.
import React from "react";
import { AbsoluteFill, Audio, Sequence, continueRender, delayRender, staticFile, useCurrentFrame } from "remotion";
import { fontes } from "../../fontes";
import { Legendas } from "./legendas";
import { Abertura, PLANOS } from "./planos";
import { COM_AUDIO, DURACAO, ENTRADA, FPS } from "./tempo";

export const FIM = DURACAO;

const useFontes = () => {
  const [h] = React.useState(() => delayRender("fontes"));
  React.useEffect(() => { fontes.then(() => continueRender(h)); }, [h]);
};

export const VideoPix: React.FC = () => {
  useFontes();
  const f = useCurrentFrame();
  const p = PLANOS.find((x) => f >= x.de && f < x.ate) ?? PLANOS[PLANOS.length - 1];
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {COM_AUDIO && <Sequence from={Math.round(ENTRADA * FPS)} layout="none"><Audio src={staticFile("audio/pix-narracao.mp3")} /></Sequence>}
      <Audio src={staticFile("sfx/pix/efeitos.mp3")} />
      <AbsoluteFill>
        <svg width={1080} height={1920}>
          <p.Cena f={f} />
          <Legendas />
        </svg>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/** a capa: o plano 1 com a pergunta inteira, o celular já sem sinal, sem legenda */
export const CapaPix: React.FC = () => {
  useFontes();
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920}><Abertura f={0} capa /></svg>
    </AbsoluteFill>
  );
};
