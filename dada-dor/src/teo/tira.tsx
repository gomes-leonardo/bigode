// Téo no traço de tirinha, todo em SVG. Esqueleto de cinemática direta sobre a mesma Pose do rig
// (ângulos em graus, positivo = para frente, membro 0 = pendurado), mais o ângulo dos pés.
// Origem local = centro do quadril; o personagem olha para a direita; espelhar só inverte o desenho.
import React, { useId } from "react";
import type { Pose } from "../rig/types";

export type PoseTeo = Pose & { pe_R: number; pe_L: number }; // pé: 0 = sola reta, positivo = ponta para cima
export type Lado = "R" | "L";
type P = [number, number];

// medidas em px na escala 1
export const G = {
  quadril: 4, // meia distância entre os quadris (vista quase de perfil)
  coxa: 88,
  canela: 88,
  sola: 10, // do tornozelo até a sola
  ponta: 46, // do tornozelo até a ponta do pé
  calcanhar: 14,
  ombro: [2, -128] as P,
  braco: 68,
  antebraco: 62,
  pescoco: [6, -150] as P,
  cabeca: 78,
};
export const PERNA = G.coxa + G.canela;
export const ALTURA_QUADRIL = PERNA + G.sola; // de pé, pernas retas, pé reto

const rad = (d: number) => (d * Math.PI) / 180;
const deg = (r: number) => (r * 180) / Math.PI;
const dir = (a: number): P => [Math.sin(rad(a)), Math.cos(rad(a))];
const soma = (a: P, b: P, k = 1): P => [a[0] + b[0] * k, a[1] + b[1] * k];

export const COR_TEO = {
  linha: "#151515",
  pele: "#C9895E",
  peleLonge: "#B07650",
  menta: "#86DDBE",
  branco: "#FBFBF7",
  short: "#3B6FD6",
  shortLonge: "#2F5DB8",
  chinelo: "#2E6B43",
  cabelo: "#151515",
};

/** pontos da perna em coordenadas locais (escala 1, olhando para a direita) */
export const perna = (pose: PoseTeo, lado: Lado) => {
  const sup = lado === "R" ? pose.leg_upper_R : pose.leg_upper_L;
  const inf = sup + (lado === "R" ? pose.leg_lower_R : pose.leg_lower_L);
  const p = lado === "R" ? pose.pe_R : pose.pe_L;
  const quadril: P = [lado === "R" ? G.quadril : -G.quadril, 0];
  const joelho = soma(quadril, dir(sup), G.coxa);
  const tornozelo = soma(joelho, dir(inf), G.canela);
  const frente: P = [Math.cos(rad(p)), -Math.sin(rad(p))];
  const baixo: P = [Math.sin(rad(p)), Math.cos(rad(p))];
  const sola = soma(tornozelo, baixo, G.sola);
  return {
    quadril,
    joelho,
    tornozelo,
    ponta: soma(sola, frente, G.ponta),
    bola: soma(sola, frente, 34),
    calcanhar: soma(sola, frente, -G.calcanhar),
    frente,
    baixo,
  };
};

/** local -> mundo */
export const mundo = (pose: PoseTeo, esc: number, espelhar: boolean, p: P): P => [pose.torso.x + (espelhar ? -1 : 1) * esc * p[0], pose.torso.y + esc * p[1]];
/** mundo -> local */
export const local = (pose: PoseTeo, esc: number, espelhar: boolean, p: P): P => [((p[0] - pose.torso.x) / esc) * (espelhar ? -1 : 1), (p[1] - pose.torso.y) / esc];

/** IK de duas barras: tornozelo no alvo (coordenadas locais), joelho dobrando para a frente */
export const ikPerna = (lado: Lado, alvo: P): { sup: number; inf: number } => {
  const q: P = [lado === "R" ? G.quadril : -G.quadril, 0];
  const v: P = [alvo[0] - q[0], alvo[1] - q[1]];
  const d = Math.min(Math.hypot(v[0], v[1]), PERNA - 0.01);
  const base = deg(Math.atan2(v[0], v[1]));
  const aQuadril = deg(Math.acos((G.coxa ** 2 + d ** 2 - G.canela ** 2) / (2 * G.coxa * d)));
  const aJoelho = deg(Math.acos((G.coxa ** 2 + G.canela ** 2 - d ** 2) / (2 * G.coxa * G.canela)));
  return { sup: base + aQuadril, inf: -(180 - aJoelho) };
};

// ------------------------------------------------------------------ desenho
const Traco: React.FC<{ pts: P[]; w: number; cor: string; contorno?: number }> = ({ pts, w, cor, contorno = 7 }) => {
  const d = pts.map((p, i) => `${i ? "L" : "M"} ${p[0].toFixed(2)} ${p[1].toFixed(2)}`).join(" ");
  return (
    <g>
      <path d={d} stroke={COR_TEO.linha} strokeWidth={w + contorno * 2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d={d} stroke={cor} strokeWidth={w} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  );
};

const Perna: React.FC<{ pose: PoseTeo; lado: Lado }> = ({ pose, lado }) => {
  const k = perna(pose, lado);
  const longe = lado === "L";
  const coxaShort = soma(k.quadril, [k.joelho[0] - k.quadril[0], k.joelho[1] - k.quadril[1]], 0.42);
  const { frente: f, baixo: b, tornozelo: t } = k;
  // pé: sola do calcanhar à ponta, peito do pé subindo até o tornozelo
  const pe: P[] = [
    soma(soma(t, f, -G.calcanhar + 4), b, G.sola - 2),
    soma(soma(t, f, G.ponta - 6), b, G.sola - 2),
    soma(soma(t, f, G.ponta - 4), b, -2),
    soma(t, f, 10),
    soma(t, f, -8),
  ];
  const solaChinelo: P[] = [soma(soma(t, f, -G.calcanhar - 2), b, G.sola), soma(soma(t, f, G.ponta + 2), b, G.sola)];
  return (
    <g>
      <Traco pts={[k.quadril, k.joelho, k.tornozelo]} w={26} cor={longe ? COR_TEO.peleLonge : COR_TEO.pele} />
      <polygon points={pe.map((p) => p.join(",")).join(" ")} fill={longe ? COR_TEO.peleLonge : COR_TEO.pele} stroke={COR_TEO.linha} strokeWidth={7} strokeLinejoin="round" />
      <Traco pts={solaChinelo} w={7} cor={COR_TEO.chinelo} contorno={4} />
      <Traco pts={[soma(t, f, 2), soma(soma(t, f, 22), b, 7)]} w={6} cor={COR_TEO.chinelo} contorno={3} />
      <Traco pts={[k.quadril, coxaShort]} w={40} cor={longe ? COR_TEO.shortLonge : COR_TEO.short} />
    </g>
  );
};

const Braco: React.FC<{ pose: PoseTeo; lado: Lado }> = ({ pose, lado }) => {
  const sup = lado === "R" ? pose.arm_upper_R : pose.arm_upper_L;
  const inf = sup + (lado === "R" ? pose.arm_lower_R : pose.arm_lower_L);
  const o = G.ombro;
  const cot = soma(o, dir(sup), G.braco);
  const mao = soma(cot, dir(inf), G.antebraco);
  const manga = soma(o, dir(sup), 32);
  const longe = lado === "L";
  return (
    <g>
      <Traco pts={[o, cot, mao]} w={20} cor={longe ? COR_TEO.peleLonge : COR_TEO.pele} />
      <circle cx={mao[0]} cy={mao[1]} r={14} fill={longe ? COR_TEO.peleLonge : COR_TEO.pele} stroke={COR_TEO.linha} strokeWidth={7} />
      <Traco pts={[o, manga]} w={36} cor={COR_TEO.menta} />
    </g>
  );
};

export type Expr = "neutro" | "sono" | "curioso";

const Cabeca: React.FC<{ expr: Expr; piscar: boolean }> = ({ expr, piscar }) => {
  const r = G.cabeca;
  // cabelo curto espetado: pontas em zigue-zague do alto da testa até a nuca
  const pontas: P[] = [];
  const n = 9;
  for (let i = 0; i <= n * 2; i++) {
    const a = rad(-28 - (172 * i) / (n * 2));
    const rr = i % 2 ? r + 30 - (i === 1 ? 10 : 0) : r + 4;
    const inclina = i % 2 ? rad(-7) : 0; // pontas penteadas para trás
    pontas.push([Math.cos(a + inclina) * rr, Math.sin(a + inclina) * rr]);
  }
  const cabelo: P[] = [...pontas, [Math.cos(rad(-200)) * r, Math.sin(rad(-200)) * r], [-40, 10], [-34, -34], [10, -50], [Math.cos(rad(-28)) * r * 0.86, Math.sin(rad(-28)) * r * 0.86]];
  const olho = (x: number, y: number) =>
    piscar ? (
      <path d={`M ${x - 9} ${y} Q ${x} ${y + 4} ${x + 9} ${y}`} stroke={COR_TEO.linha} strokeWidth={6} fill="none" strokeLinecap="round" />
    ) : expr === "sono" ? (
      <g>
        <circle cx={x} cy={y + 2} r={7} fill={COR_TEO.linha} />
        <rect x={x - 12} y={y - 12} width={24} height={12} fill={COR_TEO.pele} />
        <line x1={x - 10} y1={y} x2={x + 10} y2={y} stroke={COR_TEO.linha} strokeWidth={5} strokeLinecap="round" />
      </g>
    ) : (
      <circle cx={x} cy={y} r={7.5} fill={COR_TEO.linha} />
    );
  const sobe = expr === "curioso" ? -8 : 0;
  return (
    <g>
      <circle cx={-26} cy={8} r={16} fill={COR_TEO.pele} stroke={COR_TEO.linha} strokeWidth={7} />
      <circle cx={0} cy={0} r={r} fill={COR_TEO.pele} stroke={COR_TEO.linha} strokeWidth={7} />
      <polygon points={cabelo.map((p) => p.map((v) => v.toFixed(1)).join(",")).join(" ")} fill={COR_TEO.cabelo} stroke={COR_TEO.linha} strokeWidth={6} strokeLinejoin="round" />
      <path d="M -30 2 Q -24 12 -30 18" stroke={COR_TEO.linha} strokeWidth={4} fill="none" strokeLinecap="round" />
      {olho(26, -2)}
      {olho(56, -4)}
      <line x1={15} y1={-24} x2={36} y2={-24} stroke={COR_TEO.linha} strokeWidth={6} strokeLinecap="round" />
      <line x1={47} y1={-26 + sobe} x2={66} y2={-27 + sobe} stroke={COR_TEO.linha} strokeWidth={6} strokeLinecap="round" />
      <path d="M 72 6 Q 84 16 72 22" stroke={COR_TEO.linha} strokeWidth={5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {expr === "sono" ? (
        <ellipse cx={46} cy={42} rx={7} ry={9} fill={COR_TEO.linha} />
      ) : (
        <line x1={34} y1={42} x2={58} y2={41} stroke={COR_TEO.linha} strokeWidth={6} strokeLinecap="round" />
      )}
    </g>
  );
};

const Camisa: React.FC = () => {
  const id = useId().replace(/:/g, "");
  const forma = "M -34 -6 L -40 -118 Q -40 -156 2 -158 Q 42 -156 42 -118 L 36 -6 Q 2 2 -34 -6 Z";
  return (
    <g>
      <defs>
        <clipPath id={`camisa-${id}`}>
          <path d={forma} />
        </clipPath>
      </defs>
      <path d={forma} fill={COR_TEO.branco} />
      <g clipPath={`url(#camisa-${id})`}>
        {Array.from({ length: 7 }, (_, i) => (
          <rect key={i} x={-60} y={-150 + i * 24} width={120} height={12} fill={COR_TEO.menta} />
        ))}
      </g>
      <path d={forma} fill="none" stroke={COR_TEO.linha} strokeWidth={7} strokeLinejoin="round" />
    </g>
  );
};

export const TiraTeo: React.FC<{ pose: PoseTeo; esc?: number; espelhar?: boolean; expr?: Expr; piscar?: boolean }> = ({ pose, esc = 1, espelhar = false, expr = "neutro", piscar = false }) => {
  const { torso, head } = pose;
  const s = espelhar ? -1 : 1;
  const tronco = `rotate(${torso.rot}) scale(${torso.scaleX} ${torso.scaleY})`;
  const cab = `translate(${G.pescoco[0]} ${G.pescoco[1]}) rotate(${head.rot}) translate(${12 + (head.offsetX ?? 0)} ${-G.cabeca + 6 + head.offsetY})`;
  return (
    <g transform={`translate(${torso.x} ${torso.y}) scale(${s * esc} ${esc})`}>
      <g transform={tronco}>
        <Braco pose={pose} lado="L" />
      </g>
      <Perna pose={pose} lado="L" />
      <Perna pose={pose} lado="R" />
      <path d="M -36 -24 L 38 -24 L 40 14 L -38 14 Z" fill={COR_TEO.short} stroke={COR_TEO.linha} strokeWidth={7} strokeLinejoin="round" />
      <g transform={tronco}>
        <Traco pts={[[G.pescoco[0], -146], [G.pescoco[0] + 4, -172]]} w={30} cor={COR_TEO.pele} />
        <Camisa />
        <g transform={cab}>
          <Cabeca expr={expr} piscar={piscar} />
        </g>
        <Braco pose={pose} lado="R" />
      </g>
    </g>
  );
};
