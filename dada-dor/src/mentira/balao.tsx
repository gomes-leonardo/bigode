// Balões de fala da mentira. Verdade: nasce da boca, flutua e some com um "pop".
// Mentira: fica cinza, pesa, cai com squash ("plóc") e fica no chão até a cena acabar.
// Os instantes vêm da linha do tempo (emite, fimFala, queda/sobe); a cena só diz de onde sai e onde é o chão.
import React from "react";
import { spring } from "remotion";
import { usePlano, type BalaoT } from "../teo/kit";
import { LINHA, mistura } from "../teo/tira";

type P = [number, number];
/** de onde o balão sai em um instante: boca (ou celular/TV), para que lado ele cresce e onde é o chão embaixo */
export type Emissor = { boca: P; lado?: 1 | -1; chao: number; esc?: number; xChao?: number; alto?: number };
export type Emissores = (b: BalaoT, t: number) => Emissor | null;

const BRANCO = "#FBFBF7";
const CINZA = "#A3A3AE";
const W0 = 170, H0 = 108;
const clamp = (x: number) => Math.min(1, Math.max(0, x));
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const hash = (n: number) => { const x = Math.sin(n * 127.1) * 43758.5453; return x - Math.floor(x); };

/** forma do balão (corpo + rabinho) centrada em (0,0); o rabinho aponta para `rabo` (coordenadas locais) */
const Forma: React.FC<{ w: number; h: number; rabo: P | null; fill: string; risco: string; linhas: number[] }> = ({ w, h, rabo, fill, risco, linhas }) => {
  const rx = Math.min(w, h) * 0.42;
  const corpo = <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={rx} fill={fill} stroke={LINHA} strokeWidth={7} />;
  let cauda = null;
  if (rabo) {
    const bx = Math.max(-w * 0.3, Math.min(w * 0.3, rabo[0] * 0.5));
    const base1: P = [bx - 16, h / 2 - 6], base2: P = [bx + 16, h / 2 - 6];
    cauda = (
      <g>
        <path d={`M ${base1[0]} ${base1[1]} L ${rabo[0]} ${rabo[1]} L ${base2[0]} ${base2[1]} Z`} fill={fill} stroke={LINHA} strokeWidth={7} strokeLinejoin="round" />
        <rect x={bx - 20} y={h / 2 - 16} width={40} height={14} fill={fill} />
      </g>
    );
  }
  return (
    <g>
      {cauda}
      {corpo}
      {linhas.map((l, i) => l > 0 && (
        <path key={i} d={`M ${-w * 0.34} ${-h * 0.2 + i * h * 0.2} q ${w * 0.08} -8 ${w * 0.16} 0 t ${w * 0.16} 0 t ${w * 0.16} 0 t ${w * 0.16} 0`} stroke={risco} strokeWidth={6} fill="none" strokeLinecap="round" strokeDasharray={`${l * w * 0.7 * [1, 0.78, 0.55][i]} 2000`} />
      ))}
    </g>
  );
};

/** um balão no seu instante */
export const Balao: React.FC<{ b: BalaoT; idx: number; emissor: Emissores; t: number; fps: number }> = ({ b, idx, emissor, t, fps }) => {
  if (t < b.emite) return null;
  const agora = emissor(b, Math.min(t, b.fimFala));
  if (!agora) return null;
  const e = (agora.esc ?? 1) * (b.tipo === "M" ? 2.0 : 1);
  const w = W0 * e, h = H0 * e;
  const lado = agora.lado ?? 1;
  const alto = agora.alto ?? 1;
  const cresce = spring({ frame: (t - b.emite) * fps, fps, config: { damping: 10, mass: 0.5, stiffness: 180 } });
  const fala = clamp((t - b.emite) / Math.max(0.3, b.fimFala - b.emite));
  const linhas = [0, 1, 2].map((i) => clamp(fala * 3 - i));
  const boca = agora.boca;
  let cx = boca[0] + lado * (w / 2 + 26 * (agora.esc ?? 1));
  let cy = boca[1] - (h / 2 + 70 * (agora.esc ?? 1)) * alto;
  let sx = 1, sy = 1, rot = Math.sin(t * 3 + idx) * 2, rabo: P | null = [boca[0] - cx, boca[1] - cy - 14];
  let fill = BRANCO, risco = LINHA, escala = Math.min(1, cresce) + Math.max(0, cresce - 1);
  let estouro = -1, impacto = -1;
  const mentira = b.tipo === "m" || b.tipo === "M";
  if (b.tipo === "v" && b.sobe !== undefined && t >= b.sobe) {
    const k = clamp((t - b.sobe) / 1.15);
    cy -= 300 * ease(k) * (agora.esc ?? 1);
    cx += lado * 26 * Math.sin(Math.PI * k);
    rabo = k < 0.3 ? [rabo![0] * (1 - k / 0.3), rabo![1] * (1 - k / 0.3)] : null;
    if (k > 0.85) escala *= 1 + 2.2 * (k - 0.85);
    if (k >= 1) { estouro = t - (b.sobe + 1.15); if (estouro > 0.22) return null; }
  }
  if (mentira && t >= b.fimFala) {
    const g = clamp((t - b.fimFala) / 0.3);
    fill = mistura(BRANCO, CINZA, g);
    risco = mistura(LINHA, "#6E6E7A", g);
    sy = 1 - 0.08 * g;
    cy += 10 * g;
    rot += Math.sin(t * 9 + idx) * 3 * g;
    const queda = b.queda ?? b.fimFala + 0.7;
    const f0 = Math.max(b.fimFala + 0.12, queda - 0.42);
    const tilt = (hash(idx + 1) - 0.5) * 30;
    const xc = agora.xChao ?? cx + lado * 18 + ((idx % 3) - 1) * 46 * (agora.esc ?? 1);
    const hRest = h * 0.66;
    const yc = agora.chao - hRest / 2;
    if (t >= f0 && t < queda) {
      const k = clamp((t - f0) / Math.max(0.05, queda - f0));
      cx = cx + (xc - cx) * k;
      cy = cy + (yc - cy) * k * k;
      rot = tilt * k;
      rabo = k < 0.4 ? [rabo![0] * (1 - k / 0.4), rabo![1] * (1 - k / 0.4)] : null;
      sy = 1 + 0.12 * k;
      sx = 1 - 0.06 * k;
    } else if (t >= queda) {
      const d = t - queda;
      const mola = Math.exp(-8 * d) * Math.cos(22 * d);
      sy = 0.66 - 0.16 * mola;
      sx = 1.12 + 0.18 * mola;
      cx = xc;
      cy = agora.chao - (h * sy) / 2;
      rot = tilt * 0.4;
      rabo = null;
      fill = CINZA;
      impacto = d;
    }
  }
  if (b.tipo === "?") cy += Math.sin(t * 2.5) * 6;
  return (
    <g>
      <g transform={`translate(${cx} ${cy}) rotate(${rot}) scale(${sx * escala} ${sy * escala})`}>
        <Forma w={w} h={h} rabo={rabo} fill={fill} risco={risco} linhas={linhas} />
      </g>
      {impacto >= 0 && impacto < 0.25 && (
        <g stroke={LINHA} strokeWidth={6} strokeLinecap="round">
          {[-1, 1].map((s) => [0, 1].map((j) => (
            <line key={`${s}-${j}`} x1={cx + s * (w * 0.55 + 10 + impacto * 120)} y1={agora.chao - 6 - j * 24} x2={cx + s * (w * 0.55 + 34 + impacto * 150)} y2={agora.chao - 14 - j * 34} />
          )))}
        </g>
      )}
      {estouro >= 0 && (
        <g stroke={LINHA} strokeWidth={6} strokeLinecap="round">
          {[0, 1, 2, 3, 4, 5].map((i) => {
            const a = (i / 6) * Math.PI * 2;
            const r1 = w * 0.3 + estouro * 300, r2 = r1 + 26;
            return <line key={i} x1={cx + Math.cos(a) * r1} y1={cy + Math.sin(a) * r1} x2={cx + Math.cos(a) * r2} y2={cy + Math.sin(a) * r2} />;
          })}
        </g>
      )}
    </g>
  );
};

/** todos os balões do plano */
export const Baloes: React.FC<{ emissor: Emissores; filtro?: (b: BalaoT) => boolean }> = ({ emissor, filtro }) => {
  const { t, fps, plano } = usePlano();
  const bs = (plano.baloes ?? []).filter((b) => (filtro ? filtro(b) : true));
  return <>{bs.map((b, i) => <Balao key={i} b={b} idx={i + (b.fala ?? 7) * 3} emissor={emissor} t={t} fps={fps} />)}</>;
};

/** balões cinzas que já estavam no chão (de planos anteriores da mesma cena) */
export type Caido = { x: number; chao: number; esc?: number; rot?: number; grande?: boolean };
export const NoChao: React.FC<{ itens: Caido[] }> = ({ itens }) => (
  <>
    {itens.map((c, i) => {
      const e = (c.esc ?? 1) * (c.grande ? 2 : 1);
      const w = W0 * e, h = H0 * e;
      const sy = 0.66, sx = 1.12;
      return (
        <g key={i} transform={`translate(${c.x} ${c.chao - (h * sy) / 2}) rotate(${c.rot ?? (hash(i + 3) - 0.5) * 12}) scale(${sx} ${sy})`}>
          <Forma w={w} h={h} rabo={null} fill={CINZA} risco="#6E6E7A" linhas={[1, 1, 1]} />
        </g>
      );
    })}
  </>
);

/** posições de repouso dos balões de mentira de um plano (para continuar no chão no plano seguinte) */
export const repouso = (bs: BalaoT[], emissor: Emissores): Caido[] =>
  bs.map((b, i) => ({ b, i })).filter(({ b }) => b.tipo === "m" || b.tipo === "M").map(({ b, i }) => {
    const em = emissor(b, b.fimFala)!;
    const e = em.esc ?? 1;
    const w = W0 * e * (b.tipo === "M" ? 2 : 1);
    const lado = em.lado ?? 1;
    const idx = i + (b.fala ?? 7) * 3;
    const cx = em.boca[0] + lado * (w / 2 + 26 * e);
    return { x: em.xChao ?? cx + lado * 18 + ((idx % 3) - 1) * 46 * e, chao: em.chao, esc: e, grande: b.tipo === "M", rot: (hash(idx + 1) - 0.5) * 30 * 0.4 };
  });
