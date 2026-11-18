import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import manifesto from "../assets-manifest.json";
import { COR, H, W } from "../theme";

// Cenário desfocado (blur CSS) com parallax lento conforme a câmera.
// PNG do Flow se existir em assets/cenarios/<nome>.png; senão, formas chapadas vetoriais.
export type NomeBackdrop = "rua" | "quarto-bebe" | "cozinha" | "consultorio" | "laboratorio" | "entardecer";
export type Camera = "pushIn" | "static" | "drift";

const Formas: React.FC<{ nome: NomeBackdrop }> = ({ nome }) => {
  switch (nome) {
    case "rua":
    case "entardecer": {
      const tarde = nome === "entardecer";
      return (
        <svg width={W} height={H}>
          <defs>
            <linearGradient id={`ceu-${nome}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor={tarde ? "#4B2A6B" : "#3A2C66"} />
              <stop offset="0.65" stopColor={tarde ? "#F08A5D" : "#E7A35B"} />
              <stop offset="1" stopColor={tarde ? "#FFC94A" : "#F2C27A"} />
            </linearGradient>
          </defs>
          <rect width={W} height={H} fill={`url(#ceu-${nome})`} />
          <circle cx={tarde ? 1380 : 1500} cy={tarde ? 660 : 300} r={tarde ? 130 : 90} fill="#FFE2A0" opacity={0.85} />
          {[[80, 520, 260, 300], [380, 560, 220, 260], [640, 500, 300, 320], [1200, 540, 260, 280], [1500, 500, 320, 320], [1800, 560, 200, 260]].map(([x, y, w, h], i) => (
            <g key={i} fill={tarde ? "#3B2350" : "#4A3466"} opacity={0.85}>
              <rect x={x} y={y} width={w} height={h} />
              <path d={`M ${x - 20} ${y} L ${x + w / 2} ${y - 90} L ${x + w + 20} ${y} Z`} />
            </g>
          ))}
          <rect y={800} width={W} height={280} fill={tarde ? "#2A1A3E" : "#3A2C55"} />
          <rect y={930} width={W} height={10} fill="#F2C27A" opacity={0.4} />
        </svg>
      );
    }
    case "quarto-bebe":
      return (
        <svg width={W} height={H}>
          <rect width={W} height={H} fill="#22195A" />
          <rect x={1300} y={160} width={340} height={420} rx={20} fill="#3B3290" opacity={0.7} />
          <rect x={1330} y={190} width={280} height={360} fill="#5A54B8" opacity={0.6} />
          {[200, 420, 640].map((x, i) => <circle key={i} cx={x} cy={220 + i * 40} r={50} fill={i === 1 ? COR.rosa : "#4A41A0"} opacity={0.5} />)}
          <rect y={820} width={W} height={260} fill="#1C1448" />
        </svg>
      );
    case "cozinha":
      return (
        <svg width={W} height={H}>
          <rect width={W} height={H} fill="#5A3A4A" />
          <rect x={0} y={640} width={W} height={60} fill="#C98A5A" opacity={0.8} />
          <rect x={0} y={700} width={W} height={380} fill="#3A2232" />
          {[160, 520, 1340, 1700].map((x, i) => <rect key={i} x={x} y={150} width={260} height={300} rx={14} fill="#7A4E5E" opacity={0.7} />)}
          <rect x={860} y={170} width={220} height={260} rx={110} fill="#FFC94A" opacity={0.35} />
        </svg>
      );
    case "consultorio":
      return (
        <svg width={W} height={H}>
          <rect width={W} height={H} fill="#2C3354" />
          <rect x={1250} y={200} width={420} height={480} rx={16} fill="#465078" opacity={0.8} />
          {[0, 1, 2, 3, 4].map((i) => <rect key={i} x={1300} y={250 + i * 80} width={300 - i * 40} height={22} rx={10} fill="#6C77A2" opacity={0.7} />)}
          <rect x={120} y={620} width={700} height={90} rx={20} fill="#56608C" opacity={0.8} />
          <rect y={860} width={W} height={220} fill="#232945" />
        </svg>
      );
    case "laboratorio":
      return (
        <svg width={W} height={H}>
          <rect width={W} height={H} fill="#1E1650" />
          {[200, 520, 840, 1160, 1480].map((x, i) => (
            <g key={i}>
              <rect x={x} y={300 + (i % 2) * 60} width={180} height={360} rx={18} fill="#2E2570" />
              <circle cx={x + 90} cy={280 + (i % 2) * 60} r={40} fill={COR.menta} opacity={0.35} />
            </g>
          ))}
          <rect y={0} width={W} height={120} fill={COR.menta} opacity={0.12} />
          <rect y={800} width={W} height={280} fill="#160F3E" />
        </svg>
      );
  }
};

export const Backdrop: React.FC<{ nome: NomeBackdrop; camera: Camera; zoom?: [number, number] }> = ({ nome, camera, zoom }) => {
  const f = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = f / Math.max(1, durationInFrames);
  // parallax: o fundo anda menos que o primeiro plano
  const dx = camera === "drift" ? interpolate(t, [0, 1], [20, -20]) : 0;
  // 1.06 de margem fixa (o blur escurece as bordas) x o zoom pedido pela cena
  const s = zoom ? 1.06 * interpolate(t, [0, 1], zoom) : camera === "pushIn" ? interpolate(t, [0, 1], [1.08, 1.11]) : 1.08;
  const estilo: React.CSSProperties = { position: "absolute", inset: 0, filter: "blur(7px)", transform: `translateX(${dx}px) scale(${s})` };
  return (
    <AbsoluteFill>
      {(manifesto as string[]).includes(nome) ? (
        <Img src={staticFile(`assets/${nome}.png`)} style={{ ...estilo, width: W, height: H, objectFit: "cover" }} />
      ) : (
        <div style={estilo}>
          <Formas nome={nome} />
        </div>
      )}
      {/* escurece o cenário para o personagem e a legenda saltarem */}
      <AbsoluteFill style={{ background: COR.fundo, opacity: 0.22 }} />
    </AbsoluteFill>
  );
};
