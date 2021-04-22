const { google } = require('googleapis');
const Photos = require('googlephotos');
const config = require('./../config.json');

const googleApi = config.googleApi;

const oauth2Client = new google.auth.OAuth2(googleApi.clientId, googleApi.clientSecret, googleApi.redirectUri);
const scopes = [Photos.Scopes.READ_AND_APPEND, Photos.Scopes.SHARING]
const url = oauth2Client.generateAuthUrl({access_type: 'offline', scope: scopes});

console.info(`Please open this link to continue : \n${url}`);

if(config.application.enableListener) {
    let listener = require('./listener.js');
    listener.app.get('/googleAuthCode', function (request, response) {
        response.sendStatus(200);
        getAccessToken(request.query.code);
    });
} else {
    const readline = require('readline');
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question("After accepting come back here and paste the value of 'code' : ", function(authCode) {
        getAccessToken(authCode);
    });
}

async function getAccessToken(authCode) {
    const {tokens} = await oauth2Client.getToken(authCode);
    let accessToken = tokens.access_token;
    if(googleApi.autoWriteConfig) {
        const fs = require('fs');
        console.info("\nWriting access_token to the config file...");
        config.googlePhotos.authToken = accessToken;
        fs.writeFile(__dirname + "/../config.json", JSON.stringify(config, null, 4), (err) => {
            if (err) throw err;
            console.info("access_token written !");
            if(!config.advanced['googleDriveFolderCreated?']) createFolder(); else process.exit(0);
        })
    } else {
        console.info("\nThis is your access_token, write this in the config.json file : \n\n" + accessToken);
        if(!config.advanced['googleDriveFolderCreated?']) createFolder(); else process.exit(0);
    }
}

async function createFolder() {
    const newConfig = require('../config.json');
    const fs = require('fs');
    const photos = new Photos(newConfig.googlePhotos.authToken);
    let response = await photos.albums.create(newConfig.googlePhotos.albumName);
    newConfig.advanced['googleDriveFolderCreated?'] = true
    newConfig.googlePhotos.albumId = response.id;
    fs.writeFile(__dirname + "/../config.json", JSON.stringify(newConfig, null, 4), (err) => {
        if (err) throw err;
        console.info("Album created");
        process.exit(0);
    });
}