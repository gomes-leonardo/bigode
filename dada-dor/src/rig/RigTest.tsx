import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { Backdrop } from "../components/Backdrop";
import { Puppet } from "../components/Puppet";
import { Stage } from "../components/Stage";
import { COR, FONTE } from "../theme";
import { blend, fall, idle, point, sit, transicao, walk, type Acao } from "./actions";
import parts from "./parts.json";
import type { Partes, Pose } from "./types";

// Fase 4: 12 s na rua. idle 2 s -> walk 4 s cruzando a tela -> point 2 s (curious) -> fall 2 s -> sit 2 s (worried).
// Troca de ação = blend de BLEND quadros entre a ação que sai (continuando) e a que entra. Nada de fade.
const ESCALA = 0.8;
const CHAO_TORSO = 660; // y do pivô do tronco com ela em pé (pés por volta de y 920)
const X0 = 260;
const VELOCIDADE = 300; // px/s andando
const BLEND = 10;

type Trecho = { nome: string; inicio: number; fim: number; acao: Acao; params: (fps: number) => { x: number; y: number; mood?: "neutral" | "curious" | "worried" | "calm"; velocidade?: number } };

const xFimWalk = X0 + VELOCIDADE * 4;
const TRECHOS: Trecho[] = [
  { nome: "idle", inicio: 0, fim: 2, acao: idle, params: () => ({ x: X0, y: CHAO_TORSO }) },
  { nome: "walk", inicio: 2, fim: 6, acao: walk, params: () => ({ x: X0, y: CHAO_TORSO, velocidade: VELOCIDADE }) },
  { nome: "point", inicio: 6, fim: 8, acao: point, params: () => ({ x: xFimWalk, y: CHAO_TORSO, mood: "curious" }) },
  { nome: "fall", inicio: 8, fim: 10, acao: fall, params: () => ({ x: xFimWalk, y: CHAO_TORSO, mood: "curious" }) },
  // sentada no chão: o tronco desce o comprimento vertical da coxa
  { nome: "sit", inicio: 10, fim: 12, acao: sit, params: () => ({ x: xFimWalk + 20, y: CHAO_TORSO + 95 * ESCALA, mood: "worried" }) },
];

const poseNoTempo = (frame: number, fps: number): { pose: Pose; nome: string } => {
  const t = frame / fps;
  const i = Math.max(0, TRECHOS.findIndex((tr) => t >= tr.inicio && t < tr.fim));
  const atual = TRECHOS[i === -1 ? TRECHOS.length - 1 : i];
  const fAtual = frame - Math.round(atual.inicio * fps);
  const poseAtual = atual.acao(fAtual, fps, atual.params(fps));
  const anterior = TRECHOS[i - 1];
  if (!anterior || fAtual >= BLEND) return { pose: poseAtual, nome: atual.nome };
  // a ação que sai continua rodando enquanto mistura com a que entra
  const poseAnterior = anterior.acao(frame - Math.round(anterior.inicio * fps), fps, anterior.params(fps));
  return { pose: blend(poseAnterior, poseAtual, transicao(fAtual, 0, BLEND)), nome: `${anterior.nome} → ${atual.nome}` };
};

export const RigTest: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { pose, nome } = poseNoTempo(f, fps);
  return (
    <Stage>
      <Backdrop nome="rua" camera="pushIn" zoom={[1.0, 1.04]} />
      <AbsoluteFill>
        <Puppet parts={parts as unknown as Partes} pose={pose} escala={ESCALA} />
      </AbsoluteFill>
      <div style={{ position: "absolute", left: 60, top: 50, fontFamily: FONTE, fontWeight: 800, fontSize: 40, color: COR.texto, textShadow: `0 3px 0 ${COR.menta}99` }}>{nome}</div>
    </Stage>
  );
};
