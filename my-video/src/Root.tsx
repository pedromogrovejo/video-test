import "./index.css";
import { Composition } from "remotion";
import { RunningVideo } from "./RunningVideo";
import { WorldTrip } from "./WorldTrip";
import { SriLankaVideo, totalDuration } from "./compositions/SriLankaVideo";
import { ZegamaVideo, TOTAL_FRAMES } from "./compositions/ZegamaVideo";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="Zegama"
        component={ZegamaVideo}
        durationInFrames={TOTAL_FRAMES}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="SriLanka"
        component={SriLankaVideo}
        durationInFrames={totalDuration}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="RunningVideo"
        component={RunningVideo}
        durationInFrames={900}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="WorldTrip"
        component={WorldTrip}
        durationInFrames={990}
        fps={30}
        width={1080}
        height={1920}
      />
    </>
  );
};
