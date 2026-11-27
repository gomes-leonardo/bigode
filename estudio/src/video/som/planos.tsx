// Os 29 planos do Short "quase nenhum som que você ouve é real", presos às falas da narração. Os sons de cada prova
// estão na trilha de efeitos (scripts/sfx_som.py), e as formas de onda e o ponteiro vêm dos mesmos dados.
import React from "react";
import {
  AMARELO, Aipo, Andante, Caixa, CIANO, D, Etiqueta, Feixe, Fundo, Graos, MAGENTA, MotorEstudio, Microfone, Onda, OndaViva, Painel, Pedal,
  Pisada, Plastico, Projetor, RuaFilme, Televisao, Texto, VERDE, VERMELHO, acelEm, fasePasso, rpmEm,
} from "./pecas";
import { FONTE } from "../../fontes";
import { CORTE, DURACAO, T, fracDe } from "./tempo";

export type Plano = { n: number; de: number; ate: number; Cena: React.FC<{ f: number }> };
const prog = (f: number, de: number, ate: number) => Math.min(1, Math.max(0, (f - de) / Math.max(1, ate - de)));
const saida = (x: number) => 1 - Math.pow(1 - Math.min(1, Math.max(0, x)), 3);
const suave = (x: number) => { const k = Math.min(1, Math.max(0, x)); return k * k * (3 - 2 * k); };
const P = (id: number, trecho: string) => T(id, fracDe(id, trecho));
const k8 = (f: number, de: number) => prog(f, de, de + 8);

// ---------- peças de cena repetidas ----------
const OndaFixa: React.FC<{ f: number; cor?: string; op?: number }> = ({ f, cor = CIANO, op = 1 }) => {
  const c = D.cabeca[f] ?? -1;
  const x0 = 90, w = 900;
  return (
    <g opacity={op}>
      <rect x={x0 - 30} y={640} width={w + 60} height={520} rx={30} fill="#0b0f1f" stroke="#2c3866" strokeWidth={4} />
      <Onda picos={D.fixa} ini={0} fim={D.fixa.length / D.pps} x={x0} y={900} w={w} h={420} cor={cor} cabeca={c >= 0 ? c : 1} apagado={0.35} id="fixa" />
      {c >= 0 && <line x1={x0 + c * w} y1={660} x2={x0 + c * w} y2={1140} stroke="#ffffff" strokeWidth={6} />}
      <line x1={x0} y1={650} x2={x0} y2={1150} stroke={VERDE} strokeWidth={8} />
      <line x1={x0 + w} y1={650} x2={x0 + w} y2={1150} stroke={VERMELHO} strokeWidth={8} />
    </g>
  );
};
const Camadas: React.FC<{ f: number; luz?: (i: number) => number; junta?: number }> = ({ f, luz = () => 0.55, junta = 0 }) => (
  <g>
    {D.rpms.map((r, i) => {
      const y = 1240 - i * 150, ym = y + (860 - y) * suave(junta);
      const l = luz(i);
      return (
        <g key={i} transform={`translate(0 ${ym - y})`} opacity={1 - 0.85 * suave(junta)}>
          <path d={`M150 ${y + 55} L870 ${y + 55} L950 ${y - 55} L230 ${y - 55} Z`} fill="#101733" stroke={l > 0.5 ? AMARELO : "#33406e"} strokeWidth={l > 0.5 ? 8 : 4} />
          <Onda picos={D.camadas[i]} ini={0} fim={0.6} x={300} y={y} w={560} h={80 + 30 * l} cor={l > 0.5 ? AMARELO : CIANO} op={0.35 + 0.65 * l} id={`cam${i}`} barra={5} vao={3} />
          <text x={250} y={y + 14} textAnchor="end" fontFamily={FONTE} fontWeight={900} fontSize={34} fill={l > 0.5 ? AMARELO : "#9fb0e6"}>{(r / 1000).toFixed(1).replace(".", ",")}k</text>
        </g>
      );
    })}
  </g>
);
const PainelMini: React.FC<{ f: number; x?: number; y?: number; s?: number }> = ({ f, x = 540, y = 330, s = 0.42 }) => (
  <g transform={`translate(${x} ${y}) scale(${s}) translate(-540 -820)`}><Painel rpm={rpmEm(f)} /></g>
);
const Seta: React.FC<{ x: number; y: number; t1: string; t2: string; c2: string; k1: number; k2: number }> = ({ x, y, t1, t2, c2, k1, k2 }) => (
  <g>
    <Texto x={x} y={y} t={t1} tam={74} op={Math.min(1, k1 * 2)} />
    {k2 > 0 && <Texto x={x} y={y + 110} t={`= ${t2}`} tam={96} cor={c2} op={Math.min(1, k2 * 2)} />}
  </g>
);

// ---------- os planos ----------
const corte14 = () => CORTE(13);
export const PLANOS: Plano[] = [
  // 1. Painel genérico, o ponteiro de giro subindo
  { n: 1, de: 0, ate: CORTE(0), Cena: ({ f }) => (<><Fundo tema="jogo" f={f} /><Painel rpm={rpmEm(f)} /></>) },
  // 2. A forma de onda pulsando junto com o giro
  {
    n: 2, de: CORTE(0), ate: CORTE(1), Cena: ({ f }) => (
      <>
        <Fundo tema="jogo" f={f} />
        <PainelMini f={f} y={470} s={0.62} />
        <OndaViva f={f} x={70} y={1140} w={940} h={420} cor={AMARELO} id="v2" janela={1.6} ganho={1.2} />
      </>
    ),
  },
  // 3. Uma gravação: uma onda fixa, com começo e fim
  {
    n: 3, de: CORTE(1), ate: CORTE(2), Cena: ({ f }) => (
      <>
        <Fundo tema="jogo" f={f} />
        <Etiqueta x={540} y={420} t="GRAVAÇÃO" k={k8(f, CORTE(1) + 2)} />
        <OndaFixa f={f} />
        <Texto x={90} y={1230} t="COMEÇO" tam={52} cor={VERDE} ancora="start" op={k8(f, CORTE(1) + 6)} />
        <Texto x={990} y={1230} t="FIM" tam={52} cor={VERMELHO} ancora="end" op={k8(f, CORTE(1) + 10)} />
      </>
    ),
  },
  // 4. Começa, acontece, termina: sempre igual
  {
    n: 4, de: CORTE(2), ate: CORTE(3), Cena: ({ f }) => (
      <>
        <Fundo tema="jogo" f={f} />
        <OndaFixa f={f} />
        <Texto x={160} y={560} t="COMEÇA" tam={50} cor={VERDE} op={k8(f, P(3, "começa"))} />
        <Texto x={540} y={560} t="ACONTECE" tam={50} op={k8(f, P(3, "acontece"))} />
        <Texto x={920} y={560} t="TERMINA" tam={50} cor={VERMELHO} op={k8(f, P(3, "termina"))} />
        <Etiqueta x={540} y={1320} t="SEMPRE IGUAL" fundo="#ffffff" k={k8(f, P(3, "termina") + 8)} />
      </>
    ),
  },
  // 5. O pé pisando e soltando o acelerador
  {
    n: 5, de: CORTE(3), ate: CORTE(4), Cena: ({ f }) => (
      <>
        <Fundo tema="estudio" f={f} />
        <g transform="translate(540 960) scale(1.4) translate(-540 -1180)"><Pedal acel={acelEm(f)} /></g>
        <Etiqueta x={540} y={300} t="VOCÊ DECIDE" k={k8(f, P(4, "você"))} />
      </>
    ),
  },
  // 6. O ponteiro subindo e descendo, errático
  {
    n: 6, de: CORTE(4), ate: CORTE(5), Cena: ({ f }) => (
      <>
        <Fundo tema="jogo" f={f} />
        <Painel rpm={rpmEm(f)} cy={760} />
        <g>
          <rect x={300} y={1260} width={480} height={50} rx={25} fill="#0b0f1f" stroke="#2c3866" strokeWidth={4} />
          <rect x={300} y={1260} width={480 * acelEm(f)} height={50} rx={25} fill={AMARELO} />
          <Texto x={540} y={1380} t="PEDAL" tam={40} cor="#9fb0e6" />
        </g>
        <Etiqueta x={240} y={300} t="PISA" k={k8(f, P(5, "pisa"))} tam={42} />
        <Etiqueta x={540} y={300} t="SOLTA" fundo="#ffffff" k={k8(f, P(5, "solta"))} tam={42} />
        <Etiqueta x={840} y={300} t="PISA" k={k8(f, P(5, "pisa de novo"))} tam={42} />
      </>
    ),
  },
  // 7. A gravação fixa tentando acompanhar o pé e falhando (recomeça a cada pisada)
  {
    n: 7, de: CORTE(5), ate: CORTE(6), Cena: ({ f }) => {
      const pis = D.eventos.pisadas.some(([a]) => f >= a && f < a + 4);
      return (
        <>
          <Fundo tema="jogo" f={f} />
          <PainelMini f={f} y={330} s={0.48} />
          <OndaFixa f={f} cor={pis ? VERMELHO : CIANO} />
          {pis && <Texto x={540} y={1300} t="RECOMEÇOU" tam={64} cor={VERMELHO} />}
        </>
      );
    },
  },
  // 8. X vermelho sobre a onda
  {
    n: 8, de: CORTE(6), ate: CORTE(7), Cena: ({ f }) => {
      const k = saida(prog(f, D.eventos.erro - 2, D.eventos.erro + 6));
      return (
        <>
          <Fundo tema="jogo" f={f} />
          <OndaFixa f={f} op={0.55} />
          <g transform={`translate(540 900) scale(${0.6 + 0.4 * k})`} opacity={k}>
            <path d="M-300 -300 L300 300 M300 -300 L-300 300" stroke={VERMELHO} strokeWidth={70} strokeLinecap="round" />
          </g>
        </>
      );
    },
  },
  // 9. O motor isolado num estúdio, com microfones em volta
  {
    n: 9, de: CORTE(7), ate: CORTE(8), Cena: ({ f }) => (
      <>
        <MotorEstudio f={f} />
        <Etiqueta x={540} y={200} t="MOTOR NO ESTÚDIO" k={k8(f, CORTE(7) + 4)} />
      </>
    ),
  },
  // 10. Cinco faixas de rotação, cada uma com a sua ondinha
  {
    n: 10, de: CORTE(8), ate: CORTE(9), Cena: ({ f }) => (
      <>
        <Fundo tema="jogo" f={f} />
        <Texto x={540} y={300} t="UMA GRAVAÇÃO POR GIRO" tam={56} cor={AMARELO} />
        {D.rpms.map((r, i) => {
          const k = prog(f, D.faixas[i] - 2, D.faixas[i] + 6);
          if (k <= 0) return null;
          const y = 470 + i * 200, acesa = f < D.faixas[i] + 15;
          return (
            <g key={i} transform={`translate(${(1 - saida(k)) * 200} 0)`} opacity={k}>
              <Texto x={250} y={y + 18} t={`${r.toLocaleString("pt-BR")}`} tam={54} cor={acesa ? AMARELO : "#ffffff"} ancora="end" />
              <Texto x={250} y={y + 62} t="rpm" tam={30} cor="#9fb0e6" ancora="end" />
              <Onda picos={D.camadas[i]} ini={0} fim={0.6} x={290} y={y} w={720} h={140} cor={acesa ? AMARELO : CIANO} id={`fx${i}`} barra={5} vao={3} />
            </g>
          );
        })}
      </>
    ),
  },
  // 11. As cinco empilhadas como camadas
  {
    n: 11, de: CORTE(9), ate: CORTE(10), Cena: ({ f }) => (
      <>
        <Fundo tema="jogo" f={f} />
        <Texto x={540} y={330} t="UMA AMOSTRA EM CADA FAIXA" tam={54} cor={AMARELO} />
        <Camadas f={f} />
      </>
    ),
  },
  // 12. O ponteiro subindo e as camadas acendendo em sequência
  {
    n: 12, de: CORTE(10), ate: P(11, "misturando"), Cena: ({ f }) => (
      <>
        <Fundo tema="jogo" f={f} />
        <PainelMini f={f} y={300} s={0.44} />
        <Camadas f={f} luz={(i) => D.pesos[i][f] ?? 0} />
      </>
    ),
  },
  // 13. As camadas se misturando numa onda única, viva
  {
    n: 13, de: P(11, "misturando"), ate: CORTE(11), Cena: ({ f }) => {
      const j = prog(f, P(11, "misturando"), P(11, "misturando") + 20);
      return (
        <>
          <Fundo tema="jogo" f={f} />
          <PainelMini f={f} y={300} s={0.44} />
          <Camadas f={f} luz={(i) => D.pesos[i][f] ?? 0} junta={j} />
          <OndaViva f={f} x={70} y={860} w={940} h={440 * j} cor={AMARELO} id="v13" janela={1.4} ganho={1.2} op={j} />
          <Etiqueta x={540} y={1240} t="MISTURADO AO VIVO" k={prog(f, P(11, "misturando") + 14, P(11, "misturando") + 22)} />
        </>
      );
    },
  },
  // 14. Letreiro: montado no momento em que você pisou
  {
    n: 14, de: CORTE(11), ate: corte14(), Cena: ({ f }) => {
      const k1 = k8(f, CORTE(11) + 2), k2 = k8(f, P(13, "Foi"));
      return (
        <>
          <Fundo tema="jogo" f={f} />
          <g opacity={1 - 0.6 * k2}>
            <Texto y={520} t="NUNCA EXISTIU" tam={88} op={k1} />
            <Texto y={630} t="NUMA PISTA" tam={88} op={k1} />
          </g>
          <Texto y={820} t="MONTADO NO" tam={84} cor={AMARELO} op={k2} />
          <Texto y={930} t="MOMENTO EM QUE" tam={84} cor={AMARELO} op={k2} />
          <Texto y={1040} t="VOCÊ PISOU" tam={84} cor={AMARELO} op={k2} />
          <OndaViva f={f} x={140} y={1270} w={800} h={200} cor={AMARELO} id="v14" janela={1.2} op={0.8} />
        </>
      );
    },
  },
  // 15. Corte duro: o fundo muda de cor, começa o bloco de cinema
  {
    n: 15, de: corte14(), ate: CORTE(14), Cena: ({ f }) => {
      const desce = ((f - corte14()) * 9) % 300;
      return (
        <>
          <Fundo tema="cinema" f={f} />
          <g transform={`translate(0 ${desce - 300})`}>
            {Array.from({ length: 9 }, (_, i) => (
              <g key={i}>
                <rect x={300} y={i * 300} width={480} height={280} fill="#1a0a0c" stroke="#000" strokeWidth={6} />
                <rect x={340} y={i * 300 + 30} width={400} height={220} rx={10} fill="#6b2a2f" opacity={0.35} />
                {Array.from({ length: 4 }, (_, j) => (
                  <React.Fragment key={j}>
                    <rect x={315} y={i * 300 + 25 + j * 66} width={18} height={34} rx={5} fill="#d9c7b0" opacity={0.6} />
                    <rect x={747} y={i * 300 + 25 + j * 66} width={18} height={34} rx={5} fill="#d9c7b0" opacity={0.6} />
                  </React.Fragment>
                ))}
              </g>
            ))}
          </g>
          <Texto y={900} t="CINEMA" tam={150} cor="#ffe2b3" />
        </>
      );
    },
  },
  // 16. Uma silhueta andando numa rua, de filme
  {
    n: 16, de: CORTE(14), ate: CORTE(15), Cena: ({ f }) => (
      <>
        <Fundo tema="preto" f={f} />
        <RuaFilme f={f} x={0} y={360} w={1080} h={1080} anda={prog(f, CORTE(14), CORTE(15)) * 0.45} />
      </>
    ),
  },
  // 17. A revelação: a cena está numa tela; quem faz os passos é uma pessoa num estúdio, andando numa caixa
  {
    n: 17, de: CORTE(15), ate: P(16, "e andando"), Cena: ({ f }) => {
      const z = suave(prog(f, CORTE(15) + 4, CORTE(15) + 40));
      const s = 1080 / 760 + (1 - 1080 / 760) * z;
      const andaFilme = 0.45 + prog(f, CORTE(15), P(16, "e andando")) * 0.25;
      return (
        <>
          <Fundo tema="estudio" f={f} />
          <g transform={`translate(540 620) scale(${s}) translate(-540 -620)`}>
            <rect x={0} y={0} width={1080} height={1920} fill="#191b23" />
            <rect x={150} y={330} width={780} height={580} fill="#050505" />
            <RuaFilme f={f} x={160} y={340} w={760} h={560} anda={andaFilme} />
            <rect x={0} y={1320} width={1080} height={600} fill="#121319" />
            <Caixa x={480} y={1440} w={560} tipo="pedra" />
            <Andante x={480} y={1400} s={1.25} f={f} noLugar />
            <Microfone x={830} y={1290} ang={-75} alto={300} s={0.9} />
          </g>
          {z > 0.8 && <Etiqueta x={540} y={180} t="ESTÚDIO DE PASSOS" k={prog(f, CORTE(15) + 34, CORTE(15) + 42)} />}
        </>
      );
    },
  },
  // 18. Tela dividida: a cena em cima, os pés do estúdio embaixo, no mesmo ritmo
  {
    n: 18, de: P(16, "e andando"), ate: P(16, "de pedra"), Cena: ({ f }) => (
      <>
        <Fundo tema="preto" f={f} />
        <defs>
          <clipPath id="div-cima"><rect x={0} y={0} width={1080} height={930} /></clipPath>
          <clipPath id="div-baixo"><rect x={0} y={950} width={1080} height={970} /></clipPath>
        </defs>
        <g clipPath="url(#div-cima)">
          <RuaFilme f={f} x={-700} y={-1500} w={2480} h={2480} anda={0.42} />
        </g>
        <g clipPath="url(#div-baixo)">
          <rect x={0} y={950} width={1080} height={970} fill="#121319" />
          <Caixa x={540} y={1560} w={980} tipo="pedra" />
          <Andante x={540} y={1530} s={2.4} f={f} noLugar />
        </g>
        <rect x={0} y={928} width={1080} height={24} fill={AMARELO} />
        <Etiqueta x={170} y={110} t="FILME" fundo="#ffffff" tam={42} />
        <Etiqueta x={200} y={1030} t="ESTÚDIO" tam={42} />
      </>
    ),
  },
  // 19. Três caixas lado a lado: areia, pedra, madeira
  {
    n: 19, de: P(16, "de pedra"), ate: CORTE(16), Cena: ({ f }) => {
      const p = fasePasso(f);
      const xs: Record<string, number> = { areia: 200, pedra: 540, madeira: 880 };
      return (
        <>
          <Fundo tema="estudio" f={f} />
          <rect x={0} y={1100} width={1080} height={820} fill="#121319" />
          {(["areia", "pedra", "madeira"] as const).map((t) => (
            <g key={t}>
              <Caixa x={xs[t]} y={1120} w={300} tipo={t} />
              <Texto x={xs[t]} y={1270} t={t.toUpperCase()} tam={48} cor={p.tipo === t && p.desde < 10 ? AMARELO : "#ffffff"} />
            </g>
          ))}
          <Pisada x={xs[p.tipo] ?? 540} y={1030} s={0.95} k={p.k} desde={p.desde} />
          <OndaViva f={f} x={140} y={600} w={800} h={260} cor={AMARELO} id="v19" janela={1.6} ganho={1.3} />
        </>
      );
    },
  },
  // 20. Legume sendo torcido, em close, com a onda ao lado
  {
    n: 20, de: CORTE(16), ate: CORTE(17), Cena: ({ f }) => {
      const estalo = D.eventos.osso, ini = estalo - Math.round(0.32 * 30);
      const dobra = suave(prog(f, CORTE(16), estalo));
      const quebrou = saida(prog(f, estalo, estalo + 12));
      return (
        <>
          <Fundo tema="cinema" f={f} />
          <Aipo x={540} y={720} dobra={dobra} quebrou={quebrou} />
          <Onda picos={D.osso} ini={0} fim={D.osso.length / D.pps} x={140} y={1180} w={800} h={300} cor={VERMELHO} cabeca={Math.max(0, (f - ini) / (D.osso.length / D.pps * 30))} apagado={0.25} id="osso" />
          <Seta x={540} y={330} t1="LEGUME" t2="OSSO" c2={VERMELHO} k1={k8(f, CORTE(16) + 2)} k2={k8(f, estalo)} />
        </>
      );
    },
  },
  // 21. Grão caindo numa superfície fina, com a onda ao lado
  {
    n: 21, de: CORTE(17), ate: CORTE(18), Cena: ({ f }) => (
      <>
        <Fundo tema="cinema" f={f} />
        <Graos f={f} de={D.eventos.chuva} x={540} y={600} />
        <OndaViva f={f} x={140} y={1290} w={800} h={240} cor={CIANO} id="v21" janela={1.4} ganho={1.4} />
        <Seta x={540} y={300} t1="GRÃO" t2="CHUVA" c2={CIANO} k1={k8(f, CORTE(17) + 2)} k2={k8(f, P(18, "grão") + 10)} />
      </>
    ),
  },
  // 22. Plástico sendo amassado perto de um microfone
  {
    n: 22, de: CORTE(18), ate: P(19, "perto"), Cena: ({ f }) => (
      <>
        <Fundo tema="cinema" f={f} />
        <Plastico f={f} x={430} y={820} aperto={0.5 + 0.5 * Math.sin(f * 0.45)} />
        <Microfone x={880} y={860} ang={-95} semPe s={1.2} />
        <line x1={900} y1={880} x2={1080} y2={900} stroke="#2a2d35" strokeWidth={14} />
        <OndaViva f={f} x={140} y={1290} w={800} h={240} cor="#ff9a3d" id="v22" janela={1.4} ganho={1.3} />
        <Seta x={540} y={300} t1="PLÁSTICO" t2="FOGO" c2="#ff9a3d" k1={k8(f, CORTE(18) + 2)} k2={k8(f, P(19, "plástico") + 8)} />
      </>
    ),
  },
  // 23. Os três objetos lado a lado, com o que viraram
  {
    n: 23, de: P(19, "perto"), ate: CORTE(19), Cena: ({ f }) => (
      <>
        <Fundo tema="cinema" f={f} />
        {[["LEGUME", "OSSO", VERMELHO], ["GRÃO", "CHUVA", CIANO], ["PLÁSTICO", "FOGO", "#ff9a3d"]].map(([a, b, c], i) => (
          <g key={i} opacity={k8(f, P(19, "perto") + i * 3)}>
            <Texto x={190 + i * 350} y={760} t={a} tam={58} />
            <Texto x={190 + i * 350} y={870} t="=" tam={70} cor="#d9c7b0" />
            <Texto x={190 + i * 350} y={990} t={b} tam={76} cor={c} />
          </g>
        ))}
      </>
    ),
  },
  // 24. Tela preta. Letreiro: e o mais estranho de todos
  {
    n: 24, de: CORTE(19), ate: CORTE(20), Cena: ({ f }) => (
      <>
        <Fundo tema="preto" f={f} />
        <Texto y={880} t="E O MAIS ESTRANHO" tam={82} op={k8(f, CORTE(19) + 3)} />
        <Texto y={990} t="DE TODOS" tam={82} cor={AMARELO} op={k8(f, CORTE(19) + 12)} />
      </>
    ),
  },
  // 25. Um feixe de luz genérico acendendo no escuro
  {
    n: 25, de: CORTE(20), ate: CORTE(21), Cena: ({ f }) => (
      <>
        <Fundo tema="preto" f={f} />
        <Feixe x={540} y0={1380} y1={300} k={prog(f, D.eventos.feixe, D.eventos.feixe + 9)} f={f} />
      </>
    ),
  },
  // 26. Projetor antigo girando, a onda saindo dele
  {
    n: 26, de: CORTE(21), ate: P(22, "e o chiado"), Cena: ({ f }) => (
      <>
        <Fundo tema="estudio" f={f} />
        <Projetor f={f} x={470} y={900} />
        <OndaViva f={f} x={140} y={1290} w={800} h={220} cor={CIANO} id="v26" janela={1.2} ganho={0.75} />
        <Etiqueta x={540} y={240} t="MOTOR DE PROJETOR" fundo={CIANO} k={k8(f, P(22, "projetor"))} />
      </>
    ),
  },
  // 27. Televisão de tubo com um microfone chegando perto, a onda saindo
  {
    n: 27, de: P(22, "e o chiado"), ate: CORTE(22), Cena: ({ f }) => {
      const k = suave(prog(f, P(22, "e o chiado"), CORTE(22) - 6));
      return (
        <>
          <Fundo tema="estudio" f={f} />
          <Televisao f={f} x={430} y={800} />
          <g transform={`translate(${(1 - k) * 260} 0)`}>
            <Microfone x={880} y={760} ang={-90} semPe s={1.15} />
            <line x1={900} y1={770} x2={1200} y2={790} stroke="#2a2d35" strokeWidth={14} />
          </g>
          <OndaViva f={f} x={140} y={1290} w={800} h={240} cor={MAGENTA} id="v27" janela={1.2} ganho={1.3} />
          <Etiqueta x={540} y={240} t="TV + MICROFONE PERTO" fundo={MAGENTA} k={k8(f, P(22, "televisão"))} />
        </>
      );
    },
  },
  // 28. As duas ondas se somando numa terceira
  {
    n: 28, de: CORTE(22), ate: CORTE(23), Cena: ({ f }) => {
      const k = prog(f, CORTE(22), CORTE(22) + 10);
      return (
        <>
          <Fundo tema="preto" f={f} />
          <Onda picos={D.projetor} ini={1.0} fim={1.5} x={140} y={360} w={800} h={170} cor={CIANO} id="s1" op={k} />
          <Texto y={540} t="+" tam={90} op={k} />
          <Onda picos={D.tv} ini={1.0} fim={1.5} x={140} y={680} w={800} h={170} cor={MAGENTA} id="s2" op={k} />
          <Texto y={870} t="=" tam={90} op={k} />
          <OndaViva f={f} x={140} y={1040} w={800} h={260} cor="#e9fbff" id="v28" janela={1.2} ganho={1.2} op={k} />
          <Feixe x={170} y0={1320} y1={1320 - 740} k={prog(f, CORTE(22) + 6, CORTE(22) + 16)} f={f} horizontal />
        </>
      );
    },
  },
  // 29. De volta ao painel do plano 1. A regra e a pergunta final
  {
    n: 29, de: CORTE(23), ate: DURACAO + 1, Cena: ({ f }) => {
      const some = 1 - prog(f, T(27), T(27) + 10);
      return (
        <>
          <Fundo tema="jogo" f={f} />
          <Painel rpm={rpmEm(f)} cy={700} />
          <Etiqueta x={540} y={180} t="A REGRA" k={k8(f, T(24))} />
          <g opacity={some}>
            <Texto y={1220} t="VERDADEIRO: SOA ERRADO" tam={62} cor={VERMELHO} op={k8(f, T(25))} />
            <Texto y={1340} t="FALSO: SOA REAL" tam={62} cor={VERDE} op={k8(f, T(26))} />
          </g>
        </>
      );
    },
  },
];
