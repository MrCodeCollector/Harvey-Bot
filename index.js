var token = 'harvey-development';
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var request = require('request');

//API End Points
var weatherEndpoint = 'https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20weather.forecast%20where%20woeid%20in%20(select%20woeid%20from%20geo.places(1)%20where%20text%3D%22nome%2C%20ak%22)&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys';

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

app.get('/', function (req, res) {
    res.send('Hello world');
});

app.listen(5000, function () {
    console.log('Listening on port 5000');
});

// respond to facebook's verification
app.get('/webhook/', function (req, res) {
    if (req.query['hub.verify_token'] === token) {
        res.send(req.query['hub.challenge']);
    } else {
        res.send('Error, wrong validation token');
    }
});

// respond to post calls from facebook
app.post('/webhook/', function (req, res) {
    var messaging_events = req.body.entry[0].messaging;

    for (i = 0; i < messaging_events.length; i++) {
        var event = req.body.entry[0].messaging[i];
        var sender = event.sender.id;

        if (event.message && event.message.text) {
            var incomingText = event.message.text;
            console.log('You sent the message', incomingText);
            sendTextMessage(sender, "Text received, echo: "+ incomingText.substring(0, 200));
        }
    }
    res.sendStatus(200);
});

function sendTextMessage(sender, text) {
    var access_token ='EAAQtPmyLcRwBAFEfYjJNeTVPdY3sMsWm5dbSBFLMYsTwpAdMHRbefaI46qGPmU8D4TuwChI29BmYhX2wWqSI3EBdDIhZAXhhuZCWzBot0nD15S7KRZAHIjYrZCGuM31C7CQ3lzhcIF4ye1JmhEVZB6KzZA9QZBYAiZAxXFgnbGMWTAZDZD';
    var messageData = {
        text:text
    }
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token:access_token},
        method: 'POST',
        json: {
            recipient: {id:sender},
            message: messageData,
        }
    }, function(error, response, body) {
        if (error) {
            console.log('Error sending message: ', error);
        } else if (response.body.error) {
            console.log('Error: ', response.body.error);
        }
    });
}
