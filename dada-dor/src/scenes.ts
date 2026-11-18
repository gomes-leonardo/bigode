// As 24 cenas do roteiro (spec.pdf), tipadas com Scene/Layer do spec.
// start/duration: tempos REAIS medidos na narração (Fase 1, narracao/cenas_medidas.json), não os previstos.
//
// Extensões opcionais (o spec não define movimento dentro da cena; ficam todas opcionais):
//   at / until   segundos, relativos ao início da cena, em que a camada entra / sai (sai mais rápido que entra)
//   toX / toY / toScale   para onde a camada vai, ao longo da sua vida (movimento contínuo)
//   arcsTo / arcsAt       troca de emoção dos arcos no meio da cena (interpolada em 10 quadros)
//   rotacao, espelhar, apagando, inicio (quadro do pulso)
import tempos from "./tempos.json";
import type { ArcMood } from "./components/Arcs";
import type { AssetPersonagem, Pose } from "./components/Character";
import type { AssetProp } from "./components/Prop";
import type { NomeBackdrop } from "./components/Backdrop";
import type { Accent } from "./theme";

type Vida = { at?: number; until?: number; toX?: number; toY?: number; toScale?: number };

export type Layer =
  | ({ kind: "character"; asset: AssetPersonagem; pose: Pose; x: number; y: number; scale: number; arcs: ArcMood; arcsTo?: ArcMood; arcsAt?: number; espelhar?: boolean } & Vida)
  | ({ kind: "prop"; asset: AssetProp; x: number; y: number; scale: number; animate?: "float" | "spin" | "shake"; rotacao?: number } & Vida)
  | ({ kind: "iconField"; rows: number; cols: number; highlightIndex: number; apagando?: boolean } & Vida)
  | ({ kind: "signalPulse"; path: string; durationFrames: number; inicio?: number } & Vida)
  | ({ kind: "reticle"; targetX: number; targetY: number } & Vida)
  | ({ kind: "titleCard"; text: string } & Vida);

export type Scene = {
  id: number;
  start: number; // segundos
  duration: number; // segundos
  backdrop: NomeBackdrop | null;
  layers: Layer[];
  caption: string;
  accent: Accent;
  camera: "pushIn" | "static" | "drift";
};

const T = (id: number) => tempos.find((t) => t.id === id)!;
const cena = (id: number, s: Omit<Scene, "id" | "start" | "duration">): Scene => ({ id, start: T(id).start, duration: T(id).duration, ...s });

const CHAO = 800; // acima da faixa da legenda (que ocupa ~y 850-990)

export const scenes: Scene[] = [
  cena(1, {
    backdrop: "rua",
    camera: "pushIn",
    accent: "coral",
    caption: "Dadá tem seis anos e acabou de ralar o joelho inteiro no asfalto. Ela levanta, olha o machucado, e volta a pedalar.",
    layers: [
      // derrapa e cai
      { kind: "prop", asset: "bicicleta", x: 420, y: 700, scale: 1.3, until: 1.6, toX: 820 },
      { kind: "character", asset: "dada", pose: "riding", x: 400, y: 690, scale: 1.0, arcs: "neutral", until: 1.6, toX: 800 },
      { kind: "prop", asset: "poeira", x: 900, y: 780, scale: 1.1, at: 1.5, until: 4.5 },
      { kind: "prop", asset: "bicicleta", x: 1180, y: 780, scale: 1.3, rotacao: -22, at: 1.6, until: 6.2 },
      { kind: "character", asset: "dada", pose: "fallen", x: 860, y: CHAO, scale: 1.0, arcs: "neutral", at: 1.6, until: 3.6 },
      // levanta, olha o machucado (sem dor: arcos neutros)
      { kind: "character", asset: "dada", pose: "neutral", x: 860, y: CHAO, scale: 1.1, arcs: "neutral", arcsTo: "curious", arcsAt: 4.6, at: 3.6, until: 6.2 },
      // volta a pedalar
      { kind: "prop", asset: "bicicleta", x: 880, y: 700, scale: 1.3, at: 6.2, toX: 1700 },
      { kind: "character", asset: "dada", pose: "riding", x: 860, y: 690, scale: 1.0, arcs: "neutral", at: 6.2, toX: 1680 },
    ],
  }),
  cena(2, {
    backdrop: "rua",
    camera: "pushIn",
    accent: "coral",
    caption: "Isso não é coragem. Não é aquela criança durona que todo mundo conhece. Dadá simplesmente não sentiu nada.",
    layers: [
      { kind: "prop", asset: "joelho-ralado", x: 700, y: 560, scale: 1.05 },
      { kind: "character", asset: "dada", pose: "neutral", x: 1400, y: 1280, scale: 1.7, arcs: "neutral" },
    ],
  }),
  cena(3, {
    backdrop: null,
    camera: "pushIn",
    accent: "mint",
    caption: "E se você nunca, em nenhum momento da sua vida, sentisse dor? Parece o melhor superpoder da lista. É um dos diagnósticos mais perigosos que existem.",
    layers: [{ kind: "titleCard", text: "E se você parasse de sentir dor?" }],
  }),
  cena(4, {
    backdrop: "quarto-bebe",
    camera: "pushIn",
    accent: "pink",
    caption: "Os primeiros sinais costumam aparecer muito cedo. O bebê não chora quando toma a vacina. Não reage ao tombo. Não reclama do que deveria doer.",
    layers: [
      { kind: "character", asset: "dada", pose: "sitting", x: 930, y: 720, scale: 0.8, arcs: "neutral" },
      { kind: "prop", asset: "berco", x: 960, y: 590, scale: 1.45 },
      { kind: "prop", asset: "seringa", x: 1560, y: 420, scale: 0.55, rotacao: 200, at: 2.5, toX: 1220, toY: 470 },
    ],
  }),
  cena(5, {
    backdrop: "cozinha",
    camera: "drift",
    accent: "coral",
    caption: "Aos dois anos, Dadá mordeu a própria língua até sangrar enquanto comia. E continuou comendo.",
    layers: [
      { kind: "character", asset: "dada", pose: "sitting", x: 820, y: 790, scale: 1.25, arcs: "calm" },
      { kind: "prop", asset: "prato", x: 1280, y: 760, scale: 0.85 },
      { kind: "prop", asset: "gota", x: 900, y: 450, scale: 0.16, at: 2.2, toY: 520 },
    ],
  }),
  cena(6, {
    backdrop: "consultorio",
    camera: "pushIn",
    accent: "yellow",
    caption: "Feridas na boca e nos dedos por mordida, e queimaduras repetidas, são justamente o que costuma levar a família ao médico.",
    layers: [
      { kind: "character", asset: "mae", pose: "holding", x: 720, y: CHAO, scale: 1.25, arcs: "worried" },
      { kind: "character", asset: "dada", pose: "holding", x: 1180, y: CHAO, scale: 1.0, arcs: "neutral", espelhar: true, at: 0.4 },
      { kind: "prop", asset: "gota", x: 1040, y: 640, scale: 0.1, at: 1.2 },
      { kind: "prop", asset: "gota", x: 1075, y: 668, scale: 0.08, at: 1.6 },
    ],
  }),
  cena(7, {
    backdrop: "consultorio",
    camera: "static",
    accent: "mint",
    caption: "O nome disso é insensibilidade congênita à dor.",
    layers: [{ kind: "character", asset: "medica", pose: "clipboard", x: 1120, y: CHAO + 20, scale: 1.4, arcs: "calm" }],
  }),
  cena(8, {
    backdrop: null,
    camera: "pushIn",
    accent: "mint",
    caption: "Para entender o que falta nela, é mais fácil entender o que acontece em você.",
    layers: [{ kind: "prop", asset: "rede-nervosa", x: 960, y: 440, scale: 0.85 }],
  }),
  cena(9, {
    backdrop: "cozinha",
    camera: "pushIn",
    accent: "coral",
    caption: "Quando você encosta numa panela quente, o calor não dói na mão. A mão não sente nada por conta própria. Ela só dispara um aviso, e quem transforma esse aviso em sofrimento é o cérebro, lá em cima.",
    layers: [
      { kind: "prop", asset: "panela", x: 1080, y: 690, scale: 1.0 },
      { kind: "character", asset: "dada", pose: "holding", x: 840, y: CHAO, scale: 1.25, arcs: "neutral", arcsTo: "curious", arcsAt: 9.0 },
      // da mão (encostando na panela) pelo braço até a cabeça
      { kind: "signalPulse", path: "M 985 630 Q 940 590 890 592 Q 850 560 840 470", durationFrames: 70, inicio: 140 },
    ],
  }),
  cena(10, {
    backdrop: null,
    camera: "pushIn",
    accent: "yellow",
    caption: "Esse aviso viaja por neurônios especializados. E para ele sair do lugar, comportas microscópicas precisam se abrir na parede da célula, deixando sair uma corrente de sódio. São essas comportas que ligam o alarme.",
    layers: [{ kind: "prop", asset: "neuronio", x: 960, y: 480, scale: 1.0, toScale: 1.25 }],
  }),
  cena(11, {
    backdrop: null,
    camera: "pushIn",
    accent: "mint",
    caption: "Uma delas se chama Nav1.7, e funciona como amplificador. Sem ela, o sinal até nasce, mas morre no caminho e nunca chega ao cérebro.",
    layers: [
      { kind: "prop", asset: "comporta-apagado", x: 400, y: 470, scale: 0.7 },
      { kind: "prop", asset: "comporta-apagado", x: 680, y: 470, scale: 0.7 },
      { kind: "prop", asset: "comporta-aceso", x: 960, y: 470, scale: 0.85, at: 0.5, animate: "float" },
      { kind: "prop", asset: "comporta-apagado", x: 1240, y: 470, scale: 0.7 },
      { kind: "prop", asset: "comporta-apagado", x: 1520, y: 470, scale: 0.7 },
    ],
  }),
  cena(12, {
    backdrop: null,
    camera: "drift",
    accent: "coral",
    caption: "Em boa parte dos casos, a origem é uma alteração no gene SCN9A, que é a receita dessa comporta. Quando as duas cópias do gene vêm com o mesmo defeito, a peça não é construída. O alarme existe, mas está mudo.",
    layers: [{ kind: "prop", asset: "dna", x: 960, y: 500, scale: 0.85, animate: "float" }],
  }),
  cena(13, {
    backdrop: null,
    camera: "pushIn",
    accent: "mint",
    caption: "É raro. E vem com um detalhe estranho: boa parte das pessoas com a condição também não tem olfato nenhum, porque a mesma peça faz falta no nariz.",
    layers: [{ kind: "iconField", rows: 5, cols: 16, highlightIndex: 41 }],
  }),
  cena(14, {
    backdrop: "cozinha",
    camera: "pushIn",
    accent: "coral",
    caption: "Repare que não é anestesia. Dadá sente textura, sente pressão, sabe diferenciar quente de frio. O corpo dela responde a quase tudo.",
    layers: [
      { kind: "character", asset: "dada-adulta", pose: "holding", x: 820, y: CHAO, scale: 1.15, arcs: "calm" },
      { kind: "prop", asset: "xicara", x: 975, y: 600, scale: 0.34, at: 0.3 },
    ],
  }),
  cena(15, {
    backdrop: "cozinha",
    camera: "static",
    accent: "coral",
    caption: "O que ela não sente é que aquele café está queimando a língua dela agora.",
    layers: [
      { kind: "prop", asset: "xicara", x: 640, y: 520, scale: 1.0 },
      { kind: "character", asset: "dada-adulta", pose: "neutral", x: 1580, y: 1180, scale: 1.45, arcs: "neutral" },
    ],
  }),
  cena(16, {
    backdrop: null,
    camera: "pushIn",
    accent: "coral",
    caption: "E é aí que a conta chega. Fraturas passam semanas sem ser percebidas, porque nada avisa que algo quebrou.",
    layers: [{ kind: "prop", asset: "raio-x-pe", x: 960, y: 440, scale: 1.25 }],
  }),
  cena(17, {
    backdrop: null,
    camera: "static",
    accent: "coral",
    caption: "Um osso quebrado que continua sendo usado todos os dias não cola direito. Às vezes não cola nunca, e vira uma deformidade permanente.",
    layers: [{ kind: "prop", asset: "raio-x-pe-torto", x: 960, y: 440, scale: 1.25 }],
  }),
  cena(18, {
    backdrop: null,
    camera: "pushIn",
    accent: "coral",
    caption: "Até piscar vira problema. O que te faz piscar e lacrimejar o dia inteiro é um incomodozinho constante que você nem registra. Sem ele, a córnea seca e se machuca sozinha, aos poucos.",
    layers: [{ kind: "prop", asset: "olho", x: 960, y: 430, scale: 1.5 }],
  }),
  cena(19, {
    backdrop: null,
    camera: "drift",
    accent: "pink",
    caption: "Somando tudo, a expectativa de vida é menor. Não pela condição em si, que não ataca nenhum órgão. Pelo acúmulo de estragos que ninguém avisou a tempo.",
    layers: [{ kind: "iconField", rows: 1, cols: 9, highlightIndex: 4, apagando: true }],
  }),
  cena(20, {
    backdrop: null,
    camera: "pushIn",
    accent: "mint",
    caption: "E mesmo assim não é sentença. Há o registro de um islandês de 73 anos, diagnosticado ainda criança junto com os dois irmãos, acompanhado a vida inteira. Dá para chegar lá. O preço é vigilância constante, porque o corpo nunca vai pedir socorro sozinho.",
    layers: [
      { kind: "character", asset: "figurante", pose: "neutral", x: 600, y: CHAO - 40, scale: 1.05, arcs: "none", at: 0.6 },
      { kind: "character", asset: "figurante", pose: "neutral", x: 1320, y: CHAO - 40, scale: 1.05, arcs: "none", at: 0.9 },
      { kind: "character", asset: "figurante", pose: "neutral", x: 1560, y: CHAO - 60, scale: 0.95, arcs: "none", at: 1.2 },
      { kind: "character", asset: "senhor", pose: "neutral", x: 960, y: CHAO, scale: 1.3, arcs: "calm" },
    ],
  }),
  cena(21, {
    backdrop: "laboratorio",
    camera: "drift",
    accent: "mint",
    caption: "Agora a parte que vira o jogo.",
    layers: [
      { kind: "character", asset: "medica", pose: "clipboard", x: 520, y: CHAO, scale: 1.05, arcs: "none" },
      { kind: "character", asset: "medica", pose: "neutral", x: 960, y: CHAO, scale: 1.15, arcs: "curious", at: 0.2 },
      { kind: "character", asset: "medica", pose: "clipboard", x: 1400, y: CHAO, scale: 1.05, arcs: "none", at: 0.4 },
    ],
  }),
  cena(22, {
    backdrop: null,
    camera: "pushIn",
    accent: "coral",
    caption: "Pense no que esses casos provam. Existe uma peça única que, desligada, apaga a dor por completo. E as pessoas que nascem sem ela seguem com o resto do sistema nervoso inteiro, raciocinando, se movendo, sentindo todo o resto. Para a indústria farmacêutica, isso é a descrição de um alvo perfeito.",
    layers: [
      { kind: "prop", asset: "comporta-aceso", x: 960, y: 450, scale: 1.0, animate: "float" },
      { kind: "reticle", targetX: 960, targetY: 450, at: 1.0 },
    ],
  }),
  cena(23, {
    backdrop: null,
    camera: "pushIn",
    accent: "yellow",
    caption: "Em janeiro de 2025, os Estados Unidos aprovaram o suzetrigine, o primeiro analgésico não opioide da história para dor aguda intensa, e o primeiro remédio de dor realmente novo desde 1998. Ele não bloqueia o Nav1.7, bloqueia um primo próximo. Mas a pista que abriu essa linha inteira veio daqui, de quem nasceu sem sentir.",
    layers: [
      { kind: "prop", asset: "data-2025", x: 960, y: 420, scale: 1.0, at: 0.8 },
      { kind: "prop", asset: "comprimido", x: 960, y: 470, scale: 0.75, animate: "spin" },
    ],
  }),
  cena(24, {
    backdrop: "entardecer",
    camera: "drift",
    accent: "coral",
    caption: "A dor é insuportável e é por isso que todo mundo quer se livrar dela. A dor também é o único aviso que mantém você inteiro. O caminho para desligar a primeira sem perder o segundo começou com quem nunca teve a opção de escolher.",
    layers: [{ kind: "character", asset: "dada-adulta", pose: "bikeBack", x: 960, y: 820, scale: 1.2, arcs: "none", toY: 700, toScale: 0.6 }],
  }),
];

export const DURACAO_TOTAL_S = scenes[scenes.length - 1].start + scenes[scenes.length - 1].duration;
