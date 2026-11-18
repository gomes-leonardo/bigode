// Capítulo 4: O menino de pedra.
import React from "react";
import { FONTE } from "../theme";
import { CAMPINHO, Campinho, LADEIRA_ANG, Ladeira, ladeiraY, Liso, TraveFrente } from "./cenarios";
import type { NomeElenco } from "./elenco";
import { Ator, Camera, Cartela, E, Impacto, Noite, pts, usePlano, V } from "./kit";
import { andar, base, comBracos, cruzados, deitado, maoEm, mix, parado, pulso, rampa, rir, seq, sino, type Fn } from "./motor";
import { Q, QuartoFrente, QuartoFundo } from "./Quarto";
import { Bola, Boneco, LINHA, TEO, type PoseTeo } from "./tira";

const { chao: CC, trave } = CAMPINHO;
const FACE_TRAVE = trave.x - 14;

/** sentado no chão, pernas para a frente, mãos apoiadas atrás */
export const sentadoChao = (x: number, chao: number, esc: number, esq = false): Fn => (t) => {
  const p = base(x, chao - 30 * esc, esq);
  p.leg_upper_R = 82; p.leg_lower_R = -14; p.leg_upper_L = 78; p.leg_lower_L = -20; p.pe_R = 60; p.pe_L = 58;
  p.torso.rot = -10 + Math.sin(t * 3) * 1;
  p.arm_upper_R = -30; p.arm_lower_R = 10; p.arm_upper_L = -36; p.arm_lower_L = 10;
  return p;
};

/** contador de views de celular */
const Views: React.FC<{ x: number; y: number; n: number; esc?: number }> = ({ x, y, n, esc = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${esc})`}>
    <rect x={8} y={8} width={360} height={84} rx={42} fill={LINHA} />
    <rect width={360} height={84} rx={42} fill="#FBFBF7" stroke={LINHA} strokeWidth={7} />
    <path d="M 30 42 Q 54 14 78 42 Q 54 70 30 42 Z" fill="#FBFBF7" stroke={LINHA} strokeWidth={5} />
    <circle cx={54} cy={42} r={9} fill={LINHA} />
    <text x={200} y={58} textAnchor="middle" fontFamily={FONTE} fontWeight={900} fontSize={44} fill={LINHA}>{Math.floor(n).toLocaleString("pt-BR")}</text>
  </g>
);

// ---------------------------------------------------------------- c4_viral
const C4Viral: React.FC = () => {
  const { t, dur } = usePlano();
  const n = 120 + Math.pow(rampa(t, 0.4, 3.6, (x) => x), 2.2) * 2480000;
  const teo = { ...parado(1180, CC, 1, true)(t), expr: "neutro" as const, head: { rot: -14, offsetY: 0 } };
  const rosto = pts("teo", teo).rosto;
  const coracoes = [0.7, 1.0, 1.3, 1.7, 2.1, 2.5, 2.9, 3.3];
  return (
    <Camera chaves={[{ t: 0, z: 1.0, cx: 960, cy: 540 }, { t: dur, z: 1.06, cx: 960, cy: 540 }]} fundo="#6A5FD0">
      <Liso cor="#6A5FD0" padrao="#5E54C0" />
      {/* celular com o vídeo da bolada */}
      <g transform="translate(960 560) rotate(-3)">
        <rect x={-330 + 16} y={-500 + 16} width={660} height={1000} rx={60} fill={LINHA} />
        <rect x={-330} y={-500} width={660} height={1000} rx={60} fill="#2A2A35" stroke={LINHA} strokeWidth={9} />
        <svg x={-290} y={-430} width={580} height={760} viewBox="760 300 760 1000" preserveAspectRatio="xMidYMid slice">
          <Campinho />
          <Boneco pose={teo} esc={1} v={TEO} />
          <Bola x={rosto[0] - 14} y={rosto[1]} r={30} />
        </svg>
        <rect x={-290} y={340} width={580} height={120} fill="#3A3A48" />
        {/* barra de progresso do vídeo */}
        <rect x={-260} y={360} width={520} height={10} rx={5} fill="#5A5A6A" />
        <rect x={-260} y={360} width={520 * ((t * 0.4) % 1)} height={10} rx={5} fill="#E23B2E" />
      </g>
      {coracoes.map((c, i) => {
        if (t < c) return null;
        const d = t - c;
        const x = 1360 + (i % 3) * 60 + Math.sin(d * 4 + i) * 30;
        const y = 860 - d * 380;
        return <path key={i} d={`M ${x} ${y} c -30 -30 -60 0 -30 30 l 30 30 l 30 -30 c 30 -30 0 -60 -30 -30 Z`} fill="#E9707F" stroke={LINHA} strokeWidth={5} />;
      })}
      <Views x={120} y={120} n={n} esc={1.2} />
      <Cartela texto="O MENINO DE PEDRA" x={960} y={900} tam={84} desde={1.8} />
    </Camera>
  );
};

// ---------------------------------------------------------------- c4_montagem: rolimã, vela, cabeçada (o Caco sempre filmando)
const cacoFilmando = (x: number, chao: number, esq: boolean, t: number): PoseTeo => ({ ...parado(x, chao, E("caco"), esq)(t), objR: "celularFilma", arm_upper_R: 70, arm_lower_R: 40, expr: "sorriso" });
const Rolima: React.FC<{ t: number }> = ({ t }) => {
  const x = -100 + t * 900;
  const a = LADEIRA_ANG;
  const ar = (a * Math.PI) / 180;
  const chaoX = ladeiraY(x);
  const h = 64; // rodinha + tábua + bumbum
  const hx = x + Math.sin(ar) * h, hy = chaoX - Math.cos(ar) * h;
  const p = base(hx, hy);
  p.giro = a;
  p.leg_upper_R = 84; p.leg_lower_R = -8; p.leg_upper_L = 80; p.leg_lower_L = -12; p.pe_R = 50; p.pe_L = 48;
  p.arm_upper_R = 40; p.arm_lower_R = 50; p.arm_upper_L = 34; p.arm_lower_L = 50;
  p.torso.rot = -14; p.head.rot = 4;
  return (
    <g>
      <g transform={`translate(${x} ${chaoX}) rotate(${a})`}>
        <rect x={-60} y={-46} width={260} height={18} rx={6} fill="#C98450" stroke={LINHA} strokeWidth={6} />
        {[-30, 170].map((dx, i) => <circle key={i} cx={dx} cy={-14} r={14} fill="#9AA0A8" stroke={LINHA} strokeWidth={5} />)}
      </g>
      <Ator quem="teo" pose={p} />
      {[0, 1, 2].map((i) => <line key={i} x1={hx - 160 - i * 50} y1={hy - 60 + i * 40} x2={hx - 260 - i * 50} y2={hy - 90 + i * 40} stroke={LINHA} strokeWidth={6} strokeLinecap="round" />)}
    </g>
  );
};
const MONT = [0, 2.1, 4.2];
const testaOffset = (() => {
  const p = { ...parado(0, CC, 1)(0), torso: { ...parado(0, CC, 1)(0).torso, rot: 16 } };
  return pts("teo", p).testa[0];
})();
/** corre até a testa encostar na trave em tContato, quica para trás */
const cabecada = (quem: NomeElenco, t: number, tContato: number, xIni: number, depois: "volta" | "cai"): PoseTeo => {
  const esc = E(quem);
  const xC = FACE_TRAVE - testaOffset * esc;
  const ida0 = andar(xIni, xC, 0, CC, esc, { correr: true });
  const t0 = tContato - ida0.fim;
  const ida = andar(xIni, xC, t0, CC, esc, { correr: true });
  if (t < tContato) {
    const p = ida(t);
    return { ...p, torso: { ...p.torso, rot: 16 }, expr: "bravo" };
  }
  const d = t - tContato;
  const choque = parado(xC, CC, esc)(t);
  choque.torso.rot = 16;
  choque.piscar = d < 0.15;
  if (depois === "volta") {
    const p = mix(choque, parado(xC - 70 * esc, CC, esc)(t), rampa(d, 0.05, 0.4));
    p.torso.rot = 16 - 30 * pulso(d, 0, 0.5);
    p.expr = "neutro";
    return p;
  }
  // cai sentado para trás, mão na testa
  const chao = sentadoChao(xC - 110 * esc, CC, esc)(t);
  let p = mix({ ...choque, torso: { ...choque.torso, rot: -20 } }, chao, rampa(d, 0.08, 0.45, (x) => x * x));
  p = comBracos(p, maoEm(p, "R", pts(quem, p).testa, esc, V(quem)), rampa(d, 0.5, 0.8), "R");
  p.expr = d > 0.6 ? "chorando" : "surpreso";
  p.lagrima = d > 0.9 ? ((d - 0.9) * 0.7) % 1 : 0;
  return p;
};
const C4Montagem: React.FC = () => {
  const { t } = usePlano();
  const cena = t < MONT[1] ? 0 : t < MONT[2] ? 1 : 2;
  const tl = t - MONT[cena];
  const views = 2.6e6 + t * 1.4e6;
  if (cena === 0) {
    return (
      <Camera chaves={[{ t: 0, z: 1.0, cx: 960, cy: 600 }]} fundo="#BFE6FF">
        <Ladeira />
        <Ator quem="caco" pose={cacoFilmando(1560, ladeiraY(1560), true, t)} />
        <Rolima t={tl} />
        <Views x={1440} y={60} n={views} />
      </Camera>
    );
  }
  if (cena === 1) {
    // bolo com vela: a mão do Téo parada em cima da chama
    const mesaTopo = 760, chama: [number, number] = [930, mesaTopo - 150];
    let teo = parado(840, 940, 1)(t);
    teo = comBracos(teo, maoEm(teo, "R", [chama[0], chama[1] - 26], 1), rampa(tl, 0.1, 0.45), "R");
    return (
      <Camera chaves={[{ t: MONT[1], z: 1.25, cx: 930, cy: 560 }, { t: MONT[2], z: 1.32, cx: 930, cy: 560 }]} fundo="#F6ECDA">
        <Liso cor="#F3D9B1" />
        <rect x={-400} y={940} width={2800} height={400} fill="#C98450" />
        <line x1={-400} y1={940} x2={2400} y2={940} stroke={LINHA} strokeWidth={9} />
        <rect x={700} y={mesaTopo} width={520} height={24} rx={6} fill="#B4733F" stroke={LINHA} strokeWidth={7} />
        <rect x={730} y={mesaTopo + 24} width={20} height={156} fill="#9A5F32" stroke={LINHA} strokeWidth={5} />
        <rect x={1170} y={mesaTopo + 24} width={20} height={156} fill="#9A5F32" stroke={LINHA} strokeWidth={5} />
        <path d={`M 840 ${mesaTopo} L 840 ${mesaTopo - 90} Q 930 ${mesaTopo - 120} 1020 ${mesaTopo - 90} L 1020 ${mesaTopo} Z`} fill="#F0A3B4" stroke={LINHA} strokeWidth={7} />
        <path d={`M 840 ${mesaTopo - 70} Q 930 ${mesaTopo - 50} 1020 ${mesaTopo - 70}`} stroke="#FBFBF7" strokeWidth={14} fill="none" />
        <rect x={922} y={mesaTopo - 140} width={16} height={46} fill="#7FB7F0" stroke={LINHA} strokeWidth={4} />
        <path d={`M ${chama[0] - 12} ${chama[1] + 10} Q ${chama[0] + Math.sin(t * 30) * 6} ${chama[1] - 40} ${chama[0] + 12} ${chama[1] + 10} Z`} fill="#FFD23F" stroke="#F2933A" strokeWidth={4} />
        <Ator quem="teo" pose={teo} />
        <Ator quem="caco" pose={cacoFilmando(1380, 940, true, t)} />
        <Views x={1440} y={60} n={views} />
      </Camera>
    );
  }
  const teo = cabecada("teo", t, MONT[2] + 1.0, 700, "volta");
  const trem = Math.sin((t - MONT[2] - 1.0) * 60) * 5 * pulso(t, MONT[2] + 1.0, 0.4);
  return (
    <Camera chaves={[{ t: MONT[2], z: 1.15, cx: 1250, cy: 560 }, { t: 6.3, z: 1.2, cx: 1250, cy: 560 }]} tremores={[MONT[2] + 1.0]}>
      <Campinho />
      <Ator quem="caco" pose={cacoFilmando(820, CC, false, t)} />
      <Ator quem="teo" pose={teo} />
      <TraveFrente tremor={trem} />
      <Impacto x={FACE_TRAVE} y={pts("teo", teo).testa[1]} d={Math.round((t - MONT[2] - 1.0) * 30)} angulos={[-160, -120, 120, 160]} />
      <Views x={1440} y={60} n={views} />
    </Camera>
  );
};

// ---------------------------------------------------------------- c4_dudu: tenta igual, cai; você levanta rindo, ele não
const C4Dudu: React.FC = () => {
  const { t, dur, S } = usePlano();
  const tT = S("trave");
  const dudu = cabecada("dudu", t, tT, 760, "cai");
  const trem = Math.sin((t - tT) * 60) * 5 * pulso(t, tT, 0.4);
  // Téo no chão (da cabeçada dele), levanta rindo
  const tLev = 2.3;
  const chao = sentadoChao(560, CC, 1, false);
  const pe = parado(560, CC, 1);
  let teo = t < tLev ? chao(t) : mix(chao(t), pe(t), rampa(t, tLev, tLev + 0.45));
  teo = rir(teo, t, t > tT + 0.3 ? 1 : 0);
  return (
    <Camera chaves={[{ t: 0, z: 1.15, cx: 1150, cy: 580 }, { t: dur, z: 1.22, cx: 1150, cy: 580 }]} tremores={[tT]}>
      <Campinho />
      <Ator quem="teo" pose={teo} />
      <Ator quem="dudu" pose={dudu} />
      <TraveFrente tremor={trem} />
      <Impacto x={FACE_TRAVE} y={CC - 330} d={Math.round((t - tT) * 30)} angulos={[-160, -120, 120, 160]} />
    </Camera>
  );
};

// ---------------------------------------------------------------- c4_vo: Vó Cida chega com a colher de pau
const C4Vo: React.FC = () => {
  const { t, f, fps, dur, fala, S } = usePlano();
  const tPau = S("pau");
  const anda = andar(2050, 1350, -0.2, CC, E("cida"));
  let vo = anda(t);
  vo = { ...vo, objR: "colher", expr: "bravo" };
  const mL: [number, number] = pts("cida", vo).maoL;
  const bate = seq(t, [[0, (tt) => ({ ...anda(tt), arm_upper_R: 150, arm_lower_R: 20 })], [tPau - 0.12, (tt) => ({ ...anda(tt), arm_upper_R: 60, arm_lower_R: 40 })]], 0.12);
  vo = comBracos(vo, bate, 1, "R");
  vo = comBracos(vo, { ...vo, arm_upper_L: 50, arm_lower_L: 40 }, 1, "L");
  let caco = cacoFilmando(1020, CC, false, t);
  caco = comBracos(caco, { ...caco, arm_upper_R: -50, arm_lower_R: -20 }, rampa(t, 0.6, 0.9), "R");
  caco.expr = t > 0.6 ? "preocupado" : "sorriso";
  const dudu = { ...sentadoChao(1350 - 250, CC, E("dudu"))(t), expr: "triste" as const };
  return (
    <Camera chaves={[{ t: 0, z: 1.15, cx: 1250, cy: 560 }, { t: dur, z: 1.2, cx: 1250, cy: 560 }]}>
      <Campinho />
      <Ator quem="caco" pose={caco} />
      <Ator quem="dudu" pose={dudu} />
      <Ator quem="cida" pose={{ ...vo, esq: true }} fala={fala("cida")} />
      <Impacto x={mL[0]} y={mL[1]} d={f - Math.round(tPau * fps)} raio={26} esc={0.8} />
    </Camera>
  );
};

// ---------------------------------------------------------------- c4_final: a final, o Téo no gol
const X_GOL = trave.x - 130;
const teoGoleiro = (t: number): PoseTeo => {
  const p = parado(X_GOL, CC, 1, true)(t);
  const bate = Math.abs(Math.sin(t * 9));
  return { ...p, arm_upper_R: 50 + 10 * bate, arm_lower_R: 50, arm_upper_L: 46 + 10 * bate, arm_lower_L: 50, torso: { ...p.torso, rot: 6 } };
};
const LUVA = { ...TEO, luvas: "#3FAF63" };
const TURMA_FINAL: [NomeElenco, number, boolean][] = [["turma1", 620, false], ["turma3", 360, false], ["dudu", 960, true]];
const C4Final: React.FC = () => {
  const { t, dur } = usePlano();
  return (
    <Camera chaves={[{ t: 0, z: 1.3, cx: 960, cy: 420 }, { t: 1.6, z: 1.3, cx: 960, cy: 420 }, { t: 3.2, z: 1.2, cx: 1300, cy: 560 }, { t: dur, z: 1.25, cx: 1320, cy: 560 }]}>
      <Campinho final />
      {TURMA_FINAL.map(([q, x, esq], i) => <Ator key={q} quem={q} pose={{ ...parado(x, CC, E(q), esq)(t + i), expr: "bravo" }} />)}
      <Boneco pose={{ ...teoGoleiro(t), expr: "sorriso" }} v={LUVA} />
      <TraveFrente />
    </Camera>
  );
};

// ---------------------------------------------------------------- c4_defesa: defende com a cara, a bola sobe, ele ri
const K_C = 0.5;
const chute = (p: PoseTeo, k: number): PoseTeo => ({ ...p, leg_upper_R: -35 + 115 * k, leg_lower_R: k < 0.55 ? -70 : -70 + 70 * ((k - 0.55) / 0.45), pe_R: 0, arm_upper_L: 50 * k, arm_upper_R: -30 * k, torso: { ...p.torso, rot: -6 * k } });
const X_ATAC = 760;
const C4Defesa: React.FC = () => {
  const { t, f, fps, dur, S } = usePlano();
  const tB = S("bola");
  const tC = tB - 0.38;
  const atac0 = parado(X_ATAC, CC, E("turma1"));
  let atac = atac0(t);
  if (t > tC - 0.4) atac = t < tC ? mix(chute(atac, 0), chute(atac, K_C), rampa(t, tC - 0.15, tC, (x) => x * x)) : mix(chute(atac, Math.min(1, K_C + (t - tC) / 0.16 * (1 - K_C))), atac, rampa(t, tC + 0.4, tC + 0.8));
  const bola0 = (() => { const p = chute(atac0(0), K_C); const pt = pts("turma1", p).pontaR; return [pt[0] + 26, CC - 30] as [number, number]; })();
  let teo = teoGoleiro(t);
  teo = { ...teo, arm_upper_R: 70, arm_upper_L: 60 };
  const rosto = pts("teo", teo).rosto;
  const golpe = pulso(t, tB, 0.5);
  teo = { ...teo, head: { ...teo.head, rot: teo.head.rot - 24 * golpe }, torso: { ...teo.torso, rot: teo.torso.rot - 10 * golpe } };
  if (t > tB + 1.4) teo = rir(teo, t, 1);
  let bx = bola0[0], by = bola0[1];
  if (t >= tC && t < tB) { const k = (t - tC) / (tB - tC); bx = bola0[0] + (rosto[0] - 12 - bola0[0]) * k; by = bola0[1] + (rosto[1] - bola0[1]) * k - 60 * Math.sin(Math.PI * k); }
  else if (t >= tB) { const d = t - tB; bx = rosto[0] - 12 - 160 * d; by = rosto[1] - 1300 * d + 900 * d * d; }
  return (
    <Camera chaves={[{ t: 0, z: 1.05, cx: 1150, cy: 560 }, { t: tB, z: 1.1, cx: 1180, cy: 560 }, { t: tB + 0.01, z: 1.7, cx: X_GOL - 120, cy: 460, corte: true }, { t: dur, z: 1.8, cx: X_GOL - 120, cy: 460 }]} tremores={[tB]}>
      <Campinho final />
      <Ator quem="turma1" pose={{ ...atac, expr: "bravo" }} />
      <Boneco pose={{ ...teo, piscar: t > tB && t < tB + 0.12 }} v={LUVA} />
      <Bola x={bx} y={by} r={30} giro={t * 600} />
      <Impacto x={rosto[0]} y={rosto[1]} d={f - Math.round(tB * fps)} raio={50} />
      <TraveFrente />
    </Camera>
  );
};

// ---------------------------------------------------------------- c4_trave: cai contra a trave e levanta
const C4Trave: React.FC = () => {
  const { t, f, fps, dur, S } = usePlano();
  const tT = S("trave");
  // cambaleia de costas até as costas da cabeça encostarem no poste (ele olha para a esquerda)
  const xBate = (() => {
    const p = { ...parado(0, CC, 1, true)(0), torso: { ...parado(0, CC, 1, true)(0).torso, rot: -18 } };
    const c = pts("teo", p).cabeca;
    return FACE_TRAVE - (c[0] + 80);
  })();
  const recua = andar(xBate - 180, xBate, tT - 0.8, CC, 1);
  let teo: PoseTeo;
  if (t < tT) { const p = recua(t); teo = { ...p, esq: true, torso: { ...p.torso, x: xBate - 180 + (xBate - (xBate - 180)) * rampa(t, tT - 0.8, tT), rot: -18 * rampa(t, tT - 0.5, tT) } }; }
  else {
    const bate = { ...parado(xBate, CC, 1, true)(t), torso: { ...parado(xBate, CC, 1, true)(t).torso, rot: -18 } };
    const chao = sentadoChao(xBate - 40, CC, 1, true)(t);
    const pe = parado(xBate - 60, CC, 1, true)(t);
    teo = seq(t, [[tT, () => bate], [tT + 0.15, () => chao], [tT + 1.5, () => pe]], 0.35);
    // bate a poeira do short
    if (t > tT + 2.0) teo = comBracos(teo, { ...teo, arm_upper_R: 10 + 10 * Math.sin(t * 20), arm_lower_R: 40 }, 1, "R");
  }
  teo.piscar = t > tT && t < tT + 0.15;
  const trem = Math.sin((t - tT) * 60) * 6 * pulso(t, tT, 0.5);
  const cab = pts("teo", teo).cabeca;
  return (
    <Camera chaves={[{ t: 0, z: 1.5, cx: trave.x - 220, cy: 560 }, { t: dur, z: 1.55, cx: trave.x - 220, cy: 580 }]} tremores={[tT]}>
      <Campinho final />
      <Boneco pose={teo} v={LUVA} />
      <TraveFrente tremor={trem} />
      <Impacto x={FACE_TRAVE} y={cab[1]} d={f - Math.round(tT * fps)} angulos={[-160, -120, 120, 160]} />
    </Camera>
  );
};

// ---------------------------------------------------------------- c4_campeao: nos ombros, depois mancando
const C4Campeao: React.FC = () => {
  const { t, dur, F } = usePlano();
  const tCorte = F(1).ini - 0.05;
  if (t < tCorte) {
    const carregador = parado(960, CC, E("turma2"))(t);
    carregador.arm_upper_R = 150; carregador.arm_lower_R = 30; carregador.arm_upper_L = 140; carregador.arm_lower_L = 30;
    const om = pts("turma2", carregador).ombro;
    const teo = { ...base(om[0] - 6, om[1] - 12), leg_upper_R: 70, leg_lower_R: -50, leg_upper_L: 64, leg_lower_L: -56, pe_R: -10, pe_L: -10, arm_upper_R: 160 + 8 * Math.sin(t * 12), arm_lower_R: 10, arm_upper_L: 150 - 8 * Math.sin(t * 12), arm_lower_L: 10, expr: "rindo" as const };
    const corre: [NomeElenco, number, number][] = [["turma1", -200, 700], ["turma3", 2100, 1250], ["dudu", -300, 560], ["turma4", 2200, 1420]];
    return (
      <Camera chaves={[{ t: 0, z: 1.0, cx: 960, cy: 520 }, { t: tCorte, z: 1.1, cx: 960, cy: 500 }]}>
        <Campinho final />
        {corre.map(([q, x0, x1], i) => {
          const a = andar(x0, x1, 0.0, CC, E(q), { correr: true });
          const p = a(t);
          return <Ator key={q} quem={q} pose={{ ...(t > a.fim ? { ...p, arm_upper_R: 160, arm_upper_L: 150 } : p), expr: "rindo" }} semente={i} />;
        })}
        <Ator quem="turma2" pose={{ ...carregador, expr: "rindo" }} />
        <Boneco pose={teo} v={LUVA} />
        <TraveFrente />
      </Camera>
    );
  }
  // desce e sai mancando; a turma comemora olhando para cima, ninguém olha o pé
  const tl = t - tCorte;
  const anda = andar(700, 1300, tCorte + 0.1, CC, 1, { mancar: 1 });
  const teo = { ...anda(t), expr: "sorriso" as const };
  const turma: [NomeElenco, number][] = [["turma1", 480], ["turma2", 1500], ["dudu", 360], ["turma3", 1650]];
  return (
    <Camera chaves={[{ t: tCorte, z: 1.2, cx: 1000, cy: 640 }, { t: dur, z: 1.3, cx: 1100, cy: 680 }]}>
      <Campinho final />
      {turma.map(([q, x], i) => {
        const p = parado(x, CC, E(q), x > 1000)(t);
        const pula = Math.abs(Math.sin(t * 7 + i));
        return <Ator key={q} quem={q} pose={{ ...p, torso: { ...p.torso, y: p.torso.y - 30 * pula }, arm_upper_R: 160, arm_upper_L: 150, head: { rot: -14, offsetY: 0 }, expr: "rindo" }} />;
      })}
      <Boneco pose={teo} v={LUVA} />
      {tl > 0 && <TraveFrente />}
    </Camera>
  );
};

// ---------------------------------------------------------------- c4_reporter
const C4Reporter: React.FC = () => {
  const { t, dur, fala } = usePlano();
  const teo = { ...parado(820, CC, 1)(t), expr: "neutro" as const };
  const boca = pts("teo", teo).boca;
  let viz = parado(1150, CC, E("vizinho"), true)(t);
  viz = { ...maoEm(viz, "R", [boca[0] + 70, boca[1] + 40], E("vizinho"), V("vizinho")), objR: "celular", expr: "sorriso" };
  viz.torso.rot = 10;
  return (
    <Camera chaves={[{ t: 0, z: 1.45, cx: 990, cy: 470 }, { t: dur, z: 1.55, cx: 980, cy: 470 }]}>
      <Campinho final />
      <Boneco pose={{ ...teo, falando: fala("teo") }} v={LUVA} />
      <Ator quem="vizinho" pose={viz} fala={fala("vizinho")} />
    </Camera>
  );
};

// ---------------------------------------------------------------- c4_roxo: noite, o roxo na canela
const C4Roxo: React.FC = () => {
  const { t, dur } = usePlano();
  const p = { ...deitado(740, Q.colchao, 1)(t), roxo: 1 };
  p.piscar = (t > 5.0 && t < 5.15);
  const canela = pts("teo", p).canelaR;
  const cab = pts("teo", p).cabeca;
  return (
    <Camera fundo="#1E2A5A" chaves={[{ t: 0, z: 2.4, cx: canela[0], cy: canela[1] - 20 }, { t: 2.6, z: 2.4, cx: canela[0], cy: canela[1] - 20 }, { t: 4.2, z: 2.0, cx: cab[0] + 40, cy: cab[1] }, { t: dur, z: 2.1, cx: cab[0] + 40, cy: cab[1] }]}>
      <QuartoFundo pecas={[]} noite />
      <Ator quem="teo" pose={p} semPiscar />
      <QuartoFrente />
      <Noite />
    </Camera>
  );
};

export const CAP4: Record<string, React.FC> = {
  c4_viral: C4Viral, c4_montagem: C4Montagem, c4_dudu: C4Dudu, c4_vo: C4Vo, c4_final: C4Final, c4_defesa: C4Defesa, c4_trave: C4Trave, c4_campeao: C4Campeao, c4_reporter: C4Reporter, c4_roxo: C4Roxo,
};
export { cruzados, sino };
