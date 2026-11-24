// Efeitos sonoros do vídeo dos códigos de GTA (sintetizados por scripts/sfx_gta.py, em public/sfx), seguindo a tabela
// de efeitos do roteiro. Sem trilha: onde o roteiro mexe na trilha, fica o efeito equivalente (o ambiente submerso no
// "não consegue respirar"). Cada som é preso à sua fala, então acompanha a narração quando os tempos mudarem.
import React from "react";
import { Audio, Sequence, staticFile } from "remotion";
import { BRANCO, TOQUES } from "./parte1";
import { DURACAO as FIM, FALAS, T, fracDe } from "./tempo";

type Som = "tecla" | "whoosh" | "submerso" | "baque" | "hud" | "cursor";
type Deixa = { de: number; som: Som; ate?: number; vol: number };
const DURACAO: Record<Som, number> = { tecla: 3, whoosh: 13, submerso: 120, baque: 17, hud: 30, cursor: 2 };
const EM_LOOP: Som[] = ["submerso", "hud"];

/** quadros em que a tela fica em silêncio total (sem legenda): o branco depois do "o bairro inteiro deixa de existir" */
export const SILENCIO = (f: number) => f >= BRANCO.de && f < BRANCO.ate;

const inicioCursor = T(98, fracDe(98, "qual código"));
const cursores: Deixa[] = [];
for (let f = Math.ceil(inicioCursor / 30) * 30; f < FIM - 2; f += 30) cursores.push({ de: f, som: "cursor", vol: 0.4 });

export const DEIXAS: Deixa[] = [
  // "Téo digita quatro letras": quatro toques secos, antes da fala continuar
  ...TOQUES.map((f) => ({ de: f, som: "tecla" as const, vol: 0.6 })),
  // "Um carro aparece na frente dele": whoosh curto de materialização (o pico cai quando o carro aparece)
  { de: T(1, fracDe(1, "aparece")) - 4, som: "whoosh", vol: 0.5 },
  // "Ele só não consegue respirar": sem trilha para abafar, o som de estar submerso até o Téo apagar
  { de: T(49) - 4, ate: FALAS[50].fim + 6, som: "submerso", vol: 0.35 },
  // "Dessa vez desmaiado": baque surdo quando ele bate no chão de novo
  { de: T(66, fracDe(66, "cai de novo")) + 11, som: "baque", vol: 0.8 },
  // o HUD (radar) tocando no beco até "O círculo não pisca", quando some
  { de: Math.round((FALAS[84].fim + FALAS[85].ini) / 2), ate: T(86), som: "hud", vol: 0.35 },
  // "qual código você digitaria?": o cursor piscando até o fim da cartela final
  ...cursores,
];

export const Efeitos: React.FC = () => (
  <>
    {DEIXAS.map((d, i) => (
      <Sequence key={i} from={d.de} durationInFrames={Math.max(1, (d.ate ?? d.de + DURACAO[d.som]) - d.de)} layout="none">
        <Audio src={staticFile(`sfx/${d.som}.wav`)} volume={d.vol} loop={EM_LOOP.includes(d.som)} />
      </Sequence>
    ))}
  </>
);
