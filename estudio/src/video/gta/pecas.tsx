// Peças do vídeo dos códigos de GTA, no traço do estúdio. A "tela de jogo" é genérica (barra de vida, estrelas,
// mapinha redondo): nada copiado do visual, da fonte, dos personagens ou do mapa de um jogo de verdade.
import React from "react";
import { CONTORNO, INTERNA, LINHA, PAPEL, escura } from "../../estilo";
import { Circle, Papel, Path, Rect } from "../../components/prim";
import { lisoSet } from "../../cenarios/liso/Liso";
import type { CenarioDef } from "../../cenarios/Cena";
import { MARGEM } from "../../cenarios/pecas";
import { FONTE } from "../../fontes";

const L = LINHA;
const LARGO = 1920 + 2 * MARGEM;
const lim = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));

// ------------------------------------------------------------------ teclas e teclado
/** tecla grande (close das quatro letras); afunda quando `aperta` = 1 */
export const Tecla: React.FC<{ letra: string; aperta: number; acesa?: boolean }> = ({ letra, aperta, acesa }) => {
  const dy = 10 * aperta;
  return (
    <g>
      <rect x={-70 + 7} y={-60 + 8} width={140} height={130} rx={22} fill={PAPEL} />
      <rect x={-70} y={-50} width={140} height={120} rx={22} fill="#2A2A35" stroke={L} strokeWidth={CONTORNO} />
      <g transform={`translate(0 ${dy})`}>
        <rect x={-62} y={-64} width={124} height={108} rx={18} fill={acesa ? "#F2D16B" : "#F4F1EA"} stroke={L} strokeWidth={CONTORNO} />
        <text x={0} y={14} textAnchor="middle" fontFamily={FONTE} fontWeight={900} fontSize={64} fill={L}>{letra}</text>
      </g>
    </g>
  );
};
/** teclado visto de cima, em perspectiva leve (em cima da mesa) */
export const Teclado: React.FC<{ w?: number; acesas?: number[] }> = ({ w = 420, acesas = [] }) => {
  const h = w * 0.28;
  return (
    <g>
      <path d={`M ${-w / 2 + 20} ${-h} L ${w / 2 - 20} ${-h} L ${w / 2} 0 L ${-w / 2} 0 Z`} transform="translate(6 7)" fill={PAPEL} />
      <path d={`M ${-w / 2 + 20} ${-h} L ${w / 2 - 20} ${-h} L ${w / 2} 0 L ${-w / 2} 0 Z`} fill="#3A3F4B" stroke={L} strokeWidth={CONTORNO} strokeLinejoin="round" />
      {Array.from({ length: 4 }, (_, r) => Array.from({ length: 12 }, (_, c) => {
        const k = r * 12 + c;
        const fy = -h + 8 + r * (h - 16) / 4;
        const inset = 22 - r * 4;
        const x0 = -w / 2 + inset + 10 + c * ((w - 2 * inset - 20) / 12);
        return <rect key={k} x={x0} y={fy} width={(w - 2 * inset - 20) / 12 - 4} height={(h - 16) / 4 - 4} rx={3} fill={acesas.includes(k) ? "#F2D16B" : "#5A6070"} />;
      }))}
    </g>
  );
};

// ------------------------------------------------------------------ tela de jogo genérica (HUD)
export const BarraVida: React.FC<{ k: number; w?: number; cor?: string; rotulo?: string }> = ({ k, w = 300, cor = "#4FAE63", rotulo }) => (
  <g>
    <rect x={0} y={0} width={w} height={30} rx={8} fill="#1A1F29" stroke={L} strokeWidth={5} />
    <rect x={4} y={4} width={Math.max(0, (w - 8) * lim(k))} height={22} rx={5} fill={cor} />
    {rotulo && <text x={w + 14} y={23} fontFamily={FONTE} fontWeight={900} fontSize={24} fill="#FFFFFF" stroke={L} strokeWidth={5} paintOrder="stroke">{rotulo}</text>}
  </g>
);
const pontosEstrela = (r: number) => Array.from({ length: 10 }, (_, i) => {
  const a = -Math.PI / 2 + (i * Math.PI) / 5;
  const rr = i % 2 ? r * 0.45 : r;
  return `${(Math.cos(a) * rr).toFixed(1)},${(Math.sin(a) * rr).toFixed(1)}`;
}).join(" ");
/** fileira de estrelas de procurado: `n` acesas de `total` (pisca = some e volta) */
export const Estrelas: React.FC<{ n: number; total?: number; r?: number; pisca?: boolean; f?: number }> = ({ n, total = 5, r = 26, pisca, f = 0 }) => (
  <g>
    {Array.from({ length: total }, (_, i) => {
      const acesa = i < n && !(pisca && Math.floor(f / 8) % 2 === 1);
      return <polygon key={i} points={pontosEstrela(r)} transform={`translate(${i * r * 2.3} 0)`} fill={acesa ? "#F2D16B" : "#3A3F4B"} stroke={L} strokeWidth={5} strokeLinejoin="round" />;
    })}
  </g>
);
/** monitor com uma tela de jogo: barra de vida, estrelas e o mapinha; o conteúdo vem em `children` (0..w x 0..h) */
export const TelaJogo: React.FC<{ w?: number; h?: number; vida?: number; estrelas?: number; piscaEstrelas?: boolean; f?: number; circulo?: number; ceu?: string; children?: React.ReactNode }> = ({ w = 1200, h = 675, vida = 1, estrelas = 0, piscaEstrelas, f = 0, circulo = 0, ceu = "#9ED8F5", children }) => (
  <g>
    <rect x={-w / 2 - 40 + 8} y={-h / 2 - 40 + 9} width={w + 80} height={h + 80} rx={30} fill={PAPEL} />
    <rect x={-w / 2 - 40} y={-h / 2 - 40} width={w + 80} height={h + 80} rx={30} fill="#2A2A35" stroke={L} strokeWidth={CONTORNO} />
    <defs><clipPath id="tela-jogo"><rect x={-w / 2} y={-h / 2} width={w} height={h} rx={8} /></clipPath></defs>
    <g clipPath="url(#tela-jogo)">
      <rect x={-w / 2} y={-h / 2} width={w} height={h} fill={ceu} />
      <g transform={`translate(${-w / 2} ${-h / 2})`}>{children}</g>
      {/* HUD */}
      <g transform={`translate(${w / 2 - 330} ${-h / 2 + 30})`}><BarraVida k={vida} /></g>
      <g transform={`translate(${w / 2 - 300} ${-h / 2 + 100})`}><Estrelas n={estrelas} pisca={piscaEstrelas} f={f} r={22} /></g>
      <g transform={`translate(${-w / 2 + 110} ${h / 2 - 110})`}>
        <circle r={86} fill="#7FA87A" stroke={L} strokeWidth={6} />
        <path d="M -86 10 L 86 -6 M -20 -86 L -6 86" stroke="#E9E4DA" strokeWidth={14} />
        <polygon points="0,-14 10,12 0,6 -10,12" fill="#FFFFFF" stroke={L} strokeWidth={3} />
        {circulo > 0 && <circle r={40 + 30 * circulo} fill="#5AA5B8" opacity={0.35} stroke="#2F6E9E" strokeWidth={4} />}
      </g>
    </g>
    <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={8} fill="none" stroke={L} strokeWidth={5} />
  </g>
);

// ------------------------------------------------------------------ ícones
export const Escudo: React.FC<{ cor?: string }> = ({ cor = "#5AA5B8" }) => (
  <g>
    <path d="M 0 -80 L 64 -56 Q 66 30 0 84 Q -66 30 -64 -56 Z" transform="translate(6 7)" fill={PAPEL} />
    <path d="M 0 -80 L 64 -56 Q 66 30 0 84 Q -66 30 -64 -56 Z" fill={cor} stroke={L} strokeWidth={CONTORNO} strokeLinejoin="round" />
    <path d="M 0 -60 L 44 -44 Q 46 22 0 62 Z" fill="#FFFFFF" opacity={0.3} />
    <path d="M -26 2 l 18 20 l 34 -42" stroke="#FFFFFF" strokeWidth={12} fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </g>
);
/** nuvem de cogumelo estilizada (só a forma, cinza) */
export const Cogumelo: React.FC<{ s?: number }> = ({ s = 1 }) => (
  <g transform={`scale(${s})`}>
    <path d="M -22 90 Q -14 40 -18 0 L 18 0 Q 14 40 22 90 Z" fill="#B9B2A5" stroke={L} strokeWidth={6} strokeLinejoin="round" />
    {[[-50, -30, 40], [0, -50, 52], [50, -30, 40], [-30, 0, 34], [30, 0, 34]].map(([x, y, r], i) => <circle key={i} cx={x + 5} cy={y + 6} r={r} fill={PAPEL} />)}
    {[[-50, -30, 40], [0, -50, 52], [50, -30, 40], [-30, 0, 34], [30, 0, 34]].map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r} fill="#D6CDBE" stroke={L} strokeWidth={6} />)}
    <ellipse cx={0} cy={92} rx={70} ry={14} fill="#B9B2A5" stroke={L} strokeWidth={6} />
  </g>
);
/** contorno aproximado do estado de São Paulo (forma estilizada) */
export const MapaSP: React.FC<{ cor?: string }> = ({ cor = "#7FA87A" }) => {
  const d = "M -300 -40 L -250 -110 L -170 -120 L -110 -150 L -20 -140 L 60 -170 L 140 -150 L 210 -170 L 280 -120 L 310 -60 L 280 -10 L 300 40 L 220 70 L 150 110 L 80 120 L 10 160 L -60 150 L -120 110 L -190 90 L -250 40 Z";
  return (
    <g>
      <path d={d} transform="translate(8 9)" fill={PAPEL} />
      <path d={d} fill={cor} stroke={L} strokeWidth={CONTORNO} strokeLinejoin="round" />
      <circle cx={170} cy={60} r={14} fill="#C0504D" stroke={L} strokeWidth={4} />
    </g>
  );
};
export const Lousa: React.FC<{ w?: number; h?: number; children?: React.ReactNode }> = ({ w = 1100, h = 520, children }) => (
  <g>
    <rect x={-w / 2 - 24 + 8} y={-h / 2 - 24 + 9} width={w + 48} height={h + 48} rx={14} fill={PAPEL} />
    <rect x={-w / 2 - 24} y={-h / 2 - 24} width={w + 48} height={h + 48} rx={14} fill="#A9714E" stroke={L} strokeWidth={CONTORNO} />
    <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={6} fill="#2F4A3A" stroke={L} strokeWidth={5} />
    {children}
  </g>
);
/** texto de giz */
export const Giz: React.FC<{ texto: string; x?: number; y?: number; tam?: number; cor?: string }> = ({ texto, x = 0, y = 0, tam = 90, cor = "#F4F1EA" }) => (
  <text x={x} y={y} textAnchor="middle" fontFamily={FONTE} fontWeight={800} fontSize={tam} fill={cor} opacity={0.95}>{texto}</text>
);
export const Balanca: React.FC<{ texto: string }> = ({ texto }) => (
  <g>
    <rect x={-260 + 7} y={-40 + 8} width={520} height={80} rx={14} fill={PAPEL} />
    <rect x={-260} y={-40} width={520} height={80} rx={14} fill="#B9BEC6" stroke={L} strokeWidth={CONTORNO} />
    <rect x={-90} y={-26} width={180} height={52} rx={8} fill="#1A1F29" stroke={L} strokeWidth={5} />
    <text x={0} y={14} textAnchor="middle" fontFamily={FONTE} fontWeight={900} fontSize={34} fill="#7FD18C">{texto}</text>
  </g>
);
export const Viga: React.FC = () => (
  <g>
    <path d="M -70 -40 L 70 -40 L 70 -24 L 12 -24 L 12 24 L 70 24 L 70 40 L -70 40 L -70 24 L -12 24 L -12 -24 L -70 -24 Z" fill="#8A8F98" stroke={L} strokeWidth={6} strokeLinejoin="round" />
  </g>
);
export const Vidro: React.FC = () => (
  <g>
    <rect x={-50} y={-60} width={100} height={120} rx={6} fill="#CFE6F0" stroke={L} strokeWidth={6} />
    <path d="M -30 -30 l 30 -18 M -30 0 l 50 -30" stroke="#FFFFFF" strokeWidth={8} strokeLinecap="round" />
  </g>
);
export const Plastico: React.FC = () => (
  <g>
    <path d="M -14 -70 L 14 -70 L 14 -52 Q 40 -40 40 -10 L 40 60 Q 40 70 30 70 L -30 70 Q -40 70 -40 60 L -40 -10 Q -40 -40 -14 -52 Z" fill="#9ED8F5" stroke={L} strokeWidth={6} strokeLinejoin="round" />
    <rect x={-18} y={-84} width={36} height={18} rx={4} fill="#2F6E9E" stroke={L} strokeWidth={5} />
  </g>
);
export const Termometro: React.FC<{ k: number }> = ({ k }) => (
  <g>
    <rect x={-22 + 6} y={-150 + 7} width={44} height={250} rx={22} fill={PAPEL} />
    <rect x={-22} y={-150} width={44} height={230} rx={22} fill="#FFFFFF" stroke={L} strokeWidth={CONTORNO} />
    <circle cx={0} cy={100} r={40} fill="#E0826E" stroke={L} strokeWidth={CONTORNO} />
    <rect x={-10} y={80 - 210 * lim(k)} width={20} height={210 * lim(k) + 10} fill="#E0826E" />
    {[0, 1, 2, 3, 4].map((i) => <line key={i} x1={8} y1={-120 + i * 40} x2={22} y2={-120 + i * 40} stroke={L} strokeWidth={4} />)}
  </g>
);
export const Velocimetro: React.FC<{ v: number; max?: number; rotulo?: string }> = ({ v, max = 220, rotulo = "KM/H" }) => {
  const a = -210 + 240 * lim(v / max);
  return (
    <g>
      <circle cx={7} cy={8} r={130} fill={PAPEL} />
      <circle r={130} fill="#FFFFFF" stroke={L} strokeWidth={CONTORNO} />
      <path d="M -92 64 A 112 112 0 1 1 92 64" fill="none" stroke="#E4DED2" strokeWidth={18} />
      <path d={`M -92 64 A 112 112 0 ${v / max > 0.66 ? 1 : 0} 1 ${(112 * Math.cos((a * Math.PI) / 180)).toFixed(1)} ${(112 * Math.sin((a * Math.PI) / 180)).toFixed(1)}`} fill="none" stroke="#E0826E" strokeWidth={18} />
      <line x1={0} y1={0} x2={(90 * Math.cos((a * Math.PI) / 180)).toFixed(1)} y2={(90 * Math.sin((a * Math.PI) / 180)).toFixed(1)} stroke={L} strokeWidth={10} strokeLinecap="round" />
      <circle r={14} fill={L} />
      <text x={0} y={70} textAnchor="middle" fontFamily={FONTE} fontWeight={900} fontSize={46} fill={L}>{Math.round(v)}</text>
      <text x={0} y={104} textAnchor="middle" fontFamily={FONTE} fontWeight={800} fontSize={22} fill={L}>{rotulo}</text>
    </g>
  );
};
export const Osso: React.FC = () => (
  <g>
    <path d="M -60 -12 L 60 -12 L 60 12 L -60 12 Z" fill="#F4F1EA" stroke={L} strokeWidth={6} />
    {[[-66, -14], [-66, 14], [66, -14], [66, 14]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={18} fill="#F4F1EA" stroke={L} strokeWidth={6} />)}
    <rect x={-60} y={-9} width={120} height={18} fill="#F4F1EA" />
  </g>
);
export const Helicoptero: React.FC<{ f: number; luz?: boolean }> = ({ f, luz }) => (
  <g>
    {luz && <path d="M -10 40 L -160 520 L 160 520 L 10 40 Z" fill="#F2D16B" opacity={0.22} />}
    <path d="M -110 -10 Q -110 -50 -60 -50 L 50 -50 Q 110 -50 110 0 Q 110 40 60 40 L -60 40 Q -110 40 -110 -10 Z" fill="#3A3F4B" stroke={L} strokeWidth={CONTORNO} strokeLinejoin="round" />
    <path d="M 40 -40 Q 96 -40 96 0 L 40 0 Z" fill="#9ED8F5" stroke={L} strokeWidth={5} />
    <path d="M -110 -14 L -260 -24 L -260 -2 L -110 6 Z" fill="#3A3F4B" stroke={L} strokeWidth={6} strokeLinejoin="round" />
    <rect x={-270} y={-50} width={14} height={50} rx={6} fill="#3A3F4B" stroke={L} strokeWidth={5} />
    <line x1={0} y1={-50} x2={0} y2={-70} stroke={L} strokeWidth={10} />
    <line x1={-200 * Math.cos(f / 1.5)} y1={-72} x2={200 * Math.cos(f / 1.5)} y2={-72} stroke={L} strokeWidth={10} strokeLinecap="round" />
    <path d="M -70 40 L -80 62 L 70 62 L 60 40" fill="none" stroke={L} strokeWidth={7} />
    <circle cx={-20} cy={44} r={14} fill="#E0826E" stroke={L} strokeWidth={4} />
  </g>
);
export const Antena: React.FC<{ f: number; ondas?: boolean }> = ({ f, ondas }) => (
  <g>
    <path d="M -50 200 L 0 -160 L 50 200" fill="none" stroke={L} strokeWidth={14} strokeLinejoin="round" />
    <path d="M -50 200 L 0 -160 L 50 200" fill="none" stroke="#B9BEC6" strokeWidth={7} strokeLinejoin="round" />
    {[0, 1, 2, 3].map((i) => <line key={i} x1={-40 + i * 6} y1={150 - i * 80} x2={40 - i * 6} y2={150 - i * 80} stroke={L} strokeWidth={5} />)}
    <rect x={-30} y={-150} width={60} height={70} rx={6} fill="#F4F1EA" stroke={L} strokeWidth={6} />
    {ondas && [0, 1, 2].map((i) => {
      const k = ((f / 20 + i / 3) % 1);
      return <circle key={i} cx={0} cy={-116} r={40 + k * 220} fill="none" stroke="#5AA5B8" strokeWidth={8} opacity={1 - k} />;
    })}
  </g>
);
/** placa no padrão Mercosul (genérica) */
export const Placa: React.FC<{ texto?: string }> = ({ texto = "TEO1G23" }) => (
  <g>
    <rect x={-200 + 7} y={-66 + 8} width={400} height={132} rx={14} fill={PAPEL} />
    <rect x={-200} y={-66} width={400} height={132} rx={14} fill="#FFFFFF" stroke={L} strokeWidth={CONTORNO} />
    <rect x={-200} y={-66} width={400} height={34} rx={10} fill="#2F5DA8" stroke={L} strokeWidth={5} />
    <text x={0} y={-41} textAnchor="middle" fontFamily={FONTE} fontWeight={900} fontSize={20} fill="#FFFFFF">BRASIL</text>
    <text x={0} y={46} textAnchor="middle" fontFamily={FONTE} fontWeight={900} fontSize={72} fill={L} letterSpacing={4}>{texto}</text>
  </g>
);
export const Interruptor: React.FC<{ ligado: boolean; rotulo?: string }> = ({ ligado, rotulo }) => (
  <g>
    <rect x={-80 + 7} y={-130 + 8} width={160} height={260} rx={20} fill={PAPEL} />
    <rect x={-80} y={-130} width={160} height={260} rx={20} fill="#F4F1EA" stroke={L} strokeWidth={CONTORNO} />
    <rect x={-36} y={-80} width={72} height={160} rx={14} fill="#B9BEC6" stroke={L} strokeWidth={5} />
    <rect x={-30} y={ligado ? -74 : 6} width={60} height={68} rx={10} fill={ligado ? "#4FAE63" : "#C0504D"} stroke={L} strokeWidth={5} />
    {rotulo && <text x={0} y={170} textAnchor="middle" fontFamily={FONTE} fontWeight={900} fontSize={32} fill="#FFFFFF" stroke={L} strokeWidth={7} paintOrder="stroke">{rotulo}</text>}
  </g>
);
/** cartão de contrato com letras miúdas */
export const Contrato: React.FC<{ miudas?: number }> = ({ miudas = 0 }) => (
  <g>
    <rect x={-220 + 7} y={-280 + 8} width={440} height={560} rx={10} fill={PAPEL} />
    <rect x={-220} y={-280} width={440} height={560} rx={10} fill="#FFFFFF" stroke={L} strokeWidth={CONTORNO} />
    <text x={0} y={-210} textAnchor="middle" fontFamily={FONTE} fontWeight={900} fontSize={40} fill={L}>INVENCÍVEL</text>
    {[0, 1, 2, 3].map((i) => <rect key={i} x={-170} y={-160 + i * 44} width={300 + ((i * 37) % 40)} height={14} rx={7} fill="#E4DED2" />)}
    <text x={-170} y={60} fontFamily={FONTE} fontWeight={900} fontSize={34} fill="#3E8E5A">✓ SEM DANO</text>
    {miudas > 0 && (
      <g opacity={miudas}>
        {["* não inclui oxigênio", "* não inclui calor", "* não inclui inércia"].map((t, i) => (
          <text key={t} x={-170} y={150 + i * 34} fontFamily={FONTE} fontWeight={800} fontSize={24} fill="#C0504D">{t}</text>
        ))}
      </g>
    )}
  </g>
);
/** silhueta do corpo, com água até `nivel` (0..1) */
export const CorpoAgua: React.FC<{ nivel: number; quente?: number }> = ({ nivel, quente = 0 }) => {
  const d = "M 0 -230 C 36 -230 46 -200 46 -176 C 46 -150 30 -134 0 -134 C -30 -134 -46 -150 -46 -176 C -46 -200 -36 -230 0 -230 Z M -70 -120 L 70 -120 L 84 40 L 50 40 L 44 230 L 8 230 L 0 60 L -8 230 L -44 230 L -50 40 L -84 40 Z";
  return (
    <g>
      <defs><clipPath id="corpo-agua"><path d={d} /></clipPath></defs>
      <path d={d} transform="translate(7 8)" fill={PAPEL} />
      <path d={d} fill="#F4F1EA" />
      <g clipPath="url(#corpo-agua)">
        <rect x={-100} y={230 - 460 * lim(nivel)} width={200} height={460 * lim(nivel)} fill={quente > 0 ? `rgb(${Math.round(90 + 140 * quente)},${Math.round(165 - 60 * quente)},${Math.round(184 - 110 * quente)})` : "#5AA5B8"} />
      </g>
      <path d={d} fill="none" stroke={L} strokeWidth={CONTORNO} strokeLinejoin="round" />
    </g>
  );
};
/** moléculas que tremem mais conforme a temperatura (0..1) */
export const Moleculas: React.FC<{ f: number; calor: number }> = ({ f, calor }) => (
  <g>
    {Array.from({ length: 12 }, (_, i) => {
      const x = ((i * 97) % 300) - 150, y = ((i * 61) % 200) - 100;
      const a = 2 + 18 * calor;
      return <circle key={i} cx={x + Math.sin(f / (3 - 2 * calor) + i) * a} cy={y + Math.cos(f / (2.6 - 1.6 * calor) + i * 2) * a} r={16} fill={calor > 0.5 ? "#E0826E" : "#5AA5B8"} stroke={L} strokeWidth={4} />;
    })}
  </g>
);
/** cérebro simples */
export const Cerebro: React.FC = () => (
  <g>
    <path d="M -80 10 C -100 -40 -60 -80 -20 -70 C 0 -100 60 -90 70 -50 C 110 -40 100 20 70 30 C 70 70 10 80 -10 60 C -50 80 -90 50 -80 10 Z" fill="#E37BA1" stroke={L} strokeWidth={CONTORNO} strokeLinejoin="round" />
    <path d="M -40 -40 q 20 10 10 30 M 10 -60 q -10 30 20 40 M 40 10 q -20 10 -10 30 M -50 20 q 20 0 30 20" stroke={escura("#E37BA1")} strokeWidth={6} fill="none" strokeLinecap="round" />
  </g>
);
export const Pulmao: React.FC<{ k?: number }> = ({ k = 1 }) => (
  <g transform={`scale(${0.9 + 0.1 * k})`}>
    <path d="M -10 -70 L -10 -20 Q -40 -60 -70 -30 Q -100 20 -80 70 Q -60 90 -20 70 Q -10 40 -10 0 Z" fill="#E0826E" stroke={L} strokeWidth={6} strokeLinejoin="round" />
    <path d="M 10 -70 L 10 -20 Q 40 -60 70 -30 Q 100 20 80 70 Q 60 90 20 70 Q 10 40 10 0 Z" fill="#E0826E" stroke={L} strokeWidth={6} strokeLinejoin="round" />
    <rect x={-8} y={-96} width={16} height={34} rx={6} fill="#E9E4DA" stroke={L} strokeWidth={5} />
  </g>
);
/** chama animada */
export const Chama: React.FC<{ f: number; s?: number; fase?: number }> = ({ f, s = 1, fase = 0 }) => {
  const b = Math.sin(f / 3 + fase) * 6, c = Math.cos(f / 4 + fase) * 5;
  return (
    <g transform={`scale(${s})`}>
      <path d={`M -50 40 Q -60 -10 -30 -40 Q ${-20 + b} -10 -10 -20 Q ${0 + c} -70 ${10 + b} -110 Q 30 -60 40 -40 Q 60 -10 50 40 Z`} fill="#E0822E" stroke={L} strokeWidth={6} strokeLinejoin="round" />
      <path d={`M -26 40 Q -30 0 -10 -20 Q ${0 + c} -40 6 -60 Q 20 -20 26 0 Q 34 20 26 40 Z`} fill="#F2D16B" />
    </g>
  );
};

// ------------------------------------------------------------------ cenários
/** quarto à noite com a mesa do Téo na frente (balcão): notebook de costas e teclado em cima da mesa */
export const MESA_TEO: CenarioDef = (() => {
  const set = lisoSet(1.35);
  set.id = "mesa_teo";
  set.nome = "Mesa do Téo";
  set.ancoras = { chao: { tipo: "chao", y: 962, yFundo: 940, x0: 60, x1: 1860 }, mesa: { tipo: "tampo", y: 780, x0: 520, x1: 1400 } };
  const Fundo: React.FC<{ t: number }> = () => (
    <g>
      <rect x={-MARGEM} y={-MARGEM} width={LARGO} height={1200} fill="#3B3F5C" />
      <rect x={1280} y={160} width={360} height={300} rx={10} fill="#1E2A44" stroke="#2A2E45" strokeWidth={14} />
      <circle cx={1540} cy={240} r={40} fill="#F4F1EA" />
      {[[1340, 220], [1400, 330], [1460, 260], [1600, 380]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={4} fill="#FFFFFF" />)}
      <rect x={300} y={200} width={220} height={300} rx={8} fill="#C0504D" />
      <rect x={330} y={230} width={160} height={110} rx={6} fill="#F2D16B" />
    </g>
  );
  const Meio: React.FC<{ t: number }> = () => (
    <g>
      <Rect x={-MARGEM} y={900} width={LARGO} height={200} fill="#4A4F6A" stroke={L} strokeWidth={CONTORNO} semSombra />
    </g>
  );
  const Balcao: React.FC<{ t: number }> = ({ t }) => (
    <g>
      <Papel>
        <Rect x={500} y={780} width={920} height={34} rx={8} fill="#A9714E" stroke={L} strokeWidth={CONTORNO} />
        <Rect x={530} y={814} width={860} height={160} fill="#8A5E3F" stroke={L} strokeWidth={CONTORNO} />
        {/* notebook de costas */}
        <Path d="M 800 780 L 822 650 L 1098 650 L 1120 780 Z" fill="#B9BEC6" stroke={L} strokeWidth={CONTORNO} strokeLinejoin="round" />
        <Circle cx={960} cy={712} r={18} fill="#F4F1EA" stroke={L} strokeWidth={INTERNA} />
      </Papel>
      <rect x={800} y={632} width={320} height={22} fill="#9ED8F5" opacity={0.25 + 0.1 * Math.sin(t * 3)} />
    </g>
  );
  const Frente: React.FC<{ t: number }> = () => null;
  return { set, Fundo, Meio, Balcao, Frente };
})();
/** fundo do mar: luz de cima, areia, algas, bolhas */
export const MAR: CenarioDef = (() => {
  const set = lisoSet(1.2);
  set.id = "mar";
  set.ancoras = { chao: { tipo: "chao", y: 962, yFundo: 940, x0: 60, x1: 1860 } };
  const Fundo: React.FC<{ t: number }> = ({ t }) => (
    <g>
      <defs><linearGradient id="agua" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#4F9BC8" /><stop offset="1" stopColor="#1E3F66" /></linearGradient></defs>
      <rect x={-MARGEM} y={-MARGEM} width={LARGO} height={1200} fill="url(#agua)" />
      {[0, 1, 2, 3].map((i) => <path key={i} d={`M ${200 + i * 420 + Math.sin(t + i) * 20} -100 L ${120 + i * 420} 1000 L ${260 + i * 420} 1000 Z`} fill="#FFFFFF" opacity={0.06} />)}
    </g>
  );
  const Meio: React.FC<{ t: number }> = ({ t }) => (
    <g>
      <Rect x={-MARGEM} y={920} width={LARGO} height={200} fill="#D9C38E" stroke={L} strokeWidth={CONTORNO} semSombra />
      {[160, 420, 1500, 1760].map((x, i) => <path key={x} d={`M ${x} 930 q ${20 + Math.sin(t * 2 + i) * 10} -80 0 -160 q ${-20} -60 ${10 + Math.sin(t * 2 + i) * 10} -120`} stroke="#4F8A3B" strokeWidth={16} fill="none" strokeLinecap="round" />)}
      {Array.from({ length: 10 }, (_, i) => {
        const y = 900 - ((t * 60 + i * 97) % 900);
        return <circle key={i} cx={(i * 211) % 1920 + Math.sin(t * 3 + i) * 10} cy={y} r={6 + (i % 3) * 3} fill="none" stroke="#DDEFF5" strokeWidth={3} opacity={0.7} />;
      })}
    </g>
  );
  const Frente: React.FC<{ t: number }> = () => null;
  return { set, Fundo, Meio, Frente };
})();
/** prédio em chamas */
export const INCENDIO: CenarioDef = (() => {
  const set = lisoSet(1.2);
  set.id = "incendio";
  set.ancoras = { chao: { tipo: "chao", y: 962, yFundo: 940, x0: 60, x1: 1860 } };
  const Fundo: React.FC<{ t: number }> = () => (
    <g>
      <rect x={-MARGEM} y={-MARGEM} width={LARGO} height={1200} fill="#4A2A2A" />
      {Array.from({ length: 6 }, (_, i) => <circle key={i} cx={200 + i * 330} cy={180 + (i % 2) * 60} r={150} fill="#5E3A36" />)}
    </g>
  );
  const Meio: React.FC<{ t: number }> = ({ t }) => (
    <g>
      <Papel>
        <Rect x={-MARGEM} y={120} width={LARGO} height={800} fill="#8E6440" stroke={L} strokeWidth={CONTORNO} />
        {Array.from({ length: 10 }, (_, i) => <Rect key={i} x={40 + i * 190} y={220 + (i % 2) * 260} width={120} height={150} rx={6} fill="#F2B04E" stroke={L} strokeWidth={INTERNA} />)}
      </Papel>
      <Rect x={-MARGEM} y={900} width={LARGO} height={200} fill="#5A4A45" stroke={L} strokeWidth={CONTORNO} semSombra />
      {Array.from({ length: 10 }, (_, i) => (
        <g key={i} transform={`translate(${100 + i * 190} ${370 + (i % 2) * 260})`}><Chama f={t * 30} s={0.9} fase={i} /></g>
      ))}
    </g>
  );
  const Frente: React.FC<{ t: number }> = () => null;
  return { set, Fundo, Meio, Frente };
})();
/** lateral de um prédio alto (queda): janelas passando conforme `desce` */
export const predioQueda = (desce: (t: number) => number): CenarioDef => {
  const set = lisoSet(1.2);
  set.id = "predio";
  set.ancoras = { chao: { tipo: "chao", y: 962, yFundo: 940, x0: 60, x1: 1860 } };
  const Fundo: React.FC<{ t: number }> = () => <rect x={-MARGEM} y={-MARGEM} width={LARGO} height={1200} fill="#9ED8F5" />;
  const Meio: React.FC<{ t: number }> = ({ t }) => {
    const dy = desce(t) % 260;
    return (
      <g>
        <rect x={1000} y={-MARGEM} width={700} height={1400} fill="#C9D3E0" stroke={L} strokeWidth={CONTORNO} />
        {Array.from({ length: 8 }, (_, r) => [0, 1, 2].map((c) => <rect key={`${r}${c}`} x={1060 + c * 220} y={-300 + r * 260 - dy} width={140} height={160} rx={6} fill="#9ED8F5" stroke={L} strokeWidth={INTERNA} />))}
        {Array.from({ length: 6 }, (_, i) => <line key={i} x1={200 + i * 120} y1={((t * 900 + i * 230) % 1400) - 200} x2={200 + i * 120} y2={((t * 900 + i * 230) % 1400) - 80} stroke="#FFFFFF" strokeWidth={8} strokeLinecap="round" opacity={0.7} />)}
      </g>
    );
  };
  const Frente: React.FC<{ t: number }> = () => null;
  return { set, Fundo, Meio, Frente };
};
/** beco à noite: paredes de tijolo, caçamba, poste */
export const BECO: CenarioDef = (() => {
  const set = lisoSet(1.25);
  set.id = "beco";
  set.ancoras = { chao: { tipo: "chao", y: 962, yFundo: 930, x0: 200, x1: 1720 } };
  const Fundo: React.FC<{ t: number }> = () => (
    <g>
      <rect x={-MARGEM} y={-MARGEM} width={LARGO} height={1200} fill="#141A2E" />
      <rect x={700} y={-MARGEM} width={520} height={1000} fill="#232B45" />
      {[[760, 120], [900, 260], [1100, 160], [820, 400], [1060, 360]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={3} fill="#FFFFFF" />)}
    </g>
  );
  const Meio: React.FC<{ t: number }> = () => (
    <g>
      <Papel>
        <Path d={`M ${-MARGEM} ${-MARGEM} L 700 ${-MARGEM} L 700 920 L ${-MARGEM} 980 Z`} fill="#6B3E35" stroke={L} strokeWidth={CONTORNO} />
        <Path d={`M ${1920 + MARGEM} ${-MARGEM} L 1220 ${-MARGEM} L 1220 920 L ${1920 + MARGEM} 980 Z`} fill="#6B3E35" stroke={L} strokeWidth={CONTORNO} />
      </Papel>
      {Array.from({ length: 18 }, (_, r) => [0, 1, 2, 3].map((c) => (
        <g key={`${r}${c}`}>
          <rect x={-40 + c * 180 + (r % 2) * 90} y={20 + r * 52} width={160} height={40} fill="none" stroke="#5A322B" strokeWidth={4} />
          <rect x={1240 + c * 180 + (r % 2) * 90} y={20 + r * 52} width={160} height={40} fill="none" stroke="#5A322B" strokeWidth={4} />
        </g>
      )))}
      <Rect x={-MARGEM} y={920} width={LARGO} height={200} fill="#2B2F3A" stroke={L} strokeWidth={CONTORNO} semSombra />
      <Papel>
        <Rect x={1300} y={760} width={300} height={190} rx={10} fill="#2F5D50" stroke={L} strokeWidth={CONTORNO} />
        <Rect x={1290} y={740} width={320} height={36} rx={8} fill="#244A40" stroke={L} strokeWidth={CONTORNO} />
      </Papel>
      <ellipse cx={600} cy={980} rx={160} ry={18} fill="#3A4560" opacity={0.8} />
    </g>
  );
  const Frente: React.FC<{ t: number }> = () => null;
  return { set, Fundo, Meio, Frente };
})();
/** hatch popular genérico (sem marca), de lado; origem no chão, no meio do carro */
export const Hatch: React.FC<{ cor?: string; fantasma?: number }> = ({ cor = "#C0504D", fantasma = 0 }) => (
  <g opacity={1 - 0.6 * fantasma}>
    <path d="M -200 -40 L -196 -96 Q -190 -112 -170 -114 L -110 -118 L -60 -176 Q -50 -186 -30 -186 L 90 -186 Q 116 -186 130 -170 L 176 -116 L 196 -108 Q 206 -100 206 -84 L 206 -40 Z" transform="translate(6 7)" fill={PAPEL} />
    <path d="M -200 -40 L -196 -96 Q -190 -112 -170 -114 L -110 -118 L -60 -176 Q -50 -186 -30 -186 L 90 -186 Q 116 -186 130 -170 L 176 -116 L 196 -108 Q 206 -100 206 -84 L 206 -40 Z" fill={fantasma > 0 ? "none" : cor} stroke={fantasma > 0 ? "#5AA5B8" : L} strokeWidth={CONTORNO} strokeLinejoin="round" strokeDasharray={fantasma > 0 ? "18 12" : undefined} />
    {fantasma === 0 && <>
      <path d="M -96 -118 L -52 -168 L 10 -168 L 10 -118 Z" fill="#CFE6F0" stroke={L} strokeWidth={5} strokeLinejoin="round" />
      <path d="M 26 -118 L 26 -168 L 88 -168 Q 104 -168 114 -156 L 146 -118 Z" fill="#CFE6F0" stroke={L} strokeWidth={5} strokeLinejoin="round" />
      <line x1={18} y1={-118} x2={18} y2={-46} stroke={escura(cor)} strokeWidth={5} />
      <rect x={182} y={-96} width={20} height={16} rx={4} fill="#F2D16B" stroke={L} strokeWidth={4} />
    </>}
    {[-120, 120].map((x) => (
      <g key={x}>
        <circle cx={x} cy={-40} r={40} fill={fantasma > 0 ? "none" : "#2A2A35"} stroke={fantasma > 0 ? "#5AA5B8" : L} strokeWidth={CONTORNO} strokeDasharray={fantasma > 0 ? "14 10" : undefined} />
        {fantasma === 0 && <circle cx={x} cy={-40} r={16} fill="#B9BEC6" stroke={L} strokeWidth={4} />}
      </g>
    ))}
  </g>
);
/** brilho de materialização (estrelinhas que giram e somem) */
export const Brilho: React.FC<{ k: number; r?: number }> = ({ k, r = 160 }) => (k <= 0 || k >= 1 ? null : (
  <g opacity={1 - k}>
    {Array.from({ length: 8 }, (_, i) => {
      const a = (i / 8) * Math.PI * 2 + k * 2;
      const d = r * (0.4 + k);
      return <path key={i} d="M 0 -18 L 5 -5 L 18 0 L 5 5 L 0 18 L -5 5 L -18 0 L -5 -5 Z" transform={`translate(${Math.cos(a) * d} ${Math.sin(a) * d}) scale(${1.4 - k})`} fill="#FFFFFF" stroke={L} strokeWidth={3} />;
    })}
  </g>
));
