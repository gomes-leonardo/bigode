// Capítulo 6: A noite do muro.
import React from "react";
import { Easing } from "remotion";
import { QUINTAL, Quintal } from "./cenarios";
import { Ator, Camera, E, Impacto, pts, usePlano, V } from "./kit";
import { agachado, andar, base, comBracos, cruzados, deitado, maoEm, mix, parado, rampa, rir, type Fn } from "./motor";
import { LINHA, type PoseTeo } from "./tira";

const { chao: CQ, muro } = QUINTAL;
const TOPO = muro.topo - 18; // em cima da capa do muro
const X_DUDU_MURO = 860;
const X_CACO = 1640;
const X_TEO = 420;
const X_DUDU_CHAO = 1010; // onde ele cai, na frente do muro

const duduEmCima = (t: number): PoseTeo => {
  const p = parado(X_DUDU_MURO, TOPO, E("dudu"))(t);
  const bal = Math.sin(t * 5);
  return { ...p, arm_upper_R: 92 + 8 * bal, arm_lower_R: 4, arm_upper_L: -92 + 8 * bal, arm_lower_L: 4, torso: { ...p.torso, rot: 4 * bal }, expr: "sorriso" };
};
/** Dudu caído de costas, perna direita torta */
const duduCaido: Fn = (t) => {
  const p = deitado(X_DUDU_CHAO, CQ + 4, E("dudu"))(t);
  return { ...p, leg_upper_R: 14, leg_lower_R: 58, pe_R: 20, expr: "chorando", lagrima: (t * 0.7) % 1, arm_upper_R: 40, arm_lower_R: 30 };
};
const cacoFilma = (t: number): PoseTeo => ({ ...parado(X_CACO, CQ, E("caco"), true)(t), objR: "celularFilma", arm_upper_R: 70, arm_lower_R: 40, expr: "sorriso" });
const teoCruzado = (t: number, rindo: number): PoseTeo => rir({ ...cruzados(parado(X_TEO, CQ, 1)(t)), expr: "sorriso" }, t, rindo);

const C6Muro: React.FC = () => {
  const { t, dur } = usePlano();
  // sobe: agarra a borda, puxa o corpo e fica de pé
  const sobe = rampa(t, 0.2, 1.3, Easing.inOut(Easing.cubic));
  const pendurado = { ...base(X_DUDU_MURO, TOPO + 150), arm_upper_R: 170, arm_lower_R: 0, arm_upper_L: 166, arm_lower_L: 0, leg_upper_R: 20, leg_lower_R: -40, leg_upper_L: 40, leg_lower_L: -70, pe_R: 0, pe_L: 0 };
  const ajoelhado = agachado(X_DUDU_MURO, TOPO, E("dudu"))(t);
  let dudu = t < 0.9 ? mix(pendurado, ajoelhado, rampa(t, 0.2, 0.9)) : mix(ajoelhado, duduEmCima(t), rampa(t, 1.0, 1.6));
  dudu = { ...dudu, expr: sobe > 0.9 ? "sorriso" : "bravo" };
  return (
    <Camera chaves={[{ t: 0, z: 1.0, cx: 960, cy: 540 }, { t: dur, z: 1.06, cx: 960, cy: 520 }]} fundo="#1E2A5A">
      <Quintal t={t} />
      <Ator quem="dudu" pose={dudu} />
      <Ator quem="caco" pose={cacoFilma(t)} />
      <Ator quem="teo" pose={teoCruzado(t, 0)} />
    </Camera>
  );
};
const C6Cai: React.FC = () => {
  const { t, f, fps, dur, S } = usePlano();
  const tQ = S("queda");
  const tEsc = 0.45;
  let dudu: PoseTeo;
  if (t < tEsc) dudu = duduEmCima(t);
  else if (t < tQ) {
    const k = (t - tEsc) / (tQ - tEsc);
    const ini = duduEmCima(tEsc);
    const fim = duduCaido(tQ);
    // arco de queda: sai do topo, cai na frente do muro girando para trás
    const x = ini.torso.x + (fim.torso.x - ini.torso.x) * k;
    const y = ini.torso.y + (fim.torso.y - ini.torso.y) * k * k - 60 * Math.sin(Math.PI * k) * (1 - k);
    dudu = { ...mix(ini, fim, k), torso: { ...mix(ini, fim, k).torso, x, y }, giro: -95 * k, leg_upper_R: 70 * Math.sin(Math.PI * k), leg_upper_L: 40, arm_upper_R: 160, arm_upper_L: 150, expr: "grito" };
  } else dudu = { ...duduCaido(t), expr: t < tQ + 0.6 ? "grito" : "chorando" };
  const teo = teoCruzado(t, rampa(t, 1.4, 1.6));
  return (
    <Camera chaves={[{ t: 0, z: 1.0, cx: 960, cy: 540 }, { t: dur, z: 1.04, cx: 940, cy: 560 }]} fundo="#1E2A5A" tremores={[tQ]}>
      <Quintal t={t} />
      <Ator quem="caco" pose={cacoFilma(t)} />
      <Ator quem="teo" pose={teo} />
      <Ator quem="dudu" pose={dudu} />
      <Impacto x={X_DUDU_CHAO} y={CQ - 20} d={f - Math.round(tQ * fps)} raio={70} angulos={[-170, -130, -50, -10]} />
    </Camera>
  );
};
const C6Rostos: React.FC = () => {
  const { t, f, fps, S } = usePlano();
  const tPau = S("pau");
  const cena = t < 2.05 ? 0 : t < 3.45 ? 1 : 2;
  if (cena === 0) {
    const mae = andar(-300, X_DUDU_CHAO - 430, 0.2, CQ, E("maeDudu"), { correr: true })(t);
    return (
      <Camera chaves={[{ t: 0, z: 1.0, cx: 760, cy: 540 }, { t: 2.05, z: 1.05, cx: 860, cy: 560 }]} fundo="#1E2A5A">
        <Quintal t={t} />
        <Ator quem="dudu" pose={duduCaido(t)} />
        <Ator quem="maeDudu" pose={{ ...mae, expr: "grito" }} />
      </Camera>
    );
  }
  if (cena === 1) {
    let rose = parado(600, CQ, E("rose"))(t);
    rose = comBracos(rose, maoEm(rose, "R", pts("rose", rose).boca, E("rose"), V("rose")), rampa(t, 2.15, 2.45), "R");
    rose = { ...rose, expr: "surpreso", palido: 0.4 };
    const cab = pts("rose", rose).cabeca;
    return (
      <Camera chaves={[{ t: 2.05, z: 2.1, cx: cab[0] + 20, cy: cab[1] + 60 }, { t: 3.45, z: 2.25, cx: cab[0] + 20, cy: cab[1] + 60 }]} fundo="#1E2A5A">
        <Quintal t={t} />
        <Ator quem="rose" pose={rose} />
      </Camera>
    );
  }
  // a vó larga a colher de pau
  const vo = { ...parado(1450, CQ, E("cida"), true)(t), expr: "surpreso" as const, arm_upper_R: 40, arm_lower_R: 40, objR: (t < tPau - 0.45 ? "colher" : null) as PoseTeo["objR"] };
  const mao = pts("cida", vo).maoR;
  const solta = Math.max(0, t - (tPau - 0.45));
  const colY = Math.min(CQ - 10, mao[1] + 0.5 * 2900 * solta * solta);
  return (
    <Camera chaves={[{ t: 3.45, z: 1.6, cx: 1450, cy: 640 }, { t: 6.5, z: 1.7, cx: 1450, cy: 660 }]} fundo="#1E2A5A" tremores={[tPau]} forca={8}>
      <Quintal t={t} />
      <Ator quem="cida" pose={vo} />
      {solta > 0 && <g transform={`translate(${mao[0] - 20 * Math.min(1, solta * 3)} ${colY}) rotate(${Math.min(90, solta * 240) - 40})`}><rect x={-6} y={-60} width={12} height={92} rx={6} fill="#B07A4A" stroke={LINHA} strokeWidth={5} /><ellipse cx={0} cy={44} rx={18} ry={26} fill="#C68A55" stroke={LINHA} strokeWidth={5} /></g>}
      <Impacto x={mao[0] - 20} y={CQ - 14} d={f - Math.round(tPau * fps)} raio={30} esc={0.8} angulos={[-170, -130, -50, -10]} />
    </Camera>
  );
};
const C6Para: React.FC = () => {
  const { t, dur } = usePlano();
  const fica = rampa(t, 0.3, 1.2);
  let teo = teoCruzado(t, 1 - rampa(t, 0.1, 0.6));
  teo = { ...teo, expr: fica > 0.6 ? "triste" : fica > 0.1 ? "serio" : "rindo" };
  teo = comBracos(teo, parado(X_TEO, CQ, 1)(t), rampa(t, 1.4, 2.0));
  const cab = pts("teo", teo).cabeca;
  return (
    <Camera chaves={[{ t: 0, z: 2.0, cx: cab[0] + 20, cy: cab[1] + 60 }, { t: dur, z: 2.7, cx: cab[0] + 10, cy: cab[1] + 20 }]} fundo="#1E2A5A">
      <Quintal t={t} />
      <Ator quem="teo" pose={teo} />
    </Camera>
  );
};
/** Téo agachado ao lado do Dudu, segurando a mão dele */
const X_TEO_AGACHA = X_DUDU_CHAO - 430;
const teoSegura = (t: number, dudu: PoseTeo): PoseTeo => {
  const ag = agachado(X_TEO_AGACHA, CQ, 1, false, 0.9)(t);
  const mD = pts("dudu", dudu).maoR;
  return { ...maoEm(ag, "R", [mD[0] - 6, mD[1] - 4], 1), expr: "triste", head: { rot: 14, offsetY: 0 } };
};
const duduMao = (t: number): PoseTeo => maoEm(duduCaido(t), "R", [X_TEO_AGACHA + 150, CQ - 120], E("dudu"), V("dudu"));
const C6Mao: React.FC = () => {
  const { t, dur } = usePlano();
  const anda = andar(X_TEO, X_TEO_AGACHA, 0.2, CQ, 1);
  const dudu = mix(duduCaido(t), duduMao(t), rampa(t, anda.fim + 0.3, anda.fim + 0.8));
  let teo = anda(t);
  teo = { ...mix(teo, teoSegura(t, dudu), rampa(t, anda.fim, anda.fim + 0.5)), expr: "triste" };
  const mae = { ...agachado(X_DUDU_CHAO + 260, CQ, E("maeDudu"), true)(t), expr: "chorando" as const, lagrima: (t * 0.6) % 1 };
  return (
    <Camera chaves={[{ t: 0, z: 1.1, cx: 820, cy: 600 }, { t: dur, z: 1.5, cx: 880, cy: 700 }]} fundo="#1E2A5A">
      <Quintal t={t} />
      <Ator quem="maeDudu" pose={mae} />
      <Ator quem="dudu" pose={dudu} />
      <Ator quem="teo" pose={teo} />
    </Camera>
  );
};
const C6Ambulancia: React.FC = () => {
  const { t, dur, fala } = usePlano();
  const dudu = { ...duduMao(t), expr: "triste" as const, falando: fala("dudu") };
  const teo = { ...teoSegura(t, dudu), lagrima: t > 3.0 ? ((t - 3.0) * 0.6) % 1 : 0, falando: fala("teo") };
  return (
    <Camera chaves={[{ t: 0, z: 1.45, cx: 900, cy: 690 }, { t: dur, z: 1.6, cx: 880, cy: 700 }]} fundo="#1E2A5A">
      <Quintal t={t} ambulancia={rampa(t, 0, 1.6)} />
      <Ator quem="dudu" pose={dudu} />
      <Ator quem="teo" pose={teo} />
    </Camera>
  );
};
const C6Abraco: React.FC = () => {
  const { t, dur } = usePlano();
  let teo = { ...parado(X_TEO_AGACHA + 40, CQ, 1)(t), expr: "triste" as const };
  teo.head.rot = 10;
  const peito = pts("teo", teo).peito;
  // a mãe chega por trás e abraça (os dois olhando para a direita)
  const anda = andar(X_TEO_AGACHA - 500, X_TEO_AGACHA - 60, -0.3, CQ, E("rose"));
  let rose = anda(t);
  const abraca = rampa(t, anda.fim, anda.fim + 0.5);
  rose = comBracos(rose, maoEm(maoEm(rose, "R", [peito[0] + 20, peito[1] + 10], E("rose"), V("rose")), "L", [peito[0] + 10, peito[1] - 10], E("rose"), V("rose")), abraca);
  rose.torso.rot = 10 * abraca;
  rose.head.rot = 16 * abraca;
  rose.expr = "triste";
  const esfrega = Math.sin(t * 6);
  const vo = { ...parado(1560, CQ, E("cida"), true)(t), arm_upper_R: 50 + 6 * esfrega, arm_lower_R: 70, arm_upper_L: 46 - 6 * esfrega, arm_lower_L: 74, expr: "serio" as const };
  return (
    <Camera chaves={[{ t: 0, z: 1.2, cx: 1000, cy: 580 }, { t: dur, z: 1.3, cx: 1000, cy: 580 }]} fundo="#1E2A5A">
      <Quintal t={t} ambulancia={1 - rampa(t, 0, 3)} />
      <Ator quem="cida" pose={vo} />
      <Ator quem="teo" pose={teo} />
      <Ator quem="rose" pose={rose} />
    </Camera>
  );
};

export const CAP6: Record<string, React.FC> = { c6_muro: C6Muro, c6_cai: C6Cai, c6_rostos: C6Rostos, c6_para: C6Para, c6_mao: C6Mao, c6_ambulancia: C6Ambulancia, c6_abraco: C6Abraco };
