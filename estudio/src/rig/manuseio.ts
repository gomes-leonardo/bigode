// Manuseio em 3 tempos: ALCANÇA (arco, antecipação de 3 quadros, overshoot pequeno), PEGA (punho por cima, squash de
// 2 quadros) e MOVE (o objeto vira filho da mão). Soltar é o inverso: a mão abre e o objeto fica apoiado ou cai.
import type { P } from "../components/Person";
import { suave } from "./pose";

const l = (a: number, b: number, k: number) => a + (b - a) * k;
/** volta com overshoot pequeno: passa ~6% do alvo e assenta */
const voltaMola = (x: number) => {
  const c1 = 1.2, c3 = c1 + 1;
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
};

/** posição da mão (alvo local) num alcance de `de` até `ate`, começando em f0 e tocando em fC.
 * Antecipação: 3 quadros na direção contrária. Trajeto em arco (sobe `arco` px no meio). */
export const alcance = (f: number, f0: number, fC: number, de: P, ate: P, arco = 30): P => {
  if (f <= f0) return de;
  if (f >= fC) return ate;
  const dx = ate[0] - de[0], dy = ate[1] - de[1];
  const ant: P = [de[0] - dx * 0.07, de[1] - dy * 0.07 + 4];
  if (f < f0 + 3) {
    const k = suave((f - f0) / 3);
    return [l(de[0], ant[0], k), l(de[1], ant[1], k)];
  }
  // começa devagar (x²), acelera, passa uns 5% do alvo e assenta no quadro do contato
  const x = (f - f0 - 3) / (fC - f0 - 3);
  const k = voltaMola(x * x);
  // arco: ponto de controle acima do meio do trajeto
  const meio: P = [(ant[0] + ate[0]) / 2, (ant[1] + ate[1]) / 2 - arco];
  const t = Math.min(1, k);
  const q: P = [(1 - t) ** 2 * ant[0] + 2 * (1 - t) * t * meio[0] + t * t * ate[0], (1 - t) ** 2 * ant[1] + 2 * (1 - t) * t * meio[1] + t * t * ate[1]];
  if (k <= 1) return q;
  // overshoot: continua um pouco na direção da chegada
  const tg: P = [ate[0] - meio[0], ate[1] - meio[1]];
  const n = Math.hypot(tg[0], tg[1]) || 1;
  const extra = (k - 1) * Math.hypot(dx, dy);
  return [ate[0] + (tg[0] / n) * extra, ate[1] + (tg[1] / n) * extra];
};
/** squash do punho: 1 no quadro do contato, 0.5 no seguinte, 0 depois */
export const squash = (f: number, fC: number) => (f === fC ? 1 : f === fC + 1 ? 0.5 : 0);
/** trajeto de um objeto carregado de A até B (ease in-out), mais lento quanto mais pesado */
export const carrega = (f: number, f0: number, f1: number, a: P, b: P, arco = 0): P => {
  const k = suave(Math.min(1, Math.max(0, (f - f0) / (f1 - f0))));
  const meio: P = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2 - arco];
  return [(1 - k) ** 2 * a[0] + 2 * (1 - k) * k * meio[0] + k * k * b[0], (1 - k) ** 2 * a[1] + 2 * (1 - k) * k * meio[1] + k * k * b[1]];
};
/** queda livre depois de soltar (px/s²), até o chão */
export const cai = (f: number, fSolta: number, y0: number, chao: number, fps = 30, g = 2600) => {
  const t = Math.max(0, (f - fSolta) / fps);
  return Math.min(chao, y0 + 0.5 * g * t * t);
};
/** mundo -> espaço do personagem (sem flip) */
export const paraLocal = (w: P, x: number, y: number, s: number): P => [(w[0] - x) / s, (w[1] - y) / s];
export const paraMundo = (p: P, x: number, y: number, s: number): P => [x + p[0] * s, y + p[1] * s];
