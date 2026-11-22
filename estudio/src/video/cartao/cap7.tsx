// Capítulo 7 (falas 128 a 157): casas (compra a rua, entrega as chaves, festa; a rua vizinha fica 20% mais cara),
// o Brasil percebe, o laboratório do banco testa o cartão, o governo adora (impostos), a fila de caridade, acabar com a
// fome e o que o dinheiro não resolve (estrada na guerra, colheita, falta de profissionais): parte ajuda, muito fica preso.
import React from "react";
import { useCurrentFrame } from "remotion";
import { Person, type PersonProps } from "../../components/Person";
import { expressaoNoQuadro } from "../../components/Face";
import { celebrate, idle, lookAtPhone, scared, shrug, walk } from "../../rig/actions";
import { CARTAO, CEDULA, MOEDA, SACO } from "../../objects/extras";
import { BALAO, CHAVE, TACA } from "../../objects/extras2";
import type { ObjetoDef } from "../../objects/objetos";
import { emPe } from "../../cenarios/ancoras";
import { liso } from "../../cenarios/liso/Liso";
import { RUA } from "../../cenarios/rua/Rua";
import { CONSULTORIO } from "../../cenarios/consultorio/Consultorio";
import { escritorioCom } from "../../cenarios/escritorio/Escritorio";
import type { Ator } from "../../elenco/elenco";
import { MEDICA, PROTAGONISTA, figurante } from "../../elenco/elenco";
import { emPeNa, olhar, props } from "../../fase4/Cenarios";
import { FONTE } from "../../fontes";
import { Estrela, IconeAmbulancia, IconeCalendario, IconeCasa, IconeCesta, IconeEscola, IconeHospital, IconePrancheta, IconePrato, IconeRelogio, IconeX, Infinito, Selo, SetaCima, Texto, TextoPop, escalaPop } from "../graficos";
import { CenaCam, entre, fracDe, segura, type PlanoV } from "./comum";
import { cartela } from "./titulo";
import { CORTE, T } from "./tempo";
import { FIM_CAP6 } from "./cap6";
import { CASA_TOPO, LAB, PALETAS_RUA, RUA_CASAS, RUA_VIZINHA, VARANDA } from "./cenas";

const lim = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const L = "#141414";
const XRES = PALETAS_RUA[0].map((c) => c.x);
const MORADORES = [31, 32, 33, 35].map((s) => figurante(s));
/** chave grande (plano aberto: a chave normal some na mão) */
const CHAVE_G: ObjetoDef = { ...CHAVE, nome: "chave grande", pega: (e) => { const [x, y] = CHAVE.pega(e); return [x * 2, y * 2]; }, Desenho: (e) => <g transform="scale(2)"><CHAVE.Desenho {...e} /></g> };

/** coração (o governo te adora) */
const Coracao: React.FC<{ s?: number }> = ({ s = 1 }) => (
  <g transform={`scale(${s})`}>
    <path d="M 0 30 C -50 0 -40 -40 -14 -40 C -4 -40 0 -30 0 -24 C 0 -30 4 -40 14 -40 C 40 -40 50 0 0 30 Z" transform="translate(5 6)" fill="#D6D2CA" />
    <path d="M 0 30 C -50 0 -40 -40 -14 -40 C -4 -40 0 -30 0 -24 C 0 -30 4 -40 14 -40 C 40 -40 50 0 0 30 Z" fill="#E0826E" stroke={L} strokeWidth={6} strokeLinejoin="round" />
  </g>
);
/** placa de VENDIDO pendurada na casa */
const PlacaVendido: React.FC<{ s: number; texto?: string; cor?: string }> = ({ s, texto = "VENDIDO", cor = "#C0504D" }) => (
  <g transform={`scale(${s}) rotate(-6)`}>
    <rect x={-96} y={-32} width={192} height={64} rx={10} transform="translate(5 6)" fill="#D6D2CA" />
    <rect x={-96} y={-32} width={192} height={64} rx={10} fill={cor} stroke={L} strokeWidth={6} />
    <text x={0} y={13} textAnchor="middle" fontFamily={FONTE} fontWeight={900} fontSize={texto.length > 8 ? 28 : 36} fill="#FFFFFF">{texto}</text>
  </g>
);
/** carimbo retangular (PAGO, NORMAL, PRESO) */
const Carimbo: React.FC<{ x: number; y: number; f: number; de: number; ate?: number; texto: string; cor: string; rot?: number; tam?: number }> = ({ x, y, f, de, ate, texto, cor, rot = -10, tam = 50 }) => {
  const s = escalaPop(f, de, ate, 6);
  if (s <= 0) return null;
  const w = texto.length * tam * 0.72 + 50;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      <rect x={-w / 2} y={-tam * 0.85} width={w} height={tam * 1.5} rx={10} fill="#FFFFFF" fillOpacity={0.85} stroke={cor} strokeWidth={9} />
      <text x={0} y={tam * 0.36} textAnchor="middle" fontFamily={FONTE} fontWeight={900} fontSize={tam} fill={cor} letterSpacing={3}>{texto}</text>
    </g>
  );
};
/** confete caindo (coordenadas da tela) */
const Confete: React.FC<{ f: number; de: number }> = ({ f, de }) => {
  if (f < de) return null;
  const k = f - de;
  return (
    <g>
      {Array.from({ length: 40 }, (_, i) => {
        const x = (i * 197) % 1920 + Math.sin(k / 8 + i) * 20;
        const y = -40 + ((k * (6 + (i % 4)) + i * 53) % 1160);
        return <rect key={i} x={x} y={y} width={14} height={22} rx={3} fill={["#E0826E", "#F2D16B", "#7FD18C", "#5AA5B8", "#E37BA1"][i % 5]} stroke={L} strokeWidth={2.5} transform={`rotate(${(k * 9 + i * 40) % 360} ${x + 7} ${y + 11})`} />;
      })}
    </g>
  );
};

// ------------------------------------------------------------------ 45. cartela CASAS
const CasaIcone: React.FC = () => {
  const f = useCurrentFrame();
  return <g transform={`translate(0 ${-Math.abs(Math.sin(f / 5)) * 10}) scale(1.5)`}><IconeCasa /></g>;
};
const p45 = cartela(FIM_CAP6, 128, 129, "CASAS", CasaIcone);

// ------------------------------------------------------------------ 46. compra todas as casas da rua; entrega as chaves aos moradores; chaves para todos
const p46: PlanoV = {
  nome: "rua: compra as casas e entrega as chaves", de: CORTE(129), ate: CORTE(132), enquadra: { x: 960, y: 590, zoom: 1.0 },
  eventos: [
    { f: CORTE(129), tipo: "corte", desc: "a rua de casas" },
    { f: T(130, 0.3), tipo: "objeto", desc: "VENDIDO em cada casa", verbo: "comprar" },
    { f: T(131, fracDe(131, "entrega")), tipo: "objeto", desc: "entrega a chave ao morador", verbo: "entregar" },
    { f: T(131, fracDe(131, "pessoas")), tipo: "pose", desc: "os moradores recebem as chaves" },
    { f: T(132), tipo: "pose", desc: "chaves para todos: erguem as chaves" },
  ],
  Cena: ({ f, cam }) => {
    const set = RUA_CASAS.set;
    const fEnt = T(131, fracDe(131, "entrega"));
    const passa = fEnt + 12;
    let p: PersonProps = { ...props(PROTAGONISTA), ...idle(emPe(set, "chao", 940))(f), expr: f >= T(131) ? "rindo" : "convencido" };
    if (f < T(131)) {
      const ergue = entre(f, T(130), T(130, 0.25));
      p = segura(p, "R", [84 + 20 * ergue, -170 - 110 * ergue], CARTAO, { t: 0, brilho: ergue }, -10 - 20 * ergue);
    } else if (f < passa) {
      p = segura(p, "R", [84 + 70 * entre(f, T(131), fEnt), -200], CHAVE_G, { t: 0 }, 0);
    }
    p.lookAt = olhar(p, f >= T(131) ? [1170, 650] : [960, 400]);
    const moradores = MORADORES.map((a, i) => {
      let m = emPeNa(a, set, "chao", XRES[i] + (i === 2 ? 0 : 30), f + i * 11, { expr: f >= T(131, fracDe(131, "pessoas")) ? "rindo" : f >= T(130, 0.3) ? "chocado" : "neutro" });
      const alto = f >= T(132);
      if (i === 2) {
        if (f >= fEnt) m = segura(m, "L", alto ? [-100, -330] : f < passa ? [-120 + 20 * entre(f, fEnt, passa), -200] : [-90, -200], CHAVE_G, { t: 0 }, alto ? 30 : 0);
      } else if (f >= T(131, fracDe(131, "pessoas")) + i * 3) {
        m = segura(m, "R", alto ? [100, -330] : [74, -200], CHAVE_G, { t: 0 }, alto ? -30 : 0);
      }
      m.lookAt = olhar(m, alto ? [m.x, 300] : [940, 650]);
      return m;
    });
    return (
      <CenaCam cenario={RUA_CASAS} f={f} cam={cam}
        noMeio={<>
          {XRES.map((x, i) => {
            const s = escalaPop(f, T(130, 0.15) + i * 4, Infinity, 7);
            return s > 0 ? <g key={x} transform={`translate(${x} ${CASA_TOPO - 70})`}><PlacaVendido s={s} /></g> : null;
          })}
          {moradores.map((m, i) => <Person key={i} {...m} semente={31 + i} />)}
          <Person {...p} semente={1} />
        </>}
      />
    );
  },
  Sobre: ({ f }) => <Estrela x={1160} y={420} f={f} de={T(130, 0.2)} ate={T(131)} texto="BIP!" r={80} />,
};

// ------------------------------------------------------------------ 47. festa no quarteirão: bandeirinhas, balões, bolo e muita comemoração
const Bandeirinhas: React.FC<{ k: number }> = ({ k }) => {
  const n = Math.floor(k * 36);
  return (
    <g>
      <path d="M -60 380 Q 480 470 960 380 Q 1440 470 1980 380" stroke={L} strokeWidth={4} fill="none" />
      {Array.from({ length: n }, (_, i) => {
        const t = i / 36;
        const x = -60 + t * 2040;
        const u = (t * 2) % 1;
        const y = 384 + 180 * u * (1 - u);
        return <path key={i} d={`M ${x - 18} ${y} L ${x + 18} ${y} L ${x} ${y + 40} Z`} fill={["#E0826E", "#F2D16B", "#7FD18C", "#5AA5B8", "#E37BA1"][i % 5]} stroke={L} strokeWidth={4} strokeLinejoin="round" />;
      })}
    </g>
  );
};
const Bolo: React.FC = () => (
  <g>
    <rect x={-150} y={-20} width={300} height={24} rx={6} fill="#F4F1EA" stroke={L} strokeWidth={6} />
    {[-120, 120].map((x) => <rect key={x} x={x - 8} y={4} width={16} height={86} fill="#A9714E" stroke={L} strokeWidth={5} />)}
    <rect x={-80} y={-110} width={160} height={90} rx={12} fill="#E37BA1" stroke={L} strokeWidth={6} />
    <path d="M -80 -96 q 20 22 40 0 q 20 22 40 0 q 20 22 40 0 q 20 22 40 0" fill="#FFFFFF" stroke={L} strokeWidth={5} />
    {[-40, 0, 40].map((x) => <g key={x}><rect x={x - 5} y={-140} width={10} height={30} fill="#F2D16B" stroke={L} strokeWidth={3} /><path d={`M ${x} -154 q 8 8 0 14 q -8 -6 0 -14 Z`} fill="#E0826E" /></g>)}
  </g>
);
const CORES_BALAO = ["#E0826E", "#5AA5B8", "#F2D16B", "#7FD18C"];
const p47: PlanoV = {
  nome: "festa no quarteirão", de: CORTE(132), ate: CORTE(134), enquadra: { x: 960, y: 600, zoom: 1.04 },
  eventos: [
    { f: CORTE(132), tipo: "corte", desc: "a festa" },
    { f: T(133, 0.2), tipo: "objeto", desc: "bandeirinhas" },
    { f: T(134), tipo: "objeto", desc: "balões" },
    { f: T(134, fracDe(134, "bolo")), tipo: "objeto", desc: "bolo" },
    { f: T(134, fracDe(134, "comemoração")), tipo: "pose", desc: "todo mundo comemora" },
  ],
  Cena: ({ f, cam }) => {
    const set = RUA_CASAS.set;
    const festa = f >= T(134, fracDe(134, "comemoração"));
    let p: PersonProps = festa ? { ...props(PROTAGONISTA), ...celebrate(emPe(set, "chao", 1010))(f - T(134, fracDe(134, "comemoração"))) } : { ...props(PROTAGONISTA), ...idle(emPe(set, "chao", 1010))(f), expr: "rindo" };
    p.lookAt = olhar(p, [960, 500]);
    const xs = [300, 560, 1340, 1600];
    const gente = MORADORES.map((a, i) => {
      const base = emPe(set, "chao", xs[i], 0, a.scale ?? 1);
      let m: PersonProps = festa ? { ...props(a), ...celebrate({ ...base, wide: a.wide })(f - T(134, fracDe(134, "comemoração")) + i * 5) } : { ...props(a), ...idle({ ...base, wide: a.wide })(f + i * 9), expr: "rindo" };
      if (f >= T(134) && i % 2 === 0) m = festa ? m : segura(m, "R", [90, -260], BALAO, { t: f / 30, cor: CORES_BALAO[i] }, 0);
      m.lookAt = olhar(m, [960, 600]);
      return m;
    });
    const kb = entre(f, T(133, 0.1), T(133, 0.1) + 18);
    const sBolo = escalaPop(f, T(134, fracDe(134, "bolo")), Infinity, 7);
    return (
      <CenaCam cenario={RUA_CASAS} f={f} cam={cam}
        noMeio={<>
          <Bandeirinhas k={kb} />
          {f >= T(134) && [180, 860, 1240, 1760].map((x, i) => {
            const s = escalaPop(f, T(134) + i * 3, Infinity, 6);
            return <g key={x} transform={`translate(${x} ${560 + (i % 2) * 40}) scale(${2 * s})`}><BALAO.Desenho t={f / 30 + i} cor={CORES_BALAO[i]} /></g>;
          })}
          {sBolo > 0 && <g transform={`translate(780 880) scale(${sBolo})`}><Bolo /></g>}
          {gente.map((m, i) => <Person key={i} {...m} semente={31 + i} />)}
          <Person {...p} semente={1} />
        </>}
      />
    );
  },
  Sobre: ({ f }) => <Confete f={f} de={T(134, fracDe(134, "comemoração"))} />,
};

// ------------------------------------------------------------------ 48. então, algo estranho acontece (a festa continua, ele vira a cabeça)
const p48: PlanoV = {
  nome: "algo estranho", de: CORTE(134), ate: CORTE(135), enquadra: { x: 1010, y: 640, zoom: 1.7 },
  eventos: [
    { f: CORTE(134), tipo: "corte", desc: "close no protagonista na festa" },
    { f: T(135, fracDe(135, "algo estranho")), tipo: "expressao", desc: "para de comemorar e olha para o lado" },
  ],
  Cena: ({ f, cam }) => {
    const set = RUA_CASAS.set;
    const nota = f >= T(135, fracDe(135, "algo estranho"));
    let p: PersonProps = nota ? { ...props(PROTAGONISTA), ...idle(emPe(set, "chao", 1010))(f), expr: "olhar-lateral" } : { ...props(PROTAGONISTA), ...celebrate(emPe(set, "chao", 1010))(f) };
    p.lookAt = olhar(p, nota ? [1700, 500] : [960, 500]);
    const gente = [MORADORES[1], MORADORES[2]].map((a, i) => ({ ...props(a), ...celebrate({ ...emPe(set, "chao", [740, 1300][i]), wide: a.wide })(f + i * 7) }));
    return (
      <CenaCam cenario={RUA_CASAS} f={f} cam={cam}
        noMeio={<>
          <Bandeirinhas k={1} />
          {gente.map((m, i) => <Person key={i} {...m} semente={32 + i} />)}
          <Person {...p} semente={1} />
        </>}
      />
    );
  },
  Sobre: ({ f }) => (
    <>
      <Confete f={f} de={CORTE(134) - 60} />
      <TextoPop x={1300} y={300} f={f} de={T(135, fracDe(135, "estranho"))} ate={CORTE(135)} texto="?" tam={200} cor="#F2D16B" rot={8} />
    </>
  ),
};

// ------------------------------------------------------------------ 49. as casas da próxima rua ficam 20% mais caras, em apenas um mês
const Etiqueta: React.FC<{ texto: string; cor?: string }> = ({ texto, cor = "#FFFFFF" }) => (
  <g>
    <path d="M -124 -40 L 96 -40 L 128 0 L 96 40 L -124 40 Z" transform="translate(5 6)" fill="#D6D2CA" />
    <path d="M -124 -40 L 96 -40 L 128 0 L 96 40 L -124 40 Z" fill={cor} stroke={L} strokeWidth={6} strokeLinejoin="round" />
    <circle cx={102} cy={0} r={8} fill="#F4F1EA" stroke={L} strokeWidth={4} />
    <text x={-14} y={11} textAnchor="middle" fontFamily={FONTE} fontWeight={900} fontSize={30} fill={L}>{texto}</text>
  </g>
);
const PRECOS = ["R$ 300 MIL", "R$ 420 MIL", "R$ 350 MIL", "R$ 500 MIL"];
const NOVOS = ["R$ 360 MIL", "R$ 504 MIL", "R$ 420 MIL", "R$ 600 MIL"];
const p49: PlanoV = {
  nome: "a próxima rua: +20%", de: CORTE(135), ate: CORTE(137), enquadra: { x: 960, y: 590, zoom: 1.0 },
  eventos: [
    { f: CORTE(135), tipo: "corte", desc: "a rua vizinha" },
    { f: T(136), tipo: "objeto", desc: "etiquetas de preço nas casas" },
    { f: T(136, fracDe(136, "20%")), tipo: "objeto", desc: "+20%: as etiquetas mudam" },
    { f: T(137), tipo: "objeto", desc: "calendário: um mês" },
  ],
  Cena: ({ f, cam }) => {
    const set = RUA_VIZINHA.set;
    const sobe = f >= T(136, fracDe(136, "20%"));
    const viz = [figurante(41), figurante(44)].map((a, i) => {
      const m = emPeNa(a, set, "chao", [470, 1400][i], f + i * 13, { expr: sobe ? "chocado" : "neutro" });
      m.lookAt = olhar(m, [[250, 710][i] + i * 690, CASA_TOPO]);
      return m;
    });
    return (
      <CenaCam cenario={RUA_VIZINHA} f={f} cam={cam}
        noMeio={<>
          {XRES.map((x, i) => {
            const s = escalaPop(f, T(136) + i * 3, Infinity, 7);
            return s > 0 ? <g key={x} transform={`translate(${x} ${CASA_TOPO - 60}) rotate(${i % 2 ? 5 : -5}) scale(${s})`}><Etiqueta texto={sobe ? NOVOS[i] : PRECOS[i]} cor={sobe ? "#FCE3DC" : "#FFFFFF"} /></g> : null;
          })}
          {viz.map((m, i) => <Person key={i} {...m} semente={41 + i * 3} />)}
        </>}
      />
    );
  },
  Sobre: ({ f }) => {
    const s20 = escalaPop(f, T(136, fracDe(136, "20%")) + 4, CORTE(137));
    return (
      <>
        <TextoPop x={960} y={130} f={f} de={CORTE(135) + 3} ate={T(136, fracDe(136, "20%"))} texto="A PRÓXIMA RUA" tam={70} rot={-2} />
        <TextoPop x={760} y={140} f={f} de={T(136, fracDe(136, "20%"))} ate={CORTE(137)} texto="+20%" tam={130} cor="#E0826E" rot={-4} />
        {s20 > 0 && <g transform={`translate(1000 150) scale(${s20})`}><SetaCima /></g>}
        {(() => { const s = escalaPop(f, T(137), CORTE(137)); return s > 0 ? <g transform={`translate(1300 150) scale(${1.6 * s})`}><IconeCalendario texto="1" sub="MÊS" /></g> : null; })()}
      </>
    );
  },
};

// ------------------------------------------------------------------ 50. "Como assim?"
const p50: PlanoV = {
  nome: "como assim", de: CORTE(137), ate: CORTE(138), enquadra: { x: 960, y: 650, zoom: 1.6 },
  eventos: [
    { f: CORTE(137), tipo: "corte", desc: "o protagonista" },
    { f: T(138), tipo: "pose", desc: "dá de ombros: como assim?" },
  ],
  Cena: ({ f, cam }) => {
    const set = RUA_CASAS.set;
    const p: PersonProps = { ...props(PROTAGONISTA), ...shrug({ ...emPe(set, "chao", 960), expr: "chocado" })(f - T(138)) };
    p.lookAt = olhar(p, [960, 900]);
    return <CenaCam cenario={RUA_CASAS} f={f} cam={cam} noMeio={<><Bandeirinhas k={1} /><Person {...p} semente={1} /></>} />;
  },
  Sobre: ({ f }) => <TextoPop x={1380} y={330} f={f} de={T(138, 0.2)} ate={CORTE(138)} texto="?!" tam={170} cor="#F2D16B" rot={8} />,
};

// ------------------------------------------------------------------ 51. o Brasil percebe: todos na rua tiram os olhos do celular ao mesmo tempo
const p51: PlanoV = {
  nome: "o Brasil percebe", de: CORTE(138), ate: CORTE(139), enquadra: { x: 960, y: 600, zoom: 1.0 },
  eventos: [
    { f: CORTE(138), tipo: "corte", desc: "a rua: todo mundo no celular" },
    { f: T(139, fracDe(139, "percebe")), tipo: "pose", desc: "todos olham ao mesmo tempo" },
  ],
  Cena: ({ f, cam }) => {
    const set = RUA.set;
    const olha = f >= T(139, fracDe(139, "percebe"));
    const xs = [220, 560, 900, 1240, 1600];
    const gente = xs.map((x, i) => {
      const a = figurante(51 + i * 2);
      const base = { ...emPe(set, "chao", x, 0, a.scale ?? 1), wide: a.wide };
      let m: PersonProps = olha ? { ...props(a), ...scared(base)(f - T(139, fracDe(139, "percebe")) + i) } : { ...props(a), ...lookAtPhone(base)(f + i * 7), expr: "neutro" };
      if (!olha) m = { ...m, propsHands: <g transform={`translate(${-22} ${-202})`}><rect x={-12} y={-24} width={26} height={44} rx={5} fill="#2A2A35" stroke={L} strokeWidth={4} /></g> };
      m.lookAt = olha ? [0, -330] : [-30, -200];
      return m;
    });
    return <CenaCam cenario={RUA} f={f} cam={cam} noMeio={<>{gente.map((m, i) => <Person key={i} {...m} semente={51 + i * 2} />)}</>} />;
  },
  Sobre: ({ f }) => (
    <>
      {[220, 560, 900, 1240, 1600].map((x, i) => <TextoPop key={x} x={x} y={330 - (i % 2) * 30} f={f} de={T(139, fracDe(139, "percebe")) + i * 2} ate={CORTE(139)} texto="!" tam={120} cor="#F2D16B" rot={(i % 2 ? 8 : -8)} />)}
    </>
  ),
};

// ------------------------------------------------------------------ 52. os bancos testam o cartão: cada chip, cada camada; é apenas plástico; um cartão normal; exceto que não é
const TECNICOS: Ator[] = [figurante(61), figurante(64)].map((a) => ({ ...a, coat: true, glasses: true, outfit: { ...a.outfit, camiseta: "#9ED8F5" } }));
const CartaoAberto: React.FC<{ k: number; f: number }> = ({ k, f }) => (
  <g>
    {[2, 1, 0].map((i) => (
      <g key={i} transform={`translate(${(i - 1) * 70 * k} ${(i - 1) * -46 * k})`}>
        <rect x={-210 + 7} y={-130 + 8} width={420} height={260} rx={26} fill="#D6D2CA" />
        <rect x={-210} y={-130} width={420} height={260} rx={26} fill={["#1A1A1F", "#3A3A45", "#5A5A66"][i]} stroke={L} strokeWidth={7} />
        {i === 0 && (
          <g>
            <rect x={-150} y={-70} width={84} height={64} rx={10} fill="#E3B95B" stroke={L} strokeWidth={5} />
            <path d="M -150 -38 L -66 -38 M -108 -70 L -108 -6" stroke="#B08A35" strokeWidth={4} />
            <rect x={-150} y={56} width={300} height={10} rx={5} fill="#4A4A55" />
            <path d="M 120 -90 l 40 0" stroke="#FFFFFF" strokeWidth={6} opacity={0.4 + 0.3 * Math.sin(f / 5)} strokeLinecap="round" />
          </g>
        )}
      </g>
    ))}
  </g>
);
const p52: PlanoV = {
  nome: "laboratório: testam o cartão", de: CORTE(139), ate: CORTE(144), enquadra: { x: 960, y: 560, zoom: 1.0 },
  eventos: [
    { f: CORTE(139), tipo: "corte", desc: "o laboratório do banco" },
    { f: T(140, 0.3), tipo: "objeto", desc: "o scanner varre o cartão" },
    { f: T(141), tipo: "objeto", desc: "o cartão aberto: chip" },
    { f: T(141, fracDe(141, "cada camada")), tipo: "objeto", desc: "as camadas se separam" },
    { f: T(142), tipo: "pose", desc: "apenas plástico: dão de ombros" },
    { f: T(143), tipo: "objeto", desc: "carimbo NORMAL" },
    { f: T(144, 0.3), tipo: "objeto", desc: "o cartão brilha: exceto que não é" },
  ],
  Cena: ({ f, cam }) => {
    const set = LAB.set;
    const brilha = f >= T(144, 0.3);
    const tecs = TECNICOS.map((a, i) => {
      const x = [640, 1450][i];
      const base = { ...emPe(set, "chao", x, 1, a.scale ?? 1), wide: a.wide };
      let m: PersonProps;
      if (brilha) m = { ...props(a), ...scared(base)(f - T(144, 0.3) + i * 2) };
      else if (f >= T(142) && f < T(143, 0.6)) m = { ...props(a), ...shrug({ ...base, expr: "olhar-lateral" })(f - T(142) + i * 3) };
      else m = { ...props(a), ...idle(base)(f + i * 17), expr: "neutro" };
      m.lookAt = olhar(m, [995, 760]);
      return m;
    });
    const varre = f >= T(140) && f < T(141);
    const bx = 995 + Math.sin((f - T(140)) / 4) * 60;
    return (
      <CenaCam cenario={LAB} f={f} cam={cam}
        noMeio={<>{tecs.map((m, i) => <Person key={i} {...m} semente={61 + i * 3} />)}</>}
        naFrente={<>
          {varre && <path d={`M 960 634 L 1030 634 L ${bx + 70} 820 L ${bx - 70} 820 Z`} fill="#E0826E" opacity={0.35} />}
          {brilha && Array.from({ length: 12 }, (_, i) => <line key={i} x1={995} y1={760} x2={995 + Math.cos(i * 0.52 + f / 20) * 170} y2={760 + Math.sin(i * 0.52 + f / 20) * 170} stroke="#F2D16B" strokeWidth={10} strokeLinecap="round" opacity={0.8} />)}
          <rect x={955} y={808} width={80} height={14} rx={4} fill="#8A8F98" stroke={L} strokeWidth={4} />
          <g transform="translate(995 812) scale(2.2)"><CARTAO.Desenho t={0} brilho={brilha ? 1 : 0} /></g>
        </>}
      />
    );
  },
  Sobre: ({ f }) => {
    const sAb = escalaPop(f, T(141), T(142), 8);
    const k = entre(f, T(141, fracDe(141, "cada camada")), T(141, fracDe(141, "cada camada")) + 10);
    return (
      <>
        {sAb > 0 && (
          <g transform={`translate(960 330) scale(${0.9 * sAb})`}>
            <CartaoAberto k={k} f={f} />
            <g transform="translate(-108 -150)"><Texto texto="CHIP" tam={44} cor="#F2D16B" y={-20} /></g>
            {k > 0.5 && <Texto texto="CAMADAS" tam={44} x={290} y={140} cor="#9ED8F5" />}
          </g>
        )}
        <TextoPop x={960} y={260} f={f} de={T(142)} ate={T(143)} texto="APENAS PLÁSTICO" tam={76} rot={-2} />
        <Carimbo x={960} y={270} f={f} de={T(143)} ate={T(144, 0.3)} texto="NORMAL" cor="#5A6270" />
        <Infinito x={960} y={300} f={f} de={T(144, 0.3)} ate={CORTE(144)} s={0.9} />
      </>
    );
  },
};

// ------------------------------------------------------------------ 53. o governo te adora: impostos, cofres públicos; um dos maiores contribuintes da história, sem nunca ter tido um emprego
const GOVERNO = escritorioCom("GOVERNO", "#2F6E9E");
const MINISTRA: Ator = {
  nome: "ministra", desc: "governo: coque, óculos, tailleur",
  hair: "coque", hairColor: "#2B1D16", glasses: true, expr: "rindo",
  outfit: { camiseta: "#7A3E5E", calca: "#2B2B35", tenis: "#2B2B35", sola: "#141414" }, skirt: "#2B2B35",
};
const Cofre: React.FC = () => (
  <g>
    <rect x={-110 + 7} y={-110 + 8} width={220} height={220} rx={16} fill="#D6D2CA" />
    <rect x={-110} y={-110} width={220} height={220} rx={16} fill="#6E7682" stroke={L} strokeWidth={7} />
    <rect x={-84} y={-84} width={168} height={168} rx={10} fill="none" stroke="#4A515C" strokeWidth={5} />
    <circle r={40} fill="#B9BEC6" stroke={L} strokeWidth={6} />
    {[0, 60, 120].map((a) => <line key={a} x1={0} y1={-40} x2={0} y2={40} stroke={L} strokeWidth={5} transform={`rotate(${a})`} />)}
    <circle r={10} fill={L} />
  </g>
);
const Pote: React.FC<{ n: number }> = ({ n }) => (
  <g>
    <path d="M -70 -80 L 70 -80 L 60 70 Q 0 90 -60 70 Z" fill="#DDEFF5" stroke={L} strokeWidth={7} strokeLinejoin="round" />
    {Array.from({ length: n }, (_, i) => <ellipse key={i} cx={-30 + (i % 4) * 20} cy={56 - Math.floor(i / 4) * 14} rx={16} ry={6} fill="#E3B95B" stroke={L} strokeWidth={3} />)}
    <rect x={-80} y={-96} width={160} height={22} rx={8} fill="#A9714E" stroke={L} strokeWidth={6} />
  </g>
);
const p53: PlanoV = {
  nome: "o governo te adora", de: CORTE(144), ate: CORTE(148), enquadra: { x: 960, y: 560, zoom: 1.0 },
  eventos: [
    { f: CORTE(144), tipo: "corte", desc: "o governo" },
    { f: T(145, fracDe(145, "adora")), tipo: "objeto", desc: "corações" },
    { f: T(146, fracDe(146, "impostos")), tipo: "objeto", desc: "pote de impostos" },
    { f: T(147, fracDe(147, "bilhões")), tipo: "objeto", desc: "bilhões: moedas caindo" },
    { f: T(147, fracDe(147, "cofres públicos")), tipo: "objeto", desc: "cofres públicos" },
    { f: T(148, fracDe(148, "maiores contribuintes")), tipo: "objeto", desc: "ranking: maiores contribuintes" },
    { f: T(148, fracDe(148, "emprego")), tipo: "objeto", desc: "emprego: nenhum" },
  ],
  Cena: ({ f, cam }) => {
    const set = GOVERNO.set;
    let p: PersonProps = { ...props(PROTAGONISTA), ...idle(emPe(set, "chao", 290))(f), expr: expressaoNoQuadro([[0, "convencido"], [T(148, fracDe(148, "emprego")), "olhar-lateral"]], f, 6) };
    const fTaca = T(148, fracDe(148, "maiores contribuintes"));
    if (f >= fTaca) p = segura(p, "R", [96, -250], TACA, { t: 0 }, 0);
    else if (f >= T(146) && f < T(148)) {
      const bip = (f - T(146)) % 20 < 8;
      p = segura(p, "R", [90, bip ? -270 : -200], CARTAO, { t: 0, brilho: bip ? 1 : 0 }, -14);
    }
    p.lookAt = olhar(p, [960, 380]);
    const m = emPeNa(MINISTRA, set, "chao", 1630, f, { expr: "rindo", handL: [-60 + 10 * Math.sin(f / 3), -230], handR: [60 - 10 * Math.sin(f / 3), -230], gripL: "open", gripR: "open" });
    m.lookAt = olhar(m, [p.x, 450]);
    return <CenaCam cenario={GOVERNO} f={f} cam={cam} noMeio={<><Person {...p} semente={1} /><Person {...m} semente={70} /></>} />;
  },
  Sobre: ({ f }) => {
    const fA = T(145, fracDe(145, "adora"));
    const fImp = T(146, fracDe(146, "impostos"));
    const fCof = T(147, fracDe(147, "cofres públicos"));
    const fRank = T(148, fracDe(148, "maiores contribuintes"));
    const nMoedas = f >= fImp ? Math.min(16, Math.floor((f - fImp) / 3) + 2) : 0;
    const sPote = escalaPop(f, fImp, fCof);
    const sCofre = escalaPop(f, fCof, fRank);
    const sRank = escalaPop(f, fRank, CORTE(148));
    return (
      <>
        {f >= fA && f < T(146) && [0, 1, 2].map((i) => {
          const k = lim((f - fA - i * 5) / 30);
          return k > 0 ? <g key={i} transform={`translate(${1560 + (i - 1) * 90} ${300 - k * 120}) scale(${0.7 + 0.5 * Math.min(1, k * 4)})`} opacity={1 - Math.max(0, k - 0.8) * 5}><Coracao /></g> : null;
        })}
        {sPote > 0 && <g transform={`translate(960 400) scale(${1.3 * sPote})`}><Pote n={nMoedas} /></g>}
        {sPote > 0 && <TextoPop x={960} y={220} f={f} de={fImp} ate={fCof} texto="IMPOSTOS" tam={64} rot={-2} />}
        <TextoPop x={960} y={140} f={f} de={T(147, fracDe(147, "bilhões"))} ate={fCof} texto="BILHÕES" tam={70} cor="#7FD18C" rot={3} />
        {f >= T(147, fracDe(147, "bilhões")) && f < fRank && Array.from({ length: 8 }, (_, i) => {
          const k = ((f - T(147, fracDe(147, "bilhões")) + i * 4) % 24) / 24;
          return <g key={i} transform={`translate(${520 + k * 380 + i * 4} ${430 - Math.sin(Math.PI * k) * 160})`}><g transform="scale(1.6)"><MOEDA.Desenho t={0} /></g></g>;
        })}
        {sCofre > 0 && <g transform={`translate(960 430) scale(${1.2 * sCofre})`}><Cofre /></g>}
        <TextoPop x={960} y={220} f={f} de={fCof} ate={fRank} texto="COFRES PÚBLICOS" tam={64} rot={-2} />
        {sRank > 0 && <g transform={`translate(960 420) scale(${1.1 * sRank})`}><IconePrancheta linhas={["MAIORES", "CONTRIBUINTES", "", "1. VOCÊ", "2. ...", "3. ..."]} destaque={3} /></g>}
        <Carimbo x={960} y={700} f={f} de={T(148, fracDe(148, "emprego"))} ate={CORTE(148)} texto="EMPREGO: NENHUM" cor="#C0504D" tam={40} rot={-8} />
      </>
    );
  },
};

// ------------------------------------------------------------------ 54. instituições de caridade fazem fila na sua porta
const FILA = [71, 72, 74, 76, 77, 79].map((s) => figurante(s));
const p54: PlanoV = {
  nome: "fila de caridade na porta", de: CORTE(148), ate: CORTE(149), enquadra: { x: 960, y: 560, zoom: 1.0 },
  eventos: [
    { f: CORTE(148), tipo: "corte", desc: "a porta de casa" },
    { f: CORTE(148) + 10, tipo: "pose", desc: "a fila chega andando" },
    { f: T(149, fracDe(149, "fila")), tipo: "objeto", desc: "cartazes com coração" },
  ],
  Cena: ({ f, cam }) => {
    const set = VARANDA.set;
    const p: PersonProps = { ...props(PROTAGONISTA), ...idle(emPe(set, "chao", 535))(f), expr: "chocado" };
    p.lookAt = olhar(p, [1200, 600]);
    const fila = FILA.map((a, i) => {
      const x = 780 + i * 190;
      const anda = walk({ ...emPe(set, "chao", x + 500, 0, a.scale ?? 1), wide: a.wide, xa: x + 500, xb: x, f0: CORTE(148) + i * 2, quadros: 6 });
      let m: PersonProps = { ...props(a), ...(f < anda.fim ? anda(f) : idle({ ...emPe(set, "chao", x, 0, a.scale ?? 1), wide: a.wide })(f + i * 9)), expr: "rindo" };
      if (f >= T(149, fracDe(149, "fila")) && i % 2 === 0) m = { ...m, handR: [60, -300], gripR: "fist", propsHands: <g transform="translate(60 -360)"><rect x={-54} y={-40} width={108} height={70} rx={8} fill="#FFFFFF" stroke={L} strokeWidth={5} /><g transform="translate(0 -4) scale(0.55)"><Coracao /></g><rect x={-4} y={30} width={8} height={40} fill="#A9714E" stroke={L} strokeWidth={3} /></g> };
      m.lookAt = olhar(m, [535, 600]);
      return m;
    });
    return <CenaCam cenario={VARANDA} f={f} cam={cam} noMeio={<>{[...fila].reverse().map((m, i) => <Person key={i} {...m} semente={71 + i} />)}<Person {...p} semente={1} /></>} />;
  },
};

// ------------------------------------------------------------------ 55. acabar com a fome: alimentação, hospitais, ambulâncias, escolas; paga tudo no primeiro dia
const CREME = liso("#EAD9C6");
const OBRAS: [string, string, React.FC][] = [["alimentação", "ALIMENTAÇÃO", IconeCesta], ["hospitais", "HOSPITAIS", IconeHospital], ["ambulâncias", "AMBULÂNCIAS", IconeAmbulancia], ["escolas", "ESCOLAS", IconeEscola]];
const p55: PlanoV = {
  nome: "acabar com a fome", de: CORTE(149), ate: CORTE(152), enquadra: { x: 960, y: 560, zoom: 1.0 },
  eventos: [
    { f: CORTE(149), tipo: "corte", desc: "decide acabar com a fome" },
    { f: T(150, fracDe(150, "acabar")), tipo: "objeto", desc: "prato com X: a fome" },
    { f: T(151, fracDe(151, "alimentação")), tipo: "objeto", desc: "alimentação" },
    { f: T(151, fracDe(151, "hospitais")), tipo: "objeto", desc: "hospitais" },
    { f: T(151, fracDe(151, "ambulâncias")), tipo: "objeto", desc: "compra ambulâncias", verbo: "comprar" },
    { f: T(151, fracDe(151, "escolas")), tipo: "objeto", desc: "escolas" },
    { f: T(152, fracDe(152, "paga")), tipo: "objeto", desc: "paga tudo: PAGO em cada um", verbo: "pagar" },
    { f: T(152, fracDe(152, "primeiro dia")), tipo: "objeto", desc: "dia 1" },
  ],
  Cena: ({ f, cam }) => {
    const set = CREME.set;
    let p: PersonProps = { ...props(PROTAGONISTA), ...idle(emPe(set, "chao", 300))(f), expr: expressaoNoQuadro([[0, "sigma"], [T(152), "convencido"]], f, 6) };
    const fPaga = T(152, fracDe(152, "paga"));
    const ergue = entre(f, fPaga - 4, fPaga + 2) * (1 - entre(f, fPaga + 14, fPaga + 22));
    p = segura(p, "R", [84 + 30 * ergue, -170 - 110 * ergue], CARTAO, { t: 0, brilho: ergue }, -10 - 20 * ergue);
    p.lookAt = olhar(p, [1100, 450]);
    return <CenaCam cenario={CREME} f={f} cam={cam} noMeio={<Person {...p} semente={1} />} />;
  },
  Sobre: ({ f }) => {
    const fA = T(150, fracDe(150, "acabar"));
    return (
      <>
        <Selo x={1080} y={420} f={f} de={T(150, 0.1)} ate={T(151)} r={150} rotulo="FOME">
          <g transform="scale(1.8)"><IconePrato /></g>
          {f >= fA && <IconeX r={130} />}
        </Selo>
        {OBRAS.map(([trecho, rot, Ic], i) => (
          <Selo key={rot} x={700 + i * 330} y={380} f={f} de={T(151, fracDe(151, trecho))} ate={CORTE(152)} r={110} rotulo={rot}>
            <g transform="scale(1.3)"><Ic /></g>
          </Selo>
        ))}
        {OBRAS.map(([, rot], i) => <Carimbo key={rot} x={700 + i * 330} y={380} f={f} de={T(152, fracDe(152, "paga")) + i * 3} ate={CORTE(152)} texto="PAGO" cor="#3E8E5A" tam={48} rot={-12} />)}
        {(() => { const s = escalaPop(f, T(152, fracDe(152, "primeiro dia")), CORTE(152)); return s > 0 ? <g transform={`translate(1190 760) scale(${1.6 * s})`}><IconeCalendario texto="DIA 1" cor="#3E8E5A" /></g> : null; })()}
        <Estrela x={520} y={330} f={f} de={T(152, fracDe(152, "paga"))} ate={T(152, fracDe(152, "paga")) + 14} texto="BIP!" r={70} />
      </>
    );
  },
};

// ------------------------------------------------------------------ 56. dinheiro não constrói estrada através de uma guerra
const CEU = liso("#BFDDEA");
const Fumaca: React.FC<{ x: number; y: number; f: number; s?: number }> = ({ x, y, f, s = 1 }) => (
  <g transform={`translate(${x} ${y + Math.sin(f / 9) * 6}) scale(${s})`}>
    {[[-60, 0, 60], [0, -40, 70], [60, 0, 60], [0, 20, 60]].map(([dx, dy, r], i) => <circle key={i} cx={dx} cy={dy} r={r + Math.sin(f / 7 + i) * 4} fill="#8A8F98" stroke={L} strokeWidth={6} />)}
  </g>
);
const p56: PlanoV = {
  nome: "estrada e guerra", de: CORTE(152), ate: CORTE(153), enquadra: { x: 960, y: 560, zoom: 1.0 },
  eventos: [
    { f: CORTE(152), tipo: "corte", desc: "a estrada em obra" },
    { f: T(153, fracDe(153, "estrada")), tipo: "objeto", desc: "a estrada para na barreira" },
    { f: T(153, fracDe(153, "guerra")), tipo: "objeto", desc: "fumaça e BUM: guerra" },
  ],
  Cena: ({ f, cam }) => {
    const set = CEU.set;
    let p: PersonProps = { ...props(PROTAGONISTA), ...idle(emPe(set, "chao", 260))(f), expr: f >= T(153, fracDe(153, "guerra")) ? "chocado" : "convencido" };
    p = segura(p, "R", [100, -150], SACO, { t: 0, comprimento: 1 }, 0);
    p.lookAt = olhar(p, [1300, 600]);
    const guerra = f >= T(153, fracDe(153, "guerra"));
    return (
      <CenaCam cenario={CEU} f={f} cam={cam}
        noMeio={<>
          <path d="M 640 1100 L 1150 900 L 1290 900 L 1840 1100 Z" fill="#6B6E75" stroke={L} strokeWidth={6} />
          <path d="M 1220 906 L 1240 1100" stroke="#F2D16B" strokeWidth={10} strokeDasharray="34 26" />
          {[780, 900, 1560].map((x, i) => <path key={x} d={`M ${x} ${1010 + i * 6} l 26 -80 l 26 80 Z`} fill="#E0822E" stroke={L} strokeWidth={5} strokeLinejoin="round" />)}
          {[1080, 1360].map((x) => <rect key={x} x={x - 8} y={830} width={16} height={100} fill="#8A8F98" stroke={L} strokeWidth={4} />)}
          <rect x={1050} y={800} width={340} height={36} fill="#F4F1EA" stroke={L} strokeWidth={6} />
          <path d="M 1062 802 l 34 32 M 1132 802 l 34 32 M 1202 802 l 34 32 M 1272 802 l 34 32 M 1342 802 l 34 32" stroke="#C0504D" strokeWidth={12} />
          {guerra && <><Fumaca x={1480} y={700} f={f} /><Fumaca x={1700} y={640} f={f + 20} s={0.8} /><Fumaca x={1300} y={660} f={f + 40} s={0.6} /></>}
          <Person {...p} semente={1} />
        </>}
      />
    );
  },
  Sobre: ({ f }) => (
    <>
      <TextoPop x={1220} y={740} f={f} de={T(153, fracDe(153, "estrada"))} ate={CORTE(153)} texto="PERIGO" tam={50} cor="#E0826E" />
      <Estrela x={1560} y={480} f={f} de={T(153, fracDe(153, "guerra"))} ate={CORTE(153)} texto="BUM!" r={100} cor="#E0826E" />
    </>
  ),
};

// ------------------------------------------------------------------ 57. não pode fazer uma colheita crescer mais rápido
const p57: PlanoV = {
  nome: "colheita", de: CORTE(153), ate: CORTE(154), enquadra: { x: 960, y: 560, zoom: 1.0 },
  eventos: [
    { f: CORTE(153), tipo: "corte", desc: "a plantação" },
    { f: T(154, fracDe(154, "colheita")), tipo: "objeto", desc: "notas caem nos brotos" },
    { f: T(154, fracDe(154, "mais rápido")), tipo: "objeto", desc: "relógio: os brotos não crescem" },
  ],
  Cena: ({ f, cam }) => {
    const set = CEU.set;
    const chove = f >= T(154, fracDe(154, "colheita"));
    let p: PersonProps = { ...props(PROTAGONISTA), ...idle(emPe(set, "chao", 280))(f), expr: f >= T(154, fracDe(154, "mais rápido")) ? "bravo" : "convencido" };
    if (chove) p = { ...p, handR: [110, -280 + Math.sin(f / 2) * 20], gripR: "open" };
    p.lookAt = olhar(p, [1100, 900]);
    return (
      <CenaCam cenario={CEU} f={f} cam={cam}
        noMeio={<>
          <rect x={520} y={900} width={1500} height={80} fill="#8A5E3F" stroke={L} strokeWidth={6} />
          {Array.from({ length: 4 }, (_, r) => <path key={r} d={`M 540 ${916 + r * 16} L 2000 ${916 + r * 16}`} stroke="#6E4B35" strokeWidth={4} />)}
          {Array.from({ length: 10 }, (_, i) => {
            const x = 600 + i * 130;
            const bal = Math.sin(f / 6 + i) * 4;
            return <g key={i} transform={`translate(${x} 902) rotate(${bal})`}><path d="M 0 0 L 0 -30" stroke="#4F8A3B" strokeWidth={6} /><ellipse cx={-10} cy={-30} rx={12} ry={6} fill="#7AA35B" stroke={L} strokeWidth={3} /><ellipse cx={10} cy={-34} rx={12} ry={6} fill="#7AA35B" stroke={L} strokeWidth={3} /></g>;
          })}
          {chove && Array.from({ length: 12 }, (_, i) => {
            const k = ((f - T(154, fracDe(154, "colheita")) + i * 5) % 30) / 30;
            return <g key={i} transform={`translate(${600 + ((i * 113) % 1200)} ${300 + k * 600}) rotate(${i * 40 + k * 200})`}><g transform="scale(1.4)"><CEDULA.Desenho t={0} /></g></g>;
          })}
          <Person {...p} semente={1} />
        </>}
      />
    );
  },
  Sobre: ({ f }) => {
    const s = escalaPop(f, T(154, fracDe(154, "mais rápido")), CORTE(154));
    return s > 0 ? <g transform={`translate(1300 260) scale(${1.4 * s})`}><IconeRelogio giro={f * 4} /></g> : null;
  },
};

// ------------------------------------------------------------------ 58. não resolve sozinho a falta de profissionais em um hospital
const p58: PlanoV = {
  nome: "hospital sem profissionais", de: CORTE(154), ate: CORTE(155), enquadra: { x: 960, y: 560, zoom: 1.0 },
  eventos: [
    { f: CORTE(154), tipo: "corte", desc: "a médica sozinha, fila de pacientes" },
    { f: T(155, fracDe(155, "falta de profissionais")), tipo: "objeto", desc: "falta de profissionais" },
  ],
  Cena: ({ f, cam }) => {
    const set = CONSULTORIO.set;
    const med = emPeNa(MEDICA, set, "chao", 1480, f, { expr: "triste", handL: [-30, -300], gripL: "open", bendL: 10 });
    med.lookAt = olhar(med, [400, 600]);
    const fila = [81, 83, 85, 86].map((s, i) => {
      const a = figurante(s);
      const m = emPeNa(a, set, "chao", 240 + i * 230, f + i * 7, { expr: i % 2 ? "triste" : "neutro" });
      m.lookAt = olhar(m, [1480, 500]);
      return m;
    });
    return (
      <CenaCam cenario={CONSULTORIO} f={f} cam={cam}
        noMeio={<>
          {fila.map((m, i) => <Person key={i} {...m} semente={81 + i} />)}
          <Person {...med} semente={11} />
        </>}
        naFrente={<>{Array.from({ length: 6 }, (_, i) => <g key={i} transform={`translate(${1340 + (i % 3) * 40} ${790 - Math.floor(i / 3) * 16}) scale(1.5)`}><CEDULA.Desenho t={0} /></g>)}</>}
      />
    );
  },
  Sobre: ({ f }) => (
    <>
      <TextoPop x={760} y={180} f={f} de={T(155, fracDe(155, "falta de profissionais"))} ate={CORTE(155)} texto="FALTA DE PROFISSIONAIS" tam={64} cor="#E0826E" rot={-2} />
      <TextoPop x={1480} y={300} f={f} de={CORTE(154) + 6} ate={CORTE(155)} texto="1" tam={110} cor="#F2D16B" rot={6} />
    </>
  ),
};

// ------------------------------------------------------------------ 59. parte ajuda; muito disso fica preso (funil entupido)
const p59: PlanoV = {
  nome: "o funil: parte ajuda, muito fica preso", de: CORTE(155), ate: CORTE(157), enquadra: { x: 960, y: 560, zoom: 1.0 },
  eventos: [
    { f: CORTE(155), tipo: "corte", desc: "o funil de dinheiro" },
    { f: T(156), tipo: "objeto", desc: "algumas moedas passam: o broto cresce" },
    { f: T(157), tipo: "objeto", desc: "o funil entope" },
    { f: T(157, fracDe(157, "preso")), tipo: "objeto", desc: "PRESO" },
  ],
  Cena: ({ f, cam }) => {
    const set = CREME.set;
    const p: PersonProps = { ...props(PROTAGONISTA), ...idle(emPe(set, "chao", 300))(f), expr: f >= T(157) ? "triste" : "neutro" };
    p.lookAt = olhar(p, [1000, 500]);
    const passa = f >= T(156);
    const entope = f >= T(157);
    const cresce = entre(f, T(156, 0.3), T(156, 0.3) + 12);
    return (
      <CenaCam cenario={CREME} f={f} cam={cam}
        noMeio={<>
          {/* moedas entrando por cima */}
          {Array.from({ length: 10 }, (_, i) => {
            const k = ((f - CORTE(155) + i * 6) % 26) / 26;
            return <g key={i} transform={`translate(${880 + ((i * 47) % 240)} ${60 + k * 220})`}><g transform="scale(1.6)"><MOEDA.Desenho t={0} /></g></g>;
          })}
          {/* moedas presas no funil */}
          {Array.from({ length: entope ? 22 : 8 }, (_, i) => <ellipse key={i} cx={1000 + ((i * 37) % 200) - 100 + (Math.floor(i / 6) * 12)} cy={560 - Math.floor(i / 6) * 34 - (i % 2) * 8} rx={22} ry={9} fill="#E3B95B" stroke={L} strokeWidth={4} />)}
          <path d="M 760 300 L 1240 300 L 1040 600 L 1040 720 L 960 720 L 960 600 Z" fill="#B9C4CC" fillOpacity={0.55} stroke={L} strokeWidth={8} strokeLinejoin="round" />
          {passa && !entope && Array.from({ length: 3 }, (_, i) => {
            const k = ((f - T(156) + i * 9) % 27) / 27;
            return <g key={i} transform={`translate(1000 ${730 + k * 150})`}><g transform="scale(1.4)"><MOEDA.Desenho t={0} /></g></g>;
          })}
          <g transform={`translate(1000 962) scale(${0.4 + 0.6 * cresce})`}>
            <path d="M 0 0 L 0 -90" stroke="#4F8A3B" strokeWidth={9} />
            <ellipse cx={-24} cy={-86} rx={26} ry={12} fill="#7AA35B" stroke={L} strokeWidth={4} />
            <ellipse cx={24} cy={-96} rx={26} ry={12} fill="#7AA35B" stroke={L} strokeWidth={4} />
          </g>
          <Person {...p} semente={1} />
        </>}
      />
    );
  },
  Sobre: ({ f }) => (
    <>
      <TextoPop x={1400} y={820} f={f} de={T(156, 0.3)} ate={CORTE(157)} texto="PARTE AJUDA" tam={58} cor="#7FD18C" rot={-3} />
      <Carimbo x={1420} y={460} f={f} de={T(157, fracDe(157, "preso"))} ate={CORTE(157) + 20} texto="PRESO" cor="#C0504D" tam={70} rot={-10} />
    </>
  ),
};

export const CAP7: PlanoV[] = [p45, p46, p47, p48, p49, p50, p51, p52, p53, p54, p55, p56, p57, p58, p59];
export const FIM_CAP7 = CORTE(157);
export const FIGURADOS_CAP7: Record<number, string[]> = { 138: ["comer"] }; // "Como assim?"
