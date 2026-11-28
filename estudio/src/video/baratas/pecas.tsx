// Peças em SVG do Short "baratas extintas" (motion graphics): a barata vista de cima e de lado, a grade de espécies,
// o chão da floresta (folha, madeira, bicho morto), o corte do solo com o nitrogênio e a planta, os bichos que comem
// barata, a vespa com a ooteca, a casa. Regra de tela: nenhuma figura entra na faixa da legenda (y 1300 a 1480), e o
// que importa fica longe da borda direita (onde ficam os botões do Shorts e do TikTok).
import React from "react";
import { FONTE } from "../../fontes";
import dados from "./dados.json";

export const E = dados as {
  pulso: number; casa0: number; ext: number[]; pan: number; alerta: number; folha: number; madeira: number; bicho: number; coco: number[];
  nitro: number; planta: number; bichos: number[]; ovo: number; some: number; menos: number[]; some30: number[]; volta: number[]; gancho: number;
};
export const AMARELO = "#ffd23f", VERDE = "#5fd17a", VERMELHO = "#ff3b3b";
export const suave = (x: number) => { const k = Math.min(1, Math.max(0, x)); return k * k * (3 - 2 * k); };
export const saida = (x: number) => 1 - Math.pow(1 - Math.min(1, Math.max(0, x)), 3);
export const prog = (f: number, de: number, ate: number) => Math.min(1, Math.max(0, (f - de) / Math.max(1, ate - de)));
export const rnd = (i: number) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

export const Texto: React.FC<{ x?: number; y: number; t: string; tam?: number; cor?: string; op?: number }> = ({ x = 540, y, t, tam = 70, cor = "#fff", op = 1 }) => (
  <text x={x} y={y} textAnchor="middle" fontFamily={FONTE} fontWeight={900} fontSize={tam} fill={cor} opacity={op} stroke="#07090f" strokeWidth={tam * 0.17} strokeLinejoin="round" paintOrder="stroke">{t}</text>
);
export const X: React.FC<{ x: number; y: number; s?: number; k: number }> = ({ x, y, s = 1, k }) =>
  k <= 0 ? null : (
    <g transform={`translate(${x} ${y}) scale(${s * (0.6 + 0.4 * saida(k))})`} opacity={Math.min(1, k * 2)}>
      <path d="M-70 -70 L70 70 M70 -70 L-70 70" stroke="#07090f" strokeWidth={44} strokeLinecap="round" />
      <path d="M-70 -70 L70 70 M70 -70 L-70 70" stroke={VERMELHO} strokeWidth={30} strokeLinecap="round" />
    </g>
  );
/** um anel que pulsa (para apontar uma coisa sem escrever o nome dela na tela) */
export const Anel: React.FC<{ x: number; y: number; r: number; k: number; cor?: string }> = ({ x, y, r, k, cor = AMARELO }) =>
  k <= 0 || k >= 1 ? null : <circle cx={x} cy={y} r={r * (0.7 + 0.6 * saida(k))} fill="none" stroke={cor} strokeWidth={10 * (1 - k) + 2} opacity={1 - k} />;
export const Seta: React.FC<{ x1: number; y1: number; x2: number; y2: number; k: number; cor?: string }> = ({ x1, y1, x2, y2, k, cor = "#ffffff" }) => {
  if (k <= 0) return null;
  const x = x1 + (x2 - x1) * saida(k), y = y1 + (y2 - y1) * saida(k);
  const a = Math.atan2(y2 - y1, x2 - x1);
  return (
    <g opacity={Math.min(1, k * 2)}>
      <path d={`M${x1} ${y1} L${x} ${y}`} stroke="#07090f" strokeWidth={16} strokeLinecap="round" />
      <path d={`M${x1} ${y1} L${x} ${y}`} stroke={cor} strokeWidth={8} strokeLinecap="round" />
      <path d={`M${x} ${y} L${x - 26 * Math.cos(a - 0.5)} ${y - 26 * Math.sin(a - 0.5)} L${x - 26 * Math.cos(a + 0.5)} ${y - 26 * Math.sin(a + 0.5)} Z`} fill={cor} stroke="#07090f" strokeWidth={4} />
    </g>
  );
};

// ---------- fundos ----------
const TEMAS = {
  noite: { r: true, a: "#24324a", b: "#07090f" },
  mato: { r: true, a: "#1f5a3a", b: "#06140d" },
  chao: { r: true, a: "#6b4a2e", b: "#2a1a0e" },
  ceu: { r: false, a: "#7cc4f2", b: "#e2f4ff" },
  casa: { r: true, a: "#f1e3c8", b: "#b89a6a" },
};
export const Fundo: React.FC<{ tema: keyof typeof TEMAS }> = ({ tema }) => {
  const c = TEMAS[tema];
  return (
    <g>
      <defs>
        {c.r
          ? <radialGradient id={`bt-${tema}`} cx="0.5" cy="0.4" r="0.85"><stop offset="0" stopColor={c.a} /><stop offset="1" stopColor={c.b} /></radialGradient>
          : <linearGradient id={`bt-${tema}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={c.a} /><stop offset="1" stopColor={c.b} /></linearGradient>}
      </defs>
      <rect width={1080} height={1920} fill={`url(#bt-${tema})`} />
    </g>
  );
};

// ---------- a barata ----------
export const CASEIRA = ["#6e3216", "#b3672f"] as const;
export const SELVAGENS: [string, string][] = [
  ["#3b2a20", "#6b4a33"], ["#262626", "#5a4a3a"], ["#7a5a2a", "#d1a64a"], ["#2f5a3a", "#5fa06a"], ["#4a2516", "#e8a03a"],
  ["#4a3a2a", "#8f7d5c"], ["#23405f", "#5a8ab0"], ["#5e2a38", "#c46a5a"], ["#1f1f1f", "#d9c27a"], ["#556b2f", "#a8b85a"],
];
/** barata vista de cima, cabeça para cima (y negativo); passo anima as patas (marcha em tripé) */
export const Barata: React.FC<{ x: number; y: number; s?: number; ang?: number; cor?: readonly [string, string]; passo?: number; antena?: number; op?: number }> = ({
  x, y, s = 1, ang = 0, cor = CASEIRA, passo = 0, antena = 0, op = 1,
}) => {
  const PERNAS = [
    { a: [11, -8], j: [30, -24], p: [40, -44], g: 0 },
    { a: [14, 8], j: [36, 6], p: [50, 16], g: 1 },
    { a: [12, 24], j: [32, 38], p: [42, 62], g: 0 },
  ];
  const pernas = [-1, 1].flatMap((l) =>
    PERNAS.map((p, k) => {
      const fase = Math.sin(passo + ((p.g + (l > 0 ? 0 : 1)) % 2) * Math.PI) * 7;
      return <path key={`${l}${k}`} d={`M${l * p.a[0]} ${p.a[1]} L${l * p.j[0]} ${p.j[1] + fase * 0.5} L${l * p.p[0]} ${p.p[1] + fase}`} stroke="#2a160a" strokeWidth={5} fill="none" strokeLinecap="round" strokeLinejoin="round" />;
    }),
  );
  const ant = (l: number) => `M${l * 4} -40 Q${l * (22 + 4 * antena)} -82 ${l * (34 + 8 * antena)} ${-120 + 6 * antena}`;
  return (
    <g transform={`translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${ang.toFixed(1)}) scale(${s})`} opacity={op}>
      {pernas}
      <path d={ant(-1)} stroke="#2a160a" strokeWidth={4} fill="none" strokeLinecap="round" />
      <path d={ant(1)} stroke="#2a160a" strokeWidth={4} fill="none" strokeLinecap="round" />
      <path d="M-6 56 L-11 68 M6 56 L11 68" stroke="#2a160a" strokeWidth={4} strokeLinecap="round" />
      <path d="M0 -12 C27 -12 30 40 0 58 C-30 40 -27 -12 0 -12 Z" fill={cor[0]} stroke="#1a0c05" strokeWidth={4} />
      <path d="M0 -6 L0 54" stroke="#1a0c05" strokeWidth={3} opacity={0.6} />
      <path d="M-14 0 C-12 20 -8 36 -3 48 M14 0 C12 20 8 36 3 48" stroke="#ffffff" strokeWidth={3} opacity={0.12} fill="none" />
      <ellipse cx={0} cy={-22} rx={23} ry={15} fill={cor[1]} stroke="#1a0c05" strokeWidth={4} />
      <ellipse cx={0} cy={-21} rx={12} ry={7} fill={cor[0]} opacity={0.55} />
      <ellipse cx={0} cy={-38} rx={9} ry={7} fill="#2a160a" />
    </g>
  );
};
/** barata vista de lado, andando para a direita */
export const BarataLado: React.FC<{ x: number; y: number; s?: number; passo?: number; cor?: readonly [string, string] }> = ({ x, y, s = 1, passo = 0, cor = SELVAGENS[0] }) => (
  <g transform={`translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${s})`}>
    {[-30, 0, 30].map((dx, k) => {
      const f = Math.sin(passo + k * 2.1) * 8;
      return <path key={k} d={`M${dx} -14 L${dx + 10 + f} -2 L${dx + 2 + f * 1.4} 0`} stroke="#2a160a" strokeWidth={5} fill="none" strokeLinecap="round" />;
    })}
    <path d="M-70 -18 C-60 -46 40 -48 70 -24 C60 -12 -40 -6 -70 -18 Z" fill={cor[0]} stroke="#1a0c05" strokeWidth={4} />
    <path d="M42 -38 C62 -38 78 -30 80 -20 C66 -14 50 -16 40 -22 Z" fill={cor[1]} stroke="#1a0c05" strokeWidth={4} />
    <path d="M78 -22 Q120 -60 150 -40" stroke="#2a160a" strokeWidth={4} fill="none" />
    <path d="M-68 -20 L-90 -30" stroke="#2a160a" strokeWidth={4} />
  </g>
);

// ---------- a grade de espécies (150 = 1 em 150, quase a proporção de 30 em 4.600) ----------
export const GRADE = { col: 15, lin: 10, dx: 64, x0: 92, y0: 600 };
export const PRAGA = 4 * 15 + 9; // a única "caseira" da grade
/** cada espécie numa fichinha clara; a caseira em vermelho, com a casinha; some/volta: 0..1 por espécie */
export const Grade: React.FC<{ f: number; some?: (i: number) => number; volta?: (i: number) => number; casa?: number; pulso?: number }> = ({ f, some, volta, casa = 1, pulso = 0 }) => (
  <g>
    {Array.from({ length: GRADE.col * GRADE.lin }, (_, i) => {
      const c = i % GRADE.col, l = Math.floor(i / GRADE.col);
      const x = GRADE.x0 + c * GRADE.dx, y = GRADE.y0 + l * GRADE.dx;
      const sumiu = some ? some(i) : 0, voltou = volta ? volta(i) : 1;
      const vis = Math.min(1 - sumiu, voltou);
      const caseira = i === PRAGA;
      return (
        <g key={i}>
          {vis < 1 && <circle cx={x} cy={y} r={27} fill="none" stroke="#9fb0a6" strokeWidth={2.5} strokeDasharray="5 6" opacity={0.5} />}
          {vis > 0 && (
            <g opacity={Math.min(1, vis * 1.5)} transform={`translate(${x} ${y}) scale(${(0.5 + 0.5 * vis) * (caseira ? 1 + 0.18 * pulso : 1)}) translate(${-x} ${-y})`}>
              <circle cx={x} cy={y} r={29} fill={caseira ? VERMELHO : "#efe7d2"} stroke={caseira ? "#ffffff" : "#07090f"} strokeWidth={caseira ? 6 : 3} />
              <Barata x={x} y={y + 4} s={0.34} ang={(rnd(i) - 0.5) * 40} cor={caseira ? CASEIRA : SELVAGENS[i % SELVAGENS.length]} antena={Math.sin(f * 0.2 + i)} />
              {caseira && casa > 0 && <Casinha x={x + 26} y={y - 28} s={0.36 * casa} />}
            </g>
          )}
        </g>
      );
    })}
  </g>
);
export const Casinha: React.FC<{ x: number; y: number; s: number }> = ({ x, y, s }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <circle r={46} fill="#ffffff" stroke="#07090f" strokeWidth={6} />
    <path d="M-26 6 L-26 28 L26 28 L26 6 M-34 10 L0 -22 L34 10" stroke={VERMELHO} strokeWidth={8} fill="none" strokeLinejoin="round" strokeLinecap="round" />
  </g>
);

// ---------- paisagem: a casa aqui, a floresta lá longe ----------
export const Arvore: React.FC<{ x: number; y: number; s: number; tom?: number }> = ({ x, y, s, tom = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-12} y={-90} width={24} height={90} fill="#5a3a22" />
    <circle cx={0} cy={-120} r={58} fill={["#2f7a46", "#3a8f52", "#26663b"][tom % 3]} stroke="#07090f" strokeWidth={4} />
    <circle cx={-38} cy={-96} r={38} fill={["#3a8f52", "#26663b", "#2f7a46"][tom % 3]} stroke="#07090f" strokeWidth={4} />
    <circle cx={38} cy={-98} r={40} fill={["#26663b", "#2f7a46", "#3a8f52"][tom % 3]} stroke="#07090f" strokeWidth={4} />
  </g>
);
export const Casa: React.FC<{ x: number; y: number; s: number }> = ({ x, y, s }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-110} y={-130} width={220} height={130} fill="#f3e6c8" stroke="#07090f" strokeWidth={7} />
    <path d="M-135 -125 L0 -230 L135 -125 Z" fill="#d94a3a" stroke="#07090f" strokeWidth={7} strokeLinejoin="round" />
    <rect x={-25} y={-80} width={50} height={80} fill="#8a5a2a" stroke="#07090f" strokeWidth={5} />
    <rect x={-90} y={-105} width={46} height={40} fill="#9fd8ff" stroke="#07090f" strokeWidth={5} />
    <rect x={44} y={-105} width={46} height={40} fill="#9fd8ff" stroke="#07090f" strokeWidth={5} />
  </g>
);

// ---------- o chão da floresta, de cima ----------
export const Folha: React.FC<{ x: number; y: number; s: number; ang: number; cor?: string; mordida?: number; fundo?: string }> = ({ x, y, s, ang, cor = "#c98a2e", mordida = 0, fundo = "#4a321e" }) => (
  <g transform={`translate(${x} ${y}) rotate(${ang}) scale(${s})`}>
    <path d="M0 -120 C70 -80 75 40 0 120 C-75 40 -70 -80 0 -120 Z" fill={cor} stroke="#5a3a12" strokeWidth={5} />
    <path d="M0 -110 L0 110 M0 -40 L35 -70 M0 0 L45 -25 M0 40 L38 20 M0 -40 L-35 -70 M0 0 L-45 -25 M0 40 L-38 20" stroke="#7a5216" strokeWidth={4} fill="none" />
    {[[50, -20], [42, 30], [-48, 10], [30, 70]].map(([bx, by], i) => {
      const k = Math.min(1, Math.max(0, mordida * 4 - i));
      return k > 0 ? <circle key={i} cx={bx} cy={by} r={24 * k} fill={fundo} /> : null;
    })}
  </g>
);
export const Tronco: React.FC<{ x: number; y: number; s: number; ang: number; lascas?: number }> = ({ x, y, s, ang, lascas = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${ang}) scale(${s})`}>
    <rect x={-230} y={-60} width={460} height={120} rx={56} fill="#7a4e2a" stroke="#2a160a" strokeWidth={6} />
    {[-160, -90, -20, 50, 120].map((bx, i) => <path key={i} d={`M${bx} -48 Q${bx + 20} 0 ${bx} 48`} stroke="#5a3418" strokeWidth={6} fill="none" />)}
    <ellipse cx={200} cy={0} rx={30} ry={56} fill="#c9a06a" stroke="#2a160a" strokeWidth={5} />
    <ellipse cx={200} cy={0} rx={16} ry={30} fill="none" stroke="#8a6a3a" strokeWidth={4} />
    {Array.from({ length: 9 }, (_, i) => {
      const k = Math.min(1, Math.max(0, lascas * 3 - i * 0.25));
      return k > 0 ? <rect key={i} x={-60 + rnd(i) * 160} y={64 + rnd(i + 3) * 40 * k} width={16} height={8} rx={3} fill="#d9b27a" opacity={k} transform={`rotate(${rnd(i + 5) * 90} ${-60 + rnd(i) * 160} 70)`} /> : null;
    })}
  </g>
);
export const BesouroMorto: React.FC<{ x: number; y: number; s: number; resta?: number }> = ({ x, y, s, resta = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s * (0.35 + 0.65 * resta)})`} opacity={0.4 + 0.6 * resta}>
    {[-1, 1].map((l) => [-18, 4, 26].map((dy, k) => <path key={`${l}${k}`} d={`M${l * 22} ${dy} Q${l * 46} ${dy - 20} ${l * 36} ${dy - 40}`} stroke="#1a1a1a" strokeWidth={6} fill="none" strokeLinecap="round" />))}
    <ellipse cx={0} cy={8} rx={38} ry={52} fill="#2b3a2a" stroke="#0a0f0a" strokeWidth={5} />
    <ellipse cx={0} cy={-52} rx={20} ry={16} fill="#1f2a1e" stroke="#0a0f0a" strokeWidth={5} />
    <path d="M0 -40 L0 58" stroke="#0a0f0a" strokeWidth={4} />
    <path d="M-8 -58 L-2 -50 M-2 -58 L-8 -50 M2 -58 L8 -50 M8 -58 L2 -50" stroke="#e6e6e6" strokeWidth={3} />
  </g>
);

// ---------- o corte do solo: o cocô, o nitrogênio e a planta ----------
export const SOLO = 840; // a linha do chão no corte
export const Planta: React.FC<{ x: number; k: number; murcha?: number }> = ({ x, k, murcha = 0 }) => {
  const h = 140 + 260 * k, cai = 40 * murcha;
  const folhas = Math.max(1, Math.round(2 + 3 * k));
  return (
    <g>
      {/* raízes */}
      {[[-60, 120], [-20, 170], [30, 150], [70, 110], [0, 210]].map(([dx, dy], i) => (
        <path key={i} d={`M${x} ${SOLO} Q${x + dx * 0.4} ${SOLO + dy * 0.5} ${x + dx} ${SOLO + dy}`} stroke="#e8d6b0" strokeWidth={7} fill="none" strokeLinecap="round" />
      ))}
      <path d={`M${x} ${SOLO} Q${x + 10 + cai} ${SOLO - h * 0.5} ${x + cai * 1.6} ${SOLO - h}`} stroke="#3e8f3e" strokeWidth={14} fill="none" strokeLinecap="round" />
      {Array.from({ length: folhas }, (_, i) => {
        const t = (i + 1) / (folhas + 0.5), yy = SOLO - h * t, xx = x + cai * 1.6 * t * t + 6, l = i % 2 ? 1 : -1;
        const tam = (40 + 30 * k) * (1 - 0.3 * t) * (1 - 0.25 * murcha);
        return <path key={i} d={`M${xx} ${yy} C${xx + l * tam * 0.6} ${yy - tam * 0.7 + cai} ${xx + l * tam * 1.6} ${yy - tam * 0.3 + cai * 1.5} ${xx + l * tam * 1.9} ${yy + cai * 1.4} C${xx + l * tam} ${yy + tam * 0.35} ${xx + l * tam * 0.4} ${yy + tam * 0.2} ${xx} ${yy} Z`} fill={murcha > 0.5 ? "#8aa84a" : "#4fb04f"} stroke="#1f5a1f" strokeWidth={4} />;
      })}
    </g>
  );
};
export const Particula: React.FC<{ x: number; y: number; op?: number; s?: number }> = ({ x, y, op = 1, s = 1 }) => (
  <g transform={`translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${s})`} opacity={op}>
    <circle r={20} fill="#7dff9a" opacity={0.35} />
    <circle r={14} fill="#2fbf5a" stroke="#07090f" strokeWidth={3} />
    <text y={6} textAnchor="middle" fontFamily={FONTE} fontWeight={900} fontSize={18} fill="#07090f">N</text>
  </g>
);

// ---------- quem come barata ----------
export const Passaro: React.FC<{ x: number; y: number; s: number; olha?: number }> = ({ x, y, s, olha = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s * olha} ${s})`}>
    <path d="M-15 48 L-20 78 M12 48 L8 78" stroke="#e8a52a" strokeWidth={6} strokeLinecap="round" />
    <path d="M40 10 L100 -6 L94 26 Z" fill="#7a3e12" stroke="#07090f" strokeWidth={4} />
    <path d="M-62 8 C-62 -42 22 -52 52 -10 C70 16 40 52 0 52 C-36 52 -62 36 -62 8 Z" fill="#b8692a" stroke="#07090f" strokeWidth={5} />
    <path d="M-8 2 C12 -30 52 -24 62 2 C40 14 12 18 -8 2 Z" fill="#7a3e12" stroke="#07090f" strokeWidth={4} />
    <circle cx={-48} cy={-26} r={30} fill="#c97a32" stroke="#07090f" strokeWidth={5} />
    <path d="M-76 -32 L-104 -22 L-76 -14 Z" fill="#f2b134" stroke="#07090f" strokeWidth={4} strokeLinejoin="round" />
    <circle cx={-56} cy={-32} r={6} fill="#111" />
  </g>
);
export const Lagarto: React.FC<{ x: number; y: number; s: number; ang?: number }> = ({ x, y, s, ang = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${ang}) scale(${s})`}>
    <path d="M0 60 C10 110 50 120 70 100" stroke="#4aa64a" strokeWidth={18} fill="none" strokeLinecap="round" />
    {[[-1, -20], [1, -20], [-1, 40], [1, 40]].map(([l, dy], i) => (
      <g key={i}>
        <path d={`M${l * 16} ${dy} L${l * 46} ${dy - 14} L${l * 56} ${dy + 6}`} stroke="#4aa64a" strokeWidth={12} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx={l * 58} cy={dy + 8} r={7} fill="#7fd67f" />
      </g>
    ))}
    <ellipse cx={0} cy={10} rx={26} ry={62} fill="#5fbf5a" stroke="#07090f" strokeWidth={5} />
    {[[-8, -10], [10, 14], [-6, 38]].map(([dx, dy], i) => <circle key={i} cx={dx} cy={dy} r={6} fill="#2f7a2f" />)}
    <ellipse cx={0} cy={-62} rx={24} ry={28} fill="#5fbf5a" stroke="#07090f" strokeWidth={5} />
    <circle cx={-12} cy={-70} r={7} fill="#ffd23f" stroke="#07090f" strokeWidth={3} />
    <circle cx={12} cy={-70} r={7} fill="#ffd23f" stroke="#07090f" strokeWidth={3} />
  </g>
);
export const Rato: React.FC<{ x: number; y: number; s: number; olha?: number }> = ({ x, y, s, olha = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s * olha} ${s})`}>
    <path d="M55 15 C100 20 110 -20 140 -10" stroke="#d9a0a8" strokeWidth={7} fill="none" strokeLinecap="round" />
    <ellipse cx={10} cy={8} rx={62} ry={38} fill="#a3a9b3" stroke="#07090f" strokeWidth={5} />
    <circle cx={-50} cy={-4} r={28} fill="#a3a9b3" stroke="#07090f" strokeWidth={5} />
    <circle cx={-40} cy={-34} r={16} fill="#e8b4bc" stroke="#07090f" strokeWidth={4} />
    <circle cx={-80} cy={0} r={7} fill="#e88a98" />
    <circle cx={-58} cy={-8} r={5} fill="#111" />
    <path d="M-20 44 L-24 54 M30 44 L26 54" stroke="#07090f" strokeWidth={5} strokeLinecap="round" />
  </g>
);
export const Vespa: React.FC<{ x: number; y: number; s: number; asa?: number; olha?: number; curva?: number; op?: number; contorno?: boolean }> = ({
  x, y, s, asa = 0, olha = 1, curva = 0, op = 1, contorno = false,
}) => {
  const fill = (c: string) => (contorno ? "none" : c);
  const st = contorno ? "#9fb0a6" : "#07090f";
  return (
    <g transform={`translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${s * olha} ${s})`} opacity={op} strokeDasharray={contorno ? "8 8" : undefined}>
      <ellipse cx={-2} cy={-34} rx={38} ry={16} fill={contorno ? "none" : "#e6f4ff"} opacity={0.75} stroke={st} strokeWidth={3} transform={`rotate(${-20 + 12 * Math.sin(asa)} -2 -20)`} />
      <ellipse cx={18} cy={-30} rx={32} ry={13} fill={contorno ? "none" : "#e6f4ff"} opacity={0.75} stroke={st} strokeWidth={3} transform={`rotate(${-8 + 12 * Math.sin(asa + 1)} 10 -18)`} />
      <g transform={`rotate(${curva * 50} 18 0)`}>
        <ellipse cx={58} cy={6} rx={42} ry={22} fill={fill("#f2c12e")} stroke={st} strokeWidth={5} />
        {!contorno && [40, 58, 76].map((sx) => <path key={sx} d={`M${sx} -14 Q${sx + 6} 6 ${sx} 26`} stroke="#1a1a1a" strokeWidth={9} fill="none" />)}
        <path d="M98 8 L116 12" stroke={st} strokeWidth={4} />
      </g>
      <ellipse cx={0} cy={0} rx={24} ry={18} fill={fill("#3a2a1a")} stroke={st} strokeWidth={5} />
      <circle cx={-34} cy={-4} r={15} fill={fill("#3a2a1a")} stroke={st} strokeWidth={5} />
      <path d="M-42 -16 Q-58 -48 -72 -52 M-36 -18 Q-46 -50 -56 -58" stroke={st} strokeWidth={4} fill="none" />
      {[-10, 4, 16].map((lx) => <path key={lx} d={`M${lx} 14 L${lx - 6} 40 L${lx - 14} 50`} stroke={st} strokeWidth={4} fill="none" />)}
      {!contorno && <circle cx={-40} cy={-8} r={5} fill="#ffd23f" />}
    </g>
  );
};
/** a ooteca (a "bolsinha" de ovos da barata), cortada para mostrar os ovos; ovoVespa acende um deles */
export const Ooteca: React.FC<{ x: number; y: number; s: number; ovoVespa?: number; op?: number }> = ({ x, y, s, ovoVespa = 0, op = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={op}>
    <path d="M-210 10 C-210 -80 210 -80 210 10 L210 30 C210 92 -210 92 -210 30 Z" fill="#7a4220" stroke="#2a160a" strokeWidth={7} />
    <path d={`M-190 -52 ${Array.from({ length: 19 }, (_, i) => `L${-180 + i * 20} ${i % 2 ? -76 : -60}`).join(" ")} L190 -52`} stroke="#5a2e14" strokeWidth={6} fill="#8a4c26" />
    <rect x={-170} y={-24} width={340} height={96} rx={30} fill="#3a1e0e" />
    {Array.from({ length: 8 }, (_, i) => {
      const vespa = i === 5 && ovoVespa > 0;
      return (
        <g key={i}>
          {vespa && <circle cx={-147 + i * 42} cy={24} r={34 * ovoVespa} fill={AMARELO} opacity={0.45} />}
          <ellipse cx={-147 + i * 42} cy={24} rx={16} ry={36} fill={vespa ? AMARELO : "#f3e6c8"} stroke="#2a160a" strokeWidth={4} />
        </g>
      );
    })}
  </g>
);
export const Tigela: React.FC<{ x: number; y: number; cheia: number }> = ({ x, y, cheia }) => (
  <g transform={`translate(${x} ${y})`}>
    {[[-38, -18], [0, -26], [38, -18]].map(([dx, dy], i) => {
      const k = Math.min(1, Math.max(0, cheia * 3 - i));
      return k > 0 ? <Barata key={i} x={dx} y={dy + 10} s={0.32} ang={90 + i * 40} cor={SELVAGENS[i + 2]} op={k} /> : null;
    })}
    <path d="M-90 -10 L90 -10 C82 50 50 70 0 70 C-50 70 -82 50 -90 -10 Z" fill="#e8e2d0" stroke="#07090f" strokeWidth={7} />
  </g>
);
