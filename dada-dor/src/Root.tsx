import { Composition, Still } from "remotion";
import "./fontes";
import { DURACAO_TOTAL_S } from "./scenes";
import { TesteDada } from "./TesteDada";
import { FPS, H, W } from "./theme";
import { Video } from "./Video";

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="Video" component={Video} durationInFrames={Math.ceil(DURACAO_TOTAL_S * FPS)} fps={FPS} width={W} height={H} />
    <Still id="TesteDada" component={TesteDada} width={W} height={H} />
  </>
);
