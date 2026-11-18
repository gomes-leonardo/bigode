import React, { useMemo } from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { FONTE } from "../theme";

// Uma palavra por vez em destaque, sobre a linha completa em opacidade menor, sincronizada por captions.json.
// Sombra colorida na cor de destaque da cena, nunca preta. Terço inferior.
export type Palavra = { word: string; start: number; end: number };

const MAX_POR_LINHA = 7;
export const montarLinhas = (palavras: Palavra[]) => {
  const linhas: Palavra[][] = [];
  let atual: Palavra[] = [];
  palavras.forEach((p, i) => {
    atual.push(p);
    const prox = palavras[i + 1];
    const fimFrase = /[.?!:]$/.test(p.word);
    const virgula = /,$/.test(p.word) && atual.length >= 4;
    const pausa = prox && prox.start - p.end > 0.35;
    if (!prox || fimFrase || virgula || pausa || atual.length >= MAX_POR_LINHA) {
      linhas.push(atual);
      atual = [];
    }
  });
  return linhas;
};

export const Caption: React.FC<{ palavras: Palavra[]; corDestaque: (s: number) => string }> = ({ palavras, corDestaque }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = f / fps;
  const linhas = useMemo(() => montarLinhas(palavras), [palavras]);
  const i = linhas.findIndex((l, k) => t >= l[0].start - 0.05 && t < (linhas[k + 1]?.[0].start ?? Infinity) - 0.05);
  if (i < 0) return null;
  const linha = linhas[i];
  if (t > linha[linha.length - 1].end + 0.8) return null; // pausa longa: some
  const cor = corDestaque(t);
  return (
    <div style={{ position: "absolute", left: 160, right: 160, bottom: 90, display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "0 16px", fontFamily: FONTE, fontWeight: 800, fontSize: 58, lineHeight: 1.25 }}>
      {linha.map((p, k) => {
        const ativa = t >= p.start - 0.03 && (t < p.end + 0.05 || k === linha.length - 1);
        const ja = t >= p.start - 0.03;
        const sobe = interpolate(t, [p.start - 0.03, p.start + 0.12], [0.92, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        return (
          <span
            key={k}
            style={{
              color: "#FFFFFF",
              opacity: ativa ? 1 : ja ? 0.75 : 0.32,
              transform: `scale(${ativa ? sobe : 1})`,
              display: "inline-block",
              textShadow: ativa ? `0 0 22px ${cor}, 0 4px 0 ${cor}99` : `0 3px 0 ${cor}55`,
            }}
          >
            {p.word}
          </span>
        );
      })}
    </div>
  );
};
