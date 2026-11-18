// Biblioteca de ações do rig: funções puras (frame, fps, params) => Pose.
// `frame` é relativo ao início da ação. Ângulos: positivo = para frente (ela olha para a direita);
// antebraço/canela relativos ao braço/coxa. Nada de fade: transição entre ações só por blend().
import { Easing, spring } from "remotion";
import { spring as molaTheme } from "../theme";
import type { ArcMood } from "../components/Arcs";
import { POSE_NEUTRA, type Pose } from "./types";

export type Params = { x: number; y: number; mood?: ArcMood; velocidade?: number };
export type Acao = (frame: number, fps: number, p: Params) => Pose;

const TAU = Math.PI * 2;

const base = (p: Params): Pose => ({
  ...POSE_NEUTRA,
  torso: { ...POSE_NEUTRA.torso, x: p.x, y: p.y },
  head: { ...POSE_NEUTRA.head },
  arcos: { mood: p.mood ?? "neutral" },
});

// primeiro quadro em que a mola chega ao alvo (momento do "impacto")
const quadroDeChegada = (fps: number, config: Parameters<typeof spring>[0]["config"]) => {
  let f = 0;
  while (f < fps * 3 && spring({ frame: f, fps, config }) < 1) f++;
  return f;
};

/** idle: respiração (torso scaleY 1.0 a 1.015 a 0.5 Hz), cabeça balança 1°, braços 2°. */
export const idle: Acao = (frame, fps, p) => {
  const t = frame / fps;
  const resp = 0.5 - 0.5 * Math.cos(TAU * 0.5 * t); // 0..1
  const pose = base(p);
  pose.torso.scaleY = 1 + 0.015 * resp;
  pose.head.rot = Math.sin(TAU * 0.5 * t + 0.6) * 1;
  pose.arm_upper_R += Math.sin(TAU * 0.5 * t) * 2;
  pose.arm_upper_L -= Math.sin(TAU * 0.5 * t) * 2;
  return pose;
};

const ciclo = (frame: number, fps: number, p: Params, periodo: number, amp: number, inclina: number, velPadrao: number): Pose => {
  const t = frame / fps;
  const fase = (TAU * t) / periodo;
  const pose = base(p);
  pose.torso.x = p.x + (p.velocidade ?? velPadrao) * t;
  // sobe e desce 6 px a 2x a frequência do passo (mais alto no meio da passada)
  pose.torso.y = p.y - 6 * amp * (0.5 - 0.5 * Math.cos(2 * fase));
  pose.torso.rot = inclina;
  pose.head.rot = 2 * Math.sin(2 * fase) - inclina * 0.5; // compensa o balanço (e parte da inclinação)
  // coxas em seno, em contrafase entre si
  pose.leg_upper_R = 28 * amp * Math.sin(fase);
  pose.leg_upper_L = 28 * amp * Math.sin(fase + Math.PI);
  // canelas: dobram para trás só na fase de recolhimento (coxa indo para frente)
  pose.leg_lower_R = -35 * amp * Math.max(0, Math.cos(fase));
  pose.leg_lower_L = -35 * amp * Math.max(0, Math.cos(fase + Math.PI));
  // braços em contrafase com as pernas
  pose.arm_upper_R = 20 * amp * Math.sin(fase + Math.PI);
  pose.arm_upper_L = 20 * amp * Math.sin(fase);
  pose.arm_lower_R = 15 + 10 * amp * Math.max(0, Math.sin(fase + Math.PI));
  pose.arm_lower_L = 15 + 10 * amp * Math.max(0, Math.sin(fase));
  return pose;
};

/** walk: ciclo de 0,8 s; coxas 28°, canelas 35° no recolhimento, braços 20° em contrafase, torso 6 px a 2x. */
export const walk: Acao = (frame, fps, p) => ciclo(frame, fps, p, 0.8, 1, 0, 220);

/** run: walk com amplitude 1,6x, ciclo de 0,5 s e torso inclinado 12° para frente. */
export const run: Acao = (frame, fps, p) => ciclo(frame, fps, p, 0.5, 1.6, 12, 520);

/** sit: coxas a 85°, canelas a -80°, idle leve por cima. */
export const sit: Acao = (frame, fps, p) => {
  const leve = idle(frame, fps, p);
  return {
    ...leve,
    torso: { ...leve.torso, scaleY: 1 + (leve.torso.scaleY - 1) * 0.6 },
    leg_upper_R: 85,
    leg_lower_R: -80,
    leg_upper_L: 80,
    leg_lower_L: -78,
    arm_upper_R: 30 + (leve.arm_upper_R - POSE_NEUTRA.arm_upper_R) * 0.5,
    arm_lower_R: 25,
    arm_upper_L: 22 + (leve.arm_upper_L - POSE_NEUTRA.arm_upper_L) * 0.5,
    arm_lower_L: 25,
  };
};

/** point: braço direito sobe a 70° com a mola do theme, antebraço estende, cabeça vira 8° na direção. */
export const point: Acao = (frame, fps, p) => {
  const pose = idle(frame, fps, p);
  const m = spring({ frame, fps, config: molaTheme });
  pose.arm_upper_R = POSE_NEUTRA.arm_upper_R + (70 - POSE_NEUTRA.arm_upper_R) * m;
  pose.arm_lower_R = POSE_NEUTRA.arm_lower_R * (1 - m); // estende
  pose.head.rot += 8 * m;
  return pose;
};

/** wave: braço direito a 150°, antebraço oscila 25° a 2 Hz. */
export const wave: Acao = (frame, fps, p) => {
  const pose = idle(frame, fps, p);
  const m = spring({ frame, fps, config: molaTheme });
  pose.arm_upper_R = POSE_NEUTRA.arm_upper_R + (150 - POSE_NEUTRA.arm_upper_R) * m;
  pose.arm_lower_R = 15 + 25 * Math.sin(TAU * 2 * (frame / fps)) * m;
  return pose;
};

const MOLA_QUEDA = { damping: 8, mass: molaTheme.mass, stiffness: 140 };

/** fall: torso -25° a +15° em mola (damping 8), cai 40 px, braços abrem; no impacto squash 0.85/1.12 por 4 quadros. */
export const fall: Acao = (frame, fps, p) => {
  const pose = base(p);
  const m = spring({ frame, fps, config: MOLA_QUEDA });
  const impacto = quadroDeChegada(fps, MOLA_QUEDA);
  pose.torso.rot = -25 + 40 * m;
  pose.torso.y = p.y + 40 * m;
  pose.arm_upper_R = 6 + 100 * Math.min(1, m * 1.2); // braços abrem
  pose.arm_upper_L = -6 - 100 * Math.min(1, m * 1.2);
  pose.arm_lower_R = 20;
  pose.arm_lower_L = 20;
  pose.leg_upper_R = 30 * m;
  pose.leg_upper_L = -20 * m;
  pose.leg_lower_R = -20 * m;
  pose.head.rot = -10 * (1 - m);
  if (frame >= impacto && frame < impacto + 4) {
    pose.torso.scaleY = 0.85;
    pose.torso.scaleX = 1.12;
  }
  return pose;
};

/** flinch: cabeça recua 6 px e rot -8° por 6 quadros, volta em mola. */
export const flinch: Acao = (frame, fps, p) => {
  const pose = idle(frame, fps, p);
  const volta = frame < 6 ? 0 : spring({ frame: frame - 6, fps, config: molaTheme });
  const k = 1 - volta;
  pose.head.rot += -8 * k;
  pose.head.offsetY += 2 * k;
  pose.head.offsetX = -6 * k; // recua para trás (ela olha para a direita)
  pose.torso.rot = -3 * k;
  return pose;
};

/** celebrate: os dois braços sobem a 160° com overshoot, pulo de 30 px, cabeça rot +6. */
export const celebrate: Acao = (frame, fps, p) => {
  const pose = idle(frame, fps, p);
  const m = spring({ frame, fps, config: { damping: 7, mass: 0.6, stiffness: 140 } }); // overshoot
  pose.arm_upper_R = POSE_NEUTRA.arm_upper_R + (160 - POSE_NEUTRA.arm_upper_R) * m;
  pose.arm_upper_L = POSE_NEUTRA.arm_upper_L + (160 - POSE_NEUTRA.arm_upper_L) * m;
  pose.arm_lower_R = 10;
  pose.arm_lower_L = 10;
  const pulo = Math.max(0, Math.sin((TAU / 2) * ((frame / fps) / 0.6))); // um pulo de 0,6 s
  pose.torso.y = p.y - 30 * (frame / fps < 0.6 ? pulo : 0);
  pose.head.rot += 6 * Math.min(1, m);
  pose.arcos = { mood: p.mood ?? "calm" };
  return pose;
};

/** hug: torso inclina 10° para frente, braços fecham a 40°. */
export const hug: Acao = (frame, fps, p) => {
  const pose = idle(frame, fps, p);
  const m = spring({ frame, fps, config: molaTheme });
  pose.torso.rot = 10 * m;
  pose.arm_upper_R = POSE_NEUTRA.arm_upper_R + (40 - POSE_NEUTRA.arm_upper_R) * m;
  pose.arm_upper_L = POSE_NEUTRA.arm_upper_L + (40 - POSE_NEUTRA.arm_upper_L) * m;
  pose.arm_lower_R = 10 + 40 * m;
  pose.arm_lower_L = 10 + 40 * m;
  return pose;
};

export const ACOES = { idle, walk, run, sit, point, wave, fall, flinch, celebrate, hug };

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Mistura duas poses (t de 0 a 1). Os arcos interpolam os pontos de controle de um mood para o outro. */
export const blend = (a: Pose, b: Pose, t: number): Pose => {
  const k = Math.min(1, Math.max(0, t));
  const num = (ka: number, kb: number) => lerp(ka, kb, k);
  const arcosA = a.arcos?.mood ?? "neutral";
  const arcosB = b.arcos?.mood ?? "neutral";
  return {
    torso: {
      x: num(a.torso.x, b.torso.x),
      y: num(a.torso.y, b.torso.y),
      rot: num(a.torso.rot, b.torso.rot),
      scaleX: num(a.torso.scaleX, b.torso.scaleX),
      scaleY: num(a.torso.scaleY, b.torso.scaleY),
    },
    head: { rot: num(a.head.rot, b.head.rot), offsetY: num(a.head.offsetY, b.head.offsetY), offsetX: num(a.head.offsetX ?? 0, b.head.offsetX ?? 0) },
    arm_upper_R: num(a.arm_upper_R, b.arm_upper_R),
    arm_lower_R: num(a.arm_lower_R, b.arm_lower_R),
    arm_upper_L: num(a.arm_upper_L, b.arm_upper_L),
    arm_lower_L: num(a.arm_lower_L, b.arm_lower_L),
    leg_upper_R: num(a.leg_upper_R, b.leg_upper_R),
    leg_lower_R: num(a.leg_lower_R, b.leg_lower_R),
    leg_upper_L: num(a.leg_upper_L, b.leg_upper_L),
    leg_lower_L: num(a.leg_lower_L, b.leg_lower_L),
    arcos: arcosA === arcosB ? b.arcos : { mood: arcosB, de: arcosA, progresso: k },
  };
};

/** Progresso suave (ease in/out) para um blend que começa em `inicio` e dura `n` quadros. */
export const transicao = (frame: number, inicio: number, n: number) => Easing.inOut(Easing.cubic)(Math.min(1, Math.max(0, (frame - inicio) / n)));
