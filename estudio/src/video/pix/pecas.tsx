// Peças em SVG do Short "o país que para sem Pix" (motion graphics, nada de marca ou tela real de aplicativo): o
// celular com a barrinha de sinal, os ícones genéricos, a nota de 50 estilizada (sem a arte da cédula), um QR
// genérico que vira poeira, o contador de caixa, a barra de dinheiro em movimento, a padaria, o mapa do Brasil.
import React from "react";
import { FONTE } from "../../fontes";
import dados from "./dados.json";

export const E = dados as { morre: number; notif: number[]; x1: number[]; qr: number; tic0: number; corte: number; x2: number[]; beep: number; silencio: number[] };
export const AMARELO = "#ffd23f", VERDE = "#33d17a", VERMELHO = "#ff3b3b";
export const suave = (x: number) => { const k = Math.min(1, Math.max(0, x)); return k * k * (3 - 2 * k); };
export const saida = (x: number) => 1 - Math.pow(1 - Math.min(1, Math.max(0, x)), 3);

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
export const Gancho: React.FC<{ op?: number }> = ({ op = 1 }) => (
  <g opacity={op}>
    <Texto y={200} t="JÁ IMAGINOU SE VOCÊ" tam={70} />
    <Texto y={300} t="FICASSE SEM INTERNET" tam={70} cor={AMARELO} />
    <Texto y={405} t="POR 3 MESES?" tam={88} cor={AMARELO} />
  </g>
);
export const X: React.FC<{ x: number; y: number; s?: number; k: number }> = ({ x, y, s = 1, k }) =>
  k <= 0 ? null : (
    <g transform={`translate(${x} ${y}) scale(${s * (0.6 + 0.4 * saida(k))})`} opacity={Math.min(1, k * 2)}>
      <path d="M-70 -70 L70 70 M70 -70 L-70 70" stroke="#07090f" strokeWidth={44} strokeLinecap="round" />
      <path d="M-70 -70 L70 70 M70 -70 L-70 70" stroke={VERMELHO} strokeWidth={30} strokeLinecap="round" />
    </g>
  );

// ---------- fundos ----------
const GRAD: Record<string, [string, string]> = {
  rede: ["#3b3f9e", "#14163a"], dinheiro: ["#0f6b4f", "#06261d"], escuro: ["#2a2d38", "#0b0c10"], padaria: ["#f3c58b", "#b9773e"],
  praia: ["#8fd3ff", "#ffe9b0"], cozinha: ["#d9e4ec", "#9fb2c2"], mapa: ["#16324f", "#081321"],
};
export const Fundo: React.FC<{ tema: keyof typeof GRAD; cinza?: number }> = ({ tema, cinza = 0 }) => {
  const [a, b] = GRAD[tema];
  return (
    <g>
      <defs>
        <radialGradient id={`px-${tema}`} cx="0.5" cy="0.4" r="0.85"><stop offset="0" stopColor={a} /><stop offset="1" stopColor={b} /></radialGradient>
      </defs>
      <rect width={1080} height={1920} fill={`url(#px-${tema})`} />
      {cinza > 0 && <rect width={1080} height={1920} fill="#2b2d33" opacity={0.75 * cinza} />}
    </g>
  );
};

// ---------- o celular ----------
const APPS = ["#ff7a59", "#ffd23f", "#33d17a", "#38bdf8", "#a78bfa", "#f472b6", "#fb923c", "#22d3ee", "#facc15", "#4ade80", "#60a5fa", "#e879f9"];
export const Celular: React.FC<{
  x: number; y: number; s: number; sinal: number; cinza?: number; tela?: "apps" | "qr" | "preta" | "abre"; abre?: number; qrPoeira?: number; f?: number; virado?: boolean;
}> = ({ x, y, s, sinal, cinza = 0, tela = "apps", abre = -1, qrPoeira = 0, f = 0, virado = false }) => {
  const W = 420, H = 860;
  if (virado) return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x={-W / 2} y={-H / 2} width={W} height={H} rx={60} fill="#22252e" stroke="#07090f" strokeWidth={10} />
      <circle cx={-110} cy={-330} r={40} fill="#111" stroke="#3a3f4a" strokeWidth={8} />
      <circle cx={-110} cy={-230} r={40} fill="#111" stroke="#3a3f4a" strokeWidth={8} />
    </g>
  );
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x={-W / 2} y={-H / 2} width={W} height={H} rx={60} fill="#111318" stroke="#07090f" strokeWidth={10} />
      <rect x={-W / 2 + 22} y={-H / 2 + 22} width={W - 44} height={H - 44} rx={42} fill={tela === "preta" ? "#000" : "#f3f5f8"} />
      <defs><clipPath id={`tela${Math.round(x)}${Math.round(y)}`}><rect x={-W / 2 + 22} y={-H / 2 + 22} width={W - 44} height={H - 44} rx={42} /></clipPath></defs>
      <g clipPath={`url(#tela${Math.round(x)}${Math.round(y)})`}>
        {tela === "apps" && Array.from({ length: 16 }, (_, i) => {
          const c = i % 4, l = Math.floor(i / 4);
          return <rect key={i} x={-150 + c * 80} y={-260 + l * 100} width={60} height={60} rx={16} fill={APPS[i % APPS.length]} />;
        })}
        {tela === "abre" && abre >= 0 && <IconeApp tipo={(["msg", "mapa", "play"] as const)[abre]} x={0} y={-40} s={1.5} />}
        {tela === "qr" && <QR x={0} y={-30} lado={300} poeira={qrPoeira} f={f} />}
        {tela === "qr" && <text x={0} y={200} textAnchor="middle" fontFamily={FONTE} fontWeight={900} fontSize={44} fill="#20262f">PIX</text>}
        {cinza > 0 && tela !== "preta" && <rect x={-W / 2} y={-H / 2} width={W} height={H} fill="#9aa0a8" opacity={0.7 * cinza} style={{ mixBlendMode: "saturation" }} />}
        {cinza > 0 && tela !== "preta" && <rect x={-W / 2} y={-H / 2} width={W} height={H} fill="#5f646c" opacity={0.45 * cinza} />}
      </g>
      {/* barrinha de sinal */}
      {[0, 1, 2, 3].map((i) => (
        <rect key={i} x={110 + i * 20} y={-H / 2 + 62 - i * 9} width={14} height={14 + i * 9} rx={3} fill={i < sinal ? "#111" : "#c7ccd4"} />
      ))}
      {sinal <= 0 && <path d="M110 -368 L180 -398 M110 -398 L180 -368" stroke={VERMELHO} strokeWidth={8} strokeLinecap="round" />}
      <rect x={-50} y={-H / 2 + 36} width={100} height={22} rx={11} fill="#111318" />
    </g>
  );
};
export const IconeApp: React.FC<{ tipo: "msg" | "mapa" | "play"; x: number; y: number; s: number }> = ({ tipo, x, y, s }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-80} y={-80} width={160} height={160} rx={36} fill={tipo === "msg" ? "#33d17a" : tipo === "mapa" ? "#38bdf8" : "#8b5cf6"} />
    {tipo === "msg" && <path d="M-45 -30 L45 -30 C55 -30 60 -25 60 -15 L60 25 C60 35 55 40 45 40 L-10 40 L-35 60 L-30 40 L-45 40 C-55 40 -60 35 -60 25 L-60 -15 C-60 -25 -55 -30 -45 -30 Z" fill="#fff" />}
    {tipo === "mapa" && <path d="M0 -55 C30 -55 45 -30 45 -10 C45 20 0 60 0 60 C0 60 -45 20 -45 -10 C-45 -30 -30 -55 0 -55 Z M0 -25 A15 15 0 1 0 0.1 -25 Z" fill="#fff" fillRule="evenodd" />}
    {tipo === "play" && <path d="M-25 -40 L45 0 L-25 40 Z" fill="#fff" />}
  </g>
);
/** um QR genérico (padrão pseudoaleatório com os três quadrados de canto), que pode virar poeira */
export const QR: React.FC<{ x: number; y: number; lado: number; poeira?: number; f?: number; apagado?: number }> = ({ x, y, lado, poeira = 0, apagado = 0 }) => {
  const n = 25, m = lado / n;
  const canto = (i: number, j: number) => {
    for (const [ci, cj] of [[0, 0], [0, n - 7], [n - 7, 0]]) {
      const a = i - ci, b = j - cj;
      if (a >= 0 && a < 7 && b >= 0 && b < 7) return a === 0 || a === 6 || b === 0 || b === 6 || (a >= 2 && a <= 4 && b >= 2 && b <= 4) ? 1 : 0;
    }
    return -1;
  };
  const cel: React.ReactNode[] = [];
  for (let i = 0; i < n; i++)
    for (let j = 0; j < n; j++) {
      const c = canto(i, j);
      const on = c >= 0 ? c === 1 : ((i * 7919 + j * 104729 + i * j * 31) % 7) < 3;
      if (!on) continue;
      const h = ((i * 31 + j * 17) % 97) / 97;
      const k = Math.max(0, poeira * 1.6 - h * 0.6);
      const dx = (h - 0.5) * 900 * k, dy = -260 * k + 500 * k * k;
      cel.push(<rect key={`${i}-${j}`} x={x - lado / 2 + j * m + dx} y={y - lado / 2 + i * m + dy} width={m} height={m} fill="#14181f" opacity={Math.max(0, 1 - k * 1.2) * (1 - 0.7 * apagado)} />);
    }
  return <g>{cel}</g>;
};

// ---------- a nota, o contador, a barra ----------
export const Nota50: React.FC<{ x: number; y: number; s: number; r?: number }> = ({ x, y, s, r = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
    <rect x={-330} y={-160} width={660} height={320} rx={26} fill="#f0a24a" stroke="#6b3a12" strokeWidth={10} />
    <rect x={-300} y={-130} width={600} height={260} rx={18} fill="none" stroke="#c8752b" strokeWidth={6} />
    {Array.from({ length: 7 }, (_, i) => <circle key={i} cx={120} cy={0} r={30 + i * 16} fill="none" stroke="#d98a3a" strokeWidth={4} />)}
    <text x={-160} y={40} textAnchor="middle" fontFamily={FONTE} fontWeight={900} fontSize={150} fill="#7a3f10">50</text>
    <text x={-250} y={-80} fontFamily={FONTE} fontWeight={900} fontSize={46} fill="#7a3f10">R$</text>
    <text x={250} y={115} textAnchor="end" fontFamily={FONTE} fontWeight={900} fontSize={34} fill="#7a3f10">CINQUENTA REAIS</text>
  </g>
);
export const Contador: React.FC<{ x: number; y: number; texto: string; w?: number; tam?: number; cor?: string }> = ({ x, y, texto, w = 940, tam = 150, cor = "#7dff9a" }) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={-w / 2} y={-tam * 0.9} width={w} height={tam * 1.5} rx={30} fill="#0a1410" stroke="#2b4a3c" strokeWidth={8} />
    <text y={tam * 0.33} textAnchor="middle" fontFamily={FONTE} fontWeight={900} fontSize={tam} fill={cor} style={{ fontVariantNumeric: "tabular-nums" }}>{texto}</text>
  </g>
);
export const fmt = (n: number) => Math.round(n).toLocaleString("pt-BR");
export const Barra: React.FC<{ x: number; y: number; h: number; nivel: number; racha?: number; cai?: number }> = ({ x, y, h, nivel, racha = 0, cai = 0 }) => {
  const w = 200, topo = y - h * nivel;
  const pedacos = 6;
  return (
    <g>
      <rect x={x - w / 2 - 14} y={y - h - 14} width={w + 28} height={h + 28} rx={30} fill="none" stroke="#e8f5ee" strokeWidth={10} opacity={0.9} />
      {Array.from({ length: pedacos }, (_, i) => {
        const y0 = topo + ((y - topo) * i) / pedacos, hh = (y - topo) / pedacos;
        const q = cai * (1 + i * 0.25);
        return (
          <rect key={i} x={x - w / 2 + (i % 2 ? 1 : -1) * 40 * q} y={y0 + 900 * q * q} width={w} height={hh + 1} fill={VERDE} opacity={1 - Math.min(1, q)}
            transform={`rotate(${(i % 2 ? 1 : -1) * 25 * q} ${x} ${y0})`} />
        );
      })}
      {racha > 0 && cai < 0.2 && <path d={`M${x - 90} ${topo + 40} L${x - 30} ${topo + 120} L${x - 70} ${topo + 200} L${x + 10} ${topo + 300} L${x - 20} ${topo + 380} L${x + 60} ${topo + 470}`} stroke="#07090f" strokeWidth={10} fill="none" strokeDasharray={600} strokeDashoffset={600 * (1 - racha)} />}
    </g>
  );
};

// ---------- ícones da fila, padaria, mapa, praia, cozinha ----------
export const Maquininha: React.FC<{ x: number; y: number; s: number; erro?: number; ok?: boolean }> = ({ x, y, s, erro = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-110} y={-190} width={220} height={380} rx={34} fill="#2b2f39" stroke="#07090f" strokeWidth={8} />
    <rect x={-80} y={-160} width={160} height={110} rx={12} fill={erro > 0 ? "#3a0d0d" : "#bfe9d0"} />
    {erro > 0 && <text y={-92} textAnchor="middle" fontFamily={FONTE} fontWeight={900} fontSize={40} fill={VERMELHO}>ERRO</text>}
    {Array.from({ length: 9 }, (_, i) => <rect key={i} x={-70 + (i % 3) * 52} y={-20 + Math.floor(i / 3) * 52} width={36} height={36} rx={8} fill="#4a505d" />)}
    <rect x={-60} y={150} width={120} height={14} rx={7} fill="#111" />
  </g>
);
export const AppBanco: React.FC<{ x: number; y: number; s: number }> = ({ x, y, s }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-110} y={-200} width={220} height={400} rx={36} fill="#111318" stroke="#07090f" strokeWidth={8} />
    <rect x={-92} y={-180} width={184} height={360} rx={24} fill="#e9eef6" />
    <path d="M0 -90 L70 -50 L-70 -50 Z" fill="#3a5bd9" />
    {[-50, -17, 17, 50].map((dx) => <rect key={dx} x={dx - 9} y={-45} width={18} height={80} fill="#3a5bd9" />)}
    <rect x={-75} y={40} width={150} height={16} fill="#3a5bd9" />
  </g>
);
export const Moto: React.FC<{ x: number; y: number; s: number }> = ({ x, y, s }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} stroke="#07090f" strokeWidth={8}>
    <circle cx={-120} cy={90} r={60} fill="#2b2f39" />
    <circle cx={130} cy={90} r={60} fill="#2b2f39" />
    <path d="M-120 90 L-40 20 L80 20 L130 90" fill="none" />
    <path d="M-60 20 L-20 -40 L60 -40 L90 20 Z" fill="#e2463f" />
    <rect x={-170} y={-120} width={130} height={110} rx={12} fill="#f2b134" />
    <path d="M100 -60 L140 -100" fill="none" />
  </g>
);
export const Pao: React.FC<{ x: number; y: number; s: number }> = ({ x, y, s }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M-90 -60 L90 -60 L110 120 L-110 120 Z" fill="#d9b98a" stroke="#6b4a2a" strokeWidth={7} />
    <path d="M-60 -60 C-60 -120 60 -120 60 -60" fill="#c8903e" stroke="#6b4a2a" strokeWidth={7} />
  </g>
);
export const Rosto: React.FC<{
  x: number; y: number; s: number; olhar: number; pele?: string; cabelo?: string; roupa?: string; boca?: "sorriso" | "reta"; sobe?: number; touca?: boolean;
}> = ({ x, y, s, olhar, pele = "#e7b48e", cabelo = "#3a2a22", roupa = "#3c6fd6", boca = "sorriso", sobe = 0, touca = false }) => {
  const v = olhar * 16; // o rosto vira um pouco para o lado do olhar
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M-170 260 C-170 120 170 120 170 260 Z" fill={roupa} stroke="#07090f" strokeWidth={6} />
      <circle cx={0} cy={0} r={110} fill={pele} stroke="#07090f" strokeWidth={6} />
      <path d="M-110 -10 C-110 -130 110 -130 110 -10 C80 -70 -80 -70 -110 -10 Z" fill={cabelo} />
      {touca && <path d="M-88 -78 L-88 -150 C-140 -165 -125 -250 -60 -232 C-45 -290 45 -290 60 -232 C125 -250 140 -165 88 -150 L88 -78 Z" fill="#fbfbf7" stroke="#07090f" strokeWidth={6} />}
      {[-40, 40].map((ex) => (
        <g key={ex}>
          <path d={`M${ex + v - 20} ${-28 - 14 * sobe} L${ex + v + 20} ${-30 - 14 * sobe}`} stroke="#2a1d16" strokeWidth={7} strokeLinecap="round" />
          <circle cx={ex + v} cy={5} r={18} fill="#fff" stroke="#07090f" strokeWidth={4} />
          <circle cx={ex + v + olhar * 8} cy={5} r={9} fill="#111" />
        </g>
      ))}
      {boca === "sorriso"
        ? <path d={`M${v - 30} 60 C${v - 10} 70 ${v + 10} 70 ${v + 30} 60`} stroke="#8a4f3e" strokeWidth={6} fill="none" strokeLinecap="round" />
        : <path d={`M${v - 24} 66 L${v + 24} 66`} stroke="#8a4f3e" strokeWidth={6} fill="none" strokeLinecap="round" />}
    </g>
  );
};
/** as prateleiras da padaria, com pães redondos e bisnagas */
export const Prateleiras: React.FC = () => (
  <g>
    {[400, 640].map((y, l) => (
      <g key={y}>
        {Array.from({ length: 6 }, (_, i) => {
          const x = 130 + i * 164 + (l ? 60 : 0), bis = (i + l) % 2 === 0;
          return x > 1040 ? null : (
            <g key={i}>
              <ellipse cx={x} cy={y - (bis ? 20 : 36)} rx={bis ? 78 : 56} ry={bis ? 22 : 38} fill="#d4954a" stroke="#6b4a2a" strokeWidth={5} />
              {(bis ? [-40, -10, 20, 50] : [-18, 12]).map((d) => <path key={d} d={`M${x + d - 8} ${y - (bis ? 30 : 50)} L${x + d + 8} ${y - (bis ? 12 : 30)}`} stroke="#f2cf98" strokeWidth={5} strokeLinecap="round" />)}
            </g>
          );
        })}
        <rect x={40} y={y} width={1000} height={20} rx={6} fill="#7a4e26" />
      </g>
    ))}
  </g>
);
// o contorno do Brasil, simplificado (longitude/latitude aproximadas)
const BR: [number, number][] = [
  [-60, 5.2], [-52, 4], [-50, 1.8], [-48, -1], [-44, -2.5], [-41, -3], [-38.5, -3.7], [-35.2, -5.8], [-34.8, -7.2], [-35.5, -9.5], [-37, -11], [-38.5, -13],
  [-39, -17], [-40, -20], [-41.5, -22.5], [-43.2, -23], [-45, -23.8], [-48, -25.8], [-48.5, -28.5], [-50, -30.5], [-51.5, -32], [-53, -33.7], [-53.5, -32.5],
  [-55.5, -30.5], [-57.5, -30.2], [-55.8, -27.5], [-54.6, -25.6], [-54.3, -24], [-55.5, -22.5], [-57.8, -22], [-58, -20], [-58.2, -17.5], [-60.2, -16.2],
  [-60.5, -13.8], [-62.5, -13], [-65, -11.8], [-65.3, -10], [-68.5, -11], [-70.5, -11], [-73, -9.4], [-73.9, -7.3], [-72.8, -5], [-70, -4.2], [-69.5, -1.5],
  [-69.8, 1], [-67, 1.9], [-66.9, 1.2], [-64, 2], [-63.5, 3.8], [-62, 4.2],
];
export const MapaBR: React.FC<{ x: number; y: number; k: number; apaga: number; f: number }> = ({ x, y, k, apaga }) => {
  const pts = BR.map(([lo, la]) => `${(x + (lo + 54) * k).toFixed(1)} ${(y + (-14 - la) * k).toFixed(1)}`).join(" L");
  const manchas = [[-50, -10], [-43, -20], [-60, -5], [-47, -25], [-38, -8], [-55, -15], [-65, -9], [-52, -28], [-40, -14], [-58, -22]];
  return (
    <g>
      <defs><clipPath id="px-br"><path d={`M${pts} Z`} /></clipPath></defs>
      <path d={`M${pts} Z`} fill="#3fae6a" stroke="#d9f5e3" strokeWidth={6} />
      <g clipPath="url(#px-br)">
        {manchas.map(([lo, la], i) => {
          const q = Math.max(0, Math.min(1, apaga * 1.8 - i * 0.08));
          return <circle key={i} cx={x + (lo + 54) * k} cy={y + (-14 - la) * k} r={q * 9 * k} fill="#0b1220" opacity={0.92} />;
        })}
      </g>
    </g>
  );
};
export const Praia: React.FC<{ f: number }> = ({ f }) => (
  <g>
    <circle cx={880} cy={660} r={92} fill="#ffe07a" />
    <rect x={0} y={1000} width={1080} height={160} fill="#3aa0d8" />
    {[0, 1, 2].map((i) => <path key={i} d={`M${60 + i * 330 + 8 * Math.sin(f / 9 + i)} ${1060 + i * 25} q40 -16 80 0 t80 0`} stroke="#d8f1ff" strokeWidth={8} fill="none" strokeLinecap="round" />)}
    <rect x={0} y={1150} width={1080} height={770} fill="#f3dca2" />
    {/* guarda-sol listrado */}
    <path d="M840 1480 L820 920" stroke="#6b4a2a" strokeWidth={16} strokeLinecap="round" />
    {Array.from({ length: 6 }, (_, i) => {
      const a0 = Math.PI + (i * Math.PI) / 6, a1 = Math.PI + ((i + 1) * Math.PI) / 6, R = 240;
      return <path key={i} d={`M820 920 L${820 + R * Math.cos(a0)} ${920 + 0.42 * R * Math.sin(a0)} L${820 + R * Math.cos(a1)} ${920 + 0.42 * R * Math.sin(a1)} Z`} fill={i % 2 ? "#ffffff" : "#e2463f"} stroke="#07090f" strokeWidth={4} />;
    })}
    {/* cadeira de praia, de lado: assento e encosto de lona listrada, pés de madeira */}
    <g transform="translate(300 1330)">
      <path d="M-120 0 L-160 120 M160 0 L190 120 M-110 0 L-60 120" stroke="#7a5233" strokeWidth={16} strokeLinecap="round" />
      {Array.from({ length: 6 }, (_, i) => <rect key={i} x={-120 + i * 47} y={-22} width={47} height={28} fill={i % 2 ? "#ffffff" : "#e2463f"} stroke="#07090f" strokeWidth={3} />)}
      <g transform="translate(-120 -8) rotate(-112)">
        {Array.from({ length: 5 }, (_, i) => <rect key={i} x={i * 52} y={-14} width={52} height={28} fill={i % 2 ? "#e2463f" : "#ffffff"} stroke="#07090f" strokeWidth={3} />)}
        <path d="M0 18 L262 18" stroke="#7a5233" strokeWidth={12} strokeLinecap="round" />
      </g>
      <path d="M-120 10 L165 10" stroke="#7a5233" strokeWidth={12} strokeLinecap="round" />
    </g>
  </g>
);
/** a cozinha: azulejos atrás da mesa, uma caneca e uma fruteira */
export const Cozinha: React.FC = () => (
  <g>
    <rect x={0} y={800} width={1080} height={440} fill="#e9f0f5" />
    {Array.from({ length: 13 }, (_, i) => <path key={`v${i}`} d={`M${i * 90} 800 L${i * 90} 1240`} stroke="#c3d0da" strokeWidth={4} />)}
    {Array.from({ length: 5 }, (_, i) => <path key={`h${i}`} d={`M0 ${800 + i * 90} L1080 ${800 + i * 90}`} stroke="#c3d0da" strokeWidth={4} />)}
    <rect x={0} y={1236} width={1080} height={684} fill="#9a6a3e" />
    <rect x={0} y={1222} width={1080} height={34} fill="#b98250" />
    <g transform="translate(800 1150)">
      <rect x={-55} y={-70} width={110} height={142} rx={14} fill="#e2463f" stroke="#07090f" strokeWidth={6} />
      <path d="M55 -40 C105 -40 105 35 55 35" stroke="#07090f" strokeWidth={14} fill="none" />
      <path d="M55 -40 C100 -40 100 35 55 35" stroke="#e2463f" strokeWidth={6} fill="none" />
    </g>
    <g transform="translate(250 1180)">
      <circle cx={-45} cy={-40} r={42} fill="#ff9f1c" stroke="#07090f" strokeWidth={5} />
      <circle cx={30} cy={-46} r={40} fill="#e63946" stroke="#07090f" strokeWidth={5} />
      <circle cx={-5} cy={-70} r={36} fill="#8ac926" stroke="#07090f" strokeWidth={5} />
      <path d="M-120 -20 L120 -20 C110 40 60 60 0 60 C-60 60 -110 40 -120 -20 Z" fill="#f1e4c8" stroke="#07090f" strokeWidth={6} />
    </g>
  </g>
);
export const Calendario: React.FC<{ x: number; y: number; s: number; riscos: number; dias: number }> = ({ x, y, s, riscos, dias }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-200} y={-160} width={400} height={330} rx={18} fill="#ffffff" stroke="#07090f" strokeWidth={8} />
    <rect x={-200} y={-160} width={400} height={70} rx={18} fill="#e2463f" />
    <text y={-108} textAnchor="middle" fontFamily={FONTE} fontWeight={900} fontSize={40} fill="#fff">3 MESES</text>
    {[0, 1, 2].map((i) => (
      <g key={i}>
        <rect x={-170 + i * 120} y={-60} width={100} height={110} rx={10} fill="#eef1f6" />
        {riscos > i && <path d={`M${-165 + i * 120} -55 L${-75 + i * 120} 45 M${-75 + i * 120} -55 L${-165 + i * 120} 45`} stroke={VERMELHO} strokeWidth={10} strokeLinecap="round" />}
      </g>
    ))}
    <text y={130} textAnchor="middle" fontFamily={FONTE} fontWeight={900} fontSize={54} fill="#07090f">{dias} DIAS</text>
  </g>
);
