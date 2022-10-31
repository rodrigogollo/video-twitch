import "./App.css";
import clipsJSON from "./downloads/clips.json";
import Filters from "./containers/Filters";
import ListVideos from "./containers/ListVideos";
import { useState } from "react";

import type { IClip } from "./App.d.js";

function App() {
  const [clipList, setClipList] = useState<IClip[]>([]);

  async function handleSearchFilter(e: React.FormEvent<SubmitEvent>) {
    e.preventDefault();
    const clips = await fetch("/clips");
    // setClipList<IClip[]>(clips);
  }

  return (
    <div className="App">
      {/* <Filters onHandleFilter={handleSearchFilter} /> */}
      <ListVideos clips={clipList} />
    </div>
  );
}

export default App;
