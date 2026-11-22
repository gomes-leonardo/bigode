// Regras visuais do estúdio (ver GUIA_DE_ESTILO.md).
export const LINHA = "#141414";
export const PAPEL = "#D6D2CA"; // sombra de papel
export const FUNDO = "#EAE6DE";
export const PELE = "#FFFFFF";
export const CONTORNO = 7; // traço do contorno
export const INTERNA = 4.5; // linhas internas (dobras, bainhas)
export const SOMBRA_DX = 5;
export const SOMBRA_DY = 6;
export const FPS = 30;
export const W = 1920;
export const H = 1080;

/** versão 25% mais escura de uma cor (dobras e bainhas) */
export const escura = (hex: string, k = 0.75) => {
  const n = parseInt(hex.slice(1), 16);
  const c = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => Math.round(v * k));
  return `#${c.map((v) => v.toString(16).padStart(2, "0")).join("")}`;
};
