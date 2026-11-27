// Shorts "o mundo do GTA só existe onde você olha" (vertical 1080x1920, 30 fps). A cidade é 3D de verdade (three.js,
// desenhado por software no render), os planos vêm de planos.tsx, a legenda e as etiquetas vão por cima em SVG.
import React from "react";
import { ThreeCanvas } from "@remotion/three";
import { AbsoluteFill, Audio, Sequence, continueRender, delayRender, staticFile, useCurrentFrame } from "remotion";
import { fontes } from "../../fontes";
import { Legendas } from "./legendas";
import { CameraSync } from "./pecas";
import { MOMENTOS, PLANOS } from "./planos";
import { COM_AUDIO, DURACAO, ENTRADA, FPS } from "./tempo";

export const FIM = DURACAO;

const Efeitos: React.FC = () => (
  <>
    {MOMENTOS.giros.map((g, i) => (
      <Sequence key={`g${i}`} from={Math.max(0, g - 2)} durationInFrames={13} layout="none"><Audio src={staticFile("sfx/whoosh.wav")} volume={0.45} /></Sequence>
    ))}
    {MOMENTOS.trocas.map((g, i) => (
      <Sequence key={`t${i}`} from={g} durationInFrames={6} layout="none"><Audio src={staticFile("sfx/clique.wav")} volume={0.6} /></Sequence>
    ))}
    <Sequence from={MOMENTOS.apaga} durationInFrames={17} layout="none"><Audio src={staticFile("sfx/baque.wav")} volume={0.5} /></Sequence>
  </>
);

export const VideoGtaMundo: React.FC = () => {
  const [h] = React.useState(() => delayRender("fontes"));
  React.useEffect(() => { fontes.then(() => continueRender(h)); }, [h]);
  const f = useCurrentFrame();
  const p = PLANOS.find((x) => f >= x.de && f < x.ate) ?? PLANOS[PLANOS.length - 1];
  const q = p.quadro(f);
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {COM_AUDIO && <Sequence from={Math.round(ENTRADA * FPS)} layout="none"><Audio src={staticFile("audio/gtamundo-narracao.mp3")} /></Sequence>}
      <Efeitos />
      <ThreeCanvas width={1080} height={1920} shadows flat gl={{ antialias: true }} camera={{ fov: 60, near: 0.1, far: 4000 }}>
        <CameraSync cam={q.cam} />
        {q.cena}
      </ThreeCanvas>
      <AbsoluteFill>
        <svg width={1080} height={1920}>
          {q.sobre}
          <Legendas />
        </svg>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
