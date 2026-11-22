// Elenco: personagens fixos e figurantes. Todos saem do mesmo componente (Person), só com parâmetros.
// `scale` aqui é relativa: na cena, a escala final = escala da cena x escala do personagem.
import type { Expr } from "../components/Face";
import type { Cabelo } from "../components/Cabelo";
import type { PersonProps, Roupa } from "../components/Person";

export type Ator = Omit<PersonProps, "x" | "y"> & { nome: string; desc: string; expr: Expr };

const SOLA = "#C9C3B8"; // tênis branco com sola cinza clara (só o protagonista tem sola vermelha)
const JEANS = "#3C5A8A";
const ESCURA = "#2B3447";

export const PROTAGONISTA: Ator = {
  nome: "protagonista", desc: "careca, sigma",
  hair: "careca", expr: "sigma",
  outfit: { camiseta: "#E3A23B", calca: JEANS, tenis: "#FFFFFF", sola: "#C9452F" },
};
export const MAE: Ator = {
  nome: "mãe", desc: "coque, saia jeans",
  hair: "coque", hairColor: "#6B4226", expr: "convencido",
  outfit: { camiseta: "#C0504D", tenis: "#FFFFFF", sola: SOLA }, skirt: "#3F6299",
};
export const VO: Ator = {
  nome: "vó", desc: "coque grisalho, óculos, avental",
  hair: "coque", hairColor: "#B8B3AA", glasses: true, expr: "neutro",
  outfit: { camiseta: "#8E7CC3", tenis: "#FFFFFF", sola: SOLA }, skirt: "#7D7C80", apron: "#F2D16B",
  wide: 1.15, scale: 0.82,
};
export const AMIGO: Ator = {
  nome: "melhor amigo", desc: "boné, sorridente",
  hair: "bone", hairColor: "#2F6E9E", expr: "rindo",
  outfit: { camiseta: "#4F8A6B", calca: ESCURA, tenis: "#FFFFFF", sola: SOLA },
};
export const IRMA: Ator = {
  nome: "irmã", desc: "criança, rabo de cavalo",
  hair: "rabo", hairColor: "#6B4226", expr: "olhar-lateral",
  outfit: { camiseta: "#E37BA1", calca: "#5B7FC0", tenis: "#FFFFFF", sola: SOLA },
  scale: 0.62, headScale: 1.08,
};
export const MEDICA: Ator = {
  nome: "médica", desc: "jaleco, óculos",
  hair: "longo", hairColor: "#1E1A18", glasses: true, coat: true, expr: "neutro",
  outfit: { camiseta: "#5AA5B8", calca: ESCURA, tenis: "#FFFFFF", sola: SOLA },
};
export const PADEIRO: Ator = {
  nome: "padeiro", desc: "bigode, avental",
  hair: "laterais", hairColor: "#B8B3AA", mustache: "#B8B3AA", expr: "convencido",
  outfit: { camiseta: "#FFFFFF", calca: "#4A4A4E", tenis: "#FFFFFF", sola: SOLA }, apron: "#FFFFFF",
  wide: 1.25,
};
export const ELENCO: Ator[] = [PROTAGONISTA, MAE, VO, AMIGO, IRMA, MEDICA, PADEIRO];

// ---- coadjuvantes de um vídeo (atuam, então não são figurantes)
export const ATENDENTE: Ator = {
  nome: "atendente", desc: "caixa da loja de tênis",
  hair: "curto", hairColor: "#2B1D16", beard: "#2B1D16", expr: "neutro",
  outfit: { camiseta: "#3E8E7E", calca: ESCURA, tenis: "#FFFFFF", sola: SOLA },
};
export const MOTORISTA: Ator = {
  nome: "motorista", desc: "boné e terno escuros",
  hair: "bone", hairColor: "#2A2A35", mustache: "#3A2A20", expr: "neutro",
  outfit: { camiseta: "#2B3447", calca: "#2B3447", tenis: "#2A2A35", sola: "#141414" },
};

// ------------------------------------------------------------------ figurantes
/** gerador pseudoaleatório com semente fixa (mulberry32): a mesma semente sempre dá o mesmo figurante */
const sorteio = (semente: number) => {
  let a = (semente * 2654435761) >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};
const um = <T,>(r: () => number, xs: T[]): T => xs[Math.floor(r() * xs.length) % xs.length];

const CABELOS_FIG: Cabelo[] = ["curto", "curto", "cacheado", "longo", "careca", "bone", "rabo", "laterais", "coque"];
const CORES_CABELO = ["#1E1A18", "#1E1A18", "#4A2E1E", "#6B4226", "#B5562E", "#D9B45A"];
const CORES_BONE = ["#C9452F", "#2F6E9E", "#3C3C44", "#E3A23B"];
const CAMISETAS = ["#E0822E", "#7AA35B", "#3A3F4B", "#B3403B", "#F2CF63", "#5AA5B8", "#9B8A72", "#E37BA1", "#6E8FC9", "#8E7CC3", "#4F8A6B"];
const CALCAS = [JEANS, ESCURA, "#4A4A4E", "#5A4636", "#F4F1EA", "#7A6A52"];
const SAIAS = ["#7A6A52", "#3F6299", "#5A5A66", ESCURA];

/** figurante: cabelo, cor de cabelo e roupa sorteados; sempre scale 0.74 e expressão neutra (só pisca e respira) */
export const figurante = (semente: number): Ator => {
  const r = sorteio(semente);
  const hair = um(r, CABELOS_FIG);
  const hairColor = hair === "laterais" ? "#A9A49C" : hair === "bone" ? um(r, CORES_BONE) : um(r, CORES_CABELO);
  const careca = hair === "careca" || hair === "laterais";
  const beard = (hair === "careca" || hair === "curto") && r() < 0.4 ? um(r, ["#1E1A18", "#4A2E1E", "#6B4226"]) : undefined;
  const mustache = !beard && careca && r() < 0.3 ? "#A9A49C" : undefined;
  const comprido = hair === "longo" || hair === "rabo" || hair === "coque";
  const skirt = comprido && r() < 0.6 ? um(r, SAIAS) : undefined;
  const outfit: Partial<Roupa> = { camiseta: um(r, CAMISETAS), calca: um(r, CALCAS), tenis: "#FFFFFF", sola: SOLA };
  return {
    nome: `figurante ${semente}`, desc: hair,
    hair, hairColor, beard, mustache, skirt, outfit,
    glasses: r() < 0.22,
    wide: 1 + Math.round(r() * 15) / 100,
    scale: 0.74, expr: "neutro", semente,
  };
};
export const PRESIDENTE_BC: Ator = {
  nome: "presidente do Banco Central", desc: "grisalho, óculos, terno",
  hair: "curto", hairColor: "#A9A49C", glasses: true, expr: "neutro",
  outfit: { camiseta: "#2B3447", calca: "#2B3447", tenis: "#2A2A35", sola: "#141414" }, wide: 1.08,
};
export const ESTRANHO: Ator = {
  nome: "estranho", desc: "moletom cinza, óculos escuros",
  hair: "curto", hairColor: "#1E1A18", glasses: "escuro", hood: "#8A8F98", expr: "neutro",
  outfit: { camiseta: "#8A8F98", calca: ESCURA, tenis: "#2A2A35", sola: "#141414" },
};
