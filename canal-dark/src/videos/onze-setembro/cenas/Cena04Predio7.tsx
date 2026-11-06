import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { Camera } from "../../../components/Camera";
import { Predio } from "../../../components/cenario/Predio";
import { PoeiraAmbiente } from "../../../components/cenario/Poeira";
import { Relogio } from "../../../components/cenario/Relogio";
import { COR, FONTE, X38, X62 } from "../../../theme";
import { na } from "../../../lib/tempo";
import { Chao, Estrelas, Palco, PropsCena, rampa } from "./comum";
import { TorresGemeas } from "../../../components/cenario/TorresGemeas";
import { Poligono } from "../../../components/Rough";

// Três momentos: prédio 7 em contra-plongée -> close no relógio 17h20 -> o mesmo prédio desabando reto.
export const Cena04Predio7: React.FC<PropsCena> = ({ bloco }) => {
  const f = useCurrentFrame();
  const relogioDe = na(bloco, "ele");
  const relogioAte = na(bloco, "muita") + 6;

  if (f >= relogioDe && f < relogioAte) {
    const minuto = interpolate(f, [relogioDe, na(bloco, "20")], [12, 20], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    const seg = (f - relogioDe) / 3; // segundos correndo rápido: tensão
    const rotulo = rampa(f, na(bloco, "20"), na(bloco, "20") + 6);
    return (
      <Camera zoom={[1.1, 1.22]} origem={[X38, 820]} tremida={1.5}>
        <Palco>
          <Relogio
            id="c4-relogio"
            cx={X38}
            cy={820}
            d={640}
            hora={17}
            minuto={minuto}
            segundos={seg}
          />
          <text
            x={X38}
            y={1250}
            fill={COR.vermelho}
            fontFamily={FONTE}
            fontWeight={900}
            fontSize={120}
            textAnchor="middle"
            opacity={rotulo}
            letterSpacing={6}
          >
            17:20
          </text>
          <PoeiraAmbiente quantidade={20} opacidade={0.25} seed="c4r" />
        </Palco>
      </Camera>
    );
  }

  // desce 70% e para: o espectador vê o colapso e o que sobrou (não um quadro vazio)
  const desaba =
    0.7 * rampa(f, na(bloco, "demolição") - 6, na(bloco, "controlada") + 14);
  const fase2 = f >= relogioAte;
  return (
    // contra-plongée: câmera embaixo, prédio afinando para cima; a câmera sobe devagar
    <Camera
      zoom={fase2 ? [1.05, 1.0] : [1.0, 1.06]}
      pan={
        fase2
          ? [
              [0, 0],
              [0, 40],
            ]
          : [
              [0, 80],
              [0, -40],
            ]
      }
      rotacao={[-1, 1]}
      origem={[X62, 1250]}
      tremida={fase2 ? 2.5 + desaba * 5 : 1.2}
      quadros={fase2 ? [relogioAte, 360] : [0, relogioDe]}
    >
      <Palco>
        <Estrelas seed="c4" ateY={700} quantidade={30} />
        {/* as torres ao lado, ao fundo e apagadas: "do lado das torres" */}
        <g opacity={0.45}>
          <TorresGemeas
            id="c4-torres"
            x={90}
            base={1290}
            w={78}
            h={860}
            vao={30}
            f={f}
          />
        </g>
        <Predio
          id="c4-wtc7"
          x={X62 - 220}
          base={1290}
          w={440}
          h={1060}
          andares={47}
          afinamento={0.22}
          rotulo="PRÉDIO 7"
          janelasAcesas={fase2 ? 0 : 8}
          desaba={desaba}
        />
        {desaba > 0.25 && (
          <Poligono
            id="c4-escombros"
            pontos={[
              [X62 - 260, 1290],
              [X62 - 170, 1290 - 90 * desaba],
              [X62 - 60, 1290 - 150 * desaba],
              [X62 + 70, 1290 - 120 * desaba],
              [X62 + 190, 1290 - 70 * desaba],
              [X62 + 270, 1290],
            ]}
            preenchimento={COR.fundo}
            espessura={4}
          />
        )}
        <Chao y={1290} opacidade={0.6} />
        <PoeiraAmbiente quantidade={30} opacidade={0.3} seed="c4p" />
      </Palco>
    </Camera>
  );
};
