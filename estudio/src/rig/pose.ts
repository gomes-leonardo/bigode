// Pose = as props do Person num quadro. Ações são funções (quadro) => Pose; mistura sem fade, só interpolação.
import { misturaRosto, rostoDe, type Expr, type RostoP } from "../components/Face";
import type { Mao, P, PersonProps } from "../components/Person";

export type Pose = Omit<PersonProps, "expr" | "propsBehind" | "propsFront" | "propsHands"> & { expr?: Expr | RostoP };
export type Acao = (f: number) => Pose;
export const FPS = 30;

const l = (a: number, b: number, k: number) => a + (b - a) * k;
const lp = (a: P | undefined, b: P | undefined, k: number, def: P): P => {
  const A = a ?? def, B = b ?? def;
  return [l(A[0], B[0], k), l(A[1], B[1], k)];
};
export const suave = (x: number) => (x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x));
export const rampa = (f: number, a: number, b: number, e: (x: number) => number = suave) => (b <= a ? (f >= b ? 1 : 0) : e(Math.min(1, Math.max(0, (f - a) / (b - a)))));
const rosto = (e: Expr | RostoP | undefined): RostoP => (typeof e === "object" ? e : rostoDe(e ?? "sigma"));

/** interpola duas poses (pontos, ângulos, rosto); pega/mão troca no meio */
export const mixPose = (a: Pose, b: Pose, k0: number): Pose => {
  const k = Math.min(1, Math.max(0, k0));
  if (k <= 0) return a;
  if (k >= 1) return b;
  const n = (x?: number, y?: number, d = 0) => l(x ?? d, y ?? d, k);
  const pega = (x?: Mao, y?: Mao): Mao | undefined => (k < 0.5 ? x : y);
  return {
    ...(k < 0.5 ? a : b),
    x: n(a.x, b.x), y: n(a.y, b.y), scale: n(a.scale, b.scale, 1),
    headTilt: n(a.headTilt, b.headTilt), lean: n(a.lean, b.lean), hip: n(a.hip, b.hip), ombros: n(a.ombros, b.ombros),
    handL: lp(a.handL, b.handL, k, [-72, -110]), handR: lp(a.handR, b.handR, k, [74, -108]),
    bendL: n(a.bendL, b.bendL, 6), bendR: n(a.bendR, b.bendR, 6),
    gripL: pega(a.gripL, b.gripL), gripR: pega(a.gripR, b.gripR),
    footL: lp(a.footL, b.footL, k, [-30, 0]), footR: lp(a.footR, b.footR, k, [32, 0]),
    kneeL: n(a.kneeL, b.kneeL, 2), kneeR: n(a.kneeR, b.kneeR, 2),
    lookAt: a.lookAt || b.lookAt ? lp(a.lookAt, b.lookAt, k, [0, -330]) : undefined,
    pulo: n(a.pulo, b.pulo), respira: n(a.respira, b.respira), abaixa: n(a.abaixa, b.abaixa), sentado: n(a.sentado, b.sentado), giro: n(a.giro, b.giro),
    squashL: n(a.squashL, b.squashL), squashR: n(a.squashR, b.squashR),
    pulsoL: a.pulsoL !== undefined && b.pulsoL !== undefined ? n(a.pulsoL, b.pulsoL) : (k < 0.5 ? a : b).pulsoL,
    pulsoR: a.pulsoR !== undefined && b.pulsoR !== undefined ? n(a.pulsoR, b.pulsoR) : (k < 0.5 ? a : b).pulsoR,
    expr: misturaRosto(rosto(a.expr), rosto(b.expr), suave(k)),
  };
};

/** sequência de ações [quadro de início, ação]; cada troca interpola por `n` quadros */
export const seq = (f: number, passos: [number, Acao][], n = 8): Pose => {
  let i = 0;
  while (i + 1 < passos.length && f >= passos[i + 1][0]) i++;
  const atual = passos[i][1](f);
  if (i > 0 && f < passos[i][0] + n) return mixPose(passos[i - 1][1](f), atual, suave((f - passos[i][0]) / n));
  return atual;
};

/** olhar: os olhos vão para o alvo no quadro f; a cabeça acompanha o alvo de 4 quadros antes */
export const olharComCabeca = (alvo: (f: number) => P | undefined, f: number, cabeca: P = [0, -330], forca = 7) => {
  const agora = alvo(f);
  const antes = alvo(f - 4) ?? agora;
  const tilt = antes ? Math.max(-1, Math.min(1, (antes[0] - cabeca[0]) / 500)) * forca : 0;
  return { lookAt: agora, headTilt: tilt };
};
