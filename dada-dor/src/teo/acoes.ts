// Ações do Téo em coordenadas de mundo, com os pés presos no chão (nada de patinar).
import { spring } from "remotion";
import { POSE_NEUTRA } from "../rig/types";
import { ALTURA_QUADRIL, G, PERNA, ikPerna, local, type PoseTeo } from "./tira";

const TAU = Math.PI * 2;

export const base = (x: number, y: number): PoseTeo => ({
  ...POSE_NEUTRA,
  torso: { ...POSE_NEUTRA.torso, x, y },
  head: { rot: 0, offsetY: 0 },
  arm_upper_R: 6,
  arm_lower_R: 12,
  arm_upper_L: -6,
  arm_lower_L: 12,
  leg_upper_R: 0,
  leg_lower_R: 0,
  leg_upper_L: 0,
  leg_lower_L: 0,
  pe_R: 0,
  pe_L: 0,
});

const respira = (pose: PoseTeo, t: number) => {
  const r = 0.5 - 0.5 * Math.cos(TAU * 0.5 * t);
  pose.torso.scaleY = 1 + 0.015 * r;
  pose.head.rot += Math.sin(TAU * 0.5 * t + 0.6);
  pose.arm_upper_R += Math.sin(TAU * 0.5 * t) * 2;
  pose.arm_upper_L -= Math.sin(TAU * 0.5 * t) * 2;
  return pose;
};

/** de pé, pernas retas, sola no chão */
export const parado = (t: number, x: number, chao: number, esc: number): PoseTeo => respira(base(x, chao - ALTURA_QUADRIL * esc), t);

/** sentado na beira do colchão (assento = altura do colchão), pés pendurados */
export const sentado = (t: number, x: number, assento: number, esc: number): PoseTeo => {
  const p = respira(base(x, assento - 8 * esc), t);
  p.leg_upper_R = 86; p.leg_lower_R = -80; p.leg_upper_L = 82; p.leg_lower_L = -84;
  p.pe_R = -12; p.pe_L = -8;
  p.torso.rot = -3;
  p.arm_upper_R = 14; p.arm_lower_R = 18; p.arm_upper_L = -10; p.arm_lower_L = 14;
  return p;
};

// marcha com o pé de apoio parado no chão: o quadril avança exatamente o que a perna de apoio empurra
export const MARCHA = { periodo: 0.8, amp: 24, joelho: 38 };
const omega = TAU / MARCHA.periodo;
export const fase = (t: number) => omega * t;
export const tempoDaFase = (f: number) => f / omega;

export const andar = (t: number, x0: number, chao: number, esc: number): PoseTeo => {
  const f = fase(t);
  const A = MARCHA.amp;
  const L = PERNA * esc;
  const thR = A * Math.sin(f);
  const thL = -thR;
  const s = L * Math.sin((thR * Math.PI) / 180);
  const n = Math.floor((f + Math.PI / 2) / Math.PI);
  const passo = 2 * L * Math.sin((A * Math.PI) / 180);
  const x = x0 + n * passo + (n % 2 ? -s : s);
  const y = chao - (G.sola * esc + L * Math.cos((thR * Math.PI) / 180));
  const p = base(x, y);
  const balR = Math.max(0, Math.cos(f)); // perna direita em balanço quando a coxa vai para a frente
  const balL = Math.max(0, -Math.cos(f));
  p.leg_upper_R = thR; p.leg_lower_R = -MARCHA.joelho * balR; p.pe_R = -0.45 * MARCHA.joelho * balR;
  p.leg_upper_L = thL; p.leg_lower_L = -MARCHA.joelho * balL; p.pe_L = -0.45 * MARCHA.joelho * balL;
  p.arm_upper_R = -20 * Math.sin(f); p.arm_upper_L = 20 * Math.sin(f);
  p.arm_lower_R = 16 + 12 * Math.max(0, -Math.sin(f)); p.arm_lower_L = 16 + 12 * Math.max(0, Math.sin(f));
  p.head.rot = 1.5 * Math.sin(2 * f);
  p.torso.rot = 2;
  return p;
};

/** coloca o tornozelo de uma perna num ponto do mundo, com o pé no ângulo dado */
export const pePara = (p: PoseTeo, lado: "R" | "L", tornozeloMundo: [number, number], esc: number, pe = 0): PoseTeo => {
  const alvo = local(p, esc, false, tornozeloMundo);
  const { sup, inf } = ikPerna(lado, alvo);
  const q = { ...p };
  if (lado === "R") { q.leg_upper_R = sup; q.leg_lower_R = inf; q.pe_R = pe; }
  else { q.leg_upper_L = sup; q.leg_lower_L = inf; q.pe_L = pe; }
  return q;
};

export const mola = (f: number, fps: number, config = { damping: 12, mass: 0.6, stiffness: 180 }) => (f < 0 ? 0 : spring({ frame: f, fps, config }));

/** mistura de poses de Téo (inclui os pés) */
export const mix = (a: PoseTeo, b: PoseTeo, k: number): PoseTeo => {
  const l = (x: number, y: number) => x + (y - x) * Math.min(1, Math.max(0, k));
  return {
    ...b,
    torso: { x: l(a.torso.x, b.torso.x), y: l(a.torso.y, b.torso.y), rot: l(a.torso.rot, b.torso.rot), scaleX: l(a.torso.scaleX, b.torso.scaleX), scaleY: l(a.torso.scaleY, b.torso.scaleY) },
    head: { rot: l(a.head.rot, b.head.rot), offsetY: l(a.head.offsetY, b.head.offsetY), offsetX: l(a.head.offsetX ?? 0, b.head.offsetX ?? 0) },
    arm_upper_R: l(a.arm_upper_R, b.arm_upper_R), arm_lower_R: l(a.arm_lower_R, b.arm_lower_R),
    arm_upper_L: l(a.arm_upper_L, b.arm_upper_L), arm_lower_L: l(a.arm_lower_L, b.arm_lower_L),
    leg_upper_R: l(a.leg_upper_R, b.leg_upper_R), leg_lower_R: l(a.leg_lower_R, b.leg_lower_R),
    leg_upper_L: l(a.leg_upper_L, b.leg_upper_L), leg_lower_L: l(a.leg_lower_L, b.leg_lower_L),
    pe_R: l(a.pe_R, b.pe_R), pe_L: l(a.pe_L, b.pe_L),
  };
};
