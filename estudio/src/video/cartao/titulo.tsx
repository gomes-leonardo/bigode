// Cartela de cada subida de clímax: o gancho (uma frase diferente a cada vez, lida do roteiro) + o tema
// (FUTEBOL, ESPAÇO, OURO, CONTAGEM, CASAS) com o ícone.
import React from "react";
import { Person, type PersonProps } from "../../components/Person";
import { idle } from "../../rig/actions";
import { emPe } from "../../cenarios/ancoras";
import { liso } from "../../cenarios/liso/Liso";
import { PROTAGONISTA } from "../../elenco/elenco";
import { olhar, props } from "../../fase4/Cenarios";
import { TextoPop } from "../graficos";
import { CenaCam, type PlanoV } from "./comum";
import { CORTE, FALAS, T } from "./tempo";

const ESCURO = liso("#26313F");
/** o gancho em caixa alta, sem o ponto final, em uma ou duas linhas (quebra no espaço mais perto do meio) */
const linhasDoGancho = (texto: string): string[] => {
  const t = texto.replace(/\.$/, "").toUpperCase();
  if (t.length <= 26) return [t];
  const meio = t.length / 2;
  let melhor = -1;
  for (let i = 0; i < t.length; i++) if (t[i] === " " && (melhor < 0 || Math.abs(i - meio) < Math.abs(melhor - meio))) melhor = i;
  return melhor < 0 ? [t] : [t.slice(0, melhor), t.slice(melhor + 1)];
};
/** de = quadro do corte de entrada; frase = fala do gancho; tema = fala com a palavra do tema */
export const cartela = (de: number, frase: number, tema: number, palavra: string, Icone?: React.FC, cor = "#F2D16B"): PlanoV => {
  const linhas = linhasDoGancho(FALAS[frase].texto);
  const tam = linhas.length > 1 ? 50 : 58;
  return {
    nome: `cartela: ${palavra}`, de, ate: CORTE(tema), enquadra: { x: 960, y: 560, zoom: 1 }, pushIn: 0.08, semLegenda: [frase, tema],
    eventos: [
      { f: de, tipo: "corte", desc: "cartela" },
      { f: T(frase, 0.1), tipo: "objeto", desc: `gancho: ${FALAS[frase].texto}` },
      { f: T(tema), tipo: "objeto", desc: palavra },
    ],
    Cena: ({ f, cam }) => {
      const set = ESCURO.set;
      const p: PersonProps = { ...props(PROTAGONISTA), ...idle(emPe(set, "chao", 1560))(f), expr: f >= T(tema) ? "chocado" : "convencido" };
      p.lookAt = olhar(p, [800, 400]);
      return <CenaCam cenario={ESCURO} f={f} cam={cam} noMeio={<Person {...p} semente={1} />} />;
    },
    Sobre: ({ f }) => (
      <>
        {linhas.map((l, i) => (
          <TextoPop key={i} x={760} y={linhas.length > 1 ? 250 + i * 66 : 300} f={f} de={T(frase, 0.1) + i * 3} texto={l} tam={tam} cor="#FFFFFF" rot={-2} />
        ))}
        <TextoPop x={760} y={500} f={f} de={T(tema)} texto={palavra} tam={150} cor={cor} rot={-4} />
        {Icone && f >= T(tema) && <g transform={`translate(760 720) scale(${Math.min(1, (f - T(tema)) / 8) * 1.4})`}><Icone /></g>}
      </>
    ),
  };
};
