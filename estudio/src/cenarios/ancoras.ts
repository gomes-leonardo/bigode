// Âncoras de cenário (vêm do set.json de cada cenário). O personagem é sempre posicionado por âncora, nunca por
// x,y solto: o y sai da âncora (chão, assento, quina da cama, maca), então ninguém flutua.
// Objetos também: apoio na superfície (tampo), na boca do fogão ou no chão.
import type { P } from "../components/Person";

export type Ancora =
  | { tipo: "chao"; y: number; yFundo?: number; x0: number; x1: number } // linha do chão (yFundo = perto da parede)
  | { tipo: "assento"; x: number; y: number; chao: number } // cadeira, sofá, banco. y = superfície do assento; chao = onde ficam os pés
  | { tipo: "quina"; x: number; y: number; chao: number } // quina da cama
  | { tipo: "maca"; x: number; y: number; chao: number } // maca do consultório (chao = degrau)
  | { tipo: "tampo"; y: number; x0: number; x1: number } // tampo de mesa, bancada, balcão, criado-mudo
  | { tipo: "boca"; x: number; y: number }; // boca do fogão (apoio da panela)

export type SetJson = {
  id: string;
  nome: string;
  escala: number; // escala do protagonista neste cenário (os outros multiplicam pela própria)
  luz: { pontos: number[][]; cor: string; opacidade: number };
  ancoras: Record<string, Ancora>;
};

const lim = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const pega = (set: SetJson, nome: string): Ancora => {
  const a = set.ancoras[nome];
  if (!a) throw new Error(`âncora "${nome}" não existe no cenário ${set.id}`);
  return a;
};

/** em pé numa linha de chão: x é a posição ao longo da âncora; prof 0 = na frente, 1 = perto da parede */
export const emPe = (set: SetJson, nome: string, x: number, prof = 0, escalaAtor = 1) => {
  const a = pega(set, nome);
  if (a.tipo !== "chao") throw new Error(`"${nome}" não é chão`);
  return { x: lim(x, a.x0, a.x1), y: a.y + ((a.yFundo ?? a.y) - a.y) * prof, scale: set.escala * escalaAtor };
};

/** sentado (cadeira, sofá, banco, quina da cama, maca): base nos pés e altura do assento para a ação sit */
export const sentadoEm = (set: SetJson, nome: string, escalaAtor = 1) => {
  const a = pega(set, nome);
  if (a.tipo !== "assento" && a.tipo !== "quina" && a.tipo !== "maca") throw new Error(`"${nome}" não é assento`);
  const s = set.escala * escalaAtor;
  return { x: a.x, y: a.chao, scale: s, assento: (a.chao - a.y) / s };
};

/** apoio de objeto: num tampo (x ao longo dele), na boca do fogão ou no chão */
export const apoioEm = (set: SetJson, nome: string, x?: number): P => {
  const a = pega(set, nome);
  if (a.tipo === "tampo") return [lim(x ?? (a.x0 + a.x1) / 2, a.x0, a.x1), a.y];
  if (a.tipo === "boca") return [a.x, a.y];
  if (a.tipo === "chao") return [lim(x ?? (a.x0 + a.x1) / 2, a.x0, a.x1), a.y];
  throw new Error(`"${nome}" não é apoio de objeto`);
};

/** valor de uma âncora para desenhar o móvel exatamente onde ela está */
export const ancora = <T extends Ancora["tipo"]>(set: SetJson, nome: string, tipo: T) => {
  const a = pega(set, nome);
  if (a.tipo !== tipo) throw new Error(`"${nome}" é ${a.tipo}, não ${tipo}`);
  return a as Extract<Ancora, { tipo: T }>;
};
