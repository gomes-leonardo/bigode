import React from "react";
import { Img, staticFile } from "remotion";
import type { Parte, Partes, Pose } from "../rig/types";
import { Arcs } from "./Arcs";

// Rig de recorte da Gotinha. Hierarquia: torso é a raiz; cabeça, braços e coxas são filhos do torso;
// antebraços filhos dos braços; canelas filhas das coxas. Cada parte é um elemento aninhado no pai,
// posicionado com o pivô sobre a âncora do pai e girando com transform-origin no pivô.
// Camadas (dentro do contexto do torso): braço/perna esquerdos atrás (z -1), torso (0),
// perna direita (1), cabeça (2), braço direito (3).

// extras: desenhos presos a uma parte (coordenadas em px da imagem da parte): acessórios do elenco
export type Extras = { cabeca?: React.ReactNode; tronco?: React.ReactNode; maoR?: React.ReactNode; maoL?: React.ReactNode };
type Props = { parts: Partes; pose: Pose; escala?: number; variante?: string; espelhar?: boolean; semArcos?: boolean; extras?: Extras };

// rotação de tela (graus, horário +) da parte em relação ao pai
const rotacaoLocal = (partes: Partes["partes"], nome: string, r: number) => {
  const p = partes[nome];
  const pai = p.pai![0];
  const repousoPai = pai === "torso" ? 0 : partes[pai].repouso ?? 0;
  // positivo = para frente = anti-horário na tela para um membro pendurado; o repouso endireita a peça
  return -r - (p.repouso ?? 0) + repousoPai;
};

const ParteDiv: React.FC<{ p: Parte; pasta: string; em: [number, number]; rot: number; z: number; children?: React.ReactNode; dy?: number; dx?: number }> = ({ p, pasta, em, rot, z, children, dy = 0, dx = 0 }) => (
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
    <Img src={staticFile(`${pasta}/${p.arquivo}`)} style={{ position: "absolute", inset: 0, width: p.largura, height: p.altura }} />
    {children}
  </div>
);

// camada SVG no sistema de px de uma parte, para desenhar acessórios presos a ela
const Camada: React.FC<{ p: Parte; children?: React.ReactNode }> = ({ p, children }) =>
  children ? (
    <svg width={p.largura} height={p.altura} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
      {children}
    </svg>
  ) : null;

export const Puppet: React.FC<Props> = ({ parts, pose, escala = 1, variante = "gotinha", espelhar = false, semArcos = false, extras = {} }) => {
  const P = parts.partes;
  const PASTA = `assets/rig/${variante}`;
  const t = P.torso;
  const membro = (sup: "arm_upper_R" | "arm_upper_L" | "leg_upper_R" | "leg_upper_L", inf: "arm_lower_R" | "arm_lower_L" | "leg_lower_R" | "leg_lower_L", encaixe: [number, number], z: number) => (
    <ParteDiv p={P[sup]} pasta={PASTA} em={encaixe} rot={rotacaoLocal(P, sup, pose[sup])} z={z}>
      <ParteDiv p={P[inf]} pasta={PASTA} em={P[sup].ancora!} rot={rotacaoLocal(P, inf, pose[inf])} z={0}>
        <Camada p={P[inf]}>{inf === "arm_lower_R" ? extras.maoR : inf === "arm_lower_L" ? extras.maoL : null}</Camada>
      </ParteDiv>
    </ParteDiv>
  );
  const cab = P.head;
  const arcos = pose.arcos ?? { mood: "neutral" as const };
  // o tronco escala a partir da base (respiração, squash) e gira em torno do próprio pivô
  const baseTronco: [number, number] = [t.pivo[0], t.altura * 0.92];
  return (
    <div style={{ position: "absolute", left: pose.torso.x, top: pose.torso.y, transform: `scale(${espelhar ? -escala : escala}, ${escala})`, transformOrigin: "0 0" }}>
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
          <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
            <Img src={staticFile(`${PASTA}/${t.arquivo}`)} style={{ position: "absolute", inset: 0, width: t.largura, height: t.altura }} />
            <Camada p={t}>{extras.tronco}</Camada>
          </div>
          {membro("leg_upper_R", "leg_lower_R", t.quadril_R!, 1)}
          <ParteDiv p={cab} pasta={PASTA} em={t.pescoco!} rot={pose.head.rot} z={2} dy={pose.head.offsetY} dx={pose.head.offsetX ?? 0}>
            {/* arcos sobre a cabeça, seguindo a rotação dela (estão dentro do div da cabeça) */}
            <svg width={cab.largura} height={cab.altura} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
              {!semArcos && (
                <g transform={`translate(${cab.rosto![0]} ${cab.rosto![1]}) scale(1.15)`}>
                  <Arcs mood={arcos.mood} de={arcos.de} progresso={arcos.progresso} espessura={7} />
                </g>
              )}
              {extras.cabeca}
            </svg>
          </ParteDiv>
          {membro("arm_upper_R", "arm_lower_R", t.ombro_R!, 3)}
        </div>
      </div>
    </div>
  );
};
