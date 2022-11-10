const express = require("express");
const cors = require("cors");
const app = express();
const { generateClips, writeClipListToJSON, makeFullVideo } = require(".");
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
  newArrayOrder = await swapItems(
    originClips.clips,
    index,
    way === "right" ? parseInt(index) + 1 : parseInt(index) - 1
  );

  await writeClipListToJSON(newArrayOrder);
  const arrayUpdated = readFileSync(__dirname + "/../downloads/clips.json");
  res.send(arrayUpdated);
});

app.get("/api/:name/:type/:qty/:date", async (req, res) => {
  const { name, type, qty, date } = req.params;
  const newClips = await generateClips(name, type, qty, date);
  setTimeout(() => {
    res.send(newClips);
  }, 2000);
});

app.get("/api/generate", async (req, res) => {
  try {
    await makeFullVideo();
  } catch (e) {
    console.log(e);
    res.send("error");
  }
  setTimeout(() => {
    res.send("done");
  }, 5000);
});

app.listen(5000, () => {
  console.log("listening to port 5000");
});
