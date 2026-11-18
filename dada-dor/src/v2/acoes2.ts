// Ações extras do roteiro v2, no mesmo formato da biblioteca do rig: (frame, fps, params) => Pose.
import { spring } from "remotion";
import { spring as molaTheme } from "../theme";
import { ACOES, idle, sit, walk, type Acao } from "../rig/actions";

const TAU = Math.PI * 2;
const mola = (frame: number, fps: number, config = molaTheme) => spring({ frame, fps, config });

/** fila tremendo de medo */
const tremer: Acao = (f, fps, p) => {
  const pose = idle(f, fps, p);
  pose.torso.x += Math.sin(f * 2.3) * 3;
  pose.head.rot += Math.sin(f * 2.9) * 2;
  pose.arm_upper_R = 18; pose.arm_lower_R = 70; pose.arm_upper_L = 14; pose.arm_lower_L = 70;
  pose.arcos = { mood: p.mood ?? "worried" };
  return pose;
};
/** sentada comendo: mão vai e volta da boca */
const comer: Acao = (f, fps, p) => {
  const pose = sit(f, fps, p);
  const k = 0.5 - 0.5 * Math.cos(TAU * 0.7 * (f / fps));
  pose.arm_upper_R = 40 + 30 * k; pose.arm_lower_R = 60 + 50 * k;
  return pose;
};
/** pisa forte com o pé direito */
const pisar: Acao = (f, fps, p) => {
  const pose = idle(f, fps, p);
  const sobe = f < 10 ? mola(f, fps) : 1 - mola(f - 10, fps, { damping: 9, mass: 0.5, stiffness: 220 });
  pose.leg_upper_R = 40 * sobe; pose.leg_lower_R = -40 * sobe;
  return pose;
};
/** chuta com a perna direita */
const chutar: Acao = (f, fps, p) => {
  const pose = idle(f, fps, p);
  const ida = f < 8 ? -25 * mola(f, fps) : -25 + 105 * mola(f - 8, fps, { damping: 10, mass: 0.4, stiffness: 260 });
  pose.leg_upper_R = ida; pose.leg_lower_R = f < 8 ? -40 : -10;
  pose.arm_upper_L = 40; pose.arm_upper_R = -25;
  return pose;
};
/** pulo (do muro, de comemoração) */
const pular: Acao = (f, fps, p) => {
  const pose = idle(f, fps, p);
  const t = f / fps;
  const arco = t < 0.7 ? Math.sin((Math.PI * t) / 0.7) : 0;
  pose.torso.y = p.y - 70 * arco;
  pose.leg_upper_R = 40 * arco; pose.leg_lower_R = -60 * arco; pose.leg_upper_L = 30 * arco; pose.leg_lower_L = -55 * arco;
  pose.arm_upper_R = 120 * arco; pose.arm_upper_L = 110 * arco;
  return pose;
};
/** segura o celular filmando */
const filmar: Acao = (f, fps, p) => {
  const pose = idle(f, fps, p);
  const m = mola(f, fps);
  pose.arm_upper_R = 60 * m; pose.arm_lower_R = 35 * m;
  pose.head.rot += 4 * m;
  return pose;
};
/** ri: cabeça e tronco chacoalham */
const rir: Acao = (f, fps, p) => {
  const pose = idle(f, fps, p);
  pose.torso.scaleY = 1 + 0.03 * Math.abs(Math.sin(f * 0.9));
  pose.head.rot += -6 + 5 * Math.sin(f * 0.9);
  pose.arm_upper_R = 25; pose.arm_lower_R = 80; pose.arm_upper_L = 20; pose.arm_lower_L = 80;
  pose.arcos = { mood: p.mood ?? "calm" };
  return pose;
};
/** mão na boca, cabeça baixa */
const maoBoca: Acao = (f, fps, p) => {
  const pose = idle(f, fps, p);
  const m = mola(f, fps);
  pose.arm_upper_R = 55 * m; pose.arm_lower_R = 125 * m; pose.head.rot += 6 * m;
  pose.arcos = { mood: p.mood ?? "worried" };
  return pose;
};
/** sentado chorando */
const chorar: Acao = (f, fps, p) => {
  const pose = sit(f, fps, p);
  pose.head.rot = 14 + Math.sin(f * 1.4) * 3;
  pose.torso.y += Math.abs(Math.sin(f * 0.7)) * 3;
  pose.arm_upper_R = 70; pose.arm_lower_R = 100;
  pose.arcos = { mood: p.mood ?? "worried" };
  return pose;
};
/** anda mancando (perna direita encurta a passada) */
const mancar: Acao = (f, fps, p) => {
  const pose = walk(f, fps, { ...p, velocidade: p.velocidade ?? 140 });
  pose.leg_upper_R *= 0.45;
  pose.torso.rot = 4 * Math.sin((TAU * (f / fps)) / 0.8);
  return pose;
};
/** olha para baixo (o próprio pé) */
const olharBaixo: Acao = (f, fps, p) => {
  const pose = idle(f, fps, p);
  pose.head.rot += 16 * mola(f, fps);
  return pose;
};
/** braço direito estendido apertando algo (pena, clipe, botão) */
const apertar: Acao = (f, fps, p) => {
  const pose = idle(f, fps, p);
  const m = mola(f, fps);
  pose.arm_upper_R = 58 * m; pose.arm_lower_R = 10 + 6 * Math.sin(f * 0.6);
  return pose;
};
/** cascudo: braço sobe e desce */
const cascudo: Acao = (f, fps, p) => {
  const pose = idle(f, fps, p);
  const sobe = f < 9 ? mola(f, fps) : 1 - mola(f - 9, fps, { damping: 10, mass: 0.4, stiffness: 280 });
  pose.arm_upper_R = 40 + 110 * sobe; pose.arm_lower_R = 30;
  return pose;
};
/** segura algo à frente com as duas mãos */
const segurar: Acao = (f, fps, p) => {
  const pose = idle(f, fps, p);
  pose.arm_upper_R = 48; pose.arm_lower_R = 40; pose.arm_upper_L = 44; pose.arm_lower_L = 40;
  return pose;
};
/** sentada balançando as pernas (na maca) */
const balancar: Acao = (f, fps, p) => {
  const pose = sit(f, fps, p);
  pose.leg_lower_R = -80 + 22 * Math.sin(TAU * 1.2 * (f / fps));
  pose.leg_lower_L = -78 + 22 * Math.sin(TAU * 1.2 * (f / fps) + Math.PI);
  return pose;
};
/** cai sentado (o Caco perdendo a aposta) */
const caiSentado: Acao = (f, fps, p) => {
  const pose = sit(f, fps, p);
  const m = mola(f, fps, { damping: 8, mass: 0.6, stiffness: 160 });
  pose.torso.rot = -14 * m;
  pose.arm_upper_R = 80 * m; pose.arm_upper_L = -60 * m;
  return pose;
};
/** corre no lugar ou em x (run com velocidade dada) */
const correr: Acao = (f, fps, p) => ACOES.run(f, fps, { ...p, velocidade: p.velocidade ?? 0 });

export const ACOES2 = { ...ACOES, tremer, comer, pisar, chutar, pular, filmar, rir, maoBoca, chorar, mancar, olharBaixo, apertar, cascudo, segurar, balancar, caiSentado, correr };
export type NomeAcao = keyof typeof ACOES2;
// ações sentadas: o tronco desce o comprimento vertical da coxa
export const SENTADAS: NomeAcao[] = ["sit", "comer", "chorar", "balancar", "caiSentado"];
