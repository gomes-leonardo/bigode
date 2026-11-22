// Capítulo 6 (falas 107 a 127): espaço (foguete, cada assento, a estação espacial com a mãe comendo biscoito perto
// da janela), ouro (o cubo de 22 m da altura de um prédio de 7 andares; cada compra faz o preço subir) e contagem
// (R$ 1 por segundo: 11 dias, 32 anos, 32 mil anos; antes da primeira cidade).
import React from "react";
import { useCurrentFrame } from "remotion";
import { FONTE } from "../../fontes";
import { Person, type PersonProps } from "../../components/Person";
import { expressaoNoQuadro } from "../../components/Face";
import { idle } from "../../rig/actions";
import { BARRA_OURO, BISCOITO } from "../../objects/extras2";
import { CARTAO, MOEDA } from "../../objects/extras";
import { emPe } from "../../cenarios/ancoras";
import { liso, lisoSet } from "../../cenarios/liso/Liso";
import type { CenarioDef } from "../../cenarios/Cena";
import { MARGEM } from "../../cenarios/pecas";
import { AMIGO, MAE, PROTAGONISTA } from "../../elenco/elenco";
import { emPeNa, olhar, props } from "../../fase4/Cenarios";
import { Aprovado, Contador, CuboOuro, Estrela, Grafico, IconeAssento, IconeCalendario, IconeCelular, IconeFoguete, IconeRelogio, Infinito, PedraTracinhos, SetaCima, Texto, TextoPop, escalaPop } from "../graficos";
import { CenaCam, entre, fracDe, segura, type PlanoV } from "./comum";
import { cartela } from "./titulo";
import { CORTE, T } from "./tempo";
import { FIM_CAP5 } from "./cap5";

const lim = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const L = "#141414";

// ------------------------------------------------------------------ 37. cartela ESPAÇO
const FogueteIcone: React.FC = () => {
  const f = useCurrentFrame();
  return <g transform={`scale(0.6) translate(0 ${-20 - Math.sin(f / 4) * 5})`}><IconeFoguete fogo={0.5 + 0.5 * Math.abs(Math.sin(f / 2))} /></g>;
};
const p37 = cartela(FIM_CAP5, 107, 108, "ESPAÇO", FogueteIcone);

// ------------------------------------------------------------------ 38. dezenas de milhões de dólares por assento; você compra cada assento
const NOITE = liso("#1E2A44");
const Torre: React.FC = () => (
  <g>
    {Array.from({ length: 7 }, (_, i) => <path key={i} d={`M -30 ${-i * 80} L 30 ${-(i + 1) * 80} M 30 ${-i * 80} L -30 ${-(i + 1) * 80}`} stroke={L} strokeWidth={5} />)}
    {[-44, 26].map((x) => <rect key={x} x={x} y={-560} width={18} height={560} fill="#C0504D" stroke={L} strokeWidth={5} />)}
    <rect x={26} y={-430} width={120} height={18} fill="#C0504D" stroke={L} strokeWidth={5} />
  </g>
);
const p38: PlanoV = {
  nome: "foguete: cada assento", de: CORTE(108), ate: CORTE(110), enquadra: { x: 960, y: 560, zoom: 1.0 },
  eventos: [
    { f: CORTE(108), tipo: "corte", desc: "o foguete na base" },
    { f: T(109, fracDe(109, "dezenas")), tipo: "objeto", desc: "dezenas de milhões de dólares" },
    { f: T(109, fracDe(109, "por assento")), tipo: "objeto", desc: "por assento" },
    { f: T(110, 0.15), tipo: "objeto", desc: "compra cada assento", verbo: "comprar" },
    { f: T(110, 0.6), tipo: "objeto", desc: "esgotado" },
  ],
  Cena: ({ f, cam }) => {
    const set = NOITE.set;
    let p: PersonProps = { ...props(PROTAGONISTA), ...idle(emPe(set, "chao", 1650))(f), expr: f >= T(110) ? "convencido" : "neutro" };
    if (f >= T(110, 0.1)) p = segura(p, "L", [-96, -250], CARTAO, { t: 0, brilho: 1 }, -10);
    p.lookAt = olhar(p, [560, 600]);
    const fogo = 0.3 + 0.2 * Math.abs(Math.sin(f / 3));
    return (
      <CenaCam cenario={NOITE} f={f} cam={cam}
        noMeio={<>
          {Array.from({ length: 46 }, (_, i) => <circle key={i} cx={(i * 211) % 1960} cy={30 + ((i * 97) % 560)} r={2 + (i % 3)} fill="#FFFFFF" opacity={0.55 + 0.45 * Math.abs(Math.sin(f / 14 + i))} />)}
          <rect x={300} y={930} width={500} height={34} rx={6} fill="#8A8F98" stroke={L} strokeWidth={6} />
          <g transform="translate(360 940)"><Torre /></g>
          <g transform="translate(600 724) scale(1.8)"><IconeFoguete fogo={fogo} /></g>
          <Person {...p} semente={1} />
        </>}
      />
    );
  },
  Sobre: ({ f }) => {
    const s1 = escalaPop(f, T(109, fracDe(109, "por assento")) + 4, T(110));
    return (
      <>
        <TextoPop x={1120} y={230} f={f} de={T(109, fracDe(109, "dezenas"))} ate={T(110)} texto="DEZENAS DE MILHÕES" tam={66} cor="#7FD18C" rot={-3} />
        <TextoPop x={1120} y={320} f={f} de={T(109, fracDe(109, "dólares"))} ate={T(110)} texto="DE DÓLARES" tam={52} rot={2} />
        <TextoPop x={1120} y={420} f={f} de={T(109, fracDe(109, "por assento"))} ate={T(110)} texto="POR ASSENTO" tam={52} cor="#F2D16B" rot={-2} />
        {s1 > 0 && <g transform={`translate(1120 560) scale(${1.6 * s1})`}><IconeAssento /></g>}
        {f >= T(110) && Array.from({ length: 8 }, (_, i) => {
          const s = escalaPop(f, T(110) + i * 2, Infinity, 6);
          const vendido = f >= T(110, 0.15) + i * 3;
          return s > 0 ? <g key={i} transform={`translate(${900 + (i % 4) * 150} ${290 + Math.floor(i / 4) * 160}) scale(${1.25 * s})`}><IconeAssento vendido={vendido} /></g> : null;
        })}
        <Aprovado x={1120} y={600} f={f} de={T(110, 0.6)} ate={CORTE(110)} texto="ESGOTADO" />
      </>
    );
  },
};

// ------------------------------------------------------------------ 39. estação espacial: a mãe e o melhor amigo flutuando; a mãe come biscoito perto da janela; migalhas nos dutos
const ESPACO: CenarioDef = (() => {
  const set = lisoSet(1.2);
  set.id = "espaco";
  const Fundo: React.FC<{ t: number }> = () => <rect x={-MARGEM} y={-MARGEM} width={1920 + 2 * MARGEM} height={1080 + 2 * MARGEM} fill="#C9CFD6" />;
  const Meio: React.FC<{ t: number }> = ({ t }) => (
    <g>
      <rect x={-MARGEM} y={-MARGEM} width={1920 + 2 * MARGEM} height={1080 + 2 * MARGEM} fill="#D9DEE4" />
      {Array.from({ length: 8 }, (_, i) => <rect key={i} x={-150 + i * 290} y={100} width={250} height={750} rx={18} fill="#CDD3DA" stroke={L} strokeWidth={5} />)}
      <rect x={-MARGEM} y={-MARGEM} width={1920 + 2 * MARGEM} height={70 + MARGEM} fill="#B9BEC6" stroke={L} strokeWidth={7} />
      <rect x={-MARGEM} y={890} width={1920 + 2 * MARGEM} height={190 + MARGEM} fill="#B9BEC6" stroke={L} strokeWidth={7} />
      {[180, 1460].map((x) => <rect key={x} x={x} y={866} width={240} height={18} rx={9} fill="#F2D16B" stroke={L} strokeWidth={5} />)}
      {/* janela redonda: estrelas e a Terra */}
      <defs><clipPath id="janela-espaco"><circle cx={1060} cy={420} r={215} /></clipPath></defs>
      <g clipPath="url(#janela-espaco)">
        <rect x={830} y={190} width={460} height={460} fill="#0E1426" />
        {Array.from({ length: 26 }, (_, i) => <circle key={i} cx={850 + ((i * 131) % 420)} cy={210 + ((i * 71) % 260)} r={2 + (i % 3)} fill="#FFFFFF" />)}
        <circle cx={1130} cy={700} r={300} fill="#3F7FC0" stroke={L} strokeWidth={7} />
        <g transform={`translate(${-((t * 14) % 240)} 0)`}>
          {[0, 240, 480].map((dx) => (
            <path key={dx} d={`M ${910 + dx} 470 q 60 -40 110 0 q 30 40 -20 70 q -60 10 -90 -70 Z M ${1060 + dx} 430 q 40 -14 70 14 q -24 30 -70 -14 Z`} fill="#6DAA5C" stroke={L} strokeWidth={4} />
          ))}
        </g>
        <path d="M 830 470 Q 1130 380 1350 470" stroke="#FFFFFF" strokeWidth={10} opacity={0.5} fill="none" />
      </g>
      <circle cx={1060} cy={420} r={226} fill="none" stroke="#9AA3AD" strokeWidth={22} />
      <circle cx={1060} cy={420} r={215} fill="none" stroke={L} strokeWidth={7} />
      <circle cx={1060} cy={420} r={237} fill="none" stroke={L} strokeWidth={7} />
      {/* duto de ar */}
      <rect x={1600} y={150} width={200} height={110} rx={10} fill="#B9BEC6" stroke={L} strokeWidth={6} />
      {[0, 1, 2, 3].map((i) => <line key={i} x1={1620} y1={174 + i * 22} x2={1780} y2={174 + i * 22} stroke={L} strokeWidth={5} />)}
    </g>
  );
  const Frente: React.FC<{ t: number }> = () => null;
  return { set, Fundo, Meio, Frente };
})();
/** flutuando: sobe, gira devagar, pernas soltas, sem sombra no chão */
const flutua = (p: PersonProps, f: number, fase: number, alto = 120): PersonProps => ({
  ...p, pulo: alto + Math.sin(f / 22 + fase) * 22, giro: Math.sin(f / 30 + fase) * 9, semSombraChao: true,
  footL: [-36, -12 + Math.sin(f / 15 + fase) * 10], footR: [34, -2], kneeL: 14, kneeR: 10,
});
const p39: PlanoV = {
  nome: "estação espacial", de: CORTE(110), ate: CORTE(113), enquadra: { x: 960, y: 560, zoom: 1.0 },
  eventos: [
    { f: CORTE(110), tipo: "corte", desc: "flutuando na estação espacial" },
    { f: T(111, fracDe(111, "mãe")), tipo: "objeto", desc: "MÃE" },
    { f: T(111, fracDe(111, "melhor amigo")), tipo: "objeto", desc: "MELHOR AMIGO" },
    { f: T(112, fracDe(112, "comendo")), tipo: "objeto", desc: "a mãe come o biscoito perto da janela", verbo: "comer" },
    { f: T(113, 0.2), tipo: "objeto", desc: "migalhas indo para o duto de ar" },
  ],
  Cena: ({ f, cam }) => {
    const set = ESPACO.set;
    const p = flutua({ ...props(PROTAGONISTA), ...idle(emPe(set, "chao", 280))(f), expr: f >= T(113) ? "chocado" : "rindo", handL: [-120, -250], handR: [116, -262], gripL: "open", gripR: "open" }, f, 0, 70);
    const a = flutua(emPeNa(AMIGO, set, "chao", 610, f, { expr: "rindo", handL: [-104, -286], handR: [110, -300], gripL: "open", gripR: "open" }), f, 2, 180);
    const comendo = f >= T(112, fracDe(112, "comendo")) && f < T(113);
    const b = 0.5 + 0.5 * Math.sin(f / 5);
    let m = flutua(emPeNa(MAE, set, "chao", 1480, f, {
      expr: f >= T(113) ? "chocado" : "rindo",
      fala: comendo ? 0.4 * (1 - b) : 0,
      handL: [-110, -200], gripL: "open",
    }), f, 4);
    m = segura(m, "R", comendo ? [24 + 16 * b, -290 + 4 * b] : [86, -230], BISCOITO, { t: 0 }, 0);
    p.lookAt = olhar(p, f >= T(113) ? [1690, 230] : [1060, 420]);
    a.lookAt = olhar(a, f >= T(113) ? [1690, 230] : [1480, 420]);
    m.lookAt = olhar(m, f >= T(113) ? [1690, 230] : [1060, 420]);
    // migalhas: saem da boca da mãe e flutuam para o duto
    const boca: [number, number] = [1480 + 30, 962 - (m.pulo ?? 0) - 296 * 1.2];
    const migalhas = f >= T(113) ? Array.from({ length: 10 }, (_, i) => {
      const k = lim((f - T(113) - i * 2.5) / 34);
      const x = boca[0] + (1690 - boca[0]) * k + Math.sin(f / 4 + i) * 8;
      const y = boca[1] + (215 - boca[1]) * k + Math.cos(f / 5 + i * 2) * 8;
      return k < 1 ? <circle key={i} cx={x} cy={y} r={8 + (i % 3) * 2} fill="#D9A45E" stroke={L} strokeWidth={3.5} /> : null;
    }) : null;
    const s = escalaPop(f, T(113, 0.25), Infinity, 8);
    return (
      <CenaCam cenario={ESPACO} f={f} cam={cam}
        noMeio={<>
          <Person {...p} semente={1} />
          <Person {...a} semente={4} />
          <Person {...m} semente={2} />
          {migalhas}
          {s > 0 && (
            <g transform={`translate(1700 330) scale(${s})`}>
              <path d="M 0 -50 L 48 36 L -48 36 Z" transform="translate(5 6)" fill="#D6D2CA" />
              <path d="M 0 -50 L 48 36 L -48 36 Z" fill="#F2D16B" stroke={L} strokeWidth={7} strokeLinejoin="round" />
              <Texto texto="!" tam={56} cor={L} y={26} contorno={0} />
            </g>
          )}
        </>}
      />
    );
  },
  Sobre: ({ f }) => (
    <>
      <TextoPop x={1480} y={170} f={f} de={T(111, fracDe(111, "mãe"))} ate={T(112, 0.5)} texto="MÃE" tam={60} cor="#E0826E" rot={-3} />
      <TextoPop x={600} y={140} f={f} de={T(111, fracDe(111, "melhor amigo"))} ate={T(112, 0.5)} texto="MELHOR AMIGO" tam={56} cor="#7FD18C" rot={2} />
    </>
  ),
};

// ------------------------------------------------------------------ 40. cartela OURO
const BarrasIcone: React.FC = () => (
  <g transform="scale(1.8) translate(0 24)">
    {[[-40, 0], [40, 0], [0, -26]].map(([x, y], i) => <g key={i} transform={`translate(${x} ${y})`}><BARRA_OURO.Desenho t={0} /></g>)}
  </g>
);
const p40 = cartela(CORTE(113), 114, 115, "OURO", BarrasIcone);

// ------------------------------------------------------------------ 41. todo o ouro: um cubo de 22 m, tão alto quanto um prédio de 7 andares; dezenas de trilhões de reais
const AREIA = liso("#EADFCB", 0.5);
const CUBO = { x: 300, lado: 540 };
const Predio7: React.FC<{ x: number; base: number; w: number; h: number }> = ({ x, base, w, h }) => {
  const a = h / 7;
  return (
    <g>
      <rect x={x - w / 2 + 6} y={base - h + 7} width={w} height={h} fill="#D6D2CA" />
      <rect x={x - w / 2} y={base - h} width={w} height={h} fill="#C9D3E0" stroke={L} strokeWidth={7} />
      {Array.from({ length: 7 }, (_, i) => [-w / 3, 0, w / 3].map((dx) => (
        <rect key={`${i}${dx}`} x={x + dx - 26} y={base - h + i * a + a * 0.22} width={52} height={a * 0.5} fill="#9ED8F5" stroke={L} strokeWidth={4} />
      )))}
      {Array.from({ length: 6 }, (_, i) => <line key={i} x1={x - w / 2} y1={base - h + (i + 1) * a} x2={x + w / 2} y2={base - h + (i + 1) * a} stroke={L} strokeWidth={3} opacity={0.35} />)}
      <rect x={x - w / 2 - 10} y={base - h - 16} width={w + 20} height={20} fill="#AEB8C6" stroke={L} strokeWidth={6} />
    </g>
  );
};
const p41: PlanoV = {
  nome: "o cubo de ouro", de: CORTE(115), ate: CORTE(117), enquadra: { x: 960, y: 560, zoom: 1.0 },
  eventos: [
    { f: CORTE(115), tipo: "corte", desc: "o cubo de ouro sobe do chão" },
    { f: CORTE(115) + 14, tipo: "objeto", desc: "o cubo termina de subir" },
    { f: T(116, fracDe(116, "cubo")), tipo: "expressao", desc: "o protagonista se espanta" },
    { f: T(116, fracDe(116, "22 metros")), tipo: "objeto", desc: "22 m" },
    { f: T(116, fracDe(116, "tão alto")), tipo: "objeto", desc: "prédio de 7 andares, mesma altura" },
    { f: T(116, fracDe(116, "sete andares")), tipo: "objeto", desc: "7 ANDARES" },
    { f: T(117, fracDe(117, "dezenas")), tipo: "objeto", desc: "dezenas de trilhões de reais" },
  ],
  Cena: ({ f, cam }) => {
    const set = AREIA.set;
    const p: PersonProps = { ...props(PROTAGONISTA), ...idle(emPe(set, "chao", 1090))(f), expr: expressaoNoQuadro([[0, "neutro"], [T(116, fracDe(116, "cubo")), "chocado"]], f, 6) };
    p.lookAt = olhar(p, [600, 300]);
    const k = entre(f, CORTE(115) + 2, CORTE(115) + 22);
    const fPredio = T(116, fracDe(116, "tão alto"));
    const kp = entre(f, fPredio, fPredio + 14);
    const base = 962;
    const topo = base - CUBO.lado;
    const s22 = escalaPop(f, T(116, fracDe(116, "22 metros")), T(117, fracDe(117, "dezenas")));
    return (
      <CenaCam cenario={AREIA} f={f} cam={cam}
        noMeio={<>
          <g transform={`translate(${CUBO.x} ${base}) scale(1 ${k.toFixed(4)})`}><CuboOuro lado={CUBO.lado} /></g>
          {kp > 0 && <g transform={`translate(0 ${base}) scale(1 ${kp.toFixed(4)}) translate(0 ${-base})`}><Predio7 x={1460} base={base} w={300} h={CUBO.lado} /></g>}
          {kp >= 1 && <line x1={CUBO.x + CUBO.lado + 20} y1={topo} x2={1300} y2={topo} stroke={L} strokeWidth={5} strokeDasharray="18 14" />}
          {s22 > 0 && (
            <g>
              <line x1={CUBO.x - 50} y1={topo} x2={CUBO.x - 50} y2={base} stroke={L} strokeWidth={6} />
              <path d={`M ${CUBO.x - 70} ${topo} l 40 0 M ${CUBO.x - 70} ${base} l 40 0`} stroke={L} strokeWidth={6} />
              <g transform={`translate(${CUBO.x - 50} ${(topo + base) / 2}) rotate(-90) scale(${s22})`}>
                <rect x={-80} y={-40} width={160} height={70} rx={14} fill="#FFFFFF" stroke={L} strokeWidth={6} />
                <Texto texto="22 m" tam={52} cor="#E3B95B" y={14} contorno={9} />
              </g>
            </g>
          )}
          <Person {...p} semente={1} />
        </>}
      />
    );
  },
  Sobre: ({ f }) => (
    <>
      <TextoPop x={1460} y={330} f={f} de={T(116, fracDe(116, "sete andares"))} ate={T(117, fracDe(117, "dezenas"))} texto="7 ANDARES" tam={58} rot={-3} />
      <TextoPop x={1000} y={130} f={f} de={T(117, fracDe(117, "dezenas"))} ate={CORTE(117)} texto="DEZENAS DE TRILHÕES" tam={78} cor="#F2D16B" rot={-3} />
      <TextoPop x={1000} y={222} f={f} de={T(117, fracDe(117, "reais"))} ate={CORTE(117)} texto="DE REAIS" tam={58} rot={2} />
    </>
  ),
};

// ------------------------------------------------------------------ 42. você começa a comprar; toda vez que compra, o preço sobe; mais caro até para você
const COMPRAS = [T(118, 0.55), T(119, 0.2), T(119, 0.5), T(119, 0.8), T(120, 0.1), T(120, 0.3), T(120, 0.5)];
const PRECO = [0.06, 0.13, 0.22, 0.33, 0.47, 0.63, 0.8, 0.98];
const OURO_CLARO = liso("#EADFCB");
const p42: PlanoV = {
  nome: "comprar ouro faz o preço subir", de: CORTE(117), ate: CORTE(120), enquadra: { x: 960, y: 560, zoom: 1.0 },
  eventos: [
    { f: CORTE(117), tipo: "corte", desc: "o protagonista e o gráfico do preço" },
    { f: COMPRAS[0], tipo: "objeto", desc: "primeira compra: BIP, barra cai na pilha", verbo: "comprar" },
    { f: COMPRAS[1], tipo: "objeto", desc: "compra de novo", verbo: "comprar" },
    { f: COMPRAS[1] + 2, tipo: "objeto", desc: "o preço sobe um degrau", verbo: "subir" },
    { f: T(120, fracDe(120, "mais caro")), tipo: "expressao", desc: "mais caro: susto" },
    { f: T(120, fracDe(120, "até mesmo")), tipo: "objeto", desc: "até para você" },
  ],
  Cena: ({ f, cam }) => {
    const set = OURO_CLARO.set;
    const n = COMPRAS.filter((c) => f >= c).length;
    // a cada compra o cartão sobe (BIP) e uma barra cai na pilha do chão
    const ult = [...COMPRAS].reverse().find((c) => f >= c - 5);
    const ergue = ult === undefined ? 0 : entre(f, ult - 5, ult) * (1 - entre(f, ult + 6, ult + 13));
    let p: PersonProps = {
      ...props(PROTAGONISTA), ...idle(emPe(set, "chao", 330))(f),
      expr: expressaoNoQuadro([[0, "convencido"], [T(119, 0.6), "olhar-lateral"], [T(120, fracDe(120, "mais caro")), "chocado"]], f, 6),
    };
    p = segura(p, "R", [84 + 30 * ergue, -170 - 110 * ergue], CARTAO, { t: 0, brilho: ergue }, -10 - 20 * ergue);
    p.lookAt = olhar(p, f >= T(119, 0.6) ? [1320, 480] : [760, 900]);
    const POS: [number, number][] = [[-186, 0], [-62, 0], [62, 0], [186, 0], [-124, -42], [0, -42], [124, -42]];
    const barras = POS.slice(0, n).map(([x, y], i) => {
      const cai = 1 - entre(f, COMPRAS[i], COMPRAS[i] + 6);
      return <g key={i} transform={`translate(${760 + x} ${962 + y - cai * 260}) scale(1.6)`}><BARRA_OURO.Desenho t={0} /></g>;
    });
    return <CenaCam cenario={OURO_CLARO} f={f} cam={cam} noMeio={<>{barras}<Person {...p} semente={1} /></>} />;
  },
  Sobre: ({ f }) => {
    // gráfico em degraus: anda para a direita com o tempo e sobe um degrau a cada compra
    const x0 = CORTE(117), x1 = T(120, 0.85);
    const xs = (q: number) => lim((q - x0) / (x1 - x0));
    const pts: [number, number][] = [[0, PRECO[0]]];
    COMPRAS.forEach((c, i) => { if (f >= c) { pts.push([xs(c), PRECO[i]]); pts.push([xs(c), PRECO[i] + (PRECO[i + 1] - PRECO[i]) * entre(f, c, c + 5)]); } });
    const n = COMPRAS.filter((c) => f >= c).length;
    pts.push([Math.max(xs(f), pts[pts.length - 1][0]), pts[pts.length - 1][1]]);
    return (
      <>
        <g transform="translate(1320 500)"><Grafico pontos={pts} w={620} h={340} cor="#E3B95B" /></g>
        <TextoPop x={1320} y={250} f={f} de={CORTE(117) + 4} texto="PREÇO DO OURO" tam={56} cor="#F2D16B" rot={-2} />
        {COMPRAS.map((c, i) => <Estrela key={i} x={560 + (i % 2 ? 50 : -40)} y={420 - (i % 3) * 24} f={f} de={c} ate={c + 12} texto="BIP!" r={62} />)}
        {n > 0 && <g transform={`translate(1660 ${700 - (PRECO[n] ?? 1) * 340}) scale(${0.8 * escalaPop(f, T(119, 0.3))})`}><SetaCima /></g>}
        <TextoPop x={1320} y={790} f={f} de={T(120, fracDe(120, "mais caro"))} ate={CORTE(120)} texto="MAIS CARO" tam={64} cor="#E0826E" rot={-3} />
        <TextoPop x={1320} y={880} f={f} de={T(120, fracDe(120, "até mesmo"))} ate={CORTE(120)} texto="ATÉ PARA VOCÊ" tam={54} rot={2} />
      </>
    );
  },
};

// ------------------------------------------------------------------ 43. cartela CONTAGEM
const RelogioIcone: React.FC = () => {
  const f = useCurrentFrame();
  return <g transform="scale(1.1)"><IconeRelogio giro={f * 30} /></g>;
};
const p43 = cartela(CORTE(120), 121, 122, "CONTAGEM", RelogioIcone);

// ------------------------------------------------------------------ 44. saldo: um oito deitado. R$ 1 por segundo: 11 dias = 1 milhão; 32 anos = 1 bilhão; 32 mil anos = 1 trilhão; antes da primeira cidade
const AZUL = liso("#D9E4EC");
const SEPIA = liso("#CDB58A");
const p44: PlanoV = {
  nome: "contando o dinheiro", de: CORTE(122), ate: CORTE(127), enquadra: { x: 960, y: 560, zoom: 1.0 },
  eventos: [
    { f: CORTE(122), tipo: "corte", desc: "o saldo no celular" },
    { f: T(123, fracDe(123, "oito")), tipo: "objeto", desc: "um oito deitado" },
    { f: T(124), tipo: "pose", desc: "começa a contar moedas" },
    { f: T(124, fracDe(124, "11 dias")), tipo: "objeto", desc: "11 dias: um milhão" },
    { f: T(125), tipo: "pose", desc: "32 anos depois: barba branca" },
    { f: T(126), tipo: "objeto", desc: "32 mil anos: tudo em sépia" },
    { f: T(127), tipo: "pose", desc: "contando tracinhos numa pedra" },
    { f: T(127, fracDe(127, "muito antes")), tipo: "objeto", desc: "ANTES DA PRIMEIRA CIDADE" },
  ],
  Cena: ({ f, cam }) => {
    const antigo = f >= T(126);
    const fundo = antigo ? SEPIA : AZUL;
    const set = fundo.set;
    const velho = f >= T(125);
    const caverna = f >= T(127);
    let p: PersonProps = {
      ...props(PROTAGONISTA), ...idle(emPe(set, "chao", 640))(f),
      expr: expressaoNoQuadro([[0, "convencido"], [T(124), "neutro"], [T(125), "triste"], [T(126), "chocado"], [T(127), "bravo"]], f, 6),
      ...(velho ? { beard: "#F4F1EA", mustache: "#F4F1EA", hair: "laterais" as const, hairColor: "#F4F1EA" } : {}),
      ...(caverna ? { outfit: { camiseta: "#8A5E3F", calca: "#6E4B35", tenis: "#6E4B35", sola: "#4A3424" }, hair: "cacheado" as const, hairColor: "#3B2A20", beard: "#3B2A20", mustache: "#3B2A20" } : {}),
    };
    if (f >= T(124) && !caverna) {
      const vai = (f - T(124)) % 14 < 7;
      p = segura(p, "R", vai ? [104, -190] : [110, -150], MOEDA, { t: 0 }, 0);
    }
    if (caverna) p = { ...p, handR: [130, -150 + Math.sin(f / 2) * 10], gripR: "fist" };
    p.lookAt = olhar(p, caverna ? [900, 820] : [1280, 470]);
    const pilha = f >= T(124) && !caverna ? Math.min(9, Math.floor((f - T(124)) / 7)) : 0;
    return (
      <CenaCam cenario={fundo} f={f} cam={cam}
        noMeio={<>
          {Array.from({ length: pilha }, (_, i) => <g key={i} transform={`translate(${830 + (i % 3) * 6} ${962 - i * 9})`}><ellipse cx={0} cy={0} rx={30} ry={10} fill="#E3B95B" stroke={L} strokeWidth={4} /></g>)}
          {caverna && <g transform="translate(940 830) scale(0.9)"><PedraTracinhos n={Math.min(25, Math.floor((f - T(127)) / 2.5) + 6)} /></g>}
          <Person {...p} semente={1} />
        </>}
      />
    );
  },
  Sobre: ({ f }) => {
    const sCel = escalaPop(f, CORTE(122) + 3, T(124));
    const flash = (q: number) => (f >= q && f < q + 8 ? 1 - (f - q) / 8 : 0);
    const fl = Math.max(flash(T(125)), flash(T(126)), flash(T(127)));
    const sCal = escalaPop(f, T(124, fracDe(124, "11 dias")), T(125));
    return (
      <>
        {sCel > 0 && (
          <g transform={`translate(1280 500) scale(${(1.25 * sCel).toFixed(4)})`}>
            <IconeCelular>
              <rect x={0} y={0} width={160} height={52} fill="#2B3447" />
              <text x={80} y={35} textAnchor="middle" fontFamily={FONTE} fontWeight={900} fontSize={22} fill="#FFFFFF">SALDO</text>
              <text x={80} y={112} textAnchor="middle" fontFamily={FONTE} fontWeight={900} fontSize={30} fill="#141414">R$</text>
            </IconeCelular>
          </g>
        )}
        <Infinito x={1280} y={565} f={f} de={T(123, fracDe(123, "oito"))} ate={T(124)} s={0.42} />
        <Contador x={1280} y={300} f={f} de={T(124, 0.05)} ate={T(124, fracDe(124, "11 dias"))} valor={1000000} prefixo="R$ " tam={84} cor="#7FD18C" fim={T(125)} />
        <TextoPop x={1280} y={420} f={f} de={T(124, 0.05)} ate={T(124, fracDe(124, "11 dias"))} texto="R$ 1 POR SEGUNDO" tam={44} rot={2} />
        {sCal > 0 && <g transform={`translate(1280 540) scale(${2 * sCal})`}><IconeCalendario texto="11" sub="DIAS" /></g>}
        <TextoPop x={1280} y={300} f={f} de={T(125)} ate={T(126)} texto="R$ 1 BILHÃO" tam={84} cor="#7FD18C" rot={-3} />
        <TextoPop x={1280} y={490} f={f} de={T(125, 0.35)} ate={T(126)} texto="32 ANOS" tam={120} cor="#F2D16B" rot={2} />
        <TextoPop x={1280} y={300} f={f} de={T(126)} ate={T(127)} texto="R$ 1 TRILHÃO" tam={84} cor="#7FD18C" rot={-3} />
        <TextoPop x={1280} y={490} f={f} de={T(126, 0.35)} ate={T(127)} texto="32 MIL ANOS" tam={110} cor="#F2D16B" rot={2} />
        <TextoPop x={1300} y={220} f={f} de={T(127, fracDe(127, "muito antes"))} ate={CORTE(127)} texto="ANTES DA" tam={60} rot={-3} />
        <TextoPop x={1300} y={310} f={f} de={T(127, fracDe(127, "muito antes")) + 3} ate={CORTE(127)} texto="PRIMEIRA CIDADE" tam={66} cor="#F2D16B" rot={-3} />
        {fl > 0 && <rect x={0} y={0} width={1920} height={1080} fill="#FFFFFF" opacity={fl * 0.85} />}
      </>
    );
  },
};

export const CAP6: PlanoV[] = [p37, p38, p39, p40, p41, p42, p43, p44];
export const FIM_CAP6 = CORTE(127);
export const FIGURADOS_CAP6: Record<number, string[]> = {};
