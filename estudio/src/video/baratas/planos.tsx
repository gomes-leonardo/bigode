// Os 10 planos do Short "baratas extintas", presos às falas. O primeiro quadro já mostra a frase mais forte escrita na
// tela (sem introdução); o último plano devolve a grade de espécies e a mesma frase, para o vídeo fechar em loop.
import React from "react";
import {
  AMARELO, Anel, Arvore, Barata, BarataLado, BesouroMorto, Casa, Casinha, E, Folha, Fundo, GRADE, Grade, Lagarto, Ooteca, Particula,
  Passaro, Planta, PRAGA, Rato, SELVAGENS, SOLO, Seta, Texto, Tigela, Tronco, VERMELHO, Vespa, X, prog, rnd, saida, suave,
} from "./pecas";
import { CORTE, DURACAO } from "./tempo";

export type Plano = { n: number; de: number; ate: number; Cena: React.FC<{ f: number }> };
const pulsoDe = (f: number, t: number) => (f >= t ? Math.max(0, 1 - (f - t) / 18) * (0.6 + 0.4 * Math.sin((f - t) * 0.7)) : 0);

/** a frase do gancho: no primeiro quadro e de novo no fim (loop) */
export const Gancho: React.FC<{ op?: number }> = ({ op = 1 }) => (
  <g opacity={op}>
    <Texto y={280} t="SÓ 30 DE 4.600" tam={104} cor={AMARELO} />
    <Texto y={390} t="ESPÉCIES DE BARATA" tam={70} />
    <Texto y={485} t="VIVEM PERTO DE GENTE" tam={70} />
  </g>
);
/** o plano 1 (e o fim): a grade com 150 espécies, uma só "caseira" (1 em 150, quase 30 em 4.600) */
const GradeCena: React.FC<{ f: number; z?: number; volta?: (i: number) => number; some?: (i: number) => number; pulso?: number; casa?: number; gancho?: number }> = ({
  f, z = 1, volta, some, pulso = 0, casa = 1, gancho = 1,
}) => (
  <>
    <Fundo tema="mato" />
    <g transform={`translate(540 880) scale(${z.toFixed(4)}) translate(-540 -880)`}>
      <Grade f={f} volta={volta} some={some} pulso={pulso} casa={casa} />
    </g>
    <Gancho op={gancho} />
  </>
);
export const Abertura: React.FC<{ f: number }> = ({ f }) => (
  <GradeCena f={f} z={1 + 0.05 * suave(prog(f, 0, CORTE(0)))} pulso={pulsoDe(f, E.pulso)} casa={1 + 0.5 * pulsoDe(f, E.casa0)} />
);

/** a capa: uma barata grande, as outras em volta, e a pergunta curta */
export const CapaCena: React.FC = () => (
  <>
    <Fundo tema="mato" />
    {Array.from({ length: 22 }, (_, i) => {
      const a = (i / 22) * Math.PI * 2, r = 380 + 60 * rnd(i);
      return <Barata key={i} x={540 + r * Math.cos(a)} y={1080 + r * 1.05 * Math.sin(a)} s={0.55} ang={(a * 180) / Math.PI + 90} cor={SELVAGENS[i % SELVAGENS.length]} op={0.9} />;
    })}
    <Barata x={540} y={1080} s={2.6} ang={-8} cor={SELVAGENS[0]} />
    <Texto y={330} t="BARATAS" tam={160} />
    <Texto y={495} t="EXTINTAS?" tam={144} cor={AMARELO} />
  </>
);

// o corte do solo (plano 4): onde o cocô cai e por onde o nitrogênio vai até a planta
const COCO_X = [392, 372];
const raizX = 700;
const caminhoN = (i: number, u: number, k: number) => {
  // cai do cocô até o meio do solo, corre até a raiz e sobe pelo caule
  const x0 = COCO_X[i % 2] + (i - 2.5) * 14, y0 = SOLO + 6;
  const x1 = x0 + 40, y1 = SOLO + 150 + (i % 3) * 18;
  const x2 = raizX + (i - 2.5) * 10, y2 = SOLO + 120;
  const x3 = raizX + 8, y3 = SOLO - (140 + 260 * k) * (0.35 + 0.1 * i);
  if (u < 0.35) { const v = u / 0.35; return [x0 + (x1 - x0) * v, y0 + (y1 - y0) * v]; }
  if (u < 0.7) { const v = (u - 0.35) / 0.35; return [x1 + (x2 - x1) * v, y1 + (y2 - y1) * v]; }
  const v = (u - 0.7) / 0.3; return [x2 + (x3 - x2) * v, y2 + (y3 - y2) * v];
};

export const PLANOS: Plano[] = [
  // 1. A grade de 150 baratas: só uma é "caseira". A frase já está na tela no primeiro quadro (sem legenda)
  { n: 1, de: 0, ate: CORTE(0), Cena: ({ f }) => <Abertura f={f} /> },
  // 2. Se todas fossem extintas: as espécies somem; a câmera corre da casa para a floresta, onde acende um alerta
  {
    n: 2, de: CORTE(0), ate: CORTE(1), Cena: ({ f }) => {
      const some = (i: number) => { const t = E.ext[0] + (E.ext[1] - E.ext[0]) * rnd(i + 13); return prog(f, t, t + 5); };
      const pan = suave(prog(f, E.pan, E.pan + 16));
      return (
        <>
          <g transform={`translate(${-1080 * pan} 0)`}>
            <GradeCena f={f} z={1.05} some={some} gancho={0} />
          </g>
          <g transform={`translate(${1080 * (1 - pan)} 0)`}>
            <Fundo tema="ceu" />
            <rect x={0} y={1060} width={1080} height={860} fill="#5aa85a" />
            <path d="M0 1060 Q540 1030 1080 1060" stroke="#3f8f45" strokeWidth={8} fill="none" />
            <Casa x={220} y={1070} s={0.95} />
            {[[600, 1062, 1.0], [700, 1050, 1.15], [800, 1066, 0.95], [900, 1054, 1.1], [660, 1080, 0.9], [860, 1086, 0.85]].map(([x, y, s], i) => (
              <Arvore key={i} x={x} y={y} s={s} tom={i} />
            ))}
            <Anel x={760} y={900} r={200} k={prog(f, E.alerta, E.alerta + 20)} cor={VERMELHO} />
            {f >= E.alerta && (
              <g transform={`translate(760 760) scale(${0.6 + 0.4 * saida(prog(f, E.alerta, E.alerta + 8))})`}>
                <circle r={52} fill={VERMELHO} stroke="#07090f" strokeWidth={7} />
                <path d="M0 -26 L0 8" stroke="#fff" strokeWidth={14} strokeLinecap="round" />
                <circle cy={26} r={8} fill="#fff" />
              </g>
            )}
          </g>
        </>
      );
    },
  },
  // 3. No mato, elas reciclam o que morreu: a folha, a madeira e o bicho morto vão sendo comidos
  {
    n: 3, de: CORTE(1), ate: CORTE(2), Cena: ({ f }) => {
      const t = f - CORTE(1);
      return (
        <>
          <Fundo tema="chao" />
          {Array.from({ length: 16 }, (_, i) => (
            <Folha key={i} x={60 + rnd(i + 30) * 960} y={500 + rnd(i + 50) * 760} s={0.32 + 0.2 * rnd(i + 70)} ang={rnd(i + 90) * 360} cor={["#8a5a22", "#a0682a", "#6e4a1c", "#b5893a"][i % 4]} fundo="#4a321e" />
          ))}
          <Folha x={300} y={690} s={1.25} ang={-24} mordida={prog(f, E.folha - 4, E.folha + 40)} fundo="#553a22" />
          <Tronco x={660} y={930} s={0.85} ang={-12} lascas={prog(f, E.madeira - 4, E.madeira + 40)} />
          <BesouroMorto x={300} y={1150} s={1.3} resta={1 - 0.55 * prog(f, E.bicho - 4, E.bicho + 50)} />
          <Barata x={436 + 4 * Math.sin(t * 0.6)} y={650} s={0.8} ang={-100} cor={SELVAGENS[2]} passo={t * 0.6} />
          <Barata x={600} y={1040 + 3 * Math.sin(t * 0.7)} s={0.75} ang={-20} cor={SELVAGENS[4]} passo={t * 0.7} />
          <Barata x={430 + 4 * Math.sin(t * 0.5)} y={1160} s={0.8} ang={-95} cor={SELVAGENS[1]} passo={t * 0.5} />
          <Barata x={900 - 2.2 * t} y={1230 - 3.2 * t} s={0.7} ang={-35} cor={SELVAGENS[6]} passo={t * 0.9} />
          <Anel x={300} y={690} r={190} k={prog(f, E.folha - 2, E.folha + 16)} />
          <Anel x={660} y={930} r={230} k={prog(f, E.madeira - 2, E.madeira + 16)} />
          <Anel x={300} y={1150} r={130} k={prog(f, E.bicho - 2, E.bicho + 16)} />
        </>
      );
    },
  },
  // 4. O cocô devolve ao solo o nitrogênio, que entra pela raiz e faz a planta crescer
  {
    n: 4, de: CORTE(2), ate: CORTE(3), Cena: ({ f }) => {
      const t = f - CORTE(2);
      const anda = prog(f, CORTE(2), E.coco[0] - 2);
      const k = 0.25 + 0.75 * suave(prog(f, E.planta - 6, E.planta + 30));
      return (
        <>
          <Fundo tema="mato" />
          {[120, 330, 900].map((x, i) => <Arvore key={i} x={x} y={SOLO - 10} s={1.3 + 0.2 * i} tom={i} />)}
          <rect x={0} y={SOLO} width={1080} height={1920 - SOLO} fill="#5a3a20" />
          {Array.from({ length: 26 }, (_, i) => <ellipse key={i} cx={rnd(i) * 1080} cy={SOLO + 60 + rnd(i + 9) * 400} rx={10 + rnd(i + 3) * 18} ry={6 + rnd(i + 4) * 8} fill="#4a2e18" />)}
          <rect x={0} y={SOLO - 14} width={1080} height={22} fill="#7a5a2a" />
          <Planta x={raizX} k={k} />
          {E.coco.map((tc, i) => (f >= tc ? <ellipse key={i} cx={COCO_X[i]} cy={SOLO - 6} rx={10} ry={7} fill="#2a1a0e" opacity={1 - prog(f, E.nitro, E.nitro + 12)} /> : null))}
          {f >= E.nitro && Array.from({ length: 6 }, (_, i) => {
            const u = prog(f, E.nitro + i * 3, E.planta + 24 + i * 2);
            const [x, y] = caminhoN(i, u, k);
            return <Particula key={i} x={x} y={y} op={u < 1 ? 1 : 0} s={0.95} />;
          })}
          <BarataLado x={110 + 300 * suave(anda)} y={SOLO - 10} s={0.95} passo={anda < 1 ? t * 0.9 : 0} cor={SELVAGENS[0]} />
        </>
      );
    },
  },
  // 5. A própria barata vira comida: pássaro, lagarto, roedor e vespa aparecem em volta dela
  {
    n: 5, de: CORTE(3), ate: CORTE(4), Cena: ({ f }) => {
      const t = f - CORTE(3);
      const pos: [number, number][] = [[240, 590], [840, 600], [250, 1140], [820, 1130]];
      const pop = (i: number) => saida(prog(f, E.bichos[i], E.bichos[i] + 8));
      return (
        <>
          <Fundo tema="mato" />
          {pos.map(([x, y], i) => <Seta key={i} x1={540 + (x - 540) * 0.36} y1={870 + (y - 870) * 0.36} x2={540 + (x - 540) * 0.6} y2={870 + (y - 870) * 0.6} k={prog(f, E.bichos[i] - 2, E.bichos[i] + 8)} />)}
          <Barata x={540} y={890} s={1.75} ang={8 * Math.sin(t * 0.08)} cor={SELVAGENS[0]} passo={t * 0.5} antena={Math.sin(t * 0.3)} />
          {pop(0) > 0 && <g transform={`translate(${pos[0][0]} ${pos[0][1]}) scale(${pop(0)}) translate(${-pos[0][0]} ${-pos[0][1]})`}><Passaro x={pos[0][0]} y={pos[0][1]} s={1.4} olha={-1} /></g>}
          {pop(1) > 0 && <g transform={`translate(${pos[1][0]} ${pos[1][1]}) scale(${pop(1)}) translate(${-pos[1][0]} ${-pos[1][1]})`}><Lagarto x={pos[1][0]} y={pos[1][1]} s={1.35} ang={-133} /></g>}
          {pop(2) > 0 && <g transform={`translate(${pos[2][0]} ${pos[2][1]}) scale(${pop(2)}) translate(${-pos[2][0]} ${-pos[2][1]})`}><Rato x={pos[2][0]} y={pos[2][1]} s={1.35} olha={-1} /></g>}
          {pop(3) > 0 && <g transform={`translate(${pos[3][0]} ${pos[3][1]}) scale(${pop(3)}) translate(${-pos[3][0]} ${-pos[3][1]})`}><Vespa x={pos[3][0]} y={pos[3][1]} s={1.45} asa={t * 2.5} /></g>}
        </>
      );
    },
  },
  // 6. Tem vespa que só cria os filhotes em barata: ela pousa na ooteca e põe o ovo dela lá dentro
  {
    n: 6, de: CORTE(4), ate: CORTE(5), Cena: ({ f }) => {
      const t = f - CORTE(4);
      const chega = suave(prog(f, CORTE(4), E.ovo - 10));
      const curva = suave(prog(f, E.ovo - 8, E.ovo));
      return (
        <>
          <Fundo tema="mato" />
          <Ooteca x={500} y={1030} s={1.4} ovoVespa={prog(f, E.ovo, E.ovo + 8)} />
          <Vespa x={1150 + (460 - 1150) * chega} y={560 + (870 - 560) * chega + 6 * Math.sin(t * 0.5)} s={1.8} asa={t * 2.5} curva={curva} />
        </>
      );
    },
  },
  // 7. Sem baratas, essas vespas sumiriam junto: a ooteca some, a vespa vira contorno e leva um X
  {
    n: 7, de: CORTE(5), ate: CORTE(6), Cena: ({ f }) => {
      const t = f - CORTE(4);
      const vira = prog(f, CORTE(5) + 6, E.some);
      return (
        <>
          <Fundo tema="mato" />
          <Ooteca x={500} y={1030} s={1.4} ovoVespa={1} op={1 - prog(f, CORTE(5), CORTE(5) + 12)} />
          {[[200, 620, 0.6], [860, 1060, 0.55], [180, 1100, 0.5]].map(([x, y, s], i) => (
            <g key={i}>
              <Vespa x={x} y={y + 4 * Math.sin(t * 0.4 + i)} s={s} asa={t * 2.5} op={1 - vira} olha={i % 2 ? 1 : -1} />
              <Vespa x={x} y={y} s={s} op={vira * 0.8} olha={i % 2 ? 1 : -1} contorno />
            </g>
          ))}
          <Vespa x={460} y={870 + 6 * Math.sin(t * 0.5)} s={1.8} asa={t * 2.5 * (1 - vira)} curva={1 - vira} op={1 - vira} />
          <Vespa x={460} y={870} s={1.8} op={vira} contorno />
          <X x={520} y={860} s={1.5} k={prog(f, E.some, E.some + 8)} />
        </>
      );
    },
  },
  // 8. Quem come barata teria menos comida (as tigelas esvaziam); e a floresta, menos adubo (o nitrogênio some)
  {
    n: 8, de: CORTE(6), ate: CORTE(8), Cena: ({ f }) => {
      const cheia = 1 - prog(f, E.menos[0] - 4, E.menos[0] + 16);
      const murcha = suave(prog(f, E.menos[1] - 4, E.menos[1] + 26));
      return (
        <>
          <Fundo tema="mato" />
          <Passaro x={220} y={600} s={0.85} olha={-1} />
          <Lagarto x={540} y={600} s={0.8} ang={180} />
          <Rato x={850} y={620} s={0.8} olha={1} />
          {[220, 540, 850].map((x) => <Tigela key={x} x={x} y={790} cheia={cheia} />)}
          <path d="M60 905 L1020 905" stroke="#ffffff" strokeWidth={4} opacity={0.35} strokeDasharray="14 12" />
          <rect x={0} y={1150} width={1080} height={140} fill="#5a3a20" />
          <rect x={0} y={1140} width={1080} height={18} fill="#7a5a2a" />
          <g transform="translate(540 1150) scale(0.6) translate(-540 -840)"><Planta x={540} k={1 - 0.3 * murcha} murcha={murcha} /></g>
          {Array.from({ length: 5 }, (_, i) => <Particula key={i} x={330 + i * 105 + (i === 2 ? 60 : 0)} y={1210 + (i % 2) * 34} s={0.8} op={1 - prog(f, E.menos[1] + i * 2, E.menos[1] + 12 + i * 2)} />)}
        </>
      );
    },
  },
  // 9. Perto da gente, sumiriam umas trinta espécies: as baratinhas da casa somem uma a uma
  {
    n: 9, de: CORTE(8), ate: CORTE(9), Cena: ({ f }) => {
      const [s0, s1] = E.some30;
      return (
        <>
          <Fundo tema="casa" />
          {/* a cozinha */}
          <rect x={70} y={520} width={940} height={740} fill="#fbf6ea" stroke="#07090f" strokeWidth={8} />
          <rect x={110} y={560} width={360} height={170} fill="#d9b27a" stroke="#07090f" strokeWidth={6} />
          <path d="M290 560 L290 730" stroke="#07090f" strokeWidth={5} />
          <rect x={540} y={560} width={200} height={150} fill="#9fd8ff" stroke="#07090f" strokeWidth={6} />
          <rect x={800} y={560} width={170} height={560} rx={14} fill="#e9eef3" stroke="#07090f" strokeWidth={6} />
          <path d="M800 760 L970 760" stroke="#07090f" strokeWidth={5} />
          <rect x={110} y={940} width={640} height={40} fill="#c98a4a" stroke="#07090f" strokeWidth={6} />
          <rect x={110} y={980} width={640} height={240} fill="#d9b27a" stroke="#07090f" strokeWidth={6} />
          {[270, 430, 590].map((x) => <path key={x} d={`M${x} 980 L${x} 1220`} stroke="#07090f" strokeWidth={5} />)}
          <rect x={300} y={900} width={150} height={40} rx={10} fill="#c7ccd4" stroke="#07090f" strokeWidth={5} />
          {Array.from({ length: 30 }, (_, i) => {
            const x = 130 + rnd(i + 200) * 820, y = 580 + rnd(i + 300) * 630;
            const tSome = s0 + (s1 - s0) * rnd(i + 400);
            const k = prog(f, tSome, tSome + 6);
            return (
              <g key={i}>
                {k > 0 && k < 1 && <circle cx={x} cy={y} r={14 + 26 * k} fill="none" stroke="#9a8a6a" strokeWidth={4} opacity={1 - k} />}
                {k < 1 && <Barata x={x} y={y} s={0.26} ang={rnd(i + 500) * 360} cor={([["#6e3216", "#b3672f"], ["#8a5a2a", "#c9965a"], ["#3a2a1a", "#7a5a3a"]] as [string, string][])[i % 3]} op={1 - k} />}
              </g>
            );
          })}
        </>
      );
    },
  },
  // 10. Na natureza, milhares: a grade volta a se encher e a frase do começo reaparece (loop)
  {
    n: 10, de: CORTE(9), ate: DURACAO + 1, Cena: ({ f }) => {
      const q = f - DURACAO;
      const volta = (i: number) => { const t = E.volta[0] + (E.volta[1] - E.volta[0]) * (i === PRAGA ? 1 : rnd(i + 77)); return prog(f, t, t + 6); };
      return <GradeCena f={q} volta={volta} gancho={prog(f, E.gancho, E.gancho + 8)} />;
    },
  },
];
export { Casinha, GRADE };
