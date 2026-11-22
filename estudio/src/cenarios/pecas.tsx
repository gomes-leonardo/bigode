// Peças comuns dos cenários (mesmo traço do elenco: contorno preto grosso, sombra de papel, cores chapadas suaves).
// Tudo é desenhado com folga além do quadro (MARGEM) para o zoom e o parallax da câmera não mostrarem borda.
import React, { useId } from "react";
import { CONTORNO, INTERNA, LINHA, escura } from "../estilo";
import { Circle, Ellipse, Line, Papel, Path, Polygon, Rect } from "../components/prim";

export const MARGEM = 320;
const f1 = (n: number) => n.toFixed(1);
type P = [number, number];

// ------------------------------------------------------------------ parede, rodapé, piso em perspectiva
export const Parede: React.FC<{ cor: string; base: number }> = ({ cor, base }) => (
  <Rect x={-MARGEM} y={-MARGEM} width={1920 + 2 * MARGEM} height={base + MARGEM} fill={cor} semSombra />
);

export const Rodape: React.FC<{ y: number; cor: string }> = ({ y, cor }) => (
  <g>
    <Rect x={-MARGEM} y={y - 16} width={1920 + 2 * MARGEM} height={16} fill={cor} semSombra />
    <Line x1={-MARGEM} y1={y - 16} x2={1920 + MARGEM} y2={y - 16} stroke={LINHA} strokeWidth={INTERNA} semSombra />
    <Line x1={-MARGEM} y1={y} x2={1920 + MARGEM} y2={y} stroke={LINHA} strokeWidth={CONTORNO - 1} semSombra />
  </g>
);

const VP: P = [960, -1100]; // ponto de fuga do piso (acima do quadro): linhas de profundidade convergem para cá
const xNoY = (x0: number, y0: number, y: number) => VP[0] + ((x0 - VP[0]) * (y - VP[1])) / (y0 - VP[1]);

/** piso do cômodo a partir da linha da parede (y0) até embaixo; tábuas convergindo, ladrilho ou xadrez */
export const Piso: React.FC<{ y0: number; cor: string; tipo: "tabua" | "ladrilho" | "xadrez"; cor2?: string; passo?: number }> = ({ y0, cor, tipo, cor2, passo = 150 }) => {
  const y1 = 1080 + MARGEM;
  const cols: number[] = [];
  for (let x = -MARGEM * 2; x <= 1920 + MARGEM * 2; x += passo) cols.push(x);
  const linhas: number[] = [];
  const n = tipo === "tabua" ? 0 : 7;
  for (let k = 1; k <= n; k++) linhas.push(y0 + (y1 - y0) * Math.pow(k / (n + 1), 1.7));
  const c2 = cor2 ?? escura(cor, 0.93);
  const celulas: React.ReactNode[] = [];
  if (tipo === "xadrez") {
    const ys = [y0, ...linhas, y1];
    for (let i = 0; i < ys.length - 1; i++)
      for (let j = 0; j < cols.length - 1; j++) {
        if ((i + j) % 2) continue;
        const a = ys[i], b = ys[i + 1];
        const pts = [[xNoY(cols[j], y0, a), a], [xNoY(cols[j + 1], y0, a), a], [xNoY(cols[j + 1], y0, b), b], [xNoY(cols[j], y0, b), b]];
        celulas.push(<Polygon key={`${i}-${j}`} points={pts.map((p) => p.map(f1).join(",")).join(" ")} fill={c2} semSombra />);
      }
  }
  if (tipo === "tabua")
    for (let j = 0; j < cols.length - 1; j += 2) {
      const pts = [[cols[j], y0], [cols[j + 1], y0], [xNoY(cols[j + 1], y0, y1), y1], [xNoY(cols[j], y0, y1), y1]];
      celulas.push(<Polygon key={j} points={pts.map((p) => p.map(f1).join(",")).join(" ")} fill={c2} semSombra />);
    }
  const linha = escura(cor, 0.8);
  return (
    <g>
      <Rect x={-MARGEM} y={y0} width={1920 + 2 * MARGEM} height={y1 - y0} fill={cor} semSombra />
      {celulas}
      {cols.map((x, i) => <Line key={`c${i}`} x1={x} y1={y0} x2={f1(xNoY(x, y0, y1))} y2={y1} stroke={linha} strokeWidth={3} semSombra />)}
      {linhas.map((y, i) => <Line key={`l${i}`} x1={-MARGEM} y1={f1(y)} x2={1920 + MARGEM} y2={f1(y)} stroke={linha} strokeWidth={3} semSombra />)}
      {tipo === "tabua" && cols.map((x, i) => {
        // emendas das tábuas, desencontradas
        const y = y0 + 40 + ((i * 97) % 5) * 34;
        const xa = xNoY(x, y0, y), xb = xNoY(x + passo, y0, y);
        return <Line key={`e${i}`} x1={f1(xa)} y1={f1(y)} x2={f1(xb)} y2={f1(y)} stroke={linha} strokeWidth={3} semSombra />;
      })}
    </g>
  );
};

// ------------------------------------------------------------------ janela, quadro, prateleira, livros
export const Janela: React.FC<{
  x: number; y: number; w: number; h: number; moldura?: string; vidro?: string; cortina?: string; persiana?: boolean; children?: React.ReactNode;
}> = ({ x, y, w, h, moldura = "#FAF8F2", vidro = "#CFE6F0", cortina, persiana, children }) => {
  const id = useId().replace(/:/g, "");
  const b = 16; // largura do batente
  return (
    <g>
      <Papel>
        <Rect x={x} y={y} width={w} height={h} rx={6} fill={moldura} stroke={LINHA} strokeWidth={CONTORNO} />
        <Rect x={x + b} y={y + b} width={w - 2 * b} height={h - 2 * b} fill={vidro} stroke={LINHA} strokeWidth={INTERNA} />
      </Papel>
      <defs><clipPath id={`vidro-${id}`}><rect x={x + b} y={y + b} width={w - 2 * b} height={h - 2 * b} /></clipPath></defs>
      <g clipPath={`url(#vidro-${id})`}>
        {children}
        {persiana && Array.from({ length: Math.floor((h * 0.55) / 18) }, (_, i) => (
          <g key={i}>
            <Rect x={x + b} y={y + b + i * 18} width={w - 2 * b} height={12} fill="#F4F1EA" semSombra />
            <Line x1={x + b} y1={y + b + i * 18 + 12} x2={x + w - b} y2={y + b + i * 18 + 12} stroke={LINHA} strokeWidth={2.5} semSombra />
          </g>
        ))}
      </g>
      <Line x1={x + w / 2} y1={y + b} x2={x + w / 2} y2={y + h - b} stroke={LINHA} strokeWidth={CONTORNO} />
      <Line x1={x + w / 2} y1={y + b} x2={x + w / 2} y2={y + h - b} stroke={moldura} strokeWidth={CONTORNO - 3} />
      <Line x1={x + b} y1={y + h * 0.5} x2={x + w - b} y2={y + h * 0.5} stroke={LINHA} strokeWidth={CONTORNO} />
      <Line x1={x + b} y1={y + h * 0.5} x2={x + w - b} y2={y + h * 0.5} stroke={moldura} strokeWidth={CONTORNO - 3} />
      <Path d={`M ${x + b + 14} ${y + b + 30} l 26 -16 M ${x + b + 14} ${y + b + 54} l 44 -28`} stroke="#FFFFFF" strokeWidth={5} strokeLinecap="round" opacity={0.7} />
      <Papel>
        <Rect x={x - 18} y={y + h - 4} width={w + 36} height={18} rx={4} fill={moldura} stroke={LINHA} strokeWidth={CONTORNO} />
      </Papel>
      {cortina && (
        <Papel>
          <Rect x={x - 40} y={y - 34} width={w + 80} height={12} rx={6} fill={escura(cortina, 0.7)} stroke={LINHA} strokeWidth={INTERNA} />
          <Path d={`M ${x - 34} ${y - 26} L ${x + w * 0.2} ${y - 26} Q ${x + w * 0.12} ${y + h * 0.5} ${x + w * 0.2} ${y + h + 40} Q ${x - 6} ${y + h + 52} ${x - 34} ${y + h + 40} Z`} fill={cortina} stroke={LINHA} strokeWidth={CONTORNO} strokeLinejoin="round" />
          <Path d={`M ${x + w + 34} ${y - 26} L ${x + w * 0.8} ${y - 26} Q ${x + w * 0.88} ${y + h * 0.5} ${x + w * 0.8} ${y + h + 40} Q ${x + w + 6} ${y + h + 52} ${x + w + 34} ${y + h + 40} Z`} fill={cortina} stroke={LINHA} strokeWidth={CONTORNO} strokeLinejoin="round" />
          <Path d={`M ${x - 10} ${y - 10} Q ${x - 4} ${y + h * 0.5} ${x - 12} ${y + h + 30} M ${x + w + 10} ${y - 10} Q ${x + w + 4} ${y + h * 0.5} ${x + w + 12} ${y + h + 30}`} stroke={escura(cortina)} strokeWidth={INTERNA} fill="none" strokeLinecap="round" />
        </Papel>
      )}
    </g>
  );
};

export type Arte = "montanha" | "circulos" | "listras" | "flor" | "sol";
export const Quadro: React.FC<{ x: number; y: number; w: number; h: number; moldura?: string; fundo?: string; arte?: Arte; cor?: string }> = ({ x, y, w, h, moldura = "#6E4B35", fundo = "#F4EFE4", arte = "montanha", cor = "#E0826E" }) => {
  const i = 12;
  const X = x + i, Y = y + i, W = w - 2 * i, H = h - 2 * i;
  return (
    <Papel>
      <Rect x={x} y={y} width={w} height={h} rx={4} fill={moldura} stroke={LINHA} strokeWidth={CONTORNO} />
      <Rect x={X} y={Y} width={W} height={H} fill={fundo} stroke={LINHA} strokeWidth={INTERNA} />
      {arte === "montanha" && <Path d={`M ${X} ${Y + H} L ${X + W * 0.35} ${Y + H * 0.45} L ${X + W * 0.55} ${Y + H * 0.7} L ${X + W * 0.75} ${Y + H * 0.35} L ${X + W} ${Y + H} Z`} fill={cor} stroke={LINHA} strokeWidth={INTERNA} strokeLinejoin="round" />}
      {arte === "montanha" && <Circle cx={X + W * 0.25} cy={Y + H * 0.28} r={Math.min(W, H) * 0.1} fill="#F2D16B" stroke={LINHA} strokeWidth={INTERNA} />}
      {arte === "circulos" && [0.3, 0.6, 0.45].map((k, j) => <Circle key={j} cx={X + W * k} cy={Y + H * (0.35 + j * 0.18)} r={Math.min(W, H) * (0.22 - j * 0.04)} fill={[cor, "#5AA5B8", "#F2D16B"][j]} stroke={LINHA} strokeWidth={INTERNA} />)}
      {arte === "listras" && [0, 1, 2, 3].map((j) => <Rect key={j} x={X} y={Y + (H / 4) * j} width={W} height={H / 8} fill={[cor, "#5AA5B8", "#F2D16B", "#7AA35B"][j]} />)}
      {arte === "flor" && (
        <g>
          <Path d={`M ${X + W / 2} ${Y + H} L ${X + W / 2} ${Y + H * 0.45}`} stroke="#4F8A6B" strokeWidth={INTERNA + 1} />
          {[0, 72, 144, 216, 288].map((a) => <Ellipse key={a} cx={X + W / 2 + Math.cos((a * Math.PI) / 180) * W * 0.12} cy={Y + H * 0.38 + Math.sin((a * Math.PI) / 180) * W * 0.12} rx={W * 0.1} ry={W * 0.1} fill={cor} stroke={LINHA} strokeWidth={3} />)}
          <Circle cx={X + W / 2} cy={Y + H * 0.38} r={W * 0.07} fill="#F2D16B" stroke={LINHA} strokeWidth={3} />
        </g>
      )}
      {arte === "sol" && <Circle cx={X + W / 2} cy={Y + H / 2} r={Math.min(W, H) * 0.28} fill={cor} stroke={LINHA} strokeWidth={INTERNA} />}
    </Papel>
  );
};

export const Prateleira: React.FC<{ x: number; y: number; w: number; cor?: string }> = ({ x, y, w, cor = "#A9714E" }) => (
  <Papel>
    <Rect x={x} y={y} width={w} height={16} rx={3} fill={cor} stroke={LINHA} strokeWidth={CONTORNO} />
    <Path d={`M ${x + 24} ${y + 16} l 0 22 l 22 -22 M ${x + w - 24} ${y + 16} l 0 22 l -22 -22`} stroke={LINHA} strokeWidth={INTERNA} fill="none" strokeLinejoin="round" />
  </Papel>
);

/** fileira de livros em pé, apoiada em y */
export const Livros: React.FC<{ x: number; y: number; n: number; semente?: number }> = ({ x, y, n, semente = 1 }) => {
  const cores = ["#C0504D", "#5AA5B8", "#F2D16B", "#7AA35B", "#8E7CC3", "#E0822E", "#3A3F4B"];
  let xx = x;
  return (
    <Papel>
      {Array.from({ length: n }, (_, i) => {
        const w = 16 + ((i * 7 + semente * 3) % 4) * 4;
        const h = 58 + ((i * 11 + semente * 5) % 5) * 9;
        const inclina = i === n - 1 ? 14 : 0;
        const el = <Rect key={i} x={xx} y={y - h} width={w} height={h} rx={2} fill={cores[(i + semente) % cores.length]} stroke={LINHA} strokeWidth={INTERNA} transform={inclina ? `rotate(${inclina} ${xx} ${y})` : undefined} />;
        xx += w + 2;
        return el;
      })}
    </Papel>
  );
};

// ------------------------------------------------------------------ natureza: planta, árvore, nuvem
/** planta no vaso; (x, y) = base do vaso */
export const Planta: React.FC<{ x: number; y: number; s?: number; vaso?: string; folha?: string; tipo?: "costela" | "espada" | "redonda" }> = ({ x, y, s = 1, vaso = "#C86F4E", folha = "#4F8A6B", tipo = "costela" }) => {
  const folhas = tipo === "espada"
    ? [-28, -14, 0, 14, 28].map((a, i) => ({ a, c: 150 + (i % 2) * 30, l: 26 }))
    : tipo === "redonda"
      ? [-60, -30, 0, 30, 60, -45, 45].map((a, i) => ({ a, c: 70 + (i % 3) * 22, l: 36 }))
      : [-70, -40, -12, 16, 44, 72].map((a, i) => ({ a, c: 110 + (i % 3) * 24, l: 52 }));
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <Papel>
        {folhas.map(({ a, c, l }, i) => {
          const r = (a * Math.PI) / 180;
          const tx = Math.sin(r) * c, ty = -70 - Math.cos(r) * c;
          return (
            <g key={i}>
              <Path d={`M 0 -66 Q ${f1(tx * 0.4)} ${f1(-70 - c * 0.5)} ${f1(tx)} ${f1(ty)}`} stroke={escura(folha, 0.7)} strokeWidth={5} fill="none" />
              <Ellipse cx={tx} cy={ty} rx={l * 0.55} ry={l} transform={`rotate(${a} ${f1(tx)} ${f1(ty)})`} fill={folha} stroke={LINHA} strokeWidth={INTERNA + 1} />
              <Line x1={f1(tx - Math.sin(r) * l * 0.7)} y1={f1(ty + Math.cos(r) * l * 0.7)} x2={f1(tx + Math.sin(r) * l * 0.6)} y2={f1(ty - Math.cos(r) * l * 0.6)} stroke={escura(folha, 0.72)} strokeWidth={3} />
            </g>
          );
        })}
        <Path d="M -42 -74 L 42 -74 L 34 0 L -34 0 Z" fill={vaso} stroke={LINHA} strokeWidth={CONTORNO} strokeLinejoin="round" />
        <Rect x={-48} y={-84} width={96} height={16} rx={4} fill={escura(vaso, 0.88)} stroke={LINHA} strokeWidth={CONTORNO} />
      </Papel>
    </g>
  );
};

/** árvore de copa redonda; (x, y) = pé do tronco */
export const Arvore: React.FC<{ x: number; y: number; s?: number; copa?: string; tronco?: string }> = ({ x, y, s = 1, copa = "#7FAE6A", tronco = "#8A5E3F" }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <Papel>
      <Path d="M -14 0 L -10 -120 L 10 -120 L 14 0 Z" fill={tronco} stroke={LINHA} strokeWidth={CONTORNO} strokeLinejoin="round" />
      <Path d="M -92 -150 C -110 -210 -60 -260 -20 -246 C 0 -290 70 -284 80 -236 C 120 -224 116 -160 80 -142 C 70 -108 -60 -100 -92 -150 Z" fill={copa} stroke={LINHA} strokeWidth={CONTORNO} strokeLinejoin="round" />
      <Path d="M -50 -190 q 16 -14 34 -6 M 26 -210 q 16 -6 26 8" stroke={escura(copa)} strokeWidth={INTERNA} fill="none" strokeLinecap="round" />
    </Papel>
  </g>
);

export const Nuvem: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <Papel>
      <Path d="M -90 20 C -120 20 -120 -16 -88 -18 C -84 -50 -40 -56 -24 -32 C -10 -66 50 -62 54 -24 C 86 -34 112 -6 92 20 Z" fill="#FFFFFF" stroke={LINHA} strokeWidth={INTERNA + 1} strokeLinejoin="round" />
    </Papel>
  </g>
);

// ------------------------------------------------------------------ profundidade: luz direcional e vinheta
export const LuzDirecional: React.FC<{ pontos: number[][]; cor: string; opacidade: number }> = ({ pontos, cor, opacidade }) => (
  <polygon points={pontos.map((p) => p.join(",")).join(" ")} fill={cor} opacity={opacidade} />
);

export const Vinheta: React.FC<{ forca?: number }> = ({ forca = 0.34 }) => {
  const id = useId().replace(/:/g, "");
  return (
    <g>
      <defs>
        <radialGradient id={`vin-${id}`} cx="50%" cy="46%" r="72%">
          <stop offset="58%" stopColor="#1C150D" stopOpacity={0} />
          <stop offset="100%" stopColor="#1C150D" stopOpacity={forca} />
        </radialGradient>
      </defs>
      <rect x={0} y={0} width={1920} height={1080} fill={`url(#vin-${id})`} />
    </g>
  );
};
