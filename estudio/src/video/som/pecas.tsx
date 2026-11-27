// Peças em SVG do Short "quase nenhum som que você ouve é real": fundos, formas de onda (as dos sons de verdade da
// trilha), o painel com conta-giros, o pedal, o motor no estúdio, a rua do filme, o estúdio de passos, as caixas,
// os objetos (legume, grão, plástico), o feixe de luz, o projetor e a televisão. Tudo genérico, sem marca nem filme.
import React from "react";
import { FONTE } from "../../fontes";
import ondas from "./ondas.json";

export type Dados = {
  pps: number; fps: number; efeitos: number[]; fixa: number[]; camadas: number[][]; projetor: number[]; tv: number[]; feixe: number[];
  osso: number[]; rpms: number[]; rpm: number[]; acel: number[]; pesos: number[][]; cabeca: number[];
  passos: { q: number; tipo: string; pe: number }[]; faixas: number[];
  eventos: { osso: number; chuva: number; fogo: number; feixe: number; tv: number; soma: number; pisadas: number[][]; erro: number };
};
export const D = ondas as unknown as Dados;
export const AMARELO = "#ffd23f", CIANO = "#38d9f5", MAGENTA = "#ff5ea8", VERDE = "#5ef0a0", VERMELHO = "#ff4a4a";
const em = (a: number[], i: number) => a[Math.max(0, Math.min(a.length - 1, i))] ?? 0;
export const rpmEm = (f: number) => em(D.rpm, f);
export const acelEm = (f: number) => em(D.acel, f);
const saida = (x: number) => 1 - Math.pow(1 - Math.min(1, Math.max(0, x)), 3);

// ---------- fundos ----------
export const Fundo: React.FC<{ tema: "jogo" | "cinema" | "preto" | "estudio"; f: number }> = ({ tema, f }) => {
  if (tema === "preto") return <rect width={1080} height={1920} fill="#000" />;
  const [a, b] = tema === "cinema" ? ["#3b151a", "#100506"] : tema === "estudio" ? ["#242836", "#0c0e15"] : ["#1e2750", "#0a0d1b"];
  return (
    <g>
      <defs>
        <radialGradient id={`fd-${tema}`} cx="0.5" cy="0.42" r="0.8">
          <stop offset="0" stopColor={a} />
          <stop offset="1" stopColor={b} />
        </radialGradient>
      </defs>
      <rect width={1080} height={1920} fill={`url(#fd-${tema})`} />
      {tema === "jogo" && (
        <g stroke="#9fb4ff" strokeOpacity={0.05} strokeWidth={2}>
          {Array.from({ length: 19 }, (_, i) => <line key={`v${i}`} x1={i * 60} y1={0} x2={i * 60} y2={1920} />)}
          {Array.from({ length: 33 }, (_, i) => <line key={`h${i}`} x1={0} y1={i * 60} x2={1080} y2={i * 60} />)}
        </g>
      )}
      {tema === "cinema" && <Grao f={f} />}
    </g>
  );
};
/** grão de filme: pontinhos que mudam a cada quadro */
export const Grao: React.FC<{ f: number; n?: number; x?: number; y?: number; w?: number; h?: number; op?: number }> = ({ f, n = 160, x = 0, y = 0, w = 1080, h = 1920, op = 0.08 }) => {
  let s = (f * 7919 + 17) % 2147483647;
  const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  return <g opacity={op}>{Array.from({ length: n }, (_, i) => <circle key={i} cx={x + r() * w} cy={y + r() * h} r={1 + r() * 2} fill="#fff" />)}</g>;
};

// ---------- textos ----------
export const Texto: React.FC<{ x?: number; y: number; t: string; tam?: number; cor?: string; peso?: number; op?: number; ancora?: "middle" | "start" | "end" }> = ({ x = 540, y, t, tam = 64, cor = "#fff", peso = 900, op = 1, ancora = "middle" }) => (
  <text x={x} y={y} textAnchor={ancora} fontFamily={FONTE} fontWeight={peso} fontSize={tam} fill={cor} opacity={op} stroke="#06070d" strokeWidth={tam * 0.16} strokeLinejoin="round" paintOrder="stroke">{t}</text>
);
export const Etiqueta: React.FC<{ x: number; y: number; t: string; cor?: string; fundo?: string; tam?: number; k?: number }> = ({ x, y, t, cor = "#111", fundo = AMARELO, tam = 48, k = 1 }) => {
  if (k <= 0) return null;
  const w = t.length * tam * 0.66 + tam;
  return (
    <g transform={`translate(${x} ${y}) scale(${0.7 + 0.3 * saida(k)})`} opacity={Math.min(1, k * 2)}>
      <rect x={-w / 2} y={-tam * 0.85} width={w} height={tam * 1.5} rx={tam * 0.3} fill={fundo} stroke="#06070d" strokeWidth={5} />
      <text y={tam * 0.28} textAnchor="middle" fontFamily={FONTE} fontWeight={900} fontSize={tam} fill={cor}>{t}</text>
    </g>
  );
};

// ---------- formas de onda ----------
const Brilho: React.FC<{ id: string; d?: number }> = ({ id, d = 6 }) => (
  <filter id={id} x="-20%" y="-60%" width="140%" height="220%">
    <feGaussianBlur stdDeviation={d} result="b" />
    <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
  </filter>
);
/** barras espelhadas de um trecho de picos (ini/fim em segundos do som); `cabeca` divide o já tocado (aceso) do resto */
export const Onda: React.FC<{
  picos: number[]; ini: number; fim: number; x: number; y: number; w: number; h: number; cor: string;
  barra?: number; vao?: number; ganho?: number; cabeca?: number; apagado?: number; id: string; op?: number;
}> = ({ picos, ini, fim, x, y, w, h, cor, barra = 6, vao = 3, ganho = 1, cabeca, apagado = 0.28, id, op = 1 }) => {
  const n = Math.max(1, Math.floor(w / (barra + vao)));
  let aceso = "", resto = "";
  for (let k = 0; k < n; k++) {
    const a = Math.floor((ini + ((fim - ini) * k) / n) * D.pps), b = Math.max(a + 1, Math.floor((ini + ((fim - ini) * (k + 1)) / n) * D.pps));
    let v = 0;
    for (let i = a; i < b; i++) v = Math.max(v, picos[i] ?? 0);
    const hh = Math.max(3, Math.min(1, v * ganho) * h / 2);
    const px = x + k * (barra + vao);
    const r = `M${px.toFixed(1)} ${(y - hh).toFixed(1)}h${barra}v${(2 * hh).toFixed(1)}h${-barra}z`;
    if (cabeca === undefined || k / n <= cabeca) aceso += r; else resto += r;
  }
  return (
    <g opacity={op}>
      <defs><Brilho id={id} /></defs>
      {resto && <path d={resto} fill={cor} opacity={apagado} />}
      <path d={aceso} fill={cor} filter={`url(#${id})`} />
    </g>
  );
};
/** o som que está tocando agora na trilha de efeitos, passando da direita para a esquerda */
export const OndaViva: React.FC<{ f: number; x: number; y: number; w: number; h: number; cor: string; janela?: number; ganho?: number; id: string; op?: number }> = ({ f, janela = 2.2, ...p }) => {
  const t = f / D.fps;
  return <Onda picos={D.efeitos} ini={t - janela} fim={t} {...p} />;
};

// ---------- o painel com conta-giros ----------
const angRpm = (v: number) => ((225 - (Math.min(8000, Math.max(0, v)) / 8000) * 270) * Math.PI) / 180;
const pol = (cx: number, cy: number, r: number, a: number) => [cx + r * Math.cos(a), cy - r * Math.sin(a)];
const arco = (cx: number, cy: number, r: number, v0: number, v1: number) => {
  const [x0, y0] = pol(cx, cy, r, angRpm(v0)), [x1, y1] = pol(cx, cy, r, angRpm(v1));
  const grande = ((v1 - v0) / 8000) * 270 > 180 ? 1 : 0;
  return `M${x0} ${y0} A${r} ${r} 0 ${grande} 1 ${x1} ${y1}`;
};
export const Painel: React.FC<{ rpm: number; cx?: number; cy?: number; r?: number }> = ({ rpm, cx = 540, cy = 820, r = 330 }) => {
  const [nx, ny] = pol(cx, cy, r * 0.86, angRpm(rpm));
  const [bx, by] = pol(cx, cy, r * 0.14, angRpm(rpm) + Math.PI);
  return (
    <g>
      <defs>
        <radialGradient id="pn-aro" cx="0.5" cy="0.3" r="0.8"><stop offset="0" stopColor="#5b6174" /><stop offset="0.6" stopColor="#23262f" /><stop offset="1" stopColor="#0d0e13" /></radialGradient>
        <radialGradient id="pn-face" cx="0.5" cy="0.4" r="0.7"><stop offset="0" stopColor="#1b2030" /><stop offset="1" stopColor="#07080d" /></radialGradient>
        <Brilho id="pn-br" d={7} />
      </defs>
      <circle cx={cx} cy={cy} r={r + 46} fill="url(#pn-aro)" />
      <circle cx={cx} cy={cy} r={r + 10} fill="url(#pn-face)" stroke="#000" strokeWidth={6} />
      <path d={arco(cx, cy, r * 0.93, 6500, 8000)} stroke={VERMELHO} strokeWidth={22} fill="none" opacity={0.85} />
      {Array.from({ length: 17 }, (_, i) => {
        const v = i * 500, a = angRpm(v), grande = i % 2 === 0;
        const [x0, y0] = pol(cx, cy, r * (grande ? 0.8 : 0.86), a), [x1, y1] = pol(cx, cy, r * 0.95, a);
        return <line key={i} x1={x0} y1={y0} x2={x1} y2={y1} stroke={v >= 6500 ? VERMELHO : "#e8ecf7"} strokeWidth={grande ? 9 : 5} strokeLinecap="round" />;
      })}
      {Array.from({ length: 9 }, (_, i) => {
        const [x, y] = pol(cx, cy, r * 0.64, angRpm(i * 1000));
        return <text key={i} x={x} y={y + 22} textAnchor="middle" fontFamily={FONTE} fontWeight={800} fontSize={64} fill={i >= 7 ? VERMELHO : "#e8ecf7"}>{i}</text>;
      })}
      <text x={cx} y={cy + r * 0.42} textAnchor="middle" fontFamily={FONTE} fontWeight={700} fontSize={34} fill="#8d96b3">×1000 rpm</text>
      <text x={cx} y={cy + r * 0.66} textAnchor="middle" fontFamily={FONTE} fontWeight={900} fontSize={58} fill={AMARELO}>{Math.round(rpm / 10) * 10}</text>
      <line x1={bx} y1={by} x2={nx} y2={ny} stroke="#ff6a2b" strokeWidth={14} strokeLinecap="round" filter="url(#pn-br)" />
      <circle cx={cx} cy={cy} r={34} fill="#2a2e39" stroke="#0a0b10" strokeWidth={6} />
    </g>
  );
};

// ---------- o pé no acelerador ----------
/** vista de lado: o calcanhar fica no assoalho e o pé gira em volta dele; o pedal (articulado no chão) acompanha a ponta */
export const Pedal: React.FC<{ acel: number }> = ({ acel }) => {
  const hx = 300, hy = 1180, L = 430; // calcanhar e comprimento da sola
  const phi = -(33 - 15 * acel); // graus: negativo = ponta do pé para cima
  const pr = (phi * Math.PI) / 180;
  const ponta = [hx + L * Math.cos(pr), hy + L * Math.sin(pr)];
  const px = 800, py = 1180; // dobradiça do pedal
  const theta = (Math.atan2(py - ponta[1], px - ponta[0]) * 180) / Math.PI;
  return (
    <g>
      <rect x={0} y={hy} width={1080} height={740} fill="#16181f" />
      <path d="M880 1180 L1080 860 L1080 1180 Z" fill="#1f222b" />
      <rect x={0} y={hy - 4} width={1080} height={10} fill="#2e3340" />
      <path d="M30 1186 L920 1186 L940 1250 L10 1250 Z" fill="#202430" />
      {Array.from({ length: 13 }, (_, i) => <line key={i} x1={50 + i * 68} y1={1192} x2={40 + i * 70} y2={1244} stroke="#2a2e3a" strokeWidth={5} />)}
      {/* o pedal: placa articulada no chão, a face de cima passando pela ponta do pé */}
      <g transform={`rotate(${theta} ${px} ${py})`}>
        <rect x={px - 380} y={py - 4} width={380} height={46} rx={16} fill="#2f343f" stroke="#0e1015" strokeWidth={8} />
        {Array.from({ length: 7 }, (_, i) => <rect key={i} x={px - 360 + i * 50} y={py + 6} width={28} height={12} rx={6} fill="#1b1e25" />)}
      </g>
      <circle cx={px} cy={py} r={24} fill="#555b6b" stroke="#22252e" strokeWidth={6} />
      {/* perna e tênis, girando em volta do calcanhar */}
      <g transform={`rotate(${phi} ${hx} ${hy})`}>
        <path d={`M${hx} ${hy - 160} L${hx + 135} ${hy - 190} L${hx + 70} ${hy - 900} L${hx - 190} ${hy - 860} Z`} fill="#2d3a5c" stroke="#0e1015" strokeWidth={8} />
        <path d={`M${hx - 8} ${hy - 30} L${hx - 2} ${hy - 170} C${hx + 10} ${hy - 205} ${hx + 90} ${hy - 215} ${hx + 140} ${hy - 195} L${hx + 270} ${hy - 120} C${hx + 360} ${hy - 85} ${hx + 425} ${hy - 70} ${hx + 432} ${hy - 30} Z`} fill="#3c6fd6" stroke="#0e1015" strokeWidth={8} />
        <path d={`M${hx - 14} ${hy} L${hx + 436} ${hy} C${hx + 452} ${hy} ${hx + 455} ${hy - 30} ${hx + 432} ${hy - 32} L${hx - 8} ${hy - 32} C${hx - 24} ${hy - 30} ${hx - 26} ${hy - 4} ${hx - 14} ${hy} Z`} fill="#f2f2ee" stroke="#0e1015" strokeWidth={8} />
        {Array.from({ length: 4 }, (_, i) => <line key={i} x1={hx + 150 + i * 38} y1={hy - 185 + i * 22} x2={hx + 175 + i * 38} y2={hy - 140 + i * 22} stroke="#f2f2ee" strokeWidth={8} strokeLinecap="round" />)}
      </g>
    </g>
  );
};

// ---------- o motor no estúdio, com microfones ----------
const Microfone: React.FC<{ x: number; y: number; ang: number; alto?: number; s?: number; semPe?: boolean }> = ({ x, y, ang, alto = 420, s = 1, semPe = false }) => (
  <g>
    {!semPe && <line x1={x} y1={y} x2={x} y2={y + alto} stroke="#545a68" strokeWidth={10} />}
    {!semPe && <path d={`M${x - 70} ${y + alto} L${x + 70} ${y + alto}`} stroke="#545a68" strokeWidth={12} strokeLinecap="round" />}
    <g transform={`translate(${x} ${y}) rotate(${ang}) scale(${s})`}>
      <rect x={-26} y={-120} width={52} height={150} rx={24} fill="#2a2d35" stroke="#0b0c10" strokeWidth={5} />
      <rect x={-30} y={-150} width={60} height={70} rx={28} fill="#9aa1b1" stroke="#0b0c10" strokeWidth={5} />
      {Array.from({ length: 4 }, (_, i) => <line key={i} x1={-22} y1={-140 + i * 16} x2={22} y2={-140 + i * 16} stroke="#5d6372" strokeWidth={4} />)}
    </g>
  </g>
);
export { Microfone };
export const Espuma: React.FC<{ y0?: number; y1?: number }> = ({ y0 = 0, y1 = 1200 }) => (
  <g>
    <rect x={0} y={y0} width={1080} height={y1 - y0} fill="#232733" />
    {Array.from({ length: Math.ceil((y1 - y0) / 90) }, (_, j) =>
      Array.from({ length: 13 }, (_, i) => (
        <path key={`${i}-${j}`} d={`M${i * 90 - (j % 2) * 45} ${y0 + j * 90 + 90} l45 -80 l45 80 z`} fill={j % 2 ? "#2b303d" : "#1c1f29"} />
      )),
    )}
  </g>
);
export const MotorEstudio: React.FC<{ f: number; tremor?: number }> = ({ f, tremor = 1 }) => {
  const dx = Math.sin(f * 2.3) * 2.5 * tremor, dy = Math.cos(f * 3.1) * 2 * tremor;
  return (
    <g>
      <Espuma y0={0} y1={1240} />
      <rect x={0} y={1240} width={1080} height={680} fill="#15171e" />
      <ellipse cx={540} cy={1300} rx={420} ry={60} fill="#000" opacity={0.45} />
      {/* suporte */}
      <path d="M360 1120 L320 1300 M720 1120 L760 1300 M540 1130 L540 1300" stroke="#6b717f" strokeWidth={18} strokeLinecap="round" />
      <g transform={`translate(${dx} ${dy})`}>
        {/* cárter, bloco, cabeçote, tampa de válvulas */}
        <path d="M330 1040 L750 1040 L720 1130 L360 1130 Z" fill="#30343e" />
        <rect x={300} y={790} width={480} height={260} rx={26} fill="#4a505d" stroke="#14161c" strokeWidth={8} />
        {Array.from({ length: 5 }, (_, i) => <rect key={i} x={330 + i * 92} y={820} width={40} height={200} rx={10} fill="#3c414c" />)}
        <rect x={310} y={700} width={460} height={100} rx={20} fill="#9ba3b1" stroke="#14161c" strokeWidth={8} />
        <rect x={340} y={630} width={400} height={84} rx={30} fill="#b53a2e" stroke="#14161c" strokeWidth={8} />
        {Array.from({ length: 4 }, (_, i) => <circle key={i} cx={390 + i * 100} cy={672} r={12} fill="#14161c" />)}
        {/* admissão (em cima, à esquerda) */}
        {Array.from({ length: 4 }, (_, i) => (
          <path key={i} d={`M${360 + i * 100} 700 C${340 + i * 100} 600 ${280 + i * 40} 560 ${220} 560`} stroke="#8c93a1" strokeWidth={30} fill="none" strokeLinecap="round" />
        ))}
        <rect x={130} y={520} width={110} height={90} rx={20} fill="#6d7381" stroke="#14161c" strokeWidth={6} />
        {/* escapamento (à direita, descendo) */}
        {Array.from({ length: 4 }, (_, i) => (
          <path key={i} d={`M${700 - i * 40} 800 C${820 - i * 10} ${820 + i * 10} ${860} ${900 + i * 20} ${880} ${1020 + i * 8}`} stroke="#b98a5a" strokeWidth={22} fill="none" strokeLinecap="round" />
        ))}
        <rect x={850} y={1010} width={70} height={110} rx={16} fill="#8b6a48" stroke="#14161c" strokeWidth={6} />
        {/* polias e correia */}
        <circle cx={300} cy={980} r={58} fill="#2b2f37" stroke="#14161c" strokeWidth={8} />
        <circle cx={300} cy={760} r={44} fill="#2b2f37" stroke="#14161c" strokeWidth={8} />
        <path d="M244 980 L258 760 M356 980 L342 760" stroke="#0e0f13" strokeWidth={12} />
      </g>
      <Microfone x={140} y={760} ang={-55} alto={540} />
      <Microfone x={960} y={880} ang={50} alto={420} />
      <Microfone x={560} y={460} ang={180} alto={-460} s={0.9} />
    </g>
  );
};

// ---------- cinema: a rua do filme e quem anda nela ----------
/** fase do passo no quadro f: 0 = pé no chão agora, sobe até o próximo passo */
export const fasePasso = (f: number) => {
  const ps = D.passos;
  let a = -1;
  for (let i = 0; i < ps.length; i++) if (ps[i].q <= f) a = i;
  if (a < 0) return { k: 0, pe: 0, tipo: "pedra", desde: 99 };
  const prox = a + 1 < ps.length ? ps[a + 1].q : ps[a].q + 16;
  return { k: Math.min(1, (f - ps[a].q) / Math.max(1, prox - ps[a].q)), pe: ps[a].pe, tipo: ps[a].tipo, desde: f - ps[a].q };
};
/** uma pessoa genérica de perfil, andando (ou marchando no lugar); cor = silhueta ou roupa */
export const Andante: React.FC<{ x: number; y: number; s: number; f: number; silhueta?: boolean; noLugar?: boolean }> = ({ x, y, s, f, silhueta = false, noLugar = false }) => {
  const { k, pe } = fasePasso(f);
  const lado = pe ? 1 : -1;
  const ang = Math.sin(k * Math.PI) * 26 * lado; // a perna de trás vem para a frente
  const ergue = noLugar ? Math.sin(k * Math.PI) * 30 : 0;
  const c = silhueta ? "#07080c" : undefined;
  const perna = (a: number, cor: string, sobe: number) => (
    <g transform={`rotate(${a} 0 -200)`}>
      <path d={`M-22 -200 L22 -200 L18 ${-10 - sobe} L-16 ${-10 - sobe} Z`} fill={c ?? cor} />
      <path d={`M-20 ${-14 - sobe} L52 ${-14 - sobe} C62 ${-14 - sobe} 64 ${4 - sobe} 54 ${4 - sobe} L-22 ${4 - sobe} Z`} fill={c ?? "#1a1c22"} />
    </g>
  );
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {perna(-ang, "#2b3350", pe ? 0 : ergue)}
      <path d="M-40 -380 C-44 -330 -36 -250 -28 -196 L30 -196 C38 -250 44 -330 40 -380 Z" fill={c ?? "#5a6377"} />
      <rect x={-30} y={-420} width={60} height={60} rx={20} fill={c ?? "#5a6377"} />
      <circle cx={4} cy={-450} r={34} fill={c ?? "#c99b7a"} />
      {!silhueta && <path d="M-30 -462 C-24 -496 30 -496 38 -462 C20 -472 -10 -472 -30 -462 Z" fill="#3a2b22" />}
      <path d={`M-8 -370 L${-40 + ang * 1.2} -250`} stroke={c ?? "#4c5468"} strokeWidth={24} strokeLinecap="round" />
      {perna(ang, "#2b3350", pe ? ergue : 0)}
      <path d={`M8 -370 L${40 - ang * 1.2} -250`} stroke={c ?? "#4c5468"} strokeWidth={24} strokeLinecap="round" />
    </g>
  );
};
export const RuaFilme: React.FC<{ f: number; x: number; y: number; w: number; h: number; anda?: number }> = ({ f, x, y, w, h, anda = 0 }) => {
  const id = `rf${Math.round(x)}${Math.round(y)}`;
  return (
    <g>
      <defs>
        <clipPath id={`${id}-c`}><rect x={x} y={y} width={w} height={h} /></clipPath>
        <linearGradient id={`${id}-ceu`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#0b1430" /><stop offset="1" stopColor="#25324f" /></linearGradient>
        <radialGradient id={`${id}-luz`} cx="0.5" cy="0" r="1"><stop offset="0" stopColor="#ffd98a" stopOpacity={0.55} /><stop offset="1" stopColor="#ffd98a" stopOpacity={0} /></radialGradient>
      </defs>
      <g clipPath={`url(#${id}-c)`}>
        <rect x={x} y={y} width={w} height={h} fill={`url(#${id}-ceu)`} />
        {Array.from({ length: 9 }, (_, i) => {
          const bw = w / 7, bh = h * (0.35 + ((i * 37) % 23) / 60);
          return (
            <g key={i}>
              <rect x={x + i * bw * 0.85 - bw * 0.3} y={y + h * 0.72 - bh} width={bw * 0.8} height={bh} fill="#0d1222" />
              {Array.from({ length: 6 }, (_, j) => ((i * 7 + j * 3) % 5 === 0 ? <rect key={j} x={x + i * bw * 0.85 - bw * 0.2 + (j % 2) * bw * 0.3} y={y + h * 0.72 - bh + 20 + Math.floor(j / 2) * bh * 0.22} width={bw * 0.14} height={bh * 0.08} fill="#f3c46b" opacity={0.7} /> : null))}
            </g>
          );
        })}
        <rect x={x} y={y + h * 0.72} width={w} height={h * 0.28} fill="#151a26" />
        <rect x={x} y={y + h * 0.72} width={w} height={h * 0.04} fill="#222937" />
        {[0.2, 0.72].map((p, i) => (
          <g key={i}>
            <rect x={x + w * p} y={y + h * 0.18} width={10} height={h * 0.56} fill="#0a0d16" />
            <path d={`M${x + w * p + 5} ${y + h * 0.2} L${x + w * p - w * 0.12} ${y + h * 0.95} L${x + w * p + w * 0.13} ${y + h * 0.95} Z`} fill={`url(#${id}-luz)`} />
            <circle cx={x + w * p + 5} cy={y + h * 0.19} r={14} fill="#ffe3a3" />
          </g>
        ))}
        <Andante x={x + w * (0.25 + 0.5 * anda)} y={y + h * 0.86} s={h / 900} f={f} silhueta />
        <Grao f={f} n={60} x={x} y={y} w={w} h={h} op={0.12} />
      </g>
      <rect x={x} y={y} width={w} height={h} fill="none" stroke="#000" strokeWidth={10} />
    </g>
  );
};

// ---------- o estúdio de passos ----------
export const Caixa: React.FC<{ x: number; y: number; w: number; tipo: "areia" | "pedra" | "madeira"; f?: number }> = ({ x, y, w, tipo }) => {
  const h = w * 0.42;
  const cor = tipo === "areia" ? "#d8b27a" : tipo === "pedra" ? "#8b8f97" : "#9a6a3e";
  let s = tipo.length * 977;
  const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  return (
    <g>
      <path d={`M${x - w / 2} ${y} L${x + w / 2} ${y} L${x + w / 2 - w * 0.08} ${y - h} L${x - w / 2 + w * 0.08} ${y - h} Z`} fill={cor} stroke="#0d0e12" strokeWidth={8} />
      <path d={`M${x - w / 2} ${y} L${x + w / 2} ${y} L${x + w / 2} ${y + 46} L${x - w / 2} ${y + 46} Z`} fill="#4a3a2b" stroke="#0d0e12" strokeWidth={8} />
      {tipo === "areia" && Array.from({ length: 70 }, (_, i) => <circle key={i} cx={x - w * 0.4 + r() * w * 0.8} cy={y - 8 - r() * (h - 16)} r={2.5} fill="#b38e58" />)}
      {tipo === "pedra" && Array.from({ length: 34 }, (_, i) => <ellipse key={i} cx={x - w * 0.4 + r() * w * 0.8} cy={y - 10 - r() * (h - 20)} rx={9 + r() * 9} ry={6 + r() * 5} fill={r() < 0.5 ? "#a2a6ae" : "#6e727a"} />)}
      {tipo === "madeira" && Array.from({ length: 5 }, (_, i) => <line key={i} x1={x - w / 2 + w * 0.08 * (1 - i / 5)} y1={y - (h * (i + 1)) / 6} x2={x + w / 2 - w * 0.08 * (1 - i / 5)} y2={y - (h * (i + 1)) / 6} stroke="#6e4a29" strokeWidth={5} />)}
    </g>
  );
};
/** o tênis pisando de cima, com poeirinha no impacto */
export const Pisada: React.FC<{ x: number; y: number; s?: number; k: number; desde: number; cor?: string }> = ({ x, y, s = 1, k, desde, cor = "#3c6fd6" }) => {
  const alto = desde < 2 ? 0 : Math.sin(Math.min(1, k) * Math.PI) * 110;
  return (
    <g transform={`translate(${x} ${y - alto}) scale(${s})`}>
      <path d="M-120 -10 C-120 -70 -70 -95 -10 -98 L80 -100 C125 -100 140 -60 132 -20 L126 10 L-118 14 Z" fill={cor} stroke="#0d0e12" strokeWidth={7} />
      <path d="M-124 8 L130 4 C134 26 120 38 100 38 L-104 40 C-122 40 -130 26 -124 8 Z" fill="#f2f2ee" stroke="#0d0e12" strokeWidth={7} />
      {desde < 6 && Array.from({ length: 8 }, (_, i) => {
        const a = (i / 8) * Math.PI * 2, d = 40 + desde * 22;
        return <circle key={i} cx={Math.cos(a) * d * 1.6} cy={30 - Math.abs(Math.sin(a)) * d * 0.5} r={7 - desde} fill="#d9c9a8" opacity={0.8 - desde * 0.12} />;
      })}
    </g>
  );
};

// ---------- os objetos: legume, grão, plástico ----------
export const Aipo: React.FC<{ x: number; y: number; dobra: number; quebrou: number }> = ({ x, y, dobra, quebrou }) => {
  const a = dobra * 28, afasta = quebrou * 60;
  const metade = (lado: number) => (
    <g transform={`translate(${lado * afasta} ${quebrou * 30}) rotate(${lado * a} ${0} 0)`}>
      <path d={`M0 -38 L${lado * 380} -50 C${lado * 410} -48 ${lado * 410} 48 ${lado * 380} 50 L0 38 Z`} fill="#8fcf5b" stroke="#2e5a1c" strokeWidth={7} />
      {[-22, 0, 22].map((dy) => <line key={dy} x1={lado * 10} y1={dy} x2={lado * 370} y2={dy * 1.25} stroke="#5c9c37" strokeWidth={6} />)}
      {lado > 0 && <path d="M380 -50 C430 -110 470 -90 480 -140 M392 0 C450 -20 480 10 520 -10 M380 50 C430 90 470 70 500 110" stroke="#5c9c37" strokeWidth={10} fill="none" strokeLinecap="round" />}
    </g>
  );
  return (
    <g transform={`translate(${x} ${y})`}>
      {metade(-1)}
      {metade(1)}
      {quebrou > 0 && Array.from({ length: 10 }, (_, i) => {
        const ang = -Math.PI / 2 + (i - 4.5) * 0.35, d = 30 + quebrou * 160;
        return <line key={i} x1={Math.cos(ang) * d * 0.6} y1={Math.sin(ang) * d * 0.6} x2={Math.cos(ang) * d} y2={Math.sin(ang) * d} stroke="#cdeeb0" strokeWidth={6} strokeLinecap="round" opacity={1 - quebrou} />;
      })}
    </g>
  );
};
export const Graos: React.FC<{ f: number; de: number; x: number; y: number }> = ({ f, de, x, y }) => {
  const t = (f - de) / 30;
  const bandeja = y + 360;
  const graos = [];
  for (let k = 0; k < 140; k++) {
    const t0 = k * 0.018 + ((k * 37) % 11) * 0.003;
    const dt = t - t0;
    if (dt < 0) break;
    const gx = x - 20 + ((k * 53) % 41) - 20 + dt * (30 + (k % 7) * 10) * (k % 2 ? 1 : -1);
    const gy = y + 40 + 0.5 * 2400 * dt * dt;
    if (gy > bandeja) continue;
    graos.push(<ellipse key={k} cx={gx} cy={gy} rx={6} ry={4} fill="#f3e6c4" transform={`rotate(${k * 40} ${gx} ${gy})`} />);
  }
  const vibra = Math.sin(f * 2.7) * Math.min(1, t) * 2;
  return (
    <g>
      {/* o copo inclinado */}
      <g transform={`translate(${x - 60} ${y - 40}) rotate(115)`}>
        <path d="M-70 -110 L70 -110 L55 110 L-55 110 Z" fill="#c9d3e3" stroke="#0d0e12" strokeWidth={7} opacity={0.95} />
        <path d="M-62 -40 L62 -40 L55 100 L-55 100 Z" fill="#f3e6c4" />
      </g>
      {graos}
      {/* a bandeja fina de metal */}
      <g transform={`translate(0 ${vibra})`}>
        <path d={`M${x - 330} ${bandeja} L${x + 330} ${bandeja} L${x + 290} ${bandeja + 40} L${x - 290} ${bandeja + 40} Z`} fill="#b9c0cc" stroke="#0d0e12" strokeWidth={7} />
        <line x1={x - 300} y1={bandeja + 8} x2={x + 300} y2={bandeja + 8} stroke="#e8edf5" strokeWidth={5} />
      </g>
      {Array.from({ length: 30 }, (_, i) => <ellipse key={i} cx={x - 220 + ((i * 97) % 440)} cy={bandeja - 6} rx={6} ry={4} fill="#f3e6c4" opacity={Math.min(1, t * 1.5)} />)}
    </g>
  );
};
export const Plastico: React.FC<{ f: number; x: number; y: number; aperto: number }> = ({ f, x, y, aperto }) => {
  const q = Math.floor(f / 2);
  const forma = (n: number, raio: number, sem: number) =>
    Array.from({ length: n }, (_, i) => {
      const a = (i / n) * Math.PI * 2;
      const ru = Math.sin(i * 12.9898 + q * 78.233 + sem) * 0.5 + 0.5;
      const rr = raio * (1 - 0.3 * aperto) * (0.72 + 0.4 * ru);
      return [x + Math.cos(a) * rr * 1.15, y + Math.sin(a) * rr * 0.85];
    });
  const caminho = (pts: number[][]) => "M" + pts.map((p) => p.map((v) => v.toFixed(1)).join(" ")).join(" L") + " Z";
  const fora = forma(26, 190, 0), meio = forma(20, 140, 3.1), dentro = forma(14, 85, 7.7);
  return (
    <g>
      <path d={caminho(fora)} fill="#dfe9f5" fillOpacity={0.35} stroke="#ffffff" strokeOpacity={0.9} strokeWidth={4} strokeLinejoin="round" />
      <path d={caminho(meio)} fill="#c9d8ea" fillOpacity={0.35} stroke="#ffffff" strokeOpacity={0.6} strokeWidth={3} strokeLinejoin="round" />
      <path d={caminho(dentro)} fill="#eef4fb" fillOpacity={0.45} stroke="#ffffff" strokeOpacity={0.5} strokeWidth={3} />
      {fora.map((p, i) => (i % 2 ? null : <line key={i} x1={p[0]} y1={p[1]} x2={meio[(i * 7) % meio.length][0]} y2={meio[(i * 7) % meio.length][1]} stroke="#ffffff" strokeOpacity={0.5} strokeWidth={3} />))}
      {meio.map((p, i) => (i % 3 ? null : <line key={`m${i}`} x1={p[0]} y1={p[1]} x2={dentro[(i * 5) % dentro.length][0]} y2={dentro[(i * 5) % dentro.length][1]} stroke="#ffffff" strokeOpacity={0.4} strokeWidth={3} />))}
      {Array.from({ length: 7 }, (_, i) => {
        const brilha = (q + i * 5) % 6 === 0;
        const p = fora[(i * 4) % fora.length];
        return brilha ? <path key={`b${i}`} d={`M${p[0]} ${p[1] - 14} L${p[0] + 4} ${p[1] - 4} L${p[0] + 14} ${p[1]} L${p[0] + 4} ${p[1] + 4} L${p[0]} ${p[1] + 14} L${p[0] - 4} ${p[1] + 4} L${p[0] - 14} ${p[1]} L${p[0] - 4} ${p[1] - 4} Z`} fill="#ffffff" /> : null;
      })}
    </g>
  );
};

// ---------- o feixe, o projetor, a televisão ----------
export const Feixe: React.FC<{ x: number; y0: number; y1: number; k: number; f: number; horizontal?: boolean }> = ({ x, y0, y1, k, f, horizontal = false }) => {
  if (k <= 0) return null;
  const topo = y0 + (y1 - y0) * saida(k);
  const pisca = 0.92 + 0.08 * Math.sin(f * 1.9) * Math.sin(f * 0.7);
  const g = (
    <g opacity={pisca}>
      <defs>
        <filter id="fx-b1" filterUnits="userSpaceOnUse" x={0} y={0} width={1080} height={1920}><feGaussianBlur stdDeviation={34} /></filter>
        <filter id="fx-b2" filterUnits="userSpaceOnUse" x={0} y={0} width={1080} height={1920}><feGaussianBlur stdDeviation={12} /></filter>
      </defs>
      <line x1={x} y1={y0} x2={x} y2={topo} stroke="#3fd3ff" strokeWidth={120} strokeLinecap="round" filter="url(#fx-b1)" opacity={0.7} />
      <line x1={x} y1={y0} x2={x} y2={topo} stroke="#8be8ff" strokeWidth={44} strokeLinecap="round" filter="url(#fx-b2)" />
      <line x1={x} y1={y0} x2={x} y2={topo} stroke="#ffffff" strokeWidth={18} strokeLinecap="round" />
    </g>
  );
  return horizontal ? <g transform={`rotate(90 ${x} ${y0})`}>{g}</g> : g;
};
export const Projetor: React.FC<{ f: number; x: number; y: number }> = ({ f, x, y }) => {
  const giro = f * 9;
  const rolo = (cx: number, cy: number, r: number) => (
    <g transform={`rotate(${giro} ${cx} ${cy})`}>
      <circle cx={cx} cy={cy} r={r} fill="#2a2d33" stroke="#0b0c10" strokeWidth={8} />
      <circle cx={cx} cy={cy} r={r * 0.82} fill="#3e4048" />
      {Array.from({ length: 3 }, (_, i) => {
        const a = (i / 3) * Math.PI * 2;
        return <ellipse key={i} cx={cx + Math.cos(a) * r * 0.5} cy={cy + Math.sin(a) * r * 0.5} rx={r * 0.2} ry={r * 0.2} fill="#16171c" />;
      })}
      <circle cx={cx} cy={cy} r={r * 0.12} fill="#9aa1ad" />
    </g>
  );
  return (
    <g>
      <path d={`M${x + 160} ${y - 40} L${x + 560} ${y - 220} L${x + 560} ${y + 140} Z`} fill="#fff4cf" opacity={0.12} />
      <line x1={x - 150} y1={y - 120} x2={x - 230} y2={y - 330} stroke="#4a4e57" strokeWidth={14} />
      <line x1={x + 70} y1={y - 120} x2={x + 150} y2={y - 330} stroke="#4a4e57" strokeWidth={14} />
      {rolo(x - 230, y - 360, 120)}
      {rolo(x + 150, y - 360, 120)}
      <rect x={x - 250} y={y - 140} width={400} height={230} rx={28} fill="#3d5a4a" stroke="#0b0c10" strokeWidth={8} />
      <rect x={x - 220} y={y - 110} width={150} height={110} rx={12} fill="#2c4236" />
      {Array.from({ length: 5 }, (_, i) => <line key={i} x1={x - 205} y1={y - 95 + i * 20} x2={x - 85} y2={y - 95 + i * 20} stroke="#1d2b23" strokeWidth={6} />)}
      <rect x={x + 150} y={y - 90} width={90} height={90} rx={14} fill="#26292f" stroke="#0b0c10" strokeWidth={7} />
      <circle cx={x + 240} cy={y - 45} r={38} fill="#cfd8e3" stroke="#0b0c10" strokeWidth={7} />
      <rect x={x - 200} y={y + 90} width={300} height={60} rx={10} fill="#2c3036" />
    </g>
  );
};
export const Televisao: React.FC<{ f: number; x: number; y: number }> = ({ f, x, y }) => {
  let s = (f * 104729 + 7) % 2147483647;
  const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  return (
    <g>
      <line x1={x - 40} y1={y - 300} x2={x - 170} y2={y - 520} stroke="#6b707a" strokeWidth={10} />
      <line x1={x + 40} y1={y - 300} x2={x + 170} y2={y - 520} stroke="#6b707a" strokeWidth={10} />
      <rect x={x - 330} y={y - 300} width={660} height={520} rx={46} fill="#7a5a3a" stroke="#0b0c10" strokeWidth={10} />
      <rect x={x - 290} y={y - 260} width={460} height={420} rx={70} fill="#11151c" stroke="#0b0c10" strokeWidth={8} />
      <g>
        <clipPath id="tv-tela"><rect x={x - 280} y={y - 250} width={440} height={400} rx={64} /></clipPath>
        <g clipPath="url(#tv-tela)">
          <rect x={x - 280} y={y - 250} width={440} height={400} fill="#5d6673" />
          {Array.from({ length: 220 }, (_, i) => <rect key={i} x={x - 280 + r() * 440} y={y - 250 + r() * 400} width={4 + r() * 10} height={3} fill={r() < 0.5 ? "#e9eef5" : "#1b1f26"} />)}
          {Array.from({ length: 20 }, (_, i) => <rect key={`l${i}`} x={x - 280} y={y - 250 + i * 20} width={440} height={3} fill="#000" opacity={0.18} />)}
        </g>
      </g>
      <circle cx={x + 240} cy={y - 160} r={34} fill="#d4c2a3" stroke="#0b0c10" strokeWidth={6} />
      <circle cx={x + 240} cy={y - 60} r={34} fill="#d4c2a3" stroke="#0b0c10" strokeWidth={6} />
      {Array.from({ length: 5 }, (_, i) => <line key={i} x1={x + 205} y1={y + 30 + i * 22} x2={x + 275} y2={y + 30 + i * 22} stroke="#4a3622" strokeWidth={6} />)}
      <path d={`M${x - 250} ${y + 220} L${x - 220} ${y + 290} M${x + 250} ${y + 220} L${x + 220} ${y + 290}`} stroke="#3a2a1a" strokeWidth={16} />
    </g>
  );
};
