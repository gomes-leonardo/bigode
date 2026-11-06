import React from "react";
import { useCurrentFrame } from "remotion";
import { Boneco } from "../../../components/Boneco/Boneco";
import { andar, misturar, POSES } from "../../../components/Boneco/poses";
import { Camera } from "../../../components/Camera";
import { Predio } from "../../../components/cenario/Predio";
import { TorresGemeas } from "../../../components/cenario/TorresGemeas";
import { PoeiraAmbiente } from "../../../components/cenario/Poeira";
import { X62 } from "../../../theme";
import { na } from "../../../lib/tempo";
import {
  Chao,
  Estrelas,
  Palco,
  PropsCena,
  punchesDoBloco,
  rampa,
} from "./comum";

// Plano aberto: prédio no escuro, sem avião, rachando. Zoom-punch em "nenhum".
export const Cena01Gancho: React.FC<PropsCena> = ({ bloco }) => {
  const f = useCurrentFrame();
  const racha = rampa(f, na(bloco, "terceiro") - 6, na(bloco, "nenhum") + 4);
  const chegou = rampa(f, 0, 70);
  const olha = rampa(f, 70, 84);
  const passante = misturar(
    andar(POSES.emPe, f * 0.32, 1 - chegou),
    POSES.olhandoPraCima,
    olha,
  );
  const w = 300;
  return (
    <Camera
      zoom={[1.0, 1.08]}
      punch={punchesDoBloco(bloco)}
      origem={[X62, 820]}
      tremida={1.2}
    >
      <Palco>
        <Estrelas />
        {/* Torres Gêmeas ao longe, apagadas e soltando fumaça, para situar */}
        <g opacity={0.55}>
          <TorresGemeas
            id="c1-torres"
            x={110}
            base={1240}
            w={64}
            h={640}
            vao={26}
            f={f}
          />
        </g>
        <Predio
          id="c1-wtc7"
          rotulo="PRÉDIO 7"
          x={X62 - w / 2}
          base={1240}
          w={w}
          h={860}
          andares={22}
          racha={racha}
          janelasAcesas={6}
        />
        <Chao y={1240} />
        <Boneco
          id="c1-passante"
          x={250 + chegou * 120}
          chao={1240}
          pose={passante}
          escala={1.15}
        />
        <PoeiraAmbiente quantidade={30} opacidade={0.3} seed="c1" />
      </Palco>
    </Camera>
  );
};
