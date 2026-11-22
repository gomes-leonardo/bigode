// Capítulo 8 (falas 158 a 198): a fama (seguidores, mural, "o sem fundo", 4.000 mensagens), as regras (reunião no
// Banco Central, o Congresso discutindo, países que deixam de aceitar reais), o custo (o presente perde o significado,
// o colar e o cartão de macarrão, o telefone que não para, o amigo quieto) e a padaria: o pão de R$ 2 agora custa R$ 3.
import React from "react";
import { Person, type PersonProps } from "../../components/Person";
import { expressaoNoQuadro } from "../../components/Face";
import { idle, lookAtPhone, point, sit, walk } from "../../rig/actions";
import { CARTAO, MOEDA } from "../../objects/extras";
import { CARTAO_MACARRAO, COLAR, PIZZA, PAO } from "../../objects/extras2";
import { ObjetoNoMundo } from "../../objects/objetos";
import { emPe, sentadoEm } from "../../cenarios/ancoras";
import { liso, lisoSet } from "../../cenarios/liso/Liso";
import type { CenarioDef } from "../../cenarios/Cena";
import { MARGEM } from "../../cenarios/pecas";
import { Papel, Rect } from "../../components/prim";
import { RUA } from "../../cenarios/rua/Rua";
import { SALA } from "../../cenarios/sala/Sala";
import { PADARIA } from "../../cenarios/padaria/Padaria";
import { ESCRITORIO } from "../../cenarios/escritorio/Escritorio";
import type { Ator } from "../../elenco/elenco";
import { AMIGO, MAE, PADEIRO, PRESIDENTE_BC, PROTAGONISTA, figurante } from "../../elenco/elenco";
import { emPeNa, olhar, props, sentadoNa } from "../../fase4/Cenarios";
import { FONTE } from "../../fontes";
import { Contador, CuboOuro, Estrela, IconeCalendario, IconeGlobo, IconeCarro, IconeCasa, IconeCelular, IconeContrato, IconeEnvelope, IconeFoguete, IconeHospital, IconeJatinho, IconeRelogio, IconeTV, IconeX, Lagrimas, Selo, Texto, TextoPop, escalaPop } from "../graficos";
import { CenaCam, entre, falando, fracDe, rostoNoMundo, segura, type PlanoV } from "./comum";
import { CORTE, T } from "./tempo";
import { FIM_CAP7 } from "./cap7";
import { PLENARIO } from "./cenas";

const L = "#141414";

/** balão de mensagem no celular (coordenadas da tela do celular, 0..160) */
const Msg: React.FC<{ y: number; nome?: string; destaque?: boolean; apaga?: boolean }> = ({ y, nome, destaque, apaga }) => (
  <g opacity={apaga ? 0.35 : 1}>
    <rect x={10} y={y} width={140} height={34} rx={10} fill={destaque ? "#FCE3DC" : "#FFFFFF"} stroke={destaque ? "#C0504D" : "#B9B4AA"} strokeWidth={destaque ? 3 : 2} />
    <circle cx={26} cy={y + 17} r={9} fill={destaque ? "#E0826E" : "#D6D2CA"} />
    {nome ? <text x={42} y={y + 23} fontFamily={FONTE} fontWeight={900} fontSize={13} fill={L}>{nome}</text> : <rect x={42} y={y + 13} width={90} height={8} rx={4} fill="#D6D2CA" />}
  </g>
);
/** flash de câmera (estrela branca) */
const Flash: React.FC<{ x: number; y: number; k: number }> = ({ x, y, k }) => (k <= 0 || k >= 1 ? null : (
  <g transform={`translate(${x} ${y}) scale(${0.4 + k * 1.2})`} opacity={1 - k}>
    <path d="M 0 -60 L 14 -14 L 60 0 L 14 14 L 0 60 L -14 14 L -60 0 L -14 -14 Z" fill="#FFFFFF" stroke={L} strokeWidth={4} />
  </g>
));
/** nuvenzinha de chuva em cima da cabeça (o custo) */
const Nuvem: React.FC<{ s: number; f: number }> = ({ s, f }) => (
  <g transform={`scale(${s})`}>
    {[0, 1, 2].map((i) => <line key={i} x1={-30 + i * 30} y1={30 + ((f * 3 + i * 9) % 26)} x2={-34 + i * 30} y2={44 + ((f * 3 + i * 9) % 26)} stroke="#5AA5B8" strokeWidth={5} strokeLinecap="round" />)}
    <g>
      {[[-40, 0, 34], [0, -18, 42], [40, 0, 34]].map(([x, y, r], i) => <circle key={i} cx={x + 4} cy={y + 5} r={r} fill="#D6D2CA" />)}
      {[[-40, 0, 34], [0, -18, 42], [40, 0, 34]].map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r} fill="#8A8F98" stroke={L} strokeWidth={6} />)}
      <rect x={-60} y={-4} width={120} height={30} fill="#8A8F98" />
      <path d="M -74 26 L 74 26" stroke={L} strokeWidth={6} strokeLinecap="round" />
    </g>
  </g>
);
/** caixa de presente */
const Presente: React.FC<{ cor?: string }> = ({ cor = "#E37BA1" }) => (
  <g>
    <rect x={-44 + 5} y={-80 + 6} width={88} height={80} rx={6} fill="#D6D2CA" />
    <rect x={-44} y={-80} width={88} height={80} rx={6} fill={cor} stroke={L} strokeWidth={6} />
    <rect x={-8} y={-80} width={16} height={80} fill="#F2D16B" stroke={L} strokeWidth={4} />
    <path d="M 0 -80 q -30 -30 -30 -6 q 0 10 30 6 q 30 4 30 -6 q 0 -24 -30 6 Z" fill="#F2D16B" stroke={L} strokeWidth={4} />
  </g>
);

// ------------------------------------------------------------------ 60. a fama: flashes; 100 milhões de seguidores
const FAS = [101, 103, 104, 106].map((s) => figurante(s));
const p60: PlanoV = {
  nome: "a fama", de: FIM_CAP7, ate: CORTE(159), enquadra: { x: 960, y: 600, zoom: 1.0 },
  eventos: [
    { f: FIM_CAP7, tipo: "corte", desc: "na rua: fãs com celulares" },
    { f: T(158, 0.3), tipo: "objeto", desc: "flashes" },
    { f: T(159), tipo: "objeto", desc: "100 milhões de seguidores" },
  ],
  Cena: ({ f, cam }) => {
    const set = RUA.set;
    const p: PersonProps = { ...props(PROTAGONISTA), ...idle(emPe(set, "chao", 960))(f), expr: "convencido" };
    p.lookAt = olhar(p, [600, 500]);
    const fas = FAS.map((a, i) => {
      const x = [300, 560, 1360, 1640][i];
      const m: PersonProps = { ...emPeNa(a, set, "chao", x, f + i * 5, { expr: "rindo" }), handR: [60, -330], gripR: "fist", handL: [-50, -300], gripL: "fist", propsHands: <g transform="translate(56 -350)"><rect x={-14} y={-26} width={28} height={46} rx={5} fill="#2A2A35" stroke={L} strokeWidth={4} /></g> };
      m.lookAt = olhar(m, [960, 500]);
      return m;
    });
    return <CenaCam cenario={RUA} f={f} cam={cam} noMeio={<>{fas.map((m, i) => <Person key={i} {...m} semente={101 + i} />)}<Person {...p} semente={1} /></>} />;
  },
  Sobre: ({ f }) => {
    const sCel = escalaPop(f, T(159), CORTE(159) + 30);
    return (
      <>
        {f >= T(158, 0.2) && [0, 1, 2, 3, 4, 5].map((i) => <Flash key={i} x={[340, 600, 1380, 1660, 470, 1500][i]} y={[260, 300, 250, 300, 220, 230][i]} k={((f - T(158, 0.2) + i * 5) % 16) / 10} />)}
        {sCel > 0 && (
          <g transform={`translate(1300 470) scale(${1.25 * sCel})`}>
            <IconeCelular>
              <circle cx={80} cy={60} r={34} fill="#E3A23B" stroke={L} strokeWidth={4} />
              <text x={80} y={130} textAnchor="middle" fontFamily={FONTE} fontWeight={900} fontSize={16} fill={L}>SEGUIDORES</text>
            </IconeCelular>
          </g>
        )}
        <Contador x={1300} y={520} f={f} de={T(159)} ate={T(159, 0.9)} valor={100000000} tam={30} cor="#C0504D" rot={0} fim={CORTE(159)} />
      </>
    );
  },
};

// ------------------------------------------------------------------ 61. seu rosto em um mural; "o sem fundo"
const MURAL = liso("#C9A68A");
const p61: PlanoV = {
  nome: "o mural", de: CORTE(159), ate: CORTE(161), enquadra: { x: 960, y: 560, zoom: 1.0 },
  eventos: [
    { f: CORTE(159), tipo: "corte", desc: "o muro" },
    { f: T(160, 0.2), tipo: "objeto", desc: "o mural com o rosto é pintado" },
    { f: T(161, fracDe(161, "chamar")), tipo: "pose", desc: "apontam e falam" },
    { f: T(161, fracDe(161, "o sem fundo")), tipo: "objeto", desc: "O SEM FUNDO" },
  ],
  Cena: ({ f, cam }) => {
    const set = MURAL.set;
    const k = entre(f, T(160, 0.1), T(160, 0.1) + 22);
    const gente = [111, 113, 114].map((s, i) => {
      const a = figurante(s);
      const x = [400, 960, 1520][i];
      const base = { ...emPe(set, "chao", x, 0, a.scale ?? 1), wide: a.wide };
      const aponta = f >= T(161, fracDe(161, "chamar")) + i * 3;
      const m: PersonProps = aponta ? { ...props(a), ...point({ ...base, alvo: [140, -330], expr: "rindo" })(f - T(161, fracDe(161, "chamar")) - i * 3), fala: falando(f, T(161, fracDe(161, "o sem fundo")) + i * 2, CORTE(161)) } : { ...props(a), ...idle(base)(f + i * 9), expr: "chocado" };
      m.lookAt = olhar(m, [960, 300]);
      return m;
    });
    const rosto: PersonProps = { ...props(PROTAGONISTA), x: 960, y: 1460, scale: 3.4, expr: "sigma", handL: [-72, -110], handR: [74, -108] };
    return (
      <CenaCam cenario={MURAL} f={f} cam={cam}
        noMeio={<>
          <defs><clipPath id="mural-clip"><rect x={360} y={70} width={1200 * k} height={760} /></clipPath></defs>
          <rect x={350 + 6} y={60 + 7} width={1220} height={780} fill="#D6D2CA" />
          <rect x={350} y={60} width={1220} height={780} fill="#E9DCC9" stroke={L} strokeWidth={7} />
          <g clipPath="url(#mural-clip)">
            <rect x={360} y={70} width={1200} height={760} fill="#F2D16B" />
            {Array.from({ length: 14 }, (_, i) => <path key={i} d={`M 960 520 L ${960 + Math.cos(i * 0.45) * 900} ${520 - Math.sin(i * 0.45) * 900} L ${960 + Math.cos(i * 0.45 + 0.2) * 900} ${520 - Math.sin(i * 0.45 + 0.2) * 900} Z`} fill="#E3A23B" opacity={0.6} />)}
            <Person {...rosto} semente={1} />
          </g>
          {gente.map((m, i) => <Person key={i} {...m} semente={111 + i} />)}
        </>}
      />
    );
  },
  Sobre: ({ f }) => <TextoPop x={960} y={700} f={f} de={T(161, fracDe(161, "o sem fundo"))} texto="“O SEM FUNDO”" tam={110} cor="#E0826E" rot={-5} />,
};

// ------------------------------------------------------------------ 62. 4.000 mensagens por dia; duas são de pessoas que você conhece
const AZULADO = liso("#D9E4EC");
const p62: PlanoV = {
  nome: "4.000 mensagens", de: CORTE(161), ate: CORTE(163), enquadra: { x: 960, y: 560, zoom: 1.0 },
  eventos: [
    { f: CORTE(161), tipo: "corte", desc: "o celular lotado" },
    { f: T(162, fracDe(162, "4.000")), tipo: "objeto", desc: "4.000 por dia" },
    { f: T(163), tipo: "objeto", desc: "as outras apagam" },
    { f: T(163, fracDe(163, "realmente")), tipo: "objeto", desc: "duas conhecidas: mãe e melhor amigo" },
  ],
  Cena: ({ f, cam }) => {
    const set = AZULADO.set;
    const p: PersonProps = { ...props(PROTAGONISTA), ...lookAtPhone(emPe(set, "chao", 480))(f), expr: f >= T(163, fracDe(163, "realmente")) ? "triste" : "chocado", propsHands: <g transform="translate(-22 -202)"><rect x={-12} y={-24} width={26} height={44} rx={5} fill="#2A2A35" stroke={L} strokeWidth={4} /></g> };
    return <CenaCam cenario={AZULADO} f={f} cam={cam} noMeio={<Person {...p} semente={1} />} />;
  },
  Sobre: ({ f }) => {
    const n = Math.min(7, Math.floor(Math.max(0, f - CORTE(161)) / 3));
    const rola = Math.max(0, f - CORTE(161)) * 9;
    const dois = f >= T(163, fracDe(163, "realmente"));
    const apaga = f >= T(163);
    return (
      <>
        <g transform="translate(1250 520) scale(1.75)">
          <IconeCelular>
            <rect x={0} y={0} width={160} height={30} fill="#2B3447" />
            <text x={80} y={21} textAnchor="middle" fontFamily={FONTE} fontWeight={900} fontSize={14} fill="#FFFFFF">MENSAGENS</text>
            <defs><clipPath id="cel-msgs"><rect x={0} y={32} width={160} height={248} /></clipPath></defs>
            <g clipPath="url(#cel-msgs)">
              {apaga
                ? [0, 1, 2, 3, 4, 5].map((i) => <Msg key={i} y={40 + i * 40} nome={dois && i === 1 ? "MÃE" : dois && i === 4 ? "MELHOR AMIGO" : undefined} destaque={dois && (i === 1 || i === 4)} apaga={!(dois && (i === 1 || i === 4))} />)
                : Array.from({ length: n + 6 }, (_, i) => <Msg key={i} y={40 + ((i * 40 + rola) % 280) - 40} />)}
            </g>
          </IconeCelular>
        </g>
        <TextoPop x={1250} y={150} f={f} de={T(162, fracDe(162, "4.000"))} ate={T(163)} texto="4.000 POR DIA" tam={70} cor="#E0826E" rot={-3} />
        <TextoPop x={1250} y={150} f={f} de={T(163, fracDe(163, "realmente"))} ate={CORTE(163)} texto="SÓ 2 CONHECIDAS" tam={64} rot={-3} />
      </>
    );
  },
};

// ------------------------------------------------------------------ 63. então vêm as regras; o Banco Central te convida para uma reunião
const p63: PlanoV = {
  nome: "as regras: o convite do Banco Central", de: CORTE(163), ate: CORTE(165), enquadra: { x: 960, y: 560, zoom: 1.0 },
  eventos: [
    { f: CORTE(163), tipo: "corte", desc: "o Banco Central" },
    { f: T(164, 0.2), tipo: "objeto", desc: "AS REGRAS" },
    { f: T(165, fracDe(165, "convida")), tipo: "objeto", desc: "o convite" },
    { f: T(165, fracDe(165, "reunião")), tipo: "pose", desc: "ele entra na sala" },
  ],
  Cena: ({ f, cam }) => {
    const set = ESCRITORIO.set;
    const { assento, ...base } = sentadoEm(set, "cadeira_esq");
    const pres: PersonProps = { ...props(PRESIDENTE_BC), ...sit({ ...base, assento, wide: PRESIDENTE_BC.wide })(f + 30), expr: "neutro" };
    pres.lookAt = olhar(pres, [1500, 500]);
    const fEntra = T(165, fracDe(165, "reunião"));
    const anda = walk({ ...emPe(set, "chao", 1980), xa: 1980, xb: 1600, f0: fEntra, quadros: 6 });
    const p: PersonProps | null = f >= fEntra ? { ...props(PROTAGONISTA), ...(f < anda.fim ? anda(f) : idle(emPe(set, "chao", 1600))(f)), expr: "convencido" } : null;
    if (p) p.lookAt = olhar(p, [640, 500]);
    return <CenaCam cenario={ESCRITORIO} f={f} cam={cam} noMeio={<><Person {...pres} semente={8} />{p && <Person {...p} semente={1} />}</>} />;
  },
  Sobre: ({ f }) => (
    <>
      <TextoPop x={1200} y={300} f={f} de={T(164, 0.2)} ate={T(165, fracDe(165, "convida"))} texto="AS REGRAS" tam={100} cor="#F2D16B" rot={-3} />
      <Selo x={1200} y={460} f={f} de={T(164, 0.4)} ate={T(165, fracDe(165, "convida"))} r={1}><g transform="scale(1.6)"><IconeContrato /></g></Selo>
      <Selo x={1150} y={360} f={f} de={T(165, fracDe(165, "convida"))} ate={CORTE(165)} r={1} rotulo="CONVITE"><g transform="scale(2)"><IconeEnvelope /></g></Selo>
    </>
  ),
};

// ------------------------------------------------------------------ 64. biscoitos; xícaras muito pequenas; gastos maiores do que os de alguns países; "Por favor, diminua o ritmo."
const Xicara: React.FC<{ s?: number }> = ({ s = 1 }) => (
  <g transform={`scale(${s})`}>
    <path d="M -10 -14 L 10 -14 L 8 0 L -8 0 Z" fill="#FFFFFF" stroke={L} strokeWidth={3} strokeLinejoin="round" />
    <path d="M 10 -11 q 7 1 4 8 q -2 2 -5 1" stroke={L} strokeWidth={2.5} fill="none" />
    <ellipse cx={0} cy={1} rx={13} ry={3} fill="#FFFFFF" stroke={L} strokeWidth={2.5} />
  </g>
);
const p64: PlanoV = {
  nome: "reunião no Banco Central", de: CORTE(165), ate: CORTE(169), enquadra: { x: 960, y: 640, zoom: 1.25 },
  eventos: [
    { f: CORTE(165), tipo: "corte", desc: "sentados à mesa" },
    { f: T(166), tipo: "objeto", desc: "biscoitos" },
    { f: T(167), tipo: "objeto", desc: "xícaras minúsculas" },
    { f: T(168, fracDe(168, "maiores")), tipo: "objeto", desc: "gráfico: você contra países" },
    { f: T(169), tipo: "pose", desc: "por favor, diminua o ritmo" },
  ],
  Cena: ({ f, cam }) => {
    const set = ESCRITORIO.set;
    const e = sentadoEm(set, "cadeira_esq");
    const d = sentadoEm(set, "cadeira_dir");
    const fala = falando(f, T(169), T(169, 1));
    let pres: PersonProps = { ...props(PRESIDENTE_BC), ...sit({ ...e, wide: PRESIDENTE_BC.wide })(f + 30), expr: f >= T(169) ? "triste" : "neutro", fala };
    if (f >= T(169)) pres = { ...pres, handL: [-96, -196 + 14 * Math.sin(f / 4)], handR: [100, -196 + 14 * Math.sin(f / 4)], gripL: "open", gripR: "open" };
    pres.lookAt = olhar(pres, [1280, 520]);
    let p: PersonProps = { ...props(PROTAGONISTA), ...sit(d)(f), expr: expressaoNoQuadro([[0, "convencido"], [T(168), "olhar-lateral"]], f, 6) };
    if (f >= T(167)) p = { ...p, handL: [-60, -250 + (p.abaixa ?? 0)], gripL: "fist", propsHands: <g transform={`translate(-60 ${-262 + (p.abaixa ?? 0)})`}><Xicara s={1} /></g> };
    p.lookAt = olhar(p, [640, 520]);
    return (
      <CenaCam cenario={ESCRITORIO} f={f} cam={cam}
        noMeio={<><Person {...pres} semente={8} /><Person {...p} semente={1} /></>}
        naFrente={<>
          {f >= T(166) && (
            <g transform={`translate(960 790) scale(${escalaPop(f, T(166), Infinity, 6)})`}>
              <ellipse cx={0} cy={-4} rx={70} ry={12} fill="#FFFFFF" stroke={L} strokeWidth={5} />
              {[-36, -12, 12, 36, -24, 0, 24].map((x, i) => <circle key={i} cx={x} cy={i < 4 ? -16 : -30} r={12} fill="#D9A45E" stroke={L} strokeWidth={3} />)}
            </g>
          )}
          {f >= T(167) && <g transform={`translate(800 790) scale(${1.4 * escalaPop(f, T(167), Infinity, 6)})`}><Xicara /></g>}
        </>}
      />
    );
  },
  Sobre: ({ f }) => {
    const s = escalaPop(f, T(168, fracDe(168, "maiores")), T(169));
    const k = entre(f, T(168, fracDe(168, "maiores")), T(168, fracDe(168, "maiores")) + 14);
    const barras: [string, number, string][] = [["PAÍS A", 0.35, "#8A8F98"], ["PAÍS B", 0.5, "#8A8F98"], ["VOCÊ", 1, "#E3A23B"]];
    return (
      <>
        {s > 0 && (
          <g transform={`translate(960 190) scale(${0.68 * s})`}>
            <rect x={-310 + 6} y={-200 + 7} width={620} height={360} rx={18} fill="#D6D2CA" />
            <rect x={-310} y={-200} width={620} height={360} rx={18} fill="#FFFFFF" stroke={L} strokeWidth={7} />
            {barras.map(([r, v, c], i) => (
              <g key={r}>
                <rect x={-230 + i * 170} y={110 - 260 * v * k} width={110} height={260 * v * k} fill={c} stroke={L} strokeWidth={5} />
                <text x={-175 + i * 170} y={146} textAnchor="middle" fontFamily={FONTE} fontWeight={900} fontSize={26} fill={L}>{r}</text>
              </g>
            ))}
            <line x1={-270} y1={110} x2={270} y2={110} stroke={L} strokeWidth={5} />
          </g>
        )}
        <TextoPop x={1150} y={250} f={f} de={T(169, 0.15)} ate={CORTE(169)} texto="“POR FAVOR, DIMINUA O RITMO.”" tam={54} cor="#F2D16B" rot={-2} />
      </>
    );
  },
};

// ------------------------------------------------------------------ 65. o Congresso discute por horas: limite; hospital primeiro; ainda discutindo
const TERNOS = ["#2B3447", "#3A3F4B", "#4A3424", "#2F4A3A"];
const PARLAMENTARES: Ator[] = [121, 122, 124, 127].map((s, i) => ({ ...figurante(s), outfit: { camiseta: TERNOS[i], calca: "#2B2B35", tenis: "#2B2B35", sola: "#141414" } }));
const Placa: React.FC<{ texto: string; cor: string; Ic?: React.FC }> = ({ texto, cor, Ic }) => (
  <g>
    <rect x={-6} y={0} width={12} height={90} fill="#A9714E" stroke={L} strokeWidth={4} />
    <rect x={-110 + 5} y={-90 + 6} width={220} height={100} rx={10} fill="#D6D2CA" />
    <rect x={-110} y={-90} width={220} height={100} rx={10} fill={cor} stroke={L} strokeWidth={6} />
    {Ic ? <g transform="translate(-60 -40) scale(0.5)"><Ic /></g> : null}
    <text x={Ic ? 30 : 0} y={-28} textAnchor="middle" fontFamily={FONTE} fontWeight={900} fontSize={Ic ? 28 : 40} fill="#FFFFFF">{texto}</text>
  </g>
);
const p65: PlanoV = {
  nome: "o Congresso discute", de: CORTE(169), ate: CORTE(173), enquadra: { x: 960, y: 560, zoom: 1.0 },
  eventos: [
    { f: CORTE(169), tipo: "corte", desc: "o plenário" },
    { f: T(170, fracDe(170, "por horas")), tipo: "objeto", desc: "o relógio gira rápido" },
    { f: T(170, fracDe(170, "uma lei")), tipo: "objeto", desc: "a lei" },
    { f: T(171, fracDe(171, "querem")), tipo: "objeto", desc: "placa LIMITE" },
    { f: T(172, fracDe(172, "hospital")), tipo: "objeto", desc: "placa HOSPITAL" },
    { f: T(173), tipo: "objeto", desc: "ainda discutindo: calendário" },
  ],
  Cena: ({ f, cam }) => {
    const set = PLENARIO.set;
    const xs = [330, 790, 1250, 1710];
    const gente = PARLAMENTARES.map((a, i) => {
      const base = { ...emPe(set, "chao", xs[i] + 40, 1, a.scale ?? 1), wide: a.wide };
      const fala = falando(f, T(170) + i * 7, CORTE(173));
      const vira = i % 2 === 1;
      let m: PersonProps = { ...props(a), ...point({ ...base, alvo: [190, -260], expr: "bravo" })(f - T(170) - i * 4), fala, flip: vira };
      if (i === 0 && f >= T(171, fracDe(171, "querem"))) m = { ...m, handR: [70, -290], gripR: "fist", propsHands: <g transform="translate(70 -380)"><Placa texto="LIMITE" cor="#C0504D" /></g> };
      if (i === 3 && f >= T(172, fracDe(172, "hospital"))) m = { ...m, handR: [70, -290], gripR: "fist", flip: false, propsHands: <g transform="translate(70 -380)"><Placa texto="PRIMEIRO" cor="#2F6E9E" Ic={IconeHospital} /></g> };
      const la = olhar(m, [xs[i] + (vira ? -400 : 400), 500]);
      m.lookAt = m.flip ? [-la[0], la[1]] : la;
      return m;
    });
    const giro = f >= T(170, fracDe(170, "por horas")) ? (f - T(170, fracDe(170, "por horas"))) * 40 : 0;
    return (
      <CenaCam cenario={PLENARIO} f={f} cam={cam}
        noMeio={<>
          <g transform="translate(960 230) scale(1.6)"><IconeRelogio giro={giro} /></g>
          {gente.map((m, i) => <Person key={i} {...m} semente={121 + i} />)}
        </>}
      />
    );
  },
  Sobre: ({ f }) => {
    const s = escalaPop(f, T(173), CORTE(173));
    const dia = f >= T(173) ? Math.min(30, 1 + Math.floor((f - T(173)) / 3)) : 1;
    return (
      <>
        <TextoPop x={960} y={430} f={f} de={T(170, fracDe(170, "por horas"))} ate={T(171)} texto="POR HORAS" tam={64} rot={-3} />
        <Selo x={1500} y={260} f={f} de={T(170, fracDe(170, "uma lei"))} ate={T(171, fracDe(171, "querem"))} r={1} rotulo="LEI"><g transform="scale(1.4)"><IconeContrato /></g></Selo>
        {s > 0 && <g transform={`translate(1500 220) scale(${1.6 * s})`}><IconeCalendario texto={`DIA ${dia}`} cor="#2F6E9E" /></g>}
      </>
    );
  },
};

// ------------------------------------------------------------------ 66. alguns países deixam de aceitar reais: "Obrigado. Estamos bem."
const LOJISTA: Ator = { nome: "lojista estrangeiro", desc: "cacheado ruivo, bigode, avental", hair: "cacheado", hairColor: "#B5523B", mustache: "#B5523B", expr: "rindo", outfit: { camiseta: "#7A5EA8", calca: "#2B2B35", tenis: "#FFFFFF", sola: "#141414" }, apron: "#F4F1EA" };
const LOJA_FORA: CenarioDef = (() => {
  const set = lisoSet(1.35);
  set.id = "loja_fora";
  set.nome = "Loja em outro país";
  set.ancoras = { chao: { tipo: "chao", y: 966, yFundo: 958, x0: 60, x1: 1860 }, chao_balcao: { tipo: "chao", y: 905, x0: 900, x1: 1500 }, balcao: { tipo: "tampo", y: 770, x0: 840, x1: 1520 } };
  const Fundo: React.FC<{ t: number }> = () => (
    <g>
      <rect x={-MARGEM} y={-MARGEM} width={1920 + 2 * MARGEM} height={1200} fill="#CFE3D6" />
      {[300, 520].map((y) => <rect key={y} x={700} y={y} width={1000} height={18} fill="#A9714E" />)}
      {Array.from({ length: 20 }, (_, i) => <rect key={i} x={730 + (i % 10) * 96} y={(i < 10 ? 300 : 520) - 70} width={56} height={70} rx={10} fill={["#E0826E", "#F2D16B", "#7FD18C", "#9ED8F5", "#E37BA1"][i % 5]} />)}
    </g>
  );
  const Meio: React.FC<{ t: number }> = () => (
    <g>
      {Array.from({ length: 12 }, (_, i) => <rect key={i} x={-MARGEM + i * 200} y={-MARGEM} width={100} height={120 + MARGEM} fill={i % 2 ? "#FFFFFF" : "#C0504D"} stroke={L} strokeWidth={5} />)}
      <Rect x={-MARGEM} y={900} width={1920 + 2 * MARGEM} height={200} fill="#E3D5BF" stroke={L} strokeWidth={7} semSombra />
    </g>
  );
  const Balcao: React.FC<{ t: number }> = () => (
    <Papel>
      <Rect x={840} y={770} width={680} height={36} rx={8} fill="#A9714E" stroke={L} strokeWidth={7} />
      <Rect x={860} y={806} width={640} height={160} fill="#C9955E" stroke={L} strokeWidth={7} />
    </Papel>
  );
  const Frente: React.FC<{ t: number }> = () => null;
  return { set, Fundo, Meio, Balcao, Frente };
})();
const p66: PlanoV = {
  nome: "outro país: não aceitam reais", de: CORTE(173), ate: CORTE(176), enquadra: { x: 1000, y: 580, zoom: 1.1 },
  eventos: [
    { f: CORTE(173), tipo: "corte", desc: "uma loja em outro país" },
    { f: CORTE(173) + 4, tipo: "objeto", desc: "o globo: outro país" },
    { f: T(174, fracDe(174, "aceitar")), tipo: "objeto", desc: "R$ riscado no balcão" },
    { f: T(175), tipo: "pose", desc: "obrigado: o lojista recusa com educação" },
  ],
  Cena: ({ f, cam }) => {
    const set = LOJA_FORA.set;
    let p: PersonProps = { ...props(PROTAGONISTA), ...idle(emPe(set, "chao", 640))(f), expr: f >= T(175) ? "olhar-lateral" : "convencido" };
    p = segura(p, "R", [130, -230], CARTAO, { t: 0 }, -10);
    p.lookAt = olhar(p, [1200, 500]);
    let l: PersonProps = { ...emPeNa(LOJISTA, set, "chao_balcao", 1180, f), expr: "rindo", fala: falando(f, T(175), T(176, 1)) };
    if (f >= T(175)) l = { ...l, handL: [-110, -260], gripL: "open" };
    l.lookAt = olhar(l, [640, 500]);
    const s = escalaPop(f, T(174, fracDe(174, "aceitar")), Infinity, 7);
    return (
      <CenaCam cenario={LOJA_FORA} f={f} cam={cam}
        noMeio={<Person {...l} semente={131} />}
        naFrente={<>
          {s > 0 && (
            <g transform={`translate(1000 770) scale(${s})`}>
              <rect x={-90} y={-110} width={180} height={110} rx={10} fill="#FFFFFF" stroke={L} strokeWidth={6} />
              <text x={0} y={-36} textAnchor="middle" fontFamily={FONTE} fontWeight={900} fontSize={64} fill={L}>R$</text>
              <g transform="translate(0 -55) scale(0.55)"><IconeX r={80} /></g>
            </g>
          )}
          <Person {...p} semente={1} />
        </>}
      />
    );
  },
  Sobre: ({ f }) => (
    <>
      <Selo x={260} y={220} f={f} de={CORTE(173) + 4} ate={CORTE(176)} r={110} rotulo="OUTRO PAÍS"><IconeGlobo giro={f * 2} /></Selo>
      <TextoPop x={1300} y={200} f={f} de={T(175)} ate={CORTE(176)} texto="“OBRIGADO.”" tam={70} cor="#F2D16B" rot={3} />
      <TextoPop x={1300} y={290} f={f} de={T(176)} ate={CORTE(176)} texto="“ESTAMOS BEM.”" tam={60} rot={-2} />
    </>
  ),
};

// ------------------------------------------------------------------ 67. e existe um custo; no começo é pequeno (uma nuvenzinha)
const CINZA_AZUL = liso("#DCE1E6");
const p67: PlanoV = {
  nome: "o custo: uma nuvenzinha", de: CORTE(176), ate: CORTE(178), enquadra: { x: 960, y: 600, zoom: 1.2 },
  eventos: [
    { f: CORTE(176), tipo: "corte", desc: "o protagonista sozinho" },
    { f: T(177, fracDe(177, "custo")), tipo: "objeto", desc: "uma nuvenzinha aparece" },
    { f: T(178, fracDe(178, "pequeno")), tipo: "expressao", desc: "ele olha para cima" },
  ],
  Cena: ({ f, cam }) => {
    const set = CINZA_AZUL.set;
    const p: PersonProps = { ...props(PROTAGONISTA), ...idle(emPe(set, "chao", 960))(f), expr: f >= T(178, fracDe(178, "pequeno")) ? "olhar-lateral" : "neutro" };
    p.lookAt = f >= T(178, fracDe(178, "pequeno")) ? [10, -600] : [0, -330];
    const s = escalaPop(f, T(177, fracDe(177, "custo")), Infinity, 10) * 0.55;
    return <CenaCam cenario={CINZA_AZUL} f={f} cam={cam} noMeio={<><Person {...p} semente={1} />{s > 0 && <g transform={`translate(${1000 + Math.sin(f / 15) * 10} ${962 - 330 * 1.35 - 230})`}><Nuvem s={s} f={f} /></g>}</>} />;
  },
};

// ------------------------------------------------------------------ 68. o presente da mãe; pode comprar qualquer coisa; nada tem o mesmo significado (as cores somem)
const ROSA = liso("#F2E3E8");
const COISAS: React.FC[] = [IconeCarro, IconeCasa, IconeJatinho, () => <g transform="scale(0.5)"><IconeFoguete /></g>, () => <g transform="scale(0.8)"><IconeTV /></g>, () => <g transform="translate(-40 40) scale(0.22)"><CuboOuro lado={360} /></g>];
const p68: PlanoV = {
  nome: "o presente perde o significado", de: CORTE(178), ate: CORTE(181), enquadra: { x: 960, y: 560, zoom: 1.0 },
  eventos: [
    { f: CORTE(178), tipo: "corte", desc: "o presente da mãe" },
    { f: T(179, fracDe(179, "presente")), tipo: "objeto", desc: "compra o presente: BIP", verbo: "comprar" },
    { f: T(180, fracDe(180, "comprar")), tipo: "objeto", desc: "qualquer coisa: as coisas em volta", verbo: "comprar" },
    { f: T(181, fracDe(181, "nada")), tipo: "objeto", desc: "as cores somem" },
  ],
  Cena: ({ f, cam }) => {
    const set = ROSA.set;
    let p: PersonProps = { ...props(PROTAGONISTA), ...idle(emPe(set, "chao", 960))(f), expr: expressaoNoQuadro([[0, "rindo"], [T(180), "convencido"], [T(181, fracDe(181, "nada")), "triste"]], f, 6) };
    p = { ...p, handL: [-60, -190], handR: [60, -190], gripL: "open", gripR: "open", propsHands: <g transform="translate(0 -170)"><Presente /></g> };
    p.lookAt = olhar(p, f >= T(180) ? [960, 200] : [960, 760]);
    const cinza = entre(f, T(181, fracDe(181, "nada")), T(181, fracDe(181, "nada")) + 20);
    return (
      <CenaCam cenario={ROSA} f={f} cam={cam}
        noMeio={<g style={{ filter: `grayscale(${cinza.toFixed(3)})` }}><Person {...p} semente={1} /></g>}
      />
    );
  },
  Sobre: ({ f }) => {
    const cinza = entre(f, T(181, fracDe(181, "nada")), T(181, fracDe(181, "nada")) + 20);
    const fQ = T(180, fracDe(180, "comprar"));
    return (
      <g style={{ filter: `grayscale(${cinza.toFixed(3)})` }}>
        <Estrela x={1220} y={380} f={f} de={T(179, fracDe(179, "presente"))} ate={T(179, fracDe(179, "presente")) + 16} texto="BIP!" r={80} />
        <TextoPop x={1300} y={520} f={f} de={T(179, fracDe(179, "mãe"))} ate={T(180)} texto="PARA A MÃE" tam={60} cor="#E37BA1" rot={-3} />
        {COISAS.map((Ic, i) => {
          const [x, y] = ([[560, 330], [760, 230], [1160, 230], [1360, 330], [470, 600], [1450, 600]] as const)[i];
          const s = escalaPop(f, fQ + i * 3, CORTE(181), 7);
          return s > 0 ? <g key={i} transform={`translate(${x} ${y}) scale(${1.4 * s})`}><Ic /></g> : null;
        })}
        <TextoPop x={960} y={120} f={f} de={T(180, fracDe(180, "qualquer coisa"))} ate={T(181, fracDe(181, "nada"))} texto="QUALQUER COISA" tam={70} cor="#F2D16B" rot={-2} />
      </g>
    );
  },
};

// ------------------------------------------------------------------ 69. ela sorri ao receber o colar de diamantes (sorriso educado)
const p69: PlanoV = {
  nome: "o colar", de: CORTE(181), ate: CORTE(182), enquadra: { x: 1000, y: 600, zoom: 1.3 },
  eventos: [
    { f: CORTE(181), tipo: "corte", desc: "a mãe recebe o colar" },
    { f: T(182, fracDe(182, "sorri")), tipo: "expressao", desc: "sorriso educado" },
  ],
  Cena: ({ f, cam }) => {
    const set = SALA.set;
    let m: PersonProps = emPeNa(MAE, set, "chao", 1180, f, { expr: f >= T(182, fracDe(182, "sorri")) ? "convencido" : "neutro" });
    m = segura(m, "L", [-70, -250], COLAR, { t: f / 30 }, 0);
    m.lookAt = olhar(m, [760, 520]);
    const p: PersonProps = { ...props(PROTAGONISTA), ...idle(emPe(set, "chao", 760))(f), expr: "rindo" };
    p.lookAt = olhar(p, [1180, 520]);
    return <CenaCam cenario={SALA} f={f} cam={cam} noMeio={<><Person {...p} semente={1} /><Person {...m} semente={2} /></>} />;
  },
};

// ------------------------------------------------------------------ 70. lembrança: o cartão de macarrão aos seis anos; ela chorou de verdade
const p70: PlanoV = {
  nome: "lembrança: o cartão de macarrão", de: CORTE(182), ate: CORTE(183), enquadra: { x: 960, y: 640, zoom: 1.3 },
  eventos: [
    { f: CORTE(182), tipo: "corte", desc: "lembrança em sépia: aos seis anos" },
    { f: T(183, fracDe(183, "chorou")), tipo: "expressao", desc: "a mãe chora de alegria", verbo: "chorar" },
    { f: T(183, fracDe(183, "cartão de macarrão")), tipo: "objeto", desc: "o cartão de macarrão" },
  ],
  Cena: ({ f, cam }) => {
    const set = SALA.set;
    let crianca: PersonProps = { ...props(PROTAGONISTA), ...idle(emPe(set, "chao", 820, 0, 0.62))(f), expr: "rindo", headScale: 1.1 };
    crianca = segura(crianca, "R", [96, -200], CARTAO_MACARRAO, { t: 0 }, 0);
    crianca.lookAt = olhar(crianca, [1100, 400]);
    const chora = f >= T(183, fracDe(183, "chorou"));
    const m: PersonProps = emPeNa(MAE, set, "chao", 1100, f, { expr: chora ? "rindo" : "chocado", handL: [-40, -300], handR: [40, -300], gripL: "open", gripR: "open" });
    m.lookAt = olhar(m, [820, 800]);
    const rosto = rostoNoMundo(m);
    return (
      <CenaCam cenario={SALA} f={f} cam={cam}
        noMeio={<><Person {...crianca} semente={1} /><Person {...m} semente={2} />{chora && <Lagrimas x={rosto[0]} y={rosto[1] + 10} f={f} s={1.35} />}</>}
      />
    );
  },
  Sobre: ({ f }) => (
    <>
      <rect x={0} y={0} width={1920} height={1080} fill="#B08A4E" opacity={0.28} style={{ mixBlendMode: "multiply" }} />
      <rect x={30} y={30} width={1860} height={1020} rx={30} fill="none" stroke="#F4F1EA" strokeWidth={26} opacity={0.85} />
      <TextoPop x={300} y={170} f={f} de={CORTE(182) + 4} texto="6 ANOS" tam={80} cor="#F2D16B" rot={-6} />
    </>
  ),
};

// ------------------------------------------------------------------ 71. o telefone não para de tocar; todos querem alguma coisa: velhos amigos, novos amigos, crianças da escola
const GRUPOS: [string, number[]][] = [["VELHOS AMIGOS", [141, 142]], ["NOVOS AMIGOS", [144, 145]], ["CRIANÇAS DA ESCOLA", [147, 148]]];
const p71: PlanoV = {
  nome: "todos querem alguma coisa", de: CORTE(183), ate: CORTE(186), enquadra: { x: 960, y: 600, zoom: 1.0 },
  eventos: [
    { f: CORTE(183), tipo: "corte", desc: "o telefone tocando" },
    { f: T(184, 0.3), tipo: "objeto", desc: "TRIM! sem parar" },
    { f: T(185), tipo: "pose", desc: "todos estendem a mão" },
    { f: T(186, fracDe(186, "novos amigos")), tipo: "objeto", desc: "novos amigos" },
    { f: T(186, fracDe(186, "crianças")), tipo: "objeto", desc: "crianças da escola" },
  ],
  Cena: ({ f, cam }) => {
    const set = RUA.set;
    const p: PersonProps = { ...props(PROTAGONISTA), ...lookAtPhone(emPe(set, "chao", 380))(f), x: 380 + (f % 4 < 2 ? 1.5 : -1.5) * (f < T(185) ? 1 : 0), expr: f >= T(185) ? "chocado" : "olhar-lateral", propsHands: <g transform="translate(-22 -202)"><rect x={-12} y={-24} width={26} height={44} rx={5} fill="#2A2A35" stroke={L} strokeWidth={4} /></g> };
    const gente = GRUPOS.flatMap(([, ss], g) => ss.map((s, j) => {
      const a = figurante(s);
      const pequeno = g === 2;
      const x = 820 + g * 380 + j * 150;
      const base = { ...emPe(set, "chao", x, 0, (a.scale ?? 1) * (pequeno ? 0.72 : 1)), wide: a.wide };
      const fG = g === 0 ? T(185) : T(186, fracDe(186, g === 1 ? "novos amigos" : "crianças"));
      if (f < fG) return null;
      const m: PersonProps = { ...props(a), ...idle(base)(f + j * 7), headScale: pequeno ? 1.1 : undefined, expr: "rindo", handL: [-110, -220], gripL: "open" };
      m.lookAt = olhar(m, [380, 500]);
      return m;
    })).filter(Boolean) as PersonProps[];
    return <CenaCam cenario={RUA} f={f} cam={cam} noMeio={<><Person {...p} semente={1} />{gente.map((m, i) => <Person key={i} {...m} semente={141 + i} />)}</>} />;
  },
  Sobre: ({ f }) => (
    <>
      {f < T(185) && [0, 1, 2].map((i) => <Estrela key={i} x={[260, 520, 390][i]} y={[260, 300, 200][i]} f={f} de={CORTE(183) + i * 8 + Math.floor((f - CORTE(183)) / 24) * 24} ate={CORTE(183) + i * 8 + Math.floor((f - CORTE(183)) / 24) * 24 + 14} texto="TRIM!" r={70} />)}
      {GRUPOS.map(([rot], g) => <TextoPop key={rot} x={895 + g * 380} y={[560, 520, 640][g]} f={f} de={g === 0 ? T(186) : T(186, fracDe(186, g === 1 ? "novos amigos" : "crianças"))} ate={CORTE(186)} texto={rot} tam={g === 2 ? 40 : 48} cor="#F2D16B" rot={g % 2 ? 3 : -3} />)}
    </>
  ),
};

// ------------------------------------------------------------------ 72. o melhor amigo fica quieto; a pizza esfria; "Não é que eu esteja com ciúmes. É só que não sei mais o que posso te dar."
const p72: PlanoV = {
  nome: "o amigo quieto, a pizza fria", de: CORTE(186), ate: CORTE(190), enquadra: { x: 860, y: 640, zoom: 1.3 },
  eventos: [
    { f: CORTE(186), tipo: "corte", desc: "o amigo quieto no sofá" },
    { f: T(188), tipo: "objeto", desc: "ele ainda compra a pizza", verbo: "comprar" },
    { f: T(188, fracDe(188, "esfria")), tipo: "objeto", desc: "o vapor some: a pizza esfria" },
    { f: T(189), tipo: "pose", desc: "ele fala" },
    { f: T(190, 0.2), tipo: "pose", desc: "abre as mãos: não sei o que te dar" },
  ],
  Cena: ({ f, cam }) => {
    const set = SALA.set;
    let a = sentadoNa(AMIGO, set, "sofa_esq", f, { expr: f >= T(189) ? "triste" : "neutro", fala: falando(f, T(189), T(190, 1)) });
    if (f >= T(190, 0.2)) { const k = entre(f, T(190, 0.2), T(190, 0.2) + 8); a = { ...a, handL: [-72 - 50 * k, -190 + (a.abaixa ?? 0) - 30 * k], handR: [74 + 50 * k, -190 + (a.abaixa ?? 0) - 30 * k], gripL: "open", gripR: "open", ombros: 8 * k }; }
    a.lookAt = olhar(a, f >= T(189) ? [1050, 560] : [850, 940]);
    const p = sentadoNa(PROTAGONISTA, set, "sofa_dir", f, { expr: f >= T(189) ? "triste" : "olhar-lateral" });
    p.lookAt = olhar(p, [650, 560]);
    const quente = 1 - entre(f, T(188, fracDe(188, "esfria")), T(188, fracDe(188, "esfria")) + 20);
    return (
      <CenaCam cenario={SALA} f={f} cam={cam}
        noMeio={<><Person {...a} semente={4} /><Person {...p} semente={1} /></>}
        naFrente={<>
          <ObjetoNoMundo def={PIZZA} em={[850, 945]} s={2.4} e={{ t: 0 }} />
          {quente > 0.02 && [0, 1, 2].map((i) => <path key={i} d={`M ${810 + i * 40} 890 q 12 -20 0 -40 q -12 -20 0 -40`} transform={`translate(0 ${-((f + i * 10) % 30)})`} stroke="#FFFFFF" strokeWidth={7} fill="none" strokeLinecap="round" opacity={quente * (1 - ((f + i * 10) % 30) / 30)} />)}
          {f >= T(188, fracDe(188, "esfria")) + 10 && <g transform={`translate(960 880) scale(${escalaPop(f, T(188, fracDe(188, "esfria")) + 10, T(189), 6)})`}><path d="M 0 -30 L 0 30 M -26 -15 L 26 15 M -26 15 L 26 -15" stroke="#5AA5B8" strokeWidth={8} strokeLinecap="round" /></g>}
        </>}
      />
    );
  },
};

// ------------------------------------------------------------------ 73. a parte mais silenciosa: a padaria da esquina; a mãe contando moedas para comprar pão
const p73: PlanoV = {
  nome: "padaria: a mãe conta moedas", de: CORTE(190), ate: CORTE(193), enquadra: { x: 960, y: 580, zoom: 1.0 },
  eventos: [
    { f: CORTE(190), tipo: "corte", desc: "a padaria em silêncio" },
    { f: T(192), tipo: "pose", desc: "você entra na padaria" },
    { f: T(193, fracDe(193, "contando")), tipo: "objeto", desc: "a mãe conta moedas no balcão" },
    { f: T(193, fracDe(193, "comprar")), tipo: "objeto", desc: "entrega as moedas pelo pão", verbo: "comprar" },
  ],
  Cena: ({ f, cam }) => {
    const set = PADARIA.set;
    const anda = walk({ ...emPe(set, "chao", -120), xa: -120, xb: 330, f0: T(192), quadros: 8 });
    const p: PersonProps | null = f >= T(192) ? { ...props(PROTAGONISTA), ...(f < anda.fim ? anda(f) : idle(emPe(set, "chao", 330))(f)), expr: "neutro" } : null;
    if (p) p.lookAt = olhar(p, [760, 600]);
    const conta = f >= T(193, fracDe(193, "contando"));
    let m: PersonProps = emPeNa(MAE, set, "chao", 760, f, { expr: "triste" });
    if (conta) m = segura(m, "R", [120 + (Math.floor(f / 8) % 2) * 14, -226], MOEDA, { t: 0 }, 0);
    m.lookAt = olhar(m, [900, 760]);
    const pad: PersonProps = emPeNa(PADEIRO, set, "chao_balcao", 1160, f, { expr: "neutro" });
    pad.lookAt = olhar(pad, [760, 600]);
    const n = conta ? Math.min(6, Math.floor((f - T(193, fracDe(193, "contando"))) / 8) + 1) : 0;
    return (
      <CenaCam cenario={PADARIA} f={f} cam={cam}
        noMeio={<Person {...pad} semente={7} />}
        naFrente={<>
          {Array.from({ length: n }, (_, i) => <g key={i} transform={`translate(${880 + i * 22} 758) scale(1.2)`}><MOEDA.Desenho t={0} /></g>)}
          <ObjetoNoMundo def={PAO} em={[1040, 758]} s={1.6} e={{ t: 0 }} />
          <Person {...m} semente={2} />
          {p && <Person {...p} semente={1} />}
        </>}
      />
    );
  },
};

// ------------------------------------------------------------------ 74. um pão custava R$ 2; agora custa R$ 3
const p74: PlanoV = {
  nome: "o preço do pão", de: CORTE(193), ate: CORTE(195), enquadra: { x: 1040, y: 760, zoom: 2.4 },
  eventos: [
    { f: CORTE(193), tipo: "corte", desc: "close no pão e na etiqueta" },
    { f: T(194, fracDe(194, "R$ 2")), tipo: "objeto", desc: "R$ 2" },
    { f: T(195, fracDe(195, "R$ 3")), tipo: "objeto", desc: "R$ 2 riscado: R$ 3" },
  ],
  Cena: ({ f, cam }) => {
    const set = PADARIA.set;
    const pad: PersonProps = emPeNa(PADEIRO, set, "chao_balcao", 1160, f, { expr: "neutro" });
    const muda = f >= T(195, fracDe(195, "R$ 3"));
    return (
      <CenaCam cenario={PADARIA} f={f} cam={cam}
        noMeio={<Person {...pad} semente={7} />}
        naFrente={<>
          <ObjetoNoMundo def={PAO} em={[1040, 758]} s={1.6} e={{ t: 0 }} />
          <g transform="translate(1110 700) rotate(-6)">
            <rect x={-56 + 3} y={-34 + 4} width={112} height={68} rx={8} fill="#D6D2CA" />
            <rect x={-56} y={-34} width={112} height={68} rx={8} fill={muda ? "#FCE3DC" : "#FFFFFF"} stroke={L} strokeWidth={4} />
            <text x={0} y={14} textAnchor="middle" fontFamily={FONTE} fontWeight={900} fontSize={36} fill={L}>{muda ? "R$ 3" : "R$ 2"}</text>
            {muda && f < T(195, fracDe(195, "R$ 3")) + 8 && <line x1={-40} y1={0} x2={40} y2={0} stroke="#C0504D" strokeWidth={6} />}
          </g>
          {Array.from({ length: 6 }, (_, i) => <g key={i} transform={`translate(${880 + i * 22} 758) scale(1.2)`}><MOEDA.Desenho t={0} /></g>)}
        </>}
      />
    );
  },
  Sobre: ({ f }) => {
    const fM = T(195, fracDe(195, "R$ 3"));
    return (
      <>
        {f >= fM && f < fM + 8 && <g transform="translate(1128 430)"><Texto texto="R$ 2" tam={120} cor="#FFFFFF" /><line x1={-130} y1={-30} x2={130} y2={-30} stroke="#C0504D" strokeWidth={16} /></g>}
        <TextoPop x={1500} y={300} f={f} de={T(194, fracDe(194, "custava"))} ate={fM} texto="CUSTAVA R$ 2" tam={60} rot={-3} />
        <TextoPop x={1500} y={300} f={f} de={fM} ate={CORTE(195)} texto="AGORA R$ 3" tam={76} cor="#E0826E" rot={-3} />
      </>
    );
  },
};

// ------------------------------------------------------------------ 75. ela não diz nada; não precisa; você fez isso
const p75: PlanoV = {
  nome: "você fez isso", de: CORTE(195), ate: CORTE(198), enquadra: { x: 560, y: 600, zoom: 1.35 },
  reacoes: [{ em: T(198), alvo: [330, 966 - 330 * 1.35], z: 1.3, quadros: 10, solta: CORTE(198) + 30 }],
  eventos: [
    { f: CORTE(195), tipo: "corte", desc: "a mãe em silêncio, o protagonista atrás" },
    { f: T(196, 0.3), tipo: "expressao", desc: "ela abaixa os olhos" },
    { f: T(197), tipo: "pose", desc: "ela guarda as moedas" },
    { f: T(198), tipo: "camera", desc: "você fez isso: zoom no rosto" },
  ],
  Cena: ({ f, cam }) => {
    const set = PADARIA.set;
    let m: PersonProps = emPeNa(MAE, set, "chao", 760, f, { expr: "triste" });
    if (f >= T(197)) m = segura(m, "R", [60, -150], PAO, { t: 0 }, 0);
    m.lookAt = f >= T(196, 0.3) ? [30, -160] : olhar(m, [900, 760]);
    const p: PersonProps = { ...props(PROTAGONISTA), ...idle(emPe(set, "chao", 330))(f), expr: expressaoNoQuadro([[0, "neutro"], [T(197), "triste"]], f, 8) };
    p.lookAt = olhar(p, f >= T(198) ? [960, 520] : [760, 560]);
    return <CenaCam cenario={PADARIA} f={f} cam={cam} naFrente={<><Person {...m} semente={2} /><Person {...p} semente={1} /></>} />;
  },
};

export const CAP8: PlanoV[] = [p60, p61, p62, p63, p64, p65, p66, p67, p68, p69, p70, p71, p72, p73, p74, p75];
export const FIM_CAP8 = CORTE(198);
export const FIGURADOS_CAP8: Record<number, string[]> = {};
