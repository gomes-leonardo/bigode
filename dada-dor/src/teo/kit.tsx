// Peças comuns dos planos do Téo: contexto do plano, câmera, ator, cartela e efeitos de tirinha.
import React, { createContext, useContext } from "react";
import { AbsoluteFill, interpolate, random, useCurrentFrame, useVideoConfig } from "remotion";
import { FONTE } from "../theme";
import { ELENCO, type NomeElenco } from "./elenco";
import { falando, piscando } from "./motor";
import { Boneco, LINHA, pontos, type PoseTeo, type Visual } from "./tira";

export type FalaT = { voz: string; personagem: string | null; texto: string; inicio: number; duracao: number };
export type BalaoT = { fala: number | null; k: number; n: number; tipo: string; rotulo: string | null; emite: number; fimFala: number; queda?: number; sobe?: number };
export type PlanoT = { id: string; cap: number; inicio: number; duracao: number; falas: FalaT[]; sfx: { nome: string; em: number }[]; baloes?: BalaoT[] };
export const PlanoCtx = createContext<PlanoT | null>(null);

/** tempo local do plano e atalhos para as falas e efeitos */
export const usePlano = () => {
  const p = useContext(PlanoCtx)!;
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = f / fps;
  const F = (i: number) => {
    const x = p.falas[Math.min(i, p.falas.length - 1)] ?? { inicio: 0.25, duracao: 1 };
    return { ini: x.inicio, dur: x.duracao, fim: x.inicio + x.duracao };
  };
  const S = (nome: string, n = 0) => p.sfx.filter((s) => s.nome === nome)[n]?.em ?? 0;
  /** a personagem está falando agora? (boca) */
  const fala = (quem: string) => p.falas.some((x) => x.personagem === quem && falando(t, x.inicio, x.duracao));
  return { t, f, fps, dur: p.duracao, F, S, fala, plano: p };
};

/** ator: aplica boca de fala e piscada natural à pose e desenha */
export const Ator: React.FC<{ quem: NomeElenco; pose: PoseTeo; fala?: boolean; semPiscar?: boolean; semente?: number; esc?: number; v?: Visual }> = ({ quem, pose, fala, semPiscar, semente = 0, esc, v }) => {
  const { t } = usePlano();
  const m = ELENCO[quem];
  const p = { ...pose, falando: pose.falando ?? fala, piscar: pose.piscar ?? (!semPiscar && piscando(t, semente + quem.length)) };
  return <Boneco pose={p} esc={esc ?? m.esc} v={v ?? m.v} />;
};
export const pts = (quem: NomeElenco, pose: PoseTeo) => pontos(pose, ELENCO[quem].esc, ELENCO[quem].v);
export const E = (quem: NomeElenco) => ELENCO[quem].esc;
export const V = (quem: NomeElenco) => ELENCO[quem].v;

/** câmera por chaves: centro do quadro (cx, cy) no mundo e zoom; `corte` pula direto para a chave */
export type Chave = { t: number; z: number; cx: number; cy: number; corte?: boolean };
export const Camera: React.FC<{ chaves: Chave[]; tremores?: number[]; children: React.ReactNode; fundo?: string; forca?: number }> = ({ chaves, tremores = [], children, fundo = "#F6ECDA", forca = 16 }) => {
  const { t, f } = usePlano();
  let a = chaves[0], b = chaves[0];
  for (let i = 0; i < chaves.length; i++) if (t >= chaves[i].t) { a = chaves[i]; b = chaves[i + 1] ?? chaves[i]; }
  let k = 0;
  if (b !== a && !b.corte) k = interpolate(t, [a.t, b.t], [0, 1], { extrapolateRight: "clamp" });
  k = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
  const z = a.z + (b.z - a.z) * (b.corte ? 0 : k);
  const cx = a.cx + (b.cx - a.cx) * (b.corte ? 0 : k);
  const cy = a.cy + (b.cy - a.cy) * (b.corte ? 0 : k);
  let tx = 0, ty = 0;
  for (const tr of tremores) {
    const d = t - tr;
    if (d >= 0 && d < 0.3) {
      const amp = forca * (1 - d / 0.3);
      tx += (random(`tx-${f}-${tr}`) - 0.5) * 2 * amp;
      ty += (random(`ty-${f}-${tr}`) - 0.5) * 2 * amp;
    }
  }
  return (
    <AbsoluteFill style={{ background: fundo, overflow: "hidden" }}>
      <svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{ overflow: "visible" }}>
        <g transform={`translate(${960 - cx * z + tx} ${540 - cy * z + ty}) scale(${z})`}>{children}</g>
      </svg>
    </AbsoluteFill>
  );
};

/** traços de impacto em volta de um ponto (graus: 0 = direita, -90 = cima); d em quadros */
export const Impacto: React.FC<{ x: number; y: number; d: number; angulos?: number[]; raio?: number; esc?: number }> = ({ x, y, d, angulos = [-160, -120, -60, -20, 20, 160], raio = 30, esc = 1 }) => {
  if (d < 0 || d > 7) return null;
  const k = d / 7;
  return (
    <g>
      {angulos.map((a, i) => {
        const r1 = (raio + 40 * k) * esc;
        const r2 = r1 + (34 * (1 - k) + 8) * esc;
        const ar = (a * Math.PI) / 180;
        return <line key={i} x1={x + Math.cos(ar) * r1} y1={y + Math.sin(ar) * r1} x2={x + Math.cos(ar) * r2} y2={y + Math.sin(ar) * r2} stroke={LINHA} strokeWidth={(8 * (1 - k) + 3) * esc} strokeLinecap="round" />;
      })}
    </g>
  );
};

/** linhas de "susto"/movimento em volta de uma cabeça */
export const Tremidinhas: React.FC<{ x: number; y: number; t: number; r?: number }> = ({ x, y, t, r = 90 }) => (
  <g>
    {[-140, -90, -40].map((a, i) => {
      const ar = (a * Math.PI) / 180;
      const j = Math.sin(t * 40 + i) * 4;
      return <line key={i} x1={x + Math.cos(ar) * (r + j)} y1={y + Math.sin(ar) * (r + j)} x2={x + Math.cos(ar) * (r + 26 + j)} y2={y + Math.sin(ar) * (r + 26 + j)} stroke={LINHA} strokeWidth={6} strokeLinecap="round" />;
    })}
  </g>
);

/** cartela de tirinha: caixa amarela com texto grosso; entra com mola */
export const Cartela: React.FC<{ texto: string; x?: number; y?: number; tam?: number; desde?: number; cor?: string; gira?: number; children?: React.ReactNode }> = ({ texto, x = 960, y = 540, tam = 96, desde = 0, cor = "#FFD23F", gira = -2 }) => {
  const { t } = usePlano();
  if (t < desde) return null;
  const d = t - desde;
  const s = d < 0.18 ? 0.6 + 0.6 * (d / 0.18) : 1.2 - 0.2 * Math.min(1, (d - 0.18) / 0.12);
  const largura = texto.length * tam * 0.66 + 80;
  return (
    <g transform={`translate(${x} ${y}) rotate(${gira}) scale(${s})`}>
      <rect x={-largura / 2 + 12} y={-tam * 0.85 + 12} width={largura} height={tam * 1.7} rx={14} fill={LINHA} />
      <rect x={-largura / 2} y={-tam * 0.85} width={largura} height={tam * 1.7} rx={14} fill={cor} stroke={LINHA} strokeWidth={8} />
      <text x={0} y={tam * 0.34} textAnchor="middle" fontFamily={FONTE} fontWeight={900} fontSize={tam} fill={LINHA}>{texto}</text>
    </g>
  );
};

/** quadrinho (painel) com moldura grossa */
export const Painel: React.FC<{ x: number; y: number; w: number; h: number; desde?: number; fundo?: string; children: React.ReactNode }> = ({ x, y, w, h, desde = 0, fundo = "#FBFBF7", children }) => {
  const { t } = usePlano();
  if (t < desde) return null;
  const d = t - desde;
  const s = d < 0.2 ? 0.7 + 0.35 * (d / 0.2) : 1.05 - 0.05 * Math.min(1, (d - 0.2) / 0.12);
  return (
    <g transform={`translate(${x + w / 2} ${y + h / 2}) scale(${s}) translate(${-w / 2} ${-h / 2})`}>
      <rect x={14} y={14} width={w} height={h} rx={12} fill={LINHA} />
      <rect width={w} height={h} rx={12} fill={fundo} stroke={LINHA} strokeWidth={9} />
      <svg x={0} y={0} width={w} height={h} viewBox={`0 0 ${w} ${h}`}>{children}</svg>
    </g>
  );
};

/** medidor de dor 0 a 10 no traço de tirinha */
export const Medidor: React.FC<{ x: number; y: number; valor?: number; desde?: number; esc?: number }> = ({ x, y, valor = 0, desde = 0, esc = 1 }) => {
  const { t } = usePlano();
  if (t < desde) return null;
  const tremida = Math.sin(t * 50) * 1.5;
  const ang = -180 + (valor / 10) * 180 + tremida;
  return (
    <g transform={`translate(${x} ${y}) scale(${esc})`}>
      <rect x={-170} y={-150} width={340} height={200} rx={18} fill="#FBFBF7" stroke={LINHA} strokeWidth={8} />
      {Array.from({ length: 10 }, (_, i) => {
        const a1 = Math.PI + (i / 10) * Math.PI, a2 = Math.PI + ((i + 1) / 10) * Math.PI;
        const cor = ["#3FAF63", "#7CC24A", "#B7D43A", "#F2D33A", "#F2B33A", "#F2933A", "#F0703A", "#E8503A", "#D9363A", "#B91F2E"][i];
        const r1 = 70, r2 = 120;
        const d = `M ${Math.cos(a1) * r1} ${Math.sin(a1) * r1} L ${Math.cos(a1) * r2} ${Math.sin(a1) * r2} A ${r2} ${r2} 0 0 1 ${Math.cos(a2) * r2} ${Math.sin(a2) * r2} L ${Math.cos(a2) * r1} ${Math.sin(a2) * r1} A ${r1} ${r1} 0 0 0 ${Math.cos(a1) * r1} ${Math.sin(a1) * r1} Z`;
        return <path key={i} d={d} fill={cor} stroke={LINHA} strokeWidth={4} />;
      })}
      <g transform={`rotate(${ang + 180})`}>
        <line x1={0} y1={0} x2={-110} y2={0} stroke={LINHA} strokeWidth={10} strokeLinecap="round" />
      </g>
      <circle r={16} fill={LINHA} />
      <text x={-118} y={36} textAnchor="middle" fontFamily={FONTE} fontWeight={900} fontSize={30} fill={LINHA}>0</text>
      <text x={118} y={36} textAnchor="middle" fontFamily={FONTE} fontWeight={900} fontSize={30} fill={LINHA}>10</text>
    </g>
  );
};

/** escurece a cena para a noite (multiplica azul) */
export const Noite: React.FC<{ largura?: number; forca?: number }> = ({ largura = 4000, forca = 1 }) => (
  <rect x={-500} y={-500} width={largura + 1000} height={2200} fill="#3A4A9A" opacity={0.55 * forca} style={{ mixBlendMode: "multiply" }} />
);
