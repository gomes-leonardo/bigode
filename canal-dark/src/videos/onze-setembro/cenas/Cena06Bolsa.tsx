import React from "react";
import { useCurrentFrame } from "remotion";
import { Boneco } from "../../../components/Boneco/Boneco";
import { misturar, POSES } from "../../../components/Boneco/poses";
import { Camera } from "../../../components/Camera";
import { GraficoQueda } from "../../../components/cenario/GraficoQueda";
import { PoeiraAmbiente } from "../../../components/cenario/Poeira";
import { X38 } from "../../../theme";
import { na } from "../../../lib/tempo";
import { Palco, PropsCena, punchesDoBloco, rampa } from "./comum";

// Plano médio: gráfico das aéreas despencando; homem de terno na sombra, no canto.
export const Cena06Bolsa: React.FC<PropsCena> = ({ bloco }) => {
  const f = useCurrentFrame();
  const progresso = rampa(f, na(bloco, "dias"), na(bloco, "aéreas") + 10);
  const maos = rampa(f, na(bloco, "apostou") - 4, na(bloco, "apostou") + 10);
  return (
    <Camera
      zoom={[1.02, 1.1]}
      pan={[
        [-20, 0],
        [10, -10],
      ]}
      punch={punchesDoBloco(bloco)}
      origem={[X38, 880]}
      tremida={1.2}
    >
      <Palco>
        <defs>
          <radialGradient id="c6-sombra" cx="0.74" cy="0.6" r="0.22">
            <stop offset="0" stopColor="#000" stopOpacity={0.55} />
            <stop offset="1" stopColor="#000" stopOpacity={0} />
          </radialGradient>
        </defs>
        <GraficoQueda
          id="c6-grafico"
          x={X38 - 300}
          y={560}
          w={600}
          h={620}
          progresso={progresso}
          rotulo="AÇÕES · CIAS AÉREAS"
        />
        <Boneco
          id="c6-terno"
          x={800}
          chao={1330}
          pose={misturar(POSES.emPe, POSES.maosNaCintura, maos)}
          escala={2.0}
          terno
          cor="#bdb8ad"
          espessura={4.5}
          espelhar
        />
        <rect x={0} y={0} width={1080} height={1920} fill="url(#c6-sombra)" />
        <PoeiraAmbiente quantidade={25} opacidade={0.25} seed="c6" />
      </Palco>
    </Camera>
  );
};
