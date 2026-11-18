// Capítulo 3: Começando pequeno.
import React from "react";
import { CAMPINHO, Campinho, Rua, RUA, TraveFrente } from "../teo/cenarios";
import { ELENCO } from "../teo/elenco";
import { Ator, Camera, E, Impacto, pts, usePlano, V } from "../teo/kit";
import { agachado, andar, apontar, comBracos, maoEm, mix, parado, pulso, rampa, rir, sentado, sino, type Fn } from "../teo/motor";
import { sentadoChao } from "../teo/cap4";
import { Bola, LINHA, type PoseTeo } from "../teo/tira";
import { Baloes, NoChao, type Caido } from "./balao";
import { Cadeira, Carro, Escrivaninha, FEIRA, FeiraBalcao, FeiraFundo, Loja, LOJA, MESA_PC, PlacaPreco, Sala, SALA, TelaJogo } from "./cenarios";
import { caidosDe, daBoca, porRotulo } from "./comum";

const Manga: React.FC<{ x: number; y: number; esc?: number }> = ({ x, y, esc = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${esc})`}><ellipse cx={8} cy={-14} rx={26} ry={20} fill="#F2A65A" stroke={LINHA} strokeWidth={5} /><path d="M 8 -34 q 6 -12 16 -12" stroke="#3FAF63" strokeWidth={5} fill="none" /></g>
);

// ---------------------------------------------------------------- c3_eununca: roda na sala do Dudu
const { chao: CS, sofa } = SALA;
const X_MENINA = 640, X_DUDU_S = 1010, X_TEO_S = 330, X_T2 = 1420, X_T4 = 820;
const menina: Fn = (t) => ({ ...sentado(X_MENINA, sofa.assento, E("menina"))(t), expr: "sorriso" });
const duduSofa: Fn = (t) => ({ ...sentado(X_DUDU_S, sofa.assento, E("dudu"), true)(t), expr: "neutro" });
const C3EuNunca: React.FC = () => {
  const { t, f, fps, dur, fala, F, S } = usePlano();
  const tVira = F(3).ini + 0.7;
  const tAlm = S("almofada");
  const vira = rampa(t, tVira, tVira + 0.25);
  let dudu = duduSofa(t);
  // pega a almofada ao lado e arremessa no Téo
  const lanca = tAlm - 0.45;
  const prep = sino(t, lanca - 0.5, lanca + 0.05, 0.3, 0.05);
  dudu = comBracos(dudu, { ...dudu, arm_upper_R: 150, arm_lower_R: 40 }, prep, "R");
  dudu = comBracos(dudu, { ...dudu, arm_upper_R: 70, arm_lower_R: 10 }, sino(t, lanca, lanca + 0.6, 0.1, 0.3), "R");
  dudu = { ...dudu, objR: t > lanca - 0.5 && t < lanca ? "almofada" : null, expr: t > F(2).fim ? (t > tVira ? "bravo" : "sorriso") : "neutro" };
  let teo: PoseTeo = { ...sentadoChao(X_TEO_S, CS, 1)(t), expr: "sorriso" };
  const golpe = pulso(t, tAlm, 0.5);
  teo = { ...teo, torso: { ...teo.torso, rot: teo.torso.rot - 14 * golpe }, head: { rot: -18 * golpe, offsetY: 0 } };
  if (t > tAlm + 0.3) teo = rir(teo, t, 1);
  const rostoT = pts("teo", teo).rosto;
  const mD = pts("dudu", { ...duduSofa(lanca), arm_upper_R: 150, arm_lower_R: 40 }).maoR;
  const kA = rampa(t, lanca, tAlm, (x) => x);
  const alm: [number, number] = [mD[0] + (rostoT[0] - mD[0]) * kA, mD[1] + (rostoT[1] - mD[1]) * kA - 140 * Math.sin(Math.PI * kA)];
  const turma4 = { ...sentado(X_T4, sofa.assento, E("turma4"))(t), head: { rot: 0, offsetY: 0 }, expr: (t > tVira ? "surpreso" : "sorriso") as PoseTeo["expr"] };
  const turma2 = { ...sentadoChao(X_T2, CS, E("turma2"), true)(t), expr: (t > tVira ? "surpreso" : "sorriso") as PoseTeo["expr"] };
  const men = { ...menina(t), esq: t > tVira ? false : false, head: { rot: -4, offsetY: 0 }, expr: (t > tVira ? "surpreso" : "sorriso") as PoseTeo["expr"] };
  const emissor = porRotulo({ menina: daBoca("menina", menina, -1, CS), dudu: daBoca("dudu", duduSofa, -1, CS, { xChao: 1130 }) });
  return (
    <Camera chaves={[{ t: 0, z: 1.05, cx: 900, cy: 560 }, { t: dur, z: 1.12, cx: 900, cy: 560 }]}>
      <Sala sofa="#E9707F" />
      <Ator quem="menina" pose={men} fala={fala("menina")} />
      <Ator quem="turma4" pose={{ ...turma4, esq: vira > 0.5 ? false : false, head: { rot: vira * 6, offsetY: 0 } }} />
      <Ator quem="dudu" pose={dudu} fala={fala("dudu")} />
      <Ator quem="turma2" pose={turma2} />
      <Ator quem="teo" pose={teo} />
      {t > lanca && t < tAlm && <g transform={`translate(${alm[0]} ${alm[1]}) rotate(${kA * 400})`}><rect x={-46} y={-30} width={92} height={60} rx={22} fill="#7FB7F0" stroke={LINHA} strokeWidth={6} /></g>}
      <Impacto x={rostoT[0]} y={rostoT[1]} d={f - Math.round(tAlm * fps)} raio={40} />
      <Baloes emissor={emissor} />
    </Camera>
  );
};

// ---------------------------------------------------------------- c3_online: jogo do traidor
const TEO_FONE = { ...ELENCO.teo.v, headset: true };
const AVATAR_FALA = 5;
const C3Online: React.FC = () => {
  const { t, dur, F } = usePlano();
  const m = MESA_PC.monitor;
  const av: [number, number] = [m.x + 70 + (AVATAR_FALA % 4) * 107, m.y + 92 + Math.floor(AVATAR_FALA / 4) * 120];
  const vit = rampa(t, F(2).ini + 0.6, F(2).ini + 2.4, (x) => x) * 30;
  const den = t > F(2).dur * 0.62 + F(2).ini ? 3 * rampa(t, F(2).ini + F(2).dur * 0.62, F(2).ini + F(2).dur * 0.62 + 0.8, (x) => x) : 0;
  let teo = sentado(MESA_PC.cadeira, MESA_PC.assento, 1, false, MESA_PC.chao)(t);
  teo = maoEm(maoEm(teo, "R", [MESA_PC.x0 + 200, MESA_PC.topo - 18], 1), "L", [MESA_PC.x0 + 150, MESA_PC.topo - 14], 1);
  const comemora = sino(t, F(2).ini + 0.6, F(2).ini + 2.6, 0.2, 0.3);
  teo = comBracos(teo, { ...teo, arm_upper_R: 160, arm_lower_R: 10 }, comemora * Math.abs(Math.sin(t * 6)), "R");
  teo = { ...teo, expr: t > F(2).ini + F(2).dur * 0.62 ? "surpreso" : comemora > 0.3 ? "rindo" : "curioso" };
  const emissor = porRotulo({ jogador: () => ({ boca: [av[0] + 30, av[1] - 30], lado: 1, chao: MESA_PC.topo, esc: 0.8, xChao: 1300 }) });
  return (
    <Camera chaves={[{ t: 0, z: 1.25, cx: 1060, cy: 520 }, { t: F(1).ini - 0.2, z: 1.25, cx: 1060, cy: 520 }, { t: F(1).ini, z: 1.7, cx: 1220, cy: 480 }, { t: F(2).ini + 0.4, z: 1.7, cx: 1220, cy: 480 }, { t: F(2).ini + 1.0, z: 1.2, cx: 1060, cy: 520 }, { t: dur, z: 1.26, cx: 1060, cy: 520 }]}>
      <Escrivaninha tela={<TelaJogo t={t} fala={t > F(1).ini && t < F(1).fim ? AVATAR_FALA : -1} vitorias={vit} denuncias={den} />} />
      <Cadeira x={MESA_PC.cadeira - 20} assento={MESA_PC.assento} chao={MESA_PC.chao} cor="#2A2A35" />
      <Ator quem="teo" pose={teo} v={TEO_FONE} />
      <Baloes emissor={emissor} />
    </Camera>
  );
};

// ---------------------------------------------------------------- feira: Dona Marta
const { chao: CF, balcao: BF } = FEIRA;
const martaBase: Fn = (t) => ({ ...parado(FEIRA.marta, CF, E("marta"), true)(t), arm_upper_R: 50, arm_lower_R: 60, expr: "sorriso" });
const teoFeira: Fn = (t) => ({ ...parado(470, CF, 1)(t), expr: "serio" });
const JA_NO_CHAO: Caido[] = [640, 720, 820, 900, 1000, 1090, 1180, 1270, 1340].map((x, i) => ({ x, chao: CF, esc: 0.8 + (i % 3) * 0.08, rot: ((i * 37) % 20) - 10 }));
const emissorFeira = porRotulo({
  marta: (t) => ({ boca: pts("marta", martaBase(t)).boca, lado: -1, chao: CF, esc: 1, xChao: undefined }),
  teo: daBoca("teo", teoFeira, 1, CF),
});
const emissorFeiraK = (b: { k: number; rotulo: string | null }, t: number) => {
  const e = emissorFeira(b as never, t);
  if (!e) return null;
  return b.rotulo === "marta" ? { ...e, xChao: [760, 960, 1160][b.k] ?? 960 } : e;
};
const C3Feira: React.FC = () => {
  const { t, dur, fala } = usePlano();
  const marta = martaBase(t);
  const mao = pts("marta", marta).maoR;
  return (
    <Camera chaves={[{ t: 0, z: 1.05, cx: 920, cy: 560 }, { t: dur, z: 1.15, cx: 940, cy: 600 }]}>
      <FeiraFundo />
      <Ator quem="marta" pose={marta} fala={fala("marta")} />
      <Manga x={mao[0] - 10} y={mao[1] - 6} />
      <FeiraBalcao />
      <NoChao itens={JA_NO_CHAO} />
      <Ator quem="teo" pose={teoFeira(t)} />
      <Baloes emissor={emissorFeiraK as never} />
    </Camera>
  );
};
const C3Detras: React.FC = () => {
  const { t, dur, fala, F } = usePlano();
  const caidos = [...JA_NO_CHAO, ...caidosDe("c3_feira", emissorFeiraK as never)];
  let teo = teoFeira(t);
  teo = comBracos(teo, apontar(teo, [FEIRA.caixaTras.x, FEIRA.caixaTras.y], 1), sino(t, 0.1, F(0).fim + 0.3), "R");
  let marta = martaBase(t);
  const olhaTras = sino(t, F(0).fim - 0.2, F(1).ini + 0.2, 0.25, 0.25);
  marta = { ...marta, esq: olhaTras < 0.5, expr: t > F(1).fim ? "bravo" : "preocupado" };
  // entrega a manga boa por cima do balcão e o Téo sai com ela
  const entrega = F(2).ini + 0.3;
  marta = comBracos(marta, maoEm(marta, "R", [BF.x0 + 30, BF.topo - 60], E("marta"), V("marta")), sino(t, entrega - 0.2, entrega + 0.9, 0.3, 0.3), "R");
  const mM = pts("marta", marta).maoR;
  const pega = entrega + 0.5;
  const anda = andar(470, 120, pega + 0.3, CF, 1);
  if (t > pega) teo = { ...mix(teo, anda(t), rampa(t, pega + 0.2, pega + 0.4)), arm_upper_R: 40, arm_lower_R: 60 };
  if (t > entrega && t < pega + 0.2) teo = comBracos(teo, maoEm(teo, "R", [mM[0] - 30, mM[1] + 4], 1), 1, "R");
  if (t > pega + 1.0) teo = { ...teo, head: { rot: 0, offsetY: 0 }, esq: true };
  const mT = pts("teo", teo).maoR;
  const emissor = porRotulo({ teo: daBoca("teo", teoFeira, 1, CF), marta: daBoca("marta", martaBase, -1, CF) });
  return (
    <Camera chaves={[{ t: 0, z: 1.15, cx: 900, cy: 580 }, { t: dur, z: 1.2, cx: 860, cy: 580 }]}>
      <FeiraFundo />
      <Ator quem="marta" pose={marta} fala={fala("marta")} />
      {t < pega && <Manga x={mM[0] - 10} y={mM[1] - 6} />}
      <FeiraBalcao />
      <NoChao itens={caidos} />
      <Ator quem="teo" pose={teo} fala={fala("teo")} />
      {t >= pega && <Manga x={mT[0] - 10} y={mT[1] - 6} />}
      <Baloes emissor={emissor} />
    </Camera>
  );
};

// ---------------------------------------------------------------- concessionária
const { chao: CL, carro: CAR } = LOJA;
const X_VEND = 1520, X_JORGE = 470, X_TEO_L = 320;
const vendedor: Fn = (t) => ({ ...parado(X_VEND, CL, E("vendedor"), true)(t), expr: "sorriso" });
const jorgeLoja: Fn = (t) => ({ ...parado(X_JORGE, CL, E("jorge"))(t), expr: "curioso" });
const teoLoja: Fn = (t) => ({ ...parado(X_TEO_L, CL, 1)(t), expr: "serio" });
const emissorLoja = (b: { k: number; fala: number | null; rotulo: string | null }, t: number) => {
  if (b.rotulo !== "vendedor") return null;
  const e = daBoca("vendedor", vendedor, -1, CL)(t);
  return { ...e, xChao: b.fala === 1 ? 1430 : b.k === 0 ? 1310 : 1160 };
};
const C3Carro: React.FC = () => {
  const { t, dur, fala, plano } = usePlano();
  let vend = vendedor(t);
  vend = comBracos(vend, apontar(vend, [CAR.x + 120, CAR.y - 200], E("vendedor"), V("vendedor")), sino(t, 1.2, dur, 0.3, 0.3), "R");
  const grande = (plano.baloes ?? []).find((b) => b.tipo === "M")?.queda ?? 99;
  return (
    <Camera chaves={[{ t: 0, z: 1.0, cx: 960, cy: 560 }, { t: dur, z: 1.08, cx: 980, cy: 580 }]} tremores={[grande]} forca={24}>
      <Loja />
      <Carro x={CAR.x} y={CAR.y} cor="#F2C94C" amassado brilho={0} />
      <PlacaPreco x={1250} y={CL - 180} />
      <Ator quem="jorge" pose={jorgeLoja(t)} />
      <Ator quem="teo" pose={teoLoja(t)} />
      <Ator quem="vendedor" pose={vend} fala={fala("vendedor")} />
      <Baloes emissor={emissorLoja as never} />
    </Camera>
  );
};
const C3Embaixo: React.FC = () => {
  const { t, dur } = usePlano();
  const caidos = caidosDe("c3_carro", emissorLoja as never);
  // cochicho: o pai se inclina, o Téo põe a mão do lado da boca
  let jorge = jorgeLoja(t);
  jorge = { ...jorge, torso: { ...jorge.torso, rot: 26 * sino(t, 0.1, 1.4, 0.3, 0.3) }, head: { rot: 10 * sino(t, 0.1, 1.4), offsetY: 0 } };
  let teo = teoLoja(t);
  const boca = pts("teo", teo).boca;
  teo = comBracos(teo, maoEm(teo, "R", [boca[0] + 18, boca[1] - 6], 1), sino(t, 0.2, 1.3, 0.25, 0.25), "R");
  // depois agacha perto do carro e olha embaixo
  const ag = agachado(CAR.x + 300, CL, E("jorge"), true, 1)(t);
  const olhando = { ...ag, head: { rot: 26, offsetY: 0 }, expr: "surpreso" as const };
  if (t > 1.5) jorge = mix(jorgeLoja(t), olhando, rampa(t, 1.5, 2.1));
  const close = t > 2.9;
  if (close) {
    return (
      <Camera chaves={[{ t: 2.9, z: 3.0, cx: CAR.x + 180, cy: CAR.y - 120 }, { t: dur + 0.5, z: 3.2, cx: CAR.x + 180, cy: CAR.y - 120 }]}>
        <Loja />
        <Carro x={CAR.x} y={CAR.y} cor="#F2C94C" amassado brilho={0.5 + 0.5 * Math.sin(t * 6)} />
      </Camera>
    );
  }
  return (
    <Camera chaves={[{ t: 0, z: 1.3, cx: 700, cy: 600 }, { t: 1.4, z: 1.3, cx: 700, cy: 600 }, { t: 2.2, z: 1.15, cx: 1000, cy: 600 }]}>
      <Loja />
      <Carro x={CAR.x} y={CAR.y} cor="#F2C94C" amassado brilho={0} />
      <PlacaPreco x={1250} y={CL - 180} />
      <Ator quem="teo" pose={t > 1.5 ? { ...teo, torso: { ...teo.torso, x: X_TEO_L + 380 * rampa(t, 1.5, 2.3) } } : teo} />
      <Ator quem="jorge" pose={t > 1.5 ? jorge : { ...jorge }} />
      <Ator quem="vendedor" pose={{ ...vendedor(t), expr: t > 2.0 ? "preocupado" : "sorriso" }} />
      <NoChao itens={caidos} />
    </Camera>
  );
};
const C3Preco: React.FC = () => {
  const { t, dur } = usePlano();
  const corte = 2.2;
  if (t < corte) {
    const caidos = caidosDe("c3_carro", emissorLoja as never);
    let vend = vendedor(t);
    const risca = rampa(t, 0.4, 1.1, (x) => x);
    vend = comBracos(vend, maoEm(vend, "R", [1250 - 90 + 180 * risca, CL - 180 - 60 - 30 * risca], E("vendedor"), V("vendedor")), sino(t, 0.2, 2.1, 0.2, 0.2), "R");
    vend = { ...vend, objR: "caneta", expr: "triste" };
    return (
      <Camera chaves={[{ t: 0, z: 1.6, cx: 1320, cy: 600 }, { t: corte, z: 1.66, cx: 1320, cy: 600 }]}>
        <Loja />
        <Carro x={CAR.x} y={CAR.y} cor="#F2C94C" amassado />
        <PlacaPreco x={1250} y={CL - 180} risca={risca} novo={rampa(t, 1.2, 1.9, (x) => x)} />
        <Ator quem="vendedor" pose={vend} />
        <NoChao itens={caidos} />
      </Camera>
    );
  }
  const jorge = andar(300, 1500, corte, RUA.calcada, E("jorge"))(t);
  const teo = andar(160, 1360, corte, RUA.calcada, 1)(t);
  return (
    <Camera chaves={[{ t: corte, z: 1.0, cx: 760, cy: 560 }, { t: dur + 0.5, z: 1.0, cx: 1060, cy: 560 }]}>
      <Rua />
      <Ator quem="jorge" pose={{ ...jorge, objR: "acai", arm_upper_R: 40, arm_lower_R: 70, expr: "sorriso" }} />
      <Ator quem="teo" pose={{ ...teo, objR: "acai", arm_upper_R: 40, arm_lower_R: 70, expr: "rindo" }} />
    </Camera>
  );
};

// ---------------------------------------------------------------- campinho: três contra três
const { chao: CC } = CAMPINHO;
const X_ADV = 1130, X_TEO_C = 860;
const adversario: Fn = (t) => ({ ...parado(X_ADV, CC, E("adversario"), true)(t), expr: "bravo" });
const teoCampo: Fn = (t) => ({ ...parado(X_TEO_C, CC, 1)(t), expr: "serio" });
const BOLA_FORA: [number, number] = [1010, CC - 30];
const Aposta: React.FC = () => (
  <g transform={`translate(260 ${CC})`}>
    {[0, 1].map((i) => <rect key={i} x={-46 + i * 26} y={-16 - i * 6} width={80} height={36} rx={4} fill="#9BD47A" stroke={LINHA} strokeWidth={4} transform={`rotate(${i * 10 - 6})`} />)}
    <ellipse cx={8} cy={-30} rx={40} ry={26} fill="#9AA0A8" stroke={LINHA} strokeWidth={6} />
  </g>
);
const emissorCampo = porRotulo({ adversario: daBoca("adversario", adversario, -1, CC, { xChao: X_ADV - 70 }) });
const TIME: { q: "dudu" | "turma4" | "turma1" | "turma2"; x: number; esq: boolean; fundo?: boolean }[] = [{ q: "turma4", x: 420, esq: false, fundo: true }, { q: "turma2", x: 1560, esq: true, fundo: true }, { q: "dudu", x: 620, esq: false }, { q: "turma1", x: 1380, esq: true }];
const C3Campinho: React.FC = () => {
  const { t, dur, fala, F } = usePlano();
  let adv = adversario(t);
  adv = comBracos(adv, apontar(adv, pts("teo", teoCampo(t)).pontaR, E("adversario"), V("adversario")), sino(t, F(1).ini, dur, 0.25, 0.3), "R");
  // a bola rola para fora da linha e para
  const kb = rampa(t, 0.3, 1.6, (x) => 1 - (1 - x) * (1 - x));
  const bx = X_TEO_C + 60 + (BOLA_FORA[0] - X_TEO_C - 60) * kb;
  return (
    <Camera chaves={[{ t: 0, z: 1.0, cx: 960, cy: 560 }, { t: F(1).ini - 0.1, z: 1.0, cx: 960, cy: 560 }, { t: F(1).ini + 0.3, z: 1.4, cx: 1000, cy: 600 }, { t: dur, z: 1.45, cx: 1000, cy: 600 }]}>
      <Campinho />
      <line x1={-400} y1={CC + 30} x2={2400} y2={CC + 30} stroke="#FBFBF7" strokeWidth={8} strokeDasharray="40 30" opacity={0} />
      <Aposta />
      {TIME.map(({ q, x, esq, fundo }) => <Ator key={q} quem={q} esc={E(q) * (fundo ? 0.8 : 1)} pose={{ ...parado(x, fundo ? CC - 46 : CC, E(q) * (fundo ? 0.8 : 1), esq)(t + x), expr: "serio" }} />)}
      <Ator quem="teo" pose={teoCampo(t)} />
      <Ator quem="adversario" pose={adv} fala={fala("adversario")} />
      <Bola x={bx} y={BOLA_FORA[1]} r={30} giro={kb * 400} />
      <TraveFrente />
      <Baloes emissor={emissorCampo} />
    </Camera>
  );
};
const C3Aponta: React.FC = () => {
  const { t, f, fps, dur } = usePlano();
  const caidos = caidosDe("c3_campinho", emissorCampo);
  const alvo: [number, number] = [caidos[0]?.x ?? X_ADV - 70, CC - 30];
  let teo: PoseTeo = { ...teoCampo(t), expr: "sorriso" };
  teo = comBracos(teo, apontar(teo, alvo, 1), sino(t, 0.4, 2.8, 0.3, 0.3), "R");
  let adv: PoseTeo = { ...adversario(t), head: { rot: 22 * sino(t, 1.0, 2.6), offsetY: 0 }, expr: "curioso" };
  // ele pega a bola e devolve (arremesso por baixo)
  const pegaB = 2.7, solta = 3.4;
  const ag = { ...agachado(X_ADV, CC, E("adversario"), true, 0.8)(t), expr: "triste" as const };
  if (t > pegaB - 0.4 && t < pegaB + 0.4) adv = mix(adv, maoEm(ag, "R", [BOLA_FORA[0] + 10, BOLA_FORA[1] - 20], E("adversario"), V("adversario")), sino(t, pegaB - 0.4, pegaB + 0.4, 0.3, 0.3));
  if (t >= pegaB + 0.2) adv = comBracos(adv, { ...adv, arm_upper_R: 120, arm_lower_R: 10 }, sino(t, pegaB + 0.2, solta + 0.4, 0.3, 0.3), "R");
  const mA = pts("adversario", adv).maoR;
  const mT = pts("teo", teo).maoR;
  let bx = BOLA_FORA[0], by = BOLA_FORA[1];
  if (t > pegaB && t < solta) { bx = mA[0]; by = mA[1] - 30; }
  if (t >= solta) { const k = Math.min(1, (t - solta) / 0.7); bx = mA[0] + (mT[0] - mA[0]) * k; by = mA[1] - 30 + (mT[1] - 30 - mA[1] + 30) * k - 160 * Math.sin(Math.PI * k); }
  if (t >= solta + 0.7) { teo = comBracos(teo, { ...teo, arm_upper_R: 50, arm_lower_R: 40 }, 1, "R"); bx = mT[0] + 20; by = mT[1] - 34; }
  return (
    <Camera chaves={[{ t: 0, z: 1.45, cx: 1000, cy: 600 }, { t: 4.4, z: 1.45, cx: 1000, cy: 600 }, { t: 5.4, z: 1.0, cx: 960, cy: 560 }, { t: dur, z: 1.04, cx: 960, cy: 560 }]}>
      <Campinho />
      <Aposta />
      {TIME.map(({ q, x, esq, fundo }) => <Ator key={q} quem={q} esc={E(q) * (fundo ? 0.8 : 1)} pose={{ ...parado(x, fundo ? CC - 46 : CC, E(q) * (fundo ? 0.8 : 1), esq)(t + x), expr: t > 5.5 ? "sorriso" : "serio" }} />)}
      <Ator quem="teo" pose={teo} />
      <Ator quem="adversario" pose={adv} />
      <Bola x={bx} y={by} r={30} giro={t * 200} />
      <NoChao itens={caidos} />
      <TraveFrente />
      <Impacto x={alvo[0]} y={alvo[1]} d={f - Math.round(0.6 * fps)} raio={60} esc={0.6} angulos={[-160, -120, -60, -20]} />
    </Camera>
  );
};

export const CAP3: Record<string, React.FC> = {
  c3_eununca: C3EuNunca, c3_online: C3Online, c3_feira: C3Feira, c3_detras: C3Detras, c3_carro: C3Carro, c3_embaixo: C3Embaixo, c3_preco: C3Preco, c3_campinho: C3Campinho, c3_aponta: C3Aponta,
};
