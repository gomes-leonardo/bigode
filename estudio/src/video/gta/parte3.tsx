// Parte 3 (falas 70 a 98): código 3, nível de procurado, o único que o jogo inverteu. No jogo as estrelas descem
// sozinhas e sumir de vista é sumir; fora dele a procura não depende de olhar (câmera térmica, antena, placa) e as
// estrelas só sobem. O círculo não pisca. Os três códigos tinham isso em comum: a regra para de valer para você e
// continua valendo para tudo em volta. Téo fecha o teclado; o cursor ainda pisca. Qual código você digitaria?
import React from "react";
import { Person, type PersonProps } from "../../components/Person";
import { expressaoNoQuadro } from "../../components/Face";
import { idle, walk } from "../../rig/actions";
import { emPe } from "../../cenarios/ancoras";
import { liso } from "../../cenarios/liso/Liso";
import { PROTAGONISTA, figurante } from "../../elenco/elenco";
import { olhar, props } from "../../fase4/Cenarios";
import { FONTE } from "../../fontes";
import { IconeCelular, IconeGlobo, IconeRelogio, IconeX, Texto, TextoPop, escalaPop } from "../graficos";
import { CenaCam, entre, rostoNoMundo, type PlanoV } from "../cartao/comum";
import { CORTE, DURACAO, FALAS, T, fracDe } from "./tempo";
import { LETRAS, cartelaCodigo } from "./parte1";
import {
  Antena, BECO, Bilhete, CameraRua, Cartaz, Conta, Escudo, Estrelas, Galaxia, Hatch, Helicoptero, Inercia, Interruptor, MESA_TEO, Olho, Placa, SilhuetaQuente, Tecla, TelaJogo,
} from "./pecas";

const L = "#141414";
const TEO = PROTAGONISTA;
const ESCURO = liso("#26313F");
const BEGE = liso("#EADFCB");
const lim = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const pisca = (f: number, periodo = 16) => Math.floor(f / (periodo / 2)) % 2 === 0;

/** bonequinho do jogo (dentro da tela) */
const Boneco: React.FC<{ x: number; y: number; f: number; s?: number; opacidade?: number }> = ({ x, y, f, s = 0.5, opacidade = 1 }) => (
  <g opacity={opacidade}><Person {...props(TEO)} {...idle({ x, y, scale: s })(f)} expr="olhar-lateral" semente={1} /></g>
);
/** filtros da visão térmica: o corpo vira mancha quente (brilho borrado + miolo claro) */
const FiltrosTermicos: React.FC = () => (
  <defs>
    <filter id="termica-brilho" x="-50%" y="-50%" width="200%" height="200%">
      <feColorMatrix type="matrix" values="0 0 0 0 0.95  0 0 0 0 0.42  0 0 0 0 0.12  0 0 0 1 0" />
      <feGaussianBlur stdDeviation="16" />
    </filter>
    <filter id="termica-miolo" x="-20%" y="-20%" width="140%" height="140%">
      <feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 0.84  0 0 0 0 0.36  0 0 0 1 0" />
      <feGaussianBlur stdDeviation="3" />
    </filter>
  </defs>
);
/** moldura de visor (cantos, REC, rótulo) */
const Visor: React.FC<{ f: number; rotulo: string }> = ({ f, rotulo }) => (
  <g>
    {[[80, 80, 1, 1], [1840, 80, -1, 1], [80, 1000, 1, -1], [1840, 1000, -1, -1]].map(([x, y, sx, sy], i) => (
      <path key={i} d={`M ${x} ${y + 90 * sy} L ${x} ${y} L ${x + 90 * sx} ${y}`} fill="none" stroke="#FFFFFF" strokeWidth={8} strokeLinecap="round" />
    ))}
    <text x={130} y={150} fontFamily={FONTE} fontWeight={900} fontSize={40} fill="#FFFFFF">{rotulo}</text>
    {pisca(f, 30) && <circle cx={1700} cy={136} r={14} fill="#E0504D" />}
    <text x={1730} y={150} fontFamily={FONTE} fontWeight={900} fontSize={40} fill="#FFFFFF">REC</text>
  </g>
);
const Mira: React.FC<{ x: number; y: number; travada: number }> = ({ x, y, travada }) => {
  const r = 150 - 50 * travada;
  const cor = travada > 0.5 ? "#E0504D" : "#FFFFFF";
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle r={r} fill="none" stroke={cor} strokeWidth={6} />
      {[0, 90, 180, 270].map((a) => <line key={a} x1={0} y1={-r - 30} x2={0} y2={-r + 30} stroke={cor} strokeWidth={6} transform={`rotate(${a})`} />)}
    </g>
  );
};

// ------------------------------------------------------------------ 26. sobrou o último código; o único que o jogo inverteu; nível de procurado
const r1base = cartelaCodigo(CORTE(69), 70, 72, "CÓDIGO 3", "NÍVEL DE PROCURADO", () => <g transform="translate(-196 30)"><Estrelas n={5} r={46} /></g>);
const r1: PlanoV = {
  ...r1base,
  eventos: [...r1base.eventos, { f: T(71, fracDe(71, "inverteu")), tipo: "objeto", desc: "as setas se invertem" }],
  Sobre: ({ f }) => {
    const fI = T(71, fracDe(71, "inverteu"));
    const s = escalaPop(f, T(71), T(72));
    const gira = 180 * entre(f, fI, fI + 10);
    const Base = r1base.Sobre!;
    return (
      <>
        <Base f={f} />
        {s > 0 && <g transform={`translate(760 520) scale(${s}) rotate(${gira})`}>
          <path d="M -60 70 L -60 -70 M -100 -30 L -60 -70 L -20 -30" stroke="#F2D16B" strokeWidth={22} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M 60 -70 L 60 70 M 20 30 L 60 70 L 100 30" stroke="#FFFFFF" strokeWidth={22} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </g>}
      </>
    );
  },
};

// ------------------------------------------------------------------ 27. no jogo: estrelas no canto; entra no beco, o círculo pisca, some; a polícia esquece
const BecoJogo: React.FC = () => (
  <g>
    <rect x={0} y={0} width={1200} height={675} fill="#1E2440" />
    <path d="M 0 0 L 400 0 L 400 560 L 0 620 Z" fill="#6B3E35" stroke={L} strokeWidth={5} />
    <path d="M 1200 0 L 800 0 L 800 560 L 1200 620 Z" fill="#6B3E35" stroke={L} strokeWidth={5} />
    <rect x={0} y={560} width={1200} height={115} fill="#3A3F4F" />
    {Array.from({ length: 9 }, (_, r) => [0, 1].map((c) => <rect key={`${r}${c}`} x={20 + c * 180 + (r % 2) * 80} y={30 + r * 58} width={140} height={40} fill="none" stroke="#5A322B" strokeWidth={4} />))}
  </g>
);
const r2: PlanoV = {
  nome: "no jogo: as estrelas, o beco, o círculo", de: CORTE(72), ate: CORTE(75), enquadra: { x: 960, y: 560, zoom: 1.0 },
  eventos: [
    { f: CORTE(72), tipo: "corte", desc: "a tela do jogo: o beco" },
    { f: T(73, fracDe(73, "estrelas")), tipo: "objeto", desc: "as estrelas acendem" },
    { f: T(73, fracDe(73, "canto")), tipo: "objeto", desc: "o canto da tela marcado" },
    { f: T(74, fracDe(74, "entra")), tipo: "pose", desc: "o boneco entra no beco", verbo: "entrar" },
    { f: T(74, fracDe(74, "círculo piscar")), tipo: "objeto", desc: "o círculo do mapinha pisca", verbo: "esperar" },
    { f: T(74, fracDe(74, "some")), tipo: "objeto", desc: "as estrelas somem, o boneco some", verbo: "sumir" },
    { f: T(75, fracDe(75, "esquece")), tipo: "objeto", desc: "a viatura vai embora" },
  ],
  Cena: ({ f, cam }) => <CenaCam cenario={ESCURO} f={f} cam={cam} />,
  Sobre: ({ f }) => {
    const fE = T(73, fracDe(73, "estrelas")), fEn = T(74, fracDe(74, "entra")), fP = T(74, fracDe(74, "círculo piscar")), fS = T(74, fracDe(74, "some")), fQ = T(75, fracDe(75, "esquece"));
    const n = f < fS ? Math.min(3, Math.max(0, Math.floor((f - fE) / 4) + 1)) : 0;
    const circulo = f >= fP && f < fS ? (pisca(f, 10) ? 1 : 0) : 0;
    const x = 330 + 270 * entre(f, fEn, fEn + 16);
    const some = 1 - entre(f, fS, fS + 8);
    const viatura = f < fQ ? 1080 : 1080 + (f - fQ) * 40;
    const sirene = f < fQ + 6;
    return (
      <>
        <g transform="translate(960 500) scale(1.15)">
          <TelaJogo f={f} vida={1} estrelas={n} piscaEstrelas={f >= fP && f < fS} circulo={circulo} ceu="#1E2440">
            <BecoJogo />
            <Boneco x={x} y={600} f={f} s={0.45} opacidade={some} />
            {viatura < 1400 && <g transform={`translate(${viatura} 650) scale(0.42)`}>
              <Hatch cor="#F4F1EA" />
              <rect x={-60} y={-206} width={50} height={22} rx={6} fill={sirene && pisca(f, 8) ? "#E0504D" : "#6B2E2A"} stroke={L} strokeWidth={5} />
              <rect x={-10} y={-206} width={50} height={22} rx={6} fill={sirene && !pisca(f, 8) ? "#4F7BE0" : "#2A3A6B"} stroke={L} strokeWidth={5} />
            </g>}
          </TelaJogo>
        </g>
        {f >= T(73, fracDe(73, "canto")) && f < T(74) && <ellipse cx={1421} cy={227} rx={160} ry={46} fill="none" stroke="#F2D16B" strokeWidth={9} />}
        <TextoPop x={1300} y={420} f={f} de={fS} ate={T(75)} texto="SUMIU" tam={84} cor="#FFFFFF" rot={-4} />
        <TextoPop x={1200} y={420} f={f} de={fQ} ate={CORTE(75)} texto="ESQUECEU" tam={84} cor="#7FD18C" rot={3} />
      </>
    );
  },
};

// ------------------------------------------------------------------ 28. na vida real, ninguém esquece
const r3: PlanoV = {
  nome: "ninguém esquece", de: CORTE(75), ate: CORTE(76), enquadra: { x: 960, y: 560, zoom: 1.0 },
  eventos: [
    { f: CORTE(75), tipo: "corte", desc: "o cartaz de procurado" },
    { f: T(76, fracDe(76, "ninguém")), tipo: "objeto", desc: "NINGUÉM ESQUECE" },
  ],
  Cena: ({ f, cam }) => {
    const set = BEGE.set;
    const p: PersonProps = { ...props(TEO), ...idle(emPe(set, "chao", 1500))(f), expr: "triste" };
    p.lookAt = olhar(p, [700, 450]);
    return <CenaCam cenario={BEGE} f={f} cam={cam} noMeio={<Person {...p} semente={1} />} />;
  },
  Sobre: ({ f }) => {
    const s = escalaPop(f, CORTE(75) + 2, Infinity);
    return (
      <>
        {s > 0 && <g transform={`translate(700 500) rotate(-4) scale(${s})`}><Cartaz /></g>}
        <TextoPop x={1100} y={180} f={f} de={T(76, fracDe(76, "ninguém"))} texto="NINGUÉM ESQUECE" tam={80} cor="#C0504D" rot={-3} />
      </>
    );
  },
};

// ------------------------------------------------------------------ 29. no jogo, sumir de vista é sumir; fora dele, a procura não depende de alguém olhando
const r4: PlanoV = {
  nome: "sumir de vista; a procura sem olhar", de: CORTE(76), ate: CORTE(78), enquadra: { x: 960, y: 560, zoom: 1.0 },
  eventos: [
    { f: CORTE(76), tipo: "corte", desc: "o olho e o Téo" },
    { f: T(77, fracDe(77, "sumir de vista")), tipo: "objeto", desc: "o muro entra na frente" },
    { f: T(77, fracDe(77, "é sumir")), tipo: "objeto", desc: "NO JOGO: SUMIU ✓" },
    { f: T(78, fracDe(78, "procura")), tipo: "objeto", desc: "os sensores aparecem e acham o Téo" },
    { f: T(78, fracDe(78, "olhando")), tipo: "objeto", desc: "o olho fecha: X", verbo: "olhar" },
  ],
  Cena: ({ f, cam }) => {
    const set = ESCURO.set;
    const p: PersonProps = { ...props(TEO), ...idle(emPe(set, "chao", 1480))(f), expr: expressaoNoQuadro([[0, "olhar-lateral"], [T(77, fracDe(77, "é sumir")), "convencido"], [T(78, fracDe(78, "procura")), "chocado"]], f, 6) };
    p.lookAt = olhar(p, [500, 400]);
    const muro = entre(f, T(77, fracDe(77, "sumir de vista")), T(77, fracDe(77, "sumir de vista")) + 10);
    return (
      <CenaCam cenario={ESCURO} f={f} cam={cam}
        noMeio={<Person {...p} semente={1} />}
        naFrente={muro > 0 ? <g transform={`translate(0 ${(1 - muro) * 900})`}>
          <rect x={1020} y={420} width={200} height={560} fill="#6B3E35" stroke={L} strokeWidth={7} />
          {Array.from({ length: 10 }, (_, r) => <rect key={r} x={1030 + (r % 2) * 40} y={440 + r * 54} width={140} height={36} fill="none" stroke="#5A322B" strokeWidth={4} />)}
        </g> : undefined}
      />
    );
  },
  Sobre: ({ f }) => {
    const fP = T(78, fracDe(78, "procura")), fO = T(78, fracDe(78, "olhando"));
    const fecha = entre(f, fO, fO + 8);
    const sensores = [[1540, 200, "camera"], [1800, 560, "antena"], [1260, 220, "celular"]] as const;
    return (
      <>
        <g transform="translate(480 480)"><Olho px={30} fecha={fecha} /></g>
        {f >= T(77, fracDe(77, "sumir de vista")) && f < fP && <g transform="translate(480 300)"><Texto texto="?" tam={110} cor="#F2D16B" /></g>}
        {f >= fO && <g transform="translate(480 480)"><IconeX r={130} /></g>}
        <TextoPop x={480} y={760} f={f} de={T(77, fracDe(77, "é sumir"))} ate={fP} texto="NO JOGO: SUMIU" tam={60} cor="#7FD18C" rot={-3} />
        {sensores.map(([x, y, tipo], i) => {
          const s = escalaPop(f, fP + i * 5, Infinity);
          if (s <= 0) return null;
          return (
            <g key={tipo}>
              <line x1={x} y1={y} x2={1480} y2={600} stroke="#F2D16B" strokeWidth={6} strokeDasharray="18 14" strokeDashoffset={-f * 3} opacity={0.8} />
              <g transform={`translate(${x} ${y}) scale(${s})`}>
                {tipo === "camera" && <g transform="scale(0.8)"><CameraRua f={f} /></g>}
                {tipo === "antena" && <g transform="scale(0.55)"><Antena f={f} ondas /></g>}
                {tipo === "celular" && <IconeCelular s={0.45} />}
              </g>
            </g>
          );
        })}
      </>
    );
  },
};

// ------------------------------------------------------------------ 30. helicóptero com câmera térmica: não enxerga a roupa, enxerga o calor; beco escuro não esconde de quem lê temperatura
const r5: PlanoV = {
  nome: "a câmera térmica", de: CORTE(78), ate: CORTE(80), enquadra: { x: 960, y: 560, zoom: 1.0 },
  eventos: [
    { f: CORTE(78), tipo: "corte", desc: "o beco à noite; o helicóptero com o holofote" },
    { f: T(79, fracDe(79, "câmera térmica")), tipo: "objeto", desc: "a imagem vira térmica" },
    { f: T(79, fracDe(79, "roupa")), tipo: "objeto", desc: "ROUPA riscada" },
    { f: T(79, fracDe(79, "calor")), tipo: "objeto", desc: "CALOR; a mira trava" },
    { f: T(80), tipo: "objeto", desc: "volta o beco escuro" },
    { f: T(80, fracDe(80, "escuro")), tipo: "objeto", desc: "fica mais escuro" },
    { f: T(80, fracDe(80, "sensor")), tipo: "objeto", desc: "o sensor volta: a mancha quente" },
    { f: T(80, fracDe(80, "temperatura")), tipo: "objeto", desc: "36,5 °C" },
  ],
  Cena: ({ f, cam }) => {
    const set = BECO.set;
    const p: PersonProps = { ...props(TEO), ...idle(emPe(set, "chao", 860))(f), expr: "olhar-lateral" };
    p.lookAt = [-60, -300];
    const fT = T(79, fracDe(79, "câmera térmica")), fS = T(80, fracDe(80, "sensor"));
    const termica = (f >= fT && f < T(80)) || f >= fS;
    const escuro = f >= T(80, fracDe(80, "escuro")) && f < fS ? 0.55 : 0.25;
    const heliX = 1500 - 500 * entre(f, CORTE(78), CORTE(78) + 60);
    const facho = Math.sin(f / 14) * 18;
    const trava = f >= fS ? entre(f, fS, fS + 10) : entre(f, T(79, fracDe(79, "calor")), T(79, fracDe(79, "calor")) + 10);
    const rosto = rostoNoMundo(p);
    return (
      <CenaCam cenario={BECO} f={f} cam={cam}
        noMeio={<Person {...p} semente={1} />}
        naFrente={<>
          <FiltrosTermicos />
          {!termica && <rect x={-200} y={-200} width={2400} height={1600} fill="#05070F" opacity={escuro} />}
          {!termica && <g transform={`translate(${heliX} 170)`}><g transform={`rotate(${facho} 0 40)`}><path d="M -10 40 L -200 900 L 200 900 L 10 40 Z" fill="#F2D16B" opacity={0.2} /></g><Helicoptero f={f} /></g>}
          {termica && <>
            <rect x={-200} y={-200} width={2400} height={1600} fill="#141A3A" opacity={0.92} />
            <g transform={`translate(${heliX} 170)`} opacity={0.5}><Helicoptero f={f} /></g>
            <g filter="url(#termica-brilho)"><Person {...p} semente={1} /></g>
            <g filter="url(#termica-miolo)" opacity={0.9}><Person {...p} semente={1} /></g>
            <Mira x={rosto[0]} y={rosto[1] + 200} travada={trava} />
          </>}
        </>}
      />
    );
  },
  Sobre: ({ f }) => {
    const fT = T(79, fracDe(79, "câmera térmica")), fS = T(80, fracDe(80, "sensor"));
    const termica = (f >= fT && f < T(80)) || f >= fS;
    const fR = T(79, fracDe(79, "roupa"));
    return (
      <>
        {termica && <Visor f={f} rotulo="TÉRMICA" />}
        {termica && <g transform="translate(1780 540)">
          <defs><linearGradient id="escala-termica" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stopColor="#141A3A" /><stop offset="0.5" stopColor="#C0504D" /><stop offset="1" stopColor="#FFF1A8" /></linearGradient></defs>
          <rect x={-18} y={-220} width={36} height={440} rx={10} fill="url(#escala-termica)" stroke="#FFFFFF" strokeWidth={4} />
        </g>}
        {f >= fR && f < T(80) && <g transform="translate(1350 380)"><Texto texto="ROUPA" tam={60} cor="#FFFFFF" /><line x1={-120} y1={-10} x2={120} y2={-10} stroke="#E0504D" strokeWidth={12} strokeLinecap="round" /></g>}
        <TextoPop x={1350} y={520} f={f} de={T(79, fracDe(79, "calor"))} ate={T(80)} texto="CALOR" tam={84} cor="#F2A63E" rot={-3} />
        <TextoPop x={1350} y={420} f={f} de={T(80, fracDe(80, "temperatura"))} ate={CORTE(80)} texto="36,5 °C" tam={84} cor="#FFF1A8" rot={-3} />
      </>
    );
  },
};

// ------------------------------------------------------------------ 31. o celular informa a antena mais próxima o tempo todo
const r6: PlanoV = {
  nome: "o celular e a antena", de: CORTE(80), ate: CORTE(81), enquadra: { x: 960, y: 560, zoom: 1.0 },
  eventos: [
    { f: CORTE(80), tipo: "corte", desc: "o celular" },
    { f: T(81, fracDe(81, "antena")), tipo: "objeto", desc: "a antena; os sinais vão e voltam" },
    { f: T(81, fracDe(81, "tempo todo")), tipo: "objeto", desc: "relógio: o tempo todo" },
  ],
  Cena: ({ f, cam }) => <CenaCam cenario={ESCURO} f={f} cam={cam} />,
  Sobre: ({ f }) => {
    const fA = T(81, fracDe(81, "antena"));
    const sA = escalaPop(f, fA, Infinity);
    const sR = escalaPop(f, T(81, fracDe(81, "tempo todo")), Infinity);
    return (
      <>
        <g transform="translate(520 560) rotate(-6)"><IconeCelular s={1.4}>
          <rect x={20} y={30} width={120} height={20} rx={8} fill="#5AA5B8" />
          {[0, 1, 2, 3].map((i) => <rect key={i} x={24 + i * 30} y={230 - i * 30} width={20} height={30 + i * 30} rx={4} fill={i < 3 ? "#4FAE63" : "#B9BEC6"} />)}
        </IconeCelular></g>
        {sA > 0 && <g transform={`translate(1420 540) scale(${1.4 * sA})`}><Antena f={f} ondas /></g>}
        {f >= fA && [0, 1, 2].map((i) => {
          const k = ((f - fA + i * 9) % 27) / 27;
          return <circle key={i} cx={640 + (1380 - 640) * k} cy={400 - Math.sin(Math.PI * k) * 120} r={16} fill="#F2D16B" stroke={L} strokeWidth={4} />;
        })}
        {sR > 0 && <g transform={`translate(960 860) scale(${1.1 * sR})`}><IconeRelogio giro={(f - T(81, fracDe(81, "tempo todo"))) * 30} /></g>}
      </>
    );
  },
};

// ------------------------------------------------------------------ 32. seu carro tem placa
const r7: PlanoV = {
  nome: "a placa", de: CORTE(81), ate: CORTE(82), enquadra: { x: 960, y: 560, zoom: 1.0 },
  eventos: [
    { f: CORTE(81), tipo: "corte", desc: "o carro" },
    { f: T(82, fracDe(82, "placa")), tipo: "objeto", desc: "a placa em close; o flash do radar" },
  ],
  Cena: ({ f, cam }) => <CenaCam cenario={BEGE} f={f} cam={cam} />,
  Sobre: ({ f }) => {
    const fP = T(82, fracDe(82, "placa"));
    const sP = escalaPop(f, fP, Infinity);
    return (
      <>
        <g transform={`translate(${760 + 60 * (1 - entre(f, CORTE(81), CORTE(81) + 10))} 820) scale(1.6)`}><Hatch cor="#2F6E9E" /></g>
        <g transform="translate(1560 300)"><CameraRua f={f} /></g>
        {f >= fP && f < fP + 8 && <rect x={0} y={0} width={1920} height={1080} fill="#FFFFFF" opacity={1 - (f - fP) / 8} />}
        {sP > 0 && <g transform={`translate(960 330) scale(${1.3 * sP})`}><Placa /></g>}
      </>
    );
  },
};

// ------------------------------------------------------------------ 33. no jogo as estrelas descem sozinhas; fora dele, só sobem
const r8: PlanoV = {
  nome: "descem sozinhas; só sobem", de: CORTE(82), ate: CORTE(84), enquadra: { x: 960, y: 560, zoom: 1.0 },
  eventos: [
    { f: CORTE(82), tipo: "corte", desc: "as duas fileiras de estrelas" },
    { f: T(83, fracDe(83, "mais importante")), tipo: "objeto", desc: "A DIFERENÇA" },
    { f: T(83, fracDe(83, "descem")), tipo: "objeto", desc: "no jogo: as estrelas apagam uma a uma", verbo: "descer" },
    { f: T(84), tipo: "objeto", desc: "na vida real: a fileira" },
    { f: T(84, fracDe(84, "sobem")), tipo: "objeto", desc: "as estrelas acendem e transbordam", verbo: "subir" },
  ],
  Cena: ({ f, cam }) => <CenaCam cenario={ESCURO} f={f} cam={cam} />,
  Sobre: ({ f }) => {
    const fD = T(83, fracDe(83, "descem")), fS = T(84, fracDe(84, "sobem"));
    const nJogo = f < fD ? 5 : Math.max(0, 5 - Math.floor((f - fD) / 5));
    const nAntes = 1 + Math.floor(Math.max(0, f - T(84)) / 12);
    const nReal = f < fS ? nAntes : Math.min(16, 1 + Math.floor((fS - T(84)) / 12) + Math.floor((f - fS) / 2));
    const s2 = escalaPop(f, T(84), Infinity);
    return (
      <>
        <TextoPop x={960} y={150} f={f} de={T(83, fracDe(83, "mais importante"))} texto="A DIFERENÇA" tam={70} cor="#FFFFFF" rot={-2} />
        <Texto texto="NO JOGO" tam={52} x={960} y={330} cor="#9ED8F5" />
        <g transform="translate(776 420)"><Estrelas n={nJogo} r={40} /></g>
        {s2 > 0 && <g transform={`translate(960 690) scale(${s2}) translate(-960 -690)`}>
          <Texto texto="NA VIDA REAL" tam={52} x={960} y={640} cor="#E0826E" />
          <g transform="translate(776 730)"><Estrelas n={nReal} total={Math.max(5, nReal)} r={40} /></g>
        </g>}
      </>
    );
  },
};

// ------------------------------------------------------------------ 34. Téo entra no beco e espera o círculo piscar; o círculo não pisca
const r9: PlanoV = {
  nome: "o círculo não pisca", de: CORTE(84), ate: CORTE(86), enquadra: { x: 960, y: 580, zoom: 1.0 },
  eventos: [
    { f: CORTE(84), tipo: "corte", desc: "o beco de verdade" },
    { f: T(85, fracDe(85, "entra")), tipo: "pose", desc: "Téo entra no beco", verbo: "entrar" },
    { f: T(85, fracDe(85, "espera")), tipo: "pose", desc: "Téo olha o mapinha e espera", verbo: "esperar" },
    { f: T(86, fracDe(86, "não pisca")), tipo: "objeto", desc: "o círculo fica aceso; luzes de sirene" },
  ],
  Cena: ({ f, cam }) => {
    const set = BECO.set;
    const anda = walk({ ...emPe(set, "chao", 380), xa: 380, xb: 860, f0: T(85, fracDe(85, "entra")), passo: 150, quadros: 8 });
    const p: PersonProps = { ...props(TEO), ...anda(f), expr: f >= T(86, fracDe(86, "não pisca")) ? "triste" : f >= T(85, fracDe(85, "espera")) ? "olhar-lateral" : "sigma" };
    p.lookAt = f >= T(85, fracDe(85, "espera")) ? olhar(p, [200, 150]) : olhar(p, [1200, 600]);
    const sirene = f >= T(86, fracDe(86, "não pisca"));
    return (
      <CenaCam cenario={BECO} f={f} cam={cam}
        noMeio={<Person {...p} semente={1} />}
        naFrente={<>
          <rect x={-200} y={-200} width={2400} height={1600} fill="#05070F" opacity={0.25} />
          {sirene && <rect x={-200} y={-200} width={2400} height={1600} fill={pisca(f, 12) ? "#E0504D" : "#4F7BE0"} opacity={0.16} />}
        </>}
      />
    );
  },
  Sobre: ({ f }) => {
    const fW = T(85, fracDe(85, "espera"));
    return (
      <>
        <g transform="translate(200 200)">
          <circle r={130} fill="#7FA87A" stroke={L} strokeWidth={7} opacity={0.95} />
          <path d="M -130 14 L 130 -8 M -30 -130 L -8 130" stroke="#E9E4DA" strokeWidth={18} />
          <polygon points="0,-18 13,16 0,8 -13,16" fill="#FFFFFF" stroke={L} strokeWidth={4} />
          {f >= fW && <circle r={86} fill="#5AA5B8" opacity={0.4} stroke="#2F6E9E" strokeWidth={5} />}
        </g>
        <g transform="translate(1440 120)"><Estrelas n={3} r={30} /></g>
        <TextoPop x={560} y={200} f={f} de={T(86, fracDe(86, "não pisca"))} texto="NÃO PISCA" tam={70} cor="#E0826E" rot={-3} />
      </>
    );
  },
};

// ------------------------------------------------------------------ 35. ele entende o que os três códigos tinham em comum
const r10: PlanoV = {
  nome: "os três códigos", de: CORTE(86), ate: CORTE(87), enquadra: { x: 960, y: 560, zoom: 1.0 },
  eventos: [
    { f: CORTE(86), tipo: "corte", desc: "Téo pensando" },
    { f: T(87, fracDe(87, "entende")), tipo: "expressao", desc: "Téo entende: lâmpada" },
    { f: T(87, fracDe(87, "três códigos")), tipo: "objeto", desc: "carro, escudo, estrelas" },
    { f: T(87, fracDe(87, "em comum")), tipo: "objeto", desc: "a chave que liga os três" },
  ],
  Cena: ({ f, cam }) => {
    const set = ESCURO.set;
    const fE = T(87, fracDe(87, "entende"));
    const p: PersonProps = { ...props(TEO), ...idle(emPe(set, "chao", 1640))(f), expr: f >= fE ? "chocado" : "olhar-lateral" };
    p.lookAt = olhar(p, f >= fE ? [760, 480] : [1640, 200]);
    const s = escalaPop(f, fE, Infinity);
    const [rx, ry] = rostoNoMundo(p);
    return (
      <CenaCam cenario={ESCURO} f={f} cam={cam}
        noMeio={<>
          <Person {...p} semente={1} />
          {s > 0 && <g transform={`translate(${rx} ${ry - 190}) scale(${s})`}>
            <path d="M -34 30 Q -60 -10 -40 -40 Q 0 -80 40 -40 Q 60 -10 34 30 Z" fill="#F2D16B" stroke={L} strokeWidth={6} strokeLinejoin="round" />
            <rect x={-24} y={30} width={48} height={26} rx={6} fill="#B9BEC6" stroke={L} strokeWidth={5} />
            {[-60, 0, 60].map((a) => <line key={a} x1={0} y1={-70} x2={0} y2={-92} stroke="#F2D16B" strokeWidth={7} strokeLinecap="round" transform={`rotate(${a} 0 -10)`} />)}
          </g>}
        </>}
      />
    );
  },
  Sobre: ({ f }) => {
    const f3 = T(87, fracDe(87, "três códigos")), fC = T(87, fracDe(87, "em comum"));
    const icones: [number, React.ReactNode][] = [[340, <g transform="translate(0 70) scale(0.55)"><Hatch /></g>], [760, <g transform="scale(1.1)"><Escudo /></g>], [1180, <g transform="translate(-95 0)"><Estrelas n={3} total={3} r={36} /></g>]];
    return (
      <>
        {icones.map(([x, ic], i) => {
          const s = escalaPop(f, f3 + i * 5, Infinity);
          return s > 0 ? <g key={i} transform={`translate(${x} 480) scale(${s})`}><circle cx={7} cy={8} r={150} fill="#1A1F29" /><circle r={150} fill="#F4F1EA" stroke={L} strokeWidth={7} />{ic}<Texto texto={`${i + 1}`} tam={56} y={-170} /></g> : null;
        })}
        {f >= fC && <path d={`M 340 680 Q 340 780 580 780 L 940 780 Q 1180 780 1180 680 M 760 680 L 760 780`} fill="none" stroke="#F2D16B" strokeWidth={12} strokeLinecap="round" pathLength={1} strokeDasharray={`${entre(f, fC, fC + 14)} 1`} />}
        <TextoPop x={760} y={880} f={f} de={fC + 6} texto="EM COMUM?" tam={70} cor="#F2D16B" rot={-2} />
      </>
    );
  },
};

// ------------------------------------------------------------------ 36. no jogo o código desliga uma regra; na vida real, nenhuma regra desliga
const r11: PlanoV = {
  nome: "o interruptor da regra", de: CORTE(87), ate: CORTE(89), enquadra: { x: 960, y: 560, zoom: 1.0 },
  eventos: [
    { f: CORTE(87), tipo: "corte", desc: "o interruptor do jogo" },
    { f: T(88, fracDe(88, "desliga")), tipo: "objeto", desc: "a regra desliga", verbo: "desligar" },
    { f: T(89), tipo: "objeto", desc: "o interruptor da vida real" },
    { f: T(89, fracDe(89, "desliga")), tipo: "objeto", desc: "tenta desligar: não desliga" },
  ],
  Cena: ({ f, cam }) => <CenaCam cenario={ESCURO} f={f} cam={cam} />,
  Sobre: ({ f }) => {
    const fJ = T(88, fracDe(88, "desliga")), fR = T(89, fracDe(89, "desliga"));
    const s2 = escalaPop(f, T(89), Infinity);
    const treme = f >= fR && f < fR + 14 ? Math.sin(f * 2.4) * 8 : 0;
    return (
      <>
        <Texto texto="NO JOGO" tam={52} x={600} y={250} cor="#9ED8F5" />
        <g transform="translate(600 560) scale(1.4)"><Interruptor ligado={f < fJ} rotulo="REGRA" /></g>
        {f >= fJ && <TextoPop x={600} y={880} f={f} de={fJ} texto="DESLIGADA" tam={50} cor="#E0826E" rot={-3} />}
        {s2 > 0 && <g transform={`translate(1320 0) scale(${s2})`} style={{ transformOrigin: "0px 560px" }}>
          <Texto texto="NA VIDA REAL" tam={52} x={0} y={250} cor="#E0826E" />
          <g transform={`translate(${treme} 560) scale(1.4)`}><Interruptor ligado rotulo="REGRA" /></g>
          {f >= fR && <TextoPop x={0} y={880} f={f} de={fR + 6} texto="NÃO DESLIGA" tam={50} cor="#7FD18C" rot={3} />}
        </g>}
      </>
    );
  },
};

// ------------------------------------------------------------------ 37. as regras só param de se aplicar a você, e continuam valendo para tudo em volta
const EM_VOLTA: [string, number, number][] = [["ENERGIA", 420, 260], ["CALOR", 1500, 260], ["INÉRCIA", 420, 760], ["SENSORES", 1500, 760]];
const r12: PlanoV = {
  nome: "valendo para tudo em volta", de: CORTE(89), ate: CORTE(90), enquadra: { x: 960, y: 560, zoom: 1.0 },
  eventos: [
    { f: CORTE(89), tipo: "corte", desc: "Téo no meio" },
    { f: T(90, fracDe(90, "param")), tipo: "objeto", desc: "a bolha em volta do Téo", verbo: "parar" },
    { f: T(90, fracDe(90, "continuam valendo")), tipo: "objeto", desc: "as regras em volta" },
    { f: T(90, fracDe(90, "tudo em volta")), tipo: "objeto", desc: "as setas para fora" },
  ],
  Cena: ({ f, cam }) => {
    const set = BEGE.set;
    const p: PersonProps = { ...props(TEO), ...idle(emPe(set, "chao", 960))(f), expr: "triste" };
    p.lookAt = olhar(p, [1500, 400]);
    const b = entre(f, T(90, fracDe(90, "param")), T(90, fracDe(90, "param")) + 10);
    return (
      <CenaCam cenario={BEGE} f={f} cam={cam}
        noMeio={<>
          {b > 0 && <ellipse cx={960} cy={700} rx={210 * b} ry={330 * b} fill="#9ED8F5" opacity={0.35} stroke="#5AA5B8" strokeWidth={7} />}
          <Person {...p} semente={1} />
        </>}
      />
    );
  },
  Sobre: ({ f }) => {
    const fV = T(90, fracDe(90, "continuam valendo")), fT = T(90, fracDe(90, "tudo em volta"));
    return (
      <>
        {EM_VOLTA.map(([rot, x, y], i) => {
          const s = escalaPop(f, fV + i * 4, Infinity);
          return s > 0 ? <g key={rot}>
            {f >= fT && <line x1={960 + (x < 960 ? -230 : 230)} y1={y < 500 ? 520 : 760} x2={x + (x < 960 ? 170 : -170)} y2={y} stroke="#C0504D" strokeWidth={9} strokeLinecap="round" strokeDasharray="20 14" strokeDashoffset={-f * 3} />}
            <g transform={`translate(${x} ${y}) scale(${s})`}><rect x={-170 + 6} y={-50 + 7} width={340} height={100} rx={16} fill="#D6D2CA" /><rect x={-170} y={-50} width={340} height={100} rx={16} fill="#FFFFFF" stroke={L} strokeWidth={6} /><Texto texto={`${rot} ✓`} tam={44} y={16} cor={L} contorno={0} /></g>
          </g> : null;
        })}
      </>
    );
  },
};

// ------------------------------------------------------------------ 38. recapitulação: o carro e a energia; o corpo e o sangue; o rosto e o sensor
const Quadro: React.FC<{ x: number; s: number; titulo: string; children: React.ReactNode }> = ({ x, s, titulo, children }) => (s > 0 ? (
  <g transform={`translate(${x} 520) scale(${s})`}>
    <rect x={-270 + 8} y={-330 + 9} width={540} height={660} rx={24} fill="#1A1F29" />
    <rect x={-270} y={-330} width={540} height={660} rx={24} fill="#F4F1EA" stroke={L} strokeWidth={7} />
    {children}
    <Texto texto={titulo} tam={44} y={290} cor={L} contorno={0} />
  </g>
) : null);
const r13: PlanoV = {
  nome: "os três, de novo", de: CORTE(90), ate: CORTE(93), enquadra: { x: 960, y: 560, zoom: 1.0 },
  eventos: [
    { f: CORTE(90), tipo: "corte", desc: "quadro 1: o carro" },
    { f: T(91, fracDe(91, "energia saiu")), tipo: "objeto", desc: "a energia sai do globo", verbo: "sair" },
    { f: T(92), tipo: "objeto", desc: "quadro 2: o corpo" },
    { f: T(92, fracDe(92, "sangue")), tipo: "objeto", desc: "o sangue segue (inércia)" },
    { f: T(93), tipo: "objeto", desc: "quadro 3: o rosto" },
    { f: T(93, fracDe(93, "sumiu")), tipo: "objeto", desc: "o rosto some do beco", verbo: "sumir" },
    { f: T(93, fracDe(93, "sensor")), tipo: "objeto", desc: "a mancha quente no sensor" },
  ],
  Cena: ({ f, cam }) => <CenaCam cenario={ESCURO} f={f} cam={cam} />,
  Sobre: ({ f }) => {
    const fE = T(91, fracDe(91, "energia saiu")), fSg = T(92, fracDe(92, "sangue")), fSu = T(93, fracDe(93, "sumiu")), fSe = T(93, fracDe(93, "sensor"));
    const raio = entre(f, fE, fE + 14);
    return (
      <>
        <Quadro x={360} s={escalaPop(f, CORTE(90) + 2, Infinity)} titulo="ENERGIA">
          <g transform="translate(0 -110) scale(0.8)"><Hatch /></g>
          <g transform="translate(0 130)" opacity={1 - 0.5 * raio}><IconeGlobo giro={f} /></g>
          {f >= fE && <g transform={`translate(${60 + 140 * raio} ${80 - 160 * raio})`} opacity={1 - raio * 0.6}><path d="M -14 -50 L 26 -50 L 6 -8 L 30 -8 L -20 60 L -4 6 L -28 6 Z" fill="#F2D16B" stroke={L} strokeWidth={5} strokeLinejoin="round" /></g>}
        </Quadro>
        <Quadro x={960} s={escalaPop(f, T(92), Infinity)} titulo="INÉRCIA">
          <g transform="translate(-150 -200) scale(0.5)"><Escudo /></g>
          <g transform="translate(40 -20) scale(0.62)"><Inercia k={lim((f - fSg + 12) / 40)} /></g>
        </Quadro>
        <Quadro x={1560} s={escalaPop(f, T(93), Infinity)} titulo="SENSOR">
          <rect x={-220} y={-280} width={440} height={500} rx={12} fill="#141A3A" />
          {f < fSu + 8 && <g opacity={1 - entre(f, fSu, fSu + 8)} transform="translate(0 -40)"><circle r={60} fill="#FFFFFF" stroke={L} strokeWidth={6} /><circle cx={-20} cy={-6} r={7} fill={L} /><circle cx={20} cy={-6} r={7} fill={L} /></g>}
          {f >= fSe && <g transform="translate(0 30)" opacity={entre(f, fSe, fSe + 8)}><SilhuetaQuente s={0.85} /><Mira x={0} y={-90} travada={1} /></g>}
        </Quadro>
      </>
    );
  },
};

// ------------------------------------------------------------------ 39. código nenhum te tira do universo
const ESPACO = liso("#0E1330");
const r14: PlanoV = {
  nome: "o universo", de: CORTE(93), ate: CORTE(94), enquadra: { x: 960, y: 560, zoom: 1.0 }, pushIn: -0.1,
  eventos: [
    { f: CORTE(93), tipo: "corte", desc: "a galáxia" },
    { f: T(94, fracDe(94, "universo")), tipo: "objeto", desc: "VOCÊ ESTÁ AQUI" },
  ],
  Cena: ({ f, cam }) => (
    <CenaCam cenario={ESPACO} f={f} cam={cam}
      noMeio={<>
        {Array.from({ length: 70 }, (_, i) => <circle key={i} cx={(i * 397) % 1920} cy={(i * 263) % 1080} r={1.5 + (i % 3)} fill="#FFFFFF" opacity={0.4 + 0.4 * Math.sin(f / 10 + i)} />)}
        <g transform="translate(960 540)"><Galaxia f={f} /></g>
      </>}
    />
  ),
  Sobre: ({ f }) => {
    const fU = T(94, fracDe(94, "universo"));
    const s = escalaPop(f, fU, Infinity);
    return s > 0 ? (
      <g>
        <circle cx={1130} cy={620} r={10} fill="#F2D16B" stroke={L} strokeWidth={3} />
        <g transform={`translate(1130 620) scale(${s})`}>
          <path d="M 30 30 L 150 150" stroke="#F2D16B" strokeWidth={10} strokeLinecap="round" />
          <path d="M 30 30 L 80 36 M 30 30 L 36 80" stroke="#F2D16B" strokeWidth={10} strokeLinecap="round" />
          <Texto texto="VOCÊ ESTÁ AQUI" tam={52} x={190} y={210} cor="#FFFFFF" />
        </g>
      </g>
    ) : null;
  },
};

// ------------------------------------------------------------------ 40. ele só te dá uma exceção, e cobra a conta de quem está do lado
const VIZINHO_E = figurante(31);
const VIZINHO_D = figurante(58);
const r15: PlanoV = {
  nome: "a exceção e a conta", de: CORTE(94), ate: CORTE(95), enquadra: { x: 960, y: 580, zoom: 1.0 },
  eventos: [
    { f: CORTE(94), tipo: "corte", desc: "Téo entre os vizinhos" },
    { f: T(95, fracDe(95, "exceção")), tipo: "objeto", desc: "o bilhete da exceção", verbo: "dar" },
    { f: T(95, fracDe(95, "cobra a conta")), tipo: "objeto", desc: "a conta voa para o vizinho", verbo: "cobrar" },
    { f: T(95, fracDe(95, "do lado")), tipo: "expressao", desc: "os vizinhos levam susto" },
  ],
  Cena: ({ f, cam }) => {
    const set = BEGE.set;
    const fC = T(95, fracDe(95, "cobra a conta"));
    const pT: PersonProps = { ...props(TEO), ...idle(emPe(set, "chao", 960))(f), expr: f >= fC ? "olhar-lateral" : f >= T(95, fracDe(95, "exceção")) ? "rindo" : "neutro" };
    pT.lookAt = olhar(pT, f >= fC ? [400, 500] : [960, 200]);
    const viz = (a: typeof VIZINHO_E, x: number, de: number): PersonProps => {
      const p: PersonProps = { ...props(a), ...idle(emPe(set, "chao", x))(f + x), expr: f >= de + 6 ? "chocado" : "neutro" };
      p.lookAt = olhar(p, [960, 500]);
      return p;
    };
    return (
      <CenaCam cenario={BEGE} f={f} cam={cam}
        noMeio={<>
          <Person {...viz(VIZINHO_E, 420, fC)} semente={31} />
          <Person {...viz(VIZINHO_D, 1500, fC + 8)} semente={58} />
          <Person {...pT} semente={1} />
        </>}
      />
    );
  },
  Sobre: ({ f }) => {
    const fX = T(95, fracDe(95, "exceção")), fC = T(95, fracDe(95, "cobra a conta"));
    const sB = escalaPop(f, fX, Infinity);
    const voo = (de: number, xa: number) => {
      const k = entre(f, de, de + 12);
      return f >= de ? <g transform={`translate(${960 + (xa - 960) * k} ${360 - Math.sin(Math.PI * k) * 160 + 230 * k}) rotate(${(1 - k) * 200 * Math.sign(xa - 960)}) scale(0.8)`}><Conta /></g> : null;
    };
    return (
      <>
        {sB > 0 && <g transform={`translate(960 200) rotate(-4) scale(${sB})`}><Bilhete texto="EXCEÇÃO" /></g>}
        {voo(fC, 420)}
        {voo(fC + 8, 1500)}
      </>
    );
  },
};

// ------------------------------------------------------------------ 41. Téo fecha o teclado
const r16: PlanoV = {
  nome: "Téo fecha o teclado", de: CORTE(95), ate: CORTE(96), enquadra: { x: 960, y: 560, zoom: 1.25 },
  eventos: [
    { f: CORTE(95), tipo: "corte", desc: "o teclado das quatro letras" },
    { f: T(96, fracDe(96, "fecha")), tipo: "objeto", desc: "a tampa fecha sobre as teclas", verbo: "fechar" },
  ],
  Cena: ({ f, cam }) => {
    const set = MESA_TEO.set;
    const p: PersonProps = { ...props(TEO), ...idle(emPe(set, "chao", 960))(f), expr: "neutro", handL: [-60, -150], handR: [60, -150], gripL: "open", gripR: "open" };
    p.lookAt = olhar(p, [960, 760]);
    return <CenaCam cenario={MESA_TEO} f={f} cam={cam} noMeio={<Person {...p} semente={1} />} />;
  },
  Sobre: ({ f }) => {
    const fF = T(96, fracDe(96, "fecha"));
    const tampa = entre(f, fF, fF + 10);
    return (
      <g transform="translate(960 840)">
        <rect x={-430} y={-110} width={860} height={220} rx={30} fill="#1A1F29" opacity={0.85} />
        {LETRAS.map((l, i) => <g key={l} transform={`translate(${-300 + i * 200} 6)`}><Tecla letra={l} aperta={0} /></g>)}
        {tampa > 0 && <g>
          <rect x={-430} y={-110} width={860} height={220 * tampa} rx={30} fill="#3A3F4B" stroke={L} strokeWidth={7} />
          <line x1={-400} y1={-92} x2={400} y2={-92} stroke="#5A6070" strokeWidth={6} strokeLinecap="round" />
          {tampa > 0.8 && <rect x={-60} y={-110 + 220 * tampa - 34} width={120} height={16} rx={8} fill="#B9BEC6" stroke={L} strokeWidth={4} />}
        </g>}
      </g>
    );
  },
};

// ------------------------------------------------------------------ 42. na tela, o cursor ainda pisca esperando as próximas quatro letras
const Entrada: React.FC<{ f: number; destaque?: number }> = ({ f, destaque = -1 }) => (
  <g>
    {[0, 1, 2, 3].map((i) => <rect key={i} x={-330 + i * 170} y={50 - (i === destaque ? 14 : 0)} width={130} height={16} rx={8} fill={i === destaque ? "#F2D16B" : "#FFFFFF"} />)}
    {pisca(f, 30) && <rect x={-330} y={-80} width={14} height={110} fill="#7FD18C" />}
  </g>
);
const r17: PlanoV = {
  nome: "o cursor pisca", de: CORTE(96), ate: CORTE(97), enquadra: { x: 960, y: 560, zoom: 1.0 },
  eventos: [
    { f: CORTE(96), tipo: "corte", desc: "a tela" },
    { f: T(97, fracDe(97, "cursor")), tipo: "objeto", desc: "o cursor pisca" },
    { f: T(97, fracDe(97, "quatro letras")), tipo: "objeto", desc: "os quatro espaços acendem um a um" },
  ],
  Cena: ({ f, cam }) => <CenaCam cenario={ESCURO} f={f} cam={cam} />,
  Sobre: ({ f }) => {
    const fQ = T(97, fracDe(97, "quatro letras"));
    const d = f >= fQ ? Math.floor((f - fQ) / 5) : -1;
    return (
      <>
        <rect x={260 + 10} y={180 + 12} width={1400} height={700} rx={30} fill="#1A1F29" />
        <rect x={260} y={180} width={1400} height={700} rx={30} fill="#0F1420" stroke={L} strokeWidth={9} />
        <text x={360} y={330} fontFamily={FONTE} fontWeight={900} fontSize={54} fill="#7FD18C">CÓDIGO:</text>
        <g transform="translate(960 560)"><Entrada f={f} destaque={d < 4 ? d : -1} /></g>
      </>
    );
  },
};

// ------------------------------------------------------------------ 43. se funcionasse de verdade, qual código você digitaria?
const r18: PlanoV = {
  nome: "a pergunta final", de: CORTE(97), ate: DURACAO, enquadra: { x: 960, y: 560, zoom: 1.0 }, semLegenda: [98], semRespiro: true,
  eventos: [
    { f: CORTE(97), tipo: "corte", desc: "cartela final" },
    { f: T(98, fracDe(98, "se funcionasse")), tipo: "objeto", desc: "SE FUNCIONASSE DE VERDADE," },
    { f: T(98, fracDe(98, "qual código")), tipo: "objeto", desc: "QUAL CÓDIGO VOCÊ DIGITARIA?" },
    { f: FALAS[98].fim + 4, tipo: "objeto", desc: "os quatro espaços acendem um a um" },
    { f: FALAS[98].fim + 44, tipo: "objeto", desc: "o cursor pisca, esperando" },
  ],
  Cena: ({ f, cam }) => <CenaCam cenario={ESCURO} f={f} cam={cam} />,
  Sobre: ({ f }) => (
    <>
      <TextoPop x={960} y={260} f={f} de={T(98, fracDe(98, "se funcionasse"))} texto="SE FUNCIONASSE DE VERDADE," tam={58} cor="#FFFFFF" rot={-2} />
      <TextoPop x={960} y={430} f={f} de={T(98, fracDe(98, "qual código"))} texto="QUAL CÓDIGO" tam={120} cor="#F2D16B" rot={-3} />
      <TextoPop x={960} y={570} f={f} de={T(98, fracDe(98, "qual código")) + 4} texto="VOCÊ DIGITARIA?" tam={96} cor="#F2D16B" rot={-3} />
      <g transform="translate(960 780)"><Entrada f={f} destaque={f >= FALAS[98].fim + 4 && f < FALAS[98].fim + 24 ? Math.floor((f - FALAS[98].fim - 4) / 5) : -1} /></g>
      {f >= FALAS[98].fim + 44 && <g transform="translate(960 780)"><rect x={-350} y={-100} width={700} height={170} rx={20} fill="none" stroke="#7FD18C" strokeWidth={6} opacity={pisca(f, 30) ? 0.8 : 0.3} /></g>}
    </>
  ),
};

export const PARTE3: PlanoV[] = [r1, r2, r3, r4, r5, r6, r7, r8, r9, r10, r11, r12, r13, r14, r15, r16, r17, r18];
export const FIGURADOS_P3: Record<number, string[]> = {};
