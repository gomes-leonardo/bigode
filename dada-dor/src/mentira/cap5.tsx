// Capítulo 5: Quando isso importa.
import React from "react";
import { Consultorio, CONSULTORIO, COZINHA, Cozinha, LADEIRA_ANG, Ladeira, ladeiraY, Liso, MesaCozinha, Rua, RUA, Cadeira as CadeiraCozinha } from "../teo/cenarios";
import { Ator, Camera, E, Impacto, Painel, pts, usePlano, V } from "../teo/kit";
import { andar, base, comBracos, maoEm, mix, parado, rampa, rir, sentado, sino, type Fn } from "../teo/motor";
import { sentadoChao } from "../teo/cap4";
import { LINHA, type PoseTeo } from "../teo/tira";
import { Baloes } from "./balao";
import { Cadeira, Celular, DELEG, Delegacia, Galpao, GALPAO, MesaSimples } from "./cenarios";
import { daBoca, porRotulo } from "./comum";

// ---------------------------------------------------------------- c5_delegacia
const { chao: CD, mesa: MD, assento: AD } = DELEG;
const suspeito: Fn = (t) => ({ ...sentado(DELEG.xSuspeito, AD, E("suspeito"), true, CD)(t), arm_upper_R: 30, arm_lower_R: 100, arm_upper_L: 26, arm_lower_L: 104, expr: "serio" });
const teoDel: Fn = (t) => ({ ...sentado(DELEG.xTeo, AD, 1, false, CD)(t), expr: "serio" });
const emissorDel = (b: { k: number; fala: number | null; rotulo: string | null }, t: number) =>
  b.rotulo === "suspeito" ? daBoca("suspeito", suspeito, -1, CD, { xChao: b.fala === 1 ? 1250 : 1140 })(t) : null;
const C5Delegacia: React.FC = () => {
  const { t, dur, fala, F } = usePlano();
  const del = { ...parado(DELEG.xDelegado, CD, E("delegado"), true)(t), arm_upper_R: 30, arm_lower_R: 30, expr: "serio" as const, torso: { ...parado(DELEG.xDelegado, CD, E("delegado"), true)(t).torso, rot: 8 } };
  let rose: PoseTeo = { ...parado(DELEG.xRose, CD, E("rose"))(t), expr: "preocupado" };
  rose = comBracos(rose, maoEm(rose, "R", pts("teo", teoDel(t)).ombro, E("rose"), V("rose")), 1, "R");
  let teo = teoDel(t);
  teo = { ...teo, head: { rot: -4 + 6 * Math.sin(t * 0.7), offsetY: 0 } };
  const sus = { ...suspeito(t), expr: (t > F(5).ini ? "serio" : "bravo") as PoseTeo["expr"] };
  return (
    <Camera chaves={[{ t: 0, z: 1.0, cx: 960, cy: 540 }, { t: F(1).ini - 0.2, z: 1.06, cx: 960, cy: 540 }, { t: F(1).ini + 0.3, z: 1.45, cx: 1180, cy: 560 }, { t: F(5).fim, z: 1.5, cx: 1180, cy: 560 }, { t: F(6).ini, z: 1.25, cx: 900, cy: 560 }, { t: dur, z: 1.28, cx: 900, cy: 560 }]}>
      <Delegacia />
      <Ator quem="delegado" pose={del} />
      <Cadeira x={DELEG.xTeo - 20} assento={AD} chao={CD} cor="#6E786A" />
      <Cadeira x={DELEG.xSuspeito + 20} assento={AD} chao={CD} esq cor="#6E786A" />
      <MesaSimples x0={MD.x0} x1={MD.x1} topo={MD.topo} chao={CD} />
      <Ator quem="rose" pose={rose} />
      <Ator quem="teo" pose={teo} />
      <Ator quem="suspeito" pose={sus} fala={fala("suspeito")} />
      <Baloes emissor={emissorDel as never} />
    </Camera>
  );
};
// ---------------------------------------------------------------- c5_galpao
const C5Galpao: React.FC = () => {
  const { t, dur } = usePlano();
  const puxa = rampa(t, 1.0, 2.2, (x) => x * x);
  const x0 = GALPAO.carro - 420;
  let del = parado(x0, GALPAO.chao, E("delegado"))(t);
  del = comBracos(del, { ...del, arm_upper_R: 70, arm_lower_R: 10, arm_upper_L: 60, arm_lower_L: 10, torso: { ...del.torso, rot: -10 } }, sino(t, 0.6, 2.0, 0.3, 0.3));
  del.expr = t > 2.0 ? "sorriso" : "serio";
  return (
    <Camera chaves={[{ t: 0, z: 1.0, cx: 960, cy: 560 }, { t: dur, z: 1.1, cx: 980, cy: 580 }]}>
      <Galpao lona={puxa} />
      <Ator quem="delegado" pose={{ ...del, esq: false, torso: { ...del.torso, x: x0 - 140 * puxa } }} />
    </Camera>
  );
};
// ---------------------------------------------------------------- c5_audio: o áudio do "primo"
const { chao: CZ, mesa: MZ } = COZINHA;
const CEL: [number, number] = [MZ.x0 + 220, MZ.topo - 8];
const voSentada: Fn = (t) => {
  const p = sentado(MZ.x0 - 40, 770, E("cida"), false, CZ)(t);
  return { ...maoEm(p, "R", [MZ.x0 + 120, MZ.topo - 8], E("cida"), V("cida")), expr: "preocupado" };
};
const Laptop: React.FC<{ t: number }> = ({ t }) => (
  <g>
    <g transform="translate(150 230)"><rect x={-90} y={-110} width={180} height={120} rx={8} fill="#3A3A48" stroke={LINHA} strokeWidth={5} /><rect x={-76} y={-96} width={152} height={92} fill="#86DDBE" /><path d="M -110 10 L 110 10 L 130 30 L -130 30 Z" fill="#9AA0A8" stroke={LINHA} strokeWidth={5} /></g>
    {Array.from({ length: 12 }, (_, i) => <rect key={i} x={260 + i * 16} y={200 - 30 * Math.abs(Math.sin(t * 6 + i))} width={8} height={60 * Math.abs(Math.sin(t * 6 + i)) + 6} fill="#3B6FD6" />)}
    <g transform="translate(560 210)"><circle r={56} fill="#C9895E" stroke={LINHA} strokeWidth={5} /><path d="M -56 -10 Q -40 -76 20 -64 Q 60 -50 56 -10 Z" fill="#151515" /><circle cx={-16} cy={0} r={6} fill={LINHA} /><circle cx={18} cy={0} r={6} fill={LINHA} /><path d="M -16 30 Q 0 40 16 30" stroke={LINHA} strokeWidth={5} fill="none" /></g>
  </g>
);
const C5Audio: React.FC = () => {
  const { t, dur, fala, F, S } = usePlano();
  const tApita = S("plim");
  const vo = voSentada(t);
  const teo = { ...parado(MZ.x1 + 160, CZ, 1, true)(t), head: { rot: 12, offsetY: 0 }, expr: (t > F(1).ini ? "serio" : "curioso") as PoseTeo["expr"] };
  const tela = t > tApita;
  const fala1 = fala("audio");
  const emissor = porRotulo({ audio: () => ({ boca: [CEL[0] + 20, CEL[1] - 26], lado: 1, chao: MZ.topo, esc: 1, xChao: MZ.x1 - 110 }) });
  const painel = F(2).ini + F(2).dur * 0.3;
  return (
    <Camera chaves={[{ t: 0, z: 1.25, cx: 960, cy: 560 }, { t: F(1).ini, z: 1.45, cx: 980, cy: 600 }, { t: dur, z: 1.5, cx: 990, cy: 600 }]}>
      <Cozinha t={t} semPanela />
      <CadeiraCozinha x={MZ.x0 - 40} assento={770} chao={CZ} />
      <Ator quem="cida" pose={vo} />
      <MesaCozinha />
      <g transform={`translate(${CEL[0]} ${CEL[1]})`}>
        <rect x={-40} y={-14} width={80} height={14} rx={4} fill="#2A2A35" stroke={LINHA} strokeWidth={4} />
        {tela && <rect x={-34} y={-12} width={68} height={8} rx={2} fill={fala1 ? "#86DDBE" : "#3FAF63"} />}
        {tela && t < tApita + 0.6 && [0, 1, 2].map((i) => <path key={i} d={`M ${-50 - i * 14} -30 q -10 -14 0 -28 M ${50 + i * 14} -30 q 10 -14 0 -28`} stroke={LINHA} strokeWidth={4} fill="none" />)}
        {fala1 && Array.from({ length: 7 }, (_, i) => <rect key={i} x={-30 + i * 9} y={-40 - 12 * Math.abs(Math.sin(t * 10 + i))} width={5} height={24 * Math.abs(Math.sin(t * 10 + i)) + 4} fill="#3B6FD6" />)}
      </g>
      <Ator quem="teo" pose={teo} />
      <Baloes emissor={emissor} />
      {t > painel && t < F(2).fim - 1.2 && <Painel x={1140} y={120} w={700} h={330} desde={painel} fundo="#FFF6E0"><Laptop t={t} /></Painel>}
    </Camera>
  );
};
// ---------------------------------------------------------------- c5_cachorro: a pergunta digitada
const C5Cachorro: React.FC = () => {
  const { t, dur, F } = usePlano();
  const d1 = F(1).ini, d = F(1).dur;
  const tVisto = d1 + 0.2, tBloq = d1 + d * 0.18, tVo = d1 + d * 0.4;
  if (t < tVo) {
    const digitado = rampa(t, 0.2, F(0).fim, (x) => x);
    return (
      <Camera chaves={[{ t: 0, z: 1, cx: 960, cy: 540 }]} fundo="#86DDBE">
        <Liso cor="#86DDBE" padrao="#7ACFB2" />
        <Celular fundo="#EDE6DA">
          <rect width={580} height={90} fill="#3FAF63" />
          <circle cx={60} cy={45} r={28} fill="#C9895E" stroke="#FBFBF7" strokeWidth={4} />
          {t > tBloq && <g transform="translate(60 45)"><circle r={34} fill="none" stroke="#E23B2E" strokeWidth={8} /><line x1={-24} y1={24} x2={24} y2={-24} stroke="#E23B2E" strokeWidth={8} /></g>}
          {/* áudio recebido */}
          <rect x={24} y={130} width={360} height={84} rx={20} fill="#FBFBF7" stroke={LINHA} strokeWidth={3} />
          <path d="M 60 172 l 0 -20 l 18 10 Z" fill="#3B6FD6" />
          {Array.from({ length: 18 }, (_, i) => <rect key={i} x={100 + i * 14} y={172 - 4 - ((i * 7) % 13)} width={6} height={8 + ((i * 7) % 13) * 2} fill="#9AA0A8" />)}
          {/* a pergunta do Téo, sem texto: rabiscos */}
          {digitado > 0 && (
            <g>
              <rect x={170} y={260} width={386} height={110} rx={20} fill="#C8F0C0" stroke={LINHA} strokeWidth={3} />
              <path d="M 200 300 q 20 -14 40 0 t 40 0 t 40 0 t 40 0 t 40 0 t 40 0 t 40 0" stroke={LINHA} strokeWidth={6} fill="none" strokeDasharray={`${digitado * 320} 400`} />
              <path d="M 200 336 q 20 -14 40 0 t 40 0 t 40 0" stroke={LINHA} strokeWidth={6} fill="none" strokeDasharray={`${Math.max(0, digitado - 0.6) * 300} 400`} />
              {t > tVisto && <g stroke="#3B6FD6" strokeWidth={6} fill="none"><path d="M 490 352 l 8 8 l 14 -16" /><path d="M 506 352 l 8 8 l 14 -16" /></g>}
            </g>
          )}
          {/* teclado */}
          <rect x={0} y={600} width={580} height={280} fill="#D0D6DC" />
          {Array.from({ length: 30 }, (_, i) => <rect key={i} x={14 + (i % 10) * 56} y={620 + Math.floor(i / 10) * 66} width={48} height={54} rx={8} fill={Math.floor(t * 8) % 30 === i && t < F(0).fim ? "#9AA0A8" : "#FBFBF7"} />)}
        </Celular>
      </Camera>
    );
  }
  const vo = { ...parado(1000, CZ, E("cida"), true)(t), expr: "sorriso" as const };
  const teo = { ...parado(820, CZ, 1)(t), expr: "sorriso" as const };
  const abraco = comBracos(vo, maoEm(maoEm(vo, "R", pts("teo", teo).peito, E("cida"), V("cida")), "L", [pts("teo", teo).ombro[0] + 10, pts("teo", teo).ombro[1] + 10], E("cida"), V("cida")), rampa(t, tVo, tVo + 0.4));
  return (
    <Camera chaves={[{ t: tVo, z: 1.4, cx: 920, cy: 520 }, { t: dur + 0.5, z: 1.5, cx: 920, cy: 520 }]}>
      <Cozinha t={t} semPanela />
      <Ator quem="teo" pose={teo} />
      <Ator quem="cida" pose={{ ...abraco, torso: { ...abraco.torso, rot: 10 } }} />
    </Camera>
  );
};
// ---------------------------------------------------------------- c5_bike: cai na ladeira e levanta rindo
const RODA = 52;
const Bike: React.FC<{ x: number; y: number; ang: number; giro?: number }> = ({ x, y, ang, giro = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${ang + giro})`}>
    {[-80, 80].map((dx, i) => <g key={i}><circle cx={dx} cy={-RODA} r={RODA} fill="none" stroke={LINHA} strokeWidth={10} /><circle cx={dx} cy={-RODA} r={6} fill={LINHA} /></g>)}
    <path d={`M -80 ${-RODA} L -10 ${-RODA} L 30 ${-RODA - 70} L -40 ${-RODA - 70} Z M 30 ${-RODA - 70} L 80 ${-RODA} M -40 ${-RODA - 70} L -50 ${-RODA - 90}`} stroke="#E23B2E" strokeWidth={10} fill="none" strokeLinejoin="round" />
    <rect x={-70} y={-RODA - 100} width={46} height={12} rx={6} fill="#2A2A35" />
    <path d={`M 30 ${-RODA - 70} L 40 ${-RODA - 110} L 64 ${-RODA - 114}`} stroke={LINHA} strokeWidth={8} fill="none" strokeLinecap="round" />
  </g>
);
const C5Bike: React.FC = () => {
  const { t, f, fps, dur, fala, S } = usePlano();
  const tQ = S("queda");
  const ar = (LADEIRA_ANG * Math.PI) / 180;
  const xb = -150 + Math.min(t, tQ) * 520;
  const yb = ladeiraY(xb);
  // pilotando: quadril no selim, mãos no guidão, pés nos pedais (tudo girado com a ladeira)
  const selim: [number, number] = [xb - 47 * Math.cos(ar) + (RODA + 100) * Math.sin(ar), yb - 47 * Math.sin(ar) - (RODA + 100) * Math.cos(ar)];
  let dudu: PoseTeo;
  const xCai = -150 + tQ * 520 + 120;
  const chaoCai = ladeiraY(xCai);
  if (t < tQ) {
    const p = { ...base(selim[0], selim[1] - 6), giro: LADEIRA_ANG, expr: "rindo" as const };
    const ped = Math.sin(t * 10);
    dudu = { ...p, leg_upper_R: 60 + 20 * ped, leg_lower_R: -70 - 10 * ped, leg_upper_L: 60 - 20 * ped, leg_lower_L: -70 + 10 * ped, arm_upper_R: 70, arm_lower_R: 10, arm_upper_L: 64, arm_lower_L: 10, torso: { ...p.torso, rot: 20 } };
  } else {
    const chao = sentadoChao(xCai, chaoCai, E("dudu"))(t);
    const caido = { ...chao, giro: LADEIRA_ANG, expr: "surpreso" as const };
    const de = { ...base(selim[0], selim[1] - 6), giro: LADEIRA_ANG + 40 };
    const levanta = parado(xCai + 40, chaoCai, E("dudu"))(t);
    dudu = t < tQ + 0.35 ? mix(de, caido, rampa(t, tQ, tQ + 0.35)) : t < tQ + 1.2 ? caido : mix(caido, { ...levanta, giro: 0 }, rampa(t, tQ + 1.2, tQ + 1.7));
    if (t > tQ + 1.5) dudu = rir({ ...dudu, expr: "rindo" }, t, 1);
  }
  const duduLev: Fn = (tt) => ({ ...parado(xCai + 40, chaoCai, E("dudu"))(tt), expr: "sorriso" });
  const teo = andar(1500, xCai + 260, tQ + 0.4, ladeiraY(1500) - 0, 1)(t);
  const teoY = { ...teo, torso: { ...teo.torso, y: ladeiraY(teo.torso.x) - 186 } };
  return (
    <Camera chaves={[{ t: 0, z: 1.0, cx: 760, cy: 560 }, { t: tQ, z: 1.15, cx: xCai + 120, cy: chaoCai - 220 }, { t: dur, z: 1.25, cx: xCai + 140, cy: chaoCai - 220 }]} tremores={[tQ]}>
      <Ladeira />
      <Bike x={t < tQ ? xb : xCai - 160} y={t < tQ ? yb : ladeiraY(xCai - 160)} ang={LADEIRA_ANG} giro={t < tQ ? 0 : -78} />
      <Ator quem="dudu" pose={dudu} fala={fala("dudu")} />
      {t > tQ + 0.4 && <Ator quem="teo" pose={{ ...teoY, esq: true, expr: "preocupado" }} />}
      <Impacto x={xCai} y={chaoCai - 30} d={f - Math.round(tQ * fps)} raio={50} />
      <Baloes emissor={porRotulo({ dudu: daBoca("dudu", duduLev, 1, chaoCai + 30, { xChao: xCai + 210 }) })} />
    </Camera>
  );
};
// ---------------------------------------------------------------- c5_guia: senta na guia, liga pra mãe; no consultório
const C5Guia: React.FC = () => {
  const { t, dur, fala, F } = usePlano();
  const corte = F(1).ini - 0.35;
  if (t < corte) {
    let dudu: PoseTeo = { ...sentado(RUA.guia - 60, RUA.calcada + 6, E("dudu"), false, RUA.rua)(t), expr: "triste" };
    dudu = comBracos(dudu, maoEm(dudu, "R", pts("dudu", dudu).testa, E("dudu"), V("dudu")), 1, "R");
    const base0 = parado(RUA.guia - 260, RUA.calcada, 1)(t);
    const cab = pts("teo", base0).cabeca;
    const teo = { ...maoEm(base0, "R", [cab[0] - 30, cab[1] + 40], 1), objR: "celular" as const, expr: "preocupado" as const, falando: t > 1.6 && t < 4.6 && Math.sin(t * 40) > 0 };
    return (
      <Camera chaves={[{ t: 0, z: 1.3, cx: RUA.guia - 220, cy: 640 }, { t: corte, z: 1.36, cx: RUA.guia - 220, cy: 640 }]}>
        <Rua />
        <Ator quem="teo" pose={teo} />
        <Ator quem="dudu" pose={dudu} />
      </Camera>
    );
  }
  const { maca, chao } = CONSULTORIO;
  const dudu = { ...sentado(900, maca.assento, E("dudu"))(t), expr: "triste" as const };
  const helena: Fn = (tt) => ({ ...parado(1240, chao, E("helena"), true)(tt), objL: "prancheta", arm_upper_L: 40, arm_lower_L: 70, expr: "sorriso" });
  const mae = { ...parado(520, chao, E("maeDudu"))(t), expr: "preocupado" as const };
  const teo = { ...parado(360, chao, 1)(t), expr: "preocupado" as const };
  return (
    <Camera chaves={[{ t: corte, z: 1.1, cx: 900, cy: 540 }, { t: dur + 0.5, z: 1.15, cx: 900, cy: 540 }]}>
      <Consultorio />
      <Ator quem="teo" pose={teo} />
      <Ator quem="maeDudu" pose={mae} />
      <Ator quem="dudu" pose={dudu} />
      <Ator quem="helena" pose={helena(t)} fala={fala("helena")} />
      <Baloes emissor={porRotulo({ helena: daBoca("helena", helena, -1, chao) })} />
    </Camera>
  );
};

export const CAP5: Record<string, React.FC> = { c5_delegacia: C5Delegacia, c5_galpao: C5Galpao, c5_audio: C5Audio, c5_cachorro: C5Cachorro, c5_bike: C5Bike, c5_guia: C5Guia };

