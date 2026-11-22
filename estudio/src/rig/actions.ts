// Biblioteca de ações. Cada ação recebe o quadro relativo ao seu início e devolve uma Pose no espaço do personagem.
// Posição no mundo (x, y, scale) vem de fora; os alvos de mão e pé são locais (chão em y = 0).
import type { P } from "../components/Person";
import { FPS, rampa, suave, type Pose } from "./pose";

const TAU = Math.PI * 2;
export type Base = { x: number; y: number; scale?: number; expr?: Pose["expr"]; lookAt?: P };

/** idle: respira (tronco 1.0 a 1.015, ciclo de 3 s), cabeça balança 1°, braços com leve balanço */
export const idle = (b: Base) => (f: number): Pose => {
  const t = f / FPS;
  const r = 0.5 - 0.5 * Math.cos((TAU * t) / 3);
  return {
    ...b,
    respira: r,
    headTilt: Math.sin((TAU * t) / 3.6) * 1,
    hip: 3,
    handL: [-72 - 2 * r, -110 + 1.5 * Math.sin(TAU * t / 3)],
    handR: [74 + 2 * r, -108 + 1.5 * Math.sin(TAU * t / 3 + 1)],
  };
};
export const pocket = (b: Base) => (f: number): Pose => ({ ...idle(b)(f), handL: [-34, -98], gripL: "none", handR: [36, -96], gripR: "none", hip: 5 });
export const crossArms = (b: Base) => (f: number): Pose => ({ ...idle(b)(f), handL: [46, -172], gripL: "fist", handR: [-48, -168], gripR: "fist", frente: "R", hip: -4 });
export const shrug = (b: Base) => (f: number): Pose => {
  const k = rampa(f, 0, 6, (x) => 1 - (1 - x) * (1 - x));
  const volta = 1 - rampa(f, 24, 34);
  const sobe = k * volta;
  return { ...idle(b)(f), ombros: 12 * sobe, headTilt: 5 * sobe, handL: [-72 - 52 * sobe, -110 - 40 * sobe], handR: [74 + 52 * sobe, -108 - 46 * sobe], expr: b.expr ?? "olhar-lateral" };
};
export const point = (b: Base & { alvo?: P }) => (f: number): Pose => {
  const k = rampa(f, 0, 7, (x) => 1 - Math.pow(1 - x, 3));
  const alvo = b.alvo ?? [178, -238];
  return { ...idle(b)(f), handR: [74 + (alvo[0] - 74) * k, -108 + (alvo[1] + 108) * k], gripR: k > 0.5 ? "point" : "open", bendR: 4, lean: -2 * k, expr: b.expr ?? "convencido" };
};
export const wave = (b: Base) => (f: number): Pose => {
  const k = rampa(f, 0, 6);
  const bal = Math.sin((TAU * f) / 14) * 18 * k; // o antebraço balança de um lado para o outro
  return { ...idle(b)(f), handR: [74 + (118 + bal - 74) * k, -108 + (-318 + 108) * k], gripR: "open", bendR: 8, lean: -1.5 * k, expr: b.expr ?? "rindo" };
};
export const celebrate = (b: Base) => (f: number): Pose => {
  const salto = Math.max(0, Math.sin((TAU * f) / 20)) * 40;
  return { ...idle(b)(f), pulo: salto, handL: [-92, -360], handR: [96, -366], gripL: "fist", gripR: "fist", kneeL: 6 + salto * 0.1, kneeR: 6 + salto * 0.1, expr: b.expr ?? "rindo" };
};
export const scared = (b: Base) => (f: number): Pose => {
  const pulo = Math.sin(Math.PI * Math.min(1, f / 10)) * 30 * (f < 10 ? 1 : 0);
  const tremor = f > 10 ? Math.sin(f * 2.1) * 1.5 : 0;
  return { ...idle(b)(f), x: b.x + tremor, pulo, ombros: 8, handL: [-96, -300], handR: [98, -306], gripL: "open", gripR: "open", kneeL: 8, kneeR: 8, expr: "chocado" };
};
/** sentar: o quadril desce até o assento (altura do assento acima do chão, em px locais); as coxas apontam para a
 * câmera (escorço), então as pernas encurtam em vez de abrir os joelhos; mãos no colo */
export const sit = (b: Base & { assento: number }) => (f: number): Pose => {
  const k = rampa(f, 0, 12);
  const desce = (112 - b.assento) * k; // o quadril fica em -assento
  return {
    ...idle(b)(f), abaixa: desce, sentado: k, footL: [-40, 0], footR: [42, 0], kneeL: 2, kneeR: 2,
    handL: [-72 + 26 * k, -110 + (110 - b.assento + 6) * k], handR: [74 - 24 * k, -108 + (108 - b.assento + 4) * k], gripL: "open", gripR: "open",
  };
};
/** cair: o corpo gira até deitar no chão (para o lado `lado`) */
export const fall = (b: Base & { lado?: number }) => (f: number): Pose => {
  const lado = b.lado ?? 1;
  const k = rampa(f, 0, 12, (x) => x * x);
  const quica = f > 12 ? Math.sin(Math.min(1, (f - 12) / 8) * Math.PI) * 6 : 0;
  // deitado: o tronco encosta no chão; pés e mãos esparramados (no referencial do corpo, antes do giro)
  return {
    ...idle(b)(f), giro: lado * 84 * k, pulo: quica, handL: [-72 - 40 * k, -110 - 150 * k], handR: [74 + 50 * k, -108 + 10 * k],
    footL: [-30 + 40 * k, -4 * k], footR: [32 + 18 * k, -24 * k], kneeL: 2 + 6 * k, kneeR: 2 + 10 * k, expr: k > 0.5 ? "chocado" : b.expr ?? "sigma",
  };
};
export const hug = (b: Base) => (f: number): Pose => {
  const k = rampa(f, 0, 10);
  return { ...idle(b)(f), handL: [-72 + 92 * k, -110 - 92 * k], handR: [74 - 90 * k, -108 - 96 * k], bendL: 6 + 26 * k, bendR: 6 + 26 * k, frente: "R", expr: b.expr ?? "rindo" };
};
/** olhar o celular: celular na mão esquerda na frente do peito (cotovelo para baixo), a outra no bolso; olhos para baixo */
export const lookAtPhone = (b: Base) => (f: number): Pose => ({ ...idle(b)(f), handL: [-22, -202], gripL: "fist", handR: [36, -96], gripR: "none", headTilt: -5, lookAt: [-16, -50], expr: b.expr ?? "sigma" });

/** andar de lado (o corpo fica de frente): passo lateral com os pés por alvo; o pé de apoio fica parado no chão.
 * O pé da frente abre o passo e o de trás acompanha, sem cruzar as pernas. xa, xb no mundo; f0 = quadro de início. */
export const walk = (b: Base & { xa: number; xb: number; f0: number; passo?: number; quadros?: number }) => {
  const s = b.scale ?? 1;
  const dir = b.xb >= b.xa ? 1 : -1;
  const q = b.quadros ?? 10;
  const dist = Math.abs(b.xb - b.xa);
  const n = Math.max(1, Math.round(dist / ((b.passo ?? 88) * s)));
  const d = dist / n;
  const pes: { L: number; R: number }[] = [{ L: b.xa - 30 * s, R: b.xa + 32 * s }];
  for (let i = 1; i <= 2 * n; i++) {
    const ant = pes[i - 1];
    const lider = i % 2 === 1; // passo ímpar: o pé da frente abre; par: o de trás acompanha
    const moveR = (dir > 0) === lider;
    pes.push(moveR ? { L: ant.L, R: ant.R + dir * d } : { L: ant.L + dir * d, R: ant.R });
  }
  const fim = b.f0 + 2 * n * q;
  const fn = (f: number): Pose => {
    const andando = f >= b.f0 && f < fim;
    const k = Math.max(0, Math.min(2 * n - 1e-6, (f - b.f0) / q));
    const i = Math.floor(k), fase = k - i;
    const a = pes[i], c = pes[i + 1];
    const e = suave(fase);
    const fL = f < b.f0 ? pes[0].L : f >= fim ? pes[2 * n].L : a.L + (c.L - a.L) * e;
    const fR = f < b.f0 ? pes[0].R : f >= fim ? pes[2 * n].R : a.R + (c.R - a.R) * e;
    const moveR = andando && a.R !== c.R;
    const moveL = andando && a.L !== c.L;
    const lift = -20 * Math.sin(Math.PI * fase);
    const corpoX = (fL + fR) / 2 - 1 * s;
    const bal = andando ? Math.sin(Math.PI * fase) * (moveR ? 1 : -1) : 0;
    const base = idle({ ...b, x: corpoX })(f);
    return {
      ...base,
      x: corpoX,
      pulo: andando ? 6 * Math.sin(Math.PI * fase) : 0,
      footL: [(fL - corpoX) / s, moveL ? lift : 0],
      footR: [(fR - corpoX) / s, moveR ? lift : 0],
      kneeL: moveL ? 8 : 2,
      kneeR: moveR ? 8 : 2,
      handL: [-72 + 14 * bal, -110 - 4 * Math.abs(bal)],
      handR: [74 + 14 * bal, -108 - 4 * Math.abs(bal)],
      lean: andando ? 2.5 * dir : 0,
      hip: andando ? (moveR ? -4 : 4) : 3,
    };
  };
  return Object.assign(fn, { fim });
};
