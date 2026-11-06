import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Camera } from "../../../components/Camera";
import {
  Pentagono,
  verticePentagono,
} from "../../../components/cenario/Pentagono";
import { RastroCeu } from "../../../components/cenario/RastroCeu";
import { Linha } from "../../../components/Rough";
import { COR, X38 } from "../../../theme";
import { na } from "../../../lib/tempo";
import { Palco, PropsCena, rampa } from "./comum";

// Plano aberto visto de cima: o rastro cruza o céu e chega ao Pentágono em "míssil".
export const Cena05Pentagono: React.FC<PropsCena> = ({ bloco }) => {
  const f = useCurrentFrame();
  const cx = X38,
    cy = 980,
    r = 300,
    rot = 6;
  const alvo = verticePentagono(cx, cy, r, rot, 1);
  const chegada = na(bloco, "míssil");
  const progresso = rampa(f, 20, chegada);
  const impacto = rampa(f, chegada, chegada + 6);
  const flash = interpolate(
    f,
    [chegada, chegada + 2, chegada + 8],
    [0, 0.55, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  return (
    <>
      <Camera zoom={[1.0, 1.12]} rotacao={[0, 5]} origem={[cx, cy]} tremida={1}>
        <Palco>
          {/* vias ao redor, como em mapa */}
          <Linha
            id="c5-via1"
            de={[-50, 1420]}
            ate={[1130, 1300]}
            espessura={3}
            opacidade={0.35}
          />
          <Linha
            id="c5-via2"
            de={[-50, 560]}
            ate={[1130, 690]}
            espessura={3}
            opacidade={0.35}
          />
          <Linha
            id="c5-via3"
            de={[860, -50]}
            ate={[760, 1970]}
            espessura={3}
            opacidade={0.35}
          />
          <Pentagono
            id="c5-pent"
            cx={cx}
            cy={cy}
            r={r}
            rot={rot}
            impacto={impacto}
          />
          <RastroCeu
            id="c5-rastro"
            de={[1180, 180]}
            controle={[980, 760]}
            ate={alvo}
            progresso={progresso}
          />
        </Palco>
      </Camera>
      <AbsoluteFill style={{ background: COR.traco, opacity: flash }} />
    </>
  );
};
