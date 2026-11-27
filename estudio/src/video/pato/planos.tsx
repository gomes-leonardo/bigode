// Os 14 planos do Short "o pato que dorme com metade do cérebro", presos às falas. O último plano repete o
// enquadramento e o texto do primeiro, agora com uma pessoa no lugar do pato, para o vídeo fechar em loop.
import React from "react";
import {
  AMARELO, AZUL, Cama, Cerebro, Cronometro, E, Etiqueta, Gancho, LagoCima, LagoLado, Mao, Noite, OndaEEG, PatoCima, PatoFrente, PatoLado,
  Quarto, Raposa, RostoDeitado, Texto, saida, suave,
} from "./pecas";
import { CORTE, DURACAO, T, fracDe } from "./tempo";

export type Plano = { n: number; de: number; ate: number; Cena: React.FC<{ f: number }> };
const prog = (f: number, de: number, ate: number) => Math.min(1, Math.max(0, (f - de) / Math.max(1, ate - de)));
const P = (id: number, trecho: string) => T(id, fracDe(id, trecho));
const k8 = (f: number, de: number) => prog(f, de, de + 8);
const abreEm = (f: number, q: number) => saida(prog(f, q - 2, q + 3));
const FILA = [270, 450, 630, 810];
const Y_FILA = 830;

/** o plano 1 (e a capa): o pato de frente, um olho fechado e o outro aberto, piscando devagar */
export const Abertura: React.FC<{ f: number }> = ({ f }) => {
  const c = f % 75, pisca = c > 62 ? 1 - Math.sin(((c - 62) / 13) * Math.PI) * 0.9 : 1;
  return (
    <>
      <Noite />
      <PatoFrente x={540} y={1120} s={1.3} olhos={[0, pisca]} />
      <Gancho />
    </>
  );
};
const Zoom: React.FC<{ children: React.ReactNode }> = ({ children }) => <g transform="translate(540 830) scale(1.2) translate(-540 -830)">{children}</g>;
const Seta: React.FC<{ x: number; y: number; dir: number; k: number }> = ({ x, y, dir, k }) => (
  <g transform={`translate(${x} ${y}) scale(${dir} 1)`} opacity={k}>
    <path d={`M0 0 L${90 * saida(k)} 0`} stroke={AMARELO} strokeWidth={16} strokeLinecap="round" />
    <path d={`M${90 * saida(k) + 30} 0 L${90 * saida(k) - 5} -26 L${90 * saida(k) - 5} 26 Z`} fill={AMARELO} />
  </g>
);
const Cone: React.FC<{ x: number; y: number; ang: number; abre?: number; comp?: number }> = ({ x, y, ang, abre = 30, comp = 620 }) => {
  const a0 = ((ang - abre) * Math.PI) / 180, a1 = ((ang + abre) * Math.PI) / 180;
  return (
    <g>
      <defs>
        <radialGradient id={`cone${Math.round(x)}`} cx={x} cy={y} r={comp} gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#ffe066" stopOpacity={0.92} />
          <stop offset="1" stopColor="#ffe48a" stopOpacity={0} />
        </radialGradient>
      </defs>
      <path d={`M${x} ${y} L${x + Math.cos(a0) * comp} ${y + Math.sin(a0) * comp} A${comp} ${comp} 0 0 1 ${x + Math.cos(a1) * comp} ${y + Math.sin(a1) * comp} Z`} fill={`url(#cone${Math.round(x)})`} />
    </g>
  );
};

export const PLANOS: Plano[] = [
  // 1. Close do pato de noite, um olho fechado e o outro bem aberto; a pergunta
  { n: 1, de: 0, ate: CORTE(0), Cena: ({ f }) => <Abertura f={f} /> },
  // 2. Zoom out: o pato está num tronco boiando no lago
  {
    n: 2, de: CORTE(0), ate: CORTE(2), Cena: ({ f }) => {
      const z = suave(prog(f, CORTE(0), CORTE(0) + 28));
      const k = 2.8 + (1 - 2.8) * z, cx = 690, cy = 880;
      return (
        <>
          <g transform={`translate(${cx} ${cy}) scale(${k}) translate(${-cx} ${-cy})`}>
            <LagoLado f={f} />
            <PatoLado x={520} y={1040} s={1.25} olho={1} />
          </g>
          <Etiqueta x={540} y={360} t="NÃO É INSÔNIA" k={k8(f, P(2, "não"))} tam={60} />
        </>
      );
    },
  },
  // 3. Vista de cima: quatro patos em fila no tronco; os do meio de olhos fechados ("zzz")
  {
    n: 3, de: CORTE(2), ate: CORTE(3), Cena: ({ f }) => (
      <>
        <Zoom><LagoCima f={f} />
        {FILA.map((x, i) => <PatoCima key={i} x={x} y={Y_FILA} olhos={[0, 0]} zzz={i === 1 || i === 2 ? 1 : 0.0} f={f} />)}</Zoom>
      </>
    ),
  },
  // 4. As pontas: cada uma com o olho de fora aberto; setas para fora da fila
  {
    n: 4, de: CORTE(3), ate: CORTE(4), Cena: ({ f }) => {
      const a0 = abreEm(f, E.plim[0]), a1 = abreEm(f, E.plim[1]);
      return (
        <>
          <Zoom><LagoCima f={f} />
          <circle cx={FILA[0]} cy={Y_FILA - 20} r={150} fill="none" stroke={AMARELO} strokeWidth={8} opacity={a0} />
          <circle cx={FILA[3]} cy={Y_FILA - 20} r={150} fill="none" stroke={AMARELO} strokeWidth={8} opacity={a1} />
          {FILA.map((x, i) => (
            <PatoCima key={i} x={x} y={Y_FILA} olhos={i === 0 ? [a0, 0] : i === 3 ? [0, a1] : [0, 0]} zzz={i === 1 || i === 2 ? 1 : 0} f={f} />
          ))}
          <Seta x={FILA[0] - 70} y={Y_FILA - 92} dir={-1} k={a0} />
          <Seta x={FILA[3] + 70} y={Y_FILA - 92} dir={1} k={a1} /></Zoom>
        </>
      );
    },
  },
  // 5. O cone de visão saindo do olho aberto, varrendo a margem escura
  {
    n: 5, de: CORTE(4), ate: CORTE(5), Cena: ({ f }) => {
      const v = Math.sin((f - CORTE(4)) * 0.09) * 28;
      return (
        <>
          <Zoom><LagoCima f={f} />
          <Cone x={FILA[0] - 44} y={Y_FILA - 92} ang={180 + v} />
          <Cone x={FILA[3] + 44} y={Y_FILA - 92} ang={-v} />
          {FILA.map((x, i) => <PatoCima key={i} x={x} y={Y_FILA} olhos={i === 0 ? [1, 0] : i === 3 ? [0, 1] : [0, 0]} zzz={i === 1 || i === 2 ? 1 : 0} f={f} />)}</Zoom>
          <Etiqueta x={540} y={300} t="VIGIANDO" k={k8(f, P(5, "vigiando"))} tam={60} />
        </>
      );
    },
  },
  // 6. Raio-x: o cérebro em duas metades; o olho aberto ligado à metade do lado oposto (a linha cruza o meio)
  {
    n: 6, de: CORTE(5), ate: CORTE(6), Cena: ({ f }) => {
      const k = prog(f, CORTE(5) + 6, CORTE(5) + 26);
      const ex = 540 - 120 * 1.4, ey = 1120 - 30 * 1.4;
      return (
        <>
          <rect width={1080} height={1920} fill="#06102a" />
          {Array.from({ length: 32 }, (_, i) => <line key={i} x1={0} y1={i * 60} x2={1080} y2={i * 60} stroke="#8fd3ff" strokeOpacity={0.05} strokeWidth={2} />)}
          <PatoFrente x={540} y={1120} s={1.4} olhos={[1, 0]} raiox={1} />
          <Cerebro x={540} y={880} s={0.78} luz={[0, 1]} f={f} />
          <line x1={540} y1={720} x2={540} y2={1060} stroke="#ffffff" strokeWidth={4} strokeDasharray="14 12" opacity={0.6} />
          <path d={`M${ex} ${ey} C${ex + 40} ${ey - 120} ${640} ${980} ${660} ${890}`} stroke={AMARELO} strokeWidth={14} fill="none" strokeLinecap="round"
            strokeDasharray={600} strokeDashoffset={600 * (1 - k)} />
          <Texto y={1500} t="LIGADO AO LADO OPOSTO" tam={54} cor={AMARELO} op={prog(f, CORTE(5) + 22, CORTE(5) + 30)} />
        </>
      );
    },
  },
  // 7. Metade acordada, metade dormindo: as duas ondas lado a lado
  {
    n: 7, de: CORTE(6), ate: CORTE(7), Cena: ({ f }) => (
      <>
        <rect width={1080} height={1920} fill="#06102a" />
        <Texto y={420} t="METADE ACORDADA" tam={72} cor={AMARELO} />
        <rect x={90} y={500} width={900} height={300} rx={24} fill="#0c1a3a" stroke={AMARELO} strokeWidth={6} />
        <OndaEEG x={130} y={650} w={820} h={110} f={f} acordada cor={AMARELO} />
        <Texto y={960} t="METADE DORMINDO" tam={72} cor="#8fb8ff" op={k8(f, P(7, "dorme") - 6)} />
        <rect x={90} y={1040} width={900} height={300} rx={24} fill="#0c1a3a" stroke={AZUL} strokeWidth={6} opacity={k8(f, P(7, "dorme") - 6)} />
        <g opacity={k8(f, P(7, "dorme") - 6)}><OndaEEG x={130} y={1190} w={820} h={230} f={f} acordada={false} cor="#8fb8ff" /></g>
      </>
    ),
  },
  // 8. A barra de sono: na ponta, um terço com metade do cérebro; no meio, quase nada
  {
    n: 8, de: CORTE(7), ate: CORTE(8), Cena: ({ f }) => {
      const k = suave(prog(f, CORTE(7) + 6, P(8, "um terço") + 10));
      const barra = (y: number, amarelo: number, rot: string) => (
        <g>
          <Texto x={170} y={y + 25} t={rot} tam={44} />
          <rect x={300} y={y - 50} width={690} height={100} rx={50} fill="#2f5fbf" stroke="#0a0d1a" strokeWidth={6} />
          <rect x={300} y={y - 50} width={690 * amarelo} height={100} rx={50} fill={AMARELO} />
        </g>
      );
      return (
        <>
          <rect width={1080} height={1920} fill="#0a1430" />
          <PatoCima x={170} y={700} s={0.8} olhos={[1, 0]} />
          {barra(860, 0.32 * k, "PONTA")}
          <PatoCima x={170} y={1080} s={0.8} olhos={[0, 0]} />
          {barra(1240, 0.12 * k, "MEIO")}
          <Etiqueta x={540} y={420} t="1/3 DO SONO" k={k8(f, P(8, "um terço"))} tam={70} />
        </>
      );
    },
  },
  // 9. A mão troca o pato de ponta; ele fecha um olho e abre o outro (sempre o de fora), com um "plim"
  {
    n: 9, de: CORTE(8), ate: CORTE(9), Cena: ({ f }) => {
      const de = CORTE(8), fim = E.plim[2] - 4;
      const u = prog(f, de, fim);
      const desce = suave(u / 0.15), pega = suave((u - 0.15) / 0.1), leva = suave((u - 0.25) / 0.5), solta = suave((u - 0.8) / 0.12);
      const xm = FILA[0] + (FILA[3] - FILA[0]) * leva;
      const ergue = pega * (1 - solta);
      const outros = [1, 2, 3].map((i) => FILA[i] + (FILA[i - 1] - FILA[i]) * leva);
      const troca = f >= E.plim[2] - 1;
      const sobeMao = suave((u - 0.92) / 0.08) + (f > fim ? 1 : 0);
      const ym = -200 + (Y_FILA - 180 + 200) * desce - 700 * Math.min(1, sobeMao);
      return (
        <>
          <Zoom><LagoCima f={f} />
          {outros.map((x, i) => (
            <PatoCima key={i} x={x} y={Y_FILA} olhos={i === 0 && troca ? [abreEm(f, E.plim[2]), 0] : i === 2 && leva < 0.5 ? [0, 1] : [0, 0]} zzz={i === 2 && leva < 0.5 ? 0 : 1} f={f} />
          ))}
          <PatoCima x={xm} y={Y_FILA} olhos={troca ? [0, abreEm(f, E.plim[2])] : [1 - leva * 0.999, 0]} ergue={ergue} f={f} />
          <Mao x={xm} y={ym - ergue * 60} fecha={pega * (1 - solta)} /></Zoom>
        </>
      );
    },
  },
  // 10. A raposa aparece na margem; o pato vira a cabeça na hora. Cronômetro: < 0,2 s
  {
    n: 10, de: CORTE(9), ate: CORTE(10), Cena: ({ f }) => {
      const r = saida(prog(f, E.galho - 10, E.galho + 4));
      const virou = f >= E.galho + 5;
      return (
        <>
          <LagoLado f={f} tronco={{ x: 660, y: 1160, w: 700 }} />
          <g opacity={r}><Raposa x={60 + 170 * r} y={900} s={0.9} /></g>
          <PatoLado x={640} y={1040} s={1.2} olho={1} virado={virou ? 1 : 0} />
          {virou && f < E.galho + 9 && <path d="M720 880 q-60 -50 -130 -20" stroke="#ffffff" strokeWidth={8} fill="none" strokeLinecap="round" opacity={0.8} />}
          <Cronometro x={330} y={430} k={prog(f, E.galho + 6, E.galho + 14)} texto="< 0,2 s" />
        </>
      );
    },
  },
  // 11. Corte duro: o fundo muda de cor; uma pessoa numa cama de hotel desconhecida, mala no canto
  { n: 11, de: CORTE(10), ate: CORTE(11), Cena: ({ f }) => (<><Quarto f={f} /><Cama olhos={0} f={f} /></>) },
  // 12. Raio-x do cérebro da pessoa: um lado levemente mais aceso que o outro (diferença sutil, como no estudo)
  {
    n: 12, de: CORTE(11), ate: CORTE(12), Cena: ({ f }) => {
      const pulsa = 0.85 + 0.15 * Math.sin(f * 0.15);
      return (
        <>
          <rect width={1080} height={1920} fill="#1a0f33" />
          <ellipse cx={540} cy={860} rx={330} ry={380} fill="none" stroke="#b7a3ff" strokeWidth={8} opacity={0.7} />
          <Cerebro x={540} y={820} s={1.15} luz={[0.2, 0.2]} f={f} ondas={false} />
          <ellipse cx={402} cy={820} rx={200} ry={170} fill={AMARELO} opacity={0.22 * pulsa} />
          <OndaEEG x={330} y={820} w={160} h={70} f={f} acordada={false} cor="#ffe9a0" op={0.8} />
          <OndaEEG x={590} y={820} w={160} h={130} f={f} acordada={false} cor="#cfe0ff" op={0.8} />
          <Etiqueta x={540} y={1420} t="1ª NOITE NUM LUGAR NOVO" k={k8(f, P(12, "primeira"))} tam={56} />
          <Texto x={402} y={1080} t="MAIS LEVE" tam={44} cor={AMARELO} op={k8(f, P(12, "mais leve"))} />
        </>
      );
    },
  },
  // 13. Um bipe estranho no quarto: o lado aceso pisca e a pessoa abre os olhos de uma vez
  {
    n: 13, de: CORTE(12), ate: CORTE(13), Cena: ({ f }) => {
      const bip = f >= E.bipe && f < E.bipe + 18;
      const acorda = saida(prog(f, E.plim[3] - 1, E.plim[3] + 2));
      return (
        <>
          <Quarto f={f} />
          <rect x={130} y={240} width={110} height={50} rx={25} fill="#e9e4f5" stroke="#1c1033" strokeWidth={6} />
          <circle cx={185} cy={265} r={12} fill={bip && (f - E.bipe) % 6 < 3 ? "#ff3b3b" : "#7a2a2a"} />
          {bip && [1, 2, 3].map((k) => <path key={k} d={`M${185 - 40 * k} ${300 + 20 * k} q${40 * k} ${30 * k} ${80 * k} 0`} stroke="#ff8a8a" strokeWidth={6} fill="none" opacity={1 - k * 0.25} />)}
          <g transform="translate(560 560) scale(0.42)">
            <Cerebro x={0} y={0} s={1} luz={[bip ? 1 : 0.2, 0.2]} f={f} ondas={false} />
          </g>
          <g transform="translate(250 1090) scale(1.7) translate(-250 -1090)"><Cama olhos={acorda} f={f} /></g>
        </>
      );
    },
  },
  // 14. O enquadramento do plano 1, agora com a pessoa: um olho fechado, o outro aberto, e o mesmo texto (loop)
  {
    n: 14, de: CORTE(13), ate: DURACAO + 1, Cena: ({ f }) => (
      <>
        <Noite />
        <RostoDeitado x={540} y={1120} s={1.15} olhos={[0, 1]} />
        <Gancho op={k8(f, T(15) - 4)} />
      </>
    ),
  },
];
