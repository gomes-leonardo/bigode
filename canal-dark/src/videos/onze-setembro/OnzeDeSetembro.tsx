import { Audio } from "@remotion/media";
import React from "react";
import {
  AbsoluteFill,
  interpolate,
  Sequence,
  Series,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Legenda } from "../../components/Legenda";
import { Overlay } from "../../components/Overlay";
import { duracaoBloco, type Timestamps } from "../../lib/tempo";
import { COR } from "../../theme";
import timestamps from "../../../public/timestamps.json";
import { Cena01Gancho } from "./cenas/Cena01Gancho";
import { Cena02Milhoes } from "./cenas/Cena02Milhoes";
import { Cena03Torres } from "./cenas/Cena03Torres";
import { Cena04Predio7 } from "./cenas/Cena04Predio7";
import { Cena05Pentagono } from "./cenas/Cena05Pentagono";
import { Cena06Bolsa } from "./cenas/Cena06Bolsa";
import { Cena07Classified } from "./cenas/Cena07Classified";
import { Cena08Investigado } from "./cenas/Cena08Investigado";
import { Cena09Documento } from "./cenas/Cena09Documento";
import { punchesDoBloco } from "./cenas/comum";

const T = timestamps as Timestamps;
const B = T.blocos;
const CENAS = [
  Cena01Gancho,
  Cena02Milhoes,
  Cena03Torres,
  Cena04Predio7,
  Cena05Pentagono,
  Cena06Bolsa,
  Cena07Classified,
  Cena08Investigado,
  Cena09Documento,
];

// Início de cada cena em quadros (soma das durações, igual ao <Series>).
const INICIOS = B.reduce<number[]>(
  (acc, b, i) => [...acc, i === 0 ? 0 : acc[i - 1] + duracaoBloco(B[i - 1])],
  [],
);
export const DURACAO_TOTAL =
  INICIOS[B.length - 1] + duracaoBloco(B[B.length - 1]);
const CORTES = INICIOS.slice(1);
const HITS = B.flatMap((b, i) => punchesDoBloco(b).map((p) => INICIOS[i] + p));
const PALAVRAS = B.flatMap((b) => b.legenda);
// voz mono a -14 LUFS soa +3 LU em estéreo e soma com drone/efeitos: ganho geral evita clipar
const MIX = 0.7;

export const OnzeDeSetembro: React.FC = () => {
  const f = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const inicioFinal = INICIOS[8] + 200;
  const intensidade = interpolate(
    f,
    [inicioFinal, durationInFrames - 8],
    [1, 3],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  return (
    <AbsoluteFill style={{ background: COR.fundo }}>
      <Series>
        {B.map((b, i) => {
          const Cena = CENAS[i];
          return (
            <Series.Sequence
              key={b.id}
              name={`${i + 1}. ${b.id}`}
              durationInFrames={duracaoBloco(b)}
            >
              <Cena bloco={b} />
              <Audio src={staticFile(b.arquivo)} volume={MIX} />
            </Series.Sequence>
          );
        })}
      </Series>
      <Legenda palavras={PALAVRAS} />
      <Overlay intensidade={intensidade} estaticaEm={CORTES} />

      {/* som: drone contínuo, estática nos cortes, hit nos zoom-punches, estática crescente no fim */}
      <Audio src={staticFile("sfx/drone_grave.wav")} volume={0.9 * MIX} />
      {CORTES.map((c) => (
        <Sequence
          key={`est-${c}`}
          from={c - 2}
          durationInFrames={15}
          layout="none"
        >
          <Audio
            src={staticFile("sfx/estatica_transicao.wav")}
            volume={0.8 * MIX}
          />
        </Sequence>
      ))}
      {HITS.map((h) => (
        <Sequence key={`hit-${h}`} from={h} durationInFrames={45} layout="none">
          <Audio
            src={staticFile("sfx/hit_zoom_punch.wav")}
            volume={0.9 * MIX}
          />
        </Sequence>
      ))}
      <Sequence from={DURACAO_TOTAL - 75} durationInFrames={75} layout="none">
        <Audio src={staticFile("sfx/estatica_final.wav")} volume={0.7 * MIX} />
      </Sequence>
    </AbsoluteFill>
  );
};
