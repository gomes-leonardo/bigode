// Capítulo 4 (falas 55 a 77): o primeiro mês. Nunca mais olha preço; a casa da mãe (ela chora duas vezes); o quarto
// vira sala de jogos; camarotes; pizza para a escola; o amigo que sempre paga a pizza; primeira classe e jatinho;
// carros novos (até para o cachorro do vizinho); contas pagas antes de abrir.
import React from "react";
import { Person, type PersonProps } from "../../components/Person";
import { idle, lookAtPhone, walk, wave } from "../../rig/actions";
import { ObjetoNoMundo } from "../../objects/objetos";
import { CELULAR, CONTROLE } from "../../objects/objetos";
import { CAIXA_TENIS, CARTAO } from "../../objects/extras";
import { ENVELOPE, ETIQUETA, PIZZA } from "../../objects/extras2";
import { apoioEm, emPe, sentadoEm } from "../../cenarios/ancoras";
import { LOJA } from "../../cenarios/loja/Loja";
import { SALA } from "../../cenarios/sala/Sala";
import { QUARTO } from "../../cenarios/quarto/Quarto";
import { RUA } from "../../cenarios/rua/Rua";
import { liso, lisoSet } from "../../cenarios/liso/Liso";
import type { CenarioDef } from "../../cenarios/Cena";
import { MARGEM } from "../../cenarios/pecas";
import { AMIGO, DIRETOR, MAE, PROTAGONISTA, figurante } from "../../elenco/elenco";
import { emPeNa, olhar, props, sentadoNa } from "../../fase4/Cenarios";
import { sit } from "../../rig/actions";
import { Aprovado, Estrela, IconeCachorro, IconeCaixaCorreio, IconeCalendario, IconeCarro, IconeCasa, IconeConsole, IconeJatinho, IconeTV, Lagrimas, Puf, Selo, Texto, TextoPop } from "../graficos";
import { CenaCam, entre, falando, fracDe, naTela, rostoNoMundo, segura, type PlanoV } from "./comum";
import { CORTE, T } from "./tempo";
import { FIM_CAP3 } from "./cap3";

const lim = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));

// ------------------------------------------------------------------ 16. o primeiro mês é incrível; nunca mais olha para uma etiqueta de preço; nem uma vez
const p16: PlanoV = {
  nome: "loja: nunca olha o preço", de: FIM_CAP3, ate: CORTE(57), enquadra: { x: 960, y: 560, zoom: 1.03 },
  eventos: [
    { f: FIM_CAP3, tipo: "corte", desc: "primeiro mês" },
    { f: T(56), tipo: "pose", desc: "pega caixas sem olhar o preço", verbo: "olhar" },
    { f: T(57), tipo: "objeto", desc: "nem uma vez" },
  ],
  Cena: ({ f, cam }) => {
    const set = LOJA.set;
    const pega = f >= T(56);
    let p: PersonProps = { ...props(PROTAGONISTA), ...idle(emPe(set, "chao", 1250))(f), expr: "convencido", headTilt: pega ? -8 : 0 };
    if (pega) p = segura(segura(p, "L", [-60, -230], CAIXA_TENIS, { t: 0, cor: "#C0504D" }, 0), "R", [60, -230], CAIXA_TENIS, { t: 0, cor: "#5AA5B8" }, 0);
    p.lookAt = pega ? olhar(p, [1700, 200]) : olhar(p, [960, 400]); // olha para longe das etiquetas
    const at: PersonProps = { ...emPeNa(figurante(31), set, "chao_balcao", 900, f + 9) };
    return (
      <CenaCam cenario={LOJA} f={f} cam={cam}
        noMeio={<Person {...at} semente={31} />}
        naFrente={<>
          {[[700, "R$ 899"], [940, "R$ 1.299"], [1460, "R$ 2.499"]].map(([x, t], i) => <ObjetoNoMundo key={i} def={ETIQUETA} em={[x as number, 690]} s={1.7} rot={-6 + i * 5} e={{ t: 0, texto: t as string }} />)}
          <Person {...p} semente={1} />
        </>}
      />
    );
  },
  Sobre: ({ f }) => (
    <>
      <Selo x={300} y={270} f={f} de={FIM_CAP3 + 3} ate={T(57)} r={1}><g transform="scale(1.7)"><IconeCalendario texto="1º" sub="MÊS" /></g></Selo>
      <TextoPop x={960} y={170} f={f} de={T(57)} ate={CORTE(57)} texto="NEM UMA VEZ" tam={90} cor="#F2D16B" rot={-3} />
    </>
  ),
};

// ------------------------------------------------------------------ 17. paga a casa da mãe; ela chora; confere o aplicativo do banco; chora de novo
const p17: PlanoV = {
  nome: "sala: a casa da mãe", de: CORTE(57), ate: CORTE(61), enquadra: { x: 1000, y: 600, zoom: 1.35 },
  reacoes: [{ em: T(61), alvo: [1180, 960 - 330 * 1.35], solta: CORTE(61) - 2 }],
  eventos: [
    { f: CORTE(57), tipo: "corte", desc: "a casa da mãe" },
    { f: T(58, 0.2), tipo: "objeto", desc: "paga a casa: QUITADA", verbo: "pagar" },
    { f: T(59), tipo: "expressao", desc: "ela chora" },
    { f: T(60), tipo: "objeto", desc: "confere o aplicativo do banco" },
    { f: T(61), tipo: "camera", desc: "chora de novo: zoom de reação" },
  ],
  Cena: ({ f, cam }) => {
    const set = SALA.set;
    let p: PersonProps = { ...props(PROTAGONISTA), ...idle(emPe(set, "chao", 780))(f), expr: "convencido" };
    if (f < T(59)) p = segura(p, "R", [120, -240], CARTAO, { t: f / 30 }, -10);
    let mae: PersonProps = { ...props(MAE), ...idle(emPe(set, "chao", 1180))(f + 4), expr: f >= T(59) ? "triste" : "chocado" };
    if (f >= T(60)) mae = { ...props(MAE), ...lookAtPhone(emPe(set, "chao", 1180))(f - T(60)), expr: "triste" };
    const m = mae;
    p.lookAt = olhar(p, [1180, 520]);
    if (f < T(60)) mae.lookAt = olhar(mae, [780, 520]);
    const rosto = rostoNoMundo(m);
    return (
      <CenaCam cenario={SALA} f={f} cam={cam}
        noMeio={<>
          <Person {...p} semente={1} />
          <Person {...mae} semente={2} propsHands={f >= T(60) ? <g transform="translate(-22 -202)"><g transform="translate(15 27)"><CELULAR.Desenho t={f / 30} vira={1} /></g></g> : undefined} />
          {(f >= T(59) && f < T(60)) || f >= T(61) ? <Lagrimas x={rosto[0]} y={rosto[1] + 10} f={f} s={1.35} /> : null}
        </>}
      />
    );
  },
  Sobre: ({ f }) => (
    <>
      <Selo x={360} y={300} f={f} de={T(58, 0.2)} ate={T(60)} r={110} cor="#FFFFFF" rotulo="QUITADA!"><IconeCasa /></Selo>
      <Estrela x={600} y={170} f={f} de={T(58, 0.2)} ate={T(59, 0.6)} texto="BIP!" r={80} />
    </>
  ),
};

// ------------------------------------------------------------------ 18. o quarto vira sala de jogos: todo console, todo jogo, seis telas e uma cadeira mais cara que um carro
const p18: PlanoV = {
  nome: "quarto: sala de jogos", de: CORTE(61), ate: CORTE(63), enquadra: { x: 960, y: 540, zoom: 1.0 },
  eventos: [
    { f: CORTE(61), tipo: "corte", desc: "o quarto" },
    { f: T(62, 0.3), tipo: "objeto", desc: "luz roxa: vira sala de jogos" },
    { f: T(63, fracDe(63, "todo console")), tipo: "objeto", desc: "consoles" },
    { f: T(63, fracDe(63, "seis telas")), tipo: "objeto", desc: "seis telas" },
    { f: T(63, fracDe(63, "uma cadeira")), tipo: "objeto", desc: "cadeira mais cara que carro" },
  ],
  Cena: ({ f, cam }) => {
    const set = QUARTO.set;
    let p: PersonProps = sentadoNa(PROTAGONISTA, set, "cadeira", f, { expr: "rindo" });
    const ab = p.abaixa ?? 0;
    p = segura(p, "R", [40, -150 + ab], CONTROLE, { t: 0 }, 0);
    p = { ...p, handL: [-40, -150 + ab], gripL: "fist" };
    p.lookAt = olhar(p, [960, 300]);
    const roxo = entre(f, T(62, 0.3), T(62, 0.3) + 10);
    const telas = f >= T(63, fracDe(63, "seis telas")) ? 6 : 0;
    return (
      <CenaCam cenario={QUARTO} f={f} cam={cam}
        noMeio={<>
          <rect x={-MARGEM} y={-MARGEM} width={1920 + 2 * MARGEM} height={890 + MARGEM} fill="#6E3FA8" opacity={0.28 * roxo} />
          {Array.from({ length: telas }, (_, i) => {
            const k = lim((f - T(63, fracDe(63, "seis telas")) - i * 2) / 8);
            return <g key={i} transform={`translate(${620 + (i % 3) * 250} ${250 + Math.floor(i / 3) * 160}) scale(${k})`}><IconeTV w={220} h={130} /></g>;
          })}
          <Person {...p} semente={1} />
        </>}
      />
    );
  },
  Sobre: ({ f }) => {
    const c = T(63, fracDe(63, "todo console"));
    const cad = T(63, fracDe(63, "uma cadeira"));
    return (
      <>
        <TextoPop x={960} y={140} f={f} de={T(62, 0.3)} ate={c} texto="SALA DE JOGOS" tam={84} cor="#F2D16B" rot={-3} />
        {[0, 1, 2].map((i) => <Selo key={i} x={420 + i * 170} y={760} f={f} de={c + i * 3} ate={CORTE(63)} r={70}><IconeConsole /></Selo>)}
        <g transform="translate(1540 330)">
          {f >= cad && <g transform="scale(2.3)"><ETIQUETA.Desenho t={0} texto="+ QUE 1 CARRO" cor="#F2D16B" /></g>}
        </g>
      </>
    );
  },
};

// ------------------------------------------------------------------ 19. camarotes para todos os jogos; os camarotes ao lado para os amigos
const ESTADIO: CenarioDef = (() => {
  const set = lisoSet(1.2);
  set.id = "estadio";
  set.ancoras = { chao: { tipo: "chao", y: 940, yFundo: 930, x0: 60, x1: 1860 }, assento: { tipo: "assento", x: 700, y: 870, chao: 940 }, assento2: { tipo: "assento", x: 1330, y: 870, chao: 940 } };
  const Fundo: React.FC<{ t: number }> = ({ t }) => (
    <g>
      <rect x={-MARGEM} y={-MARGEM} width={1920 + 2 * MARGEM} height={1400} fill="#2B3447" />
      {Array.from({ length: 220 }, (_, i) => (
        <circle key={i} cx={(i * 97) % 2400 - 240} cy={120 + ((i * 53) % 320)} r={9} fill={["#C0504D", "#F4F1EA", "#E3A23B", "#5AA5B8", "#141414"][i % 5]} opacity={0.75 + 0.25 * Math.sin(t * 6 + i)} />
      ))}
      <path d={`M -${MARGEM} 470 Q 960 400 ${1920 + MARGEM} 470 L ${1920 + MARGEM} 900 L -${MARGEM} 900 Z`} fill="#5E9A4E" stroke="#141414" strokeWidth={6} />
      {[0.2, 0.4, 0.6, 0.8].map((k) => <path key={k} d={`M ${-MARGEM} ${470 + k * 400} L ${1920 + MARGEM} ${470 + k * 400}`} stroke="#6DAA5C" strokeWidth={40} opacity={0.5} />)}
      <path d="M 960 430 L 960 900" stroke="#F4F1EA" strokeWidth={6} />
      <ellipse cx={960} cy={600} rx={150} ry={60} stroke="#F4F1EA" strokeWidth={6} fill="none" />
    </g>
  );
  const Meio: React.FC<{ t: number }> = () => (
    <g>
      {/* camarote: vidro, molduras, parapeito */}
      <rect x={-MARGEM} y={-MARGEM} width={1920 + 2 * MARGEM} height={140 + MARGEM} fill="#3A3F4B" stroke="#141414" strokeWidth={7} />
      {[-40, 1015].map((x) => <rect key={x} x={x} y={120} width={30} height={800} fill="#3A3F4B" stroke="#141414" strokeWidth={7} />)}
      <rect x={-MARGEM} y={820} width={1920 + 2 * MARGEM} height={300 + MARGEM} fill="#E9E4DA" stroke="#141414" strokeWidth={7} />
      <rect x={-MARGEM} y={812} width={1920 + 2 * MARGEM} height={22} fill="#B9BEC6" stroke="#141414" strokeWidth={6} />
    </g>
  );
  const Frente: React.FC<{ t: number }> = () => null;
  return { set, Fundo, Meio, Frente };
})();
const p19: PlanoV = {
  nome: "estádio: camarotes", de: CORTE(63), ate: CORTE(65), enquadra: { x: 960, y: 540, zoom: 1.0 },
  eventos: [
    { f: CORTE(63), tipo: "corte", desc: "camarote", verbo: "comprar" },
    { f: T(64, 0.5), tipo: "objeto", desc: "VIP em todos os jogos" },
    { f: T(65), tipo: "pose", desc: "camarote ao lado: os amigos acenam" },
  ],
  Cena: ({ f, cam }) => {
    const set = ESTADIO.set;
    const p: PersonProps = { ...sentadoNa(PROTAGONISTA, set, "assento", f, { expr: "convencido" }) };
    p.lookAt = olhar(p, f >= T(65) ? [1400, 500] : [960, 600]);
    const amigos = f >= T(65)
      ? [{ ...props(AMIGO), ...wave(emPe(set, "chao", 1330))(f - T(65)) }, { ...emPeNa(figurante(12), set, "chao", 1560, f) }, { ...emPeNa(figurante(18), set, "chao", 1140, f + 9) }]
      : [];
    return (
      <CenaCam cenario={ESTADIO} f={f} cam={cam}
        noMeio={<>
          <g>
            <rect x={560} y={700} width={280} height={180} rx={36} fill="#C0504D" stroke="#141414" strokeWidth={7} />
            <rect x={530} y={860} width={340} height={40} rx={16} fill="#A8433F" stroke="#141414" strokeWidth={7} />
          </g>
          <Person {...p} semente={1} />
          {amigos.map((a, i) => <Person key={i} {...(a as PersonProps)} semente={4 + i} />)}
        </>}
      />
    );
  },
  Sobre: ({ f }) => (
    <>
      <TextoPop x={500} y={250} f={f} de={T(64, 0.5)} ate={CORTE(65)} texto="VIP" tam={120} cor="#E3B95B" rot={-4} />
      <TextoPop x={1480} y={250} f={f} de={T(65, 0.2)} ate={CORTE(65)} texto="+ O DO LADO" tam={64} cor="#FFFFFF" rot={3} />
    </>
  ),
};

// ------------------------------------------------------------------ 20. pizza para a escola inteira: alunos, professores, até o diretor
const AMARELO = liso("#F2E3B0");
const p20: PlanoV = {
  nome: "pizza para a escola", de: CORTE(65), ate: CORTE(67), enquadra: { x: 960, y: 560, zoom: 1.0 },
  eventos: [
    { f: CORTE(65), tipo: "corte", desc: "torre de pizzas", verbo: "comprar" },
    { f: T(67), tipo: "objeto", desc: "alunos" },
    { f: T(67, fracDe(67, "cada professor")), tipo: "objeto", desc: "professores" },
    { f: T(67, fracDe(67, "até o diretor")), tipo: "pose", desc: "até o diretor" },
  ],
  Cena: ({ f, cam }) => {
    const set = AMARELO.set;
    const torre = Math.min(16, Math.floor(lim((f - CORTE(65)) / 30) * 16) + 1);
    const dir = f >= T(67, fracDe(67, "até o diretor"));
    let d: PersonProps = { ...props(DIRETOR), ...idle(emPe(set, "chao", 1560))(f), expr: dir ? "convencido" : "bravo" };
    if (dir) d = segura(d, "L", [-80, -250], PIZZA, { t: 0 }, -20);
    const alunos = f >= T(67) ? [[21, 380], [12, 620], [49, 860]] : [];
    const profs = f >= T(67, fracDe(67, "cada professor")) ? [[66, 1110], [90, 1330]] : [];
    return (
      <CenaCam cenario={AMARELO} f={f} cam={cam}
        noMeio={<>
          {Array.from({ length: torre }, (_, i) => <ObjetoNoMundo key={i} def={PIZZA} em={[960 + ((i * 13) % 9) - 4, 962 - i * 30]} s={2.2} e={{ t: 0 }} />)}
          {[...alunos, ...profs].map(([sem, x]) => <Person key={sem} {...emPeNa(figurante(sem), set, "chao", x, f + sem, {}, 1)} semente={sem} />)}
          {(f >= T(66)) && <Person {...d} semente={8} />}
        </>}
      />
    );
  },
  Sobre: ({ f }) => (
    <>
      <TextoPop x={960} y={150} f={f} de={T(66, 0.4)} ate={T(67)} texto="A ESCOLA INTEIRA" tam={78} cor="#C0504D" rot={-3} />
      <TextoPop x={620} y={300} f={f} de={T(67)} ate={CORTE(67)} texto="ALUNOS" tam={56} rot={-4} />
      <TextoPop x={1220} y={300} f={f} de={T(67, fracDe(67, "cada professor"))} ate={CORTE(67)} texto="PROFESSORES" tam={56} rot={3} />
      <TextoPop x={1560} y={190} f={f} de={T(67, fracDe(67, "até o diretor"))} ate={CORTE(67)} texto="O DIRETOR!" tam={60} cor="#F2D16B" rot={-5} />
    </>
  ),
};

// ------------------------------------------------------------------ 21. o melhor amigo ainda compra a pizza às sextas: "Minha vez." Ele não deixa você pagar. Nem uma vez.
const p21: PlanoV = {
  nome: "sala: minha vez", de: CORTE(67), ate: CORTE(72), enquadra: { x: 980, y: 600, zoom: 1.3 },
  eventos: [
    { f: CORTE(67), tipo: "corte", desc: "o amigo chega com a pizza", verbo: "comprar" },
    { f: T(69), tipo: "pose", desc: "minha vez" },
    { f: T(71), tipo: "pose", desc: "oferece o cartão, o amigo empurra de volta", verbo: "pagar" },
    { f: T(72), tipo: "objeto", desc: "nem uma vez" },
  ],
  Cena: ({ f, cam }) => {
    const set = SALA.set;
    const chega = walk({ ...emPe(set, "chao", 1500), xa: 1500, xb: 1190, f0: CORTE(67) + 2, quadros: 7 });
    let a: PersonProps = { ...props(AMIGO), ...(f < chega.fim ? chega(f) : idle(emPe(set, "chao", 1190))(f)), expr: "rindo", fala: falando(f, T(69), T(69, 1)) };
    a = segura(a, "R", [40, -230], PIZZA, { t: 0 }, 0);
    if (f >= T(71)) a = { ...a, handL: [-110, -260], gripL: "open" }; // "não, deixa"
    let p: PersonProps = { ...props(PROTAGONISTA), ...idle(emPe(set, "chao", 760))(f), expr: f >= T(71, 0.5) ? "olhar-lateral" : "rindo" };
    if (f >= T(71)) p = segura(p, "R", [120 + 30 * entre(f, T(71), T(71, 0.4)) - 40 * entre(f, T(71, 0.5), T(71, 1)), -230], CARTAO, { t: f / 30 }, -10);
    p.lookAt = olhar(p, [a.x, 520]);
    a.lookAt = olhar(a, [p.x, 520]);
    return <CenaCam cenario={SALA} f={f} cam={cam} noMeio={<><Person {...p} semente={1} /><Person {...a} semente={4} /></>} />;
  },
  Sobre: ({ f }) => (
    <>
      <Selo x={300} y={250} f={f} de={CORTE(67) + 3} ate={T(69)} r={1}><g transform="scale(1.7)"><IconeCalendario texto="SEXTA" cor="#4F8A6B" /></g></Selo>
      <TextoPop x={1500} y={220} f={f} de={T(69)} ate={T(70, 0.7)} texto="“MINHA VEZ.”" tam={72} cor="#F2D16B" rot={4} />
      <TextoPop x={960} y={160} f={f} de={T(72)} ate={CORTE(72)} texto="NEM UMA VEZ" tam={90} cor="#F2D16B" rot={-3} />
    </>
  ),
};

// ------------------------------------------------------------------ 22. primeira classe; depois um jatinho particular
const CEU = liso("#BFDDEA", 1.2);
const p22: PlanoV = {
  nome: "primeira classe e jatinho", de: CORTE(72), ate: CORTE(74), enquadra: { x: 960, y: 560, zoom: 1.0 },
  eventos: [
    { f: CORTE(72), tipo: "corte", desc: "primeira classe" },
    { f: T(74), tipo: "objeto", desc: "o jatinho chega", verbo: "comprar" },
  ],
  Cena: ({ f, cam }) => {
    const set = CEU.set;
    const p: PersonProps = { ...props(PROTAGONISTA), ...(f < T(74) ? sit({ ...emPe(set, "chao", 520), assento: 70 })(f + 30) : wave(emPe(set, "chao", 520))(f - T(74))), expr: "convencido" };
    p.lookAt = olhar(p, [1300, 400]);
    return (
      <CenaCam cenario={CEU} f={f} cam={cam}
        noMeio={<>
          {f < T(74) && <g>
            <rect x={380} y={600} width={290} height={300} rx={40} fill="#2F6E9E" stroke="#141414" strokeWidth={7} />
            <rect x={340} y={800} width={370} height={100} rx={30} fill="#3A7DB0" stroke="#141414" strokeWidth={7} />
          </g>}
          <Person {...p} semente={1} />
        </>}
      />
    );
  },
  Sobre: ({ f }) => {
    const voa = entre(f, T(74), T(74) + 20);
    return (
      <>
        <TextoPop x={1250} y={300} f={f} de={CORTE(72) + 4} ate={T(74)} texto="1ª CLASSE" tam={96} cor="#FFFFFF" rot={-3} />
        {f >= T(74) && <g transform={`translate(${2300 - voa * 1000} ${420 - voa * 40}) scale(1.6)`}><IconeJatinho /></g>}
        <Estrela x={1500} y={160} f={f} de={T(74, 0.5)} ate={CORTE(74)} texto="BIP!" r={80} />
      </>
    );
  },
};

// ------------------------------------------------------------------ 23. o carro velho da mãe quebra; um novo para ela, para o vizinho e para o cachorro do vizinho
const p23: PlanoV = {
  nome: "rua: carros novos", de: CORTE(74), ate: CORTE(76), enquadra: { x: 940, y: 640, zoom: 1.25 },
  eventos: [
    { f: CORTE(74), tipo: "corte", desc: "o carro velho" },
    { f: T(75, 0.4), tipo: "objeto", desc: "o carro quebra: fumaça" },
    { f: T(76), tipo: "objeto", desc: "carro novo para a mãe", verbo: "comprar" },
    { f: T(76, fracDe(76, "um para o vizinho")), tipo: "objeto", desc: "para o vizinho" },
    { f: T(76, fracDe(76, "outro para o cachorro")), tipo: "objeto", desc: "para o cachorro" },
  ],
  Cena: ({ f, cam }) => {
    const set = RUA.set;
    const mae: PersonProps = { ...props(MAE), ...idle(emPe(set, "chao", 420))(f), expr: f >= T(76) ? "rindo" : f >= T(75, 0.4) ? "chocado" : "neutro" };
    mae.lookAt = olhar(mae, [700, 800]);
    const p: PersonProps = { ...props(PROTAGONISTA), ...idle(emPe(set, "chao", 260))(f), expr: "convencido" };
    p.lookAt = olhar(p, [900, 800]);
    const viz: PersonProps = { ...emPeNa(figurante(66), set, "chao", 1560, f, {}, 1) };
    return <CenaCam cenario={RUA} f={f} cam={cam} noMeio={<><Person {...viz} semente={66} /><Person {...p} semente={1} /><Person {...mae} semente={2} /></>} />;
  },
  Sobre: ({ f }) => {
    const quebra = T(75, 0.4);
    const novos = [T(76), T(76, fracDe(76, "um para o vizinho")), T(76, fracDe(76, "outro para o cachorro"))];
    return (
      <>
        {f < novos[0] && <g transform="translate(860 820) scale(2.4)"><IconeCarro cor="#9A9A8E" /></g>}
        {f >= quebra && f < novos[0] && <g transform={`translate(820 640)`}><Puf k={lim((f - quebra) / 26)} r={140} /></g>}
        <TextoPop x={860} y={420} f={f} de={quebra} ate={novos[0]} texto="CRECK!" tam={80} cor="#E0826E" rot={-6} />
        {novos.map((de, i) => (
          <g key={i}>
            <Selo x={[860, 1260, 1600][i]} y={[780, 760, 790][i]} f={f} de={de} r={1}>
              <g transform={`scale(${[2.4, 2.0, 1.2][i]})`}><IconeCarro cor={["#C0504D", "#5AA5B8", "#F2C230"][i]} /></g>
              {i === 2 && <g transform="translate(6 -40) scale(0.55)"><IconeCachorro /></g>}
            </Selo>
          </g>
        ))}
        <TextoPop x={1600} y={560} f={f} de={novos[2]} ate={CORTE(76)} texto="SÓ POR PRECAUÇÃO" tam={44} rot={4} />
      </>
    );
  },
};

// ------------------------------------------------------------------ 24. cada conta que chega pelo correio é paga antes de você abrir
const AZUL = liso("#CFDCEB");
const p24: PlanoV = {
  nome: "contas pagas antes de abrir", de: CORTE(76), ate: CORTE(77), enquadra: { x: 960, y: 560, zoom: 1.0 },
  eventos: [
    { f: CORTE(76), tipo: "corte", desc: "o correio" },
    { f: T(77, fracDe(77, "é paga")), tipo: "objeto", desc: "PAGO antes de abrir", verbo: "pagar" },
    { f: T(77, fracDe(77, "abrir")), tipo: "pose", desc: "tenta abrir", verbo: "abrir" },
  ],
  Cena: ({ f, cam }) => {
    const set = AZUL.set;
    let p: PersonProps = { ...props(PROTAGONISTA), ...idle(emPe(set, "chao", 760))(f), expr: f >= T(77, fracDe(77, "abrir")) ? "olhar-lateral" : "neutro" };
    p = segura(p, "R", [100, -220], ENVELOPE, { t: 0 }, -8);
    p = { ...p, handL: [-10 + 20 * entre(f, T(77, 0.6), T(77, 0.8)), -224], gripL: "open" };
    p.lookAt = olhar(p, [900, 600]);
    return <CenaCam cenario={AZUL} f={f} cam={cam} noMeio={<Person {...p} semente={1} />} />;
  },
  Sobre: ({ f }) => {
    const paga = T(77, fracDe(77, "é paga"));
    return (
      <>
        <g transform="translate(1350 690) scale(1.8)"><IconeCaixaCorreio /></g>
        {[0, 1, 2, 3].map((i) => {
          const de = CORTE(76) + i * 6;
          const k = lim((f - de) / 14);
          return k > 0 ? (
            <g key={i} transform={`translate(${1350 - k * (380 + i * 60)} ${560 - Math.sin(Math.PI * k) * 160 - i * 40}) rotate(${k * 20 - 10}) scale(1.4)`}>
              <rect x={-40} y={-26} width={80} height={52} rx={5} fill="#FFFFFF" stroke="#141414" strokeWidth={5} />
              <path d="M -38 -24 L 0 4 L 38 -24" stroke="#141414" strokeWidth={4} fill="none" />
              {f >= paga + i * 3 && <text x={0} y={18} textAnchor="middle" fontFamily="Montserrat" fontWeight={900} fontSize={22} fill="#4FAE63" stroke="#141414" strokeWidth={4} paintOrder="stroke" transform="rotate(-12)">PAGO</text>}
            </g>
          ) : null;
        })}
        <Aprovado x={960} y={160} f={f} de={paga} ate={CORTE(77)} texto="PAGO" />
      </>
    );
  },
};

export const CAP4: PlanoV[] = [p16, p17, p18, p19, p20, p21, p22, p23, p24];
export const FIM_CAP4 = CORTE(77);
export const FIGURADOS_CAP4: Record<number, string[]> = {};
export const _x = [naTela, sentadoEm, apoioEm, Texto];
