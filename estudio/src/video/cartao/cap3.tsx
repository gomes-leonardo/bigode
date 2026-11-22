// Capítulo 3 (falas 33 a 54): o que é dinheiro. Números nas telas, uma promessa de troca, não é coisa física;
// a ilha dos 100 pães (inflação); o Banco Central e a meta de 3%; a regra do cartão: cada real é novo.
import React from "react";
import { Person, type P, type PersonProps } from "../../components/Person";
import { expressaoNoQuadro } from "../../components/Face";
import { idle } from "../../rig/actions";
import { ObjetoNoMundo } from "../../objects/objetos";
import { CARTAO, CEDULA, MOEDA } from "../../objects/extras";
import { ETIQUETA, PAO } from "../../objects/extras2";
import { apoioEm, emPe, sentadoEm } from "../../cenarios/ancoras";
import { liso } from "../../cenarios/liso/Liso";
import { ILHA } from "../../cenarios/ilha/Ilha";
import { ESCRITORIO } from "../../cenarios/escritorio/Escritorio";
import { PADEIRO, PRESIDENTE_BC, PROTAGONISTA, figurante } from "../../elenco/elenco";
import { emPeNa, olhar, props } from "../../fase4/Cenarios";
import { sit } from "../../rig/actions";
import { Contador, Grafico, IconeCelular, IconePao, IconeX, Infinito, Selo, SetaCima, Texto, TextoPop } from "../graficos";
import { CenaCam, entre, fracDe, segura, type PlanoV } from "./comum";
import { CORTE, T } from "./tempo";
import { FIM_CAP2 } from "./cap2";

const lim = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const BEGE = liso("#EADFCB");

// ------------------------------------------------------------------ 11. o que é dinheiro? não existe em moedas ou notas; números nas telas; promessa de troca
const p11: PlanoV = {
  nome: "o que é dinheiro", de: FIM_CAP2, ate: CORTE(36), enquadra: { x: 960, y: 560, zoom: 1.0 },
  eventos: [
    { f: FIM_CAP2, tipo: "corte", desc: "pergunta" },
    { f: T(34, fracDe(34, "não existe")), tipo: "objeto", desc: "moedas e notas riscadas" },
    { f: T(35), tipo: "objeto", desc: "números na tela do banco" },
    { f: T(36), tipo: "pose", desc: "chega o padeiro" },
    { f: T(36, fracDe(36, "Eu troco")), tipo: "objeto", desc: "troca nota por pão" },
  ],
  Cena: ({ f, cam }) => {
    const set = BEGE.set;
    const troca = T(36, fracDe(36, "Eu troco"));
    const meio = lim((f - troca) / 16);
    let p: PersonProps = { ...props(PROTAGONISTA), ...idle(emPe(set, "chao", f < T(36) ? 620 : 700))(f), expr: expressaoNoQuadro([[0, "olhar-lateral"], [T(35), "sigma"]], f, 6) };
    if (f < T(36)) p = { ...p, handR: [30, -300], gripR: "open", bendR: 10 }; // coça a cabeça
    else p = f < troca + 8 ? segura(p, "R", [130 + 40 * meio, -190], CEDULA, { t: 0 }, -10) : segura(p, "R", [120, -196], PAO, { t: 0 }, 0);
    p.lookAt = olhar(p, f < T(36) ? [1250, 380] : [1300, 600]);
    let pad: PersonProps | null = null;
    if (f >= T(36)) {
      pad = { ...props(PADEIRO), ...idle(emPe(set, "chao", 1250))(f + 7), expr: "convencido" };
      pad = f < troca + 8 ? segura(pad, "L", [-130 - 40 * meio, -196], PAO, { t: 0 }, 0) : segura(pad, "L", [-120, -190], CEDULA, { t: 0 }, 10);
      pad.lookAt = olhar(pad, [p.x, 600]);
    }
    return <CenaCam cenario={BEGE} f={f} cam={cam} noMeio={<><Person {...p} semente={1} />{pad && <Person {...pad} semente={7} />}</>} />;
  },
  Sobre: ({ f }) => {
    const risca = T(34, fracDe(34, "não existe"));
    return (
      <>
        <TextoPop x={1250} y={300} f={f} de={FIM_CAP2 + 4} ate={T(34)} texto="?" tam={220} />
        {f >= T(34) && f < T(35) && (
          <g>
            <g transform="translate(1120 360) scale(3)"><MOEDA.Desenho t={0} /></g>
            <g transform="translate(1420 380) scale(2.8) rotate(-8)"><CEDULA.Desenho t={0} /></g>
            {f >= risca && <g transform="translate(1270 330)"><IconeX r={170} /></g>}
          </g>
        )}
        <Selo x={1250} y={420} f={f} de={T(35)} ate={T(36)} r={1}>
          <g transform="translate(0 -30)"><IconeCelular s={1.25}>
            <rect x={0} y={0} width={160} height={46} fill="#4F8A6B" />
            <text x={80} y={30} textAnchor="middle" fontFamily="Montserrat" fontWeight={900} fontSize={18} fill="#FFFFFF">MEU BANCO</text>
            <text x={80} y={110} textAnchor="middle" fontFamily="Montserrat" fontWeight={700} fontSize={16} fill="#555">saldo</text>
            <text x={80} y={146} textAnchor="middle" fontFamily="Montserrat" fontWeight={900} fontSize={24} fill="#141414">R$ 1.250,00</text>
            {[180, 206, 232].map((y) => <rect key={y} x={16} y={y} width={128} height={12} rx={6} fill="#E4DED2" />)}
          </IconeCelular></g>
        </Selo>
        <TextoPop x={960} y={190} f={f} de={T(36, fracDe(36, "Eu troco"))} ate={CORTE(36)} texto="“EU TROCO ISSO POR AQUILO”" tam={60} cor="#F2D16B" rot={-2} />
      </>
    );
  },
};

// ------------------------------------------------------------------ 12. não é coisa física; criar mais dinheiro não faz surgir mais pão
const p12: PlanoV = {
  nome: "imprimir não faz pão", de: CORTE(36), ate: CORTE(38), enquadra: { x: 960, y: 560, zoom: 1.0 },
  eventos: [
    { f: CORTE(36), tipo: "corte", desc: "nota fantasma" },
    { f: T(38), tipo: "objeto", desc: "notas jorrando, o pão continua um" },
  ],
  Cena: ({ f, cam }) => {
    const set = BEGE.set;
    const p: PersonProps = { ...props(PROTAGONISTA), ...idle(emPe(set, "chao", 420))(f), expr: expressaoNoQuadro([[0, "neutro"], [T(38, 0.5), "olhar-lateral"]], f, 6) };
    p.lookAt = olhar(p, [1300, 600]);
    const notas = f >= T(38) ? Math.min(14, Math.floor((f - T(38)) / 2)) : 0;
    return (
      <CenaCam cenario={BEGE} f={f} cam={cam}
        noMeio={<>
          <Person {...p} semente={1} />
          {Array.from({ length: notas }, (_, i) => <ObjetoNoMundo key={i} def={CEDULA} em={[900 + (i % 5) * 70, 960 - Math.floor(i / 5) * 34]} s={1.7} rot={(i * 23) % 20 - 10} e={{ t: 0 }} />)}
          <ObjetoNoMundo def={PAO} em={[1500, 962]} s={2.4} e={{ t: 0 }} />
        </>}
      />
    );
  },
  Sobre: ({ f }) => (
    <>
      {f < T(38) && (
        <g transform={`translate(1200 380) scale(3.4) rotate(-6)`} opacity={0.35 + 0.25 * Math.sin(f / 4)}>
          <CEDULA.Desenho t={0} />
        </g>
      )}
      <TextoPop x={1200} y={250} f={f} de={T(37, 0.3)} ate={T(38)} texto="NÃO É FÍSICO" tam={80} rot={-3} />
      <Contador x={1500} y={760} f={f} de={T(38)} ate={T(38) + 1} valor={1} sufixo=" PÃO" tam={64} fim={CORTE(38)} />
      <TextoPop x={1100} y={220} f={f} de={T(38, 0.2)} ate={CORTE(38)} texto="+ DINHEIRO" tam={70} cor="#7FD18C" rot={-4} />
    </>
  ),
};

// ------------------------------------------------------------------ 13. a ilha: 100 pães e R$ 100; R$ 1; dobra o dinheiro; ainda 100 pães; R$ 2; inflação; dinheiro perseguindo
const PilhaPaes: React.FC<{ x: number; y: number; n: number; s?: number }> = ({ x, y, n, s = 0.5 }) => (
  <g>
    {Array.from({ length: n }, (_, i) => {
      const lin = Math.floor(i / 6), col = i % 6;
      return <g key={i} transform={`translate(${x + (col - 2.5) * 46 * s * 2 + (lin % 2) * 20 * s} ${y - lin * 22 * s * 2})`}><IconePao s={s} /></g>;
    })}
  </g>
);
const p13: PlanoV = {
  nome: "a ilha dos 100 pães", de: CORTE(38), ate: CORTE(46), enquadra: { x: 960, y: 560, zoom: 1.0 },
  eventos: [
    { f: CORTE(38), tipo: "corte", desc: "ilha" },
    { f: T(40), tipo: "objeto", desc: "100 pães e R$ 100" },
    { f: T(41), tipo: "objeto", desc: "etiqueta R$ 1" },
    { f: T(42), tipo: "objeto", desc: "o dinheiro dobra" },
    { f: T(43), tipo: "objeto", desc: "ainda 100 pães" },
    { f: T(44), tipo: "objeto", desc: "etiqueta vira R$ 2" },
    { f: T(45), tipo: "objeto", desc: "INFLAÇÃO" },
    { f: T(46), tipo: "objeto", desc: "notas correndo atrás do pão" },
  ],
  Cena: ({ f, cam }) => {
    const set = ILHA.set;
    const pad: PersonProps = { ...props(PADEIRO), ...idle(emPe(set, "chao", 960, 1))(f), expr: expressaoNoQuadro([[0, "convencido"], [T(44), "rindo"], [T(45), "convencido"]], f, 6) };
    const figs = [[11, 420], [16, 1480]].map(([sem, x]) => <Person key={sem} {...emPeNa(figurante(sem), set, "chao", x, f + sem)} semente={sem} />);
    const preco = f >= T(44) ? "R$ 2" : "R$ 1";
    const tag = apoioEm(set, "barraca", 1110);
    return (
      <CenaCam cenario={ILHA} f={f} cam={cam}
        noMeio={<>
          <Person {...pad} semente={7} />
          <PilhaPaes x={900} y={772} n={18} />
          {f >= T(41) && <ObjetoNoMundo def={ETIQUETA} em={[tag[0], tag[1] - 6]} s={1.6} rot={-8} e={{ t: 0, texto: preco, cor: f >= T(44) ? "#F2D16B" : "#FFFFFF" }} />}
          {figs}
        </>}
      />
    );
  },
  Sobre: ({ f }) => {
    const dobra = entre(f, T(42), T(42) + 12);
    const notas = Math.round(6 + 6 * dobra);
    const corre = T(46);
    return (
      <>
        <Contador x={560} y={180} f={f} de={T(40)} ate={T(40, 0.7)} valor={100} sufixo=" PÃES" tam={74} fim={T(45)} cor="#F2D16B" rot={-3} />
        {f >= T(40) && f < T(45) && (
          <g>
            {Array.from({ length: notas }, (_, i) => <g key={i} transform={`translate(${1340 + (i % 4) * 70} ${300 - Math.floor(i / 4) * 30}) scale(1.5) rotate(${(i * 17) % 14 - 7})`}><CEDULA.Desenho t={0} /></g>)}
            <Texto texto={f >= T(42) ? "R$ 200" : "R$ 100"} tam={74} x={1440} y={180} cor={f >= T(42) ? "#7FD18C" : "#FFFFFF"} />
          </g>
        )}
        <TextoPop x={1440} y={420} f={f} de={T(42)} ate={T(43)} texto="×2" tam={110} cor="#7FD18C" />
        <TextoPop x={560} y={300} f={f} de={T(43)} ate={T(44)} texto="AINDA 100" tam={64} rot={-4} />
        <TextoPop x={960} y={170} f={f} de={T(45)} ate={T(46)} texto="INFLAÇÃO" tam={120} cor="#E0826E" rot={-3} />
        {f >= corre && [0, 1, 2, 3, 4, 5].map((i) => {
          const x = 1900 - ((f - corre) * 16 + i * 90) % 2100;
          const pulo = Math.abs(Math.sin((f + i * 5) / 3)) * 18;
          return (
            <g key={i} transform={`translate(${x} ${430 - pulo})`}>
              <g transform="scale(1.6)"><CEDULA.Desenho t={0} /></g>
              <path d={`M -20 4 l -6 ${18 + Math.sin(f / 2 + i) * 6} M 20 4 l 6 ${18 - Math.sin(f / 2 + i) * 6}`} stroke="#141414" strokeWidth={6} strokeLinecap="round" />
            </g>
          );
        })}
        {f >= corre && <g transform={`translate(${1700 - ((f - corre) * 16) % 2100 - 260} 440)`}><IconePao s={1.2} /></g>}
      </>
    );
  },
};

// ------------------------------------------------------------------ 14. Banco Central: meta de 3% ao ano; lento, constante e chato; como eles gostam
const p14: PlanoV = {
  nome: "banco central", de: CORTE(46), ate: CORTE(49), enquadra: { x: 960, y: 560, zoom: 1.05 },
  eventos: [
    { f: CORTE(46), tipo: "corte", desc: "Banco Central" },
    { f: T(47, fracDe(47, "3%")), tipo: "objeto", desc: "meta de 3%" },
    { f: T(48), tipo: "objeto", desc: "gráfico lento e reto" },
    { f: T(49), tipo: "expressao", desc: "ele sorri" },
  ],
  Cena: ({ f, cam }) => {
    const set = ESCRITORIO.set;
    const { assento, ...base } = sentadoEm(set, "cadeira_esq");
    const pres: PersonProps = { ...props(PRESIDENTE_BC), ...sit({ ...base, assento, wide: PRESIDENTE_BC.wide })(f + 30), expr: expressaoNoQuadro([[0, "neutro"], [T(48), "sigma"], [T(49), "convencido"]], f, 6) };
    pres.lookAt = olhar(pres, [1300, 400]);
    return <CenaCam cenario={ESCRITORIO} f={f} cam={cam} noMeio={<Person {...pres} semente={8} />} />;
  },
  Sobre: ({ f }) => {
    const k = entre(f, T(48), T(49, 1));
    return (
      <>
        <Selo x={1300} y={420} f={f} de={T(47, fracDe(47, "3%"))} ate={T(48)} r={150} cor="#FFFFFF">
          <Texto texto="3%" tam={120} y={30} cor="#4F8A6B" />
          <Texto texto="AO ANO" tam={34} y={90} />
        </Selo>
        {f >= T(48) && <g transform="translate(1300 420)"><Grafico pontos={[[0, 0.3], [0.25, 0.32], [0.5, 0.31], [0.75, 0.33], [1, 0.32]]} k={k} cor="#4F8A6B" /></g>}
        <TextoPop x={1300} y={180} f={f} de={T(48)} ate={CORTE(49)} texto="LENTO. CONSTANTE. CHATO." tam={46} rot={-2} />
      </>
    );
  },
};

// ------------------------------------------------------------------ 15. a regra: cada real é novo; gaste pouco, ninguém percebe; gaste muito, tudo sobe; infinito vs. coisas do mundo
const VERDE = liso("#D9E8D0");
const p15: PlanoV = {
  nome: "a regra do cartão", de: CORTE(49), ate: CORTE(54), enquadra: { x: 960, y: 560, zoom: 1.0 },
  eventos: [
    { f: CORTE(49), tipo: "corte", desc: "a regra" },
    { f: T(50, fracDe(50, "cada real")), tipo: "objeto", desc: "notas novas saindo do cartão" },
    { f: T(51), tipo: "objeto", desc: "uma etiqueta quase não mexe" },
    { f: T(52), tipo: "objeto", desc: "todas as etiquetas sobem" },
    { f: T(53), tipo: "objeto", desc: "infinito" },
    { f: T(54), tipo: "objeto", desc: "as coisas acabam: estoque limitado" },
  ],
  Cena: ({ f, cam }) => {
    const set = VERDE.set;
    let p: PersonProps = { ...props(PROTAGONISTA), ...idle(emPe(set, "chao", 380))(f), expr: expressaoNoQuadro([[0, "convencido"], [T(52), "chocado"], [T(53), "sigma"]], f, 6) };
    p = segura(p, "R", [104, -250], CARTAO, { t: f / 30, brilho: ((f % 50) / 50) }, -10);
    p.lookAt = olhar(p, [1200, 450]);
    return <CenaCam cenario={VERDE} f={f} cam={cam} noMeio={<Person {...p} semente={1} />} />;
  },
  Sobre: ({ f }) => {
    const sai = T(50, fracDe(50, "cada real"));
    const tags: P[] = [[900, 300], [1150, 220], [1400, 320], [1650, 240], [1020, 520], [1300, 560], [1580, 500]];
    return (
      <>
        {f >= sai && f < T(51) && [0, 1, 2, 3].map((i) => {
          const k = lim((f - sai - i * 5) / 14);
          return k > 0 ? (
            <g key={i} transform={`translate(${560 + k * (300 + i * 140)} ${360 - Math.sin(Math.PI * k) * 120 - i * 30}) scale(1.6) rotate(${k * 30})`}>
              <CEDULA.Desenho t={0} />
              <text x={0} y={-36} textAnchor="middle" fontFamily="Montserrat" fontWeight={900} fontSize={16} fill="#141414">NOVO</text>
            </g>
          ) : null;
        })}
        {f >= T(51) && f < T(52) && (
          <g transform="translate(1250 420) scale(2.4)"><ETIQUETA.Desenho t={0} texto={f < T(51, 0.6) ? "R$ 10,00" : "R$ 10,01"} /></g>
        )}
        <TextoPop x={1250} y={250} f={f} de={T(51, 0.3)} ate={T(52)} texto="NINGUÉM PERCEBE" tam={56} rot={-2} />
        {f >= T(52) && f < T(53) && tags.map((t, i) => (
          <g key={i}>
            <g transform={`translate(${t[0]} ${t[1] - entre(f, T(52) + i * 2, T(52) + i * 2 + 14) * 40}) scale(1.6)`}><ETIQUETA.Desenho t={0} texto={`R$ ${20 + i * 7}`} cor="#F2D16B" /></g>
            {f >= T(52) + i * 2 + 6 && <g transform={`translate(${t[0] + 70} ${t[1] - 30})`}><SetaCima s={0.55} /></g>}
          </g>
        ))}
        <Infinito x={1250} y={360} f={f} de={T(53)} ate={T(54)} s={1.3} />
        {f >= T(54) && (
          <g transform="translate(1250 600)">
            {Array.from({ length: 6 }, (_, i) => <rect key={i} x={-150 + (i % 3) * 100} y={-80 - Math.floor(i / 3) * 80} width={90} height={74} rx={6} fill={["#E0822E", "#5AA5B8", "#C0504D"][i % 3]} stroke="#141414" strokeWidth={6} />)}
          </g>
        )}
        <TextoPop x={1250} y={300} f={f} de={T(54, 0.2)} ate={CORTE(54)} texto="ESTOQUE LIMITADO" tam={58} cor="#E0826E" rot={-4} />
      </>
    );
  },
};

export const CAP3: PlanoV[] = [p11, p12, p13, p14, p15];
export const FIM_CAP3 = CORTE(54);
export const FIGURADOS_CAP3: Record<number, string[]> = {};

