var express = require('express')
var bodyParser = require('body-parser')
var request = require('request')
var app = express()

var Wit = require('node-wit').Wit;

var actions = {
  say(sessionId, context, message, cb) {
    console.log(message);
    cb();
  },
  merge(sessionId, context, entities, message, cb) {
    cb(context);
  },
  error(sessionId, context, error) {
    console.log(error.message);
  },
};

var client = new Wit('P4OHFVSITFMWAVO5VIPLFMC77DDTKEPI', actions);
var context = {};

app.set('port', (process.env.PORT || 5000))

// Process application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}))

// Process application/json
app.use(bodyParser.json())

// Index route
app.get('/', function (req, res) {
    res.send('Hello world, I am a chat bot')
})

// for Facebook verification
app.get('/webhook/', function (req, res) {
    if (req.query['hub.verify_token'] === 'harvey-development') {
        res.send(req.query['hub.challenge'])
    }
    res.send('Error, wrong token')
})

// Spin up the server
app.listen(app.get('port'), function() {
    console.log('running on port', app.get('port'))
})

app.post('/webhook/', function (req, res) {

    console.log('working!')
    messaging_events = req.body.entry[0].messaging

    for (i = 0; i < messaging_events.length; i++) {
        event = req.body.entry[0].messaging[i]
        sender = event.sender.id

        if (event.message && event.message.text) {

            text = event.message.text


            client.message(text, context, function (error, data) {
              if (error) {
                console.log('Oops! Got an error: ' + error);
              } else {
                witContacted(sender)
              }
            })


            if(text === 'What\'s the weather like?') {
              sendWeatherMessage(sender)
              continue
            }

            if(text === 'Show me current news') {
              sendNewsMessage(sender)
              continue
            }
            sendTextMessage(sender, "Text received, echo: " + text.substring(0, 200))
        }
    }
    res.sendStatus(200)
})

var token = "EAAQtPmyLcRwBAFEfYjJNeTVPdY3sMsWm5dbSBFLMYsTwpAdMHRbefaI46qGPmU8D4TuwChI29BmYhX2wWqSI3EBdDIhZAXhhuZCWzBot0nD15S7KRZAHIjYrZCGuM31C7CQ3lzhcIF4ye1JmhEVZB6KzZA9QZBYAiZAxXFgnbGMWTAZDZD"

function witContacted(sender, text) {
    messageData = {
        text:'It\'s working!'
    }
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token:token},
        method: 'POST',
        json: {
            recipient: {id:sender},
            message: messageData,
        }
    }, function(error, response, body) {
        if (error) {
            console.log('Error sending messages: ', error)
        } else if (response.body.error) {
            console.log('Error: ', response.body.error)
        }
    })
}

function sendTextMessage(sender, text) {
    messageData = {
        text:text
    }
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token:token},
        method: 'POST',
        json: {
            recipient: {id:sender},
            message: messageData,
        }
    }, function(error, response, body) {
        if (error) {
            console.log('Error sending messages: ', error)
        } else if (response.body.error) {
            console.log('Error: ', response.body.error)
        }
    })
}

function sendWeatherMessage(sender) {
  messageData = {
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "generic",
                "elements": [{
                    "title": "Current forecast",
                    "subtitle": "The weather in San Jose, CA is mostly cloudy and 57°F.",
                    "image_url": "http://www.sanfrancisco.travel/sites/sftraveldev.prod.acquia-sites.com/files/field/image/site-photo.jpg",
                    "buttons": [{
                        "type": "web_url",
                        "url": "https://weather.com",
                        "title": "Today's Forecast"
                    }, {
                        "type": "postback",
                        "title": "Hourly Forecast",
                        "payload": "Payload for first element in a generic bubble",
                    }],
                }
                , {
                    "title": "Other weather stuff",
                    "subtitle": "possible other stuff",
                    "image_url": "http://www.sanfrancisco.travel/sites/sftraveldev.prod.acquia-sites.com/files/SanFrancisco_0.jpg",
                    "buttons": [{
                        "type": "postback",
                        "title": "Click me!",
                        "payload": "Payload for second element in a generic bubble",
                    }
                  ],
                }]
            }
        }
    }
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token:token},
        method: 'POST',
        json: {
            recipient: {id:sender},
            message: messageData,
        }
    }, function(error, response, body) {
        if (error) {
            console.log('Error sending messages: ', error)
        } else if (response.body.error) {
            console.log('Error: ', response.body.error)
        }
    })
}

function sendNewsMessage(sender) {
  messageData = {
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "generic",
                "elements": [{
                    "title": "BBC News",
                    "subtitle": "Some news here just 4 u ;D",
                    "image_url": "https://upload.wikimedia.org/wikipedia/commons/c/cd/SanFrancisco_from_TwinPeaks_dusk_MC.jpg",
                    "buttons": [{
                        "type": "web_url",
                        "url": "http://www.bbc.com/",
                        "title": "See current news now"
                    }, {
                        "type": "postback",
                        "title": "Click me!",
                        "payload": "Payload for first element in a generic bubble",
                    }],
                }
                , {
                    "title": "Other weather stuff",
                    "subtitle": "possible other stuff",
                    "image_url": "http://mcmanuslab.ucsf.edu/sites/mcmanuslab.ucsf.edu/files/imagepicker/m/mmcmanus/san-francisco.jpg",
                    "buttons": [{
                        "type": "postback",
                        "title": "Click me!",
                        "payload": "Payload for second element in a generic bubble",
                    }
                  ],
                }]
            }
        }
    }
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token:token},
        method: 'POST',
        json: {
            recipient: {id:sender},
            message: messageData,
        }
    }, function(error, response, body) {
        if (error) {
            console.log('Error sending messages: ', error)
        } else if (response.body.error) {
            console.log('Error: ', response.body.error)
        }
    })
}
