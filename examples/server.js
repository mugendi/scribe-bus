var express = require('express');
var app = express();

//redis options
var options = {
    redis: {
        port: 6379,
        host: '127.0.0.1'
    }
}

//get scribe & logger instances
var {scribe, logger} = require('..')(options);

//listen for subscribed events
logger.listen()

//use the scribe WebPanel
app.use('/logs', scribe.webPanel());


//... the rest on the app

var port = 3000;

app.listen(port, function () {
    console.log(`Started server at port ${port}`);
});