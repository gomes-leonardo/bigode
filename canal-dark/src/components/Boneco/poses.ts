// Poses do boneco como ângulos de articulação (graus). Vista de frente.
// Membros: [ângulo do segmento de cima, ângulo do de baixo em relação ao de cima].
// 0° = apontando para baixo; positivo = abre para fora do corpo (lado esquerdo espelhado).
export type Pose = {
  tronco: number; // inclinação do tronco (positivo = para a direita da tela)
  cabeca: number; // inclinação da cabeça
  olhar: number; // -1 olhando para baixo … 0 frente … 1 olhando para cima
  giro: number; // 0 = de costas (sem olhos) … 1 = de frente
  bracoE: [number, number];
  bracoD: [number, number];
  pernaE: [number, number];
  pernaD: [number, number];
};

export const POSES = {
  emPe: {
    tronco: 0,
    cabeca: 0,
    olhar: 0,
    giro: 1,
    bracoE: [12, -6],
    bracoD: [12, -6],
    pernaE: [9, -4],
    pernaD: [9, -4],
  },
  olhandoPraCima: {
    tronco: -3,
    cabeca: -6,
    olhar: 1,
    giro: 1,
    bracoE: [10, -4],
    bracoD: [10, -4],
    pernaE: [9, -4],
    pernaD: [9, -4],
  },
  apontando: {
    tronco: 4,
    cabeca: 4,
    olhar: 0.2,
    giro: 1,
    bracoE: [12, -6],
    bracoD: [96, 4],
    pernaE: [10, -4],
    pernaD: [10, -4],
  },
  assustadoRecuando: {
    tronco: -12,
    cabeca: -10,
    olhar: 0.3,
    giro: 1,
    bracoE: [128, -78],
    bracoD: [128, -78],
    pernaE: [20, -14],
    pernaD: [16, -10],
  },
  deCostas: {
    tronco: 0,
    cabeca: 0,
    olhar: 0,
    giro: 0,
    bracoE: [12, -6],
    bracoD: [12, -6],
    pernaE: [9, -4],
    pernaD: [9, -4],
  },
  maosNaCintura: {
    tronco: 0,
    cabeca: 0,
    olhar: 0,
    giro: 1,
    bracoE: [48, -100],
    bracoD: [48, -100],
    pernaE: [11, -4],
    pernaD: [11, -4],
  },
  segurando: {
    tronco: 2,
    cabeca: 8,
    olhar: -0.6,
    giro: 1,
    bracoE: [30, -90],
    bracoD: [30, -90],
    pernaE: [9, -4],
    pernaD: [9, -4],
  },
} satisfies Record<string, Pose>;

export type NomePose = keyof typeof POSES;

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const par = (
  a: [number, number],
  b: [number, number],
  t: number,
): [number, number] => [lerp(a[0], b[0], t), lerp(a[1], b[1], t)];

// Transição suave entre poses: interpola os ângulos (não as posições).
export const misturar = (a: Pose, b: Pose, t: number): Pose => {
  const k = Math.max(0, Math.min(1, t));
  return {
    tronco: lerp(a.tronco, b.tronco, k),
    cabeca: lerp(a.cabeca, b.cabeca, k),
    olhar: lerp(a.olhar, b.olhar, k),
    giro: lerp(a.giro, b.giro, k),
    bracoE: par(a.bracoE, b.bracoE, k),
    bracoD: par(a.bracoD, b.bracoD, k),
    pernaE: par(a.pernaE, b.pernaE, k),
    pernaD: par(a.pernaD, b.pernaD, k),
  };
};

// Ciclo de caminhada aplicado por cima de qualquer pose (fase em radianos).
export const andar = (p: Pose, fase: number, amplitude = 1): Pose => {
  const s = Math.sin(fase) * amplitude;
  return {
    ...p,
    pernaE: [p.pernaE[0] + s * 22, p.pernaE[1] - Math.max(0, -s) * 26],
    pernaD: [p.pernaD[0] - s * 22, p.pernaD[1] - Math.max(0, s) * 26],
    bracoE: [p.bracoE[0] - s * 14, p.bracoE[1]],
    bracoD: [p.bracoD[0] + s * 14, p.bracoD[1]],
  };
};
