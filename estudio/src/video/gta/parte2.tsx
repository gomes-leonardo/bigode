// Parte 2 (falas 34 a 69): código 2, invencibilidade. No jogo a barra de vida não desce; na vida real invulnerável não
// é imortal: o corpo ainda precisa de oxigênio (o mar), ainda é 60% água (o fogo) e o sangue ainda obedece à inércia
// (a queda). O código cumpriu o que prometeu: só prometeu menos do que você entendeu.
import React from "react";
import { Person, type PersonProps } from "../../components/Person";
import { expressaoNoQuadro } from "../../components/Face";
import { fall, idle, point, walk } from "../../rig/actions";
import { emPe } from "../../cenarios/ancoras";
import { liso } from "../../cenarios/liso/Liso";
import { PROTAGONISTA } from "../../elenco/elenco";
import { olhar, props } from "../../fase4/Cenarios";
import { Estrela, IconeRelogio, Texto, TextoPop, escalaPop } from "../graficos";
import { CenaCam, entre, rostoNoMundo, type PlanoV } from "../cartao/comum";
import { CORTE, T, fracDe } from "./tempo";
import { cartelaCodigo } from "./parte1";
import { BarraVida, Cerebro, Chama, Contrato, CorpoAgua, Escudo, Hatch, INCENDIO, Inercia, Jato, MAR, Moleculas, Osso, Pulmao, Termometro, TelaJogo, Velocimetro, predioQueda } from "./pecas";

const L = "#141414";
const TEO = PROTAGONISTA;
const ESCURO = liso("#26313F");
const BEGE = liso("#EADFCB");
const VERMELHO = liso("#5A2E2A");
const CINZA = liso("#C9D3E0");
const lim = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));

/** bonequinho do jogo (dentro da tela): pequeno, no traço do estúdio */
const Boneco: React.FC<{ x: number; y: number; f: number; s?: number; deitado?: number }> = ({ x, y, f, s = 0.55, deitado = 0 }) => {
  const p: PersonProps = { ...props(TEO), ...idle({ x, y, scale: s })(f), giro: 84 * deitado, expr: deitado > 0.5 ? "chocado" : "convencido", semente: 1 };
  return <Person {...p} />;
};
/** vapor subindo de um ponto */
const Vapor: React.FC<{ x: number; y: number; f: number; n?: number }> = ({ x, y, f, n = 3 }) => (
  <>
    {Array.from({ length: n }, (_, i) => {
      const k = ((f + i * 9) % 27) / 27;
      return <path key={i} d={`M ${x - 40 + i * 40} ${y - k * 70} q 12 -16 0 -32 q -12 -16 0 -32`} stroke="#FFFFFF" strokeWidth={7} fill="none" strokeLinecap="round" opacity={Math.sin(Math.PI * k)} />;
    })}
  </>
);

// ------------------------------------------------------------------ 13. cartela: o código mais seguro da lista. Invencibilidade.
const q1 = cartelaCodigo(CORTE(33), 34, 35, "CÓDIGO 2", "INVENCIBILIDADE", () => <g transform="translate(0 20) scale(1.1)"><Escudo /></g>);

// ------------------------------------------------------------------ 14. no jogo a barra de vida não desce: tiro, queda, explosão, atropelamento; nada tira um ponto
const GOLPES: [string, string, string][] = [["Tiro", "BANG!", "#F2D16B"], ["queda", "PLOFT!", "#9ED8F5"], ["explosão", "BUM!", "#E0826E"], ["atropelamento", "VRUM!", "#7FD18C"]];
const q2: PlanoV = {
  nome: "no jogo a vida não desce", de: CORTE(35), ate: CORTE(38), enquadra: { x: 960, y: 560, zoom: 1.0 },
  eventos: [
    { f: CORTE(35), tipo: "corte", desc: "a tela do jogo" },
    { f: T(36, fracDe(36, "barra de vida")), tipo: "objeto", desc: "a barra de vida cheia não desce", verbo: "descer" },
    ...GOLPES.map(([w, rot]) => ({ f: T(37, fracDe(37, w)), tipo: "objeto" as const, desc: rot })),
    { f: T(38, fracDe(38, "ponto")), tipo: "objeto", desc: "100%" },
  ],
  Cena: ({ f, cam }) => <CenaCam cenario={ESCURO} f={f} cam={cam} />,
  Sobre: ({ f }) => {
    const [fT, fQ, fE, fA] = GOLPES.map(([w]) => T(37, fracDe(37, w)));
    const tremor = [fT + 4, fQ + 6, fE, fA + 5].some((q) => f >= q && f < q + 6) ? Math.sin(f * 3) * 7 : 0;
    const cai = f >= fQ && f < fQ + 6 ? -360 * (1 - entre(f, fQ, fQ + 6)) : 0;
    const bum = f >= fE && f < fE + 14 ? entre(f, fE, fE + 8) : 0;
    const carro = f >= fA && f < fA + 16 ? (f - fA) / 16 : -1;
    const bala = f >= fT && f < fT + 5 ? 40 + (f - fT) * 135 : -1;
    return (
      <>
        <g transform="translate(960 500) scale(1.15)">
          <TelaJogo f={f} vida={1}>
            <rect x={0} y={420} width={1200} height={260} fill="#7FA87A" />
            {bum > 0 && <circle cx={600} cy={460} r={60 + 230 * bum} fill="#F2B04E" stroke={L} strokeWidth={6} opacity={1 - bum * 0.7} />}
            <g transform={`translate(${tremor} ${cai})`}><Boneco x={600} y={560} f={f} s={0.62} /></g>
            {bala > 0 && <><line x1={Math.max(0, bala - 160)} y1={450} x2={Math.min(560, bala)} y2={450} stroke="#FFFFFF" strokeWidth={6} strokeLinecap="round" opacity={0.7} /><circle cx={Math.min(560, bala)} cy={450} r={9} fill="#F2D16B" stroke={L} strokeWidth={4} /></>}
            {carro >= 0 && <g transform={`translate(${-260 + 1720 * carro} 640) scale(0.42)`}><Hatch cor="#C0504D" /></g>}
          </TelaJogo>
        </g>
        {f >= T(36, fracDe(36, "barra de vida")) && f < T(37) && <ellipse cx={1443} cy={164} rx={215} ry={50} fill="none" stroke="#F2D16B" strokeWidth={9} />}
        {GOLPES.map(([w, rot, cor], i) => <Estrela key={w} x={[620, 1330, 640, 1300][i]} y={[400, 400, 700, 700][i]} f={f} de={T(37, fracDe(37, w))} ate={CORTE(38)} texto={rot} cor={cor} r={95} rot={i % 2 ? 8 : -8} />)}
        <TextoPop x={1110} y={190} f={f} de={T(38, fracDe(38, "ponto"))} ate={CORTE(38)} texto="100%" tam={84} cor="#7FD18C" rot={-4} />
      </>
    );
  },
};

// ------------------------------------------------------------------ 15. parece perfeito; é aqui que todo mundo erra; invulnerável não é imortal; só ignora o dano
const q3: PlanoV = {
  nome: "invulnerável não é imortal", de: CORTE(38), ate: CORTE(43), enquadra: { x: 960, y: 560, zoom: 1.0 },
  eventos: [
    { f: CORTE(38), tipo: "corte", desc: "Téo com o escudo" },
    { f: T(39, fracDe(39, "perfeito")), tipo: "pose", desc: "aponta: perfeito" },
    { f: T(40, fracDe(40, "erra")), tipo: "objeto", desc: "X vermelho" },
    { f: T(41), tipo: "objeto", desc: "INVULNERÁVEL" },
    { f: T(41, fracDe(41, "imortal")), tipo: "objeto", desc: "≠ IMORTAL" },
    { f: T(42) + 4, tipo: "objeto", desc: "as pedras batem no escudo e voltam" },
    { f: T(43, fracDe(43, "leis da física")), tipo: "objeto", desc: "LEIS DA FÍSICA continuam" },
    { f: T(43, fracDe(43, "ignora o dano")), tipo: "objeto", desc: "DANO: IGNORADO" },
  ],
  Cena: ({ f, cam }) => {
    const set = BEGE.set;
    const p: PersonProps = f >= T(39) && f < T(40) ? { ...props(TEO), ...point({ ...emPe(set, "chao", 420), alvo: [150, -300], expr: "convencido" })(f - T(39)) } : { ...props(TEO), ...idle(emPe(set, "chao", 420))(f), expr: expressaoNoQuadro([[0, "convencido"], [T(40), "olhar-lateral"], [T(42), "sigma"]], f, 6) };
    p.lookAt = olhar(p, [1200, 450]);
    const brilho = 0.35 + 0.15 * Math.sin(f / 5);
    return (
      <CenaCam cenario={BEGE} f={f} cam={cam}
        noMeio={<>
          <ellipse cx={420} cy={700} rx={190} ry={300} fill="#9ED8F5" opacity={brilho} stroke="#5AA5B8" strokeWidth={6} />
          <Person {...p} semente={1} />
          {[0, 1, 2].map((i) => {
            const q = T(42) + 4 + i * 12; // contato
            const y0 = 520 + i * 90, r = [16, 22, 13][i];
            if (f < q - 8 || f >= q + 22) return null;
            const ida = f < q;
            const x = ida ? 610 + (q - f) * 160 : 610 + (f - q) * 26;
            const y = ida ? y0 : y0 - 22 * (f - q) + 1.8 * (f - q) * (f - q);
            return (
              <g key={i}>
                <circle cx={x} cy={y} r={r} fill="#8A8F98" stroke={L} strokeWidth={5} />
                {f >= q && f < q + 5 && <path d={`M ${610} ${y0 - 40} l 0 -24 M ${630} ${y0 - 30} l 18 -18 M ${640} ${y0} l 24 0`} stroke="#F2D16B" strokeWidth={7} strokeLinecap="round" />}
              </g>
            );
          })}
        </>}
      />
    );
  },
  Sobre: ({ f }) => (
    <>
      {(() => { const s = escalaPop(f, T(40, fracDe(40, "erra")), T(41)); return s > 0 ? <g transform={`translate(1200 400) scale(${s})`}><path d="M -90 -90 L 90 90 M 90 -90 L -90 90" stroke={L} strokeWidth={46} strokeLinecap="round" /><path d="M -90 -90 L 90 90 M 90 -90 L -90 90" stroke="#C0504D" strokeWidth={30} strokeLinecap="round" /></g> : null; })()}
      <TextoPop x={1200} y={280} f={f} de={T(41)} ate={T(42) + 2} texto="INVULNERÁVEL" tam={88} cor="#7FD18C" rot={-3} />
      <TextoPop x={1200} y={430} f={f} de={T(41, fracDe(41, "imortal"))} ate={T(42) + 2} texto="≠ IMORTAL" tam={100} cor="#E0826E" rot={2} />
      <TextoPop x={1250} y={380} f={f} de={T(42, fracDe(42, "ferido"))} ate={T(43)} texto="SEM FERIDA" tam={72} cor="#7FD18C" rot={-3} />
      {(() => { const s = escalaPop(f, T(43, fracDe(43, "leis da física")), CORTE(43)); return s > 0 ? <g transform={`translate(1250 330) rotate(-4) scale(${s})`}><rect x={-170 + 7} y={-120 + 8} width={340} height={240} rx={14} fill="#D6D2CA" /><rect x={-170} y={-120} width={340} height={240} rx={14} fill="#2F6E9E" stroke={L} strokeWidth={7} /><rect x={-150} y={-100} width={300} height={200} rx={8} fill="none" stroke="#9ED8F5" strokeWidth={5} /><Texto texto="LEIS DA" tam={40} y={-10} /><Texto texto="FÍSICA" tam={48} y={44} cor="#F2D16B" /></g> : null; })()}
      <TextoPop x={1250} y={620} f={f} de={T(43, fracDe(43, "ignora o dano"))} ate={CORTE(43)} texto="DANO: IGNORADO" tam={62} cor="#F2D16B" rot={-3} />
    </>
  ),
};

// ------------------------------------------------------------------ 16. o corpo continua precisando de oxigênio; sem oxigênio no cérebro, desmaio em ~15 s
const q4: PlanoV = {
  nome: "oxigênio", de: CORTE(43), ate: CORTE(45), enquadra: { x: 960, y: 560, zoom: 1.0 },
  eventos: [
    { f: CORTE(43), tipo: "corte", desc: "pulmões" },
    { f: T(44, fracDe(44, "oxigênio")), tipo: "objeto", desc: "O₂ entrando" },
    { f: T(45, fracDe(45, "cérebro")), tipo: "objeto", desc: "o cérebro" },
    { f: T(45, fracDe(45, "quinze")), tipo: "objeto", desc: "relógio: 15 s" },
  ],
  Cena: ({ f, cam }) => <CenaCam cenario={ESCURO} f={f} cam={cam} />,
  Sobre: ({ f }) => {
    const sP = escalaPop(f, CORTE(43) + 3, T(45));
    const sC = escalaPop(f, T(45, fracDe(45, "cérebro")), CORTE(45));
    const sR = escalaPop(f, T(45, fracDe(45, "quinze")), CORTE(45));
    return (
      <>
        {sP > 0 && <g transform={`translate(960 560) scale(${3 * sP})`}><Pulmao k={0.5 + 0.5 * Math.sin(f / 8)} /></g>}
        {f >= T(44, fracDe(44, "oxigênio")) && f < T(45) && [0, 1, 2, 3].map((i) => {
          const k = ((f - T(44, fracDe(44, "oxigênio")) + i * 8) % 32) / 32;
          return <g key={i} transform={`translate(${960 + (i - 1.5) * 260 * (1 - k)} ${70 + 170 * k})`} opacity={Math.sin(Math.PI * k)}><circle r={40} fill="#9ED8F5" stroke={L} strokeWidth={5} /><Texto texto="O₂" tam={34} y={12} cor={L} contorno={0} /></g>;
        })}
        {sC > 0 && <g transform={`translate(720 500) scale(${2.3 * sC})`}><Cerebro /></g>}
        {sR > 0 && <g transform={`translate(1260 480) scale(${2.2 * sR})`}><IconeRelogio giro={(f - T(45, fracDe(45, "quinze"))) * 24} /><Texto texto="15 s" tam={40} y={100} cor="#F2D16B" /></g>}
      </>
    );
  },
};

// ------------------------------------------------------------------ 17. o mar: Téo pula; está protegido; nada machuca; só não consegue respirar; apaga
const flutua = (p: PersonProps, f: number, alto = 150, apaga = 0): PersonProps => ({
  ...p, pulo: alto + Math.sin(f / 22) * 18 * (1 - apaga) - 60 * apaga, giro: Math.sin(f / 30) * 8 * (1 - apaga) + 24 * apaga, semSombraChao: true,
  footL: [-36, -12 + Math.sin(f / 15) * 10 * (1 - apaga)], footR: [34, -2], kneeL: 14, kneeR: 10,
});
const Peixe: React.FC<{ cor?: string }> = ({ cor = "#E0822E" }) => (
  <g>
    <path d="M -60 0 Q -20 -40 40 0 Q -20 40 -60 0 Z M 40 0 L 80 -30 L 80 30 Z" fill={cor} stroke={L} strokeWidth={6} strokeLinejoin="round" />
    <circle cx={-34} cy={-6} r={6} fill={L} />
  </g>
);
const q5: PlanoV = {
  nome: "o fundo do mar", de: CORTE(45), ate: CORTE(50), enquadra: { x: 960, y: 560, zoom: 1.0 },
  eventos: [
    { f: CORTE(45), tipo: "corte", desc: "o mar" },
    { f: T(46, fracDe(46, "pula")), tipo: "pose", desc: "Téo pula na água: tchibum", verbo: "pular" },
    { f: T(47), tipo: "objeto", desc: "escudo: está protegido" },
    { f: T(48, fracDe(48, "machuca")), tipo: "objeto", desc: "o peixe bate e volta" },
    { f: T(49, fracDe(49, "respirar")), tipo: "objeto", desc: "o oxigênio acaba, bolhas saindo" },
    { f: T(50, fracDe(50, "apaga")), tipo: "expressao", desc: "Téo apaga, corpo intacto" },
  ],
  Cena: ({ f, cam }) => {
    const set = MAR.set;
    const fP = T(46, fracDe(46, "pula"));
    const desce = entre(f, fP, fP + 18);
    const fApaga = T(50, fracDe(50, "apaga"));
    const apaga = entre(f, fApaga, fApaga + 20);
    let p: PersonProps = flutua({ ...props(TEO), ...idle(emPe(set, "chao", 900))(f), expr: f >= fApaga ? "neutro" : expressaoNoQuadro([[0, "convencido"], [T(49), "chocado"], [T(50), "triste"]], f, 6), handL: [-110, -260], handR: [110, -260], gripL: "open", gripR: "open" }, f, 150 + 700 * (1 - desce), apaga);
    if (f < fP) p = { ...p, pulo: 2000 };
    if (f >= fApaga + 4) p = { ...p, blink: 1, handL: [-120, -150], handR: [120, -150] };
    p.lookAt = f >= T(49) ? [0, -330] : olhar(p, [1300, 500]);
    const fC = T(48, fracDe(48, "machuca")); // o peixe encosta
    const ida = f < fC;
    const xPeixe = ida ? 1040 + (fC - f) * 32 : 1040 + (f - fC) * 12;
    const rosto = rostoNoMundo(p);
    return (
      <CenaCam cenario={MAR} f={f} cam={cam}
        noMeio={<>
          <Person {...p} semente={1} />
          {f >= fC - 24 && xPeixe < 2100 && <g transform={`translate(${xPeixe} ${560 + Math.sin(f / 4) * 10}) scale(${ida ? 1 : -1} 1)`}><Peixe /></g>}
          {f >= fP && f < fP + 20 && Array.from({ length: 8 }, (_, i) => <circle key={i} cx={900 + (i - 4) * 30} cy={300 - ((f - fP) * 12 + i * 20) % 300} r={10} fill="none" stroke="#DDEFF5" strokeWidth={4} />)}
          {f >= T(49) && f < fApaga && [0, 1, 2].map((i) => {
            const k = ((f - T(49) + i * 10) % 30) / 30;
            return <circle key={i} cx={rosto[0] + 14 + 60 * k + Math.sin(f / 3 + i) * 6} cy={rosto[1] + 52 - k * 230} r={9 + i * 3} fill="#DDEFF5" fillOpacity={0.5} stroke="#2F6E9E" strokeWidth={3} opacity={1 - k * 0.8} />;
          })}
        </>}
      />
    );
  },
  Sobre: ({ f }) => {
    const o2 = 1 - entre(f, T(49), T(50, fracDe(50, "apaga")));
    const fC = T(48, fracDe(48, "machuca"));
    return (
      <>
        <g transform="translate(100 90)"><BarraVida k={1} rotulo="VIDA" /></g>
        {f >= T(49, fracDe(49, "respirar")) - 20 && <g transform="translate(100 140)"><BarraVida k={o2} cor="#5AA5B8" rotulo="O₂" /></g>}
        {(() => { const s = escalaPop(f, T(47), T(49)); return s > 0 ? <g transform={`translate(1500 300) scale(${0.9 * s})`}><Escudo /></g> : null; })()}
        <TextoPop x={1300} y={160} f={f} de={T(46, fracDe(46, "pula"))} ate={T(47)} texto="TCHIBUM!" tam={80} cor="#9ED8F5" rot={-5} />
        <Estrela x={1070} y={520} f={f} de={fC} ate={fC + 10} texto="TOC" r={56} cor="#FFFFFF" />
        <TextoPop x={1200} y={330} f={f} de={fC + 4} ate={T(49)} texto="NADA" tam={72} cor="#7FD18C" rot={4} />
        <TextoPop x={1300} y={200} f={f} de={T(50, fracDe(50, "intacto"))} ate={CORTE(50)} texto="CORPO INTACTO" tam={64} cor="#FFFFFF" rot={-3} />
      </>
    );
  },
};

// ------------------------------------------------------------------ 18. o fogo: 60% água; ferida não fica, mas temperatura é agitação de molécula
const q6: PlanoV = {
  nome: "60% água; agitação de molécula", de: CORTE(50), ate: CORTE(54), enquadra: { x: 960, y: 560, zoom: 1.0 },
  eventos: [
    { f: CORTE(50), tipo: "corte", desc: "a chama" },
    { f: T(51, fracDe(51, "fogo")), tipo: "objeto", desc: "a chama cresce" },
    { f: T(52, fracDe(52, "sessenta")), tipo: "objeto", desc: "o corpo enche de água: 60%" },
    { f: T(53), tipo: "objeto", desc: "escudo: sem ferida" },
    { f: T(54, fracDe(54, "temperatura")), tipo: "objeto", desc: "termômetro, a água ferve" },
    { f: T(54, fracDe(54, "agitação")), tipo: "objeto", desc: "moléculas agitadas" },
  ],
  Cena: ({ f, cam }) => <CenaCam cenario={VERMELHO} f={f} cam={cam} />,
  Sobre: ({ f }) => {
    const fS = T(52, fracDe(52, "sessenta"));
    const nivel = entre(f, fS, fS + 18) * 0.6;
    const calor = entre(f, T(54, fracDe(54, "temperatura")), CORTE(54));
    const sF = escalaPop(f, CORTE(50) + 2, T(52));
    const cresce = 1.6 + 0.9 * entre(f, T(51, fracDe(51, "fogo")), T(51, fracDe(51, "fogo")) + 8);
    return (
      <>
        {sF > 0 && <g transform={`translate(960 640) scale(${cresce * sF})`}><Chama f={f} /></g>}
        {f >= T(52) && <g transform="translate(560 600) scale(1.4)"><CorpoAgua nivel={nivel} quente={calor} f={f} /></g>}
        {calor > 0.3 && <Vapor x={560} y={268} f={f} />}
        <TextoPop x={560} y={100} f={f} de={fS} ate={CORTE(54)} texto="60% ÁGUA" tam={76} cor="#9ED8F5" rot={-3} />
        {(() => { const s = escalaPop(f, T(53), T(54)); return s > 0 ? <g transform={`translate(1300 480) scale(${s})`}><Escudo /><Texto texto="SEM FERIDA" tam={44} y={150} /></g> : null; })()}
        {f >= T(54, fracDe(54, "temperatura")) && <g transform="translate(1000 560)"><Termometro k={0.3 + 0.7 * calor} /></g>}
        {f >= T(54, fracDe(54, "agitação")) && <g transform="translate(1420 520) scale(1.3)"><circle r={200} fill="#2A1E1E" stroke={L} strokeWidth={7} /><Moleculas f={f} calor={calor} /></g>}
      </>
    );
  },
};

// ------------------------------------------------------------------ 19. Téo atravessa o incêndio sem um arranhão, cozinhando por dentro
const q7: PlanoV = {
  nome: "atravessa o incêndio", de: CORTE(54), ate: CORTE(55), enquadra: { x: 960, y: 580, zoom: 1.0 },
  eventos: [
    { f: CORTE(54), tipo: "corte", desc: "o incêndio: Téo atravessa andando", verbo: "atravessar" },
    { f: T(55, fracDe(55, "arranhão")), tipo: "objeto", desc: "vida cheia: 100%" },
    { f: T(55, fracDe(55, "cozinhando")), tipo: "objeto", desc: "por dentro: vapor e o termômetro sobe" },
  ],
  Cena: ({ f, cam }) => {
    const set = INCENDIO.set;
    const anda = walk({ ...emPe(set, "chao", 380), xa: 380, xb: 1320, f0: CORTE(54) + 2, passo: 150, quadros: 10 });
    const p: PersonProps = { ...props(TEO), ...anda(f), expr: f >= T(55, fracDe(55, "cozinhando")) ? "triste" : "sigma" };
    p.lookAt = olhar(p, [1700, 600]);
    const rosto = rostoNoMundo(p);
    return (
      <CenaCam cenario={INCENDIO} f={f} cam={cam}
        noMeio={<>
          <Person {...p} semente={1} />
          {f >= T(55, fracDe(55, "cozinhando")) && <Vapor x={rosto[0]} y={rosto[1] - 130} f={f} />}
          {[160, 620, 1080, 1540, 1900].map((x, i) => <g key={x} transform={`translate(${x} 980)`}><Chama f={f} s={1.5} fase={i * 2} /></g>)}
        </>}
      />
    );
  },
  Sobre: ({ f }) => {
    const quente = entre(f, T(55, fracDe(55, "cozinhando")), CORTE(55));
    return (
      <>
        <g transform="translate(100 90)"><BarraVida k={1} rotulo="VIDA" /></g>
        <TextoPop x={560} y={110} f={f} de={T(55, fracDe(55, "arranhão"))} ate={CORTE(55)} texto="100%" tam={50} cor="#7FD18C" rot={-3} />
        {f >= T(55, fracDe(55, "cozinhando")) && <g transform="translate(1760 520) scale(1.2)"><Termometro k={0.3 + 0.7 * quente} /></g>}
      </>
    );
  },
};

// ------------------------------------------------------------------ 20. a parte que o jogo mais esconde: aceleração
const q8: PlanoV = {
  nome: "aceleração", de: CORTE(55), ate: CORTE(57), enquadra: { x: 960, y: 560, zoom: 1.0 }, pushIn: 0.08, semLegenda: [57],
  eventos: [
    { f: CORTE(55), tipo: "corte", desc: "cartela" },
    { f: T(56, fracDe(56, "parte")), tipo: "objeto", desc: "O QUE O JOGO ESCONDE" },
    { f: T(57), tipo: "objeto", desc: "ACELERAÇÃO" },
  ],
  Cena: ({ f, cam }) => {
    const set = ESCURO.set;
    const p: PersonProps = { ...props(TEO), ...idle(emPe(set, "chao", 1560))(f), expr: f >= T(57) ? "chocado" : "olhar-lateral" };
    p.lookAt = olhar(p, [800, 400]);
    return <CenaCam cenario={ESCURO} f={f} cam={cam} noMeio={<Person {...p} semente={1} />} />;
  },
  Sobre: ({ f }) => (
    <>
      <TextoPop x={760} y={300} f={f} de={T(56, fracDe(56, "parte"))} texto="O QUE O JOGO ESCONDE" tam={58} cor="#FFFFFF" rot={-2} />
      <TextoPop x={760} y={500} f={f} de={T(57)} texto="ACELERAÇÃO" tam={130} cor="#F2D16B" rot={-4} />
      {f >= T(57) && [0, 1, 2, 3].map((i) => <line key={i} x1={300 + i * 30} y1={620 + i * 40} x2={1220 - i * 30} y2={620 + i * 40} stroke="#FFFFFF" strokeWidth={8} strokeLinecap="round" strokeDasharray="60 40" strokeDashoffset={-(f - T(57)) * 30} opacity={0.6} />)}
    </>
  ),
};

// ------------------------------------------------------------------ 21. no jogo: cai do prédio, bate no chão, sai andando
const q9: PlanoV = {
  nome: "no jogo: cai, bate, sai andando", de: CORTE(57), ate: CORTE(58), enquadra: { x: 960, y: 560, zoom: 1.0 },
  eventos: [
    { f: CORTE(57), tipo: "corte", desc: "a tela do jogo: o boneco no telhado" },
    { f: T(58, fracDe(58, "cai")), tipo: "pose", desc: "o boneco cai do prédio", verbo: "cair" },
    { f: T(58, fracDe(58, "bate")), tipo: "objeto", desc: "bate no chão: PLOFT", verbo: "bater" },
    { f: T(58, fracDe(58, "sai andando")), tipo: "pose", desc: "levanta e sai andando", verbo: "sair" },
    { f: T(58, fracDe(58, "andando")), tipo: "pose", desc: "anda para a direita", verbo: "andar" },
  ],
  Cena: ({ f, cam }) => <CenaCam cenario={ESCURO} f={f} cam={cam} />,
  Sobre: ({ f }) => {
    const fC = T(58, fracDe(58, "cai")), fB = T(58, fracDe(58, "bate")), fA = T(58, fracDe(58, "andando"));
    const sai = entre(f, fC, fC + 8);
    const queda = lim((f - (fC + 8)) / Math.max(4, fB - fC - 8));
    const x = f >= fA ? 740 + (f - fA) * 7 : 600 + 140 * sai;
    const y = 230 + 330 * queda * queda;
    const deitado = f < fB ? 0 : 1 - entre(f, fA - 8, fA);
    return (
      <>
        <g transform="translate(960 500) scale(1.15)">
          <TelaJogo f={f} vida={1}>
            <rect x={0} y={560} width={1200} height={120} fill="#B9B2A5" />
            <rect x={440} y={230} width={240} height={330} fill="#C9D3E0" stroke={L} strokeWidth={5} />
            {Array.from({ length: 4 }, (_, r) => <rect key={r} x={490} y={256 + r * 76} width={140} height={44} fill="#9ED8F5" stroke={L} strokeWidth={3} />)}
            {f >= fC + 8 && f < fB && [0, 1, 2].map((i) => <line key={i} x1={720 + i * 24} y1={y - 220 - i * 20} x2={720 + i * 24} y2={y - 160 - i * 20} stroke="#FFFFFF" strokeWidth={6} strokeLinecap="round" />)}
            <Boneco x={x} y={y} f={f} s={0.42} deitado={deitado} />
          </TelaJogo>
        </g>
        <Estrela x={1150} y={780} f={f} de={fB} ate={fA} texto="PLOFT!" r={70} />
      </>
    );
  },
};

// ------------------------------------------------------------------ 22. o problema não é a velocidade, é a parada
const q10: PlanoV = {
  nome: "não é a velocidade: é a parada", de: CORTE(58), ate: CORTE(60), enquadra: { x: 960, y: 560, zoom: 1.0 },
  eventos: [
    { f: CORTE(58), tipo: "corte", desc: "velocímetro" },
    { f: T(59, fracDe(59, "cai")), tipo: "objeto", desc: "o ponteiro sobe na queda", verbo: "cair" },
    { f: T(59, fracDe(59, "velocidade")), tipo: "objeto", desc: "velocidade: X" },
    { f: T(60), tipo: "objeto", desc: "placa PARE" },
  ],
  Cena: ({ f, cam }) => <CenaCam cenario={ESCURO} f={f} cam={cam} />,
  Sobre: ({ f }) => {
    const v = 200 * entre(f, T(59, fracDe(59, "cai")), T(59, fracDe(59, "velocidade")));
    const s = escalaPop(f, T(60), CORTE(60));
    return (
      <>
        <g transform="translate(700 520) scale(1.6)"><Velocimetro v={f >= T(60) ? 0 : v} /></g>
        {f >= T(59, fracDe(59, "velocidade")) && f < T(60) && <g transform="translate(700 520)"><path d="M -150 -150 L 150 150 M 150 -150 L -150 150" stroke="#C0504D" strokeWidth={26} strokeLinecap="round" opacity={0.85} /></g>}
        {s > 0 && <g transform={`translate(1350 520) scale(${s})`}>
          <polygon points="-90,-217 90,-217 217,-90 217,90 90,217 -90,217 -217,90 -217,-90" transform="translate(8 9)" fill="#D6D2CA" />
          <polygon points="-90,-217 90,-217 217,-90 217,90 90,217 -90,217 -217,90 -217,-90" fill="#C0504D" stroke={L} strokeWidth={9} />
          <Texto texto="PARE" tam={130} y={46} />
        </g>}
      </>
    );
  },
};

// ------------------------------------------------------------------ 23. queda livre: 200 km/h; parar em centímetros; pilotos e 5 G; o sangue que não sobe
const CAIR = predioQueda((t) => t * 900);
const q11: PlanoV = {
  nome: "queda livre e a parada", de: CORTE(60), ate: CORTE(63), enquadra: { x: 960, y: 560, zoom: 1.0 },
  eventos: [
    { f: CORTE(60), tipo: "corte", desc: "Téo em queda ao lado do prédio" },
    { f: T(61, fracDe(61, "duzentos")), tipo: "objeto", desc: "200 km/h" },
    { f: T(62, fracDe(62, "zero")), tipo: "objeto", desc: "o chão: 200 → 0" },
    { f: T(62, fracDe(62, "centímetros")), tipo: "objeto", desc: "em centímetros" },
    { f: T(63), tipo: "objeto", desc: "o jato faz a curva; medidor de G" },
    { f: T(63, fracDe(63, "cinco vezes")), tipo: "objeto", desc: "5 G" },
    { f: T(63, fracDe(63, "subir")), tipo: "objeto", desc: "o sangue não sobe para a cabeça", verbo: "subir" },
  ],
  Cena: ({ f, cam }) => {
    const set = CAIR.set;
    const fZ = T(62, fracDe(62, "zero"));
    const chao = f >= fZ;
    const p: PersonProps = chao
      ? { ...props(TEO), ...fall({ ...emPe(set, "chao", 640), lado: 1 })(f - fZ), expr: "chocado" }
      : { ...props(TEO), ...idle(emPe(set, "chao", 640))(f), pulo: 250 + Math.sin(f / 3) * 6, giro: Math.sin(f / 6) * 10, semSombraChao: true, expr: "chocado", handL: [-120, -330], handR: [120, -330], gripL: "open", gripR: "open" };
    return (
      <CenaCam cenario={chao ? CINZA : CAIR} f={f} cam={cam}
        noMeio={<>
          {chao && <rect x={-200} y={900} width={2400} height={300} fill="#B9B2A5" stroke={L} strokeWidth={7} />}
          <Person {...p} semente={1} />
        </>}
      />
    );
  },
  Sobre: ({ f }) => {
    const fV = T(61, fracDe(61, "duzentos"));
    const fZ = T(62, fracDe(62, "zero"));
    const f5 = T(63, fracDe(63, "cinco vezes"));
    const v = f < fZ ? 200 * entre(f, CORTE(60), fV) : 200 * (1 - entre(f, fZ, fZ + 4));
    const g = 1 + 4 * entre(f, T(63) + 6, f5);
    const arco = entre(f, T(63), f5 + 10);
    const ang = Math.PI * (0.8 - 0.75 * arco); // o fundo de um looping: desce pela esquerda, passa embaixo e sobe pela direita
    const jx = 1380 + Math.cos(ang) * 330, jy = 330 + Math.sin(ang) * 200 - Math.max(0, f - f5 - 10) * 28; // depois sobe e sai
    return (
      <>
        {f < T(63) && <g transform="translate(1500 420) scale(1.2)"><Velocimetro v={v} /></g>}
        {f >= fZ && f < fZ + 6 && <rect x={0} y={0} width={1920} height={1080} fill="#FFFFFF" opacity={1 - (f - fZ) / 6} />}
        <TextoPop x={1500} y={150} f={f} de={T(62, fracDe(62, "centímetros"))} ate={T(63)} texto="EM CENTÍMETROS" tam={62} cor="#E0826E" rot={-3} />
        {f >= T(63) && f < CORTE(63) && <g transform={`translate(${jx} ${jy}) rotate(${(ang * 180) / Math.PI - 90}) scale(1.1)`}><Jato /></g>}
        {f >= T(63) && <g transform="translate(1500 700) scale(1.05)"><Velocimetro v={g} max={6} rotulo="G" /></g>}
        <TextoPop x={1500} y={520} f={f} de={f5} ate={CORTE(63)} texto="5 G" tam={90} cor="#E0826E" rot={-4} />
        {f >= f5 && f < f5 + 10 && <circle cx={1500} cy={700} r={140 + (f - f5) * 8} fill="none" stroke="#C0504D" strokeWidth={10} opacity={1 - (f - f5) / 10} />}
        {f >= T(63, fracDe(63, "subir")) && <g transform="translate(1180 640)">
          <path d="M 0 -80 L 0 60" stroke="#C0504D" strokeWidth={22} strokeLinecap="round" />
          <path d="M -40 20 L 0 70 L 40 20" stroke="#C0504D" strokeWidth={22} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <Texto texto="SANGUE" tam={34} x={0} y={-110} />
        </g>}
      </>
    );
  },
};

// ------------------------------------------------------------------ 24. ossos não quebram; o sangue obedece à inércia; levanta, cai de novo, desmaiado
const q12: PlanoV = {
  nome: "ossos inteiros, desmaiado", de: CORTE(63), ate: CORTE(67), enquadra: { x: 960, y: 600, zoom: 1.0 },
  eventos: [
    { f: CORTE(63), tipo: "corte", desc: "Téo no chão" },
    { f: T(64, fracDe(64, "quebram")), tipo: "objeto", desc: "osso com escudo: não quebra", verbo: "quebrar" },
    { f: T(65), tipo: "objeto", desc: "a cápsula desce e para; o sangue continua", verbo: "continuar" },
    { f: T(65, fracDe(65, "inércia")), tipo: "objeto", desc: "INÉRCIA" },
    { f: T(66, fracDe(66, "levanta")), tipo: "pose", desc: "Téo levanta", verbo: "levantar" },
    { f: T(66, fracDe(66, "cai de novo")), tipo: "pose", desc: "cai de novo", verbo: "cair" },
    { f: T(67, fracDe(67, "desmaiado")), tipo: "expressao", desc: "desmaiado: olhos fechados, estrelinhas" },
  ],
  Cena: ({ f, cam }) => {
    const set = CINZA.set;
    const base = emPe(set, "chao", 760);
    const fL = T(66, fracDe(66, "levanta")), fC = T(66, fracDe(66, "cai de novo"));
    let p: PersonProps;
    if (f < fL) p = { ...props(TEO), ...fall({ ...base, lado: 1 })(40), expr: "triste" };
    else if (f < fL + 12) p = { ...props(TEO), ...fall({ ...base, lado: 1 })(12 - (f - fL)), expr: "sigma" };
    else if (f < fC) p = { ...props(TEO), ...idle(base)(f), expr: "sigma" };
    else p = { ...props(TEO), ...fall({ ...base, lado: -1 })(f - fC), expr: f >= T(67) ? "neutro" : "chocado", blink: f >= T(67) ? 1 : undefined };
    return (
      <CenaCam cenario={CINZA} f={f} cam={cam}
        noMeio={<><rect x={-200} y={900} width={2400} height={300} fill="#B9B2A5" stroke={L} strokeWidth={7} /><Person {...p} semente={1} /></>}
      />
    );
  },
  Sobre: ({ f }) => {
    const sO = escalaPop(f, T(64, fracDe(64, "quebram")), T(65));
    const fI = T(65, fracDe(65, "inércia"));
    const k = lim((f - T(65)) / Math.max(10, fI + 12 - T(65)));
    return (
      <>
        {sO > 0 && <g transform={`translate(1350 400) scale(${1.6 * sO})`}><Osso /><g transform="translate(70 -50) scale(0.45)"><Escudo /></g></g>}
        {f >= T(65) && f < T(66) && <g transform="translate(1400 420)"><Inercia k={k} /></g>}
        <TextoPop x={1400} y={110} f={f} de={fI} ate={T(66)} texto="INÉRCIA" tam={90} cor="#F2D16B" rot={-3} />
        {f >= T(67, fracDe(67, "desmaiado")) && [0, 1, 2].map((i) => <path key={i} d="M 0 -16 L 5 -5 L 16 0 L 5 5 L 0 16 L -5 5 L -16 0 L -5 -5 Z" transform={`translate(${300 + Math.cos(f / 6 + i * 2.1) * 95} ${700 + Math.sin(f / 6 + i * 2.1) * 24})`} fill="#F2D16B" stroke={L} strokeWidth={3} />)}
      </>
    );
  },
};

// ------------------------------------------------------------------ 25. o código cumpriu o que prometeu; só prometeu menos do que você entendeu
const q13: PlanoV = {
  nome: "as letras miúdas", de: CORTE(67), ate: CORTE(69), enquadra: { x: 960, y: 560, zoom: 1.0 },
  eventos: [
    { f: CORTE(67), tipo: "corte", desc: "o contrato do código" },
    { f: T(68, fracDe(68, "cumpriu")), tipo: "objeto", desc: "carimbo: CUMPRIDO" },
    { f: T(69, fracDe(69, "menos")), tipo: "objeto", desc: "a lupa: letras miúdas" },
  ],
  Cena: ({ f, cam }) => {
    const set = BEGE.set;
    const p: PersonProps = { ...props(TEO), ...idle(emPe(set, "chao", 1560))(f), expr: f >= T(69) ? "triste" : "olhar-lateral" };
    p.lookAt = olhar(p, [800, 500]);
    return <CenaCam cenario={BEGE} f={f} cam={cam} noMeio={<Person {...p} semente={1} />} />;
  },
  Sobre: ({ f }) => {
    const s = escalaPop(f, CORTE(67) + 3, Infinity);
    const miudas = entre(f, T(69, fracDe(69, "menos")), T(69, fracDe(69, "menos")) + 12);
    return (
      <>
        {s > 0 && <g transform={`translate(800 520) rotate(-3) scale(${s})`}><Contrato miudas={miudas} /></g>}
        {(() => { const c = escalaPop(f, T(68, fracDe(68, "cumpriu")), T(69, fracDe(69, "menos"))); return c > 0 ? <g transform={`translate(860 400) rotate(-14) scale(${c})`} opacity={0.9}><rect x={-190} y={-52} width={380} height={104} rx={12} fill="none" stroke="#3E8E5A" strokeWidth={10} /><Texto texto="CUMPRIDO" tam={64} y={22} cor="#3E8E5A" contorno={0} /></g> : null; })()}
        {miudas > 0 && <g transform={`translate(${700 + 40 * Math.sin(f / 10)} 700)`}><circle r={90} fill="#DDEFF5" fillOpacity={0.35} stroke={L} strokeWidth={10} /><path d="M 64 64 L 140 140" stroke={L} strokeWidth={22} strokeLinecap="round" /></g>}
      </>
    );
  },
};

export const PARTE2: PlanoV[] = [q1, q2, q3, q4, q5, q6, q7, q8, q9, q10, q11, q12, q13];
export const FIGURADOS_P2: Record<number, string[]> = {};
