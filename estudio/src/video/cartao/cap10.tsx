// Capítulo 10 (falas 231 a 257): a decisão. Você olha para o cartão; na TV, ao vivo, uma câmera na sua porta; o país
// inteiro assistindo. As opções (ir embora, comprar uma ilha, comprar um país) ou cortar. Cronômetro: 50 s (a mãe na
// cozinha com o pão de R$ 3,80), 40 s (tesoura, segunda gaveta), 30 s (porta da frente, câmeras, flashes), a mão
// tremendo, 10 s, Bip: o corte. Silêncio. Duas metades na varanda.
import React from "react";
import { Person, type PersonProps } from "../../components/Person";
import { expressaoNoQuadro } from "../../components/Face";
import { idle, sit, walk } from "../../rig/actions";
import { CARTAO } from "../../objects/extras";
import { MEIO_CARTAO, PAO, TESOURA } from "../../objects/extras2";
import { ObjetoNoMundo } from "../../objects/objetos";
import { emPe, sentadoEm } from "../../cenarios/ancoras";
import { liso } from "../../cenarios/liso/Liso";
import { SALA } from "../../cenarios/sala/Sala";
import { COZINHA } from "../../cenarios/cozinha/Cozinha";
import type { Ator } from "../../elenco/elenco";
import { MAE, PROTAGONISTA, figurante } from "../../elenco/elenco";
import { emPeNa, olhar, props } from "../../fase4/Cenarios";
import { FONTE } from "../../fontes";
import { Estrela, IconeGlobo, IconeJatinho, Infinito, TextoPop, escalaPop } from "../graficos";
import { CenaCam, entre, fracDe, segura, type PlanoV } from "./comum";
import { CORTE, T } from "./tempo";
import { FIM_CAP9 } from "./cap9";
import { Flash } from "./cap8";
import { PORTA, VARANDA } from "./cenas";
import { Cronometro } from "./cronometro";

const L = "#141414";
const ESCURO = liso("#26313F");

/** cronômetro no canto; nos anúncios ("50 segundos.") vai grande para o centro */
const ANUNCIOS = [241, 244, 248, 254];
const CronometroCanto: React.FC<{ f: number; cx?: number; cy?: number }> = ({ f, cx = 960, cy = 420 }) => {
  let k = 0;
  for (const id of ANUNCIOS) k = Math.max(k, entre(f, T(id) - 4, T(id) + 6) * (1 - entre(f, CORTE(id) - 2, CORTE(id) + 10)));
  const x = 1720 + (cx - 1720) * k, y = 170 + (cy - 170) * k, s = 0.8 + (1.7 - 0.8) * k;
  return <Cronometro x={x} y={y} f={f} s={s} />;
};

// ------------------------------------------------------------------ 89. você olha para o cartão: preto, brilhante, único
const p89: PlanoV = {
  nome: "você olha para o cartão", de: FIM_CAP9, ate: CORTE(232), enquadra: { x: 860, y: 640, zoom: 1.6 },
  eventos: [
    { f: FIM_CAP9, tipo: "corte", desc: "no sofá, o cartão na mão" },
    { f: T(231, 0.3), tipo: "pose", desc: "olha para o cartão", verbo: "olhar" },
    { f: T(232), tipo: "objeto", desc: "o cartão grande brilha" },
    { f: T(232, fracDe(232, "único")), tipo: "objeto", desc: "ÚNICO" },
  ],
  Cena: ({ f, cam }) => {
    const set = SALA.set;
    const { assento, ...base } = sentadoEm(set, "sofa_meio");
    let p: PersonProps = { ...props(PROTAGONISTA), ...sit({ ...base, assento })(f + 30), expr: "neutro" };
    p = segura(p, "R", [70, -230 + (p.abaixa ?? 0)], CARTAO, { t: 0, brilho: f >= T(232) ? 1 : 0 }, -14);
    p.lookAt = [60, -170];
    return <CenaCam cenario={SALA} f={f} cam={cam} naFrente={<Person {...p} semente={1} />} />;
  },
  Sobre: ({ f }) => {
    const s = escalaPop(f, T(232), CORTE(232));
    const brilho = ((f - T(232)) % 30) / 30;
    return (
      <>
        {s > 0 && (
          <g transform={`translate(1350 470) scale(${s}) rotate(-8)`}>
            <rect x={-260 + 8} y={-165 + 9} width={520} height={330} rx={30} fill="#D6D2CA" />
            <defs><clipPath id="cartao-grande"><rect x={-260} y={-165} width={520} height={330} rx={30} /></clipPath></defs>
            <rect x={-260} y={-165} width={520} height={330} rx={30} fill="#1A1A1F" stroke={L} strokeWidth={8} />
            <g clipPath="url(#cartao-grande)"><path d={`M ${-380 + brilho * 900} -200 l 70 0 l -140 400 l -70 0 Z`} fill="#FFFFFF" opacity={0.25} /></g>
            <rect x={-200} y={-90} width={100} height={76} rx={12} fill="#E3B95B" stroke={L} strokeWidth={5} />
            <rect x={-200} y={70} width={380} height={12} rx={6} fill="#4A4A55" />
          </g>
        )}
        <TextoPop x={1350} y={190} f={f} de={T(232)} ate={CORTE(232)} texto="PRETO" tam={58} rot={-3} />
        <TextoPop x={1350} y={760} f={f} de={T(232, fracDe(232, "brilhante"))} ate={CORTE(232)} texto="BRILHANTE" tam={58} cor="#F2D16B" rot={2} />
        <TextoPop x={1700} y={480} f={f} de={T(232, fracDe(232, "único"))} ate={CORTE(232)} texto="ÚNICO" tam={64} cor="#E0826E" rot={6} />
      </>
    );
  },
};

// ------------------------------------------------------------------ 90. na TV: uma câmera apontada para a porta da sua casa. Ao vivo.
const CameraTV: React.FC = () => (
  <g>
    <rect x={-60} y={-34} width={110} height={64} rx={8} fill="#3A3F4B" stroke={L} strokeWidth={5} />
    <rect x={50} y={-22} width={36} height={40} rx={6} fill="#2A2A35" stroke={L} strokeWidth={5} />
    <circle cx={86} cy={-2} r={14} fill="#5AA5B8" stroke={L} strokeWidth={4} />
    <circle cx={-40} cy={-20} r={6} fill="#E0826E" />
  </g>
);
const IMPRENSA: Ator[] = [181, 183, 185].map((s, i) => ({ ...figurante(s), outfit: { camiseta: ["#3A3F4B", "#8A8F98", "#4F8A6B"][i], calca: "#2B2B35", tenis: "#FFFFFF", sola: "#141414" } }));
/** pessoa da imprensa com câmera no ombro (i = 0) ou câmera fotográfica no rosto */
const reporter = (a: Ator, x: number, f: number, i: number, flashes: boolean): PersonProps => {
  const set = VARANDA.set;
  const m: PersonProps = { ...emPeNa(a, set, "chao", x, f + i * 7, { expr: "neutro" }), flip: true };
  if (i === 0) return { ...m, handL: [-40, -300], handR: [50, -290], gripL: "fist", gripR: "fist", propsHands: <g transform="translate(10 -330)"><CameraTV /></g>, lookAt: [-120, -330] };
  return { ...m, handL: [-30, -320], handR: [40, -320], gripL: "fist", gripR: "fist", lookAt: [-120, -330], propsHands: <g transform="translate(6 -330)"><rect x={-30} y={-20} width={60} height={40} rx={6} fill="#2A2A35" stroke={L} strokeWidth={4} /><circle cx={0} cy={0} r={12} fill="#5AA5B8" stroke={L} strokeWidth={3} />{flashes && (f + i * 5) % 14 < 3 && <circle cx={-20} cy={-26} r={30} fill="#FFFFFF" opacity={0.9} />}</g> };
};
/** a varanda dentro de uma tela (TV): a cena inteira reduzida e recortada */
const NaTela: React.FC<{ x: number; y: number; w: number; children: React.ReactNode }> = ({ x, y, w, children }) => (
  <div style={{ position: "absolute", left: x, top: y, width: 1920, height: 1080, transform: `scale(${w / 1920})`, transformOrigin: "0 0", overflow: "hidden" }}>{children}</div>
);
const p90: PlanoV = {
  nome: "na TV: a sua porta, ao vivo", de: CORTE(232), ate: CORTE(234), enquadra: { x: 960, y: 560, zoom: 1.0 },
  eventos: [
    { f: CORTE(232), tipo: "corte", desc: "a televisão" },
    { f: T(233, fracDe(233, "uma câmera")), tipo: "objeto", desc: "a câmera apontada para a porta" },
    { f: T(234), tipo: "objeto", desc: "AO VIVO" },
  ],
  Cena: ({ f, cam }) => {
    const rep = reporter(IMPRENSA[0], 1500, f, 0, false);
    return (
      <>
        <CenaCam cenario={ESCURO} f={f} cam={cam} />
        <NaTela x={360} y={170} w={1200}>
          <CenaCam cenario={VARANDA} f={f} cam={{ x: 900, y: 600, zoom: 1.05 }} noMeio={f >= T(233, fracDe(233, "uma câmera")) ? <Person {...rep} semente={181} /> : null} />
        </NaTela>
      </>
    );
  },
  Sobre: ({ f }) => (
    <>
      <rect x={330} y={140} width={1260} height={735} rx={26} fill="none" stroke="#3A3F4B" strokeWidth={60} />
      <rect x={300} y={110} width={1320} height={795} rx={34} fill="none" stroke={L} strokeWidth={8} />
      <rect x={360} y={170} width={1200} height={675} fill="none" stroke={L} strokeWidth={6} />
      <rect x={360} y={770} width={1200} height={75} fill="#C0504D" />
      <text x={400} y={822} fontFamily={FONTE} fontWeight={900} fontSize={40} fill="#FFFFFF">O SEM FUNDO: A CASA</text>
      {f >= T(234) && (f - T(234)) % 20 < 14 && (
        <g transform={`translate(1430 230) scale(${escalaPop(f, T(234))})`}>
          <rect x={-110} y={-36} width={220} height={72} rx={12} fill="#C0504D" stroke={L} strokeWidth={6} />
          <circle cx={-76} cy={0} r={12} fill="#FFFFFF" />
          <text x={16} y={14} textAnchor="middle" fontFamily={FONTE} fontWeight={900} fontSize={38} fill="#FFFFFF">AO VIVO</text>
        </g>
      )}
    </>
  ),
};

// ------------------------------------------------------------------ 91. o país inteiro está assistindo
const p91: PlanoV = {
  nome: "o país inteiro assistindo", de: CORTE(234), ate: CORTE(235), enquadra: { x: 960, y: 560, zoom: 1.0 },
  eventos: [
    { f: CORTE(234), tipo: "corte", desc: "rostos assistindo" },
    { f: T(235, fracDe(235, "assistindo")), tipo: "objeto", desc: "todas as janelas acesas" },
  ],
  Cena: ({ f, cam }) => <CenaCam cenario={ESCURO} f={f} cam={cam} />,
  Sobre: ({ f }) => (
    <>
      {Array.from({ length: 6 }, (_, i) => {
        const x = 330 + (i % 3) * 630, y = 290 + Math.floor(i / 3) * 400;
        const s = escalaPop(f, CORTE(234) + i * 3, Infinity, 6);
        const a = figurante(191 + i * 2);
        return s > 0 ? (
          <g key={i} transform={`translate(${x} ${y}) scale(${s})`}>
            <rect x={-270 + 6} y={-170 + 7} width={540} height={340} rx={16} fill="#1A1F29" />
            <defs><clipPath id={`janela-${i}`}><rect x={-270} y={-170} width={540} height={340} rx={16} /></clipPath></defs>
            <rect x={-270} y={-170} width={540} height={340} rx={16} fill={["#3A4B66", "#4A3F5E", "#2F4A3A"][i % 3]} stroke={L} strokeWidth={6} />
            <g clipPath={`url(#janela-${i})`}>
              <rect x={-270} y={-170} width={540} height={340} fill="#9ED8F5" opacity={0.15 + 0.08 * Math.sin(f / 4 + i)} />
              <Person {...props(a)} x={0} y={420} scale={1.05} expr="chocado" handL={[-72, -110]} handR={[74, -108]} lookAt={[0, -330]} semente={191 + i} />
            </g>
          </g>
        ) : null;
      })}
    </>
  ),
};

// ------------------------------------------------------------------ 92. as opções: manter o cartão, ir embora, comprar uma ilha, comprar um país; ou cortar e voltar a ser você
const Bolha: React.FC<{ x: number; y: number; f: number; de: number; ate?: number; alvo: [number, number]; apaga?: number; children: React.ReactNode }> = ({ x, y, f, de, ate, alvo, apaga = 0, children }) => {
  const s = escalaPop(f, de, ate, 8);
  if (s <= 0) return null;
  const pts: [number, number][] = [0.25, 0.5, 0.72].map((t) => [alvo[0] + (x - alvo[0]) * t, alvo[1] + (y - alvo[1]) * t]);
  return (
    <g opacity={1 - 0.6 * apaga}>
      {pts.map(([px, py], i) => <circle key={i} cx={px} cy={py} r={(8 + i * 6) * s} fill="#FFFFFF" stroke={L} strokeWidth={4} />)}
      <g transform={`translate(${x} ${y}) scale(${s})`}>
        {[[-70, -10, 80], [10, -50, 90], [80, -10, 80], [10, 40, 90]].map(([cx, cy, r], i) => <circle key={`s${i}`} cx={cx + 6} cy={cy + 7} r={r} fill="#D6D2CA" />)}
        {[[-70, -10, 80], [10, -50, 90], [80, -10, 80], [10, 40, 90]].map(([cx, cy, r], i) => <circle key={i} cx={cx} cy={cy} r={r} fill="#FFFFFF" stroke={L} strokeWidth={6} />)}
        {[[-70, -10, 74], [10, -50, 84], [80, -10, 74], [10, 40, 84]].map(([cx, cy, r], i) => <circle key={`f${i}`} cx={cx} cy={cy} r={r} fill="#FFFFFF" />)}
        {children}
      </g>
    </g>
  );
};
const Ilha: React.FC = () => (
  <g>
    <ellipse cx={0} cy={40} rx={110} ry={26} fill="#5AA5B8" stroke={L} strokeWidth={4} />
    <ellipse cx={0} cy={30} rx={70} ry={22} fill="#F2D9A6" stroke={L} strokeWidth={4} />
    <path d="M 0 30 Q 6 -10 -6 -46" stroke="#8A5E3F" strokeWidth={9} fill="none" strokeLinecap="round" />
    {[-60, -20, 20, 60].map((a) => <path key={a} d={`M -6 -46 q ${a * 0.7} -26 ${a * 1.2} 6`} stroke="#6DAA5C" strokeWidth={12} fill="none" strokeLinecap="round" />)}
  </g>
);
const p92: PlanoV = {
  nome: "as opções", de: CORTE(235), ate: CORTE(240), enquadra: { x: 960, y: 620, zoom: 1.2 },
  eventos: [
    { f: CORTE(235), tipo: "corte", desc: "você e o cartão" },
    { f: T(236, fracDe(236, "nunca mais")), tipo: "objeto", desc: "manter: o infinito" },
    { f: T(237), tipo: "objeto", desc: "ir embora: o jatinho" },
    { f: T(238), tipo: "objeto", desc: "comprar uma ilha", verbo: "comprar" },
    { f: T(239), tipo: "objeto", desc: "comprar um país", verbo: "comprar" },
    { f: T(240, fracDe(240, "cortá-lo")), tipo: "objeto", desc: "ou cortar: a tesoura" },
    { f: T(240, fracDe(240, "apenas você")), tipo: "expressao", desc: "voltar a ser apenas você" },
  ],
  Cena: ({ f, cam }) => {
    const set = ESCURO.set;
    let p: PersonProps = { ...props(PROTAGONISTA), ...idle(emPe(set, "chao", 960))(f), expr: expressaoNoQuadro([[0, "neutro"], [T(238), "olhar-lateral"], [T(240), "triste"], [T(240, fracDe(240, "apenas você")), "neutro"]], f, 8) };
    p = segura(p, "R", [90, -200], CARTAO, { t: 0, brilho: f < T(240) ? 1 : 0 }, -10);
    p.lookAt = f >= T(240) ? [0, -330] : [60, -200];
    return <CenaCam cenario={ESCURO} f={f} cam={cam} noMeio={<Person {...p} semente={1} />} />;
  },
  Sobre: ({ f }) => {
    const cabeca: [number, number] = [960, 330];
    const corta = f >= T(240, fracDe(240, "cortá-lo"));
    const ab = 0.5 + 0.5 * Math.sin(f / 3);
    return (
      <>
        <Bolha x={960} y={150} f={f} de={T(236, fracDe(236, "nunca mais"))} ate={CORTE(240)} alvo={cabeca} apaga={corta ? 1 : 0}><Infinito x={10} y={-6} f={f} de={T(236, fracDe(236, "nunca mais"))} s={0.5} /></Bolha>
        <Bolha x={420} y={260} f={f} de={T(237)} ate={CORTE(240)} alvo={cabeca} apaga={corta ? 1 : 0}><g transform={`translate(${10 + ((f - T(237)) % 40) * 2} -6) scale(0.9)`}><IconeJatinho /></g></Bolha>
        <Bolha x={1500} y={260} f={f} de={T(238)} ate={CORTE(240)} alvo={cabeca} apaga={corta ? 1 : 0}><g transform="translate(10 -10) scale(0.9)"><Ilha /></g></Bolha>
        <Bolha x={1500} y={650} f={f} de={T(239)} ate={CORTE(240)} alvo={cabeca} apaga={corta ? 1 : 0}><g transform="translate(10 -10) scale(0.9)"><IconeGlobo giro={f * 2} /></g><text x={10} y={96} textAnchor="middle" fontFamily={FONTE} fontWeight={900} fontSize={30} fill="#3E8E5A">R$ ✓</text></Bolha>
        <Bolha x={420} y={650} f={f} de={T(240, fracDe(240, "cortá-lo"))} ate={CORTE(240)} alvo={cabeca}>
          <g transform="translate(-30 20) rotate(-8) scale(2.2)"><CARTAO.Desenho t={0} /></g>
          <g transform="translate(40 -10) scale(2)"><TESOURA.Desenho t={0} comprimento={ab} /></g>
        </Bolha>
        <Estrela x={1640} y={150} f={f} de={T(238, 0.3)} ate={T(238, 0.3) + 12} texto="BIP!" r={60} />
        <Estrela x={1640} y={540} f={f} de={T(239, 0.3)} ate={T(239, 0.3) + 12} texto="BIP!" r={60} />
        <TextoPop x={420} y={860} f={f} de={T(240, fracDe(240, "apenas você"))} ate={CORTE(240)} texto="APENAS VOCÊ" tam={54} cor="#F2D16B" rot={-3} />
      </>
    );
  },
};

// ------------------------------------------------------------------ 93. 50 segundos. Sua mãe está na cozinha segurando um pão. R$ 3,80.
const p93: PlanoV = {
  nome: "50 segundos: a mãe na cozinha", de: CORTE(240), ate: CORTE(243), enquadra: { x: 760, y: 600, zoom: 1.25 },
  eventos: [
    { f: CORTE(240), tipo: "corte", desc: "50 segundos" },
    { f: T(242), tipo: "pose", desc: "a mãe na cozinha", },
    { f: T(242, fracDe(242, "segurando")), tipo: "objeto", desc: "segurando um pão", verbo: "segurar" },
    { f: T(243), tipo: "objeto", desc: "R$ 3,80" },
  ],
  Cena: ({ f, cam }) => {
    const set = COZINHA.set;
    let m: PersonProps = emPeNa(MAE, set, "chao", 760, f, { expr: "triste" });
    m = segura(m, "R", [80, -200], PAO, { t: 0 }, 0);
    m.lookAt = olhar(m, [900, 700]);
    return <CenaCam cenario={COZINHA} f={f} cam={cam} naFrente={<Person {...m} semente={2} />} />;
  },
  Sobre: ({ f }) => (
    <>
      <CronometroCanto f={f} cx={1380} cy={380} />
      {(() => {
        const s = escalaPop(f, T(243), CORTE(243));
        return s > 0 ? (
          <g transform={`translate(1180 560) rotate(-6) scale(${1.8 * s})`}>
            <path d="M -110 -40 L 90 -40 L 120 0 L 90 40 L -110 40 Z" transform="translate(3 4)" fill="#D6D2CA" />
            <path d="M -110 -40 L 90 -40 L 120 0 L 90 40 L -110 40 Z" fill="#FFFFFF" stroke={L} strokeWidth={4} />
            <text x={-6} y={13} textAnchor="middle" fontFamily={FONTE} fontWeight={900} fontSize={40} fill={L}>R$ 3,80</text>
          </g>
        ) : null;
      })()}
    </>
  ),
};

// ------------------------------------------------------------------ 94. 40 segundos. Tesoura. Gaveta da cozinha. Segunda gaveta de cima.
const GAVETEIRO = { x: 1500, w: 300, topo: 560, base: 962 };
const Gaveteiro: React.FC<{ abre: number }> = ({ abre }) => {
  const h = (GAVETEIRO.base - GAVETEIRO.topo - 40) / 4;
  return (
    <g>
      <rect x={GAVETEIRO.x + 6} y={GAVETEIRO.topo + 7} width={GAVETEIRO.w} height={GAVETEIRO.base - GAVETEIRO.topo} fill="#D6D2CA" />
      <rect x={GAVETEIRO.x} y={GAVETEIRO.topo} width={GAVETEIRO.w} height={GAVETEIRO.base - GAVETEIRO.topo} fill="#E9DFCB" stroke={L} strokeWidth={7} />
      <rect x={GAVETEIRO.x - 10} y={GAVETEIRO.topo - 20} width={GAVETEIRO.w + 20} height={24} rx={6} fill="#C9B79A" stroke={L} strokeWidth={6} />
      {[0, 1, 2, 3].map((i) => {
        const dx = i === 1 ? -150 * abre : 0;
        const y = GAVETEIRO.topo + 16 + i * (h + 6);
        return (
          <g key={i}>
            {i === 1 && abre > 0 && <rect x={GAVETEIRO.x + 16 + dx} y={y - 26} width={GAVETEIRO.w - 32} height={30} fill="#C9B79A" stroke={L} strokeWidth={5} />}
            {i === 1 && abre > 0.6 && <g transform={`translate(${GAVETEIRO.x + 120 + dx} ${y - 4}) scale(2)`}><TESOURA.Desenho t={0} /></g>}
            <rect x={GAVETEIRO.x + 16 + dx} y={y} width={GAVETEIRO.w - 32} height={h} rx={6} fill={i === 1 ? "#F2E6CF" : "#EFE5D2"} stroke={L} strokeWidth={6} />
            <rect x={GAVETEIRO.x + GAVETEIRO.w / 2 - 34 + dx} y={y + h / 2 - 6} width={68} height={12} rx={6} fill="#8A8F98" stroke={L} strokeWidth={3} />
          </g>
        );
      })}
    </g>
  );
};
const p94: PlanoV = {
  nome: "40 segundos: a tesoura na gaveta", de: CORTE(243), ate: CORTE(247), enquadra: { x: 1300, y: 640, zoom: 1.2 },
  eventos: [
    { f: CORTE(243), tipo: "corte", desc: "40 segundos: você entra na cozinha" },
    { f: T(245), tipo: "objeto", desc: "TESOURA" },
    { f: T(246), tipo: "pose", desc: "vai até as gavetas" },
    { f: T(247, fracDe(247, "Segunda")), tipo: "objeto", desc: "abre a segunda gaveta de cima" },
    { f: T(247, 0.8), tipo: "pose", desc: "pega a tesoura" },
  ],
  Cena: ({ f, cam }) => {
    const set = COZINHA.set;
    const anda = walk({ ...emPe(set, "chao", 760), xa: 760, xb: 1260, f0: T(246), quadros: 7 });
    const abre = entre(f, T(247, fracDe(247, "Segunda")), T(247, fracDe(247, "Segunda")) + 10);
    let p: PersonProps = { ...props(PROTAGONISTA), ...(f < T(246) ? idle(emPe(set, "chao", 760))(f) : f < anda.fim ? anda(f) : idle(emPe(set, "chao", 1260))(f)), expr: "sigma" };
    if (f >= T(247, 0.8)) p = segura(p, "R", [110, -200], TESOURA, { t: 0 }, 0);
    else if (abre > 0) p = { ...p, handR: [200, -250], gripR: "fist" };
    p.lookAt = olhar(p, [1600, 700]);
    return (
      <CenaCam cenario={COZINHA} f={f} cam={cam}
        naFrente={<><Gaveteiro abre={abre} /><Person {...p} semente={1} /></>}
      />
    );
  },
  Sobre: ({ f }) => {
    const s = escalaPop(f, T(245), T(246) + 6);
    return (
      <>
        <CronometroCanto f={f} />
        {s > 0 && <g transform={`translate(760 330) scale(${s})`}><circle cx={6} cy={7} r={120} fill="#D6D2CA" /><circle r={120} fill="#FFFFFF" stroke={L} strokeWidth={7} /><g transform="translate(-10 20) scale(3.4)"><TESOURA.Desenho t={0} comprimento={0.6} /></g></g>}
        <TextoPop x={1640} y={480} f={f} de={T(247, fracDe(247, "Segunda"))} ate={CORTE(247)} texto="2ª" tam={90} cor="#F2D16B" rot={-6} />
      </>
    );
  },
};

// ------------------------------------------------------------------ 95. 30 segundos. Porta da frente. Câmeras. Flashes.
const p95: PlanoV = {
  nome: "30 segundos: porta da frente, câmeras, flashes", de: CORTE(247), ate: CORTE(251), enquadra: { x: 960, y: 580, zoom: 1.0 },
  eventos: [
    { f: CORTE(247), tipo: "corte", desc: "30 segundos: a varanda" },
    { f: T(249), tipo: "objeto", desc: "a porta da frente se abre" },
    { f: T(249, 0.6), tipo: "pose", desc: "você sai" },
    { f: T(250), tipo: "pose", desc: "câmeras viram para você" },
    { f: T(251), tipo: "objeto", desc: "flashes" },
  ],
  Cena: ({ f, cam }) => {
    const set = VARANDA.set;
    const abre = entre(f, T(249), T(249) + 8);
    const sai = walk({ ...emPe(set, "chao", 535), xa: 535, xb: 700, f0: T(249, 0.6), quadros: 5 });
    let p: PersonProps | null = f >= T(249, 0.6) ? { ...props(PROTAGONISTA), ...(f < sai.fim ? sai(f) : idle(emPe(set, "chao", 700))(f)), expr: "sigma" } : null;
    if (p) {
      p = segura(p, "R", [100, -190], TESOURA, { t: 0 }, 0);
      p = segura(p, "L", [-90, -200], CARTAO, { t: 0 }, 10);
      p.lookAt = olhar(p, [1400, 600]);
    }
    const imprensa = IMPRENSA.map((a, i) => reporter(a, 1150 + i * 230, f, i, f >= T(251)));
    return (
      <CenaCam cenario={VARANDA} f={f} cam={cam}
        noMeio={<>
          {abre > 0 && <rect x={PORTA.x0} y={PORTA.topo} width={(PORTA.x1 - PORTA.x0) * abre} height={PORTA.base - PORTA.topo} fill="#2A2420" />}
          {f >= T(250) && imprensa.map((m, i) => <Person key={i} {...m} semente={181 + i * 2} />)}
          {p && <Person {...p} semente={1} />}
        </>}
      />
    );
  },
  Sobre: ({ f }) => (
    <>
      <CronometroCanto f={f} />
      {f >= T(251) && [0, 1, 2, 3, 4].map((i) => <Flash key={i} x={[1180, 1420, 1650, 1300, 1550][i]} y={[420, 380, 420, 300, 300][i]} k={((f - T(251) + i * 4) % 12) / 8} />)}
    </>
  ),
};

// ------------------------------------------------------------------ 96. você segura o cartão; a mão treme; 10 segundos; Bip (o corte); silêncio
const p96: PlanoV = {
  nome: "a mão tremendo: Bip", de: CORTE(251), ate: CORTE(256), enquadra: { x: 760, y: 690, zoom: 2.0 },
  eventos: [
    { f: CORTE(251), tipo: "corte", desc: "close nas mãos: cartão e tesoura" },
    { f: T(252), tipo: "pose", desc: "segura o cartão", verbo: "segurar" },
    { f: T(253, fracDe(253, "tremendo")), tipo: "pose", desc: "a mão treme" },
    { f: T(254), tipo: "objeto", desc: "10 segundos" },
    { f: T(255), tipo: "objeto", desc: "Bip: a tesoura fecha, o cartão parte" },
    { f: T(256), tipo: "objeto", desc: "silêncio: tudo para" },
  ],
  Cena: ({ f, cam }) => {
    const set = VARANDA.set;
    const treme = f >= T(253, fracDe(253, "tremendo")) && f < T(255) ? Math.sin(f * 2.3) * 5 : 0;
    const corte = f >= T(255);
    const fecha = corte ? 0 : f >= T(254) ? 1 - 0.3 * entre(f, T(254), T(255)) : 1;
    let p: PersonProps = { ...props(PROTAGONISTA), ...idle(emPe(set, "chao", 700))(corte ? T(255) : f), expr: expressaoNoQuadro([[0, "sigma"], [T(253), "triste"], [T(255), "neutro"]], f, 6) };
    p = segura(p, "R", [60 + treme, -250], TESOURA, { t: 0, comprimento: fecha }, -20);
    if (!corte) p = segura(p, "L", [-16 + treme, -250], CARTAO, { t: 0 }, 0);
    else p = { ...p, handL: [-90, -200], gripL: "open" };
    p.lookAt = [10, -250];
    // as duas metades caem depois do corte
    const k = corte ? Math.min(1, (f - T(255)) / 10) : 0;
    const metades = corte ? [
      <g key="a" transform={`translate(${700 - 30 - 40 * k} ${962 - 250 * 1.0 + 300 * k * k}) rotate(${-40 * k}) scale(2.2)`}><MEIO_CARTAO.Desenho t={0} /></g>,
      <g key="b" transform={`translate(${700 + 10 + 50 * k} ${962 - 250 * 1.0 + 320 * k * k}) rotate(${180 + 60 * k}) scale(2.2)`}><MEIO_CARTAO.Desenho t={0} /></g>,
    ] : null;
    const silencio = entre(f, T(256), T(256) + 8);
    return (
      <div style={{ position: "absolute", inset: 0, filter: `grayscale(${(0.7 * silencio).toFixed(3)})` }}>
        <CenaCam cenario={VARANDA} f={f} cam={cam} noMeio={<><Person {...p} semente={1} />{metades}</>} />
      </div>
    );
  },
  Sobre: ({ f }) => (
    <>
      {f < T(255) && f >= T(251) && f < T(254) && [0, 1].map((i) => <Flash key={i} x={[1500, 1700][i]} y={[260, 420][i]} k={((f + i * 6) % 12) / 8} />)}
      {f < T(255) + 1 && <CronometroCanto f={f} cx={1380} cy={360} />}
      <Estrela x={1100} y={330} f={f} de={T(255)} ate={T(256)} texto="BIP." r={130} cor="#FFFFFF" rot={-4} />
    </>
  ),
};

// ------------------------------------------------------------------ 97. duas metades de um cartão preto caídas na varanda
const p97: PlanoV = {
  nome: "duas metades na varanda", de: CORTE(256), ate: CORTE(257), enquadra: { x: 760, y: 900, zoom: 2.4 }, pushIn: 0.08,
  eventos: [
    { f: CORTE(256), tipo: "corte", desc: "o piso da varanda" },
    { f: T(257, fracDe(257, "Duas metades")), tipo: "objeto", desc: "as duas metades" },
  ],
  Cena: ({ f, cam }) => (
    <div style={{ position: "absolute", inset: 0, filter: "grayscale(0.55)" }}>
      <CenaCam cenario={VARANDA} f={f} cam={cam}
        naFrente={<>
          <ObjetoNoMundo def={MEIO_CARTAO} em={[690, 950]} s={2} rot={-24} e={{ t: 0 }} />
          <g transform="translate(850 944) rotate(196) scale(2)"><MEIO_CARTAO.Desenho t={0} /></g>
        </>}
      />
    </div>
  ),
};

export const CAP10: PlanoV[] = [p89, p90, p91, p92, p93, p94, p95, p96, p97];
export const FIM_CAP10 = CORTE(257);
export const FIGURADOS_CAP10: Record<number, string[]> = {};
