// Identidade visual do canal: vale para todos os vídeos.
export const W = 1080;
export const H = 1920;
export const FPS = 30;

export const COR = {
  fundo: "#0b0b0c",
  traco: "#f2efe8",
  tracoApagado: "#8a867d",
  vermelho: "#E5383B",
  papelVelho: "#cdbf98",
  tinta: "#2b241a",
};

export const FONTE = "Montserrat";

// Área segura do TikTok: UI ocupa o rodapé e a lateral direita.
export const SEGURO = { topo: 100, esquerda: 80, direita: 150, baixo: 250 };

// Regra dos terços adaptada: cabeça/olhos do sujeito em 38% ou 62% da largura.
export const X38 = Math.round(W * 0.38);
export const X62 = Math.round(W * 0.62);
