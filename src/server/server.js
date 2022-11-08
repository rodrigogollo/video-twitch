const express = require("express");
const cors = require("cors");
const app = express();
const { makeVideo, writeClipListToJSON } = require("./index2");
const { readFileSync } = require("fs");

app.use(cors());

app.get("/", (req, res) => {
  res.send("entrou");
});

app.get("/api", (req, res) => {
  const newClips = readFileSync(__dirname + "/../downloads/clips.json");
  res.send(newClips);
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

app.get("/api/:name/:type/:qty", async (req, res) => {
  const { name, type, qty } = req.params;
  const newClips = await makeVideo(name, type, qty);
  setTimeout(() => {
    res.send(newClips);
  }, 5000);
});

app.listen(5000, () => {
  console.log("listening to port 5000");
});
