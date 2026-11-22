import React from "react";
import { Composition, Still } from "remotion";
import { FPS, H, W } from "./estilo";
import { Folha } from "./fase1/Folha";
import { DURACAO_TESTE_ROSTO, TesteRosto } from "./fase1/TesteRosto";
import { DURACAO_TESTE_MANUSEIO, TesteManuseio } from "./fase2/TesteManuseio";
import { Folha2 } from "./fase2/Folha";

export const RemotionRoot: React.FC = () => (
  <>
    <Still id="Fase1Folha" component={Folha} width={W} height={H} />
    <Composition id="Fase1Rosto" component={TesteRosto} durationInFrames={DURACAO_TESTE_ROSTO} fps={FPS} width={W} height={H} />
    <Still id="Fase2Folha" component={Folha2} width={W} height={H} />
    <Composition id="Fase2Manuseio" component={TesteManuseio} durationInFrames={DURACAO_TESTE_MANUSEIO} fps={FPS} width={W} height={H} />
  </>
);
