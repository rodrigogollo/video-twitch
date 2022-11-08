const fs = require('fs');
const https = require('https');
const args = require('minimist')(process.argv.slice(2));
require('dotenv').config({path: __dirname + '/../../.env'});
const {clips} = require(__dirname + '/../../downloads/clips.json');
const {google} = require('googleapis');
const {time_convert} = require(__dirname + '/../../utils/index');

const TOKEN_PATH = __dirname + '/tokens.json';
const CLIENT_SECRETS_FILE = require(__dirname + '/client_secrets.json');
const SCOPES = ['https://www.googleapis.com/auth/youtube.upload'];

const renderURL =
	args.renderURL ||
	'https://s3.us-east-1.amazonaws.com/remotionlambda-51ph4zifjl/renders/ye2hyykqbo/out.mp4';
const videoTitle =
	args.title || 'Twitch Most Viewed Clips of the Week Compilation';

const thumbFilePath = __dirname + '/../../out/thumb.png';
const videoFilePath = __dirname + '/../../out/outputAWS.mp4';

const init = (title = videoTitle) => {
	const oauth2Client = new google.auth.OAuth2(
		CLIENT_SECRETS_FILE.web.client_id,
		CLIENT_SECRETS_FILE.web.client_secret,
		CLIENT_SECRETS_FILE.web.redirect_uris
	);

	const token = require(TOKEN_PATH);
	oauth2Client.setCredentials(token);

	const youtubeService = google.youtube({version: 'v3', auth: oauth2Client});
	saveVideoFromLambdaLocally().then(() => {
		const description = createVideoDescriptionTimestamps();
		const tags = createDefaultTags();
		// uploadVideo(youtubeService, oauth2Client, title, description, tags)
	});
};

function uploadVideo(service, auth, title, description, tags) {
	const uploadDateNextHour = new Date();
	uploadDateNextHour.setHours(
		uploadDateNextHour.getHours() +
			Math.round(uploadDateNextHour.getMinutes() / 60) +
			2
	);
	uploadDateNextHour.setMinutes(0, 0, 0);

	service.videos.insert(
		{
			auth: auth,
			part: 'snippet,status',
			requestBody: {
				snippet: {
					title,
					description,
					tags,
					categoryId: '24',
					defaultLanguage: 'en',
					defaultAudioLanguage: 'en',
				},
				status: {
					privacyStatus: 'private',
					selfDeclaredMadeForKids: false,
					publishAt: uploadDateNextHour,
				},
			},
			media: {
				body: fs.createReadStream(videoFilePath),
				// body: https.get(renderURL, res => res.pipe(fs.createWriteStream('out.mp4')))
			},
		},
		function (err, response) {
			if (err) {
				console.log('The API returned an error: ', err);
				return;
			}
			console.log(response.data);

			// console.log('Video uploaded. Uploading the thumbnail now.');
			// service.thumbnails.set({
			//   auth: auth,
			//   videoId: response.data.id,
			//   media: {
			//     body: fs.createReadStream(thumbFilePath)
			//   },
			// }, function(err, response){
			//   if(err){
			//     console.log('The API returned an error: ', err);
			//     return;
			//   }
			//   console.log(response.data);
			// })
		}
	);
}

function storeToken(token) {
	fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
		if (err) throw err;
		console.log('Token stored to ' + TOKEN_PATH);
	});
}

function saveVideoFromLambdaLocally() {
	console.log('Iniciando download do video do AWS Lambda');
	return new Promise((resolve, reject) => {
		try {
			const w = fs.createWriteStream(__dirname + '/../../out/outputAWS.mp4');

			https.get(renderURL, (res) => res.pipe(w));

			w.on('finish', function () {
				console.log("Arquivo Salvo Localmente: 'outputAWS.mp4' ");
				resolve();
			});
		} catch (err) {
			reject();
		}
	});
}

function getAuthURL(oauth2Client) {
	const url = oauth2Client.generateAuthUrl({
		access_type: 'offline',
		include_granted_scopes: true,
		response_type: 'code',
		approval_promp: 'force',
		scope: SCOPES,
	});

	return url;
}

function getTokenAndStore(oauth2Client) {
	const code = process.env.GOOGLE_API_CODE;
	oauth2Client.getToken(code).then((response) => {
		// console.log(response.tokens)
		if (response.tokens.refresh_token) {
			// store the refresh_token in my database!
			storeToken(response.tokens);
			console.log('refresh_token: ', response.tokens.refresh_token);
		}
		console.log('access_token: ', response.tokens.access_token);
	});
}

function createDefaultTags() {
	const defaultTags = [
		'twitch',
		'clips',
		'daily',
		'best',
		'highlights',
		'stream',
		'streamer',
		'twitch daily',
		'twitch daily clips',
		'best twitch clips',
		'twitch highlights',
		'stream highlights',
	];
	const clipsTags = [];
	const clipsGame = [] || args.name;
	clips.map((clip) => clipsTags.push(clip.data.broadcaster_name));

	const tags = [...defaultTags, ...clipsTags, ...clipsGame];
	uniq = [...new Set(tags)];
	console.log(uniq);
	return uniq;
}

function createVideoDescriptionTimestamps(title = '') {
	let description = `${title} \n\nThanks for Watching! \nLike and Subscribe for more. \n`;
	let duration = 0;
	let arrayBroadcaster = clips.map((clip) => clip.data.broadcaster_name);
	let uniqBroadcaster = [...new Set(arrayBroadcaster)];
	let isOnlyOneBroadcaster = uniqBroadcaster.length == 1;

	clips.map((clip, i, origin) => {
		if (i == 0) {
			duration += 0;
			description += `${
				isOnlyOneBroadcaster
					? '\nhttps://twitch.tv/' + clip.data.broadcaster_name + '\n'
					: ''
			}`;
			description += '\nTimestamps: \n';
			description += `\n00:00 Intro`;
			duration += 10;
		} else if (i == 1) duration += origin[i - 1].data.duration;
		else if (i != 0) {
			duration += origin[i - 1].data.duration; // + 4;
		}
		description += `\n${time_convert(duration)} ${clip.data.title.replace(
			/(?:https?|ftp):\/\/[\n\S]+/g,
			''
		)}${
			isOnlyOneBroadcaster
				? ''
				: ' - https://twitch.tv/' + clip.data.broadcaster_name
		}`;
	});

	description +=
		'\n\nMusic: \n\nROY KNOX - Earthquake \nJim Yosef x ROY KNOX - Sun Goes Down';
	description +=
		'\n\nIf you have business inquiries, or if you own copyright material in this video and would like it removed\nplease contact twitchdailyclips000@gmail.com before taking action.';
	console.log(description);
	return description;
}

// init(`Top Twitch Clips of the Week - Forsen #1`)
createVideoDescriptionTimestamps('Top Twitch Clips of the Week - Forsen #1');
createDefaultTags();

module.exports = {};
init;
