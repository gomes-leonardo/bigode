// Capítulo 8: O último balão.
import React from "react";
import { Titulo } from "../teo/cap1";
import { Q, QuartoFrente, QuartoFundo } from "../teo/Quarto";
import { Ator, Camera, E, Noite, usePlano } from "../teo/kit";
import { parado, sentado, type Fn } from "../teo/motor";
import { Boneco, type PoseTeo } from "../teo/tira";
import { Baloes, NoChao, type Caido } from "./balao";
import { Sala, SALA } from "./cenarios";
import { daBoca, porRotulo } from "./comum";

// ---------------------------------------------------------------- 8: o último balão
const C8Dudu: React.FC = () => {
  const { t, dur, fala } = usePlano();
  const dudu: Fn = (tt) => ({ ...parado(1500, SALA.chao, E("dudu"), true)(tt), expr: "triste", head: { rot: 8, offsetY: 0 } });
  const teo = { ...parado(1180, SALA.chao, 1)(t), expr: t > 3.5 ? "sorriso" as const : "serio" as const };
  return (
    <Camera chaves={[{ t: 0, z: 1.5, cx: 1340, cy: 520 }, { t: dur, z: 1.6, cx: 1340, cy: 500 }]}>
      <Sala porta={1} noite />
      <rect x={SALA.porta - 240} y={SALA.chao - 600} width={220} height={600} fill="#1E2A5A" />
      <Ator quem="teo" pose={teo} />
      <Ator quem="dudu" pose={dudu(t)} fala={fala("dudu")} />
      <Baloes emissor={porRotulo({ dudu: daBoca("dudu", dudu, -1, SALA.chao) })} />
    </Camera>
  );
};
// tudo o que caiu no chão do quarto ao longo do dia
const ACUMULADO: Caido[] = Array.from({ length: 16 }, (_, i) => ({ x: 360 + ((i * 263) % 1300), chao: Q.chao, esc: 0.7 + ((i * 7) % 5) * 0.08, rot: ((i * 37) % 24) - 12 }));
const teoCama: Fn = (t) => ({ ...sentado(860, Q.colchao, 1)(t), expr: "triste", head: { rot: 14, offsetY: 0 } });
const C8Quarto: React.FC = () => {
  const { t, dur, fala, F } = usePlano();
  const caiu = F(2).ini;
  const teo = { ...teoCama(t), expr: (t > caiu + 1.4 ? "curioso" : t > F(1).ini ? "serio" : "triste") as PoseTeo["expr"], head: { rot: t > caiu ? 22 : 14, offsetY: 0 } };
  return (
    <Camera fundo="#1E2A5A" chaves={[{ t: 0, z: 1.0, cx: 960, cy: 600 }, { t: F(1).ini, z: 1.2, cx: 980, cy: 640 }, { t: dur + 1.0, z: 1.9, cx: 1020, cy: 760 }]}>
      <QuartoFundo pecas={[]} noite />
      <Ator quem="teo" pose={teo} fala={fala("teo")} />
      <QuartoFrente />
      <NoChao itens={ACUMULADO} />
      <Baloes emissor={porRotulo({ teo: daBoca("teo", teoCama, 1, Q.chao, { xChao: 1060 }) })} />
      <Noite forca={0.8} />
    </Camera>
  );
};
const C8Final: React.FC = () => {
  const { t, F } = usePlano();
  const teo = { ...parado(960, 1070, 0.75)(t), expr: "sorriso" as const };
  const fase2 = t > F(1).ini;
  const insc = t > F(1).ini + F(1).dur * 0.55;
  return (
    <Camera chaves={[{ t: 0, z: 1, cx: 960, cy: 540 }]} fundo={fase2 ? "#3FAF63" : "#6A5FD0"}>
      <rect x={-400} y={-400} width={2800} height={1900} fill={fase2 ? "#3FAF63" : "#6A5FD0"} />
      {!fase2 && <Titulo linhas={["VOCÊ IA QUERER VER", "TODA MENTIRA?"]} desde={0.1} y={360} tam={110} />}
      {fase2 && <g key="c"><Titulo linhas={insc ? ["SE INSCREVE!"] : ["CONTA NOS", "COMENTÁRIOS"]} desde={insc ? F(1).ini + F(1).dur * 0.55 : F(1).ini} y={360} tam={120} cor={insc ? "#FBFBF7" : "#FFD23F"} /></g>}
      <Boneco pose={teo} esc={0.75} />
      <NoChao itens={[{ x: 700, chao: 1070, esc: 0.8 }, { x: 1220, chao: 1070, esc: 0.7, rot: -8 }]} />
    </Camera>
  );
};

export const CAP8: Record<string, React.FC> = { c8_dudu: C8Dudu, c8_quarto: C8Quarto, c8_final: C8Final };
