// Peças em SVG do Short "o pato que dorme com metade do cérebro" (motion graphics): o pato de frente, de lado e visto
// de cima, o lago à noite com o tronco, o cone de visão, o cérebro em raio-x (com o cruzamento olho → metade oposta),
// as ondas, as barras de sono, a mão que troca o pato de ponta, a raposa, o quarto de hotel e a pessoa.
import React from "react";
import { FONTE } from "../../fontes";
import dados from "./dados.json";

export const E = dados as { plim: number[]; galho: number; bipe: number };
export const AMARELO = "#ffd23f", AZUL = "#4a8cff";
export const suave = (x: number) => { const k = Math.min(1, Math.max(0, x)); return k * k * (3 - 2 * k); };
export const saida = (x: number) => 1 - Math.pow(1 - Math.min(1, Math.max(0, x)), 3);
const C = { cabeca: "#2f8f5b", cabeca2: "#1d6a40", bico: "#f4b63b", bico2: "#c98a1c", peito: "#8a5a3c", corpo: "#a3abb5", asa: "#6e7986", anel: "#f3f1ea" };

export const Texto: React.FC<{ x?: number; y: number; t: string; tam?: number; cor?: string; op?: number }> = ({ x = 540, y, t, tam = 70, cor = "#fff", op = 1 }) => (
  <text x={x} y={y} textAnchor="middle" fontFamily={FONTE} fontWeight={900} fontSize={tam} fill={cor} opacity={op} stroke="#0a0d1a" strokeWidth={tam * 0.17} strokeLinejoin="round" paintOrder="stroke">{t}</text>
);
export const Etiqueta: React.FC<{ x: number; y: number; t: string; cor?: string; fundo?: string; tam?: number; k?: number }> = ({ x, y, t, cor = "#111", fundo = AMARELO, tam = 50, k = 1 }) => {
  if (k <= 0) return null;
  const w = t.length * tam * 0.64 + tam;
  return (
    <g transform={`translate(${x} ${y}) scale(${0.7 + 0.3 * saida(k)})`} opacity={Math.min(1, k * 2)}>
      <rect x={-w / 2} y={-tam * 0.85} width={w} height={tam * 1.5} rx={tam * 0.3} fill={fundo} stroke="#0a0d1a" strokeWidth={5} />
      <text y={tam * 0.28} textAnchor="middle" fontFamily={FONTE} fontWeight={900} fontSize={tam} fill={cor}>{t}</text>
    </g>
  );
};
/** o texto do gancho (plano 1 e plano 14: o mesmo, para o loop) */
export const Gancho: React.FC<{ op?: number }> = ({ op = 1 }) => (
  <g opacity={op}>
    <Texto y={210} t="JÁ IMAGINOU SE VOCÊ" tam={72} />
    <Texto y={315} t="DORMISSE COM UM" tam={84} cor={AMARELO} />
    <Texto y={420} t="OLHO ABERTO?" tam={84} cor={AMARELO} />
  </g>
);

// ---------- fundos ----------
export const Noite: React.FC<{ lua?: boolean }> = ({ lua = true }) => (
  <g>
    <defs>
      <linearGradient id="pt-ceu" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#070b1e" /><stop offset="1" stopColor="#1a2550" /></linearGradient>
    </defs>
    <rect width={1080} height={1920} fill="url(#pt-ceu)" />
    {Array.from({ length: 46 }, (_, i) => <circle key={i} cx={(i * 263) % 1080} cy={(i * 151) % 1100} r={1.5 + (i % 3)} fill="#fff" opacity={0.35 + 0.3 * (i % 2)} />)}
    {lua && <><circle cx={905} cy={640} r={70} fill="#fdf3c8" /><circle cx={931} cy={623} r={62} fill="#101a3c" /></>}
  </g>
);
/** o lago visto de lado: margem ao fundo, água, o tronco boiando */
export const LagoLado: React.FC<{ f: number; tronco?: { x: number; y: number; w: number } }> = ({ f, tronco = { x: 540, y: 1160, w: 820 } }) => (
  <g>
    <Noite />
    <path d="M0 980 C140 930 260 960 380 940 C520 915 640 960 760 935 C880 910 980 940 1080 925 L1080 1020 L0 1020 Z" fill="#0a1424" />
    {Array.from({ length: 24 }, (_, i) => <path key={i} d={`M${i * 46 + 8} 1000 q${6 - (i % 3) * 4} -${60 + (i * 13) % 50} ${2 + (i % 2) * 6} -${90 + (i * 17) % 60}`} stroke="#0d1c2e" strokeWidth={6} fill="none" />)}
    <rect x={0} y={1010} width={1080} height={910} fill="#10284a" />
    {Array.from({ length: 14 }, (_, i) => {
      const y = 1060 + i * 60, dx = Math.sin(f * 0.05 + i) * 30;
      return <line key={i} x1={80 + ((i * 197) % 600) + dx} y1={y} x2={260 + ((i * 197) % 600) + dx} y2={y} stroke="#2b5a8f" strokeWidth={5} strokeLinecap="round" opacity={0.6} />;
    })}
    <ellipse cx={840} cy={1120} rx={60} ry={10} fill="#fdf3c8" opacity={0.25} />
    <Tronco x={tronco.x} y={tronco.y + Math.sin(f * 0.08) * 6} w={tronco.w} />
  </g>
);
export const Tronco: React.FC<{ x: number; y: number; w: number }> = ({ x, y, w }) => (
  <g>
    <rect x={x - w / 2} y={y - 55} width={w} height={110} rx={55} fill="#6b4428" stroke="#2a1a0e" strokeWidth={7} />
    {Array.from({ length: 7 }, (_, i) => <path key={i} d={`M${x - w / 2 + 60 + i * (w - 120) / 6} ${y - 40} q30 40 0 80`} stroke="#4a2e1a" strokeWidth={5} fill="none" />)}
    <ellipse cx={x + w / 2 - 6} cy={y} rx={36} ry={55} fill="#a9774c" stroke="#2a1a0e" strokeWidth={7} />
    <ellipse cx={x + w / 2 - 6} cy={y} rx={20} ry={32} fill="none" stroke="#6b4428" strokeWidth={5} />
  </g>
);
/** o lago visto de cima: água, margens escuras dos lados, o tronco atravessando */
export const LagoCima: React.FC<{ f: number }> = ({ f }) => (
  <g>
    <rect width={1080} height={1920} fill="#0f2442" />
    {Array.from({ length: 18 }, (_, i) => {
      const y = 120 + i * 100, dx = Math.sin(f * 0.04 + i * 1.7) * 24;
      return <path key={i} d={`M${120 + ((i * 211) % 700) + dx} ${y} q40 -14 80 0 t80 0`} stroke="#2b5a8f" strokeWidth={5} fill="none" opacity={0.55} />;
    })}
    <path d="M0 0 L120 0 C150 300 90 600 140 900 C170 1200 100 1500 130 1920 L0 1920 Z" fill="#08121c" />
    <path d="M1080 0 L960 0 C930 300 990 600 940 900 C910 1200 980 1500 950 1920 L1080 1920 Z" fill="#08121c" />
    <rect x={90} y={790} width={900} height={120} rx={60} fill="#6b4428" stroke="#2a1a0e" strokeWidth={7} />
    {Array.from({ length: 9 }, (_, i) => <line key={i} x1={150 + i * 95} y1={805} x2={190 + i * 95} y2={895} stroke="#4a2e1a" strokeWidth={5} />)}
  </g>
);

// ---------- olhos ----------
/** um olho de desenho: abre = 0 fechado (uma curva) até 1 bem aberto */
export const Olho: React.FC<{ x: number; y: number; r: number; abre: number; olhar?: number }> = ({ x, y, r, abre, olhar = 0 }) => {
  if (abre < 0.08) return <path d={`M${x - r} ${y} Q${x} ${y + r * 0.55} ${x + r} ${y}`} stroke="#0a0d1a" strokeWidth={r * 0.22} fill="none" strokeLinecap="round" />;
  const ry = r * abre;
  return (
    <g>
      <ellipse cx={x} cy={y} rx={r} ry={ry} fill="#ffffff" stroke="#0a0d1a" strokeWidth={r * 0.14} />
      <clipPath id={`ol${Math.round(x)}${Math.round(y)}`}><ellipse cx={x} cy={y} rx={r} ry={ry} /></clipPath>
      <g clipPath={`url(#ol${Math.round(x)}${Math.round(y)})`}>
        <circle cx={x + olhar * r * 0.35} cy={y} r={r * 0.48} fill="#111" />
        <circle cx={x + olhar * r * 0.35 - r * 0.16} cy={y - r * 0.16} r={r * 0.15} fill="#fff" />
      </g>
    </g>
  );
};

// ---------- o pato ----------
/** de frente (cabeça grande): olhos = [esquerdo da tela, direito da tela], 0..1 */
export const PatoFrente: React.FC<{ x: number; y: number; s: number; olhos: [number, number]; raiox?: number }> = ({ x, y, s, olhos, raiox = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <g opacity={1 - 0.75 * raiox}>
      <ellipse cx={0} cy={420} rx={330} ry={260} fill={C.peito} />
      <ellipse cx={0} cy={250} rx={170} ry={40} fill={C.anel} />
      <circle cx={0} cy={0} r={260} fill={C.cabeca} />
      <ellipse cx={-80} cy={-120} rx={90} ry={50} fill="#4fb57d" opacity={0.6} />
    </g>
    {raiox > 0 && <circle cx={0} cy={0} r={260} fill="none" stroke="#8fd3ff" strokeWidth={8} opacity={raiox} />}
    <Olho x={-120} y={-30} r={62} abre={olhos[0]} />
    <Olho x={120} y={-30} r={62} abre={olhos[1]} />
    <g opacity={1 - 0.5 * raiox}>
      <path d="M-150 90 C-150 50 150 50 150 90 C150 170 60 200 0 200 C-60 200 -150 170 -150 90 Z" fill={C.bico} stroke={C.bico2} strokeWidth={8} />
      <path d="M-120 120 C-60 135 60 135 120 120" stroke={C.bico2} strokeWidth={7} fill="none" />
      <ellipse cx={-40} cy={95} rx={12} ry={7} fill={C.bico2} />
      <ellipse cx={40} cy={95} rx={12} ry={7} fill={C.bico2} />
    </g>
  </g>
);
/** de lado, sentado no tronco: virado = 0 olhando para a direita, 1 olhando para a esquerda */
export const PatoLado: React.FC<{ x: number; y: number; s: number; olho: number; virado?: number }> = ({ x, y, s, olho, virado = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M-150 -40 L-215 -95 L-200 -20 Z" fill={C.asa} />
    <ellipse cx={0} cy={0} rx={175} ry={95} fill={C.corpo} stroke="#3a4048" strokeWidth={6} />
    <path d="M-90 -40 C-20 -80 90 -60 120 0 C60 10 -20 10 -90 -40 Z" fill={C.asa} />
    <ellipse cx={110} cy={-10} rx={85} ry={80} fill={C.peito} />
    <g transform={`translate(120 -120) scale(${virado > 0.5 ? -1 : 1} 1)`}>
      <rect x={-34} y={-10} width={68} height={70} fill={C.cabeca} />
      <ellipse cx={0} cy={56} rx={40} ry={12} fill={C.anel} />
      <circle cx={0} cy={-40} r={78} fill={C.cabeca} stroke="#14522f" strokeWidth={5} />
      <path d="M60 -40 C110 -50 150 -40 160 -24 C150 -12 110 -10 62 -16 Z" fill={C.bico} stroke={C.bico2} strokeWidth={5} />
      <Olho x={22} y={-58} r={20} abre={olho} olhar={0.6} />
    </g>
  </g>
);
/** visto de cima, sentado no tronco olhando para cima: olhos = [o da esquerda, o da direita] */
export const PatoCima: React.FC<{ x: number; y: number; s?: number; olhos: [number, number]; zzz?: number; f?: number; ergue?: number }> = ({ x, y, s = 1, olhos, zzz = 0, f = 0, ergue = 0 }) => (
  <g transform={`translate(${x} ${y - ergue * 60}) scale(${s * (1 + 0.15 * ergue)})`}>
    {ergue > 0 && <ellipse cx={0} cy={40 + ergue * 60} rx={80} ry={30} fill="#000" opacity={0.3} />}
    <path d="M-30 80 L0 120 L30 80 Z" fill={C.asa} />
    <ellipse cx={0} cy={20} rx={70} ry={92} fill={C.corpo} stroke="#3a4048" strokeWidth={6} />
    <ellipse cx={0} cy={20} rx={50} ry={70} fill={C.asa} />
    <ellipse cx={0} cy={-62} rx={46} ry={20} fill={C.anel} />
    <circle cx={0} cy={-90} r={46} fill={C.cabeca} stroke="#14522f" strokeWidth={5} />
    <ellipse cx={0} cy={-150} rx={22} ry={30} fill={C.bico} stroke={C.bico2} strokeWidth={4} />
    <Olho x={-44} y={-92} r={15} abre={olhos[0]} />
    <Olho x={44} y={-92} r={15} abre={olhos[1]} />
    {zzz > 0 && [0, 1, 2].map((k) => {
      const t = ((f / 30 + k * 0.6) % 1.8) / 1.8;
      return <text key={k} x={30 + t * 60} y={-150 - t * 120} fontFamily={FONTE} fontWeight={900} fontSize={34 + k * 10} fill="#cfe3ff" opacity={zzz * (1 - t)}>z</text>;
    })}
  </g>
);

// ---------- o que se vê do cérebro ----------
/** uma onda de atividade: rápida e pequena (acordada) ou lenta e grande (dormindo) */
export const OndaEEG: React.FC<{ x: number; y: number; w: number; h: number; f: number; acordada: boolean; cor: string; op?: number }> = ({ x, y, w, h, f, acordada, cor, op = 1 }) => {
  const pts: string[] = [];
  for (let i = 0; i <= 120; i++) {
    const u = i / 120, t = f / 30 + u * 2;
    const v = acordada ? 0.35 * Math.sin(t * 40) + 0.25 * Math.sin(t * 63 + 1) + 0.15 * Math.sin(t * 97) : Math.sin(t * 5) * 0.9 + 0.1 * Math.sin(t * 13);
    pts.push(`${(x + u * w).toFixed(1)} ${(y - v * h / 2).toFixed(1)}`);
  }
  return <polyline points={pts.join(" ")} fill="none" stroke={cor} strokeWidth={6} strokeLinejoin="round" opacity={op} />;
};
/** o cérebro em duas metades (visto de frente ou de cima): luz = brilho de cada metade (0..1) */
export const Cerebro: React.FC<{ x: number; y: number; s: number; luz: [number, number]; f: number; ondas?: boolean }> = ({ x, y, s, luz, f, ondas = true }) => {
  const metade = (lado: number, l: number) => {
    const cor = l > 0.5 ? "#ffd23f" : "#2f5fbf";
    return (
      <g>
        <path d={`M${lado * 8} -150 C${lado * 140} -170 ${lado * 230} -90 ${lado * 225} 10 C${lado * 220} 110 ${lado * 130} 160 ${lado * 8} 150 Z`} fill={cor} opacity={0.25 + 0.75 * Math.max(l, 1 - l)} stroke={l > 0.5 ? "#fff2a8" : "#8fb8ff"} strokeWidth={6} />
        {ondas && <OndaEEG x={lado > 0 ? 40 : -200} y={0} w={160} h={l > 0.5 ? 50 : 120} f={f} acordada={l > 0.5} cor={l > 0.5 ? "#5a3d00" : "#cfe0ff"} />}
      </g>
    );
  };
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {luz[0] > 0.5 && <ellipse cx={-120} cy={0} rx={200} ry={190} fill={AMARELO} opacity={0.18 * luz[0]} />}
      {luz[1] > 0.5 && <ellipse cx={120} cy={0} rx={200} ry={190} fill={AMARELO} opacity={0.18 * luz[1]} />}
      {metade(-1, luz[0])}
      {metade(1, luz[1])}
    </g>
  );
};

// ---------- a mão, a raposa, o cronômetro ----------
export const Mao: React.FC<{ x: number; y: number; s?: number; fecha: number }> = ({ x, y, s = 1, fecha }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-70} y={-420} width={140} height={160} rx={30} fill="#e9eef7" stroke="#0a0d1a" strokeWidth={8} />
    <path d="M-110 -270 C-120 -180 -100 -80 -60 -40 L60 -40 C100 -80 120 -180 110 -270 Z" fill="#ffffff" stroke="#0a0d1a" strokeWidth={8} />
    {[-70, -25, 20, 65].map((dx, i) => (
      <rect key={i} x={dx - 18} y={-60} width={36} height={120 - 50 * fecha} rx={18} fill="#ffffff" stroke="#0a0d1a" strokeWidth={8} />
    ))}
    <rect x={-150 + 30 * fecha} y={-170} width={40} height={110} rx={20} fill="#ffffff" stroke="#0a0d1a" strokeWidth={8} transform={`rotate(${-30 + 20 * fecha} -130 -170)`} />
  </g>
);
export const Raposa: React.FC<{ x: number; y: number; s: number }> = ({ x, y, s }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} fill="#03060c">
    <path d="M-120 0 C-110 -60 -40 -80 20 -70 L60 -110 L70 -60 C90 -70 110 -90 130 -120 L135 -60 C150 -40 160 -20 150 0 C110 10 60 0 20 0 Z" />
    <path d="M-120 -10 C-200 -40 -260 -10 -250 40 C-220 20 -170 20 -120 20 Z" />
    <rect x={-90} y={-5} width={18} height={80} />
    <rect x={-40} y={-5} width={18} height={80} />
    <rect x={40} y={-5} width={18} height={80} />
    <rect x={90} y={-5} width={18} height={80} />
    <circle cx={115} cy={-55} r={6} fill="#ffd23f" />
  </g>
);
export const Cronometro: React.FC<{ x: number; y: number; k: number; texto: string }> = ({ x, y, k, texto }) => (
  <g transform={`translate(${x} ${y}) scale(${0.7 + 0.3 * saida(k)})`} opacity={Math.min(1, k * 2)}>
    <rect x={-22} y={-170} width={44} height={40} rx={10} fill="#e9eef7" stroke="#0a0d1a" strokeWidth={6} />
    <circle cx={0} cy={0} r={130} fill="#ffffff" stroke="#0a0d1a" strokeWidth={10} />
    <line x1={0} y1={0} x2={70} y2={-80} stroke="#e23b3b" strokeWidth={12} strokeLinecap="round" />
    <circle cx={0} cy={0} r={14} fill="#0a0d1a" />
    <Texto x={0} y={230} t={texto} tam={90} cor={AMARELO} />
  </g>
);

// ---------- a pessoa no quarto ----------
export const Quarto: React.FC<{ f: number }> = ({ f }) => (
  <g>
    <defs>
      <linearGradient id="pt-quarto" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3a2160" /><stop offset="1" stopColor="#1c1033" /></linearGradient>
    </defs>
    <rect width={1080} height={1920} fill="url(#pt-quarto)" />
    <rect x={620} y={260} width={330} height={420} rx={14} fill="#0b1328" stroke="#5a3d8a" strokeWidth={14} />
    {Array.from({ length: 10 }, (_, i) => <rect key={i} x={650 + (i * 67) % 280} y={420 + (i * 41) % 220} width={18} height={30} fill="#ffd27a" opacity={0.4 + 0.4 * ((i + Math.floor(f / 40)) % 2)} />)}
    <rect x={0} y={1380} width={1080} height={540} fill="#22143d" />
    {/* mala no canto */}
    <rect x={800} y={1170} width={210} height={250} rx={24} fill="#c9503a" stroke="#1a0f12" strokeWidth={8} />
    <rect x={865} y={1130} width={80} height={50} rx={14} fill="none" stroke="#1a0f12" strokeWidth={12} />
    <rect x={830} y={1250} width={150} height={12} fill="#8f3524" />
    <rect x={970} y={1200} width={40} height={60} rx={6} fill="#f3e6c4" transform="rotate(12 990 1230)" />
  </g>
);
/** a cama vista de lado, com a pessoa deitada; olhos 0..1 */
export const Cama: React.FC<{ olhos: number; f: number }> = ({ olhos, f }) => {
  const resp = Math.sin(f * 0.1) * 4;
  return (
    <g>
      <rect x={60} y={980} width={60} height={440} rx={16} fill="#6b4a8f" />
      <rect x={80} y={1180} width={760} height={150} rx={30} fill="#f2efe9" stroke="#1c1033" strokeWidth={8} />
      <rect x={100} y={1330} width={30} height={90} fill="#4b3366" />
      <rect x={790} y={1330} width={30} height={90} fill="#4b3366" />
      {/* travesseiro e cabeça */}
      <ellipse cx={230} cy={1150} rx={140} ry={58} fill="#ffffff" stroke="#1c1033" strokeWidth={7} />
      <circle cx={250} cy={1090} r={78} fill="#e7b48e" stroke="#1c1033" strokeWidth={6} />
      <path d="M180 1050 C200 990 300 990 325 1050 C300 1030 220 1030 180 1050 Z" fill="#3a2a22" />
      <Olho x={275} y={1085} r={16} abre={olhos} olhar={0.5} />
      {/* o corpo debaixo do cobertor */}
      <path d={`M300 ${1140 + resp} C420 ${1060 + resp} 640 ${1070 + resp} 790 ${1130} L800 1190 L300 1190 Z`} fill="#7ec3c9" stroke="#1c1033" strokeWidth={8} />
    </g>
  );
};
/** o rosto de frente, no travesseiro, inclinado (para o último plano ficar no enquadramento do primeiro) */
export const RostoDeitado: React.FC<{ x: number; y: number; s: number; olhos: [number, number] }> = ({ x, y, s, olhos }) => (
  <g transform={`translate(${x} ${y}) rotate(-18) scale(${s})`}>
    <ellipse cx={0} cy={330} rx={420} ry={150} fill="#f6f3ee" stroke="#1c1033" strokeWidth={8} />
    <ellipse cx={0} cy={10} rx={230} ry={270} fill="#e7b48e" stroke="#1c1033" strokeWidth={8} />
    <path d="M-235 -20 C-240 -230 230 -250 238 -20 C190 -150 -190 -150 -235 -20 Z" fill="#3a2a22" />
    <Olho x={-95} y={0} r={58} abre={olhos[0]} />
    <Olho x={95} y={0} r={58} abre={olhos[1]} />
    <path d="M-20 60 C-10 110 10 110 20 60" stroke="#b9805e" strokeWidth={8} fill="none" />
    <path d="M-60 160 C-20 180 20 180 60 160" stroke="#a0524a" strokeWidth={10} fill="none" strokeLinecap="round" />
  </g>
);
