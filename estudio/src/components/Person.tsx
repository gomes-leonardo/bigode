// Protagonista (e, na Fase 3, todo o elenco): homem adulto careca, sem orelhas, vista de frente.
// Chão em y = 0, escala 1. Braços e pernas "mangueira": uma curva quadrática do ombro (ou quadril) até o ALVO
// da mão (ou do pé), arqueada por `bend`. A mão é posicionada pela coordenada alvo e orientada pela tangente final.
import React from "react";
import { useCurrentFrame } from "remotion";
import { CONTORNO, INTERNA, LINHA, PELE, escura } from "../estilo";
import { Face, piscada, rostoDe, type Expr, type RostoP } from "./Face";
import { Circle, Ellipse, EscalaCtx, Line, Papel, Path, Rect } from "./prim";

export type P = [number, number];
export type Mao = "open" | "fist" | "point" | "none";
export type Roupa = { camiseta: string; calca: string; tenis: string; sola: string };
export const ROUPA_PADRAO: Roupa = { camiseta: "#E3A23B", calca: "#3C5A8A", tenis: "#FFFFFF", sola: "#C9452F" };

export type PersonProps = {
  x: number;
  y: number;
  scale?: number;
  flip?: boolean;
  expr?: Expr | RostoP;
  headTilt?: number; // graus
  lean?: number; // graus, inclina o tronco inteiro
  hip?: number; // contrapposto (graus): desnivela o quadril; o ombro inclina para o lado oposto (ombro = -hip*1.4)
  ombros?: number; // px para cima (dar de ombros)
  handL?: P; // alvo da mão do lado -x da tela, no espaço do personagem
  handR?: P; // alvo da mão do lado +x
  bendL?: number; // arqueamento extra do braço (px); negativo inverte o lado do cotovelo
  bendR?: number;
  gripL?: Mao;
  gripR?: Mao;
  frente?: "L" | "R"; // qual braço passa na frente quando cruzam
  footL?: P; // alvo da sola do pé, chão em y = 0
  footR?: P;
  kneeL?: number; // arqueamento da perna (px)
  kneeR?: number;
  lookAt?: P; // para onde os olhos olham, no espaço do personagem
  blink?: number; // força a pálpebra (0 a 1); sem isso pisca sozinho a cada 3 a 5 s
  semente?: number;
  pulo?: number; // px acima do chão: o corpo sobe, a sombra fica no chão e encolhe
  outfit?: Partial<Roupa>;
  propsBehind?: React.ReactNode; // objetos atrás do corpo (espaço do personagem)
  propsFront?: React.ReactNode; // objetos na frente do corpo e atrás dos braços
  propsHands?: React.ReactNode; // objetos que ficam por baixo dos dedos (desenhados antes das mãos)
};

// ---------------------------------------------------------------- geometria
export const OMBRO: P = [54, -224];
export const QUADRIL: P = [24, -112];
export const CABECA: P = [0, -330];
export const BRACO = 128; // comprimento natural do braço (arco)
const PERNA = 92;
const MANGA = 0.42; // fração da curva coberta pela manga
const rad = (d: number) => (d * Math.PI) / 180;
const rot = (p: P, a: number, c: P = [0, 0]): P => {
  const s = Math.sin(rad(a)), co = Math.cos(rad(a));
  const x = p[0] - c[0], y = p[1] - c[1];
  return [c[0] + x * co - y * s, c[1] + x * s + y * co];
};
export const quad = (a: P, c: P, b: P, t: number): P => [(1 - t) ** 2 * a[0] + 2 * (1 - t) * t * c[0] + t * t * b[0], (1 - t) ** 2 * a[1] + 2 * (1 - t) * t * c[1] + t * t * b[1]];
export const tang = (a: P, c: P, b: P, t: number): P => [2 * (1 - t) * (c[0] - a[0]) + 2 * t * (b[0] - c[0]), 2 * (1 - t) * (c[1] - a[1]) + 2 * t * (b[1] - c[1])];
const unit = (v: P): P => { const n = Math.hypot(v[0], v[1]) || 1; return [v[0] / n, v[1] / n]; };
const comp = (a: P, c: P, b: P) => {
  let s = 0, ant = a;
  for (let i = 1; i <= 16; i++) { const q = quad(a, c, b, i / 16); s += Math.hypot(q[0] - ant[0], q[1] - ant[1]); ant = q; }
  return s;
};
const controle = (a: P, b: P, bend: number, lado: number): P => {
  const d = unit([b[0] - a[0], b[1] - a[1]]);
  const perp: P = [-d[1] * lado, d[0] * lado];
  return [(a[0] + b[0]) / 2 + perp[0] * 2 * bend, (a[1] + b[1]) / 2 + perp[1] * 2 * bend];
};
/** o "cotovelo" (ou joelho) prefere apontar para baixo e um pouco para fora; bend negativo inverte */
const ladoPreferido = (a: P, b: P, fora: number, bend: number) => {
  const d = unit([b[0] - a[0], b[1] - a[1]]);
  const s = -d[1] * fora * 0.35 + d[0] * 1 >= 0 ? 1 : -1;
  return bend < 0 ? -s : s;
};
/** curva do membro: se o alvo está perto, a mangueira arqueia para manter o comprimento natural; alcance máximo +15% */
export const curvaMembro = (a: P, b0: P, bendExtra: number, fora: number, natural: number) => {
  const d0 = Math.hypot(b0[0] - a[0], b0[1] - a[1]);
  const max = natural * 1.15;
  const b: P = d0 > max ? [a[0] + ((b0[0] - a[0]) * max) / d0, a[1] + ((b0[1] - a[1]) * max) / d0] : b0;
  const lado = ladoPreferido(a, b, fora, bendExtra);
  const extra = Math.abs(bendExtra);
  if (Math.hypot(b[0] - a[0], b[1] - a[1]) >= natural) return { c: controle(a, b, extra, lado), b };
  let lo = 0, hi = natural;
  for (let i = 0; i < 14; i++) {
    const m = (lo + hi) / 2;
    if (comp(a, controle(a, b, m, 1), b) < natural) lo = m; else hi = m;
  }
  return { c: controle(a, b, (lo + hi) / 2 + extra, lado), b };
};
const caminho = (a: P, c: P, b: P) => `M ${a[0].toFixed(2)} ${a[1].toFixed(2)} Q ${c[0].toFixed(2)} ${c[1].toFixed(2)} ${b[0].toFixed(2)} ${b[1].toFixed(2)}`;
/** trecho [t0, t1] da quadrática como nova quadrática */
const trecho = (a: P, c: P, b: P, t0: number, t1: number): string => {
  const p0 = quad(a, c, b, t0), p1 = quad(a, c, b, t1);
  const d0 = tang(a, c, b, t0);
  const k = (t1 - t0) / 2;
  return caminho(p0, [p0[0] + d0[0] * k, p0[1] + d0[1] * k], p1);
};
/** curva paralela (deslocada `off` px) do trecho [t0, t1], como polilinha */
const paralela = (a: P, c: P, b: P, t0: number, t1: number, off: number) => {
  const pts: string[] = [];
  for (let i = 0; i <= 10; i++) {
    const t = t0 + ((t1 - t0) * i) / 10;
    const q = quad(a, c, b, t);
    const n = unit(tang(a, c, b, t));
    pts.push(`${i ? "L" : "M"} ${(q[0] - n[1] * off).toFixed(2)} ${(q[1] + n[0] * off).toFixed(2)}`);
  }
  return pts.join(" ");
};
const Tubo: React.FC<{ d: string; w: number; cor: string }> = ({ d, w, cor }) => (
  <g>
    <Path d={d} stroke={LINHA} strokeWidth={w + 14} fill="none" strokeLinecap="round" />
    <Path d={d} stroke={cor} strokeWidth={w} fill="none" strokeLinecap="round" />
  </g>
);

// ---------------------------------------------------------------- mãos (o "para baixo" do desenho = tangente final do braço)
export const MaoD: React.FC<{ tipo: Mao; lado: number }> = ({ tipo, lado }) => {
  if (tipo === "none") return null;
  if (tipo === "open")
    return (
      <g>
        <Ellipse cx={0} cy={6} rx={19} ry={16} fill={PELE} stroke={LINHA} strokeWidth={CONTORNO - 1} />
        <Ellipse cx={-15 * lado} cy={-2} rx={7} ry={11} transform={`rotate(${30 * lado} ${-15 * lado} -2)`} fill={PELE} stroke={LINHA} strokeWidth={CONTORNO - 1.5} />
        {[-7, 0, 7].map((dx, i) => <Line key={i} x1={dx + 2 * lado} y1={16} x2={dx + 2 * lado} y2={21} stroke={LINHA} strokeWidth={3.5} strokeLinecap="round" />)}
      </g>
    );
  const punho = (
    <g>
      <Circle cx={0} cy={4} r={17} fill={PELE} stroke={LINHA} strokeWidth={CONTORNO - 1} />
      {[-7, 0, 7].map((dx, i) => <Path key={i} d={`M ${dx - 3} 14 q 3 -5 6 0`} stroke={LINHA} strokeWidth={3.2} fill="none" strokeLinecap="round" />)}
    </g>
  );
  if (tipo === "fist") return punho;
  return (
    <g>
      <Rect x={-6} y={8} width={12} height={36} rx={6} fill={PELE} stroke={LINHA} strokeWidth={CONTORNO - 1.5} />
      {punho}
    </g>
  );
};

// ---------------------------------------------------------------- tênis (vista de 3/4, bico para fora)
const Tenis: React.FC<{ p: P; lado: number; cor: string; sola: string }> = ({ p, lado, cor, sola }) => (
  <g transform={`translate(${p[0]} ${p[1]}) scale(${lado} 1)`}>
    <Path d="M -24 -5 C -27 -24 -8 -33 9 -30 C 26 -28 41 -18 41 -7 L 41 0 L -24 0 Z" fill={cor} stroke={LINHA} strokeWidth={CONTORNO} strokeLinejoin="round" />
    <Path d="M -25 -7 L 42 -7 L 42 1 Q 10 4 -25 1 Z" fill={sola} stroke={LINHA} strokeWidth={5} strokeLinejoin="round" />
    <Path d="M 2 -25 l 9 4 M 10 -28 l 9 4" stroke={LINHA} strokeWidth={4} strokeLinecap="round" />
  </g>
);

// ---------------------------------------------------------------- personagem
export const Person: React.FC<PersonProps> = (pr) => {
  const f = useCurrentFrame();
  const roupa: Roupa = { ...ROUPA_PADRAO, ...pr.outfit };
  const sc = pr.scale ?? 1;
  const hip = pr.hip ?? 0;
  const lean = pr.lean ?? 0;
  const ombros = pr.ombros ?? 0;
  const pulo = pr.pulo ?? 0;
  const cint: P = [0, -128];
  const giro = -hip * 1.4 + lean; // o tronco gira com a inclinação dos ombros e com o lean
  const doTronco = (p: P): P => rot(p, giro, cint);
  const ombroL = doTronco([-OMBRO[0], OMBRO[1] - ombros]);
  const ombroR = doTronco([OMBRO[0], OMBRO[1] - ombros * 0.9]);
  const quadL = rot([-QUADRIL[0], QUADRIL[1]], hip, [0, -112]);
  const quadR = rot([QUADRIL[0], QUADRIL[1]], hip, [0, -112]);
  const footL = pr.footL ?? [-30, 0];
  const footR = pr.footR ?? [32, 0];
  const camE = escura(roupa.camiseta);
  const calcaE = escura(roupa.calca);

  const braco = (o: P, m0: P, bend: number, lado: number, tipo: Mao) => {
    const { c, b: m } = curvaMembro(o, m0, bend, lado, BRACO);
    const tg = tang(o, c, m, 1);
    const ang = (Math.atan2(tg[1], tg[0]) * 180) / Math.PI - 90;
    const fim = quad(o, c, m, MANGA);
    const nM = unit(tang(o, c, m, MANGA));
    return {
      o, c, m, ang, tipo, lado,
      manga: trecho(o, c, m, 0, MANGA),
      pele: trecho(o, c, m, 0.34, 1),
      bordas: [paralela(o, c, m, 0.16, MANGA, 17), paralela(o, c, m, 0.16, MANGA, -17)],
      bainha: [[fim[0] - nM[1] * 17, fim[1] + nM[0] * 17], [fim[0] + nM[1] * 17, fim[1] - nM[0] * 17]] as P[],
    };
  };
  const bL = braco(ombroL, pr.handL ?? [-72, -110], pr.bendL ?? 6, -1, pr.gripL ?? "open");
  const bR = braco(ombroR, pr.handR ?? [74, -108], pr.bendR ?? 6, 1, pr.gripR ?? "open");
  const ordem = pr.frente === "L" ? [bR, bL] : [bL, bR];

  const perna = (q: P, pe: P, knee: number, lado: number) => {
    const { c, b: tor } = curvaMembro(q, [pe[0] - 4 * lado, pe[1] - 20], knee, lado, PERNA);
    const j = quad(q, c, tor, 0.52), dj = unit(tang(q, c, tor, 0.52));
    const br = quad(q, c, tor, 0.9), db = unit(tang(q, c, tor, 0.9));
    return { d: caminho(q, c, tor), j, dj, br, db, lado };
  };
  const pL = perna(quadL, footL, pr.kneeL ?? 2, -1);
  const pR = perna(quadR, footR, pr.kneeR ?? 2, 1);

  const rosto = typeof pr.expr === "object" ? pr.expr : rostoDe(pr.expr ?? "sigma");
  const fechar = pr.blink ?? piscada(f, pr.semente ?? 0);
  const centroCab = doTronco([CABECA[0], CABECA[1] - ombros * 0.6]);
  const alvo = pr.lookAt;
  const olhar: [number, number] = alvo ? [Math.max(-1, Math.min(1, (alvo[0] - centroCab[0]) / 300)), Math.max(-1, Math.min(1, (alvo[1] - centroCab[1] + pulo) / 300))] : [0, 0];
  const subida = pulo + Math.max(0, -Math.max(footL[1], footR[1]));
  const sombraChao = 1 / (1 + subida / 160);

  return (
    <EscalaCtx.Provider value={sc}>
      <g transform={`translate(${pr.x} ${pr.y}) scale(${(pr.flip ? -1 : 1) * sc} ${sc})`}>
        {/* sombra no chão: fica no chão e encolhe quando ele sobe */}
        <Ellipse cx={(footL[0] + footR[0]) / 2} cy={0} rx={88 * sombraChao} ry={11 * sombraChao} fill="#000" opacity={0.13} />
        <g transform={`translate(0 ${-pulo})`}>
          {pr.propsBehind}
          {/* pernas + cós num grupo só (sombra de papel na silhueta), tênis por cima */}
          <Papel>
            {[pL, pR].map((p, i) => (
              <g key={i}>
                <Tubo d={p.d} w={38} cor={roupa.calca} />
                <Path d={`M ${p.j[0] + p.dj[1] * 10 * p.lado} ${p.j[1] - p.dj[0] * 10 * p.lado} q ${p.dj[0] * 7 - p.dj[1] * 4 * p.lado} ${p.dj[1] * 7 + p.dj[0] * 4 * p.lado} ${p.dj[0] * 12} ${p.dj[1] * 12}`} stroke={calcaE} strokeWidth={INTERNA} fill="none" strokeLinecap="round" />
                <Line x1={p.br[0] - p.db[1] * 19} y1={p.br[1] + p.db[0] * 19} x2={p.br[0] + p.db[1] * 19} y2={p.br[1] - p.db[0] * 19} stroke={calcaE} strokeWidth={INTERNA} strokeLinecap="round" />
              </g>
            ))}
            <g transform={`rotate(${hip} 0 -120)`}>
              <Path d="M -55 -144 Q 0 -150 55 -144 L 52 -110 Q 26 -100 0 -104 Q -26 -100 -52 -110 Z" fill={roupa.calca} stroke={LINHA} strokeWidth={CONTORNO} strokeLinejoin="round" />
              <Line x1={0} y1={-138} x2={1} y2={-104} stroke={calcaE} strokeWidth={INTERNA} strokeLinecap="round" />
            </g>
          </Papel>
          <Papel><Tenis p={footL} lado={-1} cor={roupa.tenis} sola={roupa.sola} /></Papel>
          <Papel><Tenis p={footR} lado={1} cor={roupa.tenis} sola={roupa.sola} /></Papel>
          {/* contorno das mangas atrás do tronco + tronco + pescoço + cabeça: uma silhueta só */}
          <Papel>
            {[bL, bR].map((b, i) => <Path key={i} d={b.manga} stroke={LINHA} strokeWidth={34 + 14} fill="none" strokeLinecap="round" />)}
            <g transform={`rotate(${giro} ${cint[0]} ${cint[1]})`}>
              <Path d="M -17 -270 L 17 -270 L 19 -236 L -19 -236 Z" transform={`translate(0 ${-ombros * 0.6})`} fill={PELE} stroke={LINHA} strokeWidth={CONTORNO} strokeLinejoin="round" />
              <Path d={`M -24 ${-246 - ombros} C -52 ${-244 - ombros} -68 -232 -66 -206 C -64 -178 -58 -156 -54 -134 Q 0 -122 54 -134 C 58 -156 64 -178 66 -206 C 68 -232 52 ${-244 - ombros} 24 ${-246 - ombros} Z`} fill={roupa.camiseta} stroke={LINHA} strokeWidth={CONTORNO} strokeLinejoin="round" />
              <Path d={`M -22 ${-245 - ombros} Q -6 ${-226 - ombros} 2 ${-222 - ombros} Q 10 ${-228 - ombros} 23 ${-245 - ombros} Z`} fill={PELE} stroke={LINHA} strokeWidth={INTERNA} strokeLinejoin="round" />
              <Path d="M -38 -176 q 8 6 6 16" stroke={camE} strokeWidth={INTERNA} fill="none" strokeLinecap="round" />
              <Path d="M 30 -150 q 9 -3 14 6" stroke={camE} strokeWidth={INTERNA} fill="none" strokeLinecap="round" />
              <g transform={`translate(0 ${-ombros * 0.6}) rotate(${pr.headTilt ?? 0} 0 -254)`}>
                <g transform={`translate(${CABECA[0]} ${CABECA[1]}) scale(0.92)`}>
                  <Ellipse cx={0} cy={0} rx={84} ry={82} fill={PELE} stroke={LINHA} strokeWidth={CONTORNO / 0.92} />
                  <Path d="M -58 -34 A 66 64 0 0 1 -24 -62" stroke={LINHA} strokeWidth={5} fill="none" strokeLinecap="round" opacity={0.3} />
                  <Face p={rosto} fechar={fechar} olhar={olhar} />
                </g>
              </g>
            </g>
          </Papel>
          {pr.propsFront}
          {/* braços: pele por cima do tronco; a cor da manga por último (cobre o contorno no ombro, sem emenda) */}
          {ordem.map((b, i) => (
            <g key={i}>
              <Papel><Tubo d={b.pele} w={20} cor={PELE} /></Papel>
              <Path d={b.manga} stroke={roupa.camiseta} strokeWidth={34} fill="none" strokeLinecap="round" />
              {b.bordas.map((d, j) => <Path key={j} d={d} stroke={LINHA} strokeWidth={INTERNA} fill="none" strokeLinecap="round" />)}
              <Line x1={b.bainha[0][0]} y1={b.bainha[0][1]} x2={b.bainha[1][0]} y2={b.bainha[1][1]} stroke={camE} strokeWidth={INTERNA} strokeLinecap="round" />
              {b.tipo === "none" && (
                <g>
                  <Path d={`M ${b.m[0] - 16} ${b.m[1] - 4} Q ${b.m[0]} ${b.m[1] + 7} ${b.m[0] + 16} ${b.m[1] - 4} L ${b.m[0] + 15} ${b.m[1] + 20} L ${b.m[0] - 15} ${b.m[1] + 20} Z`} fill={roupa.calca} />
                  <Path d={`M ${b.m[0] - 16} ${b.m[1] - 4} Q ${b.m[0]} ${b.m[1] + 7} ${b.m[0] + 16} ${b.m[1] - 4}`} stroke={LINHA} strokeWidth={INTERNA} fill="none" strokeLinecap="round" />
                </g>
              )}
            </g>
          ))}
          {pr.propsHands}
          {[bL, bR].map((b, i) => (
            <Papel key={i} transform={`translate(${b.m[0]} ${b.m[1]}) rotate(${b.ang})`}>
              <MaoD tipo={b.tipo} lado={b.lado} />
            </Papel>
          ))}
        </g>
      </g>
    </EscalaCtx.Provider>
  );
};
