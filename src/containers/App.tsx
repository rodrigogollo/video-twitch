import "./App.css";
import Filters from "../components/Filters";
import ListVideos from "../components/ListVideos";
import { useState, useEffect } from "react";

import type { IClip } from "./AppTypes.js";

function App() {
  const [clipList, setClipList] = useState<IClip[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSearchFilter(e: React.SyntheticEvent) {
    setIsLoading(true);
    e.preventDefault();
    const target = e.target as typeof e.target & {
      name: { value: string };
      type: { value: string };
      qty: { value: string };
    };
    const name = target.name.value;
    const type = target.type.value;
    const qty = target.qty.value;

    await fetch(`http://localhost:5000/api/${name}/${type}/${qty}`)
      .then((res) => res.json())
      .then((clipsJSON) => {
        setClipList(clipsJSON.clips);
      });
    setIsLoading(false);
  }

  useEffect(() => {
    async function getClips() {
      await fetch(`http://localhost:5000/api/`)
        .then((res) => res.json())
        .then((clipsJSON) => setClipList(clipsJSON.clips));
    }
    getClips();
  }, []);

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

  return (
    <div className="App">
      <Filters handleSubmit={handleSearchFilter} />
      {isLoading ? (
        <p>LOADING CLIPS...</p>
      ) : clipList.length === 0 ? (
        <p>NO CLIPS FOUND</p>
      ) : (
        <ListVideos
          clips={clipList}
          handleDelete={handleDelete}
          handleMove={handleMove}
        />
      )}
    </div>
  );
}

export default App;
