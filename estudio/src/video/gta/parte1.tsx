// Parte 1 (falas 0 a 33): Téo digita quatro letras, um carro aparece, o bairro some. A regra: você digita, a realidade
// obedece, mas cobra. Código 1, spawnar um veículo: no jogo o carro só é desenhado; na vida real são 1.500 kg que
// precisam vir de algum lugar. E = mc², 135 quintilhões de joules, 2 milhões de bombas de Hiroshima, São Paulo apagado.
import React from "react";
import { Person, type PersonProps } from "../../components/Person";
import { expressaoNoQuadro } from "../../components/Face";
import { idle, point, scared } from "../../rig/actions";
import { emPe } from "../../cenarios/ancoras";
import { liso } from "../../cenarios/liso/Liso";
import { PROTAGONISTA } from "../../elenco/elenco";
import { olhar, props } from "../../fase4/Cenarios";
import { FONTE } from "../../fontes";
import { Contador, Estrela, IconeGlobo, IconeX, Texto, TextoPop, escalaPop } from "../graficos";
import { CenaCam, entre, type PlanoV } from "../cartao/comum";
import { RUA_CASAS } from "../cartao/cenas";
import { CORTE, FALAS, T, fracDe } from "./tempo";
import { Balanca, Brilho, Cogumelo, Giz, Hatch, Lousa, MESA_TEO, MapaSP, Plastico, Tecla, TelaJogo, Vidro, Viga } from "./pecas";

const L = "#141414";
const ESCURO = liso("#26313F");
const BEGE = liso("#EADFCB");
const PRETO = liso("#121418");
const TEO = PROTAGONISTA;
/** os quatro toques: na pausa depois da fala 0 */
export const TOQUES = [0, 1, 2, 3].map((i) => FALAS[0].fim + 3 + i * 6);
export const LETRAS = ["V", "R", "U", "M"];
/** o corte para o carro só depois do último toque (antes da fala seguinte começar) */
const DEPOIS_DAS_TECLAS = Math.min(FALAS[1].ini - 3, Math.max(CORTE(0), TOQUES[3] + 8));

/** Téo atrás da mesa, mãos no teclado */
const teoNaMesa = (f: number, expr: PersonProps["expr"], digita = false): PersonProps => {
  const set = MESA_TEO.set;
  const bate = digita ? Math.abs(Math.sin(f / 2)) * 8 : 0;
  const p: PersonProps = { ...props(TEO), ...idle(emPe(set, "chao", 960))(f), expr, handL: [-60, -150 + bate], handR: [60, -150 + (digita ? 8 - bate : 0)], gripL: "open", gripR: "open" };
  p.lookAt = olhar(p, [960, 700]);
  return p;
};

// ------------------------------------------------------------------ 1. Téo digita quatro letras
const p1: PlanoV = {
  nome: "Téo digita quatro letras", de: 0, ate: DEPOIS_DAS_TECLAS, enquadra: { x: 960, y: 560, zoom: 1.25 },
  eventos: [
    { f: T(0, 0.2), tipo: "pose", desc: "Téo no teclado" },
    ...TOQUES.map((f, i) => ({ f, tipo: "objeto" as const, desc: `tecla ${LETRAS[i]}` })),
  ],
  Cena: ({ f, cam }) => {
    const p = teoNaMesa(f, "convencido", f >= T(0, 0.3));
    return <CenaCam cenario={MESA_TEO} f={f} cam={cam} noMeio={<Person {...p} semente={1} />} />;
  },
  Sobre: ({ f }) => {
    const s = escalaPop(f, T(0, 0.5), DEPOIS_DAS_TECLAS + 6, 6);
    return s > 0 ? (
      <g transform={`translate(960 840) scale(${s})`}>
        <rect x={-430} y={-110} width={860} height={220} rx={30} fill="#1A1F29" opacity={0.85} />
        {LETRAS.map((l, i) => {
          const q = TOQUES[i];
          const aperta = f >= q ? Math.max(0, 1 - (f - q) / 5) : 0;
          return <g key={l} transform={`translate(${-300 + i * 200} 6)`}><Tecla letra={l} aperta={aperta} acesa={f >= q} /></g>;
        })}
      </g>
    ) : null;
  },
};

// ------------------------------------------------------------------ 2. um carro aparece na frente dele. Não chegou dirigindo. Não foi entregue. Apareceu.
const CaminhaoEntrega: React.FC = () => (
  <g>
    <rect x={-90} y={-70} width={110} height={70} rx={6} fill="#F4F1EA" stroke={L} strokeWidth={6} />
    <path d="M 20 -50 L 60 -50 L 84 -20 L 84 0 L 20 0 Z" fill="#E0822E" stroke={L} strokeWidth={6} strokeLinejoin="round" />
    {[-60, 50].map((x) => <circle key={x} cx={x} cy={4} r={16} fill="#2A2A35" stroke={L} strokeWidth={5} />)}
    <rect x={-70} y={-54} width={40} height={30} fill="#C9955E" stroke={L} strokeWidth={4} />
  </g>
);
const p2: PlanoV = {
  nome: "um carro aparece na frente dele", de: DEPOIS_DAS_TECLAS, ate: CORTE(4), enquadra: { x: 960, y: 600, zoom: 1.0 },
  eventos: [
    { f: DEPOIS_DAS_TECLAS, tipo: "corte", desc: "o quarto, mais aberto" },
    { f: T(1, fracDe(1, "aparece")), tipo: "objeto", desc: "o carro se materializa" },
    { f: T(2), tipo: "objeto", desc: "não chegou dirigindo: X" },
    { f: T(3), tipo: "objeto", desc: "não foi entregue: caminhão com X", verbo: "entregar" },
    { f: T(4), tipo: "objeto", desc: "apareceu: brilho" },
  ],
  Cena: ({ f, cam }) => {
    const fA = T(1, fracDe(1, "aparece"));
    const k = entre(f, fA, fA + 8);
    const p = teoNaMesa(f, f >= fA ? "chocado" : "convencido");
    p.lookAt = olhar(p, [960, 1000]);
    return (
      <CenaCam cenario={MESA_TEO} f={f} cam={cam}
        noMeio={<Person {...p} semente={1} />}
        naFrente={<>
          {f >= fA && <g transform={`translate(960 1080) scale(${(1.6 * (0.7 + 0.3 * k)).toFixed(3)})`} opacity={k}><Hatch /></g>}
          {f >= fA && <g transform="translate(960 900)"><Brilho k={(f - fA) / 18} r={260} /></g>}
          {f >= T(4) && <g transform="translate(960 900)"><Brilho k={(f - T(4)) / 16} r={300} /></g>}
        </>}
      />
    );
  },
  Sobre: ({ f }) => (
    <>
      {[[2, "DIRIGINDO", 420], [3, "ENTREGUE", 1500]].map(([id, rot, x]) => {
        const s = escalaPop(f, T(id as number), CORTE(4));
        return s > 0 ? (
          <g key={rot as string} transform={`translate(${x} 300) scale(${s})`}>
            <circle cx={6} cy={7} r={120} fill="#D6D2CA" /><circle r={120} fill="#FFFFFF" stroke={L} strokeWidth={7} />
            {id === 2 ? <g transform="translate(0 40) scale(0.45)"><Hatch /></g> : <g transform="translate(0 20)"><CaminhaoEntrega /></g>}
            <IconeX r={100} />
            <Texto texto={rot as string} tam={36} y={170} />
          </g>
        ) : null;
      })}
      <TextoPop x={960} y={220} f={f} de={T(4)} ate={CORTE(4)} texto="APARECEU." tam={110} cor="#F2D16B" rot={-4} />
    </>
  ),
};

// ------------------------------------------------------------------ 3. um segundo depois, o bairro inteiro deixa de existir (clarão, tela branca, silêncio)
/** a tela branca do roteiro: 1,5 s de silêncio total depois de "o bairro inteiro deixa de existir" (corta para o título) */
export const BRANCO = { de: FALAS[5].fim, ate: Math.min(FALAS[6].ini - 4, FALAS[5].fim + 45) };
const p3: PlanoV = {
  nome: "o bairro deixa de existir", de: CORTE(4), ate: BRANCO.ate, enquadra: { x: 960, y: 600, zoom: 1.0 }, semRespiro: true,
  eventos: [
    { f: CORTE(4), tipo: "corte", desc: "o bairro" },
    { f: T(5, fracDe(5, "o bairro")), tipo: "objeto", desc: "o clarão começa na casa do Téo" },
    { f: T(5, fracDe(5, "deixa")), tipo: "objeto", desc: "a luz engole o bairro" },
    { f: BRANCO.de, tipo: "corte", desc: "tela branca, silêncio (1,5 s)" },
  ],
  Cena: ({ f, cam }) => <CenaCam cenario={RUA_CASAS} f={f} cam={cam} />,
  Sobre: ({ f }) => {
    const k = entre(f, T(5, fracDe(5, "o bairro")), BRANCO.de);
    return (
      <>
        {f < BRANCO.de && <circle cx={1170} cy={700} r={30 + 1600 * k * k} fill="#FFFFFF" opacity={0.25 + 0.75 * k} />}
        {f >= BRANCO.de && <rect x={0} y={0} width={1920} height={1080} fill="#FFFFFF" />}
      </>
    );
  },
};

// ------------------------------------------------------------------ 4. título: e se os códigos de GTA funcionassem na vida real?
const p4: PlanoV = {
  nome: "título", de: BRANCO.ate, ate: CORTE(6), enquadra: { x: 960, y: 560, zoom: 1.0 }, pushIn: 0.08, semLegenda: [6],
  eventos: [
    { f: BRANCO.ate, tipo: "corte", desc: "título" },
    { f: T(6, fracDe(6, "os códigos")), tipo: "objeto", desc: "OS CÓDIGOS DE GTA" },
    { f: T(6, fracDe(6, "funcionassem")), tipo: "objeto", desc: "NA VIDA REAL?" },
  ],
  Cena: ({ f, cam }) => {
    const set = ESCURO.set;
    const p: PersonProps = { ...props(TEO), ...idle(emPe(set, "chao", 1580))(f), expr: "chocado" };
    p.lookAt = olhar(p, [700, 400]);
    return <CenaCam cenario={ESCURO} f={f} cam={cam} noMeio={<Person {...p} semente={1} />} />;
  },
  Sobre: ({ f }) => (
    <>
      <TextoPop x={760} y={300} f={f} de={T(6, 0.05)} texto="E SE" tam={70} cor="#FFFFFF" rot={-3} />
      <TextoPop x={760} y={430} f={f} de={T(6, fracDe(6, "os códigos"))} texto="OS CÓDIGOS DE GTA" tam={96} cor="#F2D16B" rot={-3} />
      <TextoPop x={760} y={560} f={f} de={T(6, fracDe(6, "funcionassem"))} texto="FUNCIONASSEM" tam={80} cor="#FFFFFF" rot={2} />
      <TextoPop x={760} y={680} f={f} de={T(6, fracDe(6, "na vida real"))} texto="NA VIDA REAL?" tam={110} cor="#7FD18C" rot={-3} />
    </>
  ),
};

// ------------------------------------------------------------------ 5. a regra: você digita, a realidade obedece; nenhum código é negado; mas a realidade cobra
const Recibo: React.FC<{ titulo: string; valor: string; cor: string }> = ({ titulo, valor, cor }) => (
  <g>
    <path d="M -150 -200 L 150 -200 L 150 180 L 125 200 L 100 180 L 75 200 L 50 180 L 25 200 L 0 180 L -25 200 L -50 180 L -75 200 L -100 180 L -125 200 L -150 180 Z" transform="translate(7 8)" fill="#D6D2CA" />
    <path d="M -150 -200 L 150 -200 L 150 180 L 125 200 L 100 180 L 75 200 L 50 180 L 25 200 L 0 180 L -25 200 L -50 180 L -75 200 L -100 180 L -125 200 L -150 180 Z" fill="#FFFFFF" stroke={L} strokeWidth={7} strokeLinejoin="round" />
    <text x={0} y={-140} textAnchor="middle" fontFamily={FONTE} fontWeight={900} fontSize={40} fill={L}>{titulo}</text>
    {[0, 1, 2].map((i) => <rect key={i} x={-110} y={-100 + i * 40} width={220} height={14} rx={7} fill="#E4DED2" />)}
    <line x1={-110} y1={40} x2={110} y2={40} stroke={L} strokeWidth={4} />
    <text x={0} y={110} textAnchor="middle" fontFamily={FONTE} fontWeight={900} fontSize={52} fill={cor}>{valor}</text>
  </g>
);
const p5: PlanoV = {
  nome: "a regra", de: CORTE(6), ate: CORTE(10), enquadra: { x: 960, y: 560, zoom: 1.0 },
  eventos: [
    { f: CORTE(6), tipo: "corte", desc: "a regra" },
    { f: T(8), tipo: "objeto", desc: "teclado → mundo" },
    { f: T(8, fracDe(8, "a realidade")), tipo: "objeto", desc: "o mundo obedece" },
    { f: T(9, fracDe(9, "negado")), tipo: "objeto", desc: "NEGADO riscado" },
    { f: T(10, fracDe(10, "cobra")), tipo: "objeto", desc: "a conta da realidade" },
    { f: T(10, fracDe(10, "de graça")), tipo: "objeto", desc: "no jogo: grátis" },
  ],
  Cena: ({ f, cam }) => {
    const set = BEGE.set;
    const p: PersonProps = { ...props(TEO), ...idle(emPe(set, "chao", 300))(f), expr: expressaoNoQuadro([[0, "convencido"], [T(10), "olhar-lateral"]], f, 6) };
    p.lookAt = olhar(p, [1100, 450]);
    return <CenaCam cenario={BEGE} f={f} cam={cam} noMeio={<Person {...p} semente={1} />} />;
  },
  Sobre: ({ f }) => {
    const ate10 = T(10);
    const sT = escalaPop(f, T(8), ate10);
    const sG = escalaPop(f, T(8, fracDe(8, "a realidade")), ate10);
    return (
      <>
        <TextoPop x={1100} y={180} f={f} de={T(7, 0.2)} ate={T(8)} texto="A REGRA" tam={100} cor="#F2D16B" rot={-3} />
        {sT > 0 && <g transform={`translate(760 430) scale(${sT})`}><Tecla letra="↵" aperta={0} acesa /><Texto texto="VOCÊ DIGITA" tam={36} y={130} /></g>}
        {sG > 0 && <><path d="M 880 430 L 1180 430" stroke={L} strokeWidth={14} strokeLinecap="round" /><path d="M 1150 400 L 1190 430 L 1150 460" stroke={L} strokeWidth={14} fill="none" strokeLinecap="round" strokeLinejoin="round" /></>}
        {sG > 0 && <g transform={`translate(1400 430) scale(${1.4 * sG})`}><IconeGlobo giro={f * 3} /><Texto texto="A REALIDADE OBEDECE" tam={26} y={124} /></g>}
        {(() => { const s = escalaPop(f, T(9, fracDe(9, "negado")), ate10); return s > 0 ? <g transform={`translate(1100 750) rotate(-8) scale(${s})`}><rect x={-190} y={-56} width={380} height={112} rx={14} fill="#FFFFFF" stroke="#C0504D" strokeWidth={9} /><text x={0} y={22} textAnchor="middle" fontFamily={FONTE} fontWeight={900} fontSize={66} fill="#C0504D">NEGADO</text><line x1={-200} y1={0} x2={200} y2={0} stroke={L} strokeWidth={14} /></g> : null; })()}
        {(() => { const s = escalaPop(f, T(10, fracDe(10, "de graça")), CORTE(10)); return s > 0 ? <g transform={`translate(800 520) rotate(-5) scale(${s})`}><Recibo titulo="NO JOGO" valor="GRÁTIS" cor="#3E8E5A" /></g> : null; })()}
        {(() => { const s = escalaPop(f, T(10, fracDe(10, "cobra")), CORTE(10)); return s > 0 ? <g transform={`translate(1400 520) rotate(5) scale(${s})`}><Recibo titulo="NA REALIDADE" valor="A CONTA" cor="#C0504D" /></g> : null; })()}
      </>
    );
  },
};

// ------------------------------------------------------------------ 6. cartela: o código que todo mundo usa primeiro. Spawnar um veículo.
const cartelaCodigo = (de: number, gancho: number, tema: number, numero: string, palavra: string, Icone: React.FC): PlanoV => ({
  nome: `cartela: ${palavra}`, de, ate: CORTE(tema), enquadra: { x: 960, y: 560, zoom: 1 }, pushIn: 0.08, semLegenda: [tema],
  eventos: [
    { f: de, tipo: "corte", desc: "cartela" },
    { f: T(gancho, 0.1), tipo: "objeto", desc: numero },
    { f: T(tema), tipo: "objeto", desc: palavra },
  ],
  Cena: ({ f, cam }) => {
    const set = ESCURO.set;
    const p: PersonProps = { ...props(TEO), ...idle(emPe(set, "chao", 1560))(f), expr: f >= T(tema) ? "chocado" : "convencido" };
    p.lookAt = olhar(p, [800, 400]);
    return <CenaCam cenario={ESCURO} f={f} cam={cam} noMeio={<Person {...p} semente={1} />} />;
  },
  Sobre: ({ f }) => (
    <>
      <TextoPop x={760} y={300} f={f} de={T(gancho, 0.1)} texto={numero} tam={64} cor="#FFFFFF" rot={-2} />
      <TextoPop x={760} y={480} f={f} de={T(tema)} texto={palavra} tam={palavra.length > 14 ? 92 : 120} cor="#F2D16B" rot={-4} />
      {f >= T(tema) && <g transform={`translate(760 720) scale(${Math.min(1, (f - T(tema)) / 8)})`}><Icone /></g>}
    </>
  ),
});
export { cartelaCodigo };
const p6 = cartelaCodigo(CORTE(10), 11, 12, "CÓDIGO 1", "SPAWNAR VEÍCULO", () => <g transform="translate(0 60) scale(0.9)"><Hatch /></g>);

// ------------------------------------------------------------------ 7. no jogo, o carro aparece; não precisa tirar de lugar nenhum; ele só desenha
const RuaJogo: React.FC<{ f: number; carro: number; fantasma?: boolean }> = ({ f, carro, fantasma }) => (
  <g>
    <rect x={0} y={380} width={1200} height={300} fill="#7FA87A" />
    <rect x={0} y={460} width={1200} height={140} fill="#6B6E75" />
    {Array.from({ length: 8 }, (_, i) => <rect key={i} x={i * 160 - ((f * 4) % 160)} y={524} width={80} height={12} fill="#F2D16B" />)}
    {[120, 420, 860].map((x, i) => <g key={x}><rect x={x} y={170 + (i % 2) * 40} width={180} height={220 - (i % 2) * 40} fill={["#E8A598", "#C9D3E0", "#F2D9A6"][i]} stroke={L} strokeWidth={5} />{[0, 1].map((j) => <rect key={j} x={x + 30 + j * 80} y={210 + (i % 2) * 40} width={50} height={50} fill="#9ED8F5" stroke={L} strokeWidth={3} />)}</g>)}
    {carro > 0 && <g transform={`translate(600 580) scale(${0.9 * carro})`}><Hatch fantasma={fantasma ? 1 : 0} /></g>}
  </g>
);
const p7: PlanoV = {
  nome: "no jogo o carro só é desenhado", de: CORTE(12), ate: CORTE(15), enquadra: { x: 960, y: 560, zoom: 1.0 },
  eventos: [
    { f: CORTE(12), tipo: "corte", desc: "a tela do jogo" },
    { f: T(13, fracDe(13, "aparece")), tipo: "objeto", desc: "o carro aparece no jogo" },
    { f: T(14, fracDe(14, "lugar nenhum")), tipo: "objeto", desc: "de onde? de lugar nenhum" },
    { f: T(15), tipo: "objeto", desc: "o lápis desenha o carro" },
  ],
  Cena: ({ f, cam }) => <CenaCam cenario={ESCURO} f={f} cam={cam} />,
  Sobre: ({ f }) => {
    const fA = T(13, fracDe(13, "aparece"));
    const k = entre(f, fA, fA + 6);
    const desenha = f >= T(15) && f < T(15) + 26;
    return (
      <>
        <g transform="translate(960 500) scale(1.15)">
          <TelaJogo f={f}>
            <RuaJogo f={f} carro={desenha ? 1 : k} fantasma={desenha && f < T(15) + 14} />
            {desenha && <g transform={`translate(${520 + ((f - T(15)) * 14) % 200} 470) rotate(30)`}><rect x={-10} y={-90} width={20} height={90} fill="#F2D16B" stroke={L} strokeWidth={4} /><path d="M -10 0 L 0 26 L 10 0 Z" fill="#E9C9A0" stroke={L} strokeWidth={4} /></g>}
          </TelaJogo>
        </g>
        <TextoPop x={960} y={120} f={f} de={T(14, fracDe(14, "lugar nenhum"))} ate={T(15)} texto="DE ONDE? DE LUGAR NENHUM" tam={56} cor="#F2D16B" rot={-2} />
        <TextoPop x={960} y={120} f={f} de={T(15)} ate={CORTE(15)} texto="ELE SÓ DESENHA" tam={70} cor="#FFFFFF" rot={-3} />
      </>
    );
  },
};

// ------------------------------------------------------------------ 8. na vida real, matéria não aparece: 1.500 kg de aço, vidro e plástico precisam vir de algum lugar
const p8: PlanoV = {
  nome: "1.500 kg precisam vir de algum lugar", de: CORTE(15), ate: CORTE(18), enquadra: { x: 960, y: 590, zoom: 1.0 },
  eventos: [
    { f: CORTE(15), tipo: "corte", desc: "a rua de verdade" },
    { f: T(16, fracDe(16, "matéria")), tipo: "objeto", desc: "vaga vazia: ?" },
    { f: T(17, fracDe(17, "pesa")), tipo: "objeto", desc: "o carro na balança: 1.500 KG" },
    { f: T(18, fracDe(18, "aço")), tipo: "objeto", desc: "aço" },
    { f: T(18, fracDe(18, "vidro")), tipo: "objeto", desc: "vidro" },
    { f: T(18, fracDe(18, "plástico")), tipo: "objeto", desc: "plástico" },
    { f: T(18, fracDe(18, "vir de algum")), tipo: "objeto", desc: "DE ONDE?" },
  ],
  Cena: ({ f, cam }) => {
    const set = RUA_CASAS.set;
    const p: PersonProps = { ...props(TEO), ...idle(emPe(set, "chao", 380))(f), expr: f >= T(17) ? "olhar-lateral" : "neutro" };
    p.lookAt = olhar(p, [1100, 800]);
    const fP = T(17, fracDe(17, "pesa"));
    const k = entre(f, fP, fP + 8);
    return (
      <CenaCam cenario={RUA_CASAS} f={f} cam={cam}
        noMeio={<>
          <Person {...p} semente={1} />
          {f >= fP && <g transform={`translate(1150 ${930 - 260 * (1 - k)})`}><g transform="scale(1.1)"><Hatch cor="#5AA5B8" /></g></g>}
          {f >= fP && <g transform="translate(1150 970)"><Balanca texto={k >= 1 ? "1.500 KG" : `${Math.round(1500 * k)} KG`} /></g>}
          {f < fP && f >= T(16, fracDe(16, "matéria")) && <rect x={930} y={930} width={440} height={60} fill="none" stroke="#FFFFFF" strokeWidth={8} strokeDasharray="30 20" />}
        </>}
      />
    );
  },
  Sobre: ({ f }) => (
    <>
      <TextoPop x={1150} y={560} f={f} de={T(16, fracDe(16, "matéria"))} ate={T(17, fracDe(17, "pesa"))} texto="?" tam={220} cor="#F2D16B" rot={6} />
      {[["aço", Viga, 760], ["vidro", Vidro, 1150], ["plástico", Plastico, 1540]].map(([w, Ic, x]) => {
        const s = escalaPop(f, T(18, fracDe(18, w as string)), CORTE(18));
        const I = Ic as React.FC;
        return s > 0 ? <g key={w as string} transform={`translate(${x} 300) scale(${s})`}><circle cx={6} cy={7} r={100} fill="#D6D2CA" /><circle r={100} fill="#FFFFFF" stroke={L} strokeWidth={7} /><I /><Texto texto={(w as string).toUpperCase()} tam={34} y={150} /></g> : null;
      })}
      <TextoPop x={1150} y={120} f={f} de={T(18, fracDe(18, "vir de algum"))} ate={CORTE(18)} texto="VÊM DE ONDE?" tam={64} cor="#E0826E" rot={-3} />
    </>
  ),
};

// ------------------------------------------------------------------ 9. a conta: E = mc²; c = 300.000.000 m/s; ao quadrado, absurdo
const p9: PlanoV = {
  nome: "E = mc²", de: CORTE(18), ate: CORTE(23), enquadra: { x: 960, y: 560, zoom: 1.0 },
  eventos: [
    { f: CORTE(18), tipo: "corte", desc: "a lousa" },
    { f: T(19, fracDe(19, "uma conta")), tipo: "objeto", desc: "a lousa aparece" },
    { f: T(20), tipo: "objeto", desc: "E = mc²" },
    { f: T(21, fracDe(21, "massa")), tipo: "objeto", desc: "rótulos: energia, massa, luz²" },
    { f: T(22, fracDe(22, "trezentos")), tipo: "objeto", desc: "c = 300.000.000 m/s" },
    { f: T(23, fracDe(23, "absurdo")), tipo: "objeto", desc: "c² transborda" },
  ],
  Cena: ({ f, cam }) => {
    const set = BEGE.set;
    const p: PersonProps = f >= T(21) && f < T(23) ? { ...props(TEO), ...point({ ...emPe(set, "chao", 1700), alvo: [-178, -238], expr: "convencido" })(f - T(21)), flip: true } : { ...props(TEO), ...idle(emPe(set, "chao", 1700))(f), expr: f >= T(23, 0.5) ? "chocado" : "neutro" };
    p.lookAt = p.flip ? [140, -330] : olhar(p, [900, 400]);
    return <CenaCam cenario={BEGE} f={f} cam={cam} noMeio={<Person {...p} semente={1} />} />;
  },
  Sobre: ({ f }) => {
    const s = escalaPop(f, T(19, fracDe(19, "uma conta")), Infinity);
    const escreve = (de: number, n: number) => Math.max(0, Math.min(n, Math.floor((f - de) / 2)));
    const eq = "E = mc²";
    const c2 = "c² = 90.000.000.000.000.000";
    return s > 0 ? (
      <g transform={`translate(860 470) scale(${s})`}>
        <Lousa w={1300} h={640}>
          {f >= T(20) && <Giz texto={eq.slice(0, escreve(T(20), eq.length))} y={-130} tam={170} />}
          {f >= T(21, fracDe(21, "massa")) && <g><Giz texto="ENERGIA" x={-330} y={-30} tam={34} cor="#F2D16B" /><Giz texto="MASSA" x={-20} y={-30} tam={34} cor="#F2D16B" /><Giz texto="VELOCIDADE" x={300} y={-40} tam={30} cor="#F2D16B" /><Giz texto="DA LUZ²" x={300} y={-6} tam={30} cor="#F2D16B" /></g>}
          {f >= T(22, fracDe(22, "trezentos")) && <Giz texto={"c = 300.000.000 m/s".slice(0, escreve(T(22, fracDe(22, "trezentos")), 19))} y={90} tam={80} />}
          {f >= T(23, fracDe(23, "absurdo")) && <Giz texto={c2.slice(0, escreve(T(23, fracDe(23, "absurdo")), c2.length))} x={60} y={220} tam={74} cor="#E0826E" />}
        </Lousa>
      </g>
    ) : null;
  },
};

// ------------------------------------------------------------------ 10. 135 quintilhões de joules; comparar; Hiroshima 63 trilhões; 2 milhões de bombas
const p10: PlanoV = {
  nome: "2 milhões de bombas", de: CORTE(23), ate: CORTE(28), enquadra: { x: 960, y: 560, zoom: 1.0 },
  eventos: [
    { f: CORTE(23), tipo: "corte", desc: "a conta do carro" },
    { f: T(24, fracDe(24, "você chega")), tipo: "objeto", desc: "o contador de joules" },
    { f: T(24, fracDe(24, "quintilhões")), tipo: "objeto", desc: "135 QUINTILHÕES DE JOULES" },
    { f: T(25), tipo: "objeto", desc: "?" },
    { f: T(26, fracDe(26, "comparar")), tipo: "objeto", desc: "vamos comparar" },
    { f: T(27, fracDe(27, "Hiroshima")), tipo: "objeto", desc: "a nuvem: Hiroshima" },
    { f: T(27, fracDe(27, "sessenta")), tipo: "objeto", desc: "63 TRILHÕES DE JOULES" },
    { f: T(28, fracDe(28, "dois milhões")), tipo: "objeto", desc: "a grade de nuvens: × 2 MILHÕES" },
  ],
  Cena: ({ f, cam }) => <CenaCam cenario={ESCURO} f={f} cam={cam} />,
  Sobre: ({ f }) => {
    const fC = T(24, fracDe(24, "você chega"));
    const fQ = T(24, fracDe(24, "quintilhões"));
    const fH = T(27, fracDe(27, "Hiroshima"));
    const fM = T(28, fracDe(28, "dois milhões"));
    const nGrade = f >= fM ? Math.min(240, Math.floor((f - fM) * 6)) : 0;
    return (
      <>
        {f < T(25) && <Contador x={960} y={420} f={f} de={fC} ate={fQ} valor={135} sufixo=" QUINTILHÕES" tam={90} cor="#F2D16B" rot={-2} fim={T(26)} />}
        {f < T(26) && <TextoPop x={960} y={560} f={f} de={fQ} ate={T(26)} texto="DE JOULES" tam={70} rot={2} />}
        <TextoPop x={960} y={300} f={f} de={T(25)} ate={T(26)} texto="?" tam={180} cor="#FFFFFF" rot={6} />
        <TextoPop x={960} y={180} f={f} de={T(26, fracDe(26, "comparar"))} ate={fM} texto="VAMOS COMPARAR" tam={64} cor="#F2D16B" rot={-2} />
        {f >= fH && f < fM && <g transform={`translate(960 520) scale(${escalaPop(f, fH, fM) * 1.8})`}><Cogumelo /></g>}
        <TextoPop x={960} y={860} f={f} de={T(27, fracDe(27, "sessenta"))} ate={fM} texto="63 TRILHÕES DE JOULES" tam={64} cor="#FFFFFF" rot={-2} />
        {nGrade > 0 && Array.from({ length: nGrade }, (_, i) => <g key={i} transform={`translate(${70 + (i % 24) * 77} ${130 + Math.floor(i / 24) * 82}) scale(0.3)`}><Cogumelo /></g>)}
        <TextoPop x={960} y={560} f={f} de={fM + 10} ate={CORTE(28)} texto="× 2.000.000" tam={150} cor="#F2D16B" rot={-3} />
      </>
    );
  },
};

// ------------------------------------------------------------------ 11. "Dois milhões." (silêncio antes e depois) "Para um carro."
const p11: PlanoV = {
  nome: "dois milhões. para um carro.", de: CORTE(28), ate: CORTE(30), enquadra: { x: 960, y: 560, zoom: 1.0 }, semRespiro: true, semLegenda: [29],
  eventos: [
    { f: CORTE(28), tipo: "corte", desc: "preto, silêncio" },
    { f: T(29), tipo: "objeto", desc: "2 MILHÕES" },
    { f: T(30), tipo: "objeto", desc: "um carrinho sozinho" },
  ],
  Cena: ({ f, cam }) => <CenaCam cenario={PRETO} f={f} cam={cam} />,
  Sobre: ({ f }) => (
    <>
      <TextoPop x={960} y={500} f={f} de={T(29)} ate={T(30)} texto="DOIS MILHÕES." tam={150} cor="#FFFFFF" rot={0} />
      {(() => { const s = escalaPop(f, T(30), Infinity); return s > 0 ? <g transform={`translate(960 600) scale(${0.6 * s})`}><Hatch /></g> : null; })()}
    </>
  ),
};

// ------------------------------------------------------------------ 12. você apagou o estado de São Paulo; um detalhe pior: pode digitar de novo
const p12: PlanoV = {
  nome: "São Paulo apagado; de novo", de: CORTE(30), ate: CORTE(33), enquadra: { x: 960, y: 560, zoom: 1.0 },
  eventos: [
    { f: CORTE(30), tipo: "corte", desc: "o mapa de São Paulo" },
    { f: T(31, fracDe(31, "apagou")), tipo: "objeto", desc: "SÃO PAULO no mapa" },
    { f: T(31, fracDe(31, "São Paulo")), tipo: "objeto", desc: "clarão: o mapa some" },
    { f: T(32), tipo: "expressao", desc: "Téo com medo" },
    { f: T(33, fracDe(33, "digitar")), tipo: "objeto", desc: "a tecla acende de novo" },
    { f: T(33, fracDe(33, "de novo")), tipo: "objeto", desc: "DE NOVO?" },
  ],
  Cena: ({ f, cam }) => {
    const set = ESCURO.set;
    const p: PersonProps = f >= T(32) ? { ...props(TEO), ...scared(emPe(set, "chao", 1640))(f - T(32)) } : { ...props(TEO), ...idle(emPe(set, "chao", 1640))(f), expr: "neutro" };
    p.lookAt = olhar(p, [760, 500]);
    return <CenaCam cenario={ESCURO} f={f} cam={cam} noMeio={<Person {...p} semente={1} />} />;
  },
  Sobre: ({ f }) => {
    const fA = T(31, fracDe(31, "São Paulo"));
    const k = entre(f, fA, fA + 12);
    const fD = T(33, fracDe(33, "digitar"));
    return (
      <>
        {f < T(32) && <g transform="translate(760 500) scale(1.5)" opacity={1 - k}><MapaSP /></g>}
        {f >= fA + 8 && f < T(33, fracDe(33, "digitar")) && <g transform="translate(760 500) scale(1.5)" opacity={0.5}><MapaSP cor="none" /></g>}
        {f >= fA && f < fA + 14 && <circle cx={1015} cy={590} r={40 + 900 * k} fill="#FFFFFF" opacity={1 - k * 0.6} />}
        <TextoPop x={760} y={180} f={f} de={T(31, fracDe(31, "apagou"))} ate={fA + 6} texto="SÃO PAULO" tam={80} cor="#F2D16B" rot={-3} />
        {f >= fD && <g transform={`translate(760 520) scale(${escalaPop(f, fD, Infinity) * 1.6})`}><Tecla letra="V" aperta={0} acesa={Math.floor((f - fD) / 6) % 2 === 0} /></g>}
        <TextoPop x={760} y={260} f={f} de={T(33, fracDe(33, "de novo"))} ate={CORTE(33)} texto="DE NOVO?" tam={110} cor="#E0826E" rot={-4} />
        <Estrela x={1000} y={380} f={f} de={T(32)} ate={T(33)} texto="!" r={70} cor="#E0826E" />
      </>
    );
  },
};

export const PARTE1: PlanoV[] = [p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11, p12];
export const FIGURADOS_P1: Record<number, string[]> = {};
