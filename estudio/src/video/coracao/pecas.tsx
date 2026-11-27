// Peças em SVG do Short "o coração que bate 20 vezes por segundo" (motion graphics, nada fotorrealista):
// o coração (inteiro e em corte), o beija-flor estilizado, o boneco, o cérebro, o eletrocardiograma, a bateria,
// o termômetro e o céu. As batidas vêm de dados.json, os mesmos instantes da trilha de batimento.
import React from "react";
import { FONTE } from "../../fontes";
import dados from "./dados.json";

export const B = dados as { bpm: number[]; batidas: number[]; humano: number[]; normal: number[]; rapido: number[]; falha: number[]; lento: number[] };
export const VERMELHO = "#e8314b", AMARELO = "#ffd23f";
export const suave = (x: number) => { const k = Math.min(1, Math.max(0, x)); return k * k * (3 - 2 * k); };
export const saida = (x: number) => 1 - Math.pow(1 - Math.min(1, Math.max(0, x)), 3);
export const bpmEm = (f: number) => B.bpm[Math.max(0, Math.min(B.bpm.length - 1, f))] ?? 1200;
/** quanto o coração está "batendo" agora: 1 logo depois de uma batida, caindo até a próxima */
export const pulso = (f: number, lista: number[]) => {
  let ult = -999;
  for (const b of lista) { if (b <= f) ult = b; else break; }
  return Math.exp(-Math.max(0, f - ult) / 3);
};

// ---------- textos ----------
export const Texto: React.FC<{ x?: number; y: number; t: string; tam?: number; cor?: string; op?: number }> = ({ x = 540, y, t, tam = 70, cor = "#fff", op = 1 }) => (
  <text x={x} y={y} textAnchor="middle" fontFamily={FONTE} fontWeight={900} fontSize={tam} fill={cor} opacity={op} stroke="#120a0c" strokeWidth={tam * 0.17} strokeLinejoin="round" paintOrder="stroke">{t}</text>
);
export const Etiqueta: React.FC<{ x: number; y: number; t: string; cor?: string; fundo?: string; tam?: number; k?: number }> = ({ x, y, t, cor = "#111", fundo = AMARELO, tam = 50, k = 1 }) => {
  if (k <= 0) return null;
  const w = t.length * tam * 0.64 + tam;
  return (
    <g transform={`translate(${x} ${y}) scale(${0.7 + 0.3 * saida(k)})`} opacity={Math.min(1, k * 2)}>
      <rect x={-w / 2} y={-tam * 0.85} width={w} height={tam * 1.5} rx={tam * 0.3} fill={fundo} stroke="#120a0c" strokeWidth={5} />
      <text y={tam * 0.28} textAnchor="middle" fontFamily={FONTE} fontWeight={900} fontSize={tam} fill={cor}>{t}</text>
    </g>
  );
};

// ---------- fundos ----------
export const FundoDia: React.FC = () => (
  <g>
    <defs>
      <radialGradient id="cd-dia" cx="0.5" cy="0.4" r="0.85"><stop offset="0" stopColor="#ffe9dc" /><stop offset="1" stopColor="#f6b9a4" /></radialGradient>
    </defs>
    <rect width={1080} height={1920} fill="url(#cd-dia)" />
  </g>
);
const mistura = (a: string, b: string, k: number) => {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16)), pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  return "#" + pa.map((v, i) => Math.round(v + (pb[i] - v) * k).toString(16).padStart(2, "0")).join("");
};
/** céu: 0 = dia, 1 = noite, 2 = amanhecer */
export const Ceu: React.FC<{ noite: number; aurora?: number }> = ({ noite, aurora = 0 }) => {
  const topo = mistura(mistura("#8fd3ff", "#0b1030", noite), "#3b3f8f", aurora);
  const baixo = mistura(mistura("#fff1d6", "#1c2350", noite), "#ffb27a", aurora);
  return (
    <g>
      <defs>
        <linearGradient id="cd-ceu" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={topo} /><stop offset="1" stopColor={baixo} /></linearGradient>
      </defs>
      <rect width={1080} height={1920} fill="url(#cd-ceu)" />
      <g opacity={noite * (1 - aurora)}>
        {Array.from({ length: 40 }, (_, i) => <circle key={i} cx={(i * 263) % 1080} cy={(i * 151) % 900} r={2 + (i % 3)} fill="#fff" opacity={0.5 + 0.5 * ((i * 7) % 3) / 2} />)}
        <circle cx={820} cy={300} r={80} fill="#fdf3c8" />
        <circle cx={850} cy={280} r={70} fill={topo} />
      </g>
      {aurora > 0 && <circle cx={540} cy={1500} r={260 + 140 * aurora} fill="#ffd27a" opacity={0.5 * aurora} />}
      <path d="M0 1450 C200 1380 380 1420 540 1390 C720 1360 880 1420 1080 1380 L1080 1920 L0 1920 Z" fill={mistura(mistura("#5f9d55", "#0f1a24", noite), "#3c5a3a", aurora)} />
    </g>
  );
};

// ---------- o coração ----------
const FORMA = "M0 -60 C-30 -130 -150 -125 -150 -30 C-150 60 -60 110 0 170 C60 110 150 60 150 -30 C150 -125 30 -130 0 -60 Z";
export const Coracao: React.FC<{ x: number; y: number; s: number; borrao?: number; pulsa?: number; cinza?: number }> = ({ x, y, s, borrao = 0, pulsa = 0, cinza = 0 }) => {
  const c1 = mistura("#ff5a6e", "#9a9aa2", cinza), c2 = mistura("#c4142f", "#5d5d66", cinza);
  const copia = (k: number, op: number, i: number) => (
    <g key={i} transform={`translate(${x} ${y}) scale(${s * k})`} opacity={op}>
      <path d={FORMA} fill="url(#cd-cor)" stroke="#5a0614" strokeWidth={8} />
      <path d="M-95 -60 C-100 -95 -70 -105 -55 -90" stroke="#ffffff" strokeOpacity={0.6} strokeWidth={14} fill="none" strokeLinecap="round" />
    </g>
  );
  return (
    <g>
      <defs>
        <radialGradient id="cd-cor" cx="0.35" cy="0.3" r="0.9"><stop offset="0" stopColor={c1} /><stop offset="1" stopColor={c2} /></radialGradient>
      </defs>
      {borrao > 0
        ? Array.from({ length: 7 }, (_, i) => copia(1 - 0.09 * borrao + (0.18 * borrao * i) / 6, i === 3 ? 0.55 : 0.22, i))
        : copia(1 + 0.13 * pulsa, 1, 0)}
      {borrao > 0 && Array.from({ length: 12 }, (_, i) => {
        const a = (i / 12) * Math.PI * 2, r0 = 175 * s, r1 = r0 + 40 * s * borrao;
        return <line key={`l${i}`} x1={x + Math.cos(a) * r0} y1={y + 10 * s + Math.sin(a) * r0} x2={x + Math.cos(a) * r1} y2={y + 10 * s + Math.sin(a) * r1} stroke="#c4142f" strokeWidth={8 * s} strokeLinecap="round" opacity={0.5} />;
      })}
    </g>
  );
};
export const Contador: React.FC<{ x: number; y: number; t: string; sub?: string; f: number; tam?: number }> = ({ x, y, t, sub, f, tam = 120 }) => {
  const p = 1 + 0.06 * Math.sin(f * 2.1);
  return (
    <g transform={`translate(${x} ${y}) scale(${p})`}>
      <Texto x={0} y={0} t={t} tam={tam} cor={AMARELO} />
      {sub && <Texto x={0} y={tam * 0.6} t={sub} tam={tam * 0.34} />}
    </g>
  );
};

// ---------- o beija-flor (estilizado) ----------
export const BeijaFlor: React.FC<{ x: number; y: number; s: number; f: number; pousado?: boolean; treme?: number; cinza?: number; coracao?: number }> = ({ x, y, s, f, pousado = false, treme = 0, cinza = 0, coracao = 0 }) => {
  const dx = treme ? Math.sin(f * 2.9) * 6 * treme : 0;
  const voo = pousado ? 0 : Math.sin(f * 0.21) * 10;
  const verde = mistura("#2fb37a", "#8c9196", cinza), verde2 = mistura("#14724c", "#55595e", cinza), garganta = mistura("#e8314b", "#77777d", cinza);
  return (
    <g transform={`translate(${x + dx} ${y + voo}) scale(${s})`}>
      {!pousado && Array.from({ length: 5 }, (_, i) => (
        <ellipse key={i} cx={10} cy={-60} rx={60} ry={150} transform={`rotate(${-70 + i * 30} 10 20)`} fill="#d9f3ff" opacity={0.16} />
      ))}
      {/* cauda */}
      <path d="M95 40 L200 95 L185 60 L215 50 L110 10 Z" fill={verde2} />
      {/* corpo */}
      <path d="M-70 -10 C-60 -70 40 -80 100 -20 C130 10 120 60 70 70 C10 85 -60 60 -70 -10 Z" fill={verde} stroke="#0b3a26" strokeWidth={6} />
      <path d="M-55 20 C-40 60 20 75 70 62 C40 40 -10 30 -55 20 Z" fill={mistura("#f3f1e6", "#c9c9cc", cinza)} />
      {/* garganta e cabeça */}
      <path d="M-70 -5 C-75 25 -55 40 -35 35 C-30 15 -40 0 -70 -5 Z" fill={garganta} />
      <circle cx={-72} cy={-38} r={42} fill={verde} stroke="#0b3a26" strokeWidth={6} />
      <circle cx={-84} cy={-46} r={9} fill="#0d0d10" />
      <circle cx={-87} cy={-49} r={3} fill="#ffffff" />
      {/* bico */}
      <path d="M-110 -36 L-250 -22 L-112 -26 Z" fill="#1e1e22" />
      {pousado ? (
        <>
          <path d="M-20 -30 C30 -45 90 -20 120 20 C70 15 20 5 -20 -30 Z" fill={verde2} />
          <path d="M-5 70 L-15 100 M25 70 L20 100" stroke="#3a2a1a" strokeWidth={6} strokeLinecap="round" />
        </>
      ) : null}
      {coracao > 0 && (
        <g transform="translate(-30 15) scale(0.16)" opacity={coracao}>
          <path d={FORMA} fill="#ff3b55" stroke="#5a0614" strokeWidth={14} />
        </g>
      )}
      {treme > 0 && Array.from({ length: 6 }, (_, i) => {
        const a = (i / 6) * Math.PI * 2 + f * 0.3;
        return <path key={i} d={`M${Math.cos(a) * 150} ${Math.sin(a) * 110} l${Math.cos(a) * 30} ${Math.sin(a) * 22}`} stroke="#ffffff" strokeWidth={7} strokeLinecap="round" opacity={0.7 * treme} />;
      })}
    </g>
  );
};

// ---------- o boneco ----------
export const Boneco: React.FC<{ x: number; y: number; s: number; queda?: number; alerta?: number; cinzaCerebro?: number; cerebro?: boolean }> = ({ x, y, s, queda = 0, alerta = 0, cerebro = false, cinzaCerebro = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${-82 * queda} 0 0) scale(${s})`}>
    {alerta > 0 && <circle cx={0} cy={-560} r={230} fill={VERMELHO} opacity={0.35 * alerta} />}
    <path d="M-60 0 L-50 -330 L-10 -330 L-10 0 Z M10 0 L10 -330 L50 -330 L60 0 Z" fill="#43597a" />
    <rect x={-120} y={-720} width={240} height={420} rx={90} fill="#5c7fae" />
    <path d="M-115 -660 C-200 -560 -210 -450 -190 -360" stroke="#5c7fae" strokeWidth={60} strokeLinecap="round" fill="none" />
    <path d="M115 -660 C200 -560 210 -450 190 -360" stroke="#5c7fae" strokeWidth={60} strokeLinecap="round" fill="none" />
    <circle cx={0} cy={-830} r={110} fill="#f0c7a6" />
    {cerebro && (
      <g transform="translate(0 -860)">
        <path d="M-80 10 C-95 -40 -60 -75 -20 -70 C0 -95 50 -90 62 -60 C100 -55 105 -5 80 15 C70 45 -70 45 -80 10 Z" fill={mistura("#ff9ab3", "#9b9ba3", cinzaCerebro)} stroke={mistura("#c75478", "#5d5d66", cinzaCerebro)} strokeWidth={6} />
        <path d="M-45 -40 C-30 -20 -50 0 -30 15 M10 -60 C0 -35 25 -20 10 5 M50 -35 C40 -15 60 0 45 20" stroke={mistura("#c75478", "#5d5d66", cinzaCerebro)} strokeWidth={6} fill="none" strokeLinecap="round" />
      </g>
    )}
  </g>
);

// ---------- o coração em corte (as câmaras enchendo) ----------
/** enche = quanto os ventrículos estão cheios (0..1); aperta = contração (0..1) */
export const CorteCoracao: React.FC<{ x: number; y: number; s: number; enche: number; aperta: number }> = ({ x, y, s, enche, aperta }) => {
  const k = 1 - 0.14 * aperta;
  const ventr = (lado: number) => `M${lado * 12} -40 C${lado * 120} -40 ${lado * 175} 20 ${lado * 160} 110 C${lado * 145} 190 ${lado * 70} 250 ${lado * 12} 290 Z`;
  const nivel = 290 - 330 * enche; // y da superfície do sangue
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <defs>
        <clipPath id="cc-ve"><path d={ventr(-1)} transform={`scale(${k})`} /><path d={ventr(1)} transform={`scale(${k})`} /></clipPath>
      </defs>
      {/* parede do coração */}
      <g transform={`scale(${1 - 0.06 * aperta})`}>
        <path d="M0 -210 C-80 -260 -250 -230 -260 -80 C-270 80 -120 250 0 360 C120 250 270 80 260 -80 C250 -230 80 -260 0 -210 Z" fill="#b51d36" stroke="#5a0614" strokeWidth={12} />
      </g>
      {/* átrios (em cima) */}
      {[-1, 1].map((l) => <ellipse key={l} cx={l * 95} cy={-130} rx={80} ry={62} fill="#3a0d16" stroke="#5a0614" strokeWidth={8} />)}
      {[-1, 1].map((l) => <ellipse key={`b${l}`} cx={l * 95} cy={-130 + 62 * (1 - Math.min(1, enche + 0.4)) } rx={78 * Math.min(1, enche + 0.4)} ry={56 * Math.min(1, enche + 0.4)} fill="#e12a45" opacity={0.85} />)}
      {/* ventrículos: o vazio escuro e o sangue subindo */}
      <g transform={`scale(${k})`}>
        <path d={ventr(-1)} fill="#2a0a10" stroke="#5a0614" strokeWidth={8} />
        <path d={ventr(1)} fill="#2a0a10" stroke="#5a0614" strokeWidth={8} />
      </g>
      <g clipPath="url(#cc-ve)">
        <rect x={-200} y={nivel} width={400} height={400} fill="#ff2d4a" />
        <path d={`M-200 ${nivel} Q-100 ${nivel - 12} 0 ${nivel} T200 ${nivel}`} fill="#ff6a7e" />
      </g>
      {/* válvulas */}
      {[-1, 1].map((l) => <line key={`v${l}`} x1={l * 40} y1={-60} x2={l * 150} y2={-60} stroke="#ffd7dd" strokeWidth={10} strokeLinecap="round" opacity={0.8} />)}
    </g>
  );
};
/** fase do ciclo para o corte: depois de cada batida o ventrículo esvazia (aperta) e depois enche devagar */
export const ciclo = (f: number, batidas: number[], encheEm = 20) => {
  let ult = -1, prox = 1e9;
  for (const b of batidas) { if (b <= f) ult = b; else { prox = b; break; } }
  if (ult < 0) return { enche: Math.min(1, (f - (batidas[0] ?? 0) + encheEm) / encheEm), aperta: 0 };
  const d = f - ult;
  const aperta = Math.exp(-d / 2.5);
  const enche = Math.min(1, Math.max(0, (d - 3) / encheEm));
  return { enche: prox - ult < 999 ? enche : enche, aperta };
};

// ---------- o eletrocardiograma ----------
const ecg = (d: number) => {
  // d em quadros desde a batida: P, QRS e T
  const g = (c: number, l: number, a: number) => a * Math.exp(-(((d - c) / l) ** 2));
  return g(-4, 1.2, 0.12) + g(-0.6, 0.35, -0.12) + g(0, 0.35, 1) + g(0.6, 0.35, -0.25) + g(6, 2, 0.25);
};
export const ECG: React.FC<{ f: number; batidas: number[]; x: number; y: number; w: number; h: number; janela?: number; cor: string; denso?: boolean }> = ({ f, batidas, x, y, w, h, janela = 60, cor, denso = false }) => {
  const pts: string[] = [];
  const n = 180;
  for (let i = 0; i <= n; i++) {
    const q = f - janela + (janela * i) / n;
    let v = 0;
    if (denso) v = Math.max(0, Math.sin(q * Math.PI * 2 * (20 / 30))) ** 6;
    else for (const b of batidas) if (Math.abs(q - b) < 12) v += ecg(q - b);
    pts.push(`${(x + (w * i) / n).toFixed(1)} ${(y - v * h).toFixed(1)}`);
  }
  return (
    <g>
      <rect x={x - 20} y={y - h - 40} width={w + 40} height={h + 100} rx={20} fill="#10141f" opacity={0.85} />
      <polyline points={pts.join(" ")} fill="none" stroke={cor} strokeWidth={7} strokeLinejoin="round" />
      <circle cx={x + w} cy={Number(pts[n].split(" ")[1])} r={10} fill={cor} />
    </g>
  );
};

// ---------- bateria, termômetro, galho ----------
export const Bateria: React.FC<{ x: number; y: number; nivel: number }> = ({ x, y, nivel }) => {
  const cor = nivel > 0.5 ? "#3bd16f" : nivel > 0.2 ? "#ffb020" : "#ff3b3b";
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x={-130} y={-240} width={260} height={470} rx={36} fill="#10141f" stroke="#ffffff" strokeWidth={14} />
      <rect x={-50} y={-280} width={100} height={44} rx={12} fill="#ffffff" />
      <rect x={-104} y={204 - 418 * nivel} width={208} height={418 * nivel} rx={20} fill={cor} />
      <text x={0} y={30} textAnchor="middle" fontFamily={FONTE} fontWeight={900} fontSize={70} fill="#ffffff" stroke="#10141f" strokeWidth={10} paintOrder="stroke">{Math.round(nivel * 100)}%</text>
    </g>
  );
};
export const Termometro: React.FC<{ x: number; y: number; nivel: number }> = ({ x, y, nivel }) => {
  const cor = mistura("#4aa8ff", "#ff4a4a", nivel);
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x={-34} y={-330} width={68} height={360} rx={34} fill="#f2f4f8" stroke="#10141f" strokeWidth={8} />
      <circle cx={0} cy={60} r={62} fill={cor} stroke="#10141f" strokeWidth={8} />
      <rect x={-16} y={20 - 320 * nivel} width={32} height={320 * nivel + 30} rx={16} fill={cor} />
      {Array.from({ length: 6 }, (_, i) => <line key={i} x1={34} y1={-290 + i * 56} x2={58} y2={-290 + i * 56} stroke="#10141f" strokeWidth={6} />)}
    </g>
  );
};
export const Galho: React.FC<{ y: number; escuro: number }> = ({ y, escuro }) => (
  <g>
    <path d={`M-40 ${y + 40} C200 ${y} 500 ${y + 20} 760 ${y - 10} C860 ${y - 20} 960 ${y - 60} 1120 ${y - 90}`} stroke={mistura("#7a5233", "#2a1e16", escuro)} strokeWidth={34} fill="none" strokeLinecap="round" />
    {[[300, -60], [640, -70], [900, -110]].map(([lx, ly], i) => (
      <path key={i} d={`M${lx} ${y + 10} C${lx + 30} ${y + ly} ${lx + 110} ${y + ly - 20} ${lx + 150} ${y + ly + 10} C${lx + 100} ${y + ly + 30} ${lx + 40} ${y + 10} ${lx} ${y + 10} Z`} fill={mistura("#4e9a4a", "#14241c", escuro)} />
    ))}
  </g>
);
export { mistura };
