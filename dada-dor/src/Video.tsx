import { Audio } from "@remotion/media";
import React from "react";
import { AbsoluteFill, interpolate, Sequence, spring as springFn, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import captions from "./captions.json";
import { Backdrop } from "./components/Backdrop";
import { Caption, type Palavra } from "./components/Caption";
import { Character } from "./components/Character";
import { IconField } from "./components/IconField";
import { Prop } from "./components/Prop";
import { Reticle } from "./components/Reticle";
import { SignalPulse } from "./components/SignalPulse";
import { Stage } from "./components/Stage";
import { TitleCard } from "./components/TitleCard";
import { scenes, type Layer, type Scene } from "./scenes";
import { ACCENT, enter, exit, FPS, pushIn, spring } from "./theme";

const q = (s: number) => Math.round(s * FPS);

// Camada com vida: entra com overshoot (0.9 -> 1.0, mola), anda (toX/toY/toScale) e sai mais rápido (6 quadros).
const Camada: React.FC<{ layer: Layer; cena: Scene }> = ({ layer, cena }) => {
  const f = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const cor = ACCENT[cena.accent];
  const entrada = springFn({ frame: f, fps, config: spring, durationInFrames: enter.frames });
  const temSaida = layer.until !== undefined;
  const saida = temSaida ? interpolate(f, [durationInFrames - exit.frames, durationInFrames], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 0;
  const escalaVida = enter.from + (enter.to - enter.from) * entrada - saida * 0.1;
  const opacidade = Math.min(1, f / 3) * (1 - saida);
  const t = interpolate(f, [0, durationInFrames], [0, 1], { extrapolateRight: "clamp" });
  const mover = (de: number, para?: number) => (para === undefined ? de : de + (para - de) * t);

  if (layer.kind === "titleCard") return <TitleCard text={layer.text} cor={cor} />;
  if (layer.kind === "iconField") return <IconField rows={layer.rows} cols={layer.cols} highlightIndex={layer.highlightIndex} apagando={layer.apagando} cor={cor} />;
  if (layer.kind === "signalPulse") return <SignalPulse path={layer.path} durationFrames={layer.durationFrames} inicio={layer.inicio} cor={ACCENT.mint} />;
  if (layer.kind === "reticle") return <Reticle targetX={layer.targetX} targetY={layer.targetY} cor={cor} />;

  const x = mover(layer.x, layer.toX);
  const y = mover(layer.y, layer.toY);
  const escala = mover(layer.scale, layer.toScale);
  return (
    <AbsoluteFill style={{ transformOrigin: `${x}px ${y}px`, transform: `scale(${escalaVida})`, opacity: opacidade }}>
      {layer.kind === "character" ? (
        <Character
          asset={layer.asset}
          pose={layer.pose}
          x={x}
          y={y}
          scale={escala}
          arcs={layer.arcsTo ?? layer.arcs}
          arcsDe={layer.arcsTo ? layer.arcs : undefined}
          arcsTrocaEm={layer.arcsAt !== undefined ? q(layer.arcsAt - (layer.at ?? 0)) : 0}
          espelhar={layer.espelhar}
        />
      ) : (
        <Prop asset={layer.asset} x={x} y={y} scale={escala} animate={layer.animate} rotacao={layer.rotacao} />
      )}
    </AbsoluteFill>
  );
};

// Câmera: push-in lento e contínuo nas falas, drift lateral ou parada; corte seco entre cenas.
const Camera: React.FC<{ tipo: Scene["camera"]; children: React.ReactNode }> = ({ tipo, children }) => {
  const f = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = f / durationInFrames;
  const escala = tipo === "pushIn" ? pushIn.scaleFrom + (pushIn.scaleTo - pushIn.scaleFrom) * t : 1;
  const dx = tipo === "drift" ? interpolate(t, [0, 1], [24, -24]) : 0;
  return <AbsoluteFill style={{ transform: `translateX(${dx}px) scale(${escala})` }}>{children}</AbsoluteFill>;
};

const corDaLegenda = (s: number) => ACCENT[(scenes.find((c) => s >= c.start && s < c.start + c.duration) ?? scenes[scenes.length - 1]).accent];

export const Video: React.FC = () => (
  <Stage>
    {scenes.map((c) => (
      <Sequence key={c.id} name={`Cena ${String(c.id).padStart(2, "0")}`} from={q(c.start)} durationInFrames={q(c.duration)}>
        <Camera tipo={c.camera}>
          {c.backdrop && <Backdrop nome={c.backdrop} camera={c.camera} />}
          {c.layers.map((l, i) => (
            <Sequence key={i} from={q(l.at ?? 0)} durationInFrames={l.until !== undefined ? q(l.until - (l.at ?? 0)) : undefined} layout="absolute-fill">
              <Camada layer={l} cena={c} />
            </Sequence>
          ))}
        </Camera>
      </Sequence>
    ))}
    <Caption palavras={captions as Palavra[]} corDestaque={corDaLegenda} />
    <Audio src={staticFile("narracao.mp3")} />
  </Stage>
);
