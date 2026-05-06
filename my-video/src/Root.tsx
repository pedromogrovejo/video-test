import "./index.css";
import { Composition } from "remotion";
import { RunningVideo } from "./RunningVideo";
import { WorldTrip } from "./WorldTrip";

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
