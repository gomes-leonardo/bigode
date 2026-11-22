// Capítulo 2 (falas 25 a 32): como o cartão funciona. Sem nome, sem limite, origem desconhecida, só existe um,
// se perder some; ao pagar, o dinheiro aparece novinho na conta da loja; ninguém perde; dinheiro grátis?
import "react";
import { Person, type PersonProps } from "../../components/Person";
import { expressaoNoQuadro } from "../../components/Face";
import { celebrate, idle, shrug } from "../../rig/actions";
import { paraLocal, alcance } from "../../rig/manuseio";
import { ObjetoNoMundo } from "../../objects/objetos";
import { CARTAO, CEDULA, MAQUININHA } from "../../objects/extras";
import { apoioEm, emPe } from "../../cenarios/ancoras";
import { LOJA } from "../../cenarios/loja/Loja";
import { liso } from "../../cenarios/liso/Liso";
import { ATENDENTE, PROTAGONISTA } from "../../elenco/elenco";
import { emPeNa, olhar, props } from "../../fase4/Cenarios";
import { Aprovado, Estrela, IconeBanco, Puf, TextoPop } from "../graficos";
import { CenaCam, entre, fracDe, segura, type PlanoV } from "./comum";
import { CORTE, T } from "./tempo";
import { FIM_CAP1 } from "./cap1";

const lim = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const ESCURO = liso("#26313F");

// ------------------------------------------------------------------ 9. o cartão: sem nome, sem limite, nenhum banco explica, só existe um, se perder some
const p9: PlanoV = {
  nome: "o cartão preto", de: FIM_CAP1, ate: CORTE(28), enquadra: { x: 960, y: 560, zoom: 1.0 },
  eventos: [
    { f: FIM_CAP1, tipo: "corte", desc: "o cartão gigante" },
    { f: T(26, fracDe(26, "sem nome")), tipo: "objeto", desc: "sem nome" },
    { f: T(26, fracDe(26, "sem limite")), tipo: "objeto", desc: "sem limite" },
    { f: T(27), tipo: "objeto", desc: "bancos sem explicação" },
    { f: T(27, fracDe(27, "só existe")), tipo: "objeto", desc: "só existe um" },
    { f: T(28, 0.45), tipo: "objeto", desc: "o cartão some" },
  ],
  Cena: ({ f, cam }) => {
    const base = emPe(ESCURO.set, "chao", 420);
    const p = { ...props(PROTAGONISTA), ...idle(base)(f), expr: expressaoNoQuadro([[0, "sigma"], [T(28, 0.45), "chocado"]], f, 6) } as PersonProps;
    p.lookAt = olhar(p, [1200, 420]);
    return <CenaCam cenario={ESCURO} f={f} cam={cam} noMeio={<Person {...p} semente={1} />} />;
  },
  Sobre: ({ f }) => {
    const some = T(28, 0.45);
    const k = entre(f, FIM_CAP1, FIM_CAP1 + 14);
    const balanca = Math.sin(f / 18) * 4;
    return (
      <>
        {f < some + 4 && (
          <g transform={`translate(${1200 + (1 - k) * 900} 460) rotate(${-8 + balanca}) scale(7)`}>
            <CARTAO.Desenho t={f / 30} brilho={((f % 60) / 60)} />
          </g>
        )}
        {f >= some && f < some + 24 && <g transform="translate(1200 360)"><Puf k={(f - some) / 24} r={220} /></g>}
        <TextoPop x={1200} y={170} f={f} de={T(26, fracDe(26, "sem nome"))} ate={T(27)} texto="SEM NOME" tam={70} cor="#FFFFFF" rot={-4} />
        <TextoPop x={1230} y={640} f={f} de={T(26, fracDe(26, "sem limite"))} ate={T(27)} texto="SEM LIMITE" tam={70} cor="#F2D16B" rot={3} />
        {[0, 1, 2].map((i) => (
          <g key={i}>
            <TextoPop x={900 + i * 300} y={720} f={f} de={T(27) + i * 3} ate={some} texto="?" tam={90} />
            {f >= T(27) + i * 3 && f < some && <g transform={`translate(${900 + i * 300} 820) scale(0.9)`}><IconeBanco /></g>}
          </g>
        ))}
        <TextoPop x={1200} y={170} f={f} de={T(27, fracDe(27, "só existe"))} ate={some} texto="SÓ EXISTE 1" tam={80} cor="#F2D16B" rot={-3} />
      </>
    );
  },
};

// ------------------------------------------------------------------ 10. paga: o dinheiro aparece novinho na conta da loja; ninguém perde; dinheiro grátis; qual é o problema?
const MAQ = apoioEm(LOJA.set, "balcao", 1120);
const p10: PlanoV = {
  nome: "loja: dinheiro novinho", de: CORTE(28), ate: CORTE(32), enquadra: { x: 1080, y: 600, zoom: 1.3 },
  eventos: [
    { f: CORTE(28), tipo: "corte", desc: "volta à loja" },
    { f: T(29, 0.1), tipo: "objeto", desc: "paga com o cartão", verbo: "pagar" },
    { f: T(29, fracDe(29, "novinho")), tipo: "objeto", desc: "notas novinhas saem do caixa" },
    { f: T(30), tipo: "objeto", desc: "ninguém perde: -R$ 0,00" },
    { f: T(31), tipo: "pose", desc: "comemora: dinheiro grátis" },
    { f: T(32), tipo: "pose", desc: "dá de ombros: qual é o problema?" },
  ],
  Cena: ({ f, cam }) => {
    const set = LOJA.set;
    const base = emPe(set, "chao", 1380);
    const toque = paraLocal([MAQ[0] + 30, 640], base.x, base.y, base.scale);
    let p: PersonProps = { ...props(PROTAGONISTA), ...idle(base)(f), expr: "convencido" };
    if (f < T(31)) {
      const mao = f < T(29, 0.4) ? alcance(f, CORTE(28) + 2, T(29, 0.4), [-48, -178], toque, 22) : toque;
      p = segura(p, "L", mao, CARTAO, { t: f / 30 }, -14);
    } else if (f < T(32)) p = { ...props(PROTAGONISTA), ...celebrate(base)(f - T(31)), expr: "rindo" };
    else p = { ...props(PROTAGONISTA), ...shrug(base)(f - T(32)), expr: "olhar-lateral" };
    p.lookAt = olhar(p, f < T(31) ? [MAQ[0], 650] : [960, 400]);
    const at: PersonProps = { ...emPeNa(ATENDENTE, set, "chao_balcao", 900, f + 11), expr: f >= T(29, fracDe(29, "novinho")) ? "rindo" : "neutro" };
    at.lookAt = olhar(at, [700, 560]);
    const sai = T(29, fracDe(29, "novinho"));
    return (
      <CenaCam cenario={LOJA} f={f} cam={cam}
        noMeio={<Person {...at} semente={5} />}
        naFrente={<>
          <ObjetoNoMundo def={MAQUININHA} em={MAQ} s={1.35} e={{ t: f / 30, tela: f >= T(29, 0.4) ? "aprovado" : "nada" }} />
          {[0, 1, 2, 3, 4].map((i) => {
            const k = lim((f - sai - i * 3) / 14);
            if (k <= 0) return null;
            return <ObjetoNoMundo key={i} def={CEDULA} em={[700 + i * 26, 750 - k * (120 + i * 30)]} s={1.6} rot={-10 + i * 6} e={{ t: 0 }} />;
          })}
          <Person {...p} semente={1} />
        </>}
      />
    );
  },
  Sobre: ({ f }) => (
    <>
      <Estrela x={880} y={380} f={f} de={T(29, 0.4)} ate={T(30)} texto="BIP!" r={80} />
      <TextoPop x={560} y={210} f={f} de={T(29, fracDe(29, "novinho"))} ate={T(30)} texto="NOVINHO!" tam={74} cor="#7FD18C" rot={-6} />
      <TextoPop x={960} y={170} f={f} de={T(30)} ate={T(31)} texto="-R$ 0,00" tam={110} cor="#FFFFFF" rot={-3} />
      <Aprovado x={960} y={170} f={f} de={T(31)} ate={T(32)} texto="GRÁTIS?" cor="#E0826E" />
      <TextoPop x={1500} y={260} f={f} de={T(32)} ate={CORTE(32)} texto="?" tam={150} />
    </>
  ),
};

export const CAP2: PlanoV[] = [p9, p10];
export const FIM_CAP2 = CORTE(32);
export const FIGURADOS_CAP2: Record<number, string[]> = { 25: ["comer"] }; // "como funciona"
