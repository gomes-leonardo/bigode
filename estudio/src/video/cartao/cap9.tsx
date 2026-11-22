// Capítulo 9 (falas 199 a 230): um ano depois, os preços disparam; economias e aposentadorias derretem; seu rosto em
// todos os noticiários. Você paga a dívida pública inteira em uma tarde, o país comemora, mas trilhões de reais novos
// entram no sistema: pânico, investidores vendem reais, a moeda cai 5%, 10%, 15%, o preço do pão é riscado e reescrito.
// O telefone toca: o presidente do Banco Central. "O mercado abre em 60 segundos."
import React from "react";
import { AbsoluteFill } from "remotion";
import { Person, type PersonProps } from "../../components/Person";
import { expressaoNoQuadro } from "../../components/Face";
import { celebrate, crossArms, idle, scared, sit } from "../../rig/actions";
import { CARTAO, CEDULA, COFRINHO, SACO } from "../../objects/extras";
import { emPe, sentadoEm } from "../../cenarios/ancoras";
import { liso } from "../../cenarios/liso/Liso";
import { RUA } from "../../cenarios/rua/Rua";
import { SALA } from "../../cenarios/sala/Sala";
import { PADARIA } from "../../cenarios/padaria/Padaria";
import { ESCRITORIO } from "../../cenarios/escritorio/Escritorio";
import type { Ator } from "../../elenco/elenco";
import { MAE, PADEIRO, PRESIDENTE_BC, PROTAGONISTA, VO, figurante } from "../../elenco/elenco";
import { emPeNa, olhar, props, sentadoNa } from "../../fase4/Cenarios";
import { FONTE } from "../../fontes";
import { Estrela, Grafico, IconeBanco, IconeCalendario, IconeGlobo, IconeRelogio, IconeTV, IconeX, Selo, SetaCima, Texto, TextoPop, escalaPop } from "../graficos";
import { CenaCam, entre, falando, fracDe, segura, type PlanoV } from "./comum";
import { CORTE, T } from "./tempo";
import { Carimbo, Confete } from "./cap7";
import { FIM_CAP8 } from "./cap8";
import { Cronometro } from "./cronometro";

const L = "#141414";
const terno = (a: Ator, cor: string): Ator => ({ ...a, outfit: { camiseta: cor, calca: "#2B2B35", tenis: "#2B2B35", sola: "#141414" } });
/** celular na orelha (mão direita) */
const naOrelha = (p: PersonProps, lado: "L" | "R" = "R"): PersonProps => {
  const a = p.abaixa ?? 0;
  const m: [number, number] = lado === "R" ? [94, -318 + a] : [-94, -318 + a];
  const tel = <g transform={`translate(${m[0]} ${m[1] - 26}) rotate(${lado === "R" ? 12 : -12})`}><rect x={-13} y={-26} width={26} height={50} rx={6} fill="#2A2A35" stroke={L} strokeWidth={4} /></g>;
  return lado === "R" ? { ...p, handR: m, gripR: "fist", bendR: -10, propsHands: <>{p.propsHands}{tel}</> } : { ...p, handL: m, gripL: "fist", bendL: -10, propsHands: <>{p.propsHands}{tel}</> };
};
/** rosto de um ator dentro de um selo redondo */
const RostoSelo: React.FC<{ ator: Ator; id: string; x: number; y: number; f: number; de: number; ate?: number; rotulo: string; expr?: PersonProps["expr"] }> = ({ ator, id, x, y, f, de, ate, rotulo, expr }) => (
  <Selo x={x} y={y} f={f} de={de} ate={ate} r={100} rotulo={rotulo}>
    <defs><clipPath id={`selo-${id}`}><circle r={94} /></clipPath></defs>
    <g clipPath={`url(#selo-${id})`}><Person {...props(ator)} x={0} y={175} scale={0.6} expr={expr ?? ator.expr} handL={[-72, -110]} handR={[74, -108]} semente={3} /></g>
  </Selo>
);

// ------------------------------------------------------------------ 76. um ano depois: os preços sobem mais rápido do que em décadas
const BEGE = liso("#EADFCB");
const p76: PlanoV = {
  nome: "um ano depois: os preços disparam", de: FIM_CAP8, ate: CORTE(199), enquadra: { x: 960, y: 560, zoom: 1.0 },
  eventos: [
    { f: FIM_CAP8, tipo: "corte", desc: "um ano depois" },
    { f: T(199, fracDe(199, "os preços")), tipo: "objeto", desc: "o gráfico dos preços sobe", verbo: "subir" },
    { f: T(199, fracDe(199, "décadas")), tipo: "objeto", desc: "mais rápido do que em décadas" },
  ],
  Cena: ({ f, cam }) => {
    const set = BEGE.set;
    const p: PersonProps = { ...props(PROTAGONISTA), ...idle(emPe(set, "chao", 380))(f), expr: f >= T(199, fracDe(199, "os preços")) ? "chocado" : "neutro" };
    p.lookAt = olhar(p, [1200, 450]);
    return <CenaCam cenario={BEGE} f={f} cam={cam} noMeio={<Person {...p} semente={1} />} />;
  },
  Sobre: ({ f }) => {
    const k = entre(f, T(199, fracDe(199, "os preços")), CORTE(199) - 4);
    const s = escalaPop(f, FIM_CAP8 + 3, CORTE(199));
    return (
      <>
        {s > 0 && <g transform={`translate(1500 200) scale(${1.5 * s})`}><IconeCalendario texto="1 ANO" sub="DEPOIS" cor="#2F6E9E" /></g>}
        {f >= T(199, fracDe(199, "os preços")) && <g transform="translate(1150 560)"><Grafico pontos={[[0, 0.08], [0.3, 0.12], [0.5, 0.2], [0.7, 0.4], [0.85, 0.66], [1, 0.98]]} k={k} cor="#C0504D" w={600} h={340} /></g>}
        {f >= T(199, fracDe(199, "os preços")) && <g transform={`translate(1530 ${560 - 170 * k}) scale(${escalaPop(f, T(199, fracDe(199, "os preços")) + 6)})`}><SetaCima /></g>}
        <TextoPop x={1150} y={330} f={f} de={T(199, fracDe(199, "os preços"))} ate={CORTE(199)} texto="PREÇOS" tam={64} cor="#E0826E" rot={-3} />
        <TextoPop x={1150} y={880} f={f} de={T(199, fracDe(199, "décadas"))} ate={CORTE(199)} texto="O MAIS RÁPIDO EM DÉCADAS" tam={46} rot={2} />
      </>
    );
  },
};

// ------------------------------------------------------------------ 77. as economias derretem; a aposentadoria perde valor
const p77: PlanoV = {
  nome: "economias derretendo, aposentadoria encolhendo", de: CORTE(199), ate: CORTE(201), enquadra: { x: 960, y: 560, zoom: 1.0 },
  eventos: [
    { f: CORTE(199), tipo: "corte", desc: "o cofrinho" },
    { f: T(200, fracDe(200, "derretendo")), tipo: "objeto", desc: "o cofrinho derrete" },
    { f: T(201), tipo: "pose", desc: "a vó com o saco da aposentadoria" },
    { f: T(201, fracDe(201, "perdendo")), tipo: "objeto", desc: "o saco murcha" },
  ],
  Cena: ({ f, cam }) => {
    const set = BEGE.set;
    const d = entre(f, T(200, fracDe(200, "derretendo")) - 4, T(201));
    let v: PersonProps = emPeNa(VO, set, "chao", 1350, f, { expr: f >= T(201, fracDe(201, "perdendo")) ? "triste" : "neutro" });
    const murcha = 1 - 0.75 * entre(f, T(201, fracDe(201, "perdendo")), CORTE(201) - 2);
    v = segura(v, "R", [110, -150], SACO, { t: 0, comprimento: murcha }, 0);
    v.lookAt = olhar(v, [1480, 900]);
    return (
      <CenaCam cenario={BEGE} f={f} cam={cam}
        noMeio={<>
          <ellipse cx={560} cy={966} rx={60 + 200 * d} ry={10 + 22 * d} fill="#F2B8C6" stroke={L} strokeWidth={5} />
          <g transform={`translate(560 966) scale(${3.2 * (1 + 0.5 * d)} ${3.2 * (1 - 0.82 * d)})`}><COFRINHO.Desenho t={0} /></g>
          {d > 0.05 && [0, 1, 2].map((i) => <ellipse key={i} cx={470 + i * 90} cy={900 + ((f * 2 + i * 13) % 50)} rx={8} ry={14} fill="#F2B8C6" stroke={L} strokeWidth={3} opacity={1 - d * 0.5} />)}
          {f >= T(201) && <Person {...v} semente={5} />}
        </>}
      />
    );
  },
  Sobre: ({ f }) => (
    <>
      <TextoPop x={560} y={300} f={f} de={T(200)} ate={T(201)} texto="ECONOMIAS" tam={70} cor="#E37BA1" rot={-3} />
      <TextoPop x={1350} y={260} f={f} de={T(201, fracDe(201, "aposentadoria"))} ate={CORTE(201)} texto="APOSENTADORIA" tam={60} cor="#F2D16B" rot={2} />
    </>
  ),
};

// ------------------------------------------------------------------ 78. todos os canais de notícias mostram seu rosto
const ESCURO = liso("#26313F");
const TVS: [number, number][] = [[380, 300], [960, 280], [1540, 300], [380, 640], [960, 660], [1540, 640]];
const p78: PlanoV = {
  nome: "todos os noticiários", de: CORTE(201), ate: CORTE(202), enquadra: { x: 960, y: 560, zoom: 1.0 },
  eventos: [
    { f: CORTE(201), tipo: "corte", desc: "parede de televisões" },
    { f: T(202, fracDe(202, "mostram")), tipo: "objeto", desc: "seu rosto em todas" },
  ],
  Cena: ({ f, cam }) => <CenaCam cenario={ESCURO} f={f} cam={cam} />,
  Sobre: ({ f }) => (
    <>
      {TVS.map(([x, y], i) => {
        const s = escalaPop(f, CORTE(201) + i * 3, Infinity, 6);
        const rosto = f >= T(202, fracDe(202, "mostram")) + i;
        return s > 0 ? (
          <g key={i} transform={`translate(${x} ${y}) scale(${2.2 * s})`}>
            <IconeTV w={240} h={150}>
              <defs><clipPath id={`tv-${i}`}><rect x={-108} y={-63} width={216} height={126} rx={4} /></clipPath></defs>
              <g clipPath={`url(#tv-${i})`}>
                {rosto ? <Person {...props(PROTAGONISTA)} x={i % 2 ? -10 : 10} y={150} scale={0.42} expr="sigma" handL={[-72, -110]} handR={[74, -108]} semente={1} /> : <rect x={-108} y={-63} width={216} height={126} fill={["#5AA5B8", "#7FD18C", "#E3A23B"][i % 3]} opacity={0.6} />}
                <rect x={-108} y={36} width={216} height={27} fill="#C0504D" />
                <text x={0} y={56} textAnchor="middle" fontFamily={FONTE} fontWeight={900} fontSize={18} fill="#FFFFFF">URGENTE</text>
              </g>
            </IconeTV>
          </g>
        ) : null;
      })}
    </>
  ),
};

// ------------------------------------------------------------------ 79. consertar tudo: a dívida pública de trilhões; você paga tudo, cada centavo, em uma tarde
const Conta: React.FC<{ k: number; zerada: boolean }> = ({ k, zerada }) => {
  const h = 60 + 520 * k;
  return (
    <g>
      <rect x={-230 + 7} y={8} width={460} height={h} fill="#D6D2CA" />
      <rect x={-230} y={0} width={460} height={h} fill="#FFFFFF" stroke={L} strokeWidth={7} />
      <defs><clipPath id="conta-clip"><rect x={-230} y={0} width={460} height={h} /></clipPath></defs>
      <g clipPath="url(#conta-clip)">
        <text x={0} y={70} textAnchor="middle" fontFamily={FONTE} fontWeight={900} fontSize={44} fill={L}>DÍVIDA PÚBLICA</text>
        {Array.from({ length: 8 }, (_, i) => <rect key={i} x={-180} y={110 + i * 40} width={240 + ((i * 37) % 100)} height={14} rx={7} fill="#E4DED2" />)}
        <line x1={-190} y1={460} x2={190} y2={460} stroke={L} strokeWidth={4} />
        <text x={0} y={530} textAnchor="middle" fontFamily={FONTE} fontWeight={900} fontSize={zerada ? 60 : 46} fill={zerada ? "#3E8E5A" : "#C0504D"}>{zerada ? "R$ 0,00" : "R$ TRILHÕES"}</text>
      </g>
    </g>
  );
};
const p79: PlanoV = {
  nome: "paga a dívida pública", de: CORTE(202), ate: CORTE(207), enquadra: { x: 960, y: 560, zoom: 1.0 },
  eventos: [
    { f: CORTE(202), tipo: "corte", desc: "decide consertar tudo" },
    { f: T(204, fracDe(204, "dívida")), tipo: "objeto", desc: "a conta da dívida desenrola" },
    { f: T(205), tipo: "objeto", desc: "paga: BIP e PAGO", verbo: "pagar" },
    { f: T(206), tipo: "objeto", desc: "R$ 0,00" },
    { f: T(207), tipo: "objeto", desc: "relógio: uma tarde" },
  ],
  Cena: ({ f, cam }) => {
    const set = BEGE.set;
    const ergue = entre(f, T(205) - 4, T(205) + 2) * (1 - entre(f, T(205) + 14, T(205) + 22));
    let p: PersonProps = f < T(204) ? { ...props(PROTAGONISTA), ...crossArms(emPe(set, "chao", 420))(f), expr: "sigma" } : { ...props(PROTAGONISTA), ...idle(emPe(set, "chao", 420))(f), expr: f >= T(206) ? "convencido" : "sigma" };
    if (f >= T(204)) p = segura(p, "R", [84 + 30 * ergue, -170 - 110 * ergue], CARTAO, { t: 0, brilho: ergue }, -10 - 20 * ergue);
    p.lookAt = olhar(p, [1200, 400]);
    return <CenaCam cenario={BEGE} f={f} cam={cam} noMeio={<Person {...p} semente={1} />} />;
  },
  Sobre: ({ f }) => {
    const k = entre(f, T(204, fracDe(204, "dívida")), T(204, fracDe(204, "dívida")) + 20);
    const sRel = escalaPop(f, T(207), CORTE(207));
    return (
      <>
        <TextoPop x={1150} y={300} f={f} de={T(203, fracDe(203, "consertar"))} ate={T(204, fracDe(204, "dívida"))} texto="CONSERTAR TUDO" tam={80} cor="#F2D16B" rot={-3} />
        {f >= T(204, fracDe(204, "dívida")) && <g transform="translate(1200 -20)"><Conta k={k} zerada={f >= T(206)} /></g>}
        <Estrela x={580} y={360} f={f} de={T(205)} ate={T(205) + 14} texto="BIP!" r={70} />
        <Carimbo x={1200} y={330} f={f} de={T(205, 0.3)} ate={CORTE(207)} texto="PAGO" cor="#3E8E5A" tam={90} rot={-12} />
        {sRel > 0 && <g transform={`translate(1640 760) scale(${1.4 * sRel})`}><IconeRelogio giro={f * 12} /><Texto texto="UMA TARDE" tam={30} y={96} /></g>}
      </>
    );
  },
};

// ------------------------------------------------------------------ 80. por um momento, o país inteiro comemora
const p80: PlanoV = {
  nome: "o país comemora", de: CORTE(207), ate: CORTE(208), enquadra: { x: 960, y: 600, zoom: 1.0 },
  eventos: [
    { f: CORTE(207), tipo: "corte", desc: "a rua comemorando" },
    { f: T(208, fracDe(208, "comemora")), tipo: "objeto", desc: "confete" },
  ],
  Cena: ({ f, cam }) => {
    const set = RUA.set;
    const xs = [200, 470, 740, 1010, 1280, 1550, 1780];
    const gente = xs.map((x, i) => {
      const a = figurante(151 + i * 2);
      return { ...props(a), ...celebrate({ ...emPe(set, "chao", x, 0, a.scale ?? 1), wide: a.wide })(f + i * 6) } as PersonProps;
    });
    return <CenaCam cenario={RUA} f={f} cam={cam} noMeio={<>{gente.map((m, i) => <Person key={i} {...m} semente={151 + i * 2} />)}</>} />;
  },
  Sobre: ({ f }) => <Confete f={f} de={CORTE(207)} />,
};

// ------------------------------------------------------------------ 81. o dinheiro chega ao sistema: trilhões de reais novos, criados em uma tarde
const p81: PlanoV = {
  nome: "trilhões novos no sistema", de: CORTE(208), ate: CORTE(211), enquadra: { x: 960, y: 560, zoom: 1.0 },
  eventos: [
    { f: CORTE(208), tipo: "corte", desc: "o sistema" },
    { f: T(209, fracDe(209, "sistema")), tipo: "objeto", desc: "as notas caem no sistema" },
    { f: T(210), tipo: "objeto", desc: "TRILHÕES NOVOS" },
    { f: T(211, fracDe(211, "absurda")), tipo: "objeto", desc: "a pilha cresce" },
    { f: T(211, fracDe(211, "tarde")), tipo: "objeto", desc: "uma tarde" },
  ],
  Cena: ({ f, cam }) => {
    const cai = f >= T(209, fracDe(209, "sistema"));
    const pilha = entre(f, T(209, fracDe(209, "sistema")), CORTE(211)) ;
    return (
      <CenaCam cenario={ESCURO} f={f} cam={cam}
        noMeio={<>
          <g transform="translate(960 640) scale(3.4)"><IconeBanco /></g>
          {cai && Array.from({ length: 26 }, (_, i) => {
            const k = ((f - T(209, fracDe(209, "sistema")) + i * 4) % 28) / 28;
            return <g key={i} transform={`translate(${300 + ((i * 197) % 1320)} ${-60 + k * 980}) rotate(${i * 33 + k * 160})`}><g transform="scale(1.8)"><CEDULA.Desenho t={0} /></g>{f >= T(210) && i % 3 === 0 && <text x={0} y={-30} textAnchor="middle" fontFamily={FONTE} fontWeight={900} fontSize={22} fill="#F2D16B" stroke={L} strokeWidth={5} paintOrder="stroke">NOVO</text>}</g>;
          })}
          {pilha > 0 && <path d={`M -100 1200 L -100 ${1120 - 520 * pilha} Q 960 ${1060 - 700 * pilha} 2020 ${1120 - 520 * pilha} L 2020 1200 Z`} fill="#7FB77E" stroke={L} strokeWidth={7} />}
          {pilha > 0 && Array.from({ length: 18 }, (_, i) => <rect key={i} x={-60 + i * 120} y={1130 - 500 * pilha + ((i * 53) % 60)} width={90} height={40} rx={6} fill="#9FD09A" stroke={L} strokeWidth={4} transform={`rotate(${(i % 5) * 9 - 18} ${-15 + i * 120} ${1150 - 500 * pilha})`} />)}
        </>}
      />
    );
  },
  Sobre: ({ f }) => {
    const s = escalaPop(f, T(211, fracDe(211, "tarde")), CORTE(211));
    return (
      <>
        <TextoPop x={960} y={170} f={f} de={T(209, fracDe(209, "sistema"))} ate={T(210)} texto="O SISTEMA" tam={70} rot={-2} />
        <TextoPop x={960} y={170} f={f} de={T(210)} ate={T(211, fracDe(211, "tarde"))} texto="TRILHÕES NOVOS" tam={90} cor="#7FD18C" rot={-3} />
        {s > 0 && <g transform={`translate(960 200) scale(${1.4 * s})`}><IconeRelogio giro={f * 20} /><Texto texto="EM UMA TARDE" tam={34} y={100} /></g>}
      </>
    );
  },
};

// ------------------------------------------------------------------ 82. pânico: não pelo que aconteceu, mas pelo que pode acontecer depois; de novo, e de novo
const p82: PlanoV = {
  nome: "pânico: pode fazer de novo", de: CORTE(211), ate: CORTE(215), enquadra: { x: 960, y: 600, zoom: 1.0 },
  eventos: [
    { f: CORTE(211), tipo: "corte", desc: "a rua em pânico" },
    { f: T(212, fracDe(212, "pânico")), tipo: "pose", desc: "todos se assustam" },
    { f: T(213, fracDe(213, "agora")), tipo: "objeto", desc: "relógio: AGORA riscado" },
    { f: T(213, fracDe(213, "depois")), tipo: "objeto", desc: "E DEPOIS?" },
    { f: T(214), tipo: "objeto", desc: "o cartão: uma vez" },
    { f: T(214, fracDe(214, "de novo")), tipo: "objeto", desc: "de novo: ×2" },
    { f: T(215), tipo: "objeto", desc: "e de novo: ×3" },
  ],
  Cena: ({ f, cam }) => {
    const set = RUA.set;
    const xs = [260, 640, 1280, 1660];
    const gente = xs.map((x, i) => {
      const a = figurante(161 + i * 3);
      const base = { ...emPe(set, "chao", x, 0, a.scale ?? 1), wide: a.wide };
      const m: PersonProps = f >= T(212, fracDe(212, "pânico")) + i * 2 ? { ...props(a), ...scared(base)(f - T(212, fracDe(212, "pânico")) - i * 2) } : { ...props(a), ...idle(base)(f + i * 9), expr: "neutro" };
      m.lookAt = olhar(m, [960, 300]);
      return m;
    });
    return <CenaCam cenario={RUA} f={f} cam={cam} noMeio={<>{gente.map((m, i) => <Person key={i} {...m} semente={161 + i * 3} />)}</>} />;
  },
  Sobre: ({ f }) => {
    const n = f >= T(215) ? 3 : f >= T(214, fracDe(214, "de novo")) ? 2 : f >= T(214) ? 1 : 0;
    const sCard = escalaPop(f, T(214), CORTE(215));
    return (
      <>
        <Selo x={960} y={300} f={f} de={T(213, fracDe(213, "agora"))} ate={T(213, fracDe(213, "depois"))} r={100} rotulo="AGORA"><IconeRelogio giro={0} /><IconeX r={90} /></Selo>
        <TextoPop x={960} y={420} f={f} de={T(213, fracDe(213, "depois"))} ate={T(214)} texto="E DEPOIS?" tam={110} cor="#F2D16B" rot={-4} />
        {sCard > 0 && <rect x={0} y={0} width={1920} height={1080} fill="#141414" opacity={0.4 * Math.min(1, sCard)} />}
        {sCard > 0 && (
          <g transform={`translate(960 440) scale(${sCard})`}>
            {Array.from({ length: n }, (_, i) => <g key={i} transform={`translate(${(i - (n - 1) / 2) * 170} 0) scale(3.6)`}><CARTAO.Desenho t={0} brilho={1} /></g>)}
          </g>
        )}
        {n >= 1 && <Estrela x={960 + (n - 1) * 90} y={270} f={f} de={n === 1 ? T(214) : n === 2 ? T(214, fracDe(214, "de novo")) : T(215)} ate={(n === 1 ? T(214) : n === 2 ? T(214, fracDe(214, "de novo")) : T(215)) + 14} texto="BIP!" r={70} />}
        <TextoPop x={960} y={650} f={f} de={T(214, fracDe(214, "de novo"))} ate={CORTE(215)} texto={n >= 3 ? "×3" : "×2"} tam={110} cor="#E0826E" rot={4} />
      </>
    );
  },
};

// ------------------------------------------------------------------ 83. investidores vendem reais; a moeda perde valor: 5%, 10%, 15%
const MESA = liso("#2B3447");
const p83: PlanoV = {
  nome: "investidores vendem reais", de: CORTE(215), ate: CORTE(216), enquadra: { x: 960, y: 560, zoom: 1.0 },
  eventos: [
    { f: CORTE(215), tipo: "corte", desc: "investidores pelo mundo" },
    { f: T(216, fracDe(216, "vender")), tipo: "objeto", desc: "VENDER R$ nas telas" },
  ],
  Cena: ({ f, cam }) => {
    const set = MESA.set;
    const xs = [420, 960, 1500];
    const gente = xs.map((x, i) => {
      const a = terno(figurante(171 + i * 2), ["#3A3F4B", "#4A3424", "#2F4A3A"][i]);
      const m = emPeNa(a, set, "chao", x, f + i * 5, { expr: f >= T(216, fracDe(216, "vender")) ? "chocado" : "neutro" });
      m.lookAt = olhar(m, [x, 300]);
      return m;
    });
    return <CenaCam cenario={MESA} f={f} cam={cam} noMeio={<>{gente.map((m, i) => <Person key={i} {...m} semente={171 + i * 2} />)}</>} />;
  },
  Sobre: ({ f }) => (
    <>
      <Selo x={160} y={160} f={f} de={CORTE(215) + 3} ate={CORTE(216)} r={90}><g transform="scale(0.9)"><IconeGlobo giro={f * 2} /></g></Selo>
      {[420, 960, 1500].map((x, i) => (
        <g key={x} transform={`translate(${x} 230) scale(1.6)`}>
          <IconeTV w={220} h={130}>
            {f >= T(216, fracDe(216, "vender")) + i * 2 ? (
              <g><rect x={-98} y={-53} width={196} height={106} fill="#C0504D" /><text x={0} y={-8} textAnchor="middle" fontFamily={FONTE} fontWeight={900} fontSize={26} fill="#FFFFFF">VENDER</text><text x={0} y={30} textAnchor="middle" fontFamily={FONTE} fontWeight={900} fontSize={34} fill="#FFFFFF">R$</text></g>
            ) : <polyline points="-90,30 -50,10 -10,20 30,-10 80,-30" fill="none" stroke="#7FD18C" strokeWidth={6} />}
          </IconeTV>
        </g>
      ))}
    </>
  ),
};
const p84: PlanoV = {
  nome: "a moeda perde valor", de: CORTE(216), ate: CORTE(220), enquadra: { x: 960, y: 560, zoom: 1.0 },
  eventos: [
    { f: CORTE(216), tipo: "corte", desc: "a moeda" },
    { f: T(217, fracDe(217, "perde")), tipo: "objeto", desc: "a moeda encolhe e racha" },
    { f: T(218), tipo: "objeto", desc: "-5%" },
    { f: T(219), tipo: "objeto", desc: "-10%" },
    { f: T(220), tipo: "objeto", desc: "-15%" },
  ],
  Cena: ({ f, cam }) => <CenaCam cenario={ESCURO} f={f} cam={cam} />,
  Sobre: ({ f }) => {
    const enc = 1 - 0.06 * entre(f, T(217, fracDe(217, "perde")), T(218)) - 0.08 * entre(f, T(218), T(219)) - 0.08 * entre(f, T(219), T(220)) - 0.08 * entre(f, T(220), CORTE(220));
    const racha = f >= T(217, fracDe(217, "perde"));
    const pts: [number, number][] = [[0, 0.9], [0.25, 0.85], [0.45, 0.62], [0.65, 0.45], [0.85, 0.25], [1, 0.12]];
    const k = entre(f, T(217), CORTE(220) - 4);
    const nums: [number, string][] = [[T(218), "-5%"], [T(219), "-10%"], [T(220), "-15%"]];
    return (
      <>
        <g transform={`translate(520 520) scale(${enc})`}>
          <circle cx={8} cy={9} r={230} fill="#D6D2CA" />
          <circle r={230} fill="#E3B95B" stroke={L} strokeWidth={9} />
          <circle r={180} fill="none" stroke="#C99A3E" strokeWidth={8} />
          <Texto texto="R$" tam={160} cor="#FFF0B8" y={56} />
          {racha && <path d="M -40 -228 L 0 -120 L -50 -40 L 20 40 L -10 130 L 30 228" fill="none" stroke={L} strokeWidth={9} strokeLinejoin="round" />}
        </g>
        <g transform="translate(1340 600)"><Grafico pontos={pts} k={k} cor="#C0504D" w={560} h={300} /></g>
        {nums.map(([de, t], i) => <TextoPop key={t} x={1130 + i * 200} y={120 + i * 100} f={f} de={de} ate={CORTE(220)} texto={t} tam={70 + i * 16} cor="#E0826E" rot={-4 + i * 3} />)}
      </>
    );
  },
};

// ------------------------------------------------------------------ 85. na vitrine da padaria, o preço do pão é riscado e escrito novamente
const p85: PlanoV = {
  nome: "o preço riscado na vitrine", de: CORTE(220), ate: CORTE(221), enquadra: { x: 960, y: 560, zoom: 1.0 },
  eventos: [
    { f: CORTE(220), tipo: "corte", desc: "a vitrine da padaria" },
    { f: T(221, fracDe(221, "riscado")), tipo: "objeto", desc: "R$ 3 riscado" },
    { f: T(221, fracDe(221, "escrito")), tipo: "objeto", desc: "R$ 3,80 escrito à mão" },
  ],
  Cena: ({ f, cam }) => {
    const set = PADARIA.set;
    const pad: PersonProps = emPeNa(PADEIRO, set, "chao_balcao", 1160, f, { expr: "triste", handL: [-120, -260 + Math.sin(f / 2) * 6], gripL: "fist" });
    pad.lookAt = olhar(pad, [760, 520]);
    return <CenaCam cenario={PADARIA} f={f} cam={cam} noMeio={<Person {...pad} semente={7} />} />;
  },
  Sobre: ({ f }) => {
    const risca = entre(f, T(221, fracDe(221, "riscado")), T(221, fracDe(221, "riscado")) + 8);
    const escreve = entre(f, T(221, fracDe(221, "escrito")), T(221, fracDe(221, "escrito")) + 14);
    return (
      <>
        <rect x={0} y={0} width={1920} height={1080} fill="#DDEFF5" opacity={0.35} />
        <path d="M 200 120 L 520 1000 M 1500 80 L 1800 900" stroke="#FFFFFF" strokeWidth={40} opacity={0.35} />
        <g transform="translate(520 430) rotate(-4)">
          <Texto texto="PÃO" tam={90} cor="#FFFFFF" y={-120} />
          <Texto texto="R$ 3" tam={170} cor="#FFFFFF" />
          {risca > 0 && <line x1={-210} y1={-60} x2={-210 + 420 * risca} y2={-50} stroke="#C0504D" strokeWidth={22} strokeLinecap="round" />}
          {escreve > 0 && <g transform={`translate(0 190)`}><defs><clipPath id="escreve"><rect x={-300} y={-160} width={600 * escreve} height={220} /></clipPath></defs><g clipPath="url(#escreve)"><Texto texto="R$ 3,80" tam={170} cor="#F2D16B" /></g></g>}
        </g>
      </>
    );
  },
};

// ------------------------------------------------------------------ 86. preços que mudam de uma semana para outra; agora é diferente; ninguém sabe quanto vai custar amanhã
const p86: PlanoV = {
  nome: "ninguém sabe o preço de amanhã", de: CORTE(221), ate: CORTE(224), enquadra: { x: 960, y: 560, zoom: 1.0 },
  eventos: [
    { f: CORTE(221), tipo: "corte", desc: "o protagonista e o calendário" },
    { f: T(222, fracDe(222, "semana")), tipo: "objeto", desc: "as semanas passam e a etiqueta muda" },
    { f: T(223), tipo: "expressao", desc: "agora é diferente" },
    { f: T(224, fracDe(224, "ninguém")), tipo: "objeto", desc: "R$ ???" },
    { f: T(224, fracDe(224, "amanhã")), tipo: "objeto", desc: "amanhã" },
  ],
  Cena: ({ f, cam }) => {
    const set = BEGE.set;
    const p: PersonProps = { ...props(PROTAGONISTA), ...idle(emPe(set, "chao", 420))(f), expr: expressaoNoQuadro([[0, "neutro"], [T(223), "triste"], [T(224, fracDe(224, "ninguém")), "chocado"]], f, 6) };
    p.lookAt = olhar(p, [1200, 420]);
    return <CenaCam cenario={BEGE} f={f} cam={cam} noMeio={<Person {...p} semente={1} />} />;
  },
  Sobre: ({ f }) => {
    const fS = T(222, fracDe(222, "semana"));
    const sem = f >= fS ? Math.min(4, 1 + Math.floor((f - fS) / 12)) : 1;
    const precos = ["R$ 3,80", "R$ 4,30", "R$ 4,90", "R$ 5,60"];
    const nada = f >= T(224, fracDe(224, "ninguém"));
    const sCal = escalaPop(f, CORTE(221) + 3, T(224, fracDe(224, "amanhã")));
    const sAm = escalaPop(f, T(224, fracDe(224, "amanhã")), CORTE(224));
    return (
      <>
        {sCal > 0 && <g transform={`translate(1500 300) scale(${1.7 * sCal})`}><IconeCalendario texto={`${sem}ª`} sub="SEMANA" cor="#2F6E9E" /></g>}
        {sAm > 0 && <g transform={`translate(1500 300) scale(${1.7 * sAm})`}><IconeCalendario texto="?" sub="AMANHÃ" cor="#C0504D" /></g>}
        <g transform="translate(1100 560) rotate(-5) scale(2.2)">
          <path d="M -110 -40 L 90 -40 L 120 0 L 90 40 L -110 40 Z" transform="translate(3 4)" fill="#D6D2CA" />
          <path d="M -110 -40 L 90 -40 L 120 0 L 90 40 L -110 40 Z" fill={nada ? "#FCE3DC" : "#FFFFFF"} stroke={L} strokeWidth={4} />
          <text x={-6} y={13} textAnchor="middle" fontFamily={FONTE} fontWeight={900} fontSize={38} fill={L}>{nada ? "R$ ???" : precos[sem - 1]}</text>
        </g>
        <TextoPop x={1100} y={800} f={f} de={T(223)} ate={T(224)} texto="AGORA É DIFERENTE" tam={56} rot={2} />
      </>
    );
  },
};

// ------------------------------------------------------------------ 87. seu telefone toca
const p87: PlanoV = {
  nome: "o telefone toca", de: CORTE(224), ate: CORTE(225), enquadra: { x: 860, y: 600, zoom: 1.3 },
  eventos: [
    { f: CORTE(224), tipo: "corte", desc: "a sala de casa" },
    { f: T(225, 0.1), tipo: "objeto", desc: "TRIM!" },
  ],
  Cena: ({ f, cam }) => {
    const set = SALA.set;
    const p: PersonProps = sentadoNa(PROTAGONISTA, set, "sofa_meio", f, { expr: f >= T(225, 0.1) ? "chocado" : "triste" });
    p.lookAt = olhar(p, [1290, 760]);
    return (
      <CenaCam cenario={SALA} f={f} cam={cam}
        naFrente={<>
          <Person {...p} semente={1} />
          <g transform={`translate(${1270 + (f % 4 < 2 ? 3 : -3)} 790) rotate(-8)`}><rect x={-16} y={-30} width={32} height={30} rx={5} fill="#2A2A35" stroke={L} strokeWidth={4} /></g>
        </>}
      />
    );
  },
  Sobre: ({ f }) => <Estrela x={1450} y={420} f={f} de={T(225, 0.1)} ate={CORTE(225)} texto="TRIM!" r={90} rot={8} />,
};

// ------------------------------------------------------------------ 88. tela dividida: o presidente do Banco Central. "O mercado abre em 60 segundos..."
const p88: PlanoV = {
  nome: "telefonema do Banco Central", de: CORTE(225), ate: CORTE(230), enquadra: { x: 960, y: 560, zoom: 1.0 }, pushIn: 0.04,
  eventos: [
    { f: CORTE(225), tipo: "corte", desc: "tela dividida: você e o presidente do Banco Central" },
    { f: T(227, fracDe(227, "60 segundos")), tipo: "objeto", desc: "cronômetro: 60 segundos" },
    { f: T(228, fracDe(228, "o real está acabado")), tipo: "objeto", desc: "o R$ racha" },
    { f: T(229), tipo: "objeto", desc: "aposentadoria" },
    { f: T(229, fracDe(229, "poupança")), tipo: "objeto", desc: "poupança" },
    { f: T(229, fracDe(229, "sua mãe")), tipo: "objeto", desc: "a mãe" },
    { f: T(230, fracDe(230, "nunca mais")), tipo: "objeto", desc: "NUNCA MAIS DINHEIRO NOVO" },
  ],
  Cena: ({ f, cam }) => {
    const z = (cam.zoom ?? 1) * 1.25;
    // esquerda: você na sala, com o celular na orelha
    const sala = SALA.set;
    let p: PersonProps = sentadoNa(PROTAGONISTA, sala, "sofa_meio", f, { expr: expressaoNoQuadro([[0, "neutro"], [T(228), "chocado"], [T(229, fracDe(229, "sua mãe")), "triste"]], f, 6) });
    p = naOrelha(p, "R");
    p.lookAt = olhar(p, [1300, 520]);
    // direita: o presidente do Banco Central na mesa, com o telefone
    const esc = ESCRITORIO.set;
    const e = sentadoEm(esc, "cadeira_esq");
    let pres: PersonProps = { ...props(PRESIDENTE_BC), ...sit({ ...e, wide: PRESIDENTE_BC.wide })(f + 30), expr: f >= T(229) ? "triste" : "neutro", fala: falando(f, T(227), T(227, 1)) || falando(f, T(228), T(228, 1)) || falando(f, T(229), T(229, 1)) || falando(f, T(230), T(230, 1)) };
    pres = naOrelha(pres, "R");
    pres.lookAt = olhar(pres, [300, 520]);
    return (
      <>
        <AbsoluteFill style={{ clipPath: "inset(0 50% 0 0)" }}>
          <CenaCam cenario={SALA} f={f} cam={{ x: 850 + 480 / z, y: 600, zoom: z }} naFrente={<Person {...p} semente={1} />} />
        </AbsoluteFill>
        <AbsoluteFill style={{ clipPath: "inset(0 0 0 50%)" }}>
          <CenaCam cenario={ESCRITORIO} f={f} cam={{ x: 660 - 480 / z, y: 600, zoom: z }} noMeio={<Person {...pres} semente={8} />} />
        </AbsoluteFill>
      </>
    );
  },
  Sobre: ({ f }) => (
    <>
      <rect x={952} y={0} width={16} height={1080} fill="#F4F1EA" stroke={L} strokeWidth={5} />
      <TextoPop x={1440} y={110} f={f} de={T(226, fracDe(226, "presidente"))} ate={T(227)} texto="BANCO CENTRAL" tam={54} cor="#F2D16B" rot={-2} />
      <Cronometro x={960} y={200} f={f} s={1} />
      <g transform="translate(1730 330)">
        {f >= T(228, fracDe(228, "o real está acabado")) && f < T(229) && (
          <g transform={`scale(${escalaPop(f, T(228, fracDe(228, "o real está acabado")), T(229))})`}>
            <circle cx={6} cy={7} r={110} fill="#D6D2CA" />
            <circle r={110} fill="#E3B95B" stroke={L} strokeWidth={7} />
            <Texto texto="R$" tam={90} cor="#FFF0B8" y={30} />
            <path d="M -20 -108 L 10 -40 L -30 10 L 20 60 L -5 108" fill="none" stroke={L} strokeWidth={7} strokeLinejoin="round" />
          </g>
        )}
      </g>
      <RostoSelo ator={VO} id="vo" x={300} y={260} f={f} de={T(229)} ate={CORTE(229)} rotulo="APOSENTADORIA" expr="triste" />
      <Selo x={620} y={260} f={f} de={T(229, fracDe(229, "poupança"))} ate={CORTE(229)} r={100} rotulo="POUPANÇA"><g transform="translate(0 34) scale(1.3)"><COFRINHO.Desenho t={0} /></g></Selo>
      <RostoSelo ator={MAE} id="mae" x={1730} y={330} f={f} de={T(229, fracDe(229, "sua mãe"))} ate={CORTE(229)} rotulo="SUA MÃE" expr="triste" />
      <TextoPop x={1440} y={200} f={f} de={T(230, fracDe(230, "nunca mais"))} ate={CORTE(230)} texto="NUNCA MAIS" tam={70} cor="#E0826E" rot={-3} />
      <TextoPop x={1440} y={280} f={f} de={T(230, fracDe(230, "dinheiro novo"))} ate={CORTE(230)} texto="DINHEIRO NOVO" tam={56} rot={2} />
    </>
  ),
};

export const CAP9: PlanoV[] = [p76, p77, p78, p79, p80, p81, p82, p83, p84, p85, p86, p87, p88];
export const FIM_CAP9 = CORTE(230);
export const FIGURADOS_CAP9: Record<number, string[]> = { 212: ["entrar"], 227: ["abrir"] }; // "entram em pânico", "o mercado abre"
