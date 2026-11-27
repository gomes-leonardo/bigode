import React from "react";
import { Composition, Still } from "remotion";
import { FPS, H, W } from "./estilo";
import { Folha } from "./fase1/Folha";
import { DURACAO_TESTE_ROSTO, TesteRosto } from "./fase1/TesteRosto";
import { DURACAO_TESTE_MANUSEIO, TesteManuseio } from "./fase2/TesteManuseio";
import { Folha2 } from "./fase2/Folha";
import { DURACAO_ELENCO, FolhaElenco } from "./fase3/Folha";
import { CENARIOS_FASE4, Fase4Quadro } from "./fase4/Cenarios";
import { DURACAO_TESTE_CAMERA, TesteCamera } from "./fase5/TesteCamera";
import { FIM as FIM_CARTAO, VideoCartao } from "./video/cartao/Video";
import { FIM as FIM_GTA, VideoGta } from "./video/gta/Video";
import { ThumbGta } from "./video/gta/Thumb";
import { FIM as FIM_DEDO, VideoDedo } from "./video/dedo/Video";
import { FolhaRelogios } from "./video/relogio/Folha";
import { FIM as FIM_RELOGIO, VideoRelogio } from "./video/relogio/Video";

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
    <Still id="ThumbGTA-A" component={ThumbGta} defaultProps={{ variante: "A" as const }} width={W} height={H} />
    <Still id="ThumbGTA-B" component={ThumbGta} defaultProps={{ variante: "B" as const }} width={W} height={H} />
    <Composition id="Relogio1010" component={VideoRelogio} durationInFrames={FIM_RELOGIO} fps={30} width={1080} height={1920} />
    <Still id="RelogioFolha" component={FolhaRelogios} width={1080} height={1920} />
    <Composition id="DedoEstala" component={VideoDedo} durationInFrames={FIM_DEDO} fps={24} width={1080} height={1920} />
    <Composition id="CodigosGTA" component={VideoGta} defaultProps={{ legenda: true }} durationInFrames={FIM_GTA + 24} fps={FPS} width={W} height={H} />
    <Composition id="CartaoInfinito" component={VideoCartao} defaultProps={{ legenda: true }} durationInFrames={FIM_CARTAO + 24} fps={FPS} width={W} height={H} />
    <Composition id="Fase5Camera" component={TesteCamera} defaultProps={{ hud: true }} durationInFrames={DURACAO_TESTE_CAMERA} fps={FPS} width={W} height={H} />
    <Composition id="Fase5CameraLimpo" component={TesteCamera} defaultProps={{ hud: false }} durationInFrames={DURACAO_TESTE_CAMERA} fps={FPS} width={W} height={H} />
    <Composition id="Fase2Manuseio" component={TesteManuseio} durationInFrames={DURACAO_TESTE_MANUSEIO} fps={FPS} width={W} height={H} />
  </>
);
