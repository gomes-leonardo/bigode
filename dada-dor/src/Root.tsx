import { Composition, Still } from "remotion";
import "./fontes";
import { Cena01 } from "./cena01/Cena01";
import { Cena05, DURACAO_CENA05 } from "./cena05/Cena05";
import { DURACAO_TOTAL_S } from "./scenes";
import { AcoesTeste } from "./rig/AcoesTeste";
import { PuppetTeste } from "./rig/PuppetTeste";
import { RigTest } from "./rig/RigTest";
import { DURACAO_V2, VideoV2 } from "./v2/VideoV2";
import { DURACAO_TEO_ESBOCO, TeoEsboco } from "./teo/TeoEsboco";
import { DURACAO_TEO, VideoTeo } from "./teo/VideoTeo";
import { TesteDada } from "./TesteDada";
import { FPS, H, W } from "./theme";
import { Video } from "./Video";

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="Video" component={Video} durationInFrames={Math.ceil(DURACAO_TOTAL_S * FPS)} fps={FPS} width={W} height={H} />
    <Composition id="Cena01" component={Cena01} durationInFrames={8 * FPS} fps={FPS} width={W} height={H} />
    <Composition id="Cena05" component={Cena05} durationInFrames={DURACAO_CENA05} fps={FPS} width={W} height={H} />
    <Composition id="AcoesTeste" component={AcoesTeste} durationInFrames={3 * FPS} fps={FPS} width={W} height={H} />
    <Composition id="VideoV2" component={VideoV2} durationInFrames={DURACAO_V2} fps={FPS} width={W} height={H} />
    <Composition id="VideoTeo" component={VideoTeo} durationInFrames={DURACAO_TEO} fps={FPS} width={W} height={H} />
    <Composition id="TeoEsboco" component={TeoEsboco} durationInFrames={DURACAO_TEO_ESBOCO} fps={FPS} width={W} height={H} />
    <Composition id="RigTest" component={RigTest} durationInFrames={12 * FPS} fps={FPS} width={W} height={H} />
    <Still id="PuppetTeste" component={PuppetTeste} width={W} height={H} />
    <Still id="TesteDada" component={TesteDada} width={W} height={H} />
  </>
);
