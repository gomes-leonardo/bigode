import React from "react";
import { useCurrentFrame } from "remotion";
import { Boneco } from "../../../components/Boneco/Boneco";
import { misturar, POSES } from "../../../components/Boneco/poses";
import { Camera } from "../../../components/Camera";
import { PoeiraAmbiente } from "../../../components/cenario/Poeira";
import { TorresGemeas } from "../../../components/cenario/TorresGemeas";
import { X62 } from "../../../theme";
import { na } from "../../../lib/tempo";
import { Chao, Estrelas, Palco, PropsCena, rampa } from "./comum";

// Plano aberto com zoom lento: torres soltando fumaça; na fala "jatos", poeira sai de andares bem abaixo do topo.
export const Cena03Torres: React.FC<PropsCena> = ({ bloco }) => {
  const f = useCurrentFrame();
  const j = na(bloco, "jatos");
  const jatos = [0.62, 0.58, 0.54, 0.5, 0.46, 0.42].flatMap((altura, i) => [
    { torre: 0 as const, altura, lado: -1 as const, inicio: j + i * 8 },
    {
      torre: 1 as const,
      altura: altura - 0.02,
      lado: 1 as const,
      inicio: j + i * 8 + 4,
    },
  ]);
  const aponta = rampa(f, na(bloco, "prova") - 4, na(bloco, "prova") + 8);
  return (
    <Camera zoom={[1.0, 1.2]} origem={[X62, 760]} tremida={1}>
      <Palco>
        <Estrelas seed="c3" />
        <TorresGemeas
          id="c3-torres"
          x={X62 - 180}
          base={1340}
          f={f}
          jatos={jatos}
        />
        <Chao y={1340} />
        <Boneco
          id="c3-teorico"
          x={170}
          chao={1340}
          pose={misturar(POSES.olhandoPraCima, POSES.apontando, aponta)}
          escala={1.25}
        />
        <PoeiraAmbiente quantidade={35} opacidade={0.3} seed="c3p" />
      </Palco>
    </Camera>
  );
};
