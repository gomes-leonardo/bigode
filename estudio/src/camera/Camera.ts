// Câmera dos vídeos. Cada PLANO tem enquadramento base, push-in lento (1.0 -> 1.05 ao longo do plano), viagem
// opcional (travelling, mostra o parallax) e zooms de reação (1.0 -> 1.15 em 6 quadros, em volta do rosto).
// Entre planos: corte seco (sem transição).
import type { P } from "../components/Person";
import type { Camera } from "../cenarios/Cena";
import { MARGEM } from "../cenarios/pecas";

const lim = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const suave = (x: number) => (x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x));
const saiRapido = (x: number) => 1 - Math.pow(1 - lim(x, 0, 1), 3);

/** zoom rápido de reação: começa em `em`, chega em z (1.15) em `quadros` (6) em volta de `alvo` (ponto do mundo,
 * normalmente o rosto); fica até o fim do plano, ou volta em 8 quadros a partir de `solta` */
export type Reacao = { em: number; alvo: P; z?: number; quadros?: number; solta?: number };

export type Plano = {
  de: number; // primeiro quadro (o corte acontece aqui)
  ate: number; // quadro seguinte ao último
  enquadra?: { x?: number; y?: number; zoom?: number }; // centro no mundo e zoom no começo do plano
  pushIn?: number; // quanto o plano aproxima até o fim (0.05 = de 1.0 a 1.05)
  viagem?: { x?: number; y?: number }; // travelling ao longo do plano (px no mundo)
  reacoes?: Reacao[];
};

export const PUSH_IN = 0.05;
export const ZOOM_REACAO = 1.15;
export const QUADROS_REACAO = 6;

/** câmera de um plano num quadro (o quadro é absoluto, da linha do tempo) */
export const cameraNoQuadro = (p: Plano, f: number): Camera => {
  const k = suave((f - p.de) / Math.max(1, p.ate - p.de));
  const zoom = (p.enquadra?.zoom ?? 1) * (1 + (p.pushIn ?? PUSH_IN) * k);
  // o quadro nunca mostra a borda do que foi desenhado
  const meiaL = 960 / zoom, meiaA = 540 / zoom;
  const x = lim((p.enquadra?.x ?? 960) + (p.viagem?.x ?? 0) * k, meiaL - MARGEM * 0.9, 1920 + MARGEM * 0.9 - meiaL);
  const y = lim((p.enquadra?.y ?? 540) + (p.viagem?.y ?? 0) * k, meiaA - MARGEM * 0.9, 1080 + MARGEM * 0.9 - meiaA);
  let otico: Camera["otico"];
  for (const r of p.reacoes ?? []) {
    if (f < r.em) continue;
    let kz = saiRapido((f - r.em) / (r.quadros ?? QUADROS_REACAO));
    if (r.solta !== undefined && f >= r.solta) kz *= 1 - suave((f - r.solta) / 8);
    // o ponto de apoio do zoom é o rosto na tela
    otico = { z: 1 + ((r.z ?? ZOOM_REACAO) - 1) * kz, px: 960 + (r.alvo[0] - x) * zoom, py: 540 + (r.alvo[1] - y) * zoom };
  }
  return { x, y, zoom, otico };
};

/** plano ativo num quadro (corte seco: troca exatamente no `de` do próximo) */
export const planoNoQuadro = <T extends Plano>(planos: T[], f: number): T => planos.find((p) => f >= p.de && f < p.ate) ?? planos[planos.length - 1];
