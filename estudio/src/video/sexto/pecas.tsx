// Peças em SVG do Short "o sexto sentido que você não sente" (motion graphics): a pessoa genérica (com braço que
// alcança um alvo), as linhas do campo magnético, a lousa dos cinco sentidos, o ouvido como nível de bolha, a Terra,
// o eletrocardiograma... de ondas do cérebro (EEG), o mapa com o bando de pássaros, a bússola e a seta do norte.
import React from "react";
import { FONTE } from "../../fontes";
import dados from "./dados.json";

export const E = dados as { toque: number; artic: number[]; equilibrio: number[]; gira: number; sensacao: number; hipotese: number; agulha: number };
export const AMARELO = "#ffd23f", CIANO = "#4fe3ff", ROXO = "#2a1650";
export const suave = (x: number) => { const k = Math.min(1, Math.max(0, x)); return k * k * (3 - 2 * k); };
export const saida = (x: number) => 1 - Math.pow(1 - Math.min(1, Math.max(0, x)), 3);

export const Texto: React.FC<{ x?: number; y: number; t: string; tam?: number; cor?: string; op?: number }> = ({ x = 540, y, t, tam = 70, cor = "#fff", op = 1 }) => (
  <text x={x} y={y} textAnchor="middle" fontFamily={FONTE} fontWeight={900} fontSize={tam} fill={cor} opacity={op} stroke="#050a14" strokeWidth={tam * 0.17} strokeLinejoin="round" paintOrder="stroke">{t}</text>
);
export const Etiqueta: React.FC<{ x: number; y: number; t: string; cor?: string; fundo?: string; tam?: number; k?: number }> = ({ x, y, t, cor = "#111", fundo = AMARELO, tam = 50, k = 1 }) => {
  if (k <= 0) return null;
  const w = t.length * tam * 0.64 + tam;
  return (
    <g transform={`translate(${x} ${y}) scale(${0.7 + 0.3 * saida(k)})`} opacity={Math.min(1, k * 2)}>
      <rect x={-w / 2} y={-tam * 0.85} width={w} height={tam * 1.5} rx={tam * 0.3} fill={fundo} stroke="#050a14" strokeWidth={5} />
      <text y={tam * 0.28} textAnchor="middle" fontFamily={FONTE} fontWeight={900} fontSize={tam} fill={cor}>{t}</text>
    </g>
  );
};
/** o texto do gancho (plano 1 e plano 14) */
export const Gancho: React.FC<{ op?: number }> = ({ op = 1 }) => (
  <g opacity={op}>
    <Texto y={200} t="JÁ IMAGINOU SE" tam={74} />
    <Texto y={300} t="O SER HUMANO EVOLUÍSSE" tam={62} />
    <Texto y={410} t="UM SEXTO SENTIDO?" tam={84} cor={AMARELO} />
  </g>
);

// ---------- fundos ----------
export const Fundo: React.FC<{ tema?: "ciencia" | "hipotese" }> = ({ tema = "ciencia" }) => {
  const [a, b] = tema === "hipotese" ? ["#4a2a8a", "#170b33"] : ["#123a52", "#06121f"];
  return (
    <g>
      <defs>
        <radialGradient id={`sx-${tema}`} cx="0.5" cy="0.45" r="0.85"><stop offset="0" stopColor={a} /><stop offset="1" stopColor={b} /></radialGradient>
      </defs>
      <rect width={1080} height={1920} fill={`url(#sx-${tema})`} />
      <g stroke="#bfefff" strokeOpacity={0.04} strokeWidth={2}>
        {Array.from({ length: 19 }, (_, i) => <line key={`v${i}`} x1={i * 60} y1={0} x2={i * 60} y2={1920} />)}
        {Array.from({ length: 33 }, (_, i) => <line key={`h${i}`} x1={0} y1={i * 60} x2={1080} y2={i * 60} />)}
      </g>
    </g>
  );
};

// ---------- linhas do campo magnético ----------
/** uma família de linhas curvas atravessando a tela, inclinadas `ang` graus, com traços que correm ao longo delas */
export const Campo: React.FC<{ f: number; cx?: number; cy?: number; ang?: number; op?: number; n?: number; cor?: string; largura?: number }> = ({ f, cx = 540, cy = 900, ang = 70, op = 1, n = 9, cor = CIANO, largura = 5 }) => {
  const a = (ang * Math.PI) / 180, dx = Math.cos(a), dy = Math.sin(a), px = -dy, py = dx;
  return (
    <g opacity={op}>
      {Array.from({ length: n }, (_, i) => {
        const d = (i - (n - 1) / 2) * 95;
        const pts: string[] = [];
        for (let u = -1500; u <= 1500; u += 60) {
          const curva = d + 90 * Math.sin(u / 520 + i * 0.6) * (Math.abs(d) / 400 + 0.4);
          pts.push(`${(cx + u * dx + curva * px).toFixed(1)} ${(cy + u * dy + curva * py).toFixed(1)}`);
        }
        return <polyline key={i} points={pts.join(" ")} fill="none" stroke={cor} strokeWidth={largura} strokeOpacity={0.55} strokeDasharray="34 22" strokeDashoffset={-f * 4} strokeLinecap="round" />;
      })}
    </g>
  );
};

// ---------- a pessoa ----------
type V2 = [number, number];
/** braço de dois segmentos que alcança o alvo (cotovelo para fora) */
const ik = (o: V2, alvo: V2, l1: number, l2: number, lado: number): [V2, V2] => {
  let dx = alvo[0] - o[0], dy = alvo[1] - o[1];
  let d = Math.hypot(dx, dy);
  const max = l1 + l2 - 1;
  if (d > max) { dx *= max / d; dy *= max / d; d = max; }
  const a = Math.acos(Math.min(1, Math.max(-1, (l1 * l1 + d * d - l2 * l2) / (2 * l1 * d))));
  const base = Math.atan2(dy, dx) + lado * a;
  const cot: V2 = [o[0] + l1 * Math.cos(base), o[1] + l1 * Math.sin(base)];
  return [cot, [o[0] + dx, o[1] + dy]];
};
export type Pose = {
  olhos?: number; // 0 fechados, 1 abertos
  maoD?: V2; maoE?: V2; // alvos das mãos (coordenadas do corpo; a "direita" da pessoa fica à esquerda da tela)
  ombros?: number; // erguer os ombros (dar de ombros)
  inclina?: number; // graus
  sentado?: boolean;
  juntas?: number[]; // brilho das juntas do braço direito: ombro, cotovelo, punho, ponta do dedo
  silhueta?: boolean;
  aponta?: boolean; // dedo indicador estendido
  cabecaLuz?: number; // linhas de campo "acesas" dentro da cabeça
  ponto?: number; // o ponto apagado atrás da cabeça
};
export const Pessoa: React.FC<{ x: number; y: number; s: number; pose?: Pose; f?: number }> = ({ x, y, s, pose = {}, f = 0 }) => {
  const { olhos = 1, ombros = 0, inclina = 0, sentado = false, juntas, silhueta = false, aponta = false, cabecaLuz = 0, ponto = 0 } = pose;
  const pele = silhueta ? "#0a1a2a" : "#e7b48e", roupa = silhueta ? "#0a1a2a" : "#3f7fbf", calca = silhueta ? "#0a1a2a" : "#2c3e5c";
  const borda = silhueta ? "#4fe3ff" : "#071019";
  const sy = -760 - ombros * 40;
  const SD: V2 = [-125, sy + 20], SE: V2 = [125, sy + 20];
  const maoD = pose.maoD ?? [-170, -430], maoE = pose.maoE ?? [170, -430];
  const [cD, hD] = ik(SD, maoD, 175, 165, -1), [cE, hE] = ik(SE, maoE, 175, 165, 1);
  const braco = (o: V2, c: V2, h: V2, k: string) => (
    <g key={k}>
      <path d={`M${o[0]} ${o[1]} L${c[0]} ${c[1]} L${h[0]} ${h[1]}`} stroke={roupa} strokeWidth={62} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d={`M${o[0]} ${o[1]} L${c[0]} ${c[1]} L${h[0]} ${h[1]}`} stroke={borda} strokeWidth={silhueta ? 3 : 0} fill="none" opacity={0.6} />
      <circle cx={h[0]} cy={h[1]} r={36} fill={pele} stroke={borda} strokeWidth={silhueta ? 3 : 5} />
    </g>
  );
  const dedo = (() => {
    const v = [hD[0] - cD[0], hD[1] - cD[1]], l = Math.hypot(v[0], v[1]) || 1;
    return [hD[0] + (v[0] / l) * 62, hD[1] + (v[1] / l) * 62] as V2;
  })();
  return (
    <g transform={`translate(${x} ${y}) scale(${s}) rotate(${inclina} 0 -400)`}>
      {/* pernas */}
      {sentado ? (
        <g fill={calca}>
          <rect x={-95} y={-430} width={80} height={170} rx={30} />
          <rect x={15} y={-430} width={80} height={170} rx={30} />
          <rect x={-100} y={-280} width={78} height={280} rx={30} />
          <rect x={22} y={-280} width={78} height={280} rx={30} />
        </g>
      ) : (
        <g fill={calca}>
          <rect x={-92} y={-440} width={80} height={440} rx={34} />
          <rect x={12} y={-440} width={80} height={440} rx={34} />
        </g>
      )}
      {/* tronco */}
      <path d={`M-150 ${sy + 10} C-150 ${sy - 30} 150 ${sy - 30} 150 ${sy + 10} L120 -410 L-120 -410 Z`} fill={roupa} stroke={borda} strokeWidth={silhueta ? 4 : 0} />
      {braco(SE, cE, hE, "e")}
      {braco(SD, cD, hD, "d")}
      {aponta && <line x1={hD[0]} y1={hD[1]} x2={dedo[0]} y2={dedo[1]} stroke={pele} strokeWidth={22} strokeLinecap="round" />}
      {/* pescoço e cabeça */}
      <rect x={-34} y={sy - 70} width={68} height={80} fill={pele} />
      {ponto > 0 && <circle cx={140} cy={sy - 210} r={26} fill={AMARELO} opacity={0.15 + 0.35 * ponto * (0.6 + 0.4 * Math.sin(f * 0.35))} />}
      <circle cx={0} cy={sy - 160} r={108} fill={pele} stroke={borda} strokeWidth={silhueta ? 5 : 6} />
      {cabecaLuz > 0 && (
        <g opacity={cabecaLuz}>
          <clipPath id={`cab${Math.round(x)}`}><circle cx={0} cy={sy - 160} r={104} /></clipPath>
          <g clipPath={`url(#cab${Math.round(x)})`}>
            {[-50, 0, 50].map((d, i) => <path key={i} d={`M${-120} ${sy - 160 + d - 30} C-40 ${sy - 160 + d + 30} 40 ${sy - 160 + d - 30} 120 ${sy - 160 + d + 20}`} stroke={AMARELO} strokeWidth={9} fill="none" strokeDasharray="20 12" strokeDashoffset={-f * 3} />)}
          </g>
          <circle cx={0} cy={sy - 160} r={130} fill={AMARELO} opacity={0.12} />
        </g>
      )}
      {!silhueta && <path d={`M-108 ${sy - 175} C-100 ${sy - 290} 100 ${sy - 290} 108 ${sy - 175} C70 ${sy - 230} -70 ${sy - 230} -108 ${sy - 175} Z`} fill="#3a2a22" />}
      {!silhueta && [-38, 38].map((ex) => (
        olhos > 0.1
          ? <g key={ex}><ellipse cx={ex} cy={sy - 160} rx={15} ry={15 * olhos} fill="#fff" stroke="#071019" strokeWidth={4} /><circle cx={ex} cy={sy - 160} r={7 * olhos} fill="#111" /></g>
          : <path key={ex} d={`M${ex - 16} ${sy - 160} Q${ex} ${sy - 148} ${ex + 16} ${sy - 160}`} stroke="#071019" strokeWidth={5} fill="none" strokeLinecap="round" />
      ))}
      {!silhueta && <path d={`M-22 ${sy - 108} L22 ${sy - 108}`} stroke="#8a4f3e" strokeWidth={6} strokeLinecap="round" />}
      {/* as juntas que acendem */}
      {juntas && [SD, cD, hD, dedo].map((p, i) => (
        <g key={`j${i}`} opacity={0.25 + 0.75 * (juntas[i] ?? 0)}>
          <circle cx={p[0]} cy={p[1]} r={34 + 14 * (juntas[i] ?? 0)} fill={AMARELO} opacity={0.35 * (juntas[i] ?? 0)} />
          <circle cx={p[0]} cy={p[1]} r={16} fill={AMARELO} stroke="#071019" strokeWidth={4} />
        </g>
      ))}
    </g>
  );
};
/** posições úteis no corpo (para alvos das mãos) */
export const NARIZ: V2 = [0, -905];

// ---------- a lousa dos cinco sentidos ----------
const giz = { stroke: "#f2f6f0", strokeWidth: 7, fill: "none", strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
export const Lousa: React.FC<{ f: number; risca: number; escreve: number }> = ({ risca, escreve }) => (
  <g>
    <rect x={60} y={360} width={960} height={1060} rx={24} fill="#7a5233" />
    <rect x={95} y={395} width={890} height={990} rx={10} fill="#22443a" />
    <text x={540} y={560} textAnchor="middle" fontFamily={FONTE} fontWeight={800} fontSize={110} fill="#f2f6f0" opacity={0.92}>5 SENTIDOS</text>
    {/* olho, ouvido, nariz, boca, mão */}
    <g transform="translate(200 760)" {...giz}><path d="M-60 0 Q0 -50 60 0 Q0 50 -60 0 Z" /><circle cx={0} cy={0} r={18} /></g>
    <g transform="translate(370 760)" {...giz}><path d="M-20 -50 C40 -60 50 10 10 30 C-10 40 0 60 -20 55" /><path d="M-5 -20 C15 -25 18 0 5 5" /></g>
    <g transform="translate(540 760)" {...giz}><path d="M0 -55 L-25 25 C-10 40 10 40 25 25 Z" /></g>
    <g transform="translate(710 760)" {...giz}><path d="M-55 0 C-20 -25 20 -25 55 0 C20 30 -20 30 -55 0 Z" /><path d="M-50 0 L50 0" /></g>
    <g transform="translate(880 760)" {...giz}><path d="M-30 50 L-30 -10 M-30 -10 L-30 -50 M-10 -10 L-10 -60 M10 -10 L10 -55 M30 -5 L30 -40 M-30 50 C-30 70 30 70 35 40 L35 -5 M-30 10 L-55 -10" /></g>
    {/* o X no 5 e o JÁ TEM MAIS */}
    <path d="M150 440 L280 600 M280 440 L150 600" stroke="#ff5a5a" strokeWidth={16} strokeLinecap="round" strokeDasharray={420} strokeDashoffset={420 * (1 - risca)} />
    <text x={540} y={1080} textAnchor="middle" fontFamily={FONTE} fontWeight={900} fontSize={120} fill="none" stroke={AMARELO} strokeWidth={4} strokeDasharray={2600} strokeDashoffset={2600 * (1 - escreve)}>JÁ TEM MAIS</text>
    <text x={540} y={1080} textAnchor="middle" fontFamily={FONTE} fontWeight={900} fontSize={120} fill={AMARELO} opacity={Math.max(0, escreve * 2 - 1)}>JÁ TEM MAIS</text>
    <rect x={95} y={1385} width={890} height={30} fill="#6a4529" />
  </g>
);

// ---------- o ouvido como nível de bolha ----------
export const Nivel: React.FC<{ x: number; y: number; bolha: number }> = ({ x, y, bolha }) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={-260} y={-60} width={520} height={120} rx={60} fill="#cfeec9" stroke="#071019" strokeWidth={8} />
    <rect x={-235} y={-38} width={470} height={76} rx={38} fill="#9ee09a" />
    <line x1={-40} y1={-48} x2={-40} y2={48} stroke="#071019" strokeWidth={5} />
    <line x1={40} y1={-48} x2={40} y2={48} stroke="#071019" strokeWidth={5} />
    <ellipse cx={bolha * 180} cy={0} rx={52} ry={28} fill="#f4fff2" stroke="#4f8f4c" strokeWidth={4} />
  </g>
);
export const Ouvido: React.FC<{ x: number; y: number; s: number }> = ({ x, y, s }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} fill="none" stroke="#ffd0b8" strokeWidth={22} strokeLinecap="round">
    <path d="M60 60 C60 10 110 0 120 40 C130 80 90 100 70 80 C55 65 70 45 85 55" />
    <path d="M-20 0 C-60 -80 20 -130 60 -70" />
    <path d="M-20 0 C-110 -20 -100 -120 -30 -110" />
    <path d="M-20 0 C-80 60 -10 120 30 60" />
    <path d="M-20 0 L60 60" />
  </g>
);

// ---------- a Terra, o EEG, o mapa, os pássaros, a bússola, a seta ----------
export const Terra: React.FC<{ x: number; y: number; r: number; f: number }> = ({ x, y, r, f }) => {
  const gira = (f * 0.9) % (r * 4);
  return (
    <g>
      <defs><clipPath id="sx-terra"><circle cx={x} cy={y} r={r} /></clipPath></defs>
      <circle cx={x} cy={y} r={r} fill="#2f6fd6" stroke="#071019" strokeWidth={8} />
      <g clipPath="url(#sx-terra)" fill="#5fbf6a">
        {[0, 1].map((k) => (
          <g key={k} transform={`translate(${x - r * 2 + gira - k * r * 4} ${y})`}>
            <path d={`M${r * 0.6} ${-r * 0.5} C${r * 1.0} ${-r * 0.7} ${r * 1.3} ${-r * 0.2} ${r * 1.1} ${r * 0.1} C${r * 0.9} ${r * 0.5} ${r * 0.7} ${r * 0.2} ${r * 0.5} ${-r * 0.1} Z`} />
            <path d={`M${r * 1.8} ${-r * 0.2} C${r * 2.2} ${-r * 0.5} ${r * 2.6} ${-r * 0.1} ${r * 2.4} ${r * 0.5} C${r * 2.2} ${r * 0.8} ${r * 1.9} ${r * 0.4} ${r * 1.8} ${-r * 0.2} Z`} />
            <path d={`M${r * 3.0} ${-r * 0.6} C${r * 3.5} ${-r * 0.7} ${r * 3.6} ${-r * 0.3} ${r * 3.3} ${r * 0.0} C${r * 3.1} ${r * 0.1} ${r * 2.9} ${-r * 0.3} ${r * 3.0} ${-r * 0.6} Z`} />
          </g>
        ))}
      </g>
      <circle cx={x - r * 0.35} cy={y - r * 0.35} r={r * 0.5} fill="#ffffff" opacity={0.12} />
      {/* linhas de campo saindo dos polos */}
      {[1.4, 1.9, 2.5, 3.2].map((k, i) => (
        <g key={i} fill="none" stroke={CIANO} strokeWidth={5} strokeOpacity={0.6} strokeDasharray="24 16" strokeDashoffset={-f * 3}>
          <path d={`M${x} ${y - r} C${x + r * k} ${y - r * k} ${x + r * k} ${y + r * k} ${x} ${y + r}`} />
          <path d={`M${x} ${y - r} C${x - r * k} ${y - r * k} ${x - r * k} ${y + r * k} ${x} ${y + r}`} />
        </g>
      ))}
    </g>
  );
};
export const Cadeira: React.FC<{ x: number; y: number; s: number }> = ({ x, y, s }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} fill="#6b4a2e" stroke="#071019" strokeWidth={6}>
    <rect x={-170} y={-820} width={340} height={420} rx={24} />
    <rect x={-190} y={-430} width={380} height={60} rx={14} />
    <rect x={-170} y={-370} width={34} height={370} />
    <rect x={136} y={-370} width={34} height={370} />
  </g>
);
/** ondas do EEG: grandes e regulares; caem para ~45% depois do "gira" (diminuem, não somem) */
export const OndasEEG: React.FC<{ x: number; y: number; w: number; h: number; f: number; amp: (q: number) => number; cor?: string }> = ({ x, y, w, h, f, amp, cor = AMARELO }) => {
  const pts: string[] = [];
  const n = 200, janela = 75;
  for (let i = 0; i <= n; i++) {
    const q = f - janela + (janela * i) / n;
    const v = Math.sin(q * 1.4) * amp(q) * (0.85 + 0.15 * Math.sin(q * 0.37));
    pts.push(`${(x + (w * i) / n).toFixed(1)} ${(y - v * h / 2).toFixed(1)}`);
  }
  return (
    <g>
      <rect x={x - 20} y={y - h / 2 - 30} width={w + 40} height={h + 60} rx={20} fill="#06121f" opacity={0.9} stroke="#2a5a7a" strokeWidth={4} />
      <polyline points={pts.join(" ")} fill="none" stroke={cor} strokeWidth={7} strokeLinejoin="round" />
    </g>
  );
};
export const Mapa: React.FC = () => (
  <g>
    <rect width={1080} height={1920} fill="#0f4f6a" />
    <path d="M-20 300 C180 240 320 380 420 330 C560 260 640 420 760 380 C880 340 980 420 1100 380 L1100 760 C900 820 760 700 600 760 C440 820 300 700 160 760 C80 790 20 760 -20 780 Z" fill="#cfe6b5" />
    <path d="M-20 1100 C140 1040 300 1160 470 1120 C640 1080 760 1220 920 1180 C1000 1160 1060 1190 1100 1180 L1100 1720 C920 1780 760 1660 560 1720 C380 1770 200 1680 -20 1720 Z" fill="#cfe6b5" />
    {Array.from({ length: 10 }, (_, i) => <circle key={i} cx={(i * 197) % 1080} cy={420 + ((i * 131) % 300)} r={10} fill="#9fc48a" />)}
  </g>
);
export const Passaro: React.FC<{ x: number; y: number; s: number; f: number; ang?: number }> = ({ x, y, s, f, ang = 0 }) => {
  const b = Math.sin(f * 0.9 + x * 0.01) * 22;
  return <path transform={`translate(${x} ${y}) rotate(${ang}) scale(${s})`} d={`M-60 ${-b} Q-30 -10 0 6 Q30 -10 60 ${-b}`} stroke="#1a2230" strokeWidth={10} fill="none" strokeLinecap="round" strokeLinejoin="round" />;
};
export const Bussola: React.FC<{ x: number; y: number; r: number; ang: number }> = ({ x, y, r, ang }) => (
  <g transform={`translate(${x} ${y})`}>
    <circle r={r} fill="#f4f1ea" stroke="#071019" strokeWidth={8} />
    <text y={-r * 0.62} textAnchor="middle" fontFamily={FONTE} fontWeight={900} fontSize={r * 0.36} fill="#c0392b">N</text>
    <g transform={`rotate(${ang})`}>
      <path d={`M0 ${-r * 0.75} L${r * 0.13} 0 L${-r * 0.13} 0 Z`} fill="#e23b3b" />
      <path d={`M0 ${r * 0.75} L${r * 0.13} 0 L${-r * 0.13} 0 Z`} fill="#4a5060" />
    </g>
    <circle r={r * 0.08} fill="#071019" />
  </g>
);
export const SetaN: React.FC<{ x: number; y: number; s: number; pulsa?: number }> = ({ x, y, s, pulsa = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s * (1 + 0.08 * pulsa)})`}>
    <circle r={110} fill={AMARELO} opacity={0.18 + 0.2 * pulsa} />
    <path d="M0 -90 L55 10 L18 10 L18 80 L-18 80 L-18 10 L-55 10 Z" fill={AMARELO} stroke="#071019" strokeWidth={8} />
    <text y={-110} textAnchor="middle" fontFamily={FONTE} fontWeight={900} fontSize={70} fill="#ffffff" stroke="#071019" strokeWidth={10} paintOrder="stroke">N</text>
  </g>
);
