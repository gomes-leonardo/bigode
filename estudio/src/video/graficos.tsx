// Gráficos por cima da cena (espaço da tela): onomatopeias, textos que pulam, contadores, ícones, painéis e legenda.
// Mesmo traço do estúdio: contorno preto grosso, sombra de papel, cores chapadas.
import React, { useId } from "react";
import { CONTORNO, INTERNA, LINHA, PAPEL } from "../estilo";
import { FONTE } from "../fontes";

const lim = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const voltaMola = (x: number) => {
  const c1 = 1.6, c3 = c1 + 1;
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
};
/** escala de entrada (0 -> passa um pouco -> 1) e de saída (1 -> 0) */
export const escalaPop = (f: number, de: number, ate = Infinity, dur = 8) => {
  if (f < de || f >= ate) return 0;
  const e = voltaMola(lim((f - de) / dur));
  const s = ate - f < 6 ? lim((ate - f) / 6) : 1;
  return Math.max(0, e * s);
};

const Pop: React.FC<{ x: number; y: number; f: number; de: number; ate?: number; rot?: number; children: React.ReactNode }> = ({ x, y, f, de, ate = Infinity, rot = 0, children }) => {
  const k = escalaPop(f, de, ate);
  if (k <= 0) return null;
  return <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${k.toFixed(4)})`}>{children}</g>;
};

/** texto grande com contorno preto e sombra de papel */
export const Texto: React.FC<{ texto: string; tam?: number; cor?: string; peso?: number; ancora?: "start" | "middle" | "end"; x?: number; y?: number; contorno?: number }> = ({ texto, tam = 72, cor = "#FFFFFF", peso = 900, ancora = "middle", x = 0, y = 0, contorno }) => {
  const sw = contorno ?? Math.max(6, tam * 0.16);
  const base = { x, y, textAnchor: ancora, fontFamily: FONTE, fontWeight: peso, fontSize: tam } as const;
  return (
    <g>
      <text {...base} x={x + 5} y={y + 6} fill={PAPEL} stroke={PAPEL} strokeWidth={sw} strokeLinejoin="round" paintOrder="stroke">{texto}</text>
      <text {...base} fill={cor} stroke={LINHA} strokeWidth={sw} strokeLinejoin="round" paintOrder="stroke">{texto}</text>
    </g>
  );
};

export const TextoPop: React.FC<{ x: number; y: number; f: number; de: number; ate?: number; texto: string; tam?: number; cor?: string; rot?: number }> = ({ x, y, f, de, ate, texto, tam, cor, rot }) => (
  <Pop x={x} y={y} f={f} de={de} ate={ate} rot={rot}>
    <Texto texto={texto} tam={tam} cor={cor} />
  </Pop>
);

/** estrela de onomatopeia (BIP!, PLOFT!) */
export const Estrela: React.FC<{ x: number; y: number; f: number; de: number; ate?: number; texto: string; cor?: string; r?: number; rot?: number }> = ({ x, y, f, de, ate, texto, cor = "#F2D16B", r = 110, rot = -8 }) => {
  const pts = Array.from({ length: 24 }, (_, i) => {
    const a = (i / 24) * Math.PI * 2;
    const rr = i % 2 ? r * 0.72 : r;
    return `${(Math.cos(a) * rr).toFixed(1)},${(Math.sin(a) * rr * 0.75).toFixed(1)}`;
  }).join(" ");
  return (
    <Pop x={x} y={y} f={f} de={de} ate={ate} rot={rot}>
      <polygon points={pts} fill={PAPEL} transform="translate(6 7)" />
      <polygon points={pts} fill={cor} stroke={LINHA} strokeWidth={CONTORNO} strokeLinejoin="round" />
      <Texto texto={texto} tam={r * 0.5} y={r * 0.17} />
    </Pop>
  );
};

/** selo "APROVADO" com visto */
export const Aprovado: React.FC<{ x: number; y: number; f: number; de: number; ate?: number; texto?: string; cor?: string; rot?: number }> = ({ x, y, f, de, ate, texto = "APROVADO", cor = "#4FAE63", rot = -6 }) => (
  <Pop x={x} y={y} f={f} de={de} ate={ate} rot={rot}>
    <rect x={-210 + 6} y={-52 + 7} width={420} height={104} rx={20} fill={PAPEL} />
    <rect x={-210} y={-52} width={420} height={104} rx={20} fill={cor} stroke={LINHA} strokeWidth={CONTORNO} />
    <path d="M -170 2 l 22 22 l 40 -46" stroke="#FFFFFF" strokeWidth={14} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <Texto texto={texto} tam={58} x={34} y={20} />
  </Pop>
);

/** número contando de 0 até `valor` entre `de` e `ate` */
export const Contador: React.FC<{ x: number; y: number; f: number; de: number; ate: number; valor: number; fim?: number; prefixo?: string; sufixo?: string; tam?: number; cor?: string; rot?: number }> = ({ x, y, f, de, ate, valor, fim = Infinity, prefixo = "", sufixo = "", tam = 120, cor = "#FFFFFF", rot = -4 }) => {
  const k = lim((f - de) / Math.max(1, ate - de));
  const n = Math.round(valor * (1 - Math.pow(1 - k, 3)));
  return (
    <Pop x={x} y={y} f={f} de={de} ate={fim} rot={rot}>
      <Texto texto={`${prefixo}${n.toLocaleString("pt-BR")}${sufixo}`} tam={tam} cor={cor} />
    </Pop>
  );
};

/** símbolo de infinito (oito deitado) */
export const Infinito: React.FC<{ x: number; y: number; f: number; de: number; ate?: number; s?: number; cor?: string }> = ({ x, y, f, de, ate, s = 1, cor = "#F2D16B" }) => {
  const d = "M 0 0 C -40 -60 -120 -60 -120 0 C -120 60 -40 60 0 0 C 40 -60 120 -60 120 0 C 120 60 40 60 0 0 Z";
  const k = lim((f - de) / 18); // o traço se desenha
  return (
    <Pop x={x} y={y} f={f} de={de} ate={ate}>
      <g transform={`scale(${s})`}>
        <path d={d} transform="translate(6 7)" fill="none" stroke={PAPEL} strokeWidth={40} strokeLinecap="round" pathLength={1} strokeDasharray={`${k} 1`} />
        <path d={d} fill="none" stroke={LINHA} strokeWidth={42} strokeLinecap="round" pathLength={1} strokeDasharray={`${k} 1`} />
        <path d={d} fill="none" stroke={cor} strokeWidth={24} strokeLinecap="round" pathLength={1} strokeDasharray={`${k} 1`} />
      </g>
    </Pop>
  );
};

/** selo redondo com ícone e rótulo embaixo */
export const Selo: React.FC<{ x: number; y: number; f: number; de: number; ate?: number; r?: number; cor?: string; rotulo?: string; children?: React.ReactNode }> = ({ x, y, f, de, ate, r = 90, cor = "#FFFFFF", rotulo, children }) => (
  <Pop x={x} y={y} f={f} de={de} ate={ate}>
    <circle cx={6} cy={7} r={r} fill={PAPEL} />
    <circle cx={0} cy={0} r={r} fill={cor} stroke={LINHA} strokeWidth={CONTORNO} />
    {children}
    {rotulo && <Texto texto={rotulo} tam={34} y={r + 52} />}
  </Pop>
);

/** painel (quadro de quadrinho) que entra pulando; o conteúdo usa coordenadas do painel (0..w, 0..h) */
export const Painel: React.FC<{ x: number; y: number; w: number; h: number; f: number; de: number; ate?: number; rot?: number; fundo?: string; children: React.ReactNode }> = ({ x, y, w, h, f, de, ate, rot = 0, fundo = "#F4F1EA", children }) => {
  const id = useId().replace(/:/g, "");
  return (
    <Pop x={x + w / 2} y={y + h / 2} f={f} de={de} ate={ate} rot={rot}>
      <g transform={`translate(${-w / 2} ${-h / 2})`}>
        <rect x={8} y={9} width={w} height={h} rx={14} fill={PAPEL} />
        <defs><clipPath id={`painel-${id}`}><rect x={0} y={0} width={w} height={h} rx={14} /></clipPath></defs>
        <rect x={0} y={0} width={w} height={h} rx={14} fill={fundo} />
        <g clipPath={`url(#painel-${id})`}>{children}</g>
        <rect x={0} y={0} width={w} height={h} rx={14} fill="none" stroke={LINHA} strokeWidth={CONTORNO + 2} />
      </g>
    </Pop>
  );
};

// ------------------------------------------------------------------ ícones (desenhados em volta de 0,0; ~120 px)
export const IconeCasa: React.FC<{ cor?: string }> = ({ cor = "#E0826E" }) => (
  <g>
    <path d="M -50 -6 L 0 -50 L 50 -6 Z" fill={cor} stroke={LINHA} strokeWidth={INTERNA + 1} strokeLinejoin="round" />
    <rect x={-38} y={-8} width={76} height={56} fill="#F4F1EA" stroke={LINHA} strokeWidth={INTERNA + 1} />
    <rect x={-10} y={14} width={20} height={34} fill="#8A5E3F" stroke={LINHA} strokeWidth={3} />
  </g>
);
export const IconePrato: React.FC = () => (
  <g>
    <ellipse cx={0} cy={10} rx={54} ry={20} fill="#FFFFFF" stroke={LINHA} strokeWidth={INTERNA + 1} />
    <ellipse cx={-12} cy={2} rx={20} ry={12} fill="#E3A23B" stroke={LINHA} strokeWidth={3} />
    <circle cx={16} cy={2} r={10} fill="#7AA35B" stroke={LINHA} strokeWidth={3} />
    <path d="M -60 -40 l 0 40 M 64 -40 l 0 40" stroke={LINHA} strokeWidth={7} strokeLinecap="round" />
  </g>
);
export const IconeEnvelope: React.FC = () => (
  <g>
    <rect x={-50} y={-34} width={100} height={68} rx={6} fill="#FFFFFF" stroke={LINHA} strokeWidth={INTERNA + 1} />
    <path d="M -48 -32 L 0 8 L 48 -32" stroke={LINHA} strokeWidth={INTERNA + 1} fill="none" strokeLinejoin="round" />
    <circle cx={34} cy={18} r={12} fill="#C0504D" stroke={LINHA} strokeWidth={3} />
  </g>
);
export const IconeCarro: React.FC<{ cor?: string }> = ({ cor = "#5AA5B8" }) => (
  <g>
    <path d="M -58 18 L -58 -2 Q -56 -14 -40 -16 L -24 -38 L 26 -38 L 42 -16 Q 58 -14 58 0 L 58 18 Z" fill={cor} stroke={LINHA} strokeWidth={INTERNA + 1} strokeLinejoin="round" />
    <path d="M -18 -32 L 20 -32 L 32 -16 L -30 -16 Z" fill="#CFE6F0" stroke={LINHA} strokeWidth={3} />
    {[-32, 32].map((x) => <circle key={x} cx={x} cy={20} r={13} fill="#2A2A35" stroke={LINHA} strokeWidth={3} />)}
  </g>
);
export const IconeGuardaSol: React.FC = () => (
  <g>
    <path d="M 0 -40 L 6 44" stroke={LINHA} strokeWidth={6} strokeLinecap="round" />
    <path d="M -56 -14 Q 0 -78 56 -14 Q 38 -22 28 -12 Q 14 -24 0 -14 Q -14 -24 -28 -12 Q -38 -22 -56 -14 Z" fill="#E37BA1" stroke={LINHA} strokeWidth={INTERNA + 1} strokeLinejoin="round" />
    <path d="M -50 44 Q 0 30 50 44 Z" fill="#F2D16B" stroke={LINHA} strokeWidth={3} />
  </g>
);

// ------------------------------------------------------------------ legenda (texto exato da fala)
const quebra = (t: string, max = 46) => {
  const linhas: string[] = [];
  let atual = "";
  for (const p of t.split(" ")) {
    if ((atual + " " + p).trim().length > max && atual) { linhas.push(atual); atual = p; }
    else atual = (atual + " " + p).trim();
  }
  if (atual) linhas.push(atual);
  return linhas;
};
export const Legenda: React.FC<{ texto?: string; citacao?: boolean }> = ({ texto, citacao }) => {
  if (!texto) return null;
  const longa = texto.length > 110;
  const tam = longa ? 36 : 44, passo = longa ? 44 : 52;
  const linhas = quebra(texto, longa ? 64 : 48);
  const y0 = 1040 - (linhas.length - 1) * passo;
  return (
    <g>
      {linhas.map((l, i) => (
        <text key={i} x={960} y={y0 + i * passo} textAnchor="middle" fontFamily={FONTE} fontWeight={800} fontSize={tam} fill={citacao ? "#F2D16B" : "#FFFFFF"} stroke={LINHA} strokeWidth={tam * 0.24} strokeLinejoin="round" paintOrder="stroke">{l}</text>
      ))}
    </g>
  );
};
