// Bonecos no traço de tirinha, todos em SVG. Esqueleto de cinemática direta sobre a Pose do rig
// (graus, positivo = para frente, membro 0 = pendurado), mais pés, giro do corpo inteiro e lado.
// Origem local = centro do quadril; o boneco olha para a direita; `esq` só espelha o desenho.
import React, { useId } from "react";
import type { Pose } from "../rig/types";

export type Expr = "neutro" | "sono" | "curioso" | "rindo" | "triste" | "chorando" | "bravo" | "surpreso" | "preocupado" | "serio" | "fechado" | "grito" | "sorriso";
export type Obj = "celular" | "celularFilma" | "colher" | "prancheta" | "caneta" | "algodao" | "seringa" | "pimenta" | "copo" | "lanterna" | "pano" | "prato" | "pecinha" | "bola";
export type PoseTeo = Pose & {
  pe_R: number; // pé: 0 = sola reta, positivo = ponta para cima
  pe_L: number;
  giro?: number; // gira o corpo inteiro em volta do quadril (deitar, cair)
  esq?: boolean; // olha para a esquerda
  expr?: Expr;
  piscar?: boolean;
  objR?: Obj | null;
  objL?: Obj | null;
  palido?: number; // 0 a 1: a cor some do rosto
  lagrima?: number; // 0 a 1
  adesivo?: boolean; // estrela de corajoso no peito
  curativo?: boolean;
  roxo?: number; // 0 a 1, roxo na canela direita
  maoQueimada?: number;
  falando?: boolean; // boca aberta (alterna enquanto fala)
};
export type Lado = "R" | "L";
type P = [number, number];

export type Visual = {
  pele: string;
  cabelo: "espetado" | "bone" | "cacheado" | "coque" | "rabo" | "chanel" | "careca" | "curto" | "touca";
  corCabelo: string;
  camisa: string;
  listra?: string;
  baixo: "short" | "calca" | "saia";
  corBaixo: string;
  calcado: string;
  bone?: string;
  fone?: boolean;
  oculos?: boolean;
  bigode?: boolean;
  jaleco?: boolean;
  avental?: string;
  vestido?: string;
  luvas?: string;
  manga?: "curta" | "longa";
  cinza?: boolean; // figurante apagado
  cabeca?: number; // proporção da cabeça (adulto < 1)
  tronco?: number; // proporção do tronco (adulto > 1)
};

export const TEO: Visual = { pele: "#C9895E", cabelo: "espetado", corCabelo: "#151515", camisa: "#FBFBF7", listra: "#86DDBE", baixo: "short", corBaixo: "#3B6FD6", calcado: "#2E6B43" };

// medidas em px na escala 1
export const G = {
  quadril: 4,
  coxa: 88,
  canela: 88,
  sola: 10,
  ponta: 46,
  calcanhar: 14,
  ombro: [2, -128] as P,
  braco: 68,
  antebraco: 62,
  pescoco: [6, -150] as P,
  cabeca: 78,
};
export const PERNA = G.coxa + G.canela;
export const ALTURA_QUADRIL = PERNA + G.sola;
export const LINHA = "#151515";

const rad = (d: number) => (d * Math.PI) / 180;
const deg = (r: number) => (r * 180) / Math.PI;
const dir = (a: number): P => [Math.sin(rad(a)), Math.cos(rad(a))];
const soma = (a: P, b: P, k = 1): P => [a[0] + b[0] * k, a[1] + b[1] * k];
const rot = (p: P, a: number): P => [p[0] * Math.cos(rad(a)) - p[1] * Math.sin(rad(a)), p[0] * Math.sin(rad(a)) + p[1] * Math.cos(rad(a))];

export const escurece = (hex: string, k = 0.86) => {
  const n = parseInt(hex.slice(1), 16);
  const c = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => Math.round(v * k));
  return `#${c.map((v) => v.toString(16).padStart(2, "0")).join("")}`;
};
export const mistura = (a: string, b: string, k: number) => {
  const x = parseInt(a.slice(1), 16), y = parseInt(b.slice(1), 16);
  const c = [16, 8, 0].map((s) => Math.round(((x >> s) & 255) + ((((y >> s) & 255) - ((x >> s) & 255)) * Math.min(1, Math.max(0, k)))));
  return `#${c.map((v) => v.toString(16).padStart(2, "0")).join("")}`;
};
const CINZA = (hex: string) => {
  const n = parseInt(hex.slice(1), 16);
  const l = Math.round((((n >> 16) & 255) * 0.3 + ((n >> 8) & 255) * 0.59 + (n & 255) * 0.11) * 0.35 + 150);
  const h = l.toString(16).padStart(2, "0");
  return `#${h}${h}${h}`;
};

// ------------------------------------------------------------------ cinemática
export const tronco = (v?: Visual) => v?.tronco ?? 1;
export const ombro = (v?: Visual): P => [G.ombro[0], G.ombro[1] * tronco(v)];
export const pescoco = (v?: Visual): P => [G.pescoco[0], G.pescoco[1] * tronco(v)];

/** pontos da perna em coordenadas locais (olhando para a direita) */
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
  return { quadril, joelho, tornozelo, ponta: soma(sola, frente, G.ponta), bola: soma(sola, frente, 34), calcanhar: soma(sola, frente, -G.calcanhar), frente, baixo, canelaMeio: soma(joelho, dir(inf), G.canela * 0.5) };
};

/** pontos do braço em coordenadas do tronco (antes da rotação do tronco) */
export const braco = (pose: PoseTeo, lado: Lado, v?: Visual) => {
  const sup = lado === "R" ? pose.arm_upper_R : pose.arm_upper_L;
  const inf = sup + (lado === "R" ? pose.arm_lower_R : pose.arm_lower_L);
  const o = ombro(v);
  const cotovelo = soma(o, dir(sup), G.braco);
  const mao = soma(cotovelo, dir(inf), G.antebraco);
  return { ombro: o, cotovelo, mao, angMao: inf, bracoMeio: soma(o, dir(sup), G.braco * 0.55) };
};

/** coordenadas do tronco -> locais (aplica escala e rotação do tronco) */
export const doTronco = (pose: PoseTeo, p: P): P => rot([p[0] * pose.torso.scaleX, p[1] * pose.torso.scaleY], pose.torso.rot);
/** local -> mundo */
export const mundo = (pose: PoseTeo, esc: number, _espelhar: boolean | undefined, p: P): P => {
  const s = pose.esq ? -1 : 1;
  const q = rot([p[0] * s * esc, p[1] * esc], pose.giro ?? 0);
  return [pose.torso.x + q[0], pose.torso.y + q[1]];
};
/** mundo -> local */
export const local = (pose: PoseTeo, esc: number, _espelhar: boolean | undefined, p: P): P => {
  const q = rot([p[0] - pose.torso.x, p[1] - pose.torso.y], -(pose.giro ?? 0));
  return [(q[0] / esc) * (pose.esq ? -1 : 1), q[1] / esc];
};

/** centro da cabeça em coordenadas locais */
export const cabecaLocal = (pose: PoseTeo, v?: Visual): P => {
  const r = G.cabeca * (v?.cabeca ?? 1);
  const pc = pescoco(v);
  const c = soma(pc, rot([12 + (pose.head.offsetX ?? 0), -r + 6 + pose.head.offsetY], pose.head.rot));
  return doTronco(pose, c);
};

/** pontos úteis no mundo para encenar contatos */
export const pontos = (pose: PoseTeo, esc: number, v?: Visual) => {
  const m = (p: P) => mundo(pose, esc, false, p);
  const bR = braco(pose, "R", v), bL = braco(pose, "L", v);
  const pR = perna(pose, "R"), pL = perna(pose, "L");
  const cab = cabecaLocal(pose, v);
  const r = G.cabeca * (v?.cabeca ?? 1);
  return {
    cabeca: m(cab),
    rosto: m(soma(cab, rot([r * 0.55, 6], pose.head.rot + pose.torso.rot))),
    boca: m(soma(cab, rot([r * 0.55, r * 0.5], pose.head.rot + pose.torso.rot))),
    testa: m(soma(cab, rot([r * 0.7, -r * 0.35], pose.head.rot + pose.torso.rot))),
    maoR: m(doTronco(pose, bR.mao)),
    maoL: m(doTronco(pose, bL.mao)),
    bracoR: m(doTronco(pose, bR.bracoMeio)),
    bracoL: m(doTronco(pose, bL.bracoMeio)),
    peito: m(doTronco(pose, [16, -100 * tronco(v)])),
    ombro: m(doTronco(pose, ombro(v))),
    pontaR: m(pR.ponta), pontaL: m(pL.ponta),
    bolaR: m(pR.bola), bolaL: m(pL.bola),
    tornozeloR: m(pR.tornozelo), tornozeloL: m(pL.tornozelo),
    joelhoR: m(pR.joelho), joelhoL: m(pL.joelho),
    canelaR: m(pR.canelaMeio), canelaL: m(pL.canelaMeio),
    calcanharR: m(pR.calcanhar),
  };
};

/** IK de duas barras da perna: tornozelo no alvo (coordenadas locais), joelho para a frente */
export const ikPerna = (lado: Lado, alvo: P): { sup: number; inf: number } => {
  const q: P = [lado === "R" ? G.quadril : -G.quadril, 0];
  return ik2(q, alvo, G.coxa, G.canela, true);
};
const ik2 = (base: P, alvo: P, a: number, b: number, frente: boolean) => {
  const v: P = [alvo[0] - base[0], alvo[1] - base[1]];
  const d = Math.max(Math.abs(a - b) + 0.01, Math.min(Math.hypot(v[0], v[1]), a + b - 0.01));
  const ang = deg(Math.atan2(v[0], v[1]));
  const aBase = deg(Math.acos((a * a + d * d - b * b) / (2 * a * d)));
  const aMeio = deg(Math.acos((a * a + b * b - d * d) / (2 * a * b)));
  return frente ? { sup: ang + aBase, inf: -(180 - aMeio) } : { sup: ang - aBase, inf: 180 - aMeio };
};
/** IK do braço: mão num ponto do mundo, cotovelo dobrando para baixo/trás */
export const ikBraco = (pose: PoseTeo, lado: Lado, alvoMundo: P, esc: number, v?: Visual): { sup: number; inf: number } => {
  const l = local(pose, esc, false, alvoMundo);
  const t = rot(l, -pose.torso.rot);
  const tt: P = [t[0] / pose.torso.scaleX, t[1] / pose.torso.scaleY];
  return ik2(ombro(v), tt, G.braco, G.antebraco, false);
};

// ------------------------------------------------------------------ desenho
const Traco: React.FC<{ pts: P[]; w: number; cor: string; contorno?: number }> = ({ pts, w, cor, contorno = 7 }) => {
  const d = pts.map((p, i) => `${i ? "L" : "M"} ${p[0].toFixed(2)} ${p[1].toFixed(2)}`).join(" ");
  return (
    <g>
      <path d={d} stroke={LINHA} strokeWidth={w + contorno * 2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d={d} stroke={cor} strokeWidth={w} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  );
};

type Cores = { pele: string; peleL: string; camisa: string; listra?: string; baixo: string; baixoL: string; calcado: string; cabelo: string };

const Perna: React.FC<{ pose: PoseTeo; lado: Lado; v: Visual; c: Cores }> = ({ pose, lado, v, c }) => {
  const k = perna(pose, lado);
  const longe = lado === "L";
  const pele = longe ? c.peleL : c.pele;
  const { frente: f, baixo: b, tornozelo: t } = k;
  const pe: P[] = [soma(soma(t, f, -G.calcanhar + 4), b, G.sola - 2), soma(soma(t, f, G.ponta - 6), b, G.sola - 2), soma(soma(t, f, G.ponta - 4), b, -2), soma(t, f, 10), soma(t, f, -8)];
  const sola: P[] = [soma(soma(t, f, -G.calcanhar - 2), b, G.sola), soma(soma(t, f, G.ponta + 2), b, G.sola)];
  const fimShort = v.baixo === "calca" ? k.tornozelo : soma(k.quadril, [k.joelho[0] - k.quadril[0], k.joelho[1] - k.quadril[1]], v.baixo === "saia" ? 0.55 : 0.42);
  const pts = v.baixo === "calca" ? [k.quadril, k.joelho, soma(k.tornozelo, [k.joelho[0] - k.tornozelo[0], k.joelho[1] - k.tornozelo[1]], 0.12)] : [k.quadril, fimShort];
  const roxo = lado === "R" ? pose.roxo ?? 0 : 0;
  return (
    <g>
      <Traco pts={[k.quadril, k.joelho, k.tornozelo]} w={26} cor={pele} />
      {roxo > 0 && <ellipse cx={k.canelaMeio[0]} cy={k.canelaMeio[1]} rx={11 * roxo} ry={34 * roxo} transform={`rotate(${-(lado === "R" ? pose.leg_upper_R + pose.leg_lower_R : 0)} ${k.canelaMeio[0]} ${k.canelaMeio[1]})`} fill="#6E4AA8" opacity={0.85} />}
      <polygon points={pe.map((p) => p.join(",")).join(" ")} fill={c.calcado === c.pele ? pele : pele} stroke={LINHA} strokeWidth={7} strokeLinejoin="round" />
      <Traco pts={sola} w={7} cor={c.calcado} contorno={4} />
      <Traco pts={[soma(t, f, 2), soma(soma(t, f, 22), b, 7)]} w={6} cor={c.calcado} contorno={3} />
      {v.baixo !== "saia" && !v.vestido && <Traco pts={pts} w={v.baixo === "calca" ? 30 : 40} cor={longe ? c.baixoL : c.baixo} />}
    </g>
  );
};

const Braco: React.FC<{ pose: PoseTeo; lado: Lado; v: Visual; c: Cores }> = ({ pose, lado, v, c }) => {
  const b = braco(pose, lado, v);
  const longe = lado === "L";
  const pele = longe ? c.peleL : c.pele;
  const queimada = lado === "R" ? pose.maoQueimada ?? 0 : 0;
  const longa = v.manga === "longa" || v.jaleco;
  const manga = longa ? [b.ombro, b.cotovelo, soma(b.cotovelo, [b.mao[0] - b.cotovelo[0], b.mao[1] - b.cotovelo[1]], 0.7)] : [b.ombro, soma(b.ombro, [b.cotovelo[0] - b.ombro[0], b.cotovelo[1] - b.ombro[1]], 0.47)];
  const corManga = v.jaleco ? "#F4F6F8" : v.vestido ?? (v.listra ?? c.camisa);
  const obj = lado === "R" ? pose.objR : pose.objL;
  return (
    <g>
      <Traco pts={[b.ombro, b.cotovelo, b.mao]} w={20} cor={pele} />
      <circle cx={b.mao[0]} cy={b.mao[1]} r={14} fill={v.luvas ?? mistura(pele, "#E0503C", queimada * 0.7)} stroke={LINHA} strokeWidth={7} />
      <Traco pts={manga as P[]} w={longa ? 30 : 36} cor={longe ? escurece(corManga, 0.92) : corManga} />
      {obj && <Objeto obj={obj} x={b.mao[0]} y={b.mao[1]} ang={b.angMao} esq={!!pose.esq} />}
    </g>
  );
};

/** objetos de mão: desenhados com a pegada em (0,0) */
export const Objeto: React.FC<{ obj: Obj; x: number; y: number; ang: number; esq?: boolean }> = ({ obj, x, y, ang }) => {
  const aoBraco = `translate(${x} ${y}) rotate(${-ang})`;
  const reto = `translate(${x} ${y})`;
  switch (obj) {
    case "celular":
      return <g transform={reto}><rect x={-4} y={-58} width={40} height={70} rx={8} fill="#2A2A35" stroke={LINHA} strokeWidth={6} /><rect x={3} y={-50} width={26} height={46} rx={3} fill="#9ED8F5" /></g>;
    case "celularFilma":
      return <g transform={reto}><rect x={-8} y={-62} width={44} height={74} rx={8} fill="#2A2A35" stroke={LINHA} strokeWidth={6} /><circle cx={14} cy={-46} r={6} fill="#E23B2E" /></g>;
    case "colher":
      return <g transform={aoBraco}><rect x={-6} y={-6} width={12} height={92} rx={6} fill="#B07A4A" stroke={LINHA} strokeWidth={5} /><ellipse cx={0} cy={104} rx={18} ry={26} fill="#C68A55" stroke={LINHA} strokeWidth={5} /></g>;
    case "prancheta":
      return <g transform={reto}><rect x={-10} y={-80} width={70} height={92} rx={6} fill="#C98450" stroke={LINHA} strokeWidth={6} /><rect x={-2} y={-68} width={54} height={72} fill="#FBFBF7" /><rect x={12} y={-88} width={26} height={14} rx={4} fill="#9AA0A8" stroke={LINHA} strokeWidth={4} />{[0, 1, 2].map((i) => <line key={i} x1={4} y1={-52 + i * 16} x2={44} y2={-52 + i * 16} stroke="#9AA0A8" strokeWidth={4} />)}</g>;
    case "caneta":
      return <g transform={aoBraco}><rect x={-5} y={-10} width={10} height={58} rx={4} fill="#3B6FD6" stroke={LINHA} strokeWidth={4} /><path d="M -5 48 L 0 60 L 5 48 Z" fill={LINHA} /></g>;
    case "algodao":
      return <g transform={aoBraco}><circle cx={0} cy={16} r={13} fill="#FBFBF7" stroke={LINHA} strokeWidth={5} /><circle cx={9} cy={22} r={9} fill="#FBFBF7" stroke={LINHA} strokeWidth={4} /></g>;
    case "seringa":
      return <g transform={aoBraco}><rect x={-9} y={-6} width={18} height={56} rx={4} fill="#E8F2FA" stroke={LINHA} strokeWidth={5} /><rect x={-6} y={24} width={12} height={22} fill="#86DDBE" /><line x1={0} y1={50} x2={0} y2={80} stroke={LINHA} strokeWidth={4} /><rect x={-14} y={-14} width={28} height={8} rx={3} fill="#9AA0A8" stroke={LINHA} strokeWidth={4} /></g>;
    case "pimenta":
      return <g transform={aoBraco}><path d="M -4 6 Q 22 28 6 64 Q -2 70 -9 60 Q -12 30 -4 6 Z" fill="#E23B2E" stroke={LINHA} strokeWidth={5} /><rect x={-7} y={-6} width={10} height={14} rx={3} fill="#3FAF63" stroke={LINHA} strokeWidth={4} /></g>;
    case "copo":
      return <g transform={reto}><path d="M -6 -58 L 40 -58 L 34 12 L 0 12 Z" fill="#FBFBF7" stroke={LINHA} strokeWidth={6} strokeLinejoin="round" /></g>;
    case "lanterna":
      return <g transform={aoBraco}><rect x={-10} y={-8} width={20} height={44} rx={5} fill="#F2C94C" stroke={LINHA} strokeWidth={5} /><rect x={-14} y={34} width={28} height={14} rx={4} fill="#9AA0A8" stroke={LINHA} strokeWidth={5} /></g>;
    case "pano":
      return <g transform={reto}><path d="M -26 -10 L 30 -16 L 34 34 L -20 40 Z" fill="#F07C6A" stroke={LINHA} strokeWidth={5} strokeLinejoin="round" /><line x1={-20} y1={10} x2={30} y2={6} stroke="#FBFBF7" strokeWidth={5} /></g>;
    case "prato":
      return <g transform={reto}><ellipse cx={20} cy={-6} rx={44} ry={12} fill="#FBFBF7" stroke={LINHA} strokeWidth={6} /></g>;
    case "pecinha":
      return <g transform={reto}><rect x={-4} y={-30} width={44} height={18} rx={3} fill="#E23B2E" stroke={LINHA} strokeWidth={5} /></g>;
    case "bola":
      return <Bola x={x + 10} y={y - 40} r={34} giro={0} />;
  }
  return null;
};

export const Bola: React.FC<{ x: number; y: number; r?: number; giro?: number }> = ({ x, y, r = 34, giro = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${giro})`}>
    <circle r={r} fill="#FBFBF7" stroke={LINHA} strokeWidth={6} />
    <polygon points={[0, 1, 2, 3, 4].map((i) => `${Math.cos(rad(-90 + i * 72)) * r * 0.36},${Math.sin(rad(-90 + i * 72)) * r * 0.36}`).join(" ")} fill={LINHA} />
    {[0, 1, 2, 3, 4].map((i) => <line key={i} x1={Math.cos(rad(-90 + i * 72)) * r * 0.36} y1={Math.sin(rad(-90 + i * 72)) * r * 0.36} x2={Math.cos(rad(-90 + i * 72)) * r} y2={Math.sin(rad(-90 + i * 72)) * r} stroke={LINHA} strokeWidth={4} />)}
  </g>
);

const Cabelo: React.FC<{ v: Visual; r: number; cor: string; frente: boolean }> = ({ v, r, cor, frente }) => {
  const ponto = (a: number, rr: number): P => [Math.cos(rad(a)) * rr, Math.sin(rad(a)) * rr];
  const poly = (pts: P[]) => <polygon points={pts.map((p) => p.map((n) => n.toFixed(1)).join(",")).join(" ")} fill={cor} stroke={LINHA} strokeWidth={6} strokeLinejoin="round" />;
  if (v.cabelo === "espetado") {
    if (frente) return null;
    const pts: P[] = [];
    const n = 9;
    for (let i = 0; i <= n * 2; i++) {
      const a = -28 - (172 * i) / (n * 2);
      pts.push(ponto(a + (i % 2 ? -7 : 0), i % 2 ? r + 30 - (i === 1 ? 10 : 0) : r + 4));
    }
    return poly([...pts, ponto(-200, r), [-40, 10], [-34, -34], [10, -50], ponto(-28, r * 0.86)]);
  }
  if (frente) {
    if (v.cabelo === "bone") {
      const b = v.bone ?? "#E23B2E";
      return <g><path d={`M ${-r * 0.95} ${-r * 0.22} Q ${-r * 0.9} ${-r * 1.12} ${r * 0.1} ${-r * 1.1} Q ${r * 0.95} ${-r * 1.0} ${r * 0.95} ${-r * 0.3} Z`} fill={b} stroke={LINHA} strokeWidth={6} strokeLinejoin="round" /><path d={`M ${r * 0.7} ${-r * 0.36} Q ${r * 1.4} ${-r * 0.42} ${r * 1.55} ${-r * 0.2} Q ${r * 1.1} ${-r * 0.12} ${r * 0.7} ${-r * 0.22} Z`} fill={b} stroke={LINHA} strokeWidth={6} strokeLinejoin="round" /><circle cx={-r * 0.1} cy={-r * 1.1} r={7} fill={b} stroke={LINHA} strokeWidth={4} /></g>;
    }
    if (v.cabelo === "touca") return <path d={`M ${-r * 0.98} ${-r * 0.15} Q ${-r} ${-r * 1.15} ${r * 0.1} ${-r * 1.12} Q ${r} ${-r * 1.05} ${r * 0.98} ${-r * 0.25} Q 0 ${-r * 0.5} ${-r * 0.98} ${-r * 0.15} Z`} fill="#F4F6F8" stroke={LINHA} strokeWidth={6} strokeLinejoin="round" />;
    const capa = (desce: number) => poly([ponto(-205, r * desce), ponto(-170, r * 1.1), ponto(-130, r * 1.13), ponto(-90, r * 1.13), ponto(-50, r * 1.1), ponto(-22, r * 1.0), [r * 0.62, -r * 0.5], [r * 0.25, -r * 0.62], [-r * 0.2, -r * 0.5], [-r * 0.5, -r * 0.1], [-r * 0.62, r * 0.3]]);
    if (v.cabelo === "curto" || v.cabelo === "coque" || v.cabelo === "rabo") return capa(1.02);
    if (v.cabelo === "chanel") return capa(1.08);
    if (v.cabelo === "cacheado") return <g>{[-200, -165, -130, -95, -62].map((a, i) => { const p = ponto(a, r * 0.95); return <circle key={i} cx={p[0]} cy={p[1]} r={r * 0.32} fill={cor} stroke={LINHA} strokeWidth={6} />; })}</g>;
    if (v.cabelo === "careca") return <path d={`M ${-r * 0.98} ${-r * 0.05} Q ${-r * 1.08} ${-r * 0.5} ${-r * 0.7} ${-r * 0.55} L ${-r * 0.55} ${r * 0.1} Z`} fill={cor} stroke={LINHA} strokeWidth={5} strokeLinejoin="round" />;
    return null;
  }
  switch (v.cabelo) {
    case "cacheado":
      return <g>{[-200, -170, -140, -110, -80, -50, -25].map((a, i) => { const p = ponto(a, r * 0.92); return <circle key={i} cx={p[0]} cy={p[1]} r={r * 0.34} fill={cor} stroke={LINHA} strokeWidth={6} />; })}</g>;
    case "curto":
      return null;
    case "coque":
      return <circle cx={-r * 0.55} cy={-r * 1.0} r={r * 0.36} fill={cor} stroke={LINHA} strokeWidth={6} />;
    case "rabo":
      return <path d={`M ${-r * 0.8} ${-r * 0.4} Q ${-r * 1.8} ${-r * 0.1} ${-r * 1.4} ${r * 1.0} Q ${-r * 1.2} ${r * 0.3} ${-r * 0.7} ${r * 0.1} Z`} fill={cor} stroke={LINHA} strokeWidth={6} strokeLinejoin="round" />;
    case "chanel":
      return poly([ponto(-240, r * 1.08), ponto(-170, r * 1.14), ponto(-110, r * 1.16), ponto(-60, r * 1.12), [-r * 0.2, r * 0.1], [-r * 0.5, r * 0.62], [-r * 1.0, r * 0.62]]);
    case "careca":
      return null;
    case "bone":
      return poly([ponto(-200, r * 1.0), ponto(-150, r * 1.06), [-r * 0.5, -r * 0.2], [-r * 0.55, r * 0.2]]);
    case "touca":
      return null;
  }
  return null;
};

const Rosto: React.FC<{ expr: Expr; piscar: boolean; r: number; v: Visual; c: Cores; lagrima: number; falando: boolean }> = ({ expr, piscar, r, v, c, lagrima, falando }) => {
  const k = r / 78;
  const olhoFechado = piscar || expr === "fechado" || expr === "rindo";
  const olho = (x: number, y: number) =>
    olhoFechado ? (
      <path d={expr === "rindo" ? `M ${x - 9} ${y + 3} Q ${x} ${y - 8} ${x + 9} ${y + 3}` : `M ${x - 9} ${y} Q ${x} ${y + 4} ${x + 9} ${y}`} stroke={LINHA} strokeWidth={6} fill="none" strokeLinecap="round" />
    ) : expr === "sono" ? (
      <g><circle cx={x} cy={y + 2} r={7} fill={LINHA} /><rect x={x - 12} y={y - 12} width={24} height={12} fill={c.pele} /><line x1={x - 10} y1={y} x2={x + 10} y2={y} stroke={LINHA} strokeWidth={5} strokeLinecap="round" /></g>
    ) : expr === "surpreso" || expr === "grito" ? (
      <g><circle cx={x} cy={y} r={11} fill="#FBFBF7" stroke={LINHA} strokeWidth={4} /><circle cx={x + 2} cy={y} r={5} fill={LINHA} /></g>
    ) : (
      <circle cx={x} cy={y} r={7.5} fill={LINHA} />
    );
  // sobrancelhas: [y esquerda-dentro, y direita-dentro] e inclinação
  const sob = {
    neutro: [0, 0, 0], sono: [2, 2, 0], curioso: [0, -8, 0], rindo: [-4, -4, 0], triste: [0, 0, -7], chorando: [0, 0, -9], bravo: [0, 0, 8], surpreso: [-10, -10, 0],
    preocupado: [-2, -2, -7], serio: [3, 3, 3], fechado: [2, 2, 0], grito: [-8, -8, -6], sorriso: [-2, -2, 0],
  }[expr];
  const brow = (x1: number, x2: number, y: number, dentroEhX2: boolean) => {
    const yi = y + sob[2] * (dentroEhX2 ? 1 : -1) * 0.5;
    const yo = y - sob[2] * (dentroEhX2 ? 1 : -1) * 0.5;
    return <line x1={x1} y1={dentroEhX2 ? yo : yi} x2={x2} y2={dentroEhX2 ? yi : yo} stroke={LINHA} strokeWidth={6} strokeLinecap="round" />;
  };
  const boca = (() => {
    if (falando && !["rindo", "chorando", "grito", "sono"].includes(expr)) return <ellipse cx={46} cy={42} rx={10} ry={8} fill="#8A2B2B" stroke={LINHA} strokeWidth={5} />;
    switch (expr) {
      case "sono": return <ellipse cx={46} cy={42} rx={7} ry={9} fill={LINHA} />;
      case "rindo": return <path d="M 26 32 Q 46 66 66 32 Z" fill="#8A2B2B" stroke={LINHA} strokeWidth={5} strokeLinejoin="round" />;
      case "sorriso": return <path d="M 30 38 Q 46 50 62 38" stroke={LINHA} strokeWidth={6} fill="none" strokeLinecap="round" />;
      case "triste": case "preocupado": return <path d="M 32 46 Q 46 36 60 46" stroke={LINHA} strokeWidth={6} fill="none" strokeLinecap="round" />;
      case "chorando": return <path d="M 30 50 Q 46 30 62 50 Z" fill="#8A2B2B" stroke={LINHA} strokeWidth={5} strokeLinejoin="round" />;
      case "bravo": return <line x1={34} y1={44} x2={58} y2={42} stroke={LINHA} strokeWidth={7} strokeLinecap="round" />;
      case "surpreso": return <ellipse cx={46} cy={44} rx={9} ry={12} fill="#8A2B2B" stroke={LINHA} strokeWidth={5} />;
      case "grito": return <ellipse cx={46} cy={46} rx={14} ry={18} fill="#8A2B2B" stroke={LINHA} strokeWidth={5} />;
      default: return <line x1={34} y1={42} x2={58} y2={41} stroke={LINHA} strokeWidth={6} strokeLinecap="round" />;
    }
  })();
  return (
    <g transform={`scale(${k})`}>
      {olho(26, -2)}
      {olho(56, -4)}
      {brow(15, 36, -24 + sob[0], true)}
      {brow(47, 66, -26 + sob[1], false)}
      <path d="M 72 6 Q 84 16 72 22" stroke={LINHA} strokeWidth={5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {boca}
      {v.bigode && <path d="M 30 30 Q 46 22 64 30 Q 56 38 46 32 Q 36 38 30 30 Z" fill={c.cabelo} stroke={LINHA} strokeWidth={4} />}
      {v.oculos && (
        <g stroke={LINHA} strokeWidth={5} fill="rgba(255,255,255,0.25)">
          <circle cx={26} cy={-2} r={15} />
          <circle cx={58} cy={-4} r={15} />
          <line x1={41} y1={-3} x2={43} y2={-3} />
          <line x1={11} y1={-2} x2={-20} y2={-6} />
        </g>
      )}
      {lagrima > 0 && <path d={`M 50 ${8 + 30 * lagrima} q -7 12 0 16 q 7 -4 0 -16 Z`} fill="#7FC8F8" stroke={LINHA} strokeWidth={3} />}
    </g>
  );
};

const Cabeca: React.FC<{ pose: PoseTeo; v: Visual; c: Cores }> = ({ pose, v, c }) => {
  const r = G.cabeca * (v.cabeca ?? 1);
  const pele = mistura(c.pele, "#F2F0EC", (pose.palido ?? 0) * 0.85);
  const cc = { ...c, pele };
  return (
    <g>
      <Cabelo v={v} r={r} cor={c.cabelo} frente={false} />
      <circle cx={-r / 3} cy={8} r={16 * (r / 78)} fill={pele} stroke={LINHA} strokeWidth={7} />
      <circle cx={0} cy={0} r={r} fill={pele} stroke={LINHA} strokeWidth={7} />
      {v.cabelo === "espetado" && <Cabelo v={v} r={r} cor={c.cabelo} frente={false} />}
      <Cabelo v={v} r={r} cor={c.cabelo} frente />
      <path d={`M ${-r * 0.38} 2 Q ${-r * 0.3} 12 ${-r * 0.38} 18`} stroke={LINHA} strokeWidth={4} fill="none" strokeLinecap="round" />
      <Rosto expr={pose.expr ?? "neutro"} piscar={!!pose.piscar} r={r} v={v} c={cc} lagrima={pose.lagrima ?? 0} falando={!!pose.falando} />
    </g>
  );
};

const Camisa: React.FC<{ v: Visual; c: Cores; pose: PoseTeo }> = ({ v, c, pose }) => {
  const id = useId().replace(/:/g, "");
  const tr = tronco(v);
  const y = (n: number) => (n * tr).toFixed(1);
  const forma = `M -34 -6 L -40 ${y(-118)} Q -40 ${y(-156)} 2 ${y(-158)} Q 42 ${y(-156)} 42 ${y(-118)} L 36 -6 Q 2 2 -34 -6 Z`;
  const cor = v.vestido ?? c.camisa;
  return (
    <g>
      <defs>
        <clipPath id={`camisa-${id}`}>
          <path d={forma} />
        </clipPath>
      </defs>
      <path d={forma} fill={cor} />
      {c.listra && !v.vestido && (
        <g clipPath={`url(#camisa-${id})`}>
          {Array.from({ length: Math.ceil(7 * tr) + 1 }, (_, i) => <rect key={i} x={-60} y={-160 * tr + 10 + i * 24} width={120} height={12} fill={c.listra} />)}
        </g>
      )}
      {v.avental && <path d={`M -26 ${y(-110)} L 30 ${y(-110)} L 34 26 L -30 26 Z`} fill={v.avental} stroke={LINHA} strokeWidth={5} strokeLinejoin="round" />}
      <path d={forma} fill="none" stroke={LINHA} strokeWidth={7} strokeLinejoin="round" />
      {v.jaleco && (
        <g>
          <path d={`M -42 50 L -44 ${y(-118)} Q -42 ${y(-158)} 2 ${y(-160)} Q 44 ${y(-158)} 46 ${y(-118)} L 44 50 Z`} fill="#F4F6F8" stroke={LINHA} strokeWidth={7} strokeLinejoin="round" />
          <path d={`M -8 ${y(-150)} L 14 ${y(-100)} L 30 ${y(-150)}`} fill={c.camisa} stroke={LINHA} strokeWidth={5} strokeLinejoin="round" />
          <line x1={14} y1={y(-100)} x2={14} y2={46} stroke={LINHA} strokeWidth={4} />
          <rect x={20} y={y(-80)} width={18} height={22} rx={3} fill="#E8ECF0" stroke={LINHA} strokeWidth={4} />
        </g>
      )}
      {v.vestido && <path d={`M -36 -10 L 38 -10 L 58 70 Q 2 84 -54 70 Z`} fill={v.vestido} stroke={LINHA} strokeWidth={7} strokeLinejoin="round" />}
      {pose.adesivo && <polygon points={[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => { const rr = i % 2 ? 9 : 20; const a = rad(-90 + i * 36); return `${24 + Math.cos(a) * rr},${-96 * tr + Math.sin(a) * rr}`; }).join(" ")} fill="#FFD23F" stroke={LINHA} strokeWidth={4} strokeLinejoin="round" />}
      {v.fone && <path d={`M -30 ${y(-150)} Q 4 ${y(-122)} 40 ${y(-150)}`} stroke="#2A2A35" strokeWidth={12} fill="none" strokeLinecap="round" />}
      {v.fone && <g><circle cx={-28} cy={-150 * tr} r={13} fill="#E23B2E" stroke={LINHA} strokeWidth={5} /><circle cx={38} cy={-150 * tr} r={13} fill="#E23B2E" stroke={LINHA} strokeWidth={5} /></g>}
    </g>
  );
};

export const Boneco: React.FC<{ pose: PoseTeo; esc?: number; v?: Visual }> = ({ pose, esc = 1, v = TEO }) => {
  const { torso, head } = pose;
  const s = pose.esq ? -1 : 1;
  const r = G.cabeca * (v.cabeca ?? 1);
  const cz = v.cinza ? CINZA : (x: string) => x;
  const c: Cores = {
    pele: cz(v.pele), peleL: cz(escurece(v.pele, 0.88)), camisa: cz(v.camisa), listra: v.listra && cz(v.listra), baixo: cz(v.corBaixo), baixoL: cz(escurece(v.corBaixo, 0.85)),
    calcado: cz(v.calcado), cabelo: cz(v.corCabelo),
  };
  const vv: Visual = v.cinza ? { ...v, avental: v.avental && cz(v.avental), vestido: v.vestido && cz(v.vestido), bone: v.bone && cz(v.bone) } : v;
  const troncoT = `rotate(${torso.rot}) scale(${torso.scaleX} ${torso.scaleY})`;
  const pc = pescoco(v);
  const cab = `translate(${pc[0]} ${pc[1]}) rotate(${head.rot}) translate(${12 + (head.offsetX ?? 0)} ${-r + 6 + head.offsetY})`;
  return (
    <g transform={`translate(${torso.x} ${torso.y}) rotate(${pose.giro ?? 0}) scale(${s * esc} ${esc})`}>
      <g transform={troncoT}>
        <Braco pose={pose} lado="L" v={vv} c={c} />
      </g>
      <Perna pose={pose} lado="L" v={vv} c={c} />
      <Perna pose={pose} lado="R" v={vv} c={c} />
      {!vv.vestido && <path d={vv.baixo === "saia" ? "M -36 -24 L 38 -24 L 56 54 Q 2 66 -52 54 Z" : "M -36 -24 L 38 -24 L 40 14 L -38 14 Z"} fill={c.baixo} stroke={LINHA} strokeWidth={7} strokeLinejoin="round" />}
      <g transform={troncoT}>
        <Traco pts={[[pc[0], pc[1] + 4], [pc[0] + 4, pc[1] - 22]]} w={30} cor={mistura(c.pele, "#F2F0EC", (pose.palido ?? 0) * 0.85)} />
        <Camisa v={vv} c={c} pose={pose} />
        <g transform={cab}>
          <Cabeca pose={pose} v={vv} c={c} />
        </g>
        <Braco pose={pose} lado="R" v={vv} c={c} />
      </g>
      {pose.curativo && (() => { const b = braco(pose, "R", v); const m = doTronco(pose, b.bracoMeio); return <g transform={`translate(${m[0]} ${m[1]}) rotate(${-pose.arm_upper_R - pose.torso.rot})`}><rect x={-16} y={-9} width={32} height={18} rx={6} fill="#F2C9A0" stroke={LINHA} strokeWidth={4} /><rect x={-6} y={-6} width={12} height={12} fill="#E8B88A" /></g>; })()}
    </g>
  );
};

/** compatível com o esboço */
export const TiraTeo: React.FC<{ pose: PoseTeo; esc?: number; espelhar?: boolean; expr?: Expr; piscar?: boolean }> = ({ pose, esc = 1, expr = "neutro", piscar = false }) => (
  <Boneco pose={{ ...pose, expr: pose.expr ?? expr, piscar: pose.piscar ?? piscar }} esc={esc} v={TEO} />
);
export const COR_TEO = { linha: LINHA, pele: TEO.pele };
