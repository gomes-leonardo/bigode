import { Audio } from "@remotion/media";
import React from "react";
import { AbsoluteFill, Easing, Img, interpolate, spring as springFn, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import captions from "../captions.json";
import { Arcs, type ArcMood } from "../components/Arcs";
import { Backdrop } from "../components/Backdrop";
import { Caption, type Palavra } from "../components/Caption";
import { Stage } from "../components/Stage";
import { ACCENT, pushIn } from "../theme";
import mapaArcos from "./arcos-poses.json";

// Cena 01 (0 a 8 s): animação pose a pose com os PNGs do Flow (fundo removido em assets/personagens/limpo/).
// Sem fade entre poses: sempre corte seco ou mola.

export type NomePose = "dada-bike" | "dada-queda" | "dada-sentada";
type InfoArcos = { centro: [number, number]; distancia: number; angulo: number; largura_arco: number; altura_arco: number; cor_cabeca: string };
const ARCOS = mapaArcos as unknown as Record<NomePose, InfoArcos>;

const IMG_W = 1376; // tamanho original dos PNGs
const IMG_H = 768;
const K = 1.15; // escala dos PNGs no quadro
// mesmo enquadramento para as 3 poses: personagem centrado em x, pés acima da faixa da legenda
const IMG_X = 960 - 688 * K;
const IMG_Y = 860 - 680 * K;

const CORTE_QUEDA = 75; // 2,5 s
const CORTE_SENTADA = 96; // 3,2 s
const MOLA_QUEDA = { damping: 8, stiffness: 140 };
const PONTO_IMPACTO: [number, number] = [560, 560]; // px da imagem dada-queda, onde o corpo bate no chão

const palavra = (inicio: string) => (captions as Palavra[]).find((p) => p.word.toLowerCase().startsWith(inicio))!;

// Cobre os arcos pintados no PNG com uma elipse da cor da cabeça e desenha os Arcs animados por cima.
// Cor: a medida na própria cabeça de cada PNG (o #1A1333 do spec fica mais escuro e aparece como mancha).
// A elipse é recortada pela silhueta do PNG (máscara de alfa), então nunca vaza para fora da cabeça.
const RostoAnimado: React.FC<{ pose: NomePose; mood: ArcMood; de?: ArcMood; trocaEm?: number }> = ({ pose, mood, de, trocaEm }) => {
  const a = ARCOS[pose];
  const s = a.distancia / 68; // Arcs tem os arcos a ±34 unidades do centro
  const rx = a.distancia / 2 + a.largura_arco / 2 + 14; // folga para cobrir o brilho dos arcos pintados
  const ry = a.altura_arco / 2 + 16;
  const mascara = `silhueta-${pose}`;
  return (
    <>
      <defs>
        <mask id={mascara} maskUnits="userSpaceOnUse" x={0} y={0} width={IMG_W} height={IMG_H} style={{ maskType: "alpha" }}>
          <image href={staticFile(`assets/limpo/${pose}.png`)} x={0} y={0} width={IMG_W} height={IMG_H} />
        </mask>
      </defs>
      <ellipse cx={a.centro[0]} cy={a.centro[1]} rx={rx} ry={ry} fill={a.cor_cabeca} transform={`rotate(${a.angulo} ${a.centro[0]} ${a.centro[1]})`} mask={`url(#${mascara})`} />
      <g transform={`translate(${a.centro[0]} ${a.centro[1]}) rotate(${a.angulo})`}>
        <g transform={`scale(${s})`}>
          <Arcs mood={mood} de={de} trocaEm={trocaEm} espessura={9} />
        </g>
      </g>
    </>
  );
};

// PNG da pose + rosto, no sistema de coordenadas da imagem (1376x768), com transform próprio da pose.
export const Pose: React.FC<{ pose: NomePose; transform: string; origem: [number, number]; mood: ArcMood; de?: ArcMood; trocaEm?: number }> = ({ pose, transform, origem, mood, de, trocaEm }) => (
  <div style={{ position: "absolute", left: IMG_X, top: IMG_Y, width: IMG_W * K, height: IMG_H * K, transformOrigin: `${origem[0] * K}px ${origem[1] * K}px`, transform }}>
    <Img src={staticFile(`assets/limpo/${pose}.png`)} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
    <svg viewBox={`0 0 ${IMG_W} ${IMG_H}`} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", overflow: "visible" }}>
      <RostoAnimado pose={pose} mood={mood} de={de} trocaEm={trocaEm} />
    </svg>
  </div>
);

// 5 círculos de poeira nascendo no ponto de impacto: escala 0 -> 1 e somem em 12 quadros.
const Poeira: React.FC<{ desde: number }> = ({ desde }) => {
  const f = useCurrentFrame() - desde;
  if (f < 0 || f > 12) return null;
  const t = f / 12;
  const escala = interpolate(f, [0, 12], [0, 1], { easing: Easing.out(Easing.cubic) });
  const [px, py] = [IMG_X + PONTO_IMPACTO[0] * K, IMG_Y + PONTO_IMPACTO[1] * K];
  return (
    <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
      {[-2, -1, 0, 1, 2].map((i) => {
        const ang = (-90 + i * 32) * (Math.PI / 180);
        const dist = 90 + Math.abs(i) * 26;
        return (
          <circle
            key={i}
            cx={px + Math.cos(ang) * dist * escala * 1.4}
            cy={py + Math.sin(ang) * dist * escala * 0.55}
            r={(52 - Math.abs(i) * 7) * escala}
            fill="#E9D3B8"
            opacity={1 - t}
          />
        );
      })}
    </svg>
  );
};

export const Cena01: React.FC = () => {
  const f = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // ---- câmera (o palco inteiro; o cenário tem seu próprio push-in 1.0 -> 1.04) ----
  let zoomCamera = 1;
  if (f >= CORTE_QUEDA && f < CORTE_SENTADA) {
    zoomCamera = interpolate(f, [CORTE_QUEDA, CORTE_QUEDA + 6], [1, 1.08], { extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  } else if (f >= CORTE_SENTADA) {
    zoomCamera = interpolate(f, [CORTE_SENTADA, durationInFrames], [pushIn.scaleFrom, 1.04], { easing: Easing.inOut(Easing.sin) });
  } else {
    zoomCamera = interpolate(f, [0, CORTE_QUEDA], [1, 1.02], { easing: Easing.inOut(Easing.sin) });
  }

  // ---- pose 1: bike entrando da esquerda, bobbing 4 px a 3 Hz e rotação ±2° no mesmo ritmo ----
  const entra = interpolate(f, [0, 66], [-1500, 0], { extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  const fase = (f / fps) * 2 * Math.PI * 3;
  const bike = `translate(${entra}px, ${Math.sin(fase) * 4}px) rotate(${Math.sin(fase) * 2}deg)`;

  // ---- pose 2: queda com mola (damping 8, stiffness 140); squash X 0.95 por 4 quadros no impacto ----
  const fq = f - CORTE_QUEDA;
  const mola = springFn({ frame: fq, fps, config: MOLA_QUEDA });
  const giro = -15 + 25 * mola;
  const desce = 40 * mola;
  // impacto = primeiro quadro em que a mola chega ao alvo
  let impacto = 0;
  while (impacto < 30 && springFn({ frame: impacto, fps, config: MOLA_QUEDA }) < 1) impacto++;
  const squash = fq >= impacto && fq < impacto + 4 ? 0.95 : 1;
  const queda = `translateY(${desce}px) rotate(${giro}deg) scaleX(${squash})`;

  // ---- pose 3: sentada, stretch 1.0 -> 1.04 -> 1.0 em 8 quadros ----
  const fs = f - CORTE_SENTADA;
  const stretch = interpolate(fs, [0, 4, 8], [1, 1.04, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.quad) });
  const sentada = `scaleY(${stretch})`;
  // curious quando ela "olha o machucado" (tempo da palavra na narração)
  // (quadro global: os Arcs leem o quadro da composição)
  const curiosaEm = Math.max(CORTE_SENTADA + 10, Math.round(palavra("olha").start * fps));
  return (
    <Stage>
      <AbsoluteFill style={{ transformOrigin: "960px 600px", transform: `scale(${zoomCamera})` }}>
        <Backdrop nome="rua" camera="pushIn" zoom={[1.0, 1.04]} />
        {f < CORTE_QUEDA && <Pose pose="dada-bike" transform={bike} origem={[688, 640]} mood="neutral" />}
        {f >= CORTE_QUEDA && f < CORTE_SENTADA && <Pose pose="dada-queda" transform={queda} origem={[600, 420]} mood="neutral" />}
        {f >= CORTE_QUEDA && f < CORTE_SENTADA && <Poeira desde={CORTE_QUEDA + impacto} />}
        {f >= CORTE_SENTADA && <Pose pose="dada-sentada" transform={sentada} origem={[688, 696]} mood="curious" de="neutral" trocaEm={curiosaEm} />}
      </AbsoluteFill>
      <Caption palavras={(captions as Palavra[]).filter((p) => p.start < durationInFrames / fps)} corDestaque={() => ACCENT.coral} />
      <Audio src={staticFile("narracao.mp3")} />
    </Stage>
  );
};
