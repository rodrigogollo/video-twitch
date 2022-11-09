const https = require("https"); // or 'https' for https:// URLs
const fs = require("fs");
const path = require("path");
var ffmpeg = require("fluent-ffmpeg");
const twitchGets = require("./twitchGets");
const { asyncWrapper, time_convert } = require("../utils");
const { readFileSync } = require("fs");

async function makeVideo(name, type, size) {
  try {
    console.log(
      `Getting the top ${size} clips of the ${type} '${name}' from yesterday.`
    );

    asyncWrapper(clearFolder(__dirname + `/../downloads/`));

    let today = new Date();
    let yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    let date = yesterday;

    console.log(
      "Initial Date: ",
      date.toLocaleString("en-US"),
      "\nFinal Date: ",
      today.toLocaleString("en-US")
    );
    let clipsArray = await getClipsData(type, name, date, today);

    // console.log("dados:", clipsArray.data);

    let topClips = await filterClips(clipsArray, size);

    let clipList = await downloadClips(topClips);

    clipList.sort(
      (a, b) =>
        a.video.split(".mp4")[0].replace("clip", "") -
        b.video.split(".mp4")[0].replace("clip", "")
    );
    await writeClipListToJSON(clipList);

    console.log("retornando");
    const clipsJSON = readFileSync(__dirname + `/../downloads/clips.json`);
    return clipsJSON;
  } catch (e) {
    console.log(e);
    return JSON.stringify({ clips: [] });
  }
}

async function downloadClips(topClips) {
  let clipList = [];
  let durationAllVideos = 0;

  await Promise.all(
    topClips.map(async (item, i) => {
      durationAllVideos += item.duration;
      let filename = `clip${i + 1}`;
      let URL_CLIP = item.thumbnail_url.replace("-preview-480x272.jpg", ".mp4");

      await downloadClipLocal(URL_CLIP, filename);
      clipList.push({
        video: `${filename}.mp4`,
        data: item,
      });
    })
  );
  console.log("Total Duration: ", time_convert(durationAllVideos));

  return clipList;
}

async function downloadClipLocal(url, filename) {
  fs.mkdir(__dirname + `/../downloads/`, { recursive: true }, (err) => {
    if (err) throw err;
  });

  await saveFile(filename, url);
}

async function getFile(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      const { statusCode } = response;
      if (statusCode === 200) {
        resolve(response);
      }
      reject(null);
    });
  });
}

async function saveFile(filename, url) {
  return new Promise(async (resolve, reject) => {
    try {
      const result = await getFile(url);
      if (result) {
        const file = fs.createWriteStream(
          __dirname + `/../downloads/${filename}.mp4`
        );
        result.pipe(file);
        file.on("finish", () => {
          console.log(`Video '${filename}' salvo com sucesso!`);
          resolve();
        });
      }
    } catch (e) {
      reject(e);
    }
  });
}

async function getClipsData(type, name, date, today) {
  let clipData;
  if (type == "game") {
    let gameData = await twitchGets.getGameByName(name);
    //gameData = await twitchGets.getGameById('582372781');
    clipData = await twitchGets.getClipsByGame(
      gameData.data[0].id,
      100,
      date,
      today
    );
  } else {
    let streamerData = await twitchGets.getUserByLogin(name);
    clipData = await twitchGets.getClipsByBroadcaster(
      streamerData.data[0].id,
      100,
      date,
      today
    );
  }
  return clipData;
}

async function filterClips(clipsArray, size) {
  let clipsFiltered = clipsArray.data.filter(
    (item) => item.duration >= 20
    //&& item.language == 'en'
  );

  let uniqueStreamerClips;
  uniqueStreamerClips = clipsFiltered;
  // uniqueStreamerClips = clipsFiltered.filter((value, index, self) => index === self.findIndex((t) => (
  //   t.broadcaster_name ===value.broadcaster_name
  // )))

  let topClips = uniqueStreamerClips.slice(0, size);

  return topClips;
}

async function writeClipListToJSON(clipList) {
  const clipListJSON = JSON.stringify({ clips: clipList });
  const file = fs.writeFileSync(
    __dirname + `/../downloads/clips.json`,
    clipListJSON
  );
}

function clearFolder(directory) {
  fs.readdir(directory, (err, files) => {
    if (err) throw err;

    for (const file of files) {
      fs.unlink(path.join(directory, file), (err) => {
        if (err) throw err;
      });
    }
  });
}

module.exports = {
  makeVideo,
  writeClipListToJSON,
};
