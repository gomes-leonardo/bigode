// Motor de movimento: ações em coordenadas de mundo com os pés presos no chão, mais um
// sequenciador que mistura uma ação na outra (sem fade, só blend de pose).
import { Easing, interpolate } from "remotion";
import { POSE_NEUTRA } from "../rig/types";
import { ALTURA_QUADRIL, G, PERNA, ikBraco, ikPerna, local, type Lado, type PoseTeo, type Visual } from "./tira";

const TAU = Math.PI * 2;
export type Fn = (t: number) => PoseTeo;

export const ease = Easing.inOut(Easing.cubic);
export const rampa = (t: number, a: number, b: number, e: (x: number) => number = ease) => (b <= a ? (t >= b ? 1 : 0) : interpolate(t, [a, b], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: e }));
export const pulso = (t: number, t0: number, dur = 0.35) => (t < t0 || t > t0 + dur ? 0 : Math.sin(Math.PI * ((t - t0) / dur)) * (1 - (t - t0) / dur));
export const sino = (t: number, a: number, b: number, sobe = 0.2, desce = 0.2) => rampa(t, a, a + sobe) * (1 - rampa(t, b - desce, b));

export const base = (x: number, y: number, esq = false): PoseTeo => ({
  ...POSE_NEUTRA,
  torso: { ...POSE_NEUTRA.torso, x, y },
  head: { rot: 0, offsetY: 0 },
  arm_upper_R: 6, arm_lower_R: 12, arm_upper_L: -6, arm_lower_L: 12,
  leg_upper_R: 0, leg_lower_R: 0, leg_upper_L: 0, leg_lower_L: 0,
  pe_R: 0, pe_L: 0, esq, expr: "neutro",
});

export const respira = (pose: PoseTeo, t: number, fase = 0) => {
  const r = 0.5 - 0.5 * Math.cos(TAU * 0.5 * t + fase);
  pose.torso.scaleY = 1 + 0.015 * r;
  pose.head.rot += Math.sin(TAU * 0.5 * t + 0.6 + fase);
  pose.arm_upper_R += Math.sin(TAU * 0.5 * t + fase) * 2;
  pose.arm_upper_L -= Math.sin(TAU * 0.5 * t + fase) * 2;
  return pose;
};

/** de pé, pernas retas, sola no chão */
export const parado = (x: number, chao: number, esc: number, esq = false, fase = 0): Fn => (t) => respira(base(x, chao - ALTURA_QUADRIL * esc, esq), t, fase);

/** sentado: quadril no assento. Com `chao`, os pés apoiam no chão (cadeira); sem, ficam pendurados (maca, cama, muro). */
export const sentado = (x: number, assento: number, esc: number, esq = false, chao?: number, fase = 0): Fn => (t) => {
  let p = respira(base(x, assento - 8 * esc, esq), t, fase);
  p.leg_upper_R = 86; p.leg_lower_R = -80; p.leg_upper_L = 82; p.leg_lower_L = -84;
  p.pe_R = -12; p.pe_L = -8;
  p.torso.rot = -3;
  p.arm_upper_R = 14; p.arm_lower_R = 18; p.arm_upper_L = -10; p.arm_lower_L = 14;
  if (chao !== undefined) {
    const s = esq ? -1 : 1;
    p = pePara(p, "R", [x + s * 70 * esc, chao - G.sola * esc], esc, 0);
    p = pePara(p, "L", [x + s * 58 * esc, chao - G.sola * esc], esc, 0);
  }
  return p;
};

/** deitado de costas (cabeça para a esquerda, olhando o teto); y = topo do colchão */
export const deitado = (x: number, colchao: number, esc: number): Fn => (t) => {
  const p = respira(base(x, colchao - 30 * esc), t);
  p.giro = -90;
  p.leg_upper_R = 4; p.leg_upper_L = -2; p.pe_R = 70; p.pe_L = 66;
  p.arm_upper_R = 8; p.arm_lower_R = 6; p.arm_upper_L = -4; p.arm_lower_L = 4;
  return p;
};

/** agachado com os dois pés no chão */
export const agachado = (x: number, chao: number, esc: number, esq = false, fundo = 1): Fn => (t) => {
  let p = respira(base(x, chao - (ALTURA_QUADRIL - 92 * fundo) * esc, esq), t);
  const s = esq ? -1 : 1;
  p.torso.rot = 24 * fundo;
  p = pePara(p, "R", [x + s * 44 * esc, chao - G.sola * esc], esc, 0);
  p = pePara(p, "L", [x + s * 20 * esc, chao - G.sola * esc], esc, 0);
  p.arm_upper_R = 40; p.arm_lower_R = 30; p.arm_upper_L = 30; p.arm_lower_L = 30;
  return p;
};

// ---------------------------------------------------------------- marcha com o pé de apoio parado
export const MARCHA = { periodo: 0.8, amp: 24, joelho: 38 };
type Gait = { periodo: number; amp: number; joelho: number; inclina: number; bracos: number };
const ANDAR: Gait = { periodo: 0.8, amp: 24, joelho: 38, inclina: 2, bracos: 20 };
const CORRER: Gait = { periodo: 0.5, amp: 34, joelho: 70, inclina: 12, bracos: 38 };

const marcha = (tt: number, x0: number, chao: number, esc: number, g: Gait, sentido: 1 | -1, mancar = 0): PoseTeo => {
  const f = (TAU * tt) / g.periodo;
  const A = g.amp;
  const L = PERNA * esc;
  const thR = A * Math.sin(f);
  const s = L * Math.sin((thR * Math.PI) / 180);
  const n = Math.floor((f + Math.PI / 2) / Math.PI);
  const passo = 2 * L * Math.sin((A * Math.PI) / 180);
  const x = x0 + sentido * (n * passo + (n % 2 ? -s : s));
  const y = chao - (G.sola * esc + L * Math.cos((thR * Math.PI) / 180)) + mancar * 14 * esc * Math.max(0, -Math.cos(f));
  const p = base(x, y, sentido < 0);
  const balR = Math.max(0, Math.cos(f));
  const balL = Math.max(0, -Math.cos(f));
  p.leg_upper_R = thR; p.leg_lower_R = -g.joelho * balR; p.pe_R = -0.45 * g.joelho * balR;
  p.leg_upper_L = -thR; p.leg_lower_L = -g.joelho * balL; p.pe_L = -0.45 * g.joelho * balL;
  p.arm_upper_R = -g.bracos * Math.sin(f); p.arm_upper_L = g.bracos * Math.sin(f);
  p.arm_lower_R = 16 + 14 * Math.max(0, -Math.sin(f)) + (g === CORRER ? 60 : 0); p.arm_lower_L = 16 + 14 * Math.max(0, Math.sin(f)) + (g === CORRER ? 60 : 0);
  p.head.rot = 1.5 * Math.sin(2 * f) - g.inclina * 0.4;
  p.torso.rot = g.inclina + mancar * 5 * Math.max(0, -Math.cos(f));
  return p;
};

/** anda (ou corre) de xa até xb começando em t0; o número de passos e a amplitude fecham a distância exata */
export const andar = (xa: number, xb: number, t0: number, chao: number, esc: number, opts: { correr?: boolean; mancar?: number } = {}): Fn & { fim: number } => {
  const g0 = opts.correr ? CORRER : ANDAR;
  const L = PERNA * esc;
  const dist = Math.abs(xb - xa);
  const meio = 2 * L * Math.sin((g0.amp * Math.PI) / 180);
  const n = Math.max(1, Math.round(dist / meio));
  const amp = (Math.asin(Math.min(0.9, dist / (2 * n * L))) * 180) / Math.PI;
  const g = { ...g0, amp };
  const sentido = xb >= xa ? 1 : -1;
  const fim = t0 + (n * g.periodo) / 2;
  const fn = ((t: number) => {
    if (t <= t0) return mix(respira(base(xa, chao - ALTURA_QUADRIL * esc, sentido < 0), t), marcha(0, xa, chao, esc, g, sentido as 1 | -1, opts.mancar), rampa(t, t0 - 0.12, t0));
    if (t < fim) return marcha(t - t0, xa, chao, esc, g, sentido as 1 | -1, opts.mancar);
    return mix(marcha(fim - t0, xa, chao, esc, g, sentido as 1 | -1, opts.mancar), respira(base(xb, chao - ALTURA_QUADRIL * esc, sentido < 0), t), rampa(t, fim, fim + 0.18));
  }) as Fn & { fim: number };
  fn.fim = fim;
  return fn;
};

// ---------------------------------------------------------------- partes
/** coloca o tornozelo num ponto do mundo, com o pé no ângulo dado */
export const pePara = (p: PoseTeo, lado: Lado, tornozeloMundo: [number, number], esc: number, pe = 0): PoseTeo => {
  const alvo = local(p, esc, false, tornozeloMundo);
  const { sup, inf } = ikPerna(lado, alvo);
  const q = { ...p };
  if (lado === "R") { q.leg_upper_R = sup; q.leg_lower_R = inf; q.pe_R = pe; } else { q.leg_upper_L = sup; q.leg_lower_L = inf; q.pe_L = pe; }
  return q;
};
/** leva a mão a um ponto do mundo */
export const maoEm = (p: PoseTeo, lado: Lado, alvo: [number, number], esc: number, v?: Visual): PoseTeo => {
  const { sup, inf } = ikBraco(p, lado, alvo, esc, v);
  const q = { ...p };
  if (lado === "R") { q.arm_upper_R = sup; q.arm_lower_R = inf; } else { q.arm_upper_L = sup; q.arm_lower_L = inf; }
  return q;
};
/** mistura só os braços de b sobre a (k de 0 a 1) */
export const comBracos = (a: PoseTeo, b: PoseTeo, k: number, lado: Lado | "ambos" = "ambos"): PoseTeo => {
  const q = { ...a };
  const l = (x: number, y: number) => x + (y - x) * Math.min(1, Math.max(0, k));
  if (lado !== "L") { q.arm_upper_R = l(a.arm_upper_R, b.arm_upper_R); q.arm_lower_R = l(a.arm_lower_R, b.arm_lower_R); }
  if (lado !== "R") { q.arm_upper_L = l(a.arm_upper_L, b.arm_upper_L); q.arm_lower_L = l(a.arm_lower_L, b.arm_lower_L); }
  return q;
};
export const cruzados = (p: PoseTeo): PoseTeo => ({ ...p, arm_upper_R: 24, arm_lower_R: 112, arm_upper_L: 20, arm_lower_L: 116 });
/** braço esticado apontando para um ponto do mundo */
export const apontar = (p: PoseTeo, alvo: [number, number], esc: number, v?: Visual, lado: Lado = "R"): PoseTeo => {
  const l = local(p, esc, false, alvo);
  const ang = (Math.atan2(l[0] - G.ombro[0], l[1] - G.ombro[1] * (v?.tronco ?? 1)) * 180) / Math.PI - p.torso.rot;
  return lado === "R" ? { ...p, arm_upper_R: ang, arm_lower_R: 6 } : { ...p, arm_upper_L: ang, arm_lower_L: 6 };
};
export const rir = (p: PoseTeo, t: number, k = 1): PoseTeo => ({
  ...p,
  torso: { ...p.torso, scaleY: p.torso.scaleY + 0.03 * k * Math.abs(Math.sin(t * 27)), rot: p.torso.rot - 4 * k },
  head: { ...p.head, rot: p.head.rot - 8 * k + 4 * k * Math.sin(t * 27) },
  expr: k > 0.5 ? "rindo" : p.expr,
});
export const tremer = (p: PoseTeo, t: number, k = 1, semente = 0): PoseTeo => ({
  ...p,
  torso: { ...p.torso, x: p.torso.x + Math.sin(t * 70 + semente) * 2.5 * k },
  head: { ...p.head, rot: p.head.rot + Math.sin(t * 87 + semente) * 2 * k },
  arm_upper_R: 18, arm_lower_R: 70, arm_upper_L: 14, arm_lower_L: 70,
});

/** mistura de poses (inclui pés, giro e campos de rosto de b) */
export const mix = (a: PoseTeo, b: PoseTeo, k: number): PoseTeo => {
  const kk = Math.min(1, Math.max(0, k));
  if (kk <= 0) return a;
  if (kk >= 1) return b;
  const l = (x: number, y: number) => x + (y - x) * kk;
  return {
    ...(kk < 0.5 ? a : b),
    torso: { x: l(a.torso.x, b.torso.x), y: l(a.torso.y, b.torso.y), rot: l(a.torso.rot, b.torso.rot), scaleX: l(a.torso.scaleX, b.torso.scaleX), scaleY: l(a.torso.scaleY, b.torso.scaleY) },
    head: { rot: l(a.head.rot, b.head.rot), offsetY: l(a.head.offsetY, b.head.offsetY), offsetX: l(a.head.offsetX ?? 0, b.head.offsetX ?? 0) },
    arm_upper_R: l(a.arm_upper_R, b.arm_upper_R), arm_lower_R: l(a.arm_lower_R, b.arm_lower_R),
    arm_upper_L: l(a.arm_upper_L, b.arm_upper_L), arm_lower_L: l(a.arm_lower_L, b.arm_lower_L),
    leg_upper_R: l(a.leg_upper_R, b.leg_upper_R), leg_lower_R: l(a.leg_lower_R, b.leg_lower_R),
    leg_upper_L: l(a.leg_upper_L, b.leg_upper_L), leg_lower_L: l(a.leg_lower_L, b.leg_lower_L),
    pe_R: l(a.pe_R, b.pe_R), pe_L: l(a.pe_L, b.pe_L),
    giro: l(a.giro ?? 0, b.giro ?? 0),
    palido: l(a.palido ?? 0, b.palido ?? 0),
    lagrima: l(a.lagrima ?? 0, b.lagrima ?? 0),
  };
};

/** sequência de ações: [início, ação]; cada troca mistura por `blend` segundos */
export const seq = (t: number, passos: [number, Fn][], blend = 0.22): PoseTeo => {
  let i = 0;
  while (i + 1 < passos.length && t >= passos[i + 1][0]) i++;
  const atual = passos[i][1](t);
  if (i > 0 && t < passos[i][0] + blend) return mix(passos[i - 1][1](t), atual, ease((t - passos[i][0]) / blend));
  return atual;
};

/** boca abrindo e fechando durante a fala (sílabas a ~7 Hz com variação) */
export const falando = (t: number, ini: number, dur: number) => t >= ini && t < ini + dur - 0.05 && Math.sin(t * 44 + Math.sin(t * 13) * 2) > -0.2;
/** piscadas naturais a cada ~3 s */
export const piscando = (t: number, semente = 0) => ((t + semente * 1.7) % 3.1) < 0.1;
export { ALTURA_QUADRIL, G };
