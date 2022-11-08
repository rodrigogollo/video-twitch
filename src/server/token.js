const axios = require("axios");
require("dotenv").config({ path: __dirname + "/../.env" });

const { CLIENT_ID, CLIENT_SECRET } = process.env;

async function getToken() {
  try {
    let res = await axios({
      method: "POST",
      url: "https://id.twitch.tv/oauth2/token",
      header: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      data: {
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        grant_type: "client_credentials",
      },
    });

    if (res.status == 200) {
      console.log("Token adquirido: ", res.data.access_token);
      return res.data.access_token;
    }
  } catch (error) {
    console.log(error);
  }
}

module.exports = {
  getToken,
};
