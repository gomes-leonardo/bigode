import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

type Props = {
  children: React.ReactNode;
  zoom?: [number, number]; // zoom lento: do início ao fim da cena
  pan?: [[number, number], [number, number]]; // deslocamento em px, do início ao fim
  rotacao?: [number, number]; // graus
  tremida?: number; // amplitude em px (0 = parada)
  punch?: number[]; // quadros (relativos à cena) com zoom-punch 1.0 -> 1.15 em 4 quadros
  origem?: [number, number]; // ponto de origem do zoom em px
  quadros?: [number, number]; // janela do movimento lento (padrão: cena inteira)
};

// Zoom-punch: sobe 15% em 4 quadros e assenta em +5% ao longo de ~1 s.
export const fatorPunch = (f: number, momentos: number[]) =>
  momentos.reduce((acc, p) => {
    if (f < p) return acc;
    const sobe = interpolate(f, [p, p + 4], [0, 0.15], {
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.quad),
    });
    const assenta = interpolate(f, [p + 4, p + 34], [0, 0.1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.inOut(Easing.quad),
    });
    return acc * (1 + sobe - assenta);
  }, 1);

export const Camera: React.FC<Props> = ({
  children,
  zoom = [1, 1.06],
  pan = [
    [0, 0],
    [0, 0],
  ],
  rotacao = [0, 0],
  tremida = 1.5,
  punch = [],
  origem = [540, 960],
  quadros,
}) => {
  const f = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const [a, b] = quadros ?? [0, durationInFrames];
  const t = interpolate(f, [a, b], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.sin),
  });
  const z = (zoom[0] + (zoom[1] - zoom[0]) * t) * fatorPunch(f, punch);
  const px = pan[0][0] + (pan[1][0] - pan[0][0]) * t;
  const py = pan[0][1] + (pan[1][1] - pan[0][1]) * t;
  const r = rotacao[0] + (rotacao[1] - rotacao[0]) * t;
  // tremida de câmera na mão: soma de senoides (contínua, determinística)
  const tx = tremida * (Math.sin(f * 0.21) + 0.6 * Math.sin(f * 0.53 + 1.3));
  const ty = tremida * (Math.sin(f * 0.17 + 2.1) + 0.6 * Math.sin(f * 0.41));
  // punch também dá um solavanco curto
  const solavanco = punch.some((p) => f >= p && f < p + 6)
    ? f % 2
      ? 5
      : -5
    : 0;
  return (
    <AbsoluteFill
      style={{
        transformOrigin: `${origem[0]}px ${origem[1]}px`,
        transform: `translate(${px + tx + solavanco}px, ${py + ty}px) scale(${z}) rotate(${r}deg)`,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};
