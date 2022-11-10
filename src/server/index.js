const https = require("https"); // or 'https' for https:// URLs
const fs = require("fs");
const path = require("path");
var ffmpeg = require("fluent-ffmpeg");
const twitchGets = require("./twitchGets");
const { asyncWrapper, time_convert } = require("../utils");
const { readFileSync } = require("fs");
var cp = require("child_process");
const { resolve } = require("path");

async function generateClips(name, type, size, date) {
  try {
    console.log(
      `Getting the top ${size} clips of the ${type} '${name}' from ${date}.`
    );

    asyncWrapper(clearFolder(__dirname + `/../downloads/`));
    asyncWrapper(clearFolder(__dirname + `/../scripts/clips`));
    let today = new Date();
    let dateValue = setOptionDate(date);

    console.log(
      "Initial Date: ",
      dateValue.toLocaleString("en-US"),
      "\nFinal Date: ",
      today.toLocaleString("en-US")
    );
    let clipsArray = await getClipsData(type, name, dateValue, today);

    // console.log("dados:", clipsArray.data);

    let topClips = await filterClips(clipsArray, size);

    let clipList = await downloadClips(topClips);

    clipList.sort(
      (a, b) =>
        a.video.split(".mp4")[0].replace("clip", "") -
        b.video.split(".mp4")[0].replace("clip", "")
    );
    await writeClipListToJSON(clipList);

    const clipsJSON = readFileSync(__dirname + `/../downloads/clips.json`);
    return clipsJSON;
  } catch (e) {
    console.log(e);
    return JSON.stringify({ clips: [] });
  }
}

function setOptionDate(opt) {
  let optionDate = new Date();
  let today = new Date();
  optionDate.setHours(0, 0, 0, 0);
  switch (opt) {
    case "yesterday":
      optionDate.setDate(today.getDate() - 1);
      break;
    case "three":
      optionDate.setDate(today.getDate() - 3);
      break;
    case "week":
      optionDate.setDate(today.getDate() - 7);
      break;
    case "month":
      optionDate.setMonth(today.getMonth() - 1);
      break;
    default:
      optionDate.setDate(today.getDate() - 1);
  }
  return optionDate;
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

async function makeFullVideo() {
  await createListTxtFile();
  await createScriptFile();

  return new Promise((resolve, reject) => {
    cp.exec(__dirname + "/../scripts/script.sh", (err, stdout, stdeer) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(stdout);
    });
  });
}

async function createListTxtFile() {
  const clipsJSON = readFileSync(__dirname + `/../downloads/clips.json`);
  const clips = JSON.parse(clipsJSON).clips;

  let text = `file './clips/fullintro.ts'`;
  clips.map((clip) => {
    text += `\nfile './clips/${clip.video.replace(".mp4", ".ts")}'`;
  });
  text += `\nfile './clips/outro.ts'`;
  fs.writeFileSync(__dirname + "/../scripts/mylist.txt", text, (err) => {
    if (err) console.log(err);
  });
}

async function createScriptFile() {
  const clipsJSON = readFileSync(__dirname + `/../downloads/clips.json`);
  const clips = JSON.parse(clipsJSON).clips;

  let script = `ffmpeg -y -i ../scripts/fullintro.mp4 -c:v copy -c:a copy ../scripts/clips/fullintro.ts\n\n`;
  script += `cd ../downloads\n\n`;
  clips.map((clip) => {
    script += `ffmpeg -y -i ${
      clip.video
    } -c:v copy -c:a copy ../scripts/clips/${clip.video.replace(
      ".mp4",
      ".ts"
    )}\n`;
  });

  script += `\ncd ../scripts`;
  script += `\n\nffmpeg -y -i ./outro.mp4 -c:v copy -c:a copy ./clips/outro.ts\n\nwait`;
  script += `\n\nffmpeg -y -f concat -safe 0 -i mylist.txt -c:a copy -c:v copy ./clips/all.ts\n\nwait`;
  script += `\n\nffmpeg -y -i ./clips/all.ts -c:a aac -ar 48000 -c:v copy ./clips/output.mp4`;

  fs.writeFileSync(__dirname + "/../scripts/script.sh", script, (err) => {
    if (err) console.log(err);
  });
}

module.exports = {
  generateClips,
  writeClipListToJSON,
  makeFullVideo,
};
