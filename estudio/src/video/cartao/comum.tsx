// Peças comuns dos planos do vídeo do cartão infinito.
import React from "react";
import { maoInfo, type P, type PersonProps } from "../../components/Person";
import { ObjetoNaMao, type EstadoObj, type ObjetoDef } from "../../objects/objetos";
import { Cena, type Camera, type CenarioDef } from "../../cenarios/Cena";
import type { Plano } from "../../camera/Camera";
import type { Evento } from "../../camera/ritmo";
import { suave } from "../../rig/pose";
import { FALAS } from "./tempo";

/** plano do vídeo: câmera + o que desenhar (cena e gráficos por cima) + eventos para o verificador de ritmo */
export type PlanoV = Plano & {
  nome: string;
  Cena: React.FC<{ f: number; cam: Camera }>;
  Sobre?: React.FC<{ f: number }>; // gráficos na tela (não seguem a câmera)
  eventos: Evento[];
  semLegenda?: number[]; // falas cuja legenda não aparece (ex.: o título já escreve o texto na tela)
};

export const entre = (f: number, a: number, b: number) => suave((f - a) / Math.max(1, b - a));
/** boca falando durante [de, ate) */
export const falando = (f: number, de: number, ate: number) => (f >= de && f < ate ? 0.2 + 0.7 * Math.abs(Math.sin((f - de) * 0.85)) : 0);
/** fração da fala onde começa um trecho do texto (para sincronizar com uma palavra) */
export const fracDe = (id: number, trecho: string) => {
  const t = FALAS[id].texto;
  const i = t.indexOf(trecho);
  return i < 0 ? 0 : i / t.length;
};
/** cena com a câmera do plano */
export const CenaCam: React.FC<{ cenario: CenarioDef; f: number; cam: Camera; noMeio?: React.ReactNode; naFrente?: React.ReactNode }> = ({ cenario, f, cam, noMeio, naFrente }) => (
  <Cena cenario={cenario} t={f / 30} camera={cam} noMeio={noMeio} naFrente={naFrente} />
);
/** posição na tela de um ponto do mundo, para uma câmera (camada do meio) */
export const naTela = (cam: Camera, w: P): P => {
  const z = cam.zoom ?? 1;
  let x = 960 + (w[0] - (cam.x ?? 960)) * z, y = 540 + (w[1] - (cam.y ?? 540)) * z;
  if (cam.otico) { x = cam.otico.px + (x - cam.otico.px) * cam.otico.z; y = cam.otico.py + (y - cam.otico.py) * cam.otico.z; }
  return [x, y];
};
export type Pessoa = PersonProps;

/** põe um objeto na mão (lado L = esquerda da tela, R = direita): a mão vai para `alvo` e fecha no ponto de pega */
export const segura = (p: PersonProps, lado: "L" | "R", alvo: P, def: ObjetoDef, e: EstadoObj, ang = 0): PersonProps => {
  const q: PersonProps = lado === "L" ? { ...p, handL: alvo, gripL: "fist" } : { ...p, handR: alvo, gripR: "fist" };
  const m = maoInfo(q, lado);
  return { ...q, propsHands: <>{p.propsHands}<ObjetoNaMao def={def} mao={m.pos} ang={ang} e={e} /></> };
};
/** centro do rosto no mundo (para lágrimas, zoom de reação) */
export const rostoNoMundo = (p: PersonProps): P => {
  const s = p.scale ?? 1;
  return [p.x, p.y - (330 + ((p.headScale ?? 1) - 1) * 80 - (p.abaixa ?? 0) + (p.pulo ?? 0)) * s];
};
