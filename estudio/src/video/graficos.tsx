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

// ------------------------------------------------------------------ mais ícones (capítulos 2 em diante)
const SW = INTERNA + 1;
export const IconeBanco: React.FC<{ cor?: string }> = ({ cor = "#E9E4DA" }) => (
  <g>
    <path d="M -56 -20 L 0 -54 L 56 -20 Z" fill={cor} stroke={LINHA} strokeWidth={SW} strokeLinejoin="round" />
    {[-36, -12, 12, 36].map((x) => <rect key={x} x={x - 6} y={-16} width={12} height={44} fill={cor} stroke={LINHA} strokeWidth={3} />)}
    <rect x={-58} y={28} width={116} height={14} fill={cor} stroke={LINHA} strokeWidth={SW} />
  </g>
);
export const IconePao: React.FC<{ s?: number }> = ({ s = 1 }) => (
  <g transform={`scale(${s})`}>
    <ellipse cx={0} cy={0} rx={44} ry={20} fill="#D99A4E" stroke={LINHA} strokeWidth={SW} />
    <path d="M -26 -6 q 10 -10 20 0 M -2 -8 q 10 -10 20 0 M 20 -6 q 8 -8 14 0" stroke="#F2D9A6" strokeWidth={5} fill="none" strokeLinecap="round" />
  </g>
);
/** celular grande na tela, com conteúdo (children em coordenadas da tela do celular: 0..160 x 0..280) */
export const IconeCelular: React.FC<{ children?: React.ReactNode; s?: number }> = ({ children, s = 1 }) => (
  <g transform={`scale(${s})`}>
    <rect x={-96} y={-170} width={192} height={340} rx={28} fill="#2A2A35" stroke={LINHA} strokeWidth={CONTORNO} />
    <rect x={-80} y={-140} width={160} height={280} rx={10} fill="#F4F1EA" />
    <g transform="translate(-80 -140)">{children}</g>
    <circle cx={0} cy={-156} r={5} fill="#555" />
  </g>
);
/** gráfico de linha; pontos em 0..1 (x da esquerda para a direita, y de baixo para cima); k = quanto já foi desenhado */
export const Grafico: React.FC<{ pontos: [number, number][]; k?: number; w?: number; h?: number; cor?: string; rotulos?: string[] }> = ({ pontos, k = 1, w = 520, h = 300, cor = "#C0504D" }) => {
  const pts = pontos.map(([x, y]) => `${(x * w - w / 2).toFixed(1)},${(h / 2 - y * h).toFixed(1)}`).join(" ");
  return (
    <g>
      <rect x={-w / 2 - 30 + 6} y={-h / 2 - 30 + 7} width={w + 60} height={h + 60} rx={18} fill={PAPEL} />
      <rect x={-w / 2 - 30} y={-h / 2 - 30} width={w + 60} height={h + 60} rx={18} fill="#FFFFFF" stroke={LINHA} strokeWidth={CONTORNO} />
      {[0.25, 0.5, 0.75].map((y) => <line key={y} x1={-w / 2} y1={h / 2 - y * h} x2={w / 2} y2={h / 2 - y * h} stroke="#E4DED2" strokeWidth={3} />)}
      <line x1={-w / 2} y1={h / 2} x2={w / 2} y2={h / 2} stroke={LINHA} strokeWidth={4} />
      <polyline points={pts} fill="none" stroke={cor} strokeWidth={12} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={`${Math.max(0, Math.min(1, k))} 1`} />
    </g>
  );
};
export const IconeRelogio: React.FC<{ giro?: number; cor?: string }> = ({ giro = 0, cor = "#FFFFFF" }) => (
  <g>
    <circle r={56} fill={cor} stroke={LINHA} strokeWidth={SW + 1} />
    {[0, 90, 180, 270].map((a) => <line key={a} x1={0} y1={-44} x2={0} y2={-36} stroke={LINHA} strokeWidth={5} transform={`rotate(${a})`} />)}
    <line x1={0} y1={0} x2={0} y2={-40} stroke={LINHA} strokeWidth={7} strokeLinecap="round" transform={`rotate(${giro})`} />
    <line x1={0} y1={0} x2={0} y2={-26} stroke="#C0504D" strokeWidth={7} strokeLinecap="round" transform={`rotate(${giro / 12})`} />
    <circle r={6} fill={LINHA} />
  </g>
);
export const IconeHospital: React.FC = () => (
  <g>
    <rect x={-54} y={-40} width={108} height={84} fill="#F4F1EA" stroke={LINHA} strokeWidth={SW} />
    <rect x={-14} y={-30} width={28} height={28} fill="#C0504D" />
    <rect x={-6} y={-38} width={12} height={44} fill="#FFFFFF" transform="translate(0 2)" />
    <rect x={-18} y={-22} width={36} height={12} fill="#FFFFFF" />
    <rect x={-12} y={14} width={24} height={30} fill="#9ED8F5" stroke={LINHA} strokeWidth={3} />
  </g>
);
export const IconeAmbulancia: React.FC = () => (
  <g>
    <path d="M -60 24 L -60 -24 L 20 -24 L 20 -8 L 44 -8 L 60 10 L 60 24 Z" fill="#FFFFFF" stroke={LINHA} strokeWidth={SW} strokeLinejoin="round" />
    <rect x={-40} y={-16} width={12} height={28} fill="#C0504D" /><rect x={-48} y={-8} width={28} height={12} fill="#C0504D" />
    <rect x={-6} y={-30} width={16} height={8} rx={3} fill="#5AA5B8" stroke={LINHA} strokeWidth={3} />
    {[-36, 36].map((x) => <circle key={x} cx={x} cy={26} r={12} fill="#2A2A35" stroke={LINHA} strokeWidth={3} />)}
  </g>
);
export const IconeEscola: React.FC = () => (
  <g>
    <path d="M -60 -6 L 0 -48 L 60 -6 Z" fill="#C0504D" stroke={LINHA} strokeWidth={SW} strokeLinejoin="round" />
    <rect x={-50} y={-8} width={100} height={52} fill="#F2D16B" stroke={LINHA} strokeWidth={SW} />
    <rect x={-10} y={14} width={20} height={30} fill="#8A5E3F" stroke={LINHA} strokeWidth={3} />
    {[-34, 22].map((x) => <rect key={x} x={x} y={2} width={14} height={14} fill="#9ED8F5" stroke={LINHA} strokeWidth={3} />)}
    <circle cx={0} cy={-20} r={8} fill="#FFFFFF" stroke={LINHA} strokeWidth={3} />
  </g>
);
export const IconeCesta: React.FC = () => (
  <g>
    <circle cx={-20} cy={-24} r={14} fill="#C0504D" stroke={LINHA} strokeWidth={3} />
    <circle cx={6} cy={-30} r={14} fill="#7AA35B" stroke={LINHA} strokeWidth={3} />
    <ellipse cx={26} cy={-22} rx={16} ry={10} fill="#D99A4E" stroke={LINHA} strokeWidth={3} />
    <path d="M -50 -14 L 50 -14 L 38 34 L -38 34 Z" fill="#C9955E" stroke={LINHA} strokeWidth={SW} strokeLinejoin="round" />
  </g>
);
export const IconeFabrica: React.FC = () => (
  <g>
    <path d="M -60 40 L -60 -10 L -30 -30 L -30 -10 L 0 -30 L 0 -10 L 30 -30 L 30 40 Z" fill="#B9BEC6" stroke={LINHA} strokeWidth={SW} strokeLinejoin="round" />
    <rect x={36} y={-56} width={18} height={96} fill="#8A9099" stroke={LINHA} strokeWidth={SW} />
    {[-46, -16, 14].map((x) => <rect key={x} x={x} y={6} width={18} height={14} fill="#F2D16B" stroke={LINHA} strokeWidth={3} />)}
  </g>
);
export const IconeX: React.FC<{ r?: number }> = ({ r = 60 }) => (
  <g>
    <path d={`M ${-r} ${-r} L ${r} ${r} M ${r} ${-r} L ${-r} ${r}`} stroke={LINHA} strokeWidth={30} strokeLinecap="round" />
    <path d={`M ${-r} ${-r} L ${r} ${r} M ${r} ${-r} L ${-r} ${r}`} stroke="#E0242C" strokeWidth={16} strokeLinecap="round" />
  </g>
);
export const SetaCima: React.FC<{ cor?: string; s?: number }> = ({ cor = "#C0504D", s = 1 }) => (
  <g transform={`scale(${s})`}>
    <path d="M 0 -50 L 36 -10 L 14 -10 L 14 44 L -14 44 L -14 -10 L -36 -10 Z" fill={cor} stroke={LINHA} strokeWidth={SW} strokeLinejoin="round" />
  </g>
);
/** camisa de time genérica (listras opcionais, sem escudo) */
export const IconeCamisa: React.FC<{ cor?: string; cor2?: string; listras?: "vertical" | "horizontal" | "nenhuma" }> = ({ cor = "#C0504D", cor2 = "#141414", listras = "nenhuma" }) => {
  const d = "M -30 -60 L -60 -44 L -76 -12 L -52 0 L -46 -12 L -46 60 L 46 60 L 46 -12 L 52 0 L 76 -12 L 60 -44 L 30 -60 Q 0 -40 -30 -60 Z";
  const id = `camisa-${cor.slice(1)}${cor2.slice(1)}${listras}`;
  return (
    <g>
      <defs><clipPath id={id}><path d={d} /></clipPath></defs>
      <path d={d} fill={cor} />
      <g clipPath={`url(#${id})`}>
        {listras === "vertical" && [-60, -20, 20, 60].map((x) => <rect key={x} x={x - 10} y={-70} width={20} height={140} fill={cor2} />)}
        {listras === "horizontal" && [-40, -8, 24, 56].map((y) => <rect key={y} x={-80} y={y - 9} width={160} height={18} fill={cor2} />)}
      </g>
      <path d={d} fill="none" stroke={LINHA} strokeWidth={SW + 1} strokeLinejoin="round" />
    </g>
  );
};
export const IconeCalendario: React.FC<{ texto: string; sub?: string; cor?: string }> = ({ texto, sub, cor = "#C0504D" }) => (
  <g>
    <rect x={-60} y={-56} width={120} height={116} rx={12} fill="#FFFFFF" stroke={LINHA} strokeWidth={SW} />
    <rect x={-60} y={-56} width={120} height={34} rx={12} fill={cor} stroke={LINHA} strokeWidth={SW} />
    {[-30, 30].map((x) => <rect key={x} x={x - 5} y={-70} width={10} height={24} rx={5} fill={LINHA} />)}
    <text x={0} y={sub ? 22 : 34} textAnchor="middle" fontFamily={FONTE} fontWeight={900} fontSize={texto.length > 3 ? 30 : 48} fill={LINHA}>{texto}</text>
    {sub && <text x={0} y={48} textAnchor="middle" fontFamily={FONTE} fontWeight={800} fontSize={18} fill={LINHA}>{sub}</text>}
  </g>
);
/** nuvem de "puf" (sumiço) que cresce e some ao longo de k (0..1) */
export const Puf: React.FC<{ k: number; r?: number }> = ({ k, r = 80 }) => (
  <g opacity={k < 0.7 ? 1 : 1 - (k - 0.7) / 0.3} transform={`scale(${0.4 + k})`}>
    {[0, 60, 120, 180, 240, 300].map((a) => (
      <circle key={a} cx={Math.cos((a * Math.PI) / 180) * r * 0.5} cy={Math.sin((a * Math.PI) / 180) * r * 0.5} r={r * 0.42} fill="#FFFFFF" stroke={LINHA} strokeWidth={5} />
    ))}
    <circle r={r * 0.5} fill="#FFFFFF" />
  </g>
);
/** lágrimas caindo de um ponto (no mundo ou na tela) */
export const Lagrimas: React.FC<{ x: number; y: number; f: number; s?: number }> = ({ x, y, f, s = 1 }) => (
  <g>
    {[0, 1, 2].flatMap((i) => [-1, 1].map((lado) => {
      const k = ((f + i * 9) % 27) / 27;
      return (
        <path key={`${i}${lado}`} d="M 0 -8 Q 7 4 0 8 Q -7 4 0 -8 Z" fill="#7FC7EA" stroke={LINHA} strokeWidth={2.5}
          transform={`translate(${x + lado * (26 + k * 22) * s} ${y + k * 70 * s}) scale(${s})`} opacity={1 - k * 0.6} />
      );
    }))}
  </g>
);
/** prédio genérico (andares) */
export const IconePredio: React.FC<{ andares?: number; cor?: string; w?: number }> = ({ andares = 7, cor = "#D9CFE8", w = 120 }) => {
  const h = andares * 44 + 20;
  return (
    <g>
      <rect x={-w / 2} y={-h} width={w} height={h} fill={cor} stroke={LINHA} strokeWidth={SW} />
      {Array.from({ length: andares }, (_, i) => [-w / 4, w / 4].map((x) => <rect key={`${i}${x}`} x={x - 14} y={-h + 18 + i * 44} width={28} height={24} fill="#CFE6F0" stroke={LINHA} strokeWidth={3} />))}
    </g>
  );
};

// ------------------------------------------------------------------ capítulo 4: telas, console, jatinho, cachorro, avião
export const IconeTV: React.FC<{ w?: number; h?: number; cor?: string; children?: React.ReactNode }> = ({ w = 220, h = 130, cor = "#3A3F4B", children }) => (
  <g>
    <rect x={-w / 2 + 6} y={-h / 2 + 7} width={w} height={h} rx={10} fill={PAPEL} />
    <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={10} fill={cor} stroke={LINHA} strokeWidth={SW} />
    <rect x={-w / 2 + 12} y={-h / 2 + 12} width={w - 24} height={h - 24} rx={4} fill="#9ED8F5" />
    <g>{children}</g>
  </g>
);
export const IconeConsole: React.FC = () => (
  <g>
    <rect x={-56} y={-22} width={112} height={44} rx={10} fill="#2A2A35" stroke={LINHA} strokeWidth={SW} />
    <rect x={-40} y={-6} width={50} height={6} rx={3} fill="#5AA5B8" />
    <circle cx={34} cy={0} r={7} fill="#7FD18C" />
  </g>
);
export const IconeJatinho: React.FC<{ cor?: string }> = ({ cor = "#F4F1EA" }) => (
  <g>
    <path d="M -150 6 Q -150 -26 -100 -30 L 110 -30 Q 160 -26 168 0 Q 160 18 110 20 L -100 20 Q -150 18 -150 6 Z" fill={cor} stroke={LINHA} strokeWidth={CONTORNO} strokeLinejoin="round" />
    <path d="M -110 -28 L -150 -84 L -118 -84 L -70 -28 Z" fill="#2F6E9E" stroke={LINHA} strokeWidth={SW} strokeLinejoin="round" />
    <path d="M -10 12 L -70 70 L -30 70 L 40 12 Z" fill="#2F6E9E" stroke={LINHA} strokeWidth={SW} strokeLinejoin="round" />
    {[-60, -30, 0, 30, 60, 90].map((x) => <circle key={x} cx={x} cy={-10} r={8} fill="#9ED8F5" stroke={LINHA} strokeWidth={3} />)}
    <path d="M 134 -20 Q 156 -14 160 -2 L 132 -2 Z" fill="#9ED8F5" stroke={LINHA} strokeWidth={3} />
    <line x1={-140} y1={2} x2={150} y2={2} stroke="#2F6E9E" strokeWidth={5} />
  </g>
);
export const IconeCachorro: React.FC<{ cor?: string }> = ({ cor = "#C9955E" }) => (
  <g>
    <ellipse cx={0} cy={10} rx={44} ry={30} fill={cor} stroke={LINHA} strokeWidth={SW} />
    <circle cx={34} cy={-22} r={28} fill={cor} stroke={LINHA} strokeWidth={SW} />
    <path d="M 18 -44 q -16 -6 -14 22 q 12 -4 14 -22 Z" fill={"#8A5E3F"} stroke={LINHA} strokeWidth={3} />
    <circle cx={42} cy={-26} r={4} fill={LINHA} />
    <ellipse cx={60} cy={-16} rx={7} ry={5} fill={LINHA} />
    <path d="M 46 -6 q 8 6 14 0" stroke={LINHA} strokeWidth={3} fill="none" />
    <path d="M -44 0 q -24 -10 -20 -30" stroke={LINHA} strokeWidth={9} fill="none" strokeLinecap="round" />
    <path d="M -44 0 q -24 -10 -20 -30" stroke={cor} strokeWidth={4} fill="none" strokeLinecap="round" />
  </g>
);
export const IconeCaixaCorreio: React.FC = () => (
  <g>
    <rect x={-6} y={0} width={12} height={90} fill="#6E4B35" stroke={LINHA} strokeWidth={3} />
    <path d="M -50 0 L -50 -46 Q -50 -76 0 -76 Q 50 -76 50 -46 L 50 0 Z" fill="#2F6E9E" stroke={LINHA} strokeWidth={SW} strokeLinejoin="round" />
    <rect x={50} y={-70} width={8} height={40} fill="#C0504D" stroke={LINHA} strokeWidth={3} />
  </g>
);

// ------------------------------------------------------------------ capítulo 5: estádio, contrato, guindaste, cheque, globo, prancheta
export const IconeEstadio: React.FC<{ cor?: string }> = ({ cor = "#B9BEC6" }) => (
  <g>
    <path d="M -150 40 L -150 -30 Q 0 -90 150 -30 L 150 40 Z" fill={cor} stroke={LINHA} strokeWidth={SW} strokeLinejoin="round" />
    <path d="M -130 -20 Q 0 -70 130 -20" stroke={LINHA} strokeWidth={4} fill="none" />
    {[-110, -60, -10, 40, 90].map((x) => <rect key={x} x={x} y={-6} width={30} height={30} fill="#5A6170" stroke={LINHA} strokeWidth={3} />)}
    {[-140, 140].map((x) => <line key={x} x1={x} y1={-30} x2={x} y2={-96} stroke={LINHA} strokeWidth={6} />)}
    {[-140, 140].map((x) => <rect key={`l${x}`} x={x - 16} y={-110} width={32} height={18} fill="#F2D16B" stroke={LINHA} strokeWidth={3} />)}
  </g>
);
export const IconeContrato: React.FC = () => (
  <g>
    <rect x={-46} y={-60} width={92} height={120} rx={6} fill="#FFFFFF" stroke={LINHA} strokeWidth={SW} />
    {[-38, -20, -2, 16].map((y) => <line key={y} x1={-32} y1={y} x2={32} y2={y} stroke="#B9B4AA" strokeWidth={5} strokeLinecap="round" />)}
    <path d="M -28 40 q 10 -16 20 0 q 10 14 22 -6" stroke="#2F6E9E" strokeWidth={5} fill="none" strokeLinecap="round" />
  </g>
);
export const IconeGuindaste: React.FC = () => (
  <g>
    <path d="M -20 60 L -20 -70 L 80 -70" stroke={LINHA} strokeWidth={14} fill="none" strokeLinejoin="round" />
    <path d="M -20 60 L -20 -70 L 80 -70" stroke="#F2D16B" strokeWidth={7} fill="none" strokeLinejoin="round" />
    <line x1={60} y1={-70} x2={60} y2={0} stroke={LINHA} strokeWidth={4} />
    <rect x={40} y={0} width={40} height={24} fill="#B9BEC6" stroke={LINHA} strokeWidth={4} />
    <path d="M -80 60 L -80 20 L 20 20 L 20 60" fill="#E9E4DA" stroke={LINHA} strokeWidth={SW} />
  </g>
);
export const IconeCheque: React.FC<{ texto?: string }> = ({ texto = "R$ 999.999.999" }) => (
  <g>
    <rect x={-150} y={-56} width={300} height={112} rx={10} fill="#DFF2D8" stroke={LINHA} strokeWidth={SW} />
    <text x={0} y={-10} textAnchor="middle" fontFamily={FONTE} fontWeight={900} fontSize={34} fill={LINHA}>{texto}</text>
    <line x1={-120} y1={26} x2={120} y2={26} stroke="#B9B4AA" strokeWidth={4} />
    <path d="M 40 22 q 10 -14 20 0 q 10 12 22 -4" stroke="#2F6E9E" strokeWidth={4} fill="none" />
  </g>
);
export const IconeGlobo: React.FC<{ giro?: number }> = ({ giro = 0 }) => (
  <g>
    <circle r={80} fill="#5AA5B8" stroke={LINHA} strokeWidth={SW + 1} />
    <path d={`M ${-50 + (giro % 60)} -40 q 30 -20 50 0 q 10 30 -20 40 q -30 0 -30 -40 Z M ${10 + (giro % 60) * 0.6} 20 q 30 -10 40 10 q -10 30 -40 20 Z`} fill="#7AA35B" stroke={LINHA} strokeWidth={3} />
    <ellipse rx={80} ry={30} fill="none" stroke="#FFFFFF" strokeWidth={3} opacity={0.6} />
  </g>
);
export const IconePrancheta: React.FC<{ linhas: string[]; destaque?: number }> = ({ linhas, destaque }) => (
  <g>
    <rect x={-120} y={-160} width={240} height={320} rx={14} fill="#A9714E" stroke={LINHA} strokeWidth={SW} />
    <rect x={-100} y={-130} width={200} height={276} fill="#FFFFFF" stroke={LINHA} strokeWidth={4} />
    <rect x={-40} y={-172} width={80} height={30} rx={8} fill="#B9BEC6" stroke={LINHA} strokeWidth={4} />
    {linhas.map((l, i) => (
      <text key={i} x={-84} y={-96 + i * 34} fontFamily={FONTE} fontWeight={i === destaque ? 900 : 700} fontSize={i === destaque ? 22 : 19} fill={i === destaque ? "#C0504D" : LINHA}>{l}</text>
    ))}
  </g>
);
