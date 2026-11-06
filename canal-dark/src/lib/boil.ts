import { random, useCurrentFrame } from "remotion";

// "Boiling line": a seed do rough.js muda a cada 3 quadros, então o traço vibra como desenho à mão.
export const QUADROS_POR_BOIL = 3;

export const hashTexto = (s: string) => {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
};

export const useBoilTick = () =>
  Math.floor(useCurrentFrame() / QUADROS_POR_BOIL);

// Seed inteira > 0, diferente por forma (id) e por tick.
export const seedDe = (tick: number, id: string) =>
  ((hashTexto(id) + tick * 7919) % 2147483646) + 1;

// Deslocamento pequeno para texto tremido (mesma cadência do traço).
export const tremor = (
  tick: number,
  id: string,
  amp = 1.5,
): [number, number] => [
  (random(`tr-${tick}-${id}-x`) - 0.5) * 2 * amp,
  (random(`tr-${tick}-${id}-y`) - 0.5) * 2 * amp,
];
