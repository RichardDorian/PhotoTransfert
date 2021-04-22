const fetch = require('node-fetch');

const config = require('./../config.json');

const oneDriveAuth = config.oneDriveAuth;

console.info(`Please open this link to continue : \nhttps://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=${oneDriveAuth.clientId}&scope=files.readwrite.all&response_type=code&redirect_uri=${oneDriveAuth.redirectUri}`);
if(config.application.enableListener) {
    let listener = require('./listener.js');
    listener.app.get('/oneDriveAuthCode', function (request, response) {
        response.sendStatus(200);
        getAccessToken(request.query.code);
    });
} else {
    const readline = require("readline");
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question("After accepting come back here and paste the value of 'code' : ", function(authCode) {
        getAccessToken(authCode);
    });
}

function getAccessToken(authCode) {
    console.log("\nTrying to get an access token with " + authCode + " authentication code");
    let accessToken;
    fetch(`https://login.microsoftonline.com/common/oauth2/v2.0/token`, {
        
        method: 'post',
        body: `client_id=${oneDriveAuth.clientId}&redirect_uri=${oneDriveAuth.redirectUri}&client_secret=${oneDriveAuth.clientSecret}&code=${authCode}&grant_type=authorization_code`,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    }).then(res => res.json()).then(json => {
        accessToken = json.access_token;
        if(config.oneDriveAuth.autoWriteConfig) {
            const fs = require('fs');
            console.info("Writing access_token to the config file...");
            config.oneDrive.accessToken = accessToken;
            fs.writeFile(__dirname + "/../config.json", JSON.stringify(config, null, 4), (err) => {
                if (err) throw err;
                console.log("access_token written !");
                process.exit(0);
            })
        } else {
            console.info("\nThis is your access_token, write this in the config.json file : \n\n" + accessToken);
            process.exit(0);
        }
        
    });
}