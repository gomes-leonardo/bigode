// Capítulo 5: O preço.
import React from "react";
import { ALCA_PANELA, COZINHA, Cozinha, HOSPITAL, Hospital, Liso, Panela, RUA, Rua, Vapor } from "./cenarios";
import { Ator, Camera, E, Impacto, pts, usePlano, V } from "./kit";
import { andar, apontar, comBracos, cruzados, maoEm, parado, pePara, rampa, seq, sino } from "./motor";
import { sentadoChao } from "./cap4";
import { LINHA, type PoseTeo } from "./tira";
import timeline from "./timeline.json";

const TL = timeline as { planos: { id: string; inicio: number; duracao: number }[] };
const inicio = (id: string) => TL.planos.find((p) => p.id === id)!.inicio;

// ---------------------------------------------------------------- cozinha
const { chao: CZ, fogao, panela, pia } = COZINHA;
const PANELA_BASE: [number, number] = [panela.x, fogao.topo - 14];
const ALCA: [number, number] = [PANELA_BASE[0] + ALCA_PANELA[0], PANELA_BASE[1] + ALCA_PANELA[1]];
const X_VO_PIA = pia.x0 + 230;
const X_TEO_FOGAO = ALCA[0] - 150;
const voLavando = (t: number): PoseTeo => {
  const p = parado(X_VO_PIA, CZ, E("cida"), true)(t);
  const esfrega = Math.sin(t * 10);
  return { ...p, arm_upper_R: 50 + 8 * esfrega, arm_lower_R: 50, arm_upper_L: 44 - 8 * esfrega, arm_lower_L: 55, head: { rot: 14, offsetY: 0 }, objR: "prato" };
};
const C5Panela: React.FC = () => {
  const { t, dur, fala } = usePlano();
  let vo = voLavando(t);
  // aponta para o fogão por trás, sem olhar
  vo = comBracos(vo, { ...vo, arm_upper_L: -70, arm_lower_L: 0 }, sino(t, 0.4, 2.6, 0.25, 0.3), "L");
  const teo = andar(1900, X_TEO_FOGAO, 0.3, CZ, 1)(t);
  return (
    <Camera chaves={[{ t: 0, z: 1.0, cx: 960, cy: 540 }, { t: dur, z: 1.04, cx: 980, cy: 540 }]}>
      <Cozinha t={t} />
      <Ator quem="cida" pose={vo} fala={fala("cida")} />
      <Ator quem="teo" pose={{ ...teo, esq: true }} />
    </Camera>
  );
};
const posePanela = (maoT: [number, number] | null): [number, number] => (maoT ? [maoT[0] - ALCA_PANELA[0], maoT[1] - ALCA_PANELA[1]] : PANELA_BASE);
const C5Alca: React.FC = () => {
  const { t, f, fps, dur, plano } = usePlano();
  const tPrato = inicio("c5_vo") - 1.65 - plano.inicio;
  const base = parado(X_TEO_FOGAO, CZ, 1)(t);
  const pega = rampa(t, 0.4, 0.9);
  const sobe = rampa(t, 1.2, 1.7) * 40;
  let teo = comBracos(base, maoEm(base, "R", [ALCA[0], ALCA[1] - sobe], 1), pega, "R");
  teo.maoQueimada = rampa(t, 2.4, 4.6);
  teo.head.rot = 10;
  const maoT = pts("teo", teo).maoR;
  const pan = t > 0.9 ? posePanela([maoT[0], maoT[1]]) : PANELA_BASE;
  const vapor = rampa(t, 0.35, 0.8);
  // depois da fala: corta para a vó virando e largando o prato
  const depois = t > dur;
  let vo = voLavando(t);
  if (depois) {
    vo = { ...parado(X_VO_PIA, CZ, E("cida"))(t), objR: t < tPrato - 0.15 ? "prato" : null, arm_upper_R: 40, arm_lower_R: 40, expr: t > tPrato - 0.3 ? "surpreso" : "neutro" };
  }
  const prato = t > tPrato - 0.15 && depois;
  const dPrato = f - Math.round(tPrato * fps);
  const maoVo = pts("cida", parado(X_VO_PIA, CZ, E("cida"))(t)).maoR;
  const quedaY = Math.min(CZ - 8, maoVo[1] + 0.5 * 2600 * Math.pow(Math.max(0, t - (tPrato - 0.15)), 2));
  return (
    <Camera chaves={[{ t: 0, z: 1.35, cx: 1200, cy: 560 }, { t: 2.3, z: 1.35, cx: 1200, cy: 560 }, { t: 2.31, z: 2.8, cx: maoT[0] - 20, cy: maoT[1] - 30, corte: true }, { t: dur, z: 2.9, cx: maoT[0] - 20, cy: maoT[1] - 30 }, { t: dur + 0.01, z: 1.0, cx: 960, cy: 540, corte: true }, { t: dur + 3, z: 1.0, cx: 960, cy: 540 }]} tremores={depois ? [tPrato] : []}>
      <Cozinha semPanela t={t} />
      <Panela x={pan[0]} y={pan[1]} />
      <Vapor x={pan[0]} y={pan[1] - 150} t={t} k={vapor} />
      <Ator quem="cida" pose={vo} />
      <Ator quem="teo" pose={teo} />
      {prato && (dPrato < 0 ? <ellipse cx={maoVo[0] - 20} cy={quedaY} rx={44} ry={12} fill="#FBFBF7" stroke={LINHA} strokeWidth={6} /> : (
        <g>{[-50, -10, 30, 60].map((dx, i) => <path key={i} d={`M ${maoVo[0] + dx - 14} ${CZ - 6} l 22 -6 l 6 10 Z`} fill="#FBFBF7" stroke={LINHA} strokeWidth={4} transform={`translate(${dx * 0.6 * Math.min(1, dPrato / 6)} 0)`} />)}</g>
      ))}
      {prato && <Impacto x={maoVo[0]} y={CZ - 10} d={dPrato} raio={40} angulos={[-170, -130, -50, -10]} />}
    </Camera>
  );
};
const C5Vo: React.FC = () => {
  const { t, dur } = usePlano();
  const teo = { ...parado(X_TEO_FOGAO, CZ, 1)(t), maoQueimada: 1 };
  const maoT0 = pts("teo", maoEm(teo, "R", [ALCA[0], ALCA[1] - 40], 1)).maoR;
  // a vó chega, pega a panela pela alça do outro lado com o pano e devolve ao fogo
  const xVo = X_TEO_FOGAO + 330;
  let vo: PoseTeo = { ...andar(X_VO_PIA + 300, xVo, -0.6, CZ, E("cida"))(t), esq: true, expr: "preocupado" };
  const pan0 = posePanela([maoT0[0], maoT0[1]]);
  const devolve = rampa(t, 0.6, 1.2);
  const pan: [number, number] = [pan0[0] + (PANELA_BASE[0] - pan0[0]) * devolve, pan0[1] + (PANELA_BASE[1] - pan0[1]) * devolve];
  const alcaDir: [number, number] = [pan[0] + 103, pan[1] - 88];
  vo = comBracos(vo, maoEm(vo, "R", alcaDir, E("cida"), V("cida")), sino(t, 0.1, 1.5, 0.3, 0.3), "R");
  vo.objR = t > 0.2 && t < 1.5 ? "pano" : null;
  // Téo: mão segura a alça até a vó tirar; depois a vó segura a mão dele e olha
  let te = comBracos(teo, maoEm(teo, "R", [pan[0] + ALCA_PANELA[0], pan[1] + ALCA_PANELA[1]], 1), 1 - rampa(t, 0.7, 1.0), "R");
  te = comBracos(te, { ...te, arm_upper_R: 60, arm_lower_R: 30 }, rampa(t, 1.5, 1.9), "R");
  const maoTeo = pts("teo", te).maoR;
  vo = comBracos(vo, maoEm(vo, "L", [maoTeo[0] + 10, maoTeo[1] + 12], E("cida"), V("cida")), rampa(t, 1.7, 2.1), "L");
  vo.head.rot = 18 * rampa(t, 1.9, 2.3);
  te.head.rot = 6;
  return (
    <Camera chaves={[{ t: 0, z: 1.3, cx: 1250, cy: 560 }, { t: 2.0, z: 1.3, cx: 1250, cy: 560 }, { t: 3.0, z: 2.3, cx: maoTeo[0] + 30, cy: maoTeo[1] - 60 }, { t: dur + 1.0, z: 2.4, cx: maoTeo[0] + 30, cy: maoTeo[1] - 60 }]}>
      <Cozinha semPanela t={t} />
      <Panela x={pan[0]} y={pan[1]} />
      <Vapor x={pan[0]} y={pan[1] - 150} t={t} k={1 - rampa(t, 1.2, 2.4)} />
      <Ator quem="teo" pose={te} />
      <Ator quem="cida" pose={vo} />
    </Camera>
  );
};

// ---------------------------------------------------------------- hospital: raio-x
const { chao: CH, negatoscopio: N } = HOSPITAL;
const CENTRO_RX: [number, number] = [N.x + N.w / 2, N.y + N.h / 2];
const FRATURA: [number, number] = [CENTRO_RX[0] + 16, CENTRO_RX[1] + 94];
const ANTIGAS: [number, number][] = [[CENTRO_RX[0] - 114, CENTRO_RX[1] - 80], [CENTRO_RX[0] + 150, CENTRO_RX[1] + 98]];
const X_HEL = 920, X_TEO_H = 560, X_ROSE_H = 330;
const C5Raiox: React.FC = () => {
  const { t, dur, fala } = usePlano();
  let hel = parado(X_HEL, CH, E("helena"))(t);
  hel = comBracos(hel, apontar(hel, FRATURA, E("helena"), V("helena")), rampa(t, 0.3, 0.7), "R");
  hel.head.rot = -10;
  const teo = { ...parado(X_TEO_H, CH, 1)(t), head: { rot: -8, offsetY: 0 } };
  const rose = { ...parado(X_ROSE_H, CH, E("rose"))(t), expr: "preocupado" as const };
  return (
    <Camera chaves={[{ t: 0, z: 1.0, cx: 960, cy: 540 }, { t: dur, z: 1.08, cx: 1000, cy: 520 }]}>
      <Hospital t={t} />
      <Ator quem="rose" pose={comBracos(rose, cruzados(rose), 1)} />
      <Ator quem="teo" pose={teo} />
      <Ator quem="helena" pose={hel} fala={fala("helena")} />
    </Camera>
  );
};
const C5Antigas: React.FC = () => {
  const { t, dur, fala } = usePlano();
  const vira = 3.6;
  let hel = parado(X_HEL, CH, E("helena"), t > vira)(t);
  const alvo = t < 1.6 ? ANTIGAS[0] : ANTIGAS[1];
  hel = comBracos(hel, apontar(hel, alvo, E("helena"), V("helena")), sino(t, 0.2, vira, 0.35, 0.3), "R");
  hel.head.rot = t < vira ? -10 : 6;
  hel.expr = t > vira ? "serio" : "neutro";
  const teo = { ...parado(X_TEO_H, CH, 1)(t), head: { rot: t > vira ? 0 : -8, offsetY: 0 } };
  const rose = { ...parado(X_ROSE_H, CH, E("rose"))(t), expr: "preocupado" as const };
  return (
    <Camera chaves={[{ t: 0, z: 1.3, cx: CENTRO_RX[0], cy: CENTRO_RX[1] + 40 }, { t: vira - 0.4, z: 1.35, cx: CENTRO_RX[0], cy: CENTRO_RX[1] + 40 }, { t: vira, z: 1.6, cx: (X_HEL + X_TEO_H) / 2 + 40, cy: 520, corte: true }, { t: dur, z: 1.75, cx: (X_HEL + X_TEO_H) / 2 + 40, cy: 520 }]}>
      <Hospital t={t} antigas={rampa(t, 0.4, 0.9)} brilho={0.5} />
      <Ator quem="rose" pose={comBracos(rose, cruzados(rose), 1)} />
      <Ator quem="teo" pose={teo} />
      <Ator quem="helena" pose={hel} fala={fala("helena")} />
    </Camera>
  );
};

// ---------------------------------------------------------------- rua: o Dudu torce o pé na guia
const { calcada: CR, guia: GUIA } = RUA;
const X_DUDU_FIM = GUIA - 92;
const C5Rua: React.FC = () => {
  const { t, dur, fala, F } = usePlano();
  const anda = andar(300, X_DUDU_FIM, 0.0, CR, E("dudu"));
  const tTorce = anda.fim;
  let dudu = anda(t);
  if (t > tTorce) {
    const firme = parado(X_DUDU_FIM, CR, E("dudu"))(t);
    // pé direito pisa metade fora da guia e o tornozelo vira
    const torce = pePara(firme, "R", [GUIA + 12, CR + 10], E("dudu"), -38);
    const caido = sentadoChao(X_DUDU_FIM - 60, CR, E("dudu"))(t);
    dudu = seq(t, [[tTorce, () => firme], [tTorce + 0.05, () => ({ ...torce, torso: { ...torce.torso, rot: 14 } })], [tTorce + 0.45, () => caido]], 0.25);
    if (t > tTorce + 0.7) dudu = comBracos(dudu, maoEm(dudu, "R", pts("dudu", dudu).tornozeloR, E("dudu"), V("dudu")), rampa(t, tTorce + 0.7, tTorce + 1.0), "R");
    dudu.expr = t > tTorce + 0.5 ? "chorando" : "surpreso";
    dudu.lagrima = t > tTorce + 0.9 ? ((t - tTorce) * 0.8) % 1 : 0;
  }
  let teo = parado(620, CR, 1)(t);
  teo = comBracos(teo, cruzados(teo), rampa(t, F(1).ini - 0.6, F(1).ini - 0.3));
  if (t > F(1).fim - 0.9) teo = comBracos(teo, { ...teo, arm_upper_R: 70, arm_lower_R: 20 }, rampa(t, F(1).fim - 0.9, F(1).fim - 0.6), "R");
  teo.expr = "serio";
  return (
    <Camera chaves={[{ t: 0, z: 1.05, cx: 860, cy: 600 }, { t: F(1).ini - 0.05, z: 1.1, cx: 880, cy: 600 }, { t: F(1).ini, z: 1.5, cx: 820, cy: 560, corte: true }, { t: dur, z: 1.55, cx: 820, cy: 560 }]} tremores={[tTorce + 0.4]}>
      <Rua />
      <Ator quem="teo" pose={teo} fala={fala("teo")} />
      <Ator quem="dudu" pose={dudu} />
    </Camera>
  );
};

// ---------------------------------------------------------------- c5_fresco: três reclamações, o Téo de braços cruzados
const C5Fresco: React.FC = () => {
  const { t } = usePlano();
  const cena = t < 1.9 ? 0 : t < 3.9 ? 1 : 2;
  const teo = { ...cruzados(parado(1200, 940, 1, true)(t)), expr: "serio" as const };
  const fundos = ["#86DDBE", "#F2A65A", "#9B6FD0"];
  let outro: React.ReactNode = null;
  if (cena === 0) {
    const m = { ...sentadoChao(700, 940, E("turma3"))(t), expr: "chorando" as const, lagrima: (t * 0.9) % 1 };
    const j = pts("turma3", m).joelhoR;
    outro = <g><Ator quem="turma3" pose={m} /><circle cx={j[0]} cy={j[1] - 6} r={12} fill="#D9363A" stroke={LINHA} strokeWidth={4} /></g>;
  } else if (cena === 1) {
    let r = parado(700, 940, E("rose"))(t);
    r = comBracos(r, maoEm(r, "R", pts("rose", r).testa, E("rose"), V("rose")), 1, "R");
    r = { ...r, expr: "fechado", head: { rot: 10, offsetY: 0 } };
    outro = <Ator quem="rose" pose={r} semPiscar />;
  } else {
    let c = parado(700, 940, E("caco"))(t);
    const cab = pts("caco", c).cabeca;
    c = comBracos(c, maoEm(c, "R", [cab[0] + 90, cab[1] + 40], E("caco"), V("caco")), 1, "R");
    c = { ...c, expr: "chorando" };
    const m = pts("caco", c).maoR;
    outro = <g><Ator quem="caco" pose={c} /><circle cx={m[0]} cy={m[1] - 20} r={9} fill="#D9363A" stroke={LINHA} strokeWidth={4} />{[0, 1, 2].map((i) => <line key={i} x1={m[0] - 30 + i * 30} y1={m[1] - 46} x2={m[0] - 36 + i * 36} y2={m[1] - 70} stroke={LINHA} strokeWidth={5} strokeLinecap="round" />)}</g>;
  }
  return (
    <Camera chaves={[{ t: 0, z: 1.15, cx: 950, cy: 600 }]} fundo={fundos[cena]}>
      <Liso cor={fundos[cena]} padrao="rgba(0,0,0,0.05)" />
      <rect x={-400} y={940} width={2800} height={400} fill="rgba(0,0,0,0.12)" />
      <line x1={-400} y1={940} x2={2400} y2={940} stroke={LINHA} strokeWidth={9} />
      {outro}
      <Ator quem="teo" pose={teo} />
    </Camera>
  );
};

export const CAP5: Record<string, React.FC> = { c5_panela: C5Panela, c5_alca: C5Alca, c5_vo: C5Vo, c5_raiox: C5Raiox, c5_antigas: C5Antigas, c5_rua: C5Rua, c5_fresco: C5Fresco };
