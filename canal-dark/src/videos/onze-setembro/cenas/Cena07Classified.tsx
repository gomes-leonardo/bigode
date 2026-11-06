import React from "react";
import { random, useCurrentFrame } from "remotion";
import { Boneco } from "../../../components/Boneco/Boneco";
import { misturar, POSES } from "../../../components/Boneco/poses";
import { Camera } from "../../../components/Camera";
import { PoeiraAmbiente } from "../../../components/cenario/Poeira";
import { PortaClassified } from "../../../components/cenario/PortaClassified";
import { X62 } from "../../../theme";
import { na } from "../../../lib/tempo";
import { Chao, Palco, PropsCena, punchesDoBloco, rampa } from "./comum";

// Close: porta CLASSIFIED; o homem de óculos escuros, de costas, vira a cabeça para a câmera em "inside".
export const Cena07Classified: React.FC<PropsCena> = ({ bloco }) => {
  const f = useCurrentFrame();
  const vira = rampa(f, na(bloco, "inside") - 2, na(bloco, "inside") + 12);
  const pose = misturar(
    POSES.deCostas,
    { ...POSES.emPe, cabeca: -4, olhar: 0 },
    vira,
  );
  const luz =
    0.45 +
    0.35 * Math.sin(f * 0.15) +
    (random(`c7-luz-${Math.floor(f / 4)}`) > 0.85 ? 0.3 : 0) +
    rampa(f, na(bloco, "sabia"), na(bloco, "participou")) * 0.4;
  return (
    <Camera
      zoom={[1.05, 1.16]}
      punch={punchesDoBloco(bloco)}
      origem={[X62, 820]}
      tremida={1.3}
    >
      <Palco>
        <PortaClassified
          id="c7-porta"
          x={110}
          base={1230}
          w={360}
          h={780}
          luz={Math.min(1, luz)}
        />
        <Chao y={1230} opacidade={0.5} />
        <Boneco
          id="c7-agente"
          x={X62}
          chao={1230}
          pose={pose}
          escala={2.6}
          terno
          oculosEscuros
          espessura={6}
        />
        <PoeiraAmbiente
          quantidade={30}
          opacidade={0.35}
          seed="c7"
          area={[60, 500, 500, 900]}
        />
      </Palco>
    </Camera>
  );
};
