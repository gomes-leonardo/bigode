import React from "react";
import { AbsoluteFill } from "remotion";
import { Puppet } from "../components/Puppet";
import { COR, FONTE } from "../theme";
import parts from "./parts.json";
import { POSE_NEUTRA, type Partes, type Pose } from "./types";

// Quadro de teste da Fase 2: o mesmo Puppet em 4 poses (hierarquia, pivôs, camadas e arcos).
const pose = (x: number, extra: Partial<Pose>): Pose => ({ ...POSE_NEUTRA, ...extra, torso: { ...POSE_NEUTRA.torso, x, y: 520, ...(extra.torso ?? {}) } });

const POSES: [string, Pose][] = [
  ["neutra", pose(260, {})],
  ["apontando (curious)", pose(720, { arm_upper_R: 70, arm_lower_R: 5, head: { rot: 8, offsetY: 0 }, arcos: { mood: "curious" } })],
  ["sentada (worried)", pose(1190, { leg_upper_R: 85, leg_lower_R: -80, leg_upper_L: 80, leg_lower_L: -78, torso: { ...POSE_NEUTRA.torso, x: 1190, y: 600, rot: 0, scaleX: 1, scaleY: 1 }, arcos: { mood: "worried" } })],
  ["inclinada + squash (calm)", pose(1650, { torso: { ...POSE_NEUTRA.torso, x: 1650, y: 540, rot: 15, scaleX: 1.12, scaleY: 0.85 }, arm_upper_R: -40, arm_upper_L: 40, arcos: { mood: "calm" } })],
];

export const PuppetTeste: React.FC = () => (
  <AbsoluteFill style={{ background: `linear-gradient(160deg, ${COR.fundo}, ${COR.fundo2})` }}>
    {POSES.map(([nome, p]) => (
      <React.Fragment key={nome}>
        <Puppet parts={parts as unknown as Partes} pose={p} escala={0.95} />
        <div style={{ position: "absolute", left: p.torso.x - 200, width: 400, top: 960, textAlign: "center", color: COR.texto, fontFamily: FONTE, fontWeight: 800, fontSize: 30 }}>{nome}</div>
      </React.Fragment>
    ))}
  </AbsoluteFill>
);
