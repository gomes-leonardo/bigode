// Os 14 planos do Short "o sexto sentido que você não sente", presos às falas. Os planos 12 e 13 são hipótese:
// fundo de outra cor e o letreiro "E SE...". O último plano repete o primeiro, agora com o braço apontando o norte (loop).
import React from "react";
import {
  AMARELO, Bussola, CIANO, Cadeira, Campo, E, Etiqueta, Fundo, Gancho, Lousa, Mapa, NARIZ, Nivel, OndasEEG, Ouvido, Passaro, Pessoa, SetaN, Terra,
  Texto, saida, suave,
} from "./pecas";
import { CORTE, DURACAO, T, fracDe } from "./tempo";

export type Plano = { n: number; de: number; ate: number; Cena: React.FC<{ f: number }> };
const prog = (f: number, de: number, ate: number) => Math.min(1, Math.max(0, (f - de) / Math.max(1, ate - de)));
const P = (id: number, trecho: string) => T(id, fracDe(id, trecho));
const k8 = (f: number, de: number) => prog(f, de, de + 8);
const mix = (a: [number, number], b: [number, number], k: number): [number, number] => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k];
const REPOUSO: [number, number] = [-170, -430];
const NO_NARIZ: [number, number] = [NARIZ[0] - 52, NARIZ[1] + 40];
const NORTE: [number, number] = [-330, -1240];
const NORTE_ABERTURA: [number, number] = [-210, -1120];

/** o plano 1 (e a capa): a silhueta com as linhas do campo atravessando a cabeça */
export const Abertura: React.FC<{ f: number; norte?: number }> = ({ f, norte = 0 }) => (
  <>
    <Fundo />
    <Campo f={f} cy={830} ang={72} />
    <Pessoa x={540} y={2380} s={1.6} f={f} pose={{ silhueta: true, maoD: mix(REPOUSO, NORTE_ABERTURA, norte), aponta: norte > 0.5 }} />
    {/* as linhas passam por cima da silhueta: atravessam a cabeça */}
    <Campo f={f} cy={830} ang={72} op={0.55} />
    {norte > 0.5 && <SetaN x={540 + 1.6 * NORTE_ABERTURA[0] + 150} y={2380 + 1.6 * NORTE_ABERTURA[1] + 20} s={0.62} pulsa={Math.sin(f * 0.3) * 0.5 + 0.5} />}
    <Gancho />
  </>
);

export const PLANOS: Plano[] = [
  // 1. Silhueta com as linhas do campo magnético atravessando a cabeça; a pergunta
  { n: 1, de: 0, ate: CORTE(0), Cena: ({ f }) => <Abertura f={f} /> },
  // 2. A lousa com os 5 sentidos; o giz risca o 5 e escreve JÁ TEM MAIS
  {
    n: 2, de: CORTE(0), ate: CORTE(2), Cena: ({ f }) => (
      <>
        <Fundo />
        <Lousa f={f} risca={prog(f, P(2, "Mas") - 2, P(2, "Mas") + 10)} escreve={prog(f, P(2, "já tem mais") - 4, P(2, "já tem mais") + 22)} />
      </>
    ),
  },
  // 3. De olhos fechados, toca a ponta do nariz de primeira
  {
    n: 3, de: CORTE(2), ate: CORTE(3), Cena: ({ f }) => {
      const k = suave(prog(f, CORTE(2) + 6, E.toque));
      return (
        <>
          <Fundo />
          <Pessoa x={540} y={1820} s={1.15} f={f} pose={{ olhos: 0, maoD: mix(REPOUSO, NO_NARIZ, k), aponta: k > 0.6 }} />
          {f >= E.toque && f < E.toque + 8 && <circle cx={540} cy={1820 + 1.15 * NARIZ[1] + 20} r={30 + (f - E.toque) * 6} fill="none" stroke={AMARELO} strokeWidth={6} opacity={1 - (f - E.toque) / 8} />}
          <Etiqueta x={540} y={300} t="SEM OLHAR" k={k8(f, E.toque)} tam={64} />
        </>
      );
    },
  },
  // 4. Raio-x suave: as juntas acendem em sequência, do ombro até o dedo
  {
    n: 4, de: CORTE(3), ate: CORTE(4), Cena: ({ f }) => (
      <>
        <Fundo />
        <rect width={1080} height={1920} fill="#020812" opacity={0.45} />
        <g opacity={0.6}><Pessoa x={540} y={1820} s={1.15} f={f} pose={{ olhos: 0, maoD: NO_NARIZ, aponta: true, juntas: E.artic.map((q) => saida(prog(f, q - 1, q + 4))) }} /></g>
        <Pessoa x={540} y={1820} s={1.15} f={f} pose={{ olhos: 0, maoD: NO_NARIZ, aponta: true, silhueta: true, juntas: E.artic.map((q) => saida(prog(f, q - 1, q + 4))) }} />
        <Texto y={250} t="VOCÊ SABE ONDE" tam={66} op={k8(f, P(4, "você sabe"))} />
        <Texto y={340} t="ESTÁ O SEU CORPO" tam={66} cor={AMARELO} op={k8(f, P(4, "você sabe") + 4)} />
      </>
    ),
  },
  // 5. O ouvido interno como um nível de bolha; o boneco anda numa trave e se corrige sozinho
  {
    n: 5, de: CORTE(4), ate: CORTE(5), Cena: ({ f }) => {
      const t = f - CORTE(4);
      let inc = 9 * Math.sin(t * 0.2);
      for (const e of E.equilibrio) if (f > e) inc *= 0.55;
      return (
        <>
          <Fundo />
          <Ouvido x={300} y={290} s={1.1} />
          <Nivel x={680} y={290} bolha={-inc / 9} />
          <rect x={140} y={1560} width={800} height={36} rx={18} fill="#7a5233" stroke="#071019" strokeWidth={6} />
          <rect x={500} y={1596} width={80} height={324} fill="#4a3220" />
          <Pessoa x={540} y={1560} s={1.0} f={f} pose={{ inclina: inc, maoD: [-430, -800 + inc * 8], maoE: [430, -800 - inc * 8] }} />
          <Etiqueta x={540} y={460} t="EQUILÍBRIO" k={k8(f, P(5, "equilíbrio"))} tam={56} />
        </>
      );
    },
  },
  // 6. Um terceiro "ponto" atrás da cabeça, apagado, piscando fraco
  {
    n: 6, de: CORTE(5), ate: CORTE(6), Cena: ({ f }) => (
      <>
        <Fundo />
        <Pessoa x={540} y={1900} s={1.3} f={f} pose={{ ponto: prog(f, CORTE(5) + 4, CORTE(5) + 16) }} />
        <Etiqueta x={540} y={330} t="E TALVEZ MAIS UM" k={k8(f, P(6, "talvez"))} tam={60} />
      </>
    ),
  },
  // 7. A Terra girando devagar; as linhas de campo atravessam a cabeça do boneco, sentado imóvel
  {
    n: 7, de: CORTE(6), ate: CORTE(7), Cena: ({ f }) => (
      <>
        <Fundo />
        <Terra x={540} y={470} r={200} f={f} />
        <Campo f={f} cy={1100} ang={80} op={0.8} n={7} />
        <Cadeira x={540} y={1760} s={0.95} />
        <Pessoa x={540} y={1760} s={0.95} f={f} pose={{ olhos: 0, sentado: true, maoD: [-120, -400], maoE: [120, -400] }} />
      </>
    ),
  },
  // 8. EEG na testa: ondas grandes; quando o campo gira, elas diminuem de repente. O rosto continua igual.
  {
    n: 8, de: CORTE(7), ate: CORTE(8), Cena: ({ f }) => {
      const gira = suave(prog(f, E.gira, E.gira + 30));
      const amp = (q: number) => 1 - 0.55 * suave((q - E.gira) / 15);
      return (
        <>
          <Fundo />
          <Campo f={f} cy={980} ang={72 + 95 * gira} op={0.7} n={7} />
          <Pessoa x={540} y={2760} s={2.0} f={f} pose={{ olhos: 0 }} />
          {[-90, -30, 30, 90].map((dx, i) => (
            <g key={i}>
              <path d={`M${540 + dx} ${2760 - 2.0 * 1010} C${540 + dx * 1.6} ${2760 - 2.0 * 1150} ${540 + dx * 2} ${640} ${540 + dx * 2.4} ${600}`} stroke="#9fb3c8" strokeWidth={5} fill="none" />
              <circle cx={540 + dx} cy={2760 - 2.0 * 1010} r={16} fill="#d8e2ee" stroke="#071019" strokeWidth={5} />
            </g>
          ))}
          <OndasEEG x={120} y={420} w={840} h={260} f={f} amp={amp} />
          <Texto y={640} t="ONDAS DO CÉREBRO" tam={46} cor="#bfe9ff" />
          <Etiqueta x={540} y={180} t="O CAMPO GIRA" fundo={CIANO} k={k8(f, E.gira)} tam={50} />
        </>
      );
    },
  },
  // 9. No mesmo quadro: o cérebro acende de um lado; do outro, o rosto em branco, dando de ombros
  {
    n: 9, de: CORTE(8), ate: CORTE(11), Cena: ({ f }) => {
      const luz = 0.6 + 0.4 * Math.sin(f * 0.25);
      return (
        <>
          <Fundo />
          <defs>
            <clipPath id="sx-esq"><rect x={0} y={0} width={536} height={1920} /></clipPath>
            <clipPath id="sx-dir"><rect x={544} y={0} width={536} height={1920} /></clipPath>
          </defs>
          <g clipPath="url(#sx-esq)">
            <rect width={540} height={1920} fill="#0a1d30" />
            <ellipse cx={270} cy={900} rx={230} ry={200} fill={AMARELO} opacity={0.18 * luz} />
            <path d="M120 900 C100 780 200 700 280 720 C330 670 430 700 440 780 C500 820 480 960 420 990 C400 1060 180 1060 140 990 C90 970 90 930 120 900 Z" fill="#ffcf5a" stroke="#fff2a8" strokeWidth={8} opacity={0.6 + 0.4 * luz} />
            <path d="M200 820 C230 850 200 900 240 920 M300 760 C280 810 330 830 300 880 M380 820 C360 870 410 900 380 950" stroke="#8a5a00" strokeWidth={8} fill="none" strokeLinecap="round" />
            <Texto x={270} y={1260} t="O SINAL" tam={70} op={k8(f, T(10))} />
            <Texto x={270} y={1350} t="CHEGA" tam={70} cor={AMARELO} op={k8(f, T(10))} />
          </g>
          <g clipPath="url(#sx-dir)">
            <rect x={540} width={540} height={1920} fill="#13283c" />
            <Pessoa x={810} y={2150} s={1.05} f={f} pose={{ olhos: 1, ombros: f >= T(11) ? 1 : 0, maoD: f >= T(11) ? [-260, -700] : REPOUSO, maoE: f >= T(11) ? [260, -700] : [170, -430] }} />
            <Texto x={810} y={1260} t="A SENSAÇÃO," tam={62} op={k8(f, T(11))} />
            <Texto x={810} y={1350} t="NÃO" tam={70} cor="#ff6b6b" op={k8(f, T(11))} />
          </g>
          <rect x={532} y={0} width={16} height={1920} fill="#050a14" />
          <Etiqueta x={540} y={260} t="NINGUÉM SENTIU NADA" fundo="#ffffff" k={k8(f, CORTE(8) + 3)} tam={48} />
        </>
      );
    },
  },
  // 10. Um bando de pássaros cruzando o mapa, alinhado às linhas de campo; a bússola acompanha
  {
    n: 10, de: CORTE(11), ate: CORTE(12), Cena: ({ f }) => {
      const t = f - CORTE(11);
      return (
        <>
          <Mapa />
          <Campo f={f} cy={950} ang={-20} op={0.65} n={8} cor="#e9fbff" />
          {Array.from({ length: 9 }, (_, i) => {
            const linha = (i % 3) - 1, col = Math.floor(i / 3);
            const x = -200 + t * 14 + col * 130 + linha * 40, y = 1050 - (x - 540) * Math.tan((20 * Math.PI) / 180) + linha * 95;
            return <Passaro key={i} x={x} y={y} s={0.9} f={f + i * 3} ang={-20} />;
          })}
          <Bussola x={880} y={1290} r={110} ang={Math.sin(f * 0.2) * 4} />
          <Etiqueta x={540} y={260} t="SE ORIENTAR NO VOO" k={k8(f, P(12, "orientar"))} tam={52} />
        </>
      );
    },
  },
  // 11. O boneco tenta acompanhar os pássaros e se perde; as linhas passam por ele, mas não acendem nada
  {
    n: 11, de: CORTE(12), ate: CORTE(13), Cena: ({ f }) => {
      const t = f - CORTE(12);
      return (
        <>
          <Mapa />
          <Campo f={f} cy={950} ang={-20} op={0.65} n={8} cor="#e9fbff" />
          {Array.from({ length: 6 }, (_, i) => <Passaro key={i} x={700 + t * 16 + i * 90} y={380 - t * 4 + (i % 2) * 60} s={0.7} f={f + i * 3} ang={-20} />)}
          <Pessoa x={540} y={1650} s={0.85} f={f} pose={{ inclina: Math.sin(t * 0.25) * 10, maoD: [-260 + Math.sin(t * 0.3) * 80, -900], maoE: [170, -430] }} />
          {[0, 1, 2].map((k) => <Texto key={k} x={380 + k * 160} y={760 - Math.abs(Math.sin(t * 0.2 + k)) * 40} t="?" tam={90} cor="#ffffff" op={0.85} />)}
          <Etiqueta x={540} y={260} t="A GENTE, AINDA NÃO" fundo="#ffffff" k={k8(f, T(13))} tam={52} />
        </>
      );
    },
  },
  // 12. Hipótese (fundo de outra cor): olhos fechados, as linhas acendem por dentro e o braço sobe apontando o N
  {
    n: 12, de: CORTE(13), ate: P(14, "você apontaria"), Cena: ({ f }) => {
      const sobe = suave(prog(f, E.hipotese + 6, E.agulha - 2));
      return (
        <>
          <Fundo tema="hipotese" />
          <Campo f={f} cy={900} ang={72} op={0.5} n={7} cor="#d9c8ff" />
          <Pessoa x={540} y={2050} s={1.25} f={f} pose={{ olhos: 0, cabecaLuz: prog(f, E.hipotese, E.hipotese + 20), maoD: mix(REPOUSO, NORTE, sobe), aponta: sobe > 0.6 }} />
          <Etiqueta x={540} y={250} t="E SE..." fundo="#d9c8ff" k={k8(f, CORTE(13) + 2)} tam={70} />
        </>
      );
    },
  },
  // 13. Close da mão apontando o norte, olhos fechados, a seta pulsando
  {
    n: 13, de: P(14, "você apontaria"), ate: CORTE(14), Cena: ({ f }) => (
      <>
        <Fundo tema="hipotese" />
        <Pessoa x={860} y={2950} s={2.1} f={f} pose={{ olhos: 0, cabecaLuz: 1, maoD: NORTE, aponta: true }} />
        <SetaN x={860 + 2.1 * NORTE[0] + 200} y={2950 + 2.1 * NORTE[1] + 10} s={1.0} pulsa={Math.sin(f * 0.3) * 0.5 + 0.5} />
        <Texto y={1200} t="E SE VOCÊ" tam={74} op={k8(f, P(14, "você apontaria"))} />
        <Texto y={1300} t="SENTISSE?" tam={84} cor={AMARELO} op={k8(f, P(14, "você apontaria") + 4)} />
      </>
    ),
  },
  // 14. O enquadramento do plano 1, agora apontando o norte; o mesmo texto (loop)
  { n: 14, de: CORTE(14), ate: DURACAO + 1, Cena: ({ f }) => <Abertura f={f} norte={1} /> },
];
