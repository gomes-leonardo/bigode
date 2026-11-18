// Paleta e tokens de animação do spec (seção "O estilo visual decodificado" e "Tokens de animação").
export const W = 1920;
export const H = 1080;
export const FPS = 30;

export const COR = {
  fundo: "#1A1333",
  fundo2: "#241A4A",
  menta: "#3FE0B0",
  coral: "#FF6B5E",
  rosa: "#F2719C",
  amarelo: "#FFC94A",
  texto: "#FFFFFF",
  // derivadas (não são cor de destaque): corpo dos personagens e linhas apagadas
  indigo: "#170C2F",
  apagado: "#5B5480",
};

export type Accent = "mint" | "coral" | "pink" | "yellow";
export const ACCENT: Record<Accent, string> = { mint: COR.menta, coral: COR.coral, pink: COR.rosa, yellow: COR.amarelo };

export const FONTE = "Montserrat";

export const spring = { damping: 12, mass: 0.6, stiffness: 120 };
export const enter = { from: 0.9, to: 1, frames: 12 }; // com overshoot
export const exit = { frames: 6 }; // sai mais rápido
export const pushIn = { scaleFrom: 1.0, scaleTo: 1.06 }; // ao longo da cena
