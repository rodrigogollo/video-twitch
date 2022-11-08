import Video from "../components/Video";
import "./ListVideos.css";
import { useEffect, useState } from "react";
import { IClip } from "../AppTypes";

interface Props {
  clips: IClip[];
  handleDelete: (video: string) => {};
}

function ListVideos({ clips, handleDelete }: Props): JSX.Element {
  const [clipsList, setClipsList] = useState<IClip[]>([]);

  useEffect(() => {
    if (clipsList.length === 0) {
      setClipsList(clips);
    }
  }, [clips]);

  async function handleDeleteClick(video: string) {
    const newClips = clipsList.filter((clip) => clip.video !== video);
    setClipsList(newClips);
    handleDelete(video);
  }

  return (
    <div className="list-videos">
      {clipsList &&
        clipsList.map((clip: IClip) => (
          <div className="container" key={"div_" + clip.video}>
            <Video
              key={clip.video}
              source={clip.video}
              title={clip.data.title}
            />
            <button
              key={"button_" + clip.video}
              onClick={() => {
                handleDeleteClick(clip.video);
              }}
            >
              Delete
            </button>
          </div>
        ))}
    </div>
  );
}

export default ListVideos;
