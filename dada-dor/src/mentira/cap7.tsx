// Capítulo 7: A laje. Na casa do Tio Beto todo mundo aparece menor (escala K), proporcional à casa.
import React from "react";
import type { NomeElenco } from "../teo/elenco";
import { Ator, Camera, Cartela, E, Impacto, usePlano, V } from "../teo/kit";
import { andar, base, comBracos, maoEm, mix, parado, pulso, rampa, sino, type Fn } from "../teo/motor";
import { Boneco, LINHA, pontos, type PoseTeo } from "../teo/tira";
import { Baloes, NoChao, type Caido, type Emissor } from "./balao";
import { CaixaSom, Celular, LAJE, LajeFrente, LajeFundo, Views } from "./cenarios";
import { porRotulo, Suor, Tela } from "./comum";

const K = 0.62;
const EK = (q: NomeElenco) => E(q) * K;
const PK = (q: NomeElenco, p: PoseTeo) => pontos(p, EK(q), V(q));
const A: React.FC<React.ComponentProps<typeof Ator>> = (props) => <Ator {...props} esc={props.esc ?? EK(props.quem)} />;
const daBocaK = (q: NomeElenco, pose: Fn, lado: 1 | -1, chao: number, extra: Partial<Emissor> = {}) => (t: number): Emissor => ({ boca: PK(q, pose(t)).boca, lado, chao, esc: 0.72, ...extra });

const { chao: CQ, topo: TL, x0: X0, x1: X1, escada: ESC, caixa: XCX } = LAJE;
const X_LIVIA = 1440, X_BETO = 1110, X_TEO_P = 300, X_JORGE_P = 380, X_VIZ = 90;

type Pessoa = { q: NomeElenco; x: number; fundo: boolean; esq: boolean };
const MULTIDAO: Pessoa[] = (["turma1", "maeDudu", "vizinho", "turma2", "marta", "nelson", "caco", "rose", "turma3", "helena", "turma4", "cida", "vendedor", "dudu", "menina", "reporter", "campeao", "medico", "suspeito", "empresario", "apresentador", "delegado"] as NomeElenco[])
  .map((q, i) => ({ q, x: X0 + 150 + ((i * 397) % 900), fundo: i % 2 === 0, esq: i % 3 === 0 }))
  .filter((p) => p.x < 1215 && Math.abs(p.x - X_BETO) > 60);
const Multidao: React.FC<{ t: number; danca: number; olha?: number; vazio?: number }> = ({ t, danca, olha = 0, vazio = 0 }) => (
  <>
    {MULTIDAO.filter((_, i) => i / MULTIDAO.length >= vazio).map((p, i) => {
      const e = EK(p.q) * (p.fundo ? 0.9 : 1);
      const pose = parado(p.x, TL, e, p.esq)(t + i);
      const pula = Math.abs(Math.sin(t * Math.PI * 2 + i)) * 8 * danca;
      const vira = olha > 0 ? { esq: p.x < 1450, head: { rot: 0, offsetY: 0 } } : {};
      return <A key={p.q} quem={p.q} esc={e} pose={{ ...pose, ...vira, esq: olha > 0 ? false : pose.esq, torso: { ...pose.torso, y: pose.torso.y - pula }, arm_upper_R: 20 + 60 * danca * Math.abs(Math.sin(t * 4 + i)), arm_upper_L: -10 - 40 * danca * Math.abs(Math.sin(t * 4 + i + 1)), expr: danca > 0.5 ? "rindo" : olha > 0 ? "surpreso" : "neutro" }} />;
    })}
  </>
);
const liviaBeirada = (t: number, acena = 0): PoseTeo => {
  const p = parado(X_LIVIA, TL, EK("liviaBranco"))(t);
  return { ...p, head: { rot: -16, offsetY: 0 }, expr: "sorriso", arm_upper_R: p.arm_upper_R + (150 - p.arm_upper_R) * acena + 20 * acena * Math.sin(t * 12), arm_lower_R: 10 };
};
const betoLaje: Fn = (t) => ({ ...parado(X_BETO, TL, EK("beto"), true)(t), expr: "sorriso" });
const Churrasqueira: React.FC<{ t: number }> = ({ t }) => (
  <g transform={`translate(${X0 + 80} ${TL}) scale(0.75)`}>
    <rect x={-50} y={-130} width={100} height={130} fill="#B5654A" stroke={LINHA} strokeWidth={6} />
    <rect x={-70} y={-150} width={140} height={24} fill="#3A3A48" stroke={LINHA} strokeWidth={5} />
    {[0, 1, 2].map((i) => { const f = (t * 0.5 + i * 0.33) % 1; return <circle key={i} cx={Math.sin(f * 6 + i) * 20} cy={-180 - f * 200} r={20 + f * 30} fill="#C9C9CF" opacity={0.5 * (1 - f)} />; })}
  </g>
);
const Contagem: React.FC<{ n: number; desde: number }> = ({ n, desde }) => <Tela><Cartela texto={String(n)} x={1740} y={170} tam={130} desde={desde} cor="#FBFBF7" gira={4} /></Tela>;

// ---------------------------------------------------------------- c7_laje
const C7Laje: React.FC = () => {
  const { t, dur } = usePlano();
  return (
    <Camera chaves={[{ t: 0, z: 0.9, cx: 760, cy: 600 }, { t: dur * 0.6, z: 0.9, cx: 1060, cy: 600 }, { t: dur, z: 2.3, cx: X_LIVIA - 30, cy: TL - 110 }]} fundo="#141C46">
      <LajeFundo t={t} />
      <Churrasqueira t={t} />
      <Multidao t={t} danca={1} />
      <A quem="beto" pose={{ ...betoLaje(t), objR: "copo", arm_upper_R: 40, arm_lower_R: 60 }} />
      <CaixaSom x={XCX} y={TL} ligada t={t} />
      <A quem="liviaBranco" pose={liviaBeirada(t)} />
      <LajeFrente t={t} />
    </Camera>
  );
};
// ---------------------------------------------------------------- c7_portao: "aguenta!"
const teoPortao: Fn = (t) => ({ ...parado(X_TEO_P, CQ, K)(t), expr: "serio", head: { rot: -12, offsetY: 0 } });
const jorgePortao: Fn = (t) => ({ ...parado(X_JORGE_P, CQ, EK("jorge"))(t), expr: "sorriso" });
const vizRua: Fn = (t) => ({ ...parado(X_VIZ, CQ, EK("vizinho"))(t), expr: "curioso", head: { rot: -14, offsetY: 0 } });
const xRacha = 1010;
const emissorPortao = porRotulo({ vizinho: daBocaK("vizinho", vizRua, 1, CQ), beto: daBocaK("beto", betoLaje, -1, TL, { xChao: xRacha }) });
const CenaPortao: React.FC<{ t: number; teo: PoseTeo; jorge: PoseTeo; danca?: number; racha?: number; fala?: Record<string, boolean>; liv?: PoseTeo; caixa?: boolean; beto?: PoseTeo; viz?: boolean; olha?: number }> = ({ t, teo, jorge, danca = 1, racha = 0, fala = {}, liv, caixa = true, beto, viz = true, olha = 0 }) => (
  <>
    <LajeFundo t={t} />
    <Churrasqueira t={t} />
    <Multidao t={t} danca={danca} olha={olha} />
    <A quem="beto" pose={beto ?? betoLaje(t)} fala={fala.beto} />
    <CaixaSom x={XCX} y={TL} ligada={caixa} t={t} />
    <A quem="liviaBranco" pose={liv ?? liviaBeirada(t)} />
    <LajeFrente t={t} racha={racha} xRacha={xRacha} />
    {viz && <A quem="vizinho" pose={vizRua(t)} fala={fala.vizinho} />}
    <A quem="jorge" pose={jorge} fala={fala.jorge} />
    <A quem="teo" pose={teo} fala={fala.teo} />
  </>
);
const C7Portao: React.FC = () => {
  const { t, f, fps, dur, fala, F, plano } = usePlano();
  const queda = (plano.baloes ?? []).find((b) => b.rotulo === "beto")?.queda ?? 99;
  const beto = { ...betoLaje(t), arm_upper_R: 140, arm_lower_R: 20, expr: "rindo" as const };
  return (
    <Camera chaves={[{ t: 0, z: 1.7, cx: 280, cy: 780 }, { t: F(1).ini - 0.3, z: 1.7, cx: 280, cy: 780 }, { t: F(1).ini + 0.4, z: 1.8, cx: X_BETO - 60, cy: TL - 140 }, { t: queda - 0.6, z: 1.8, cx: X_BETO - 40, cy: TL - 130 }, { t: queda, z: 2.3, cx: xRacha, cy: TL - 20 }, { t: dur, z: 2.35, cx: xRacha, cy: TL - 10 }]} fundo="#141C46" tremores={[queda]} forca={10}>
      <CenaPortao t={t} teo={teoPortao(t)} jorge={jorgePortao(t)} racha={rampa(t, queda, queda + 0.3)} beto={beto} fala={{ vizinho: fala("vizinho"), beto: fala("beto") }} />
      <Baloes emissor={emissorPortao} />
      <Impacto x={xRacha} y={TL + 10} d={f - Math.round(queda * fps)} raio={34} esc={0.7} angulos={[160, 130, 50, 20]} />
    </Camera>
  );
};
const BALAO_LAJE: Caido[] = [{ x: xRacha, chao: TL, esc: 0.72, rot: 4 }];
// ---------------------------------------------------------------- c7_racha: o estômago cai
const C7Racha: React.FC = () => {
  const { t, dur } = usePlano();
  const teo = { ...teoPortao(t), palido: rampa(t, 0.2, 1.0) * 0.5, expr: "preocupado" as const, head: { rot: -6, offsetY: 0 } };
  const cab = PK("teo", teo).cabeca;
  const desce = rampa(t, 0.1, 0.7) * 30;
  return (
    <Camera chaves={[{ t: 0, z: 4.0, cx: cab[0] + 14, cy: cab[1] + 20 }, { t: 0.8, z: 4.4, cx: cab[0] + 14, cy: cab[1] + 20 + desce }, { t: dur + 0.4, z: 4.5, cx: cab[0] + 14, cy: cab[1] + 20 + desce }]} fundo="#141C46">
      <CenaPortao t={t} teo={teo} jorge={jorgePortao(t)} racha={1} viz={false} />
      <NoChao itens={BALAO_LAJE} />
      <Suor x={cab[0]} y={cab[1]} t={t} r={44} />
    </Camera>
  );
};
// ---------------------------------------------------------------- c7_dez: dez segundos
const C7Dez: React.FC = () => {
  const { t, dur, F } = usePlano();
  const d = F(0).dur, i0 = F(0).ini;
  const a = i0 + d * 0.3, b = i0 + d * 0.62, c = i0 + d * 0.86;
  const liv = liviaBeirada(t, sino(t, 0.3, a, 0.3, 0.3));
  const teo = { ...teoPortao(t), expr: "preocupado" as const, palido: 0.3 };
  const cab = PK("teo", teo).cabeca;
  const chaves = t < a ? [{ t: 0, z: 1.05, cx: 1000, cy: 600 }, { t: a, z: 1.1, cx: 1000, cy: 600 }]
    : t < b ? [{ t: a, z: 3.4, cx: xRacha, cy: TL + 6 }, { t: b, z: 3.6, cx: xRacha, cy: TL + 6 }]
    : t < c ? [{ t: b, z: 3.6, cx: cab[0] + 14, cy: cab[1] + 26 }, { t: c, z: 3.8, cx: cab[0] + 14, cy: cab[1] + 26 }]
    : [{ t: c, z: 3.0, cx: X_LIVIA, cy: TL - 80 }, { t: dur + 0.5, z: 3.4, cx: X_LIVIA, cy: TL - 80 }];
  return (
    <>
      <Camera chaves={chaves} fundo="#141C46">
        <CenaPortao t={t} teo={teo} jorge={jorgePortao(t)} racha={1} liv={liv} />
        <NoChao itens={BALAO_LAJE} />
        {t > b && t < c && <Suor x={cab[0]} y={cab[1]} t={t} r={44} />}
      </Camera>
      <Contagem n={t < 1.0 ? 10 : 9} desde={t < 1.0 ? 0 : 1.0} />
    </>
  );
};
// ---------------------------------------------------------------- c7_braco: "Ei, aonde você vai?"
const C7Braco: React.FC = () => {
  const { t, dur, fala, F } = usePlano();
  const solta = F(1).ini + 0.2;
  const anda = andar(X_TEO_P, X_TEO_P + 200, solta, CQ, K, { correr: true });
  let teo: PoseTeo = t < solta ? { ...teoPortao(t), expr: "bravo", torso: { ...teoPortao(t).torso, x: X_TEO_P + 20 * rampa(t, 0, 0.3), rot: 10 } } : { ...anda(t), expr: "bravo" };
  const braco = PK("teo", teo).bracoR;
  let jorge = jorgePortao(t);
  jorge = comBracos(jorge, maoEm(jorge, "R", [braco[0] - 4, braco[1]], EK("jorge"), V("jorge")), 1 - rampa(t, solta - 0.1, solta + 0.15), "R");
  jorge = { ...jorge, expr: "surpreso" };
  if (t > solta - 0.1 && t < solta + 0.2) teo = { ...teo, arm_upper_R: -30, arm_lower_R: 20 };
  return (
    <>
      <Camera chaves={[{ t: 0, z: 2.3, cx: 380, cy: 800 }, { t: dur, z: 2.2, cx: 460, cy: 800 }]} fundo="#141C46">
        <CenaPortao t={t} teo={teo} jorge={jorge} racha={1} fala={{ jorge: fala("jorge") }} viz={false} />
        <NoChao itens={BALAO_LAJE} />
        <Baloes emissor={porRotulo({ jorge: daBocaK("jorge", jorgePortao, 1, CQ) })} />
      </Camera>
      <Contagem n={t < 1.0 ? 8 : 7} desde={t < 1.0 ? 0 : 1.0} />
    </>
  );
};
// ---------------------------------------------------------------- c7_sobe: sobe a escada e grita
const subindo = (t: number, t0: number, t1: number): PoseTeo => {
  const k = rampa(t, t0, t1, (x) => x);
  const [bx, by] = ESC.baixo, [cx, cy] = ESC.cima;
  const x = bx + 25 + (cx - bx) * k, y = by + (cy - by) * k - 186 * K + 12;
  const p = base(x, y, true);
  const f = Math.sin(k * Math.PI * 11);
  return { ...p, leg_upper_R: 50 + 30 * f, leg_lower_R: -70 - 30 * f, leg_upper_L: 50 - 30 * f, leg_lower_L: -70 + 30 * f, arm_upper_R: 120 + 20 * f, arm_lower_R: 20, arm_upper_L: 110 - 20 * f, arm_lower_L: 20, torso: { ...p.torso, rot: 20 }, expr: "bravo" };
};
const teoTopo: Fn = (t) => ({ ...parado(ESC.cima[0] - 10, TL, K, true)(t), expr: "bravo" });
const C7Sobe: React.FC = () => {
  const { t, dur, fala, F } = usePlano();
  const t0 = 0.0, t1 = 1.5;
  let teo: PoseTeo = t < t1 ? subindo(t, t0, t1) : mix(subindo(t1, t0, t1), teoTopo(t), rampa(t, t1, t1 + 0.25));
  const liv0 = liviaBeirada(t);
  const mL = PK("liviaBranco", liv0).maoL;
  if (t > t1 + 0.3) teo = comBracos(teo, maoEm(teo, "L", [mL[0] + 4, mL[1] - 2], K), rampa(t, t1 + 0.3, t1 + 0.6), "L");
  if (t > F(0).ini - 0.1) teo = comBracos(teo, { ...teo, arm_upper_R: 150, arm_lower_R: 10 }, 1, "R");
  teo = { ...teo, expr: t > F(0).ini ? "grito" : "bravo" };
  const liv = t > t1 + 0.5 ? comBracos({ ...liv0, esq: true, head: { rot: 0, offsetY: 0 }, expr: "surpreso" }, maoEm({ ...liv0, esq: true }, "L", PK("teo", teo).maoL, EK("liviaBranco"), V("liviaBranco")), 1, "L") : liv0;
  return (
    <>
      <Camera chaves={[{ t: 0, z: 1.5, cx: 1640, cy: 760 }, { t: t1, z: 2.0, cx: 1440, cy: 440 }, { t: dur, z: 2.1, cx: 1420, cy: 420 }]} fundo="#141C46">
        <CenaPortao t={t} teo={teo} jorge={{ ...jorgePortao(t), expr: "surpreso" }} racha={1} liv={liv} viz={false} fala={{ teo: fala("teo") }} />
        <NoChao itens={BALAO_LAJE} />
        <Baloes emissor={porRotulo({ teo: daBocaK("teo", teoTopo, -1, TL, { esc: 1.0 }) })} />
      </Camera>
      <Contagem n={t < 1.0 ? 6 : 5} desde={t < 1.0 ? 0 : 1.0} />
    </>
  );
};
// ---------------------------------------------------------------- c7_silencio: desliga a caixa de som
const C7Silencio: React.FC = () => {
  const { t, dur, fala, F, S } = usePlano();
  const tCorta = S("corta_musica");
  const musica = t < tCorta;
  let teo = teoTopo(t);
  const botao: [number, number] = [XCX + 40, TL - 188];
  teo = comBracos(teo, maoEm(teo, "R", botao, K), sino(t, tCorta - 0.5, tCorta + 0.4, 0.3, 0.3), "R");
  teo = { ...teo, expr: t > F(1).ini ? "serio" : "bravo" };
  const beto: PoseTeo = { ...betoLaje(t), esq: false, expr: t > tCorta ? "surpreso" : "sorriso" };
  const liv = { ...liviaBeirada(t), esq: true, head: { rot: 0, offsetY: 0 }, expr: "surpreso" as const };
  return (
    <>
      <Camera chaves={[{ t: 0, z: 1.5, cx: 1220, cy: 400 }, { t: F(1).ini - 0.2, z: 1.55, cx: 1240, cy: 400 }, { t: F(1).ini, z: 2.4, cx: (X_BETO + ESC.cima[0]) / 2, cy: TL - 110 }, { t: dur, z: 2.45, cx: (X_BETO + ESC.cima[0]) / 2, cy: TL - 110 }]} fundo="#141C46">
        <CenaPortao t={t} teo={teo} jorge={jorgePortao(t)} racha={1} liv={liv} viz={false} caixa={musica} danca={musica ? 1 : 0} olha={musica ? 0 : 1} beto={beto} fala={{ teo: fala("teo") }} />
        <NoChao itens={BALAO_LAJE} />
        <Baloes emissor={porRotulo({ teo: daBocaK("teo", teoTopo, -1, TL) })} />
      </Camera>
      <Contagem n={t < F(1).ini - 0.3 ? 4 : 3} desde={t < F(1).ini - 0.3 ? 0 : F(1).ini - 0.3} />
    </>
  );
};
// ---------------------------------------------------------------- c7_confessa
const C7Confessa: React.FC = () => {
  const { t, dur, fala, F } = usePlano();
  const olhaChao = sino(t, 0.3, F(0).ini + 0.6, 0.3, 0.3);
  const betoF: Fn = (tt) => ({ ...betoLaje(tt), esq: false, expr: "triste" });
  const beto = { ...betoF(t), head: { rot: 24 * olhaChao, offsetY: 0 } };
  return (
    <>
      <Camera chaves={[{ t: 0, z: 2.9, cx: X_BETO + 50, cy: TL - 150 }, { t: dur, z: 3.0, cx: X_BETO + 50, cy: TL - 150 }]} fundo="#141C46">
        <CenaPortao t={t} teo={teoTopo(t)} jorge={jorgePortao(t)} racha={1} viz={false} caixa={false} danca={0} olha={1} beto={beto} fala={{ beto: fala("beto") }} />
        <NoChao itens={BALAO_LAJE} />
        <Baloes emissor={porRotulo({ beto: daBocaK("beto", betoF, 1, TL) })} />
      </Camera>
      <Contagem n={2} desde={0} />
    </>
  );
};
// ---------------------------------------------------------------- c7_fogos: descem, meia-noite, a laje estala
const C7Fogos: React.FC = () => {
  const { t, dur, S } = usePlano();
  const tMeia = S("fogos"), tEstala = S("estalo");
  const corte = 2.4;
  if (t < corte) {
    const k = t / corte;
    return (
      <>
        <Camera chaves={[{ t: 0, z: 1.35, cx: 1520, cy: 720 }, { t: corte, z: 1.35, cx: 1560, cy: 740 }]} fundo="#141C46">
          <LajeFundo t={t} />
          <Multidao t={t} danca={0} olha={1} vazio={k} />
          <CaixaSom x={XCX} y={TL} ligada={false} t={t} />
          <LajeFrente t={t} racha={1} xRacha={xRacha} />
          {Array.from({ length: 6 }, (_, i) => {
            const q = (["turma1", "rose", "turma3", "marta", "caco", "vizinho"] as NomeElenco[])[i];
            const s = (t * 0.55 + i / 6) % 1;
            const [bx, by] = ESC.baixo, [cx, cy] = ESC.cima;
            const p = parado(cx + (bx - cx) * s + 25, cy + (by - cy) * s, EK(q), false)(t + i);
            return <A key={i} quem={q} pose={{ ...p, leg_upper_R: 20 * Math.sin(t * 10 + i), leg_upper_L: -20 * Math.sin(t * 10 + i), expr: "bravo" }} />;
          })}
          <NoChao itens={BALAO_LAJE} />
        </Camera>
        <Contagem n={1} desde={0} />
      </>
    );
  }
  const gente: [NomeElenco, number][] = [["turma1", 420], ["rose", 540], ["jorge", 660], ["liviaBranco", 760], ["teo", 830], ["caco", 930], ["marta", 1040], ["beto", 1160], ["vizinho", 1270], ["cida", 1390], ["dudu", 1500], ["turma2", 1600], ["maeDudu", 1700]];
  const estala = rampa(t, tEstala, tEstala + 0.5);
  return (
    <Camera chaves={[{ t: corte, z: 0.95, cx: 960, cy: 560 }, { t: tEstala - 0.2, z: 0.98, cx: 960, cy: 560 }, { t: tEstala, z: 1.6, cx: 920, cy: TL + 30 }, { t: dur + 0.8, z: 1.65, cx: 920, cy: TL + 30 }]} fundo="#141C46" tremores={[tEstala]} forca={14}>
      <LajeFundo t={t} fogos={t > tMeia ? t - tMeia : -1} />
      <CaixaSom x={XCX} y={TL} ligada={false} t={t} />
      <LajeFrente t={t} racha={1} rachaLonga={estala} xRacha={xRacha} />
      {estala > 0 && Array.from({ length: 8 }, (_, i) => { const d = (t - tEstala) * 300; return <circle key={i} cx={X0 + 100 + i * 140} cy={TL + 30 + d * (0.6 + (i % 3) * 0.2)} r={5} fill="#B9B9C2" />; })}
      {gente.map(([q, x], i) => <A key={q} quem={q} pose={{ ...parado(x, CQ, EK(q), i % 2 === 1)(t + i), head: { rot: -18, offsetY: 0 }, expr: t > tEstala + 0.2 ? "surpreso" : "sorriso" }} />)}
    </Camera>
  );
};
// ---------------------------------------------------------------- c7_fake: vinte milhões de views
const C7Fake: React.FC = () => {
  const { t, dur, F } = usePlano();
  const n = Math.pow(rampa(t, 0.4, F(0).ini + F(0).dur * 0.5, (x) => x), 1.6) * 20_000_000;
  const fake = t > F(0).ini + F(0).dur * 0.62;
  const virou = t > dur - 1.0;
  return (
    <Camera chaves={[{ t: 0, z: 1, cx: 960, cy: 540 }]} fundo="#E23B2E">
      <rect x={-400} y={-400} width={2800} height={1900} fill="#E23B2E" />
      <Celular x={700}>
        <svg x={0} y={0} width={580} height={500} viewBox="1200 200 520 446" preserveAspectRatio="xMidYMid slice">
          <LajeFundo t={t} />
          <Boneco pose={{ ...parado(ESC.cima[0] - 10, TL, K, true)(t), arm_upper_R: 150, arm_lower_R: 10, expr: "grito" }} esc={K} />
          <LajeFrente t={t} racha={1} xRacha={xRacha} />
        </svg>
        {[0, 1, 2, 3].map((i) => (
          <g key={i} transform={`translate(20 ${530 + i * 84})`}>
            <circle cx={24} cy={30} r={22} fill={["#E9707F", "#7FB7F0", "#9BD47A", "#F2C94C"][i]} stroke={LINHA} strokeWidth={3} />
            <rect x={56} y={8} width={480} height={50} rx={14} fill="#F4F6F8" />
            <path d="M 76 34 q 16 -10 32 0 t 32 0 t 32 0 t 32 0" stroke={LINHA} strokeWidth={5} fill="none" />
            {fake && !virou && <g transform="translate(420 34) rotate(-8)"><rect x={-56} y={-20} width={112} height={40} rx={6} fill="#E23B2E" stroke={LINHA} strokeWidth={3} /><text x={0} y={12} textAnchor="middle" fontFamily="Montserrat" fontWeight={900} fontSize={28} fill="#FBFBF7">FAKE</text></g>}
            {virou && <path transform="translate(420 34) scale(1.1)" d="M 0 14 c -26 -18 -30 -36 -12 -40 c 8 -2 12 4 12 8 c 0 -4 4 -10 12 -8 c 18 4 14 22 -12 40 Z" fill="#E9707F" stroke={LINHA} strokeWidth={3} />}
          </g>
        ))}
      </Celular>
      <Views x={1240} y={180} n={n} esc={1.15} />
      {fake && !virou && <Cartela texto="FAKE?" x={1480} y={560} tam={120} desde={F(0).ini + F(0).dur * 0.62} cor="#FBFBF7" />}
      {virou && <g transform="translate(1480 600)"><circle r={120} fill="#FBFBF7" stroke={LINHA} strokeWidth={9} /><line x1={0} y1={0} x2={0} y2={-80} stroke={LINHA} strokeWidth={10} strokeLinecap="round" /><line x1={0} y1={0} x2={60} y2={0} stroke="#E23B2E" strokeWidth={12} strokeLinecap="round" /></g>}
    </Camera>
  );
};
// ---------------------------------------------------------------- c7_salvou: manhã seguinte
const C7Salvou: React.FC = () => {
  const { t, dur, fala } = usePlano();
  const corre = andar(260, 860, -0.3, CQ, EK("liviaBranco"), { correr: true });
  let liv: PoseTeo = { ...corre(t), expr: "rindo" };
  let teo: PoseTeo = { ...parado(940, CQ, K, true)(t), expr: "sorriso" };
  const empurra = pulso(t, corre.fim, 0.6);
  teo = { ...teo, torso: { ...teo.torso, rot: -14 * empurra, x: teo.torso.x + 14 * empurra } };
  const pT = PK("teo", teo);
  if (t > corre.fim - 0.1) liv = comBracos(liv, maoEm(maoEm(liv, "R", pT.peito, EK("liviaBranco"), V("liviaBranco")), "L", [pT.peito[0] - 6, pT.peito[1] + 14], EK("liviaBranco"), V("liviaBranco")), rampa(t, corre.fim - 0.1, corre.fim + 0.2));
  const betoF: Fn = (tt) => ({ ...parado(1110, CQ, EK("beto"), true)(tt), expr: "serio", head: { rot: 18, offsetY: 0 } });
  let beto = betoF(t);
  const meio: [number, number] = [1025, CQ - 150];
  beto = comBracos(beto, maoEm(beto, "R", [meio[0] + 6, meio[1]], EK("beto"), V("beto")), rampa(t, 1.0, 1.4), "R");
  teo = comBracos(teo, maoEm(teo, "R", [meio[0] - 6, meio[1]], K), rampa(t, 1.1, 1.5), "R");
  return (
    <Camera chaves={[{ t: 0, z: 1.9, cx: 980, cy: 790 }, { t: dur, z: 1.95, cx: 990, cy: 790 }]}>
      <rect x={-400} y={-400} width={2800} height={2000} fill="#BFE6FF" />
      <rect x={X0} y={TL + 28} width={X1 - X0} height={CQ - TL - 28} fill="#E9C9A0" stroke={LINHA} strokeWidth={7} />
      <LajeFrente t={t} racha={1} rachaLonga={1} xRacha={xRacha} />
      <rect x={-400} y={CQ} width={2800} height={500} fill="#8A8A72" />
      <line x1={-400} y1={CQ} x2={2400} y2={CQ} stroke={LINHA} strokeWidth={9} />
      <A quem="beto" pose={beto} fala={fala("beto")} />
      <A quem="teo" pose={teo} />
      <A quem="liviaBranco" pose={liv} />
      <Baloes emissor={porRotulo({ beto: daBocaK("beto", betoF, 1, CQ) })} />
    </Camera>
  );
};

export const CAP7: Record<string, React.FC> = {
  c7_laje: C7Laje, c7_portao: C7Portao, c7_racha: C7Racha, c7_dez: C7Dez, c7_braco: C7Braco, c7_sobe: C7Sobe, c7_silencio: C7Silencio, c7_confessa: C7Confessa, c7_fogos: C7Fogos, c7_fake: C7Fake, c7_salvou: C7Salvou,
};
