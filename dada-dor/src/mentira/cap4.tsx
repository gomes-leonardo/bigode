// Capítulo 4: O detector de mentiras do bairro.
import React from "react";
import { Titulo } from "../teo/cap1";
import { HOSPITAL, Hospital, Liso } from "../teo/cenarios";
import { ELENCO } from "../teo/elenco";
import { Ator, Camera, Cartela, E, Painel, pts, usePlano, V } from "../teo/kit";
import { andar, apontar, comBracos, cruzados, maoEm, parado, rampa, rir, sentado, sino, type Fn } from "../teo/motor";
import { Boneco, LINHA, type PoseTeo } from "../teo/tira";
import { Baloes, NoChao } from "./balao";
import { BRANCA, Cadeira, Carta, Celular, CLUBE, Clube, ESTUDIO, Estudio, MesaSimples, Sala, SALA, SalaBranca, Views } from "./cenarios";
import { caidosDe, daBoca, porRotulo, Suor } from "./comum";

// ---------------------------------------------------------------- c4_video: o cara na TV
const { chao: CS, sofa } = SALA;
const TV = { x: 1550, y: 540, w: 260, h: 170 };
const teoSofa: Fn = (t) => ({ ...sentado(1080, sofa.assento, 1)(t), expr: "serio" });
const homemTV = (t: number): PoseTeo => ({ ...parado(1690, 800, 0.5, true)(t), expr: "sorriso", falando: Math.sin(t * 38) > 0 && (t % 3) < 2.2 });
const TelaTV: React.FC<{ t: number }> = ({ t }) => (
  <svg x={TV.x} y={TV.y} width={TV.w} height={TV.h} viewBox={`${TV.x} ${TV.y} ${TV.w} ${TV.h}`}>
    <rect x={TV.x} y={TV.y} width={TV.w} height={TV.h} fill="#7FB7F0" />
    <rect x={TV.x} y={TV.y + 120} width={TV.w} height={50} fill="#E23B2E" />
    <Boneco pose={homemTV(t)} esc={0.5} v={ELENCO.empresario.v} />
  </svg>
);
const C4Video: React.FC = () => {
  const { t, dur, fala, F } = usePlano();
  const corte = F(2).ini - 0.05;
  if (t < corte) {
    let teo = teoSofa(t);
    teo = comBracos(teo, apontar(teo, [TV.x + 130, TV.y + 80], 1), sino(t, F(1).ini - 0.5, corte, 0.3, 0.1), "R");
    const caco = { ...parado(560, CS, E("caco"))(t), objR: "celularFilma" as const, arm_upper_R: 70, arm_lower_R: 40, expr: "sorriso" as const };
    const emissor = porRotulo({
      tv1: () => ({ boca: [TV.x + 150, TV.y + 70], lado: -1, chao: CS, esc: 0.8, xChao: 1520 }),
      tv2: () => ({ boca: [TV.x + 150, TV.y + 70], lado: -1, chao: CS, esc: 0.8, xChao: 1400 }),
      teo: daBoca("teo", teoSofa, -1, CS),
    });
    return (
      <Camera chaves={[{ t: 0, z: 1.15, cx: 1150, cy: 560 }, { t: corte, z: 1.22, cx: 1180, cy: 560 }]}>
        <Sala />
        <TelaTV t={t} />
        <Ator quem="caco" pose={caco} />
        <Ator quem="teo" pose={teo} fala={fala("teo")} />
        <Baloes emissor={emissor} />
      </Camera>
    );
  }
  // o vídeo no celular: sem balão nenhum (só você vê); depois a notícia e as views
  const n = 300 + Math.pow(rampa(t, corte + 0.4, dur - 0.4, (x) => x), 2) * 5_000_000;
  const noticia = t > corte + F(2).dur * 0.45;
  return (
    <Camera chaves={[{ t: corte, z: 1, cx: 960, cy: 540 }]} fundo="#6A5FD0">
      <Liso cor="#6A5FD0" padrao="#5E54C0" />
      <Celular>
        <svg x={0} y={0} width={580} height={760} viewBox="1000 330 900 1180" preserveAspectRatio="xMidYMid slice">
          <Sala />
          <TelaTV t={t} />
          {!noticia && <Boneco pose={comBracos(teoSofa(t), apontar(teoSofa(t), [TV.x + 130, TV.y + 80], 1), 1, "R")} esc={1} />}
          {noticia && <g><rect x={1000} y={330} width={900} height={1180} fill="#2A2A35" opacity={0.6} /><g transform="translate(1450 900) scale(2.4)"><rect x={-120} y={-90} width={240} height={180} rx={10} fill="#7FB7F0" stroke={LINHA} strokeWidth={4} /><rect x={-120} y={50} width={240} height={40} fill="#E23B2E" /><circle cx={0} cy={-20} r={44} fill="#E0B08A" stroke={LINHA} strokeWidth={4} /><path d="M -60 -40 L 60 60 M 60 -40 L -60 60" stroke="#E23B2E" strokeWidth={12} /></g></g>}
        </svg>
        <rect x={0} y={760} width={580} height={120} fill="#3A3A48" />
        <rect x={30} y={780} width={520} height={10} rx={5} fill="#5A5A6A" />
        <rect x={30} y={780} width={520 * ((t * 0.3) % 1)} height={10} rx={5} fill="#E23B2E" />
      </Celular>
      <Views x={70} y={110} n={n} esc={1.2} />
    </Camera>
  );
};
// ---------------------------------------------------------------- c4_cartela
const C4Cartela: React.FC = () => {
  const { t } = usePlano();
  const teo = { ...parado(960, 1080, 0.8)(t), expr: "sorriso" as const };
  return (
    <Camera chaves={[{ t: 0, z: 1, cx: 960, cy: 540 }]} fundo="#E23B2E">
      <Liso cor="#E23B2E" padrao="#D4333A" />
      <Titulo linhas={["O MENINO QUE", "VÊ MENTIRA"]} desde={0.1} y={380} tam={120} />
      <Boneco pose={teo} esc={0.8} />
      <NoChao itens={[{ x: 700, chao: 1080, esc: 0.9 }, { x: 1230, chao: 1080, esc: 0.8, rot: -6 }, { x: 1380, chao: 1080, esc: 0.7, rot: 9 }]} />
    </Camera>
  );
};
// ---------------------------------------------------------------- c4_clube: o atacante de cinquenta milhões
const { chao: CB, mesa: MB, assento: AB } = CLUBE;
const atacante: Fn = (t) => ({ ...sentado(1300, AB, E("atacante"), true, CB)(t), expr: "sorriso" });
const diretor1: Fn = (t) => ({ ...sentado(700, AB, E("empresario"))(t), expr: "serio" });
const diretor2: Fn = (t) => ({ ...sentado(1020, AB, E("delegado"), true)(t + 2), expr: "serio" });
const teoClube: Fn = (t) => ({ ...sentado(330, AB, 1, false, CB)(t), expr: "serio" });
const emissorClube = porRotulo({ atacante: daBoca("atacante", atacante, -1, MB.topo, { xChao: 1160 }) });
const DIRETOR2_V = { ...ELENCO.delegado.v, terno: "#3A3A48", bigode: false, barba: true };
const CenaClube: React.FC<{ t: number; teo: PoseTeo; atac: PoseTeo; falaAtac?: boolean }> = ({ t, teo, atac, falaAtac }) => (
  <>
    <Clube />
    <Ator quem="empresario" pose={diretor1(t)} />
    <Ator quem="delegado" pose={diretor2(t)} v={DIRETOR2_V} />
    <Ator quem="atacante" pose={atac} fala={falaAtac} />
    <MesaSimples x0={MB.x0} x1={MB.x1} topo={MB.topo} chao={CB} cor="#5A3A2A" />
    <Cadeira x={310} assento={AB} chao={CB} cor="#3A3A48" />
    <Ator quem="teo" pose={teo} />
  </>
);
const C4Clube: React.FC = () => {
  const { t, dur, fala, F } = usePlano();
  let teo = teoClube(t);
  teo = { ...teo, head: { rot: t > F(1).fim ? -4 : 0, offsetY: 0 }, expr: t > F(2).ini ? "curioso" : "serio" };
  const atac = { ...atacante(t), arm_upper_R: 50 + 10 * Math.sin(t * 3), arm_lower_R: 70 };
  return (
    <Camera chaves={[{ t: 0, z: 1.0, cx: 960, cy: 540 }, { t: F(1).ini - 0.1, z: 1.05, cx: 960, cy: 540 }, { t: F(1).ini + 0.4, z: 1.6, cx: 1220, cy: 520 }, { t: F(2).ini - 0.1, z: 1.6, cx: 1220, cy: 520 }, { t: F(2).ini, z: 1.8, cx: 420, cy: 540, corte: true }, { t: dur, z: 1.85, cx: 420, cy: 540 }]}>
      <CenaClube t={t} teo={teo} atac={atac} falaAtac={fala("atacante")} />
      <Baloes emissor={emissorClube} />
    </Camera>
  );
};
// ---------------------------------------------------------------- c4_medico: o raio-x do joelho
const RaioXJoelho: React.FC<{ x: number; y: number; t: number; rasgo: number }> = ({ x, y, t, rasgo }) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={-300} y={-200} width={600} height={400} fill="#1A2030" />
    <g stroke="#E8F0F8" strokeWidth={44} strokeLinecap="round" fill="none" opacity={0.9}>
      <line x1={-30} y1={-200} x2={-10} y2={-40} />
      <line x1={-6} y1={40} x2={6} y2={200} />
      <line x1={50} y1={60} x2={60} y2={200} strokeWidth={20} />
    </g>
    <ellipse cx={-6} cy={-30} rx={70} ry={30} fill="#E8F0F8" opacity={0.9} />
    <ellipse cx={0} cy={40} rx={66} ry={26} fill="#E8F0F8" opacity={0.9} />
    <circle cx={80} cy={-10} r={22} fill="#E8F0F8" opacity={0.8} />
    {rasgo > 0 && (
      <g opacity={rasgo}>
        <path d="M -50 0 L -20 10 L -36 22 L 0 18 L -10 30 L 34 14" stroke="#FF5A4A" strokeWidth={8} fill="none" strokeLinejoin="round" />
        <circle cx={-6} cy={14} r={64 + 6 * Math.sin(t * 8)} stroke="#FF5A4A" strokeWidth={6} fill="none" />
      </g>
    )}
  </g>
);
const CamisaTime: React.FC<{ x: number; y: number; esc?: number }> = ({ x, y, esc = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${esc})`}>
    <path d="M -80 -150 L -30 -170 Q 0 -150 30 -170 L 80 -150 L 120 -90 L 84 -70 L 70 -100 L 70 20 L -70 20 L -70 -100 L -84 -70 L -120 -90 Z" fill="#FBFBF7" stroke={LINHA} strokeWidth={7} strokeLinejoin="round" />
    {[-40, 0, 40].map((dx, i) => <rect key={i} x={dx - 12} y={-150} width={24} height={168} fill="#E23B2E" />)}
    <path d="M -80 -150 L -30 -170 Q 0 -150 30 -170 L 80 -150 L 120 -90 L 84 -70 L 70 -100 L 70 20 L -70 20 L -70 -100 L -84 -70 L -120 -90 Z" fill="none" stroke={LINHA} strokeWidth={7} strokeLinejoin="round" />
    <path d="M 0 -96 L 12 -64 L 46 -64 L 18 -44 L 28 -12 L 0 -32 L -28 -12 L -18 -44 L -46 -64 L -12 -64 Z" fill="#FFD23F" stroke={LINHA} strokeWidth={5} strokeLinejoin="round" />
  </g>
);
const C4Medico: React.FC = () => {
  const { t, dur, F } = usePlano();
  const d = F(0).dur, i0 = F(0).ini;
  const tRasgo = i0 + d * 0.25, tNao = i0 + d * 0.48, tCamisa = i0 + d * 0.62;
  const n = HOSPITAL.negatoscopio;
  if (t < tCamisa) {
    let med = parado(860, HOSPITAL.chao, E("medico"))(t);
    med = comBracos(med, apontar(med, [n.x + n.w / 2 - 6, n.y + n.h / 2 + 14], E("medico"), V("medico")), rampa(t, tRasgo - 0.3, tRasgo), "R");
    const atac = { ...parado(520, HOSPITAL.chao, E("atacante"))(t), expr: (t > tNao ? "triste" : "serio") as PoseTeo["expr"], head: { rot: t > tNao ? 14 : 0, offsetY: 0 } };
    const dir = { ...cruzados(parado(300, HOSPITAL.chao, E("empresario"))(t)), expr: "serio" as const, head: { rot: t > tNao ? Math.sin(t * 10) * 8 * sino(t, tNao, tNao + 1.2) : 0, offsetY: 0 } };
    return (
      <Camera chaves={[{ t: 0, z: 1.0, cx: 960, cy: 540 }, { t: tCamisa, z: 1.08, cx: 1000, cy: 520 }]}>
        <Hospital t={t} brilho={0} />
        <g><rect x={n.x} y={n.y} width={n.w} height={n.h} fill="#EAF6FF" stroke={LINHA} strokeWidth={6} /><RaioXJoelho x={n.x + n.w / 2} y={n.y + n.h / 2} t={t} rasgo={rampa(t, tRasgo, tRasgo + 0.3)} /></g>
        <Ator quem="empresario" pose={dir} />
        <Ator quem="atacante" pose={atac} />
        <Ator quem="medico" pose={{ ...med, expr: "serio" }} />
      </Camera>
    );
  }
  const teo = { ...parado(900, CS, 1)(t), arm_upper_R: 60, arm_lower_R: 50, arm_upper_L: 56, arm_lower_L: 50, expr: "rindo" as const };
  const m = pts("teo", teo).maoR;
  return (
    <Camera chaves={[{ t: tCamisa, z: 1.4, cx: 940, cy: 560 }, { t: dur + 0.5, z: 1.5, cx: 940, cy: 560 }]}>
      <Sala />
      <Ator quem="teo" pose={rir(teo, t, 0.6)} />
      <CamisaTime x={m[0] + 30} y={m[1] + 20} esc={1.05} />
    </Camera>
  );
};
// ---------------------------------------------------------------- c4_fama: todo mundo quer você
const C4Fama: React.FC = () => {
  const { t, dur, fala, F } = usePlano();
  const a = 4.2, b = F(1).ini - 0.25, c = F(3).ini - 0.05;
  if (t < a) {
    // a empresa: contrato na mesa da reunião
    const emp = { ...sentado(1300, AB, E("empresario"), true, CB)(t), objR: "papel" as const, arm_upper_R: 70, arm_lower_R: 30, expr: "sorriso" as const };
    const teo = { ...teoClube(t), expr: "curioso" as const };
    return (
      <Camera chaves={[{ t: 0, z: 1.05, cx: 900, cy: 540 }, { t: a, z: 1.1, cx: 900, cy: 540 }]}>
        <Clube />
        <Ator quem="empresario" pose={emp} />
        <Ator quem="vendedor" pose={{ ...sentado(980, AB, E("vendedor"), true)(t), expr: "sorriso" }} v={{ ...ELENCO.vendedor.v, brilho: false, terno: "#3B4A6B", corBaixo: "#3B4A6B", bigode: false }} />
        <MesaSimples x0={MB.x0} x1={MB.x1} topo={MB.topo} chao={CB} cor="#5A3A2A" />
        <Cadeira x={310} assento={AB} chao={CB} cor="#3A3A48" />
        <Ator quem="teo" pose={teo} />
      </Camera>
    );
  }
  if (t < b) {
    // programa de auditório: o Téo de jurado
    const apr = { ...parado(1250, ESTUDIO.chao, E("apresentador"), true)(t), objR: "microfone" as const, arm_upper_R: 70, arm_lower_R: 80, expr: "rindo" as const };
    const teo = { ...sentado(640, ESTUDIO.assento, 1, false, ESTUDIO.chao)(t), arm_upper_R: 150 + 10 * Math.sin(t * 6), arm_lower_R: 10, expr: "sorriso" as const };
    return (
      <Camera chaves={[{ t: a, z: 1.05, cx: 960, cy: 540 }, { t: b, z: 1.12, cx: 960, cy: 540 }]} fundo="#1A1430">
        <Estudio t={t} />
        <Cadeira x={620} assento={ESTUDIO.assento} chao={ESTUDIO.chao} cor="#FFD23F" />
        <MesaSimples x0={700} x1={980} topo={ESTUDIO.mesa.topo} chao={ESTUDIO.chao} cor="#E23B2E" />
        <Ator quem="teo" pose={teo} />
        {(() => { const m = pts("teo", teo).maoR; return <g transform={`translate(${m[0]} ${m[1] - 30})`}><rect x={-40} y={-70} width={80} height={70} rx={10} fill="#FBFBF7" stroke={LINHA} strokeWidth={5} /><path d="M -16 -36 l 12 12 l 22 -24" stroke="#3FAF63" strokeWidth={8} fill="none" /></g>; })()}
        <Ator quem="apresentador" pose={apr} />
      </Camera>
    );
  }
  if (t < c) {
    // a repórter pergunta, o Téo responde
    const teoR: Fn = (tt) => ({ ...parado(820, CS, 1)(tt), expr: "serio" });
    const repR: Fn = (tt) => {
      const p = parado(1130, CS, E("reporter"), true)(tt);
      return { ...maoEm(p, "R", [pts("teo", teoR(tt)).boca[0] + 70, pts("teo", teoR(tt)).boca[1] + 40], E("reporter"), V("reporter")), objR: "microfone", expr: "sorriso" };
    };
    const emissor = porRotulo({ reporter: daBoca("reporter", repR, 1, CS), teo: daBoca("teo", teoR, -1, CS) });
    return (
      <Camera chaves={[{ t: b, z: 1.5, cx: 980, cy: 480 }, { t: c, z: 1.58, cx: 980, cy: 480 }]}>
        <Sala />
        <Ator quem="teo" pose={teoR(t)} fala={fala("teo")} />
        <Ator quem="reporter" pose={repR(t)} fala={fala("reporter")} />
        <Baloes emissor={emissor} />
      </Camera>
    );
  }
  // em algum lugar, a sua mãe fica muito quieta
  const rose = { ...sentado(880, sofa.assento, E("rose"))(t), expr: "surpreso" as const, head: { rot: -4, offsetY: 0 } };
  const cab = pts("rose", rose).cabeca;
  return (
    <Camera chaves={[{ t: c, z: 1.3, cx: 1100, cy: 520 }, { t: dur + 0.5, z: 2.2, cx: cab[0] + 40, cy: cab[1] + 40 }]}>
      <Sala />
      <svg x={TV.x} y={TV.y} width={TV.w} height={TV.h} viewBox={`${TV.x} ${TV.y} ${TV.w} ${TV.h}`}><rect x={TV.x} y={TV.y} width={TV.w} height={TV.h} fill="#86DDBE" /><Boneco pose={{ ...parado(1680, 790, 0.45)(t), expr: "sorriso" }} esc={0.45} /></svg>
      <Ator quem="rose" pose={rose} semPiscar />
      <Suor x={cab[0]} y={cab[1]} t={t} r={64} />
    </Camera>
  );
};
// ---------------------------------------------------------------- c4_convite: o maior blefador do país
const { chao: CE, mesa: ME, assento: AE, xTeo: XTE, xCampeao: XCE } = ESTUDIO;
const campeao: Fn = (t) => ({ ...sentado(XCE, AE, E("campeao"), true, CE)(t), objR: "cartas", expr: "sorriso" });
const teoEst: Fn = (t) => ({ ...sentado(XTE, AE, 1, false, CE)(t), objR: "cartas", expr: "serio" });
const comCartas = (p: PoseTeo, x: number, esc = 1, q: "teo" | "campeao" = "teo") => maoEm(p, "R", [x, ME.topo - 62], esc, V(q));
const CenaEstudio: React.FC<{ t: number; teo: PoseTeo; camp: PoseTeo; fala?: Record<string, boolean> }> = ({ t, teo, camp, fala = {} }) => (
  <>
    <Estudio t={t} />
    <Cadeira x={XTE - 20} assento={AE} chao={CE} cor="#FFD23F" />
    <Cadeira x={XCE + 20} assento={AE} chao={CE} esq cor="#FFD23F" />
    <MesaSimples x0={ME.x0} x1={ME.x1} topo={ME.topo} chao={CE} cor="#2F8F55" />
    <Ator quem="teo" pose={teo} fala={fala.teo} />
    <Ator quem="campeao" pose={camp} fala={fala.campeao} />
  </>
);
const C4Convite: React.FC = () => {
  const { t, dur, F } = usePlano();
  const corte = 3.2;
  if (t < corte) {
    const teo: PoseTeo = { ...parado(900, CS, 1.2)(t), objR: "convite", arm_upper_R: 70, arm_lower_R: 60, expr: t > 1.2 ? "surpreso" : "curioso" };
    const m = pts("teo", teo).maoR;
    const abre = rampa(t, 1.0, 1.4);
    return (
      <Camera chaves={[{ t: 0, z: 1.5, cx: 960, cy: 480 }, { t: corte, z: 1.6, cx: 960, cy: 480 }]}>
        <Sala />
        <Boneco pose={teo} esc={1.2} />
        {abre > 0 && <g transform={`translate(${m[0] + 46} ${m[1] - 90 - 60 * abre}) scale(${abre})`}><rect x={-60} y={-46} width={120} height={92} rx={8} fill="#FBFBF7" stroke={LINHA} strokeWidth={5} /><path d="M -30 10 L -30 -20 L -14 -4 L 0 -26 L 14 -4 L 30 -20 L 30 10 Z" fill="#F2C94C" stroke={LINHA} strokeWidth={4} strokeLinejoin="round" />{[0, 1, 2, 3].map((i) => <line key={i} x1={Math.cos(i * 1.6) * 70} y1={Math.sin(i * 1.6) * 60} x2={Math.cos(i * 1.6) * 90} y2={Math.sin(i * 1.6) * 80} stroke="#F2C94C" strokeWidth={6} strokeLinecap="round" />)}</g>}
      </Camera>
    );
  }
  const d = F(0).dur, i0 = F(0).ini;
  const tRose = i0 + d * 0.62, tCem = i0 + d * 0.86;
  const camp = comCartas(campeao(t), ME.x1 - 40, E("campeao"), "campeao");
  const entra = andar(200, XTE, corte, CE, 1)(t);
  const teo = t < corte + 1.6 ? { ...entra, expr: "curioso" as const } : comCartas(teoEst(t), ME.x0 + 40);
  const rose = { ...parado(380, CE, E("rose"))(t), expr: "bravo" as const };
  const roseDedo = comBracos(rose, { ...rose, arm_upper_R: 110, arm_lower_R: 30 }, sino(t, tRose, tRose + 1.6), "R");
  return (
    <Camera chaves={[{ t: corte, z: 1.05, cx: 900, cy: 540 }, { t: dur, z: 1.15, cx: 940, cy: 540 }]} fundo="#1A1430">
      <CenaEstudio t={t} teo={teo} camp={camp} />
      {t > tRose - 0.3 && <Ator quem="rose" pose={roseDedo} />}
      <Cartela texto="R$ 100 MIL" x={960} y={200} tam={110} desde={tCem} cor="#9BD47A" />
    </Camera>
  );
};
// ---------------------------------------------------------------- c4_blefe
const emissorEst = porRotulo({
  campeao: daBoca("campeao", (t) => comCartas(campeao(t), ME.x1 - 40, E("campeao"), "campeao"), -1, ME.topo, { xChao: 1010 }),
  teo: daBoca("teo", (t) => comCartas(teoEst(t), ME.x0 + 40), 1, ME.topo),
});
const C4Blefe: React.FC = () => {
  const { t, dur, fala, F, S } = usePlano();
  const tVira = S("carta");
  let camp = comCartas(campeao(t), ME.x1 - 40, E("campeao"), "campeao");
  camp = { ...camp, expr: t > tVira + 0.3 ? "surpreso" : "serio", head: { rot: 4, offsetY: 0 } };
  let teo = comCartas(teoEst(t), ME.x0 + 40);
  teo = comBracos(teo, maoEm(teo, "R", [ME.x0 + 120, ME.topo - 12], 1), sino(t, tVira - 0.25, tVira + 0.5, 0.2, 0.25), "R");
  if (t > tVira) teo.objR = null;
  teo.expr = t > tVira + 0.3 ? "sorriso" : "serio";
  const cabC = pts("campeao", camp).cabeca;
  return (
    <Camera chaves={[{ t: 0, z: 1.9, cx: XCE - 60, cy: 520 }, { t: F(1).ini, z: 1.9, cx: XCE - 60, cy: 520 }, { t: F(2).ini - 0.1, z: 1.9, cx: XCE - 60, cy: 520 }, { t: F(2).ini, z: 1.9, cx: XTE + 80, cy: 520, corte: true }, { t: F(3).ini + 0.8, z: 1.9, cx: XTE + 80, cy: 520 }, { t: F(3).ini + 0.81, z: 1.15, cx: 960, cy: 540, corte: true }, { t: dur, z: 1.2, cx: 960, cy: 540 }]} fundo="#1A1430">
      <CenaEstudio t={t} teo={teo} camp={camp} fala={{ campeao: fala("campeao"), teo: fala("teo") }} />
      <NoChao itens={[]} />
      {t < F(1).fim && <Suor x={cabC[0]} y={cabC[1]} t={t} r={60} lado={-1} />}
      <Baloes emissor={emissorEst} />
      {t > tVira + 0.1 && (
        <Painel x={1150} y={80} w={660} h={360} desde={tVira + 0.1} fundo="#2F8F55">
          <Carta x={170} y={180} pintas={4} naipe="paus" rot={-10} esc={2.3} />
          <Carta x={330} y={180} pintas={7} naipe="copas" rot={0} esc={2.3} />
          <Carta x={490} y={180} pintas={1} naipe="espadas" rot={10} esc={2.3} />
        </Painel>
      )}
      {t > F(3).ini + 1.4 && <Views x={70} y={120} n={2_000_000 * rampa(t, F(3).ini + 1.4, F(3).fim, (x) => x)} esc={1.1} />}
    </Camera>
  );
};
const C4Campeao: React.FC = () => {
  const { t, dur, fala } = usePlano();
  const meio: [number, number] = [960, ME.topo - 110];
  let camp: PoseTeo = { ...campeao(t), objR: null };
  camp = rir(camp, t, sino(t, 0, 1.6, 0.1, 0.3));
  camp = comBracos(camp, maoEm(camp, "R", [meio[0] + 14, meio[1]], E("campeao"), V("campeao")), rampa(t, 1.4, 1.9), "R");
  camp.torso.rot += 14 * rampa(t, 1.4, 1.9);
  let teo: PoseTeo = { ...teoEst(t), objR: null, expr: "sorriso" };
  teo = comBracos(teo, maoEm(teo, "R", [meio[0] - 14, meio[1]], 1), rampa(t, 1.5, 2.0), "R");
  const aperta = t > 2.0 ? Math.sin(t * 14) * 6 : 0;
  camp.arm_upper_R += aperta * 0.3; teo.arm_upper_R += aperta * 0.3;
  const caidos = caidosDe("c4_blefe", emissorEst);
  return (
    <Camera chaves={[{ t: 0, z: 1.35, cx: 960, cy: 520 }, { t: dur, z: 1.42, cx: 960, cy: 520 }]} fundo="#1A1430">
      <CenaEstudio t={t} teo={teo} camp={camp} fala={{ campeao: fala("campeao") }} />
      <NoChao itens={caidos} />
      <Baloes emissor={porRotulo({ campeao: daBoca("campeao", (tt) => ({ ...campeao(tt), objR: null }), -1, CE) })} />
    </Camera>
  );
};
// ---------------------------------------------------------------- c4_cientistas: duzentos vídeos, sessenta zeros
const C4Cientistas: React.FC = () => {
  const { t, dur, F } = usePlano();
  const d = F(0).dur, i0 = F(0).ini;
  const tAcerta = i0 + d * 0.38, tMoeda = i0 + d * 0.55, tZeros = i0 + d * 0.84;
  const certos = Math.floor(200 * rampa(t, tAcerta - 1.0, tAcerta + 1.6, (x) => x));
  const teo = maoEm({ ...sentado(860, BRANCA.assento, 1, false, BRANCA.chao)(t), expr: certos >= 200 ? "sorriso" : "serio" }, "R", [BRANCA.mesa.x0 + 120 + (Math.floor(t * 6) % 2) * 40, BRANCA.mesa.topo - 14], 1);
  const ci = { ...parado(420, BRANCA.chao, E("cientista"))(t), objL: "prancheta" as const, arm_upper_L: 40, arm_lower_L: 70, expr: (certos >= 200 ? "surpreso" : "serio") as PoseTeo["expr"] };
  const ci2 = { ...parado(1520, BRANCA.chao, E("cientista2"), true)(t), objR: "prancheta" as const, arm_upper_R: 40, arm_lower_R: 70, expr: (certos >= 200 ? "surpreso" : "serio") as PoseTeo["expr"] };
  const moedas = Math.floor(200 * rampa(t, tMoeda, tZeros - 0.3, (x) => x));
  const zeros = "0," + "0".repeat(59) + "1";
  const rolagem = rampa(t, tZeros, dur + 0.4, (x) => x);
  return (
    <Camera chaves={[{ t: 0, z: 1.0, cx: 960, cy: 520 }, { t: dur, z: 1.04, cx: 960, cy: 520 }]} fundo="#F4F6F8">
      <SalaBranca certos={certos} />
      <Ator quem="cientista" pose={ci} />
      <Ator quem="cientista2" pose={ci2} />
      <MesaSimples x0={BRANCA.mesa.x0} x1={BRANCA.mesa.x1} topo={BRANCA.mesa.topo} chao={BRANCA.chao} cor="#D0D6DC" />
      <rect x={BRANCA.mesa.x0 + 100} y={BRANCA.mesa.topo - 16} width={120} height={16} rx={6} fill="#3A3A48" stroke={LINHA} strokeWidth={4} />
      <Cadeira x={840} assento={BRANCA.assento} chao={BRANCA.chao} cor="#9AA0A8" />
      <Ator quem="teo" pose={teo} />
      {t > tMoeda && t < tZeros + 0.2 && (
        <g transform="translate(1720 940)">
          {Array.from({ length: Math.min(40, Math.ceil(moedas / 5)) }, (_, i) => <ellipse key={i} cx={0} cy={-i * 12} rx={60} ry={14} fill="#F2C94C" stroke={LINHA} strokeWidth={4} />)}
        </g>
      )}
      {t > tZeros && (
        <g>
          <rect x={-200} y={420} width={2400} height={170} fill="#FFD23F" stroke={LINHA} strokeWidth={9} />
          <text x={1900 - rolagem * 2600} y={540} fontFamily="Montserrat" fontWeight={900} fontSize={110} fill={LINHA}>{zeros}</text>
        </g>
      )}
    </Camera>
  );
};

export const CAP4: Record<string, React.FC> = {
  c4_video: C4Video, c4_cartela: C4Cartela, c4_clube: C4Clube, c4_medico: C4Medico, c4_fama: C4Fama, c4_convite: C4Convite, c4_blefe: C4Blefe, c4_campeao: C4Campeao, c4_cientistas: C4Cientistas,
};
