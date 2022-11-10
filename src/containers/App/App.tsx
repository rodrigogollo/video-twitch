import "./App.css";
import Filter from "../../components/Filter/Filter";
import ListVideos from "../../components/ListVideos/ListVideos";
import { useState, useEffect } from "react";

import type { IClip } from "./AppTypes.js";

function App() {
  const [clipList, setClipList] = useState<IClip[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingFullVideo, setIsLoadingFullVideo] = useState(false);
  const [fullVideo, setFullVideo] = useState(undefined);

  async function handleSearchFilter(e: React.SyntheticEvent) {
    setIsLoading(true);
    e.preventDefault();
    const target = e.target as typeof e.target & {
      name: { value: string };
      type: { value: string };
      qty: { value: string };
      date: { value: string };
    };
    const name = target.name.value;
    const type = target.type.value;
    const qty = target.qty.value;
    const date = target.date.value;

    await fetch(`http://localhost:5000/api/${name}/${type}/${qty}/${date}`)
      .then((res) => res.json())
      .then((clipsJSON) => {
        setClipList(clipsJSON.clips);
      });
    setIsLoading(false);
  }

  useEffect(() => {
    setIsLoading(true);
    async function getClips() {
      await fetch(`http://localhost:5000/api/`)
        .then((res) => res.json())
        .then((clipsJSON) => {
          setClipList(clipsJSON.clips);
          setIsLoading(false);
        });
    }
    getClips();
  }, []);

  useEffect(() => {
    setIsLoadingFullVideo(true);
    getVideoData();
  }, []);

  async function getVideoData() {
    setIsLoadingFullVideo(true);
    let video;
    try {
      video = await require("../../scripts/clips/output.mp4");
      setFullVideo(video);
    } catch (e) {
      setFullVideo(undefined);
      setIsLoadingFullVideo(false);
    }
    setIsLoadingFullVideo(false);
  }

  async function handleDelete(video: string) {
    await fetch(`http://localhost:5000/api/delete/${video}`)
      .then((res) => res.json())
      .then((clipsJSON) => {
        setClipList(clipsJSON.clips);
      });
  }

  async function handleMove(way: string, index: number) {
    await fetch(`http://localhost:5000/api/move/${way}/${index}`)
      .then((res) => res.json())
      .then((clipsJSON) => {
        setClipList(clipsJSON.clips);
      });
  }

  async function handleGenerateVideo() {
    setIsLoadingFullVideo(true);
    await fetch(`http://localhost:5000/api/generate`).then((res) => {
      console.log("recebeu response");
      getVideoData();
    });
  }

  return (
    <div className="App">
      <Filter handleSubmit={handleSearchFilter} />
      {isLoading ? (
        <p>LOADING CLIPS...</p>
      ) : clipList.length === 0 ? (
        <p>NO CLIPS FOUND</p>
      ) : (
        <div className="container">
          <ListVideos
            clips={clipList}
            handleDelete={handleDelete}
            handleMove={handleMove}
          />
          <button onClick={handleGenerateVideo}>Generate Full Video</button>

          {isLoadingFullVideo ? (
            <p>Loading Full Video</p>
          ) : (
            fullVideo && (
              <video
                key={"output_video"}
                width="800px"
                controls
                onLoadStart={(videoObject) =>
                  (videoObject.currentTarget.volume = 0.3)
                }
              >
                <source src={fullVideo} type="video/mp4"></source>
              </video>
            )
          )}
        </div>
      )}
    </div>
  );
}

export default App;
