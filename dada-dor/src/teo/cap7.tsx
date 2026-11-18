// Capítulo 7: As mãos da vó.
import React from "react";
import { Cadeira, COZINHA, Cozinha, Liso, MesaCozinha } from "./cenarios";
import { Ator, Camera, E, Noite, Painel, pts, usePlano, V } from "./kit";
import { andar, comBracos, maoEm, parado, rampa, sentado, sino } from "./motor";
import { Q, QuartoFrente, QuartoFundo } from "./Quarto";
import { Titulo } from "./cap1";
import { Boneco, LINHA, type PoseTeo } from "./tira";
import { ELENCO } from "./elenco";

const { chao: CZ, mesa } = COZINHA;
const ASSENTO = 770;
const X_VO = mesa.x0 - 40; // cadeira da vó, de frente para a mesa (olha para a direita)
const X_TEO_C = mesa.x1 + 60; // cadeira do Téo, do outro lado (olha para a esquerda)
const MAOS_MESA: [[number, number], [number, number]] = [[mesa.x0 + 120, mesa.topo - 8], [mesa.x0 + 70, mesa.topo - 10]];

const voSentada = (t: number): PoseTeo => {
  const p = sentado(X_VO, ASSENTO, E("cida"), false, CZ)(t);
  const q = maoEm(maoEm(p, "R", MAOS_MESA[0], E("cida"), V("cida")), "L", MAOS_MESA[1], E("cida"), V("cida"));
  return { ...q, expr: "serio", head: { rot: 8, offsetY: 0 } };
};
/** cicatrizes de queimadura por cima das mãos (pontos no mundo) */
const Marcas: React.FC<{ maos: [number, number][]; esc: number; palma?: number }> = ({ maos, esc, palma = 0 }) => (
  <g>
    {maos.map(([x, y], i) => (
      <g key={i} transform={`translate(${x} ${y}) scale(${esc})`}>
        {palma > 0 && <circle r={11} fill="#D9A27A" opacity={palma} />}
        <ellipse cx={-4} cy={-4} rx={6} ry={4} fill="#E8B4A0" stroke="#9A5A44" strokeWidth={1.5} />
        <ellipse cx={5} cy={4} rx={4} ry={3} fill="#E8B4A0" stroke="#9A5A44" strokeWidth={1.5} />
        <path d="M -8 6 q 4 -3 8 0" stroke="#9A5A44" strokeWidth={1.5} fill="none" />
      </g>
    ))}
  </g>
);
const Cena: React.FC<{ t: number; vo: PoseTeo; teo?: PoseTeo; marcas?: boolean; palma?: number; fala?: { vo?: boolean; teo?: boolean } }> = ({ t, vo, teo, marcas, palma, fala }) => (
  <>
    <Cozinha noite semPanela t={t} />
    <Cadeira x={X_VO} assento={ASSENTO} chao={CZ} />
    {teo && <Cadeira x={X_TEO_C} assento={ASSENTO} chao={CZ} esq />}
    <Ator quem="cida" pose={vo} fala={fala?.vo} />
    {teo && <Ator quem="teo" pose={teo} fala={fala?.teo} />}
    <MesaCozinha />
    {marcas && <Marcas maos={[pts("cida", vo).maoR, pts("cida", vo).maoL]} esc={E("cida")} palma={palma} />}
    <Noite forca={0.6} />
  </>
);

const C7Cozinha: React.FC = () => {
  const { t, dur } = usePlano();
  const vo = voSentada(t);
  const teo = andar(1900, 1380, 0.6, CZ, 1)(t);
  return (
    <Camera chaves={[{ t: 0, z: 1.0, cx: 1000, cy: 540 }, { t: dur + 0.5, z: 1.05, cx: 1000, cy: 560 }]} fundo="#1E2A5A">
      <Cena t={t} vo={vo} />
      <Ator quem="teo" pose={{ ...teo, expr: "serio" }} />
    </Camera>
  );
};
const C7Maos: React.FC = () => {
  const { t, dur } = usePlano();
  const vo = voSentada(t);
  const m = pts("cida", vo);
  const cx = (m.maoR[0] + m.maoL[0]) / 2, cy = (m.maoR[1] + m.maoL[1]) / 2;
  return (
    <Camera chaves={[{ t: 0, z: 1.6, cx: cx + 60, cy: cy - 140 }, { t: 1.4, z: 1.6, cx: cx + 60, cy: cy - 140 }, { t: 2.8, z: 4.0, cx, cy: cy - 4 }, { t: dur + 0.4, z: 4.3, cx, cy: cy - 4 }]} fundo="#1E2A5A">
      <Cena t={t} vo={vo} marcas />
      <Ator quem="teo" pose={{ ...parado(1380, CZ, 1, true)(t), expr: "curioso", head: { rot: 14, offsetY: 0 } }} />
    </Camera>
  );
};
const C7Vira: React.FC = () => {
  const { t, dur, fala } = usePlano();
  let vo = voSentada(t);
  const vira = rampa(t, 0.2, 0.7);
  vo = comBracos(vo, maoEm(maoEm(vo, "R", [MAOS_MESA[0][0] + 40, MAOS_MESA[0][1] - 70], E("cida"), V("cida")), "L", [MAOS_MESA[1][0] + 60, MAOS_MESA[1][1] - 60], E("cida"), V("cida")), vira);
  vo.head.rot = 0;
  const teo = { ...parado(1250, CZ, 1, true)(t), expr: "triste" as const };
  return (
    <Camera chaves={[{ t: 0, z: 1.5, cx: 1020, cy: 520 }, { t: dur, z: 1.6, cx: 1020, cy: 520 }]} fundo="#1E2A5A">
      <Cena t={t} vo={vo} marcas palma={vira} fala={{ vo: fala("cida") }} />
      <Ator quem="teo" pose={teo} />
    </Camera>
  );
};
const C7Gene: React.FC = () => {
  const { t, dur } = usePlano();
  const gens: [keyof typeof ELENCO, number, number][] = [["cida", 420, 0.6], ["rose", 960, 1.8], ["teo", 1500, 3.0]];
  return (
    <Camera chaves={[{ t: 0, z: 1, cx: 960, cy: 540 }, { t: dur, z: 1.04, cx: 960, cy: 540 }]} fundo="#2B3A7A">
      <Liso cor="#2B3A7A" padrao="#33448A" />
      <Painel x={120} y={120} w={1680} h={840} desde={0.1} fundo="#FFF6E0">
        {gens.map(([q, x, a], i) => {
          const m = ELENCO[q];
          const acende = rampa(t, a, a + 0.3);
          const p = parado(x - 120, 760, m.esc * 0.8)(t);
          return (
            <g key={q}>
              <Boneco pose={{ ...p, expr: q === "cida" ? "serio" : "neutro" }} esc={m.esc * 0.8} v={m.v} />
              {/* pedaço de DNA em cima de cada um; o trecho quebrado acende */}
              <g transform={`translate(${x - 120} 170)`}>
                {Array.from({ length: 6 }, (_, j) => (
                  <g key={j}>
                    <line x1={-70 + j * 28} y1={-30} x2={-70 + j * 28} y2={30} stroke={j === 3 ? (acende > 0 ? "#E23B2E" : "#9AA0A8") : "#9AA0A8"} strokeWidth={j === 3 ? 12 : 7} strokeDasharray={j === 3 && acende > 0 ? "10 6" : undefined} />
                    <circle cx={-70 + j * 28} cy={-30} r={9} fill="#3B6FD6" stroke={LINHA} strokeWidth={3} />
                    <circle cx={-70 + j * 28} cy={30} r={9} fill="#E9707F" stroke={LINHA} strokeWidth={3} />
                  </g>
                ))}
                {acende > 0 && <circle cx={14} cy={0} r={52 + 6 * Math.sin(t * 7)} fill="none" stroke="#E23B2E" strokeWidth={5} opacity={acende} />}
              </g>
              {i < 2 && (() => {
                const k = rampa(t, a + 0.2, a + 1.1);
                const x0 = x - 40, x1 = gens[i + 1][1] - 200;
                return <g><line x1={x0} y1={170} x2={x0 + (x1 - x0) * k} y2={170} stroke="#FFD23F" strokeWidth={14} strokeLinecap="round" />{k > 0 && k < 1 && <circle cx={x0 + (x1 - x0) * k} cy={170} r={18} fill="#E23B2E" stroke={LINHA} strokeWidth={4} />}</g>;
              })()}
            </g>
          );
        })}
        {/* setenta anos escondendo: as mãos da vó somem no avental */}
        {t > 4.2 && <g transform={`translate(300 380) scale(${rampa(t, 4.2, 4.45)})`}><rect x={-10} y={-10} width={240} height={110} rx={20} fill="#FBFBF7" stroke={LINHA} strokeWidth={6} /><text x={110} y={66} textAnchor="middle" fontFamily="Montserrat" fontWeight={900} fontSize={56} fill={LINHA}>70</text></g>}
      </Painel>
    </Camera>
  );
};
const C7Canela: React.FC = () => {
  const { t, dur, fala } = usePlano();
  let teo: PoseTeo = { ...sentado(X_TEO_C, ASSENTO, 1, true, CZ)(t), roxo: 1, expr: "serio" };
  const base = voSentada(t);
  const mT = pts("teo", teo).maoR;
  // pega a mão do Téo, depois passa o dedo na canela roxa (do joelho ao tornozelo)
  const p = pts("teo", teo);
  const kCanela = rampa(t, 2.6, 4.4);
  const alvoCanela: [number, number] = [p.joelhoR[0] + (p.tornozeloR[0] - p.joelhoR[0]) * kCanela, p.joelhoR[1] + (p.tornozeloR[1] - p.joelhoR[1]) * kCanela];
  let vo = { ...base, torso: { ...base.torso, rot: 8 + 30 * sino(t, 2.3, 4.8, 0.3, 0.4) } };
  vo = comBracos(vo, maoEm(vo, "R", [mT[0] - 4, mT[1] + 6], E("cida"), V("cida")), sino(t, 0.4, 2.3, 0.4, 0.3), "R");
  vo = comBracos(vo, maoEm(vo, "R", alvoCanela, E("cida"), V("cida")), sino(t, 2.3, 4.8, 0.35, 0.35), "R");
  // "olha o corpo inteiro": a mão sobe e desce na frente do Téo
  const corpo = sino(t, 5.2, 7.4, 0.3, 0.3);
  const cabT = p.cabeca;
  vo = comBracos(vo, maoEm(vo, "R", [cabT[0] - 150, cabT[1] + 120 + 200 * (0.5 + 0.5 * Math.sin(t * 4))], E("cida"), V("cida")), corpo, "R");
  vo.head.rot = 20 * sino(t, 2.3, 4.8);
  teo = comBracos(teo, maoEm(teo, "R", [mT[0] - 40, mT[1] - 20], 1), sino(t, 0.6, 2.3, 0.4, 0.3), "R");
  teo.head.rot = 18 * sino(t, 2.4, 4.8);
  return (
    <Camera chaves={[{ t: 0, z: 1.35, cx: 1000, cy: 560 }, { t: 2.3, z: 1.35, cx: 1000, cy: 560 }, { t: 3.0, z: 2.1, cx: p.canelaR[0] - 40, cy: p.canelaR[1] - 60 }, { t: 4.8, z: 2.1, cx: p.canelaR[0] - 40, cy: p.canelaR[1] - 60 }, { t: 5.4, z: 1.35, cx: 1000, cy: 540 }, { t: dur, z: 1.45, cx: 1000, cy: 540 }]} fundo="#1E2A5A">
      <Cozinha noite semPanela t={t} />
      <Cadeira x={X_VO} assento={ASSENTO} chao={CZ} />
      <Cadeira x={X_TEO_C} assento={ASSENTO} chao={CZ} esq />
      <Ator quem="cida" pose={vo} fala={fala("cida")} />
      <MesaCozinha />
      <Ator quem="teo" pose={teo} />
      <Noite forca={0.6} />
    </Camera>
  );
};
const C7Lanterna: React.FC = () => {
  const { t, dur } = usePlano();
  const p = sentado(820, Q.colchao, 1)(t);
  const perna = pts("teo", { ...p, roxo: 1 }).canelaR;
  let teo = maoEm({ ...p, roxo: 1, objR: "lanterna" }, "R", [perna[0] - 30, perna[1] - 170], 1);
  teo = { ...teo, torso: { ...teo.torso, rot: 22 }, head: { rot: 22, offsetY: 0 }, expr: "serio" };
  const m = pts("teo", teo).maoR;
  const varre = Math.sin(t * 1.2) * 30;
  return (
    <Camera chaves={[{ t: 0, z: 1.2, cx: 900, cy: 600 }, { t: dur + 0.6, z: 1.7, cx: 880, cy: 640 }]} fundo="#1E2A5A">
      <QuartoFundo pecas={[]} noite />
      <Ator quem="teo" pose={teo} />
      <QuartoFrente />
      <Noite />
      <path d={`M ${m[0] + 10} ${m[1] + 40} L ${perna[0] - 70 + varre} ${perna[1] + 60} L ${perna[0] + 60 + varre} ${perna[1] + 30} Z`} fill="#FFE9A8" opacity={0.45} />
    </Camera>
  );
};
const C7Final: React.FC = () => {
  const { t, F } = usePlano();
  const teo = parado(760, 1080, 0.8)(t);
  const vo = parado(1160, 1080, E("cida") * 0.8, true)(t);
  const acena = sino(t, F(2).ini, 9, 0.3, 0.1);
  const teoA = comBracos(teo, { ...teo, arm_upper_R: 150 + 20 * Math.sin(t * 9), arm_lower_R: 20 }, acena, "R");
  const voA = comBracos(vo, { ...vo, arm_upper_R: 150 + 20 * Math.sin(t * 9 + 1), arm_lower_R: 20 }, acena, "R");
  const linhas = t < F(1).ini ? ["QUE DOR VOCÊ", "DEIXARIA DE SENTIR?"] : t < F(2).ini ? ["E QUAL VOCÊ NÃO", "TROCARIA POR NADA?"] : ["SE INSCREVE!"];
  const desde = t < F(1).ini ? 0.15 : t < F(2).ini ? F(1).ini : F(2).ini;
  return (
    <Camera chaves={[{ t: 0, z: 1, cx: 960, cy: 540 }]} fundo="#E9707F">
      <Liso cor={t < F(2).ini ? "#86DDBE" : "#E9707F"} padrao="rgba(0,0,0,0.05)" />
      <g key={desde}><Titulo linhas={linhas} desde={desde} y={360} cor={t < F(2).ini ? "#FFD23F" : "#FBFBF7"} /></g>
      <Boneco pose={{ ...teoA, expr: "sorriso" }} esc={0.8} v={ELENCO.teo.v} />
      <Boneco pose={{ ...voA, expr: "sorriso" }} esc={E("cida") * 0.8} v={ELENCO.cida.v} />
    </Camera>
  );
};

export const CAP7: Record<string, React.FC> = { c7_cozinha: C7Cozinha, c7_maos: C7Maos, c7_vira: C7Vira, c7_gene: C7Gene, c7_canela: C7Canela, c7_lanterna: C7Lanterna, c7_final: C7Final };
