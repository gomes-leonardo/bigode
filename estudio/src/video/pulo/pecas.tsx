// Peças em SVG do Short "todo mundo pulando ao mesmo tempo" (motion graphics): a Terra com os continentes em pontos
// numa projeção ortográfica, a gente em formato de pílula, o sismógrafo, o Sol e a órbita, a planície com a multidão,
// o medidor, a balança, o zoom até o átomo, a multidão vista de cima e a estrada de volta pra casa.
import React from "react";
import { FONTE } from "../../fontes";
import dados from "./dados.json";

export const E = dados as {
  agacha: number; tremor: number; foge: number; para: number; volta: number; x: number; junta: number[]; pulo1: number; medidor: number;
  balanca: number; zoom: number[]; atomo: number; pouso1: number; nada: number; check: number; depois: number; x2: number[]; casa: number;
  pulo2: number; pouso2: number;
};
export const AMARELO = "#ffd23f", VERDE = "#33d17a", VERMELHO = "#ff3b3b";
export const suave = (x: number) => { const k = Math.min(1, Math.max(0, x)); return k * k * (3 - 2 * k); };
export const saida = (x: number) => 1 - Math.pow(1 - Math.min(1, Math.max(0, x)), 3);
export const prog = (f: number, de: number, ate: number) => Math.min(1, Math.max(0, (f - de) / Math.max(1, ate - de)));
/** número pseudoaleatório fixo (0..1) para o índice i */
export const rnd = (i: number) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

export const Texto: React.FC<{ x?: number; y: number; t: string; tam?: number; cor?: string; op?: number }> = ({ x = 540, y, t, tam = 70, cor = "#fff", op = 1 }) => (
  <text x={x} y={y} textAnchor="middle" fontFamily={FONTE} fontWeight={900} fontSize={tam} fill={cor} opacity={op} stroke="#07090f" strokeWidth={tam * 0.17} strokeLinejoin="round" paintOrder="stroke">{t}</text>
);
export const Etiqueta: React.FC<{ x: number; y: number; t: string; cor?: string; fundo?: string; tam?: number; k?: number }> = ({ x, y, t, cor = "#111", fundo = AMARELO, tam = 50, k = 1 }) => {
  if (k <= 0) return null;
  const w = t.length * tam * 0.64 + tam;
  return (
    <g transform={`translate(${x} ${y}) scale(${0.7 + 0.3 * saida(k)})`} opacity={Math.min(1, k * 2)}>
      <rect x={-w / 2} y={-tam * 0.85} width={w} height={tam * 1.5} rx={tam * 0.3} fill={fundo} stroke="#07090f" strokeWidth={5} />
      <text y={tam * 0.28} textAnchor="middle" fontFamily={FONTE} fontWeight={900} fontSize={tam} fill={cor}>{t}</text>
    </g>
  );
};
export const X: React.FC<{ x: number; y: number; s?: number; k: number }> = ({ x, y, s = 1, k }) =>
  k <= 0 ? null : (
    <g transform={`translate(${x} ${y}) scale(${s * (0.6 + 0.4 * saida(k))})`} opacity={Math.min(1, k * 2)}>
      <path d="M-70 -70 L70 70 M70 -70 L-70 70" stroke="#07090f" strokeWidth={44} strokeLinecap="round" />
      <path d="M-70 -70 L70 70 M70 -70 L-70 70" stroke={VERMELHO} strokeWidth={30} strokeLinecap="round" />
    </g>
  );
export const Certo: React.FC<{ x: number; y: number; s?: number; k: number }> = ({ x, y, s = 1, k }) =>
  k <= 0 ? null : (
    <g transform={`translate(${x} ${y}) scale(${s * (0.7 + 0.3 * saida(k))})`} opacity={Math.min(1, k * 2)}>
      <circle r={120} fill={VERDE} stroke="#07090f" strokeWidth={10} />
      <path d="M-62 2 L-16 46 L64 -44" stroke="#fff" strokeWidth={30} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeDasharray={230} strokeDashoffset={230 * (1 - saida(Math.min(1, k * 1.4)))} />
    </g>
  );
export const Contador: React.FC<{ x: number; y: number; texto: string; w?: number; tam?: number; cor?: string }> = ({ x, y, texto, w = 900, tam = 110, cor = "#7dff9a" }) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={-w / 2} y={-tam * 0.9} width={w} height={tam * 1.5} rx={28} fill="#0a1410" stroke="#2b4a3c" strokeWidth={8} />
    <text y={tam * 0.33} textAnchor="middle" fontFamily={FONTE} fontWeight={900} fontSize={tam} fill={cor} style={{ fontVariantNumeric: "tabular-nums" }}>{texto}</text>
  </g>
);
export const fmt = (n: number) => Math.round(n).toLocaleString("pt-BR");

// ---------- fundos ----------
const TEMAS = {
  espaco: { r: true, a: "#1b2460", b: "#03040c" },
  lab: { r: true, a: "#4a4f5e", b: "#14161c" },
  dia: { r: false, a: "#4fa9ee", b: "#d6f0ff" },
  tarde: { r: false, a: "#2b1748", b: "#ff8a52" },
  balanca: { r: true, a: "#45388a", b: "#120e29" },
  atomo: { r: true, a: "#145563", b: "#03141a" },
  chao: { r: true, a: "#7d6447", b: "#2e2216" },
};
export const Fundo: React.FC<{ tema: keyof typeof TEMAS }> = ({ tema }) => {
  const c = TEMAS[tema];
  return (
    <g>
      <defs>
        {c.r
          ? <radialGradient id={`pl-${tema}`} cx="0.5" cy="0.42" r="0.85"><stop offset="0" stopColor={c.a} /><stop offset="1" stopColor={c.b} /></radialGradient>
          : <linearGradient id={`pl-${tema}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={c.a} /><stop offset="1" stopColor={c.b} /></linearGradient>}
      </defs>
      <rect width={1080} height={1920} fill={`url(#pl-${tema})`} />
    </g>
  );
};
export const Estrelas: React.FC<{ f: number; n?: number }> = ({ f, n = 110 }) => (
  <g>
    {Array.from({ length: n }, (_, i) => {
      const b = 0.5 + 0.5 * Math.sin(f * (0.04 + rnd(i + 77) * 0.08) + i);
      return <circle key={i} cx={rnd(i) * 1080} cy={rnd(i + 500) * 1920} r={1.2 + rnd(i + 900) * 2.6} fill="#fff" opacity={0.3 + 0.6 * b} />;
    })}
  </g>
);

// ---------- a Terra ----------
// contornos bem simplificados dos continentes (longitude, latitude); viram uma grade de pontos de terra
const TERRAS: [number, number][][] = [
  // América do Sul
  [[-80, 9], [-75, 11], [-62, 10.5], [-52, 5], [-50, 0], [-44, -2.5], [-35, -5], [-35, -9], [-39, -15], [-41, -22], [-48, -26], [-53, -34], [-58, -38],
    [-65, -42], [-68, -50], [-70, -54], [-74, -50], [-73, -40], [-72, -30], [-70, -18], [-76, -14], [-81, -6], [-80, -1], [-78, 2], [-77, 7]],
  // América do Norte e Central
  [[-168, 66], [-162, 70], [-150, 71], [-140, 70], [-128, 70], [-115, 68], [-95, 72], [-82, 68], [-78, 62], [-65, 60], [-60, 53], [-55, 50], [-66, 45],
    [-70, 42], [-75, 38], [-76, 35], [-81, 31], [-80, 26], [-82, 26], [-84, 30], [-90, 29], [-97, 27], [-97, 21], [-94, 18], [-88, 21], [-87, 16],
    [-83, 10], [-80, 8], [-85, 11], [-92, 15], [-105, 20], [-110, 24], [-115, 30], [-117, 32], [-121, 36], [-124, 41], [-124, 47], [-130, 54],
    [-138, 59], [-147, 61], [-155, 58], [-160, 59], [-165, 62]],
  // Groenlândia
  [[-55, 60], [-43, 60], [-35, 66], [-22, 70], [-20, 76], [-30, 83], [-50, 82], [-65, 78], [-70, 76], [-58, 70], [-53, 66]],
  // África
  [[-17, 21], [-16, 15], [-12, 9], [-8, 5], [-2, 5], [5, 5], [9, 4], [10, 0], [12, -6], [13, -12], [12, -18], [15, -27], [19, -34.5], [25, -34], [32, -28],
    [35, -22], [40, -15], [40, -10], [39, -5], [42, 0], [48, 5], [51, 12], [44, 11], [43, 13], [38, 18], [35, 24], [33, 30], [25, 32], [20, 31],
    [10, 37], [0, 36], [-6, 36], [-10, 30], [-13, 27]],
  // Europa e Ásia
  [[-9, 37], [-9, 43], [-1, 44], [-4, 48], [2, 51], [8, 54], [10, 58], [5, 62], [12, 66], [20, 70], [30, 70], [40, 67], [45, 68], [60, 69], [70, 73],
    [80, 73], [100, 77], [110, 74], [130, 72], [140, 72], [160, 70], [175, 67], [180, 65], [170, 60], [163, 56], [156, 51], [157, 58], [150, 59],
    [140, 54], [141, 48], [135, 43], [130, 42], [127, 38], [126, 35], [121, 31], [122, 28], [119, 24], [110, 21], [108, 17], [109, 12], [105, 9],
    [103, 1], [100, 7], [98, 16], [94, 17], [91, 22], [87, 21], [80, 15], [77, 8], [73, 17], [73, 21], [67, 24], [57, 25], [56, 26], [52, 27],
    [48, 30], [50, 25], [56, 22], [59, 22], [53, 17], [45, 13], [43, 13], [39, 21], [35, 28], [34, 31], [35, 36], [30, 36], [27, 38], [26, 41],
    [23, 38], [21, 37], [19, 40], [16, 38], [12, 44], [8, 44], [3, 43], [0, 39], [-2, 37]],
  // Austrália
  [[114, -22], [114, -34], [118, -35], [124, -34], [131, -31.5], [138, -35], [141, -38], [147, -38], [150, -37], [153, -32], [153, -25], [150, -22],
    [146, -19], [142, -11], [138, -16], [136, -12], [131, -12], [127, -14], [122, -18]],
  // ilhas grandes: Grã-Bretanha, Japão, Madagascar, Bornéu, Sumatra, Nova Guiné, Nova Zelândia
  [[-6, 50], [2, 51], [0, 54], [-3, 58.5], [-6, 57]],
  [[130, 31], [135, 34], [140, 35], [142, 40], [141, 45], [139, 42], [136, 36], [131, 34]],
  [[44, -12], [50, -15], [47, -25], [43, -22]],
  [[109, 1], [117, 7], [119, 1], [116, -4], [110, -3]],
  [[95, 5], [104, -2], [106, -6], [101, -3]],
  [[131, -1], [141, -3], [150, -10], [141, -9], [137, -5]],
  [[167, -46], [174, -41], [178, -38], [173, -35], [172, -41]],
];
const dentro = (lo: number, la: number, pol: [number, number][]) => {
  let c = false;
  for (let i = 0, j = pol.length - 1; i < pol.length; j = i++) {
    const [xi, yi] = pol[i], [xj, yj] = pol[j];
    if (yi > la !== yj > la && lo < ((xj - xi) * (la - yi)) / (yj - yi) + xi) c = !c;
  }
  return c;
};
const PASSO = 3;
const PONTOS: [number, number][] = (() => {
  const p: [number, number][] = [];
  for (let la = -88.5; la < 90; la += PASSO)
    for (let lo = -178.5; lo < 180; lo += PASSO / Math.max(0.35, Math.cos((la * Math.PI) / 180)))
      if (la < -68 || TERRAS.some((pol) => dentro(lo, la, pol))) p.push([lo, la]);
  return p;
})();
const D = Math.PI / 180;
export const Globo: React.FC<{ x: number; y: number; r: number; lon0: number; lat0?: number; id: string }> = ({ x, y, r, lon0, lat0 = 10, id }) => {
  const s0 = Math.sin(lat0 * D), c0 = Math.cos(lat0 * D);
  const raio = Math.max(1.2, r * PASSO * D * 0.62);
  const pts: React.ReactNode[] = [];
  PONTOS.forEach(([lo, la], i) => {
    const l = (lo - lon0) * D, p = la * D;
    const cl = Math.cos(l), cp = Math.cos(p), sp = Math.sin(p);
    const z = s0 * sp + c0 * cp * cl;
    if (z < 0.03) return;
    pts.push(<circle key={i} cx={(x + r * cp * Math.sin(l)).toFixed(1)} cy={(y - r * (c0 * sp - s0 * cp * cl)).toFixed(1)} r={raio} fill={la < -68 ? "#eef4f8" : "#45b46c"} />);
  });
  return (
    <g>
      <defs>
        <radialGradient id={`${id}-mar`} cx="0.4" cy="0.35" r="0.75"><stop offset="0" stopColor="#3f8cf0" /><stop offset="1" stopColor="#163c94" /></radialGradient>
        <radialGradient id={`${id}-sombra`} cx="0.33" cy="0.3" r="0.85"><stop offset="0.45" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#020418" stopOpacity="0.65" /></radialGradient>
        <radialGradient id={`${id}-ar`} cx="0.5" cy="0.5" r="0.5"><stop offset="0.84" stopColor="#8fd8ff" stopOpacity="0" /><stop offset="0.86" stopColor="#8fd8ff" stopOpacity="0.5" /><stop offset="1" stopColor="#8fd8ff" stopOpacity="0" /></radialGradient>
        <clipPath id={`${id}-clip`}><circle cx={x} cy={y} r={r} /></clipPath>
      </defs>
      <circle cx={x} cy={y} r={r * 1.18} fill={`url(#${id}-ar)`} />
      <circle cx={x} cy={y} r={r} fill={`url(#${id}-mar)`} />
      <g clipPath={`url(#${id}-clip)`}>{pts}</g>
      <circle cx={x} cy={y} r={r} fill={`url(#${id}-sombra)`} />
      <ellipse cx={x - r * 0.38} cy={y - r * 0.4} rx={r * 0.3} ry={r * 0.22} fill="#fff" opacity={0.08} transform={`rotate(-35 ${x - r * 0.38} ${y - r * 0.4})`} />
      <circle cx={x} cy={y} r={r} fill="none" stroke="#07090f" strokeWidth={Math.max(2, r / 70)} opacity={0.55} />
    </g>
  );
};

// ---------- a gente ----------
export const ROUPAS = ["#ff6b6b", "#ffd23f", "#4ecdc4", "#a78bfa", "#ff9f1c", "#2ec4b6", "#f472b6", "#60a5fa", "#84cc16", "#f97316", "#e879f9", "#22d3ee"];
const PELES = ["#f2c9a0", "#d9a06b", "#a86b3c", "#7a4a2a", "#e8b48a", "#c68a5a"];
/** uma pessoa em pé com os pés em (x, y); ang gira o corpo (0 = de pé), agacha 0..1, braços 0 (baixos) a 1 (para cima) */
export const Pessoa: React.FC<{ x: number; y: number; ang?: number; s?: number; i: number; agacha?: number; bracos?: number }> = ({ x, y, ang = 0, s = 1, i, agacha = 0, bracos = 0 }) => {
  const perna = 15 * (1 - 0.45 * agacha), ombro = -perna - 20;
  const roupa = ROUPAS[i % ROUPAS.length], pele = PELES[(i * 7) % PELES.length];
  const mao = (lado: number) => `M${lado * 8} ${ombro + 4} L${lado * (13 + 4 * bracos)} ${ombro + 18 - 40 * bracos}`;
  return (
    <g transform={`translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${ang.toFixed(2)}) scale(${s})`}>
      <path d={mao(-1)} stroke={roupa} strokeWidth={6} strokeLinecap="round" />
      <path d={mao(1)} stroke={roupa} strokeWidth={6} strokeLinecap="round" />
      <rect x={-7} y={-perna} width={5.5} height={perna} rx={2.5} fill="#2b2f39" />
      <rect x={1.5} y={-perna} width={5.5} height={perna} rx={2.5} fill="#2b2f39" />
      <rect x={-10} y={ombro} width={20} height={23} rx={8} fill={roupa} stroke="#07090f" strokeWidth={2.5} />
      <circle cx={0} cy={ombro - 10} r={10} fill={pele} stroke="#07090f" strokeWidth={2.5} />
    </g>
  );
};
/** a turma em volta da Terra, de pé (a direção "para cima" de cada um aponta para fora do planeta) */
export const GenteNoGlobo: React.FC<{ x: number; y: number; r: number; n?: number; s?: number; agacha?: number; sobe?: number; bracos?: number; f?: number }> = ({
  x, y, r, n = 34, s = 1.6, agacha = 0, sobe = 0, bracos = 0, f = 0,
}) => (
  <g>
    {Array.from({ length: n }, (_, i) => {
      const a = ((-90 + (i * 360) / n + (rnd(i + 40) - 0.5) * 3) * Math.PI) / 180;
      const balanço = 1.5 * Math.sin(f * 0.18 + i * 0.7);
      const h = sobe * (0.92 + 0.16 * rnd(i + 3));
      const R = r - 2 + h;
      return <Pessoa key={i} i={i} x={x + R * Math.cos(a)} y={y + R * Math.sin(a)} ang={(a * 180) / Math.PI + 90 + balanço} s={s * (0.92 + 0.16 * rnd(i + 9))} agacha={agacha} bracos={bracos} />;
    })}
  </g>
);

// ---------- o sismógrafo ----------
export const Sismografo: React.FC<{ f: number; amp: (q: number) => number }> = ({ f, amp }) => {
  const XP = 860, Y = 1000, V = 9; // a ponta da agulha fica em XP; o papel corre V px por quadro
  const onda = (q: number) => Math.sin(q * 0.93) * 0.55 + Math.sin(q * 2.31 + 1) * 0.3 + Math.sin(q * 4.7 + 2) * 0.15;
  const pts: string[] = [];
  for (let x = 44; x <= XP; x += 4) { const q = f - (XP - x) / V; pts.push(`${x} ${(Y + amp(q) * onda(q)).toFixed(1)}`); }
  const yp = Y + amp(f) * onda(f);
  return (
    <g>
      <rect x={40} y={640} width={1000} height={720} rx={18} fill="#f6efdc" stroke="#07090f" strokeWidth={8} />
      {Array.from({ length: 9 }, (_, i) => <path key={`h${i}`} d={`M44 ${680 + i * 80} L1036 ${680 + i * 80}`} stroke="#ecc7ba" strokeWidth={3} />)}
      {Array.from({ length: 14 }, (_, i) => {
        const x = 1036 - ((i * 80 + f * V) % 1120);
        return x < 44 ? null : <path key={`v${i}`} d={`M${x.toFixed(1)} 644 L${x.toFixed(1)} 1356`} stroke="#ecc7ba" strokeWidth={3} />;
      })}
      <path d={`M${pts.join(" L")}`} fill="none" stroke="#1d2433" strokeWidth={5} strokeLinejoin="round" />
      <path d={`M1010 560 L${XP} ${yp.toFixed(1)}`} stroke="#3a3f4d" strokeWidth={14} strokeLinecap="round" />
      <circle cx={1010} cy={560} r={26} fill="#3a3f4d" stroke="#07090f" strokeWidth={6} />
      <circle cx={XP} cy={yp} r={10} fill={VERMELHO} stroke="#07090f" strokeWidth={4} />
    </g>
  );
};

// ---------- o Sol e a órbita ----------
export const ORB = { sx: 230, sy: 1180, rx: 560, ry: 230 };
export const pontoOrbita = (th: number) => [ORB.sx + ORB.rx * Math.cos(th), ORB.sy + ORB.ry * Math.sin(th)] as const;
export const Orbita: React.FC<{ f: number }> = ({ f }) => (
  <g>
    <defs>
      <radialGradient id="pl-sol" cx="0.5" cy="0.5" r="0.5">
        <stop offset="0" stopColor="#fff6c7" /><stop offset="0.42" stopColor="#ffd23f" /><stop offset="0.62" stopColor="#ff9f1c" stopOpacity="0.85" /><stop offset="1" stopColor="#ff6b35" stopOpacity="0" />
      </radialGradient>
    </defs>
    <ellipse cx={ORB.sx} cy={ORB.sy} rx={ORB.rx} ry={ORB.ry} fill="none" stroke="#9fb3ff" strokeWidth={5} strokeDasharray="18 16" opacity={0.6} />
    <circle cx={ORB.sx} cy={ORB.sy} r={230 * (1 + 0.025 * Math.sin(f / 6))} fill="url(#pl-sol)" />
  </g>
);

// ---------- a planície com a multidão (vista de lado) ----------
const FILAS = [
  { y: 1330, s: 0.95, n: 15, h: 190 },
  { y: 1400, s: 1.2, n: 12, h: 240 },
  { y: 1490, s: 1.5, n: 9, h: 300 },
];
/** o chão e a multidão; sobe 0..1 (altura do pulo de cada fila), agacha 0..1, braços 0..1, poeira 0..1 */
export const Planicie: React.FC<{ f: number; sobe?: number; agacha?: number; bracos?: number; poeira?: number; tom?: number }> = ({ f, sobe = 0, agacha = 0, bracos = 0, poeira = 0, tom = 0 }) => (
  <g>
    <circle cx={540} cy={1290 + 3200} r={3200} fill="#58b85f" />
    <circle cx={540} cy={1290 + 3200} r={3200} fill="#1a0f2e" opacity={0.55 * tom} />
    <path d="M0 1300 Q540 1270 1080 1300" stroke="#3f9a4a" strokeWidth={6} fill="none" />
    {FILAS.map((fila, j) =>
      Array.from({ length: fila.n }, (_, k) => {
        const i = j * 20 + k;
        const x = ((k + 0.5) * 1080) / fila.n + (rnd(i) - 0.5) * 30;
        const atraso = (rnd(i + 11) - 0.5) * 0.12;
        const h = fila.h * Math.max(0, sobe + atraso * (sobe > 0 && sobe < 1 ? 1 : 0));
        return (
          <g key={i}>
            {poeira > 0 && <ellipse cx={x} cy={fila.y + 4} rx={30 * fila.s * (0.6 + poeira)} ry={8 * fila.s * (0.6 + poeira)} fill="#d9cdb0" opacity={0.7 * (1 - poeira)} />}
            <Pessoa i={i} x={x} y={fila.y - h + 1.5 * Math.sin(f * 0.2 + i)} s={fila.s * 1.6} agacha={agacha} bracos={bracos} />
          </g>
        );
      }),
    )}
  </g>
);

// ---------- o medidor ----------
export const Medidor: React.FC<{ x: number; y: number; ang: number; t?: string }> = ({ x, y, ang, t = "MOVIMENTO DA TERRA" }) => (
  <g transform={`translate(${x} ${y})`}>
    <path d="M-170 0 A170 170 0 0 1 170 0 Z" fill="#ffffff" stroke="#07090f" strokeWidth={8} />
    {Array.from({ length: 11 }, (_, i) => {
      const a = Math.PI + (i * Math.PI) / 10;
      return <path key={i} d={`M${140 * Math.cos(a)} ${140 * Math.sin(a)} L${(i % 5 ? 152 : 120) * Math.cos(a)} ${(i % 5 ? 152 : 120) * Math.sin(a)}`} stroke="#07090f" strokeWidth={i % 5 ? 4 : 7} />;
    })}
    <text x={0} y={-90} textAnchor="middle" fontFamily={FONTE} fontWeight={900} fontSize={34} fill="#07090f">0</text>
    <path d={`M0 0 L${130 * Math.sin((ang * Math.PI) / 180)} ${-130 * Math.cos((ang * Math.PI) / 180)}`} stroke={VERMELHO} strokeWidth={10} strokeLinecap="round" />
    <circle r={16} fill="#07090f" />
    <text y={60} textAnchor="middle" fontFamily={FONTE} fontWeight={900} fontSize={40} fill="#fff" stroke="#07090f" strokeWidth={7} paintOrder="stroke">{t}</text>
  </g>
);

// ---------- o zoom até o átomo ----------
export const Grama: React.FC = () => (
  <g>
    <rect x={0} y={0} width={1080} height={1920} fill="#5a3f26" />
    {Array.from({ length: 40 }, (_, i) => <ellipse key={i} cx={rnd(i + 1) * 1080} cy={1000 + rnd(i + 2) * 920} rx={20 + rnd(i + 3) * 40} ry={10 + rnd(i + 4) * 16} fill={i % 2 ? "#6b4b2e" : "#4a321e"} />)}
    <rect x={0} y={880} width={1080} height={60} fill="#3f9a4a" />
    {Array.from({ length: 60 }, (_, i) => <path key={i} d={`M${i * 18 + 4} 885 l${-6 + rnd(i) * 12} ${-30 - rnd(i + 5) * 30}`} stroke="#58b85f" strokeWidth={7} strokeLinecap="round" />)}
    {/* um tênis no chão */}
    <path d="M330 880 L330 760 Q330 720 380 720 L470 720 Q500 720 520 760 L600 800 Q700 820 720 860 L720 880 Z" fill="#ff6b6b" stroke="#07090f" strokeWidth={8} />
    <rect x={320} y={866} width={410} height={22} rx={10} fill="#f4f4f4" stroke="#07090f" strokeWidth={6} />
  </g>
);
export const Graos: React.FC = () => (
  <g>
    <rect x={0} y={0} width={1080} height={1920} fill="#3d2a1a" />
    {Array.from({ length: 34 }, (_, i) => {
      const cx = rnd(i + 20) * 1080, cy = rnd(i + 40) * 1920, r = 70 + rnd(i + 60) * 90;
      const pts = Array.from({ length: 7 }, (_, k) => { const a = (k / 7) * Math.PI * 2; const rr = r * (0.75 + 0.35 * rnd(i * 7 + k)); return `${(cx + rr * Math.cos(a)).toFixed(0)} ${(cy + rr * Math.sin(a)).toFixed(0)}`; });
      return <path key={i} d={`M${pts.join(" L")} Z`} fill={["#a07a52", "#8b6743", "#c49a6c", "#7a5a3a"][i % 4]} stroke="#2a1c10" strokeWidth={6} />;
    })}
  </g>
);
export const Rede: React.FC = () => (
  <g>
    <rect x={0} y={0} width={1080} height={1920} fill="#0c2a33" />
    {Array.from({ length: 9 }, (_, l) => Array.from({ length: 6 }, (_, c) => {
      const x = 90 + c * 180 + (l % 2) * 90, y = 120 + l * 210;
      return (
        <g key={`${l}-${c}`}>
          <path d={`M${x} ${y} L${x + 180} ${y} M${x} ${y} L${x + 90} ${y + 210}`} stroke="#3c8fa3" strokeWidth={8} />
          <circle cx={x} cy={y} r={52} fill="#6fd3e8" stroke="#0a1f26" strokeWidth={6} />
          <circle cx={x - 15} cy={y - 15} r={14} fill="#c9f6ff" opacity={0.7} />
        </g>
      );
    }))}
  </g>
);
export const AtomoGrande: React.FC<{ f: number; x: number; y: number; s: number }> = ({ f, x, y, s }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <circle r={300} fill="#6fd3e8" opacity={0.12} />
    {[0, 60, 120].map((rot, i) => (
      <g key={rot} transform={`rotate(${rot})`}>
        <ellipse rx={290} ry={95} fill="none" stroke="#9feaff" strokeWidth={6} opacity={0.75} />
        <circle cx={290 * Math.cos(f * 0.12 + i * 2.1)} cy={95 * Math.sin(f * 0.12 + i * 2.1)} r={16} fill="#ffffff" />
      </g>
    ))}
    {[[-14, -10, "#ff6b6b"], [14, -8, "#60a5fa"], [0, 14, "#ff6b6b"], [-12, 12, "#60a5fa"], [12, 14, "#ff6b6b"], [0, -18, "#60a5fa"]].map(([dx, dy, c], i) => (
      <circle key={i} cx={dx as number} cy={dy as number} r={17} fill={c as string} stroke="#07090f" strokeWidth={3} />
    ))}
  </g>
);

// ---------- a balança ----------
export const Balanca: React.FC<{ ang: number; lon0: number }> = ({ ang, lon0 }) => {
  const px = 540, py = 820, L = 410;
  const a = (ang * Math.PI) / 180;
  const esq = [px - L * Math.cos(a), py - L * Math.sin(a)], dir = [px + L * Math.cos(a), py + L * Math.sin(a)];
  const prato = (cx: number, cy: number) => (
    <g>
      <path d={`M${cx} ${cy} L${cx - 120} ${cy + 200} M${cx} ${cy} L${cx + 120} ${cy + 200}`} stroke="#c9c2e8" strokeWidth={5} />
      <path d={`M${cx - 150} ${cy + 200} Q${cx} ${cy + 270} ${cx + 150} ${cy + 200} Z`} fill="#d8b44a" stroke="#07090f" strokeWidth={7} />
    </g>
  );
  return (
    <g>
      <path d="M400 1560 L680 1560 L620 1480 L460 1480 Z" fill="#8a6ad8" stroke="#07090f" strokeWidth={8} />
      <rect x={522} y={py} width={36} height={680} fill="#a58af0" stroke="#07090f" strokeWidth={7} />
      {prato(esq[0], esq[1])}
      {prato(dir[0], dir[1])}
      <Globo x={esq[0]} y={esq[1] + 200 - 160} r={150} lon0={lon0} id="pl-bal" />
      {/* toda a humanidade: um montinho minúsculo */}
      {Array.from({ length: 7 }, (_, i) => <circle key={i} cx={dir[0] - 12 + (i % 4) * 8} cy={dir[1] + 194 - Math.floor(i / 4) * 7} r={4} fill={ROUPAS[i]} stroke="#07090f" strokeWidth={1.5} />)}
      <rect x={px - L - 20} y={py - 16} width={2 * L + 40} height={32} rx={16} fill="#c9b8ff" stroke="#07090f" strokeWidth={7} transform={`rotate(${ang} ${px} ${py})`} />
      <circle cx={px} cy={py} r={26} fill="#ffd23f" stroke="#07090f" strokeWidth={7} />
    </g>
  );
};

// ---------- a multidão vista de cima ----------
const CABELOS = ["#2a1d16", "#4a2f1f", "#111111", "#7a4a2a", "#c9a15a", "#3a2a22"];
export const MultidaoCima: React.FC<{ f: number }> = ({ f }) => (
  <g>
    <rect x={-600} y={-400} width={2280} height={2900} fill="#6b5a3e" />
    {Array.from({ length: 46 }, (_, l) => Array.from({ length: 40 }, (_, c) => {
      const i = l * 40 + c;
      const x = -420 + c * 48 + (l % 2) * 24 + (rnd(i) - 0.5) * 14 + 2.5 * Math.sin(f * 0.25 + i);
      const y = -260 + l * 54 + (rnd(i + 7) - 0.5) * 14 + 2.5 * Math.cos(f * 0.21 + i * 1.3);
      return (
        <g key={i}>
          <ellipse cx={x} cy={y + 4} rx={20} ry={13} fill={ROUPAS[i % ROUPAS.length]} />
          <circle cx={x} cy={y} r={11} fill={CABELOS[i % CABELOS.length]} />
        </g>
      );
    }))}
  </g>
);
export const Selo: React.FC<{ x: number; y: number; tipo: "comida" | "agua"; k: number; t: string }> = ({ x, y, tipo, k, t }) =>
  k <= 0 ? null : (
    <g transform={`translate(${x} ${y}) scale(${0.7 + 0.3 * saida(k)})`} opacity={Math.min(1, k * 2)}>
      <circle r={115} fill="#ffffff" stroke="#07090f" strokeWidth={9} />
      {tipo === "comida" ? (
        <g>
          <circle r={62} fill="#f2f2f2" stroke="#07090f" strokeWidth={6} />
          <circle r={38} fill="none" stroke="#c7ccd4" strokeWidth={5} />
          <path d="M-88 -40 L-88 50 M-98 -40 L-98 -10 M-78 -40 L-78 -10 M-98 -10 L-78 -10" stroke="#07090f" strokeWidth={6} strokeLinecap="round" />
          <path d="M88 -40 Q100 -10 88 10 L88 50" stroke="#07090f" strokeWidth={7} fill="none" strokeLinecap="round" />
        </g>
      ) : (
        <path d="M0 -75 C30 -35 55 -5 55 25 C55 58 30 78 0 78 C-30 78 -55 58 -55 25 C-55 -5 -30 -35 0 -75 Z" fill="#38bdf8" stroke="#07090f" strokeWidth={7} />
      )}
      <X x={0} y={0} s={0.95} k={Math.min(1, k * 1.5)} />
      <text y={170} textAnchor="middle" fontFamily={FONTE} fontWeight={900} fontSize={46} fill="#fff" stroke="#07090f" strokeWidth={8} paintOrder="stroke">{t}</text>
    </g>
  );

// ---------- a estrada de volta pra casa ----------
export const Estrada: React.FC<{ f: number; de: number }> = ({ f, de }) => {
  const H = 760;
  const filas: React.ReactNode[] = [];
  const anda = (f - de) * 0.0012 * (0.6 + 0.4 * Math.sin((f - de) * 0.2));
  for (let j = 0; j < 46; j++) {
    const t0 = ((j / 46 + 0.02 - anda) % 1 + 1) % 1;
    const t = Math.pow(t0, 1.35);
    const y = H + (1920 - H) * t * t + 2;
    const w = 50 + 900 * t * t;
    const n = Math.max(2, Math.round(w / (26 + 30 * t * t)));
    const r = 3 + 22 * t * t;
    for (let k = 0; k < n; k++) {
      const i = j * 40 + k;
      filas.push(<circle key={i} cx={540 - w / 2 + ((k + 0.5) * w) / n + (rnd(i) - 0.5) * r * 0.6} cy={y} r={r} fill={ROUPAS[i % ROUPAS.length]} stroke="#07090f" strokeWidth={Math.max(1, r / 7)} />);
    }
  }
  return (
    <g>
      <rect x={0} y={H} width={1080} height={1920 - H} fill="#4b5a3a" />
      <path d={`M500 ${H} L580 ${H} L1060 1920 L20 1920 Z`} fill="#5b5f69" />
      <path d={`M540 ${H} L540 1920`} stroke="#e7e0c9" strokeWidth={10} strokeDasharray="40 40" opacity={0.6} />
      {filas}
      {/* a casa, lá longe */}
      <g transform={`translate(540 ${H - 8})`}>
        <path d="M-16 0 L-16 -18 L0 -30 L16 -18 L16 0 Z" fill="#f3e6c8" stroke="#07090f" strokeWidth={3} />
        <path d="M-20 -16 L0 -34 L20 -16" stroke={VERMELHO} strokeWidth={5} fill="none" strokeLinecap="round" />
      </g>
      <g transform={`translate(540 ${H - 120})`}>
        <path d="M0 70 C-20 40 -44 18 -44 -6 C-44 -32 -24 -50 0 -50 C24 -50 44 -32 44 -6 C44 18 20 40 0 70 Z" fill={VERMELHO} stroke="#07090f" strokeWidth={6} />
        <circle cy={-8} r={16} fill="#fff" />
      </g>
    </g>
  );
};
