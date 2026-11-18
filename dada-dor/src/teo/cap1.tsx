// Capítulo 1: A terça em que nada doeu.
import React from "react";
import { Easing } from "remotion";
import { FONTE } from "../theme";
import { Porta, Liso } from "./cenarios";
import { ELENCO, type NomeElenco } from "./elenco";
import { Ator, Camera, Cartela, E, Impacto, Noite, pts, usePlano, V } from "./kit";
import { agachado, andar, apontar, base, comBracos, cruzados, deitado, maoEm, mix, parado, pePara, pulso, rampa, respira, sentado, seq, sino } from "./motor";
import { ALTURA_PECA, Q, QuartoFrente, QuartoFundo, type Peca } from "./Quarto";
import { Boneco, G, LINHA, PERNA, mundo, perna, type PoseTeo } from "./tira";

const ESC = 1;
const PASSO = 2 * PERNA * ESC * Math.sin((24 * Math.PI) / 180);

// ---------------------------------------------------------------- âncoras do quarto
const X_DEITADO = 740;
// plano 3 do quarto (tapete): o Téo para em X_PARA e pisa na pecinha sob a bola do pé direito
const X0_3 = 1990;
const X_PARA = X0_3 + 5 * PASSO;
const PECA_X = X_PARA + 46 * ESC;
const PECAS: Peca[] = [
  { x: PECA_X, cor: "#E23B2E" },
  { x: X0_3 + 160, cor: "#FFD23F" },
  { x: X0_3 + 160 + 2 * PASSO + 12, cor: "#3B6FD6", larg: 32 },
  { x: PECA_X + 150, cor: "#3FAF63" },
  { x: PECA_X + 196, cor: "#FFD23F", larg: 32 },
];
const PECAS_SEM_VERMELHA = PECAS.slice(1);
const PORTA_X = 3420;
const X_CACO = 3330;
const X_ROSE = 3560;

/** tornozelo do pé direito pousado em cima da pecinha (sola reta nos pinos) */
const pisando = (p: PoseTeo): PoseTeo => pePara(p, "R", [PECA_X - 34 * ESC, Q.chao - ALTURA_PECA - G.sola * ESC], ESC, 0);
const teoNaPeca = (t: number): PoseTeo => pisando(parado(X_PARA, Q.chao, ESC)(t));

// ---------------------------------------------------------------- c1_noite
const C1Noite: React.FC = () => {
  const { t, dur } = usePlano();
  const p = deitado(X_DEITADO, Q.colchao, ESC)(t);
  p.head.rot = -4;
  p.piscar = t > 2.2 && t < 2.42; // pisca devagar uma vez
  const cab = pts("teo", p).cabeca;
  return (
    <Camera fundo="#1E2A5A" chaves={[{ t: 0, z: 1.0, cx: 900, cy: 560 }, { t: dur, z: 1.75, cx: cab[0] + 60, cy: cab[1] + 30 }]}>
      <QuartoFundo pecas={[]} noite />
      <Ator quem="teo" pose={p} semPiscar />
      {/* lençol por cima das pernas */}
      <path d={`M ${X_DEITADO - 30} ${Q.colchao - 70} Q ${X_DEITADO + 120} ${Q.colchao - 92} ${X_DEITADO + 230} ${Q.colchao - 66} L ${X_DEITADO + 236} ${Q.colchao + 10} L ${X_DEITADO - 40} ${Q.colchao + 10} Z`} fill="#6F8FEF" stroke={LINHA} strokeWidth={7} strokeLinejoin="round" />
      <QuartoFrente />
      <Noite />
      {/* luz azul da janela */}
      <path d={`M 1440 230 L 1780 230 L 1100 ${Q.chao} L 300 ${Q.chao} Z`} fill="#9FB8FF" opacity={0.12} />
    </Camera>
  );
};

// ---------------------------------------------------------------- c1_quina (mesma encenação do esboço aprovado)
const FASE_TOC = 2 * Math.PI + 1.25;
const tempoFase = (f: number) => (f / (2 * Math.PI)) * 0.8;
const andarTeo = (tt: number, x0: number): PoseTeo => {
  const f = (2 * Math.PI * tt) / 0.8;
  const A = 24, L = PERNA * ESC;
  const thR = A * Math.sin(f);
  const s = L * Math.sin((thR * Math.PI) / 180);
  const n = Math.floor((f + Math.PI / 2) / Math.PI);
  const x = x0 + n * PASSO + (n % 2 ? -s : s);
  const y = Q.chao - (G.sola * ESC + L * Math.cos((thR * Math.PI) / 180));
  const p = base(x, y);
  const balR = Math.max(0, Math.cos(f)), balL = Math.max(0, -Math.cos(f));
  p.leg_upper_R = thR; p.leg_lower_R = -38 * balR; p.pe_R = -17 * balR;
  p.leg_upper_L = -thR; p.leg_lower_L = -38 * balL; p.pe_L = -17 * balL;
  p.arm_upper_R = -20 * Math.sin(f); p.arm_upper_L = 20 * Math.sin(f);
  p.arm_lower_R = 16 + 12 * Math.max(0, -Math.sin(f)); p.arm_lower_L = 16 + 12 * Math.max(0, Math.sin(f));
  p.head.rot = 1.5 * Math.sin(2 * f); p.torso.rot = 2;
  return p;
};
const X0 = (() => {
  const p = andarTeo(tempoFase(FASE_TOC), 0);
  return Q.poste - 1 - mundo(p, ESC, false, perna(p, "R").ponta)[0];
})();
const X_SENTA = X0 - 78;
const poseQuina = (t: number, T_TOC: number): PoseTeo => {
  const T_ANDA = T_TOC - tempoFase(FASE_TOC);
  const T_LEV = T_ANDA - 0.75;
  if (t < T_LEV) {
    const p = sentado(X_SENTA, Q.colchao, ESC)(t);
    const e = rampa(t, 0.35, 0.8) * (1 - rampa(t, 1.1, 1.45));
    p.arm_upper_R += (160 - p.arm_upper_R) * e; p.arm_lower_R += (16 - p.arm_lower_R) * e;
    p.arm_upper_L += (148 - p.arm_upper_L) * e; p.arm_lower_L += (20 - p.arm_lower_L) * e;
    p.head.rot -= 14 * e; p.torso.rot -= 6 * e; p.torso.scaleY += 0.04 * e;
    p.expr = "sono";
    return p;
  }
  const inclinado = (tt: number) => ({ ...sentado(X_SENTA, Q.colchao, ESC)(tt), arm_upper_R: 30, arm_upper_L: 20, torso: { ...sentado(X_SENTA, Q.colchao, ESC)(tt).torso, rot: 24 }, head: { rot: -10, offsetY: 0 } });
  const tl = t - T_LEV;
  if (tl < 0.22) return mix(sentado(X_SENTA, Q.colchao, ESC)(t), inclinado(t), rampa(tl, 0, 0.22));
  if (tl < 0.6) return mix(inclinado(t), parado(X0, Q.chao, ESC)(t), rampa(tl, 0.22, 0.52, Easing.out(Easing.cubic)));
  if (t < T_ANDA) {
    const p = parado(X0, Q.chao, ESC)(t);
    p.torso.scaleY -= 0.05 * pulso(tl, 0.52, 0.3);
    return mix(p, andarTeo(0, X0), rampa(t, T_ANDA - 0.12, T_ANDA));
  }
  if (t < T_TOC) return mix(parado(X0, Q.chao, ESC)(t), andarTeo(t - T_ANDA, X0), rampa(t, T_ANDA, T_ANDA + 0.12));
  const batida = andarTeo(T_TOC - T_ANDA, X0);
  const choque = pulso(t, T_TOC, 0.45);
  batida.torso.rot += 7 * choque;
  batida.head.rot -= 6 * choque;
  batida.arm_upper_R += 18 * choque; batida.arm_upper_L -= 22 * choque;
  const apoio = pePara(batida, "R", [Q.poste - 1 - G.ponta * ESC, Q.chao - G.sola * ESC], ESC, 0);
  return mix(batida, apoio, rampa(t, T_TOC + 0.32, T_TOC + 0.58));
};
const C1Quina: React.FC = () => {
  const { t, f, fps, dur, S } = usePlano();
  const T_TOC = S("toc");
  const p = poseQuina(t, T_TOC);
  if (t >= T_TOC && t < T_TOC + 0.13) p.piscar = true;
  const dToc = f - Math.round(T_TOC * fps);
  const trem = dToc >= 0 && dToc < 8 ? Math.sin(dToc * 2.4) * 4 * (1 - dToc / 8) : 0;
  return (
    <Camera chaves={[{ t: 0, z: 1, cx: 960, cy: 600 }, { t: dur, z: 1.05, cx: 960, cy: 600 }]} tremores={[T_TOC]}>
      <QuartoFundo pecas={[]} />
      <Ator quem="teo" pose={p} />
      <QuartoFrente tremor={trem} />
      <Impacto x={Q.poste} y={Q.chao - 16} d={dToc} angulos={[-160, -125, -90, 160]} />
    </Camera>
  );
};
const C1Nada: React.FC = () => {
  const { t } = usePlano();
  const p = poseQuina(99, 0);
  const olha = rampa(t, 0.12, 0.38, Easing.out(Easing.cubic)) * (1 - rampa(t, 1.45, 1.75));
  p.head.rot += 20 * olha;
  const pp = respira(p, t);
  return (
    <Camera chaves={[{ t: 0, z: 1.62, cx: Q.poste - 300, cy: 690 }, { t: 2.4, z: 1.68, cx: Q.poste - 300, cy: 690 }]}>
      <QuartoFundo pecas={[]} />
      <Ator quem="teo" pose={pp} />
      <QuartoFrente />
    </Camera>
  );
};

// ---------------------------------------------------------------- c1_pecinha
const poseStomp = (t: number, T_CLAC: number): PoseTeo => {
  const T_PARA = T_CLAC - 0.65;
  const T_ANDA = T_PARA - 2.0;
  if (t < T_PARA) return andarTeo(Math.max(0, t - T_ANDA), X0_3);
  const firme = parado(X_PARA, Q.chao, ESC)(t);
  if (t < T_PARA + 0.18) return mix(andarTeo(T_PARA - T_ANDA, X0_3), firme, rampa(t, T_PARA, T_PARA + 0.18));
  const sobe: PoseTeo = { ...firme, leg_upper_R: 62, leg_lower_R: -104, pe_R: -14, arm_upper_R: 38, arm_lower_R: 30, arm_upper_L: -36, arm_lower_L: 30, torso: { ...firme.torso, rot: -5 } };
  const desce = pisando({ ...firme, arm_upper_R: 14, arm_lower_R: 20, arm_upper_L: -12, arm_lower_L: 20, torso: { ...firme.torso, rot: 6 } });
  const T_SOBE = T_CLAC - 0.55, T_DESCE = T_CLAC - 0.1;
  const pose = t < T_DESCE ? mix(firme, sobe, rampa(t, T_SOBE, T_SOBE + 0.32, Easing.out(Easing.cubic))) : mix(sobe, desce, rampa(t, T_DESCE, T_CLAC, Easing.in(Easing.quad)));
  const choque = pulso(t, T_CLAC, 0.4);
  pose.torso.scaleY *= 1 - 0.07 * choque;
  pose.head.offsetY += 6 * choque;
  return pose;
};
const pulosPecas = (dClac: number) => PECAS.map((pc, i) => (i === 0 ? 0 : 12 * Math.max(0, Math.sin(Math.PI * Math.min(1, Math.max(0, (dClac - Math.abs(pc.x - PECA_X) / 100) / 7))))));
const C1Pecinha: React.FC = () => {
  const { t, f, fps, dur, S } = usePlano();
  const T_CLAC = S("clac");
  const p = poseStomp(t, T_CLAC);
  if (t >= T_CLAC && t < T_CLAC + 0.13) p.piscar = true;
  const dClac = f - Math.round(T_CLAC * fps);
  return (
    <Camera chaves={[{ t: 0, z: 1.35, cx: PECA_X - 140, cy: 700 }, { t: dur, z: 1.45, cx: PECA_X - 110, cy: 720 }]} tremores={[T_CLAC]}>
      <QuartoFundo pecas={PECAS} pulos={pulosPecas(dClac)} />
      <Ator quem="teo" pose={p} />
      <Impacto x={PECA_X} y={Q.chao - 10} d={dClac} angulos={[-170, -140, -40, -10]} raio={60} />
    </Camera>
  );
};

// ---------------------------------------------------------------- c1_caco: aparece na porta e aponta
const portaAberta = (t: number, a: number) => rampa(t, a, a + 0.35, Easing.out(Easing.back(1.4)));
const C1Caco: React.FC = () => {
  const { t, dur, fala } = usePlano();
  const teo = teoNaPeca(t);
  teo.head.rot = -4 + 4 * rampa(t, 0.6, 0.9);
  const anda = andar(X_ROSE, X_CACO, 0.25, Q.chao, E("caco"));
  let caco = anda(t);
  const alvo = pts("teo", teo).bolaR;
  caco = comBracos(caco, apontar(caco, [alvo[0], alvo[1] - 20], E("caco"), V("caco")), rampa(t, anda.fim - 0.1, anda.fim + 0.25));
  caco.expr = "surpreso";
  return (
    <Camera chaves={[{ t: 0, z: 1.12, cx: 3020, cy: 600 }, { t: dur, z: 1.18, cx: 3000, cy: 610 }]}>
      <QuartoFundo pecas={PECAS} />
      <Porta x={PORTA_X} chao={Q.chao} aberta={portaAberta(t, 0)} />
      <Ator quem="caco" pose={caco} fala={fala("caco")} />
      <Ator quem="teo" pose={teo} />
    </Camera>
  );
};

// ---------------------------------------------------------------- c1_tira: pecinha grudada na sola, tira e joga fora
const C1Tira: React.FC = () => {
  const { t, dur } = usePlano();
  const firme = parado(X_PARA, Q.chao, ESC)(t);
  const naPeca = teoNaPeca(t);
  // pé direito sobe à frente com a sola virada para a câmera
  const pe: PoseTeo = { ...firme, leg_upper_R: 74, leg_lower_R: -58, pe_R: 64, torso: { ...firme.torso, rot: 10 }, head: { rot: 22, offsetY: 0 }, arm_upper_L: -30, arm_lower_L: 20 };
  let p = seq(t, [[0, () => naPeca], [0.25, () => pe]], 0.35);
  const sola = (q: PoseTeo) => {
    const k = perna(q, "R");
    return { bola: mundo(q, ESC, false, k.bola), ang: -q.pe_R };
  };
  const T_PEGA = 1.25, T_PUXA = 1.65, T_JOGA = 2.15;
  const s = sola(p);
  // mão direita vai até a sola, puxa, e arremessa para a direita
  if (t > 0.95) {
    const alvoSola: [number, number] = [s.bola[0] + 8, s.bola[1] + 6];
    const pega = maoEm(p, "R", alvoSola, ESC);
    const puxa = maoEm(p, "R", [s.bola[0] - 50, s.bola[1] - 60], ESC);
    const prepara = { ...p, arm_upper_R: -40, arm_lower_R: 60 };
    const solta = { ...p, arm_upper_R: 150, arm_lower_R: 10 };
    const braco = seq(t, [[0.95, () => pega], [T_PUXA, () => puxa], [T_JOGA - 0.2, () => prepara], [T_JOGA, () => solta], [T_JOGA + 0.45, () => p]], 0.22);
    p = comBracos(p, braco, 1, "R");
  }
  // depois do arremesso o pé volta ao chão
  if (t > T_JOGA + 0.2) p = mix(p, { ...firme, head: { rot: 0, offsetY: 0 } }, rampa(t, T_JOGA + 0.2, T_JOGA + 0.6));
  const pecaNaMao = t >= T_PEGA + 0.18 && t < T_JOGA;
  const pecaNoPe = t < T_PEGA + 0.18;
  if (pecaNaMao) p.objR = "pecinha";
  // voo da pecinha depois de solta
  const mao0 = pts("teo", { ...p, ...{} }).maoR;
  const voo = t >= T_JOGA ? t - T_JOGA : -1;
  const vx = 900, vy = -700, gr = 2600;
  const sp = s;
  return (
    <Camera chaves={[{ t: 0, z: 1.55, cx: X_PARA + 40, cy: 660 }, { t: dur, z: 1.6, cx: X_PARA + 60, cy: 660 }]}>
      <QuartoFundo pecas={PECAS_SEM_VERMELHA} />
      <Ator quem="teo" pose={p} />
      {pecaNoPe && (
        <g transform={`translate(${sp.bola[0]} ${sp.bola[1]}) rotate(${sp.ang})`}>
          <rect x={-22} y={0} width={44} height={18} rx={3} fill="#E23B2E" stroke={LINHA} strokeWidth={5} />
          <rect x={-17} y={18} width={12} height={8} rx={2} fill="#E23B2E" stroke={LINHA} strokeWidth={4} />
          <rect x={5} y={18} width={12} height={8} rx={2} fill="#E23B2E" stroke={LINHA} strokeWidth={4} />
        </g>
      )}
      {voo >= 0 && voo < 1.2 && <rect x={mao0[0] + vx * voo - 22} y={mao0[1] - 40 + vy * voo + 0.5 * gr * voo * voo} width={44} height={18} rx={3} fill="#E23B2E" stroke={LINHA} strokeWidth={5} transform={`rotate(${voo * 900} ${mao0[0] + vx * voo} ${mao0[1] - 40 + vy * voo + 0.5 * gr * voo * voo})`} />}
    </Camera>
  );
};

// ---------------------------------------------------------------- c1_rose: entra de braços cruzados
const roseEntra = (t: number, ini: number) => {
  const anda = andar(3760, X_ROSE, ini, Q.chao, E("rose"));
  let r = anda(t);
  r = comBracos(r, cruzados(r), rampa(t, anda.fim - 0.1, anda.fim + 0.3));
  r.expr = "bravo";
  return r;
};
const cacoParado = (t: number) => ({ ...parado(X_CACO, Q.chao, E("caco"), true)(t), expr: "neutro" as const });
const C1Rose: React.FC = () => {
  const { t, dur, fala } = usePlano();
  const rose = roseEntra(t, -0.4);
  const caco = cacoParado(t);
  caco.head.rot = -10 * rampa(t, 0.2, 0.5); // olha a mãe
  const teo = parado(X_PARA, Q.chao, ESC)(t);
  return (
    <Camera chaves={[{ t: 0, z: 1.25, cx: 3260, cy: 560 }, { t: dur, z: 1.32, cx: 3280, cy: 560 }]}>
      <QuartoFundo pecas={PECAS_SEM_VERMELHA} />
      <Porta x={PORTA_X} chao={Q.chao} aberta={1} />
      <Ator quem="rose" pose={rose} fala={fala("rose")} />
      <Ator quem="caco" pose={{ ...caco, esq: false }} />
      <Ator quem="teo" pose={teo} />
    </Camera>
  );
};
const C1Quebrou: React.FC = () => {
  const { t, dur, fala } = usePlano();
  const teo = parado(X_PARA, Q.chao, ESC)(t);
  const rose = cruzados(parado(X_ROSE, Q.chao, E("rose"), true)(t));
  rose.expr = "bravo";
  rose.head.rot = 6 * rampa(t, 0.5, 0.8);
  let caco = parado(X_CACO, Q.chao, E("caco"), true)(t);
  caco = comBracos(caco, apontar(caco, pts("teo", teo).cabeca, E("caco"), V("caco")), rampa(t, 0.15, 0.4));
  caco.expr = "preocupado";
  return (
    <Camera chaves={[{ t: 0, z: 1.0, cx: 3050, cy: 560 }, { t: dur, z: 1.04, cx: 3050, cy: 560 }]}>
      <QuartoFundo pecas={PECAS_SEM_VERMELHA} />
      <Porta x={PORTA_X} chao={Q.chao} aberta={1} />
      <Ator quem="rose" pose={rose} />
      <Ator quem="caco" pose={caco} fala={fala("caco")} />
      <Ator quem="teo" pose={teo} />
    </Camera>
  );
};

// ---------------------------------------------------------------- c1_belisco
const X_ROSE_BELISCA = X_PARA + 190;
const roseBelisca = (t: number, beliscos: number[], teo: PoseTeo): PoseTeo => {
  const anda = andar(X_ROSE, X_ROSE_BELISCA, 0.0, Q.chao, E("rose"));
  let r = anda(t);
  r = comBracos(r, cruzados(r), 1 - rampa(t, anda.fim - 0.3, anda.fim));
  const braco = pts("teo", teo).bracoR;
  const alvo: [number, number] = [braco[0] + 6, braco[1] - 4];
  let k = 0;
  for (const b of beliscos) k = Math.max(k, rampa(t, b - 0.3, b - 0.05) * (1 - rampa(t, b + 0.35, b + 0.6)));
  r = comBracos(r, maoEm(r, "R", alvo, E("rose"), V("rose")), k, "R");
  const torce = beliscos.reduce((a, b) => a + pulso(t, b - 0.02, 0.3), 0);
  r.arm_lower_R += 8 * torce;
  r.torso.rot += 4 * k;
  r.expr = t > beliscos[1] + 0.3 ? "surpreso" : "bravo";
  return r;
};
const C1Belisco: React.FC = () => {
  const { t, f, fps, dur, S } = usePlano();
  const b1 = Math.min(S("belisco", 0), S("belisco", 1)), b2 = Math.max(S("belisco", 0), S("belisco", 1));
  const teo = parado(X_PARA, Q.chao, ESC)(t);
  teo.head.rot = -2;
  if ((t > b1 && t < b1 + 0.1) || (t > b2 + 0.4 && t < b2 + 0.5)) teo.piscar = true;
  const rose = roseBelisca(t, [b1, b2], teo);
  const br = pts("teo", teo).bracoR;
  return (
    <Camera chaves={[{ t: 0, z: 1.3, cx: X_PARA + 160, cy: 560 }, { t: dur, z: 1.45, cx: X_PARA + 120, cy: 560 }]}>
      <QuartoFundo pecas={PECAS_SEM_VERMELHA} />
      <Ator quem="teo" pose={teo} />
      <Ator quem="rose" pose={rose} />
      <Impacto x={br[0]} y={br[1]} d={f - Math.round(b1 * fps)} raio={22} angulos={[-150, -110, -70]} esc={0.7} />
      <Impacto x={br[0]} y={br[1]} d={f - Math.round(b2 * fps)} raio={22} angulos={[-150, -110, -70, -30]} esc={0.9} />
    </Camera>
  );
};

// ---------------------------------------------------------------- c1_mao: ela olha a própria mão, depois o Téo
const C1Mao: React.FC = () => {
  const { t, dur, fala } = usePlano();
  const teo = parado(X_PARA, Q.chao, ESC)(t);
  let rose = parado(X_ROSE_BELISCA, Q.chao, E("rose"), true)(t);
  const cab = pts("rose", rose).cabeca;
  const olhaMao = sino(t, 0.0, 1.9, 0.35, 0.35);
  rose = comBracos(rose, maoEm(rose, "R", [cab[0] - 150, cab[1] + 95], E("rose"), V("rose")), olhaMao, "R");
  rose.head.rot = 14 * olhaMao - 4 * (1 - olhaMao);
  rose.expr = olhaMao > 0.5 ? "curioso" : "serio";
  return (
    <Camera chaves={[{ t: 0, z: 1.8, cx: X_PARA + 110, cy: 470 }, { t: dur, z: 1.9, cx: X_PARA + 110, cy: 470 }]}>
      <QuartoFundo pecas={PECAS_SEM_VERMELHA} />
      <Ator quem="teo" pose={teo} />
      <Ator quem="rose" pose={rose} fala={fala("rose")} />
    </Camera>
  );
};

// ---------------------------------------------------------------- c1_cartelas
const C1Cartelas: React.FC = () => {
  const { t, F } = usePlano();
  const teo = parado(960, 940, 1.15)(t);
  const fim = F(0).fim;
  const marcas = [fim - 2.55, fim - 1.6, fim - 0.75];
  const palavras = ["PANCADA", "QUEIMADURA", "AGULHADA"];
  const lugar: [number, number, number][] = [[520, 300, -4], [1420, 380, 3], [960, 150, -2]];
  return (
    <Camera chaves={[{ t: 0, z: 1, cx: 960, cy: 540 }]} fundo="#86DDBE">
      <Liso cor="#86DDBE" padrao="#7ACFB2" />
      <Boneco pose={teo} esc={1.15} />
      {palavras.map((w, i) => (
        <g key={w}>
          <Cartela texto={w} x={lugar[i][0]} y={lugar[i][1]} tam={74} desde={marcas[i]} gira={lugar[i][2]} />
          {t > marcas[i] + 0.25 && (
            <g transform={`translate(${lugar[i][0]} ${lugar[i][1]}) scale(${Math.min(1, (t - marcas[i] - 0.25) / 0.1)})`} stroke="#E23B2E" strokeWidth={22} strokeLinecap="round">
              <line x1={-80} y1={-70} x2={80} y2={70} />
              <line x1={80} y1={-70} x2={-80} y2={70} />
            </g>
          )}
        </g>
      ))}
    </Camera>
  );
};

// ---------------------------------------------------------------- c1_raro: campo de bonecos cinza, um colorido
const FIGURANTES: NomeElenco[] = ["dudu", "caco", "turma1", "turma2", "turma3", "turma4", "rose", "vizinho", "nelson", "helena", "maeDudu", "cida"];
const C1Raro: React.FC = () => {
  const { t, dur } = usePlano();
  const fileiras = [
    { y: 560, esc: 0.55, n: 11, dx: 165 },
    { y: 760, esc: 0.72, n: 9, dx: 210 },
    { y: 1000, esc: 0.9, n: 7, dx: 280 },
  ];
  const viram = rampa(t, 2.6, 3.0);
  return (
    <Camera chaves={[{ t: 0, z: 2.4, cx: 960, cy: 640 }, { t: 1.6, z: 1.0, cx: 960, cy: 560 }, { t: dur, z: 1.04, cx: 960, cy: 560 }]} fundo="#E8E4DA">
      <Liso cor="#E8E4DA" />
      {fileiras.map((fl, j) =>
        Array.from({ length: fl.n }, (_, i) => {
          const x = 960 + (i - (fl.n - 1) / 2) * fl.dx + (j === 1 ? fl.dx / 2 : 0);
          const centro = j === 2 && i === Math.floor(fl.n / 2);
          const quem = FIGURANTES[(i * 5 + j * 3) % FIGURANTES.length];
          const m = ELENCO[quem];
          const e = fl.esc * (centro ? 1 : m.esc);
          const p = parado(x, fl.y, e, x > 960, i + j)(t);
          if (!centro) p.head.rot += (x > 960 ? 1 : 1) * 10 * viram;
          if (centro) {
            const ombros = pulso(t, 3.3, 0.6);
            p.arm_upper_R += 20 * ombros; p.arm_upper_L -= 20 * ombros; p.torso.scaleY += 0.04 * ombros;
          }
          return <Boneco key={`${i}-${j}`} pose={p} esc={e} v={centro ? ELENCO.teo.v : { ...m.v, cinza: true }} />;
        }),
      )}
    </Camera>
  );
};

// ---------------------------------------------------------------- c1_titulo
export const Titulo: React.FC<{ linhas: string[]; desde?: number; cor?: string; tam?: number; y?: number }> = ({ linhas, desde = 0, cor = "#FFD23F", tam = 110, y = 470 }) => {
  const { t } = usePlano();
  const d = Math.max(0, t - desde);
  const s = t < desde ? 0 : d < 0.2 ? 0.5 + 0.65 * (d / 0.2) : 1.15 - 0.15 * Math.min(1, (d - 0.2) / 0.14);
  const larg = Math.max(...linhas.map((l) => l.length)) * tam * 0.64 + 120;
  const alt = linhas.length * tam * 1.12 + 70;
  return (
    <g transform={`translate(960 ${y}) rotate(-2) scale(${s})`}>
      <rect x={-larg / 2 + 16} y={-alt / 2 + 16} width={larg} height={alt} rx={18} fill={LINHA} />
      <rect x={-larg / 2} y={-alt / 2} width={larg} height={alt} rx={18} fill={cor} stroke={LINHA} strokeWidth={10} />
      {linhas.map((l, i) => (
        <text key={i} x={0} y={-alt / 2 + 35 + tam * 0.9 + i * tam * 1.12} textAnchor="middle" fontFamily={FONTE} fontWeight={900} fontSize={tam} fill={LINHA}>{l}</text>
      ))}
    </g>
  );
};
const C1Titulo: React.FC = () => {
  const { t } = usePlano();
  const teo = parado(960, 1060, 0.7)(t);
  teo.head.rot = -8;
  return (
    <Camera chaves={[{ t: 0, z: 1, cx: 960, cy: 540 }]} fundo="#E9707F">
      <Liso cor="#E9707F" padrao="#DE6273" />
      <Titulo linhas={["E SE VOCÊ PARASSE", "DE SENTIR DOR?"]} desde={0.15} y={400} />
      <Boneco pose={teo} esc={0.7} />
    </Camera>
  );
};

export const CAP1: Record<string, React.FC> = {
  c1_noite: C1Noite, c1_quina: C1Quina, c1_nada: C1Nada, c1_pecinha: C1Pecinha, c1_caco: C1Caco, c1_tira: C1Tira,
  c1_rose: C1Rose, c1_quebrou: C1Quebrou, c1_belisco: C1Belisco, c1_mao: C1Mao, c1_cartelas: C1Cartelas, c1_raro: C1Raro, c1_titulo: C1Titulo,
};
export { agachado };
