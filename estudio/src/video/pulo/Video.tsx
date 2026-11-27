// Shorts "todo mundo pulando ao mesmo tempo" (vertical 1080x1920, 30 fps), em motion graphics (SVG). A narração
// (Thalita) e a trilha (scripts/sfx_pulo.py), que começa junto com o vídeo, tocam por baixo. O último plano volta à
// Terra do começo, com a pergunta na tela: o vídeo fecha em loop.
import React from "react";
import { AbsoluteFill, Audio, Sequence, continueRender, delayRender, staticFile, useCurrentFrame } from "remotion";
import { fontes } from "../../fontes";
import { Legendas } from "./legendas";
import { CapaCena, PLANOS } from "./planos";
import { COM_AUDIO, DURACAO, ENTRADA, FPS } from "./tempo";

export const FIM = DURACAO;

const useFontes = () => {
  const [h] = React.useState(() => delayRender("fontes"));
  React.useEffect(() => { fontes.then(() => continueRender(h)); }, [h]);
};

export const VideoPulo: React.FC = () => {
  useFontes();
  const f = useCurrentFrame();
  const p = PLANOS.find((x) => f >= x.de && f < x.ate) ?? PLANOS[PLANOS.length - 1];
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {COM_AUDIO && <Sequence from={Math.round(ENTRADA * FPS)} layout="none"><Audio src={staticFile("audio/pulo-narracao.mp3")} /></Sequence>}
      <Audio src={staticFile("sfx/pulo/efeitos.mp3")} />
      <AbsoluteFill>
        <svg width={1080} height={1920}>
          <p.Cena f={f} />
          <Legendas />
        </svg>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/** a capa: a turma no ar em volta da Terra e "TODO MUNDO PULANDO?", sem legenda */
export const CapaPulo: React.FC = () => {
  useFontes();
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920}><CapaCena /></svg>
    </AbsoluteFill>
  );
};
