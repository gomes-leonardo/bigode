// Rosto: sobrancelhas grossas fazem a maior parte da atuação. Cada expressão é um conjunto de pontos
// (sobrancelha, pálpebra, boca) e toda troca interpola esses pontos em 6 a 10 quadros, nunca seca.
import React, { useId } from "react";
import { useSombra } from "./prim";
import { LINHA, PELE } from "../estilo";

type Sobrancelha = { xi: number; yi: number; xo: number; yo: number; arco: number }; // ponta interna, ponta externa, curvatura
type Olho = { cx: number; cy: number; esclera: number; rx: number; ry: number; pupila: number; px: number; py: number; palpebra: number; arco: number };
type Boca = { lx: number; ly: number; rx: number; ry: number; cima: number; baixo: number; dentes: number; lingua: number; onda: number };
export type RostoP = { sL: Sobrancelha; sR: Sobrancelha; oL: Olho; oR: Olho; boca: Boca };
export type Expr = "sigma" | "convencido" | "chocado" | "rindo" | "bravo" | "triste" | "olhar-lateral" | "nojo" | "neutro";
export const EXPRESSOES: Expr[] = ["sigma", "convencido", "chocado", "rindo", "bravo", "triste", "olhar-lateral", "nojo", "neutro"];

// coordenadas no espaço da cabeça (centro 0,0; raio ~77). Os dois lados nunca são espelho perfeito.
const olho = (cx: number, cy: number, o: Partial<Olho> = {}): Olho => ({ cx, cy, esclera: 0, rx: 9, ry: 9, pupila: 9, px: 0, py: 0, palpebra: 0, arco: 0, ...o });
const sob = (xi: number, yi: number, xo: number, yo: number, arco = 0): Sobrancelha => ({ xi, yi, xo, yo, arco });
const boca = (o: Partial<Boca>): Boca => ({ lx: -18, ly: 34, rx: 18, ry: 33, cima: 33, baixo: 33, dentes: 0, lingua: 0, onda: 0, ...o });
const OL = -27, OR = 27;

const BASE: Record<Expr, RostoP> = {
  neutro: { sL: sob(-13, -30, -45, -29), sR: sob(12, -31, 44, -31), oL: olho(OL, 0), oR: olho(OR, -2), boca: boca({}) },
  // pálpebras caídas cobrindo metade de cima, pupilas para o lado, sobrancelhas retas, meio sorriso torto
  sigma: { sL: sob(-13, -24, -46, -26), sR: sob(12, -26, 45, -27), oL: olho(OL, 2, { px: 5, palpebra: 0.52 }), oR: olho(OR, 0, { px: 5, palpebra: 0.5 }), boca: boca({ lx: -16, ly: 36, rx: 21, ry: 29, cima: 37, baixo: 37 }) },
  // uma sobrancelha bem levantada, um olho semicerrado e outro aberto, sorriso de lado
  convencido: { sL: sob(-13, -26, -46, -25), sR: sob(12, -42, 44, -50, -6), oL: olho(OL, 2, { palpebra: 0.6, px: 2 }), oR: olho(OR, -4, { pupila: 10, px: 2 }), boca: boca({ lx: -12, ly: 37, rx: 23, ry: 28, cima: 38, baixo: 38 }) },
  // olhos enormes brancos com pupila pequena, sobrancelhas lá em cima, boca oval aberta
  chocado: { sL: sob(-14, -48, -46, -52, -5), sR: sob(13, -50, 45, -54, -5), oL: olho(OL, -2, { esclera: 1, rx: 19, ry: 21, pupila: 4.5 }), oR: olho(OR, -4, { esclera: 1, rx: 18, ry: 22, pupila: 4.5 }), boca: boca({ lx: -11, ly: 44, rx: 11, ry: 44, cima: 30, baixo: 62 }) },
  // olhos fechados em arco ^ ^, boca grande aberta com língua
  rindo: { sL: sob(-13, -38, -46, -35, -3), sR: sob(12, -39, 45, -37, -3), oL: olho(OL, 0, { palpebra: 1, arco: 1 }), oR: olho(OR, -2, { palpebra: 1, arco: 1 }), boca: boca({ lx: -26, ly: 26, rx: 27, ry: 25, cima: 24, baixo: 66, lingua: 1 }) },
  // sobrancelhas em V grossas, olhos semicerrados, dentes cerrados
  bravo: { sL: sob(-10, -16, -46, -34, 2), sR: sob(9, -18, 45, -36, 2), oL: olho(OL, 2, { palpebra: 0.45 }), oR: olho(OR, 0, { palpebra: 0.48 }), boca: boca({ lx: -21, ly: 38, rx: 21, ry: 37, cima: 31, baixo: 46, dentes: 1 }) },
  // sobrancelhas caídas para fora, olhos pequenos, boca curva para baixo
  triste: { sL: sob(-13, -38, -44, -23, -2), sR: sob(12, -39, 43, -24, -2), oL: olho(OL, 2, { pupila: 6.5, palpebra: 0.15 }), oR: olho(OR, 0, { pupila: 6.5, palpebra: 0.15 }), boca: boca({ lx: -16, ly: 41, rx: 16, ry: 40, cima: 31, baixo: 31 }) },
  // olhos grandes brancos com as pupilas no canto, boca reta
  "olhar-lateral": { sL: sob(-13, -35, -45, -34), sR: sob(12, -36, 44, -36), oL: olho(OL, 0, { esclera: 1, rx: 15, ry: 15, pupila: 6, px: 8 }), oR: olho(OR, -2, { esclera: 1, rx: 15, ry: 15, pupila: 6, px: 8 }), boca: boca({ lx: -15, ly: 37, rx: 15, ry: 37, cima: 37, baixo: 37 }) },
  // um olho mais fechado que o outro, boca ondulada
  nojo: { sL: sob(-11, -22, -46, -30, 1), sR: sob(12, -34, 45, -36, -2), oL: olho(OL, 2, { palpebra: 0.72 }), oR: olho(OR, -2, { palpebra: 0.2 }), boca: boca({ lx: -19, ly: 38, rx: 19, ry: 34, cima: 36, baixo: 36, onda: 1 }) },
};
export const rostoDe = (e: Expr): RostoP => BASE[e];

const l = (a: number, b: number, k: number) => a + (b - a) * k;
const mixObj = <T extends Record<string, number>>(a: T, b: T, k: number): T => Object.fromEntries(Object.keys(a).map((n) => [n, l(a[n], b[n], k)])) as T;
/** interpola duas expressões ponto a ponto */
export const misturaRosto = (a: RostoP, b: RostoP, k: number): RostoP => ({ sL: mixObj(a.sL, b.sL, k), sR: mixObj(a.sR, b.sR, k), oL: mixObj(a.oL, b.oL, k), oR: mixObj(a.oR, b.oR, k), boca: mixObj(a.boca, b.boca, k) });
const suave = (x: number) => (x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x));
/** expressão num quadro, a partir de uma lista de trocas [quadro, expressão]; cada troca leva `n` quadros (6 a 10) */
export const expressaoNoQuadro = (trocas: [number, Expr][], f: number, n = 8): RostoP => {
  let i = 0;
  while (i + 1 < trocas.length && f >= trocas[i + 1][0]) i++;
  const atual = rostoDe(trocas[i][1]);
  if (i === 0) return atual;
  const k = suave((f - trocas[i][0]) / n);
  return misturaRosto(rostoDe(trocas[i - 1][1]), atual, k);
};
/** piscar automático a cada 3 a 5 s (2 quadros fechando, 3 abrindo); devolve o quanto a pálpebra fecha (0 a 1) */
const frac = (x: number) => x - Math.floor(x);
export const piscada = (f: number, semente = 0, fps = 30) => {
  let s = Math.floor(fps * (0.8 + frac(semente * 0.37) * 2));
  let i = 0;
  let ultimo = -100;
  while (s <= f) {
    ultimo = s;
    s += Math.floor(fps * (3 + 2 * frac(Math.sin((i + 1) * 12.9898 + semente * 78.233) * 43758.5453)));
    i++;
  }
  const fase = f - ultimo;
  return fase >= 0 && fase < 5 ? [0.5, 1, 0.66, 0.33, 0][fase] : 0;
};

const Sob: React.FC<{ s: Sobrancelha }> = ({ s }) => {
  const mx = (s.xi + s.xo) / 2, my = (s.yi + s.yo) / 2 + s.arco;
  return <path d={`M ${s.xo} ${s.yo} Q ${mx} ${my} ${s.xi} ${s.yi}`} stroke={LINHA} strokeWidth={12} fill="none" strokeLinecap="round" />;
};
const OlhoD: React.FC<{ o: Olho; fechar: number; olharX: number; olharY: number }> = ({ o, fechar, olharX, olharY }) => {
  const e = o.esclera;
  const rx = l(o.pupila, o.rx, e), ry = l(o.pupila, o.ry, e);
  const lim = Math.max(0, rx - o.pupila - 1);
  const px = Math.max(-lim - 3, Math.min(lim + 3, o.px + olharX * (2 + 4 * e)));
  const py = Math.max(-lim, Math.min(lim, o.py + olharY * (1 + 3 * e)));
  const pal = Math.min(1, o.palpebra + fechar * (1 - o.palpebra));
  const topo = o.cy - ry - 1;
  const corte = topo + (ry * 2 + 2) * pal; // até onde a pálpebra cobre
  const larg = rx + 5;
  const id = `ol-${useId().replace(/:/g, "")}`;
  return (
    <g>
      <defs>
        <clipPath id={id}>
          <rect x={o.cx - larg - 2} y={corte} width={larg * 2 + 4} height={ry * 2 + 40} />
        </clipPath>
      </defs>
      {pal < 0.999 && (
        <g clipPath={`url(#${id})`}>
          {e > 0.02 && <ellipse cx={o.cx} cy={o.cy} rx={rx} ry={ry} fill={PELE} stroke={LINHA} strokeWidth={4.5 * e} />}
          <circle cx={o.cx + px * e + (1 - e) * o.px} cy={o.cy + py * e} r={o.pupila} fill={LINHA} />
        </g>
      )}
      {pal > 0.02 && (
        <path d={`M ${o.cx - larg} ${corte} Q ${o.cx} ${corte - o.arco * 12 * pal} ${o.cx + larg} ${corte}`} stroke={LINHA} strokeWidth={pal > 0.98 ? 5.5 : 4.5} fill="none" strokeLinecap="round" />
      )}
    </g>
  );
};
const BocaD: React.FC<{ b: Boca }> = ({ b }) => {
  const mx = (b.lx + b.rx) / 2;
  const id = `boca-${useId().replace(/:/g, "")}`;
  const aberta = Math.abs(b.baixo - b.cima) > 0.5;
  const onda = b.onda;
  const fechada = onda > 0.01
    ? `M ${b.lx} ${b.ly} C ${l(b.lx, b.rx, 0.3)} ${b.cima - 9 * onda} ${l(b.lx, b.rx, 0.45)} ${b.cima + 9 * onda} ${mx} ${b.cima} S ${l(b.lx, b.rx, 0.85)} ${b.cima - 8 * onda} ${b.rx} ${b.ry}`
    : `M ${b.lx} ${b.ly} Q ${mx} ${2 * b.cima - (b.ly + b.ry) / 2} ${b.rx} ${b.ry}`;
  if (!aberta) return <path d={fechada} stroke={LINHA} strokeWidth={5.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />;
  const forma = `M ${b.lx} ${b.ly} Q ${mx} ${2 * b.cima - (b.ly + b.ry) / 2} ${b.rx} ${b.ry} Q ${mx} ${2 * b.baixo - (b.ly + b.ry) / 2} ${b.lx} ${b.ly} Z`;
  return (
    <g>
      <defs><clipPath id={id}><path d={forma} /></clipPath></defs>
      <path d={forma} fill="#6E2A2A" />
      <g clipPath={`url(#${id})`}>
        {b.dentes > 0.01 && <g opacity={b.dentes}><rect x={b.lx - 4} y={b.cima - 10} width={b.rx - b.lx + 8} height={b.baixo - b.cima + 20} fill={PELE} />{[-0.5, 0, 0.5].map((k, i) => <line key={i} x1={mx + k * (b.rx - b.lx) * 0.5} y1={b.cima - 10} x2={mx + k * (b.rx - b.lx) * 0.5} y2={b.baixo + 10} stroke={LINHA} strokeWidth={3} />)}<line x1={b.lx} y1={(b.cima + b.baixo) / 2} x2={b.rx} y2={(b.cima + b.baixo) / 2} stroke={LINHA} strokeWidth={3} /></g>}
        {b.lingua > 0.01 && <ellipse cx={mx + 4} cy={b.baixo - 4} rx={(b.rx - b.lx) * 0.36} ry={14 * b.lingua} fill="#E2737F" />}
      </g>
      <path d={forma} fill="none" stroke={LINHA} strokeWidth={5.5} strokeLinejoin="round" />
    </g>
  );
};

/** rosto inteiro no espaço da cabeça; `fechar` vem da piscada; `olhar` (-1 a 1) move as pupilas */
export const Face: React.FC<{ p: RostoP; fechar?: number; olhar?: [number, number] }> = ({ p, fechar = 0, olhar = [0, 0] }) => useSombra() ? null : (
  <g>
    <OlhoD o={p.oL} fechar={fechar} olharX={olhar[0]} olharY={olhar[1]} />
    <OlhoD o={p.oR} fechar={fechar} olharX={olhar[0]} olharY={olhar[1]} />
    <Sob s={p.sL} />
    <Sob s={p.sR} />
    <BocaD b={p.boca} />
  </g>
);
