// Os 14 planos do Short "o país que para sem Pix", presos às falas. O último plano repete o enquadramento e o texto
// do primeiro, com a barrinha de sinal em zero, para o vídeo fechar em loop.
import React from "react";
import {
  AMARELO, AppBanco, Barra, Calendario, Celular, Contador, Cozinha, E, Etiqueta, Fundo, Gancho, MapaBR, Maquininha, Moto, Nota50, Pao, Praia,
  Prateleiras, QR, Rosto, Texto, VERMELHO, X, fmt, saida, suave,
} from "./pecas";
import { CORTE, DURACAO, T, fracDe } from "./tempo";

export type Plano = { n: number; de: number; ate: number; Cena: React.FC<{ f: number }> };
const prog = (f: number, de: number, ate: number) => Math.min(1, Math.max(0, (f - de) / Math.max(1, ate - de)));
const P = (id: number, trecho: string) => T(id, fracDe(id, trecho));
const k8 = (f: number, de: number) => prog(f, de, de + 8);

// o celular do começo: no meio da tela, abaixo da pergunta
const CEL = { x: 540, y: 1090, s: 1.08 };

const Notificacao: React.FC<{ f: number; q: number; i: number }> = ({ f, q, i }) => {
  const k = prog(f, q, q + 6) * (1 - prog(f, q + 22, q + 30));
  if (k <= 0) return null;
  return (
    <g transform={`translate(540 ${770 + i * 8 - 40 * (1 - saida(k))})`} opacity={k}>
      <rect x={-180} y={-52} width={360} height={104} rx={24} fill="#ffffff" stroke="#c7ccd4" strokeWidth={4} />
      <circle cx={-128} cy={0} r={27} fill={["#33d17a", "#38bdf8", "#f472b6"][i % 3]} />
      <rect x={-86} y={-25} width={205} height={17} rx={8} fill="#2b2f39" />
      <rect x={-86} y={8} width={145} height={15} rx={7} fill="#9aa0a8" />
    </g>
  );
};

/** o plano 1 (e a capa, já sem sinal e meio apagada): o celular perdendo o sinal; a pergunta */
export const Abertura: React.FC<{ f: number; morto?: boolean; capa?: boolean }> = ({ f, morto = false, capa = false }) => {
  const sinal = morto || capa ? 0 : Math.max(0, Math.ceil(4 * (1 - prog(f, 8, E.morre + 6))));
  const cinza = capa ? 0.35 : morto ? 1 : prog(f, E.morre - 6, E.morre + 14);
  return (
    <>
      <Fundo tema="rede" cinza={cinza} />
      <Celular {...CEL} sinal={sinal} cinza={cinza} f={f} />
      {!morto && !capa && E.notif.map((q, i) => <Notificacao key={i} f={f} q={q} i={i} />)}
      <Gancho />
    </>
  );
};

/** o plano 10: a padaria. O cliente encosta o celular na maquininha, ela falha com o beep, os dois se olham no meio
 *  segundo de silêncio (a câmera chega um pouco mais perto) e o saquinho de pão fica no balcão */
const Padaria: React.FC<{ f: number; de: number }> = ({ f, de }) => {
  const chega = suave(prog(f, de + 3, E.beep - 5));
  const falhou = f >= E.beep;
  const recua = suave(prog(f, E.beep + 6, E.beep + 16));
  const olham = suave(prog(f, E.beep + 5, E.beep + 12));
  const z = 1 + 0.08 * suave(prog(f, E.beep + 2, E.silencio[1]));
  // a mão com o celular: sai do ombro do cliente e encosta na maquininha
  const ombro = { x: 360, y: 1560 };
  const alvo = { x: 585 - 70 * recua, y: 1000 + 50 * recua };
  const mao = { x: 400 + (alvo.x - 400) * chega, y: 1330 + (alvo.y - 1330) * chega };
  const brilho = falhou ? 1 - prog(f, E.beep, E.beep + 14) : 0;
  return (
    <g transform={`translate(540 1080) scale(${z}) translate(-540 -1080)`}>
      <Fundo tema="padaria" />
      <Prateleiras />
      <Rosto x={870} y={810} s={1.25} olhar={falhou ? -0.4 - 0.6 * olham : -0.4} roupa="#f3f1ea" cabelo="#5a3a22" pele="#c98f6a" touca boca={falhou ? "reta" : "sorriso"} sobe={olham} />
      {/* o balcão */}
      <rect x={0} y={1120} width={1080} height={800} fill="#8a5a2a" />
      {Array.from({ length: 6 }, (_, i) => <path key={i} d={`M${90 + i * 180} 1150 L${90 + i * 180} 1920`} stroke="#734a22" strokeWidth={6} />)}
      <rect x={0} y={1096} width={1080} height={40} fill="#c58b4f" stroke="#6b4a2a" strokeWidth={4} />
      <Pao x={390} y={1004} s={0.95} />
      {brilho > 0 && <circle cx={650} cy={920} r={70 + 170 * (1 - brilho)} fill={VERMELHO} opacity={0.45 * brilho} />}
      <Maquininha x={650} y={985} s={0.7} erro={falhou ? 1 : 0} />
      {/* o cliente, de frente para o balcão, e o braço com o celular */}
      <path d={`M${ombro.x} ${ombro.y} Q${(ombro.x + mao.x) / 2 + 40} ${(ombro.y + mao.y) / 2 + 60} ${mao.x} ${mao.y}`} stroke="#3c6fd6" strokeWidth={70} fill="none" strokeLinecap="round" />
      <g transform={`translate(${mao.x} ${mao.y}) rotate(${-25 + 15 * chega})`}>
        <Celular x={0} y={-40} s={0.2} sinal={0} cinza={1} />
        <circle cx={0} cy={30} r={42} fill="#e7b48e" stroke="#07090f" strokeWidth={5} />
      </g>
      <Rosto x={230} y={1440} s={1.55} olhar={falhou ? 0.4 + 0.6 * olham : 0.4} boca={falhou ? "reta" : "sorriso"} sobe={olham} />
    </g>
  );
};

export const PLANOS: Plano[] = [
  // 1. O celular no centro, a barrinha de sinal caindo até zero, a tela ficando cinza; a pergunta
  { n: 1, de: 0, ate: CORTE(0), Cena: ({ f }) => <Abertura f={f} /> },
  // 2. O mesmo celular tenta abrir mensagem, mapa e vídeo: cada um leva um X. TÉDIO
  {
    n: 2, de: CORTE(0), ate: CORTE(2), Cena: ({ f }) => {
      const qual = f >= E.x1[2] - 4 ? 2 : f >= E.x1[1] - 4 ? 1 : 0;
      return (
        <>
          <Fundo tema="rede" cinza={1} />
          <Celular {...CEL} sinal={0} tela="abre" abre={qual} />
          <X x={CEL.x} y={CEL.y - 40 * CEL.s} s={1.5} k={k8(f, E.x1[qual])} />
          <Etiqueta x={540} y={330} t="TÉDIO" k={k8(f, P(1, "tédio"))} tam={92} fundo="#ffffff" />
        </>
      );
    },
  },
  // 3. Corte seco, o fundo muda de cor: uma nota de 50 pula para a frente do celular
  {
    n: 3, de: CORTE(2), ate: CORTE(3), Cena: ({ f }) => {
      const k = prog(f, CORTE(2) + 2, CORTE(2) + 12);
      const s = 0.5 + 0.6 * saida(k) - 0.08 * Math.sin(k * Math.PI);
      return (
        <>
          <Fundo tema="dinheiro" />
          <g opacity={0.5}><Celular x={540} y={1090} s={0.9} sinal={0} cinza={1} /></g>
          <Nota50 x={540} y={1080} s={s * 1.25} r={-8 + 8 * saida(k)} />
          <Texto y={300} t="O PROBLEMA" tam={78} op={k8(f, P(3, "problema"))} />
          <Texto y={400} t="É O DINHEIRO" tam={88} cor={AMARELO} op={k8(f, P(3, "dinheiro"))} />
        </>
      );
    },
  },
  // 4. A tela com um QR; a conexão cai e o QR vira poeira
  {
    n: 4, de: CORTE(3), ate: CORTE(4), Cena: ({ f }) => (
      <>
        <Fundo tema="dinheiro" />
        <Celular x={540} y={1100} s={1.05} sinal={f >= E.qr - 4 ? 0 : 3} tela="qr" qrPoeira={prog(f, E.qr, E.qr + 26)} f={f} />
        <Texto y={290} t="PIX PRECISA" tam={78} op={k8(f, CORTE(3) + 3)} />
        <Texto y={390} t="DE CONEXÃO" tam={84} cor={AMARELO} op={k8(f, P(4, "conexão") - 4)} />
      </>
    ),
  },
  // 5. O contador de caixa disparando: 313 milhões de transações num dia recorde
  {
    n: 5, de: CORTE(4), ate: CORTE(5), Cena: ({ f }) => {
      const k = saida(prog(f, CORTE(4) + 2, P(5, "transações")));
      return (
        <>
          <Fundo tema="dinheiro" />
          <Etiqueta x={540} y={700} t="1 DIA RECORDE" k={k8(f, P(5, "recorde") - 4)} tam={68} />
          <Contador x={540} y={1010} texto={fmt(313_000_000 * k) + (k >= 1 ? "+" : "")} tam={118} />
          <Texto y={1250} t="TRANSAÇÕES" tam={64} cor="#bff5d2" />
        </>
      );
    },
  },
  // 6. O contador "dá zoom" e vira o ano: 80 bilhões; embaixo, a pilha de blocos: R$ 35 TRI
  {
    n: 6, de: CORTE(5), ate: CORTE(7), Cena: ({ f }) => {
      const k = saida(prog(f, CORTE(5) + 2, P(6, "oitenta") + 8));
      const z = 1 + 0.12 * Math.sin(prog(f, CORTE(5), CORTE(5) + 10) * Math.PI);
      const pilha = prog(f, T(7) - 4, T(7) + 18);
      const blocos = [[-145, 0], [0, 0], [145, 0], [-72, 1], [72, 1], [0, 2]];
      return (
        <>
          <Fundo tema="dinheiro" />
          <g transform={`translate(540 560) scale(${z}) translate(-540 -560)`}>
            <Contador x={540} y={560} texto={k >= 1 ? "80 BILHÕES" : fmt(313_000_000 + (80_000_000_000 - 313_000_000) * k)} tam={k >= 1 ? 120 : 96} />
          </g>
          <Texto y={760} t="TRANSAÇÕES NO ANO" tam={52} cor="#bff5d2" />
          {blocos.map(([dx, fila], i) => {
            const q = prog(pilha, i / 9, i / 9 + 0.35);
            return <rect key={i} x={540 + dx - 65} y={1300 - fila * 95 - (1 - saida(q)) * 300} width={130} height={80} rx={10} fill="#f2c14e" stroke="#7a5a12" strokeWidth={6} opacity={Math.min(1, q * 2)} />;
          })}
          <Texto y={1500} t="R$ 35 TRI" tam={110} cor={AMARELO} op={k8(f, P(7, "trinta"))} />
        </>
      );
    },
  },
  // 7. Três meses no calendário; a barra de reais em movimento enche até quase o topo
  {
    n: 7, de: CORTE(7), ate: CORTE(8), Cena: ({ f }) => {
      const k = suave(prog(f, CORTE(7) + 2, CORTE(8) - 6));
      return (
        <>
          <Fundo tema="dinheiro" />
          <Texto y={250} t="EM 3 MESES" tam={66} op={k8(f, CORTE(7) + 2)} />
          <Texto y={375} t="≈ R$ 9 TRI" tam={118} cor={AMARELO} op={k8(f, P(8, "nove") - 2)} />
          <Calendario x={300} y={900} s={1.0} riscos={Math.floor(k * 3.2)} dias={Math.round(90 * k)} />
          <Barra x={800} y={1400} h={860} nivel={0.93 * k} />
          <Texto x={800} y={1480} t="REAIS EM MOVIMENTO" tam={34} cor="#bff5d2" />
        </>
      );
    },
  },
  // 8. A barra trava, racha e desaba; o QR aparece de novo, apagado. A RODA PARA
  {
    n: 8, de: CORTE(8), ate: CORTE(9), Cena: ({ f }) => {
      const cai = suave(prog(f, E.corte + 8, E.corte + 30));
      return (
        <>
          <Fundo tema="dinheiro" />
          <g opacity={prog(f, E.corte, E.corte + 16)}><Fundo tema="escuro" /></g>
          <Barra x={800} y={1400} h={860} nivel={0.93} racha={prog(f, E.corte - 2, E.corte + 6)} cai={cai} />
          <Texto x={800} y={1480} t="REAIS EM MOVIMENTO" tam={34} cor="#bff5d2" op={1 - cai} />
          <g opacity={prog(f, E.corte + 10, E.corte + 20)}>
            <rect x={90} y={830} width={340} height={340} rx={20} fill="#e9eef3" />
            <QR x={260} y={1000} lado={290} apagado={1} />
          </g>
          <Etiqueta x={540} y={330} t="A RODA PARA" k={k8(f, P(9, "roda para"))} tam={76} fundo="#ffffff" />
        </>
      );
    },
  },
  // 9. Máquina de cartão, app de banco, entrega: um X atrás do outro
  {
    n: 9, de: CORTE(9), ate: P(11, "muita coisa"), Cena: ({ f }) => (
      <>
        <Fundo tema="escuro" />
        <Maquininha x={190} y={960} s={0.9} />
        <AppBanco x={540} y={960} s={0.9} />
        <Moto x={880} y={985} s={0.85} />
        {["CARTÃO", "BANCO", "ENTREGA"].map((t, i) => <Texto key={t} x={[190, 540, 880][i]} y={1250} t={t} tam={46} />)}
        {E.x2.map((q, i) => <X key={i} x={[190, 540, 880][i]} y={970} s={1.3} k={k8(f, q)} />)}
        <Etiqueta x={540} y={420} t="NÃO É SÓ O PIX" k={k8(f, CORTE(9) + 2)} tam={64} fundo="#ffffff" />
      </>
    ),
  },
  // 10. A padaria: o cliente encosta o celular, a maquininha falha (beep feio), os dois se olham no meio segundo de
  // silêncio; o pão fica no balcão. O corte para o mapa vem quando o silêncio acaba
  { n: 10, de: P(11, "muita coisa"), ate: E.silencio[1], Cena: ({ f }) => <Padaria f={f} de={P(11, "muita coisa")} /> },
  // 11. O mapa do Brasil desligando em manchas; o contador em dólares de um dia
  {
    n: 11, de: E.silencio[1], ate: CORTE(12), Cena: ({ f }) => {
      const k = saida(prog(f, E.silencio[1] + 2, P(12, "dólares") + 6));
      return (
        <>
          <Fundo tema="mapa" />
          <MapaBR x={540} y={860} k={20.5} apaga={prog(f, E.silencio[1], CORTE(12) - 4)} f={f} />
          <Etiqueta x={540} y={300} t="1 DIA" k={k8(f, E.silencio[1] + 2)} tam={70} />
          <Contador x={540} y={1430} texto={`US$ ${Math.round(340 * k)} MI`} tam={110} w={760} cor={AMARELO} />
        </>
      );
    },
  },
  // 12. A cadeira de praia e um celular virado para baixo, riscado. NÃO É FÉRIAS DA TELA
  {
    n: 12, de: CORTE(12), ate: CORTE(13), Cena: ({ f }) => (
      <>
        <Fundo tema="praia" />
        <Praia f={f} />
        <g transform="translate(640 1430) rotate(80)"><Celular x={0} y={0} s={0.3} sinal={0} virado /></g>
        <X x={640} y={1430} s={1.2} k={k8(f, P(13, "não é") - 2)} />
        <Texto y={300} t="NÃO É FÉRIAS" tam={84} cor="#ffffff" op={k8(f, P(13, "não é") - 4)} />
        <Texto y={400} t="DA TELA" tam={84} cor={AMARELO} op={k8(f, P(13, "não é"))} />
      </>
    ),
  },
  // 13. O celular do começo numa mesa de cozinha, tela preta; no calendário da parede, três riscos virando noventa dias
  {
    n: 13, de: CORTE(13), ate: T(14, 0.8), Cena: ({ f }) => {
      const k = suave(prog(f, CORTE(13) + 2, T(14, 0.75)));
      return (
        <>
          <Fundo tema="cozinha" />
          <Cozinha />
          <Calendario x={540} y={480} s={1.15} riscos={Math.floor(k * 3.2)} dias={Math.round(90 * k)} />
          <Celular x={540} y={1010} s={0.5} sinal={0} tela="preta" />
        </>
      );
    },
  },
  // 14. O enquadramento do plano 1, o mesmo texto, a barrinha em zero (loop)
  { n: 14, de: T(14, 0.8), ate: DURACAO + 1, Cena: ({ f }) => <Abertura f={f} morto /> },
];
