// Cartela que se repete: "E fica ainda mais louco." + o tema (FUTEBOL, ESPAÇO, OURO, CONTAGEM, CASAS).
import React from "react";
import { Person, type PersonProps } from "../../components/Person";
import { idle } from "../../rig/actions";
import { emPe } from "../../cenarios/ancoras";
import { liso } from "../../cenarios/liso/Liso";
import { PROTAGONISTA } from "../../elenco/elenco";
import { olhar, props } from "../../fase4/Cenarios";
import { TextoPop } from "../graficos";
import { CenaCam, type PlanoV } from "./comum";
import { CORTE, T } from "./tempo";

const ESCURO = liso("#26313F");
/** de = quadro do corte de entrada; frase = fala "E fica ainda mais louco."; tema = fala com a palavra do tema */
export const cartela = (de: number, frase: number, tema: number, palavra: string, Icone?: React.FC, cor = "#F2D16B"): PlanoV => ({
  nome: `cartela: ${palavra}`, de, ate: CORTE(tema), enquadra: { x: 960, y: 560, zoom: 1 }, pushIn: 0.08, semLegenda: [tema],
  eventos: [
    { f: de, tipo: "corte", desc: "cartela" },
    { f: T(frase, 0.1), tipo: "objeto", desc: "E FICA AINDA MAIS LOUCO" },
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
      <TextoPop x={760} y={300} f={f} de={T(frase, 0.1)} texto="E FICA AINDA MAIS LOUCO" tam={58} cor="#FFFFFF" rot={-2} />
      <TextoPop x={760} y={500} f={f} de={T(tema)} texto={palavra} tam={150} cor={cor} rot={-4} />
      {Icone && f >= T(tema) && <g transform={`translate(760 720) scale(${Math.min(1, (f - T(tema)) / 8) * 1.4})`}><Icone /></g>}
    </>
  ),
});
