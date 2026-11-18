import { Audio } from "@remotion/media";
import React from "react";
import { AbsoluteFill, Easing, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import captions from "../captions.json";
import { Pose } from "../cena01/Cena01";
import { Backdrop } from "../components/Backdrop";
import { Caption, type Palavra } from "../components/Caption";
import { Prop } from "../components/Prop";
import { Stage } from "../components/Stage";
import tempos from "../tempos.json";
import { ACCENT, pushIn } from "../theme";

// Cena 05: Gotinha pequena sentada comendo, um fio de sangue no canto da boca (cozinha.png do Flow).
const T = tempos.find((t) => t.id === 5)!;
const PALAVRAS = (captions as Palavra[])
  .filter((p) => p.start >= T.start - 0.05 && p.start < T.start + T.duration)
  .map((p) => ({ ...p, start: p.start - T.start, end: p.end - T.start }));

export const DURACAO_CENA05 = Math.round(T.duration * 30);
const DESLOCA_X = -230; // Gotinha um pouco à esquerda; o prato à direita

export const Cena05: React.FC = () => {
  const f = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const zoom = interpolate(f, [0, durationInFrames], [pushIn.scaleFrom, pushIn.scaleTo], { easing: Easing.inOut(Easing.sin) });
  // gota de sangue aparece em "sangrar" e escorre devagar
  const sangrar = PALAVRAS.find((p) => p.word.toLowerCase().startsWith("sangrar"));
  const aGota = Math.round((sangrar?.start ?? 2.2) * fps);
  const escorre = interpolate(f, [aGota, aGota + 40], [0, 26], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  return (
    <Stage>
      <AbsoluteFill style={{ transformOrigin: "760px 560px", transform: `scale(${zoom})` }}>
        <Backdrop nome="cozinha" camera="drift" zoom={[1.0, 1.03]} />
        <Pose pose="dada-sentada" transform={`translateX(${DESLOCA_X}px)`} origem={[688, 696]} mood="calm" />
        <Prop asset="prato" x={1120} y={845} scale={0.85} />
        {f >= aGota && <Prop asset="gota" x={960 - 688 * 1.15 + 760 * 1.15 + DESLOCA_X} y={860 - 680 * 1.15 + 430 * 1.15 + escorre} scale={0.15} />}
      </AbsoluteFill>
      <Caption palavras={PALAVRAS} corDestaque={() => ACCENT.coral} />
      <Audio src={staticFile("narracao.mp3")} trimBefore={Math.round(T.start * fps)} />
    </Stage>
  );
};
