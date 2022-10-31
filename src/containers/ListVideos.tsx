import Video from "../components/Video";
import "./ListVideos.css";
import type { IClip } from "../App.d.js";

export default function ListVideos({ clips }: { clips: IClip[] }): JSX.Element {
  return (
    <div className="list-videos">
      {clips.map((clip: IClip) => (
        <Video key={clip.video} source={clip.video} title={clip.data.title} />
      ))}
    </div>
  );
}
