import React from "react";
import { Composition, Still } from "remotion";
import { FPS, H, W } from "./estilo";
import { Folha } from "./fase1/Folha";
import { DURACAO_TESTE_ROSTO, TesteRosto } from "./fase1/TesteRosto";
import { DURACAO_TESTE_MANUSEIO, TesteManuseio } from "./fase2/TesteManuseio";
import { Folha2 } from "./fase2/Folha";
import { DURACAO_ELENCO, FolhaElenco } from "./fase3/Folha";
import { CENARIOS_FASE4, Fase4Quadro } from "./fase4/Cenarios";

export const RemotionRoot: React.FC = () => (
  <>
    <Still id="Fase1Folha" component={Folha} width={W} height={H} />
    <Composition id="Fase1Rosto" component={TesteRosto} durationInFrames={DURACAO_TESTE_ROSTO} fps={FPS} width={W} height={H} />
    <Still id="Fase2Folha" component={Folha2} width={W} height={H} />
    <Still id="Fase3Elenco" component={FolhaElenco} width={W} height={H} />
    <Composition id="Fase3ElencoVivo" component={FolhaElenco} durationInFrames={DURACAO_ELENCO} fps={FPS} width={W} height={H} />
    {Object.keys(CENARIOS_FASE4).map((c) => (
      <React.Fragment key={c}>
        <Composition id={`Fase4-${c}`} component={Fase4Quadro} defaultProps={{ cenario: c, ancoras: false }} durationInFrames={90} fps={FPS} width={W} height={H} />
        <Composition id={`Fase4A-${c}`} component={Fase4Quadro} defaultProps={{ cenario: c, ancoras: true }} durationInFrames={90} fps={FPS} width={W} height={H} />
      </React.Fragment>
    ))}
    <Composition id="Fase2Manuseio" component={TesteManuseio} durationInFrames={DURACAO_TESTE_MANUSEIO} fps={FPS} width={W} height={H} />
  </>
);
