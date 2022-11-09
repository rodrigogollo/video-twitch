const express = require("express");
const cors = require("cors");
const app = express();
const { makeVideo, writeClipListToJSON } = require("./index2");
const { readFileSync } = require("fs");
const { swapItems } = require("../utils/index");

app.use(cors());

app.get("/", (req, res) => {
  res.send("entrou");
});

app.get("/api", (req, res) => {
  try {
    const newClips = readFileSync(__dirname + "/../downloads/clips.json");
    res.send(newClips);
  } catch (e) {
    res.send(JSON.stringify({ clips: [] }));
  }
});

app.get("/api/delete/:video", async (req, res) => {
  const originClipsJSON = readFileSync(__dirname + "/../downloads/clips.json");
  const originClips = JSON.parse(originClipsJSON);

  const newClips = originClips.clips.filter(
    (clip) => clip.video !== req.params.video
  );
  await writeClipListToJSON(newClips);
  setTimeout(() => {
    res.send(newClips);
  }, 5000);
});

app.get("/api/move/:way/:index", async (req, res) => {
  const { way, index } = req.params;
  const originClipsJSON = readFileSync(__dirname + "/../downloads/clips.json");
  const originClips = JSON.parse(originClipsJSON);
  let newArrayOrder;
  if (way === "right") {
    newArrayOrder = await swapItems(
      originClips.clips,
      index,
      parseInt(index) + 1
    );
    await writeClipListToJSON(newArrayOrder);
  } else if (way === "left") {
    newArrayOrder = await swapItems(
      originClips.clips,
      index,
      parseInt(index) - 1
    );
    await writeClipListToJSON(newArrayOrder);
  }
  const arrayUpdated = readFileSync(__dirname + "/../downloads/clips.json");
  res.send(arrayUpdated);
});

app.get("/api/:name/:type/:qty", async (req, res) => {
  const { name, type, qty } = req.params;
  const newClips = await makeVideo(name, type, qty);
  setTimeout(() => {
    res.send(newClips);
  }, 2000);
});

app.listen(5000, () => {
  console.log("listening to port 5000");
});
