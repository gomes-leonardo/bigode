import React from "react";
import { random, useCurrentFrame } from "remotion";
import { Boneco } from "../../../components/Boneco/Boneco";
import { misturar, POSES } from "../../../components/Boneco/poses";
import { Camera } from "../../../components/Camera";
import { PoeiraAmbiente } from "../../../components/cenario/Poeira";
import { Retangulo } from "../../../components/Rough";
import { COR, X38 } from "../../../theme";
import { na } from "../../../lib/tempo";
import { Chao, Estrelas, Palco, PropsCena } from "./comum";

// Plano médio: fileira de bonecos; levantam a cabeça um depois do outro (nunca juntos).
const XS = [X38 - 270, X38, X38 + 165, X38 + 315, X38 + 460]; // último longe da UI da direita

export const Cena02Milhoes: React.FC<PropsCena> = ({ bloco }) => {
  const f = useCurrentFrame();
  const inicio = na(bloco, "milhões") - 8;
  return (
    <Camera
      zoom={[1.04, 1.12]}
      pan={[
        [30, 0],
        [-30, -10],
      ]}
      origem={[X38, 900]}
      tremida={1}
    >
      <Palco>
        <Estrelas seed="c2" ateY={900} />
        {/* skyline ao fundo */}
        {Array.from({ length: 9 }, (_, i) => (
          <Retangulo
            key={i}
            id={`c2-sky${i}`}
            x={-20 + i * 125}
            y={980 - random(`c2-h${i}`) * 260}
            w={110}
            h={400}
            cor={COR.tracoApagado}
            espessura={3}
            opacidade={0.45}
            preenchimento={COR.fundo}
            tracoUnico
          />
        ))}
        <Chao y={1290} />
        {XS.map((x, i) => {
          const a = inicio + i * 13 + Math.round(random(`c2-atraso${i}`) * 5);
          const t = Math.min(1, Math.max(0, (f - a) / 12));
          const pose = misturar(
            POSES.emPe,
            POSES.olhandoPraCima,
            t * t * (3 - 2 * t),
          );
          return (
            <Boneco
              key={i}
              id={`c2-b${i}`}
              x={x}
              chao={1290}
              pose={pose}
              escala={i === 1 ? 2.5 : 2.15}
              espelhar={i % 2 === 1}
            />
          );
        })}
        <PoeiraAmbiente quantidade={25} opacidade={0.25} seed="c2p" />
      </Palco>
    </Camera>
  );
};
