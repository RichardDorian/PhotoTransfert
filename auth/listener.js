const config = require('./../config.json');

if(!config.application.enableListener) {
    process.exit(0);
}

const fs = require('fs');
var express = require('express');
var https = require('https');
var app = express();

app.get('/', function(request, response) {
    response.send("Listener online");
});

https.createServer({
    key: fs.readFileSync(__dirname + './../sslcert/server.key'),
    cert: fs.readFileSync(__dirname + '/../sslcert/server.cert')
}, app).listen(config.application.listenerPort, function () {});

module.exports = {
    app: app
}