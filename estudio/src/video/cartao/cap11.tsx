// Capítulo 11 (falas 258 a 293): os mercados abrem (o real oscila, cai, estabiliza, sobe no almoço, volta ao patamar
// de um mês atrás; os preços param de subir; o pânico some). A revelação: a dívida continua paga. O telefonema da noite.
// Sexta-feira: "Minha vez." Uma semana depois, o estranho de moletom cinza bate à porta com um envelope: um cartão branco,
// sem nome, sem limite, com um relógio no lugar do cifrão. Ele imprime tempo. "Então, você cortaria o cartão?"
import React from "react";
import { AbsoluteFill } from "remotion";
import { Person, type PersonProps } from "../../components/Person";
import { expressaoNoQuadro } from "../../components/Face";
import { idle, point, scared, walk } from "../../rig/actions";
import { CEDULA, SACO } from "../../objects/extras";
import { CARTAO_BRANCO, ENVELOPE, PIZZA, TESOURA } from "../../objects/extras2";
import { emPe, sentadoEm } from "../../cenarios/ancoras";
import { liso } from "../../cenarios/liso/Liso";
import { RUA } from "../../cenarios/rua/Rua";
import { SALA } from "../../cenarios/sala/Sala";
import { ESCRITORIO } from "../../cenarios/escritorio/Escritorio";
import { AMIGO, ESTRANHO, PRESIDENTE_BC, PROTAGONISTA, figurante } from "../../elenco/elenco";
import { emPeNa, olhar, props, sentadoNa } from "../../fase4/Cenarios";
import { FONTE } from "../../fontes";
import { Estrela, Grafico, IconeCalendario, IconeContrato, IconeRelogio, IconeTV, IconeX, Selo, Texto, TextoPop, escalaPop } from "../graficos";
import { sit } from "../../rig/actions";
import { CenaCam, entre, falando, fracDe, segura, type PlanoV } from "./comum";
import { CORTE, T } from "./tempo";
import { FIM_CAP10 } from "./cap10";
import { Carimbo } from "./cap7";
import { Conta, naOrelha } from "./cap9";
import { PORTA, VARANDA } from "./cenas";

const L = "#141414";
const ESCURO = liso("#26313F");
const BEGE = liso("#EADFCB");

// ------------------------------------------------------------------ 98. os mercados abrem: o real oscila, cai, se estabiliza; sobe no almoço; no fim da semana volta ao patamar de um mês atrás
const PTS_REAL: [number, number][] = [[0, 0.5], [0.06, 0.62], [0.12, 0.4], [0.18, 0.56], [0.26, 0.18], [0.34, 0.24], [0.42, 0.22], [0.5, 0.24], [0.62, 0.4], [0.74, 0.56], [0.86, 0.66], [1, 0.7]];
const p98: PlanoV = {
  nome: "os mercados abrem", de: FIM_CAP10, ate: CORTE(261), enquadra: { x: 960, y: 560, zoom: 1.0 },
  eventos: [
    { f: FIM_CAP10, tipo: "corte", desc: "a tela do mercado" },
    { f: T(258, fracDe(258, "abrem")), tipo: "objeto", desc: "MERCADO ABERTO" },
    { f: T(259, fracDe(259, "oscila")), tipo: "objeto", desc: "o real oscila" },
    { f: T(259, fracDe(259, "cai")), tipo: "objeto", desc: "a linha cai", verbo: "cair" },
    { f: T(259, fracDe(259, "estabiliza")), tipo: "objeto", desc: "estabiliza" },
    { f: T(260, fracDe(260, "almoço")), tipo: "objeto", desc: "meio-dia: começa a subir", verbo: "subir" },
    { f: T(261, fracDe(261, "final da semana")), tipo: "objeto", desc: "sexta-feira" },
    { f: T(261, fracDe(261, "um mês atrás")), tipo: "objeto", desc: "a linha de um mês atrás" },
  ],
  Cena: ({ f, cam }) => <CenaCam cenario={ESCURO} f={f} cam={cam} />,
  Sobre: ({ f }) => {
    // quanto da linha aparece em cada trecho da narração
    const k = f < T(259) ? 0.03 : f < T(259, fracDe(259, "cai")) ? 0.03 + 0.17 * entre(f, T(259), T(259, fracDe(259, "cai"))) : f < T(259, fracDe(259, "estabiliza")) ? 0.2 + 0.12 * entre(f, T(259, fracDe(259, "cai")), T(259, fracDe(259, "estabiliza"))) : f < T(260) ? 0.32 + 0.12 * entre(f, T(259, fracDe(259, "estabiliza")), T(260)) : f < T(261) ? 0.44 + 0.26 * entre(f, T(260, fracDe(260, "almoço")), T(261)) : 0.7 + 0.3 * entre(f, T(261), T(261, 0.8));
    const sAb = escalaPop(f, T(258, fracDe(258, "abrem")), Infinity);
    return (
      <>
        <g transform="translate(960 500) scale(2.3)">
          <IconeTV w={500} h={300}>
            <rect x={-238} y={-138} width={476} height={276} fill="#1A1F29" />
            {[0.25, 0.5, 0.75].map((y) => <line key={y} x1={-220} y1={120 - y * 240} x2={220} y2={120 - y * 240} stroke="#2F3A4B" strokeWidth={2} />)}
            {f >= T(261, fracDe(261, "um mês atrás")) && <line x1={-220} y1={120 - 0.7 * 240} x2={220} y2={120 - 0.7 * 240} stroke="#F2D16B" strokeWidth={3} strokeDasharray="10 8" />}
            <g transform="translate(0 0)">
              <polyline points={PTS_REAL.map(([x, y]) => `${(-220 + x * 440).toFixed(1)},${(120 - y * 240).toFixed(1)}`).join(" ")} fill="none" stroke="#7FD18C" strokeWidth={5} strokeLinejoin="round" strokeLinecap="round" pathLength={1} strokeDasharray={`${k} 1`} />
            </g>
            <text x={-220} y={-112} fontFamily={FONTE} fontWeight={900} fontSize={20} fill="#FFFFFF">R$</text>
          </IconeTV>
        </g>
        {sAb > 0 && (
          <g transform={`translate(960 90) scale(${sAb})`}>
            <rect x={-230} y={-40} width={460} height={80} rx={14} fill="#3E8E5A" stroke={L} strokeWidth={6} />
            <text x={0} y={16} textAnchor="middle" fontFamily={FONTE} fontWeight={900} fontSize={44} fill="#FFFFFF">MERCADO ABERTO</text>
          </g>
        )}
        {(() => { const s = escalaPop(f, T(260, fracDe(260, "almoço")), T(261)); return s > 0 ? <g transform={`translate(1730 300) scale(${1.4 * s})`}><IconeRelogio giro={0} /><Texto texto="12:00" tam={34} y={100} /></g> : null; })()}
        {(() => { const s = escalaPop(f, T(261, fracDe(261, "final da semana")), CORTE(261)); return s > 0 ? <g transform={`translate(1730 300) scale(${1.6 * s})`}><IconeCalendario texto="SEXTA" cor="#2F6E9E" /></g> : null; })()}
        <TextoPop x={960} y={905} f={f} de={T(261, fracDe(261, "um mês atrás"))} ate={CORTE(261)} texto="COMO HÁ UM MÊS" tam={54} cor="#F2D16B" rot={-2} />
      </>
    );
  },
};

// ------------------------------------------------------------------ 99. os preços continuam altos, mas param de subir; lentamente, o pânico desaparece
const p99: PlanoV = {
  nome: "o pânico desaparece", de: CORTE(261), ate: CORTE(263), enquadra: { x: 960, y: 600, zoom: 1.0 },
  eventos: [
    { f: CORTE(261), tipo: "corte", desc: "a rua" },
    { f: T(262, fracDe(262, "altos")), tipo: "objeto", desc: "o preço alto, a linha reta", verbo: "subir" },
    { f: T(263, fracDe(263, "desaparece")), tipo: "pose", desc: "as pessoas relaxam" },
  ],
  Cena: ({ f, cam }) => {
    const set = RUA.set;
    const calmo = f >= T(263, fracDe(263, "pânico"));
    const xs = [260, 640, 1280, 1660];
    const gente = xs.map((x, i) => {
      const a = figurante(161 + i * 3);
      const base = { ...emPe(set, "chao", x, 0, a.scale ?? 1), wide: a.wide };
      const solta = calmo ? entre(f, T(263, fracDe(263, "pânico")) + i * 6, T(263, fracDe(263, "pânico")) + i * 6 + 14) : 0;
      const m: PersonProps = solta >= 1 ? { ...props(a), ...idle(base)(f + i * 9), expr: "neutro" } : { ...props(a), ...scared(base)(30 + i), expr: solta > 0.4 ? "neutro" : "chocado" };
      m.lookAt = olhar(m, [960, 600]);
      return m;
    });
    return <CenaCam cenario={RUA} f={f} cam={cam} noMeio={<>{gente.map((m, i) => <Person key={i} {...m} semente={161 + i * 3} />)}</>} />;
  },
  Sobre: ({ f }) => {
    const s = escalaPop(f, T(262, fracDe(262, "altos")), CORTE(262) + 10);
    const k = entre(f, T(262, fracDe(262, "altos")), T(262, 0.95));
    return s > 0 ? (
      <g transform={`translate(960 430) scale(${0.8 * s})`}>
        <Grafico pontos={[[0, 0.15], [0.3, 0.6], [0.45, 0.82], [0.6, 0.85], [1, 0.85]]} k={k} cor="#C0504D" />
        <g transform="translate(330 -110)"><Texto texto="R$ 3,80" tam={60} cor="#FFFFFF" /></g>
      </g>
    ) : null;
  },
};

// ------------------------------------------------------------------ 100. a revelação: a dívida pública continua paga, cada centavo; ninguém pode desfazer
const Cadeado: React.FC = () => (
  <g>
    <path d="M -34 -10 L -34 -40 Q -34 -76 0 -76 Q 34 -76 34 -40 L 34 -10" fill="none" stroke={L} strokeWidth={16} />
    <path d="M -34 -10 L -34 -40 Q -34 -76 0 -76 Q 34 -76 34 -40 L 34 -10" fill="none" stroke="#B9BEC6" strokeWidth={8} />
    <rect x={-56 + 6} y={-12 + 7} width={112} height={90} rx={14} fill="#D6D2CA" />
    <rect x={-56} y={-12} width={112} height={90} rx={14} fill="#E3B95B" stroke={L} strokeWidth={7} />
    <circle cx={0} cy={26} r={11} fill={L} />
    <rect x={-4} y={30} width={8} height={24} fill={L} />
  </g>
);
const p100: PlanoV = {
  nome: "a revelação: a dívida continua paga", de: CORTE(263), ate: CORTE(268), enquadra: { x: 960, y: 560, zoom: 1.0 },
  eventos: [
    { f: CORTE(263), tipo: "corte", desc: "a revelação" },
    { f: T(264, fracDe(264, "revelação")), tipo: "objeto", desc: "!" },
    { f: T(265), tipo: "objeto", desc: "a conta da dívida: PAGO", verbo: "pagar" },
    { f: T(266), tipo: "objeto", desc: "R$ 0,00" },
    { f: T(267), tipo: "expressao", desc: "você pagou tudo: sorriso", verbo: "pagar" },
    { f: T(268, fracDe(268, "desfazer")), tipo: "objeto", desc: "cadeado" },
  ],
  Cena: ({ f, cam }) => {
    const set = BEGE.set;
    const p: PersonProps = { ...props(PROTAGONISTA), ...idle(emPe(set, "chao", 420))(f), expr: expressaoNoQuadro([[0, "chocado"], [T(265), "olhar-lateral"], [T(267), "rindo"], [T(268), "convencido"]], f, 6) };
    p.lookAt = olhar(p, [1200, 400]);
    return <CenaCam cenario={BEGE} f={f} cam={cam} noMeio={<Person {...p} semente={1} />} />;
  },
  Sobre: ({ f }) => {
    const s = escalaPop(f, T(268, fracDe(268, "desfazer")), CORTE(268) + 10);
    return (
      <>
        <TextoPop x={420} y={260} f={f} de={T(264, fracDe(264, "revelação"))} ate={T(265)} texto="!" tam={200} cor="#F2D16B" rot={6} />
        {f >= T(265) && <g transform="translate(1200 -20)"><Conta k={1} zerada={f >= T(266)} /></g>}
        <Carimbo x={1200} y={330} f={f} de={T(265, 0.4)} ate={CORTE(268) + 10} texto="PAGO" cor="#3E8E5A" tam={90} rot={-12} />
        {s > 0 && <g transform={`translate(1430 300) scale(${1.2 * s})`}><Cadeado /></g>}
      </>
    );
  },
};

// ------------------------------------------------------------------ 101. naquela noite, o presidente do Banco Central liga de novo: todo rei, todo imperador, todo bilionário queria mais; você tinha tudo e desistiu em 10 segundos
const Coroa: React.FC = () => (
  <g>
    <path d="M -60 30 L -60 -30 L -30 0 L 0 -40 L 30 0 L 60 -30 L 60 30 Z" fill="#E3B95B" stroke={L} strokeWidth={6} strokeLinejoin="round" />
    {[-30, 0, 30].map((x) => <circle key={x} cx={x} cy={16} r={7} fill="#C0504D" stroke={L} strokeWidth={3} />)}
  </g>
);
const Louros: React.FC = () => (
  <g>
    {[-1, 1].map((s) => (
      <g key={s} transform={`scale(${s} 1)`}>
        <path d="M 10 50 Q -60 30 -50 -40" fill="none" stroke="#4F8A3B" strokeWidth={6} />
        {[0, 1, 2, 3, 4].map((i) => <ellipse key={i} cx={-44 + i * 4} cy={36 - i * 18} rx={16} ry={7} fill="#7AA35B" stroke={L} strokeWidth={3} transform={`rotate(${-40 + i * 12} ${-44 + i * 4} ${36 - i * 18})`} />)}
      </g>
    ))}
  </g>
);
const p101: PlanoV = {
  nome: "o telefonema da noite", de: CORTE(268), ate: CORTE(271), enquadra: { x: 960, y: 560, zoom: 1.0 }, pushIn: 0.04,
  eventos: [
    { f: CORTE(268), tipo: "corte", desc: "à noite: tela dividida" },
    { f: CORTE(268) + 3, tipo: "objeto", desc: "NAQUELA NOITE" },
    { f: T(269, fracDe(269, "liga")), tipo: "objeto", desc: "TRIM!" },
    { f: T(270, fracDe(270, "rei")), tipo: "objeto", desc: "coroa" },
    { f: T(270, fracDe(270, "imperador")), tipo: "objeto", desc: "louros" },
    { f: T(270, fracDe(270, "bilionário")), tipo: "objeto", desc: "saco de dinheiro" },
    { f: T(271, fracDe(271, "10 segundos")), tipo: "objeto", desc: "10 SEGUNDOS" },
  ],
  Cena: ({ f, cam }) => {
    const z = (cam.zoom ?? 1) * 1.25;
    const sala = SALA.set;
    let p: PersonProps = sentadoNa(PROTAGONISTA, sala, "sofa_meio", f, { expr: expressaoNoQuadro([[0, "neutro"], [T(271), "olhar-lateral"]], f, 6) });
    p = naOrelha(p, "R");
    p.lookAt = olhar(p, [1300, 520]);
    const esc = ESCRITORIO.set;
    const e = sentadoEm(esc, "cadeira_esq");
    let pres: PersonProps = { ...props(PRESIDENTE_BC), ...sit({ ...e, wide: PRESIDENTE_BC.wide })(f + 30), expr: "convencido", fala: falando(f, T(270), T(270, 1)) || falando(f, T(271), T(271, 1)) };
    pres = naOrelha(pres, "R");
    pres.lookAt = olhar(pres, [300, 520]);
    const noite = { position: "absolute" as const, inset: 0, background: "#0E1A3A", opacity: 0.42, mixBlendMode: "multiply" as const };
    return (
      <>
        <AbsoluteFill style={{ clipPath: "inset(0 50% 0 0)" }}>
          <CenaCam cenario={SALA} f={f} cam={{ x: 850 + 480 / z, y: 600, zoom: z }} naFrente={<Person {...p} semente={1} />} />
          <div style={noite} />
        </AbsoluteFill>
        <AbsoluteFill style={{ clipPath: "inset(0 0 0 50%)" }}>
          <CenaCam cenario={ESCRITORIO} f={f} cam={{ x: 660 - 480 / z, y: 600, zoom: z }} noMeio={<Person {...pres} semente={8} />} />
          <div style={noite} />
        </AbsoluteFill>
      </>
    );
  },
  Sobre: ({ f }) => (
    <>
      <rect x={952} y={0} width={16} height={1080} fill="#F4F1EA" stroke={L} strokeWidth={5} />
      <TextoPop x={480} y={110} f={f} de={CORTE(268) + 3} ate={T(270)} texto="NAQUELA NOITE" tam={56} cor="#F2D16B" rot={-2} />
      <Estrela x={760} y={300} f={f} de={T(269, fracDe(269, "liga"))} ate={T(270)} texto="TRIM!" r={70} rot={8} />
      <Selo x={1130} y={180} f={f} de={T(270, fracDe(270, "rei"))} ate={CORTE(270)} r={80}><Coroa /></Selo>
      <Selo x={1440} y={180} f={f} de={T(270, fracDe(270, "imperador"))} ate={CORTE(270)} r={80}><Louros /></Selo>
      <Selo x={1750} y={180} f={f} de={T(270, fracDe(270, "bilionário"))} ate={CORTE(270)} r={80}><g transform="translate(0 50) scale(0.9)"><SACO.Desenho t={0} comprimento={1} /></g></Selo>
      <TextoPop x={1440} y={330} f={f} de={T(270, fracDe(270, "queria mais"))} ate={CORTE(270)} texto="QUERIAM MAIS" tam={50} rot={-2} />
      <TextoPop x={1440} y={200} f={f} de={T(271, fracDe(271, "10 segundos"))} ate={CORTE(271)} texto="10 SEGUNDOS" tam={76} cor="#E0826E" rot={-3} />
    </>
  ),
};

// ------------------------------------------------------------------ 102. sexta-feira: o amigo com duas caixas de pizza. "Minha vez." Você ri. "É sempre sua vez." "Não mais. Na próxima semana é por sua conta. É melhor conseguir um emprego."
const p102: PlanoV = {
  nome: "sexta: minha vez, pela última vez", de: CORTE(271), ate: CORTE(278), enquadra: { x: 980, y: 600, zoom: 1.3 },
  eventos: [
    { f: CORTE(271), tipo: "corte", desc: "sexta-feira: o amigo chega com duas pizzas" },
    { f: T(272, fracDe(272, "duas caixas")), tipo: "objeto", desc: "duas caixas de pizza" },
    { f: T(273), tipo: "pose", desc: "minha vez" },
    { f: T(274), tipo: "expressao", desc: "você ri", verbo: "rir" },
    { f: T(275), tipo: "pose", desc: "é sempre sua vez" },
    { f: T(276), tipo: "pose", desc: "não mais: aponta para você" },
    { f: T(278, fracDe(278, "emprego")), tipo: "objeto", desc: "emprego" },
  ],
  Cena: ({ f, cam }) => {
    const set = SALA.set;
    const chega = walk({ ...emPe(set, "chao", 1560), xa: 1560, xb: 1190, f0: CORTE(271) + 2, quadros: 7 });
    const fala = falando(f, T(273), T(273, 1)) || falando(f, T(276), T(278, 1));
    let a: PersonProps = f >= T(276) ? { ...props(AMIGO), ...point({ ...emPe(set, "chao", 1190), alvo: [-178, -238], expr: "rindo" })(f - T(276)), fala } : { ...props(AMIGO), ...(f < chega.fim ? chega(f) : idle(emPe(set, "chao", 1190))(f)), expr: "rindo", fala };
    if (f < T(276)) a = { ...a, handL: [-60, -200], handR: [60, -200], gripL: "open", gripR: "open", propsHands: <g transform="translate(0 -176) scale(2)"><PIZZA.Desenho t={0} /><g transform="translate(0 -20)"><PIZZA.Desenho t={0} /></g></g> };
    a.lookAt = olhar(a, [760, 520]);
    const p: PersonProps = { ...props(PROTAGONISTA), ...idle(emPe(set, "chao", 760))(f), expr: expressaoNoQuadro([[0, "neutro"], [T(274), "rindo"], [T(276), "chocado"], [T(278), "rindo"]], f, 6), fala: falando(f, T(275), T(275, 1)) };
    p.lookAt = olhar(p, [1190, 520]);
    return <CenaCam cenario={SALA} f={f} cam={cam} noMeio={<><Person {...p} semente={1} /><Person {...a} semente={4} /></>} />;
  },
  Sobre: ({ f }) => (
    <>
      <Selo x={300} y={250} f={f} de={CORTE(271) + 3} ate={T(273)} r={1}><g transform="scale(1.7)"><IconeCalendario texto="SEXTA" cor="#4F8A6B" /></g></Selo>
      <TextoPop x={1500} y={200} f={f} de={T(273)} ate={CORTE(273)} texto="“MINHA VEZ.”" tam={72} cor="#F2D16B" rot={4} />
      <TextoPop x={480} y={200} f={f} de={T(275)} ate={CORTE(275)} texto="“É SEMPRE SUA VEZ.”" tam={60} rot={-3} />
      <TextoPop x={1500} y={200} f={f} de={T(276)} ate={T(277)} texto="“NÃO MAIS.”" tam={72} cor="#E0826E" rot={4} />
      <Selo x={1500} y={260} f={f} de={T(277)} ate={T(278)} r={1}><g transform="scale(1.6)"><IconeCalendario texto="VOCÊ" sub="PRÓXIMA SEMANA" cor="#C0504D" /></g></Selo>
      <Selo x={1500} y={260} f={f} de={T(278, fracDe(278, "emprego"))} ate={CORTE(278)} r={100} rotulo="EMPREGO"><g transform="scale(1.1)"><IconeContrato /></g></Selo>
    </>
  ),
};

// ------------------------------------------------------------------ 103. uma semana depois, alguém bate à porta: um estranho de moletom cinza, óculos escuros e um envelope branco
const p103: PlanoV = {
  nome: "o estranho na porta", de: CORTE(278), ate: CORTE(283), enquadra: { x: 760, y: 580, zoom: 1.15 },
  eventos: [
    { f: CORTE(278), tipo: "corte", desc: "uma semana depois: a varanda" },
    { f: T(279, fracDe(279, "bate")), tipo: "pose", desc: "bate à porta: TOC TOC", verbo: "bater" },
    { f: T(280), tipo: "objeto", desc: "a porta abre: um estranho" },
    { f: T(281), tipo: "objeto", desc: "moletom cinza" },
    { f: T(281, fracDe(281, "óculos")), tipo: "objeto", desc: "óculos escuros" },
    { f: T(281, fracDe(281, "envelope")), tipo: "objeto", desc: "envelope branco" },
    { f: T(282), tipo: "pose", desc: "ele fala" },
    { f: T(282, fracDe(282, "10 segundos")), tipo: "objeto", desc: "10 SEGUNDOS" },
    { f: T(283, fracDe(283, "única pessoa")), tipo: "objeto", desc: "A ÚNICA PESSOA NO PLANETA" },
    { f: T(283, fracDe(283, "confiar")), tipo: "pose", desc: "estende o envelope" },
  ],
  Cena: ({ f, cam }) => {
    const set = VARANDA.set;
    const fB = T(279, fracDe(279, "bate"));
    const bate = f >= fB && f < T(280) ? Math.abs(Math.sin((f - fB) / 2.2)) : 0;
    let e: PersonProps = emPeNa(ESTRANHO, set, "chao", 800, f, { expr: "neutro", fala: falando(f, T(282), T(283, 1)) });
    if (f < T(280)) e = { ...e, handL: [-130 + 14 * bate, -300], gripL: "fist" };
    const entrega = entre(f, T(283, fracDe(283, "confiar")), T(283, fracDe(283, "confiar")) + 10);
    e = segura(e, "R", f >= T(283, fracDe(283, "confiar")) ? [74 - 170 * entrega, -220] : [76, -180], ENVELOPE, { t: 0 }, 0);
    e.lookAt = olhar(e, [535, 520]);
    const abre = entre(f, T(280), T(280) + 8);
    const p: PersonProps | null = f >= T(280) + 4 ? { ...props(PROTAGONISTA), ...idle(emPe(set, "chao", 535))(f), expr: f >= T(282) ? "chocado" : "neutro" } : null;
    if (p) p.lookAt = olhar(p, [800, 520]);
    return (
      <CenaCam cenario={VARANDA} f={f} cam={cam}
        noMeio={<>
          {abre > 0 && <rect x={PORTA.x0} y={PORTA.topo} width={(PORTA.x1 - PORTA.x0) * abre} height={PORTA.base - PORTA.topo} fill="#2A2420" />}
          {p && <Person {...p} semente={1} />}
          <Person {...e} semente={12} />
        </>}
      />
    );
  },
  Sobre: ({ f }) => {
    const fB = T(279, fracDe(279, "bate"));
    const seta = (x1: number, y1: number, x2: number, y2: number) => <path d={`M ${x1} ${y1} L ${x2} ${y2}`} stroke="#FFFFFF" strokeWidth={8} strokeLinecap="round" />;
    return (
      <>
        {(() => { const s = escalaPop(f, CORTE(278) + 3, T(279, fracDe(279, "bate"))); return s > 0 ? <g transform={`translate(1650 220) scale(${1.5 * s})`}><IconeCalendario texto="+7" sub="DIAS" cor="#2F6E9E" /></g> : null; })()}
        <Estrela x={600} y={360} f={f} de={fB} ate={fB + 14} texto="TOC!" r={70} rot={-8} />
        <Estrela x={680} y={260} f={f} de={fB + 8} ate={T(280)} texto="TOC!" r={70} rot={6} />
        <TextoPop x={1300} y={200} f={f} de={T(280)} ate={T(281)} texto="UM ESTRANHO" tam={70} cor="#F2D16B" rot={-3} />
        {f >= T(281) && f < T(282) && (
          <g>
            {seta(1310, 700, 1150, 640)}
            <TextoPop x={1440} y={720} f={f} de={T(281)} ate={T(282)} texto="MOLETOM CINZA" tam={44} rot={-2} />
            {f >= T(281, fracDe(281, "óculos")) && seta(1300, 330, 1080, 290)}
            <TextoPop x={1450} y={330} f={f} de={T(281, fracDe(281, "óculos"))} ate={T(282)} texto="ÓCULOS ESCUROS" tam={44} rot={2} />
            {f >= T(281, fracDe(281, "envelope")) && seta(1330, 520, 1180, 560)}
            <TextoPop x={1480} y={520} f={f} de={T(281, fracDe(281, "envelope"))} ate={T(282)} texto="ENVELOPE BRANCO" tam={44} cor="#FFFFFF" rot={-2} />
          </g>
        )}
        <TextoPop x={1350} y={180} f={f} de={T(282, fracDe(282, "10 segundos"))} ate={T(283)} texto="10 SEGUNDOS" tam={64} cor="#E0826E" rot={-3} />
        <TextoPop x={1350} y={180} f={f} de={T(283, fracDe(283, "única pessoa"))} ate={T(283, fracDe(283, "confiar"))} texto="A ÚNICA PESSOA" tam={64} cor="#FFFFFF" rot={-3} />
        <TextoPop x={1350} y={180} f={f} de={T(283, fracDe(283, "confiar"))} ate={CORTE(283)} texto="“PODEMOS CONFIAR”" tam={58} cor="#F2D16B" rot={-3} />
      </>
    );
  },
};

// ------------------------------------------------------------------ 104. dentro do envelope, um cartão: branco, sem nome, sem limite, e um relógio no lugar do cifrão
const CartaoBrancoGrande: React.FC<{ f: number; relogio: number }> = ({ f, relogio }) => {
  const brilho = ((f % 40) / 40);
  return (
    <g>
      <rect x={-260 + 8} y={-165 + 9} width={520} height={330} rx={30} fill="#D6D2CA" />
      <defs><clipPath id="cartao-branco"><rect x={-260} y={-165} width={520} height={330} rx={30} /></clipPath></defs>
      <rect x={-260} y={-165} width={520} height={330} rx={30} fill="#FAF9F4" stroke={L} strokeWidth={8} />
      <g clipPath="url(#cartao-branco)"><path d={`M ${-380 + brilho * 900} -200 l 70 0 l -140 400 l -70 0 Z`} fill="#E9E4DA" opacity={0.6} /></g>
      <rect x={-200} y={-90} width={100} height={76} rx={12} fill="#D6D2CA" stroke={L} strokeWidth={5} />
      <g transform={`translate(150 -50) scale(${1 + 0.15 * relogio})`}>
        <circle r={56} fill="#FFFFFF" stroke={L} strokeWidth={7} />
        <line x1={0} y1={0} x2={0} y2={-38} stroke={L} strokeWidth={7} strokeLinecap="round" transform={`rotate(${f * 6})`} />
        <line x1={0} y1={0} x2={26} y2={12} stroke="#C0504D" strokeWidth={7} strokeLinecap="round" />
        <circle r={6} fill={L} />
      </g>
    </g>
  );
};
const p104: PlanoV = {
  nome: "o cartão branco", de: CORTE(283), ate: CORTE(288), enquadra: { x: 960, y: 560, zoom: 1.0 },
  eventos: [
    { f: CORTE(283), tipo: "corte", desc: "o envelope" },
    { f: T(284, fracDe(284, "há um cartão")), tipo: "objeto", desc: "o cartão sai do envelope" },
    { f: T(285), tipo: "objeto", desc: "BRANCO" },
    { f: T(286), tipo: "objeto", desc: "SEM NOME" },
    { f: T(287), tipo: "objeto", desc: "SEM LIMITE" },
    { f: T(288, fracDe(288, "cifrão")), tipo: "objeto", desc: "o cifrão riscado" },
    { f: T(288, fracDe(288, "pequeno relógio")), tipo: "objeto", desc: "o relógio no cartão" },
  ],
  Cena: ({ f, cam }) => <CenaCam cenario={ESCURO} f={f} cam={cam} />,
  Sobre: ({ f }) => {
    const sai = entre(f, T(284, fracDe(284, "há um cartão")), T(284, fracDe(284, "há um cartão")) + 16);
    const rel = entre(f, T(288, fracDe(288, "pequeno relógio")), T(288, fracDe(288, "pequeno relógio")) + 8);
    return (
      <>
        <g transform={`translate(960 ${560 - 250 * sai}) scale(${1 + 0.2 * sai})`}>
          <CartaoBrancoGrande f={f} relogio={rel} />
        </g>
        {/* envelope por cima, descendo */}
        <g transform={`translate(960 ${620 + 520 * sai})`} opacity={1 - sai * 0.8}>
          <rect x={-330 + 8} y={-40 + 9} width={660} height={400} rx={18} fill="#D6D2CA" />
          <rect x={-330} y={-40} width={660} height={400} rx={18} fill="#FFFFFF" stroke={L} strokeWidth={8} />
          <path d="M -326 -36 L 0 170 L 326 -36" fill="none" stroke={L} strokeWidth={7} strokeLinejoin="round" />
        </g>
        <TextoPop x={480} y={230} f={f} de={T(285)} ate={CORTE(288)} texto="BRANCO" tam={66} cor="#FFFFFF" rot={-4} />
        <TextoPop x={480} y={560} f={f} de={T(286)} ate={CORTE(288)} texto="SEM NOME" tam={66} cor="#FFFFFF" rot={3} />
        <TextoPop x={1460} y={560} f={f} de={T(287)} ate={CORTE(288)} texto="SEM LIMITE" tam={66} cor="#F2D16B" rot={-3} />
        {f >= T(288, fracDe(288, "cifrão")) && (
          <g transform={`translate(1460 240) scale(${escalaPop(f, T(288, fracDe(288, "cifrão")), CORTE(288))})`}>
            <Texto texto="$" tam={150} cor="#7FD18C" y={50} />
            <IconeX r={90} />
          </g>
        )}
        {rel > 0 && <circle cx={960 + 150 * 1.2} cy={310 - 50 * 1.2} r={(80 + 10 * Math.sin(f / 4)) * rel} fill="none" stroke="#F2D16B" strokeWidth={8} />}
      </>
    );
  },
};

// ------------------------------------------------------------------ 105. dinheiro foi o teste; este cartão não imprime dinheiro; então, o que ele imprime? tempo.
const p105: PlanoV = {
  nome: "ele imprime tempo", de: CORTE(288), ate: CORTE(292), enquadra: { x: 960, y: 560, zoom: 1.0 },
  eventos: [
    { f: CORTE(288), tipo: "corte", desc: "o teste" },
    { f: T(289, fracDe(289, "teste")), tipo: "objeto", desc: "TESTE: aprovado" },
    { f: T(290, fracDe(290, "não imprime")), tipo: "objeto", desc: "não imprime dinheiro: notas riscadas" },
    { f: T(291), tipo: "objeto", desc: "?" },
    { f: T(292), tipo: "objeto", desc: "TEMPO: relógios saindo do cartão" },
  ],
  Cena: ({ f, cam }) => <CenaCam cenario={ESCURO} f={f} cam={cam} />,
  Sobre: ({ f }) => {
    const sCart = escalaPop(f, T(290), CORTE(292));
    const tempo = f >= T(292);
    return (
      <>
        {(() => {
          const s = escalaPop(f, CORTE(288) + 3, T(290));
          return s > 0 ? (
            <g transform={`translate(960 430) scale(${s})`}>
              <g transform="scale(4)"><CEDULA.Desenho t={0} /></g>
            </g>
          ) : null;
        })()}
        <Carimbo x={960} y={560} f={f} de={T(289, fracDe(289, "teste"))} ate={T(290)} texto="TESTE ✓" cor="#3E8E5A" tam={80} rot={-10} />
        {sCart > 0 && <g transform={`translate(960 ${tempo ? 640 : 520}) scale(${0.85 * sCart})`}><CartaoBrancoGrande f={f} relogio={tempo ? 1 : 0} /></g>}
        {f >= T(290, fracDe(290, "não imprime")) && f < T(291) && (
          <g>
            {[0, 1, 2].map((i) => <g key={i} transform={`translate(${760 + i * 200} 250) rotate(${-10 + i * 10}) scale(2.6)`}><CEDULA.Desenho t={0} /></g>)}
            <g transform="translate(960 250)"><IconeX r={150} /></g>
          </g>
        )}
        <TextoPop x={960} y={220} f={f} de={T(291)} ate={T(292)} texto="?" tam={220} cor="#F2D16B" rot={6} />
        {tempo && Array.from({ length: 9 }, (_, i) => {
          const k = ((f - T(292) + i * 4) % 30) / 30;
          const a = -Math.PI / 2 + (i - 4) * 0.32;
          return <g key={i} transform={`translate(${960 + Math.cos(a) * 520 * k} ${560 + Math.sin(a) * 420 * k}) scale(${0.4 + 0.5 * k})`} opacity={1 - k * 0.6}><IconeRelogio giro={f * 10 + i * 40} /></g>;
        })}
        <TextoPop x={960} y={180} f={f} de={T(292)} ate={CORTE(292) + 10} texto="TEMPO." tam={150} cor="#F2D16B" rot={-3} />
      </>
    );
  },
};

// ------------------------------------------------------------------ 106. "Então, você cortaria o cartão?"
const p106: PlanoV = {
  nome: "a pergunta final", de: CORTE(292), ate: CORTE(293), enquadra: { x: 960, y: 600, zoom: 1.15 }, pushIn: 0.06, semLegenda: [293],
  eventos: [
    { f: CORTE(292), tipo: "corte", desc: "você, o cartão branco e a tesoura" },
    { f: T(293, 0.1), tipo: "objeto", desc: "a pergunta na tela" },
    { f: T(293, fracDe(293, "cortaria")), tipo: "pose", desc: "a tesoura abre perto do cartão", verbo: "cortar" },
  ],
  Cena: ({ f, cam }) => {
    const set = ESCURO.set;
    const ab = f >= T(293, fracDe(293, "cortaria")) ? 0.5 + 0.5 * Math.sin((f - T(293, fracDe(293, "cortaria"))) / 3) : 1;
    let p: PersonProps = { ...props(PROTAGONISTA), ...idle(emPe(set, "chao", 760))(f), expr: "olhar-lateral" };
    p = segura(p, "L", [-90, -240], CARTAO_BRANCO, { t: 0, brilho: ((f % 40) / 40) }, 0);
    p = segura(p, "R", [40, -236], TESOURA, { t: 0, comprimento: ab }, 180);
    p.lookAt = [0, -330];
    return <CenaCam cenario={ESCURO} f={f} cam={cam} noMeio={<Person {...p} semente={1} />} />;
  },
  Sobre: ({ f }) => (
    <>
      <TextoPop x={1340} y={420} f={f} de={T(293, 0.1)} texto="ENTÃO, VOCÊ" tam={72} cor="#FFFFFF" rot={-3} />
      <TextoPop x={1340} y={540} f={f} de={T(293, 0.35)} texto="CORTARIA" tam={110} cor="#F2D16B" rot={-3} />
      <TextoPop x={1340} y={650} f={f} de={T(293, 0.6)} texto="O CARTÃO?" tam={90} cor="#FFFFFF" rot={-3} />
    </>
  ),
};

export const CAP11: PlanoV[] = [p98, p99, p100, p101, p102, p103, p104, p105, p106];
export const FIM_CAP11 = CORTE(293);
export const FIGURADOS_CAP11: Record<number, string[]> = { 258: ["abrir"] }; // "os mercados abrem"
