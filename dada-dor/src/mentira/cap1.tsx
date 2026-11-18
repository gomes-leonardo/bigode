// Capítulo 1: A mão de truco.
import React from "react";
import { Titulo } from "../teo/cap1";
import { Q, QuartoFundo, QuartoFrente } from "../teo/Quarto";
import { Rua, RUA } from "../teo/cenarios";
import { ELENCO } from "../teo/elenco";
import { Ator, Camera, E, Painel, pts, usePlano, V } from "../teo/kit";
import { andar, comBracos, maoEm, parado, pulso, rampa, rir, sentado, sino, type Fn } from "../teo/motor";
import { Boneco, LINHA, type PoseTeo } from "../teo/tira";
import { Baloes, NoChao } from "./balao";
import { Cadeira, Carta, DELEG, Delegacia, Garagem, GARAGEM, LAJE, LajeFrente, LajeFundo, MesaSimples, MesaTruco, Sala, SALA, CaixaSom } from "./cenarios";
import { caidosDe, daBoca, Flash, porRotulo, Suor, Tinta } from "./comum";

const { chao: CG, mesa, assento, xTeo, xDudu } = GARAGEM;
const CACO_BOINA = { ...ELENCO.caco.v, chapeu: "boina" as const, corChapeu: "#7A4E9A" };

// ---------------------------------------------------------------- poses da garagem
const teoMesa: Fn = (t) => {
  const p = sentado(xTeo, assento, 1, false, CG)(t);
  return { ...maoEm(maoEm(p, "R", [mesa.x0 + 40, mesa.topo - 62], 1), "L", [mesa.x0 + 6, mesa.topo - 8], 1), objR: "cartas" };
};
const duduMesa: Fn = (t) => {
  const p = sentado(xDudu, assento, E("dudu"), true, CG)(t);
  const q = maoEm(maoEm(p, "R", [mesa.x1 - 40, mesa.topo - 62], E("dudu"), V("dudu")), "L", [mesa.x1 - 6, mesa.topo - 8], E("dudu"), V("dudu"));
  return { ...q, objR: "cartas", expr: "preocupado" };
};
const turmaAtras = (t: number, olhaDudu = 0): { q: "turma1" | "turma3"; p: PoseTeo }[] => [
  { q: "turma1", p: { ...parado(870, CG, E("turma1"))(t), head: { rot: 8 * olhaDudu, offsetY: 0 } } },
  { q: "turma3", p: { ...parado(1085, CG, E("turma3"), true)(t + 1), head: { rot: 6, offsetY: 0 } } },
];
const cacoPorta = (t: number): PoseTeo => ({ ...parado(1600, CG, E("caco"), true)(t), arm_upper_R: 24, arm_lower_R: 100, arm_upper_L: 20, arm_lower_L: 104 });
const balaoDudu = daBoca("dudu", duduMesa, -1, mesa.topo, { xChao: 985 });
const emissorTruco = porRotulo({ dudu: balaoDudu, teo: daBoca("teo", teoMesa, 1, mesa.topo) });

const CenaGaragem: React.FC<{ t: number; teo: PoseTeo; dudu: PoseTeo; turma?: { q: "turma1" | "turma3"; p: PoseTeo }[]; caco?: PoseTeo; mesaExtra?: React.ReactNode; semCacoBoina?: boolean; fala?: Record<string, boolean>; pizza?: boolean; pote?: boolean }> = ({ t, teo, dudu, turma, caco, mesaExtra, semCacoBoina, fala = {}, pizza, pote }) => (
  <>
    <Garagem />
    {(turma ?? turmaAtras(t)).map(({ q, p }) => <Ator key={q} quem={q} pose={p} />)}
    <Ator quem="caco" pose={{ ...(caco ?? cacoPorta(t)), semChapeu: semCacoBoina }} v={CACO_BOINA} />
    <Cadeira x={xTeo - 20} assento={assento} chao={CG} />
    <Cadeira x={xDudu + 20} assento={assento} chao={CG} esq cor="#3B6FD6" />
    <MesaTruco pizza={pizza} pote={pote} />
    {mesaExtra}
    <Ator quem="teo" pose={teo} fala={fala.teo} />
    <Ator quem="dudu" pose={dudu} fala={fala.dudu} />
  </>
);

// ---------------------------------------------------------------- c1_truco
const C1Truco: React.FC = () => {
  const { t, dur, fala } = usePlano();
  const dudu = duduMesa(t);
  const cab = pts("dudu", dudu).cabeca;
  return (
    <Camera chaves={[{ t: 0, z: 1.0, cx: 960, cy: 560 }, { t: dur, z: 1.25, cx: 1020, cy: 560 }]}>
      <CenaGaragem t={t} teo={{ ...teoMesa(t), expr: "serio" }} dudu={dudu} fala={{ dudu: fala("dudu") }} />
      <Suor x={cab[0]} y={cab[1]} t={t} r={80} lado={1} />
      <Baloes emissor={emissorTruco} />
    </Camera>
  );
};
// ---------------------------------------------------------------- c1_viu
const C1Viu: React.FC = () => {
  const { t, dur, fala, F } = usePlano();
  const caidos = caidosDe("c1_truco", emissorTruco);
  let teo = teoMesa(t);
  const olha = sino(t, 0.2, F(1).ini - 0.2, 0.3, 0.25);
  teo = { ...teo, head: { ...teo.head, rot: teo.head.rot + 16 * olha }, expr: olha > 0.5 ? "curioso" : "serio" };
  // "Truco.": bate as cartas na mesa
  const bate = pulso(t, F(1).ini - 0.05, 0.4);
  teo = comBracos(teo, maoEm(teo, "R", [mesa.x0 + 60, mesa.topo - 10], 1), bate, "R");
  const dudu = duduMesa(t);
  const cab = pts("dudu", dudu).cabeca;
  return (
    <Camera chaves={[{ t: 0, z: 1.55, cx: 860, cy: 590 }, { t: dur, z: 1.62, cx: 870, cy: 590 }]}>
      <CenaGaragem t={t} teo={teo} dudu={dudu} turma={turmaAtras(t)} fala={{ teo: fala("teo") }} />
      <NoChao itens={caidos} />
      <Suor x={cab[0]} y={cab[1]} t={t} r={80} />
      <Baloes emissor={emissorTruco} />
    </Camera>
  );
};
// ---------------------------------------------------------------- c1_corro
const C1Corro: React.FC = () => {
  const { t, dur, fala, F, S } = usePlano();
  const caidos = caidosDe("c1_truco", emissorTruco);
  let dudu = duduMesa(t);
  dudu.head.rot += 10 * sino(t, 0, 0.8, 0.2, 0.3); // engole seco
  const joga = rampa(t, F(0).fim + 0.05, F(0).fim + 0.35);
  dudu = comBracos(dudu, maoEm(dudu, "R", [mesa.x1 - 120, mesa.topo - 16], E("dudu"), V("dudu")), sino(t, F(0).fim, F(0).fim + 0.8, 0.2, 0.3), "R");
  if (joga > 0.6) dudu.objR = null;
  dudu.expr = "triste";
  const tVira = S("carta");
  let teo = teoMesa(t);
  teo = comBracos(teo, maoEm(teo, "R", [mesa.x0 + 120, mesa.topo - 14], 1), sino(t, tVira - 0.25, tVira + 0.5, 0.2, 0.25), "R");
  if (t > tVira) teo.objR = null;
  teo.expr = t > tVira + 0.4 ? "sorriso" : "serio";
  const insert = t > tVira + 0.1;
  return (
    <Camera chaves={[{ t: 0, z: 1.3, cx: 1000, cy: 560 }, { t: dur, z: 1.36, cx: 1000, cy: 560 }]}>
      <CenaGaragem t={t} teo={teo} dudu={dudu} fala={{ dudu: fala("dudu") }}
        mesaExtra={<g>{joga > 0 && [0, 1, 2].map((i) => <rect key={i} x={1060 - joga * 90 - i * 22} y={mesa.topo - 8 - (1 - joga) * 80} width={56} height={8} rx={2} fill="#3B6FD6" stroke={LINHA} strokeWidth={3} />)}</g>} />
      <NoChao itens={caidos} />
      <Baloes emissor={emissorTruco} />
      {insert && (
        <Painel x={1180} y={90} w={600} h={380} desde={tVira + 0.1} fundo="#2F8F55">
          <Carta x={210} y={190} pintas={4} naipe="paus" rot={-8} esc={2.6} />
          <Carta x={400} y={190} pintas={5} naipe="ouros" rot={7} esc={2.6} />
        </Painel>
      )}
    </Camera>
  );
};
// ---------------------------------------------------------------- c1_grita: a garagem explode; a regra dos balões
const C1Grita: React.FC = () => {
  const { t, dur } = usePlano();
  const caidos = caidosDe("c1_truco", emissorTruco);
  const turma = turmaAtras(t).map(({ q, p }, i) => {
    const pula = Math.abs(Math.sin(t * 7 + i * 1.3));
    return { q, p: rir({ ...p, torso: { ...p.torso, y: p.torso.y - 40 * pula }, arm_upper_R: 160, arm_lower_R: 10, arm_upper_L: 150, arm_lower_L: 10 }, t + i, 1) };
  });
  // o Caco tira a boina e joga no chão
  let caco = cacoPorta(t);
  const cab = pts("caco", caco).cabeca;
  const tira = sino(t, 0.3, 1.2, 0.25, 0.2);
  caco = comBracos(caco, maoEm(caco, "R", [cab[0] - 10, cab[1] - 80], E("caco"), V("caco")), tira, "R");
  const joga = rampa(t, 1.0, 1.25);
  caco = comBracos(caco, { ...caco, arm_upper_R: 30, arm_lower_R: 10 }, joga, "R");
  caco = { ...caco, expr: "rindo", objR: t > 0.55 && t < 1.15 ? "boina" : null };
  const boinaVoo = t >= 1.15 ? Math.min(1, (t - 1.15) / 0.35) : -1;
  let dudu = duduMesa(t);
  dudu = { ...dudu, torso: { ...dudu.torso, rot: dudu.torso.rot + 30 * rampa(t, 0.2, 0.6) }, head: { rot: 20, offsetY: 0 }, expr: "triste", objR: null };
  const teo = rir({ ...teoMesa(t), arm_upper_R: 150, arm_lower_R: 20, arm_upper_L: 140, arm_lower_L: 20, objR: null }, t, 1);
  const emissorDemo = porRotulo({ demoM: () => ({ boca: [420, 280], lado: 1, chao: CG, esc: 1.1, xChao: 520 }), demoV: () => ({ boca: [1380, 330], lado: 1, chao: CG, esc: 1.1 }) });
  return (
    <Camera chaves={[{ t: 0, z: 1.0, cx: 980, cy: 540 }, { t: dur, z: 1.04, cx: 980, cy: 540 }]} tremores={[0.05]} forca={8}>
      <CenaGaragem t={t} teo={teo} dudu={dudu} turma={turma} caco={caco} semCacoBoina={t > 0.55} />
      {boinaVoo >= 0 && <g transform={`translate(${cab[0] + 60 + boinaVoo * 40} ${cab[1] + 40 + (CG - 20 - cab[1] - 40) * boinaVoo * boinaVoo}) rotate(${boinaVoo * 140})`}><path d="M -40 -6 Q -30 -44 16 -40 Q 50 -34 46 -10 Q 0 -18 -40 -6 Z" fill="#7A4E9A" stroke={LINHA} strokeWidth={5} strokeLinejoin="round" /></g>}
      <NoChao itens={caidos} />
      <Baloes emissor={emissorDemo} />
    </Camera>
  );
};

// ---------------------------------------------------------------- c1_montagem: mãe no portão, moça na TV, voz no celular
const C1Montagem: React.FC = () => {
  const { t } = usePlano();
  if (t < 1.95) {
    const rose: Fn = (tt) => ({ ...parado(1020, RUA.calcada, E("rose"), true)(tt), expr: "sorriso", falando: tt > 0.3 && tt < 0.9 && Math.sin(tt * 40) > 0 });
    const teo = parado(740, RUA.calcada, 1)(t);
    return (
      <Camera chaves={[{ t: 0, z: 1.3, cx: 880, cy: 600 }, { t: 1.95, z: 1.36, cx: 880, cy: 600 }]}>
        <Rua />
        <Ator quem="teo" pose={{ ...teo, expr: "curioso" }} />
        <Ator quem="rose" pose={rose(t)} />
        <Baloes emissor={porRotulo({ mae: daBoca("rose", rose, -1, RUA.calcada, { xChao: 900 }) })} filtro={(b) => b.rotulo === "mae"} />
      </Camera>
    );
  }
  if (t < 3.85) {
    // moça na TV: o balão sai da tela e flutua
    const tvBoca: [number, number] = [1690, 600];
    const moca = { ...parado(1650, 760, 0.42)(t), expr: "sorriso" as const, falando: t > 2.0 && t < 2.9 && Math.sin(t * 40) > 0 };
    const teo = sentado(820, SALA.sofa.assento, 1)(t);
    return (
      <Camera chaves={[{ t: 1.95, z: 1.5, cx: 1450, cy: 560 }, { t: 3.85, z: 1.58, cx: 1450, cy: 560 }]}>
        <Sala />
        <svg x={1550} y={540} width={260} height={170} viewBox="1550 540 260 170"><rect x={1550} y={540} width={260} height={170} fill="#86DDBE" /><Boneco pose={moca} esc={0.42} v={ELENCO.reporter.v} /></svg>
        <Ator quem="teo" pose={{ ...teo, head: { rot: -6, offsetY: 0 } }} />
        <Baloes emissor={porRotulo({ tv: () => ({ boca: tvBoca, lado: -1, chao: SALA.chao, esc: 0.9 }) })} filtro={(b) => b.rotulo === "tv"} />
      </Camera>
    );
  }
  // voz no celular: o Téo com o celular no ouvido; o balão sai do aparelho
  const base = parado(900, Q.chao, 1)(t);
  const cab = pts("teo", base).cabeca;
  const teo: PoseTeo = { ...maoEm(base, "R", [cab[0] - 30, cab[1] + 40], 1), objR: "celular", expr: "serio" };
  const fone = pts("teo", teo).maoR;
  return (
    <Camera chaves={[{ t: 3.85, z: 1.4, cx: 1000, cy: 560 }, { t: 5.9, z: 1.46, cx: 1000, cy: 560 }]}>
      <QuartoFundo pecas={[]} />
      <Ator quem="teo" pose={teo} />
      <QuartoFrente />
      <Baloes emissor={porRotulo({ celular: () => ({ boca: [fone[0] + 20, fone[1] - 50], lado: 1, chao: Q.chao, esc: 0.9 }) })} filtro={(b) => b.rotulo === "celular"} />
    </Camera>
  );
};

// ---------------------------------------------------------------- c1_futuro: flash-forward (delegacia, laje com fogos) e volta
const C1Futuro: React.FC = () => {
  const { t, dur } = usePlano();
  const c1 = 3.1, c2 = 6.2;
  if (t < c1) {
    const teo = sentado(DELEG.xTeo, DELEG.assento, 1, false, DELEG.chao)(t);
    const del = { ...parado(DELEG.xDelegado, DELEG.chao, E("delegado"), true)(t), expr: "serio" as const };
    const sus = { ...sentado(DELEG.xSuspeito, DELEG.assento, E("suspeito"), true, DELEG.chao)(t), expr: "bravo" as const };
    return (
      <Camera chaves={[{ t: 0, z: 1.1, cx: 960, cy: 560 }, { t: c1, z: 1.2, cx: 960, cy: 560 }]} fundo="#B9C7B5">
        <Delegacia />
        <Ator quem="delegado" pose={del} />
        <Cadeira x={DELEG.xTeo - 20} assento={DELEG.assento} chao={DELEG.chao} cor="#6E786A" />
        <Cadeira x={DELEG.xSuspeito + 20} assento={DELEG.assento} chao={DELEG.chao} esq cor="#6E786A" />
        <MesaSimples x0={DELEG.mesa.x0} x1={DELEG.mesa.x1} topo={DELEG.mesa.topo} chao={DELEG.chao} />
        <Ator quem="teo" pose={{ ...teo, expr: "serio" }} />
        <Ator quem="suspeito" pose={sus} />
        <Tinta cor="#5A7A9A" forca={0.5} />
        <Flash t={t} em={[0]} />
      </Camera>
    );
  }
  if (t < c2) {
    const tl = t - c1;
    const pessoas = Array.from({ length: 12 }, (_, i) => ({ q: (["turma1", "turma2", "turma3", "turma4", "vizinho", "maeDudu", "beto", "jorge", "rose", "marta", "dudu", "caco"] as const)[i], x: LAJE.x0 + 80 + i * 88 }));
    return (
      <Camera chaves={[{ t: c1, z: 0.9, cx: 900, cy: 560 }, { t: c2, z: 0.95, cx: 900, cy: 560 }]} fundo="#141C46">
        <LajeFundo t={t} fogos={tl} />
        {pessoas.map(({ q, x }, i) => <Ator key={i} quem={q} pose={{ ...parado(x, LAJE.topo, E(q) * 0.62, i % 2 === 0)(t + i), head: { rot: -14, offsetY: 0 }, expr: "sorriso" }} esc={E(q) * 0.62} />)}
        <CaixaSom x={LAJE.caixa} y={LAJE.topo} ligada t={t} />
        <LajeFrente t={t} />
        <Ator quem="teo" esc={0.62} pose={{ ...parado(LAJE.portao + 120, LAJE.chao, 0.62)(t), head: { rot: -16, offsetY: 0 }, expr: "preocupado" }} />
        <Tinta cor="#9A5A7A" forca={0.45} />
        <Flash t={t} em={[c1]} />
      </Camera>
    );
  }
  const teo = { ...teoMesa(t), objR: null, expr: "serio" as const, head: { rot: 6, offsetY: 0 } };
  const cab = pts("teo", teo).cabeca;
  return (
    <Camera chaves={[{ t: c2, z: 2.4, cx: cab[0] + 40, cy: cab[1] + 60 }, { t: dur + 0.5, z: 2.6, cx: cab[0] + 40, cy: cab[1] + 60 }]}>
      <CenaGaragem t={t} teo={teo} dudu={duduMesa(t)} />
      <Flash t={t} em={[c2]} />
    </Camera>
  );
};

// ---------------------------------------------------------------- c1_moedas
const C1Moedas: React.FC = () => {
  const { t, dur } = usePlano();
  const em = parado(xTeo + 80, CG, 1)(t);
  const morde = sino(t, 2.6, 3.6, 0.25, 0.25);
  const boca = pts("teo", em).boca;
  let teo: PoseTeo = { ...em, arm_upper_L: 40, arm_lower_L: 70, objL: "pote", objR: "pizza", arm_upper_R: 50, arm_lower_R: 60, expr: "rindo" };
  teo = comBracos(teo, maoEm(teo, "R", [boca[0] - 10, boca[1] + 20], 1), morde, "R");
  if (morde > 0.5) teo.expr = "sorriso";
  const dudu = { ...duduMesa(t), objR: null, expr: "triste" as const, head: { rot: 14, offsetY: 0 } };
  return (
    <Camera chaves={[{ t: 0, z: 1.25, cx: 900, cy: 560 }, { t: dur, z: 1.32, cx: 900, cy: 560 }]}>
      <CenaGaragem t={t} teo={rir(teo, t, morde > 0.5 ? 0 : 0.6)} dudu={dudu} pizza={false} pote={false} />
    </Camera>
  );
};

// ---------------------------------------------------------------- c1_livia: o controle grudento
const C1Livia: React.FC = () => {
  const { t, dur, fala, F } = usePlano();
  const anda = andar(1900, 1120, -0.6, CG, E("livia"));
  const livia: Fn = (tt) => ({ ...anda(tt), esq: true, objR: tt < F(0).fim + 0.5 ? "controle" : null, arm_upper_R: 40, arm_lower_R: 50, expr: "sorriso" });
  const teoBase: Fn = (tt) => ({ ...parado(900, CG, 1)(tt), expr: "serio" });
  const lv = livia(t);
  const pega = rampa(t, F(0).fim + 0.2, F(0).fim + 0.6);
  let teo = teoBase(t);
  const mL = pts("livia", livia(Math.min(t, F(0).fim + 0.4))).maoR;
  teo = comBracos(teo, maoEm(teo, "R", [mL[0] - 10, mL[1] - 4], 1), pega, "R");
  if (t > F(0).fim + 0.5) { teo = comBracos(teo, { ...teo, arm_upper_R: 70, arm_lower_R: 60 }, rampa(t, F(0).fim + 0.5, F(0).fim + 0.9), "R"); teo.objR = "controle"; }
  teo.expr = t > F(1).ini + 1.0 ? "bravo" : "curioso";
  const fechado = t > F(1).ini + 0.9;
  return (
    <Camera chaves={[{ t: 0, z: 1.25, cx: 1060, cy: 560 }, { t: dur + 0.4, z: 1.32, cx: 1040, cy: 560 }]}>
      <CenaGaragem t={t} teo={teo} dudu={{ ...duduMesa(t), objR: null }} />
      <Ator quem="livia" pose={lv} fala={fala("livia")} />
      <Baloes emissor={porRotulo({ livia: daBoca("livia", livia, -1, CG) })} />
      {fechado && (
        <Painel x={1120} y={70} w={640} h={420} desde={F(1).ini + 0.9} fundo="#F3D9B1">
          <g transform="translate(320 200) scale(4)">
            <rect x={-34} y={-24} width={68} height={36} rx={16} fill="#2E2A5C" stroke={LINHA} strokeWidth={2} />
            <circle cx={16} cy={-8} r={5} fill="#E23B2E" /><circle cx={-16} cy={-8} r={5} fill="#86DDBE" />
            {[0, 1, 2, 3].map((i) => <path key={i} d={`M ${-22 + i * 13} 6 q 2 ${6 + ((t * 3 + i) % 1) * 10} 0 ${10 + ((t * 3 + i) % 1) * 14}`} stroke="#8A3FA0" strokeWidth={4} fill="none" strokeLinecap="round" />)}
            <path d="M -30 -2 q 20 14 52 4" stroke="#8A3FA0" strokeWidth={5} fill="none" opacity={0.85} />
          </g>
          <g transform="translate(150 330) rotate(-20) scale(1.6)"><circle r={20} fill="#C9895E" stroke={LINHA} strokeWidth={5} /></g>
        </Painel>
      )}
    </Camera>
  );
};

// ---------------------------------------------------------------- c1_titulo
const C1Titulo: React.FC = () => {
  const { t } = usePlano();
  const teo = { ...parado(960, 1070, 0.7)(t), head: { rot: 10, offsetY: 0 }, expr: "curioso" as const };
  const sobe = (t * 0.25) % 1;
  return (
    <Camera chaves={[{ t: 0, z: 1, cx: 960, cy: 540 }]} fundo="#6A5FD0">
      <rect x={-400} y={-400} width={2800} height={1900} fill="#6A5FD0" />
      <Titulo linhas={["JÁ IMAGINOU SE VOCÊ PUDESSE", "VER QUEM ESTÁ MENTINDO", "PRA VOCÊ?"]} desde={0.15} y={360} tam={92} />
      <Boneco pose={teo} esc={0.7} />
      <NoChao itens={[{ x: 1150, chao: 1070, esc: 0.8 }, { x: 760, chao: 1070, esc: 0.7, rot: 8 }]} />
      <g transform={`translate(1350 ${900 - sobe * 500}) scale(0.8)`} opacity={1 - sobe}><rect x={-85} y={-54} width={170} height={108} rx={44} fill="#FBFBF7" stroke={LINHA} strokeWidth={7} /></g>
    </Camera>
  );
};

export const CAP1: Record<string, React.FC> = {
  c1_truco: C1Truco, c1_viu: C1Viu, c1_corro: C1Corro, c1_grita: C1Grita, c1_montagem: C1Montagem, c1_futuro: C1Futuro, c1_moedas: C1Moedas, c1_livia: C1Livia, c1_titulo: C1Titulo,
};

