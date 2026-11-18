import React, { createContext, useContext } from "react";
import { AbsoluteFill, Easing, Img, interpolate, random, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import type { ArcMood } from "../components/Arcs";
import { Puppet } from "../components/Puppet";
import { blend, transicao } from "../rig/actions";
import parts from "../rig/parts.json";
import type { Partes, Pose } from "../rig/types";
import { ACCENT, COR, FONTE, spring as molaTheme, type Accent } from "../theme";
import { ACOES2, SENTADAS, type NomeAcao } from "./acoes2";
import { ELENCO, type NomeElenco } from "./elenco";

// ---------------------------------------------------------------- plano atual (tempos das falas)
export type Fala = { voz: string; personagem: string | null; texto: string; inicio: number; duracao: number };
export type Plano = { id: string; cap: number; inicio: number; duracao: number; falas: Fala[]; sfx: { nome: string; em: number }[] };
export const PlanoCtx = createContext<Plano | null>(null);
export const usePlano = () => useContext(PlanoCtx)!;
/** início (s) da fala i do plano; fim=true dá o fim dela */
export const useFala = () => {
  const p = usePlano();
  return (i: number, fim = false) => (p.falas[i] ? p.falas[i].inicio + (fim ? p.falas[i].duracao : 0) : 0);
};
export const useT = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return f / fps;
};
export const rampa = (t: number, a: number, b: number, ease = Easing.inOut(Easing.cubic)) => interpolate(t, [a, b], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });
/** mola do theme a partir do instante a (s) */
export const useMola = (a: number, config = molaTheme) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: f - Math.round(a * fps), fps, config });
};

// ---------------------------------------------------------------- personagem
const PARTES = parts as unknown as Partes;
export const ESCALA_BASE = 0.62;
const PES = 325; // distância do pivô do tronco até a sola, em px do rig

export type Seg = { t: number; acao: NomeAcao; mood?: ArcMood; x?: number; ate?: number };
type PropsAtor = {
  quem: NomeElenco;
  x: number;
  chao: number;
  escala?: number;
  espelhar?: boolean;
  acoes: Seg[];
  mao?: React.ReactNode;
  maoL?: React.ReactNode;
  ajuste?: (pose: Pose, t: number) => Pose;
  semArcos?: boolean;
  blendQuadros?: number;
};

/** Personagem do rig encadeando ações; troca de ação = blend (nunca fade). */
export const Ator: React.FC<PropsAtor> = ({ quem, x, chao, escala = 1, espelhar = false, acoes, mao, maoL, ajuste, semArcos, blendQuadros = 8 }) => {
  const f = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const m = ELENCO[quem];
  const esc = ESCALA_BASE * escala * m.escala;
  const yEmPe = chao - PES * esc;
  // x de início de cada trecho (continua de onde o anterior parou)
  const xs: number[] = [];
  acoes.forEach((s, i) => {
    const anterior = acoes[i - 1];
    xs.push(s.x ?? (anterior ? anterior.ate ?? xs[i - 1] : x));
  });
  const fimDe = (i: number) => (acoes[i + 1] ? acoes[i + 1].t : durationInFrames / fps);
  const poseDe = (i: number) => {
    const s = acoes[i];
    const fl = f - Math.round(s.t * fps);
    const dur = fimDe(i) - s.t;
    const vel = s.ate !== undefined ? (s.ate - xs[i]) / Math.max(0.1, dur) : 0;
    const y = yEmPe + (SENTADAS.includes(s.acao) ? 95 * esc : 0);
    const pose = ACOES2[s.acao](Math.min(fl, Math.round(dur * fps)), fps, { x: xs[i], y, mood: s.mood, velocidade: vel });
    // walk/run: x avança na vida do trecho e para no alvo
    if (s.ate !== undefined && fl / fps > dur) pose.torso.x = s.ate;
    return pose;
  };
  let i = 0;
  while (i < acoes.length - 1 && f >= Math.round(acoes[i + 1].t * fps)) i++;
  let pose = poseDe(i);
  const fl = f - Math.round(acoes[i].t * fps);
  if (i > 0 && fl < blendQuadros) pose = blend(poseDe(i - 1), pose, transicao(fl, 0, blendQuadros));
  if (ajuste) pose = ajuste(pose, f / fps);
  return (
    <Puppet
      parts={PARTES}
      pose={pose}
      escala={esc}
      variante={m.variante}
      espelhar={espelhar}
      semArcos={semArcos ?? m.semArcos}
      extras={{ ...m.extras, maoR: mao ?? m.extras?.maoR, maoL: maoL ?? m.extras?.maoL }}
    />
  );
};

// ---------------------------------------------------------------- câmera
type PropsCamera = {
  children: React.ReactNode;
  de?: number;
  ate?: number;
  origem?: [number, number];
  pan?: [number, number]; // deslocamento x do início ao fim
  panY?: [number, number];
  tremores?: number[]; // instantes (s) com tremida curta
  cortes?: { t: number; zoom: number; origem: [number, number] }[]; // corte seco para outro enquadramento
};
export const Camera: React.FC<PropsCamera> = ({ children, de = 1, ate = 1.05, origem = [960, 540], pan = [0, 0], panY = [0, 0], tremores = [], cortes = [] }) => {
  const f = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const t = f / fps;
  const k = interpolate(f, [0, durationInFrames], [0, 1], { easing: Easing.inOut(Easing.sin) });
  let zoom = de + (ate - de) * k;
  let o = origem;
  const corte = [...cortes].reverse().find((c) => t >= c.t);
  if (corte) {
    zoom *= corte.zoom;
    o = corte.origem;
  }
  let tx = pan[0] + (pan[1] - pan[0]) * k;
  let ty = panY[0] + (panY[1] - panY[0]) * k;
  for (const tr of tremores) {
    const d = t - tr;
    if (d >= 0 && d < 0.35) {
      const a = 14 * (1 - d / 0.35);
      tx += (random(`tr-x-${f}`) - 0.5) * 2 * a;
      ty += (random(`tr-y-${f}`) - 0.5) * 2 * a;
    }
  }
  return <AbsoluteFill style={{ transformOrigin: `${o[0]}px ${o[1]}px`, transform: `translate(${tx}px, ${ty}px) scale(${zoom})` }}>{children}</AbsoluteFill>;
};

// ---------------------------------------------------------------- fundos
export type NomeFundo = "rua" | "rua2" | "cozinha" | "consultorio" | "quarto" | "posto" | "quintal" | "noite" | "laboratorio" | "hospital" | "escuro" | "entardecer";
const PNG: Partial<Record<NomeFundo, string>> = { rua: "assets/rua.png", rua2: "assets/rua2.png", cozinha: "assets/cozinha.png", entardecer: "assets/rua2.png" };

const Vetor: React.FC<{ nome: NomeFundo }> = ({ nome }) => {
  switch (nome) {
    case "consultorio":
      return (
        <svg width={1920} height={1080}>
          <rect width={1920} height={1080} fill="#2B3557" />
          <rect x={0} y={760} width={1920} height={320} fill="#222A47" />
          <rect x={1260} y={150} width={420} height={460} rx={18} fill="#3D4A78" />
          {[0, 1, 2, 3, 4].map((i) => <rect key={i} x={1310} y={200 + i * 76} width={300 - i * 40} height={22} rx={10} fill="#56649A" />)}
          <rect x={180} y={160} width={300} height={220} rx={14} fill="#3D4A78" />
          <rect x={210} y={190} width={240} height={160} rx={8} fill="#7BE0C4" opacity={0.25} />
          <rect x={0} y={0} width={1920} height={90} fill="#BFE9FF" opacity={0.08} />
        </svg>
      );
    case "quarto":
      return (
        <svg width={1920} height={1080}>
          <rect width={1920} height={1080} fill="#4C4A8C" />
          <rect x={0} y={780} width={1920} height={300} fill="#3A3570" />
          <rect x={1180} y={140} width={460} height={380} rx={14} fill="#FFD9A0" />
          <rect x={1200} y={160} width={420} height={340} fill="#FFE9C2" />
          <line x1={1410} y1={160} x2={1410} y2={500} stroke="#C9A877" strokeWidth={10} />
          <rect x={220} y={230} width={200} height={140} rx={10} fill="#6A64B0" />
          <circle cx={1520} cy={250} r={46} fill="#FFC94A" opacity={0.8} />
        </svg>
      );
    case "posto":
      return (
        <svg width={1920} height={1080}>
          <rect width={1920} height={1080} fill="#DCE8E6" />
          <rect x={0} y={780} width={1920} height={300} fill="#B7C9C6" />
          <rect x={0} y={360} width={1920} height={30} fill="#9FD6C6" />
          <rect x={160} y={140} width={240} height={240} rx={20} fill="#FFFFFF" />
          <path d="M 260 190 h 40 v 50 h 50 v 40 h -50 v 50 h -40 v -50 h -50 v -40 h 50 z" fill={COR.coral} />
          {[700, 980, 1260, 1540].map((x) => <rect key={x} x={x} y={180} width={180} height={300} rx={14} fill="#C8DCD9" />)}
        </svg>
      );
    case "quintal":
      return (
        <svg width={1920} height={1080}>
          <rect width={1920} height={1080} fill="#F6C98B" />
          <circle cx={1580} cy={180} r={90} fill="#FFE7A8" />
          {Array.from({ length: 16 }, (_, i) => <rect key={i} x={i * 124} y={430} width={110} height={330} rx={12} fill="#C98A55" />)}
          <rect x={0} y={760} width={1920} height={320} fill="#8DBA5A" />
          <path d="M 120 430 Q 260 260 420 430 Z" fill="#6E9E47" />
          <path d="M 1500 430 Q 1660 230 1820 430 Z" fill="#6E9E47" />
        </svg>
      );
    case "noite":
      return (
        <svg width={1920} height={1080}>
          <rect width={1920} height={1080} fill="#151236" />
          {Array.from({ length: 40 }, (_, i) => <circle key={i} cx={(i * 397) % 1920} cy={(i * 131) % 520} r={2 + (i % 3)} fill="#E8E4F5" opacity={0.6} />)}
          <circle cx={1500} cy={200} r={90} fill="#F4EBC4" />
          <circle cx={1530} cy={185} r={86} fill="#151236" opacity={0.25} />
          <rect x={0} y={780} width={1920} height={300} fill="#1E1A48" />
        </svg>
      );
    case "laboratorio":
      return (
        <svg width={1920} height={1080}>
          <rect width={1920} height={1080} fill="#1E1650" />
          {[160, 520, 880, 1240, 1600].map((x, i) => (
            <g key={x}>
              <rect x={x} y={300 + (i % 2) * 60} width={200} height={380} rx={18} fill="#2E2570" />
              <circle cx={x + 100} cy={280 + (i % 2) * 60} r={44} fill={COR.menta} opacity={0.35} />
            </g>
          ))}
          <rect width={1920} height={130} fill={COR.menta} opacity={0.12} />
          <rect y={780} width={1920} height={300} fill="#160F3E" />
        </svg>
      );
    case "hospital":
      return (
        <svg width={1920} height={1080}>
          <rect width={1920} height={1080} fill="#C9D6E8" />
          <rect x={0} y={760} width={1920} height={320} fill="#AFC0D8" />
          <rect x={1260} y={160} width={380} height={300} rx={14} fill="#E9F1FA" />
          <rect x={300} y={200} width={120} height={300} rx={10} fill="#9FB2CC" />
        </svg>
      );
    default:
      return <svg width={1920} height={1080}><rect width={1920} height={1080} fill={COR.fundo} /></svg>;
  }
};

export const Fundo: React.FC<{ nome: NomeFundo; blur?: number; escurece?: number; tinta?: string }> = ({ nome, blur = 6, escurece = 0.15, tinta }) => (
  <AbsoluteFill>
    <div style={{ position: "absolute", inset: -40, filter: `blur(${blur}px)` }}>
      {PNG[nome] ? <Img src={staticFile(PNG[nome]!)} style={{ width: 2000, height: 1160, objectFit: "cover" }} /> : <div style={{ position: "absolute", left: 40, top: 40 }}><Vetor nome={nome} /></div>}
    </div>
    {nome === "entardecer" && <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(255,120,60,0.25), rgba(80,30,90,0.35))" }} />}
    {tinta && <AbsoluteFill style={{ background: tinta }} />}
    <AbsoluteFill style={{ background: COR.fundo, opacity: escurece }} />
  </AbsoluteFill>
);

// ---------------------------------------------------------------- medidor de dor (texto em tela permitido)
export const Medidor: React.FC<{ valor?: number; pisca?: boolean; tremeAgulha?: boolean; x?: number; y?: number }> = ({ valor = 0, pisca = false, tremeAgulha = false, x = 1600, y = 70 }) => {
  const f = useCurrentFrame();
  const v = valor + (tremeAgulha ? Math.sin(f * 1.7) * 0.15 : 0);
  const ang = -90 + (Math.max(0, v) / 10) * 180;
  const aceso = !pisca || Math.floor(f / 8) % 2 === 0;
  return (
    <svg width={260} height={190} style={{ position: "absolute", left: x, top: y }}>
      <rect x={4} y={4} width={252} height={182} rx={22} fill="rgba(20,14,46,0.82)" stroke={COR.menta} strokeWidth={3} />
      <path d="M 40 140 A 90 90 0 0 1 220 140" stroke="#3B3270" strokeWidth={18} fill="none" strokeLinecap="round" />
      <path d="M 40 140 A 90 90 0 0 1 100 64" stroke={COR.menta} strokeWidth={18} fill="none" strokeLinecap="round" opacity={0.85} />
      <path d="M 160 64 A 90 90 0 0 1 220 140" stroke={COR.coral} strokeWidth={18} fill="none" strokeLinecap="round" opacity={0.85} />
      <g transform={`translate(130 140) rotate(${ang})`}>
        <line x1={0} y1={0} x2={0} y2={-80} stroke="#FFFFFF" strokeWidth={6} strokeLinecap="round" />
      </g>
      <circle cx={130} cy={140} r={10} fill="#FFFFFF" />
      <text x={130} y={176} textAnchor="middle" fontFamily={FONTE} fontWeight={900} fontSize={26} fill={aceso ? "#FFFFFF" : "#6B6690"} letterSpacing={4}>
        DOR {Math.round(Math.max(0, valor))}
      </text>
    </svg>
  );
};

// ---------------------------------------------------------------- cartela
export const Cartela: React.FC<{ texto: string; cor?: Accent; tamanho?: number; desde?: number; children?: React.ReactNode }> = ({ texto, cor = "mint", tamanho = 120, desde = 0, children }) => {
  const m = useMola(desde);
  return (
    <AbsoluteFill style={{ background: `linear-gradient(160deg, ${COR.fundo}, ${COR.fundo2})`, alignItems: "center", justifyContent: "center" }}>
      <div style={{ fontFamily: FONTE, fontWeight: 900, fontSize: tamanho, color: COR.texto, textTransform: "uppercase", textAlign: "center", maxWidth: 1500, lineHeight: 1.05, transform: `scale(${0.9 + 0.1 * m})`, opacity: m > 0.02 ? 1 : 0, textShadow: `0 6px 0 ${ACCENT[cor]}, 0 0 40px ${ACCENT[cor]}88` }}>
        {texto}
      </div>
      {children}
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- painel (a cabeça "abre" um quadro ao lado)
export const Painel: React.FC<{ x: number; y: number; w: number; h: number; desde: number; children: React.ReactNode }> = ({ x, y, w, h, desde, children }) => {
  const m = useMola(desde);
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, height: h, transformOrigin: "0% 100%", transform: `scale(${m})`, borderRadius: 28, overflow: "hidden", background: COR.fundo2, border: `6px solid ${COR.menta}`, boxShadow: `0 0 40px ${COR.menta}55` }}>
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>{children}</svg>
    </div>
  );
};

/** SVG de tela inteira para props desenhados */
export const Tela: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, overflow: "visible", ...style }}>{children}</svg>
);
