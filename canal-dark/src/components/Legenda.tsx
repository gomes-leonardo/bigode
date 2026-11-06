import React, { useMemo } from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { tremor, useBoilTick } from "../lib/boil";
import type { Palavra } from "../lib/tempo";
import { COR, FONTE, H, SEGURO, W } from "../theme";

// Legenda palavra por palavra a partir dos timestamps. Palavras-chave (destaque) em vermelho.
// Fica no terço inferior, acima da UI do TikTok (250 px livres embaixo, 150 px à direita).
type Props = { palavras: Palavra[]; tamanho?: number; maxPorPagina?: number };

const quebraDepois = (p: Palavra, prox?: Palavra) =>
  /[.?!…,:]$/.test(p.text) || (prox && prox.startMs - p.endMs > 450);

export const paginar = (palavras: Palavra[], max: number) => {
  const paginas: Palavra[][] = [];
  let atual: Palavra[] = [];
  palavras.forEach((p, i) => {
    atual.push(p);
    const prox = palavras[i + 1];
    // não separa uma expressão destacada ("nenhum avião") em duas páginas
    const juntoComProx = p.destaque && prox?.destaque;
    if (
      !juntoComProx &&
      (atual.length >= max || quebraDepois(p, prox) || !prox)
    ) {
      paginas.push(atual);
      atual = [];
    }
  });
  return paginas;
};

export const Legenda: React.FC<Props> = ({
  palavras,
  tamanho = 80,
  maxPorPagina = 4,
}) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const tick = useBoilTick();
  const ms = (f / fps) * 1000;
  const paginas = useMemo(
    () => paginar(palavras, maxPorPagina),
    [palavras, maxPorPagina],
  );
  const idx = paginas.findIndex(
    (pg, i) =>
      // sem antecipar: a frase nova só aparece junto com o corte/fala (antes ela caía sobre a cena anterior)
      ms >= pg[0].startMs && ms < (paginas[i + 1]?.[0].startMs ?? Infinity),
  );
  if (idx < 0) return null;
  const pagina = paginas[idx];
  // some se a fala parou há mais de 1,2 s (pausas, troca de bloco)
  if (ms > pagina[pagina.length - 1].endMs + 1200) return null;

  return (
    <div
      style={{
        position: "absolute",
        left: SEGURO.esquerda,
        width: W - SEGURO.esquerda - SEGURO.direita,
        bottom: SEGURO.baixo + 40,
        height: H * 0.22,
        display: "flex",
        flexWrap: "wrap",
        alignContent: "flex-end",
        justifyContent: "center",
        gap: "4px 22px",
        fontFamily: FONTE,
        fontWeight: 900,
        fontSize: tamanho,
        lineHeight: 1.08,
        textTransform: "uppercase",
        textAlign: "center",
      }}
    >
      {pagina.map((p, i) => {
        const ativa = ms >= p.startMs - 40;
        const pop = interpolate(
          ms,
          [p.startMs - 40, p.startMs + 90],
          [0.86, 1],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
        );
        const [dx, dy] = tremor(tick, `leg-${idx}-${i}`, 1.2);
        return (
          <span
            key={i}
            style={{
              opacity: ativa ? 1 : 0.32,
              color: ativa && p.destaque ? COR.vermelho : COR.traco,
              transform: `translate(${dx}px, ${dy}px) scale(${ativa ? pop : 1})`,
              WebkitTextStroke: "14px #000",
              paintOrder: "stroke fill",
              textShadow: "0 6px 18px rgba(0,0,0,.9)",
              display: "inline-block",
            }}
          >
            {p.text}
          </span>
        );
      })}
    </div>
  );
};
