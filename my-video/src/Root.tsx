import "./index.css";
import { Composition } from "remotion";
import { RunningVideo } from "./RunningVideo";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="RunningVideo"
        component={RunningVideo}
        durationInFrames={900}
        fps={30}
        width={1080}
        height={1920}
      />
    </>
  );
};
