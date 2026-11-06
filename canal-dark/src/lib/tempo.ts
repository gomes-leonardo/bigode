import type { Caption } from "@remotion/captions";
import { FPS } from "../theme";

// Formato de public/timestamps.json (gerado por scripts/timestamps.py).
export type Palavra = Caption & { destaque: boolean };
export type Bloco = {
  id: string;
  arquivo: string;
  inicioMs: number;
  duracaoMs: number;
  legenda: Palavra[];
};
export type Timestamps = {
  estimado: boolean;
  duracaoMs: number;
  blocos: Bloco[];
};

export const msParaQuadro = (ms: number) => Math.round((ms / 1000) * FPS);

export const duracaoBloco = (b: Bloco) => msParaQuadro(b.duracaoMs);
export const inicioBloco = (b: Bloco) => msParaQuadro(b.inicioMs);

const normalizar = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^\w-]/g, "");

// na(bloco, "palavra"): quadro (relativo ao início do bloco) em que a palavra começa a ser falada.
// ocorrencia: 1 = primeira vez que aparece no bloco, 2 = segunda...
export const na = (b: Bloco, palavra: string, ocorrencia = 1) => {
  const alvo = normalizar(palavra);
  const achadas = b.legenda.filter((p) => normalizar(p.text).startsWith(alvo));
  const p = achadas[ocorrencia - 1];
  if (!p)
    throw new Error(`na(): "${palavra}" (${ocorrencia}ª) não está em ${b.id}`);
  return msParaQuadro(p.startMs - b.inicioMs);
};
