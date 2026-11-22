// Capítulo 1 (falas 0 a 24): a abertura. Loja, "Bip. Aprovado.", Lamborghini e motorista, o caixa encarando o recibo,
// a vida normal de quem tem 15 anos, o trabalhador que paga as contas, a loteria e a pergunta do título.
import React from "react";
import { Person, maoInfo, type P, type PersonProps } from "../../components/Person";
import { expressaoNoQuadro } from "../../components/Face";
import { idle, shrug, walk, crossArms } from "../../rig/actions";
import { alcance, cai, paraLocal } from "../../rig/manuseio";
import { ObjetoNaMao, ObjetoNoMundo, BOLA } from "../../objects/objetos";
import { BILHETE, CAIXA, CAIXA_TENIS, CARRO_ESPORTIVO, CARTAO, CEDULA, COFRINHO, CORTADOR, MAQUININHA, MOEDA, RECIBO, SACO } from "../../objects/extras";
import { apoioEm, emPe } from "../../cenarios/ancoras";
import { LOJA } from "../../cenarios/loja/Loja";
import { RUA } from "../../cenarios/rua/Rua";
import { liso } from "../../cenarios/liso/Liso";
import { ATENDENTE, IRMA, MOTORISTA, PROTAGONISTA, figurante } from "../../elenco/elenco";
import { emPeNa, olhar, props } from "../../fase4/Cenarios";
import { Aprovado, Contador, Estrela, IconeCarro, IconeCasa, IconeEnvelope, IconeGuardaSol, IconePrato, Infinito, Painel, Selo, Texto, TextoPop } from "../graficos";
import { CenaCam, entre, falando, fracDe, naTela, type PlanoV } from "./comum";
import { CORTE, T } from "./tempo";

const LOJA_S = LOJA.set;
const lim = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));

// ------------------------------------------------------------------ 1. "Você passa o seu cartão. Bip. Aprovado. É sempre aprovado."
const MAQ: P = apoioEm(LOJA_S, "balcao", 1150);
const telaMaq = (f: number, bip: number, ok: number) => (f >= ok ? "aprovado" : f >= bip ? "bip" : "nada") as "nada" | "bip" | "aprovado";
const atendenteAtras = (f: number, x = 1000): PersonProps => ({ ...emPeNa(ATENDENTE, LOJA_S, "chao_balcao", x, f + 11) });

const p1: PlanoV = {
  nome: "loja: passa o cartão", de: 0, ate: CORTE(3), enquadra: { x: 1170, y: 590, zoom: 1.5 },
  eventos: [
    { f: 4, tipo: "objeto", desc: "passa o cartão na maquininha", verbo: "passar" },
    { f: T(1), tipo: "objeto", desc: "bip, aprovado" },
  ],
  Cena: ({ f, cam }) => {
    const base = emPe(LOJA_S, "chao", 1330);
    const descanso: P = [-48, -178];
    const toque = paraLocal([MAQ[0] + 30, 640], base.x, base.y, base.scale);
    let mao = alcance(f, 3, T(0, 0.6), descanso, toque, 26);
    if (f > T(2, 1)) mao = [toque[0] + (descanso[0] - toque[0]) * entre(f, T(2, 1), T(3, 0.6)), toque[1] + (descanso[1] - toque[1]) * entre(f, T(2, 1), T(3, 0.6))];
    const prot: PersonProps = { ...props(PROTAGONISTA), ...idle(base)(f), handL: mao, gripL: "fist", expr: expressaoNoQuadro([[0, "sigma"], [T(2), "convencido"]], f, 6) };
    prot.lookAt = olhar(prot, [MAQ[0], 650]);
    const m = maoInfo(prot, "L");
    const at = atendenteAtras(f);
    at.lookAt = olhar(at, [MAQ[0], 660]);
    return (
      <CenaCam cenario={LOJA} f={f} cam={cam}
        noMeio={<Person {...at} semente={5} />}
        naFrente={<>
          <ObjetoNoMundo def={MAQUININHA} em={MAQ} s={LOJA_S.escala} e={{ t: f / 30, tela: telaMaq(f, T(1), T(2)) }} />
          <Person {...prot} semente={1} propsHands={<ObjetoNaMao def={CARTAO} mao={m.pos} ang={-14} e={{ t: f / 30, brilho: lim((f - T(2)) / 10) }} />} />
        </>}
      />
    );
  },
  Sobre: ({ f }) => (
    <>
      <Estrela x={760} y={520} f={f} de={T(1)} ate={T(3)} texto="BIP!" r={95} />
      <Aprovado x={470} y={150} f={f} de={T(2)} ate={CORTE(3)} />
    </>
  ),
};

// ------------------------------------------------------------------ 2. "Você compra todos os pares de tênis da loja. Todos os 312 pares. Bip. Aprovado."
const CORES_CAIXA = ["#E0822E", "#5AA5B8", "#C0504D", "#7AA35B", "#8E7CC3", "#F2D16B", "#3A3F4B"];
const Pilha: React.FC<{ x: number; y: number; n: number; s: number; semente: number }> = ({ x, y, n, s, semente }) => (
  <g>
    {Array.from({ length: n }, (_, i) => {
      const col = i % 4, lin = Math.floor(i / 4);
      const dx = (col - 1.5) * 92 + ((lin % 2) * 18 - 9), dy = -lin * 44;
      return (
        <g key={i} transform={`translate(${x + dx * s / 1.35} ${y + dy * s / 1.35}) scale(${s}) rotate(${((i * 37 + semente) % 7) - 3})`}>
          <CAIXA_TENIS.Desenho t={0} cor={CORES_CAIXA[(i + semente) % CORES_CAIXA.length]} />
        </g>
      );
    })}
  </g>
);
const p2: PlanoV = {
  nome: "loja: compra todos os pares", de: CORTE(3), ate: CORTE(7), enquadra: { x: 960, y: 560, zoom: 1.02 },
  eventos: [
    { f: CORTE(3), tipo: "corte", desc: "loja inteira" },
    { f: T(4, 0.15), tipo: "objeto", desc: "caixas de tênis empilhando", verbo: "comprar" },
    { f: T(5), tipo: "objeto", desc: "contador 312 pares" },
    { f: T(6), tipo: "objeto", desc: "bip, aprovado" },
  ],
  Cena: ({ f, cam }) => {
    const k = entre(f, T(4, 0.1), T(5, 1));
    const at: PersonProps = { ...atendenteAtras(f, 980), expr: "chocado", handL: [-60, -200], handR: [60, -200], gripL: "open", gripR: "open", ombros: 6 };
    at.lookAt = olhar(at, [300, 700]);
    const prot: PersonProps = { ...props(PROTAGONISTA), ...crossArms(emPe(LOJA_S, "chao", 1500))(f), expr: "convencido" };
    prot.lookAt = olhar(prot, [400, 700]);
    return (
      <CenaCam cenario={LOJA} f={f} cam={cam}
        noMeio={<>
          <Person {...at} semente={5} />
          <Pilha x={330} y={950} n={Math.round(2 + 30 * k)} s={1.35} semente={1} />
        </>}
        naFrente={<>
          <Pilha x={760} y={760} n={Math.round(1 + 10 * k)} s={1.2} semente={4} />
          <Person {...prot} semente={1} />
        </>}
      />
    );
  },
  Sobre: ({ f }) => (
    <>
      <Contador x={960} y={190} f={f} de={T(5)} ate={T(5, 0.9)} fim={CORTE(7)} valor={312} sufixo=" PARES" tam={110} cor="#F2D16B" />
      <Estrela x={1560} y={330} f={f} de={T(6)} ate={CORTE(7)} texto="BIP!" r={90} />
      <Aprovado x={1500} y={470} f={f} de={T(7)} ate={CORTE(7)} />
    </>
  ),
};

// ------------------------------------------------------------------ 3. Lamborghini, 15 anos, não sabe dirigir, motorista. Bip. Aprovado.
const RUA_S = RUA.set;
const CARRO_X = 1180, CARRO_Y = 944;
const p3: PlanoV = {
  nome: "rua: a lamborghini", de: CORTE(7), ate: CORTE(13), enquadra: { x: 930, y: 660, zoom: 1.3 }, viagem: { x: 60 },
  eventos: [
    { f: CORTE(7), tipo: "corte", desc: "rua" },
    { f: T(8, 0.1), tipo: "objeto", desc: "o carro entra", verbo: "comprar" },
    { f: T(9), tipo: "objeto", desc: "15 anos" },
    { f: T(10), tipo: "expressao", desc: "não sabe dirigir: confuso" },
    { f: T(11, 0.2), tipo: "pose", desc: "o motorista chega" },
    { f: T(12), tipo: "objeto", desc: "bip, aprovado" },
  ],
  Cena: ({ f, cam }) => {
    const chega = entre(f, T(8, 0), T(8, 1));
    const cx = CARRO_X + (1 - chega) * 1100;
    const prot: PersonProps = { ...props(PROTAGONISTA), ...idle(emPe(RUA_S, "chao", 560))(f), expr: expressaoNoQuadro([[0, "convencido"], [T(10), "olhar-lateral"], [T(11, 0.6), "convencido"]], f, 6) };
    prot.lookAt = olhar(prot, [cx, 800]);
    if (f >= T(10) && f < T(11, 0.5)) prot.ombros = 8 * entre(f, T(10), T(10, 0.5));
    const anda = walk({ ...emPe(RUA_S, "chao", 2050), xa: 2050, xb: 1640, f0: T(11, 0.05), quadros: 6 });
    const mot: PersonProps = { ...props(MOTORISTA), ...(f < anda.fim ? anda(f) : idle(emPe(RUA_S, "chao", 1640))(f)), expr: "neutro" };
    mot.lookAt = olhar(mot, [prot.x, 600]);
    const figs = [[21, 300]].map(([sem, x]) => <Person key={sem} {...emPeNa(figurante(sem), RUA_S, "chao", x, f + sem, {}, 1)} semente={sem} />);
    return (
      <CenaCam cenario={RUA} f={f} cam={cam}
        noMeio={<>
          {figs}
          <g transform={`translate(${cx} ${CARRO_Y}) scale(${RUA_S.escala * 1.5})`}><CARRO_ESPORTIVO.Desenho t={0} /></g>
          <Person {...prot} semente={1} />
          {f >= T(11) && <Person {...mot} semente={9} />}
        </>}
      />
    );
  },
  Sobre: ({ f }) => (
    <>
      <TextoPop x={480} y={250} f={f} de={T(9)} ate={T(11)} texto="15 ANOS" tam={88} cor="#F2D16B" rot={-6} />
      <TextoPop x={640} y={330} f={f} de={T(10)} ate={T(11, 0.6)} texto="?" tam={140} />
      <Estrela x={1640} y={190} f={f} de={T(12)} ate={CORTE(13)} texto="BIP!" r={90} />
      <Aprovado x={1480} y={330} f={f} de={T(13)} ate={CORTE(13)} />
    </>
  ),
};

// ------------------------------------------------------------------ 4. O caixa encara o recibo, olha para você. "Quem é você?" / "Honestamente..."
const ROSTO_ATENDENTE: P = [980, 905 - 330 * 1.35];
const p4: PlanoV = {
  nome: "loja: o recibo", de: CORTE(13), ate: CORTE(17), enquadra: { x: 1100, y: 600, zoom: 1.4 },
  reacoes: [{ em: T(15, 0.05), alvo: ROSTO_ATENDENTE, solta: T(17) }],
  eventos: [
    { f: CORTE(13), tipo: "corte", desc: "volta à loja" },
    { f: T(14, 0.1), tipo: "objeto", desc: "o recibo desenrola" },
    { f: T(15, 0.05), tipo: "camera", desc: "ele olha para você: zoom de reação", verbo: "olhar" },
    { f: T(16), tipo: "pose", desc: "quem é você?" },
    { f: T(17, 0.1), tipo: "pose", desc: "dá de ombros" },
  ],
  Cena: ({ f, cam }) => {
    const at: PersonProps = { ...atendenteAtras(f, 980), handR: [40, -250], gripR: "fist", handL: [-30, -230], gripL: "fist", expr: f < T(16) ? "chocado" : "neutro", fala: falando(f, T(16), T(16, 1)) };
    const mR = maoInfo(at, "R");
    const recW: P = [at.x + mR.pos[0] * 1.35, at.y + mR.pos[1] * 1.35];
    at.lookAt = f < T(15) ? olhar(at, [recW[0], recW[1] + 120]) : olhar(at, [1480, 520]);
    at.headTilt = f < T(15) ? 4 : -4 * entre(f, T(15), T(15, 0.4));
    const base = emPe(LOJA_S, "chao", 1480);
    const prot: PersonProps = f >= T(17) ? { ...props(PROTAGONISTA), ...shrug(base)(f - T(17)), expr: "olhar-lateral" } : { ...props(PROTAGONISTA), ...idle(base)(f), expr: "sigma" };
    prot.lookAt = olhar(prot, [980, 470]);
    const comp = 60 + 300 * entre(f, T(14, 0), T(14, 1));
    return (
      <CenaCam cenario={LOJA} f={f} cam={cam}
        noMeio={<Person {...at} semente={5} propsHands={<ObjetoNaMao def={RECIBO} mao={mR.pos} ang={0} e={{ t: f / 30, comprimento: comp }} />} />}
        naFrente={<>
          <ObjetoNoMundo def={MAQUININHA} em={MAQ} s={1.35} e={{ t: f / 30, tela: "aprovado" }} />
          <Person {...prot} semente={1} />
        </>}
      />
    );
  },
};

// ------------------------------------------------------------------ 5. Um jovem de 15 anos normal... cortando grama, cuidando de crianças, mercadinho.
const LISO_A = liso("#BFD8E8");
const Grama: React.FC<{ f: number; de: number }> = ({ f, de }) => {
  const t = (f - de) / 30;
  const prot: PersonProps = { ...props(PROTAGONISTA), ...walk({ x: 180, y: 520, scale: 0.6, xa: 170, xb: 260, f0: de, quadros: 8 })(f), expr: "neutro", handR: [150, -150], gripR: "fist", handL: [130, -140], gripL: "fist" };
  const mR = maoInfo(prot, "R");
  return (
    <g>
      <rect x={0} y={0} width={520} height={330} fill="#BFDDEA" />
      <rect x={0} y={330} width={520} height={300} fill="#8DBA6A" />
      {Array.from({ length: 8 }, (_, i) => <path key={i} d={`M ${40 + i * 62} 600 q 6 -24 12 0`} stroke="#5E9A4E" strokeWidth={5} fill="none" />)}
      <Person {...prot} semente={1} propsHands={<ObjetoNaMao def={CORTADOR} mao={mR.pos} ang={0} e={{ t }} />} />
      {[0, 1, 2, 3].map((i) => <rect key={i} x={prot.x + 120 + ((t * 300 + i * 40) % 140)} y={500 - ((t * 200 + i * 30) % 60)} width={8} height={4} fill="#5E9A4E" transform={`rotate(${i * 40} ${prot.x + 120} 500)`} />)}
      <Texto texto="CORTANDO GRAMA" tam={40} y={70} x={260} />
    </g>
  );
};
const Criancas: React.FC<{ f: number }> = ({ f }) => {
  const prot: PersonProps = { ...props(PROTAGONISTA), ...idle({ x: 200, y: 560, scale: 0.6 })(f), expr: "rindo", handR: [70, -130], gripR: "open" };
  const ir: PersonProps = { ...props(IRMA), ...idle({ x: 330, y: 560, scale: 0.6 * 0.62 })(f + 20), expr: "rindo", handR: [80, -240], gripR: "fist" };
  const m = maoInfo(ir, "R");
  return (
    <g>
      <rect x={0} y={0} width={520} height={480} fill="#F2D9E2" />
      <rect x={0} y={480} width={520} height={160} fill="#D9C2A8" />
      <Person {...prot} semente={2} />
      <Person {...ir} semente={3} propsHands={<ObjetoNaMao def={BOLA} mao={m.pos} ang={0} e={{ t: f / 30 }} />} />
      <Texto texto="CUIDANDO DE CRIANÇAS" tam={34} y={70} x={260} />
    </g>
  );
};
const Mercadinho: React.FC<{ f: number }> = ({ f }) => {
  const prot: PersonProps = { ...props(PROTAGONISTA), ...idle({ x: 260, y: 560, scale: 0.6 })(f), expr: "neutro", handL: [-40, -170], handR: [44, -170], gripL: "fist", gripR: "fist" };
  return (
    <g>
      <rect x={0} y={0} width={520} height={640} fill="#A9C4B5" />
      {Array.from({ length: 6 }, (_, i) => <path key={i} d={`M ${i * 90} 120 l 90 0 l 0 60 q -45 30 -90 0 Z`} fill={i % 2 ? "#F4F1EA" : "#C0504D"} stroke="#141414" strokeWidth={4} />)}
      <rect x={0} y={520} width={520} height={120} fill="#D6D0C4" />
      <Person {...prot} semente={1} propsHands={<g transform="translate(0 -150)"><CAIXA.Desenho t={0} /></g>} />
      <Texto texto="MERCADINHO" tam={40} y={70} x={260} />
    </g>
  );
};
const p5: PlanoV = {
  nome: "liso: a vida normal", de: CORTE(17), ate: CORTE(19), enquadra: { x: 960, y: 560, zoom: 1.02 },
  eventos: [
    { f: CORTE(17), tipo: "corte", desc: "a vida normal" },
    { f: T(18, 0.25), tipo: "objeto", desc: "moeda caindo no cofrinho" },
    { f: T(19), tipo: "objeto", desc: "painel: cortando grama", verbo: "cortar" },
    { f: T(19, fracDe(19, "cuidando")), tipo: "objeto", desc: "painel: crianças" },
    { f: T(19, fracDe(19, "ajudando")), tipo: "objeto", desc: "painel: mercadinho" },
  ],
  Cena: ({ f, cam }) => {
    const set = LISO_A.set;
    const base = emPe(set, "chao", 860);
    const prot: PersonProps = { ...props(PROTAGONISTA), ...idle(base)(f), expr: "neutro", handR: [70, -170], gripR: "fist" };
    const cof: P = [1060, 962];
    prot.lookAt = olhar(prot, [cof[0], 900]);
    const solta = T(18, 0.25);
    const mR = maoInfo(prot, "R");
    const maoW: P = [base.x + mR.pos[0] * base.scale, base.y + mR.pos[1] * base.scale];
    const xMoeda = maoW[0] + (cof[0] - maoW[0]) * lim((f - solta) / 12);
    const yMoeda = cai(f, solta, maoW[1], cof[1] - 140);
    return (
      <CenaCam cenario={LISO_A} f={f} cam={cam}
        noMeio={<>
          <ObjetoNoMundo def={COFRINHO} em={cof} s={2.4} e={{ t: 0 }} />
          {f < solta + 16 && <ObjetoNoMundo def={MOEDA} em={[f < solta ? maoW[0] : xMoeda, f < solta ? maoW[1] + 12 : yMoeda + 12]} s={1.35} e={{ t: 0 }} />}
          <Person {...prot} semente={1} />
        </>}
      />
    );
  },
  Sobre: ({ f }) => {
    const c1 = T(19, fracDe(19, "cuidando")), c2 = T(19, fracDe(19, "ajudando"));
    return (
      <>
        <TextoPop x={1180} y={760} f={f} de={T(18, 0.4)} ate={T(19)} texto="+ R$ 1" tam={64} cor="#7FD18C" />
        <Painel x={70} y={150} w={520} h={640} f={f} de={T(19)} rot={-2}><Grama f={f} de={T(19)} /></Painel>
        <Painel x={700} y={170} w={520} h={640} f={f} de={c1} rot={1.5}><Criancas f={f} /></Painel>
        <Painel x={1330} y={150} w={520} h={640} f={f} de={c2} rot={-1}><Mercadinho f={f} /></Painel>
      </>
    );
  },
};

// ------------------------------------------------------------------ 6. O trabalhador: aluguel, comida, contas, prestações do carro e, talvez, férias.
const LISO_B = liso("#F2E3C6");
const ITENS: { trecho: string; rotulo: string; Icone: React.FC; x: number }[] = [
  { trecho: "aluguel", rotulo: "ALUGUEL", Icone: () => <IconeCasa />, x: 860 },
  { trecho: "comida", rotulo: "COMIDA", Icone: () => <IconePrato />, x: 1100 },
  { trecho: "contas", rotulo: "CONTAS", Icone: () => <IconeEnvelope />, x: 1340 },
  { trecho: "prestações", rotulo: "CARRO", Icone: () => <IconeCarro />, x: 1580 },
  { trecho: "férias", rotulo: "FÉRIAS?", Icone: () => <g transform="scale(0.55)"><IconeGuardaSol /></g>, x: 1790 },
];
const p6: PlanoV = {
  nome: "liso: o trabalhador", de: CORTE(19), ate: CORTE(20), enquadra: { x: 960, y: 560, zoom: 1.02 },
  eventos: [
    { f: CORTE(19), tipo: "corte", desc: "o trabalhador" },
    { f: T(20, 0.02), tipo: "pose", desc: "cresce" },
    { f: T(20, fracDe(20, "passa boa")), tipo: "objeto", desc: "o relógio gira: a vida trabalhando" },
    ...ITENS.map((it, i) => ({ f: T(20, fracDe(20, it.trecho)), tipo: "objeto" as const, desc: `paga ${it.rotulo}`, ...(i === 0 ? { verbo: "pagar" } : {}) })),
  ],
  Cena: ({ f, cam }) => {
    const set = LISO_B.set;
    const base = emPe(set, "chao", 420);
    const cresce = 0.82 + 0.18 * entre(f, T(20, 0.02), T(20, 0.02) + 12); // "mesmo quando você cresce"
    const prot: PersonProps = { ...props(PROTAGONISTA), ...idle({ ...base, scale: base.scale * cresce })(f), expr: f < T(20, fracDe(20, "férias")) ? "neutro" : "triste", handR: [96, -196], gripR: "fist" };
    prot.lookAt = olhar(prot, [1300, 420]);
    const m = maoInfo(prot, "R");
    return (
      <CenaCam cenario={LISO_B} f={f} cam={cam}
        noMeio={<Person {...prot} semente={1} propsHands={<g>{[0, 1, 2].map((i) => <ObjetoNaMao key={i} def={CEDULA} mao={[m.pos[0] - i * 4, m.pos[1] - i * 6]} ang={-20 + i * 14} e={{ t: 0 }} />)}</g>} />}
      />
    );
  },
  Sobre: ({ f }) => (
    <>
      {(() => {
        const de = T(20, fracDe(20, "passa boa"));
        const giro = Math.max(0, f - de) * 24;
        return (
          <Selo x={420} y={190} f={f} de={de} r={78} cor="#FFFFFF">
            <circle cx={0} cy={0} r={6} fill="#141414" />
            <line x1={0} y1={0} x2={0} y2={-52} stroke="#141414" strokeWidth={8} strokeLinecap="round" transform={`rotate(${giro})`} />
            <line x1={0} y1={0} x2={0} y2={-34} stroke="#C0504D" strokeWidth={8} strokeLinecap="round" transform={`rotate(${giro / 12})`} />
          </Selo>
        );
      })()}
      {ITENS.map((it, i) => {
        const de = T(20, fracDe(20, it.trecho));
        const voo = lim((f - de + 10) / 12);
        const x0 = 600, y0 = 560, x1 = it.x, y1 = 400;
        const xv = x0 + (x1 - x0) * voo, yv = y0 + (y1 - y0) * voo - Math.sin(Math.PI * voo) * 180;
        return (
          <g key={it.rotulo}>
            {f >= de - 10 && voo < 1 && <g transform={`translate(${xv} ${yv}) scale(1.6) rotate(${voo * 360})`}><CEDULA.Desenho t={0} cor={i === 4 ? "#E3B95B" : "#7AA35B"} /></g>}
            <Selo x={it.x} y={400} f={f} de={de} r={i === 4 ? 56 : 92} rotulo={it.rotulo}><it.Icone /></Selo>
          </g>
        );
      })}
    </>
  ),
};

// ------------------------------------------------------------------ 7. Mega-Sena: 1 em 50 milhões. E mesmo isso acaba. O seu nunca acaba.
const LISO_C = liso("#D9E8D0");
const p7: PlanoV = {
  nome: "liso: a loteria e o cartão", de: CORTE(20), ate: CORTE(23), enquadra: { x: 960, y: 560, zoom: 1.04 },
  eventos: [
    { f: CORTE(20), tipo: "corte", desc: "loteria" },
    { f: T(21, 0.55), tipo: "objeto", desc: "1 em 50 milhões" },
    { f: T(22, 0.05), tipo: "objeto", desc: "o saco de dinheiro murcha" },
    { f: T(23), tipo: "objeto", desc: "o cartão aparece com o infinito" },
  ],
  Cena: ({ f, cam }) => {
    const set = LISO_C.set;
    const base = emPe(set, "chao", 760);
    const temCartao = f >= T(23);
    const prot: PersonProps = { ...props(PROTAGONISTA), ...idle(base)(f), expr: expressaoNoQuadro([[0, "convencido"], [T(22), "triste"], [T(23), "sigma"]], f, 6), handR: temCartao ? [104, -262] : [96, -210], gripR: "fist" };
    const m = maoInfo(prot, "R");
    prot.lookAt = olhar(prot, temCartao ? [base.x + m.pos[0] * 1.35, base.y + m.pos[1] * 1.35] : [1200, 500]);
    const saco = 1 - 0.85 * entre(f, T(22, 0), T(22, 1));
    return (
      <CenaCam cenario={LISO_C} f={f} cam={cam}
        noMeio={<>
          <ObjetoNoMundo def={SACO} em={[1180, 962]} s={2.6} e={{ t: 0, comprimento: saco }} />
          <Person {...prot} semente={1} propsHands={temCartao
            ? <ObjetoNaMao def={CARTAO} mao={m.pos} ang={-8} e={{ t: f / 30, brilho: lim((f - T(23)) / 14) }} />
            : <ObjetoNaMao def={BILHETE} mao={m.pos} ang={-6} e={{ t: 0 }} />} />
        </>}
      />
    );
  },
  Sobre: ({ f }) => (
    <>
      <TextoPop x={1260} y={260} f={f} de={T(21, 0.55)} ate={T(22, 0.4)} texto="1 EM 50 MILHÕES" tam={84} cor="#F2D16B" rot={-4} />
      <Infinito x={1300} y={300} f={f} de={T(23)} s={1.1} />
    </>
  ),
};

// ------------------------------------------------------------------ 8. "Então, e se você tivesse dinheiro infinito?" (título)
const LISO_D = liso("#2E3440");
export const FIM_CAP1 = CORTE(24);
const p8: PlanoV = {
  nome: "título", de: CORTE(23), ate: FIM_CAP1, enquadra: { x: 960, y: 560, zoom: 1.0 }, pushIn: 0.08, semLegenda: [24],
  eventos: [
    { f: CORTE(23), tipo: "corte", desc: "título" },
    { f: T(24, 0.1), tipo: "objeto", desc: "título aparece" },
  ],
  Cena: ({ f, cam }) => {
    const set = LISO_D.set;
    const base = emPe(set, "chao", 960);
    const prot: PersonProps = { ...props(PROTAGONISTA), ...idle(base)(f), expr: "convencido", handR: [104, -330], gripR: "fist", bendR: 8 };
    const m = maoInfo(prot, "R");
    prot.lookAt = olhar(prot, [1200, 200]);
    return (
      <CenaCam cenario={LISO_D} f={f} cam={cam}
        noMeio={<Person {...prot} semente={1} propsHands={<ObjetoNaMao def={CARTAO} mao={m.pos} ang={-12} e={{ t: f / 30, brilho: ((f - T(24)) % 40) / 40 }} />} />}
      />
    );
  },
  Sobre: ({ f }) => (
    <>
      <TextoPop x={960} y={170} f={f} de={T(24, 0.05)} texto="E SE VOCÊ TIVESSE" tam={70} />
      <TextoPop x={960} y={290} f={f} de={T(24, 0.35)} texto="DINHEIRO INFINITO?" tam={112} cor="#F2D16B" rot={-3} />
    </>
  ),
};

export const CAP1: PlanoV[] = [p1, p2, p3, p4, p5, p6, p7, p8];
/** verbos em sentido figurado (o verificador não cobra o gesto na imagem) */
export const FIGURADOS_CAP1: Record<number, string[]> = { 20: ["passar"] };
export const _naTela = naTela;
