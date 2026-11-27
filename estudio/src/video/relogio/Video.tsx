// Shorts "por que todo relógio de propaganda marca 10h10" (vertical 1080x1920, 30 fps). Planos 2,5D em SVG presos às
// falas, legenda grande embaixo, um tique de relógio quando os ponteiros andam, e a narração quando chegar.
import React from "react";
import { AbsoluteFill, Audio, Sequence, continueRender, delayRender, staticFile, useCurrentFrame } from "remotion";
import { fontes } from "../../fontes";
import { PLANOS } from "./planos";
import { COM_AUDIO, CORTE, DURACAO, ENTRADA, FPS } from "./tempo";
import { Legendas } from "./legendas";

export const FIM = DURACAO;

// tique de relógio enquanto os ponteiros andam (planos 14, 15, 18 e 19)
const TIQUES: number[] = [];
for (const n of [14, 15, 18, 19]) {
  const p = PLANOS.find((x) => x.n === n)!;
  for (let f = p.de + 2; f < p.ate - 2; f += 5) TIQUES.push(f);
}

export const VideoRelogio: React.FC = () => {
  const [h] = React.useState(() => delayRender("fontes"));
  React.useEffect(() => { fontes.then(() => continueRender(h)); }, [h]);
  const f = useCurrentFrame();
  const p = PLANOS.find((x) => f >= x.de && f < x.ate) ?? PLANOS[PLANOS.length - 1];
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {COM_AUDIO && <Sequence from={Math.round(ENTRADA * FPS)} layout="none"><Audio src={staticFile("audio/relogio-narracao.mp3")} /></Sequence>}
      {TIQUES.map((t, i) => (
        <Sequence key={i} from={t} durationInFrames={3} layout="none"><Audio src={staticFile("sfx/tique.wav")} volume={0.3} /></Sequence>
      ))}
      <AbsoluteFill>
        <svg width={1080} height={1920}>
          <p.Cena f={f} />
          <Legendas />
        </svg>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export const _corte = CORTE;
