// Capítulo 2: Por que ninguém pega mentira.
import React from "react";
import { Liso } from "../teo/cenarios";
import { ELENCO } from "../teo/elenco";
import { Ator, Camera, Cartela, E, pts, usePlano } from "../teo/kit";
import { apontar, comBracos, maoEm, parado, pulso, rampa, sino } from "../teo/motor";
import { Boneco, LINHA, pontos, type PoseTeo, type Visual } from "../teo/tira";
import { Baloes } from "./balao";
import { daBoca, porRotulo, Suor } from "./comum";

const CH = 960;
const Moeda: React.FC<{ x: number; y: number; t: number; r?: number; gira?: boolean; cara?: boolean }> = ({ x, y, t, r = 120, gira = true, cara = true }) => {
  const sx = gira ? Math.cos(t * 14) : 1;
  const frente = !gira ? cara : Math.cos(t * 14) > 0;
  return (
    <g transform={`translate(${x} ${y}) scale(${sx} 1)`}>
      <circle r={r} fill="#F2C94C" stroke={LINHA} strokeWidth={8} />
      <circle r={r * 0.78} fill="none" stroke="#C99A2A" strokeWidth={6} />
      {frente ? <g><circle cx={0} cy={-r * 0.1} r={r * 0.32} fill="#E0B040" stroke="#8A6A1A" strokeWidth={5} /><path d={`M ${-r * 0.4} ${r * 0.5} Q 0 ${r * 0.15} ${r * 0.4} ${r * 0.5}`} fill="#E0B040" stroke="#8A6A1A" strokeWidth={5} /></g>
        : <path d={`M 0 ${-r * 0.45} L ${r * 0.13} ${-r * 0.12} L ${r * 0.48} ${-r * 0.12} L ${r * 0.2} ${r * 0.1} L ${r * 0.3} ${r * 0.45} L 0 ${r * 0.24} L ${-r * 0.3} ${r * 0.45} L ${-r * 0.2} ${r * 0.1} L ${-r * 0.48} ${-r * 0.12} L ${-r * 0.13} ${-r * 0.12} Z`} fill="#E0B040" stroke="#8A6A1A" strokeWidth={5} />}
    </g>
  );
};

// ---------------------------------------------------------------- c2_moeda
const C2Moeda: React.FC = () => {
  const { t, F } = usePlano();
  const p = { ...parado(640, CH, 1.6)(t), head: { rot: -14, offsetY: 0 }, expr: "curioso" as const };
  const lanca = (t * 0.7) % 1;
  const mao = pontos(p, 1.6, ELENCO.vizinho.v).maoR;
  const quase = F(0).ini + F(0).dur * 0.62;
  const y = mao[1] - 60 - Math.sin(Math.PI * lanca) * 380;
  return (
    <Camera chaves={[{ t: 0, z: 1, cx: 960, cy: 540 }]} fundo="#7FB7F0">
      <Liso cor="#7FB7F0" padrao="#74AAE2" />
      <Boneco pose={{ ...p, arm_upper_R: 60 + 30 * Math.max(0, Math.sin(Math.PI * lanca * 2)), arm_lower_R: 30 }} esc={1.6} v={ELENCO.vizinho.v} />
      <Moeda x={mao[0] + 30} y={y} t={t} r={70} />
      <Cartela texto="54%" x={1360} y={420} tam={150} desde={F(0).ini + F(0).dur * 0.42} />
      {t > quase && <Moeda x={1360} y={760} t={t} r={110} gira={t < quase + 1.2} cara />}
    </Camera>
  );
};
// ---------------------------------------------------------------- c2_juiz
const POLICIAL: Visual = { ...ELENCO.delegado.v, terno: undefined, camisa: "#2E3E6E", manga: "curta", cabelo: "bone", bone: "#2E3E6E", corBaixo: "#2E3E6E" };
const JUIZ: Visual = { ...ELENCO.empresario.v, terno: undefined, vestido: "#1A1A22", camisa: "#1A1A22", baixo: "saia", corBaixo: "#1A1A22", manga: "longa" };
const C2Juiz: React.FC = () => {
  const { t } = usePlano();
  const fig = (x: number, v: Visual, fase: number) => {
    const p = { ...parado(x, CH, 1.6)(t + fase), expr: "serio" as const };
    const lanca = ((t + fase) * 0.8) % 1;
    const m = pontos(p, 1.6, v).maoR;
    return (
      <g key={x}>
        <Boneco pose={{ ...p, arm_upper_R: 60 + 30 * Math.max(0, Math.sin(Math.PI * lanca * 2)), arm_lower_R: 30 }} esc={1.6} v={v} />
        <Moeda x={m[0] + 30} y={m[1] - 70 - Math.sin(Math.PI * lanca) * 300} t={t + fase} r={50} />
      </g>
    );
  };
  const barra = 0.5 + 0.06 * rampa(t, 1.2, 2.2);
  return (
    <Camera chaves={[{ t: 0, z: 1, cx: 960, cy: 540 }]} fundo="#F2A65A">
      <Liso cor="#F2A65A" padrao="#E89A4E" />
      {fig(560, POLICIAL, 0)}
      {fig(1100, JUIZ, 0.4)}
      <g transform="translate(1340 300)">
        <rect x={0} y={0} width={420} height={70} rx={20} fill="#FBFBF7" stroke={LINHA} strokeWidth={7} />
        <rect x={10} y={10} width={400 * barra} height={50} rx={14} fill="#3FAF63" />
        <line x1={210} y1={-14} x2={210} y2={84} stroke={LINHA} strokeWidth={6} strokeDasharray="10 8" />
      </g>
    </Camera>
  );
};
// ---------------------------------------------------------------- c2_pistas: as pistas erradas, riscadas
const C2Pistas: React.FC = () => {
  const { t, F } = usePlano();
  const d = F(0).dur, i0 = F(0).ini;
  const marcas = [i0 + d * 0.22, i0 + d * 0.36, i0 + d * 0.5];
  const risca = i0 + d * 0.78;
  const p = parado(960, CH, 1.6, false)(t);
  const olho = Math.sin(t * 9) * 12 * rampa(t, marcas[0], marcas[0] + 0.1);
  const perna = Math.abs(Math.sin(t * 16)) * 14 * rampa(t, marcas[2], marcas[2] + 0.1);
  const pose: PoseTeo = { ...p, head: { rot: olho, offsetY: 0 }, leg_upper_R: perna, leg_lower_R: -perna, expr: "preocupado" };
  const cab = pontos(pose, 1.6, ELENCO.vizinho.v).cabeca;
  const palavras: [string, number, number][] = [["OLHO FUGINDO", 470, 300], ["MÃO SUADA", 1450, 420], ["PERNA BALANÇANDO", 560, 760]];
  return (
    <Camera chaves={[{ t: 0, z: 1, cx: 960, cy: 540 }]} fundo="#86DDBE">
      <Liso cor="#86DDBE" padrao="#7ACFB2" />
      <Boneco pose={pose} esc={1.6} v={ELENCO.vizinho.v} />
      {t > marcas[1] && <Suor x={cab[0]} y={cab[1] + 260} t={t} r={60} />}
      {palavras.map(([w, x, y], i) => (
        <g key={w}>
          <Cartela texto={w} x={x} y={y} tam={58} desde={marcas[i]} gira={i % 2 ? 3 : -3} />
          {t > risca + i * 0.12 && <line x1={x - w.length * 20} y1={y - 6} x2={x - w.length * 20 + w.length * 40 * Math.min(1, (t - risca - i * 0.12) / 0.15)} y2={y - 10} stroke="#E23B2E" strokeWidth={16} strokeLinecap="round" />}
        </g>
      ))}
    </Camera>
  );
};
// ---------------------------------------------------------------- c2_poligrafo
const Poligrafo: React.FC<{ x: number; y: number; t: number; agita: number }> = ({ x, y, t, agita }) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={-330} y={-200} width={660} height={360} rx={20} fill="#3A3A48" stroke={LINHA} strokeWidth={8} />
    <rect x={-300} y={-170} width={600} height={260} fill="#FBFBF7" stroke={LINHA} strokeWidth={5} />
    {[0, 1, 2].map((i) => {
      const yy = -110 + i * 80;
      const pts2 = Array.from({ length: 60 }, (_, k) => {
        const xx = -290 + k * 9.8;
        const amp = 6 + agita * (26 + 10 * i);
        return `${xx},${yy + Math.sin(k * 0.9 + t * 9 + i) * amp * (0.6 + 0.4 * Math.sin(k * 0.3 + i))}`;
      }).join(" ");
      return <g key={i}><polyline points={pts2} fill="none" stroke={["#3B6FD6", "#E23B2E", "#3FAF63"][i]} strokeWidth={5} /><line x1={290} y1={yy - 60} x2={292} y2={yy} stroke={LINHA} strokeWidth={4} /></g>;
    })}
    {/* ícones: gota (suor), coração, pulmão */}
    <path d="M -380 -110 q -16 24 0 34 q 16 -10 0 -34 Z" fill="#7FC8F8" stroke={LINHA} strokeWidth={4} />
    <path d="M -380 -10 c -20 -20 -40 6 0 30 c 40 -24 20 -50 0 -30 Z" fill="#E23B2E" stroke={LINHA} strokeWidth={4} />
    <path d="M -392 60 q -16 30 -4 44 q 10 4 12 -12 Z M -368 60 q 16 30 4 44 q -10 4 -12 -12 Z" fill="#E9707F" stroke={LINHA} strokeWidth={4} />
  </g>
);
const C2Poligrafo: React.FC = () => {
  const { t, F } = usePlano();
  const d = F(0).dur, i0 = F(0).ini;
  const honesto = i0 + d * 0.45, mentiroso = i0 + d * 0.75;
  const fase = t < honesto ? 0 : t < mentiroso ? 1 : 2;
  const quem = fase === 2 ? "vendedor" : "vizinho";
  const p: PoseTeo = { ...parado(380, CH, 1.25)(t), expr: fase === 1 ? "preocupado" : fase === 2 ? "sorriso" : "neutro" };
  const cab = pts(quem, p).cabeca;
  return (
    <Camera chaves={[{ t: 0, z: 1, cx: 960, cy: 540 }]} fundo="#F3D9B1">
      <Liso cor="#F3D9B1" padrao="#EBCB9C" />
      <Poligrafo x={1150} y={460} t={t} agita={fase === 1 ? 1 : fase === 2 ? 0 : 0.35} />
      {fase > 0 && <Ator quem={quem} pose={p} />}
      {fase === 1 && <Suor x={cab[0]} y={cab[1]} t={t} r={70} />}
      {fase === 1 && t > honesto + 0.6 && <g stroke="#E23B2E" strokeWidth={24} strokeLinecap="round"><line x1={1500} y1={760} x2={1640} y2={900} /><line x1={1640} y1={760} x2={1500} y2={900} /></g>}
      {fase === 2 && t > mentiroso + 0.6 && <path d="M 1490 830 l 50 50 l 100 -110" stroke="#3FAF63" strokeWidth={26} fill="none" strokeLinecap="round" strokeLinejoin="round" />}
      <Baloes emissor={porRotulo({ vendedor: daBoca("vendedor", (tt) => ({ ...parado(380, CH, 1.25)(tt) }), 1, CH) })} />
    </Camera>
  );
};
// ---------------------------------------------------------------- c2_balao: você não precisa de pista
const C2Balao: React.FC = () => {
  const { t, F } = usePlano();
  const viz = (tt: number): PoseTeo => ({ ...parado(1180, CH, E("vizinho"), true)(tt), expr: "sorriso", falando: tt > 0.3 && tt < 0.9 && Math.sin(tt * 40) > 0 });
  let teo: PoseTeo = { ...parado(760, CH, 1.1)(t), expr: "sorriso" };
  const aponta = sino(t, 2.0, 4.6, 0.3, 0.3);
  teo = comBracos(teo, apontar(teo, [1040, CH - 30], 1.1), aponta, "R");
  const ombros = pulso(t, 1.1, 0.6);
  teo = { ...teo, arm_upper_L: teo.arm_upper_L - 20 * ombros, torso: { ...teo.torso, scaleY: teo.torso.scaleY + 0.04 * ombros } };
  return (
    <Camera chaves={[{ t: 0, z: 1.1, cx: 960, cy: 560 }]} fundo="#E9707F">
      <Liso cor="#E9707F" padrao="#DE6273" />
      <rect x={-400} y={CH} width={2800} height={400} fill="#D75A6A" />
      <line x1={-400} y1={CH} x2={2400} y2={CH} stroke={LINHA} strokeWidth={9} />
      <Boneco pose={teo} esc={1.1} />
      <Ator quem="vizinho" pose={viz(t)} />
      <Baloes emissor={porRotulo({ vizinho: daBoca("vizinho", viz, -1, CH, { xChao: 1020 }) })} />
      <Cartela texto="100%" x={960} y={220} tam={130} desde={F(0).ini + F(0).dur * 0.55} />
    </Camera>
  );
};
// ---------------------------------------------------------------- c2_relogio
const C2Relogio: React.FC = () => {
  const { t } = usePlano();
  const ang = t * 120;
  const fontes: Record<string, [number, number]> = { r1: [700, 260], r2: [1240, 230], r3: [600, 520], r4: [1330, 520], r5: [860, 180], r6: [1080, 200] };
  const mapa = Object.fromEntries(Object.entries(fontes).map(([k, [x, y]], i) => [k, () => ({ boca: [x, y] as [number, number], lado: (i % 2 ? 1 : -1) as 1 | -1, chao: 1000, esc: 0.75, xChao: 560 + i * 160 })]));
  return (
    <Camera chaves={[{ t: 0, z: 1, cx: 960, cy: 540 }]} fundo="#9B6FD0">
      <Liso cor="#9B6FD0" padrao="#8F63C4" />
      <rect x={-400} y={1000} width={2800} height={400} fill="#7A4EB0" />
      <line x1={-400} y1={1000} x2={2400} y2={1000} stroke={LINHA} strokeWidth={9} />
      <g transform="translate(960 470)">
        <circle r={260} fill="#FBFBF7" stroke={LINHA} strokeWidth={12} />
        {Array.from({ length: 12 }, (_, i) => <line key={i} x1={Math.cos((i * Math.PI) / 6) * 210} y1={Math.sin((i * Math.PI) / 6) * 210} x2={Math.cos((i * Math.PI) / 6) * 240} y2={Math.sin((i * Math.PI) / 6) * 240} stroke={LINHA} strokeWidth={10} strokeLinecap="round" />)}
        <line x1={0} y1={0} x2={Math.sin((ang * Math.PI) / 180) * 200} y2={-Math.cos((ang * Math.PI) / 180) * 200} stroke={LINHA} strokeWidth={12} strokeLinecap="round" />
        <line x1={0} y1={0} x2={Math.sin((ang * Math.PI) / 2160) * 130} y2={-Math.cos((ang * Math.PI) / 2160) * 130} stroke="#E23B2E" strokeWidth={16} strokeLinecap="round" />
        <circle r={18} fill={LINHA} />
      </g>
      <Baloes emissor={porRotulo(mapa)} />
    </Camera>
  );
};
// ---------------------------------------------------------------- c2_maos
const C2Maos: React.FC = () => {
  const { t, dur } = usePlano();
  const base = parado(960, CH, 1.4)(t);
  const peito = pts("teo", base).peito;
  const esfrega = Math.sin(t * 16) * 10;
  let teo = maoEm(maoEm(base, "R", [peito[0] + 70 + esfrega, peito[1] + 10], 1.4), "L", [peito[0] + 64 - esfrega, peito[1] + 16], 1.4);
  teo = { ...teo, expr: "sorriso", head: { rot: 6, offsetY: 0 } };
  const cab = pts("teo", teo).cabeca;
  return (
    <Camera chaves={[{ t: 0, z: 1.5, cx: cab[0] + 30, cy: cab[1] + 150 }, { t: dur + 0.5, z: 1.7, cx: cab[0] + 30, cy: cab[1] + 130 }]} fundo="#2E3A6A">
      <Liso cor="#2E3A6A" padrao="#34407A" />
      <Boneco pose={teo} esc={1.4} />
    </Camera>
  );
};

export const CAP2: Record<string, React.FC> = { c2_moeda: C2Moeda, c2_juiz: C2Juiz, c2_pistas: C2Pistas, c2_poligrafo: C2Poligrafo, c2_balao: C2Balao, c2_relogio: C2Relogio, c2_maos: C2Maos };
