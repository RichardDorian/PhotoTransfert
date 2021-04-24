const fetch = require('node-fetch');
const fs = require('fs');

const config = require('./../config.json');

const oneDriveAuth = config.oneDriveAuth;

if(oneDriveAuth.refreshToken == "" || oneDriveAuth.refreshToken == null) {
    let url = `https://login.live.com/oauth20_authorize.srf?client_id=${oneDriveAuth.clientId}&scope=files.readwrite.all offline_access&response_type=code&redirect_uri=${oneDriveAuth.redirectUri}`;
    console.info("Please open this link to continue : \n" + url);
    const listener = require('./listener.js');
    listener.app.get('/oneDriveAuthCode', function (request, response) {
        getAccessToken(request.query.code);
        response.sendStatus(200);
    });
} else {
    refreshToken(oneDriveAuth.refreshToken);
}

function writeRefreshToken(refreshToken) {
    const newConfig = require('./../config.json');
    newConfig.oneDriveAuth.refreshToken = refreshToken;
    fs.writeFile(__dirname + "/../config.json", JSON.stringify(newConfig, null, 4), (err) => {
        if (err) throw err;
        console.info("Refresh token updated");
    });
}

function writeAccessToken(accessToken) {
    const newConfig = require('./../config.json');
    newConfig.oneDrive.accessToken = accessToken;
    fs.writeFile(__dirname + "/../config.json", JSON.stringify(newConfig, null, 4), (err) => {
        if (err) throw err;
        console.info("Access token updated");
        process.exit(0);
    });
}

function getAccessToken(authCode) {
    let response;
    fetch('https://login.live.com/oauth20_token.srf', {
        method: 'post',
        body: `client_id=${oneDriveAuth.clientId}&redirect_uri=${oneDriveAuth.redirectUri}&client_secret=${oneDriveAuth.clientSecret}&code=${authCode}&grant_type=authorization_code`,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    })
    .then(res => res.json())
    .then(json => {
        response = json;
        writeRefreshToken(response.refresh_token);
        setTimeout(() => {
            writeAccessToken(response.access_token);
        }, 1000);
    });
}

function refreshToken(refreshToken) {
    let response;
    fetch('https://login.live.com/oauth20_token.srf', {
        method: 'post',
        body : `client_id=${oneDriveAuth.clientId}&redirect_uri=${oneDriveAuth.redirectUri}&client_secret=${oneDriveAuth.clientSecret}&refresh_token=${refreshToken}&grant_type=refresh_token`,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    })
    .then(res => res.json())
    .then(json => {
        response = json;
        writeRefreshToken(response.refresh_token);
        setTimeout(() => {
            writeAccessToken(response.access_token);
        }, 1000);
    });
}