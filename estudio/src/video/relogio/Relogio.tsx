// Relógio de pulso em SVG com acabamento de foto de produto: caixa metálica com degradê, mostrador com reflexo em
// raios (sunburst), índices aplicados com brilho, ponteiros com duas faces (a luz pega um lado), sombra dos ponteiros,
// janela de data, submostradores e o reflexo do vidro. Todas as marcas são inventadas (nenhum logotipo real).
import React from "react";
import { FONTE } from "../../fontes";

export type Estilo = {
  caixa: "redonda" | "quadrada" | "almofada";
  metal: "aco" | "ouro" | "rose" | "preto" | "titanio";
  mostrador: string;      // cor base do mostrador
  raios?: boolean;        // reflexo sunburst
  indices: "bastao" | "romanos" | "arabicos" | "pontos" | "mergulho";
  ponteiros: "dauphine" | "espada" | "bastao" | "lapis";
  corPonteiro?: string;
  corIndice?: string;
  corSegundos?: string;
  marca: string;
  subtitulo?: string;
  data?: boolean;
  sub?: boolean;          // dois submostradores (cronógrafo)
  luneta?: string;        // bisel colorido de mergulho
  pulseira?: "couro" | "metal" | "borracha" | "nenhuma";
  corPulseira?: string;
};

export const ESTILOS: Record<string, Estilo> = {
  classico: { caixa: "redonda", metal: "ouro", mostrador: "#F3EEE2", raios: true, indices: "romanos", ponteiros: "dauphine", corPonteiro: "#B88A2E", corIndice: "#2A2A2A", marca: "VALDREN", subtitulo: "AUTOMATIC", pulseira: "couro", corPulseira: "#5A3220" },
  mergulho: { caixa: "redonda", metal: "aco", mostrador: "#101820", raios: true, indices: "mergulho", ponteiros: "espada", corPonteiro: "#E8EDF2", corIndice: "#F2F2EA", corSegundos: "#E0402E", marca: "NORVIK", subtitulo: "300M", data: true, luneta: "#14233A", pulseira: "metal" },
  azul: { caixa: "redonda", metal: "aco", mostrador: "#1D4E89", raios: true, indices: "bastao", ponteiros: "bastao", corPonteiro: "#F4F6F8", corIndice: "#F4F6F8", marca: "SOLVEN", subtitulo: "CHRONOMETER", data: true, pulseira: "metal" },
  verde: { caixa: "redonda", metal: "ouro", mostrador: "#1F4A3A", raios: true, indices: "bastao", ponteiros: "dauphine", corPonteiro: "#E6C77A", corIndice: "#E6C77A", marca: "OKTAVO", pulseira: "couro", corPulseira: "#2B1B12" },
  branco: { caixa: "redonda", metal: "aco", mostrador: "#FAFAF7", indices: "pontos", ponteiros: "lapis", corPonteiro: "#1A1A1A", corIndice: "#1A1A1A", corSegundos: "#D23B2A", marca: "KAELO", pulseira: "borracha", corPulseira: "#1C1C1E" },
  crono: { caixa: "redonda", metal: "titanio", mostrador: "#2A2C31", raios: true, indices: "arabicos", ponteiros: "espada", corPonteiro: "#F0F0F0", corIndice: "#F0F0F0", corSegundos: "#F2A23A", marca: "ZEPHYRA", subtitulo: "CHRONOGRAPH", data: true, sub: true, pulseira: "borracha", corPulseira: "#2A2C31" },
  rose: { caixa: "almofada", metal: "rose", mostrador: "#F4E6E0", raios: true, indices: "bastao", ponteiros: "dauphine", corPonteiro: "#B5735F", corIndice: "#B5735F", marca: "AUREN", pulseira: "couro", corPulseira: "#3B2A26" },
  preto: { caixa: "redonda", metal: "preto", mostrador: "#0E0E10", indices: "arabicos", ponteiros: "espada", corPonteiro: "#E9E2C8", corIndice: "#E9E2C8", corSegundos: "#E9E2C8", marca: "RAVEK", subtitulo: "PILOT", pulseira: "couro", corPulseira: "#4A3A28" },
  quadrado: { caixa: "quadrada", metal: "ouro", mostrador: "#EFE7D4", indices: "romanos", ponteiros: "bastao", corPonteiro: "#1F2B4A", corIndice: "#1F2B4A", marca: "LIORE", pulseira: "couro", corPulseira: "#141414" },
  vermelho: { caixa: "redonda", metal: "aco", mostrador: "#8E1E24", raios: true, indices: "bastao", ponteiros: "bastao", corPonteiro: "#F4F1EA", corIndice: "#F4F1EA", marca: "MAVREN", data: true, pulseira: "metal" },
  areia: { caixa: "redonda", metal: "titanio", mostrador: "#D9CBB0", indices: "pontos", ponteiros: "espada", corPonteiro: "#2A2722", corIndice: "#2A2722", corSegundos: "#C9502F", marca: "TERRAN", subtitulo: "FIELD", pulseira: "couro", corPulseira: "#6B4A2E" },
  roxo: { caixa: "almofada", metal: "aco", mostrador: "#3A2A5C", raios: true, indices: "mergulho", ponteiros: "lapis", corPonteiro: "#F2F2F2", corIndice: "#F2F2F2", corSegundos: "#F2C14E", marca: "ORVANE", data: true, luneta: "#241A3A", pulseira: "borracha", corPulseira: "#241A3A" },
};

const METAL: Record<Estilo["metal"], [string, string, string]> = {
  aco: ["#F4F6F8", "#8C949E", "#3C434B"],
  ouro: ["#FFF1C2", "#C9A24A", "#6E5216"],
  rose: ["#FFE1D6", "#C98A74", "#6E3E2E"],
  preto: ["#6A6E75", "#26282C", "#0A0B0C"],
  titanio: ["#E2E4E6", "#9A9FA5", "#55595E"],
};

/** ângulos (graus, 0 = 12h, horário) a partir de uma hora */
export const angulos = (h: number, m: number, s = 35) => ({ hora: ((h % 12) + m / 60) * 30, min: (m + s / 60) * 6, seg: s * 6 });

let uid = 0;

export type RelogioProps = {
  estilo: Estilo;
  r?: number;                  // raio do mostrador
  hora?: number; min?: number; seg?: number;   // ângulos dos ponteiros (graus) — use angulos()
  mostraLogo?: number;         // 0..1
  brilhoPonteiros?: number;    // destaque dos ponteiros (0..1)
  semSegundos?: boolean;
  semPulseira?: boolean;
};

const Ponteiro: React.FC<{ tipo: Estilo["ponteiros"]; comp: number; larg: number; cor: string; ang: number; sombra?: boolean }> = ({ tipo, comp, larg, cor, ang, sombra }) => {
  const claro = sombra ? "#000" : cor;
  const escuro = sombra ? "#000" : sombreia(cor, 0.62);
  const cauda = comp * 0.16;
  let a: string, b: string;
  if (tipo === "dauphine") {
    a = `M 0 ${cauda} L ${-larg} 0 L 0 ${-comp} Z`;
    b = `M 0 ${cauda} L ${larg} 0 L 0 ${-comp} Z`;
  } else if (tipo === "espada") {
    a = `M 0 ${cauda} L ${-larg * 0.55} ${cauda * 0.4} L ${-larg} ${-comp * 0.55} L 0 ${-comp} Z`;
    b = `M 0 ${cauda} L ${larg * 0.55} ${cauda * 0.4} L ${larg} ${-comp * 0.55} L 0 ${-comp} Z`;
  } else if (tipo === "lapis") {
    a = `M 0 ${cauda} L ${-larg * 0.7} ${cauda * 0.6} L ${-larg * 0.7} ${-comp * 0.85} L 0 ${-comp} Z`;
    b = `M 0 ${cauda} L ${larg * 0.7} ${cauda * 0.6} L ${larg * 0.7} ${-comp * 0.85} L 0 ${-comp} Z`;
  } else {
    a = `M ${-larg * 0.6} ${cauda} L ${-larg * 0.6} ${-comp} L 0 ${-comp} L 0 ${cauda} Z`;
    b = `M ${larg * 0.6} ${cauda} L ${larg * 0.6} ${-comp} L 0 ${-comp} L 0 ${cauda} Z`;
  }
  return (
    <g transform={`rotate(${ang})`} opacity={sombra ? 0.35 : 1}>
      <path d={a} fill={claro} />
      <path d={b} fill={escuro} />
    </g>
  );
};

/** escurece (k<1) ou clareia (k>1) uma cor #rrggbb */
export const sombreia = (hex: string, k: number) => {
  const h = hex.replace("#", "");
  const c = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
  const f = (v: number) => Math.max(0, Math.min(255, Math.round(k < 1 ? v * k : v + (255 - v) * (k - 1))));
  return "#" + c.map((v) => f(v).toString(16).padStart(2, "0")).join("");
};

const Indices: React.FC<{ e: Estilo; r: number }> = ({ e, r }) => {
  const cor = e.corIndice ?? "#222";
  const ROM = ["XII", "I", "II", "III", "IIII", "V", "VI", "VII", "VIII", "IX", "X", "XI"];
  return (
    <g>
      {Array.from({ length: 60 }, (_, i) => {
        const a = (i * 6 * Math.PI) / 180;
        const grande = i % 5 === 0;
        const r1 = r * 0.955, r2 = r * (grande ? 0.9 : 0.93);
        return <line key={`t${i}`} x1={Math.sin(a) * r1} y1={-Math.cos(a) * r1} x2={Math.sin(a) * r2} y2={-Math.cos(a) * r2} stroke={cor} strokeWidth={grande ? r * 0.012 : r * 0.006} opacity={0.75} />;
      })}
      {Array.from({ length: 12 }, (_, i) => {
        const ang = i * 30;
        if (e.data && i === 3) return null;
        if (e.sub && (i === 6 || i === 9)) return null;
        const rr = r * 0.78;
        const x = Math.sin((ang * Math.PI) / 180) * rr, y = -Math.cos((ang * Math.PI) / 180) * rr;
        if (e.indices === "romanos") {
          return <text key={i} x={x} y={y + r * 0.055} textAnchor="middle" fontFamily="Georgia, 'Times New Roman', serif" fontWeight={700} fontSize={r * (i === 0 ? 0.17 : 0.14)} fill={cor} transform={`rotate(${ang} ${x} ${y})`}>{ROM[i]}</text>;
        }
        if (e.indices === "arabicos") {
          return <text key={i} x={x} y={y + r * 0.06} textAnchor="middle" fontFamily={FONTE} fontWeight={800} fontSize={r * 0.16} fill={cor}>{i === 0 ? 12 : i}</text>;
        }
        if (e.indices === "pontos") {
          return <circle key={i} cx={x} cy={y} r={r * (i % 3 === 0 ? 0.045 : 0.03)} fill={cor} />;
        }
        if (e.indices === "mergulho") {
          if (i === 0) return <path key={i} d={`M ${-r * 0.07} ${-r * 0.86} L ${r * 0.07} ${-r * 0.86} L 0 ${-r * 0.72} Z`} fill={cor} stroke={sombreia(cor, 0.6)} strokeWidth={r * 0.008} />;
          if (i % 3 === 0) return <rect key={i} x={-r * 0.03} y={-r * 0.87} width={r * 0.06} height={r * 0.16} rx={r * 0.01} fill={cor} transform={`rotate(${ang})`} />;
          return <circle key={i} cx={x * 1.04} cy={y * 1.04} r={r * 0.045} fill={cor} stroke={sombreia(cor, 0.6)} strokeWidth={r * 0.006} />;
        }
        // bastão aplicado: duas faces
        return (
          <g key={i} transform={`rotate(${ang})`}>
            <rect x={-r * 0.022} y={-r * 0.88} width={r * 0.022} height={r * (i === 0 ? 0.2 : 0.15)} fill={sombreia(cor, 1.25)} />
            <rect x={0} y={-r * 0.88} width={r * 0.022} height={r * (i === 0 ? 0.2 : 0.15)} fill={sombreia(cor, 0.7)} />
            {i === 0 && <rect x={-r * 0.06} y={-r * 0.88} width={r * 0.022} height={r * 0.2} fill={sombreia(cor, 1.2)} />}
            {i === 0 && <rect x={r * 0.04} y={-r * 0.88} width={r * 0.022} height={r * 0.2} fill={sombreia(cor, 0.7)} />}
          </g>
        );
      })}
    </g>
  );
};

export const Relogio: React.FC<RelogioProps> = ({ estilo: e, r = 300, hora, min, seg, mostraLogo = 1, brilhoPonteiros = 0, semSegundos, semPulseira }) => {
  const [id] = React.useState(() => `rl${uid++}`);
  const ang = angulos(10, 10);
  const h = hora ?? ang.hora, m = min ?? ang.min, s = seg ?? ang.seg;
  const [m1, m2, m3] = METAL[e.metal];
  const R = r * 1.16; // borda externa da caixa
  const corP = e.corPonteiro ?? "#EEE";
  const forma = (k: number) =>
    e.caixa === "redonda" ? <circle r={R * k} /> : e.caixa === "quadrada" ? <rect x={-R * k} y={-R * k} width={2 * R * k} height={2 * R * k} rx={R * k * 0.18} /> : <rect x={-R * k} y={-R * k} width={2 * R * k} height={2 * R * k} rx={R * k * 0.42} />;
  const pulseira = !semPulseira && e.pulseira !== "nenhuma";
  const corPul = e.corPulseira ?? m2;
  return (
    <g>
      <defs>
        <linearGradient id={`${id}m`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={m1} /><stop offset="0.45" stopColor={m2} /><stop offset="0.55" stopColor={m3} /><stop offset="1" stopColor={m1} />
        </linearGradient>
        <linearGradient id={`${id}m2`} x1="1" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={m3} /><stop offset="0.5" stopColor={m1} /><stop offset="1" stopColor={m2} />
        </linearGradient>
        <radialGradient id={`${id}d`} cx="0.42" cy="0.38" r="0.75">
          <stop offset="0" stopColor={sombreia(e.mostrador, 1.12)} /><stop offset="0.7" stopColor={e.mostrador} /><stop offset="1" stopColor={sombreia(e.mostrador, 0.72)} />
        </radialGradient>
        <radialGradient id={`${id}v`} cx="0.3" cy="0.2" r="0.6">
          <stop offset="0" stopColor="#FFFFFF" stopOpacity={0.32} /><stop offset="1" stopColor="#FFFFFF" stopOpacity={0} />
        </radialGradient>
        <linearGradient id={`${id}p`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={sombreia(corPul, 0.7)} /><stop offset="0.5" stopColor={sombreia(corPul, 1.15)} /><stop offset="1" stopColor={sombreia(corPul, 0.7)} />
        </linearGradient>
        <filter id={`${id}s`} x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation={r * 0.012} /></filter>
        <clipPath id={`${id}c`}>{e.caixa === "redonda" ? <circle r={r} /> : forma(0.86)}</clipPath>
      </defs>
      {/* pulseira */}
      {pulseira && [-1, 1].map((lado) => (
        <g key={lado}>
          <path d={`M ${-r * 0.62} ${lado * R * 0.78} L ${r * 0.62} ${lado * R * 0.78} L ${r * 0.56} ${lado * R * 2.2} L ${-r * 0.56} ${lado * R * 2.2} Z`} fill={`url(#${id}p)`} />
          {e.pulseira === "metal" && Array.from({ length: 7 }, (_, i) => <line key={i} x1={-r * 0.6} x2={r * 0.6} y1={lado * (R * 0.95 + i * r * 0.2)} y2={lado * (R * 0.95 + i * r * 0.2)} stroke={m3} strokeWidth={r * 0.012} opacity={0.6} />)}
          {e.pulseira === "couro" && <path d={`M ${-r * 0.52} ${lado * R * 0.85} L ${-r * 0.48} ${lado * R * 2.2} M ${r * 0.52} ${lado * R * 0.85} L ${r * 0.48} ${lado * R * 2.2}`} stroke={sombreia(corPul, 1.4)} strokeWidth={r * 0.008} strokeDasharray={`${r * 0.03} ${r * 0.02}`} opacity={0.7} />}
        </g>
      ))}
      {/* sombra da caixa */}
      <g transform={`translate(${r * 0.04} ${r * 0.07})`} filter={`url(#${id}s)`} opacity={0.55} fill="#000">{forma(1.0)}</g>
      {/* coroa */}
      <rect x={R * 0.96} y={-r * 0.1} width={r * 0.14} height={r * 0.2} rx={r * 0.03} fill={`url(#${id}m)`} />
      {/* caixa e luneta */}
      <g fill={`url(#${id}m)`}>{forma(1.0)}</g>
      <g fill={`url(#${id}m2)`}>{forma(0.93)}</g>
      {e.luneta && (
        <g>
          <circle r={R * 0.92} fill={e.luneta} />
          {Array.from({ length: 12 }, (_, i) => <line key={i} x1={0} y1={-R * 0.9} x2={0} y2={-R * (i === 0 ? 0.8 : 0.84)} stroke="#E8E8E8" strokeWidth={r * 0.02} transform={`rotate(${i * 30})`} />)}
        </g>
      )}
      {/* mostrador */}
      <g clipPath={`url(#${id}c)`}>
        <rect x={-R} y={-R} width={2 * R} height={2 * R} fill={`url(#${id}d)`} />
        {e.raios && Array.from({ length: 90 }, (_, i) => (
          <path key={i} d={`M 0 0 L ${Math.sin((i * 4 * Math.PI) / 180) * R} ${-Math.cos((i * 4 * Math.PI) / 180) * R} L ${Math.sin(((i * 4 + 2) * Math.PI) / 180) * R} ${-Math.cos(((i * 4 + 2) * Math.PI) / 180) * R} Z`} fill="#FFFFFF" opacity={0.035 + 0.03 * Math.abs(Math.sin((i * 8 * Math.PI) / 180))} />
        ))}
        <Indices e={e} r={r} />
        {/* marca (inventada) logo abaixo do 12 */}
        <g opacity={mostraLogo}>
          <g transform={`translate(0 ${-r * 0.47})`}>
            <path d={`M 0 ${-r * 0.085} L ${r * 0.05} ${-r * 0.03} L 0 ${r * 0.0} L ${-r * 0.05} ${-r * 0.03} Z`} fill={e.corIndice ?? corP} opacity={0.9} />
            <text y={r * 0.09} textAnchor="middle" fontFamily={FONTE} fontWeight={900} fontSize={r * 0.095} letterSpacing={r * 0.012} fill={e.corIndice ?? corP}>{e.marca}</text>
          </g>
          {e.subtitulo && <text y={r * 0.42} textAnchor="middle" fontFamily={FONTE} fontWeight={700} fontSize={r * 0.05} letterSpacing={r * 0.01} fill={e.corIndice ?? corP} opacity={0.75}>{e.subtitulo}</text>}
        </g>
        {/* janela de data */}
        {e.data && (
          <g transform={`translate(${r * 0.64} 0)`}>
            <rect x={-r * 0.1} y={-r * 0.075} width={r * 0.2} height={r * 0.15} rx={r * 0.015} fill="#F7F5EE" stroke={sombreia(e.mostrador, 0.5)} strokeWidth={r * 0.012} />
            <text y={r * 0.05} textAnchor="middle" fontFamily={FONTE} fontWeight={800} fontSize={r * 0.12} fill="#1A1A1A">27</text>
          </g>
        )}
        {/* submostradores */}
        {e.sub && [[-r * 0.45, 0], [0, r * 0.45]].map(([x, y], i) => (
          <g key={i} transform={`translate(${x} ${y})`}>
            <circle r={r * 0.2} fill={sombreia(e.mostrador, 0.8)} stroke={sombreia(e.mostrador, 1.3)} strokeWidth={r * 0.01} />
            {Array.from({ length: 12 }, (_, k) => <line key={k} x1={0} y1={-r * 0.18} x2={0} y2={-r * 0.15} stroke={e.corIndice ?? "#EEE"} strokeWidth={r * 0.008} transform={`rotate(${k * 30})`} />)}
            <line x1={0} y1={0} x2={0} y2={-r * 0.15} stroke={e.corSegundos ?? "#EEE"} strokeWidth={r * 0.012} strokeLinecap="round" transform={`rotate(${i ? 200 : 40})`} />
          </g>
        ))}
        {/* ponteiros: sombra, horas, minutos, segundos */}
        <g transform={`translate(${r * 0.025} ${r * 0.04})`} filter={`url(#${id}s)`}>
          <Ponteiro tipo={e.ponteiros} comp={r * 0.52} larg={r * 0.045} cor={corP} ang={h} sombra />
          <Ponteiro tipo={e.ponteiros} comp={r * 0.8} larg={r * 0.035} cor={corP} ang={m} sombra />
        </g>
        {brilhoPonteiros > 0 && (
          <g opacity={brilhoPonteiros} filter={`url(#${id}s)`}>
            <Ponteiro tipo={e.ponteiros} comp={r * 0.56} larg={r * 0.07} cor="#FFE27A" ang={h} />
            <Ponteiro tipo={e.ponteiros} comp={r * 0.84} larg={r * 0.06} cor="#FFE27A" ang={m} />
          </g>
        )}
        <Ponteiro tipo={e.ponteiros} comp={r * 0.52} larg={r * 0.045} cor={corP} ang={h} />
        <Ponteiro tipo={e.ponteiros} comp={r * 0.8} larg={r * 0.035} cor={corP} ang={m} />
        {!semSegundos && (
          <g transform={`rotate(${s})`}>
            <rect x={-r * 0.007} y={-r * 0.88} width={r * 0.014} height={r * 1.08} fill={e.corSegundos ?? corP} />
            <circle cy={r * 0.16} r={r * 0.035} fill={e.corSegundos ?? corP} />
          </g>
        )}
        <circle r={r * 0.04} fill={sombreia(corP, 0.8)} stroke={sombreia(corP, 1.3)} strokeWidth={r * 0.01} />
        {/* reflexo do vidro */}
        <ellipse cx={-r * 0.35} cy={-r * 0.45} rx={r * 0.9} ry={r * 0.55} fill={`url(#${id}v)`} transform={`rotate(-25 ${-r * 0.35} ${-r * 0.45})`} />
      </g>
      {/* aro de luz no vidro */}
      <g fill="none" stroke="#FFFFFF" strokeWidth={r * 0.01} opacity={0.25}>{e.caixa === "redonda" ? <circle r={r * 0.995} /> : forma(0.86)}</g>
    </g>
  );
};

/** relógio digital (para quebrar a sequência): caixa retangular e quatro dígitos de 7 segmentos */
const SEG: Record<string, number[]> = { "0": [1, 1, 1, 1, 1, 1, 0], "1": [0, 1, 1, 0, 0, 0, 0], "9": [1, 1, 1, 1, 0, 1, 1], "4": [0, 1, 1, 0, 0, 1, 1] };
const Digito: React.FC<{ d: string; x: number; t: number; cor: string }> = ({ d, x, t, cor }) => {
  const w = t * 0.55, h = t, e = t * 0.11;
  const on = SEG[d] ?? SEG["0"];
  const segs = [
    `M ${e} 0 L ${w - e} 0 L ${w - 2 * e} ${e} L ${2 * e} ${e} Z`,
    `M ${w} ${e} L ${w} ${h / 2 - e / 2} L ${w - e} ${h / 2 - e} L ${w - e} ${2 * e} Z`,
    `M ${w} ${h / 2 + e / 2} L ${w} ${h - e} L ${w - e} ${h - 2 * e} L ${w - e} ${h / 2 + e} Z`,
    `M ${e} ${h} L ${w - e} ${h} L ${w - 2 * e} ${h - e} L ${2 * e} ${h - e} Z`,
    `M 0 ${h / 2 + e / 2} L 0 ${h - e} L ${e} ${h - 2 * e} L ${e} ${h / 2 + e} Z`,
    `M 0 ${e} L 0 ${h / 2 - e / 2} L ${e} ${h / 2 - e} L ${e} ${2 * e} Z`,
    `M ${e} ${h / 2} L ${2 * e} ${h / 2 - e / 2} L ${w - 2 * e} ${h / 2 - e / 2} L ${w - e} ${h / 2} L ${w - 2 * e} ${h / 2 + e / 2} L ${2 * e} ${h / 2 + e / 2} Z`,
  ];
  return <g transform={`translate(${x} ${-h / 2})`}>{segs.map((p, i) => <path key={i} d={p} fill={cor} opacity={on[i] ? 1 : 0.07} />)}</g>;
};
export const Digital: React.FC<{ r?: number; texto?: string; cor?: string; marca?: string }> = ({ r = 300, texto = "10:10", cor = "#1C2A1E", marca = "KRONO-X" }) => {
  const [a, b, , c, d] = texto.split("");
  const t = r * 0.5;
  return (
    <g>
      <rect x={-r * 1.12 + r * 0.05} y={-r * 0.82 + r * 0.08} width={r * 2.24} height={r * 1.64} rx={r * 0.3} fill="#000" opacity={0.4} />
      <rect x={-r * 0.55} y={-r * 1.9} width={r * 1.1} height={r * 3.8} rx={r * 0.12} fill="#1E1F22" />
      <rect x={-r * 1.12} y={-r * 0.82} width={r * 2.24} height={r * 1.64} rx={r * 0.3} fill="#2C2E33" stroke="#4A4D55" strokeWidth={r * 0.03} />
      <rect x={-r * 0.92} y={-r * 0.48} width={r * 1.84} height={r * 0.96} rx={r * 0.08} fill="#B9C7A8" />
      <rect x={-r * 0.92} y={-r * 0.48} width={r * 1.84} height={r * 0.3} rx={r * 0.08} fill="#FFFFFF" opacity={0.12} />
      <text y={-r * 0.6} textAnchor="middle" fontFamily={FONTE} fontWeight={900} fontSize={r * 0.1} letterSpacing={r * 0.02} fill="#C9CCD2">{marca}</text>
      <g transform={`translate(${-r * 0.78} ${r * 0.02})`}>
        <Digito d={a} x={0} t={t} cor={cor} />
        <Digito d={b} x={t * 0.72} t={t} cor={cor} />
        <circle cx={t * 1.42} cy={-t * 0.18} r={t * 0.05} fill={cor} />
        <circle cx={t * 1.42} cy={t * 0.18} r={t * 0.05} fill={cor} />
        <Digito d={c} x={t * 1.6} t={t} cor={cor} />
        <Digito d={d} x={t * 2.32} t={t} cor={cor} />
      </g>
      <text x={r * 0.78} y={r * 0.38} textAnchor="end" fontFamily={FONTE} fontWeight={800} fontSize={r * 0.08} fill={cor}>AM</text>
      {[-1, 1].map((l) => <rect key={l} x={l * r * 1.12 - (l > 0 ? 0 : r * 0.06)} y={-r * 0.3} width={r * 0.06} height={r * 0.18} rx={r * 0.02} fill="#5A5D66" />)}
    </g>
  );
};
