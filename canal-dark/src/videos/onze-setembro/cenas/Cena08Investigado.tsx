import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Boneco } from "../../../components/Boneco/Boneco";
import { POSES } from "../../../components/Boneco/poses";
import { Camera } from "../../../components/Camera";
import { Carimbo, PilhaRelatorios } from "../../../components/cenario/Papeis";
import { PoeiraAmbiente } from "../../../components/cenario/Poeira";
import { Linha, Poligono, Retangulo, Trilha } from "../../../components/Rough";
import { COR, FONTE, X38 } from "../../../theme";
import { na } from "../../../lib/tempo";
import { Chao, Palco, PropsCena, rampa } from "./comum";

// Plano médio, luz mais fria: pilha de relatórios, carimbo INVESTIGADO; o ícone no topo muda com cada explicação.
const Icone: React.FC<{
  qual: "fogo" | "predio" | "apostas" | "falhas";
  f: number;
}> = ({ qual, f }) => {
  if (qual === "fogo")
    return (
      <Poligono
        id="c8-chama"
        pontos={[
          [-60, 70],
          [-50, 0],
          [-20, -30],
          [-10, -90 + Math.sin(f * 0.4) * 8],
          [15, -30],
          [40, -70 + Math.sin(f * 0.5) * 6],
          [60, 0],
          [60, 70],
        ]}
        espessura={6}
      />
    );
  if (qual === "predio")
    return (
      <g>
        <Retangulo id="c8-pred" x={-50} y={-90} w={100} h={160} espessura={6} />
        {[0, 1, 2, 3].map((i) => (
          <Linha
            key={i}
            id={`c8-pa${i}`}
            de={[-40, -60 + i * 34]}
            ate={[40, -60 + i * 34]}
            espessura={3}
            opacidade={0.6}
            tracoUnico
          />
        ))}
      </g>
    );
  if (qual === "apostas")
    return (
      <Trilha
        id="c8-graf"
        pontos={[
          [-80, -60],
          [-40, -40],
          [-10, -70],
          [20, 10],
          [50, 50],
          [80, 70],
        ]}
        espessura={7}
      />
    );
  return (
    <g>
      <Poligono
        id="c8-alerta"
        pontos={[
          [0, -90],
          [85, 70],
          [-85, 70],
        ]}
        cor={COR.vermelho}
        espessura={8}
      />
      <text
        x={0}
        y={52}
        fill={COR.vermelho}
        fontFamily={FONTE}
        fontWeight={900}
        fontSize={110}
        textAnchor="middle"
      >
        !
      </text>
    </g>
  );
};

export const Cena08Investigado: React.FC<PropsCena> = ({ bloco }) => {
  const f = useCurrentFrame();
  const bate = na(bloco, "investigações") + 6;
  const carimbo = rampa(f, bate, bate + 4);
  const qual =
    f >= na(bloco, "falhas")
      ? "falhas"
      : f >= na(bloco, "apostas")
        ? "apostas"
        : f >= na(bloco, "incêndio")
          ? "predio"
          : "fogo";
  const iconeVisivel = f >= na(bloco, "fogo") - 4;
  return (
    <>
      <Camera
        zoom={[1.0, 1.1]}
        pan={[
          [20, 0],
          [-20, 0],
        ]}
        origem={[X38, 900]}
        tremida={1}
      >
        <Palco>
          <PilhaRelatorios id="c8-pilha" x={X38 - 230} base={1300} w={460}>
            {iconeVisivel && <Icone qual={qual} f={f} />}
          </PilhaRelatorios>
          <Carimbo
            id="c8-carimbo"
            x={X38}
            y={640}
            texto="INVESTIGADO"
            tamanho={64}
            progresso={carimbo}
          />
          <Chao y={1300} opacidade={0.5} />
          <Boneco
            id="c8-perito"
            x={840}
            chao={1300}
            pose={{ ...POSES.segurando, cabeca: -12 }}
            escala={2.1}
            espelhar
          />
          <Retangulo
            id="c8-prancheta"
            x={755}
            y={960}
            w={70}
            h={90}
            espessura={4}
            preenchimento={COR.fundo}
            tracoUnico
          />
          <PoeiraAmbiente quantidade={25} opacidade={0.25} seed="c8" />
        </Palco>
      </Camera>
      {/* luz mais fria nesta cena */}
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(180deg, rgba(120,160,255,0.10), rgba(120,160,255,0.04))",
          mixBlendMode: "screen",
        }}
      />
    </>
  );
};
