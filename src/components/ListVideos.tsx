import Video from "../components/Video";
import "./ListVideos.css";
import { useEffect, useState } from "react";
import { IClip } from "../containers/AppTypes";
import { swapItems } from "../utils/index";

interface Props {
  clips: IClip[];
  handleDelete: (video: string) => {};
  handleMove: (way: string, index: number) => {};
}

function ListVideos({ clips, handleDelete, handleMove }: Props): JSX.Element {
  const [clipsList, setClipsList] = useState<IClip[]>([]);

  useEffect(() => {
    setClipsList(clips);
  }, []);

  async function handleDeleteClick(video: string) {
    const newClips = clipsList.filter((clip) => clip.video !== video);
    setClipsList(newClips);
    handleDelete(video);
  }

  async function handleMoveLeft(index: number) {
    const newClips = swapItems(clipsList, index, index - 1);
    setClipsList(newClips);
    handleMove("left", index);
  }

  async function handleMoveRight(index: number) {
    const newClips = swapItems(clipsList, index, index + 1);
    setClipsList(newClips);
    handleMove("right", index);
  }

  return (
    <div className="list-videos">
      {clipsList &&
        clipsList.map((clip: IClip, index: number) => (
          <div className="container" key={"div_" + clip.video}>
            <Video
              key={clip.video}
              source={clip.video}
              title={clip.data.title}
            />
            <div className="buttons-container">
              <button
                key={"button_left_" + clip.video}
                onClick={() => {
                  handleMoveLeft(index);
                }}
              >
                Left
              </button>
              <button
                key={"button_" + clip.video}
                onClick={() => {
                  handleDeleteClick(clip.video);
                }}
              >
                Delete
              </button>
              <button
                key={"button_right_" + clip.video}
                onClick={() => {
                  handleMoveRight(index);
                }}
              >
                Right
              </button>
            </div>
          </div>
        ))}
    </div>
  );
}

export default ListVideos;
