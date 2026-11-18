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
  // vídeo da mentira
  livia: { v: { pele: "#C9895E", cabelo: "chiquinhas", corCabelo: "#151515", camisa: "#F2C94C", vestido: "#F2C94C", baixo: "saia", corBaixo: "#F2C94C", calcado: "#E9707F" }, esc: 0.8 },
  liviaBranco: { v: { pele: "#C9895E", cabelo: "chiquinhas", corCabelo: "#151515", camisa: "#FBFBF7", vestido: "#FBFBF7", baixo: "saia", corBaixo: "#FBFBF7", calcado: "#F2C94C" }, esc: 0.8 },
  jorge: { v: { pele: "#B9774E", cabelo: "curto", corCabelo: "#1A1410", camisa: "#3FAF63", baixo: "calca", corBaixo: "#3E4E7A", calcado: "#2A2A35", bigode: true, ...adulto }, esc: 1.34 },
  beto: { v: { pele: "#D9A27A", cabelo: "curto", corCabelo: "#8A8A8A", camisa: "#FBFBF7", manga: "nenhuma", baixo: "short", corBaixo: "#3E4E7A", calcado: "#2E6B43", barba: true, cabeca: 0.82, tronco: 1.14 }, esc: 1.34 },
  marta: { v: { pele: "#8D5A3B", cabelo: "lenco", lenco: "#E9707F", corCabelo: "#151515", camisa: "#F2A65A", vestido: "#F2A65A", avental: "#FBFBF7", baixo: "saia", corBaixo: "#F2A65A", calcado: "#5A4A3A", ...adulto }, esc: 1.28 },
  vendedor: { v: { pele: "#E0B08A", cabelo: "curto", corCabelo: "#151515", camisa: "#FBFBF7", terno: "#7A8BC0", brilho: true, gravata: "#E23B2E", baixo: "calca", corBaixo: "#7A8BC0", calcado: "#2A2A35", bigode: true, ...adulto }, esc: 1.32 },
  delegado: { v: { pele: "#A86A44", cabelo: "curto", corCabelo: "#6A6A6A", camisa: "#E8E4DA", terno: "#5A4A3A", gravata: "#2A2A35", baixo: "calca", corBaixo: "#5A4A3A", calcado: "#2A2A35", bigode: true, ...adulto }, esc: 1.36 },
  campeao: { v: { pele: "#D9A27A", cabelo: "curto", corCabelo: "#2A1A10", camisa: "#9B6FD0", manga: "longa", baixo: "calca", corBaixo: "#2A2A35", calcado: "#2A2A35", bigode: true, chapeu: "fedora", corChapeu: "#2A2A35", ...adulto }, esc: 1.32 },
  suspeito: { v: { pele: "#C9895E", cabelo: "bone", bone: "#6A6A78", corCabelo: "#151515", camisa: "#9AA0A8", baixo: "calca", corBaixo: "#3E4E7A", calcado: "#2A2A35", barba: true, ...adulto }, esc: 1.3 },
  atacante: { v: { pele: "#7A4A30", cabelo: "curto", corCabelo: "#151515", camisa: "#FBFBF7", terno: "#2A2A35", gravata: "#3B6FD6", baixo: "calca", corBaixo: "#2A2A35", calcado: "#2A2A35", ...adulto }, esc: 1.34 },
  medico: { v: { pele: "#E0B08A", cabelo: "careca", corCabelo: "#8A8A8A", camisa: "#7FB7F0", baixo: "calca", corBaixo: "#3B4A6B", calcado: "#2A2A35", oculos: true, jaleco: true, ...adulto }, esc: 1.32 },
  reporter: { v: { pele: "#C9895E", cabelo: "chanel", corCabelo: "#C2701E", camisa: "#E23B2E", baixo: "calca", corBaixo: "#2A2A35", calcado: "#2A2A35", ...adulto }, esc: 1.3 },
  menina: { v: { pele: "#E0B08A", cabelo: "chiquinhas", corCabelo: "#5A3A22", camisa: "#86DDBE", baixo: "saia", corBaixo: "#9B6FD0", calcado: "#FBFBF7" }, esc: 0.97 },
  cientista: { v: { pele: "#E0B08A", cabelo: "curto", corCabelo: "#5A3A22", camisa: "#86DDBE", baixo: "calca", corBaixo: "#3B4A6B", calcado: "#2A2A35", oculos: true, jaleco: true, ...adulto }, esc: 1.3 },
  cientista2: { v: { pele: "#8D5A3B", cabelo: "coque", corCabelo: "#151515", camisa: "#F2A65A", baixo: "calca", corBaixo: "#3B4A6B", calcado: "#2A2A35", jaleco: true, ...adulto }, esc: 1.28 },
  apresentador: { v: { pele: "#D9A27A", cabelo: "curto", corCabelo: "#151515", camisa: "#FBFBF7", terno: "#E23B2E", brilho: true, gravata: "#FFD23F", baixo: "calca", corBaixo: "#E23B2E", calcado: "#2A2A35", ...adulto }, esc: 1.32 },
  empresario: { v: { pele: "#E0B08A", cabelo: "careca", corCabelo: "#8A8A8A", camisa: "#FBFBF7", terno: "#3B4A6B", gravata: "#E9707F", baixo: "calca", corBaixo: "#3B4A6B", calcado: "#2A2A35", oculos: true, ...adulto }, esc: 1.32 },
  adversario: { v: { pele: "#A86A44", cabelo: "cacheado", corCabelo: "#151515", camisa: "#E23B2E", baixo: "short", corBaixo: "#2A2A35", calcado: "#FBFBF7" }, esc: 1.02 },
  crianca: { v: { pele: "#E0B08A", cabelo: "curto", corCabelo: "#8A5A2A", camisa: "#FFD23F", baixo: "short", corBaixo: "#3B6FD6", calcado: "#E9707F", cabeca: 1.1 }, esc: 0.6 },
} satisfies Record<string, Membro>;
export type NomeElenco = keyof typeof ELENCO;
