import "./App.css";
import clipsJSON from "./downloads/clips.json";
import Filters from "./containers/Filters";
import ListVideos from "./containers/ListVideos";
import { useState } from "react";

import type { IClip } from "./App.d.js";

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

  return (
    <div className="App">
      {/* <Filters onHandleFilter={handleSearchFilter} /> */}
      <ListVideos clips={clipList} />
    </div>
  );
}

export default App;
