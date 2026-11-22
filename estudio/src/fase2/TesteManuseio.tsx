// Fase 2: teste de manuseio (12 s, 360 quadros).
// Parado respirando com a mão no bolso -> olha para o fogão -> vai até ele -> alcança, pega e levanta a panela ->
// cara de chocado -> devolve a panela. Depois pega a xícara e o celular e fica olhando o celular tomando café.
import React from "react";
import { useCurrentFrame } from "remotion";
import { Person, maoInfo, type Mao, type P } from "../components/Person";
import { expressaoNoQuadro, type Expr } from "../components/Face";
import { Palco } from "../components/Papel";
import { FPS } from "../estilo";
import { idle, walk } from "../rig/actions";
import { rampa, seq, suave, type Pose } from "../rig/pose";
import { alcance, carrega, paraLocal, squash } from "../rig/manuseio";
import { CELULAR, ObjetoNaMao, ObjetoNoMundo, PANELA, XICARA, type EstadoObj, type ObjetoDef } from "../objects/objetos";
import { Azulejos, Bancada, Chao, Fogao } from "./Cozinha";

export const DURACAO_TESTE_MANUSEIO = 360;

// ------------------------------------------------------------------ mundo
const S = 1.5; // escala do personagem e dos objetos
const FY = 930; // chão do personagem (ele fica na frente dos móveis)
const BASE = 900; // base dos móveis
const TOPO = 695; // tampo da bancada e do fogão
const BOCAS = [1380, 1522];
const PAN: P = [BOCAS[0], TOPO - 8]; // panela apoiada na grelha da boca esquerda
const pegaMundo = (def: ObjetoDef, em: P, e: EstadoObj): P => [em[0] + def.pega(e)[0] * S, em[1] + def.pega(e)[1] * S];
const G_PAN = pegaMundo(PANELA, PAN, { t: 0 });
const PASSO = 86; // px locais por passo
const XP = G_PAN[0] - 150 * S; // de pé no fogão: a alça fica 150 px (locais) à direita do corpo
const XM = XP - PASSO * S; // um passo para a esquerda: entre o celular e a xícara
const X0 = XP - 4 * PASSO * S; // início: quatro passos antes do fogão
const XIC: P = [XM + 150 * S - XICARA.pega({ t: 0 })[0] * S, TOPO]; // xícara à direita de XM, alça para fora
const CEL: P = [XM - 150 * S - CELULAR.pega({ t: 0, vira: 0 })[0] * S, TOPO]; // celular deitado à esquerda de XM
const G_XIC = pegaMundo(XICARA, XIC, { t: 0 });
const G_CEL = pegaMundo(CELULAR, CEL, { t: 0, vira: 0 });

// ------------------------------------------------------------------ tempos (quadros)
const T_OLHA = 34; // os olhos vão para o fogão; a cabeça acompanha 4 quadros depois
const T_ANDA = 48; // 4 passos de 20 quadros
const ANDA1 = walk({ x: X0, y: FY, scale: S, xa: X0, xb: XP, f0: T_ANDA, passo: PASSO });
const T_ALC = ANDA1.fim + 6; // alcança a alça (antecipação de 3 quadros + 11 de trajeto)
const T_PEGA = T_ALC + 14; // contato: punho + squash
const T_SOBE0 = T_PEGA + 4, T_SOBE1 = T_SOBE0 + 30; // levanta devagar: panela pesada
const T_SUSTO = T_SOBE1 - 8; // o vapor sobe e ele leva o susto
const T_DESCE0 = T_SOBE1 + 10, T_DESCE1 = T_DESCE0 + 16; // devolve mais rápido
const T_SOLTA = T_DESCE1; // a mão abre, a panela fica apoiada
const T_OLHA2 = T_SOLTA + 8; // olha para a bancada
const T_VOLTA = T_SOLTA + 12; // um passo para a esquerda
const ANDA2 = walk({ x: XP, y: FY, scale: S, xa: XP, xb: XM, f0: T_VOLTA, passo: PASSO });
const T_ALC_CEL = ANDA2.fim + 4, T_PEGA_CEL = T_ALC_CEL + 14;
const T_ALC_XIC = T_ALC_CEL + 4, T_PEGA_XIC = T_ALC_XIC + 14; // as duas mãos não saem juntas
const T_ERGUE0 = T_PEGA_CEL + 4, T_ERGUE1 = T_ERGUE0 + 22;
const GOLES: [number, number][] = [[T_ERGUE1 + 10, T_ERGUE1 + 40], [T_ERGUE1 + 44, 360]];

// ------------------------------------------------------------------ alvos locais das mãos
const LIFT: P = [128, -262]; // alça da panela levantada (altura do ombro, cotovelo para baixo)
const SEGURA_CEL: P = [-22, -202]; // celular na frente do peito
const SEGURA_XIC: P = [96, -196]; // xícara na altura do peito
const BOCA_XIC: P = [58, -303]; // gole: borda da xícara na boca

const l = (a: number, b: number, k: number) => a + (b - a) * k;
const lp = (a: P, b: P, k: number): P => [l(a[0], b[0], k), l(a[1], b[1], k)];
const saiRapido = (x: number) => 1 - Math.pow(1 - Math.min(1, Math.max(0, x)), 3);

// ------------------------------------------------------------------ corpo (pés, peso, respiração, balanço dos braços)
const bolso = (f: number): Pose => ({ ...idle({ x: X0, y: FY, scale: S })(f), handR: [36, -96], gripR: "none", hip: 5 });
const parado = (x: number) => (f: number): Pose => idle({ x, y: FY, scale: S })(f);
const corpo = (f: number): Pose => seq(f, [[0, bolso], [T_ANDA, ANDA1], [ANDA1.fim, parado(XP)], [T_VOLTA, ANDA2], [ANDA2.fim, parado(XM)]], 8);
const local = (w: P, f: number): P => paraLocal(w, corpo(f).x, FY, S);

// ------------------------------------------------------------------ mão direita (+x): bolso -> panela -> xícara
const maoR = (f: number): { alvo: P; pega: Mao; sq: number } => {
  const c = corpo(f);
  const solta = c.handR ?? [74, -108];
  if (f < T_ANDA + 3) return { alvo: [36, -96], pega: "none", sq: 0 }; // no bolso
  if (f < T_ANDA + 14) return { alvo: lp([36, -102], solta, saiRapido((f - T_ANDA - 3) / 11)), pega: "open", sq: 0 }; // sai do bolso
  if (f < T_ALC) return { alvo: solta, pega: "open", sq: 0 };
  const gp = local(G_PAN, T_PEGA);
  if (f < T_PEGA) return { alvo: alcance(f, T_ALC, T_PEGA, corpo(T_ALC).handR ?? [74, -108], gp, 26), pega: "open", sq: 0 };
  if (f < T_SOLTA) {
    // segurando a panela: sobe devagar (pesada), treme no susto, desce mais rápido
    let p: P = gp;
    if (f >= T_SOBE0 && f < T_DESCE0) {
      const k = Math.pow(suave((f - T_SOBE0) / (T_SOBE1 - T_SOBE0)), 1.35);
      p = lp(gp, LIFT, f >= T_SOBE1 ? 1 : k);
    } else if (f >= T_DESCE0) p = carrega(f, T_DESCE0, T_DESCE1, LIFT, gp, 10);
    if (f >= T_SUSTO && f < T_DESCE0 + 6) {
      const d = f - T_SUSTO;
      p = [p[0] + 3 * Math.sin(d * 1.9) * Math.exp(-d / 7), p[1] - 10 * Math.sin(Math.PI * Math.min(1, d / 8)) * (d < 8 ? 1 : 0)];
    }
    if (f >= T_SOBE1 && f < T_DESCE0) p = [p[0], p[1] + 0.8 * Math.sin(f * 2.3)]; // braço sentindo o peso
    return { alvo: p, pega: "fist", sq: squash(f, T_PEGA) };
  }
  if (f < T_SOLTA + 6) return { alvo: lp(gp, [gp[0] - 8, gp[1] - 16], saiRapido((f - T_SOLTA) / 6)), pega: "open", sq: 0 }; // solta: a mão abre e sai
  if (f < T_ALC_XIC) return { alvo: lp([gp[0] - 8, gp[1] - 16], solta, suave((f - T_SOLTA - 6) / 12)), pega: "open", sq: 0 };
  const gx = local(G_XIC, T_PEGA_XIC);
  if (f < T_PEGA_XIC) return { alvo: alcance(f, T_ALC_XIC, T_PEGA_XIC, corpo(T_ALC_XIC).handR ?? [74, -108], gx, 24), pega: "open", sq: 0 };
  let p: P = f < T_ERGUE0 + 4 ? gx : carrega(f, T_ERGUE0 + 4, T_ERGUE1, gx, SEGURA_XIC, 16);
  for (const [a, b] of GOLES) {
    if (f >= a && f < b) {
      const sobe = suave((f - a) / 10), desce = suave((f - (b - 12)) / 12);
      p = lp(SEGURA_XIC, BOCA_XIC, sobe * (1 - desce));
    }
  }
  return { alvo: p, pega: "fist", sq: squash(f, T_PEGA_XIC) };
};

// ------------------------------------------------------------------ mão esquerda (-x): equilíbrio -> celular
const maoL = (f: number): { alvo: P; pega: Mao; sq: number } => {
  const c = corpo(f);
  const solta = c.handL ?? [-72, -110];
  if (f < T_ALC_CEL) {
    // abre um pouco para equilibrar a panela; no susto a mão pula
    const eq = rampa(f, T_SOBE0, T_SOBE0 + 12) * (1 - rampa(f, T_DESCE1, T_DESCE1 + 12));
    let p = lp(solta, [-104, -132], eq);
    const susto = rampa(f, T_SUSTO, T_SUSTO + 4, saiRapido) * (1 - rampa(f, T_SUSTO + 10, T_DESCE0 + 4));
    p = lp(p, [-118, -204], susto);
    return { alvo: p, pega: "open", sq: 0 };
  }
  const gc = local(G_CEL, T_PEGA_CEL);
  if (f < T_PEGA_CEL) return { alvo: alcance(f, T_ALC_CEL, T_PEGA_CEL, corpo(T_ALC_CEL).handL ?? [-72, -110], gc, 18), pega: "open", sq: 0 };
  const p: P = f < T_ERGUE0 ? gc : carrega(f, T_ERGUE0, T_ERGUE1, gc, SEGURA_CEL, 30);
  return { alvo: p, pega: "fist", sq: squash(f, T_PEGA_CEL) };
};

// ------------------------------------------------------------------ rotação dos objetos (o punho gira junto)
const rotPan = (f: number) => {
  if (f < T_PEGA || f >= T_SOLTA) return 0;
  const sobe = Math.pow(suave((f - T_SOBE0) / (T_SOBE1 - T_SOBE0)), 1.35);
  const desce = suave((f - T_DESCE0) / (T_DESCE1 - T_DESCE0 - 3));
  let r = 6 * sobe * (1 - desce); // o peso puxa a panela para baixo
  if (f >= T_SUSTO) r += 5 * Math.sin((f - T_SUSTO) * 1.7) * Math.exp(-(f - T_SUSTO) / 6);
  return r;
};
const rotXic = (f: number) => {
  let r = 0;
  for (const [a, b] of GOLES) if (f >= a && f < b) r = -24 * suave((f - a - 4) / 8) * (1 - suave((f - (b - 12)) / 10));
  return r;
};
const vaporXic = (f: number) => 1 - Math.min(1, Math.abs(rotXic(f)) / 12);
const rotCel = (f: number) => (f < T_PEGA_CEL ? 0 : 8 * suave((f - T_ERGUE0) / (T_ERGUE1 - T_ERGUE0)));
const viraCel = (f: number) => (f < T_ERGUE0 ? 0 : suave((f - T_ERGUE0) / (T_ERGUE1 - T_ERGUE0 - 4)));
const quente = (f: number) => 0.35 + 0.65 * rampa(f, T_SOBE0 + 8, T_SUSTO) * (1 - rampa(f, T_DESCE0, T_SOLTA + 30));

// ------------------------------------------------------------------ pose completa
const TROCAS: [number, Expr][] = [[0, "sigma"], [T_SUSTO, "chocado"], [T_SOLTA + 6, "neutro"], [T_ERGUE1, "sigma"]];

const semPulso = (f: number): Pose => {
  const c = corpo(f);
  const r = maoR(f), e = maoL(f);
  // peso no corpo: inclina para a alça ao alcançar; contrapeso e joelhos ao levantar; susto: pulinho e ombros
  const alc = rampa(f, T_ALC, T_PEGA) * (1 - rampa(f, T_SOBE0, T_SOBE0 + 10));
  const peso = rampa(f, T_SOBE0, T_SOBE0 + 14) * (1 - rampa(f, T_DESCE0 + 4, T_SOLTA + 6));
  const d = f - T_SUSTO;
  const pulo = d >= 0 && d < 12 ? 12 * Math.sin((Math.PI * d) / 12) : 0;
  const ombros = 10 * rampa(f, T_SUSTO, T_SUSTO + 4) * (1 - rampa(f, T_DESCE0, T_SOLTA + 8));
  const alcCel = rampa(f, T_ALC_CEL, T_PEGA_CEL) * (1 - rampa(f, T_ERGUE0, T_ERGUE1));
  return {
    ...c,
    lean: (c.lean ?? 0) + 3 * alc - 3 * peso,
    hip: (c.hip ?? 0) + 2 * peso,
    abaixa: (c.abaixa ?? 0) + 3 * peso + 2 * alcCel,
    kneeL: (c.kneeL ?? 2) + 2 * peso + 1 * alcCel,
    kneeR: (c.kneeR ?? 2) + 2 * peso + 1 * alcCel,
    pulo: (c.pulo ?? 0) + pulo,
    ombros,
    handR: r.alvo, gripR: r.pega, squashR: r.sq,
    handL: e.alvo, gripL: e.pega, squashL: e.sq,
    expr: expressaoNoQuadro(TROCAS, f, 6),
  };
};
// ângulo da mão no quadro do contato: daí em diante o punho gira junto com o objeto (filho da mão)
const ANG_PAN = maoInfo(semPulso(T_PEGA), "R").ang;
const ANG_XIC = maoInfo(semPulso(T_PEGA_XIC), "R").ang;
const ANG_CEL = maoInfo(semPulso(T_PEGA_CEL), "L").ang;

// olhar: os olhos vão no quadro; a cabeça segue o alvo de 4 quadros antes (média de 6 quadros, sem estalo)
const alvoMundo = (f: number): P | undefined => {
  if (f < T_OLHA) return undefined;
  if (f < T_ALC) return [PAN[0], PAN[1] - 40];
  if (f < T_PEGA) return G_PAN;
  if (f < T_OLHA2) return undefined; // segurando a panela: o alvo vem da mão (ver olhar())
  if (f < T_ALC_CEL + 6) return [CEL[0], CEL[1] - 10];
  if (f < T_PEGA_XIC) return [XIC[0], XIC[1] - 20];
  return undefined;
};
const alvoLocal = (f: number, pose: Pose): P | undefined => {
  if (f >= T_PEGA && f < T_OLHA2) {
    const m = maoInfo(pose, "R").pos;
    return f < T_SOLTA ? [m[0] + 104, m[1] + 18] : local([PAN[0], PAN[1] - 30], f);
  }
  if (f >= T_PEGA_XIC) {
    // olhando o celular: o alvo é exagerado para baixo (objeto perto do rosto)
    const m = maoInfo(pose, "L").pos;
    const c: P = [m[0] + 15, m[1]];
    return [c[0] * 2.2, -330 + (c[1] + 330) * 2.2];
  }
  const w = alvoMundo(f);
  return w ? local(w, f) : undefined;
};
const tiltCru = (f: number) => {
  const a = alvoLocal(f, semPulso(f));
  if (!a) return 0;
  const t = Math.max(-1, Math.min(1, a[0] / 500)) * 7;
  return f >= T_PEGA_XIC ? t - 5 : t; // olhando o celular: a cabeça tomba um pouco para ele
};

export const poseNoQuadro = (f: number): Pose => {
  const p = semPulso(f);
  let headTilt = 0;
  for (let q = f - 9; q <= f - 4; q++) headTilt += tiltCru(Math.max(0, q)) / 6;
  return {
    ...p,
    lookAt: alvoLocal(f, p),
    headTilt: headTilt + (p.headTilt ?? 0) * 0.5,
    pulsoR: f >= T_PEGA && f < T_SOLTA ? ANG_PAN + rotPan(f) : f >= T_PEGA_XIC ? ANG_XIC + rotXic(f) : undefined,
    pulsoL: f >= T_PEGA_CEL ? ANG_CEL + rotCel(f) : undefined,
  };
};

export const TesteManuseio: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const pose = poseNoQuadro(f);
  const mR = maoInfo(pose, "R"), mL = maoInfo(pose, "L");
  const segPan = f >= T_PEGA && f < T_SOLTA;
  const segXic = f >= T_PEGA_XIC;
  const segCel = f >= T_PEGA_CEL;
  const ePan: EstadoObj = { t, quente: quente(f) };
  const eCel: EstadoObj = { t, vira: viraCel(f) };
  return (
    <Palco>
      <Azulejos x0={250} x1={1660} y0={TOPO - 236} y1={TOPO - 12} />
      <Chao base={BASE} />
      <Bancada x0={250} x1={BOCAS[0] - 92} topo={TOPO} base={BASE} />
      <Fogao x0={BOCAS[0] - 92} x1={BOCAS[1] + 92} topo={TOPO} base={BASE} bocas={BOCAS} />
      {!segPan && <ObjetoNoMundo def={PANELA} em={PAN} s={S} e={ePan} />}
      {!segXic && <ObjetoNoMundo def={XICARA} em={XIC} s={S} e={{ t }} />}
      {!segCel && <ObjetoNoMundo def={CELULAR} em={CEL} s={S} e={eCel} />}
      <Person
        {...pose}
        expr={pose.expr}
        semente={3}
        propsHands={
          <>
            {segPan && <ObjetoNaMao def={PANELA} mao={mR.pos} ang={rotPan(f)} e={ePan} />}
            {segXic && <ObjetoNaMao def={XICARA} mao={mR.pos} ang={rotXic(f)} e={{ t, vapor: vaporXic(f) }} />}
            {segCel && <ObjetoNaMao def={CELULAR} mao={mL.pos} ang={rotCel(f)} e={eCel} />}
          </>
        }
      />
    </Palco>
  );
};
export const _TEMPOS = { T_OLHA, T_ANDA, ANDA1_FIM: ANDA1.fim, T_ALC, T_PEGA, T_SOBE0, T_SOBE1, T_SUSTO, T_DESCE0, T_DESCE1, T_SOLTA, T_VOLTA, ANDA2_FIM: ANDA2.fim, T_ALC_CEL, T_PEGA_CEL, T_ALC_XIC, T_PEGA_XIC, T_ERGUE0, T_ERGUE1, GOLES, X0, XP, XM };
