// Capítulo 6: O preço.
import React from "react";
import { COZINHA, Cozinha, Liso } from "../teo/cenarios";
import { Q, QuartoFrente, QuartoFundo } from "../teo/Quarto";
import { ELENCO, type NomeElenco } from "../teo/elenco";
import { Ator, Camera, E, Noite, Painel, pts, usePlano, V } from "../teo/kit";
import { andar, comBracos, deitado, maoEm, parado, rampa, sentado, type Fn } from "../teo/motor";
import { Boneco, LINHA, type PoseTeo } from "../teo/tira";
import { Baloes, NoChao } from "./balao";
import { Cadeira, Celular, FEIRA, FeiraBalcao, FeiraFundo, QDUDU, QuartoDudu, Sala, SALA } from "./cenarios";
import { caidosDe, daBoca, porRotulo, Suor } from "./comum";

const { chao: CS, sofa } = SALA;

// ---------------------------------------------------------------- c6_blusa: a blusa da vó
const Presente: React.FC<{ x: number; y: number; aberto: number }> = ({ x, y, aberto }) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={-60} y={-80} width={120} height={80} rx={6} fill="#3B6FD6" stroke={LINHA} strokeWidth={5} />
    <rect x={-10} y={-80} width={20} height={80} fill="#FFD23F" />
    <g transform={`translate(0 ${-80 - aberto * 70}) rotate(${-aberto * 30})`}><rect x={-66} y={-18} width={132} height={20} rx={4} fill="#3B6FD6" stroke={LINHA} strokeWidth={5} /><path d="M -10 -18 q -30 -30 -4 -30 q 14 0 14 26 q 0 -26 14 -26 q 26 0 -4 30 Z" fill="#FFD23F" stroke={LINHA} strokeWidth={4} /></g>
  </g>
);
const voSofa: Fn = (t) => ({ ...sentado(720, sofa.assento, E("cida"))(t), expr: "sorriso" });
const teoBlusa: Fn = (t) => ({ ...parado(1080, CS, 1, true)(t), expr: "serio" });
const C6Blusa: React.FC = () => {
  const { t, dur, fala, F } = usePlano();
  const abre = rampa(t, 2.0, 2.6);
  let teo = teoBlusa(t);
  const peito = pts("teo", teo).peito;
  const segura = maoEm(maoEm(teo, "R", [peito[0] - 70, peito[1] - 10], 1), "L", [peito[0] - 60, peito[1] - 4], 1);
  teo = { ...segura, expr: t > F(1).ini - 0.2 && t < F(1).fim + 0.2 ? "sorriso" : t > F(1).fim ? "surpreso" : "serio" };
  if (t > 2.6) teo = { ...teo, objR: "blusa" };
  if (t > F(1).fim + 0.4) teo = { ...teo, head: { rot: 16, offsetY: 0 } };
  const vo = voSofa(t);
  const m = pts("teo", teo).maoR;
  const cab = pts("teo", teo).cabeca;
  return (
    <Camera chaves={[{ t: 0, z: 1.2, cx: 900, cy: 560 }, { t: F(1).ini - 0.1, z: 1.25, cx: 920, cy: 560 }, { t: F(1).ini, z: 1.55, cx: 1080, cy: 640 }, { t: dur, z: 1.6, cx: 1080, cy: 640 }]}>
      <Sala parede="#F2D7DE" sofa="#B4733F" tv={false} />
      <Ator quem="cida" pose={vo} />
      <Ator quem="teo" pose={teo} fala={fala("teo")} />
      {t < 2.6 && <Presente x={m[0] - 10} y={m[1] + 20} aberto={abre} />}
      {t > F(1).ini && t < F(1).fim + 0.3 && <Suor x={cab[0]} y={cab[1]} t={t} r={70} lado={1} />}
      <Baloes emissor={porRotulo({ teo: daBoca("teo", teoBlusa, 1, CS, { xChao: 1160 }) })} />
    </Camera>
  );
};
// ---------------------------------------------------------------- c6_rose: tô bem, filho
const Bolsa: React.FC<{ x: number; y: number }> = ({ x, y }) => <g transform={`translate(${x} ${y})`}><path d="M -10 -60 Q 20 -110 50 -60" stroke={LINHA} strokeWidth={6} fill="none" /><rect x={-24} y={-60} width={90} height={64} rx={10} fill="#7A4E9A" stroke={LINHA} strokeWidth={5} /></g>;
const roseChega: Fn = (t) => {
  const a = andar(SALA.porta - 120, 1180, -0.6, CS, E("rose"))(t);
  return { ...a, esq: true, cansado: 1, expr: "sorriso", arm_upper_L: 12, arm_lower_L: 20 };
};
const C6Rose: React.FC = () => {
  const { t, dur, fala } = usePlano();
  const rose = roseChega(t);
  const ombro = pts("rose", rose).ombro;
  const teo = { ...sentado(760, sofa.assento, 1)(t), expr: "serio" as const, head: { rot: -4, offsetY: 0 } };
  return (
    <Camera chaves={[{ t: 0, z: 1.3, cx: 1100, cy: 560 }, { t: dur, z: 1.38, cx: 1140, cy: 580 }]}>
      <Sala porta={1} noite />
      <Ator quem="teo" pose={teo} />
      <Ator quem="rose" pose={rose} fala={fala("rose")} />
      <Bolsa x={ombro[0] - 20} y={ombro[1] + 120} />
      <Baloes emissor={porRotulo({ rose: daBoca("rose", roseChega, -1, CS) })} />
    </Camera>
  );
};
// ---------------------------------------------------------------- c6_violao
const { chao: CQ, cama, cadeira: XCAD, assento: AQ } = QDUDU;
const duduCama: Fn = (t) => ({ ...sentado(1180, cama.topo, E("dudu"), true)(t), expr: "sorriso" });
const teoCadeira: Fn = (t) => ({ ...sentado(XCAD, AQ, 1, false, CQ)(t), expr: "serio" });
const Violao: React.FC<{ p: PoseTeo }> = ({ p }) => {
  const q = pts("dudu", p);
  const corpo: [number, number] = [q.joelhoR[0] + 20, q.joelhoR[1] - 30];
  return (
    <g>
      <line x1={corpo[0]} y1={corpo[1]} x2={corpo[0] - 230} y2={corpo[1] - 70} stroke="#8A5A3A" strokeWidth={16} strokeLinecap="round" />
      <ellipse cx={corpo[0] + 14} cy={corpo[1] + 6} rx={64} ry={48} fill="#E9A66E" stroke={LINHA} strokeWidth={6} transform={`rotate(-16 ${corpo[0]} ${corpo[1]})`} />
      <circle cx={corpo[0]} cy={corpo[1]} r={14} fill="#3A2A20" />
    </g>
  );
};
const emissorViolao = porRotulo({ dudu: daBoca("dudu", duduCama, -1, CQ), teo: daBoca("teo", teoCadeira, 1, CQ, { xChao: 880 }) });
const C6Violao: React.FC = () => {
  const { t, dur, fala, F } = usePlano();
  let dudu = duduCama(t);
  const q = pts("dudu", dudu);
  const corpo: [number, number] = [q.joelhoR[0] + 20, q.joelhoR[1] - 30];
  dudu = maoEm(maoEm(dudu, "R", [corpo[0] + 4, corpo[1] + Math.sin(t * 14) * 8 * (t < F(0).ini ? 1 : 0)], E("dudu"), V("dudu")), "L", [corpo[0] - 200, corpo[1] - 64], E("dudu"), V("dudu"));
  dudu = { ...dudu, expr: t > F(2).ini + 0.6 ? "triste" : t > F(1).fim ? "curioso" : "sorriso" };
  const teo = { ...teoCadeira(t), expr: (t > F(1).ini - 0.1 && t < F(2).ini + 0.5 ? "sorriso" : t > F(2).ini ? "preocupado" : "serio") as PoseTeo["expr"] };
  const cab = pts("teo", teo).cabeca;
  return (
    <Camera chaves={[{ t: 0, z: 1.2, cx: 980, cy: 600 }, { t: F(2).ini, z: 1.25, cx: 980, cy: 600 }, { t: F(2).ini + 0.6, z: 1.6, cx: 880, cy: 640 }, { t: dur, z: 1.65, cx: 880, cy: 640 }]}>
      <QuartoDudu />
      <Cadeira x={XCAD - 20} assento={AQ} chao={CQ} cor="#3FAF63" />
      <Ator quem="teo" pose={teo} fala={fala("teo")} />
      <Ator quem="dudu" pose={dudu} fala={fala("dudu")} />
      <Violao p={duduCama(t)} />
      {t > F(1).ini && <Suor x={cab[0]} y={cab[1]} t={t} r={70} lado={-1} />}
      <Baloes emissor={emissorViolao} />
    </Camera>
  );
};
// ---------------------------------------------------------------- c6_conviver: o painel das mentirinhas gentis
const C6Conviver: React.FC = () => {
  const { t, F } = usePlano();
  const quina = F(0).ini + F(0).dur * 0.72;
  const a: PoseTeo = { ...parado(780, 900, 1.1)(t), expr: "sorriso" };
  const b: PoseTeo = { ...parado(1140, 900, 1.1, true)(t), expr: "sorriso" };
  const meio: [number, number] = [960, 640];
  const aperta = t < quina ? 1 : 0;
  const A = aperta ? maoEm(a, "R", [meio[0] - 8, meio[1]], 1.1, ELENCO.jorge.v) : { ...a, esq: true, expr: "bravo" as const };
  const B = aperta ? maoEm(b, "R", [meio[0] + 8, meio[1]], 1.1, ELENCO.vizinho.v) : { ...b, esq: false, expr: "bravo" as const };
  const emissor = porRotulo({ painel: () => ({ boca: [960, 420], lado: 1, chao: 900, esc: 0.6, xChao: 960 }) });
  return (
    <Camera chaves={[{ t: 0, z: 1, cx: 960, cy: 540 }]} fundo="#2E3A6A">
      <Liso cor="#2E3A6A" padrao="#34407A" />
      <Painel x={360} y={110} w={1200} h={860} desde={0.05} fundo="#FFF6E0">
        <g transform="translate(-360 -110)">
          <rect x={360} y={900} width={1200} height={70} fill="#E8DCC4" />
          <line x1={360} y1={900} x2={1560} y2={900} stroke={LINHA} strokeWidth={8} />
          <Boneco pose={A} esc={1.1} v={ELENCO.jorge.v} />
          <Boneco pose={B} esc={1.1} v={ELENCO.vizinho.v} />
          <Baloes emissor={emissor} />
          {!aperta && <path d="M 900 360 l 30 40 l -30 30 l 40 30 l -20 40 l 50 20 l -30 40" stroke="#E23B2E" strokeWidth={12} fill="none" strokeLinejoin="miter" />}
        </g>
      </Painel>
    </Camera>
  );
};
// ---------------------------------------------------------------- c6_crianca: "não fui eu"
const TODOS: NomeElenco[] = ["rose", "jorge", "caco", "cida", "dudu", "marta", "vendedor", "helena", "beto", "livia", "nelson", "vizinho"];
const C6Crianca: React.FC = () => {
  const { t, F } = usePlano();
  const d = F(0).dur, i0 = F(0).ini;
  const tCerebro = i0 + d * 0.22, tTodos = i0 + d * 0.5, tTeo = i0 + d * 0.72;
  if (t < tCerebro) {
    const crianca: Fn = (tt) => ({ ...parado(880, CS, E("crianca"))(tt), chocolate: true, expr: "sorriso", falando: tt > 0.4 && tt < 1.0 && Math.sin(tt * 40) > 0, head: { rot: Math.sin(tt * 3) * 6, offsetY: 0 } });
    return (
      <Camera chaves={[{ t: 0, z: 1.9, cx: 900, cy: 760 }, { t: tCerebro, z: 2.0, cx: 900, cy: 760 }]}>
        <Sala />
        <Ator quem="crianca" pose={crianca(t)} />
        <path d={`M 1000 ${CS - 4} l 50 -10 l 40 8 l -40 10 Z`} fill="#6B3E1F" stroke={LINHA} strokeWidth={4} />
        <Baloes emissor={porRotulo({ crianca: daBoca("crianca", crianca, 1, CS, { esc: 0.75, xChao: 1010 }) })} />
      </Camera>
    );
  }
  if (t < tTodos) {
    const k = rampa(t, tCerebro, tTodos - 0.3);
    return (
      <Camera chaves={[{ t: tCerebro, z: 1, cx: 960, cy: 540 }]} fundo="#86DDBE">
        <Liso cor="#86DDBE" padrao="#7ACFB2" />
        <g transform={`translate(960 540) scale(${0.6 + 0.6 * k})`}>
          <path d="M -200 0 Q -220 -170 -40 -190 Q 120 -230 200 -90 Q 260 40 140 110 Q 0 170 -120 110 Q -230 80 -200 0 Z" fill="#F0A3B4" stroke={LINHA} strokeWidth={10} />
          <path d="M -120 -60 Q -60 -120 0 -60 Q 60 0 120 -60 M -140 30 Q -60 -20 20 40 Q 90 90 160 20" stroke="#C9687E" strokeWidth={10} fill="none" />
          {[0, 1, 2, 3].map((i) => <path key={i} transform={`translate(${Math.cos(i * 1.7 + t * 2) * 260} ${Math.sin(i * 1.7 + t * 2) * 200}) scale(0.8)`} d="M 0 -20 L 6 -6 L 21 -6 L 9 3 L 13 18 L 0 9 L -13 18 L -9 3 L -21 -6 L -6 -6 Z" fill="#FFD23F" stroke={LINHA} strokeWidth={3} />)}
        </g>
      </Camera>
    );
  }
  if (t < tTeo) {
    return (
      <Camera chaves={[{ t: tTodos, z: 1, cx: 960, cy: 540 }]} fundo="#F2A65A">
        <Liso cor="#F2A65A" padrao="#E89A4E" />
        {TODOS.map((q, i) => {
          const x = 220 + (i % 6) * 300, chao = i < 6 ? 560 : 1000;
          const e = 0.62;
          return <g key={q}><Ator quem={q} pose={{ ...parado(x, chao, e * E(q), i % 2 === 1)(t + i), expr: "sorriso" }} esc={e * E(q)} /><NoChao itens={[{ x: x + (i % 2 ? -80 : 80), chao, esc: 0.55 }]} /></g>;
        })}
      </Camera>
    );
  }
  const base = parado(960, 1000, 1.5)(t);
  const cab = pts("teo", base).cabeca;
  const teo = maoEm(maoEm({ ...base, expr: "preocupado" }, "R", [cab[0] + 30, cab[1] + 4], 1.5), "L", [cab[0] + 50, cab[1] - 6], 1.5);
  return (
    <Camera chaves={[{ t: tTeo, z: 1.2, cx: cab[0] + 20, cy: cab[1] + 160 }]} fundo="#2E3A6A">
      <Liso cor="#2E3A6A" padrao="#34407A" />
      <Boneco pose={teo} esc={1.5} />
      <NoChao itens={[{ x: 760, chao: 1000, esc: 1 }, { x: 1180, chao: 1000, esc: 0.9 }]} />
    </Camera>
  );
};
// ---------------------------------------------------------------- c6_segredo
const duduSegredo: Fn = (t) => ({ ...sentado(1180, cama.topo, E("dudu"), true)(t), expr: "serio" });
const C6Segredo: React.FC = () => {
  const { t, dur, fala, F } = usePlano();
  const corte = F(1).ini - 0.4;
  if (t < corte) {
    // o segredo: o Téo cochicha no ouvido do Dudu
    const teo = { ...sentado(1040, cama.topo, 1)(t), expr: "serio" as const, torso: { ...sentado(1040, cama.topo, 1)(t).torso, rot: 16 } };
    const boca = pts("teo", teo).boca;
    const teoM = maoEm(teo, "R", [boca[0] + 16, boca[1] - 6], 1);
    const dudu = { ...duduSegredo(t), expr: "surpreso" as const, head: { rot: -6, offsetY: 0 } };
    return (
      <Camera chaves={[{ t: 0, z: 1.6, cx: 1110, cy: 520 }, { t: corte, z: 1.7, cx: 1110, cy: 520 }]}>
        <QuartoDudu />
        <Ator quem="dudu" pose={dudu} />
        <Ator quem="teo" pose={teoM} />
        <rect x={-500} y={-500} width={3000} height={2000} fill="#FFD95A" opacity={0.12} />
      </Camera>
    );
  }
  const teo: Fn = (tt) => ({ ...parado(760, CQ, 1)(tt), expr: "serio" });
  const dudu = { ...duduSegredo(t), arm_upper_R: 30, arm_lower_R: 90, expr: "preocupado" as const };
  return (
    <Camera chaves={[{ t: corte, z: 1.25, cx: 980, cy: 560 }, { t: dur, z: 1.3, cx: 980, cy: 560 }]}>
      <QuartoDudu />
      <Ator quem="teo" pose={teo(t)} />
      <Ator quem="dudu" pose={dudu} fala={fala("dudu")} />
      <Baloes emissor={porRotulo({ dudu: daBoca("dudu", duduSegredo, -1, CQ, { xChao: 1000 }) })} />
    </Camera>
  );
};
// ---------------------------------------------------------------- c6_sai: duas semanas sem se falar
const C6Sai: React.FC = () => {
  const { t, dur } = usePlano();
  const caidos = caidosDe("c6_segredo", porRotulo({ dudu: daBoca("dudu", duduSegredo, -1, CQ, { xChao: 1000 }) }));
  const corte = 3.6;
  if (t < corte) {
    const teo = { ...andar(760, -200, 0.4, CQ, 1)(t), expr: "triste" as const };
    const dudu = { ...duduSegredo(t), head: { rot: 22, offsetY: 0 }, expr: "triste" as const };
    return (
      <Camera chaves={[{ t: 0, z: 1.2, cx: 900, cy: 560 }, { t: corte, z: 1.26, cx: 960, cy: 560 }]}>
        <QuartoDudu />
        <Ator quem="dudu" pose={dudu} />
        <Ator quem="teo" pose={teo} />
        <NoChao itens={caidos} />
      </Camera>
    );
  }
  const dias = Math.min(14, Math.floor(rampa(t, corte + 0.3, dur - 0.3, (x) => x) * 14));
  return (
    <Camera chaves={[{ t: corte, z: 1, cx: 960, cy: 540 }]} fundo="#2E3A6A">
      <Liso cor="#2E3A6A" padrao="#34407A" />
      <Painel x={60} y={140} w={800} h={800} desde={corte} fundo="#F6ECDA">
        <g transform="translate(-560 -180) scale(1)">
          <QuartoFundo pecas={[]} />
          <Boneco pose={{ ...sentado(980, Q.colchao, 1)(t), expr: "triste", head: { rot: 14, offsetY: 0 } }} esc={1} />
        </g>
      </Painel>
      <Painel x={1060} y={140} w={800} h={800} desde={corte + 0.15} fundo="#CFE8D8">
        <g transform="translate(-760 -200)">
          <QuartoDudu />
          <Boneco pose={{ ...sentado(1180, cama.topo, E("dudu"), true)(t), expr: "triste", head: { rot: 14, offsetY: 0 } }} esc={E("dudu")} v={ELENCO.dudu.v} />
        </g>
      </Painel>
      <g transform="translate(960 160)">
        <rect x={-90} y={-70} width={180} height={150} rx={12} fill="#FBFBF7" stroke={LINHA} strokeWidth={7} />
        <rect x={-90} y={-70} width={180} height={40} rx={12} fill="#E23B2E" stroke={LINHA} strokeWidth={7} />
        {Array.from({ length: 14 }, (_, i) => <g key={i}>{i < dias ? <path d={`M ${-70 + (i % 7) * 23} ${-12 + Math.floor(i / 7) * 34} l 14 14 M ${-56 + (i % 7) * 23} ${-12 + Math.floor(i / 7) * 34} l -14 14`} stroke="#E23B2E" strokeWidth={4} /> : <rect x={-74 + (i % 7) * 23} y={-14 + Math.floor(i / 7) * 34} width={16} height={18} fill="#E8E4DA" />}</g>)}
      </g>
    </Camera>
  );
};
// ---------------------------------------------------------------- c6_esquecem: quem você pega não esquece
const Estrelas: React.FC<{ x: number; y: number; n: number }> = ({ x, y, n }) => (
  <g transform={`translate(${x} ${y})`}>{[0, 1, 2, 3, 4].map((i) => <path key={i} transform={`translate(${i * 90} 0) scale(2)`} d="M 0 -20 L 6 -6 L 21 -6 L 9 3 L 13 18 L 0 9 L -13 18 L -9 3 L -21 -6 L -6 -6 Z" fill={i < n ? "#FFD23F" : "#E8E4DA"} stroke={LINHA} strokeWidth={3} strokeLinejoin="round" />)}</g>
);
const C6Esquecem: React.FC = () => {
  const { t, dur, F } = usePlano();
  const d = F(0).dur, i0 = F(0).ini;
  const a = i0 + d * 0.3, b = i0 + d * 0.62;
  if (t < a) {
    return (
      <Camera chaves={[{ t: 0, z: 1, cx: 960, cy: 540 }]} fundo="#9B6FD0">
        <Liso cor="#9B6FD0" padrao="#8F63C4" />
        <Celular>
          <rect width={580} height={330} fill="#3A4A6A" />
          <Boneco pose={{ ...parado(290, 330, 0.7)(t), expr: "serio" }} esc={0.7} />
          <circle cx={70} cy={420} r={40} fill="#7A8BC0" stroke={LINHA} strokeWidth={4} />
          <rect x={130} y={400} width={300} height={16} rx={8} fill="#C9C4D8" />
          <g transform="translate(0 0)"><Estrelas x={80} y={520} n={t > 1.0 ? 1 : 0} /></g>
          {[0, 1, 2].map((i) => <rect key={i} x={40} y={620 + i * 50} width={480 - i * 90} height={20} rx={10} fill="#D0D6DC" />)}
        </Celular>
      </Camera>
    );
  }
  if (t < b) {
    const marta: Fn = (tt) => ({ ...parado(1060, FEIRA.chao, E("marta"), true)(tt), expr: "sorriso", falando: Math.sin(tt * 40) > 0, arm_upper_R: 60 + 20 * Math.sin(tt * 5), arm_lower_R: 60 });
    const v1 = { ...parado(560, FEIRA.chao, E("maeDudu"))(t), expr: "surpreso" as const };
    const v2 = { ...parado(380, FEIRA.chao, E("rose"), false)(t), expr: "curioso" as const };
    return (
      <Camera chaves={[{ t: a, z: 1.05, cx: 860, cy: 560 }, { t: b, z: 1.1, cx: 860, cy: 560 }]}>
        <FeiraFundo />
        <Ator quem="marta" pose={marta(t)} />
        <FeiraBalcao />
        <Ator quem="maeDudu" pose={v1} />
        <Ator quem="rose" pose={v2} v={{ ...ELENCO.rose.v, vestido: "#7FB7F0", camisa: "#7FB7F0", corBaixo: "#7FB7F0" }} />
        <Baloes emissor={porRotulo({ marta1: daBoca("marta", marta, -1, FEIRA.chao, { xChao: 760 }), marta2: daBoca("marta", marta, -1, FEIRA.chao, { xChao: 880 }) })} />
      </Camera>
    );
  }
  const n = Math.floor(rampa(t, b, dur - 0.3, (x) => x) * 7);
  return (
    <Camera chaves={[{ t: b, z: 1, cx: 960, cy: 540 }]} fundo="#3FAF63">
      <Liso cor="#3FAF63" padrao="#37A05A" />
      <Celular fundo="#EDE6DA">
        <rect width={580} height={90} fill="#3FAF63" />
        {Array.from({ length: n }, (_, i) => {
          const dele = i % 2 === 0;
          const y = 120 + i * 100;
          return <g key={i}><rect x={dele ? 24 : 190} y={y} width={360} height={80} rx={20} fill={dele ? "#FBFBF7" : "#C8F0C0"} stroke={LINHA} strokeWidth={3} /><path d={`M ${dele ? 50 : 216} ${y + 40} q 20 -12 40 0 t 40 0 t 40 0 t 40 0 t 40 0 t 40 0`} stroke={LINHA} strokeWidth={5} fill="none" /></g>;
        })}
      </Celular>
    </Camera>
  );
};
// ---------------------------------------------------------------- c6_festa: festa surpresa
const { chao: CZ } = COZINHA;
const jorgeCoz: Fn = (t) => ({ ...parado(1060, CZ, E("jorge"), true)(t), expr: "sorriso" });
const C6Festa: React.FC = () => {
  const { t, dur, fala, S } = usePlano();
  const tFesta = S("surpresa") - 0.3;
  if (t < tFesta) {
    const rose = { ...parado(1300, CZ, E("rose"), true)(t), arm_upper_L: -40, arm_lower_L: 20, expr: "sorriso" as const };
    const mR = pts("rose", rose).maoL;
    const teo = { ...parado(700, CZ, 1)(t), expr: "serio" as const };
    return (
      <Camera chaves={[{ t: 0, z: 1.2, cx: 1000, cy: 540 }, { t: tFesta, z: 1.25, cx: 1000, cy: 540 }]}>
        <Cozinha t={t} semPanela />
        <Ator quem="rose" pose={rose} />
        <g transform={`translate(${mR[0] + 10} ${mR[1] - 6})`}><rect x={-30} y={-60} width={110} height={60} rx={8} fill="#F0A3B4" stroke={LINHA} strokeWidth={5} /><rect x={20} y={-84} width={10} height={24} fill="#7FB7F0" stroke={LINHA} strokeWidth={3} /></g>
        <Ator quem="teo" pose={teo} />
        <Ator quem="jorge" pose={jorgeCoz(t)} fala={fala("jorge")} />
        <Baloes emissor={porRotulo({ jorge: daBoca("jorge", jorgeCoz, -1, CZ, { xChao: 900 }) })} />
      </Camera>
    );
  }
  const pula = (i: number) => Math.abs(Math.sin((t - tFesta) * 8 + i)) * 40 * (1 - rampa(t, tFesta + 1.6, tFesta + 2.4));
  const gente: [NomeElenco, number][] = [["rose", 380], ["jorge", 580], ["caco", 790], ["livia", 970], ["cida", 1140], ["turma1", 1330]];
  const teo = { ...parado(1620, CS, 1, true)(t), arm_upper_R: 170, arm_lower_R: 0, arm_upper_L: 166, arm_lower_L: 0, expr: "surpreso" as const, torso: { ...parado(1620, CS, 1, true)(t).torso, rot: 0, scaleY: 1.04 } };
  const cab = pts("teo", teo).cabeca;
  return (
    <Camera chaves={[{ t: tFesta, z: 1.0, cx: 1040, cy: 540 }, { t: tFesta + 2.4, z: 1.0, cx: 1040, cy: 540 }, { t: tFesta + 3.2, z: 1.7, cx: cab[0] - 60, cy: cab[1] + 120 }, { t: dur + 0.5, z: 1.75, cx: cab[0] - 60, cy: cab[1] + 120 }]} tremores={[tFesta + 0.3]} forca={6}>
      <Sala festa porta={1} />
      {gente.map(([q, x], i) => { const p = parado(x, CS, E(q), false)(t); return <Ator key={q} quem={q} pose={{ ...p, torso: { ...p.torso, y: p.torso.y - pula(i) }, arm_upper_R: 172, arm_lower_R: 0, arm_upper_L: 166, arm_lower_L: 0, expr: t > tFesta + 2.6 && q === "livia" ? "curioso" : "rindo" }} />; })}
      <Ator quem="teo" pose={teo} semPiscar />
      <Suor x={cab[0]} y={cab[1]} t={t} r={70} lado={-1} />
    </Camera>
  );
};
// ---------------------------------------------------------------- c6_noite: vai ficar tudo bem
const C6Noite: React.FC = () => {
  const { t, dur, fala, F } = usePlano();
  const teo = { ...deitado(740, Q.colchao, 1)(t), expr: (t > F(1).ini ? "fechado" : "serio") as PoseTeo["expr"] };
  const jorge: Fn = (tt) => ({ ...sentado(1080, Q.colchao, E("jorge"), true)(tt), expr: "sorriso", head: { rot: 10, offsetY: 0 } });
  const jg = comBracos(jorge(t), maoEm(jorge(t), "R", pts("teo", teo).peito, E("jorge"), V("jorge")), 1, "R");
  const cab = pts("teo", teo).cabeca;
  return (
    <Camera fundo="#1E2A5A" chaves={[{ t: 0, z: 1.3, cx: 900, cy: 560 }, { t: F(1).ini - 0.2, z: 1.35, cx: 900, cy: 560 }, { t: F(1).ini + 0.6, z: 2.6, cx: cab[0] + 30, cy: cab[1] + 10 }, { t: dur + 0.8, z: 2.8, cx: cab[0] + 30, cy: cab[1] + 10 }]}>
      <QuartoFundo pecas={[]} noite />
      <Ator quem="teo" pose={teo} semPiscar />
      <path d={`M 710 ${Q.colchao - 70} Q 860 ${Q.colchao - 92} 970 ${Q.colchao - 66} L 976 ${Q.colchao + 10} L 700 ${Q.colchao + 10} Z`} fill="#6F8FEF" stroke={LINHA} strokeWidth={7} strokeLinejoin="round" />
      <Ator quem="jorge" pose={jg} fala={fala("jorge")} />
      <QuartoFrente />
      <Baloes emissor={porRotulo({ jorge: daBoca("jorge", jorge, -1, Q.chao) })} />
      <Noite />
    </Camera>
  );
};

export const CAP6: Record<string, React.FC> = {
  c6_blusa: C6Blusa, c6_rose: C6Rose, c6_violao: C6Violao, c6_conviver: C6Conviver, c6_crianca: C6Crianca, c6_segredo: C6Segredo, c6_sai: C6Sai, c6_esquecem: C6Esquecem, c6_festa: C6Festa, c6_noite: C6Noite,
};


