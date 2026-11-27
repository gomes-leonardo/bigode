// Os 16 planos do Short "todo mundo pulando ao mesmo tempo", presos às falas. O último plano volta ao primeiro (a Terra
// com a turma em volta e a pergunta na tela), com o giro do planeta acertado para o vídeo fechar em loop.
import React from "react";
import {
  AMARELO, AtomoGrande, Balanca, Certo, Contador, E, Estrada, Estrelas, Etiqueta, Fundo, GenteNoGlobo, Globo, Grama, Graos, Medidor,
  MultidaoCima, ORB, Orbita, Planicie, ROUPAS, Rede, Selo, Sismografo, Texto, VERMELHO, X, fmt, pontoOrbita, prog, rnd, saida, suave,
} from "./pecas";
import { CORTE, DURACAO, T, fracDe } from "./tempo";

export type Plano = { n: number; de: number; ate: number; Cena: React.FC<{ f: number }> };
const P = (id: number, trecho: string) => T(id, fracDe(id, trecho));
const k8 = (f: number, de: number) => prog(f, de, de + 8);

// a Terra grande do começo e do fim; o giro (graus por quadro) recomeça no último quadro para casar com o primeiro
const GLOBO = { x: 540, y: 1120, r: 320 };
const LON0 = -48, VEL = 0.22;
// a Terra pequena na órbita: o ângulo em que ela "foge" e a velocidade (anti-horária na tela)
const TH0 = 0.35, VTH = -0.004;

const Gancho: React.FC<{ op?: number }> = ({ op = 1 }) => (
  <g opacity={op}>
    <Texto y={205} t="JÁ IMAGINOU SE" tam={68} />
    <Texto y={310} t="TODO MUNDO PULASSE" tam={74} cor={AMARELO} />
    <Texto y={415} t="AO MESMO TEMPO?" tam={88} cor={AMARELO} />
  </g>
);

/** o plano 1: a Terra girando com a turma de pé em volta; no "pulasse" todo mundo se agacha */
export const Abertura: React.FC<{ f: number }> = ({ f }) => (
  <>
    <Fundo tema="espaco" />
    <Estrelas f={f} />
    <Globo {...GLOBO} lon0={LON0 + VEL * f} id="pl-g1" />
    <GenteNoGlobo {...GLOBO} f={f} agacha={suave(prog(f, E.agacha - 2, E.agacha + 5))} />
    <Gancho />
  </>
);

/** a capa: a turma no ar em volta da Terra e a pergunta curta */
export const CapaCena: React.FC = () => (
  <>
    <Fundo tema="espaco" />
    <Estrelas f={0} />
    <Globo x={540} y={1150} r={320} lon0={LON0} id="pl-capa" />
    <GenteNoGlobo x={540} y={1150} r={320} sobe={95} bracos={1} />
    <Texto y={300} t="TODO MUNDO" tam={122} />
    <Texto y={455} t="PULANDO?" tam={150} cor={AMARELO} />
  </>
);

/** a Terra pequena na órbita (planos 3 e 4): anda, foge pela tangente, trava quando a fita para e depois rebobina */
const fugaDir = (() => {
  const v = [ORB.rx * Math.sin(TH0), -ORB.ry * Math.cos(TH0)];
  const m = Math.hypot(v[0], v[1]);
  return [v[0] / m, v[1] / m];
})();
const fuga = (f: number) => { const d = Math.max(0, Math.min(f, E.para) - E.foge); return 4 * d + 0.12 * d * d; };
const TerraNaOrbita: React.FC<{ f: number; d: number; th: number; rastro?: number }> = ({ f, d, th, rastro = 0 }) => {
  const [ox, oy] = pontoOrbita(th);
  const x = ox + fugaDir[0] * d, y = oy + fugaDir[1] * d;
  return (
    <g>
      {rastro > 0 && [1, 2, 3].map((k) => (
        <circle key={k} cx={x + fugaDir[0] * 40 * k * rastro} cy={y + fugaDir[1] * 40 * k * rastro} r={70} fill="#3f8cf0" opacity={0.18 / k} />
      ))}
      {d > 0 && rastro === 0 && [0, 1, 2, 3].map((k) => {
        const lx = x - fugaDir[0] * (90 + k * 10), ly = y - fugaDir[1] * (90 + k * 10), off = (k - 1.5) * 34;
        const px = -fugaDir[1] * off, py = fugaDir[0] * off, L = Math.min(260, d * 0.6);
        return <path key={k} d={`M${lx + px} ${ly + py} L${lx + px - fugaDir[0] * L} ${ly + py - fugaDir[1] * L}`} stroke="#cfe0ff" strokeWidth={6} strokeLinecap="round" opacity={0.6} />;
      })}
      <Globo x={x} y={y} r={70} lon0={LON0 + VEL * f} id={`pl-gt${Math.round(th * 100)}`} />
    </g>
  );
};

export const PLANOS: Plano[] = [
  // 1. A Terra girando, a turma de pé em volta; a pergunta
  { n: 1, de: 0, ate: CORTE(0), Cena: ({ f }) => <Abertura f={f} /> },
  // 2. A primeira ideia: terremoto. O sismógrafo enlouquece e a tela treme
  {
    n: 2, de: CORTE(0), ate: CORTE(1), Cena: ({ f }) => {
      const de = CORTE(0);
      const forca = suave(prog(f, de, de + 40));
      const dx = 16 * forca * (rnd(f) - 0.5) * 2, dy = 16 * forca * (rnd(f + 99) - 0.5) * 2;
      return (
        <>
          <Fundo tema="lab" />
          <g transform={`translate(${dx.toFixed(1)} ${dy.toFixed(1)})`}>
            <Sismografo f={f} amp={(q) => 3 + 300 * suave((q - de) / 45)} />
          </g>
          <Etiqueta x={540} y={400} t="TERREMOTO?" k={k8(f, P(1, "terremoto") - 3)} tam={84} fundo={VERMELHO} cor="#fff" />
        </>
      );
    },
  },
  // 3. A Terra saindo do lugar: ela larga a órbita pela tangente e some pelo canto... até a fita parar
  {
    n: 3, de: CORTE(1), ate: CORTE(2), Cena: ({ f }) => {
      const tremor = f >= E.para ? 3 * Math.sin(f * 2.7) : 0;
      return (
        <>
          <Fundo tema="espaco" />
          <Estrelas f={f} />
          <Orbita f={f} />
          <g transform={`translate(${tremor} 0)`}>
            <TerraNaOrbita f={Math.min(f, E.para)} d={fuga(f)} th={TH0 + VTH * Math.min(0, f - E.foge)} />
          </g>
          <Texto y={290} t="A TERRA" tam={78} op={k8(f, T(2) - 3)} />
          <Texto y={395} t="SAINDO DO LUGAR?" tam={84} cor={AMARELO} op={k8(f, P(2, "saindo") - 3)} />
        </>
      );
    },
  },
  // 4. Mas não: a fita rebobina, a Terra volta para a órbita e a ideia leva um X
  {
    n: 4, de: CORTE(2), ate: CORTE(3), Cena: ({ f }) => {
      const volta = suave(prog(f, CORTE(2), E.volta));
      const d = fuga(E.para) * (1 - volta);
      return (
        <>
          <Fundo tema="espaco" />
          <Estrelas f={f} />
          <Orbita f={f} />
          <TerraNaOrbita f={f} d={d} th={TH0 + VTH * Math.max(0, f - E.volta)} rastro={volta > 0 && volta < 1 ? 1 : 0} />
          <Texto y={290} t="A TERRA" tam={78} />
          <Texto y={395} t="SAINDO DO LUGAR?" tam={84} cor={AMARELO} />
          <X x={540} y={350} s={1.5} k={k8(f, E.x)} />
        </>
      );
    },
  },
  // 5. Mesmo se os mais de oito bilhões se reunissem num lugar só: pontinhos de todo canto voando para um ponto
  {
    n: 5, de: CORTE(3), ate: P(4, "e pulassem"), Cena: ({ f }) => {
      const [j0, j1] = E.junta;
      const G = [540, 960];
      const N = 70;
      let chegaram = 0;
      const pts = Array.from({ length: N }, (_, i) => {
        const a = rnd(i + 300) * Math.PI * 2, rr = 285 * Math.sqrt(0.2 + 0.8 * rnd(i + 400));
        const x0 = 540 + rr * Math.cos(a), y0 = 1080 + rr * Math.sin(a);
        const parte = j0 + (j1 - j0 - 14) * Math.pow(i / N, 0.8);
        const u = suave(prog(f, parte, parte + 14));
        if (u >= 1) { chegaram++; return null; }
        const cx = (x0 + G[0]) / 2, cy = Math.min(y0, G[1]) - 140;
        const x = (1 - u) ** 2 * x0 + 2 * (1 - u) * u * cx + u * u * G[0], y = (1 - u) ** 2 * y0 + 2 * (1 - u) * u * cy + u * u * G[1];
        return <circle key={i} cx={x} cy={y} r={10} fill={ROUPAS[i % ROUPAS.length]} stroke="#07090f" strokeWidth={3} />;
      });
      const k = chegaram / N;
      const conta = saida(prog(f, CORTE(3) + 2, P(4, "pessoas")));
      return (
        <>
          <Fundo tema="espaco" />
          <Estrelas f={f} />
          <Globo x={540} y={1080} r={300} lon0={LON0 + VEL * f} id="pl-g5" />
          {pts}
          <circle cx={G[0]} cy={G[1]} r={14 + 50 * k} fill={AMARELO} opacity={0.3} />
          <circle cx={G[0]} cy={G[1]} r={7 + 30 * k} fill={AMARELO} stroke="#07090f" strokeWidth={4} />
          <Contador x={540} y={330} texto={fmt(8_000_000_000 * conta) + (conta >= 1 ? "+" : "")} tam={96} w={900} />
          <Texto y={480} t="PESSOAS" tam={60} cor="#bff5d2" />
          <Etiqueta x={540} y={1460} t="NUM LUGAR SÓ" k={k8(f, P(4, "num lugar") - 3)} tam={66} />
        </>
      );
    },
  },
  // 6. ...e pulassem juntas: a multidão sobe; o medidor do movimento da Terra nem sai do zero
  {
    n: 6, de: P(4, "e pulassem"), ate: CORTE(4), Cena: ({ f }) => {
      const sobe = saida(prog(f, E.pulo1, E.pulo1 + 16));
      const agacha = f < E.pulo1 ? prog(f, E.pulo1 - 8, E.pulo1 - 2) : 0;
      const treme = 0.4 * Math.exp(-(((f - E.medidor) / 3) ** 2)) * Math.sin(f * 2);
      return (
        <>
          <Fundo tema="dia" />
          <Planicie f={f} sobe={sobe} agacha={agacha} bracos={sobe} />
          <Medidor x={540} y={640} ang={treme} />
          <Etiqueta x={540} y={330} t="QUASE ZERO" k={k8(f, E.medidor - 2)} tam={76} fundo="#ffffff" />
        </>
      );
    },
  },
  // 7. Ela é mais de dez trilhões de vezes mais pesada que a gente: a balança despenca para o lado da Terra
  {
    n: 7, de: CORTE(4), ate: CORTE(5), Cena: ({ f }) => {
      const u = prog(f, E.balanca - 4, E.balanca + 6);
      const q = f - E.balanca - 6;
      const ang = -24 * saida(u) + (q > 0 ? 3 * Math.exp(-q / 6) * Math.sin(q * 0.9) : 0);
      return (
        <>
          <Fundo tema="balanca" />
          <Estrelas f={f} n={60} />
          <Texto y={235} t="MAIS DE" tam={60} op={k8(f, CORTE(4) + 2)} />
          <Texto y={360} t="10 TRILHÕES" tam={124} cor={AMARELO} op={k8(f, P(5, "dez") - 3)} />
          <Texto y={455} t="DE VEZES MAIS PESADA" tam={56} op={k8(f, P(5, "pesada") - 4)} />
          <Balanca ang={ang} lon0={LON0 + VEL * f} />
          <Texto x={170} y={1330} t="A TERRA" tam={48} op={k8(f, E.balanca)} />
          <Texto x={880} y={1000} t="A GENTE" tam={48} op={k8(f, E.balanca + 4)} />
        </>
      );
    },
  },
  // 8. O chão desceria menos que a largura de um átomo: zoom do tênis no chão até um átomo
  {
    n: 8, de: CORTE(5), ate: CORTE(6), Cena: ({ f }) => {
      const [z0, z1, z2] = E.zoom;
      const camada = (de: number, ate: number, C: React.FC, cx: number, cy: number) => {
        if (f < de - 1 || f > ate + 9) return null;
        const entra = prog(f, de, de + 8), sai = prog(f, ate, ate + 8);
        const s = (0.35 + 0.65 * saida(entra)) * (1 + 0.25 * prog(f, de, ate)) * (1 + 3 * sai * sai);
        return <g opacity={Math.min(entra * 1.5, 1 - sai)} transform={`translate(${cx} ${cy}) scale(${s}) translate(${-cx} ${-cy})`}><C /></g>;
      };
      const atom = prog(f, z2, z2 + 10);
      const final = f >= E.atomo;
      return (
        <>
          <Fundo tema="atomo" />
          {camada(CORTE(5) - 8, z0, Grama, 525, 888)}
          {camada(z0, z1, Graos, 540, 960)}
          {camada(z1, z2, Rede, 540, 960)}
          {atom > 0 && <g opacity={Math.min(1, atom * 1.5)}><AtomoGrande f={f} x={540} y={1000} s={0.35 + 0.65 * saida(atom)} /></g>}
          {final && (
            <g opacity={k8(f, E.atomo)}>
              <path d="M250 1350 L250 1380 L830 1380 L830 1350" stroke="#ffffff" strokeWidth={8} fill="none" />
              <Texto y={1460} t="1 ÁTOMO" tam={60} />
            </g>
          )}
          <Texto y={290} t="O CHÃO DESCE" tam={76} op={k8(f, E.atomo - 2)} />
          <Texto y={400} t="MENOS QUE ISSO" tam={84} cor={AMARELO} op={k8(f, E.atomo + 2)} />
        </>
      );
    },
  },
  // 9. Quando todo mundo caísse: a multidão desce e aterrissa; o medidor continua no zero
  {
    n: 9, de: CORTE(6), ate: P(7, "como se"), Cena: ({ f }) => {
      const u = prog(f, CORTE(6), E.pouso1);
      const pousou = f >= E.pouso1;
      const agacha = pousou ? Math.max(0, 1 - (f - E.pouso1) / 8) : 0;
      const poeira = pousou ? prog(f, E.pouso1, E.pouso1 + 18) : 0;
      return (
        <>
          <Fundo tema="dia" />
          <Planicie f={f} sobe={pousou ? 0 : 1.15 * (1 - u * u)} agacha={agacha} bracos={pousou ? 0 : 0.8} poeira={poeira < 1 ? poeira : 0} />
          <Medidor x={540} y={640} ang={0} />
        </>
      );
    },
  },
  // 10. ...como se nada tivesse acontecido: o mesmo sismógrafo, agora em linha reta. NADA
  {
    n: 10, de: P(7, "como se"), ate: CORTE(7), Cena: ({ f }) => (
      <>
        <Fundo tema="lab" />
        <Sismografo f={f} amp={(q) => 1.5 + 5 * Math.exp(-(((q - E.pouso1) / 3) ** 2))} />
        <Etiqueta x={540} y={400} t="NADA" k={k8(f, E.nada - 2)} tam={92} fundo="#ffffff" />
      </>
    ),
  },
  // 11. O pulo não é o problema: a turma pulando feliz e um "certo"
  {
    n: 11, de: CORTE(7), ate: CORTE(8), Cena: ({ f }) => {
      const sobe = 0.7 * Math.abs(Math.sin((Math.PI * (f - CORTE(7))) / 16));
      return (
        <>
          <Fundo tema="dia" />
          <Planicie f={f} sobe={sobe} bracos={1} />
          <Texto y={300} t="O PULO" tam={110} op={k8(f, CORTE(7) + 2)} />
          <Certo x={540} y={620} s={1.05} k={k8(f, E.check)} />
        </>
      );
    },
  },
  // 12. O problema é o depois: a turma parada, o céu fechando
  {
    n: 12, de: CORTE(8), ate: CORTE(9), Cena: ({ f }) => {
      const tom = suave(prog(f, CORTE(8), E.depois + 6));
      return (
        <>
          <Fundo tema="dia" />
          <g opacity={tom}><Fundo tema="tarde" /></g>
          <Planicie f={f} tom={tom} />
          <Texto y={300} t="O PROBLEMA É" tam={74} op={k8(f, CORTE(8) + 2)} />
          <Etiqueta x={540} y={440} t="O DEPOIS" k={k8(f, E.depois)} tam={100} fundo={VERMELHO} cor="#fff" />
        </>
      );
    },
  },
  // 13. Oito bilhões no mesmo pedaço de chão, sem comida, sem água (a câmera abre devagar)
  {
    n: 13, de: CORTE(9), ate: P(10, "tentando"), Cena: ({ f }) => {
      const de = CORTE(9), ate = P(10, "tentando");
      const z = 1.45 - 0.45 * suave(prog(f, de, ate));
      return (
        <>
          <g transform={`translate(540 1000) scale(${z.toFixed(4)}) translate(-540 -1000)`}><MultidaoCima f={f} /></g>
          <rect width={1080} height={1920} fill="#1a0f2e" opacity={0.3} />
          <Etiqueta x={540} y={300} t="8 BILHÕES" k={k8(f, de + 2)} tam={88} />
          <Texto y={420} t="NO MESMO PEDAÇO DE CHÃO" tam={50} op={k8(f, P(10, "mesmo") - 3)} />
          <Selo x={290} y={830} tipo="comida" k={k8(f, E.x2[0] - 4)} t="SEM COMIDA" />
          <Selo x={790} y={830} tipo="agua" k={k8(f, E.x2[1] - 4)} t="SEM ÁGUA" />
        </>
      );
    },
  },
  // 14. ...tentando voltar pra casa: a estrada entupida até uma casinha lá longe
  {
    n: 14, de: P(10, "tentando"), ate: CORTE(10), Cena: ({ f }) => (
      <>
        <Fundo tema="tarde" />
        <Estrada f={f} de={P(10, "tentando")} />
        <Etiqueta x={540} y={330} t="VOLTAR PRA CASA" k={k8(f, P(10, "tentando") + 2)} tam={70} />
      </>
    ),
  },
  // 15. A Terra segue quieta, na mesma órbita
  {
    n: 15, de: CORTE(10), ate: CORTE(11), Cena: ({ f }) => {
      const [x, y] = pontoOrbita(0.62 + VTH * (f - CORTE(10)));
      return (
        <>
          <Fundo tema="espaco" />
          <Estrelas f={f} />
          <Orbita f={f} />
          <Globo x={x} y={y} r={70} lon0={LON0 + VEL * f} id="pl-g15" />
          <Etiqueta x={540} y={360} t="MESMA ÓRBITA" k={k8(f, P(11, "mesma") - 3)} tam={74} fundo="#ffffff" />
        </>
      );
    },
  },
  // 16. A Terra de novo com a turma: todo mundo pula, cai, e o planeta nem se mexe; a pergunta volta (loop)
  {
    n: 16, de: CORTE(11), ate: DURACAO + 1, Cena: ({ f }) => {
      const q = f - DURACAO; // o tempo do loop: no último quadro, q = -1 (o quadro antes do primeiro)
      const u = prog(f, E.pulo2, E.pouso2);
      const sobe = f >= E.pulo2 && f < E.pouso2 ? 125 * 4 * u * (1 - u) : 0;
      const agacha = f < E.pulo2 ? prog(f, E.pulo2 - 7, E.pulo2 - 1) : f >= E.pouso2 ? Math.max(0, 1 - (f - E.pouso2) / 8) : 0;
      return (
        <>
          <Fundo tema="espaco" />
          <Estrelas f={q} />
          <Globo {...GLOBO} lon0={LON0 + VEL * q} id="pl-g16" />
          <GenteNoGlobo {...GLOBO} f={q} sobe={sobe} agacha={agacha} bracos={sobe > 0 ? 1 : 0} />
          <Gancho op={prog(f, T(12, 1), T(12, 1) + 8)} />
        </>
      );
    },
  },
];
