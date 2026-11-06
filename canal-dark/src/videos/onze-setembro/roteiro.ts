// Roteiro do vídeo "11 de setembro". O texto que vale para a legenda é o que o narrador falou
// (public/timestamps.json, via faster-whisper); este arquivo guarda o roteiro e as decisões de cena.
// punch: palavras onde acontece o zoom-punch (+ hit grave no áudio).
export type CenaRoteiro = {
  bloco: string;
  nome: string;
  plano: "aberto" | "médio" | "close";
  punch: string[];
  visual: string;
  texto: string;
};

export const ROTEIRO: CenaRoteiro[] = [
  {
    bloco: "bloco_01",
    nome: "Gancho",
    plano: "aberto",
    punch: ["nenhum"],
    visual: "prédio no escuro, sem avião, começando a rachar",
    texto:
      "Onze de setembro. Um terceiro prédio caiu em Nova York... e nenhum avião bateu nele.",
  },
  {
    bloco: "bloco_02",
    nome: "Milhões acreditam",
    plano: "médio",
    punch: [],
    visual: "fileira de bonecos olhando para cima, um depois do outro",
    texto:
      "Vinte e cinco anos depois, milhões de pessoas ainda acreditam que aquele dia não foi o que contaram pra gente.",
  },
  {
    bloco: "bloco_03",
    nome: "Torres",
    plano: "aberto",
    punch: [],
    visual: "zoom lento nas torres, jatos de poeira abaixo do topo",
    texto:
      "A primeira teoria: as Torres Gêmeas não caíram por causa dos aviões. Teriam sido demolidas. A prova, segundo quem acredita? Jatos de poeira saindo de andares bem abaixo do impacto.",
  },
  {
    bloco: "bloco_04",
    nome: "Prédio 7",
    plano: "close",
    punch: [],
    visual: "relógio 17h20, prédio desabando reto, contra-plongée",
    texto:
      "Depois vem o prédio sete. Quarenta e sete andares. Nenhum avião. Ele desabou às cinco e vinte da tarde... e muita gente jura que aquilo foi uma demolição controlada.",
  },
  {
    bloco: "bloco_05",
    nome: "Pentágono",
    plano: "aberto",
    punch: [],
    visual: "Pentágono visto de cima, rastro cruzando o céu",
    texto:
      "No Pentágono, a teoria é ainda mais ousada: não foi um avião. Foi um míssil.",
  },
  {
    bloco: "bloco_06",
    nome: "Bolsa",
    plano: "médio",
    punch: ["coincidência"],
    visual: "gráfico vermelho despencando, boneco de terno na sombra",
    texto:
      "E tem o dinheiro. Dias antes do ataque, alguém apostou alto na queda das ações das companhias aéreas. Coincidência?",
  },
  {
    bloco: "bloco_07",
    nome: "Trabalho interno",
    plano: "close",
    punch: ["inside"],
    visual: "porta CLASSIFIED, boneco de óculos escuros vira a cabeça",
    texto:
      "Tudo isso leva à teoria mais famosa: inside job. Trabalho interno. O governo americano sabia... ou pior, participou.",
  },
  {
    bloco: "bloco_08",
    nome: "O outro lado",
    plano: "médio",
    punch: [],
    visual: "pilha de relatórios, carimbo INVESTIGADO, luz mais fria",
    texto:
      "As investigações dizem outra coisa: o fogo enfraqueceu o aço, o ar comprimido explica a poeira, e as apostas vieram de um investidor sem ligação com a Al-Qaeda. Mas elas também admitiram falhas graves de inteligência antes do ataque.",
  },
  {
    bloco: "bloco_09",
    nome: "Próximo vídeo",
    plano: "close",
    punch: ["próximo"],
    visual: "documento antigo saindo da pasta, ruído crescendo até o corte",
    texto:
      "E existe um documento real, assinado por militares americanos, que propunha atacar o próprio país para começar uma guerra. Ele existe. E é o próximo vídeo. E você... acredita na versão oficial?",
  },
];
