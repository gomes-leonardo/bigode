// Elenco do Téo: visual (tira.tsx) e escala de cada personagem.
import { TEO, type Visual } from "./tira";

export type Membro = { v: Visual; esc: number };
const adulto = { cabeca: 0.8, tronco: 1.12 };
export const ELENCO = {
  teo: { v: TEO, esc: 1 },
  dudu: { v: { pele: "#8D5A3B", cabelo: "bone", bone: "#E23B2E", corCabelo: "#151515", camisa: "#FFD23F", baixo: "short", corBaixo: "#3FAF63", calcado: "#FBFBF7" }, esc: 0.98 },
  caco: { v: { pele: "#C9895E", cabelo: "cacheado", corCabelo: "#2A1A10", camisa: "#6A5FD0", baixo: "calca", corBaixo: "#3E4E7A", calcado: "#2A2A35", fone: true, tronco: 1.06 }, esc: 1.14 },
  rose: { v: { pele: "#B9774E", cabelo: "rabo", corCabelo: "#2A1A10", camisa: "#E9707F", vestido: "#E9707F", baixo: "saia", corBaixo: "#E9707F", calcado: "#7A4E9A", ...adulto }, esc: 1.32 },
  cida: { v: { pele: "#A86A44", cabelo: "coque", corCabelo: "#CFCFD6", camisa: "#6FA8DC", vestido: "#6FA8DC", avental: "#FBFBF7", baixo: "saia", corBaixo: "#6FA8DC", calcado: "#5A4A3A", oculos: true, manga: "longa", cabeca: 0.82, tronco: 1.06 }, esc: 1.24 },
  helena: { v: { pele: "#E0B08A", cabelo: "chanel", corCabelo: "#5A3A22", camisa: "#86DDBE", baixo: "calca", corBaixo: "#3B4A6B", calcado: "#2A2A35", oculos: true, jaleco: true, ...adulto }, esc: 1.32 },
  nelson: { v: { pele: "#D9A27A", cabelo: "careca", corCabelo: "#8A8A8A", camisa: "#7FB7F0", baixo: "calca", corBaixo: "#5A4A3A", calcado: "#2A2A35", bigode: true, avental: "#F2C94C", cabeca: 0.82, tronco: 1.16 }, esc: 1.34 },
  enfermeira: { v: { pele: "#8D5A3B", cabelo: "touca", corCabelo: "#151515", camisa: "#86DDBE", baixo: "calca", corBaixo: "#86DDBE", calcado: "#FBFBF7", ...adulto }, esc: 1.3 },
  vizinho: { v: { pele: "#C9895E", cabelo: "curto", corCabelo: "#3A2A1A", camisa: "#E9A66E", baixo: "calca", corBaixo: "#3E4E7A", calcado: "#2A2A35", ...adulto }, esc: 1.32 },
  maeDudu: { v: { pele: "#7A4A30", cabelo: "rabo", corCabelo: "#151515", camisa: "#FFD23F", vestido: "#F2A65A", baixo: "saia", corBaixo: "#F2A65A", calcado: "#2A2A35", ...adulto }, esc: 1.3 },
  turma1: { v: { pele: "#E0B08A", cabelo: "curto", corCabelo: "#C2701E", camisa: "#E23B2E", baixo: "short", corBaixo: "#2A2A35", calcado: "#FBFBF7" }, esc: 1.0 },
  turma2: { v: { pele: "#7A4A30", cabelo: "cacheado", corCabelo: "#151515", camisa: "#F2A65A", baixo: "short", corBaixo: "#3B6FD6", calcado: "#2A2A35" }, esc: 0.96 },
  turma3: { v: { pele: "#C9895E", cabelo: "curto", corCabelo: "#151515", camisa: "#9B6FD0", baixo: "short", corBaixo: "#3FAF63", calcado: "#FBFBF7" }, esc: 1.02 },
  turma4: { v: { pele: "#A86A44", cabelo: "espetado", corCabelo: "#4A2A10", camisa: "#3FB8AF", baixo: "short", corBaixo: "#E9707F", calcado: "#2A2A35" }, esc: 0.97 },
} satisfies Record<string, Membro>;
export type NomeElenco = keyof typeof ELENCO;
