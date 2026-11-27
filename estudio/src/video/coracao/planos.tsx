// Os 14 planos do Short "o coração que bate 20 vezes por segundo", presos às falas. O último plano termina igual ao
// primeiro quadro do vídeo (coração em borrão e o contador 20/s), para o vídeo fechar em loop.
import React from "react";
import {
  AMARELO, B, BeijaFlor, Bateria, Boneco, Ceu, Contador, Coracao, CorteCoracao, ECG, Etiqueta, FundoDia, Galho, Termometro, Texto, VERMELHO,
  ciclo, pulso, saida, suave,
} from "./pecas";
import { CORTE, DURACAO, T, fracDe } from "./tempo";

export type Plano = { n: number; de: number; ate: number; Cena: React.FC<{ f: number }> };
const prog = (f: number, de: number, ate: number) => Math.min(1, Math.max(0, (f - de) / Math.max(1, ate - de)));
const P = (id: number, trecho: string) => T(id, fracDe(id, trecho));
const k8 = (f: number, de: number) => prog(f, de, de + 8);
const Dessatura: React.FC<{ k: number; children: React.ReactNode; id: string }> = ({ k, children, id }) => (
  <g>
    <defs><filter id={id}><feColorMatrix type="saturate" values={`${1 - 0.85 * k}`} /></filter></defs>
    <g filter={`url(#${id})`}>{children}</g>
  </g>
);

/** o plano 1 (e a capa): coração em borrão, contador 20/s e a pergunta entrando */
export const Abertura: React.FC<{ f: number; texto?: number }> = ({ f, texto }) => {
  const k = texto ?? k8(f, 6);
  return (
    <>
      <FundoDia />
      <Coracao x={540} y={930} s={1.55} borrao={1} />
      <Contador x={540} y={1400} t="20/s" f={f} />
      <g opacity={k} transform={`translate(0 ${(1 - saida(k)) * 30})`}>
        <Texto y={200} t="JÁ IMAGINOU SE" tam={72} />
        <Texto y={300} t="O SEU CORAÇÃO" tam={80} />
        <Texto y={405} t="BATESSE 20 VEZES" tam={80} cor={AMARELO} />
        <Texto y={505} t="POR SEGUNDO?" tam={80} cor={AMARELO} />
      </g>
    </>
  );
};

export const PLANOS: Plano[] = [
  // 1. O coração batendo tão rápido que vira borrão; a pergunta; o contador
  { n: 1, de: 0, ate: CORTE(0), Cena: ({ f }) => <Abertura f={f} /> },
  // 2. Zoom out: o coração está dentro de um beija-flor parado no ar
  {
    n: 2, de: CORTE(0), ate: CORTE(2), Cena: ({ f }) => {
      const z = suave(prog(f, CORTE(0), CORTE(0) + 26));
      const s = 10 * Math.pow(2.3 / 10, z);
      const bx = 540 + 30 * s + (560 - (540 + 30 * 2.3)) * z, by = 930 - 15 * s + (840 - (930 - 15 * 2.3)) * z;
      return (
        <>
          <Ceu noite={0} />
          <BeijaFlor x={bx} y={by} s={s} f={f} />
          <Coracao x={bx - 30 * s} y={by + 15 * s} s={0.16 * s} borrao={1} />
          <Etiqueta x={540} y={1330} t="1.200+ BATIDAS/MIN" k={k8(f, T(2))} tam={56} />
        </>
      );
    },
  },
  // 3. Tela dividida: o beija-flor (eletrocardiograma quase contínuo) e você (calmo)
  {
    n: 3, de: CORTE(2), ate: CORTE(3), Cena: ({ f }) => (
      <>
        <rect width={1080} height={960} fill="#ffe3d4" />
        <rect y={960} width={1080} height={960} fill="#dfe8f5" />
        <BeijaFlor x={290} y={380} s={1.0} f={f} />
        <Texto x={760} y={330} t="BEIJA-FLOR" tam={56} />
        <Texto x={760} y={420} t="≈ 1.200/min" tam={64} cor={AMARELO} />
        <ECG f={f} batidas={[]} denso x={120} y={790} w={840} h={150} cor="#ff3b55" />
        <Boneco x={160} y={1500} s={0.34} />
        <Texto x={620} y={1110} t="VOCÊ ≈ 70/min" tam={70} cor={AMARELO} op={k8(f, T(3))} />
        <ECG f={f} batidas={B.humano} x={330} y={1400} w={640} h={150} cor="#38d97a" />
        <rect y={950} width={1080} height={20} fill="#120a0c" />
      </>
    ),
  },
  // 4. O coração do beija-flor pula para o peito de um boneco; luz de alerta
  {
    n: 4, de: CORTE(3), ate: CORTE(4), Cena: ({ f }) => {
      const de = CORTE(3), k = suave(prog(f, de + 2, de + 20));
      const x = 540, y = 220 + (1000 - 220) * k - Math.sin(k * Math.PI) * 180;
      const alerta = k >= 1 ? 0.5 + 0.5 * Math.sin((f - de) * 0.9) : 0;
      return (
        <>
          <FundoDia />
          <Boneco x={540} y={1540} s={0.95} alerta={alerta} />
          <Coracao x={x} y={y} s={0.42} borrao={1} />
          {k >= 1 && (
            <g transform={`translate(540 300) scale(${0.9 + 0.1 * alerta})`}>
              <path d="M0 -110 L120 100 L-120 100 Z" fill={VERMELHO} stroke="#120a0c" strokeWidth={10} strokeLinejoin="round" />
              <Texto x={0} y={80} t="!" tam={150} />
            </g>
          )}
        </>
      );
    },
  },
  // 5. O coração em corte: as câmaras enchendo devagar entre duas batidas (tempo normal)
  {
    n: 5, de: CORTE(4), ate: CORTE(5), Cena: ({ f }) => {
      const c = ciclo(f, B.normal, 20);
      return (
        <>
          <FundoDia />
          <CorteCoracao x={540} y={760} s={1.6} enche={c.enche} aperta={c.aperta} />
          <Etiqueta x={540} y={240} t="TEMPO PRA ENCHER" fundo="#ffffff" k={k8(f, CORTE(4) + 3)} />
        </>
      );
    },
  },
  // 6. A mesma imagem acelerada: fecha antes de encher
  {
    n: 6, de: CORTE(5), ate: CORTE(6), Cena: ({ f }) => {
      const c = ciclo(f, B.rapido, 20);
      return (
        <>
          <FundoDia />
          <CorteCoracao x={540} y={760} s={1.6} enche={c.enche} aperta={c.aperta} />
          <Etiqueta x={540} y={240} t="BATE VAZIO" fundo={VERMELHO} cor="#ffffff" k={k8(f, P(6, "bate vazio"))} tam={64} />
        </>
      );
    },
  },
  // 7. O sangue que sobe para o cérebro fica fino e some; o cérebro perde a cor
  {
    n: 7, de: CORTE(6), ate: P(7, "e você apaga"), Cena: ({ f }) => {
      const k = prog(f, CORTE(6), P(7, "e você apaga"));
      return (
        <>
          <FundoDia />
          <Boneco x={540} y={1560} s={0.95} cerebro cinzaCerebro={k} />
          {[-60, 0, 60].map((dx, i) => (
            <g key={i} opacity={1 - k}>
              <path d={`M${540 + dx * 0.4} 1000 C${540 + dx} 900 ${540 + dx} 820 ${540 + dx * 0.6} 790`} stroke={VERMELHO} strokeWidth={34 * (1 - k) + 2} fill="none" strokeLinecap="round" strokeDasharray="40 26" strokeDashoffset={(f * 6) % 66} />
            </g>
          ))}
          <Coracao x={540} y={1015} s={0.22} borrao={1} />
        </>
      );
    },
  },
  // 8. O boneco cai para trás; a tela pisca preto
  {
    n: 8, de: P(7, "e você apaga"), ate: CORTE(7), Cena: ({ f }) => {
      const de = P(7, "e você apaga");
      const queda = suave(prog(f, de, de + 12));
      return (
        <>
          <FundoDia />
          <Boneco x={620} y={1560} s={0.95} cerebro cinzaCerebro={1} queda={queda} />
          {f >= de + 13 && <rect width={1080} height={1920} fill="#000" />}
        </>
      );
    },
  },
  // 9. Corte duro: o dia vira noite em um segundo; o beija-flor pousado num galho
  {
    n: 9, de: CORTE(7), ate: CORTE(9), Cena: ({ f }) => {
      const noite = suave(prog(f, CORTE(7), CORTE(7) + 30));
      return (
        <>
          <Ceu noite={noite} />
          <Galho y={1130} escuro={noite} />
          <BeijaFlor x={540} y={1020} s={1.4} f={f} pousado />
        </>
      );
    },
  },
  // 10. A bateria do beija-flor esvaziando
  {
    n: 10, de: CORTE(9), ate: CORTE(10), Cena: ({ f }) => (
      <>
        <Ceu noite={1} />
        <Galho y={1130} escuro={1} />
        <BeijaFlor x={420} y={1020} s={1.2} f={f} pousado />
        <Bateria x={830} y={640} nivel={1 - 0.92 * suave(prog(f, CORTE(9) + 4, CORTE(10) - 4))} />
        <Texto y={230} t="PODERIA MORRER" tam={70} op={k8(f, P(10, "poderia"))} />
        <Texto y={320} t="DE FOME DORMINDO" tam={70} cor={AMARELO} op={k8(f, P(10, "poderia") + 6)} />
      </>
    ),
  },
  // 11. Ele "desliga": as cores somem, o termômetro desce, o coração desacelera
  {
    n: 11, de: CORTE(10), ate: CORTE(11), Cena: ({ f }) => {
      const k = suave(prog(f, CORTE(10), CORTE(11)));
      return (
        <>
          <Dessatura k={k} id="ds11">
            <Ceu noite={1} />
            <Galho y={1130} escuro={1} />
            <BeijaFlor x={420} y={1020} s={1.2} f={f} pousado cinza={k} />
            <Coracao x={250} y={560} s={0.55} pulsa={pulso(f, B.lento)} cinza={k * 0.6} />
          </Dessatura>
          <Termometro x={850} y={700} nivel={0.85 - 0.7 * k} />
        </>
      );
    },
  },
  // 12. O contador rolando de 1.200 para 50, devagar
  {
    n: 12, de: CORTE(11), ate: CORTE(12), Cena: ({ f }) => {
      const v = 1200 - 1150 * suave(prog(f, CORTE(11) + 4, CORTE(12) - 20));
      return (
        <>
          <Dessatura k={1} id="ds12">
            <Ceu noite={1} />
            <Galho y={1130} escuro={1} />
            <BeijaFlor x={420} y={1020} s={1.2} f={f} pousado cinza={1} />
          </Dessatura>
          <Coracao x={540} y={1300} s={0.5} pulsa={pulso(f, B.lento)} cinza={0.5} />
          <Texto y={560} t={Math.round(v).toLocaleString("pt-BR")} tam={210} cor={AMARELO} />
          <Texto y={660} t="BATIDAS POR MINUTO" tam={50} />
          <Etiqueta x={540} y={260} t="≈ 50/MIN" k={k8(f, CORTE(12) - 24)} tam={60} />
        </>
      );
    },
  },
  // 13. Amanhece: o passarinho treme, as cores voltam, o termômetro sobe
  {
    n: 13, de: CORTE(12), ate: P(13, "e acelera"), Cena: ({ f }) => {
      const de = CORTE(12), a = suave(prog(f, de, de + 40));
      const treme = prog(f, P(13, "treme") - 4, P(13, "treme") + 6) * (1 - prog(f, P(13, "esquenta") + 10, P(13, "esquenta") + 20));
      return (
        <>
          <Dessatura k={1 - a} id="ds13">
            <Ceu noite={1} aurora={a} />
            <Galho y={1130} escuro={1 - 0.6 * a} />
            <BeijaFlor x={420} y={1020} s={1.2} f={f} pousado treme={treme} cinza={1 - a} />
          </Dessatura>
          <Termometro x={850} y={700} nivel={0.15 + 0.7 * suave(prog(f, P(13, "esquenta") - 6, P(13, "e acelera")))} />
        </>
      );
    },
  },
  // 14. O coração acelera até virar o borrão do plano 1 (mesmo enquadramento, mesmo contador): o loop
  {
    n: 14, de: P(13, "e acelera"), ate: DURACAO + 1, Cena: ({ f }) => {
      const de = P(13, "e acelera");
      const b = suave(prog(f, de + 10, de + 46));
      return (
        <>
          <FundoDia />
          <Coracao x={540} y={930} s={1.55} borrao={b} pulsa={b < 1 ? pulso(f, B.batidas) : 0} />
          <g opacity={prog(f, de + 30, de + 46)}><Contador x={540} y={1400} t="20/s" f={f} /></g>
        </>
      );
    },
  },
];
