import { Composition, Folder } from "remotion";
import "./lib/fontes";
import { FPS, H, W } from "./theme";
import {
  DURACAO_TOTAL,
  OnzeDeSetembro,
} from "./videos/onze-setembro/OnzeDeSetembro";

export const RemotionRoot: React.FC = () => {
  return (
    <Folder name="TikTok">
      {/* duração vem de public/timestamps.json (áudio dos blocos) */}
      <Composition
        id="OnzeDeSetembro"
        component={OnzeDeSetembro}
        durationInFrames={DURACAO_TOTAL}
        fps={FPS}
        width={W}
        height={H}
      />
    </Folder>
  );
};
