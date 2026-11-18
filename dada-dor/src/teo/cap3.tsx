// Capítulo 3: Uma vida sem dor.
import React from "react";
import { CAMPINHO, Campinho, Liso, PATIO, Patio, TraveFrente, VENDA, VendaBalcao, VendaFundo } from "./cenarios";
import type { NomeElenco } from "./elenco";
import { Ator, Camera, E, Impacto, Medidor, Painel, pts, Tremidinhas, usePlano, V } from "./kit";
import { agachado, apontar, comBracos, maoEm, mix, parado, pulso, rampa, seq, sino, tremer, type Fn } from "./motor";
import { Bola, LINHA, type PoseTeo } from "./tira";

// ---------------------------------------------------------------- pátio: fila da vacina
const { chao: CP, fila: FILA } = PATIO;
const X_ENF = 1420;
const FILA_ELENCO: NomeElenco[] = ["teo", "turma1", "dudu", "turma2", "turma3", "turma4"];
const teoFila: Fn = (t) => {
  const p = parado(FILA[0], CP, 1)(t);
  return { ...p, torso: { ...p.torso, rot: 12 }, head: { ...p.head, rot: 8 }, expr: "curioso" };
};
const filaPoses = (t: number) => FILA_ELENCO.map((q, i) => {
  if (q === "teo") return teoFila(t);
  const p = tremer(parado(FILA[i], CP, E(q))(t), t, 1, i * 1.3);
  p.expr = i === 2 ? "chorando" : "preocupado";
  if (i === 2) p.lagrima = (t * 0.8) % 1;
  return p;
});
const Fila: React.FC<{ t: number; desde?: number }> = ({ t, desde = 1 }) => (
  <>{filaPoses(t).map((p, i) => (i >= desde ? <Ator key={i} quem={FILA_ELENCO[i]} pose={p} semente={i} /> : null)).reverse()}</>
);
const enfermeira = (t: number, obj: PoseTeo["objR"] = "seringa"): PoseTeo => ({ ...parado(X_ENF, CP, E("enfermeira"), true)(t), objR: obj, arm_upper_R: 50, arm_lower_R: 60 });

const C3Fila: React.FC = () => {
  const { t, dur } = usePlano();
  return (
    <Camera chaves={[{ t: 0, z: 1.3, cx: 500, cy: 560 }, { t: dur, z: 1.3, cx: 1120, cy: 560 }]}>
      <Patio />
      <Ator quem="enfermeira" pose={enfermeira(t)} />
      <Fila t={t} />
      <Ator quem="teo" pose={teoFila(t)} />
      {filaPoses(t).slice(1).map((p, i) => <Tremidinhas key={i} x={pts(FILA_ELENCO[i + 1], p).cabeca[0]} y={pts(FILA_ELENCO[i + 1], p).cabeca[1]} t={t + i} r={80 * E(FILA_ELENCO[i + 1])} />)}
    </Camera>
  );
};
const C3Vacina: React.FC = () => {
  const { t, dur, fala } = usePlano();
  let teo = teoFila(t);
  teo = { ...teo, torso: { ...teo.torso, rot: 4 }, head: { ...teo.head, rot: 18 } };
  const braco = pts("teo", teo).bracoR;
  let enf = enfermeira(t);
  const pica = sino(t, 0.1, 1.6, 0.35, 0.3);
  enf = comBracos(enf, maoEm(enf, "R", [braco[0] + 92, braco[1] - 46], E("enfermeira"), V("enfermeira")), pica, "R");
  enf.torso.rot = 8 * pica;
  enf.head.rot = 14;
  enf.expr = t > 1.4 ? "surpreso" : "serio";
  return (
    <Camera chaves={[{ t: 0, z: 1.9, cx: 1240, cy: 520 }, { t: dur, z: 2.0, cx: 1240, cy: 520 }]}>
      <Patio />
      <Fila t={t} />
      <Ator quem="enfermeira" pose={enf} />
      <Ator quem="teo" pose={teo} fala={fala("teo")} />
    </Camera>
  );
};
const C3Adesivo: React.FC = () => {
  const { t, dur } = usePlano();
  let teo = teoFila(t);
  teo = { ...teo, torso: { ...teo.torso, rot: 2 }, adesivo: t > 1.15, expr: t > 1.6 ? "sorriso" : "neutro" };
  teo.head.rot = 16 * sino(t, 1.3, 2.6, 0.25, 0.3);
  const peito = pts("teo", teo).peito;
  let enf = enfermeira(t, null);
  enf = comBracos(enf, maoEm(enf, "R", [peito[0] + 14, peito[1]], E("enfermeira"), V("enfermeira")), sino(t, 0.5, 1.45, 0.4, 0.3), "R");
  enf.expr = "sorriso";
  return (
    <Camera chaves={[{ t: 0, z: 1.25, cx: 1000, cy: 540 }, { t: dur, z: 1.3, cx: 1040, cy: 540 }]}>
      <Patio />
      <Fila t={t} />
      <Ator quem="enfermeira" pose={enf} />
      <Ator quem="teo" pose={teo} />
    </Camera>
  );
};

// ---------------------------------------------------------------- venda do Seu Nelson
const { chao: CV, balcao, pote } = VENDA;
const X_NELSON = 1180;
const X_MENINO = 560, X_DUDU_V = 740, X_TEO_V = 1360;
const potePegada: [number, number] = [pote.x, balcao.topo - 160];
const nelson = (t: number): PoseTeo => ({ ...parado(X_NELSON, CV, E("nelson"), true)(t), expr: "sorriso" });
const meninoArdendo = (t: number, k: number): PoseTeo => {
  const p = parado(X_MENINO, CV, E("turma1"))(t);
  const abana = Math.sin(t * 22);
  const q = comBracos(p, { ...p, arm_upper_R: 120 + 25 * abana, arm_lower_R: 40, arm_upper_L: 10, arm_lower_L: 20 }, k, "R");
  return { ...q, expr: k > 0.5 ? "grito" : "neutro", torso: { ...q.torso, x: q.torso.x + 3 * k * Math.sin(t * 30) } };
};
const C3Venda: React.FC = () => {
  const { t, dur } = usePlano();
  const nel = nelson(t);
  const nelP = comBracos(nel, apontar(nel, [pote.x, balcao.topo - 80], E("nelson"), V("nelson")), sino(t, 0.6, 2.4));
  const men = { ...parado(X_MENINO, CV, E("turma1"))(t), objR: (t > 1.4 ? "pimenta" : null) as PoseTeo["objR"], arm_upper_R: 40 * rampa(t, 1.0, 1.4), arm_lower_R: 60 * rampa(t, 1.0, 1.4), expr: "curioso" as const };
  const dudu = { ...parado(X_DUDU_V, CV, E("dudu"))(t), expr: "curioso" as const };
  const teo = { ...parado(X_TEO_V, CV, 1, true)(t), expr: "neutro" as const };
  return (
    <Camera chaves={[{ t: 0, z: 1.0, cx: 960, cy: 540 }, { t: dur, z: 1.12, cx: 980, cy: 560 }]}>
      <VendaFundo />
      <Ator quem="nelson" pose={nelP} />
      <VendaBalcao />
      <Ator quem="turma1" pose={men} />
      <Ator quem="dudu" pose={dudu} />
      <Ator quem="teo" pose={teo} />
    </Camera>
  );
};
const C3Leite: React.FC = () => {
  const { t, dur, fala } = usePlano();
  const men = meninoArdendo(t, rampa(t, 0, 0.2));
  // copo desliza no balcão da mão do Seu Nelson até a frente do menino
  const copoX = 1080 + (X_MENINO + 90 - 1080) * rampa(t, 0.6, 1.3);
  const copoY = balcao.topo - 12;
  let nel = nelson(t);
  nel = comBracos(nel, maoEm(nel, "R", [copoX + 20, copoY - 30], E("nelson"), V("nelson")), sino(t, 0.3, 1.5, 0.3, 0.2), "R");
  nel.torso.rot = 14 * sino(t, 0.5, 1.5);
  nel.expr = "bravo";
  const dudu = { ...parado(X_DUDU_V, CV, E("dudu"))(t), expr: "surpreso" as const };
  dudu.head.rot = -8;
  const teo = { ...parado(X_TEO_V, CV, 1, true)(t) };
  return (
    <Camera chaves={[{ t: 0, z: 1.2, cx: 860, cy: 520 }, { t: dur, z: 1.26, cx: 860, cy: 520 }]}>
      <VendaFundo />
      <Ator quem="nelson" pose={nel} fala={fala("nelson")} />
      <VendaBalcao potePimentas={5} />
      <path d={`M ${copoX - 6} ${copoY - 70} L ${copoX + 46} ${copoY - 70} L ${copoX + 40} ${copoY} L ${copoX} ${copoY} Z`} fill="#FBFBF7" stroke={LINHA} strokeWidth={6} strokeLinejoin="round" />
      <Ator quem="turma1" pose={men} />
      <Tremidinhas x={pts("turma1", men).cabeca[0]} y={pts("turma1", men).cabeca[1]} t={t} r={86} />
      <Ator quem="dudu" pose={dudu} />
      <Ator quem="teo" pose={teo} />
    </Camera>
  );
};
const C3Pimenta: React.FC = () => {
  const { t, dur, F } = usePlano();
  const base = parado(X_TEO_V, CV, 1, true)(t);
  const boca = pts("teo", base).boca;
  const pega = maoEm(base, "R", potePegada, 1);
  const naBoca = maoEm(base, "R", [boca[0] - 8, boca[1] + 10], 1);
  const farofa = { ...base, arm_upper_R: 60, arm_lower_R: 30 };
  const passos: [number, Fn][] = [[0, () => base], [0.15, () => pega], [0.5, () => naBoca], [1.25, () => pega], [1.55, () => naBoca], [2.15, () => base], [2.45, () => farofa]];
  let teo = comBracos(base, seq(t, passos, 0.25), 1, "R");
  const comendo = (t > 0.5 && t < 1.2) || (t > 1.55 && t < 2.15);
  teo.objR = (t > 0.35 && t < 0.8) || (t > 1.4 && t < 1.85) ? "pimenta" : null;
  teo.falando = comendo ? Math.sin(t * 30) > 0 : t > F(0).fim - 1.3 && t < F(0).fim ? Math.sin(t * 44) > -0.2 : false;
  teo.expr = "neutro";
  const dudu = { ...parado(X_DUDU_V, CV, E("dudu"))(t), expr: t > 0.9 ? ("surpreso" as const) : ("curioso" as const) };
  const men = meninoArdendo(t, 0.5);
  const nel = { ...nelson(t), expr: t > 1.0 ? ("surpreso" as const) : ("sorriso" as const) };
  return (
    <Camera chaves={[{ t: 0, z: 1.6, cx: 1200, cy: 480 }, { t: 2.3, z: 1.6, cx: 1200, cy: 480 }, { t: 2.31, z: 1.15, cx: 1000, cy: 540, corte: true }, { t: dur, z: 1.2, cx: 1000, cy: 540 }]}>
      <VendaFundo />
      <Ator quem="nelson" pose={nel} />
      <VendaBalcao potePimentas={t > 1.4 ? 3 : t > 0.35 ? 4 : 5} />
      <Ator quem="turma1" pose={men} />
      <Ator quem="dudu" pose={dudu} />
      <Ator quem="teo" pose={teo} />
    </Camera>
  );
};
const C3Nervo: React.FC = () => {
  const { t, dur } = usePlano();
  const nervo = (x: number, y: number, aceso: number, lbl: NomeElenco) => (
    <g transform={`translate(${x} ${y})`}>
      <circle cx={0} cy={-210} r={90} fill={lbl === "teo" ? "#C9895E" : "#E0B08A"} stroke={LINHA} strokeWidth={7} />
      <path d="M -60 -200 Q -40 -270 20 -260 Q 70 -240 60 -190 Q 30 -150 -20 -160 Q -60 -170 -60 -200 Z" fill="#F0A3B4" stroke={LINHA} strokeWidth={5} />
      <path d="M -150 230 Q -60 120 -30 40 Q 0 -60 0 -150" stroke={aceso > 0 ? "#F2933A" : "#9AA0A8"} strokeWidth={16} fill="none" strokeLinecap="round" />
      {aceso > 0 && <path d="M -150 230 Q -60 120 -30 40 Q 0 -60 0 -150" stroke="#FFD23F" strokeWidth={8} fill="none" strokeLinecap="round" strokeDasharray="20 22" strokeDashoffset={-t * 160} />}
      <g transform="translate(-170 250) rotate(-30)"><path d="M -10 -40 Q 30 -10 14 50 Q 4 58 -6 48 Q -14 0 -10 -40 Z" fill="#E23B2E" stroke={LINHA} strokeWidth={5} /></g>
      {aceso > 0 ? [0, 1, 2].map((i) => <path key={i} d={`M ${-60 + i * 60} -320 q 10 -30 0 -60`} stroke="#F2933A" strokeWidth={10} fill="none" strokeLinecap="round" />) : (
        <g transform="translate(110 -300)">
          <rect x={-40} y={-60} width={80} height={120} rx={14} fill="#2A2A35" stroke={LINHA} strokeWidth={6} />
          <rect x={-28} y={-46} width={56} height={84} fill="#5A6070" />
          {t > 3.6 && <g stroke="#E23B2E" strokeWidth={12} strokeLinecap="round"><line x1={-50} y1={-70} x2={50} y2={70} /><line x1={50} y1={-70} x2={-50} y2={70} /></g>}
        </g>
      )}
    </g>
  );
  return (
    <Camera chaves={[{ t: 0, z: 1.0, cx: 960, cy: 540 }, { t: dur, z: 1.03, cx: 960, cy: 540 }]} fundo="#FFE9A8">
      <Liso cor="#FFE9A8" padrao="#F7DD8F" />
      <Painel x={120} y={90} w={800} h={880} desde={0.1} fundo="#FFF6E0"><g transform="translate(400 470) scale(1.55) translate(-400 -470)">{nervo(420, 500, 1, "turma1")}</g></Painel>
      <Painel x={1000} y={90} w={800} h={880} desde={2.4} fundo="#EAF2F8"><g transform="translate(400 470) scale(1.55) translate(-400 -470)">{nervo(420, 500, 0, "teo")}</g></Painel>
      <Medidor x={1660} y={860} valor={0} desde={4.6} esc={0.7} />
    </Camera>
  );
};

// ---------------------------------------------------------------- campinho: a bolada
const { chao: CC } = CAMPINHO;
const X_DUDU = 520, X_TEO_C = 1180;
const R_BOLA = 30;
/** chute de bico: perna direita vai para trás e varre para a frente; k = 0 (atrás) a 1 (fim do chute) */
const chute = (p: PoseTeo, k: number): PoseTeo => {
  const coxa = -35 + 115 * k;
  const canela = k < 0.55 ? -70 : -70 + 70 * ((k - 0.55) / 0.45);
  return { ...p, leg_upper_R: coxa, leg_lower_R: canela, pe_R: 0, arm_upper_L: 50 * k, arm_upper_R: -30 * k, torso: { ...p.torso, rot: -6 * k } };
};
const K_CONTATO = 0.5;
const duduBase = (t: number) => parado(X_DUDU, CC, E("dudu"))(t);
const bolaRepouso = (() => {
  const p = chute(duduBase(0), K_CONTATO);
  const ponta = pts("dudu", p).pontaR;
  return [ponta[0] + R_BOLA - 4, CC - R_BOLA] as [number, number];
})();
const teoCampo = (t: number) => ({ ...parado(X_TEO_C, CC, 1, true)(t), expr: "neutro" as const });
const TURMA_CAMPO: [NomeElenco, number, boolean][] = [["turma3", 330, false], ["turma2", 1480, true], ["turma4", 160, false]];
const C3Bolada: React.FC = () => {
  const { t, f, fps, dur, S } = usePlano();
  const tBola = S("bola");
  const tChute = tBola - 0.42;
  const congela = t > tBola + 0.2 ? tBola + 0.2 : t; // todo mundo congela depois da bolada
  let dudu = duduBase(congela);
  const kc = t < tChute - 0.35 ? 0 : t < tChute ? 0.0 : Math.min(1, K_CONTATO + (t - tChute) / 0.16 * (1 - K_CONTATO));
  const prep = rampa(t, tChute - 0.45, tChute - 0.05);
  dudu = t < tChute ? mix(dudu, chute(dudu, 0), prep) : mix(chute(dudu, kc), duduBase(congela), rampa(t, tChute + 0.4, tChute + 0.8));
  if (t > tChute - 0.35 && t < tChute) dudu = mix(chute(duduBase(t), 0), chute(duduBase(t), K_CONTATO), rampa(t, tChute - 0.12, tChute, (x) => x * x));
  dudu.expr = t > tBola ? "surpreso" : "bravo";
  let teo = teoCampo(congela);
  const rosto = pts("teo", teo).rosto;
  const golpe = pulso(t, tBola, 0.5);
  teo = { ...teo, head: { ...teo.head, rot: teo.head.rot - 22 * golpe }, torso: { ...teo.torso, rot: teo.torso.rot - 9 * golpe }, piscar: t > tBola && t < tBola + 0.12 };
  // bola: parada, voa em arco até o rosto, quica para baixo e rola
  let bx = bolaRepouso[0], by = bolaRepouso[1], giro = 0;
  if (t >= tChute && t < tBola) {
    const k = (t - tChute) / (tBola - tChute);
    bx = bolaRepouso[0] + (rosto[0] - 10 - bolaRepouso[0]) * k;
    by = bolaRepouso[1] + (rosto[1] - bolaRepouso[1]) * k - 120 * Math.sin(Math.PI * k);
    giro = k * 720;
  } else if (t >= tBola) {
    const d = t - tBola;
    const x0 = rosto[0] - 10;
    const vy0 = -260, g = 2400;
    const yq = rosto[1] + vy0 * d + 0.5 * g * d * d;
    bx = x0 - 220 * Math.min(d, 0.9);
    by = Math.min(yq, CC - R_BOLA);
    if (yq > CC - R_BOLA) {
      const d2 = d - 0.42;
      by = CC - R_BOLA - Math.abs(Math.sin(d2 * 7)) * 80 * Math.exp(-d2 * 3);
    }
    giro = -d * 500;
  }
  const turma = TURMA_CAMPO.map(([q, x, esq]) => {
    const p = parado(x, CC, E(q), esq)(congela);
    return { q, p: { ...p, expr: (t > tBola ? "surpreso" : "neutro") as PoseTeo["expr"] } };
  });
  return (
    <Camera chaves={[{ t: 0, z: 1.0, cx: 900, cy: 560 }, { t: tBola, z: 1.08, cx: 920, cy: 560 }, { t: tBola + 0.01, z: 1.6, cx: X_TEO_C - 120, cy: 520, corte: true }, { t: dur + 1.2, z: 1.7, cx: X_TEO_C - 120, cy: 520 }]} tremores={[tBola]}>
      <Campinho />
      {turma.map(({ q, p }) => <Ator key={q} quem={q} pose={p} semPiscar={t > tBola} />)}
      <Ator quem="dudu" pose={dudu} semPiscar={t > tBola} />
      <Ator quem="teo" pose={teo} semPiscar />
      <Bola x={bx} y={by} r={R_BOLA} giro={giro} />
      <Impacto x={rosto[0]} y={rosto[1]} d={f - Math.round(tBola * fps)} raio={50} />
      <TraveFrente />
    </Camera>
  );
};
const C3Doeu: React.FC = () => {
  const { t, dur, fala } = usePlano();
  const bolaChao: [number, number] = [X_TEO_C - 150, CC - R_BOLA];
  const em = parado(X_TEO_C, CC, 1, true);
  const agacha = (tt: number) => maoEm(agachado(X_TEO_C, CC, 1, true, 0.8)(tt), "R", [bolaChao[0] + 10, bolaChao[1] - 26], 1);
  const levanta = (tt: number) => ({ ...em(tt), arm_upper_R: 30, arm_lower_R: 60 });
  const joga = (tt: number) => ({ ...em(tt), arm_upper_R: 120, arm_lower_R: 10, torso: { ...em(tt).torso, rot: 8 } });
  const teo = seq(t, [[0, em], [0.1, agacha], [0.55, levanta], [0.95, joga], [1.35, em]], 0.25);
  const maoT = pts("teo", teo).maoR;
  let bx = bolaChao[0], by = bolaChao[1];
  if (t > 0.45 && t < 1.1) { bx = maoT[0] - 20; by = maoT[1] - R_BOLA + 6; }
  if (t >= 1.1) { const d = t - 1.1; bx = maoT[0] - 20 - 900 * d; by = maoT[1] - R_BOLA - 420 * d + 900 * d * d; }
  const dudu = { ...parado(X_DUDU, CC, E("dudu"))(t), expr: "surpreso" as const };
  const turma = TURMA_CAMPO.map(([q, x, esq]) => ({ q, p: { ...parado(x, CC, E(q), esq)(t), expr: "surpreso" as const } }));
  return (
    <Camera chaves={[{ t: 0, z: 1.25, cx: 880, cy: 560 }, { t: dur, z: 1.25, cx: 880, cy: 560 }]}>
      <Campinho />
      {turma.map(({ q, p }) => <Ator key={q} quem={q} pose={p} />)}
      <Ator quem="dudu" pose={dudu} fala={fala("dudu")} />
      <Ator quem="teo" pose={{ ...teo, expr: t > 1.4 ? "curioso" : "neutro" }} fala={fala("teo")} />
      {by < 1200 && <Bola x={bx} y={by} r={R_BOLA} giro={t * 300} />}
      <TraveFrente />
    </Camera>
  );
};
const C3Gravando: React.FC = () => {
  const { t, dur, fala } = usePlano();
  const caco = { ...parado(1640, CC + 120, 1.6, true)(t), objR: "celularFilma" as const, arm_upper_R: 70, arm_lower_R: 40, expr: "sorriso" as const };
  const teo = { ...parado(X_TEO_C - 300, CC, 0.8, true)(t) };
  const dudu = { ...parado(X_DUDU, CC, 0.8)(t), expr: "surpreso" as const };
  return (
    <Camera chaves={[{ t: 0, z: 1.0, cx: 960, cy: 540 }, { t: dur, z: 1.05, cx: 1000, cy: 540 }]}>
      <Campinho />
      <Ator quem="dudu" pose={dudu} esc={0.8} />
      <Ator quem="teo" pose={teo} esc={0.8} />
      <Ator quem="caco" pose={caco} fala={fala("caco")} esc={1.6} />
    </Camera>
  );
};

export const CAP3: Record<string, React.FC> = {
  c3_fila: C3Fila, c3_vacina: C3Vacina, c3_adesivo: C3Adesivo, c3_venda: C3Venda, c3_leite: C3Leite, c3_pimenta: C3Pimenta, c3_nervo: C3Nervo, c3_bolada: C3Bolada, c3_doeu: C3Doeu, c3_gravando: C3Gravando,
};
