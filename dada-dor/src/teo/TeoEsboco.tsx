// Esboço do Téo (cap. 1, 0:07 a 0:21): levanta, enfia o dedinho na quina, "Nada.", pisa na pecinha.
// Os contatos saem da geometria: a ponta do pé para exatamente na face do poste e a bola do pé
// cai exatamente sobre os pinos da pecinha.
import React from "react";
import { AbsoluteFill, Audio, Easing, interpolate, random, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { andar, mix, parado, pePara, sentado, tempoDaFase, MARCHA } from "./acoes";
import { ALTURA_PECA, Impacto, Q, QuartoFrente, QuartoFundo, type Peca } from "./Quarto";
import { G, PERNA, TiraTeo, mundo, perna, type Expr, type PoseTeo } from "./tira";
import roteiro from "./esboco.json";

const ESC = 1;
const FPS = 30;
export const DURACAO_TEO_ESBOCO = Math.ceil(roteiro.duracao * FPS);
const sfx = (n: string) => roteiro.sfx.find((s) => s.nome === n)!.em;

// ---------------------------------------------------------------- plano 1: a quina
const T_TOC = sfx("toc");
const FASE_TOC = 2 * Math.PI + 1.25; // perna direita em balanço, quase tocando o chão
const T_ANDA = T_TOC - tempoDaFase(FASE_TOC);
// onde o Téo precisa começar a andar para a ponta do pé direito parar 1 px antes do poste
const X0 = (() => {
  const p = andar(tempoDaFase(FASE_TOC), 0, Q.chao, ESC);
  return Q.poste - 1 - mundo(p, ESC, false, perna(p, "R").ponta)[0];
})();
const X_SENTA = X0 - 78;
const T_LEV = T_ANDA - 0.75;
const T_PLANO2 = 5.0;
const T_PLANO3 = 6.25;

// ---------------------------------------------------------------- plano 3: a pecinha
const T_CLAC = sfx("clac");
const MEIOS_PASSOS = 5;
const X0_3 = 1990;
const PASSO = 2 * PERNA * ESC * Math.sin((MARCHA.amp * Math.PI) / 180);
const X_PARA = X0_3 + MEIOS_PASSOS * PASSO; // fase = 5π: pernas juntas
const T_PARA = T_PLANO3 + MEIOS_PASSOS * (MARCHA.periodo / 2);
const PECA_X = X_PARA + 46 * ESC; // a pecinha fica sob a bola do pé direito
const INCLINA = 0; // pé reto em cima da pecinha: o calcanhar fica no ar, apoiado só nela
// passadas do plano 3 (pés plantados) — as outras peças ficam nos vãos entre elas
const PECAS: Peca[] = [
  { x: PECA_X, cor: "#E23B2E" },
  { x: X0_3 + 160, cor: "#FFD23F" },
  { x: X0_3 + 160 + 2 * PASSO + 12, cor: "#3B6FD6", larg: 32 },
  { x: PECA_X + 150, cor: "#3FAF63" },
  { x: PECA_X + 196, cor: "#FFD23F", larg: 32 },
];

const ease = Easing.inOut(Easing.cubic);
const rampa = (t: number, a: number, b: number, e = ease) => interpolate(t, [a, b], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: e });
const pulso = (t: number, t0: number, dur = 0.35) => (t < t0 || t > t0 + dur ? 0 : Math.sin(Math.PI * ((t - t0) / dur)) * (1 - (t - t0) / dur));

const poseNoTempo = (t: number): { pose: PoseTeo; expr: Expr } => {
  // -------- plano 1 e 2
  if (t < T_PLANO3) {
    const assento = Q.colchao;
    if (t < T_LEV) {
      // sentado, com espreguiçada sonolenta
      const p = sentado(t, X_SENTA, assento, ESC);
      const e = rampa(t, 0.5, 0.95) * (1 - rampa(t, 1.25, 1.6));
      p.arm_upper_R += (160 - p.arm_upper_R) * e; p.arm_lower_R += (16 - p.arm_lower_R) * e;
      p.arm_upper_L += (148 - p.arm_upper_L) * e; p.arm_lower_L += (20 - p.arm_lower_L) * e;
      p.head.rot -= 14 * e; p.torso.rot -= 6 * e; p.torso.scaleY += 0.04 * e;
      return { pose: p, expr: "sono" };
    }
    const sentadoInclinado = (tt: number) => {
      const p = sentado(tt, X_SENTA, assento, ESC);
      p.torso.rot = 24; p.head.rot = -10; p.arm_upper_R = 30; p.arm_upper_L = 20;
      return p;
    };
    const tl = t - T_LEV;
    if (tl < 0.22) return { pose: mix(sentado(t, X_SENTA, assento, ESC), sentadoInclinado(t), rampa(tl, 0, 0.22)), expr: "neutro" };
    if (tl < 0.6) {
      const k = rampa(tl, 0.22, 0.52, Easing.out(Easing.cubic));
      const p = mix(sentadoInclinado(t), parado(t, X0, Q.chao, ESC), k);
      return { pose: p, expr: "neutro" };
    }
    if (t < T_ANDA) {
      const p = parado(t, X0, Q.chao, ESC);
      p.torso.scaleY -= 0.05 * pulso(tl, 0.52, 0.3);
      return { pose: mix(p, andar(0, X0, Q.chao, ESC), rampa(t, T_ANDA - 0.12, T_ANDA)), expr: "neutro" };
    }
    if (t < T_TOC) {
      const p = andar(t - T_ANDA, X0, Q.chao, ESC);
      return { pose: mix(parado(t, X0, Q.chao, ESC), p, rampa(t, T_ANDA, T_ANDA + 0.12)), expr: "neutro" };
    }
    // topada: o pé direito para no poste; o corpo ainda vai um pouco e volta
    const batida = andar(T_TOC - T_ANDA, X0, Q.chao, ESC);
    const choque = pulso(t, T_TOC, 0.45);
    batida.torso.rot += 7 * choque;
    batida.head.rot -= 6 * choque;
    batida.arm_upper_R += 18 * choque; batida.arm_upper_L -= 22 * choque;
    // depois ele apoia o pé no chão, com a ponta ainda encostada na quina
    const apoio = pePara(batida, "R", [Q.poste - 1 - G.ponta * ESC, Q.chao - G.sola * ESC], ESC, 0);
    let p = mix(batida, apoio, rampa(t, T_TOC + 0.32, T_TOC + 0.58));
    // "Nada.": olha para o pé e volta
    const olha = rampa(t, 5.12, 5.38, Easing.out(Easing.cubic)) * (1 - rampa(t, 5.85, 6.1));
    p = { ...p, head: { ...p.head, rot: p.head.rot + 20 * olha } };
    return { pose: p, expr: "neutro" };
  }
  // -------- plano 3
  if (t < T_PARA) {
    const p = andar(t - T_PLANO3, X0_3, Q.chao, ESC);
    return { pose: p, expr: "neutro" };
  }
  const fimAndar = andar(T_PARA - T_PLANO3, X0_3, Q.chao, ESC);
  const firme = parado(t, X_PARA, Q.chao, ESC);
  if (t < T_PARA + 0.18) return { pose: mix(fimAndar, firme, rampa(t, T_PARA, T_PARA + 0.18)), expr: "neutro" };
  // levanta o pé direito (antecipação), segura, e desce rápido em cima da pecinha
  const sobe: PoseTeo = { ...firme, leg_upper_R: 62, leg_lower_R: -104, pe_R: -14, arm_upper_R: 38, arm_lower_R: 30, arm_upper_L: -36, arm_lower_L: 30, torso: { ...firme.torso, rot: -5 } };
  const p = (Math.PI / 180);
  const f2: [number, number] = [Math.cos(INCLINA * p), -Math.sin(INCLINA * p)];
  const n2: [number, number] = [Math.sin(INCLINA * p), Math.cos(INCLINA * p)];
  const bola: [number, number] = [PECA_X, Q.chao - ALTURA_PECA];
  const tornozelo: [number, number] = [bola[0] - (n2[0] * G.sola + f2[0] * 34) * ESC, bola[1] - (n2[1] * G.sola + f2[1] * 34) * ESC];
  const desce = pePara({ ...firme, arm_upper_R: 14, arm_lower_R: 20, arm_upper_L: -12, arm_lower_L: 20, torso: { ...firme.torso, rot: 6 } }, "R", tornozelo, ESC, INCLINA);
  const T_SOBE = T_CLAC - 0.55;
  const T_DESCE = T_CLAC - 0.1;
  let pose: PoseTeo;
  if (t < T_DESCE) pose = mix(firme, sobe, rampa(t, T_SOBE, T_SOBE + 0.32, Easing.out(Easing.cubic)));
  else pose = mix(sobe, desce, rampa(t, T_DESCE, T_CLAC, Easing.in(Easing.quad)));
  const choque = pulso(t, T_CLAC, 0.4);
  pose.torso.scaleY *= 1 - 0.07 * choque;
  pose.head.offsetY += 6 * choque;
  const olha = rampa(t, 9.4, 9.7, Easing.out(Easing.cubic));
  pose.head.rot += 18 * olha;
  return { pose, expr: t > 9.65 ? "curioso" : "neutro" };
};

const PISCADAS = [2.9, 6.9, 9.8];

export const TeoEsboco: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = f / fps;
  const { pose, expr } = poseNoTempo(t);
  const piscar = PISCADAS.some((p) => t >= p && t < p + 0.1) || (t >= T_TOC && t < T_TOC + 0.13) || (t >= T_CLAC && t < T_CLAC + 0.13);

  // câmera por plano: empurrão lento + tremor no impacto
  let zoom = 1, ox = 960, oy = 600, cx = 0;
  if (t < T_PLANO2) zoom = interpolate(t, [0, T_PLANO2], [1, 1.05]);
  else if (t < T_PLANO3) { zoom = interpolate(t, [T_PLANO2, T_PLANO3], [1.62, 1.68]); ox = Q.poste - 140; oy = 760; }
  else { cx = -2000; zoom = interpolate(t, [T_PLANO3, roteiro.duracao], [1.35, 1.45]); ox = PECA_X - 2000; oy = 820; }
  let tx = 0, ty = 0;
  for (const tr of [T_TOC, T_CLAC]) {
    const d = t - tr;
    if (d >= 0 && d < 0.3) {
      const a = 16 * (1 - d / 0.3);
      tx += (random(`tx-${f}`) - 0.5) * 2 * a;
      ty += (random(`ty-${f}`) - 0.5) * 2 * a;
    }
  }
  const dToc = f - Math.round(T_TOC * fps);
  const dClac = f - Math.round(T_CLAC * fps);
  const tremPoste = dToc >= 0 && dToc < 8 ? Math.sin(dToc * 2.4) * 4 * (1 - dToc / 8) : 0;
  const pulos = PECAS.map((pc, i) => (i === 0 ? 0 : 12 * Math.max(0, Math.sin(Math.PI * Math.min(1, Math.max(0, (dClac - (Math.abs(pc.x - PECA_X) / 100)) / 7))))));

  return (
    <AbsoluteFill style={{ background: "#F6ECDA" }}>
      <AbsoluteFill style={{ transformOrigin: `${ox}px ${oy}px`, transform: `translate(${tx}px, ${ty}px) scale(${zoom})` }}>
        <svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{ overflow: "visible" }}>
          <g transform={`translate(${cx} 0)`}>
            <QuartoFundo pecas={PECAS} pulos={pulos} />
            <TiraTeo pose={pose} esc={ESC} expr={expr} piscar={piscar} />
            <QuartoFrente tremor={tremPoste} />
            <Impacto x={Q.poste} y={Q.chao - 16} d={dToc} angulos={[-160, -125, -90, 160]} />
            <Impacto x={PECA_X} y={Q.chao - 10} d={dClac} angulos={[-170, -140, -40, -10]} raio={60} />
          </g>
        </svg>
      </AbsoluteFill>
      <Audio src={staticFile("teo/esboco.wav")} />
    </AbsoluteFill>
  );
};
