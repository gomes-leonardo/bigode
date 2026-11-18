import React from "react";
import { Img, staticFile } from "remotion";
import type { Parte, Partes, Pose } from "../rig/types";
import { Arcs } from "./Arcs";

// Rig de recorte da Gotinha. Hierarquia: torso é a raiz; cabeça, braços e coxas são filhos do torso;
// antebraços filhos dos braços; canelas filhas das coxas. Cada parte é um elemento aninhado no pai,
// posicionado com o pivô sobre a âncora do pai e girando com transform-origin no pivô.
// Camadas (dentro do contexto do torso): braço/perna esquerdos atrás (z -1), torso (0),
// perna direita (1), cabeça (2), braço direito (3).

type Props = { parts: Partes; pose: Pose; escala?: number };

const PASTA = "assets/rig/gotinha";

// rotação de tela (graus, horário +) da parte em relação ao pai
const rotacaoLocal = (partes: Partes["partes"], nome: string, r: number) => {
  const p = partes[nome];
  const pai = p.pai![0];
  const repousoPai = pai === "torso" ? 0 : partes[pai].repouso ?? 0;
  // positivo = para frente = anti-horário na tela para um membro pendurado; o repouso endireita a peça
  return -r - (p.repouso ?? 0) + repousoPai;
};

const ParteDiv: React.FC<{ p: Parte; em: [number, number]; rot: number; z: number; children?: React.ReactNode; dy?: number; dx?: number }> = ({ p, em, rot, z, children, dy = 0, dx = 0 }) => (
  <div
    style={{
      position: "absolute",
      left: em[0] - p.pivo[0] + dx,
      top: em[1] - p.pivo[1] + dy,
      width: p.largura,
      height: p.altura,
      transformOrigin: `${p.pivo[0]}px ${p.pivo[1]}px`,
      transform: `rotate(${rot}deg)`,
      zIndex: z,
    }}
  >
    <Img src={staticFile(`${PASTA}/${p.arquivo}`)} style={{ position: "absolute", inset: 0, width: p.largura, height: p.altura }} />
    {children}
  </div>
);

export const Puppet: React.FC<Props> = ({ parts, pose, escala = 1 }) => {
  const P = parts.partes;
  const t = P.torso;
  const membro = (sup: "arm_upper_R" | "arm_upper_L" | "leg_upper_R" | "leg_upper_L", inf: "arm_lower_R" | "arm_lower_L" | "leg_lower_R" | "leg_lower_L", encaixe: [number, number], z: number) => (
    <ParteDiv p={P[sup]} em={encaixe} rot={rotacaoLocal(P, sup, pose[sup])} z={z}>
      <ParteDiv p={P[inf]} em={P[sup].ancora!} rot={rotacaoLocal(P, inf, pose[inf])} z={0} />
    </ParteDiv>
  );
  const cab = P.head;
  const arcos = pose.arcos ?? { mood: "neutral" as const };
  // o tronco escala a partir da base (respiração, squash) e gira em torno do próprio pivô
  const baseTronco: [number, number] = [t.pivo[0], t.altura * 0.92];
  return (
    <div style={{ position: "absolute", left: pose.torso.x, top: pose.torso.y, transform: `scale(${escala})`, transformOrigin: "0 0" }}>
      <div
        style={{
          position: "absolute",
          left: -t.pivo[0],
          top: -t.pivo[1],
          width: t.largura,
          height: t.altura,
          transformOrigin: `${t.pivo[0]}px ${t.pivo[1]}px`,
          transform: `rotate(${pose.torso.rot}deg)`,
          isolation: "isolate", // contexto de camadas próprio: z -1 fica atrás do tronco
        }}
      >
        <div style={{ position: "absolute", inset: 0, transformOrigin: `${baseTronco[0]}px ${baseTronco[1]}px`, transform: `scale(${pose.torso.scaleX}, ${pose.torso.scaleY})`, isolation: "isolate" }}>
          {membro("leg_upper_L", "leg_lower_L", t.quadril_L!, -1)}
          {membro("arm_upper_L", "arm_lower_L", t.ombro_L!, -1)}
          <Img src={staticFile(`${PASTA}/${t.arquivo}`)} style={{ position: "absolute", inset: 0, width: t.largura, height: t.altura, zIndex: 0 }} />
          {membro("leg_upper_R", "leg_lower_R", t.quadril_R!, 1)}
          <ParteDiv p={cab} em={t.pescoco!} rot={pose.head.rot} z={2} dy={pose.head.offsetY} dx={pose.head.offsetX ?? 0}>
            {/* arcos sobre a cabeça, seguindo a rotação dela (estão dentro do div da cabeça) */}
            <svg width={cab.largura} height={cab.altura} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
              <g transform={`translate(${cab.rosto![0]} ${cab.rosto![1]}) scale(1.15)`}>
                <Arcs mood={arcos.mood} de={arcos.de} progresso={arcos.progresso} espessura={7} />
              </g>
            </svg>
          </ParteDiv>
          {membro("arm_upper_R", "arm_lower_R", t.ombro_R!, 3)}
        </div>
      </div>
    </div>
  );
};
