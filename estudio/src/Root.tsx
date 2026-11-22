import React from "react";
import { Composition, Still } from "remotion";
import { FPS, H, W } from "./estilo";
import { Folha } from "./fase1/Folha";
import { DURACAO_TESTE_ROSTO, TesteRosto } from "./fase1/TesteRosto";

export const RemotionRoot: React.FC = () => (
  <>
    <Still id="Fase1Folha" component={Folha} width={W} height={H} />
    <Composition id="Fase1Rosto" component={TesteRosto} durationInFrames={DURACAO_TESTE_ROSTO} fps={FPS} width={W} height={H} />
  </>
);
