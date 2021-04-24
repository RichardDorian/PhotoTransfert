const { google } = require('googleapis');
const Photos = require('googlephotos');
const config = require('./../config.json');
const fs = require('fs');
const fetch = require('node-fetch');

const oauth2Client = new google.auth.OAuth2(config.googleApi.clientId, config.googleApi.clientSecret, config.googleApi.redirectUri);

if(config.googleApi.refreshToken == "" || config.googleApi.refreshToken == null) {
    const scopes = [Photos.Scopes.READ_AND_APPEND, Photos.Scopes.SHARING]
    const url = oauth2Client.generateAuthUrl({access_type: 'offline', scope: scopes});
    console.info(`Please open this link to continue : \n${url}`);

    const listener = require('./listener.js');
        listener.app.get('/googleAuthCode', function (request, response) {
            response.sendStatus(200);
            getAccessToken(request.query.code);
        });
} else {
    refreshToken(config.googleApi.refreshToken);
}

function writeRefreshToken(refreshToken) {
    const newConfig = require('./../config.json');
    newConfig.googleApi.refreshToken = refreshToken;
    fs.writeFile(__dirname + "/../config.json", JSON.stringify(newConfig, null, 4), (err) => {
        if (err) throw err;
        console.info("Refresh token updated");
    });
}

function writeAccessToken(accessToken) {
    const newConfig = require('./../config.json');
    newConfig.googlePhotos.authToken = accessToken;
    fs.writeFile(__dirname + "/../config.json", JSON.stringify(newConfig, null, 4), (err) => {
        if (err) throw err;
        console.info("Access token updated");
        if(!config.advanced['googleDriveFolderCreated?']) createFolder(); else process.exit(0);
    });
}

async function getAccessToken(authCode) {
    const {tokens} = await oauth2Client.getToken(authCode);
    writeRefreshToken(tokens.refresh_token);
    setTimeout(() => {
        writeAccessToken(tokens.access_token)
    }, 1000);
}

function refreshToken(refreshToken) {
    let response;
    fetch('https://oauth2.googleapis.com/token', {
        method: 'post',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: `client_id=${config.googleApi.clientId}&client_secret=${config.googleApi.clientSecret}&refresh_token=${refreshToken}&grant_type=refresh_token`     
    })
    .then(res => res.json())
    .then(json => {
        response = json;
        setTimeout(() => {
            
        }, 1000);
    });
}

async function createFolder() {
    const newConfig = require('../config.json');
    const fs = require('fs');
    const photos = new Photos(newConfig.googlePhotos.authToken);
    let response = await photos.albums.create(newConfig.googlePhotos.albumName);
    newConfig.advanced['googleDriveFolderCreated?'] = true;
    newConfig.googlePhotos.albumId = response.id;
    fs.writeFile(__dirname + "/../config.json", JSON.stringify(newConfig, null, 4), (err) => {
        if (err) throw err;
        console.info("Album created");
        process.exit(0);
    });
}