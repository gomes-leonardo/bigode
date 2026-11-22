// Capítulo 5 (falas 78 a 106): pensar maior. A Ferrari (fácil), todas as Ferraris (lista de espera); dinheiro não
// faz as coisas acontecerem mais rápido. Futebol: comprar um gigante, não dá para chegar e virar dono; estrutura dos
// clubes; contratar o melhor do mundo e um elenco de estrelas, mas é preciso convencer, negociar e esperar a janela.
// Clubes e estádios aparecem só como camisas e prédios genéricos (sem escudo nem marca).
import "react";
import { Person, type PersonProps } from "../../components/Person";
import { expressaoNoQuadro } from "../../components/Face";
import { crossArms, idle, point, walk } from "../../rig/actions";
import { BOLA } from "../../objects/objetos";
import { CARRO_ESPORTIVO, CARTAO, SACO } from "../../objects/extras";
import { TACA } from "../../objects/extras2";
import { emPe, sentadoEm } from "../../cenarios/ancoras";
import { liso } from "../../cenarios/liso/Liso";
import { CAMPINHO } from "../../cenarios/campinho/Campinho";
import { escritorioCom } from "../../cenarios/escritorio/Escritorio";
const CLUBE = escritorioCom("CLUBE", "#8E2A22");
import { AMIGO, CRAQUE, PROTAGONISTA, SEGURANCA, figurante } from "../../elenco/elenco";
import { emPeNa, olhar, props } from "../../fase4/Cenarios";
import { sit } from "../../rig/actions";
import { Aprovado, IconeCalendario, IconeCamisa, IconeCheque, IconeContrato, IconeEstadio, IconeFabrica, IconeGlobo, IconeGuindaste, IconePrancheta, IconeRelogio, IconeX, Selo, TextoPop } from "../graficos";
import { CenaCam, entre, fracDe, segura, type PlanoV } from "./comum";
import { cartela } from "./titulo";
import { CORTE, T } from "./tempo";
import { FIM_CAP4 } from "./cap4";

const lim = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const CINZA = liso("#E1E4E8");
const VERMELHO = "#D33A2C";

// ------------------------------------------------------------------ 25-27. pense maior: a Ferrari (fácil); todas as Ferraris (não é tão fácil): fábrica, lista de espera; não acontece mais rápido
const p25: PlanoV = {
  nome: "a Ferrari e a lista de espera", de: FIM_CAP4, ate: CORTE(86), enquadra: { x: 960, y: 560, zoom: 1.0 },
  eventos: [
    { f: FIM_CAP4, tipo: "corte", desc: "pense maior" },
    { f: T(79), tipo: "objeto", desc: "uma Ferrari" },
    { f: T(80), tipo: "objeto", desc: "fácil", verbo: "comprar" },
    { f: T(81), tipo: "objeto", desc: "todas as Ferraris: a fila de carros" },
    { f: T(82), tipo: "objeto", desc: "não é tão fácil" },
    { f: T(83), tipo: "objeto", desc: "fábrica: quantidade limitada por ano" },
    { f: T(84), tipo: "objeto", desc: "lista de espera" },
    { f: T(85), tipo: "objeto", desc: "dinheiro compra coisas" },
    { f: T(86), tipo: "objeto", desc: "relógio: não acelera" },
  ],
  Cena: ({ f, cam }) => {
    const set = CINZA.set;
    const p: PersonProps = { ...props(PROTAGONISTA), ...(f >= T(84) && f < T(85) ? crossArms(emPe(set, "chao", 380))(f) : idle(emPe(set, "chao", 380))(f)), expr: expressaoNoQuadro([[0, "convencido"], [T(82), "chocado"], [T(84), "bravo"], [T(85), "sigma"], [T(86), "triste"]], f, 6) };
    p.lookAt = olhar(p, [1200, 600]);
    const um = f >= T(79) && f < T(81);
    const fila = f >= T(81) && f < T(83);
    const chega = entre(f, T(79), T(79) + 14);
    return (
      <CenaCam cenario={CINZA} f={f} cam={cam}
        noMeio={<>
          <Person {...p} semente={1} />
          {um && <g transform={`translate(${1250 + (1 - chega) * 900} 950) scale(1.6)`}><CARRO_ESPORTIVO.Desenho t={0} cor={VERMELHO} /></g>}
          {fila && Array.from({ length: 6 }, (_, i) => {
            const k = entre(f, T(81) + i * 3, T(81) + i * 3 + 10);
            const para = f >= T(82) ? 0 : 1;
            return <g key={i} transform={`translate(${760 + i * 230 + (1 - k) * 1200 * para} ${960 - i * 6}) scale(0.62)`}><CARRO_ESPORTIVO.Desenho t={0} cor={VERMELHO} /></g>;
          })}
        </>}
      />
    );
  },
  Sobre: ({ f }) => (
    <>
      <TextoPop x={1100} y={200} f={f} de={FIM_CAP4 + 4} ate={T(79)} texto="PENSE MAIOR" tam={110} cor="#F2D16B" rot={-3} />
      <Aprovado x={1250} y={300} f={f} de={T(80)} ate={T(81)} texto="FÁCIL" />
      <TextoPop x={1250} y={230} f={f} de={T(81)} ate={T(82)} texto="TODAS" tam={100} rot={-3} />
      {f >= T(82) && f < T(83) && <g transform="translate(1250 600)"><IconeX r={150} /></g>}
      <TextoPop x={1250} y={230} f={f} de={T(82)} ate={T(83)} texto="NÃO É TÃO FÁCIL" tam={74} cor="#E0826E" rot={-3} />
      <Selo x={1250} y={520} f={f} de={T(83)} ate={T(84)} r={170} rotulo="POUCAS POR ANO"><g transform="scale(1.6)"><IconeFabrica /></g></Selo>
      {f >= T(84) && f < T(85) && (
        <g transform={`translate(1250 560) scale(${lim((f - T(84)) / 8) * 1.25})`}>
          <IconePrancheta linhas={["LISTA DE ESPERA", "1. sheik", "2. cantor", "3. jogador", "...", "4.817. VOCÊ"]} destaque={5} />
        </g>
      )}
      <Selo x={1250} y={480} f={f} de={T(85)} ate={T(86)} r={150} rotulo="COMPRA COISAS" cor="#DFF2D8"><g transform="scale(0.8)"><CARRO_ESPORTIVO.Desenho t={0} cor={VERMELHO} /></g></Selo>
      <Selo x={1250} y={480} f={f} de={T(86)} ate={CORTE(86)} r={150} rotulo="NÃO ACELERA O TEMPO"><g transform="scale(1.9)"><IconeRelogio giro={(f - T(86)) * 2} /></g></Selo>
    </>
  ),
};

// ------------------------------------------------------------------ 28. cartela: FUTEBOL
const p28 = cartela(CORTE(86), 87, 88, "FUTEBOL", () => <g transform="scale(2.2) translate(0 24)"><BOLA.Desenho t={0} /></g>);

// ------------------------------------------------------------------ 29. seu próprio time: não de várzea, um gigante
const p29: PlanoV = {
  nome: "campinho: o próprio time", de: CORTE(88), ate: CORTE(91), enquadra: { x: 960, y: 600, zoom: 1.1 },
  eventos: [
    { f: CORTE(88), tipo: "corte", desc: "campinho" },
    { f: T(90), tipo: "objeto", desc: "não um time de várzea" },
    { f: T(91), tipo: "objeto", desc: "um gigante: estádio" },
  ],
  Cena: ({ f, cam }) => {
    const set = CAMPINHO.set;
    let p: PersonProps = { ...props(PROTAGONISTA), ...idle(emPe(set, "chao", 560))(f), expr: expressaoNoQuadro([[0, "convencido"], [T(91), "rindo"]], f, 6) };
    p = segura(p, "R", [100, -230], BOLA, { t: 0 }, 0);
    p.lookAt = olhar(p, f >= T(91) ? [1300, 300] : [1200, 700]);
    const varzea = [{ ...props(AMIGO), ...idle(emPe(set, "chao", 1080))(f), expr: "rindo" }, emPeNa(figurante(12), set, "chao", 1300, f, {}, 0.3), emPeNa(figurante(16), set, "chao", 1520, f + 9, {}, 0.3)];
    return <CenaCam cenario={CAMPINHO} f={f} cam={cam} noMeio={<><Person {...p} semente={1} />{varzea.map((v, i) => <Person key={i} {...(v as PersonProps)} semente={4 + i} />)}</>} />;
  },
  Sobre: ({ f }) => (
    <>
      <TextoPop x={960} y={170} f={f} de={T(89, 0.2)} ate={T(90)} texto="SEU PRÓPRIO TIME" tam={80} cor="#F2D16B" rot={-3} />
      {f >= T(90) && f < T(91) && <g transform="translate(1300 520)"><IconeX r={200} /></g>}
      <TextoPop x={1300} y={200} f={f} de={T(90)} ate={T(91)} texto="VÁRZEA? NÃO." tam={74} rot={-3} />
      {f >= T(91) && <g transform={`translate(1300 ${560 - entre(f, T(91), T(91) + 12) * 120}) scale(2.3)`}><IconeEstadio /></g>}
      <TextoPop x={1300} y={170} f={f} de={T(91, 0.2)} ate={CORTE(91)} texto="UM GIGANTE" tam={90} cor="#F2D16B" rot={-3} />
    </>
  ),
};

// ------------------------------------------------------------------ 30. quer comprar três gigantes (camisas genéricas)
const CAMISAS: { cor: string; cor2: string; listras: "vertical" | "horizontal" | "nenhuma" }[] = [
  { cor: "#D33A2C", cor2: "#141414", listras: "horizontal" },
  { cor: "#2E7D4F", cor2: "#FFFFFF", listras: "nenhuma" },
  { cor: "#F4F1EA", cor2: "#141414", listras: "vertical" },
];
const p30: PlanoV = {
  nome: "três camisas", de: CORTE(91), ate: CORTE(94), enquadra: { x: 960, y: 560, zoom: 1.0 },
  eventos: [
    { f: CORTE(91), tipo: "corte", desc: "primeira camisa", verbo: "comprar" },
    { f: T(93), tipo: "objeto", desc: "segunda camisa" },
    { f: T(94), tipo: "objeto", desc: "terceira camisa" },
  ],
  Cena: ({ f, cam }) => {
    const set = CINZA.set;
    const qual = f >= T(94) ? 2 : f >= T(93) ? 1 : 0;
    const alvos = [[560, 380], [960, 380], [1360, 380]];
    const p: PersonProps = { ...props(PROTAGONISTA), ...point({ ...emPe(set, "chao", 240), alvo: [(alvos[qual][0] - 240) / 1.35, (alvos[qual][1] - 962) / 1.35] })(f - CORTE(91)), expr: "convencido" };
    p.lookAt = olhar(p, alvos[qual] as [number, number]);
    return <CenaCam cenario={CINZA} f={f} cam={cam} noMeio={<Person {...p} semente={1} />} />;
  },
  Sobre: ({ f }) => (
    <>
      {CAMISAS.map((c, i) => <Selo key={i} x={760 + i * 400} y={440} f={f} de={[T(92), T(93), T(94)][i]} r={1}><g transform="scale(1.7)"><IconeCamisa {...c} /></g></Selo>)}
      <TextoPop x={1160} y={170} f={f} de={T(92)} ate={CORTE(94)} texto="QUERO COMPRAR" tam={70} cor="#F2D16B" rot={-3} />
    </>
  ),
};

// ------------------------------------------------------------------ 31. bilhões e não dá para aparecer nos estádios e dizer que é o dono
const p31: PlanoV = {
  nome: "o dono que não entra", de: CORTE(94), ate: CORTE(95), enquadra: { x: 960, y: 560, zoom: 1.0 },
  eventos: [
    { f: CORTE(94), tipo: "corte", desc: "chega com bilhões" },
    { f: T(95, fracDe(95, "na Gávea")), tipo: "objeto", desc: "estádio 1" },
    { f: T(95, fracDe(95, "no Allianz")), tipo: "objeto", desc: "estádio 2" },
    { f: T(95, fracDe(95, "na Neo")), tipo: "objeto", desc: "estádio 3" },
    { f: T(95, fracDe(95, "e dizer")), tipo: "pose", desc: "o segurança barra" },
  ],
  Cena: ({ f, cam }) => {
    const set = CINZA.set;
    const anda = walk({ ...emPe(set, "chao", 300), xa: 300, xb: 820, f0: CORTE(94) + 2, quadros: 8 });
    let p: PersonProps = { ...props(PROTAGONISTA), ...(f < anda.fim ? anda(f) : idle(emPe(set, "chao", 820))(f)), expr: expressaoNoQuadro([[0, "convencido"], [T(95, fracDe(95, "e dizer")), "chocado"]], f, 6) };
    p = segura(p, "L", [-110, -190], SACO, { t: 0, comprimento: 1 }, 0);
    p.lookAt = olhar(p, [1300, 500]);
    const barra = f >= T(95, fracDe(95, "e dizer"));
    const seg: PersonProps = barra ? { ...props(SEGURANCA), ...idle(emPe(set, "chao", 1180))(f), handL: [-120, -250], gripL: "open", bendL: -6, expr: "bravo" } : { ...props(SEGURANCA), ...crossArms(emPe(set, "chao", 1180))(f), expr: "bravo" };
    seg.lookAt = olhar(seg, [p.x, 500]);
    return <CenaCam cenario={CINZA} f={f} cam={cam} noMeio={<><Person {...seg} semente={9} /><Person {...p} semente={1} /></>} />;
  },
  Sobre: ({ f }) => {
    const nomes: [string, string][] = [["na Gávea", "GÁVEA"], ["no Allianz", "ALLIANZ PARQUE"], ["na Neo", "NEO QUÍMICA ARENA"]];
    return (
      <>
        <TextoPop x={500} y={180} f={f} de={CORTE(94) + 4} ate={T(95, fracDe(95, "na Gávea"))} texto="BILHÕES" tam={90} cor="#7FD18C" rot={-4} />
        {nomes.map(([trecho, rot], i) => (
          <Selo key={i} x={520 + i * 440} y={250} f={f} de={T(95, fracDe(95, trecho))} ate={T(95, fracDe(95, "e dizer"))} r={1}>
            <g transform="scale(0.95)"><IconeEstadio /></g>
            <TextoPop x={0} y={110} f={f} de={T(95, fracDe(95, trecho))} texto={rot} tam={34} />
          </Selo>
        ))}
        <TextoPop x={1300} y={230} f={f} de={T(95, fracDe(95, "e dizer"))} ate={CORTE(95)} texto="“SOU O DONO”? NÃO." tam={70} cor="#E0826E" rot={-3} />
      </>
    );
  },
};

// ------------------------------------------------------------------ 32. estruturas associativas, conselhos, sócios, regras
const p32: PlanoV = {
  nome: "conselho do clube", de: CORTE(95), ate: CORTE(96), enquadra: { x: 960, y: 560, zoom: 1.0 },
  eventos: [
    { f: CORTE(95), tipo: "corte", desc: "a sala do clube" },
    { f: T(96, fracDe(96, "conselhos")), tipo: "objeto", desc: "conselhos" },
    { f: T(96, fracDe(96, "sócios")), tipo: "objeto", desc: "sócios" },
    { f: T(96, fracDe(96, "regras")), tipo: "objeto", desc: "regras" },
  ],
  Cena: ({ f, cam }) => {
    const set = CLUBE.set;
    const membros = [[21, 520], [66, 760], [90, 1000], [49, 1240], [12, 1480]].map(([sem, x], i) => {
      const levanta = f >= T(96, fracDe(96, "sócios")) && i % 2 === 0;
      return <Person key={sem} {...emPeNa(figurante(sem), set, "chao", x, f + sem, levanta ? {} : {}, 1)} semente={sem} />;
    });
    return <CenaCam cenario={CLUBE} f={f} cam={cam} noMeio={<>{membros}</>} />;
  },
  Sobre: ({ f }) => (
    <>
      <TextoPop x={400} y={420} f={f} de={T(96, fracDe(96, "conselhos"))} ate={CORTE(96)} texto="CONSELHO" tam={64} cor="#F2D16B" rot={-4} />
      <TextoPop x={960} y={380} f={f} de={T(96, fracDe(96, "sócios"))} ate={CORTE(96)} texto="SÓCIOS" tam={64} cor="#F2D16B" rot={3} />
      <TextoPop x={1500} y={420} f={f} de={T(96, fracDe(96, "regras"))} ate={CORTE(96)} texto="REGRAS" tam={64} cor="#F2D16B" rot={-3} />
    </>
  ),
};

// ------------------------------------------------------------------ 33-34. pode financiar contratações, estádio novo, salários absurdos; não pode comprar a história
const p33: PlanoV = {
  nome: "pode / não pode", de: CORTE(96), ate: CORTE(98), enquadra: { x: 960, y: 560, zoom: 1.0 },
  eventos: [
    { f: CORTE(96), tipo: "corte", desc: "contratações" },
    { f: T(97, fracDe(97, "construir")), tipo: "objeto", desc: "estádio novo" },
    { f: T(97, fracDe(97, "oferecer")), tipo: "objeto", desc: "salários absurdos" },
    { f: T(98), tipo: "objeto", desc: "a história não está à venda" },
  ],
  Cena: ({ f, cam }) => {
    const set = CINZA.set;
    let p: PersonProps = { ...props(PROTAGONISTA), ...idle(emPe(set, "chao", 260))(f), expr: f >= T(98) ? "triste" : "convencido" };
    p = segura(p, "R", [104, -250], CARTAO, { t: f / 30, brilho: (f % 50) / 50 }, -10);
    p.lookAt = olhar(p, [1100, 500]);
    return <CenaCam cenario={CINZA} f={f} cam={cam} noMeio={<Person {...p} semente={1} />} />;
  },
  Sobre: ({ f }) => (
    <>
      <Selo x={640} y={430} f={f} de={CORTE(96) + 3} ate={T(98)} r={130} rotulo="CONTRATAÇÕES"><IconeContrato /></Selo>
      <Selo x={1080} y={430} f={f} de={T(97, fracDe(97, "construir"))} ate={T(98)} r={130} rotulo="ESTÁDIO NOVO"><IconeGuindaste /></Selo>
      <Selo x={1520} y={430} f={f} de={T(97, fracDe(97, "oferecer"))} ate={T(98)} r={130} rotulo="SALÁRIOS"><g transform="scale(0.7)"><IconeCheque /></g></Selo>
      {f >= T(98) && (
        <g transform={`translate(1150 560) scale(${lim((f - T(98)) / 8) * 1.4})`}>
          <rect x={-170} y={-230} width={340} height={360} rx={18} fill="#E9DFCB" stroke="#141414" strokeWidth={8} />
          <g transform="translate(0 40)"><TACA.Desenho t={0} /></g>
          <rect x={-120} y={-200} width={100} height={70} fill="#B9B4AA" stroke="#141414" strokeWidth={5} />
          <rect x={20} y={-200} width={100} height={70} fill="#B9B4AA" stroke="#141414" strokeWidth={5} />
        </g>
      )}
      <TextoPop x={1150} y={190} f={f} de={T(98, 0.2)} ate={CORTE(98)} texto="HISTÓRIA NÃO SE COMPRA" tam={60} cor="#E0826E" rot={-3} />
    </>
  ),
};

// ------------------------------------------------------------------ 35. contratar qualquer jogador: o melhor do mundo (contratado), um elenco de estrelas (feito); convencer, negociar, esperar a janela
const p35: PlanoV = {
  nome: "contratações", de: CORTE(98), ate: CORTE(104), enquadra: { x: 960, y: 560, zoom: 1.0 },
  eventos: [
    { f: CORTE(98), tipo: "corte", desc: "oferta com dinheiro infinito" },
    { f: T(100), tipo: "pose", desc: "o melhor atacante do mundo" },
    { f: T(101), tipo: "objeto", desc: "contratado" },
    { f: T(102), tipo: "pose", desc: "elenco de estrelas" },
    { f: T(103), tipo: "objeto", desc: "feito" },
    { f: T(104), tipo: "pose", desc: "convencer o jogador" },
    { f: T(104, fracDe(104, "negociar")), tipo: "objeto", desc: "negociar" },
    { f: T(104, fracDe(104, "esperar")), tipo: "objeto", desc: "esperar a janela" },
  ],
  Cena: ({ f, cam }) => {
    const set = CLUBE.set;
    const { assento, ...base } = sentadoEm(set, "cadeira_esq");
    let p: PersonProps = { ...props(PROTAGONISTA), ...sit({ ...base, assento })(f + 30), expr: expressaoNoQuadro([[0, "convencido"], [T(104), "olhar-lateral"]], f, 6) };
    p = segura(p, "R", [104, -200 + (p.abaixa ?? 0)], CARTAO, { t: f / 30 }, -10);
    const craque: PersonProps | null = f >= T(100) ? { ...props(CRAQUE), ...(f >= T(104) && f < T(104, fracDe(104, "negociar")) ? crossArms(emPe(set, "chao", 1250))(f) : idle(emPe(set, "chao", 1250))(f)), expr: f >= T(104) ? "nojo" : "convencido" } : null;
    p.lookAt = olhar(p, craque ? [1250, 500] : [1300, 400]);
    const estrelas = f >= T(102) && f < T(104) ? [[21, 1500], [66, 1700], [16, 1040]] : [];
    return (
      <CenaCam cenario={CLUBE} f={f} cam={cam}
        noMeio={<>
          <Person {...p} semente={1} />
          {estrelas.map(([sem, x]) => <Person key={sem} {...emPeNa({ ...figurante(sem), outfit: { camiseta: "#F2D16B", calca: "#2F6E9E", tenis: "#FFFFFF", sola: "#C9C3B8" } }, set, "chao", x, f + sem)} semente={sem} />)}
          {craque && <Person {...craque} semente={13} />}
        </>}
      />
    );
  },
  Sobre: ({ f }) => (
    <>
      <Selo x={1300} y={330} f={f} de={CORTE(98) + 3} ate={T(100)} r={1}><g transform="scale(1.6)"><IconeGlobo giro={f * 2} /></g></Selo>
      <TextoPop x={1300} y={150} f={f} de={T(99, fracDe(99, "qualquer jogador"))} ate={T(100)} texto="QUALQUER JOGADOR" tam={64} cor="#F2D16B" rot={-3} />
      <Aprovado x={1250} y={160} f={f} de={T(101)} ate={T(102)} texto="CONTRATADO" />
      <Aprovado x={1250} y={160} f={f} de={T(103)} ate={T(104)} texto="FEITO" />
      <TextoPop x={760} y={180} f={f} de={T(104)} ate={CORTE(104)} texto="CONVENCER" tam={52} cor="#FFFFFF" rot={-4} />
      <TextoPop x={1150} y={150} f={f} de={T(104, fracDe(104, "negociar"))} ate={CORTE(104)} texto="NEGOCIAR" tam={52} cor="#FFFFFF" rot={3} />
      <Selo x={1560} y={260} f={f} de={T(104, fracDe(104, "esperar"))} ate={CORTE(104)} r={1}><g transform="scale(1.5)"><IconeCalendario texto="JANELA" sub="fechada" cor="#2F6E9E" /></g></Selo>
    </>
  ),
};

// ------------------------------------------------------------------ 36. dinheiro compra jogadores; não garante uma Libertadores
const p36: PlanoV = {
  nome: "a taça fora de alcance", de: CORTE(104), ate: CORTE(106), enquadra: { x: 960, y: 560, zoom: 1.0 },
  eventos: [
    { f: CORTE(104), tipo: "corte", desc: "jogadores comprados" },
    { f: T(106), tipo: "pose", desc: "tenta alcançar a taça" },
  ],
  Cena: ({ f, cam }) => {
    const set = CINZA.set;
    const tenta = f >= T(106);
    const p: PersonProps = { ...props(PROTAGONISTA), ...idle(emPe(set, "chao", 760))(f), expr: tenta ? "triste" : "convencido", handR: tenta ? [120, -330] : [74, -108], gripR: "open", bendR: tenta ? 2 : 6, pulo: tenta ? Math.abs(Math.sin((f - T(106)) / 4)) * 16 : 0 };
    p.lookAt = olhar(p, [1300, 250]);
    const jogs = f < T(106) ? [[21, 1150], [66, 1350], [16, 1550]] : [];
    return (
      <CenaCam cenario={CINZA} f={f} cam={cam}
        noMeio={<>
          <Person {...p} semente={1} />
          {jogs.map(([sem, x]) => <Person key={sem} {...emPeNa({ ...figurante(sem), outfit: { camiseta: "#F2D16B", calca: "#2F6E9E", tenis: "#FFFFFF", sola: "#C9C3B8" } }, set, "chao", x, f + sem)} semente={sem} />)}
        </>}
      />
    );
  },
  Sobre: ({ f }) => (
    <>
      <TextoPop x={1350} y={200} f={f} de={T(105, 0.2)} ate={T(106)} texto="COMPRA JOGADORES" tam={64} cor="#7FD18C" rot={-3} />
      {f >= T(106) && <g transform={`translate(1300 ${330 - Math.sin(f / 8) * 8}) scale(1.6)`}><TACA.Desenho t={0} /></g>}
      <TextoPop x={1300} y={120} f={f} de={T(106)} ate={CORTE(106)} texto="NÃO GARANTE A TAÇA" tam={60} cor="#E0826E" rot={-3} />
    </>
  ),
};

export const CAP5: PlanoV[] = [p25, p28, p29, p30, p31, p32, p33, p35, p36];
export const FIM_CAP5 = CORTE(106);
export const FIGURADOS_CAP5: Record<number, string[]> = {};
